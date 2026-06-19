const { STATUS_VALUES } = require('../../constants/complaintStatus');
const { PRIORITY_VALUES } = require('../../constants/complaintPriority');
const complaintsRepository = require('../../repositories/complaints.repository');
const assignmentsRepository = require('../../repositories/assignments.repository');
const activityLogsRepository = require('../../repositories/activityLogs.repository');
const mediaRepository = require('../../repositories/media.repository');
const notificationEvents = require('../notificationEvents.service');
const {
  RESPONDER_ALLOWED_STATUSES,
  sanitizeComplaintForResponder,
  assertResponderAssigned,
} = require('./helpers');

const CANCELLABLE_STATUSES = ['pending', 'assigned'];

async function updateComplaintStatus(id, { complaintStatus, remarks }, requestUser) {
  const status = complaintStatus.toLowerCase();
  if (!STATUS_VALUES.includes(status)) {
    return { error: { status: 400, body: { status: 'error', message: 'Invalid complaint status' } } };
  }

  const existing = await complaintsRepository.findComplaintByIdentifier(id);
  if (!existing.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const complaint = existing.rows[0];
  const complaintId = complaint.complaint_id;
  const oldStatus = complaint.status;

  if (requestUser.role_name === 'responder') {
    const assignmentError = await assertResponderAssigned(complaint, requestUser);
    if (assignmentError) {
      return assignmentError;
    }

    if (!RESPONDER_ALLOWED_STATUSES.includes(status)) {
      return {
        error: {
          status: 403,
          body: { status: 'error', message: 'Responders can only set status to in_progress or resolved' },
        },
      };
    }

    if (status === 'in_progress' && !['assigned', 'in_progress'].includes(oldStatus)) {
      return {
        error: {
          status: 400,
          body: { status: 'error', message: 'Only assigned complaints can be marked in progress' },
        },
      };
    }

    if (status === 'resolved') {
      const trimmedRemarks = (remarks || '').trim();
      if (trimmedRemarks.length < 10) {
        return {
          error: {
            status: 400,
            body: { status: 'error', message: 'Resolution remarks must be at least 10 characters' },
          },
        };
      }

      const mediaCount = await mediaRepository.countMediaUploadedBy(complaintId, requestUser.user_id);
      if ((mediaCount.rows[0]?.count ?? 0) < 1) {
        return {
          error: {
            status: 400,
            body: { status: 'error', message: 'At least one resolution evidence file is required' },
          },
        };
      }
    }
  }

  const result = await complaintsRepository.updateComplaintStatus({
    status,
    remarks: remarks || null,
    id,
  });
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const notifiableStatuses = ['in_progress', 'resolved', 'rejected', 'cancelled'];
  if (notifiableStatuses.includes(status)) {
    try {
      await notificationEvents.onComplaintStatusUpdated(complaint, status);
    } catch (err) {
      console.error('Failed to create status notifications:', err.message);
    }
  }

  try {
    await activityLogsRepository.insertLog({
      complaintId,
      performedBy: requestUser.user_id,
      actionType: status === 'resolved' ? 'status_resolved' : 'status_in_progress',
      oldValue: oldStatus,
      newValue: status,
      description:
        status === 'resolved'
          ? 'Complaint status changed to resolved'
          : 'Complaint status changed to in_progress',
    });

    if (status === 'resolved' && remarks?.trim()) {
      await activityLogsRepository.insertLog({
        complaintId,
        performedBy: requestUser.user_id,
        actionType: 'resolution_remarks_added',
        description: remarks.trim(),
      });
    }
  } catch (err) {
    console.error('Failed to insert status activity log:', err.message);
  }

  const updatedComplaint = result.rows[0];
  const refreshed = await complaintsRepository.findComplaintByIdentifier(id);
  const complaintData = refreshed.rowCount ? refreshed.rows[0] : updatedComplaint;
  const data =
    requestUser.role_name === 'responder'
      ? sanitizeComplaintForResponder(complaintData)
      : complaintData;

  return {
    body: {
      status: 'ok',
      message: 'Complaint status updated successfully',
      data,
      timestamp: new Date().toISOString(),
    },
  };
}

async function cancelComplaint(id, requestUser, { cancellationReason }) {
  const result = await complaintsRepository.findComplaintByIdentifier(id);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const complaint = result.rows[0];
  if (requestUser.role_name !== 'resident' || complaint.reported_by !== requestUser.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }

  if (!CANCELLABLE_STATUSES.includes(complaint.status)) {
    return {
      error: {
        status: 400,
        body: {
          status: 'error',
          message: 'Only pending or assigned complaints can be cancelled',
        },
      },
    };
  }

  await complaintsRepository.updateComplaintStatus({
    status: 'cancelled',
    remarks: cancellationReason,
    id,
  });

  try {
    await notificationEvents.onComplaintStatusUpdated(complaint, 'cancelled');
  } catch (err) {
    console.error('Failed to create cancellation notifications:', err.message);
  }

  const refreshed = await complaintsRepository.findComplaintByIdentifier(id);

  return {
    body: {
      status: 'ok',
      message: 'Complaint cancelled successfully',
      data: refreshed.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

async function assignComplaint(id, { assignedToUserId, assignedByUserId }, requestUser) {
  if (requestUser?.role_name === 'responder') {
    return {
      error: {
        status: 403,
        body: { status: 'error', message: 'Forbidden' },
      },
    };
  }

  const complaintRes = await complaintsRepository.findComplaintById(id);

  if (!complaintRes.rowCount) {
    return {
      error: {
        status: 404,
        body: {
          status: 'error',
          message: 'Complaint not found',
        },
      },
    };
  }

  const complaint = complaintRes.rows[0];
  const complaintId = complaint.complaint_id;
  const currentStatus = complaint.status;

  const allowedStatuses = ['pending', 'assigned', 'in_progress'];

  if (!allowedStatuses.includes(currentStatus)) {
    return {
      error: {
        status: 400,
        body: {
          status: 'error',
          message: `Cannot assign complaint in status: ${currentStatus}`,
        },
      },
    };
  }

  const existingAssignment =
    await assignmentsRepository.getActiveAssignmentForComplaint(complaintId);

  const isReassignment = !!existingAssignment?.rowCount;

  const previousResponder = isReassignment
    ? existingAssignment.rows[0].assigned_to
    : null;

  await assignmentsRepository.deactivateAssignmentsForComplaint(complaintId);

  const assignment = await assignmentsRepository.insertAssignment({
    complaintId,
    assignedToUserId,
    assignedByUserId,
  });

  await complaintsRepository.updateComplaintStatus({
    id: complaintId,
    status: 'assigned',
  });

  await activityLogsRepository.insertLog({
    complaintId,
    performedBy: assignedByUserId,
    actionType: isReassignment
      ? 'responder_reassigned'
      : 'responder_assigned',
    oldValue: previousResponder,
    newValue: assignedToUserId,
    description: isReassignment
      ? `Reassigned from ${previousResponder} to ${assignedToUserId}`
      : `Assigned to responder ${assignedToUserId}`,
  });

  try {
    await notificationEvents.onComplaintAssigned?.({
      complaint,
      assignedToUserId,
      isReassignment,
      previousResponder,
    });
  } catch (err) {
    console.error('Assignment notification failed:', err.message);
  }

  return {
    body: {
      status: 'ok',
      message: isReassignment
        ? 'Complaint reassigned successfully'
        : 'Complaint assigned successfully',
      data: assignment.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

async function updateComplaintPriority(id, { priorityLevel }, requestUser) {
  if (requestUser?.role_name === 'responder') {
    return {
      error: {
        status: 403,
        body: { status: 'error', message: 'Forbidden' },
      },
    };
  }

  const priority = priorityLevel?.toLowerCase();

  if (!requestUser || !requestUser.user_id) {
    return {
      error: {
        status: 401,
        body: {
          status: 'error',
          message: 'Unauthorized request',
        },
      },
    };
  }

  if (!PRIORITY_VALUES.includes(priority)) {
    return {
      error: {
        status: 400,
        body: {
          status: 'error',
          message: 'Invalid priority level',
        },
      },
    };
  }

  const existing = await complaintsRepository.findComplaintById(id);

  if (!existing.rowCount) {
    return {
      error: {
        status: 404,
        body: {
          status: 'error',
          message: 'Complaint not found',
        },
      },
    };
  }

  const oldPriority = existing.rows[0].priority_level;

  const result = await complaintsRepository.updateComplaintPriority({
    priorityLevel: priority,
    id,
  });

  try {
    await activityLogsRepository.insertLog({
      complaintId: id,
      performedBy: requestUser.user_id,
      actionType: 'priority_changed',
      oldValue: oldPriority,
      newValue: priority,
      description: `Priority changed from ${oldPriority} to ${priority}`,
    });
  } catch (logErr) {
    console.error('Priority activity log failed:', logErr.message);
  }

  if (!result.rowCount) {
    return {
      error: {
        status: 404,
        body: {
          status: 'error',
          message: 'Complaint not found',
        },
      },
    };
  }

  return {
    body: {
      status: 'ok',
      message: 'Priority updated successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

async function rejectComplaint(complaintId, user, reason) {
  const result = await complaintsRepository.findComplaintById(complaintId);

  if (!result.rowCount) {
    return {
      error: {
        status: 404,
        body: {
          status: 'error',
          message: 'Complaint not found',
        },
      },
    };
  }

  const complaint = result.rows[0];

  const updated = await complaintsRepository.updateComplaintStatus({
    status: 'rejected',
    remarks: reason,
    id: complaintId,
  });

  await activityLogsRepository.insertLog({
    complaintId,
    performedBy: user.user_id,
    actionType: 'complaint_rejected',
    oldValue: complaint.status,
    newValue: 'rejected',
    description: `Complaint rejected: ${reason}`,
  });

  try {
    await notificationEvents.onComplaintStatusUpdated(complaint, 'rejected');
  } catch (err) {
    console.error('Reject notification failed:', err.message);
  }

  return {
    body: {
      status: 'ok',
      message: 'Complaint rejected successfully',
      data: updated.rows?.[0],
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  updateComplaintStatus,
  cancelComplaint,
  assignComplaint,
  updateComplaintPriority,
  rejectComplaint,
};
