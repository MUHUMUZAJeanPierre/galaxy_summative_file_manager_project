const { fileUploadQueue } = require('../config/queue');
const File = require('../models/fileModel');
const fs = require('fs').promises;
const path = require('path');

const uploadFileToStorage = async (file, userId) => {
    try {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        const destinationPath = path.join(
            __dirname, 
            '../user_files', 
            uniqueFilename
        );

        // Move file to permanent storage
        await fs.rename(file.path, destinationPath);

        // Create file record in database
        const newFile = new File({
            userId,
            fileName: file.originalname,
            uniqueFileName: uniqueFilename,
            filePath: destinationPath,
            fileSize: file.size,
            fileType: path.extname(file.originalname),
            status: 'completed'
        });

        await newFile.save();
        return newFile;
    } catch (error) {
        console.error('File upload failed:', error);
        throw new Error(`File upload failed: ${error.message}`);
    }
};

const addFileUploadJob = async (file, userId) => {
    const job = await fileUploadQueue.add(
        { file, userId },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            timeout: 30000 // 30 seconds timeout
        }
    );

    return job;
};

// Job processor
fileUploadQueue.process(async (job) => {
    const { file, userId } = job.data;

    try {
        // Update job progress
        await job.progress(25);

        const uploadedFile = await uploadFileToStorage(file, userId);

        // Final job progress
        await job.progress(100);

        return {
            success: true,
            fileId: uploadedFile._id,
            filename: uploadedFile.fileName
        };
    } catch (error) {
        console.error('Upload processing failed:', error);
        throw new Error(`Upload processing failed: ${error.message}`);
    }
});

module.exports = {
    addFileUploadJob,
    uploadFileToStorage
};