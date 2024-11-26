const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtile');


const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully", data: newUser });
    } catch (error) {
        console.error("Error during registration:", error); // Log error for debugging
        res.status(500).json({ message: "Server error", error: error.message || error });
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
