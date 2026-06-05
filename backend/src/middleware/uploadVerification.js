const multer = require('multer');

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const uploadVerification = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPEG, PNG, WebP, or PDF files are allowed'), ok);
  },
});

module.exports = uploadVerification;
