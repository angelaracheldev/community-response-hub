const dbService = require('../services/db.service');

async function healthCheck(req, res) {
  try {
    const result = await dbService.healthCheck();
    return res.json(result.body);
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return res.status(500).json({
      status: 'error',
      database: false,
      message: 'Unable to connect to database',
      error: error.message,
    });
  }
}

async function getStats(req, res) {
  try {
    const result = await dbService.getStats();
    return res.json(result.body);
  } catch (error) {
    console.error('Database stats query failed:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to read database statistics',
      error: error.message,
    });
  }
}

module.exports = {
  healthCheck,
  getStats,
};
