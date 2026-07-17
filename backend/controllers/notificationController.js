const Notification = require('../models/Notification');
const { NotFoundError, ForbiddenError } = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

/**
 * Fetch current user's notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('data.laptopId')
      .sort('-createdAt')
      .limit(50); // Cap at latest 50 notifications

    res.status(200).json(formatResponse('Notifications retrieved successfully', notifications));
  } catch (error) {
    next(error);
  }
};

/**
 * Mark specific notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new NotFoundError('Notification not found.'));
    }

    // Authorization guard
    if (notification.user.toString() !== req.user.id) {
      return next(new ForbiddenError('You do not have permission to modify this notification.'));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(formatResponse('Notification marked as read successfully', notification));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
