const cloudinary = require('../config/cloudinary');

function uploadBuffer(file) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'community-response-hub/verifications',
        resource_type: resourceType,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(file.buffer);
  });
}

async function uploadVerificationDocument(file) {
  const result = await uploadBuffer(file);
  return result.secure_url;
}

module.exports = { uploadVerificationDocument };
