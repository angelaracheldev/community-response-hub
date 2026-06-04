const router = require('express').Router();
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const categoriesRoutes = require('./categories.routes');
const complaintsRoutes = require('./complaints.routes');
const activityLogsRoutes = require('./activityLogs.routes');
const healthRoutes = require('./health.routes');
const dbRoutes = require('./db.routes');

router.use('/health', healthRoutes);
router.use('/db', dbRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/activity-logs', activityLogsRoutes);

module.exports = router;
