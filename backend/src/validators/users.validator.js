const { body } = require('express-validator');

const submitVerificationValidation = [
  body('verificationType').notEmpty().withMessage('verificationType is required'),
  body('address').notEmpty().withMessage('address is required'),
  body('documentUrl').optional(),
  (req, res, next) => {
    if (!req.file && !req.body.documentUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification document is required',
      });
    }

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: 'Unsupported file type. Upload JPG, JPEG, PNG, or PDF only.',
        });
      }

      const isPdf = req.file.mimetype === 'application/pdf';
      const maxSize = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(400).json({
          status: 'error',
          message: isPdf ? 'PDF must be 10 MB or smaller.' : 'Image must be 5 MB or smaller.',
        });
      }
    }

    next();
  },
];

const reviewVerificationValidation = [
  body('verificationStatus').isIn(['approved', 'rejected']).withMessage('verificationStatus must be approved or rejected'),
  body('remarks')
    .if(body('verificationStatus').equals('rejected'))
    .notEmpty()
    .withMessage('remarks are required when rejecting a verification')
    .bail()
    .isString()
    .withMessage('remarks must be a string'),
];

module.exports = {
  submitVerificationValidation,
  reviewVerificationValidation,
};
