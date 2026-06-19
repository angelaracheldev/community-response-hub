const activityLogsRepository = require('../repositories/activityLogs.repository');
const complaintsRepository = require('../repositories/complaints.repository');

async function assertCanAccessComplaintLogs(complaintIdentifier, user) {
  const result = await complaintsRepository.findComplaintByIdentifier(complaintIdentifier);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const complaint = result.rows[0];

  if (user.role_name === 'admin') {
    return { complaint };
  }

  if (user.role_name === 'resident' && complaint.reported_by !== user.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }

  if (user.role_name === 'responder' && complaint.assigned_to !== user.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }

  if (!['admin', 'resident', 'responder'].includes(user.role_name)) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }

  return { complaint };
}

async function getLogsByComplaintId(complaintId, requestUser) {
  const access = await assertCanAccessComplaintLogs(complaintId, requestUser);
  if (access.error) {
    return access;
  }

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
