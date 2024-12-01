const Queue = require('bull');
const { processFileUpload } = require('../services/uploadService');

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
};

// Create queue with explicit configuration and debugging
const fileUploadQueue = new Queue('file-uploads', { 
    redis: {
        port: redisConfig.port,
        host: redisConfig.host
    },
    // Add additional queue settings
    settings: {
        lockDuration: 30000, // 30 seconds
        stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 3 // Maximum number of times a job can be stalled
    }
});

// Process jobs in the queue
fileUploadQueue.process(async (job) => {
    console.log('Processing job:', {
        jobId: job.id,
        jobData: job.data
    });

    try {
        const result = await processFileUpload(job);
        console.log('Job processing completed:', {
            jobId: job.id,
            result
        });
        return result;
    } catch (error) {
        console.error('Job processing failed:', {
            jobId: job.id,
            error: error.message
        });
        throw error;
    }
});

// Global error handlers
fileUploadQueue.on('error', (error) => {
    console.error('Bull Queue Global Error:', error);
});

fileUploadQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

fileUploadQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
});

module.exports = {
    fileUploadQueue
};