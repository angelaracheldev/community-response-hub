const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const activityLogsController = require('../controllers/activityLogs.controller');

router.get('/complaint/:complaintId', authMiddleware, activityLogsController.getLogsByComplaintId);

module.exports = router;
