const { handleService } = require('../utils/controllerHelpers');
const complaintsService = require('../services/complaints.service');

const createComplaint = handleService(
  (req) => complaintsService.createComplaint(req.user, req.body),
  { validate: true, logLabel: 'Failed to create complaint', fallbackMessage: 'Unable to create complaint', defaultStatus: 201 }
);

const listComplaints = handleService(
  (req) => complaintsService.listComplaints(req.user, req.query),
  { logLabel: 'Failed to list complaints', fallbackMessage: 'Unable to retrieve complaints' }
);

const listMyComplaints = handleService(
  (req) => complaintsService.listMyComplaints(req.user),
  { logLabel: 'Failed to list user complaints', fallbackMessage: 'Unable to retrieve user complaints' }
);

const getComplaintById = handleService(
  (req) => complaintsService.getComplaintById(req.params.id, req.user),
  { logLabel: 'Failed to fetch complaint', fallbackMessage: 'Unable to retrieve complaint' }
);

const updateComplaintStatus = handleService(
  (req) => complaintsService.updateComplaintStatus(req.params.id, req.body, req.user),
  { validate: true, logLabel: 'Failed to update complaint status', fallbackMessage: 'Unable to update status' }
);

const assignComplaint = handleService(
  (req) =>
    complaintsService.assignComplaint(
      req.params.id,
      { assignedToUserId: req.body.assignedToUserId, assignedByUserId: req.user.user_id },
      req.user
    ),
  { validate: true, logLabel: 'Failed to assign complaint', fallbackMessage: 'Unable to assign complaint' }
);

const cancelComplaint = handleService(
  (req) => complaintsService.cancelComplaint(req.params.id, req.user, req.body),
  { validate: true, logLabel: 'Failed to cancel complaint', fallbackMessage: 'Unable to cancel complaint' }
);

const deleteFailedComplaint = handleService(
  (req) => complaintsService.deleteFailedComplaint(req.params.id, req.user),
  { logLabel: 'Failed to delete complaint', fallbackMessage: 'Unable to delete complaint' }
);

const updateComplaintPriority = handleService(
  (req) => complaintsService.updateComplaintPriority(req.params.id, req.body, req.user),
  { logLabel: 'Failed to update priority', fallbackMessage: 'Unable to update priority' }
);

const rejectComplaint = handleService(
  async (req) => {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      return {
        error: {
          status: 400,
          body: { status: 'error', message: 'Reason must be at least 10 characters' },
        },
      };
    }
    return complaintsService.rejectComplaint(req.params.id, req.user, reason);
  },
  { logLabel: 'Failed to reject complaint', fallbackMessage: 'Unable to reject complaint' }
);

module.exports = {
  createComplaint,
  listComplaints,
  listMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  cancelComplaint,
  deleteFailedComplaint,
  updateComplaintPriority,
  rejectComplaint,
};
