import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadProfile = async () => {
    try {
      const response = await adminAPI.getProfile();
      if (response.data.success) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await adminAPI.login({ username, password });
      
      if (response.data.success) {
        const { token: newToken, admin: adminData } = response.data;
        
        setToken(newToken);
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        localStorage.setItem('admin_token', newToken);
        toast.success('Login successful!');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Login failed';
      
      if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to backend. Please check your API URL configuration in Railway.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Backend API not found. Please verify your VITE_API_URL environment variable.';
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
    toast.info('Logged out successfully');
  };

  const value = {
    admin,
    token,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



