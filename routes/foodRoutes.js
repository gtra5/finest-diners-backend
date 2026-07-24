const express = require('express');
const router = express.Router();
const { getMenuByRestaurant, getFoodDetail, upsertFood } = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/menu/:restaurantId', getMenuByRestaurant);
router.get('/:spoonacularId', getFoodDetail);

// Admin only
router.post('/', protect, authorize('admin'), upsertFood);

module.exports = router;
