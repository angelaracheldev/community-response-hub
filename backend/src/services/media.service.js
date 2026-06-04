const cloudinary = require('../config/cloudinary');
const mediaRepository = require('../repositories/media.repository');
const complaintsRepository = require('../repositories/complaints.repository');

function mediaTypeFromMime(mimetype) {
  return mimetype.startsWith('video/') ? 'video' : 'image';
}

function uploadBuffer(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'community-response-hub/complaints',
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(file.buffer);
  });
}

async function assertCanAccessComplaint(complaintId, user) {
  const result = await complaintsRepository.findComplaintById(complaintId);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }
  const complaint = result.rows[0];
  if (user.role_name === 'resident' && complaint.reported_by !== user.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }
  return { complaint };
}

async function uploadComplaintMedia(complaintId, user, files) {
  const access = await assertCanAccessComplaint(complaintId, user);
  if (access.error) return access;

  if (!files?.length) {
    return { error: { status: 400, body: { status: 'error', message: 'No files provided' } } };
  }

  const uploaded = [];
  for (const file of files) {
    const result = await uploadBuffer(file);
    const mediaType = mediaTypeFromMime(file.mimetype);
    const row = await mediaRepository.insertMedia({
      complaintId,
      uploadedBy: user.user_id,
      mediaUrl: result.secure_url,
      mediaType,
    });
    uploaded.push(row.rows[0]);
  }

  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'Media uploaded successfully',
      data: uploaded,
      timestamp: new Date().toISOString(),
    },
  };
}

async function listComplaintMedia(complaintId, user) {
  const access = await assertCanAccessComplaint(complaintId, user);
  if (access.error) return access;

  const result = await mediaRepository.listByComplaintId(complaintId);
  return {
    body: {
      status: 'ok',
      data: result.rows,
      timestamp: new Date().toISOString(),
    },
  };
}

async function deleteComplaintMedia(complaintId, mediaId, user) {
  const access = await assertCanAccessComplaint(complaintId, user);
  if (access.error) return access;

  const existing = await mediaRepository.findById(mediaId, complaintId);
  if (!existing.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Media not found' } } };
  }

  // Optional: destroy on Cloudinary using public_id from URL — skip for v1
  await mediaRepository.deleteById(mediaId, complaintId);

  return {
    body: { status: 'ok', message: 'Media deleted successfully', timestamp: new Date().toISOString() },
  };
}

module.exports = { uploadComplaintMedia, listComplaintMedia, deleteComplaintMedia };