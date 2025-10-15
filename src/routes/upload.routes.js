const express = require('express');
const { upload } = require('../lib/upload');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Single file upload
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return the file URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Multiple files upload
router.post('/upload/multiple', auth, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));
  
  res.json({ files });
});

module.exports = router;
