const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const mockingoose = require('mockingoose');
const { register, login } = require('../controllers/User');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtile');

jest.mock('bcryptjs');
jest.mock('../utils/tokenUtile');

const app = express();
app.use(express.json());

// Mock translation middleware
app.use((req, res, next) => {
  req.t = jest.fn().mockImplementation((key) => key);
  next();
});

app.post('/register', register);
app.post('/login', login);

jest.setTimeout(10000); // Increase test timeout

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockingoose.resetAll();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword123',
      };

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedpassword');
      mockingoose(User).toReturn(null, 'findOne');
      mockingoose(User).toReturn(newUser, 'save');

      const response = await request(app)
        .post('/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('user.success.userRegistered');
      expect(response.body.user.username).toBe(newUser.username);
    });

    it('should return error if required fields are missing', async () => {
      const newUser = { username: 'testuser' };

      const response = await request(app)
        .post('/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('user.errors.allFieldsRequired');
      expect(response.body.missingFields.email).toBe(true);
      expect(response.body.missingFields.password).toBe(true);
    });

    it('should return error if user already exists', async () => {
      const existingUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword123',
      };

      mockingoose(User).toReturn(existingUser, 'findOne');

      const response = await request(app)
        .post('/register')
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('user.errors.emailInUse');
    });

    it('should return server error on failure', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword123',
      };

      mockingoose(User).toReturn(new Error('Database Error'), 'save');

      const response = await request(app)
        .post('/register')
        .send(newUser);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('user.errors.serverErrorRegistration');
    });
  });
});