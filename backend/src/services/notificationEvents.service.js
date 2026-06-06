const notificationsService = require('./notifications.service');
const usersRepository = require('../repositories/users.repository');

const ENTITY = {
  COMPLAINT: 'complaint',
};

async function notifyAdmins({ type, entityId, message }) {
  const admins = await usersRepository.findActiveUsersByRoleName('admin');
  await Promise.all(
    admins.rows.map((admin) =>
      notificationsService.createNotification({
        userId: admin.user_id,
        type,
        entityType: ENTITY.COMPLAINT,
        entityId,
        message,
      })
    )
  );
}

async function onComplaintSubmitted(complaint) {
  await notifyAdmins({
    type: 'new_complaint_submitted',
    entityId: complaint.complaint_id,
    message: `New complaint submitted: "${complaint.title}"`,
  });
}

async function onComplaintStatusUpdated(complaint, newStatus) {
  const { complaint_id: complaintId, reported_by: reportedBy, title } = complaint;

  const residentMessages = {
    in_progress: `Your complaint "${title}" is now in progress.`,
    resolved: `Your complaint "${title}" has been resolved.`,
    rejected: `Your complaint "${title}" has been rejected.`,
  };

  if (residentMessages[newStatus] && reportedBy) {
    await notificationsService.createNotification({
      userId: reportedBy,
      type: `complaint_${newStatus}`,
      entityType: ENTITY.COMPLAINT,
      entityId: complaintId,
      message: residentMessages[newStatus],
    });
  }

  if (newStatus === 'cancelled') {
    await notifyAdmins({
      type: 'complaint_cancelled',
      entityId: complaintId,
      message: `Complaint "${title}" has been cancelled by the resident.`,
    });
  }
}

module.exports = {
  onComplaintSubmitted,
  onComplaintStatusUpdated,
};
