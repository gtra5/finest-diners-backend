const express = require('express');
const router = express.Router();
const { getLocationByIP } = require('../controllers/locationController');

// Get location based on client IP
router.get('/', getLocationByIP);

module.exports = router;
