const Order = require('../models/Order');
const { body, validationResult } = require('express-validator');

/**
 * @desc    Submit a complaint for an order
 * @route   POST /api/complaints
 * @access  Private (customer)
 */
const submitComplaint = [
  // Validation
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('complaint')
    .trim()
    .notEmpty()
    .withMessage('Complaint message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Complaint must be between 10 and 1000 characters'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { orderId, complaint } = req.body;

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only the customer who owns the order can submit a complaint
      if (order.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to submit complaint for this order' });
      }

      // Only allow complaints for delivered or received orders
      if (!['delivered', 'received'].includes(order.status)) {
        return res.status(400).json({ message: 'Can only submit complaints for delivered orders' });
      }

      // Update order with complaint
      order.complaint = complaint;
      order.complaintAt = new Date();
      await order.save();

      res.json({ message: 'Complaint submitted successfully', order });
    } catch (error) {
      console.error('Complaint submission error:', error);
      res.status(500).json({ message: error.message || 'Failed to submit complaint' });
    }
  }
];

/**
 * @desc    Get all complaints (admin/manager/employee)
 * @route   GET /api/complaints
 * @access  Private (admin, manager, employee)
 */
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Order.find({ complaint: { $ne: null } })
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .populate('complaintHandledBy', 'name')
      .sort({ complaintAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch complaints' });
  }
};

/**
 * @desc    Respond to a complaint
 * @route   PUT /api/complaints/:orderId/respond
 * @access  Private (admin, manager, employee)
 */
const respondToComplaint = [
  body('response')
    .trim()
    .notEmpty()
    .withMessage('Response is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Response must be between 5 and 2000 characters'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!order.complaint) {
        return res.status(400).json({ message: 'This order has no complaint' });
      }

      order.complaintResponse = req.body.response;
      order.complaintResponseAt = new Date();
      order.complaintHandledBy = req.user._id;
      await order.save();

      res.json({ message: 'Response submitted', order });
    } catch (error) {
      console.error('Complaint response error:', error);
      res.status(500).json({ message: error.message || 'Failed to respond to complaint' });
    }
  }
];

module.exports = {
  submitComplaint,
  getAllComplaints,
  respondToComplaint,
};
