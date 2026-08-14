import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Authorization token into every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor to handle session timeouts (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if user is in a protected path
      const currentPath = window.location.pathname;
      if (
        currentPath.includes('/dashboard') ||
        currentPath.includes('/wishlist') ||
        currentPath.includes('/admin')
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    
    // Extract error message for easy toast/alert displaying
    const errorMessage =
      error.response?.data?.message || 'An unexpected error occurred. Please try again.';
    
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    
    return Promise.reject(customError);
  }
);

export default api;
