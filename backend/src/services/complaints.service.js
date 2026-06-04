const { STATUS_VALUES } = require('../constants/complaintStatus');
const { PRIORITY_VALUES } = require('../constants/complaintPriority');
const complaintsRepository = require('../repositories/complaints.repository');
const assignmentsRepository = require('../repositories/assignments.repository');

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

  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'Complaint created successfully',
      data: result.rows[0],
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
  const result = await complaintsRepository.findComplaintById(id);
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

  const result = await complaintsRepository.updateComplaintStatus({ status, remarks: remarks || null, id });
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  return {
    body: {
      status: 'ok',
      message: 'Complaint status updated successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

async function assignComplaint(id, { assignedToUserId, assignedByUserId }) {
  const complaint = await complaintsRepository.findComplaintIdOnly(id);
  if (!complaint.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }

  await assignmentsRepository.deactivateAssignmentsForComplaint(id);
  const assignment = await assignmentsRepository.insertAssignment({
    complaintId: id,
    assignedToUserId,
    assignedByUserId,
  });
  await complaintsRepository.setComplaintStatusAssigned(id);

  return {
    body: {
      status: 'ok',
      message: 'Complaint assigned successfully',
      data: assignment.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  createComplaint,
  listComplaints,
  listMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
};
