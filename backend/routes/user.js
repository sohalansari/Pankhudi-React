// routes/user.js
const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

function getDb(req) { return req.db; }

// Get current user data
router.get('/me', authenticateToken, async (req, res) => {
    const db = getDb(req);
    try {
        const userId = req.user.userId;

        const rows = await new Promise((resolve, reject) =>
            db.query(
                'SELECT id, name, email, phone, address, avatar, auth_method, is_premium, created_at FROM users WHERE id = ? AND is_active = 1 AND is_deleted = 0',
                [userId],
                (err, results) => err ? reject(err) : resolve(results)
            )
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = rows[0];

        // Format avatar URL
        let avatarUrl = user.avatar;
        if (avatarUrl) {
            if (!avatarUrl.startsWith('http')) {
                avatarUrl = `http://localhost:5000/uploads/avatars/${path.basename(avatarUrl)}`;
            }
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                avatar: avatarUrl,
                auth_method: user.auth_method || 'local',
                is_premium: user.is_premium || 0,
                created_at: user.created_at
            }
        });

    } catch (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user address
router.put('/address', authenticateToken, async (req, res) => {
    const db = getDb(req);
    try {
        const userId = req.user.userId;
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ success: false, message: 'Address is required' });
        }

        await new Promise((resolve, reject) =>
            db.query(
                'UPDATE users SET address = ? WHERE id = ?',
                [address, userId],
                (err) => err ? reject(err) : resolve(true)
            )
        );

        return res.json({
            success: true,
            message: 'Address updated successfully',
            address: address
        });

    } catch (err) {
        console.error('Error updating address:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;