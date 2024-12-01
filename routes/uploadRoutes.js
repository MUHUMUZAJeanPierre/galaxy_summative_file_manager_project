const express = require('express');
const multer = require('multer');
const path = require('path');
const { initiateFileUpload, checkUploadStatus } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

// Middleware to log any multer errors
const uploadErrorHandler = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({
            error: 'File upload error',
            details: error.message
        });
    } else if (error) {
        // An unknown error occurred when uploading.
        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
    next();
};

// File upload route with multer middleware and error handler
router.post('/upload', 
    upload.single('file'), 
    initiateFileUpload,
    uploadErrorHandler
);

// Check upload status route
router.get('/status/:jobId', checkUploadStatus);

module.exports = router;