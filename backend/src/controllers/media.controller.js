const { handleService } = require('../utils/controllerHelpers');
const mediaService = require('../services/media.service');

const uploadMedia = handleService(
  (req) => mediaService.uploadComplaintMedia(req.params.id, req.user, req.files),
  { logLabel: 'Failed to upload complaint media', fallbackMessage: 'Unable to upload media', defaultStatus: 201 }
);

const listMedia = handleService(
  (req) => mediaService.listComplaintMedia(req.params.id, req.user),
  { logLabel: 'Failed to list complaint media', fallbackMessage: 'Unable to retrieve media' }
);

const deleteMedia = handleService(
  (req) => mediaService.deleteComplaintMedia(req.params.id, req.params.mediaId, req.user),
  { logLabel: 'Failed to delete complaint media', fallbackMessage: 'Unable to delete media' }
);

module.exports = {
  uploadMedia,
  listMedia,
  deleteMedia,
};
