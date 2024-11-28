const express = require('express');
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
                message: "All fields are required",
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
                    ? "Email already in use" 
                    : "Username already exists" 
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
            message: "User registered successfully", 
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error during registration", 
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
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            user: user,
            token: token,  
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login
};