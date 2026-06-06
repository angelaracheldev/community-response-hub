const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const notificationsController = require('../controllers/notifications.controller');
const { openNotificationValidation } = require('../validators/notifications.validator');

router.get('/', authMiddleware, notificationsController.getNotifications);
router.get('/unread-count', authMiddleware, notificationsController.getUnreadCount);
router.put('/read-all', authMiddleware, notificationsController.markAllAsRead);
router.put(
  '/:notificationId/open',
  authMiddleware,
  openNotificationValidation,
  notificationsController.openNotification
);

module.exports = router;
