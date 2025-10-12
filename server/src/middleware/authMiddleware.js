const { verifyAccessToken } = require('../utils/jwtUtils');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            error: 'Access token required',
            message: 'Please provide a valid access token'
        });
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ 
                error: 'Invalid or expired token',
                message: 'Your session has expired. Please login again.'
            });
        }

        // Add user info to request object
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: 'Token verification failed',
            message: 'Invalid token format'
        });
    }
};

// Optional authentication middleware (for routes that can work with or without auth)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyAccessToken(token);
            if (decoded) {
                req.user = decoded;
            }
        } catch (error) {
            // Token is invalid, but we continue without user info
        }
    }

    next();
};

module.exports = {
    authenticateToken,
    optionalAuth
};


