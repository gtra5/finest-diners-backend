const axios = require('axios');

const OPENCAGE_KEY = process.env.OPENCAGE_API_KEY;

/**
 * @desc    Turn GPS coordinates (from the browser's Geolocation API) into a
 *          readable address. Replaces the old IP-based lookup — IP geolocation
 *          is frequently wrong by tens of kilometres, especially outside the
 *          US/EU, so we rely on the device's actual GPS reading instead.
 * @route   GET /api/location/reverse?lat=..&lng=..
 * @access  Public
 */
const getAddressFromCoords = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: 'lat and lng query parameters are required',
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'lat/lng is out of range' });
    }

    if (!OPENCAGE_KEY) {
      console.error('OPENCAGE_API_KEY is not set');
      return res.status(500).json({ message: 'Location service is not configured' });
    }

    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: `${latitude}+${longitude}`,
        key: OPENCAGE_KEY,
        no_annotations: 1,
        language: 'en',
      },
      timeout: 5000, // 5 second timeout, same as before
    });

    const result = response.data?.results?.[0];

    if (!result) {
      return res.status(404).json({ message: 'No address found for these coordinates' });
    }

    const c = result.components || {};

    res.json({
      formattedAddress: result.formatted,
      street: [c.road, c.house_number].filter(Boolean).join(' ') || null,
      neighbourhood: c.neighbourhood || c.suburb || c.quarter || null,
      city: c.city || c.town || c.village || null,
      state: c.state || null,
      country: c.country || null,
      postal: c.postcode || null,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        message: 'Location service timeout. Please try again.',
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        message: `Location service error: ${error.response.statusText}`,
      });
    }

    res.status(500).json({
      message: 'Failed to fetch address for this location',
    });
  }
};

module.exports = {
  getAddressFromCoords,
};