const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Check for token in both Authorization header and 'authorization' (case-insensitive)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader?.split(' ')[1]; // Get token after 'Bearer '

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token required'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach both the full decoded user and just the ID for different use cases
        req.user = decoded;       // Full user data (if your JWT contains it)
        req.userId = decoded.id; // Just the ID (more specific)

        next();
    } catch (err) {
        // Different error messages based on error type
        let message = 'Invalid token';
        if (err.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (err.name === 'JsonWebTokenError') {
            message = 'Malformed token';
        }

        res.status(401).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = authenticate;