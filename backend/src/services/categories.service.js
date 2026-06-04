const categoriesRepository = require('../repositories/categories.repository');

async function listCategories() {
  const result = await categoriesRepository.findAll();
  return {
    body: {
      status: 'ok',
      count: result.rowCount,
      categories: result.rows,
      timestamp: new Date().toISOString(),
    },
  };
}

async function createCategory({ categoryName, description }) {
  const result = await categoriesRepository.insert({ categoryName, description });
  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'Category created successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

async function getCategoryById(id) {
  const result = await categoriesRepository.findById(id);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Category not found' } } };
  }
  return {
    body: { status: 'ok', data: result.rows[0], timestamp: new Date().toISOString() },
  };
}

async function updateCategory(id, body) {
  const fields = [];
  const values = [];
  if (body.categoryName !== undefined) {
    values.push(body.categoryName);
    fields.push(`category_name = $${values.length}`);
  }
  if (body.description !== undefined) {
    values.push(body.description);
    fields.push(`description = $${values.length}`);
  }
  if (!fields.length) {
    return { error: { status: 400, body: { status: 'error', message: 'No fields to update' } } };
  }

  values.push(id);
  const result = await categoriesRepository.update({ fields, values, id });
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Category not found' } } };
  }
  return {
    body: {
      status: 'ok',
      message: 'Category updated successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    },
  };
}

async function deleteCategory(id) {
  const result = await categoriesRepository.remove(id);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Category not found' } } };
  }
  return {
    body: { status: 'ok', message: 'Category deleted successfully', timestamp: new Date().toISOString() },
  };
}

module.exports = {
  listCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
