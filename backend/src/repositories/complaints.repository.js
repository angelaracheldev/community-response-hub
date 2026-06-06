const db = require('../config/database');

async function findCategoryById(categoryId) {
  return db.query('SELECT category_id FROM complaint_categories WHERE category_id = $1', [categoryId]);
}

async function insertComplaint({
  reportedBy,
  categoryId,
  title,
  description,
  locationText,
  latitude,
  longitude,
  priorityLevel,
}) {
  return db.query(
    `INSERT INTO complaints (reported_by, category_id, title, description, location_text, latitude, longitude, status, priority_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
     RETURNING complaint_id, reference_id, reported_by, category_id, title, description, location_text, latitude, longitude, status, priority_level, remarks, created_at, updated_at`,
    [reportedBy, categoryId, title, description, locationText || null, latitude || null, longitude || null, priorityLevel]
  );
}

async function listComplaints({ whereClause, params }) {
  const query = `
      SELECT c.complaint_id, c.reference_id, c.reported_by, c.category_id, cc.category_name, c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at,
             ca.assigned_to, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
      FROM complaints c
      LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
      LEFT JOIN complaint_assignments ca ON ca.complaint_id = c.complaint_id AND ca.is_active = TRUE
      LEFT JOIN users u ON u.user_id = ca.assigned_to
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT 100`;
  return db.query(query, params);
}

async function listComplaintsByReporter(userId) {
  return db.query(
    `SELECT c.complaint_id, c.reference_id, c.reported_by, c.category_id, cc.category_name, c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at,
            ca.assigned_to, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
     FROM complaints c
     LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
     LEFT JOIN complaint_assignments ca ON ca.complaint_id = c.complaint_id AND ca.is_active = TRUE
     LEFT JOIN users u ON u.user_id = ca.assigned_to
     WHERE c.reported_by = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );
}

async function findComplaintById(id) {
  return db.query(
    `SELECT c.complaint_id, c.reference_id, c.reported_by, c.category_id, cc.category_name, c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at,
            ca.assigned_to, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
     FROM complaints c
     LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
     LEFT JOIN complaint_assignments ca ON ca.complaint_id = c.complaint_id AND ca.is_active = TRUE
     LEFT JOIN users u ON u.user_id = ca.assigned_to
     WHERE c.complaint_id = $1`,
    [id]
  );
}

async function updateComplaintStatus({ status, remarks, id }) {
  return db.query(
    `UPDATE complaints SET status = $1, remarks = COALESCE($2, remarks), updated_at = CURRENT_TIMESTAMP WHERE complaint_id = $3 RETURNING *`,
    [status, remarks, id]
  );
}

async function findComplaintIdOnly(id) {
  return db.query('SELECT complaint_id FROM complaints WHERE complaint_id = $1', [id]);
}

async function setComplaintStatusAssigned(id) {
  return db.query('UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = $2', ['assigned', id]);
}

async function deleteComplaintById(id) {
  return db.query('DELETE FROM complaints WHERE complaint_id = $1 RETURNING complaint_id', [id]);
}

module.exports = {
  findCategoryById,
  insertComplaint,
  listComplaints,
  listComplaintsByReporter,
  findComplaintById,
  updateComplaintStatus,
  findComplaintIdOnly,
  setComplaintStatusAssigned,
  deleteComplaintById,
};
