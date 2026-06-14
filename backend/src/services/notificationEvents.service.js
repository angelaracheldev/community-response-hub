const notificationsService = require('./notifications.service');
const usersRepository = require('../repositories/users.repository');

const ENTITY = {
  COMPLAINT: 'complaint',
};

// =====================
// ADMIN NOTIFICATIONS
// =====================
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

// =====================
// COMPLAINT SUBMITTED
// =====================
async function onComplaintSubmitted(complaint) {
  await notifyAdmins({
    type: 'new_complaint_submitted',
    entityId: complaint.complaint_id,
    message: `New complaint submitted: "${complaint.title}"`,
  });
}

// =====================
// STATUS UPDATES (RESIDENT + ADMIN)
// =====================
async function onComplaintStatusUpdated(complaint, newStatus) {
  const { complaint_id: complaintId, reported_by: reportedBy, title } = complaint;

  const residentMessages = {
    in_progress: `Your complaint "${title}" is now in progress.`,
    resolved: `Your complaint "${title}" has been resolved.`,
    rejected: `Your complaint "${title}" has been rejected.`,
  };

  // Resident notification
  if (residentMessages[newStatus] && reportedBy) {
    await notificationsService.createNotification({
      userId: reportedBy,
      type: `complaint_${newStatus}`,
      entityType: ENTITY.COMPLAINT,
      entityId: complaintId,
      message: residentMessages[newStatus],
    });
  }

  // Admin notification for cancellation (optional but useful)
  if (newStatus === 'cancelled') {
    await notifyAdmins({
      type: 'complaint_cancelled',
      entityId: complaintId,
      message: `Complaint "${title}" has been cancelled.`,
    });
  }
}

// =====================
// ASSIGNMENT + REASSIGNMENT (FULL COVERAGE)
// =====================
async function onComplaintAssigned({
  complaint,
  assignedToUserId,
  assignedByUserId,
  isReassignment,
  previousResponder,
}) {
  const { complaint_id, title, reported_by } = complaint;

  // 1. Notify responder
  await notificationsService.createNotification({
    userId: assignedToUserId,
    type: isReassignment ? 'complaint_reassigned' : 'complaint_assigned',
    entityType: ENTITY.COMPLAINT,
    entityId: complaint_id,
    message: isReassignment
      ? `You have been reassigned to complaint "${title}".`
      : `You have been assigned a new complaint: "${title}".`,
  });

  // 2. Notify resident
  await notificationsService.createNotification({
    userId: reported_by,
    type: isReassignment ? 'complaint_reassigned' : 'complaint_assigned',
    entityType: ENTITY.COMPLAINT,
    entityId: complaint_id,
    message: isReassignment
      ? `Your complaint was reassigned to a new responder.`
      : `Your complaint has been assigned to a responder.`,
  });

  // 3. Notify admins
  await notifyAdmins({
    type: isReassignment ? 'complaint_reassigned' : 'complaint_assigned',
    entityId: complaint_id,
    message: isReassignment
      ? `Complaint "${title}" was reassigned.`
      : `Complaint "${title}" was assigned.`,
  });
}

module.exports = {
  onComplaintSubmitted,
  onComplaintStatusUpdated,
  onComplaintAssigned,
};