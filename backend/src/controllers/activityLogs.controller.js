const activityLogsService = require('../services/activityLogs.service');

async function getLogsByComplaintId(req, res) {
  try {
    const result = await activityLogsService.getLogsByComplaintId(req.params.complaintId);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch activity logs:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve activity logs',
      error: error.message,
    });
  }
}

module.exports = {
  getLogsByComplaintId,
};
