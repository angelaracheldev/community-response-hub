const adminService = require('../services/admin.service');
const dashboardService = require('../services/dashboard.service');
const { handleService } = require('../utils/controllerHelpers');

const getComplaintDetails = handleService(
  (req) => adminService.getComplaintDetails(req.params.complaintId),
  { logLabel: 'Failed to fetch complaint details (admin)', fallbackMessage: 'Unable to retrieve complaint details' }
);

const getDashboard = handleService(
  () => dashboardService.getAdminDashboard(),
  { logLabel: 'Failed to fetch admin dashboard', fallbackMessage: 'Unable to retrieve dashboard data' }
);

module.exports = {
  getComplaintDetails,
  getDashboard,
};
