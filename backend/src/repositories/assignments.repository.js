const db = require('../config/database');

async function deactivateAssignmentsForComplaint(complaintId) {
  return db.query('UPDATE complaint_assignments SET is_active = FALSE WHERE complaint_id = $1', [complaintId]);
}

async function insertAssignment({ complaintId, assignedToUserId, assignedByUserId }) {
  return db.query(
    `INSERT INTO complaint_assignments (complaint_id, assigned_to, assigned_by, is_active)
     VALUES ($1, $2, $3, TRUE)
     RETURNING assignment_id, complaint_id, assigned_to, assigned_by, is_active, assigned_at`,
    [complaintId, assignedToUserId, assignedByUserId]
  );
}

async function getActiveAssignmentForComplaint(complaintId) {
  return db.query(
    `SELECT assignment_id, complaint_id, assigned_to, assigned_by, is_active, assigned_at
     FROM complaint_assignments
     WHERE complaint_id = $1 AND is_active = TRUE
     ORDER BY assigned_at DESC
     LIMIT 1`,
    [complaintId]
  );
}

async function listByComplaintId(complaintId) {
  return db.query(
    `SELECT ca.assignment_id, ca.complaint_id, ca.assigned_to, ca.assigned_by,
            ca.is_active, ca.assigned_at,
            at.first_name AS assigned_to_first_name,
            at.last_name AS assigned_to_last_name,
            byu.first_name AS assigned_by_first_name,
            byu.last_name AS assigned_by_last_name
     FROM complaint_assignments ca
     LEFT JOIN users at ON at.user_id = ca.assigned_to
     LEFT JOIN users byu ON byu.user_id = ca.assigned_by
     WHERE ca.complaint_id = $1
     ORDER BY ca.assigned_at ASC`,
    [complaintId]
  );
}

module.exports = {
  deactivateAssignmentsForComplaint,
  insertAssignment,
  getActiveAssignmentForComplaint,
  listByComplaintId,
};
