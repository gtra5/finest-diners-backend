const Order = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (customer)
const createOrder = [
  // Validation
  body('restaurant')
    .notEmpty()
    .withMessage('Restaurant is required'),
  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.food')
    .notEmpty()
    .withMessage('Item food ID is required'),
  body('items.*.name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Item price must be a positive number'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1'),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'applepay', 'cod'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { restaurant, items, deliveryAddress, paymentMethod, notes, latitude, longitude } = req.body;

      // Load authoritative prices from the Food collection. The client sends
      // item.food (spoonacularId) but price is NEVER trusted — it's derived
      // from the database so items can't be undercharged.
      const itemIds = items.map((i) => i.food);
      const foodDocs = await Food.find({ spoonacularId: { $in: itemIds } });
      const priceByFoodId = new Map(foodDocs.map((f) => [String(f.spoonacularId), f.price]));

      // Whitelist item fields — never trust arbitrary client data
      const sanitisedItems = items.map((item) => {
        const dbPrice = priceByFoodId.get(String(item.food));
        if (dbPrice === undefined) {
          const err = new Error('One or more items are not on the menu');
          err.status = 400;
          throw err;
        }
        return {
          food:     item.food,
          name:     String(item.name || '').slice(0, 120),
          price:    dbPrice,
          quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
          imageUrl: String(item.imageUrl || '').slice(0, 500),
        };
      });

      const totalPrice = sanitisedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      );

      const orderData = {
        customer: req.user._id,
        restaurant,
        items: sanitisedItems,
        deliveryAddress: deliveryAddress.trim(),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        paymentMethod,
        notes: String(notes || '').slice(0, 500),
      };

      // Add coordinates if provided and valid
      if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          orderData.latitude = lat;
          orderData.longitude = lng;
          orderData.deliveryCoordinates = {
            latitude: lat,
            longitude: lng,
          };
        }
      }

      const order = await Order.create(orderData);

      res.status(201).json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || 'Failed to create order' });
    }
  }
];

// @desc    Get all orders for the logged-in customer
// @route   GET /api/orders/my
// @access  Private (customer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name imageUrl address')
      .populate('customer', 'name email')
      .populate('driver', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Customers can only see their own orders; drivers can only see orders
    // assigned to them; admin/manager may see all. Employees are restricted
    // to the aggregate list view (getAllOrders) to limit PII exposure.
    if (req.user.role === 'customer') {
      if (order.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'driver') {
      if (!order.driver || order.driver._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (admin, driver)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Allowed status transitions by role. Drivers may only advance their own
    // assigned order along the delivery path; never jump to 'delivered/paid'
    // from 'pending/confirmed', and never mark a non-COD order paid.
    const validTransitions = {
      pending:          ['confirmed', 'cancelled'],
      confirmed:        ['preparing', 'cancelled'],
      preparing:        ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered:        ['received'],
      received:         [],
      cancelled:        [],
    };

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Drivers may only update orders assigned to them
    if (req.user.role === 'driver' && order.driver?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Reject unknown or disallowed transitions
    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot change order from '${order.status}' to '${status}'`,
      });
    }

    order.status = status;

    // Only mark as paid for COD orders — card/applepay orders are marked paid
    // via the Paystack verification flow. Never auto-pay for unpaid card orders.
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.isPaid = true;
    }
    await order.save();

    // Live tracking only makes sense while an order is active — once it's
    // delivered or cancelled, tell anyone still in the room to stop, and
    // evict them so a stray reconnect can't rejoin.
    if (status === 'delivered' || status === 'cancelled') {
      const io = req.app.get('io');
      if (io) {
        const room = `order:${order._id}`;
        io.to(room).emit('tracking:ended', { orderId: order._id.toString(), status });
        io.in(room).socketsLeave(room);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm order receipt by customer
// @route   PUT /api/orders/:id/confirm-receipt
// @access  Private (customer)
const confirmOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the customer who owns the order can confirm receipt
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this order' });
    }

    // Only allow confirmation for delivered orders
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order must be delivered before confirming receipt' });
    }

    order.status = 'received';
    order.confirmedReceivedAt = new Date();
    await order.save();

    // Notify tracking room that order is received
    const io = req.app.get('io');
    if (io) {
      const room = `order:${order._id}`;
      io.to(room).emit('tracking:ended', { orderId: order._id.toString(), status: 'received' });
      io.in(room).socketsLeave(room);
    }

    res.json({ message: 'Order receipt confirmed', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin/manager/employee view)
// @route   GET /api/orders
// @access  Private (admin, manager, employee)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('restaurant', 'name')
      .populate('customer', 'name email')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders assigned to the logged-in driver
// @route   GET /api/orders/driver/my-orders
// @access  Private (driver)
const getDriverOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      driver: req.user._id,
      status: { $nin: ['received', 'cancelled'] },
    })
      .populate('restaurant', 'name imageUrl address')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders with no driver assigned (available for claiming)
// @route   GET /api/orders/driver/available
// @access  Private (driver)
const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      driver: null,
      status: { $in: ['confirmed', 'preparing'] },
    })
      .populate('restaurant', 'name imageUrl address')
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign a driver to an order
// @route   PUT /api/orders/:id/assign
// @access  Private (admin, manager)
const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }

    // The assigned user must actually be a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ message: 'Assigned user is not a driver' });
    }

    order.driver = driverId;
    await order.save();

    const populated = await order.populate('driver', 'name phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Driver claims an unassigned order
// @route   PUT /api/orders/:id/claim
// @access  Private (driver)
const claimOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.driver) {
      return res.status(400).json({ message: 'Order already has a driver assigned' });
    }

    order.driver = req.user._id;
    await order.save();

    const populated = await order.populate('driver', 'name phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  confirmOrderReceipt,
  getAllOrders,
  getDriverOrders,
  getAvailableOrders,
  assignDriver,
  claimOrder,
};