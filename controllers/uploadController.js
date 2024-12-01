const { addFileUploadJob } = require('../services/uploadService');
const { fileUploadQueue } = require('../config/queue');
const path = require('path');

const initiateFileUpload = async (req, res) => {
    console.log('Upload initiated', req.file); // Detailed logging

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
        
        // More comprehensive logging
        console.log('Attempting to add file upload job', {
            filename: req.file.originalname,
            userId,
            filePath: req.file.path
        });

        const job = await addFileUploadJob(req.file, userId);

        console.log('Job created successfully', {
            jobId: job.id,
            jobData: job.data
        });

        res.status(202).json({
            message: 'File upload queued',
            jobId: job.id,
            filename: req.file.originalname,
            status: 'processing'
        });
    } catch (error) {
        console.error('Full file upload queue error:', error);
        res.status(500).json({
            error: 'File upload queue error',
            details: error.message,
            fullError: error.toString()
        });
    }
};

const checkUploadStatus = async (req, res) => {
    const { jobId } = req.params;

    console.log(`Checking status for job: ${jobId}`); // Log the job ID being checked

    try {
        // Retrieve all jobs to help debug
        const jobs = await fileUploadQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
        console.log('Existing jobs:', jobs.map(job => ({
            id: job.id,
            state: job.state,
            data: job.data
        })));

        const job = await fileUploadQueue.getJob(jobId);

        if (!job) {
            console.warn(`No job found with ID: ${jobId}`);
            return res.status(404).json({ 
                error: 'Job not found',
                details: 'The specified job ID does not exist in the queue',
                jobId: jobId
            });
        }

        const state = await job.getState();
        const progress = job.progress();

        console.log('Job status details:', {
            jobId,
            state,
            progress,
            jobData: job.data
        });

        res.json({
            jobId,
            state,
            progress,
            result: job.returnvalue,
            createdAt: job.timestamp,
            attempts: job.attemptsMade
        });
    } catch (error) {
        console.error('Error checking job status:', error);
        res.status(500).json({
            error: 'Error checking job status',
            details: error.message,
            fullError: error.toString()
        });
    }
};

module.exports = {
    initiateFileUpload,
    checkUploadStatus
};