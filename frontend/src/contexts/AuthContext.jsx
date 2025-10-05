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
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.user);
        apiService.setAuthToken(token);
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};