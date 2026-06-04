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

module.exports = {
  deactivateAssignmentsForComplaint,
  insertAssignment,
};
