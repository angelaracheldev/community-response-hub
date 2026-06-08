const db = require('../config/database');

async function listUsers({ filters, params }) {
  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return db.query(
    `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.role_id, r.role_name, u.is_verified, u.is_active, COALESCE(rv.status, 'not_submitted') AS verification_status, rv.remarks AS verification_remarks, rv.verification_type, rv.document_url, u.created_at
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     LEFT JOIN resident_verifications rv ON u.user_id = rv.user_id
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT 100`,
    params
  );
}

async function findUserById(id) {
  return db.query(
    `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.profile_image_url, u.role_id, r.role_name, u.is_verified, u.is_active, COALESCE(rv.status, 'not_submitted') AS verification_status, rv.remarks AS verification_remarks, rv.verification_type, rv.document_url, rv.address AS verification_address, rv.submitted_at, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN resident_verifications rv ON u.user_id = rv.user_id
      WHERE u.user_id = $1`,
    [id]
  );
}

async function updateUser({ updates, params, id }) {
  const updateQuery = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${params.length} RETURNING user_id, user_code, first_name, last_name, email, phone_number, address, profile_image_url, role_id, is_verified, is_active, created_at, updated_at`;
  return db.query(updateQuery, params);
}

async function setUserActive(id, isActive) {
  return db.query('UPDATE users SET is_active = $1 WHERE user_id = $2', [isActive, id]);
}

async function findUserIdOnly(id) {
  return db.query('SELECT user_id FROM users WHERE user_id = $1', [id]);
}

async function insertUser({
  roleId,
  firstName,
  lastName,
  email,
  passwordHash,
  salt,
  phoneNumber,
  address,
  isVerified = false,
  isActive = true,
}) {
  return db.query(
    `INSERT INTO users (role_id, first_name, last_name, email, password_hash, salt, phone_number, address, is_verified, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING user_id, user_code, first_name, last_name, email, phone_number, address, role_id, is_verified, is_active, created_at`,
    [roleId, firstName, lastName, email.toLowerCase(), passwordHash, salt, phoneNumber, address, isVerified, isActive]
  );
}

async function findActiveUsersByRoleName(roleName) {
  return db.query(
    `SELECT u.user_id
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE r.role_name = $1 AND u.is_active = TRUE`,
    [roleName]
  );
}

module.exports = {
  listUsers,
  findUserById,
  updateUser,
  setUserActive,
  findUserIdOnly,
  findActiveUsersByRoleName,
  insertUser,
};
