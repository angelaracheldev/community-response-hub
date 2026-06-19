const router = require('express').Router();
const { authMiddleware, requireAnyRole, requireVerified } = require('../middleware/auth');
const { writeRateLimiter } = require('../middleware/rateLimit');
const complaintsController = require('../controllers/complaints.controller');
const {
  createComplaintValidation,
  updateStatusValidation,
  assignComplaintValidation,
  cancelComplaintValidation,
} = require('../validators/complaints.validator');

router.post('/', authMiddleware, requireVerified, writeRateLimiter, createComplaintValidation, complaintsController.createComplaint);
router.get('/', authMiddleware, complaintsController.listComplaints);
router.get('/my', authMiddleware, complaintsController.listMyComplaints);
router.get('/:id', authMiddleware, complaintsController.getComplaintById);
router.patch(
  '/:id/priority',
  authMiddleware,
  requireAnyRole(['admin']),
  writeRateLimiter,
  complaintsController.updateComplaintPriority
);
router.patch(
  '/:id/status',
  authMiddleware,
  requireAnyRole(['admin', 'responder']),
  writeRateLimiter,
  updateStatusValidation,
  complaintsController.updateComplaintStatus
);
router.patch(
  '/:id/assign',
  authMiddleware,
  requireAnyRole(['admin']),
  writeRateLimiter,
  assignComplaintValidation,
  complaintsController.assignComplaint
);
router.patch(
  '/:id/reject',
  authMiddleware,
  requireAnyRole(['admin']),
  writeRateLimiter,
  complaintsController.rejectComplaint
);
router.patch(
  '/:id/cancel',
  authMiddleware,
  requireVerified,
  writeRateLimiter,
  cancelComplaintValidation,
  complaintsController.cancelComplaint
);

const upload = require('../middleware/upload');
const mediaController = require('../controllers/media.controller');

router.post(
  '/:id/media',
  authMiddleware,
  writeRateLimiter,
  upload.array('files', 5),
  mediaController.uploadMedia
);
router.delete('/:id', authMiddleware, requireVerified, writeRateLimiter, complaintsController.deleteFailedComplaint);
router.get('/:id/media', authMiddleware, mediaController.listMedia);
router.delete('/:id/media/:mediaId', authMiddleware, writeRateLimiter, mediaController.deleteMedia);

module.exports = router;
