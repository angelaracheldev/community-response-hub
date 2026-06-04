const { validationResult } = require('express-validator');
const categoriesService = require('../services/categories.service');

async function listCategories(req, res) {
  try {
    const result = await categoriesService.listCategories();
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch categories:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve categories', error: error.message });
  }
}

async function createCategory(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { categoryName, description } = req.body;
    const result = await categoriesService.createCategory({ categoryName, description });
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Failed to create category:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to create category', error: error.message });
  }
}

async function getCategoryById(req, res) {
  try {
    const result = await categoriesService.getCategoryById(req.params.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch category:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve category', error: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const result = await categoriesService.updateCategory(req.params.id, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to update category:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to update category', error: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const result = await categoriesService.deleteCategory(req.params.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to delete category:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to delete category', error: error.message });
  }
}

module.exports = {
  listCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
