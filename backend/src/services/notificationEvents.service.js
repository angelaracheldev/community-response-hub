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

async function notifyAssignedResponder({ assignedTo, type, complaintId, message }) {
  if (!assignedTo) return;

  await notificationsService.createNotification({
    userId: assignedTo,
    type,
    entityType: ENTITY.COMPLAINT,
    entityId: complaintId,
    message,
  });
}

// =====================
// STATUS UPDATES (RESIDENT + RESPONDER)
// =====================
async function onComplaintStatusUpdated(complaint, newStatus) {
  const {
    complaint_id: complaintId,
    reported_by: reportedBy,
    assigned_to: assignedTo,
    title,
  } = complaint;

  const residentMessages = {
    in_progress: `Your complaint "${title}" is now in progress.`,
    resolved: `Your complaint "${title}" has been resolved.`,
    rejected: `Your complaint "${title}" has been rejected.`,
  };

  const responderMessages = {
    cancelled: `Assigned complaint "${title}" has been cancelled by the resident.`,
    rejected: `Assigned complaint "${title}" has been rejected.`,
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

  // Responder notification when an assigned complaint is cancelled or rejected
  if (responderMessages[newStatus]) {
    await notifyAssignedResponder({
      assignedTo,
      type: `complaint_${newStatus}`,
      complaintId,
      message: responderMessages[newStatus],
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

  // 3. Notify previous responder on reassignment
  if (isReassignment && previousResponder && previousResponder !== assignedToUserId) {
    await notificationsService.createNotification({
      userId: previousResponder,
      type: 'complaint_unassigned',
      entityType: ENTITY.COMPLAINT,
      entityId: complaint_id,
      message: `Complaint "${title}" has been unassigned from you.`,
    });
  }
}

module.exports = {
  onComplaintSubmitted,
  onComplaintStatusUpdated,
  onComplaintAssigned,
};