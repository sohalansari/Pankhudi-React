const express = require('express');
const Razorpay = require('razorpay');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // For sending OTP via email
const crypto = require('crypto')
const authenticate = require('./middleware/auth');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router(); // Add this line
// const profileRoute = require('./routes/profile');
const generateJWT = require('./utils/generateJWT');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());
// Use profile route
// app.use('/api/profile', profileRoute);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ---------------------------(MySQL database connection setup)------------------------------------------------------------
// DB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'user_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err);
        return;
    }
    console.log('MySQL connected');
});

app.use(cors());
app.use(bodyParser.json());

//--------------------------------------------- Start server----------------------------------------------------------------



// ====================== profile ----------====================
// // Get user profile (with additional security checks)
// router.get('/api/users/:id', authenticate, async (req, res) => {
//     try {
//         const userId = req.params.id;

//         // Verify the requesting user has access to this profile
//         if (req.user.id !== parseInt(userId)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized access to this profile'
//             });
//         }

//         const [rows] = await connection.execute(
//             'SELECT id, name, email, phone, address, created_at, is_verified FROM users WHERE id = ? AND is_deleted = 0',
//             [userId]
//         );

//         if (rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         // Omit sensitive data even if selected
//         const userData = rows[0];
//         delete userData.password;
//         delete userData.otp;
//         delete userData.otp_expiration;

//         res.json({
//             success: true,
//             user: userData
//         });
//     } catch (error) {
//         console.error('Profile fetch error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// // Update user profile (with validation)
// router.put('/api/users/:id', authenticate, async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const { name, phone, address } = req.body;

//         // Validate request data
//         if (!name || typeof name !== 'string') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid name is required'
//             });
//         }

//         // Verify the user can only update their own profile
//         if (req.user.id !== parseInt(userId)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized to update this profile'
//             });
//         }

//         // Update only allowed fields
//         await connection.execute(
//             'UPDATE users SET name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
//             [name, phone || null, address || null, userId] // Convert empty strings to NULL
//         );

//         // Get updated user data to return
//         const [updatedRows] = await connection.execute(
//             'SELECT id, name, email, phone, address FROM users WHERE id = ?',
//             [userId]
//         );

//         res.json({
//             success: true,
//             message: 'Profile updated successfully',
//             user: updatedRows[0]
//         });
//     } catch (error) {
//         console.error('Profile update error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update profile',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });




//------------------------------------ Ragister option ----------------------------------------------------------------------------
// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration - IMPORTANT for frontend-backend communication
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Registration endpoint
app.post('/api/register', async (req, res) => {
    console.log('\n===== 📥 NEW REGISTRATION REQUEST =====');
    console.log('🔵 Received body:', req.body);

    try {
        // Destructure and sanitize inputs
        let { name, email, password, phone, address } = req.body;
        name = name?.trim();
        email = email?.trim().toLowerCase();
        phone = phone?.trim();
        address = address?.trim();

        const errors = {};
        const messages = [];

        // Input validations
        if (!name || name.length < 3) {
            errors.name = 'Name must be at least 3 characters long';
            messages.push('Name must be at least 3 characters long');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Enter a valid email address';
            messages.push('Enter a valid email address');
        }
        if (!phone || !/^\d{10}$/.test(phone)) {
            errors.phone = 'Phone number must be exactly 10 digits';
            messages.push('Phone number must be exactly 10 digits');
        }
        if (!password || password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
            messages.push('Password must be at least 8 characters');
        }
        if (!address || address.length < 10) {
            errors.address = 'Address must be at least 10 characters long';
            messages.push('Address must be at least 10 characters long');
        }

        if (Object.keys(errors).length > 0) {
            console.log('🟠 Validation errors:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                messages,
                errors
            });
        }

        console.log('✅ All validations passed');

        // Check if user already exists
        const [emailExists, phoneExists] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(
                    'SELECT email FROM users WHERE email = ? AND is_active = true AND is_deleted = false',
                    [email],
                    (err, results) => err ? reject(err) : resolve(results.length > 0)
                );
            }),
            new Promise((resolve, reject) => {
                db.query(
                    'SELECT phone FROM users WHERE phone = ? AND is_active = true AND is_deleted = false',
                    [phone],
                    (err, results) => err ? reject(err) : resolve(results.length > 0)
                );
            })
        ]);

        if (emailExists || phoneExists) {
            const existErrors = {};
            const existMessages = [];

            if (emailExists) {
                existErrors.email = 'Email already registered';
                existMessages.push('Email already registered');
            }
            if (phoneExists) {
                existErrors.phone = 'Phone number already registered';
                existMessages.push('Phone number already registered');
            }

            console.log('⚠️ User already exists:', existErrors);
            return res.status(409).json({
                success: false,
                message: 'User already exists',
                messages: existMessages,
                errors: existErrors
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('🔐 Password hashed');

        // Insert new user
        db.query(
            'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, address],
            async (err, result) => {
                if (err) {
                    console.error('🔴 DB Error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error',
                        messages: ['Database operation failed'],
                        error: err.message
                    });
                }

                console.log('✅ User created with ID:', result.insertId);

                // Generate JWT token
                const token = jwt.sign(
                    { userId: result.insertId, email, phone },
                    process.env.JWT_SECRET || 'your_jwt_secret',
                    { expiresIn: '1h' }
                );

                console.log('🟢 JWT generated');

                res.status(201).json({
                    success: true,
                    message: 'Registration successful',
                    messages: ['Registration successful'],
                    token,
                    user: {
                        id: result.insertId,
                        name,
                        email,
                        phone,
                        address
                    }
                });
            }
        );
    } catch (error) {
        console.error('🔴 Unexpected error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            messages: ['Internal server error'],
            error: error.message
        });
    } finally {
        console.log('===== ✅ REGISTRATION COMPLETED =====\n');
    }
});

// ----------------------------------Login Option ------------------------------------------------------------------------------
app.post('/login', (req, res) => {
    const { emailOrPhone, password } = req.body;  // Get the value of emailOrPhone

    // Check if emailOrPhone is provided
    if (!emailOrPhone) {
        return res.status(400).json({ message: 'Email or Phone number is required' });
    }

    // Check if the provided emailOrPhone is an email or phone
    const isEmail = emailOrPhone.includes('@');
    let query = '';
    let queryParams = [];

    if (isEmail) {
        // Query by email if it's an email address
        query = 'SELECT * FROM users WHERE email = ? AND is_active = true AND is_deleted = false';
        queryParams = [emailOrPhone];
    } else {
        // Query by phone if it's a phone number
        query = 'SELECT * FROM users WHERE phone = ? AND is_active = true AND is_deleted = false';
        queryParams = [emailOrPhone];
    }

    // Query to find the user by email or phone
    db.query(query, queryParams, async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error logging in' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email/phone number or user is inactive' });
        }
        const user = results[0];

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        // Send token and success message
        res.json({ message: 'Login successful', token });
    });
});



//----------------------------------------Google login function -------------------------------------------------------
// Endpoint to verify Google token
app.post('/auth/google', async (req, res) => {
    try {
        const { token } = req.body;

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists in your database
        let users = await query('SELECT * FROM users WHERE google_id = ?', [googleId]);

        let user;
        if (users.length === 0) {
            // Create new user if not found
            const result = await query('INSERT INTO users (name, email, google_id, avatar, auth_method, is_verified) VALUES (?, ?, ?, ?, ?, ?)', [name, email, googleId, picture, 'google', 1]);
            user = { id: result.insertId, name, email, google_id: googleId, avatar: picture, auth_method: 'google', is_verified: 1, is_premium: 0 };
        } else {
            user = users[0];
        }

        // Generate JWT token for session
        const authToken = generateJWT(user); // Your JWT generation function

        res.status(200).json({
            success: true,
            token: authToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_premium: user.is_premium,
            },
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ success: false, message: 'Google authentication failed' });
    }
});
//-------------------------------------------------forget_password -----------------------------------------------------------------
// Set up nodemailer transporter for sending OTPs
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sohalansari4934@gmail.com', // Myemail
        pass: 'kqye ofib adts xngc'   // My password
    }
});
// POST route to handle forgot password (OTP generation and email)
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // Check if the email exists in the database
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ? AND is_active = true AND is_deleted = false';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ message: 'Error checking email' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Email not found' });
        }
        const user = results[0];
        // Generate OTP (e.g., a 6-digit code)
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store the OTP in the database (e.g., with an expiration time)
        const otpQuery = 'UPDATE users SET otp = ?, otp_expiration = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?';
        db.query(otpQuery, [otp, email], (err, result) => {
            if (err) {
                console.error('Error storing OTP:', err);
                return res.status(500).json({ message: 'Error sending OTP' });
            }

            const mailOptions = {
                from: 'Pankhudi',
                to: email,
                subject: '🔐 Password Reset OTP - Action Required',
                html: `
                    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                        <p>Hello,</p>
            
                        <p>We received a request to reset your password for your account associated with this email.</p>
            
                        <p>Please use the OTP (One-Time Password) below to proceed with resetting your password:</p>
            
                        <p style="font-size: 24px; font-weight: bold; color: #2d79f3; background-color: #f0f0f0; padding: 10px; border-radius: 8px; display: inline-block;">
                            🔑 OTP Code: ${otp}
                        </p>
            
                        <p>This OTP is valid for the next <strong>15 minutes</strong>. Please do not share this code with anyone for security reasons.</p>
            
                        <p>If you did not request a password reset, you can safely ignore this message and your current password will remain unchanged.</p>
            
                        <br>
                        <p>Thank you,<br>Team Pankhudi<br><em>Secure Support Desk</em></p>
                    </div>
                `
            };


            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending OTP:', err);
                    return res.status(500).json({ message: 'Error sending OTP' });
                }

                res.status(200).json({ message: 'OTP sent to your email', success: true });
            });
        });
    });
});

// --------------------------- ResetPssword(OTP Verify)-----------------------------------------------------------------------
// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    // Use parameterized query to prevent SQL injection
    const query = `SELECT * FROM users WHERE email = ? AND otp = ?`;

    db.query(query, [email, otp], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: 'Error verifying OTP' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or email' });
        }
        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    });
});


// ------------------- ResetPssword(New Password)-----------------------------------------------------------------------
// Endpoint to reset password
app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if the user exists first
    const checkQuery = `SELECT * FROM users WHERE email = ?`;

    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the user's password
        const updateQuery = `UPDATE users SET password = ?, otp = NULL WHERE email = ?`;
        db.query(updateQuery, [hashedPassword, email], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ success: false, message: 'Error resetting password' });
            }

            return res.json({ success: true, message: 'Password reset successfully' });
        });
    });
});



// ----------------------------- Add RazorPay---------------------------------------------------------------------

// // Set up Razorpay instance
// const razorpay = new Razorpay({
//     key_id: 'YOUR_KEY_ID', // Replace with your Razorpay key_id
//     key_secret: 'YOUR_KEY_SECRET' // Replace with your Razorpay key_secret
// });

// app.post('/create-order', async (req, res) => {
//     try {
//         const order = await razorpay.orders.create({
//             amount: 1000, // Amount in paise (₹10)
//             currency: 'INR',
//             receipt: 'order_receipt_1',
//             notes: {
//                 key1: 'value1',
//                 key2: 'value2',
//             }
//         });

//         res.json(order);
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ error: 'Failed to create order' });
//     }
// });

// app.post('/api/addresses', (req, res) => {
//     const { user_id, full_address, city, pincode } = req.body;

//     if (!user_id || !full_address || !city || !pincode) {
//         return res.status(400).json({ message: 'Missing fields' });
//     }

//     const sql = `INSERT INTO addresses (user_id, full_address, city, pincode)
//                  VALUES (?, ?, ?, ?)`;

//     db.query(sql, [user_id, full_address, city, pincode], (err, result) => {
//         if (err) {
//             console.error('Error saving address:', err);
//             return res.status(500).json({ message: 'Database error' });
//         }
//         res.status(200).json({ addressId: result.insertId });
//     });
// });
// order Place
// app.post('/api/orders', (req, res) => {
//     const { user_id, product_id, quantity, size, total_price } = req.body;

//     if (!user_id || !product_id || !quantity || !size || !total_price) {
//         return res.status(400).json({ message: 'Missing fields' });
//     }

//     const sql = `INSERT INTO orders (user_id, product_id, quantity, size, total_price)
//                  VALUES (?, ?, ?, ?, ?)`;

//     db.query(sql, [user_id, product_id, quantity, size, total_price], (err, result) => {
//         if (err) {
//             console.error('Error saving order:', err);
//             return res.status(500).json({ message: 'Database error' });
//         }
//         res.status(200).json({ message: 'Order placed successfully' });
//     });
// });










// ----------------------------------------------------Google Gemini AI -------------------------------------------

require('dotenv').config();
const fetch = require('node-fetch');

const API_KEY = process.env.GOOGLE_API_KEY;


if (!API_KEY) {
    console.error('\n[ERROR] GOOGLE_API_KEY missing. Set it in .env');
    process.exit(1);
}


app.use(cors());
app.use(express.json({ limit: '1mb' }));


// Convert simple chat history (role/content) → Gemini `contents` schema
function toGeminiContents(messages = []) {
    return messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));
}


app.post('/api/chat', async (req, res) => {
    try {
        const { messages = [], model = 'gemini-2.0-flash' } = req.body || {};


        const payload = { contents: toGeminiContents(messages) };


        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


        const r = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });


        const data = await r.json();


        // Extract text safely
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts.map(p => p?.text || '').join('').trim();


        res.json({ text, raw: data });
    } catch (err) {
        console.error('[chat error]', err);
        res.status(500).json({ error: 'Server error', details: String(err) });
    }
});













app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// List all products
app.get("/api/products", (req, res) => {
    const sql = "SELECT * FROM products ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const parsed = results.map(r => ({
            ...r,
            images: JSON.parse(r.images || "[]").map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`)
        }));

        res.json(parsed);
    });
});
// Single product by ID
app.get("/api/products/:id", (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!results.length) return res.status(404).json({ error: "Product not found" });

        const product = {
            ...results[0],
            images: JSON.parse(results[0].images || "[]").map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`)
        };

        res.json(product);
    });
});


































const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;