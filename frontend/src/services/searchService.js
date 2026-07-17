import api from './api';

const searchService = {
  /**
   * Fetch live autocomplete suggestions as the user types
   * @param {string} q - Keyword query input
   */
  getAutocomplete: async (q) => {
    const response = await api.get('/search/autocomplete', { params: { q } });
    return response.data;
  },

  /**
   * Fetch top 5 popular search queries
   */
  getPopularSearches: async () => {
    const response = await api.get('/search/popular');
    return response.data;
  },

  /**
   * Fetch user's search history logs
   */
  getSearchHistory: async () => {
    const response = await api.get('/search/history');
    return response.data;
  }
};

export default searchService;
