const { body } = require('express-validator');

const createComplaintValidation = [
  body('categoryId').isInt().withMessage('categoryId is required'),
  body('title').notEmpty().withMessage('title is required'),
  body('description').notEmpty().withMessage('description is required'),
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
