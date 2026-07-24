const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Admin only
router.post('/', protect, authorize('admin'), createRestaurant);
router.put('/:id', protect, authorize('admin'), updateRestaurant);
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

module.exports = router;
