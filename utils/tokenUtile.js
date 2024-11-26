const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET);  
  };

module.exports = {generateToken }