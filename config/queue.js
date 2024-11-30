const Queue = require('bull');

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
};

const fileUploadQueue = new Queue('file-uploads', { 
    redis: redisConfig,
});

// Global error handler for queue
fileUploadQueue.on('error', (error) => {
    console.error('Bull Queue Error:', error);
});

module.exports = {
    fileUploadQueue
};