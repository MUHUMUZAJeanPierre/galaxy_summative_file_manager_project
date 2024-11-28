const mongoose = require('mongoose');
const connectDB = require('../config/db');  

jest.mock('mongoose', () => ({
  connect: jest.fn(),  
}));

describe('MongoDB connection', () => {
  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();  
  });

  it('should connect to MongoDB successfully', async () => {
    mongoose.connect.mockResolvedValueOnce(true);  

    await expect(connectDB()).resolves.toBeUndefined();  
  });

  it('should handle connection errors', async () => {
    mongoose.connect.mockRejectedValueOnce(new Error('Connection failed'));  

    await expect(connectDB()).rejects.toThrow('MongoDB connection error: Connection failed');
  });
});
