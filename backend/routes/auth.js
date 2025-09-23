const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateJWT = require('../utils/generateJWT');
const nodemailer = require('nodemailer');

function getDb(req) { return req.db; }

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
        if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
        if (address && address.length < 10) errors.address = 'Address must be at least 10 characters';

        // 🔹 Return structured error response
        if (Object.keys(errors).length) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                fields: Object.keys(errors).map((field) => ({
                    field,
                    error: errors[field],
                }))
            });
        }

        // ---------------- Existing Code Below ----------------

        // Check if already fully registered (verified user)
        const existing = await new Promise((resolve, reject) =>
            db.query('SELECT id,is_verified FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email],
                (err, rows) => err ? reject(err) : resolve(rows)
            )
        );

        if (existing.length && existing[0].is_verified === 1) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Check registration_otps for a used verification record
        const otpRows = await new Promise((resolve, reject) =>
            db.query('SELECT id FROM registration_otps WHERE email=? AND used=1 AND expires_at >= NOW() ORDER BY id DESC LIMIT 1', [email],
                (err, rows) => err ? reject(err) : resolve(rows)
            )
        );

        if (!otpRows.length) {
            return res.status(400).json({ success: false, message: 'Please verify your email before registering' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        let userId;
        if (existing.length && existing[0].is_verified === 0) {
            // update placeholder (if any)
            userId = existing[0].id;
            await new Promise((resolve, reject) =>
                db.query('UPDATE users SET name=?, password=?, phone=?, address=?, auth_method=?, is_verified=1 WHERE id=?',
                    [name, hashedPassword, phone, address || '', 'local', userId],
                    (err) => err ? reject(err) : resolve(true)
                )
            );
        } else {
            // insert new user
            const insertResult = await new Promise((resolve, reject) =>
                db.query(
                    'INSERT INTO users (name,email,password,phone,address,auth_method,is_verified,is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [name, email, hashedPassword, phone, address || '', 'local', 1, 1],
                    (err, result) => (err ? reject(err) : resolve(result))
                )
            );
            userId = insertResult.insertId;
        }

        // optional: cleanup used OTPs for this email
        await new Promise((resolve, reject) =>
            db.query('DELETE FROM registration_otps WHERE email=?', [email], (err) => err ? reject(err) : resolve(true))
        );

        const token = generateJWT({ userId, email, phone });
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: userId, name, email, phone, address: address || '', is_verified: 1 }
        });

    } catch (err) {
        console.error('Register error:', err);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/send-registration-otp', async (req, res) => {
    const db = getDb(req);

    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email required' });
        }

        email = email.trim().toLowerCase();

        // ---- Rate Limit Check ----
        const lastOtpRows = await new Promise((resolve, reject) =>
            db.query(
                'SELECT created_at FROM registration_otps WHERE email=? ORDER BY id DESC LIMIT 1',
                [email],
                (err, rows) => (err ? reject(err) : resolve(rows))
            )
        );

        if (lastOtpRows.length) {
            const lastTime = new Date(lastOtpRows[0].created_at).getTime();
            if (Date.now() - lastTime < 60 * 1000) {
                return res
                    .status(429)
                    .json({ success: false, message: 'Please wait a moment before requesting another OTP' });
            }
        }

        // ---- Generate OTP ----
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await new Promise((resolve, reject) =>
            db.query(
                'INSERT INTO registration_otps (email, otp, expires_at) VALUES (?, ?, ?)',
                [email, otp, expiresAt],
                (err, result) => (err ? reject(err) : resolve(result))
            )
        );

        // ---- Send Mail ----
        await transporter.sendMail({
            from: `"Pankhudi Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Email - Pankhudi',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
              <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                
                <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 20px; text-align: center;">
                  <h1 style="margin:0; font-size: 24px; color:#ffffff;">Pankhudi</h1>
                </div>
                
                <div style="padding: 25px; color: #374151;">
                  <h2 style="margin-top:0;">Verify Your Email</h2>
                  <p>Hello,</p>
                  <p>Thank you for registering with <b>Pankhudi</b>. Please use the OTP below to verify your email address. This OTP is valid for <b>10 minutes</b>.</p>
                  
                  <div style="text-align:center; margin: 25px 0;">
                    <span style="display:inline-block; background: #4f46e5; color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: 3px; padding: 12px 24px; border-radius: 8px;">
                      ${otp}
                    </span>
                  </div>
                  
                  <p>If you didn’t request this email, you can safely ignore it.</p>
                  <p style="margin-bottom:0;">Warm regards,<br><b>The Pankhudi Team</b></p>
                </div>
                
                <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
                  © ${new Date().getFullYear()} Pankhudi. All rights reserved.
                </div>
              </div>
            </div>
            `,
        });

        // ---- Response ----
        return res.json({ success: true, message: 'OTP sent to email' });

    } catch (err) {
        console.error('send-registration-otp error:', err);
        return res.status(500).json({ success: false, message: 'Server error while sending OTP' });
    }
});
router.post('/verify-registration-otp', async (req, res) => {
    const db = getDb(req);
    try {
        let { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });
        email = email.trim().toLowerCase();
        otp = String(otp).trim();

        const rows = await new Promise((resolve, reject) =>
            db.query('SELECT id, used, expires_at FROM registration_otps WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1', [email, otp],
                (err, rows) => err ? reject(err) : resolve(rows)
            )
        );

        if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid OTP' });

        const rec = rows[0];
        if (rec.used) return res.status(400).json({ success: false, message: 'OTP already used' });
        if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

        // mark OTP used
        await new Promise((resolve, reject) =>
            db.query('UPDATE registration_otps SET used=1 WHERE id=?', [rec.id], (err) => err ? reject(err) : resolve(true))
        );

        return res.json({ success: true, message: 'Email verified ✅' });
    } catch (err) {
        console.error('verify-registration-otp error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
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


// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });




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
                from: `"Pankhudi Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Reset Your Password - Pankhudi',
                html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
        
        <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 20px; text-align: center;">
          <h1 style="margin:0; font-size: 24px; color:#ffffff;">Pankhudi</h1>
        </div>
        
        <div style="padding: 25px; color: #374151;">
          <h2 style="margin-top:0;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password on <b>Pankhudi</b>. Please use the OTP below to proceed. This OTP is valid for <b>15 minutes</b>.</p>
          
          <div style="text-align:center; margin: 25px 0;">
            <span style="display:inline-block; background: #4f46e5; color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: 3px; padding: 12px 24px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          
          <p>If you didn’t request a password reset, you can safely ignore this email. Your account will remain secure.</p>
          <p style="margin-bottom:0;">Warm regards,<br><b>The Pankhudi Team</b></p>
        </div>
        
        <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
          © ${new Date().getFullYear()} Pankhudi. All rights reserved.
        </div>
        
      </div>
    </div>
    `
            }, (mailErr) => {
                if (mailErr) {
                    console.error('Mail send error:', mailErr);
                    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
                }
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
