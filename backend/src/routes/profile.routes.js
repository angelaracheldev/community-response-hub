// Filepath = backend/src/routes/profile.routes.js
const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth');


const profileController = require('../controllers/profile.controller');

const {
  verifyCurrentPasswordValidation,
  changePasswordValidation,
  requestEmailChangeValidation,
  verifyEmailOtpValidation,
} = require('../validators/profile.validator');

const { validationResult } = require('express-validator');

/**
 * Matches the validation handling style used throughout the project.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  next();
}

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.get(
  '/me',
  authMiddleware,
  profileController.getProfile
);



/*
|--------------------------------------------------------------------------
| Verify Current Password
|--------------------------------------------------------------------------
*/


router.post(
  '/verify-current-password',
  authMiddleware,
  verifyCurrentPasswordValidation,
  handleValidationErrors,
  profileController.verifyCurrentPassword
);

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

router.post(
  '/change-password',
  (req,res,next)=>{
        console.log("ROUTE /change-password");
        next();
    },
  authMiddleware,
  changePasswordValidation,
  handleValidationErrors,
  profileController.changePassword
);

/*
|--------------------------------------------------------------------------
| Request Email Change
|--------------------------------------------------------------------------
*/

router.post(
  '/request-email-change',
  authMiddleware,
  requestEmailChangeValidation,
  handleValidationErrors,
  profileController.requestEmailChange
);

/*
|--------------------------------------------------------------------------
| Resend Email OTP
|--------------------------------------------------------------------------
*/

router.post(
  '/resend-email-otp',
  authMiddleware,
  profileController.resendEmailOtp
);

/*
|--------------------------------------------------------------------------
| Verify Email OTP
|--------------------------------------------------------------------------
*/

router.post(
  '/verify-email-otp',
  authMiddleware,
  verifyEmailOtpValidation,
  handleValidationErrors,
  profileController.verifyEmailOtp
);

module.exports = router;