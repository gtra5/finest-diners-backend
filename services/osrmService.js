const axios = require('axios');

const OSRM_URL = process.env.OSRM_URL;

/**
 * Calculate ETA and distance between two coordinates using OSRM
 * @param {number} fromLat - Starting latitude
 * @param {number} fromLng - Starting longitude
 * @param {number} toLat - Destination latitude
 * @param {number} toLng - Destination longitude
 * @returns {Promise<{duration: number, distance: number, durationMinutes: number, distanceKm: number}>}
 */
async function calculateRoute(fromLat, fromLng, toLat, toLng) {
  if (!OSRM_URL) {
    throw new Error('OSRM_URL is not configured');
  }

  try {
    const response = await axios.get(
      `${OSRM_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}`,
      {
        params: {
          overview: false,
          steps: false,
        },
        timeout: 5000,
      }
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found between coordinates');
    }

    const route = response.data.routes[0];
    const duration = route.duration; // seconds
    const distance = route.distance; // meters

    return {
      duration,
      distance,
      durationMinutes: Math.round(duration / 60),
      distanceKm: (distance / 1000).toFixed(2),
    };
  } catch (error) {
    console.error('OSRM routing error:', error.message);
    throw new Error('Failed to calculate route');
  }
}

/**
 * Calculate ETA from rider's current location to customer's delivery address
 * @param {number} riderLat - Rider's current latitude
 * @param {number} riderLng - Rider's current longitude
 * @param {number} customerLat - Customer's delivery latitude
 * @param {number} customerLng - Customer's delivery longitude
 * @returns {Promise<{etaMinutes: number, distanceKm: number}>}
 */
async function getDeliveryETA(riderLat, riderLng, customerLat, customerLng) {
  try {
    const route = await calculateRoute(riderLat, riderLng, customerLat, customerLng);
    return {
      etaMinutes: route.durationMinutes,
      distanceKm: route.distanceKm,
    };
  } catch (error) {
    // Return null if OSRM is unavailable instead of throwing
    return null;
  }
}

module.exports = {
  calculateRoute,
  getDeliveryETA,
};
