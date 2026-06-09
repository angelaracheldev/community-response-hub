const { validationResult } = require('express-validator');
const usersService = require('../services/users.service');
const verificationMediaService = require('../services/verificationMedia.service');

async function createUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const result = await usersService.createUser(req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Failed to create user:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to create user', error: error.message });
  }
}

async function listUsers(req, res) {
  try {
    const result = await usersService.listUsers(req.query);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch users:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve users',
      error: error.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    const result = await usersService.getUserById(req.params.id, req.user);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch user by id:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve user', error: error.message });
  }
}

async function getCurrentUser(req, res) {
  try {
    const result = await usersService.getUserById(req.user.user_id, req.user);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch current user:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve current user', error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const result = await usersService.updateUser(req.params.id, req.user, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to update user:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to update user', error: error.message });
  }
}

async function submitVerification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { verificationType, address } = req.body;
    let documentUrl = req.body.documentUrl;
    if (req.file) {
      documentUrl = await verificationMediaService.uploadVerificationDocument(req.file);
    }
    const result = await usersService.submitVerification(req.user, {
      verificationType,
      documentUrl,
      address,
    });
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to submit verification:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to submit verification', error: error.message });
  }
}

async function reviewVerification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { verificationStatus, remarks } = req.body;
    const result = await usersService.reviewVerification(req.params.id, req.user.user_id, verificationStatus, remarks);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to review verification:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to review verification', error: error.message });
  }
}

async function activateUser(req, res) {
  try {
    const result = await usersService.activateUser(req.params.id);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to activate user:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to activate user', error: error.message });
  }
}

async function deactivateUser(req, res) {
  try {
    const result = await usersService.deactivateUser(req.params.id);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to deactivate user:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to deactivate user', error: error.message });
  }
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  submitVerification,
  reviewVerification,
  activateUser,
  deactivateUser,
};
