import api from './api';

const priceService = {
  /**
   * Fetch multi-store price comparison and summary analytics for a laptop
   * @param {string} laptopId 
   */
  getLaptopPrices: async (laptopId) => {
    const response = await api.get(`/prices/${laptopId}`);
    return response.data;
  },

  /**
   * Search live prices across stores for a query string
   * @param {string} query 
   */
  searchPrices: async (query) => {
    const response = await api.post('/prices/search', { query });
    return response.data;
  },

  /**
   * Get price history trend points (7d, 30d, 90d, 6m, 1y)
   * @param {string} laptopId 
   */
  getPriceHistory: async (laptopId) => {
    const response = await api.get(`/prices/${laptopId}/history`);
    return response.data;
  },

  /**
   * Get lowest price, best deal store, and potential savings
   * @param {string} laptopId 
   */
  getLowestPrice: async (laptopId) => {
    const response = await api.get(`/prices/${laptopId}/lowest`);
    return response.data;
  },

  /**
   * Set a target price alert for a laptop
   * @param {object} payload - { laptopId, targetPrice, store }
   */
  createPriceAlert: async (payload) => {
    const response = await api.post('/price-alerts', payload);
    return response.data;
  },

  /**
   * Fetch all active price alerts for the logged-in user
   */
  getUserPriceAlerts: async () => {
    const response = await api.get('/price-alerts');
    return response.data;
  },

  /**
   * Delete a price alert
   * @param {string} alertId 
   */
  deletePriceAlert: async (alertId) => {
    const response = await api.delete(`/price-alerts/${alertId}`);
    return response.data;
  }
};

export default priceService;
