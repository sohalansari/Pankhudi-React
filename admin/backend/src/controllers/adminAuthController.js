// backend/controllers/adminAuthController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendOTPEmail, sendPasswordResetSuccessEmail } = require('../../services/emailService');

// Helper function to promisify db query
const queryAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'pankhudi-secret-key', { expiresIn: '7d' });
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password required'
            });
        }

        const users = await queryAsync(
            'SELECT * FROM users WHERE email = ? AND is_admin = 1',
            [email]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        await queryAsync(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        const token = generateToken(user.id);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists and is admin
        const users = await queryAsync(
            'SELECT id, name, email FROM users WHERE email = ? AND is_admin = 1',
            [email]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No admin account found with this email'
            });
        }

        const user = users[0];
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in database
        await queryAsync(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
            [otp, otpExpiry, user.id]
        );

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp, user.name);

        if (emailSent) {
            res.json({
                success: true,
                message: 'OTP has been sent to your email address'
            });
        } else {
            // If email fails, still return success but log error
            console.error('Failed to send email to:', email);
            res.json({
                success: true,
                message: 'If an account exists, OTP has been sent to your email'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP. Please try again later.'
        });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Verify OTP
        const users = await queryAsync(
            'SELECT id, reset_token, reset_token_expiry FROM users WHERE email = ? AND is_admin = 1 AND reset_token = ? AND reset_token_expiry > NOW()',
            [email, otp]
        );

        if (!users || users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Generate a temporary reset token
        await queryAsync(
            'UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?',
            [resetToken, user.id]
        );

        res.json({
            success: true,
            message: 'OTP verified successfully',
            resetToken: resetToken
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP'
        });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, token and new password are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one special character'
            });
        }

        // Verify reset token
        const users = await queryAsync(
            'SELECT id, name FROM users WHERE email = ? AND is_admin = 1 AND reset_token = ? AND reset_token_expiry > NOW()',
            [email, token]
        );

        if (!users || users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password and clear reset token
        await queryAsync(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        // Send success email
        await sendPasswordResetSuccessEmail(email, user.name);

        res.json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ valid: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pankhudi-secret-key');

        const users = await queryAsync(
            'SELECT id, name, email, is_admin FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({ valid: false, message: 'User not found' });
        }

        res.json({
            valid: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
};

module.exports = {
    adminLogin,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyToken
};