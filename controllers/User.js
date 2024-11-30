const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtile');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            console.log('Validation Error: Missing fields');
            return res.status(400).json({ 
                message: req.t('user.errors.allFieldsRequired'),
                missingFields: {
                    username: !username,
                    email: !email,
                    password: !password
                }
            });
        }

        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email 
                    ? req.t('user.errors.emailInUse')
                    : req.t('user.errors.usernameExists')
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ 
            message: req.t('user.success.userRegistered'), 
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ 
            message: req.t('user.errors.serverErrorRegistration'), 
            error: error.message || "Internal server error",
            errorName: error.name
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: req.t('user.errors.invalidCredentials') });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: req.t('user.errors.invalidCredentials') });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: req.t('user.success.loginSuccessful'),
            user: user,
            token: token,  
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: req.t('user.errors.serverErrorLogin'), error: error.message });
    }
};

module.exports = {
    register,
    login
};