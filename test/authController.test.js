const request = require('supertest');
const app = require('../server'); // Assuming you have an Express app instance
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtile');

// Mock the User model and bcrypt functions
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('../utils/tokenUtile');

describe('Auth Controller', () => {

    // Test the 'register' function
    describe('POST /register', () => {
        it('should successfully register a user', async () => {
            // Arrange: Mock the behavior
            const mockUser = {
                _id: '1234567890',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
            };
            User.findOne.mockResolvedValue(null); // No existing user
            bcrypt.hash.mockResolvedValue('hashedpassword'); // Simulating password hash

            // Act: Send a request to the register endpoint
            const res = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password',
                });

            // Assert: Check the response
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User registered successfully");
            expect(res.body.data.username).toBe('testuser');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        });

        it('should return 400 if user already exists', async () => {
            // Arrange: Mock the behavior when the user already exists
            User.findOne.mockResolvedValue({
                _id: '1234567890',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
            });

            // Act: Send a request to the register endpoint
            const res = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password',
                });

            // Assert: Check the response
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("User already exists");
        });

        it('should return 500 if there is a server error', async () => {
            // Arrange: Simulate an error in User.save
            User.findOne.mockRejectedValue(new Error('Database error'));

            // Act: Send a request to the register endpoint
            const res = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password',
                });

            // Assert: Check the response
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Server error");
        });
    });

    // Test the 'login' function
    describe('POST /login', () => {
        it('should successfully login a user and return a token', async () => {
            // Arrange: Mock the behavior
            const mockUser = {
                _id: '1234567890',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
            };
            User.findOne.mockResolvedValue(mockUser); // Found user
            bcrypt.compare.mockResolvedValue(true); // Password is valid
            generateToken.mockReturnValue('jwtToken123'); // Simulate token generation

            // Act: Send a request to the login endpoint
            const res = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'password',
                });

            // Assert: Check the response
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Login successful");
            expect(res.body.token).toBe('jwtToken123');
            expect(generateToken).toHaveBeenCalledWith('1234567890');
        });

        it('should return 400 if invalid email or password', async () => {
            // Arrange: Mock invalid password scenario
            User.findOne.mockResolvedValue({
                _id: '1234567890',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
            });
            bcrypt.compare.mockResolvedValue(false); // Invalid password

            // Act: Send a request to the login endpoint
            const res = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            // Assert: Check the response
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid email or password");
        });

        it('should return 500 if there is a server error', async () => {
            // Arrange: Simulate a database error
            User.findOne.mockRejectedValue(new Error('Database error'));

            // Act: Send a request to the login endpoint
            const res = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'password',
                });

            // Assert: Check the response
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Server error");
        });
    });
});
