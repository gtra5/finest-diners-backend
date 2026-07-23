import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useGeolocation = () => {
  const { updateLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Send to backend
      await updateLocation(latitude, longitude);

      return { latitude, longitude };
    } catch (err) {
      let errorMessage = 'Failed to get location';
      
      if (err.code === 1) {
        errorMessage = 'Please enable location permissions to use this feature';
      } else if (err.code === 2) {
        errorMessage = 'Unable to determine your location. Please try again';
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again';
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateLocation]);

  return { getCurrentLocation, loading, error };
};
