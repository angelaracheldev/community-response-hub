const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const categoriesController = require('../controllers/categories.controller');
const { createCategoryValidation } = require('../validators/categories.validator');

router.get('/', categoriesController.listCategories);
router.post('/', authMiddleware, requireRole('admin'), createCategoryValidation, categoriesController.createCategory);
router.get('/:id', categoriesController.getCategoryById);
router.patch('/:id', authMiddleware, requireRole('admin'), categoriesController.updateCategory);
router.delete('/:id', authMiddleware, requireRole('admin'), categoriesController.deleteCategory);

module.exports = router;
