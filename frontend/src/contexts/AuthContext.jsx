// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Helper to store token
  const applyToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    apiService.setAuthToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser(payload.user);
    } catch (err) {
      console.error('Invalid token:', err);
      logout();
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // 1) Check URL for token (social login redirect)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
          // Save token and remove it from URL
          applyToken(urlToken);
          // Remove token param from URL without reloading
          params.delete('token');
          const newSearch = params.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
          window.history.replaceState({}, document.title, newUrl);
          setLoading(false);
          return;
        }

        // 2) Use token from localStorage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            setUser(payload.user);
            apiService.setAuthToken(storedToken);
          } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);

      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser(payload.user);
      apiService.setAuthToken(newToken);

      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.msg || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);

      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser(payload.user);
      apiService.setAuthToken(newToken);

      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.msg || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    apiService.clearAuthToken();
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isCitizen = user?.role === 'citizen';

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCitizen,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
