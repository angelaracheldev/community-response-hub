const db = require('../config/database');

async function findByComplaintId(complaintId) {
  return db.query(
    `SELECT al.activity_log_id, al.complaint_id, al.performed_by, al.action_type, al.old_value, al.new_value, al.description, al.created_at,
            u.first_name, u.last_name, u.email
     FROM activity_logs al
     LEFT JOIN users u ON al.performed_by = u.user_id
     WHERE al.complaint_id = $1
     ORDER BY al.created_at ASC`,
    [complaintId]
  );
}

// async function insertLog({ complaintId, performedBy, actionType, description }) {
//   return db.query(
//     `INSERT INTO activity_logs (complaint_id, performed_by, action_type, description)
//      VALUES ($1, $2, $3, $4)`,
//     [complaintId, performedBy, actionType, description]
    
//   );
// }

async function insertLog({ complaintId, performedBy, actionType, oldValue = null, newValue = null, description }) {
  return db.query(
    `INSERT INTO activity_logs (complaint_id, performed_by, action_type, old_value, new_value, description)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [complaintId, performedBy, actionType, oldValue, newValue, description]
  );
}

async function insertLog({
  complaintId,
  performedBy,
  actionType,
  oldValue = null,
  newValue = null,
  description,
}) {
  return db.query(
    `INSERT INTO activity_logs
      (complaint_id, performed_by, action_type, old_value, new_value, description)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [complaintId, performedBy, actionType, oldValue, newValue, description]
  );
}

module.exports = {
  findByComplaintId,
  insertLog,
};

module.exports = {
  findByComplaintId,
  insertLog,
};
