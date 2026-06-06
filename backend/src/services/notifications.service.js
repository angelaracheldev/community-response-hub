const { NOTIFICATION_TYPES, ENTITY_TYPES } = require('../constants/notificationTypes');
const notificationsRepository = require('../repositories/notifications.repository');

function parseBooleanQuery(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function createNotification({ userId, type, entityType, entityId, message }) {
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new Error(`Invalid notification type: ${type}`);
  }
  if (!ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Invalid entity type: ${entityType}`);
  }

  const result = await notificationsRepository.insertNotification({
    userId,
    type,
    entityType,
    entityId,
    message,
  });

  return result.rows[0];
}

async function getNotifications(userId, query) {
  const { page, limit, offset } = parsePagination(query);
  const isRead = parseBooleanQuery(query.is_read);

  const [listResult, countResult] = await Promise.all([
    notificationsRepository.findByUserId(userId, { limit, offset, isRead }),
    notificationsRepository.countByUserId(userId, { isRead }),
  ]);

  return {
    body: {
      status: 'ok',
      count: countResult.rows[0].total,
      notifications: listResult.rows,
      page,
      limit,
      timestamp: new Date().toISOString(),
    },
  };
}

async function getUnreadCount(userId) {
  const result = await notificationsRepository.countUnread(userId);
  return {
    body: {
      count: result.rows[0].count,
    },
  };
}

async function openNotification(notificationId, userId) {
  const existing = await notificationsRepository.findByIdForUser(notificationId, userId);
  if (!existing.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Notification not found' } } };
  }

  const notification = existing.rows[0];
  if (!notification.is_read) {
    const updated = await notificationsRepository.markAsRead(notificationId, userId);
    if (!updated.rowCount) {
      return { error: { status: 404, body: { status: 'error', message: 'Notification not found' } } };
    }
  }

  return {
    body: {
      status: 'ok',
      entity_type: notification.entity_type,
      entity_id: notification.entity_id,
      timestamp: new Date().toISOString(),
    },
  };
}

async function markAllAsRead(userId) {
  const result = await notificationsRepository.markAllAsRead(userId);
  return {
    body: {
      status: 'ok',
      message: 'All notifications marked as read',
      updatedCount: result.rowCount,
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  openNotification,
  markAllAsRead,
};
