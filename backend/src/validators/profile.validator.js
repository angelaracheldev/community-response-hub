// Filepath = backend/src/validators/profile.validator.js

const { body } = require('express-validator');

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

const verifyCurrentPasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')

    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters.')

    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    ),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')

    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

const requestEmailChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newEmail')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('A valid email address is required'),
];

const verifyEmailOtpValidation = [
  body('newEmail')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('A valid email address is required'),

  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')

    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

const resendEmailOtpValidation = [
  body('newEmail')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('A valid email address is required'),
];

module.exports = {
  verifyCurrentPasswordValidation,
  changePasswordValidation,
  requestEmailChangeValidation,
  verifyEmailOtpValidation,
  resendEmailOtpValidation,
};