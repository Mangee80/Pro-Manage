const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/users');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { authenticateToken } = require('../middleware/authMiddleware');

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
        
        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id, user.email);
        
        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();
        
        res.json({
            status: 'SUCCESS',
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
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

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id, user.email);
        
        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();
        
        res.json({
            status: 'SUCCESS',
            message: "You've logged in successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user._id, user.email);
        const newRefreshToken = generateRefreshToken(user._id, user.email);
        
        // Update refresh token
        user.refreshToken = newRefreshToken;
        await user.save();
        
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Clear refresh token
        await User.findByIdAndUpdate(userId, { refreshToken: null });
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        errorHandler(res, error);
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
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

// New route for updating user settings
router.post('/updateSettings', async (req, res) => {
    try {
        const { userID, name, email, oldPassword, newPassword } = req.body;

        // Validate userID
        if (!userID) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find user by ID
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let hasChanges = false;

        // Update name if provided
        if (name && name.trim() !== '') {
            user.name = name.trim();
            hasChanges = true;
        }

        // Update email if provided
        if (email && email.trim() !== '') {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email: email.trim(), _id: { $ne: userID } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken by another user' });
            }
            user.email = email.trim();
            hasChanges = true;
        }

        // Update password if both old and new passwords are provided
        if (oldPassword && newPassword) {
            // Verify old password
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            hasChanges = true;
        }

        // Check if any changes were made
        if (!hasChanges) {
            return res.status(400).json({ message: 'No changes to update' });
        }

        // Save updated user
        await user.save();

        res.status(200).json({ 
            message: 'Settings updated successfully',
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

  

module.exports = router;
