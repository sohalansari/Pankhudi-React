// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const generateJWT = require('../utils/generateJWT');
// const nodemailer = require('nodemailer');

// function getDb(req) { return req.db; }

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// router.post('/register', async (req, res) => {
//     const db = getDb(req);
//     try {
//         let { name, email, password, phone, address } = req.body;
//         email = email?.trim().toLowerCase();
//         phone = phone?.trim();
//         password = password?.trim();

//         const errors = {};

//         if (!name || name.length < 3) errors.name = 'Name must be at least 3 characters';
//         if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email';
//         if (!phone || !/^\d{10}$/.test(phone)) errors.phone = 'Phone must be 10 digits';
//         if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
//         if (address && address.length < 10) errors.address = 'Address must be at least 10 characters';

//         // Return structured error response
//         if (Object.keys(errors).length) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 fields: Object.keys(errors).map((field) => ({
//                     field,
//                     error: errors[field],
//                 }))
//             });
//         }

//         // Check if phone number already exists in database
//         const phoneCheck = await new Promise((resolve, reject) =>
//             db.query('SELECT id FROM users WHERE phone = ? AND is_active=1 AND is_deleted=0 AND is_verified=1', [phone],
//                 (err, rows) => err ? reject(err) : resolve(rows)
//             )
//         );

//         if (phoneCheck.length) {
//             return res.status(409).json({
//                 success: false,
//                 message: 'Phone number already registered',
//                 field: 'phone'
//             });
//         }

//         // Check if email already exists (verified user)
//         const existing = await new Promise((resolve, reject) =>
//             db.query('SELECT id,is_verified FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email],
//                 (err, rows) => err ? reject(err) : resolve(rows)
//             )
//         );

//         if (existing.length && existing[0].is_verified === 1) {
//             return res.status(409).json({
//                 success: false,
//                 message: 'Email already registered',
//                 field: 'email'
//             });
//         }

//         // Check registration_otps for a used verification record
//         const otpRows = await new Promise((resolve, reject) =>
//             db.query('SELECT id FROM registration_otps WHERE email=? AND used=1 AND expires_at >= NOW() ORDER BY id DESC LIMIT 1', [email],
//                 (err, rows) => err ? reject(err) : resolve(rows)
//             )
//         );

//         if (!otpRows.length) {
//             return res.status(400).json({ success: false, message: 'Please verify your email before registering' });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         let userId;
//         if (existing.length && existing[0].is_verified === 0) {
//             // Check if phone exists for other users before updating
//             const phoneCheckForUpdate = await new Promise((resolve, reject) =>
//                 db.query('SELECT id FROM users WHERE phone = ? AND id != ? AND is_active=1 AND is_deleted=0 AND is_verified=1', [phone, existing[0].id],
//                     (err, rows) => err ? reject(err) : resolve(rows)
//                 )
//             );

//             if (phoneCheckForUpdate.length) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Phone number already registered',
//                     field: 'phone'
//                 });
//             }

//             // update placeholder (if any)
//             userId = existing[0].id;
//             await new Promise((resolve, reject) =>
//                 db.query('UPDATE users SET name=?, password=?, phone=?, address=?, auth_method=?, is_verified=1 WHERE id=?',
//                     [name, hashedPassword, phone, address || '', 'local', userId],
//                     (err) => err ? reject(err) : resolve(true)
//                 )
//             );
//         } else {
//             // For new user insert, phone check was already done above
//             const insertResult = await new Promise((resolve, reject) =>
//                 db.query(
//                     'INSERT INTO users (name,email,password,phone,address,auth_method,is_verified,is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//                     [name, email, hashedPassword, phone, address || '', 'local', 1, 1],
//                     (err, result) => (err ? reject(err) : resolve(result))
//                 )
//             );
//             userId = insertResult.insertId;
//         }

//         // optional: cleanup used OTPs for this email
//         await new Promise((resolve, reject) =>
//             db.query('DELETE FROM registration_otps WHERE email=?', [email], (err) => err ? reject(err) : resolve(true))
//         );

//         const token = generateJWT({ userId, email, phone });
//         return res.status(201).json({
//             success: true,
//             message: 'Registration successful',
//             token,
//             user: { id: userId, name, email, phone, address: address || '', is_verified: 1 }
//         });

//     } catch (err) {
//         console.error('Register error:', err);

//         // Handle duplicate entry error specifically
//         if (err.code === 'ER_DUP_ENTRY') {
//             if (err.sqlMessage.includes('phone')) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Phone number already registered',
//                     field: 'phone'
//                 });
//             } else if (err.sqlMessage.includes('email')) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Email already registered',
//                     field: 'email'
//                 });
//             }
//         }

//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: 'Server error' });
//         }
//     }
// });
// router.post('/send-registration-otp', async (req, res) => {
//     const db = getDb(req);

//     try {
//         let { email } = req.body;
//         if (!email) {
//             return res.status(400).json({ success: false, message: 'Email required' });
//         }

//         email = email.trim().toLowerCase();

//         // ---- Rate Limit Check ----
//         const lastOtpRows = await new Promise((resolve, reject) =>
//             db.query(
//                 'SELECT created_at FROM registration_otps WHERE email=? ORDER BY id DESC LIMIT 1',
//                 [email],
//                 (err, rows) => (err ? reject(err) : resolve(rows))
//             )
//         );

//         if (lastOtpRows.length) {
//             const lastTime = new Date(lastOtpRows[0].created_at).getTime();
//             if (Date.now() - lastTime < 60 * 1000) {
//                 return res
//                     .status(429)
//                     .json({ success: false, message: 'Please wait a moment before requesting another OTP' });
//             }
//         }

//         // ---- Generate OTP ----
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//         await new Promise((resolve, reject) =>
//             db.query(
//                 'INSERT INTO registration_otps (email, otp, expires_at) VALUES (?, ?, ?)',
//                 [email, otp, expiresAt],
//                 (err, result) => (err ? reject(err) : resolve(result))
//             )
//         );

//         // ---- Send Mail ----
//         await transporter.sendMail({
//             from: `"Pankhudi Support" <${process.env.EMAIL_USER}>`,
//             to: email,
//             subject: 'Verify your Email - Pankhudi',
//             html: `
//             <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
//               <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">

//                 <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 20px; text-align: center;">
//                   <h1 style="margin:0; font-size: 24px; color:#ffffff;">Pankhudi</h1>
//                 </div>

//                 <div style="padding: 25px; color: #374151;">
//                   <h2 style="margin-top:0;">Verify Your Email</h2>
//                   <p>Hello,</p>
//                   <p>Thank you for registering with <b>Pankhudi</b>. Please use the OTP below to verify your email address. This OTP is valid for <b>10 minutes</b>.</p>

//                   <div style="text-align:center; margin: 25px 0;">
//                     <span style="display:inline-block; background: #4f46e5; color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: 3px; padding: 12px 24px; border-radius: 8px;">
//                       ${otp}
//                     </span>
//                   </div>

//                   <p>If you didn’t request this email, you can safely ignore it.</p>
//                   <p style="margin-bottom:0;">Warm regards,<br><b>The Pankhudi Team</b></p>
//                 </div>

//                 <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
//                   © ${new Date().getFullYear()} Pankhudi. All rights reserved.
//                 </div>
//               </div>
//             </div>
//             `,
//         });

//         // ---- Response ----
//         return res.json({ success: true, message: 'OTP sent to email' });

//     } catch (err) {
//         console.error('send-registration-otp error:', err);
//         return res.status(500).json({ success: false, message: 'Server error while sending OTP' });
//     }
// });
// router.post('/verify-registration-otp', async (req, res) => {
//     const db = getDb(req);
//     try {
//         let { email, otp } = req.body;
//         if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });
//         email = email.trim().toLowerCase();
//         otp = String(otp).trim();

//         const rows = await new Promise((resolve, reject) =>
//             db.query('SELECT id, used, expires_at FROM registration_otps WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1', [email, otp],
//                 (err, rows) => err ? reject(err) : resolve(rows)
//             )
//         );

//         if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid OTP' });

//         const rec = rows[0];
//         if (rec.used) return res.status(400).json({ success: false, message: 'OTP already used' });
//         if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

//         // mark OTP used
//         await new Promise((resolve, reject) =>
//             db.query('UPDATE registration_otps SET used=1 WHERE id=?', [rec.id], (err) => err ? reject(err) : resolve(true))
//         );

//         return res.json({ success: true, message: 'Email verified ✅' });
//     } catch (err) {
//         console.error('verify-registration-otp error:', err);
//         return res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// /**
//  * Login route
//  */
// router.post('/login', async (req, res) => {
//     const db = getDb(req);
//     try {
//         let { emailOrPhone, password } = req.body;
//         if (!emailOrPhone || !password) {
//             return res.status(400).json({ success: false, message: 'Email/Phone and password required' });
//         }

//         emailOrPhone = emailOrPhone.trim();
//         password = password.trim();

//         const isEmail = emailOrPhone.includes('@');
//         const query = isEmail
//             ? 'SELECT * FROM users WHERE email = ? AND is_active=1 AND is_deleted=0'
//             : 'SELECT * FROM users WHERE phone = ? AND is_active=1 AND is_deleted=0';

//         const rows = await new Promise((resolve, reject) =>
//             db.query(query, [emailOrPhone], (err, results) => (err ? reject(err) : resolve(results)))
//         );

//         if (!rows.length) {
//             return res.status(400).json({ success: false, message: 'User not found or inactive' });
//         }

//         const user = rows[0];
//         if (!user.password) {
//             return res.status(400).json({ success: false, message: 'Invalid credentials' });
//         }

//         const isValid = await bcrypt.compare(password, user.password);
//         if (!isValid) {
//             return res.status(400).json({ success: false, message: 'Wrong password' });
//         }

//         const token = generateJWT({ userId: user.id, email: user.email, phone: user.phone });

//         return res.json({
//             success: true,
//             message: 'Login successful',
//             token,
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone,
//                 address: user.address || '',
//                 is_premium: user.is_premium || 0
//             }
//         });

//     } catch (err) {
//         console.error('Login error:', err);
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: 'Server error' });
//         }
//     }
// });

// /**
//  * Google authentication
//  */
// router.post('/auth/google', async (req, res) => {
//     const db = getDb(req);
//     try {
//         const { token } = req.body;
//         if (!token) return res.status(400).json({ success: false, message: 'Token required' });

//         const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
//         const payload = ticket.getPayload();
//         const googleId = payload.sub;
//         const email = payload.email?.toLowerCase();
//         const name = payload.name;
//         const picture = payload.picture;

//         const existing = await new Promise((resolve, reject) =>
//             db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email], (err, rows) => err ? reject(err) : resolve(rows))
//         );

//         let user;
//         if (existing.length === 0) {
//             const result = await new Promise((resolve, reject) =>
//                 db.query('INSERT INTO users (name, email, google_id, avatar, auth_method, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                     [name, email, googleId, picture, 'google', 1, 1],
//                     (err, r) => err ? reject(err) : resolve(r))
//             );
//             user = { id: result.insertId, name, email, google_id: googleId, avatar: picture, auth_method: 'google', is_verified: 1, is_premium: 0 };
//         } else {
//             user = existing[0];
//         }

//         const authToken = generateJWT({ userId: user.id, email: user.email });

//         return res.json({
//             success: true,
//             token: authToken,
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 is_premium: user.is_premium || 0
//             }
//         });

//     } catch (err) {
//         console.error('Google auth error:', err);
//         return res.status(401).json({ success: false, message: 'Google authentication failed' });
//     }
// });

// /**
//  * Forgot password: send OTP
//  */


// // const transporter = nodemailer.createTransport({
// //     host: "smtp.gmail.com",
// //     port: 587,
// //     secure: false,
// //     auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS
// //     }
// // });




// router.post('/forgot-password', (req, res) => {
//     const db = getDb(req);
//     const { email } = req.body;

//     if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

//     db.query('SELECT id FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email], (err, rows) => {
//         if (err) return res.status(500).json({ success: false, message: 'Server error' });
//         if (!rows.length) return res.status(404).json({ success: false, message: 'Email not found' });

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const otpExpiration = new Date(Date.now() + 15 * 60 * 1000);

//         db.query('UPDATE users SET otp = ?, otp_expiration = ? WHERE email = ?', [otp, otpExpiration, email], (updateErr) => {
//             if (updateErr) return res.status(500).json({ success: false, message: 'Server error' });

//             transporter.sendMail({
//                 from: `"Pankhudi Support" <${process.env.EMAIL_USER}>`,
//                 to: email,
//                 subject: 'Reset Your Password - Pankhudi',
//                 html: `
//     <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
//       <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">

//         <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 20px; text-align: center;">
//           <h1 style="margin:0; font-size: 24px; color:#ffffff;">Pankhudi</h1>
//         </div>

//         <div style="padding: 25px; color: #374151;">
//           <h2 style="margin-top:0;">Password Reset Request</h2>
//           <p>Hello,</p>
//           <p>We received a request to reset your password on <b>Pankhudi</b>. Please use the OTP below to proceed. This OTP is valid for <b>15 minutes</b>.</p>

//           <div style="text-align:center; margin: 25px 0;">
//             <span style="display:inline-block; background: #4f46e5; color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: 3px; padding: 12px 24px; border-radius: 8px;">
//               ${otp}
//             </span>
//           </div>

//           <p>If you didn’t request a password reset, you can safely ignore this email. Your account will remain secure.</p>
//           <p style="margin-bottom:0;">Warm regards,<br><b>The Pankhudi Team</b></p>
//         </div>

//         <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
//           © ${new Date().getFullYear()} Pankhudi. All rights reserved.
//         </div>

//       </div>
//     </div>
//     `
//             }, (mailErr) => {
//                 if (mailErr) {
//                     console.error('Mail send error:', mailErr);
//                     return res.status(500).json({ success: false, message: 'Failed to send OTP' });
//                 }
//                 return res.json({ success: true, message: 'OTP sent successfully' });
//             });

//         });
//     });
// });

// /**
//  * Verify OTP
//  */
// router.post('/verify-otp', (req, res) => {
//     const db = getDb(req);
//     const { email, otp } = req.body;
//     if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

//     db.query('SELECT otp, otp_expiration FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email], (err, rows) => {
//         if (err) return res.status(500).json({ success: false, message: 'Server error' });
//         if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });

//         const { otp: dbOtp, otp_expiration } = rows[0];
//         if (!dbOtp || dbOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
//         if (new Date(otp_expiration) < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

//         return res.json({ success: true, message: 'OTP verified successfully' });
//     });
// });

// /**
//  * Reset password
//  */
// router.post('/reset-password', async (req, res) => {
//     const db = getDb(req);
//     const { email, newPassword } = req.body;
//     if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password are required' });

//     try {
//         const hashedPassword = await bcrypt.hash(newPassword, 12);
//         db.query('UPDATE users SET password = ?, otp = NULL, otp_expiration = NULL WHERE email = ?', [hashedPassword, email], (err) => {
//             if (err) return res.status(500).json({ success: false, message: 'Server error' });
//             return res.json({ success: true, message: 'Password reset successful' });
//         });
//     } catch (err) {
//         console.error('Hashing error', err);
//         return res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// module.exports = router;











// auth.js - Complete Updated with 2FA Login Support and UUID

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateJWT = require('../utils/generateJWT');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // ✅ UUID import kar liya

function getDb(req) { return req.db; }

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate temporary token for 2FA verification
 * @param {number} userId - User ID
 * @returns {string} JWT token valid for 5 minutes
 */
const generateTempToken = (userId) => {
    return jwt.sign(
        { userId, purpose: '2fa-verification' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );
};

/**
 * Parse browser from user agent
 * @param {string} ua - User agent string
 * @returns {string} Browser name
 */
const getBrowserFromUA = (ua) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
    return 'Unknown';
};

/**
 * Parse OS from user agent
 * @param {string} ua - User agent string
 * @returns {string} OS name
 */
const getOSFromUA = (ua) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
};

/**
 * Log login activity to database
 * @param {object} db - Database connection
 * @param {number} userId - User ID
 * @param {string} status - Login status (success/failed/pending_2fa/etc)
 * @param {object} req - Express request object
 */
const logLoginActivity = (db, userId, status, req) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const browser = getBrowserFromUA(userAgent);
    const os = getOSFromUA(userAgent);
    const isMobile = /mobile/i.test(userAgent);

    // Check if login_activity table exists
    db.query("SHOW TABLES LIKE 'login_activity'", (err, results) => {
        if (err || results.length === 0) {
            // Create table if it doesn't exist
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS login_activity (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    action VARCHAR(50) DEFAULT 'Login',
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    browser VARCHAR(50),
                    os VARCHAR(50),
                    device_type VARCHAR(20),
                    status VARCHAR(20),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_timestamp (timestamp)
                )
            `;
            db.query(createTableSql, (createErr) => {
                if (createErr) {
                    console.error('Error creating login_activity table:', createErr);
                    return;
                }
                // Insert after creating table
                insertLoginActivity();
            });
        } else {
            // Table exists, insert directly
            insertLoginActivity();
        }
    });

    function insertLoginActivity() {
        db.query(
            `INSERT INTO login_activity 
             (user_id, action, ip_address, user_agent, browser, os, device_type, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, 'Login', ip, userAgent, browser, os, isMobile ? 'mobile' : 'desktop', status],
            (err) => {
                if (err) console.error('Error logging activity:', err);
            }
        );
    }
};

/**
 * ✅ FIXED: Create user session with UUID to avoid duplicate entries
 * @param {object} db - Database connection
 * @param {number} userId - User ID
 * @param {object} req - Express request object
 * @returns {string} Session ID
 */
const createSession = (db, userId, req) => {
    // ✅ Generate unique UUID for session ID - guaranteed unique
    const sessionId = uuidv4();  // e.g., '123e4567-e89b-12d3-a456-426614174000'

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const browser = getBrowserFromUA(userAgent);
    const os = getOSFromUA(userAgent);
    const isMobile = /mobile/i.test(userAgent);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if user_sessions table exists
    db.query("SHOW TABLES LIKE 'user_sessions'", (err, results) => {
        if (err || results.length === 0) {
            // Create table if it doesn't exist
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    session_id VARCHAR(255) NOT NULL UNIQUE,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    browser VARCHAR(50),
                    os VARCHAR(50),
                    device_type VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_session_id (session_id)
                )
            `;
            db.query(createTableSql, (createErr) => {
                if (createErr) {
                    console.error('Error creating user_sessions table:', createErr);
                    return sessionId;
                }
                // Insert after creating table
                insertSession();
            });
        } else {
            // Table exists, insert directly
            insertSession();
        }
    });

    function insertSession() {
        db.query(
            `INSERT INTO user_sessions 
             (user_id, session_id, ip_address, user_agent, browser, os, device_type, expires_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, sessionId, ip, userAgent, browser, os, isMobile ? 'mobile' : 'desktop', expiresAt],
            (err) => {
                if (err) {
                    // Agar duplicate entry ka error aata hai to ek baar fir se try karo
                    if (err.code === 'ER_DUP_ENTRY') {
                        console.log('⚠️ Duplicate session ID detected, generating new one...');
                        // Generate new UUID and retry
                        const newSessionId = uuidv4();
                        db.query(
                            `INSERT INTO user_sessions 
                             (user_id, session_id, ip_address, user_agent, browser, os, device_type, expires_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [userId, newSessionId, ip, userAgent, browser, os, isMobile ? 'mobile' : 'desktop', expiresAt],
                            (retryErr) => {
                                if (retryErr) {
                                    console.error('Error creating session on retry:', retryErr);
                                } else {
                                    console.log(`✅ Session created with new ID: ${newSessionId}`);
                                }
                            }
                        );
                    } else {
                        console.error('Error creating session:', err);
                    }
                } else {
                    console.log(`✅ Session created successfully: ${sessionId}`);
                }
            }
        );
    }

    return sessionId;
};

/**
 * Check if user has 2FA enabled
 * @param {object} db - Database connection
 * @param {number} userId - User ID
 * @param {function} callback - Callback function
 */
const checkTwoFAStatus = (db, userId, callback) => {
    // Check if two_fa table exists
    db.query("SHOW TABLES LIKE 'two_fa'", (err, results) => {
        if (err || results.length === 0) {
            return callback(null, false);
        }

        db.query(
            'SELECT enabled FROM two_fa WHERE user_id = ?',
            [userId],
            (err, rows) => {
                if (err) return callback(err, false);
                const enabled = rows && rows[0] && rows[0].enabled === 1;
                callback(null, enabled);
            }
        );
    });
};

/**
 * Check if user has backup codes available
 * @param {object} db - Database connection
 * @param {number} userId - User ID
 * @param {function} callback - Callback function
 */
const checkBackupCodes = (db, userId, callback) => {
    db.query(
        'SELECT COUNT(*) as count FROM user_backup_codes WHERE user_id = ? AND used = 0',
        [userId],
        (err, rows) => {
            if (err) return callback(err, 0);
            callback(null, rows[0]?.count || 0);
        }
    );
};

// ============================================
// REGISTRATION ROUTES
// ============================================

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @access  Public
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
        if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
        if (address && address.length < 10) errors.address = 'Address must be at least 10 characters';

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

        // Check if phone number already exists
        const phoneCheck = await new Promise((resolve, reject) =>
            db.query('SELECT id FROM users WHERE phone = ? AND is_active=1 AND is_deleted=0 AND is_verified=1', [phone],
                (err, rows) => err ? reject(err) : resolve(rows)
            )
        );

        if (phoneCheck.length) {
            return res.status(409).json({
                success: false,
                message: 'Phone number already registered',
                field: 'phone'
            });
        }

        // Check if email already exists (verified user)
        const existing = await new Promise((resolve, reject) =>
            db.query('SELECT id,is_verified FROM users WHERE email = ? AND is_active=1 AND is_deleted=0', [email],
                (err, rows) => err ? reject(err) : resolve(rows)
            )
        );

        if (existing.length && existing[0].is_verified === 1) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered',
                field: 'email'
            });
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
            // Check if phone exists for other users before updating
            const phoneCheckForUpdate = await new Promise((resolve, reject) =>
                db.query('SELECT id FROM users WHERE phone = ? AND id != ? AND is_active=1 AND is_deleted=0 AND is_verified=1', [phone, existing[0].id],
                    (err, rows) => err ? reject(err) : resolve(rows)
                )
            );

            if (phoneCheckForUpdate.length) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered',
                    field: 'phone'
                });
            }

            // update placeholder (if any)
            userId = existing[0].id;
            await new Promise((resolve, reject) =>
                db.query('UPDATE users SET name=?, password=?, phone=?, address=?, auth_method=?, is_verified=1 WHERE id=?',
                    [name, hashedPassword, phone, address || '', 'local', userId],
                    (err) => err ? reject(err) : resolve(true)
                )
            );
        } else {
            // For new user insert, phone check was already done above
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

        // Log login activity
        logLoginActivity(db, userId, 'success', req);

        // Create session
        createSession(db, userId, req);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: userId,
                name,
                email,
                phone,
                address: address || '',
                is_verified: 1,
                is_premium: 0,
                avatar: null
            }
        });

    } catch (err) {
        console.error('Register error:', err);

        if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.includes('phone')) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered',
                    field: 'phone'
                });
            } else if (err.sqlMessage.includes('email')) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered',
                    field: 'email'
                });
            }
        }

        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
});

// OTP Routes (Your existing code - unchanged)
router.post('/send-registration-otp', async (req, res) => {
    const db = getDb(req);
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email required' });
        }

        email = email.trim().toLowerCase();

        // Rate Limit Check
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

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await new Promise((resolve, reject) =>
            db.query(
                'INSERT INTO registration_otps (email, otp, expires_at) VALUES (?, ?, ?)',
                [email, otp, expiresAt],
                (err, result) => (err ? reject(err) : resolve(result))
            )
        );

        // Send Mail
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
                  
                  <p>If you didn't request this email, you can safely ignore it.</p>
                  <p style="margin-bottom:0;">Warm regards,<br><b>The Pankhudi Team</b></p>
                </div>
                
                <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
                  © ${new Date().getFullYear()} Pankhudi. All rights reserved.
                </div>
              </div>
            </div>
            `,
        });

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

// ============================================
// LOGIN ROUTE WITH 2FA SUPPORT (Unchanged)
// ============================================

router.post('/login', async (req, res) => {
    const db = getDb(req);
    try {
        let { emailOrPhone, password } = req.body;

        // Validation
        if (!emailOrPhone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/Phone and password are required'
            });
        }

        emailOrPhone = emailOrPhone.trim();
        password = password.trim();

        // Determine if input is email or phone
        const isEmail = emailOrPhone.includes('@');
        const query = isEmail
            ? 'SELECT * FROM users WHERE email = ? AND is_active=1 AND is_deleted=0'
            : 'SELECT * FROM users WHERE phone = ? AND is_active=1 AND is_deleted=0';

        // Find user
        const rows = await new Promise((resolve, reject) => {
            db.query(query, [emailOrPhone], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (!rows || rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = rows[0];

        // Check if user has password (for local auth)
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account uses social login. Please login with Google.'
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            // Log failed attempt
            logLoginActivity(db, user.id, 'failed', req);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if 2FA is enabled
        checkTwoFAStatus(db, user.id, (err, twoFAEnabled) => {
            if (err) {
                console.error('Error checking 2FA status:', err);
            }

            if (twoFAEnabled) {
                // User has 2FA enabled - generate temporary token
                const tempToken = generateTempToken(user.id);

                // Log login attempt (pending verification)
                logLoginActivity(db, user.id, 'pending_2fa', req);

                // Check if user has backup codes
                checkBackupCodes(db, user.id, (backupErr, backupCount) => {
                    return res.json({
                        success: true,
                        requiresTwoFA: true,
                        tempToken: tempToken,
                        hasBackupCodes: backupCount > 0,
                        message: '2FA verification required',
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            hasTwoFA: true
                        }
                    });
                });
            } else {
                // No 2FA - complete login normally
                const token = generateJWT({
                    userId: user.id,
                    email: user.email,
                    phone: user.phone
                });

                // Log successful login
                logLoginActivity(db, user.id, 'success', req);

                // ✅ FIXED: Create session with UUID
                createSession(db, user.id, req);

                // Format avatar URL
                let avatar = user.avatar;
                if (avatar && !avatar.startsWith('http')) {
                    avatar = `http://localhost:5000/uploads/avatars/${path.basename(avatar)}`;
                }

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
                        is_premium: user.is_premium || 0,
                        avatar: avatar || null
                    }
                });
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 2FA VERIFICATION ROUTES (Unchanged)
// ============================================

router.post('/verify-2fa', (req, res) => {
    const db = getDb(req);
    const { tempToken, twoFACode } = req.body;

    if (!tempToken || !twoFACode) {
        return res.status(400).json({
            success: false,
            message: 'Temporary token and verification code are required'
        });
    }

    // Verify temporary token
    let decoded;
    try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (decoded.purpose !== '2fa-verification') {
            throw new Error('Invalid token purpose');
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    const userId = decoded.userId;

    // Get user's 2FA secret
    db.query(
        'SELECT secret FROM two_fa WHERE user_id = ? AND enabled = 1',
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            if (!rows || rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '2FA is not enabled for this account'
                });
            }

            const secret = rows[0].secret;

            // Verify TOTP code
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: twoFACode.toString(),
                window: 2 // Allow 2 steps before/after for time drift
            });

            if (!verified) {
                // Log failed 2FA attempt
                logLoginActivity(db, userId, 'failed_2fa', req);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid verification code'
                });
            }

            // Get user details
            db.query(
                'SELECT id, name, email, phone, address, avatar, is_premium FROM users WHERE id = ?',
                [userId],
                (err, userRows) => {
                    if (err || !userRows || userRows.length === 0) {
                        return res.status(500).json({
                            success: false,
                            message: 'User not found'
                        });
                    }

                    const user = userRows[0];

                    // Generate final JWT
                    const token = generateJWT({
                        userId: user.id,
                        email: user.email,
                        phone: user.phone
                    });

                    // Log successful 2FA verification
                    logLoginActivity(db, userId, 'success', req);

                    // ✅ FIXED: Create session with UUID
                    createSession(db, userId, req);

                    // Format avatar URL if exists
                    let avatar = user.avatar;
                    if (avatar && !avatar.startsWith('http')) {
                        avatar = `http://localhost:5000/uploads/avatars/${path.basename(avatar)}`;
                    }

                    return res.json({
                        success: true,
                        message: '2FA verification successful',
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            address: user.address || '',
                            is_premium: user.is_premium || 0,
                            avatar: avatar || null
                        }
                    });
                }
            );
        }
    );
});

router.post('/verify-backup-code', (req, res) => {
    const db = getDb(req);
    const { tempToken, backupCode } = req.body;

    if (!tempToken || !backupCode) {
        return res.status(400).json({
            success: false,
            message: 'Temporary token and backup code are required'
        });
    }

    // Verify temporary token
    let decoded;
    try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (decoded.purpose !== '2fa-verification') {
            throw new Error('Invalid token purpose');
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    const userId = decoded.userId;

    // Check if backup codes table exists
    db.query("SHOW TABLES LIKE 'user_backup_codes'", (err, results) => {
        if (err || results.length === 0) {
            // Create table if it doesn't exist
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS user_backup_codes (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    backup_code VARCHAR(50) NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    used_at TIMESTAMP NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_backup_code (backup_code)
                )
            `;
            db.query(createTableSql, (createErr) => {
                if (createErr) {
                    console.error('Error creating backup codes table:', createErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Backup code system not available'
                    });
                }
                // Try again after creating table
                verifyBackupCode();
            });
        } else {
            // Table exists, proceed
            verifyBackupCode();
        }
    });

    function verifyBackupCode() {
        // Find and verify backup code
        db.query(
            'SELECT id FROM user_backup_codes WHERE user_id = ? AND backup_code = ? AND used = 0',
            [userId, backupCode],
            (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!rows || rows.length === 0) {
                    // Log failed backup code attempt
                    logLoginActivity(db, userId, 'failed_backup', req);
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid or already used backup code'
                    });
                }

                // Mark backup code as used
                db.query(
                    'UPDATE user_backup_codes SET used = 1, used_at = NOW() WHERE id = ?',
                    [rows[0].id],
                    (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating backup code:', updateErr);
                        }

                        // Get user details
                        db.query(
                            'SELECT id, name, email, phone, address, avatar, is_premium FROM users WHERE id = ?',
                            [userId],
                            (err, userRows) => {
                                if (err || !userRows || userRows.length === 0) {
                                    return res.status(500).json({
                                        success: false,
                                        message: 'User not found'
                                    });
                                }

                                const user = userRows[0];

                                // Generate final JWT
                                const token = generateJWT({
                                    userId: user.id,
                                    email: user.email,
                                    phone: user.phone
                                });

                                // Log successful login with backup code
                                logLoginActivity(db, userId, 'success_backup', req);

                                // ✅ FIXED: Create session with UUID
                                createSession(db, userId, req);

                                // Format avatar URL if exists
                                let avatar = user.avatar;
                                if (avatar && !avatar.startsWith('http')) {
                                    avatar = `http://localhost:5000/uploads/avatars/${path.basename(avatar)}`;
                                }

                                return res.json({
                                    success: true,
                                    message: 'Backup code verification successful. Please generate new backup codes.',
                                    token,
                                    user: {
                                        id: user.id,
                                        name: user.name,
                                        email: user.email,
                                        phone: user.phone,
                                        address: user.address || '',
                                        is_premium: user.is_premium || 0,
                                        avatar: avatar || null
                                    },
                                    backupCodeUsed: true
                                });
                            }
                        );
                    }
                );
            }
        );
    }
});

router.post('/resend-2fa', (req, res) => {
    const { tempToken } = req.body;

    if (!tempToken) {
        return res.status(400).json({
            success: false,
            message: 'Temporary token is required'
        });
    }

    // Verify temporary token
    let decoded;
    try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (decoded.purpose !== '2fa-verification') {
            throw new Error('Invalid token purpose');
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    // Generate new temporary token (extend session)
    const newTempToken = generateTempToken(decoded.userId);

    return res.json({
        success: true,
        message: '2FA session extended',
        tempToken: newTempToken
    });
});

// ============================================
// GOOGLE AUTH ROUTE (Unchanged)
// ============================================

router.post('/auth/google', async (req, res) => {
    const db = getDb(req);
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, message: 'Token required' });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email?.toLowerCase();
        const name = payload.name;
        const picture = payload.picture;

        // Check if user exists
        const existing = await new Promise((resolve, reject) =>
            db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email],
                (err, rows) => err ? reject(err) : resolve(rows)
            )
        );

        let user;
        if (existing.length === 0) {
            // Create new user
            const result = await new Promise((resolve, reject) =>
                db.query(
                    'INSERT INTO users (name, email, google_id, avatar, auth_method, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [name, email, googleId, picture, 'google', 1, 1],
                    (err, r) => err ? reject(err) : resolve(r)
                )
            );
            user = {
                id: result.insertId,
                name,
                email,
                google_id: googleId,
                avatar: picture,
                auth_method: 'google',
                is_verified: 1,
                is_premium: 0
            };

            // Log successful registration/login
            logLoginActivity(db, user.id, 'success', req);

            // ✅ FIXED: Create session with UUID
            createSession(db, user.id, req);

            const authToken = generateJWT({ userId: user.id, email: user.email });

            return res.json({
                success: true,
                token: authToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    is_premium: user.is_premium || 0
                }
            });
        } else {
            user = existing[0];

            // Check if user has 2FA enabled
            checkTwoFAStatus(db, user.id, (err, twoFAEnabled) => {
                if (err) {
                    console.error('Error checking 2FA status:', err);
                }

                if (twoFAEnabled) {
                    // User has 2FA enabled - generate temporary token
                    const tempToken = generateTempToken(user.id);

                    // Log login attempt (pending verification)
                    logLoginActivity(db, user.id, 'pending_2fa', req);

                    return res.json({
                        success: true,
                        requiresTwoFA: true,
                        tempToken: tempToken,
                        message: '2FA verification required',
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            hasTwoFA: true
                        }
                    });
                } else {
                    // No 2FA - complete login normally
                    const authToken = generateJWT({ userId: user.id, email: user.email });

                    // Log successful login
                    logLoginActivity(db, user.id, 'success', req);

                    // ✅ FIXED: Create session with UUID
                    createSession(db, user.id, req);

                    return res.json({
                        success: true,
                        token: authToken,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            avatar: user.avatar,
                            is_premium: user.is_premium || 0
                        }
                    });
                }
            });
        }

    } catch (err) {
        console.error('Google auth error:', err);
        return res.status(401).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
});

// ============================================
// FORGOT PASSWORD ROUTES (Your existing code)
// ============================================

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
                      
                      <p>If you didn't request a password reset, you can safely ignore this email. Your account will remain secure.</p>
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