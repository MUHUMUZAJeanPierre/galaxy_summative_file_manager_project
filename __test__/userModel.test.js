const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

describe('User Model', () => {

    it('should throw an error if username is not unique', async () => {
        const userData = {
            username: 'testuser',
            email: 'test1@example.com',
            password: 'password123',
        };

        const user = await User.create(userData);
        expect(user).toHaveProperty('_id');
        expect(user.username).toBe(userData.username);
        expect(user.email).toBe(userData.email);

        const userData2 = {
            username: 'testuser',
            email: 'test2@example.com',
            password: 'password456',
        };

        try {
            await User.create(userData2);
        } catch (error) {
            expect(error.code).toBe(11000);
            expect(error.message).toMatch(/duplicate key error/);  
        }
    });

});

