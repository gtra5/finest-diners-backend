const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All payment routes require authentication

router.post('/initialize', authorize('customer'), initializePayment);
router.get('/verify/:reference', verifyPayment);

module.exports = router;
