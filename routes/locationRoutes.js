const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getAddressFromCoords } = require('../controllers/locationController');

// Rate limiting for location API calls (external API dependency)
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many location requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Reverse-geocode GPS coordinates (from the browser) into a readable address
router.get('/reverse', locationLimiter, getAddressFromCoords);

module.exports = router;