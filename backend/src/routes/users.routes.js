const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const uploadVerification = require('../middleware/uploadVerification');
const usersController = require('../controllers/users.controller');
const {
  submitVerificationValidation,
  reviewVerificationValidation,
} = require('../validators/users.validator');

router.get('/', authMiddleware, requireRole('admin'), usersController.listUsers);
router.get('/:id', authMiddleware, usersController.getUserById);
router.patch('/:id', authMiddleware, usersController.updateUser);
router.post(
  '/me/verification',
  authMiddleware,
  uploadVerification.single('file'),
  submitVerificationValidation,
  usersController.submitVerification
);
router.patch(
  '/:id/verification/review',
  authMiddleware,
  requireRole('admin'),
  reviewVerificationValidation,
  usersController.reviewVerification
);
router.patch('/:id/activate', authMiddleware, requireRole('admin'), usersController.activateUser);
router.patch('/:id/deactivate', authMiddleware, requireRole('admin'), usersController.deactivateUser);

module.exports = router;
