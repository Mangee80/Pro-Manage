const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/users');

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
        
        res.json({
            status: 'SUCCESS',
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

        
        res.json({
            status: 'SUCCESS',
            message: "You've logged in successfully!",
            user: user.name,
            userId: user._id
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

router.post('/updatePassword', async (req, res) => {
    try {
        const { oldPassword, newPassword, name } = req.body;

        const users = await User.find();
        
        for (const user of users) {
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

            if (isPasswordValid) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                user.password = hashedPassword;
                user.name = name;

                await user.save();
            }
        }

        res.status(200).json({ message: "Passwords and emails updated successfully." });
    } catch (error) {
        console.error("Error updating passwords and emails:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

  

module.exports = router;
