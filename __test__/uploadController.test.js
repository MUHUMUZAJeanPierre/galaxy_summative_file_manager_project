const { initiateFileUpload, checkUploadStatus } = require('../controllers/uploadController');
const { addFileUploadJob } = require('../services/uploadService');
const { fileUploadQueue } = require('../config/queue');

jest.mock('../services/uploadService', () => ({
    addFileUploadJob: jest.fn(),
}));

jest.mock('../config/queue', () => ({
    fileUploadQueue: {
        getJob: jest.fn(),
        getJobs: jest.fn().mockResolvedValue([]),
    },
}));

describe('uploadController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            file: null,
            user: { id: '12345' },
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('initiateFileUpload', () => {
        it('should return 400 if no file is uploaded', async () => {
            await initiateFileUpload(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
        });

        it('should return 400 if the file type is invalid', async () => {
            req.file = { originalname: 'invalid.exe' };

            await initiateFileUpload(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid file type',
                allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
            });
        });

        it('should return 202 if the file is queued successfully', async () => {
            req.file = { originalname: 'file.pdf' };
            addFileUploadJob.mockResolvedValueOnce({ id: 'job123', data: {} });

            await initiateFileUpload(req, res);

            expect(addFileUploadJob).toHaveBeenCalledWith(req.file, req.user.id);
            expect(res.status).toHaveBeenCalledWith(202);
            expect(res.json).toHaveBeenCalledWith({
                message: 'File upload queued',
                jobId: 'job123',
                filename: 'file.pdf',
                status: 'processing',
            });
        });

        it('should return 500 if an exception occurs', async () => {
            req.file = { originalname: 'file.pdf' };
            addFileUploadJob.mockRejectedValueOnce(new Error('Queue error'));

            await initiateFileUpload(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'File upload queue error',
                details: 'Queue error',
            }));
        });
    });

    describe('checkUploadStatus', () => {
        it('should return 404 if the job is not found', async () => {
            req.params.jobId = 'job123';
            fileUploadQueue.getJob.mockResolvedValueOnce(null);

            await checkUploadStatus(req, res);

            expect(fileUploadQueue.getJob).toHaveBeenCalledWith('job123');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Job not found',
                jobId: 'job123'
            }));
        });

        it('should return the job status if the job exists', async () => {
            req.params.jobId = 'job123';
            const mockJob = {
                id: 'job123',
                getState: jest.fn().mockResolvedValueOnce('active'),
                progress: jest.fn().mockReturnValueOnce(50),
                returnvalue: { fileId: 'file123' }, // Changed from Promise.resolve to direct value
                timestamp: Date.now(),
                attemptsMade: 2,
                data: {}
            };
            fileUploadQueue.getJob.mockResolvedValueOnce(mockJob);

            await checkUploadStatus(req, res);

            expect(fileUploadQueue.getJob).toHaveBeenCalledWith('job123');
            expect(res.json).toHaveBeenCalledWith({
                jobId: 'job123',
                state: 'active',
                progress: 50,
                result: { fileId: 'file123' },
                createdAt: mockJob.timestamp,
                attempts: 2
            });
        });

        it('should return 500 if an exception occurs', async () => {
            req.params.jobId = 'job123';
            fileUploadQueue.getJob.mockRejectedValueOnce(new Error('Job lookup error'));

            await checkUploadStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Error checking job status',
                details: 'Job lookup error',
            }));
        });
    });
});