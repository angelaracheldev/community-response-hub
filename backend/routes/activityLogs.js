const router = require('express').Router();
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/complaint/:complaintId', authMiddleware, async (req, res) => {
  try {
    const { complaintId } = req.params;

    const logs = await db.query(
      `SELECT al.activity_log_id, al.complaint_id, al.performed_by, al.action_type, al.old_value, al.new_value, al.description, al.created_at,
              u.first_name, u.last_name, u.email
       FROM activity_logs al
       LEFT JOIN users u ON al.performed_by = u.user_id
       WHERE al.complaint_id = $1
       ORDER BY al.created_at ASC`,
      [complaintId]
    );

    res.json({
      status: 'ok',
      count: logs.rowCount,
      logs: logs.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve activity logs',
      error: error.message,
    });
  }
});

module.exports = router;
