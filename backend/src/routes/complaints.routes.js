const router = require('express').Router();
const { authMiddleware, requireAnyRole, requireVerified } = require('../middleware/auth');
const complaintsController = require('../controllers/complaints.controller');
const {
  createComplaintValidation,
  updateStatusValidation,
  assignComplaintValidation,
  cancelComplaintValidation,
} = require('../validators/complaints.validator');

router.post('/', authMiddleware, requireVerified, createComplaintValidation, complaintsController.createComplaint);
router.get('/', authMiddleware, complaintsController.listComplaints);
router.get('/my', authMiddleware, complaintsController.listMyComplaints);
router.get('/:id', authMiddleware, complaintsController.getComplaintById);
router.patch(
  '/:id/status',
  authMiddleware,
  requireAnyRole(['admin', 'responder']),
  updateStatusValidation,
  complaintsController.updateComplaintStatus
);
router.patch(
  '/:id/assign',
  authMiddleware,
  requireAnyRole(['admin', 'responder']),
  assignComplaintValidation,
  complaintsController.assignComplaint
);
router.patch(
  '/:id/cancel',
  authMiddleware,
  requireVerified,
  cancelComplaintValidation,
  complaintsController.cancelComplaint
);

const upload = require('../middleware/upload');
const mediaController = require('../controllers/media.controller');

router.post(
  '/:id/media',
  authMiddleware,
  requireVerified,
  upload.array('files', 5),
  mediaController.uploadMedia
);
router.delete('/:id', authMiddleware, requireVerified, complaintsController.deleteFailedComplaint);
router.get('/:id/media', authMiddleware, mediaController.listMedia);
router.delete('/:id/media/:mediaId', authMiddleware, mediaController.deleteMedia);

module.exports = router;
