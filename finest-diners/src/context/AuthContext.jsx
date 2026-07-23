import { createContext, useContext, useState, useEffect } from 'react';
import api, { updateLocation as updateLocationApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      const data = await updateLocationApi(latitude, longitude);
      // Update user state with new location data
      setUser((prev) => ({
        ...prev,
        latitude: data.latitude,
        longitude: data.longitude,
        locationUpdatedAt: data.locationUpdatedAt,
      }));
      // Update localStorage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        latitude: data.latitude,
        longitude: data.longitude,
        locationUpdatedAt: data.locationUpdatedAt,
      }));
      return data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
