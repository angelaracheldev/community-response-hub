const db = require('../config/database');

async function findAll() {
  return db.query('SELECT category_id, category_name, description FROM complaint_categories ORDER BY category_name');
}

async function findById(id) {
  return db.query('SELECT category_id, category_name, description FROM complaint_categories WHERE category_id = $1', [id]);
}

async function insert({ categoryName, description }) {
  return db.query(
    'INSERT INTO complaint_categories (category_name, description) VALUES ($1, $2) RETURNING category_id, category_name, description',
    [categoryName, description || null]
  );
}

async function update({ fields, values, id }) {
  return db.query(
    `UPDATE complaint_categories SET ${fields.join(', ')} WHERE category_id = $${values.length} RETURNING category_id, category_name, description`,
    values
  );
}

async function remove(id) {
  return db.query('DELETE FROM complaint_categories WHERE category_id = $1 RETURNING category_id', [id]);
}

module.exports = {
  findAll,
  findById,
  insert,
  update,
  remove,
};
