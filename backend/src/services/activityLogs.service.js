const activityLogsRepository = require('../repositories/activityLogs.repository');

async function getLogsByComplaintId(complaintId) {
  const logs = await activityLogsRepository.findByComplaintId(complaintId);
  return {
    body: {
      status: 'ok',
      count: logs.rowCount,
      logs: logs.rows,
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  getLogsByComplaintId,
};
