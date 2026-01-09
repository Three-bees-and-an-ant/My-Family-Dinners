import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Set token in API client
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Try to get user info
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      // For demo, we'll decode token to get user info
      // In production, you'd call an API endpoint
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role
          });
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // Invalid token, clear it
          logout();
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Don't logout on error, just set loading to false
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Backend returns { success: true, user, token } or { user, token }
      const data = response.data;
      const user = data.user || data;
      const token = data.token;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // More specific error messages
      if (!error.response) {
        // Network error - backend not running
        return {
          success: false,
          error: 'Cannot connect to server. Please ensure backend is running: cd backend && npm run dev'
        };
      }
      
      if (error.response.status === 429) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        };
      }
      
      if (error.response.status === 500) {
        const serverError = error.response.data?.error || 'Server error';
        // Check if it's a database connection error
        if (serverError.includes('database') || serverError.includes('MySQL') || serverError.includes('connect')) {
          return {
            success: false,
            error: 'Database connection failed. Please ensure MySQL is running: brew services start mysql'
          };
        }
        return {
          success: false,
          error: `Server error: ${serverError}. Please check if MySQL is running and database is properly configured.`
        };
      }
      
      if (error.response.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password. Please check your credentials.'
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      // Backend returns { success: true, user, token } or { user, token }
      const data = response.data;
      const user = data.user || data;
      const token = data.token;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

