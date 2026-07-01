// Filepath = backend\src\controllers\users.controller.js
const { handleService } = require('../utils/controllerHelpers');
const usersService = require('../services/users.service');
const verificationMediaService = require('../services/verificationMedia.service');

const createUser = handleService(
  (req) =>
    usersService.createUser(req.body, {
      file: req.file,
      reviewedBy: req.user.user_id,
    }),
  { validate: true, logLabel: 'Failed to create user', fallbackMessage: 'Unable to create user', defaultStatus: 201 }
);

const listUsers = handleService(
  (req) => usersService.listUsers(req.query),
  { logLabel: 'Failed to fetch users', fallbackMessage: 'Unable to retrieve users' }
);

const getUserById = handleService(
  (req) => usersService.getUserById(req.params.id, req.user),
  { logLabel: 'Failed to fetch user by id', fallbackMessage: 'Unable to retrieve user' }
);

const getCurrentUser = handleService(
  (req) => usersService.getUserById(req.user.user_id, req.user),
  { logLabel: 'Failed to fetch current user', fallbackMessage: 'Unable to retrieve current user' }
);

const updateUser = handleService(
  (req) => usersService.updateUser(req.params.id, req.user, req.body),
  { logLabel: 'Failed to update user', fallbackMessage: 'Unable to update user' }
);

const submitVerification = handleService(
  async (req) => {
    const { verificationType, address } = req.body;
    let documentUrl = req.body.documentUrl;
    if (req.file) {
      documentUrl = await verificationMediaService.uploadVerificationDocument(req.file);
    }
    return usersService.submitVerification(req.user, {
      verificationType,
      documentUrl,
      address,
    });
  },
  { validate: true, logLabel: 'Failed to submit verification', fallbackMessage: 'Unable to submit verification' }
);

const reviewVerification = handleService(
  (req) =>
    usersService.reviewVerification(
      req.params.id,
      req.user.user_id,
      req.body.verificationStatus,
      req.body.remarks
    ),
  { validate: true, logLabel: 'Failed to review verification', fallbackMessage: 'Unable to review verification' }
);

const activateUser = handleService(
  (req) => usersService.activateUser(req.params.id),
  { logLabel: 'Failed to activate user', fallbackMessage: 'Unable to activate user' }
);

const deactivateUser = handleService(
  (req) => usersService.deactivateUser(req.params.id),
  { logLabel: 'Failed to deactivate user', fallbackMessage: 'Unable to deactivate user' }
);

const getResponders = handleService(
  () => usersService.getResponders(),
  { logLabel: 'Failed to fetch responders', fallbackMessage: 'Failed to fetch responders' }
);

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
  getResponders,
};
