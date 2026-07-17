import api from './api';

const notificationService = {
  /**
   * Fetch user notifications (price drop alerts, release announcements)
   */
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   */
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService;
