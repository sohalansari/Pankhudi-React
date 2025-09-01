const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path based on your project
const authMiddleware = require('../middleware/auth'); // Middleware to verify JWT

// GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Profile fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
