const { handleService } = require('../utils/controllerHelpers');
const dbService = require('../services/db.service');

const healthCheck = handleService(
  () => dbService.healthCheck(),
  { logLabel: 'Database health check failed', fallbackMessage: 'Unable to connect to database' }
);

const getStats = handleService(
  () => dbService.getStats(),
  { logLabel: 'Database stats query failed', fallbackMessage: 'Unable to read database statistics' }
);

module.exports = {
  healthCheck,
  getStats,
};
