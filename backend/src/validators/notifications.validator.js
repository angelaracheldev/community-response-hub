const { param } = require('express-validator');

const openNotificationValidation = [
  param('notificationId').isUUID().withMessage('notificationId must be a valid UUID'),
];

module.exports = {
  openNotificationValidation,
};
