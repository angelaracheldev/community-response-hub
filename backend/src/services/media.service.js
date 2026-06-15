const cloudinary = require('../config/cloudinary');
const mediaRepository = require('../repositories/media.repository');
const complaintsRepository = require('../repositories/complaints.repository');
const activityLogsRepository = require('../repositories/activityLogs.repository');

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

async function assertCanAccessComplaint(complaintIdentifier, user) {
  const result = await complaintsRepository.findComplaintByIdentifier(complaintIdentifier);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Complaint not found' } } };
  }
  const complaint = result.rows[0];
  if (user.role_name === 'resident' && complaint.reported_by !== user.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }
  if (user.role_name === 'responder' && complaint.assigned_to !== user.user_id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }
  return { complaint };
}

function mapMediaRows(rows, complaint) {
  return rows.map((row) => ({
    ...row,
    is_resident_evidence: row.uploaded_by === complaint.reported_by,
  }));
}

async function uploadComplaintMedia(complaintIdentifier, user, files) {
  const access = await assertCanAccessComplaint(complaintIdentifier, user);
  if (access.error) return access;

  const complaint = access.complaint;
  const complaintId = complaint.complaint_id;

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

  const isResolutionEvidence =
    user.role_name === 'responder' && user.user_id !== complaint.reported_by;
  if (isResolutionEvidence) {
    try {
      await activityLogsRepository.insertLog({
        complaintId,
        performedBy: user.user_id,
        actionType: 'resolution_evidence_uploaded',
        description: `Uploaded ${uploaded.length} resolution evidence file(s)`,
      });
    } catch (err) {
      console.error('Failed to insert resolution evidence activity log:', err.message);
    }
  }

  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'Media uploaded successfully',
      data: mapMediaRows(uploaded, complaint),
      timestamp: new Date().toISOString(),
    },
  };
}

async function listComplaintMedia(complaintIdentifier, user) {
  const access = await assertCanAccessComplaint(complaintIdentifier, user);
  if (access.error) return access;

  const result = await mediaRepository.listByComplaintId(access.complaint.complaint_id);
  return {
    body: {
      status: 'ok',
      data: mapMediaRows(result.rows, access.complaint),
      timestamp: new Date().toISOString(),
    },
  };
}

async function deleteComplaintMedia(complaintIdentifier, mediaId, user) {
  const access = await assertCanAccessComplaint(complaintIdentifier, user);
  if (access.error) return access;

  const complaintId = access.complaint.complaint_id;

  const existing = await mediaRepository.findById(mediaId, complaintId);
  if (!existing.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'Media not found' } } };
  }

  await mediaRepository.deleteById(mediaId, complaintId);

  return {
    body: { status: 'ok', message: 'Media deleted successfully', timestamp: new Date().toISOString() },
  };
}

module.exports = { uploadComplaintMedia, listComplaintMedia, deleteComplaintMedia };
