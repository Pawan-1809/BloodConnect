import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEYS = {
  token: 'token',
  user: 'bloodconnect_user',
  donorProfile: 'bloodconnect_donor_profile'
};

const readStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

const persistAuthSnapshot = ({ token, user, donorProfile }) => {
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  }

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  }

  if (donorProfile) {
    localStorage.setItem(AUTH_STORAGE_KEYS.donorProfile, JSON.stringify(donorProfile));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.donorProfile);
  }
};

const clearAuthSnapshot = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  localStorage.removeItem(AUTH_STORAGE_KEYS.donorProfile);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredJson(AUTH_STORAGE_KEYS.user));
  const [donorProfile, setDonorProfile] = useState(() => readStoredJson(AUTH_STORAGE_KEYS.donorProfile));
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem(AUTH_STORAGE_KEYS.token));

  const syncAuthState = useCallback(async (authToken, fallbackUser = null) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      const response = await api.get('/auth/me', {
        params: { _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response?.data?.user) {
        setUser(response.data.user);
        setDonorProfile(response.data.donorProfile || null);
        persistAuthSnapshot({
          token: authToken,
          user: response.data.user,
          donorProfile: response.data.donorProfile || null
        });
        return response.data.user;
      }

      setUser(fallbackUser);
      setDonorProfile(null);
      persistAuthSnapshot({ token: authToken, user: fallbackUser, donorProfile: null });
      return fallbackUser;
    } catch (error) {
      if (fallbackUser) {
        setUser(fallbackUser);
        persistAuthSnapshot({ token: authToken, user: fallbackUser, donorProfile: null });
      }
      return fallbackUser;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);
      const storedUser = readStoredJson(AUTH_STORAGE_KEYS.user);
      const storedDonorProfile = readStoredJson(AUTH_STORAGE_KEYS.donorProfile);

      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        if (storedUser) {
          setUser(storedUser);
          setDonorProfile(storedDonorProfile);
        }

        try {
          await syncAuthState(storedToken, storedUser);
        } catch (error) {
          console.error('Auth check failed:', error);
          if (!storedUser) {
            clearAuthSnapshot();
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setDonorProfile(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [syncAuthState]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const normalizedEmail = (email || '').toString().trim().toLowerCase();
      const response = await api.post('/auth/login', { email: normalizedEmail, password });
      const { token: newToken, user: userData } = response.data;

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      persistAuthSnapshot({ token: newToken, user: userData, donorProfile: null });
      const syncedUser = await syncAuthState(newToken, userData);

      toast.success(`Welcome back, ${syncedUser?.firstName || userData.firstName}!`);
      return { success: true, user: syncedUser || userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [syncAuthState]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const payload = {
        ...userData,
        email: (userData?.email || '').toString().trim().toLowerCase()
      };

      const response = await api.post('/auth/register', payload);
      const { token: newToken, user: newUser } = response.data;

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      persistAuthSnapshot({ token: newToken, user: newUser, donorProfile: null });
      const syncedUser = await syncAuthState(newToken, newUser);

      toast.success('Registration successful! Welcome to BloodConnect.');
      return { success: true, user: syncedUser || newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [syncAuthState]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthSnapshot();
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setDonorProfile(null);
      setToken(null);
      toast.success('Logged out successfully');
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await api.put('/auth/update-profile', profileData);
      setUser(response.data.user);
      persistAuthSnapshot({ token, user: response.data.user, donorProfile });
      toast.success('Profile updated successfully');
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [donorProfile, token]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me', {
        params: { _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response?.data?.user) {
        setUser(response.data.user);
        setDonorProfile(response.data.donorProfile || null);
        persistAuthSnapshot({
          token,
          user: response.data.user,
          donorProfile: response.data.donorProfile || null
        });
      }
      return response.data;
    } catch (error) {
      console.error('Refresh user failed:', error);
      return null;
    }
  }, [token]);

  const value = {
    user,
    donorProfile,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    refreshUser,
    setDonorProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
