const express = require('express');
const router = express.Router();
const { getAddressFromCoords } = require('../controllers/locationController');

// Reverse-geocode GPS coordinates (from the browser) into a readable address
router.get('/reverse', getAddressFromCoords);

module.exports = router;