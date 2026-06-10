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

const createUserValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone_number').optional({ nullable: true, checkFalsy: true }).isString().withMessage('Phone number must be a string'),
  body('address').optional({ nullable: true, checkFalsy: true }).isString().withMessage('Address must be a string'),
  body('role_id').isInt({ min: 1 }).withMessage('Valid role_id is required'),
  body('password')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

module.exports = {
  createUserValidation,
  submitVerificationValidation,
  reviewVerificationValidation,
};
