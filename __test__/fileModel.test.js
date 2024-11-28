jest.setTimeout(30000); // Set timeout to 30 seconds

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const File = require('../models/fileModel');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await File.deleteMany({});
});

describe('File Model', () => {
  it('should create a file successfully', async () => {
    const user = await User.create({
      username: 'testuser' + Date.now(),
      email: 'testuser@example.com',
      password: 'password123',
    });

    const fileData = {
      fileName: 'testfile.txt',
      filePath: '/uploads/testfile.txt',
      userId: user._id,
    };

    const file = await File.create(fileData);

    expect(file).toHaveProperty('_id');
    expect(file.fileName).toBe(fileData.fileName);
    expect(file.filePath).toBe(fileData.filePath);
    expect(file.userId.toString()).toBe(user._id.toString());
    expect(file.createdAt).toBeDefined();
    expect(file.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error if fileName is missing', async () => {
    const fileData = {
      filePath: '/uploads/testfile.txt',
      userId: new mongoose.Types.ObjectId(),
    };

    await expect(File.create(fileData)).rejects.toThrow();
  });

  it('should throw an error if filePath is missing', async () => {
    const fileData = {
      fileName: 'testfile.txt',
      userId: new mongoose.Types.ObjectId(),
    };

    await expect(File.create(fileData)).rejects.toThrow();
  });

  it('should set createdAt to the current date by default', async () => {
    const fileData = {
      fileName: 'testfile.txt',
      filePath: '/uploads/testfile.txt',
      userId: new mongoose.Types.ObjectId(),
    };

    const file = await File.create(fileData);

    expect(file.createdAt).toBeDefined();
    expect(file.createdAt).toBeInstanceOf(Date);
  });

  it('should fetch a file by userId', async () => {
    const user = await User.create({
      username: 'testuser' + Date.now(),
      email: 'testuser@example.com',
      password: 'password123',
    });

    const fileData = {
      fileName: 'testfile.txt',
      filePath: '/uploads/testfile.txt',
      userId: user._id,
    };

    const file = await File.create(fileData);

    const fetchedFile = await File.findOne({ userId: user._id });

    expect(fetchedFile).not.toBeNull();
    expect(fetchedFile.userId.toString()).toBe(user._id.toString());
    expect(fetchedFile.fileName).toBe(fileData.fileName);
    expect(fetchedFile.filePath).toBe(fileData.filePath);
  });

  it('should delete a file by id', async () => {
    const user = await User.create({
      username: 'testuser' + Date.now(),
      email: 'testuser@example.com',
      password: 'password123',
    });

    const fileData = {
      fileName: 'testfile.txt',
      filePath: '/uploads/testfile.txt',
      userId: user._id,
    };

    const file = await File.create(fileData);

    const deletedFile = await File.findByIdAndDelete(file._id);

    expect(deletedFile).not.toBeNull();
    expect(deletedFile._id.toString()).toBe(file._id.toString());

    const fetchedFile = await File.findById(file._id);
    expect(fetchedFile).toBeNull();
  });
});
