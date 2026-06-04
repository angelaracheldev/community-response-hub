const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      database: true,
      ping: result.rows[0].ok,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(500).json({
      status: 'error',
      database: false,
      message: 'Unable to connect to database',
      error: error.message,
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS user_count,
        (SELECT COUNT(*) FROM complaints) AS complaint_count,
        (SELECT COUNT(*) FROM complaint_categories) AS category_count
    `);

    res.json({
      status: 'ok',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database stats query failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Unable to read database statistics',
      error: error.message,
    });
  }
});

module.exports = router;
