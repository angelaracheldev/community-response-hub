const db = require('../config/database');

async function insertMedia({ complaintId, uploadedBy, mediaUrl, mediaType }) {
  return db.query(
    `INSERT INTO complaint_media (complaint_id, uploaded_by, media_url, media_type)
     VALUES ($1, $2, $3, $4)
     RETURNING media_id, complaint_id, uploaded_by, media_url, media_type, uploaded_at`,
    [complaintId, uploadedBy, mediaUrl, mediaType]
  );
}

async function listByComplaintId(complaintId) {
  return db.query(
    `SELECT media_id, complaint_id, uploaded_by, media_url, media_type, uploaded_at
     FROM complaint_media
     WHERE complaint_id = $1
     ORDER BY uploaded_at ASC`,
    [complaintId]
  );
}

async function findById(mediaId, complaintId) {
  return db.query(
    `SELECT media_id, complaint_id, uploaded_by, media_url, media_type, uploaded_at
     FROM complaint_media
     WHERE media_id = $1 AND complaint_id = $2`,
    [mediaId, complaintId]
  );
}

async function deleteById(mediaId, complaintId) {
  return db.query(
    `DELETE FROM complaint_media
     WHERE media_id = $1 AND complaint_id = $2
     RETURNING media_id, media_url`,
    [mediaId, complaintId]
  );
}

module.exports = { insertMedia, listByComplaintId, findById, deleteById };