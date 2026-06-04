const multer = require('multer');

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    const ok = /^(image|video)\//.test(file.mimetype);
    cb(ok ? null : new Error('Only image and video files are allowed'), ok);
  },
});

module.exports = upload;