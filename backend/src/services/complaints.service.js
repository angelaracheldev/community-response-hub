const { STATUS_VALUES } = require('../constants/complaintStatus');
const { PRIORITY_VALUES } = require('../constants/complaintPriority');
const complaintsRepository = require('../repositories/complaints.repository');
const activityLogsRepository = require('../repositories/activityLogs.repository');
const notificationEvents = require('./notificationEvents.service');
const {
  sanitizeComplaintForResponder,
  assertResponderAssigned,
  mapComplaintsForUser,
} = require('./complaints/helpers');
const workflowService = require('./complaints/workflow.service');

const STATUS_GROUPS = {
  active: ['pending', 'under_review', 'assigned', 'in_progress'],
  closed: ['cancelled', 'rejected'],
  resolved: ['resolved'],
};

function parseComplaintPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

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

  if (query.statusGroup) {
    const group = query.statusGroup.toLowerCase();
    const statuses = STATUS_GROUPS[group];
    if (statuses) {
      params.push(statuses);
      filters.push(`c.status = ANY($${params.length})`);
    }
  } else if (query.status) {
    const status = query.status.toLowerCase();
    if (STATUS_VALUES.includes(status)) {
      params.push(status);
      filters.push(`c.status = $${params.length}`);
    }
  }

  if (query.categoryId) {
    params.push(Number(query.categoryId));
    filters.push(`c.category_id = $${params.length}`);
  }
  if (query.priorityLevel) {
    const priority = query.priorityLevel.toLowerCase();
    if (PRIORITY_VALUES.includes(priority)) {
      params.push(priority);
      filters.push(`c.priority_level = $${params.length}`);
    }
  }
  if (query.assignedToUserId === 'unassigned') {
    filters.push('ca.assigned_to IS NULL');
  } else if (query.assignedToUserId) {
    params.push(query.assignedToUserId);
    filters.push(`ca.assigned_to = $${params.length}`);
  }
  if (query.search && String(query.search).trim()) {
    const term = `%${String(query.search).trim()}%`;
    params.push(term);
    const searchIndex = params.length;
    filters.push(
      `(c.title ILIKE $${searchIndex} OR c.reference_id ILIKE $${searchIndex} OR c.description ILIKE $${searchIndex})`
    );
  }

  if (requestUser.role_name === 'resident') {
    params.push(requestUser.user_id);
    filters.push(`c.reported_by = $${params.length}`);
  }

  if (requestUser.role_name === 'responder') {
    params.push(requestUser.user_id);
    filters.push(`ca.assigned_to = $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { page, pageSize, offset } = parseComplaintPagination(query);

  const [result, countResult] = await Promise.all([
    complaintsRepository.listComplaints({ whereClause, params, limit: pageSize, offset }),
    complaintsRepository.countComplaints({ whereClause, params }),
  ]);

  return {
    body: {
      status: 'ok',
      count: result.rowCount,
      total: countResult.rows[0]?.total ?? 0,
      page,
      pageSize,
      complaints: mapComplaintsForUser(result.rows, requestUser),
      timestamp: new Date().toISOString(),
    },
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

  const assignmentError = await assertResponderAssigned(complaint, requestUser);
  if (assignmentError) {
    return assignmentError;
  }

  const data =
    requestUser.role_name === 'responder'
      ? sanitizeComplaintForResponder(complaint)
      : complaint;

  return {
    body: { status: 'ok', data, timestamp: new Date().toISOString() },
  };
}

module.exports = {
  createComplaint,
  listComplaints,
  listMyComplaints,
  getComplaintById,
  deleteFailedComplaint,
  updateComplaintStatus: workflowService.updateComplaintStatus,
  assignComplaint: workflowService.assignComplaint,
  cancelComplaint: workflowService.cancelComplaint,
  updateComplaintPriority: workflowService.updateComplaintPriority,
  rejectComplaint: workflowService.rejectComplaint,
};
