// Filepath = backend\src\routes\firstLogin.routes.js
const router = require('express').Router();

const { authMiddleware } = require('../middleware/auth');

const firstLoginController = require('../controllers/firstLogin.controller');

const {
  verifyOtpValidation,
  changePasswordValidation,
} = require('../validators/firstLogin.validator');

router.get(
  '/status',
  authMiddleware,
  firstLoginController.getStatus
);

router.post(
  '/verify-otp',
  authMiddleware,
  verifyOtpValidation,
  firstLoginController.verifyOTP
);

router.post(
  '/change-password',
  authMiddleware,
  changePasswordValidation,
  firstLoginController.changePassword
);

router.post(
  '/resend-otp',
  authMiddleware,
  firstLoginController.resendOTP
);

module.exports = router;


