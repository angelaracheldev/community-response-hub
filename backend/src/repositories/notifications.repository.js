const db = require('../config/database');

async function insertNotification({ userId, type, entityType, entityId, message }) {
  return db.query(
    `INSERT INTO notifications (user_id, type, entity_type, entity_id, message, is_read, read_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, FALSE, NULL, NULL)
     RETURNING notification_id, user_id, type, entity_type, entity_id, message, is_read, read_at, expires_at, created_at`,
    [userId, type, entityType, entityId, message]
  );
}

async function findByUserId(userId, { limit, offset, isRead }) {
  const params = [userId];
  const filters = ['user_id = $1'];

  if (isRead === true || isRead === false) {
    params.push(isRead);
    filters.push(`is_read = $${params.length}`);
  }

  params.push(limit, offset);

  return db.query(
    `SELECT notification_id, user_id, type, entity_type, entity_id, message, is_read, read_at, expires_at, created_at
     FROM notifications
     WHERE ${filters.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
}

async function countByUserId(userId, { isRead }) {
  const params = [userId];
  const filters = ['user_id = $1'];

  if (isRead === true || isRead === false) {
    params.push(isRead);
    filters.push(`is_read = $${params.length}`);
  }

  return db.query(
    `SELECT COUNT(*)::INT AS total FROM notifications WHERE ${filters.join(' AND ')}`,
    params
  );
}

async function countUnread(userId) {
  return db.query(
    `SELECT COUNT(*)::INT AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

async function findByIdForUser(notificationId, userId) {
  return db.query(
    `SELECT notification_id, user_id, type, entity_type, entity_id, message, is_read, read_at, expires_at, created_at
     FROM notifications
     WHERE notification_id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
}

async function markAsRead(notificationId, userId) {
  return db.query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
     WHERE notification_id = $1 AND user_id = $2
     RETURNING notification_id, user_id, type, entity_type, entity_id, message, is_read, read_at, expires_at, created_at`,
    [notificationId, userId]
  );
}

async function markAllAsRead(userId) {
  return db.query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

module.exports = {
  insertNotification,
  findByUserId,
  countByUserId,
  countUnread,
  findByIdForUser,
  markAsRead,
  markAllAsRead,
};
