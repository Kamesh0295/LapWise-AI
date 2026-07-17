import api from './api';

const adminService = {
  /**
   * Fetch core count metrics (laptops, reviews, users counts)
   */
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  /**
   * Fetch advanced analytics (top wishlisted, popular searches, categories splits)
   */
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  /**
   * Fetch paginated list of users
   * @param {number} page - Page index
   */
  getUsers: async (page = 1) => {
    const response = await api.get(`/admin/users?page=${page}`);
    return response.data;
  },

  /**
   * Update a user's role
   * @param {string} userId - User ID
   * @param {string} role - 'user' | 'admin'
   */
  updateRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Delete a user profile (Admin only)
   * @param {string} userId - User ID
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }
};

export default adminService;
