const multer = require('multer');
const path = require('path');

// Use memory storage for multer (files will be stored as base64 in database)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Helper function to convert file buffer to base64 data URL
const fileToBase64 = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

module.exports = { upload, fileToBase64 };
