import api from './api';

const reviewService = {
  /**
   * Submit a new review for a laptop
   * @param {object} reviewData - { laptop, rating, comment }
   */
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  /**
   * Update an existing review rating/comment
   * @param {string} id - Review ID
   * @param {object} updateData - { rating, comment }
   */
  editReview: async (id, updateData) => {
    const response = await api.put(`/reviews/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete a review
   * @param {string} id - Review ID
   */
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Like/unlike a review (toggle action)
   * @param {string} id - Review ID
   */
  toggleLike: async (id) => {
    const response = await api.post(`/reviews/${id}/like`);
    return response.data;
  }
};

export default reviewService;
