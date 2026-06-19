const { handleService } = require('../utils/controllerHelpers');
const notificationsService = require('../services/notifications.service');

const getNotifications = handleService(
  (req) => notificationsService.getNotifications(req.user.user_id, req.query),
  { logLabel: 'Failed to fetch notifications', fallbackMessage: 'Unable to retrieve notifications' }
);

const getUnreadCount = handleService(
  (req) => notificationsService.getUnreadCount(req.user.user_id),
  { logLabel: 'Failed to fetch unread notification count', fallbackMessage: 'Unable to retrieve unread notification count' }
);

const openNotification = handleService(
  (req) => notificationsService.openNotification(req.params.notificationId, req.user.user_id),
  { validate: true, logLabel: 'Failed to open notification', fallbackMessage: 'Unable to open notification' }
);

const markAllAsRead = handleService(
  (req) => notificationsService.markAllAsRead(req.user.user_id),
  { logLabel: 'Failed to mark all notifications as read', fallbackMessage: 'Unable to mark notifications as read' }
);

module.exports = {
  getNotifications,
  getUnreadCount,
  openNotification,
  markAllAsRead,
};
