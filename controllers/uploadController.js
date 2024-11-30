const { addFileUploadJob } = require('../services/uploadService');
const { fileUploadQueue } = require('../config/queue');
const path = require('path');

const initiateFileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Validate file
        const allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        
        if (!allowedFileTypes.includes(fileExt)) {
            return res.status(400).json({ 
                error: 'Invalid file type', 
                allowedTypes: allowedFileTypes 
            });
        }

        const userId = req.user?.id;
        const job = await addFileUploadJob(req.file, userId);

        res.status(202).json({
            message: 'File upload queued',
            jobId: job.id,
            filename: req.file.originalname,
            status: 'processing'
        });
    } catch (error) {
        console.error('File upload queue error:', error);
        res.status(500).json({
            error: 'File upload queue error',
            details: error.message
        });
    }
};

const checkUploadStatus = async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await fileUploadQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const progress = await job.progress();

        res.json({
            jobId,
            state,
            progress,
            result: await job.returnvalue,
            createdAt: job.timestamp,
            attempts: job.attemptsMade
        });
    } catch (error) {
        console.error('Error checking job status:', error);
        res.status(500).json({
            error: 'Error checking job status',
            details: error.message
        });
    }
};

module.exports = {
    initiateFileUpload,
    checkUploadStatus
};