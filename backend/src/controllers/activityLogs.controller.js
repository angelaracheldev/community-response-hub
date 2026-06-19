const { handleService } = require('../utils/controllerHelpers');
const activityLogsService = require('../services/activityLogs.service');

const getLogsByComplaintId = handleService(
  (req) => activityLogsService.getLogsByComplaintId(req.params.complaintId, req.user),
  { logLabel: 'Failed to fetch activity logs', fallbackMessage: 'Unable to retrieve activity logs' }
);

module.exports = {
  getLogsByComplaintId,
};
