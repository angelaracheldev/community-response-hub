// Filepath = backend\src\routes\index.js
const router = require('express').Router();

function load(name, path) {
  const mod = require(path);
  console.log(`${name}:`, typeof mod, mod && mod.constructor && mod.constructor.name);
  return mod;
}

const healthRoutes = load('healthRoutes', './health.routes');
const dbRoutes = load('dbRoutes', './db.routes');
const authRoutes = load('authRoutes', './auth.routes');
const usersRoutes = load('usersRoutes', './users.routes');
const categoriesRoutes = load('categoriesRoutes', './categories.routes');
const complaintsRoutes = load('complaintsRoutes', './complaints.routes');
const activityLogsRoutes = load('activityLogsRoutes', './activityLogs.routes');
const notificationsRoutes = load('notificationsRoutes', './notifications.routes');
const adminRoutes = load('adminRoutes', './admin.routes');
const testEmailRoutes = load('testEmailRoutes', './testEmail');
const emailVerificationRoutes = load('emailVerificationRoutes', './emailVerification.routes');
const firstLoginRoutes = load('firstLoginRoutes', './firstLogin.routes');
const passwordResetRoutes = load('passwordResetRoutes', './passwordReset.routes');
const profileRoutes = require('./profile.routes');
const fs = require("fs");

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
router.use('/email-verification', emailVerificationRoutes);
router.use('/auth/first-login', firstLoginRoutes);
router.use('/auth/forgot-password', passwordResetRoutes);
router.use('/profile', profileRoutes);

module.exports = router;