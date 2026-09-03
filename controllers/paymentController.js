const { initializeTransaction, verifyTransaction, generateReference } = require('../services/paystackService');
const Order = require('../models/Order');
const { body, validationResult, param } = require('express-validator');

/**
 * @desc    Initialize a Paystack transaction for an order
 * @route   POST /api/payments/initialize
 * @access  Private (customer)
 */
const initializePayment = [
  // Validation — note: amount is NOT accepted from the client; the server
  // reads the order total directly from the database to prevent price-tampering.
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { orderId, email } = req.body;

      // Load the order to get the server-side authoritative price
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only the customer who owns the order may initiate payment
      if (order.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to pay for this order' });
      }

      // Use the server-computed totalPrice — never trust a client-supplied amount
      const reference = generateReference();
      const amountInKobo = Math.round(order.totalPrice * 100);

      // Initialize transaction with Paystack
      const paymentData = {
        amount: amountInKobo,
        email,
        reference,
        callback_url: `${process.env.ALLOWED_ORIGINS}/payment/callback`,
        metadata: {
          orderId,
          userId: req.user._id,
        },
      };

      const response = await initializeTransaction(paymentData);

      res.json({
        success: true,
        reference,
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

/**
 * @desc    Verify a Paystack transaction
 * @route   GET /api/payments/verify/:reference
 * @access  Private
 */
const verifyPayment = [
  // Validation
  param('reference')
    .trim()
    .notEmpty()
    .withMessage('Transaction reference is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { reference } = req.params;

      // Verify transaction with Paystack
      const response = await verifyTransaction(reference);

      if (response.data.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: 'Payment was not successful'
        });
      }

      // Extract metadata from Paystack response
      const { orderId, userId } = response.data.metadata;

      // Update order payment status
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Verify the order belongs to the user
      if (order.customer.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to verify this payment' });
      }

      // Reconcile: the amount Paystack actually collected must equal the
      // order's current total (both in kobo). Blocks payment-tampering where
      // a smaller amount is paid for a larger order.
      const paidKobo = Number(response.data.amount);
      const expectedKobo = Math.round(order.totalPrice * 100);
      if (!Number.isFinite(paidKobo) || paidKobo !== expectedKobo) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount does not match order total',
        });
      }

      // Update order payment status
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentReference = reference;
      await order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

module.exports = {
  initializePayment,
  verifyPayment,
};
