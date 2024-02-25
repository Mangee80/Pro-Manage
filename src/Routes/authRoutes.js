const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

require('dotenv').config();

// Error Handler middleware
const errorHandler = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
};

// Register route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({ error: 'Email is Already Registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Create JWT token
        const token = jwt.sign({ user: user.email }, process.env.JWT_SECRET);
        
        res.json({
            status: 'SUCCESS',
            token,
            user: email,
            name
        });
    } catch (error) {
        errorHandler(res, error);
    }  
});


// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and Password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'FAILED',
                message: 'Invalid Email or Password'
            });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                status: 'FAILED',
                message: 'Invalid Email or Password'
            });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({
            status: 'SUCCESS',
            message: "You've logged in successfully!",
            token,
            user: user.name
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

module.exports = router;
