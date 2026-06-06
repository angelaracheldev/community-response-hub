const { validationResult } = require('express-validator');
const notificationsService = require('../services/notifications.service');

async function getNotifications(req, res) {
  try {
    const result = await notificationsService.getNotifications(req.user.user_id, req.query);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch notifications:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve notifications',
      error: error.message,
    });
  }
}

async function getUnreadCount(req, res) {
  try {
    const result = await notificationsService.getUnreadCount(req.user.user_id);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve unread notification count',
      error: error.message,
    });
  }
}

async function openNotification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const result = await notificationsService.openNotification(req.params.notificationId, req.user.user_id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to open notification:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to open notification',
      error: error.message,
    });
  }
}

async function markAllAsRead(req, res) {
  try {
    const result = await notificationsService.markAllAsRead(req.user.user_id);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to mark notifications as read',
      error: error.message,
    });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  openNotification,
  markAllAsRead,
};
