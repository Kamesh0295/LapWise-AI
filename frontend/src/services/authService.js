// ESM import helper
import apiInstance from './api';

const authService = {
  register: async (userData) => {
    const response = await apiInstance.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiInstance.post('/auth/login', credentials);
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiInstance.post('/auth/logout');
    } catch (err) {
      // Log errors but clean up local storage regardless
      console.warn('Backend logout failed, clearing local storage anyway');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },

  forgotPassword: async (email) => {
    const response = await apiInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await apiInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiInstance.put('/auth/change-password', passwordData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await apiInstance.post('/auth/google-login', { idToken });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }
};

export default authService;
