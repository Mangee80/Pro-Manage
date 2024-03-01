const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
        const token = jwt.sign({ user: user.toJSON() }, process.env.JWT_SECRET);
        res.json({
            status: 'SUCCESS',
            message: "You've logged in successfully!",
            token,
            user: user.name,
            userId: user._id
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

router.post('/updatePassword', async (req, res) => {
    try {
      // Extract user ID and passwords from request body
      const { email, oldPassword, newPassword } = req.body;
  
       // Find the user by email
       const user = await User.findOne({ email });
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Verify the old password
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: 'oldPassword is incorrect' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      user.password = hashedPassword;
  
      // Save the updated user object
      await user.save();
  
      // Respond with a success message
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Error updating password' });
    }
});
  

module.exports = router;
