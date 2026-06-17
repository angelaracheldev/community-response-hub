const complaintsRepository = require('../../repositories/complaints.repository');

function sanitizeResponderComplaint(complaint) {
  return {
    ...complaint,
    // ensure assigned_by NEVER disappears
    assigned_by: complaint.assigned_by ?? null,
    assigned_by_name: complaint.assigned_by_name ?? null,
  };
}

async function getResponderComplaintById(id, user) {
  const result = await complaintsRepository.findComplaintByIdentifier(id);

  if (!result.rowCount) {
    return { error: { status: 404, body: { message: 'Not found' } } };
  }

  const complaint = result.rows[0];

  if (complaint.assigned_to !== user.user_id) {
    return { error: { status: 403, body: { message: 'Forbidden' } } };
  }

  return {
    body: {
      status: 'ok',
      data: sanitizeResponderComplaint(complaint),
    },
  };
}

const { updateComplaintStatusCore } = require('../complaints.service'); 
// (we will extract core later)

async function responderUpdateStatus(id, body, user) {
  return updateComplaintStatusCore(id, body, user);
}