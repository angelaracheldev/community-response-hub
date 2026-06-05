const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { jwtSecret } = require('../config');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Authorization token required' });
  }

  const token = header.replace('Bearer ', '').trim();
  try {
    const payload = jwt.verify(token, jwtSecret);
    if (!payload || !payload.userId) {
      return res.status(401).json({ status: 'error', message: 'Invalid token payload' });
    }

    const result = await db.query(
      `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.profile_image_url, u.role_id, r.role_name, u.is_verified, u.is_active
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [payload.userId]
    );

    if (!result.rowCount) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ status: 'error', message: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token', error: error.message });
  }
}

function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }
    if (req.user.role_name !== roleName) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    next();
  };
}

function requireAnyRole(roleNames) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }
    if (!roleNames.includes(req.user.role_name)) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    next();
  };
}

function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }
  if (!req.user.is_verified) {
    return res.status(403).json({ status: 'error', message: 'Verified residency required to submit complaints' });
  }
  next();
}

module.exports = {
  authMiddleware,
  requireRole,
  requireAnyRole,
  requireVerified,
};
