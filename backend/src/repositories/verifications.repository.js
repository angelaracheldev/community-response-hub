const db = require('../config/database');

async function findVerificationByUserId(userId) {
  return db.query('SELECT verification_id FROM resident_verifications WHERE user_id = $1', [userId]);
}

async function updateVerification({ verificationType, documentUrl, address, userId }) {
  return db.query(
    `UPDATE resident_verifications SET verification_type = $1, document_url = $2, address = $3, status = 'pending', reviewed_by = NULL, reviewed_at = NULL, submitted_at = CURRENT_TIMESTAMP WHERE user_id = $4`,
    [verificationType, documentUrl, address, userId]
  );
}

async function insertVerification({ userId, verificationType, documentUrl, address }) {
  return db.query(
    `INSERT INTO resident_verifications (user_id, verification_type, document_url, address, status) VALUES ($1, $2, $3, $4, 'pending')`,
    [userId, verificationType, documentUrl, address]
  );
}

async function reviewVerification({ verificationStatus, reviewedBy, userId }) {
  return db.query(
    `UPDATE resident_verifications SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = $3`,
    [verificationStatus, reviewedBy, userId]
  );
}

async function setUserVerified(userId) {
  return db.query('UPDATE users SET is_verified = TRUE WHERE user_id = $1', [userId]);
}

module.exports = {
  findVerificationByUserId,
  updateVerification,
  insertVerification,
  reviewVerification,
  setUserVerified,
};
