const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const authRepository = require('../repositories/auth.repository');
const { sanitizeAuthUser } = require('../utils/sanitizeUser');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

function signAccessToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh' }, jwtSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

async function register({ firstName, lastName, email, password, phoneNumber, address }) {
  const existing = await authRepository.findUserIdByEmail(email);
  if (existing.rowCount) {
    return { error: { status: 400, body: { status: 'error', message: 'Email already registered' } } };
  }

  const role = await authRepository.findRoleIdByName('resident');
  const roleId = role.rowCount ? role.rows[0].role_id : 1;
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await authRepository.insertUser({
    roleId,
    firstName,
    lastName,
    email,
    passwordHash,
    salt,
    phoneNumber,
    address,
  });

  const user = result.rows[0];
  const accessToken = signAccessToken(user.user_id);
  const refreshToken = signRefreshToken(user.user_id);

  return {
    status: 201,
    body: {
      success: true,
      message: 'Registration successful',
      data: {
        user: sanitizeAuthUser(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    },
  };
}

async function login({ email, password }) {
  const result = await authRepository.findUserWithRoleByEmail(email);
  if (!result.rowCount) {
    return { error: { status: 401, body: { status: 'error', message: 'Invalid credentials' } } };
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return { error: { status: 401, body: { status: 'error', message: 'Invalid credentials' } } };
  }
  if (!user.is_active) {
    return { error: { status: 403, body: { status: 'error', message: 'User account is inactive' } } };
  }

  const accessToken = signAccessToken(user.user_id);
  const refreshToken = signRefreshToken(user.user_id);

  return {
    body: {
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeAuthUser(user),
        tokens: { accessToken, refreshToken },
      },
    },
  };
}

function getMe(user) {
  return {
    body: { success: true, message: 'Current user retrieved successfully', data: user },
  };
}

function logout() {
  return {
    body: { success: true, message: 'Logout successful' },
  };
}

async function refreshToken(refreshTokenValue) {
  const payload = jwt.verify(refreshTokenValue, jwtSecret);
  if (!payload || payload.type !== 'refresh') {
    return { error: { status: 401, body: { status: 'error', message: 'Invalid refresh token' } } };
  }
  const accessToken = signAccessToken(payload.userId);
  return {
    body: { success: true, message: 'Token refreshed successfully', data: { accessToken } },
  };
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshToken,
};
