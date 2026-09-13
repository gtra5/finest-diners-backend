const axios = require('axios');
const { query, validationResult } = require('express-validator');
const { calculateRoute } = require('../services/osrmService');

const OPENCAGE_KEY = process.env.OPENCAGE_API_KEY;

/**
 * @desc    Approximate location from the request IP. Used as a fast fallback
 *          when the browser's GPS is unavailable/blocked (mobile apps, denied
 *          permission, no GPS). Accuracy is city-level − the frontend renders
 *          this as "approximate" and still lets the user refresh for GPS.
 * @route   GET /api/location/ip
 * @access  Public
 */
const getIpLocation = async (req, res) => {
  try {
    // Try providers in order; each fails fast (~3.5s) so the frontend never waits long.
    const sources = [
      async () => {
        const { data } = await axios.get('https://ipwho.is/', { timeout: 3500 });
        if (!data || data.success === false) throw new Error('ipwho.is failed');
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city || null,
          country: data.country || null,
          countryCode: data.country_code || null
        };
      },
      async () => {
        const { data } = await axios.get('http://ip-api.com/json/', { timeout: 3500 });
        if (!data || data.status !== 'success') throw new Error('ip-api failed');
        return {
          latitude: Number(data.lat),
          longitude: Number(data.lon),
          city: data.city || null,
          country: data.country || null,
          countryCode: data.countryCode || null
        };
      },
    ];

    let location = null;
    for (const source of sources) {
      try {
        location = await source();
        break;
      } catch (err) {
        console.warn('[ipLocation]', err.message);
      }
    }

    if (!location) {
      return res.status(502).json({ message: 'IP location service unavailable' });
    }

    // Validate that location is within Nigeria
    const country = location.country || '';
    const countryCode = location.countryCode || '';

    const isNigeria = country.toLowerCase().includes('nigeria') ||
                     countryCode.toLowerCase() === 'ng';

    if (!isNigeria) {
      return res.status(403).json({
        message: 'Service is not available for this country'
      });
    }

    res.json({ ...location, source: 'ip' });
  } catch (error) {
    console.error('IP location error:', error.message);
    res.status(500).json({ message: 'Failed to locate by IP' });
  }
};

/**
 * @desc    Turn GPS coordinates (from the browser's Geolocation API) into a
 *          readable address. Replaces the old IP-based lookup — IP geolocation
 *          is frequently wrong by tens of kilometres, especially outside the
 *          US/EU, so we rely on the device's actual GPS reading instead.
 * @route   GET /api/location/reverse?lat=..&lng=..
 * @access  Public
 */
const getAddressFromCoords = [
  // Validation
  query('lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { lat, lng } = req.query;

      const latitude = Number(lat);
      const longitude = Number(lng);

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
        timeout: 5000, // 5 second timeout
      });

      const result = response.data?.results?.[0];

      if (!result) {
        return res.status(404).json({ message: 'No address found for these coordinates' });
      }

      const c = result.components || {};

      // Validate that location is within Nigeria
      const country = c.country || '';
      const countryCode = c.country_code || '';

      const isNigeria = country.toLowerCase().includes('nigeria') ||
                       countryCode.toLowerCase() === 'ng';

      if (!isNigeria) {
        return res.status(403).json({
          message: 'Service is not available for this country'
        });
      }

      // Sanitize response data to prevent XSS
      const sanitizeString = (str) => str ? String(str).replace(/[<>]/g, '') : null;

      res.json({
        formattedAddress: sanitizeString(result.formatted),
        street: sanitizeString([c.road, c.house_number].filter(Boolean).join(' ')),
        neighbourhood: sanitizeString(c.neighbourhood || c.suburb || c.quarter),
        city: sanitizeString(c.city || c.town || c.village),
        state: sanitizeString(c.state),
        country: sanitizeString(c.country),
        postal: sanitizeString(c.postcode),
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
  }
];

/**
 * @desc    Calculate ETA and distance between two coordinates using OSRM
 * @route   GET /api/location/route?fromLat=..&fromLng=..&toLat=..&toLng=..
 * @access  Private
 */
const calculateETA = [
  // Validation
  query('fromLat')
    .notEmpty()
    .withMessage('From latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('From latitude must be between -90 and 90'),
  query('fromLng')
    .notEmpty()
    .withMessage('From longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('From longitude must be between -180 and 180'),
  query('toLat')
    .notEmpty()
    .withMessage('To latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('To latitude must be between -90 and 90'),
  query('toLng')
    .notEmpty()
    .withMessage('To longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('To longitude must be between -180 and 180'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { fromLat, fromLng, toLat, toLng } = req.query;

      const route = await calculateRoute(
        Number(fromLat),
        Number(fromLng),
        Number(toLat),
        Number(toLng)
      );

      res.json({
        duration: route.duration,
        distance: route.distance,
        durationMinutes: route.durationMinutes,
        distanceKm: route.distanceKm,
      });
    } catch (error) {
      console.error('Route calculation error:', error.message);
      res.status(500).json({
        message: error.message || 'Failed to calculate route',
      });
    }
  }
];

module.exports = {
  getAddressFromCoords,
  calculateETA,
  getIpLocation,
};