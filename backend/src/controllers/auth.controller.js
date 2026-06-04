const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password, phoneNumber, address } = req.body;
    const result = await authService.register({ firstName, lastName, email, password, phoneNumber, address });
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Register failed:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to register user', error: error.message });
  }
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to login', error: error.message });
  }
}

function getMe(req, res) {
  const result = authService.getMe(req.user);
  return res.json(result.body);
}

function logout(req, res) {
  const result = authService.logout();
  return res.json(result.body);
}

async function refreshToken(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { refreshToken: refreshTokenValue } = req.body;
    const result = await authService.refreshToken(refreshTokenValue);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Refresh token failed:', error.message);
    return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token', error: error.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshToken,
};
