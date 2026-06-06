const router = require('express').Router();
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /complaints/:complaintId/details
router.get('/complaints/:complaintId/details', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Complaint + Category
    const complaintResult = await db.query(
      `SELECT c.complaint_id, c.reference_id, c.reported_by, c.category_id, cc.category_name, cc.description AS category_description,
              c.title, c.description, c.location_text, c.latitude, c.longitude, c.status, c.priority_level, c.remarks, c.created_at, c.updated_at
       FROM complaints c
       LEFT JOIN complaint_categories cc ON cc.category_id = c.category_id
       WHERE c.complaint_id = $1`,
      [complaintId]
    );

    if (!complaintResult.rowCount) {
      return res.status(404).json({ status: 'error', message: 'Complaint not found' });
    }

    const complaint = complaintResult.rows[0];

    // Assignments (history)
    const assignmentsResult = await db.query(
      `SELECT ca.assignment_id, ca.complaint_id, ca.assigned_to, ca.assigned_by, ca.is_active, ca.assigned_at,
              at.first_name AS assigned_to_first_name, at.last_name AS assigned_to_last_name,
              byu.first_name AS assigned_by_first_name, byu.last_name AS assigned_by_last_name
       FROM complaint_assignments ca
       LEFT JOIN users at ON at.user_id = ca.assigned_to
       LEFT JOIN users byu ON byu.user_id = ca.assigned_by
       WHERE ca.complaint_id = $1
       ORDER BY ca.assigned_at ASC`,
      [complaintId]
    );

    // Media
    const mediaResult = await db.query(
      `SELECT media_id, complaint_id, uploaded_by, media_url, media_type, uploaded_at
       FROM complaint_media
       WHERE complaint_id = $1
       ORDER BY uploaded_at ASC`,
      [complaintId]
    );

    // Activity logs
    const logsResult = await db.query(
      `SELECT al.activity_log_id, al.complaint_id, al.performed_by, al.action_type, al.old_value, al.new_value, al.description, al.created_at,
              u.first_name AS performed_by_first_name, u.last_name AS performed_by_last_name
       FROM activity_logs al
       LEFT JOIN users u ON u.user_id = al.performed_by
       WHERE al.complaint_id = $1
       ORDER BY al.created_at ASC`,
      [complaintId]
    );

    res.json({
      status: 'ok',
      complaint,
      category: {
        category_name: complaint.category_name,
        description: complaint.category_description,
      },
      assignments: assignmentsResult.rows,
      media: mediaResult.rows,
      activityLogs: logsResult.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch complaint details (admin):', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to retrieve complaint details', error: error.message });
  }
});

module.exports = router;
