const { STATUS_VALUES } = require('../constants/complaintStatus');
const { PRIORITY_VALUES } = require('../constants/complaintPriority');
const complaintsRepository = require('../repositories/complaints.repository');
const assignmentsRepository = require('../repositories/assignments.repository');
const activityLogsRepository = require('../repositories/activityLogs.repository');
const notificationEvents = require('./notificationEvents.service');


async function createComplaint(requestUser, body) {
  const { categoryId, title, description, locationText, latitude, longitude, priorityLevel } = body;
  const category = await complaintsRepository.findCategoryById(categoryId);
  if (!category.rowCount) {
    return { error: { status: 400, body: { status: 'error', message: 'Invalid category' } } };
  }

  const resolvedPriority = PRIORITY_VALUES.includes((priorityLevel || '').toLowerCase())
    ? priorityLevel.toLowerCase()
    : 'normal';

  const result = await complaintsRepository.insertComplaint({
    reportedBy: requestUser.user_id,
    categoryId,
    title,
    description,
    locationText,
    latitude,
    longitude,
    priorityLevel: resolvedPriority,
  });

  const complaint = result.rows[0];

  try {
    await activityLogsRepository.insertLog({
      complaintId: complaint.complaint_id,
      performedBy: requestUser.user_id,
      actionType: 'complaint_created',
      description: 'Complaint created by resident',
    });
  } catch (err) {
    console.error('Failed to insert activity log for complaint creation:', err.message);
  }

  try {
    await notificationEvents.onComplaintSubmitted(complaint);
  } catch (err) {
    console.error('Failed to create complaint notifications:', err.message);
  }

  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'Complaint created successfully',
      data: complaint,
      timestamp: new Date().toISOString(),
    },
  };
}

async function deleteFailedComplaint(id, requestUser) {
  const result = await complaintsRepository.findComplaintById(id);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const complaint = result.rows[0];
  if (requestUser.role_name === 'resident' && complaint.reported_by !== requestUser.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }
  if (complaint.status !== 'pending') {
    return { error: { status: 400, body: { status: 'error', message: 'Only pending complaints can be deleted' } } };
  }

  await complaintsRepository.deleteComplaintById(id);

  return {
    body: {
      status: 'ok',
      message: 'Complaint deleted successfully',
      timestamp: new Date().toISOString(),
    },
  };
}

async function listComplaints(requestUser, query) {
  const filters = [];
  const params = [];

  if (query.status) {
    const status = query.status.toLowerCase();
    if (STATUS_VALUES.includes(status)) {
      params.push(status);
      filters.push(`c.status = $${params.length}`);
    }
  }
  if (query.categoryId) {
    params.push(query.categoryId);
    filters.push(`c.category_id = $${params.length}`);
  }
  if (query.priorityLevel) {
    const priority = query.priorityLevel.toLowerCase();
    if (PRIORITY_VALUES.includes(priority)) {
      params.push(priority);
      filters.push(`c.priority_level = $${params.length}`);
    }
  }
  if (query.assignedToUserId) {
    params.push(query.assignedToUserId);
    filters.push(`ca.assigned_to = $${params.length}`);
  }

  if (requestUser.role_name === 'resident') {
    params.push(requestUser.user_id);
    filters.push(`c.reported_by = $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const result = await complaintsRepository.listComplaints({ whereClause, params });
  return {
    body: { status: 'ok', count: result.rowCount, complaints: result.rows, timestamp: new Date().toISOString() },
  };
}

async function listMyComplaints(requestUser) {
  const result = await complaintsRepository.listComplaintsByReporter(requestUser.user_id);
  return {
    body: { status: 'ok', count: result.rowCount, complaints: result.rows, timestamp: new Date().toISOString() },
  };
}

async function getComplaintById(id, requestUser) {
  const result = await complaintsRepository.findComplaintByIdentifier(id);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const complaint = result.rows[0];
  if (requestUser.role_name === 'resident' && complaint.reported_by !== requestUser.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }

  return {
    body: { status: 'ok', data: complaint, timestamp: new Date().toISOString() },
  };
}

async function updateComplaintStatus(id, { complaintStatus, remarks }) {
  const status = complaintStatus.toLowerCase();
  if (!STATUS_VALUES.includes(status)) {
    return { error: { status: 400, body: { status: 'error', message: 'Invalid complaint status' } } };
  }

  const existing = await complaintsRepository.findComplaintById(id);
  if (!existing.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const result = await complaintsRepository.updateComplaintStatus({ status, remarks: remarks || null, id });
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  const notifiableStatuses = ['in_progress', 'resolved', 'rejected', 'cancelled'];
  if (notifiableStatuses.includes(status)) {
    try {
      await notificationEvents.onComplaintStatusUpdated(existing.rows[0], status);
    } catch (err) {
      console.error('Failed to create status notifications:', err.message);
    }
  }

  await activityLogsRepository.insertLog({
  complaintId: id,
  performedBy: requestUser.user_id,
  actionType: 'complaint_rejected',
  description: remarks || 'Complaint rejected',
});

  return {
    body: {
      status: 'ok',
      message: 'Complaint status updated successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

const CANCELLABLE_STATUSES = ['pending', 'assigned'];

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

// async function assignComplaint(id, { assignedToUserId, assignedByUserId }) {
//   const complaint = await complaintsRepository.findComplaintIdOnly(id);
//   if (!complaint.rowCount) {
//     return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
//   }

//   await assignmentsRepository.deactivateAssignmentsForComplaint(id);
//   const assignment = await assignmentsRepository.insertAssignment({
//     complaintId: id,
//     assignedToUserId,
//     assignedByUserId,
//   });
//   await complaintsRepository.setComplaintStatusAssigned(id);

//   await activityLogsRepository.insertLog({
//   complaintId: id,
//   performedBy: assignedByUserId,
//   actionType: 'complaint_assigned',
//   description: 'Complaint assigned to responder',
// });
//   return {
//     body: {
//       status: 'ok',
//       message: 'Complaint assigned successfully',
//       data: assignment.rows[0],
//       timestamp: new Date().toISOString(),
//     },
//   };
// }


// async function updateComplaintPriority(id, { priorityLevel }) {
//   const result =
//     await complaintsRepository.updateComplaintPriority({
//       priorityLevel,
//       id,
//     });
  
//     await activityLogsRepository.insertLog({
//   complaintId: id,
//   performedBy: null,
//   actionType: 'priority_changed',
//   description: `Priority changed to ${priorityLevel}`,
// });

//   if (!result.rowCount) {
//     return {
//       error: {
//         status: 404,
//         body: {
//           status: 'error',
//           message: 'Complaint not found',
//         },
//       },
//     };
//   }

//   return {
//     body: {
//       status: 'ok',
//       data: result.rows[0],
//     },
//   };
// }

// updateComplaintPriority function with requestUser for activity log

// async function updateComplaintPriority(id, { priorityLevel }) {
//   const priority = priorityLevel?.toLowerCase();

//   if (!PRIORITY_VALUES.includes(priority)) {
//     return {
//       error: {
//         status: 400,
//         body: {
//           status: 'error',
//           message: 'Invalid priority level',
//         },
//       },
//     };
//   }

//   const result =
//     await complaintsRepository.updateComplaintPriority({
//       priorityLevel: priority,
//       id,
//     });

//   await activityLogsRepository.insertLog({
//   complaintId: id,
//   performedBy: requestUser.user_id,
//   actionType: 'priority_changed',
//   oldValue: oldPriority,
//   newValue: priorityLevel,
//   description: 'Complaint priority updated',
// });

//   if (!result.rowCount) {
//     return {
//       error: {
//         status: 404,
//         body: {
//           status: 'error',
//           message: 'Complaint not found',
//         },
//       },
//     };
//   }

//   return {
//     body: {
//       status: 'ok',
//       data: result.rows[0],
//     },
//   };
// }

async function assignComplaint(id, { assignedToUserId, assignedByUserId }) {
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
  const currentStatus = complaint.status;

  // ==============================
  // 🚫 STATUS VALIDATION RULES
  // ==============================
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

  // ==============================
  // 🔁 CHECK IF REASSIGNMENT
  // ==============================
  const existingAssignment =
    await assignmentsRepository.getLatestAssignmentByComplaintId?.(id);

  const isReassignment = !!existingAssignment?.rowCount;

  const previousResponder = isReassignment
    ? existingAssignment.rows[0].assigned_to
    : null;

  // ==============================
  // 🧹 DEACTIVATE OLD ASSIGNMENTS
  // ==============================
  await assignmentsRepository.deactivateAssignmentsForComplaint(id);

  // ==============================
  // ➕ CREATE NEW ASSIGNMENT
  // ==============================
  const assignment = await assignmentsRepository.insertAssignment({
    complaintId: id,
    assignedToUserId,
    assignedByUserId,
  });

  // ==============================
  // 🔄 UPDATE COMPLAINT STATUS
  // ==============================
  await complaintsRepository.updateComplaintStatus({
    id,
    status: 'assigned',
  });

  // ==============================
  // 📊 ACTIVITY LOG (STRUCTURED)
  // ==============================
  await activityLogsRepository.insertLog({
    complaintId: id,
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

  // ==============================
  // 🔔 NOTIFICATIONS
  // ==============================
  try {
    await notificationEvents.onComplaintAssigned?.({
      complaint,
      assignedToUserId,
      isReassignment,
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
  const priority = priorityLevel?.toLowerCase();

  // 1. Validate user context (IMPORTANT FIX)
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

  // 2. Validate priority
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

  // 3. Get existing complaint (for audit log)
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

  // 4. Update DB
  const result = await complaintsRepository.updateComplaintPriority({
    priorityLevel: priority,
    id,
  });

  // 5. Activity log (SAFE + CONTROLLED)
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

  // 6. Handle update failure
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

  // 7. Success response
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
          message: 'Complaint not found'
        }
      }
    };
  }

  const complaint = result.rows[0];

  // update status using EXISTING repository function
  const updated = await complaintsRepository.updateComplaintStatus({
    status: 'rejected',
    remarks: reason,
    id: complaintId
  });

  // activity log using EXISTING function
  await activityLogsRepository.insertLog({
    complaintId,
    performedBy: user.user_id,
    actionType: 'complaint_rejected',
    oldValue: complaint.status,
    newValue: 'rejected',
    description: `Complaint rejected: ${reason}`
  });

  return {
    body: {
      status: 'ok',
      message: 'Complaint rejected successfully',
      data: updated.rows?.[0],
      timestamp: new Date().toISOString()
    }
  };
}



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
