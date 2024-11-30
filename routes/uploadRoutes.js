const express = require('express');
const multer = require('multer');
const { initiateFileUpload, checkUploadStatus } = require('../controllers/uploadController');
// const authMiddleware = require('../middleware/authorization');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initiate file upload
router.post('/upload', upload.single('file'), initiateFileUpload);

// Check upload status
router.get('/status/:jobId', checkUploadStatus);

module.exports = router;