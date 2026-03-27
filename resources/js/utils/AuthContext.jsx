import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data); // Breeze returns user directly from /api/user
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      // Step 1: Get CSRF Cookie (standard for SPA)
      await axios.get('/sanctum/csrf-cookie');
      
      // Step 2: Login
      const response = await axios.post('/api/login', credentials);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      await axios.get('/sanctum/csrf-cookie');
      const response = await axios.post('/api/register', userData);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (data) => {
    try {
      const response = await axios.put('/api/user/profile', data);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (data) => {
    try {
      const response = await axios.put('/api/user/password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePhoto = async (formData) => {
    try {
      const response = await axios.post('/api/user/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateProfile, updatePassword, updatePhoto }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
