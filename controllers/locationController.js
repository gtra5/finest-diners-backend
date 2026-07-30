const axios = require('axios');

/**
 * @desc    Get client location based on IP address using ipapi.co
 * @route   GET /api/location
 * @access  Public
 */
const getLocationByIP = async (req, res) => {
  try {
    // Get client IP from request, handling proxy headers
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? forwarded.split(',')[0].trim() 
      : req.socket.remoteAddress || req.connection.remoteAddress;

    // Handle localhost/IPv6 loopback for testing
    const clientIP = (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1')
      ? null // ipapi.co will use the server's IP if null
      : ip;

    // Call ipapi.co API with custom User-Agent header
    const apiUrl = clientIP 
      ? `https://ipapi.co/${clientIP}/json/`
      : 'https://ipapi.co/json/';

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Finest-Diners/1.0',
      },
      timeout: 5000, // 5 second timeout
    });

    const data = response.data;

    // Check for API errors
    if (data.error) {
      return res.status(400).json({
        message: `Location API error: ${data.reason || 'Unknown error'}`,
      });
    }

    // Return relevant location data
    res.json({
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      country_code: data.country_code,
      continent: data.continent_code,
      currency: data.currency,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
      postal: data.postal,
    });
  } catch (error) {
    console.error('Location API error:', error.message);
    
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
      message: 'Failed to fetch location data',
    });
  }
};

module.exports = {
  getLocationByIP,
};
