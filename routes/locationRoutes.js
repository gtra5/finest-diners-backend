const express = require('express');
const router = express.Router();
const {
  updateLocation,
  getLocation,
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All location routes require authentication

router.post('/', authorize('customer', 'driver'), updateLocation);
router.get('/', getLocation);

module.exports = router;
