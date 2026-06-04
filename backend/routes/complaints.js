const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware, requireAnyRole } = require('../middleware/auth');

const STATUS_VALUES = ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'cancelled', 'rejected'];
const PRIORITY_VALUES = ['low', 'normal', 'high', 'urgent'];

router.post(
  '/',
  authMiddleware,
  [
    body('categoryId').isInt().withMessage('categoryId is required'),
    body('title').notEmpty().withMessage('title is required'),
    body('description').notEmpty().withMessage('description is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { categoryId, title, description, locationText, latitude, longitude, priorityLevel } = req.body;
      const category = await db.query('SELECT category_id FROM complaint_categories WHERE category_id = $1', [categoryId]);
      if (!category.rowCount) {
        return res.status(400).json({ status: 'error', message: 'Invalid category' });
      }

      const result = await db.query(
        `INSERT INTO complaints (reported_by, category_id, title, description, location_text, latitude, longitude, status, priority_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
         RETURNING complaint_id, reported_by, category_id, title, description, location_text, latitude, longitude, status, priority_level, remarks, created_at, updated_at`,
        [
          req.user.user_id,
          categoryId,
          title,
          description,
          locationText || null,
          latitude || null,
          longitude || null,
          PRIORITY_VALUES.includes((priorityLevel || '').toLowerCase()) ? priorityLevel.toLowerCase() : 'normal',
        ]
      );

      res.status(201).json({ status: 'ok', message: 'Complaint created successfully', data: result.rows[0], timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to create complaint:', error.message);
      res.status(500).json({ status: 'error', message: 'Unable to create complaint', error: error.message });
    }
  }
);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = [];
    const params = [];

    if (req.query.status) {
      const status = req.query.status.toLowerCase();
      if (STATUS_VALUES.includes(status)) {
        params.push(status);
        filters.push(`c.status = $${params.length}`);
      }
    }
    if (req.query.categoryId) {
      params.push(req.query.categoryId);
      filters.push(`c.category_id = $${params.length}`);
    }
    if (req.query.priorityLevel) {
      const priority = req.query.priorityLevel.toLowerCase();
      if (PRIORITY_VALUES.includes(priority)) {
        params.push(priority);
        filters.push(`c.priority_level = $${params.length}`);
      }
    }
    if (req.query.assignedToUserId) {
      params.push(req.query.assignedToUserId);
      filters.push(`ca.assigned_to = $${params.length}`);
    }

    if (req.user.role_name === 'resident') {
      params.push(req.user.user_id);
      filters.push(`c.reported_by = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `
      SELECT c.complaint_id, c.reported_by, c.category_id, cc.category_name, c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at,
             ca.assigned_to, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
      FROM complaints c
      LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
      LEFT JOIN complaint_assignments ca ON ca.complaint_id = c.complaint_id AND ca.is_active = TRUE
      LEFT JOIN users u ON u.user_id = ca.assigned_to
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT 100`;

    const result = await db.query(query, params);
    res.json({ status: 'ok', count: result.rowCount, complaints: result.rows, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to list complaints:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve complaints', error: error.message });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.complaint_id, c.reported_by, c.category_id, cc.category_name, c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at,
              ca.assigned_to, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
       FROM complaints c
       LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
       LEFT JOIN complaint_assignments ca ON ca.complaint_id = c.complaint_id AND ca.is_active = TRUE
       LEFT JOIN users u ON u.user_id = ca.assigned_to
       WHERE c.reported_by = $1
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );

    res.json({ status: 'ok', count: result.rowCount, complaints: result.rows, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to list user complaints:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve user complaints', error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT c.complaint_id, c.reported_by, c.category_id, cc.category_name, c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at,
              ca.assigned_to, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
       FROM complaints c
       LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
       LEFT JOIN complaint_assignments ca ON ca.complaint_id = c.complaint_id AND ca.is_active = TRUE
       LEFT JOIN users u ON u.user_id = ca.assigned_to
       WHERE c.complaint_id = $1`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ status: 'error', message: 'Complaint not found' });
    }

    const complaint = result.rows[0];
    if (req.user.role_name === 'resident' && complaint.reported_by !== req.user.user_id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    res.json({ status: 'ok', data: complaint, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to fetch complaint:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve complaint', error: error.message });
  }
});

router.patch(
  '/:id/status',
  authMiddleware,
  requireAnyRole(['admin', 'responder']),
  [body('complaintStatus').notEmpty().withMessage('complaintStatus is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const status = req.body.complaintStatus.toLowerCase();
      const remarks = req.body.remarks || null;
      if (!STATUS_VALUES.includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Invalid complaint status' });
      }

      const result = await db.query(
        `UPDATE complaints SET status = $1, remarks = COALESCE($2, remarks), updated_at = CURRENT_TIMESTAMP WHERE complaint_id = $3 RETURNING *`,
        [status, remarks, id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ status: 'error', message: 'Complaint not found' });
      }

      res.json({ status: 'ok', message: 'Complaint status updated successfully', data: result.rows[0], timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to update complaint status:', error.message);
      res.status(500).json({ status: 'error', message: 'Unable to update status', error: error.message });
    }
  }
);

router.patch(
  '/:id/assign',
  authMiddleware,
  requireAnyRole(['admin', 'responder']),
  [body('assignedToUserId').isUUID().withMessage('assignedToUserId must be a valid UUID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { assignedToUserId } = req.body;
      const complaint = await db.query('SELECT complaint_id FROM complaints WHERE complaint_id = $1', [id]);
      if (!complaint.rowCount) {
        return res.status(404).json({ status: 'error', message: 'Complaint not found' });
      }

      await db.query('UPDATE complaint_assignments SET is_active = FALSE WHERE complaint_id = $1', [id]);
      const assignment = await db.query(
        `INSERT INTO complaint_assignments (complaint_id, assigned_to, assigned_by, is_active)
         VALUES ($1, $2, $3, TRUE)
         RETURNING assignment_id, complaint_id, assigned_to, assigned_by, is_active, assigned_at`,
        [id, assignedToUserId, req.user.user_id]
      );
      await db.query('UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = $2', ['assigned', id]);

      res.json({ status: 'ok', message: 'Complaint assigned successfully', data: assignment.rows[0], timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to assign complaint:', error.message);
      res.status(500).json({ status: 'error', message: 'Unable to assign complaint', error: error.message });
    }
  }
);

module.exports = router;
