const mediaService = require('../services/media.service');

async function uploadMedia(req, res) {
  try {
    const result = await mediaService.uploadComplaintMedia(
      req.params.id,
      req.user,
      req.files
    );
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Failed to upload complaint media:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to upload media',
      error: error.message,
    });
  }
}

async function listMedia(req, res) {
  try {
    const result = await mediaService.listComplaintMedia(req.params.id, req.user);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to list complaint media:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve media',
      error: error.message,
    });
  }
}

async function deleteMedia(req, res) {
  try {
    const result = await mediaService.deleteComplaintMedia(
      req.params.id,
      req.params.mediaId,
      req.user
    );
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to delete complaint media:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to delete media',
      error: error.message,
    });
  }
}

module.exports = {
  uploadMedia,
  listMedia,
  deleteMedia,
};