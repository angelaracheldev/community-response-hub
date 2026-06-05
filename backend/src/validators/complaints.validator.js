const { body } = require('express-validator');

const createComplaintValidation = [
  body('categoryId').isInt().withMessage('Category is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Headline is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Headline must be between 5 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('locationText')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
];

const updateStatusValidation = [body('complaintStatus').notEmpty().withMessage('complaintStatus is required')];

const assignComplaintValidation = [
  body('assignedToUserId').isUUID().withMessage('assignedToUserId must be a valid UUID'),
];

module.exports = {
  createComplaintValidation,
  updateStatusValidation,
  assignComplaintValidation,
};
