// Filepath = backend\src\validators\firstLogin.validator.js
const { body } = require('express-validator');

const verifyOtpValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
];

const changePasswordValidation = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

module.exports = {
  verifyOtpValidation,
  changePasswordValidation,
};