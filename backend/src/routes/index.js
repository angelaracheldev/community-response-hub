const router = require('express').Router();
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const categoriesRoutes = require('./categories.routes');
const complaintsRoutes = require('./complaints.routes');
const activityLogsRoutes = require('./activityLogs.routes');
const notificationsRoutes = require('./notifications.routes');
const healthRoutes = require('./health.routes');
const dbRoutes = require('./db.routes');
// const adminRoutes = require('./admin.routes'); // or correct file
// const adminRoutes = require('./admin');
const adminRoutes = require('./admin.routes');


router.use('/health', healthRoutes);
router.use('/db', dbRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/activity-logs', activityLogsRoutes);
router.use('/notifications', notificationsRoutes);
// router.use('/admin', adminRoutes);
router.use('/admin', adminRoutes);  // Add this line to include admin routes


module.exports = router;
