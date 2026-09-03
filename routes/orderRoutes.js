const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.post('/', authorize('customer'), createOrder);
router.get('/my', authorize('customer'), getMyOrders);
router.get('/', authorize('admin', 'manager', 'employee'), getAllOrders);

router.get('/driver/my-orders', authorize('driver'), getDriverOrders);
router.get('/driver/available', authorize('driver'), getAvailableOrders);

router.get('/:id', getOrderById);
router.put('/:id/status', authorize('admin', 'driver', 'manager', 'employee'), updateOrderStatus);
router.put('/:id/receive', authorize('customer'), confirmOrderReceipt);
router.put('/:id/assign', authorize('admin', 'manager'), assignDriver);
router.put('/:id/claim', authorize('driver'), claimOrder);

module.exports = router;
