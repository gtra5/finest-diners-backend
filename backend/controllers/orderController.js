const Order = require('../models/Order');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (customer)
const createOrder = async (req, res) => {
  try {
    const { restaurant, items, deliveryAddress, paymentMethod, notes, latitude, longitude } = req.body;

    if (!restaurant) {
      return res.status(400).json({ message: 'Restaurant is required' });
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Whitelist item fields — never trust arbitrary client data
    const sanitisedItems = items.map((item) => ({
      food:     item.food,
      name:     String(item.name || '').slice(0, 120),
      price:    Math.abs(parseFloat(item.price) || 0),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      imageUrl: String(item.imageUrl || '').slice(0, 500),
    }));

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

    // Add coordinates if provided
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      orderData.latitude = parseFloat(latitude);
      orderData.longitude = parseFloat(longitude);
    }

    const order = await Order.create(orderData);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // Customers can only see their own orders; admins and drivers can see all
    if (
      req.user.role === 'customer' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') order.isPaid = true;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/orders
// @access  Private (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('restaurant', 'name')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders };
