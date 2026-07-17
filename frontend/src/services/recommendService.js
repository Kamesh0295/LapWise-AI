import api from './api';

const recommendService = {
  /**
   * Submit questionnaire wizard responses and fetch top recommendations
   * @param {object} wizardData - { purpose, maxPrice, preferredBrand, answers }
   */
  getWizardRecommendations: async (wizardData) => {
    const response = await api.post('/recommend/wizard', wizardData);
    return response.data;
  },

  /**
   * Submit natural language text search for Gemini recommendations
   * @param {string} query - The natural language request string
   */
  getAIRecommendations: async (query) => {
    const response = await api.post('/recommend/ai', { query });
    return response.data;
  },

  /**
   * Fetch user recommendation logs history (requires auth)
   */
  getRecommendationHistory: async () => {
    const response = await api.get('/recommend/history');
    return response.data;
  }
};

export default recommendService;
