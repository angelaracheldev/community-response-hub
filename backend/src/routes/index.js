const router = require('express').Router();
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const categoriesRoutes = require('./categories.routes');
const complaintsRoutes = require('./complaints.routes');
const activityLogsRoutes = require('./activityLogs.routes');
const notificationsRoutes = require('./notifications.routes');
const healthRoutes = require('./health.routes');
const dbRoutes = require('./db.routes');
const adminRoutes = require('./admin.routes');
const testEmailRoutes = require('./testEmail');
const emailVerificationRoutes = require('./emailVerification.routes');
const firstLoginRoutes = require('./firstLogin.routes');





router.use('/health', healthRoutes);
router.use('/db', dbRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/activity-logs', activityLogsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/', testEmailRoutes);
router.use('/email-verification',emailVerificationRoutes);
router.use('/auth/first-login', firstLoginRoutes);

module.exports = router;
