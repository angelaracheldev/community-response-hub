// const router = require('express').Router();
// const { authMiddleware } = require('../middleware/auth');
// const activityLogsController = require('../controllers/activityLogs.controller');

// router.get('/complaint/:complaintId', authMiddleware, activityLogsController.getLogsByComplaintId);

// module.exports = router;

const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const activityLogsService = require('../services/activityLogs.service');

router.get('/complaint/:id', authMiddleware, async (req, res) => {
  try {
    const result = await activityLogsService.getLogsByComplaintId(req.params.id);
    return res.json(result.body);
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activity logs',
    });
  }
});

module.exports = router;