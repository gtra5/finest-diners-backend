const { initializeTransaction, verifyTransaction, generateReference } = require('../services/paystackService');
const Order = require('../models/Order');

/**
 * @desc    Initialize a Paystack transaction for an order
 * @route   POST /api/payments/initialize
 * @access  Private (customer)
 */
const initializePayment = async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount || !email) {
      return res.status(400).json({ 
        message: 'orderId, amount, and email are required' 
      });
    }

    // Generate unique reference
    const reference = generateReference();

    // Convert amount to kobo (Paystack expects amount in smallest currency unit)
    const amountInKobo = Math.round(amount * 100);

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
};

/**
 * @desc    Verify a Paystack transaction
 * @route   GET /api/payments/verify/:reference
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

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
};

module.exports = {
  initializePayment,
  verifyPayment,
};
