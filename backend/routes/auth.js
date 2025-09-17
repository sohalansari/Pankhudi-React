const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateJWT = require('../utils/generateJWT');
const nodemailer = require('nodemailer');


function getDb(req) { return req.db; }

/**
 * Register route
 */
router.post('/register', async (req, res) => {
    const db = getDb(req);
    try {
        let { name, email, password, phone, address } = req.body;
        email = email?.trim().toLowerCase();
        phone = phone?.trim();
        password = password?.trim();

        const errors = {};
        if (!name || name.length < 3) errors.name = 'Name must be at least 3 characters';
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email';
        if (!phone || !/^\d{10}$/.test(phone)) errors.phone = 'Phone must be 10 digits';
        if (!password || password.length < 8) errors.password = 'Password must be at least 8 chars';
        if (address && address.length < 10) errors.address = 'Address too short';

        if (Object.keys(errors).length) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // Check duplicates
        const checkEmail = await new Promise((resolve, reject) =>
            db.query('SELECT id FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email], (err, rows) =>
                err ? reject(err) : resolve(rows)
            )
        );
        if (checkEmail.length) return res.status(409).json({ success: false, message: 'Email already registered' });

        const checkPhone = await new Promise((resolve, reject) =>
            db.query('SELECT id FROM users WHERE phone = ? AND is_active=1 AND is_deleted=0', [phone], (err, rows) =>
                err ? reject(err) : resolve(rows)
            )
        );
        if (checkPhone.length) return res.status(409).json({ success: false, message: 'Phone already registered' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user
        const insertResult = await new Promise((resolve, reject) =>
            db.query(
                'INSERT INTO users (name,email,password,phone,address,auth_method,is_verified,is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, phone, address || '', 'local', 0, 1],
                (err, result) => (err ? reject(err) : resolve(result))
            )
        );

        const userId = insertResult.insertId;
        const token = generateJWT({ userId, email, phone });

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: userId, name, email, phone, address: address || '' }
        });

    } catch (err) {
        console.error('Register error:', err);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
});

/**
 * Login route
 */
router.post('/login', async (req, res) => {
    const db = getDb(req);
    try {
        let { emailOrPhone, password } = req.body;
        if (!emailOrPhone || !password) {
            return res.status(400).json({ success: false, message: 'Email/Phone and password required' });
        }

        emailOrPhone = emailOrPhone.trim();
        password = password.trim();

        const isEmail = emailOrPhone.includes('@');
        const query = isEmail
            ? 'SELECT * FROM users WHERE email = ? AND is_active=1 AND is_deleted=0'
            : 'SELECT * FROM users WHERE phone = ? AND is_active=1 AND is_deleted=0';

        const rows = await new Promise((resolve, reject) =>
            db.query(query, [emailOrPhone], (err, results) => (err ? reject(err) : resolve(results)))
        );

        if (!rows.length) {
            return res.status(400).json({ success: false, message: 'User not found or inactive' });
        }

        const user = rows[0];
        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Wrong password' });
        }

        const token = generateJWT({ userId: user.id, email: user.email, phone: user.phone });

        return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address || '',
                is_premium: user.is_premium || 0
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
});










/**
 * Google authentication
 */
router.post('/auth/google', async (req, res) => {
    const db = getDb(req);
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, message: 'Token required' });

        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email?.toLowerCase();
        const name = payload.name;
        const picture = payload.picture;

        const existing = await new Promise((resolve, reject) =>
            db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email], (err, rows) => err ? reject(err) : resolve(rows))
        );

        let user;
        if (existing.length === 0) {
            const result = await new Promise((resolve, reject) =>
                db.query('INSERT INTO users (name, email, google_id, avatar, auth_method, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [name, email, googleId, picture, 'google', 1, 1],
                    (err, r) => err ? reject(err) : resolve(r))
            );
            user = { id: result.insertId, name, email, google_id: googleId, avatar: picture, auth_method: 'google', is_verified: 1, is_premium: 0 };
        } else {
            user = existing[0];
        }

        const authToken = generateJWT({ userId: user.id, email: user.email });

        return res.json({
            success: true,
            token: authToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_premium: user.is_premium || 0
            }
        });

    } catch (err) {
        console.error('Google auth error:', err);
        return res.status(401).json({ success: false, message: 'Google authentication failed' });
    }
});

/**
 * Forgot password: send OTP
 */


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});




router.post('/forgot-password', (req, res) => {
    const db = getDb(req);
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    db.query('SELECT id FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (!rows.length) return res.status(404).json({ success: false, message: 'Email not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiration = new Date(Date.now() + 15 * 60 * 1000);

        db.query('UPDATE users SET otp = ?, otp_expiration = ? WHERE email = ?', [otp, otpExpiration, email], (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false, message: 'Server error' });

            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset OTP',
                html: `<p>Your OTP: <b>${otp}</b> (valid for 15 minutes)</p>`
            }, (mailErr) => {
                if (mailErr) return res.status(500).json({ success: false, message: 'Failed to send OTP' });
                return res.json({ success: true, message: 'OTP sent successfully' });
            });
        });
    });
});

/**
 * Verify OTP
 */
router.post('/verify-otp', (req, res) => {
    const db = getDb(req);
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    db.query('SELECT otp, otp_expiration FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });

        const { otp: dbOtp, otp_expiration } = rows[0];
        if (!dbOtp || dbOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
        if (new Date(otp_expiration) < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

        return res.json({ success: true, message: 'OTP verified successfully' });
    });
});

/**
 * Reset password
 */
router.post('/reset-password', async (req, res) => {
    const db = getDb(req);
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password are required' });

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        db.query('UPDATE users SET password = ?, otp = NULL, otp_expiration = NULL WHERE email = ?', [hashedPassword, email], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            return res.json({ success: true, message: 'Password reset successful' });
        });
    } catch (err) {
        console.error('Hashing error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
