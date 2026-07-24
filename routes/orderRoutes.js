const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.post('/', authorize('customer'), createOrder);
router.get('/my', authorize('customer'), getMyOrders);
router.get('/', authorize('admin'), getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('admin', 'driver'), updateOrderStatus);

module.exports = router;
