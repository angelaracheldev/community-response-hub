const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_dev';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function signAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function sanitize(user) {
  const { password_hash, salt, ...safe } = user;
  return safe;
}

router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('firstName is required'),
    body('lastName').notEmpty().withMessage('lastName is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { firstName, lastName, email, password, phoneNumber, address } = req.body;
      const existing = await db.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rowCount) {
        return res.status(400).json({ status: 'error', message: 'Email already registered' });
      }

      const role = await db.query('SELECT role_id FROM roles WHERE role_name = $1', ['resident']);
      const roleId = role.rowCount ? role.rows[0].role_id : 1;
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await db.query(
        `INSERT INTO users (role_id, first_name, last_name, email, password_hash, salt, phone_number, address, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)
         RETURNING user_id, user_code, first_name, last_name, email, phone_number, address, role_id, is_verified, is_active, created_at`,
        [roleId, firstName, lastName, email.toLowerCase(), passwordHash, salt, phoneNumber || null, address || null]
      );

      const user = result.rows[0];
      const accessToken = signAccessToken(user.user_id);
      const refreshToken = signRefreshToken(user.user_id);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: sanitize(user),
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error('Register failed:', error.message);
      res.status(500).json({ status: 'error', message: 'Unable to register user', error: error.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const result = await db.query(
        `SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.password_hash, u.phone_number, u.address, u.role_id, r.role_name, u.is_verified, u.is_active
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.role_id
         WHERE u.email = $1`,
        [email.toLowerCase()]
      );
      if (!result.rowCount) {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }
      if (!user.is_active) {
        return res.status(403).json({ status: 'error', message: 'User account is inactive' });
      }

      const accessToken = signAccessToken(user.user_id);
      const refreshToken = signRefreshToken(user.user_id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: sanitize(user),
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error) {
      console.error('Login failed:', error.message);
      res.status(500).json({ status: 'error', message: 'Unable to login', error: error.message });
    }
  }
);

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Current user retrieved successfully', data: req.user });
});

router.post('/logout', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('refreshToken is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { refreshToken } = req.body;
      const payload = jwt.verify(refreshToken, JWT_SECRET);
      if (!payload || payload.type !== 'refresh') {
        return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
      }
      const accessToken = signAccessToken(payload.userId);
      res.json({ success: true, message: 'Token refreshed successfully', data: { accessToken } });
    } catch (error) {
      console.error('Refresh token failed:', error.message);
      res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token', error: error.message });
    }
  }
);

module.exports = router;
