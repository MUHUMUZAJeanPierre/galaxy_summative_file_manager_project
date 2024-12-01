const { fileUploadQueue } = require('../config/queue');
const path = require('path');
const fs = require('fs');

const addFileUploadJob = async (file, userId) => {
    console.log('Adding file upload job', {
        filename: file.originalname,
        userId,
        filePath: file.path
    });
    
    // Validate file type
    const allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (!allowedFileTypes.includes(fileExt)) {
        console.error('Invalid file type', { fileExt });
        throw new Error('Invalid file type');
    }

    // Ensure file exists
    if (!fs.existsSync(file.path)) {
        console.error('File does not exist', { filePath: file.path });
        throw new Error('File does not exist');
    }

    // Add job to queue
    try {
        const job = await fileUploadQueue.add({
            file: {
                originalname: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            },
            userId: userId || null
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        });

        console.log('Job added successfully', {
            jobId: job.id,
            jobData: job.data
        });

        return job;
    } catch (error) {
        console.error('Error adding job to queue:', error);
        throw error;
    }
};

const processFileUpload = async (job) => {
    console.log('Processing file upload', { jobData: job.data });

    const { file, userId } = job.data;

    try {
        // Simulate file processing
        const destinationPath = path.join('uploads', `${Date.now()}-${file.originalname}`);
        
        // Ensure uploads directory exists
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }

        // Move file to destination
        fs.renameSync(file.path, destinationPath);

        const result = {
            success: true,
            filename: file.originalname,
            path: destinationPath,
            userId: userId
        };

        console.log('File upload processed successfully', result);
        return result;
    } catch (error) {
        console.error('File upload processing error:', error);
        throw error;
    }
};

module.exports = {
    addFileUploadJob,
    processFileUpload
};