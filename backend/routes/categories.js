const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT category_id, category_name, description FROM complaint_categories ORDER BY category_name');
    res.json({ status: 'ok', count: result.rowCount, categories: result.rows, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to fetch categories:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve categories', error: error.message });
  }
});

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  [body('categoryName').notEmpty().withMessage('categoryName is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { categoryName, description } = req.body;
      const result = await db.query(
        'INSERT INTO complaint_categories (category_name, description) VALUES ($1, $2) RETURNING category_id, category_name, description',
        [categoryName, description || null]
      );
      res.status(201).json({ status: 'ok', message: 'Category created successfully', data: result.rows[0], timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to create category:', error.message);
      res.status(500).json({ status: 'error', message: 'Unable to create category', error: error.message });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT category_id, category_name, description FROM complaint_categories WHERE category_id = $1', [req.params.id]);
    if (!result.rowCount) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.json({ status: 'ok', data: result.rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to fetch category:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve category', error: error.message });
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const fields = [];
    const values = [];
    if (req.body.categoryName !== undefined) {
      values.push(req.body.categoryName);
      fields.push(`category_name = $${values.length}`);
    }
    if (req.body.description !== undefined) {
      values.push(req.body.description);
      fields.push(`description = $${values.length}`);
    }
    if (!fields.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await db.query(
      `UPDATE complaint_categories SET ${fields.join(', ')} WHERE category_id = $${values.length} RETURNING category_id, category_name, description`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    res.json({ status: 'ok', message: 'Category updated successfully', data: result.rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to update category:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to update category', error: error.message });
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query('DELETE FROM complaint_categories WHERE category_id = $1 RETURNING category_id', [req.params.id]);
    if (!result.rowCount) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.json({ status: 'ok', message: 'Category deleted successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to delete category:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to delete category', error: error.message });
  }
});

module.exports = router;
