const dbService = require('../services/db.service');
const { safeErrorPayload } = require('../utils/safeError');

async function healthCheck(req, res) {
  try {
    const result = await dbService.healthCheck();
    return res.json(result.body);
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return res.status(500).json(safeErrorPayload('Unable to connect to database', error));
  }
}

async function getStats(req, res) {
  try {
    const result = await dbService.getStats();
    return res.json(result.body);
  } catch (error) {
    console.error('Database stats query failed:', error.message);
    return res.status(500).json(safeErrorPayload('Unable to read database statistics', error));
  }
}

module.exports = {
  healthCheck,
  getStats,
};
