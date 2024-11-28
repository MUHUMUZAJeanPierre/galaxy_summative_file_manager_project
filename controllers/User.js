const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtile');

const register = async (req, res) => {
    // Extensive logging for debugging
    console.log('------- Registration Request -------');
    console.log('Full Request Body:', req.body);
    console.log('Request Headers:', req.headers);

    const { username, email, password } = req.body;
    
    // Detailed logging of extracted values
    console.log('Extracted Values:');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');

    try {
        // Comprehensive field validation
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

        // Check for existing user by either email or username
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            console.log('Existing User Found:', existingUser);
            return res.status(400).json({ 
                message: existingUser.email === email 
                    ? "Email already in use" 
                    : "Username already exists" 
            });
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        console.log('User registered successfully:', newUser._id);

        res.status(201).json({ 
            message: "User registered successfully", 
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error("------- Detailed Registration Error -------");
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);

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
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
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