const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const filters = [];
    const params = [];

    if (req.query.roleId) {
      params.push(req.query.roleId);
      filters.push(`u.role_id = $${params.length}`);
    }
    if (req.query.isActive) {
      params.push(req.query.isActive === 'true');
      filters.push(`u.is_active = $${params.length}`);
    }
    if (req.query.verificationStatus) {
      params.push(req.query.verificationStatus.toLowerCase());
      filters.push(`COALESCE(rv.status, 'pending') = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.role_id, r.role_name, u.is_verified, u.is_active, COALESCE(rv.status, 'not_submitted') AS verification_status, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN resident_verifications rv ON u.user_id = rv.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT 100`,
      params
    );

    res.json({
      status: 'ok',
      count: result.rowCount,
      users: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch users:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve users',
      error: error.message,
    });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userQuery = `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.role_id, r.role_name, u.is_verified, u.is_active, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1`;
    const result = await db.query(userQuery, [id]);

    if (!result.rowCount) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (req.user.role_name !== 'admin' && req.user.user_id !== id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    res.json({ status: 'ok', user: result.rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to fetch user by id:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve user', error: error.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role_name !== 'admin' && req.user.user_id !== id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const updates = [];
    const params = [];
    const fields = ['first_name', 'last_name', 'phone_number', 'address', 'profile_image_url'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    params.push(id);
    const updateQuery = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${params.length} RETURNING user_id, user_code, first_name, last_name, email, phone_number, address, profile_image_url, role_id, is_verified, is_active, created_at, updated_at`;
    const result = await db.query(updateQuery, params);

    res.json({ status: 'ok', user: result.rows[0], message: 'User updated successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to update user:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to update user', error: error.message });
  }
});

router.post('/me/verification', authMiddleware, [
  body('verificationType').notEmpty().withMessage('verificationType is required'),
  body('documentUrl').notEmpty().withMessage('documentUrl is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { verificationType, documentUrl, address } = req.body;
    const existing = await db.query('SELECT verification_id FROM resident_verifications WHERE user_id = $1', [req.user.user_id]);
    if (existing.rowCount) {
      await db.query(
        `UPDATE resident_verifications SET verification_type = $1, document_url = $2, address = $3, status = 'pending', reviewed_by = NULL, reviewed_at = NULL, submitted_at = CURRENT_TIMESTAMP WHERE user_id = $4`,
        [verificationType, documentUrl, address || req.user.address, req.user.user_id]
      );
    } else {
      await db.query(
        `INSERT INTO resident_verifications (user_id, verification_type, document_url, address, status) VALUES ($1, $2, $3, $4, 'pending')`,
        [req.user.user_id, verificationType, documentUrl, address || req.user.address]
      );
    }

    res.json({ status: 'ok', message: 'Verification submitted successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to submit verification:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to submit verification', error: error.message });
  }
});

router.patch('/:id/verification/review', authMiddleware, requireRole('admin'), [
  body('verificationStatus').isIn(['approved', 'rejected']).withMessage('verificationStatus must be approved or rejected'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;
    const user = await db.query('SELECT user_id FROM users WHERE user_id = $1', [id]);
    if (!user.rowCount) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const verification = await db.query('SELECT verification_id FROM resident_verifications WHERE user_id = $1', [id]);
    if (!verification.rowCount) {
      return res.status(404).json({ status: 'error', message: 'No verification request found' });
    }

    await db.query(
      `UPDATE resident_verifications SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = $3`,
      [verificationStatus, req.user.user_id, id]
    );

    if (verificationStatus === 'approved') {
      await db.query('UPDATE users SET is_verified = TRUE WHERE user_id = $1', [id]);
    }

    res.json({ status: 'ok', message: 'Verification reviewed successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to review verification:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to review verification', error: error.message });
  }
});

router.patch('/:id/activate', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET is_active = TRUE WHERE user_id = $1', [id]);
    res.json({ status: 'ok', message: 'User activated successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to activate user:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to activate user', error: error.message });
  }
});

router.patch('/:id/deactivate', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET is_active = FALSE WHERE user_id = $1', [id]);
    res.json({ status: 'ok', message: 'User deactivated successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to deactivate user:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to deactivate user', error: error.message });
  }
});

module.exports = router;
