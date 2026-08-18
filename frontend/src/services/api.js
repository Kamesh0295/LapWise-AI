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
    let errorMessage = error.response?.data?.message;
    if (!errorMessage) {
      if (!error.response) {
        errorMessage = 'Unable to connect to backend server. Please check your internet connection or backend server status on Render.';
      } else if (error.response.status === 500) {
        errorMessage = 'Internal server error (500). Please check backend database logs on Render.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
    }
    
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    
    return Promise.reject(customError);
  }
);

export default api;
