const express = require('express');
const { upload, fileToBase64 } = require('../lib/upload');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Single file upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Convert file to base64 data URL
    const base64DataUrl = fileToBase64(req.file.buffer, req.file.mimetype);
    
    res.json({
      url: base64DataUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

// Multiple files upload
router.post('/upload/multiple', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Convert all files to base64 data URLs
    const files = req.files.map(file => ({
      url: fileToBase64(file.buffer, file.mimetype),
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({ files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files', details: error.message });
  }
});

module.exports = router;
