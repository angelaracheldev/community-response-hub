const { body } = require('express-validator');

const registerValidation = [
  body('firstName').notEmpty().withMessage('firstName is required'),
  body('lastName').notEmpty().withMessage('lastName is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [body('refreshToken').notEmpty().withMessage('refreshToken is required')];

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
};
