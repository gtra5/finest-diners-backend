const User = require('../models/User');

/**
 * @desc    Update user's current location
 * @route   POST /api/location
 * @access  Private (customer, driver)
 */
const updateLocation = async (req, res) => {
  try {
    console.log('updateLocation called with user:', req.user?._id);
    const { latitude, longitude } = req.body;

    // Validate that latitude and longitude are provided
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    // Validate coordinate types
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ 
        message: 'Latitude and longitude must be valid numbers' 
      });
    }

    // Validate latitude range (-90 to 90)
    if (lat < -90 || lat > 90) {
      return res.status(400).json({ 
        message: 'Latitude must be between -90 and 90 degrees' 
      });
    }

    // Validate longitude range (-180 to 180)
    if (lng < -180 || lng > 180) {
      return res.status(400).json({ 
        message: 'Longitude must be between -180 and 180 degrees' 
      });
    }

    // Update user's location
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.latitude = lat;
    user.longitude = lng;
    user.locationUpdatedAt = new Date();
    await user.save();

    res.json({
      message: 'Location updated successfully',
      latitude: user.latitude,
      longitude: user.longitude,
      locationUpdatedAt: user.locationUpdatedAt,
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's current location
 * @route   GET /api/location
 * @access  Private
 */
const getLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('latitude longitude locationUpdatedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.latitude === null || user.longitude === null) {
      return res.status(404).json({ 
        message: 'No location data available for this user' 
      });
    }

    res.json({
      latitude: user.latitude,
      longitude: user.longitude,
      locationUpdatedAt: user.locationUpdatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateLocation,
  getLocation,
};
