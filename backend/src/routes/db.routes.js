const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const dbController = require('../controllers/db.controller');

router.get('/', authMiddleware, requireRole('admin'), dbController.healthCheck);
router.get('/stats', authMiddleware, requireRole('admin'), dbController.getStats);

module.exports = router;
