const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, requireRole('admin'), adminController.getDashboard);
router.get(
  '/complaints/:complaintId/details',
  authMiddleware,
  requireRole('admin'),
  adminController.getComplaintDetails
);

module.exports = router;
