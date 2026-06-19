const db = require('../config/database');

async function ping() {
  return db.query('SELECT 1 AS ok');
}

async function getStats() {
  return db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS user_count,
        (SELECT COUNT(*) FROM complaints) AS complaint_count,
        (SELECT COUNT(*) FROM complaint_categories) AS category_count
    `);
}

async function getDashboardSummary() {
  return db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS user_count,
      (SELECT COUNT(*)::int FROM complaints) AS complaint_count,
      (SELECT COUNT(*)::int FROM complaints WHERE status = 'in_progress') AS in_progress_count,
      (SELECT COUNT(*)::int FROM complaints WHERE status = 'resolved') AS resolved_count,
      (SELECT COUNT(*)::int FROM complaints WHERE status IN ('pending', 'assigned', 'in_progress')) AS open_count,
      (SELECT COUNT(*)::int FROM users WHERE is_active = TRUE) AS active_users_count,
      (SELECT COUNT(*)::int FROM resident_verifications WHERE status = 'pending') AS pending_verifications_count,
      (SELECT COUNT(*)::int
         FROM users u
         JOIN roles r ON r.role_id = u.role_id
        WHERE r.role_name = 'responder' AND u.is_active = TRUE) AS responder_count
  `);
}

async function getComplaintsByStatus() {
  return db.query(`
    SELECT status, COUNT(*)::int AS count
    FROM complaints
    GROUP BY status
    ORDER BY count DESC
  `);
}

async function getRecentComplaints(limit = 5) {
  return db.query(
    `SELECT c.complaint_id, c.reference_id, c.title, c.status, c.created_at, cc.category_name
     FROM complaints c
     LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
     ORDER BY c.created_at DESC
     LIMIT $1`,
    [limit]
  );
}

async function getComplaintTrend(days = 30) {
  return db.query(
    `SELECT DATE(created_at) AS day, COUNT(*)::int AS count
     FROM complaints
     WHERE created_at >= CURRENT_DATE - $1::int
     GROUP BY DATE(created_at)
     ORDER BY day ASC`,
    [days]
  );
}

module.exports = {
  ping,
  getStats,
  getDashboardSummary,
  getComplaintsByStatus,
  getRecentComplaints,
  getComplaintTrend,
};
