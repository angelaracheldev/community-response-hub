const dbRepository = require('../repositories/stats.repository');
const { nodeEnv } = require('../config');

async function healthCheck() {
  const result = await dbRepository.ping();
  return {
    body: {
      status: 'ok',
      database: true,
      ping: result.rows[0].ok,
      environment: nodeEnv,
      timestamp: new Date().toISOString(),
    },
  };
}

async function getStats() {
  const result = await dbRepository.getStats();
  return {
    body: {
      status: 'ok',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthCheck,
  getStats,
};
