const complaintsRepository = require('../repositories/complaints.repository');
const assignmentsRepository = require('../repositories/assignments.repository');
const mediaRepository = require('../repositories/media.repository');
const activityLogsRepository = require('../repositories/activityLogs.repository');

async function getComplaintDetails(complaintId) {
  const complaintResult = await complaintsRepository.findComplaintByIdentifier(complaintId);
  if (!complaintResult.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const complaint = complaintResult.rows[0];
  const id = complaint.complaint_id;

  const [assignmentsResult, mediaResult, logsResult] = await Promise.all([
    assignmentsRepository.listByComplaintId(id),
    mediaRepository.listByComplaintId(id),
    activityLogsRepository.findByComplaintId(id),
  ]);

  return {
    body: {
      status: 'ok',
      complaint,
      category: {
        category_name: complaint.category_name,
        description: complaint.category_description ?? null,
      },
      assignments: assignmentsResult.rows,
      media: mediaResult.rows,
      activityLogs: logsResult.rows,
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  getComplaintDetails,
};
