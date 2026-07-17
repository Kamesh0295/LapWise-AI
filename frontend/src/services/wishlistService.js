import api from './api';

const wishlistService = {
  /**
   * Fetch current authenticated user's wishlist
   */
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  /**
   * Add a laptop to user's wishlist
   * @param {string} laptopId - Laptop ID
   */
  addToWishlist: async (laptopId) => {
    const response = await api.post('/wishlist/add', { laptopId });
    return response.data;
  },

  /**
   * Remove a laptop from user's wishlist
   * @param {string} laptopId - Laptop ID
   */
  removeFromWishlist: async (laptopId) => {
    const response = await api.delete(`/wishlist/remove/${laptopId}`);
    return response.data;
  }
};

export default wishlistService;
