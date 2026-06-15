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

module.exports = {
  deactivateAssignmentsForComplaint,
  insertAssignment,
  getActiveAssignmentForComplaint,
};
