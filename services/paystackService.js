const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize a Paystack transaction
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.amount - Amount in kobo (lowest currency unit)
 * @param {string} paymentData.email - Customer email
 * @param {string} paymentData.reference - Unique transaction reference
 * @param {string} paymentData.callback_url - URL to redirect after payment
 * @returns {Promise<Object>} Paystack response
 */
const initializeTransaction = async (paymentData) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        amount: paymentData.amount,
        email: paymentData.email,
        reference: paymentData.reference,
        callback_url: paymentData.callback_url,
        metadata: paymentData.metadata || {},
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Paystack initialization failed: ${error.response?.data?.message || error.message}`
    );
  }
};

/**
 * Verify a Paystack transaction
 * @param {string} reference - Transaction reference to verify
 * @returns {Promise<Object>} Paystack verification response
 */
const verifyTransaction = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Paystack verification failed: ${error.response?.data?.message || error.message}`
    );
  }
};

/**
 * Generate a unique transaction reference
 * @returns {string} Unique reference
 */
const generateReference = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `FD-${timestamp}-${random}`.toUpperCase();
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  generateReference,
};
