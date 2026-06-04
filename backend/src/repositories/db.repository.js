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

module.exports = {
  ping,
  getStats,
};
