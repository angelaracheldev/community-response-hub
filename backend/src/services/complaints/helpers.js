const RESPONDER_ALLOWED_STATUSES = ['in_progress', 'resolved'];

function sanitizeComplaintForResponder(complaint) {
  const { reported_by: _reportedBy, ...rest } = complaint;
  return rest;
}

async function assertResponderAssigned(complaint, requestUser) {
  if (requestUser.role_name !== 'responder') {
    return null;
  }

  if (complaint.assigned_to !== requestUser.user_id) {
    return {
      error: {
        status: 403,
        body: { status: 'error', message: 'Forbidden' },
      },
    };
  }

  return null;
}

function mapComplaintsForUser(complaints, requestUser) {
  if (requestUser.role_name !== 'responder') {
    return complaints;
  }
  return complaints.map(sanitizeComplaintForResponder);
}

module.exports = {
  RESPONDER_ALLOWED_STATUSES,
  sanitizeComplaintForResponder,
  assertResponderAssigned,
  mapComplaintsForUser,
};
