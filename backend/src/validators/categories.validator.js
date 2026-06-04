const { body } = require('express-validator');

const createCategoryValidation = [body('categoryName').notEmpty().withMessage('categoryName is required')];

module.exports = {
  createCategoryValidation,
};
