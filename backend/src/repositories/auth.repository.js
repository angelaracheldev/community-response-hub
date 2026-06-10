const db = require('../config/database');

async function findUserIdByEmail(email) {
  return db.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);
}

async function findRoleIdByName(roleName) {
  return db.query('SELECT role_id FROM roles WHERE role_name = $1', [roleName]);
}

async function insertUser({ roleId, firstName, lastName, email, passwordHash, salt, phoneNumber, address }) {
  return db.query(
    `INSERT INTO users (role_id, first_name, last_name, email, password_hash, salt, phone_number, address, is_verified, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)
     RETURNING user_id, user_code, first_name, last_name, email, phone_number, address, role_id, is_verified, is_active, created_at`,
    [roleId, firstName, lastName, email.toLowerCase(), passwordHash, salt, phoneNumber || null, address || null]
  );
}

async function findUserWithRoleByEmail(email) {
  return db.query(
    `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.password_hash, u.phone_number, u.address, u.role_id, r.role_name, u.is_verified, u.is_active
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     WHERE u.email = $1`,
    [email.toLowerCase()]
  );
}

async function findUserWithRoleById(userId) {
  return db.query(
    `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.profile_image_url, u.role_id, r.role_name, u.is_verified, u.is_active
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = $1`,
    [userId]
  );
}

module.exports = {
  findUserIdByEmail,
  findRoleIdByName,
  insertUser,
  findUserWithRoleByEmail,
  findUserWithRoleById,
};
