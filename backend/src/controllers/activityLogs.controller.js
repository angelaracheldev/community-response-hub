const activityLogsService = require('../services/activityLogs.service');
const { safeErrorPayload } = require('../utils/safeError');

async function getLogsByComplaintId(req, res) {
  try {
    const result = await activityLogsService.getLogsByComplaintId(req.params.complaintId, req.user);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch activity logs:', error.message);
    return res.status(500).json(safeErrorPayload('Unable to retrieve activity logs', error));
  }
}

module.exports = {
  getLogsByComplaintId,
};
