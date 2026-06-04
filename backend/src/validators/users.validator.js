const { body } = require('express-validator');

const submitVerificationValidation = [
  body('verificationType').notEmpty().withMessage('verificationType is required'),
  body('documentUrl').notEmpty().withMessage('documentUrl is required'),
];

const reviewVerificationValidation = [
  body('verificationStatus').isIn(['approved', 'rejected']).withMessage('verificationStatus must be approved or rejected'),
];

module.exports = {
  submitVerificationValidation,
  reviewVerificationValidation,
};
