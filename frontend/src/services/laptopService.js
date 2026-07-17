import api from './api';

const laptopService = {
  /**
   * Fetch all catalog laptops (using SerpAPI and cache)
   * @param {object} params - Query parameters object
   */
  getCatalog: async (params = {}) => {
    const response = await api.get('/catalog', { params });
    return response.data;
  },

  /**
   * Search laptops using SerpAPI Google Shopping
   * @param {object} params - Query parameters object (containing q)
   */
  searchCatalog: async (params = {}) => {
    const response = await api.get('/catalog/search', { params });
    return response.data;
  },

  /**
   * Filter laptops on advanced criteria
   * @param {object} params - Query filters object
   */
  filterCatalog: async (params = {}) => {
    const response = await api.get('/catalog/filter', { params });
    return response.data;
  },

  /**
   * Fetch all laptops with optional query filters (brand, price, sorting, search, purpose)
   * @param {object} params - Query parameters object
   */
  getAllLaptops: async (params = {}) => {
    const response = await api.get('/laptops', { params });
    return response.data;
  },

  /**
   * Fetch details of a single laptop
   * @param {string} id - Laptop ObjectId
   */
  getLaptopById: async (id) => {
    const response = await api.get(`/laptops/${id}`);
    return response.data;
  },

  /**
   * Create a new laptop (Admin only)
   * @param {FormData} laptopData - FormData containing fields and image file objects
   */
  addLaptop: async (laptopData) => {
    const response = await api.post('/laptops', laptopData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing laptop specs (Admin only)
   * @param {string} id - Laptop ID
   * @param {FormData|object} laptopData - Updated details
   */
  updateLaptop: async (id, laptopData) => {
    const isFormData = laptopData instanceof FormData;
    const response = await api.put(`/laptops/${id}`, laptopData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Delete a laptop (Admin only)
   * @param {string} id - Laptop ID
   */
  deleteLaptop: async (id) => {
    const response = await api.delete(`/laptops/${id}`);
    return response.data;
  }
};

export default laptopService;
