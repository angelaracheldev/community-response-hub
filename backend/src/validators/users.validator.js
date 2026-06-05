const { body } = require('express-validator');

const submitVerificationValidation = [
  body('verificationType').notEmpty().withMessage('verificationType is required'),
  body('address').notEmpty().withMessage('address is required'),
  body('documentUrl').optional(),
  (req, res, next) => {
    if (!req.file && !req.body.documentUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'documentUrl or file is required',
      });
    }
    next();
  },
];

const reviewVerificationValidation = [
  body('verificationStatus').isIn(['approved', 'rejected']).withMessage('verificationStatus must be approved or rejected'),
];

module.exports = {
  submitVerificationValidation,
  reviewVerificationValidation,
};
