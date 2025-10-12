const jwt = require('jsonwebtoken');

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

// Generate Access Token (short-lived - 15 minutes)
const generateAccessToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// Generate Refresh Token (long-lived - 7 days)
const generateRefreshToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

// Verify Access Token
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    JWT_SECRET,
    JWT_REFRESH_SECRET
};


