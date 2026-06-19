const { handleService } = require('../utils/controllerHelpers');
const categoriesService = require('../services/categories.service');

const listCategories = handleService(
  () => categoriesService.listCategories(),
  { logLabel: 'Failed to fetch categories', fallbackMessage: 'Unable to retrieve categories' }
);

const createCategory = handleService(
  (req) => categoriesService.createCategory(req.body),
  { validate: true, logLabel: 'Failed to create category', fallbackMessage: 'Unable to create category', defaultStatus: 201 }
);

const getCategoryById = handleService(
  (req) => categoriesService.getCategoryById(req.params.id),
  { logLabel: 'Failed to fetch category', fallbackMessage: 'Unable to retrieve category' }
);

const updateCategory = handleService(
  (req) => categoriesService.updateCategory(req.params.id, req.body),
  { logLabel: 'Failed to update category', fallbackMessage: 'Unable to update category' }
);

const deleteCategory = handleService(
  (req) => categoriesService.deleteCategory(req.params.id),
  { logLabel: 'Failed to delete category', fallbackMessage: 'Unable to delete category' }
);

module.exports = {
  listCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
