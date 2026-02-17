// const express = require("express");
// const router = express.Router();
// const authenticate = require("../middleware/auth");
// const bcrypt = require("bcrypt");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const speakeasy = require("speakeasy");
// const QRCode = require("qrcode");

// // ===============================
// // Multer setup for avatar upload
// // ===============================
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, "../uploads/avatars");
//         if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
//     }
// });
// const upload = multer({
//     storage,
//     limits: { fileSize: 5 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = /jpeg|jpg|png|gif|webp/;
//         const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = allowedTypes.test(file.mimetype);

//         if (mimetype && extname) {
//             return cb(null, true);
//         } else {
//             cb(new Error('Only image files are allowed!'));
//         }
//     }
// });

// // ===============================
// // HELPER FUNCTIONS
// // ===============================

// // Safe database query function
// const safeQuery = (db, sql, params, callback) => {
//     try {
//         db.query(sql, params, (err, results) => {
//             if (err) {
//                 return callback(err, null);
//             }
//             callback(null, results);
//         });
//     } catch (error) {
//         callback(error, null);
//     }
// };

// // Check if table exists
// const tableExists = (db, tableName, callback) => {
//     const sql = `SHOW TABLES LIKE '${tableName}'`;
//     safeQuery(db, sql, [], (err, results) => {
//         if (err) return callback(err, false);
//         callback(null, results.length > 0);
//     });
// };

// // ===============================
// // USER PROFILE ENDPOINTS
// // ===============================

// // @desc    Get user profile
// // @route   GET /api/profile
// // @access  Private
// router.get("/profile", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     const sql = `
//         SELECT id, name, email, phone, avatar, is_premium, created_at
//         FROM users
//         WHERE id = ? AND is_deleted = 0
//     `;

//     safeQuery(db, sql, [userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error",
//                 error: err.message
//             });
//         }

//         if (!rows || rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         let user = rows[0];

//         user = {
//             id: user.id,
//             name: user.name || '',
//             email: user.email || '',
//             phone: user.phone || '',
//             avatar: user.avatar || null,
//             is_premium: user.is_premium || 0,
//             createdAt: user.created_at || new Date().toISOString()
//         };

//         // Format avatar URL
//         if (user.avatar) {
//             if (!user.avatar.startsWith('http')) {
//                 user.avatar = `http://localhost:5000/uploads/avatars/${path.basename(user.avatar)}`;
//             }
//         }

//         return res.json({
//             success: true,
//             user,
//             message: "Profile fetched successfully"
//         });
//     });
// });

// // @desc    Update user profile
// // @route   PUT /api/profile
// // @access  Private
// router.put("/profile", authenticate, upload.single("avatar"), async (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { name, email, phone, is_premium, password } = req.body;

//     // Basic validation
//     if (name && name.length < 3) {
//         return res.status(400).json({
//             success: false,
//             message: "Name must be at least 3 characters"
//         });
//     }

//     let hashedPassword = null;
//     if (password && password.length >= 8) {
//         try {
//             hashedPassword = await bcrypt.hash(password, 10);
//         } catch (hashError) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Error processing password"
//             });
//         }
//     }

//     const avatarPath = req.file ? `uploads/avatars/${req.file.filename}` : undefined;

//     // Build update query
//     const updateFields = [];
//     const updateValues = [];

//     if (name) {
//         updateFields.push("name = ?");
//         updateValues.push(name);
//     }
//     if (email) {
//         if (!/^\S+@\S+\.\S+$/.test(email)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid email format"
//             });
//         }
//         updateFields.push("email = ?");
//         updateValues.push(email);
//     }
//     if (phone) {
//         const phoneDigits = phone.replace(/\D/g, '');
//         if (phoneDigits.length < 10) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Phone must be at least 10 digits"
//             });
//         }
//         updateFields.push("phone = ?");
//         updateValues.push(phoneDigits);
//     }
//     if (typeof is_premium !== "undefined") {
//         updateFields.push("is_premium = ?");
//         updateValues.push(is_premium === "1" || is_premium === 1 || is_premium === true ? 1 : 0);
//     }
//     if (hashedPassword) {
//         updateFields.push("password = ?");
//         updateValues.push(hashedPassword);
//     }
//     if (avatarPath) {
//         updateFields.push("avatar = ?");
//         updateValues.push(avatarPath);
//     }

//     if (updateFields.length === 0) {
//         return res.status(400).json({
//             success: false,
//             message: "No valid fields to update"
//         });
//     }

//     // Check if email already exists
//     if (email) {
//         const checkEmailSql = "SELECT id FROM users WHERE email = ? AND id != ? AND is_deleted = 0";
//         safeQuery(db, checkEmailSql, [email, userId], (err, rows) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Server error checking email"
//                 });
//             }
//             if (rows && rows.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Email already exists"
//                 });
//             }
//             proceedWithUpdate();
//         });
//     } else {
//         proceedWithUpdate();
//     }

//     function proceedWithUpdate() {
//         // Delete old avatar if new one is uploaded
//         if (avatarPath) {
//             const oldAvatarSql = "SELECT avatar FROM users WHERE id = ?";
//             safeQuery(db, oldAvatarSql, [userId], (err, rows) => {
//                 if (!err && rows && rows[0] && rows[0].avatar) {
//                     const oldAvatarPath = path.join(__dirname, "../", rows[0].avatar);
//                     if (fs.existsSync(oldAvatarPath)) {
//                         try {
//                             fs.unlinkSync(oldAvatarPath);
//                         } catch (unlinkError) {
//                             // Silently handle unlink error
//                         }
//                     }
//                 }
//                 executeUpdate();
//             });
//         } else {
//             executeUpdate();
//         }
//     }

//     function executeUpdate() {
//         updateValues.push(userId);
//         const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

//         safeQuery(db, sql, updateValues, (err, result) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Failed to update profile",
//                     error: err.message
//                 });
//             }

//             // Return updated user
//             const selectSql = `
//                 SELECT id, name, email, phone, avatar, is_premium, created_at
//                 FROM users
//                 WHERE id = ?
//             `;
//             safeQuery(db, selectSql, [userId], (selectErr, rows) => {
//                 if (selectErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Profile updated but failed to fetch updated data"
//                     });
//                 }

//                 if (!rows || rows.length === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "User not found after update"
//                     });
//                 }

//                 let user = rows[0];
//                 user.createdAt = user.created_at;

//                 if (user.avatar) {
//                     user.avatar = `http://localhost:5000/uploads/avatars/${path.basename(user.avatar)}`;
//                 }

//                 res.json({
//                     success: true,
//                     user,
//                     message: "Profile updated successfully"
//                 });
//             });
//         });
//     }
// });

// // @desc    Delete user avatar
// // @route   DELETE /api/profile/avatar
// // @access  Private
// router.delete("/profile/avatar", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     const sql = `SELECT avatar FROM users WHERE id = ? AND is_deleted = 0`;

//     safeQuery(db, sql, [userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Server error"
//             });
//         }

//         if (!rows || rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const avatarPath = rows[0].avatar;
//         if (avatarPath) {
//             const fullPath = path.join(__dirname, "../", avatarPath);
//             if (fs.existsSync(fullPath)) {
//                 try {
//                     fs.unlinkSync(fullPath);
//                 } catch (unlinkError) {
//                     // Silently handle unlink error
//                 }
//             }
//         }

//         const updateSql = `UPDATE users SET avatar = NULL WHERE id = ?`;
//         safeQuery(db, updateSql, [userId], (updateErr) => {
//             if (updateErr) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Server error updating avatar"
//                 });
//             }

//             res.json({
//                 success: true,
//                 message: "Avatar deleted successfully"
//             });
//         });
//     });
// });

// // ===============================
// // ADDRESS MANAGEMENT ENDPOINTS
// // ===============================

// // @desc    Get all addresses for user
// // @route   GET /api/address
// // @access  Private
// router.get("/address", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     // Check if table exists
//     tableExists(db, 'user_addresses', (err, exists) => {
//         if (err || !exists) {
//             return res.json({
//                 success: true,
//                 addresses: [],
//                 message: "Address table not found"
//             });
//         }

//         const sql = `
//             SELECT id, user_id, address_type, full_name, phone, address_line, 
//                    city, state, postal_code, country, is_default, is_active,
//                    created_at, updated_at
//             FROM user_addresses 
//             WHERE user_id = ? AND is_active = 1
//             ORDER BY is_default DESC, created_at DESC
//         `;

//         safeQuery(db, sql, [userId], (queryErr, rows) => {
//             if (queryErr) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Error fetching addresses",
//                     error: queryErr.message
//                 });
//             }

//             const addresses = (rows || []).map(addr => ({
//                 ...addr,
//                 is_default: addr.is_default === 1 || addr.is_default === true,
//                 is_active: addr.is_active === 1 || addr.is_active === true
//             }));

//             res.json({
//                 success: true,
//                 addresses,
//                 count: addresses.length
//             });
//         });
//     });
// });

// // @desc    Create new address
// // @route   POST /api/address
// // @access  Private
// router.post("/address", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const {
//         address_type,
//         full_name,
//         phone,
//         address_line,
//         city,
//         state,
//         postal_code,
//         country,
//         is_default
//     } = req.body;

//     // Validation
//     if (!full_name || !phone || !address_line || !city || !state || !postal_code) {
//         return res.status(400).json({
//             success: false,
//             message: "All required fields must be filled"
//         });
//     }

//     // Check if table exists
//     tableExists(db, 'user_addresses', (err, exists) => {
//         if (err || !exists) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Address system not available"
//             });
//         }

//         // Phone validation
//         const phoneDigits = phone.replace(/\D/g, '');
//         if (phoneDigits.length < 10) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Phone number must be at least 10 digits"
//             });
//         }

//         const setDefault = is_default === true || is_default === 1 || is_default === "1";

//         // SIMPLIFIED VERSION WITHOUT TRANSACTION
//         const insertAddress = () => {
//             const insertSql = `
//                 INSERT INTO user_addresses 
//                 (user_id, address_type, full_name, phone, address_line, city, 
//                  state, postal_code, country, is_default, is_active)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
//             `;

//             const values = [
//                 userId,
//                 address_type || 'home',
//                 full_name,
//                 phoneDigits,
//                 address_line,
//                 city,
//                 state,
//                 postal_code,
//                 country || 'India',
//                 setDefault ? 1 : 0
//             ];

//             safeQuery(db, insertSql, values, (insertErr, result) => {
//                 if (insertErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Error saving address",
//                         error: insertErr.message
//                     });
//                 }

//                 // Return the created address
//                 const selectSql = `SELECT * FROM user_addresses WHERE id = ?`;
//                 safeQuery(db, selectSql, [result.insertId], (selectErr, addressRows) => {
//                     if (selectErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Error fetching created address"
//                         });
//                     }

//                     const address = addressRows[0];
//                     address.is_default = address.is_default === 1 || address.is_default === true;
//                     address.is_active = address.is_active === 1 || address.is_active === true;

//                     res.json({
//                         success: true,
//                         message: "Address added successfully",
//                         address
//                     });
//                 });
//             });
//         };

//         // If setting as default, update all other addresses first
//         if (setDefault) {
//             const updateSql = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_active = 1`;
//             safeQuery(db, updateSql, [userId], (updateErr) => {
//                 if (updateErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Error updating default addresses"
//                     });
//                 }
//                 insertAddress();
//             });
//         } else {
//             insertAddress();
//         }
//     });
// });

// // @desc    Get single address by ID
// // @route   GET /api/address/:id
// // @access  Private
// router.get("/address/:id", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const addressId = req.params.id;

//     const sql = `
//         SELECT id, user_id, address_type, full_name, phone, address_line, 
//                city, state, postal_code, country, is_default, is_active,
//                created_at, updated_at
//         FROM user_addresses 
//         WHERE id = ? AND user_id = ? AND is_active = 1
//     `;

//     safeQuery(db, sql, [addressId, userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Error fetching address"
//             });
//         }

//         if (!rows || rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Address not found"
//             });
//         }

//         const address = rows[0];
//         address.is_default = address.is_default === 1 || address.is_default === true;
//         address.is_active = address.is_active === 1 || address.is_active === true;

//         res.json({
//             success: true,
//             address
//         });
//     });
// });

// // @desc    Update address
// // @route   PUT /api/address/:id
// // @access  Private
// router.put("/address/:id", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const addressId = req.params.id;
//     const {
//         address_type,
//         full_name,
//         phone,
//         address_line,
//         city,
//         state,
//         postal_code,
//         country,
//         is_default
//     } = req.body;

//     // Validation
//     if (!full_name || !phone || !address_line || !city || !state || !postal_code) {
//         return res.status(400).json({
//             success: false,
//             message: "All required fields must be filled"
//         });
//     }

//     // Check if address exists and belongs to user
//     const checkSql = `SELECT id FROM user_addresses WHERE id = ? AND user_id = ? AND is_active = 1`;
//     safeQuery(db, checkSql, [addressId, userId], (checkErr, rows) => {
//         if (checkErr || !rows || rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Address not found"
//             });
//         }

//         // Phone validation
//         const phoneDigits = phone.replace(/\D/g, '');
//         if (phoneDigits.length < 10) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Phone number must be at least 10 digits"
//             });
//         }

//         const setDefault = is_default === true || is_default === 1 || is_default === "1";

//         // Function to update address
//         const updateAddress = () => {
//             const updateSql = `
//                 UPDATE user_addresses 
//                 SET address_type = ?, full_name = ?, phone = ?, address_line = ?, 
//                     city = ?, state = ?, postal_code = ?, country = ?, 
//                     is_default = ?, updated_at = NOW()
//                 WHERE id = ? AND user_id = ?
//             `;

//             const values = [
//                 address_type || 'home',
//                 full_name,
//                 phoneDigits,
//                 address_line,
//                 city,
//                 state,
//                 postal_code,
//                 country || 'India',
//                 setDefault ? 1 : 0,
//                 addressId,
//                 userId
//             ];

//             safeQuery(db, updateSql, values, (updateErr, result) => {
//                 if (updateErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Error updating address",
//                         error: updateErr.message
//                     });
//                 }

//                 if (result.affectedRows === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "Address not found"
//                     });
//                 }

//                 // Return the updated address
//                 const selectSql = `SELECT * FROM user_addresses WHERE id = ?`;
//                 safeQuery(db, selectSql, [addressId], (selectErr, addressRows) => {
//                     if (selectErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Error fetching updated address"
//                         });
//                     }

//                     const address = addressRows[0];
//                     address.is_default = address.is_default === 1 || address.is_default === true;
//                     address.is_active = address.is_active === 1 || address.is_active === true;

//                     res.json({
//                         success: true,
//                         message: "Address updated successfully",
//                         address
//                     });
//                 });
//             });
//         };

//         // If setting as default, update all other addresses first
//         if (setDefault) {
//             const updateSql = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_active = 1 AND id != ?`;
//             safeQuery(db, updateSql, [userId, addressId], (updateErr) => {
//                 if (updateErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Error updating default addresses"
//                     });
//                 }
//                 updateAddress();
//             });
//         } else {
//             updateAddress();
//         }
//     });
// });

// // @desc    Delete address (soft delete)
// // @route   DELETE /api/address/:id
// // @access  Private
// router.delete("/address/:id", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const addressId = req.params.id;

//     const sql = `UPDATE user_addresses SET is_active = 0, is_default = 0 WHERE id = ? AND user_id = ?`;

//     safeQuery(db, sql, [addressId, userId], (err, result) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Error deleting address"
//             });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Address not found"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Address deleted successfully"
//         });
//     });
// });

// // @desc    Set address as default
// // @route   PUT /api/address/:id/default
// // @access  Private
// router.put("/address/:id/default", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const addressId = req.params.id;

//     // First, check if address exists and belongs to user
//     const checkSql = `SELECT id FROM user_addresses WHERE id = ? AND user_id = ? AND is_active = 1`;
//     safeQuery(db, checkSql, [addressId, userId], (checkErr, rows) => {
//         if (checkErr || !rows || rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Address not found"
//             });
//         }

//         // Step 1: Reset all other addresses to non-default
//         const updateAllSql = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_active = 1`;
//         safeQuery(db, updateAllSql, [userId], (updateErr) => {
//             if (updateErr) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Error resetting default addresses"
//                 });
//             }

//             // Step 2: Set this address as default
//             const updateSql = `UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?`;
//             safeQuery(db, updateSql, [addressId, userId], (setErr, result) => {
//                 if (setErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Error setting default address"
//                     });
//                 }

//                 if (result.affectedRows === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "Address not found"
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     message: "Default address updated successfully"
//                 });
//             });
//         });
//     });
// });

// // @desc    Get default address
// // @route   GET /api/address/default
// // @access  Private
// router.get("/address/default", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     const sql = `
//         SELECT id, user_id, address_type, full_name, phone, address_line, 
//                city, state, postal_code, country, is_default, is_active,
//                created_at, updated_at
//         FROM user_addresses 
//         WHERE user_id = ? AND is_active = 1 AND is_default = 1
//         LIMIT 1
//     `;

//     safeQuery(db, sql, [userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Error fetching default address"
//             });
//         }

//         if (!rows || rows.length === 0) {
//             return res.json({
//                 success: true,
//                 address: null,
//                 message: "No default address set"
//             });
//         }

//         const address = rows[0];
//         address.is_default = address.is_default === 1 || address.is_default === true;
//         address.is_active = address.is_active === 1 || address.is_active === true;

//         res.json({
//             success: true,
//             address
//         });
//     });
// });

// // @desc    Get address types/count
// // @route   GET /api/address/stats
// // @access  Private
// router.get("/address/stats", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     // Check if table exists
//     tableExists(db, 'user_addresses', (err, exists) => {
//         if (err || !exists) {
//             return res.json({
//                 success: true,
//                 stats: {
//                     total: 0,
//                     home: 0,
//                     work: 0,
//                     other: 0,
//                     hasDefault: false
//                 }
//             });
//         }

//         const sql = `
//             SELECT 
//                 COUNT(*) as total,
//                 SUM(CASE WHEN address_type = 'home' THEN 1 ELSE 0 END) as home,
//                 SUM(CASE WHEN address_type = 'work' THEN 1 ELSE 0 END) as work,
//                 SUM(CASE WHEN address_type = 'other' THEN 1 ELSE 0 END) as other,
//                 SUM(CASE WHEN is_default = 1 THEN 1 ELSE 0 END) as has_default
//             FROM user_addresses 
//             WHERE user_id = ? AND is_active = 1
//         `;

//         safeQuery(db, sql, [userId], (queryErr, rows) => {
//             if (queryErr) {
//                 return res.json({
//                     success: true,
//                     stats: {
//                         total: 0,
//                         home: 0,
//                         work: 0,
//                         other: 0,
//                         hasDefault: false
//                     }
//                 });
//             }

//             const stats = rows[0] || {};
//             res.json({
//                 success: true,
//                 stats: {
//                     total: parseInt(stats.total) || 0,
//                     home: parseInt(stats.home) || 0,
//                     work: parseInt(stats.work) || 0,
//                     other: parseInt(stats.other) || 0,
//                     hasDefault: (parseInt(stats.has_default) || 0) > 0
//                 }
//             });
//         });
//     });
// });

// // ===============================
// // SETTINGS ENDPOINTS
// // ===============================

// // @desc    Get user settings
// // @route   GET /api/settings/get
// // @access  Private
// router.get("/settings/get", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     // Default settings
//     const defaultSettings = {
//         theme: "light",
//         language: "english",
//         notifications: {
//             email: true,
//             push: true,
//             sms: false,
//             marketing: false,
//             updates: true
//         },
//         privacy: {
//             profile_visibility: "public",
//             show_online_status: true,
//             allow_tagging: true,
//             search_visibility: true,
//             data_sharing: false
//         }
//     };

//     // First try to get from user_settings table
//     tableExists(db, 'user_settings', (err, exists) => {
//         if (err || !exists) {
//             return res.json({
//                 success: true,
//                 settings: defaultSettings
//             });
//         }

//         const sql = `SELECT theme, language, notifications, privacy FROM user_settings WHERE user_id = ?`;

//         safeQuery(db, sql, [userId], (queryErr, rows) => {
//             if (queryErr) {
//                 return res.json({
//                     success: true,
//                     settings: defaultSettings
//                 });
//             }

//             if (!rows || rows.length === 0) {
//                 return res.json({
//                     success: true,
//                     settings: defaultSettings
//                 });
//             }

//             const dbSettings = rows[0];
//             const settings = { ...defaultSettings };

//             // Override with database values
//             if (dbSettings.theme) settings.theme = dbSettings.theme;
//             if (dbSettings.language) settings.language = dbSettings.language;

//             if (dbSettings.notifications) {
//                 try {
//                     settings.notifications = typeof dbSettings.notifications === 'string'
//                         ? JSON.parse(dbSettings.notifications)
//                         : dbSettings.notifications;
//                 } catch (e) {
//                     // Use default notifications on parse error
//                 }
//             }

//             if (dbSettings.privacy) {
//                 try {
//                     settings.privacy = typeof dbSettings.privacy === 'string'
//                         ? JSON.parse(dbSettings.privacy)
//                         : dbSettings.privacy;
//                 } catch (e) {
//                     // Use default privacy on parse error
//                 }
//             }

//             res.json({
//                 success: true,
//                 settings
//             });
//         });
//     });
// });

// // @desc    Update user settings
// // @route   PUT /api/settings/update
// // @access  Private
// router.put("/settings/update", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { theme, language, notifications, privacy } = req.body;

//     // Check if user_settings table exists
//     tableExists(db, 'user_settings', (err, exists) => {
//         if (err || !exists) {
//             // Create table if it doesn't exist
//             const createTableSql = `
//                 CREATE TABLE IF NOT EXISTS user_settings (
//                     id INT PRIMARY KEY AUTO_INCREMENT,
//                     user_id INT NOT NULL UNIQUE,
//                     theme VARCHAR(20) DEFAULT 'light',
//                     language VARCHAR(20) DEFAULT 'english',
//                     notifications JSON,
//                     privacy JSON,
//                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//                     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//                 )
//             `;

//             safeQuery(db, createTableSql, [], (createErr) => {
//                 if (createErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Settings system not available"
//                     });
//                 }
//                 insertSettings();
//             });
//             return;
//         }

//         // Table exists, proceed with update
//         insertSettings();
//     });

//     function insertSettings() {
//         // Prepare settings data
//         const settingsData = {
//             theme: theme || 'light',
//             language: language || 'english',
//             notifications: notifications ? JSON.stringify(notifications) : JSON.stringify({
//                 email: true,
//                 push: true,
//                 sms: false,
//                 marketing: false,
//                 updates: true
//             }),
//             privacy: privacy ? JSON.stringify(privacy) : JSON.stringify({
//                 profile_visibility: "public",
//                 show_online_status: true,
//                 allow_tagging: true,
//                 search_visibility: true,
//                 data_sharing: false
//             })
//         };

//         // Check if settings exist for user
//         const checkSql = `SELECT id FROM user_settings WHERE user_id = ?`;
//         safeQuery(db, checkSql, [userId], (checkErr, rows) => {
//             if (checkErr) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Server error"
//                 });
//             }

//             if (rows && rows.length > 0) {
//                 // Update existing
//                 const updateSql = `
//                     UPDATE user_settings 
//                     SET theme = ?, language = ?, notifications = ?, privacy = ?, updated_at = NOW()
//                     WHERE user_id = ?
//                 `;
//                 const values = [
//                     settingsData.theme,
//                     settingsData.language,
//                     settingsData.notifications,
//                     settingsData.privacy,
//                     userId
//                 ];

//                 safeQuery(db, updateSql, values, (updateErr) => {
//                     if (updateErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Failed to update settings"
//                         });
//                     }
//                     sendResponse();
//                 });
//             } else {
//                 // Insert new
//                 const insertSql = `
//                     INSERT INTO user_settings 
//                     (user_id, theme, language, notifications, privacy, created_at, updated_at)
//                     VALUES (?, ?, ?, ?, ?, NOW(), NOW())
//                 `;
//                 const values = [
//                     userId,
//                     settingsData.theme,
//                     settingsData.language,
//                     settingsData.notifications,
//                     settingsData.privacy
//                 ];

//                 safeQuery(db, insertSql, values, (insertErr) => {
//                     if (insertErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Failed to save settings"
//                         });
//                     }
//                     sendResponse();
//                 });
//             }

//             function sendResponse() {
//                 const responseSettings = {
//                     theme: settingsData.theme,
//                     language: settingsData.language,
//                     notifications: JSON.parse(settingsData.notifications),
//                     privacy: JSON.parse(settingsData.privacy)
//                 };

//                 res.json({
//                     success: true,
//                     message: "Settings updated successfully",
//                     settings: responseSettings
//                 });
//             }
//         });
//     }
// });

// // ===============================
// // SECURITY ENDPOINTS
// // ===============================

// // @desc    Get 2FA status
// // @route   GET /api/security/two-fa/status
// // @access  Private
// router.get("/security/two-fa/status", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     // Check if two_fa table exists
//     tableExists(db, 'two_fa', (err, exists) => {
//         if (err || !exists) {
//             return res.json({
//                 success: true,
//                 enabled: false,
//                 hasSecret: false
//             });
//         }

//         const sql = `SELECT enabled FROM two_fa WHERE user_id = ?`;
//         safeQuery(db, sql, [userId], (queryErr, rows) => {
//             if (queryErr) {
//                 return res.json({
//                     success: true,
//                     enabled: false,
//                     hasSecret: false
//                 });
//             }

//             const enabled = rows && rows[0] && rows[0].enabled === 1;
//             res.json({
//                 success: true,
//                 enabled: enabled,
//                 hasSecret: false
//             });
//         });
//     });
// });

// // @desc    Setup 2FA - Generate secret
// // @route   GET /api/security/two-fa/setup
// // @access  Private
// router.get("/security/two-fa/setup", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     // Check if two_fa table exists
//     tableExists(db, 'two_fa', (err, exists) => {
//         if (err || !exists) {
//             const createTableSql = `
//                 CREATE TABLE IF NOT EXISTS two_fa (
//                     id INT PRIMARY KEY AUTO_INCREMENT,
//                     user_id INT NOT NULL UNIQUE,
//                     secret VARCHAR(255) NOT NULL,
//                     backup_codes JSON,
//                     enabled BOOLEAN DEFAULT FALSE,
//                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//                     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//                 )
//             `;

//             safeQuery(db, createTableSql, [], (createErr) => {
//                 if (createErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "2FA system not available"
//                     });
//                 }
//                 generateSecret();
//             });
//             return;
//         }

//         generateSecret();
//     });

//     function generateSecret() {
//         // Generate secret using speakeasy
//         try {
//             const secret = speakeasy.generateSecret({
//                 length: 20,
//                 name: `Pankhudi:${req.user.email}`,
//                 issuer: "Pankhudi"
//             });

//             // Save secret to database (temporarily, not enabled yet)
//             const checkSql = `SELECT id FROM two_fa WHERE user_id = ?`;
//             safeQuery(db, checkSql, [userId], (checkErr, rows) => {
//                 if (checkErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Server error"
//                     });
//                 }

//                 if (rows && rows.length > 0) {
//                     // Update existing
//                     const updateSql = `UPDATE two_fa SET secret = ?, enabled = 0 WHERE user_id = ?`;
//                     safeQuery(db, updateSql, [secret.base32, userId], (updateErr) => {
//                         if (updateErr) {
//                             return res.status(500).json({
//                                 success: false,
//                                 message: "Failed to save secret"
//                             });
//                         }
//                         sendResponse(secret);
//                     });
//                 } else {
//                     // Insert new
//                     const insertSql = `INSERT INTO two_fa (user_id, secret, enabled) VALUES (?, ?, 0)`;
//                     safeQuery(db, insertSql, [userId, secret.base32], (insertErr) => {
//                         if (insertErr) {
//                             return res.status(500).json({
//                                 success: false,
//                                 message: "Failed to save secret"
//                             });
//                         }
//                         sendResponse(secret);
//                     });
//                 }

//                 function sendResponse(secret) {
//                     res.json({
//                         success: true,
//                         secret: secret.base32,
//                         otpauth_url: secret.otpauth_url
//                     });
//                 }
//             });
//         } catch (error) {
//             // Fallback to mock secret
//             const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
//             let secret = '';
//             for (let i = 0; i < 16; i++) {
//                 secret += chars.charAt(Math.floor(Math.random() * chars.length));
//             }

//             const otpauth_url = `otpauth://totp/Pankhudi:${req.user.email}?secret=${secret}&issuer=Pankhudi`;

//             res.json({
//                 success: true,
//                 secret: secret,
//                 otpauth_url: otpauth_url
//             });
//         }
//     }
// });

// // @desc    Verify and enable 2FA
// // @route   POST /api/security/two-fa/verify
// // @access  Private
// router.post("/security/two-fa/verify", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { code } = req.body;

//     if (!code || code.length !== 6) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid verification code"
//         });
//     }

//     // Get user's secret from database
//     const getSecretSql = `SELECT secret, enabled FROM two_fa WHERE user_id = ?`;
//     safeQuery(db, getSecretSql, [userId], (err, rows) => {
//         if (err || !rows || rows.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "2FA not set up. Please setup 2FA first."
//             });
//         }

//         const userSecret = rows[0].secret;
//         const isEnabled = rows[0].enabled === 1;

//         // Verify token using speakeasy
//         try {
//             const verified = speakeasy.totp.verify({
//                 secret: userSecret,
//                 encoding: 'base32',
//                 token: code.toString(),
//                 window: 2
//             });

//             // For development mode, accept any 6-digit code
//             if (process.env.NODE_ENV === 'development' && /^\d{6}$/.test(code)) {
//                 // Generate backup codes
//                 const backupCodes = Array.from({ length: 8 }, () =>
//                     Math.random().toString(36).substring(2, 10).toUpperCase()
//                 );

//                 const updateSql = `
//                     UPDATE two_fa 
//                     SET enabled = 1, backup_codes = ?, updated_at = NOW() 
//                     WHERE user_id = ?
//                 `;

//                 safeQuery(db, updateSql, [JSON.stringify(backupCodes), userId], (updateErr) => {
//                     if (updateErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Failed to enable 2FA"
//                         });
//                     }

//                     return res.json({
//                         success: true,
//                         message: "2FA enabled successfully (Development Mode)",
//                         backupCodes: backupCodes
//                     });
//                 });
//                 return;
//             }

//             if (!verified) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid verification code"
//                 });
//             }

//             // Enable 2FA and generate backup codes
//             const backupCodes = Array.from({ length: 8 }, () =>
//                 Math.random().toString(36).substring(2, 10).toUpperCase()
//             );

//             const updateSql = `
//                 UPDATE two_fa 
//                 SET enabled = 1, backup_codes = ?, updated_at = NOW() 
//                 WHERE user_id = ?
//             `;

//             safeQuery(db, updateSql, [JSON.stringify(backupCodes), userId], (updateErr) => {
//                 if (updateErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Failed to enable 2FA"
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     message: "2FA enabled successfully",
//                     backupCodes: backupCodes
//                 });
//             });
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Verification system error"
//             });
//         }
//     });
// });

// // @desc    Verify 2FA code (for login)
// // @route   POST /api/security/two-fa/validate
// // @access  Private
// router.post("/security/two-fa/validate", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { code } = req.body;

//     if (!code || code.length !== 6) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid verification code"
//         });
//     }

//     // Get user's secret and enabled status
//     const getSql = `SELECT secret, enabled, backup_codes FROM two_fa WHERE user_id = ?`;
//     safeQuery(db, getSql, [userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         if (!rows || rows.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "2FA not set up"
//             });
//         }

//         const userData = rows[0];

//         // Check if 2FA is enabled
//         if (!userData.enabled) {
//             return res.status(400).json({
//                 success: false,
//                 message: "2FA is not enabled"
//             });
//         }

//         const userSecret = userData.secret;
//         let backupCodes = [];

//         try {
//             if (userData.backup_codes) {
//                 backupCodes = JSON.parse(userData.backup_codes);
//             }
//         } catch (e) {
//             // Silently handle parse error
//         }

//         // Try TOTP verification
//         try {
//             const verified = speakeasy.totp.verify({
//                 secret: userSecret,
//                 encoding: 'base32',
//                 token: code.toString(),
//                 window: 2
//             });

//             if (verified) {
//                 return res.json({
//                     success: true,
//                     message: "2FA verification successful"
//                 });
//             }

//             // Check if it's a backup code
//             if (Array.isArray(backupCodes) && backupCodes.includes(code)) {
//                 // Remove used backup code
//                 const updatedBackupCodes = backupCodes.filter(c => c !== code);

//                 const updateSql = `UPDATE two_fa SET backup_codes = ? WHERE user_id = ?`;
//                 safeQuery(db, updateSql, [JSON.stringify(updatedBackupCodes), userId], (updateErr) => {
//                     // Don't fail if backup code update fails
//                     return res.json({
//                         success: true,
//                         message: "2FA verification successful with backup code",
//                         backupCodeUsed: true
//                     });
//                 });
//                 return;
//             }

//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid verification code"
//             });
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Verification failed"
//             });
//         }
//     });
// });

// // @desc    Disable 2FA
// // @route   POST /api/security/two-fa/disable
// // @access  Private
// router.post("/security/two-fa/disable", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     const sql = `UPDATE two_fa SET enabled = 0, backup_codes = NULL WHERE user_id = ?`;
//     safeQuery(db, sql, [userId], (err) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to disable 2FA"
//             });
//         }

//         res.json({
//             success: true,
//             message: "2FA disabled successfully"
//         });
//     });
// });

// // @desc    Get backup codes
// // @route   GET /api/security/two-fa/backup-codes
// // @access  Private
// router.get("/security/two-fa/backup-codes", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     const sql = `SELECT backup_codes FROM two_fa WHERE user_id = ?`;
//     safeQuery(db, sql, [userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch backup codes"
//             });
//         }

//         let backupCodes = [];
//         if (rows && rows.length > 0 && rows[0].backup_codes) {
//             try {
//                 backupCodes = JSON.parse(rows[0].backup_codes);
//             } catch (e) {
//                 // Return empty array on parse error
//             }
//         }

//         res.json({
//             success: true,
//             backupCodes: backupCodes
//         });
//     });
// });

// // @desc    Save backup codes
// // @route   POST /api/security/two-fa/backup-codes
// // @access  Private
// router.post("/security/two-fa/backup-codes", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { backupCodes } = req.body;

//     if (!backupCodes || !Array.isArray(backupCodes)) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid backup codes"
//         });
//     }

//     const sql = `UPDATE two_fa SET backup_codes = ? WHERE user_id = ?`;
//     safeQuery(db, sql, [JSON.stringify(backupCodes), userId], (err) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to save backup codes"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Backup codes saved successfully"
//         });
//     });
// });

// // @desc    Get login activity
// // @route   GET /api/security/login-activity
// // @access  Private
// router.get("/security/login-activity", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const limit = parseInt(req.query.limit) || 50;

//     // Check if login_activity table exists
//     tableExists(db, 'login_activity', (err, exists) => {
//         if (err || !exists) {
//             // Return mock data
//             const mockActivities = [
//                 {
//                     id: 1,
//                     action: 'Login',
//                     browser: 'Chrome',
//                     os: 'Windows 10',
//                     device_type: 'desktop',
//                     location: 'New Delhi, India',
//                     ip_address: '192.168.1.100',
//                     status: 'success',
//                     timestamp: new Date().toISOString()
//                 }
//             ];
//             return res.json({
//                 success: true,
//                 activities: mockActivities,
//                 message: "Using sample login activity data"
//             });
//         }

//         const sql = `
//             SELECT id, action, ip_address, user_agent, browser, os, 
//                    device_type, location, status, timestamp
//             FROM login_activity 
//             WHERE user_id = ?
//             ORDER BY timestamp DESC
//             LIMIT ?
//         `;

//         safeQuery(db, sql, [userId, limit], (queryErr, rows) => {
//             if (queryErr) {
//                 return res.json({
//                     success: true,
//                     activities: []
//                 });
//             }

//             res.json({
//                 success: true,
//                 activities: rows || []
//             });
//         });
//     });
// });

// // @desc    Get active sessions
// // @route   GET /api/security/sessions
// // @access  Private
// router.get("/security/sessions", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     // Check if sessions table exists
//     tableExists(db, 'sessions', (err, exists) => {
//         if (err || !exists) {
//             return res.json({
//                 success: true,
//                 sessions: [],
//                 message: "Session tracking not implemented"
//             });
//         }

//         const sql = `
//             SELECT id, session_id, device_type, browser, os, 
//                    ip_address, last_active, created_at
//             FROM sessions 
//             WHERE user_id = ?
//             ORDER BY last_active DESC
//         `;

//         safeQuery(db, sql, [userId], (queryErr, rows) => {
//             if (queryErr) {
//                 return res.json({
//                     success: true,
//                     sessions: []
//                 });
//             }

//             const sessions = (rows || []).map(session => ({
//                 ...session,
//                 current: false
//             }));

//             res.json({
//                 success: true,
//                 sessions: sessions
//             });
//         });
//     });
// });

// // @desc    Revoke session
// // @route   DELETE /api/security/sessions/:id
// // @access  Private
// router.delete("/security/sessions/:id", authenticate, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const sessionId = req.params.id;

//     const sql = `DELETE FROM sessions WHERE id = ? AND user_id = ?`;
//     safeQuery(db, sql, [sessionId, userId], (err, result) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to revoke session"
//             });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Session not found"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Session revoked successfully"
//         });
//     });
// });

// // ===============================
// // ACCOUNT MANAGEMENT
// // ===============================

// // @desc    Delete account (soft delete)
// // @route   DELETE /api/account
// // @access  Private
// router.delete("/account", authenticate, async (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { password } = req.body;

//     if (!password) {
//         return res.status(400).json({
//             success: false,
//             message: "Password is required"
//         });
//     }

//     // Verify password
//     const userSql = `SELECT password FROM users WHERE id = ? AND is_deleted = 0`;
//     safeQuery(db, userSql, [userId], async (err, rows) => {
//         if (err || !rows || rows.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid credentials"
//             });
//         }

//         try {
//             const isMatch = await bcrypt.compare(password, rows[0].password);
//             if (!isMatch) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid password"
//                 });
//             }

//             // Soft delete user
//             const deleteSql = `
//                 UPDATE users 
//                 SET is_deleted = 1, deleted_at = NOW(), 
//                     email = CONCAT(email, '_deleted_', UNIX_TIMESTAMP())
//                 WHERE id = ?
//             `;

//             safeQuery(db, deleteSql, [userId], (deleteErr) => {
//                 if (deleteErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Failed to delete account"
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     message: "Account deleted successfully"
//                 });
//             });
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: "Server error"
//             });
//         }
//     });
// });

// // ===============================
// // PASSWORD MANAGEMENT
// // ===============================

// // @desc    Update password
// // @route   PUT /api/profile/password
// // @access  Private
// router.put("/profile/password", authenticate, async (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//         return res.status(400).json({
//             success: false,
//             message: "Both current and new password are required"
//         });
//     }

//     const sql = `SELECT password FROM users WHERE id = ? AND is_deleted = 0`;
//     safeQuery(db, sql, [userId], async (err, rows) => {
//         if (err || !rows || rows.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid credentials"
//             });
//         }

//         try {
//             const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
//             if (!isMatch) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Current password is incorrect"
//                 });
//             }

//             if (newPassword.length < 8) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "New password must be at least 8 characters"
//                 });
//             }

//             const hashedPassword = await bcrypt.hash(newPassword, 10);

//             const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
//             safeQuery(db, updateSql, [hashedPassword, userId], (updateErr) => {
//                 if (updateErr) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Failed to update password"
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     message: "Password updated successfully"
//                 });
//             });
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: "Server error"
//             });
//         }
//     });
// });

// module.exports = router;









const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const speakeasy = require("speakeasy");
const { v4: uuidv4 } = require('uuid'); // Added for unique session IDs

// ===============================
// Multer setup for avatar upload
// ===============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/avatars");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// ===============================
// HELPER FUNCTIONS
// ===============================

// Safe database query function
const safeQuery = (db, sql, params, callback) => {
    try {
        db.query(sql, params, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    } catch (error) {
        callback(error, null);
    }
};

// Check if table exists
const tableExists = (db, tableName, callback) => {
    const sql = `SHOW TABLES LIKE '${tableName}'`;
    safeQuery(db, sql, [], (err, results) => {
        if (err) return callback(err, false);
        callback(null, results.length > 0);
    });
};

// Parse browser from user agent
const getBrowserFromUA = (ua) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
    return 'Unknown';
};

// Parse OS from user agent
const getOSFromUA = (ua) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
};

// ===============================
// USER PROFILE ENDPOINTS
// ===============================

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get("/profile", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `
        SELECT id, name, email, phone, avatar, is_premium, created_at
        FROM users
        WHERE id = ? AND is_deleted = 0
    `;

    safeQuery(db, sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error",
                error: err.message
            });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let user = rows[0];

        user = {
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar: user.avatar || null,
            is_premium: user.is_premium || 0,
            createdAt: user.created_at || new Date().toISOString()
        };

        // Format avatar URL
        if (user.avatar) {
            if (!user.avatar.startsWith('http')) {
                user.avatar = `http://localhost:5000/uploads/avatars/${path.basename(user.avatar)}`;
            }
        }

        return res.json({
            success: true,
            user,
            message: "Profile fetched successfully"
        });
    });
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put("/profile", authenticate, upload.single("avatar"), async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { name, email, phone, is_premium, password } = req.body;

    // Basic validation
    if (name && name.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 3 characters"
        });
    }

    let hashedPassword = null;
    if (password && password.length >= 8) {
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashError) {
            return res.status(500).json({
                success: false,
                message: "Error processing password"
            });
        }
    }

    const avatarPath = req.file ? `uploads/avatars/${req.file.filename}` : undefined;

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (name) {
        updateFields.push("name = ?");
        updateValues.push(name);
    }
    if (email) {
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        updateFields.push("email = ?");
        updateValues.push(email);
    }
    if (phone) {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Phone must be at least 10 digits"
            });
        }
        updateFields.push("phone = ?");
        updateValues.push(phoneDigits);
    }
    if (typeof is_premium !== "undefined") {
        updateFields.push("is_premium = ?");
        updateValues.push(is_premium === "1" || is_premium === 1 || is_premium === true ? 1 : 0);
    }
    if (hashedPassword) {
        updateFields.push("password = ?");
        updateValues.push(hashedPassword);
    }
    if (avatarPath) {
        updateFields.push("avatar = ?");
        updateValues.push(avatarPath);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No valid fields to update"
        });
    }

    // Check if email already exists
    if (email) {
        const checkEmailSql = "SELECT id FROM users WHERE email = ? AND id != ? AND is_deleted = 0";
        safeQuery(db, checkEmailSql, [email, userId], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Server error checking email"
                });
            }
            if (rows && rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }
            proceedWithUpdate();
        });
    } else {
        proceedWithUpdate();
    }

    function proceedWithUpdate() {
        // Delete old avatar if new one is uploaded
        if (avatarPath) {
            const oldAvatarSql = "SELECT avatar FROM users WHERE id = ?";
            safeQuery(db, oldAvatarSql, [userId], (err, rows) => {
                if (!err && rows && rows[0] && rows[0].avatar) {
                    const oldAvatarPath = path.join(__dirname, "../", rows[0].avatar);
                    if (fs.existsSync(oldAvatarPath)) {
                        try {
                            fs.unlinkSync(oldAvatarPath);
                        } catch (unlinkError) {
                            // Silently handle unlink error
                        }
                    }
                }
                executeUpdate();
            });
        } else {
            executeUpdate();
        }
    }

    function executeUpdate() {
        updateValues.push(userId);
        const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

        safeQuery(db, sql, updateValues, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update profile",
                    error: err.message
                });
            }

            // Return updated user
            const selectSql = `
                SELECT id, name, email, phone, avatar, is_premium, created_at
                FROM users
                WHERE id = ?
            `;
            safeQuery(db, selectSql, [userId], (selectErr, rows) => {
                if (selectErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Profile updated but failed to fetch updated data"
                    });
                }

                if (!rows || rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found after update"
                    });
                }

                let user = rows[0];
                user.createdAt = user.created_at;

                if (user.avatar) {
                    user.avatar = `http://localhost:5000/uploads/avatars/${path.basename(user.avatar)}`;
                }

                res.json({
                    success: true,
                    user,
                    message: "Profile updated successfully"
                });
            });
        });
    }
});

// @desc    Delete user avatar
// @route   DELETE /api/profile/avatar
// @access  Private
router.delete("/profile/avatar", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `SELECT avatar FROM users WHERE id = ? AND is_deleted = 0`;

    safeQuery(db, sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const avatarPath = rows[0].avatar;
        if (avatarPath) {
            const fullPath = path.join(__dirname, "../", avatarPath);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (unlinkError) {
                    // Silently handle unlink error
                }
            }
        }

        const updateSql = `UPDATE users SET avatar = NULL WHERE id = ?`;
        safeQuery(db, updateSql, [userId], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({
                    success: false,
                    message: "Server error updating avatar"
                });
            }

            res.json({
                success: true,
                message: "Avatar deleted successfully"
            });
        });
    });
});

// ===============================
// ADDRESS MANAGEMENT ENDPOINTS
// ===============================

// @desc    Get all addresses for user
// @route   GET /api/address
// @access  Private
router.get("/address", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    // Check if table exists
    tableExists(db, 'user_addresses', (err, exists) => {
        if (err || !exists) {
            return res.json({
                success: true,
                addresses: [],
                message: "Address table not found"
            });
        }

        const sql = `
            SELECT id, user_id, address_type, full_name, phone, address_line, 
                   city, state, postal_code, country, is_default, is_active,
                   created_at, updated_at
            FROM user_addresses 
            WHERE user_id = ? AND is_active = 1
            ORDER BY is_default DESC, created_at DESC
        `;

        safeQuery(db, sql, [userId], (queryErr, rows) => {
            if (queryErr) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching addresses",
                    error: queryErr.message
                });
            }

            const addresses = (rows || []).map(addr => ({
                ...addr,
                is_default: addr.is_default === 1 || addr.is_default === true,
                is_active: addr.is_active === 1 || addr.is_active === true
            }));

            res.json({
                success: true,
                addresses,
                count: addresses.length
            });
        });
    });
});

// @desc    Create new address
// @route   POST /api/address
// @access  Private
router.post("/address", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const {
        address_type,
        full_name,
        phone,
        address_line,
        city,
        state,
        postal_code,
        country,
        is_default
    } = req.body;

    // Validation
    if (!full_name || !phone || !address_line || !city || !state || !postal_code) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be filled"
        });
    }

    // Check if table exists
    tableExists(db, 'user_addresses', (err, exists) => {
        if (err || !exists) {
            return res.status(500).json({
                success: false,
                message: "Address system not available"
            });
        }

        // Phone validation
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be at least 10 digits"
            });
        }

        const setDefault = is_default === true || is_default === 1 || is_default === "1";

        const insertAddress = () => {
            const insertSql = `
                INSERT INTO user_addresses 
                (user_id, address_type, full_name, phone, address_line, city, 
                 state, postal_code, country, is_default, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `;

            const values = [
                userId,
                address_type || 'home',
                full_name,
                phoneDigits,
                address_line,
                city,
                state,
                postal_code,
                country || 'India',
                setDefault ? 1 : 0
            ];

            safeQuery(db, insertSql, values, (insertErr, result) => {
                if (insertErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Error saving address",
                        error: insertErr.message
                    });
                }

                const selectSql = `SELECT * FROM user_addresses WHERE id = ?`;
                safeQuery(db, selectSql, [result.insertId], (selectErr, addressRows) => {
                    if (selectErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Error fetching created address"
                        });
                    }

                    const address = addressRows[0];
                    address.is_default = address.is_default === 1 || address.is_default === true;
                    address.is_active = address.is_active === 1 || address.is_active === true;

                    res.json({
                        success: true,
                        message: "Address added successfully",
                        address
                    });
                });
            });
        };

        if (setDefault) {
            const updateSql = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_active = 1`;
            safeQuery(db, updateSql, [userId], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Error updating default addresses"
                    });
                }
                insertAddress();
            });
        } else {
            insertAddress();
        }
    });
});

// @desc    Get single address by ID
// @route   GET /api/address/:id
// @access  Private
router.get("/address/:id", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;

    const sql = `
        SELECT id, user_id, address_type, full_name, phone, address_line, 
               city, state, postal_code, country, is_default, is_active,
               created_at, updated_at
        FROM user_addresses 
        WHERE id = ? AND user_id = ? AND is_active = 1
    `;

    safeQuery(db, sql, [addressId, userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error fetching address"
            });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const address = rows[0];
        address.is_default = address.is_default === 1 || address.is_default === true;
        address.is_active = address.is_active === 1 || address.is_active === true;

        res.json({
            success: true,
            address
        });
    });
});

// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
router.put("/address/:id", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;
    const {
        address_type,
        full_name,
        phone,
        address_line,
        city,
        state,
        postal_code,
        country,
        is_default
    } = req.body;

    if (!full_name || !phone || !address_line || !city || !state || !postal_code) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be filled"
        });
    }

    const checkSql = `SELECT id FROM user_addresses WHERE id = ? AND user_id = ? AND is_active = 1`;
    safeQuery(db, checkSql, [addressId, userId], (checkErr, rows) => {
        if (checkErr || !rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be at least 10 digits"
            });
        }

        const setDefault = is_default === true || is_default === 1 || is_default === "1";

        const updateAddress = () => {
            const updateSql = `
                UPDATE user_addresses 
                SET address_type = ?, full_name = ?, phone = ?, address_line = ?, 
                    city = ?, state = ?, postal_code = ?, country = ?, 
                    is_default = ?, updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;

            const values = [
                address_type || 'home',
                full_name,
                phoneDigits,
                address_line,
                city,
                state,
                postal_code,
                country || 'India',
                setDefault ? 1 : 0,
                addressId,
                userId
            ];

            safeQuery(db, updateSql, values, (updateErr, result) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Error updating address",
                        error: updateErr.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Address not found"
                    });
                }

                const selectSql = `SELECT * FROM user_addresses WHERE id = ?`;
                safeQuery(db, selectSql, [addressId], (selectErr, addressRows) => {
                    if (selectErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Error fetching updated address"
                        });
                    }

                    const address = addressRows[0];
                    address.is_default = address.is_default === 1 || address.is_default === true;
                    address.is_active = address.is_active === 1 || address.is_active === true;

                    res.json({
                        success: true,
                        message: "Address updated successfully",
                        address
                    });
                });
            });
        };

        if (setDefault) {
            const updateSql = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_active = 1 AND id != ?`;
            safeQuery(db, updateSql, [userId, addressId], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Error updating default addresses"
                    });
                }
                updateAddress();
            });
        } else {
            updateAddress();
        }
    });
});

// @desc    Delete address (soft delete)
// @route   DELETE /api/address/:id
// @access  Private
router.delete("/address/:id", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;

    const sql = `UPDATE user_addresses SET is_active = 0, is_default = 0 WHERE id = ? AND user_id = ?`;

    safeQuery(db, sql, [addressId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error deleting address"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            message: "Address deleted successfully"
        });
    });
});

// @desc    Set address as default
// @route   PUT /api/address/:id/default
// @access  Private
router.put("/address/:id/default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;

    const checkSql = `SELECT id FROM user_addresses WHERE id = ? AND user_id = ? AND is_active = 1`;
    safeQuery(db, checkSql, [addressId, userId], (checkErr, rows) => {
        if (checkErr || !rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const updateAllSql = `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_active = 1`;
        safeQuery(db, updateAllSql, [userId], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({
                    success: false,
                    message: "Error resetting default addresses"
                });
            }

            const updateSql = `UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?`;
            safeQuery(db, updateSql, [addressId, userId], (setErr, result) => {
                if (setErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Error setting default address"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Address not found"
                    });
                }

                res.json({
                    success: true,
                    message: "Default address updated successfully"
                });
            });
        });
    });
});

// @desc    Get default address
// @route   GET /api/address/default
// @access  Private
router.get("/address/default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `
        SELECT id, user_id, address_type, full_name, phone, address_line, 
               city, state, postal_code, country, is_default, is_active,
               created_at, updated_at
        FROM user_addresses 
        WHERE user_id = ? AND is_active = 1 AND is_default = 1
        LIMIT 1
    `;

    safeQuery(db, sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error fetching default address"
            });
        }

        if (!rows || rows.length === 0) {
            return res.json({
                success: true,
                address: null,
                message: "No default address set"
            });
        }

        const address = rows[0];
        address.is_default = address.is_default === 1 || address.is_default === true;
        address.is_active = address.is_active === 1 || address.is_active === true;

        res.json({
            success: true,
            address
        });
    });
});

// @desc    Get address types/count
// @route   GET /api/address/stats
// @access  Private
router.get("/address/stats", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    tableExists(db, 'user_addresses', (err, exists) => {
        if (err || !exists) {
            return res.json({
                success: true,
                stats: {
                    total: 0,
                    home: 0,
                    work: 0,
                    other: 0,
                    hasDefault: false
                }
            });
        }

        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN address_type = 'home' THEN 1 ELSE 0 END) as home,
                SUM(CASE WHEN address_type = 'work' THEN 1 ELSE 0 END) as work,
                SUM(CASE WHEN address_type = 'other' THEN 1 ELSE 0 END) as other,
                SUM(CASE WHEN is_default = 1 THEN 1 ELSE 0 END) as has_default
            FROM user_addresses 
            WHERE user_id = ? AND is_active = 1
        `;

        safeQuery(db, sql, [userId], (queryErr, rows) => {
            if (queryErr) {
                return res.json({
                    success: true,
                    stats: {
                        total: 0,
                        home: 0,
                        work: 0,
                        other: 0,
                        hasDefault: false
                    }
                });
            }

            const stats = rows[0] || {};
            res.json({
                success: true,
                stats: {
                    total: parseInt(stats.total) || 0,
                    home: parseInt(stats.home) || 0,
                    work: parseInt(stats.work) || 0,
                    other: parseInt(stats.other) || 0,
                    hasDefault: (parseInt(stats.has_default) || 0) > 0
                }
            });
        });
    });
});

// ===============================
// SETTINGS ENDPOINTS
// ===============================

// @desc    Get user settings
// @route   GET /api/settings/get
// @access  Private
router.get("/settings/get", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const defaultSettings = {
        theme: "light",
        language: "english",
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false,
            updates: true
        },
        privacy: {
            profile_visibility: "public",
            show_online_status: true,
            allow_tagging: true,
            search_visibility: true,
            data_sharing: false
        }
    };

    tableExists(db, 'user_settings', (err, exists) => {
        if (err || !exists) {
            return res.json({
                success: true,
                settings: defaultSettings
            });
        }

        const sql = `SELECT theme, language, notifications, privacy FROM user_settings WHERE user_id = ?`;

        safeQuery(db, sql, [userId], (queryErr, rows) => {
            if (queryErr) {
                return res.json({
                    success: true,
                    settings: defaultSettings
                });
            }

            if (!rows || rows.length === 0) {
                return res.json({
                    success: true,
                    settings: defaultSettings
                });
            }

            const dbSettings = rows[0];
            const settings = { ...defaultSettings };

            if (dbSettings.theme) settings.theme = dbSettings.theme;
            if (dbSettings.language) settings.language = dbSettings.language;

            if (dbSettings.notifications) {
                try {
                    settings.notifications = typeof dbSettings.notifications === 'string'
                        ? JSON.parse(dbSettings.notifications)
                        : dbSettings.notifications;
                } catch (e) {
                    // Use default
                }
            }

            if (dbSettings.privacy) {
                try {
                    settings.privacy = typeof dbSettings.privacy === 'string'
                        ? JSON.parse(dbSettings.privacy)
                        : dbSettings.privacy;
                } catch (e) {
                    // Use default
                }
            }

            res.json({
                success: true,
                settings
            });
        });
    });
});

// @desc    Update user settings
// @route   PUT /api/settings/update
// @access  Private
router.put("/settings/update", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { theme, language, notifications, privacy } = req.body;

    tableExists(db, 'user_settings', (err, exists) => {
        if (err || !exists) {
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS user_settings (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL UNIQUE,
                    theme VARCHAR(20) DEFAULT 'light',
                    language VARCHAR(20) DEFAULT 'english',
                    notifications JSON,
                    privacy JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            safeQuery(db, createTableSql, [], (createErr) => {
                if (createErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Settings system not available"
                    });
                }
                insertSettings();
            });
            return;
        }

        insertSettings();
    });

    function insertSettings() {
        const settingsData = {
            theme: theme || 'light',
            language: language || 'english',
            notifications: notifications ? JSON.stringify(notifications) : JSON.stringify({
                email: true,
                push: true,
                sms: false,
                marketing: false,
                updates: true
            }),
            privacy: privacy ? JSON.stringify(privacy) : JSON.stringify({
                profile_visibility: "public",
                show_online_status: true,
                allow_tagging: true,
                search_visibility: true,
                data_sharing: false
            })
        };

        const checkSql = `SELECT id FROM user_settings WHERE user_id = ?`;
        safeQuery(db, checkSql, [userId], (checkErr, rows) => {
            if (checkErr) {
                return res.status(500).json({
                    success: false,
                    message: "Server error"
                });
            }

            if (rows && rows.length > 0) {
                const updateSql = `
                    UPDATE user_settings 
                    SET theme = ?, language = ?, notifications = ?, privacy = ?, updated_at = NOW()
                    WHERE user_id = ?
                `;
                const values = [
                    settingsData.theme,
                    settingsData.language,
                    settingsData.notifications,
                    settingsData.privacy,
                    userId
                ];

                safeQuery(db, updateSql, values, (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Failed to update settings"
                        });
                    }
                    sendResponse();
                });
            } else {
                const insertSql = `
                    INSERT INTO user_settings 
                    (user_id, theme, language, notifications, privacy, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                `;
                const values = [
                    userId,
                    settingsData.theme,
                    settingsData.language,
                    settingsData.notifications,
                    settingsData.privacy
                ];

                safeQuery(db, insertSql, values, (insertErr) => {
                    if (insertErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Failed to save settings"
                        });
                    }
                    sendResponse();
                });
            }

            function sendResponse() {
                const responseSettings = {
                    theme: settingsData.theme,
                    language: settingsData.language,
                    notifications: JSON.parse(settingsData.notifications),
                    privacy: JSON.parse(settingsData.privacy)
                };

                res.json({
                    success: true,
                    message: "Settings updated successfully",
                    settings: responseSettings
                });
            }
        });
    }
});

// ===============================
// SECURITY ENDPOINTS - UPDATED
// ===============================

// @desc    Get 2FA status
// @route   GET /api/security/two-fa/status
// @access  Private
router.get("/security/two-fa/status", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    tableExists(db, 'two_fa', (err, exists) => {
        if (err || !exists) {
            return res.json({
                success: true,
                enabled: false,
                hasSecret: false
            });
        }

        const sql = `SELECT enabled FROM two_fa WHERE user_id = ?`;
        safeQuery(db, sql, [userId], (queryErr, rows) => {
            if (queryErr) {
                return res.json({
                    success: true,
                    enabled: false,
                    hasSecret: false
                });
            }

            const enabled = rows && rows[0] && rows[0].enabled === 1;
            res.json({
                success: true,
                enabled: enabled,
                hasSecret: false
            });
        });
    });
});

// @desc    Setup 2FA - Generate secret
// @route   GET /api/security/two-fa/setup
// @access  Private
router.get("/security/two-fa/setup", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    tableExists(db, 'two_fa', (err, exists) => {
        if (err || !exists) {
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS two_fa (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL UNIQUE,
                    secret VARCHAR(255) NOT NULL,
                    backup_codes JSON,
                    enabled BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            safeQuery(db, createTableSql, [], (createErr) => {
                if (createErr) {
                    return res.status(500).json({
                        success: false,
                        message: "2FA system not available"
                    });
                }
                generateSecret();
            });
            return;
        }

        generateSecret();
    });

    function generateSecret() {
        try {
            const secret = speakeasy.generateSecret({
                length: 20,
                name: `Pankhudi:${req.user.email}`,
                issuer: "Pankhudi"
            });

            const checkSql = `SELECT id FROM two_fa WHERE user_id = ?`;
            safeQuery(db, checkSql, [userId], (checkErr, rows) => {
                if (checkErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Server error"
                    });
                }

                if (rows && rows.length > 0) {
                    const updateSql = `UPDATE two_fa SET secret = ?, enabled = 0 WHERE user_id = ?`;
                    safeQuery(db, updateSql, [secret.base32, userId], (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({
                                success: false,
                                message: "Failed to save secret"
                            });
                        }
                        sendResponse(secret);
                    });
                } else {
                    const insertSql = `INSERT INTO two_fa (user_id, secret, enabled) VALUES (?, ?, 0)`;
                    safeQuery(db, insertSql, [userId, secret.base32], (insertErr) => {
                        if (insertErr) {
                            return res.status(500).json({
                                success: false,
                                message: "Failed to save secret"
                            });
                        }
                        sendResponse(secret);
                    });
                }

                function sendResponse(secret) {
                    res.json({
                        success: true,
                        secret: secret.base32,
                        otpauth_url: secret.otpauth_url
                    });
                }
            });
        } catch (error) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let secret = '';
            for (let i = 0; i < 16; i++) {
                secret += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const otpauth_url = `otpauth://totp/Pankhudi:${req.user.email}?secret=${secret}&issuer=Pankhudi`;

            res.json({
                success: true,
                secret: secret,
                otpauth_url: otpauth_url
            });
        }
    }
});

// @desc    Verify and enable 2FA
// @route   POST /api/security/two-fa/verify
// @access  Private
router.post("/security/two-fa/verify", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || code.length !== 6) {
        return res.status(400).json({
            success: false,
            message: "Invalid verification code"
        });
    }

    const getSecretSql = `SELECT secret, enabled FROM two_fa WHERE user_id = ?`;
    safeQuery(db, getSecretSql, [userId], (err, rows) => {
        if (err || !rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "2FA not set up. Please setup 2FA first."
            });
        }

        const userSecret = rows[0].secret;

        try {
            const verified = speakeasy.totp.verify({
                secret: userSecret,
                encoding: 'base32',
                token: code.toString(),
                window: 2
            });

            // Development mode accepts any 6-digit code
            if (process.env.NODE_ENV === 'development' && /^\d{6}$/.test(code)) {
                const backupCodes = Array.from({ length: 8 }, () =>
                    Math.random().toString(36).substring(2, 10).toUpperCase()
                );

                const updateSql = `
                    UPDATE two_fa 
                    SET enabled = 1, backup_codes = ?, updated_at = NOW() 
                    WHERE user_id = ?
                `;

                safeQuery(db, updateSql, [JSON.stringify(backupCodes), userId], (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Failed to enable 2FA"
                        });
                    }

                    return res.json({
                        success: true,
                        message: "2FA enabled successfully (Development Mode)",
                        backupCodes: backupCodes
                    });
                });
                return;
            }

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid verification code"
                });
            }

            const backupCodes = Array.from({ length: 8 }, () =>
                Math.random().toString(36).substring(2, 10).toUpperCase()
            );

            const updateSql = `
                UPDATE two_fa 
                SET enabled = 1, backup_codes = ?, updated_at = NOW() 
                WHERE user_id = ?
            `;

            safeQuery(db, updateSql, [JSON.stringify(backupCodes), userId], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to enable 2FA"
                    });
                }

                res.json({
                    success: true,
                    message: "2FA enabled successfully",
                    backupCodes: backupCodes
                });
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Verification system error"
            });
        }
    });
});

// @desc    Verify 2FA code (for login)
// @route   POST /api/security/two-fa/validate
// @access  Private
router.post("/security/two-fa/validate", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || code.length !== 6) {
        return res.status(400).json({
            success: false,
            message: "Invalid verification code"
        });
    }

    const getSql = `SELECT secret, enabled, backup_codes FROM two_fa WHERE user_id = ?`;
    safeQuery(db, getSql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (!rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "2FA not set up"
            });
        }

        const userData = rows[0];

        if (!userData.enabled) {
            return res.status(400).json({
                success: false,
                message: "2FA is not enabled"
            });
        }

        const userSecret = userData.secret;
        let backupCodes = [];

        try {
            if (userData.backup_codes) {
                backupCodes = JSON.parse(userData.backup_codes);
            }
        } catch (e) {
            // Silently handle parse error
        }

        try {
            const verified = speakeasy.totp.verify({
                secret: userSecret,
                encoding: 'base32',
                token: code.toString(),
                window: 2
            });

            if (verified) {
                return res.json({
                    success: true,
                    message: "2FA verification successful"
                });
            }

            if (Array.isArray(backupCodes) && backupCodes.includes(code)) {
                const updatedBackupCodes = backupCodes.filter(c => c !== code);

                const updateSql = `UPDATE two_fa SET backup_codes = ? WHERE user_id = ?`;
                safeQuery(db, updateSql, [JSON.stringify(updatedBackupCodes), userId], (updateErr) => {
                    return res.json({
                        success: true,
                        message: "2FA verification successful with backup code",
                        backupCodeUsed: true
                    });
                });
                return;
            }

            return res.status(400).json({
                success: false,
                message: "Invalid verification code"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Verification failed"
            });
        }
    });
});

// @desc    Disable 2FA
// @route   POST /api/security/two-fa/disable
// @access  Private
router.post("/security/two-fa/disable", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `UPDATE two_fa SET enabled = 0, backup_codes = NULL WHERE user_id = ?`;
    safeQuery(db, sql, [userId], (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to disable 2FA"
            });
        }

        res.json({
            success: true,
            message: "2FA disabled successfully"
        });
    });
});

// @desc    Get backup codes
// @route   GET /api/security/two-fa/backup-codes
// @access  Private
router.get("/security/two-fa/backup-codes", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `SELECT backup_codes FROM two_fa WHERE user_id = ?`;
    safeQuery(db, sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch backup codes"
            });
        }

        let backupCodes = [];
        if (rows && rows.length > 0 && rows[0].backup_codes) {
            try {
                backupCodes = JSON.parse(rows[0].backup_codes);
            } catch (e) {
                // Return empty array on parse error
            }
        }

        res.json({
            success: true,
            backupCodes: backupCodes
        });
    });
});

// @desc    Save backup codes
// @route   POST /api/security/two-fa/backup-codes
// @access  Private
router.post("/security/two-fa/backup-codes", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { backupCodes } = req.body;

    if (!backupCodes || !Array.isArray(backupCodes)) {
        return res.status(400).json({
            success: false,
            message: "Invalid backup codes"
        });
    }

    const sql = `UPDATE two_fa SET backup_codes = ? WHERE user_id = ?`;
    safeQuery(db, sql, [JSON.stringify(backupCodes), userId], (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to save backup codes"
            });
        }

        res.json({
            success: true,
            message: "Backup codes saved successfully"
        });
    });
});

// @desc    Get login activity
// @route   GET /api/security/login-activity
// @access  Private
router.get("/security/login-activity", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    tableExists(db, 'login_activity', (err, exists) => {
        if (err || !exists) {
            const mockActivities = [
                {
                    id: 1,
                    action: 'Login',
                    browser: 'Chrome',
                    os: 'Windows 10',
                    device_type: 'desktop',
                    location: 'New Delhi, India',
                    ip_address: '192.168.1.100',
                    status: 'success',
                    timestamp: new Date().toISOString()
                }
            ];
            return res.json({
                success: true,
                activities: mockActivities,
                message: "Using sample login activity data"
            });
        }

        const sql = `
            SELECT id, action, ip_address, user_agent, browser, os, 
                   device_type, location, status, timestamp
            FROM login_activity 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        `;

        safeQuery(db, sql, [userId, limit], (queryErr, rows) => {
            if (queryErr) {
                return res.json({
                    success: true,
                    activities: []
                });
            }

            res.json({
                success: true,
                activities: rows || []
            });
        });
    });
});

// ===============================
// UPDATED SESSIONS ENDPOINTS
// ===============================

// @desc    Get active sessions
// @route   GET /api/security/sessions
// @access  Private
router.get("/security/sessions", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const currentSessionId = req.headers['x-session-id']; // Optional: client can send current session ID

    // Check if user_sessions table exists
    tableExists(db, 'user_sessions', (err, exists) => {
        if (err || !exists) {
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
                    return res.json({
                        success: true,
                        sessions: [],
                        message: "Session tracking not available"
                    });
                }
                // Return empty array after creating table
                return res.json({
                    success: true,
                    sessions: []
                });
            });
            return;
        }

        const sql = `
            SELECT id, session_id, device_type, browser, os, 
                   ip_address, last_active, created_at, expires_at, is_active
            FROM user_sessions 
            WHERE user_id = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY last_active DESC
        `;

        safeQuery(db, sql, [userId], (queryErr, rows) => {
            if (queryErr) {
                console.error('Error fetching sessions:', queryErr);
                return res.json({
                    success: true,
                    sessions: []
                });
            }

            // Mark current session if session_id matches
            const sessions = (rows || []).map(session => ({
                ...session,
                current: session.session_id === currentSessionId
            }));

            res.json({
                success: true,
                sessions: sessions
            });
        });
    });
});

// @desc    Revoke session (soft delete)
// @route   DELETE /api/security/sessions/:id
// @access  Private
router.delete("/security/sessions/:id", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const sessionId = req.params.id;
    const currentSessionId = req.headers['x-session-id'];

    // First, check if this is the current session
    if (sessionId === currentSessionId) {
        return res.status(400).json({
            success: false,
            message: "Cannot revoke current session"
        });
    }

    // Soft delete - set is_active to 0
    const sql = `UPDATE user_sessions SET is_active = 0 WHERE id = ? AND user_id = ?`;

    safeQuery(db, sql, [sessionId, userId], (err, result) => {
        if (err) {
            console.error('Error revoking session:', err);
            return res.status(500).json({
                success: false,
                message: "Failed to revoke session"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        res.json({
            success: true,
            message: "Session revoked successfully"
        });
    });
});

// @desc    Create session (used by auth routes)
// @route   POST /api/security/sessions/create (internal use)
// @access  Private
router.post("/security/sessions/create", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    // Generate unique session ID using UUID
    const sessionId = uuidv4();

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const browser = getBrowserFromUA(userAgent);
    const os = getOSFromUA(userAgent);
    const isMobile = /mobile/i.test(userAgent);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if table exists
    tableExists(db, 'user_sessions', (err, exists) => {
        if (err || !exists) {
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
                    return res.json({ success: false, message: "Could not create session" });
                }
                insertSession();
            });
        } else {
            insertSession();
        }
    });

    function insertSession() {
        const sql = `
            INSERT INTO user_sessions 
            (user_id, session_id, ip_address, user_agent, browser, os, device_type, expires_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [userId, sessionId, ip, userAgent, browser, os, isMobile ? 'mobile' : 'desktop', expiresAt], (err) => {
            if (err) {
                // If duplicate entry, generate new UUID and try again
                if (err.code === 'ER_DUP_ENTRY') {
                    const newSessionId = uuidv4();
                    db.query(sql, [userId, newSessionId, ip, userAgent, browser, os, isMobile ? 'mobile' : 'desktop', expiresAt], (retryErr) => {
                        if (retryErr) {
                            console.error('Error creating session on retry:', retryErr);
                            return res.json({ success: false, message: "Failed to create session" });
                        }
                        return res.json({
                            success: true,
                            sessionId: newSessionId,
                            message: "Session created successfully"
                        });
                    });
                } else {
                    console.error('Error creating session:', err);
                    return res.json({ success: false, message: "Failed to create session" });
                }
            } else {
                return res.json({
                    success: true,
                    sessionId: sessionId,
                    message: "Session created successfully"
                });
            }
        });
    }
});

// @desc    Update session last active time
// @route   PUT /api/security/sessions/:id/ping
// @access  Private
router.put("/security/sessions/:id/ping", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const sessionId = req.params.id;

    const sql = `UPDATE user_sessions SET last_active = NOW() WHERE id = ? AND user_id = ? AND is_active = 1`;

    safeQuery(db, sql, [sessionId, userId], (err) => {
        if (err) {
            console.error('Error updating session:', err);
            return res.status(500).json({ success: false, message: "Failed to update session" });
        }
        res.json({ success: true, message: "Session updated" });
    });
});

// ===============================
// ACCOUNT MANAGEMENT
// ===============================

// @desc    Delete account (soft delete)
// @route   DELETE /api/account
// @access  Private
router.delete("/account", authenticate, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Password is required"
        });
    }

    const userSql = `SELECT password FROM users WHERE id = ? AND is_deleted = 0`;
    safeQuery(db, userSql, [userId], async (err, rows) => {
        if (err || !rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        try {
            const isMatch = await bcrypt.compare(password, rows[0].password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password"
                });
            }

            // Soft delete user
            const deleteSql = `
                UPDATE users 
                SET is_deleted = 1, deleted_at = NOW(), 
                    email = CONCAT(email, '_deleted_', UNIX_TIMESTAMP())
                WHERE id = ?
            `;

            safeQuery(db, deleteSql, [userId], (deleteErr) => {
                if (deleteErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to delete account"
                    });
                }

                // Also deactivate all sessions
                const sessionSql = `UPDATE user_sessions SET is_active = 0 WHERE user_id = ?`;
                db.query(sessionSql, [userId], () => {
                    // Ignore errors
                });

                res.json({
                    success: true,
                    message: "Account deleted successfully"
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    });
});

// ===============================
// PASSWORD MANAGEMENT
// ===============================

// @desc    Update password
// @route   PUT /api/profile/password
// @access  Private
router.put("/profile/password", authenticate, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Both current and new password are required"
        });
    }

    const sql = `SELECT password FROM users WHERE id = ? AND is_deleted = 0`;
    safeQuery(db, sql, [userId], async (err, rows) => {
        if (err || !rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        try {
            const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 8 characters"
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
            safeQuery(db, updateSql, [hashedPassword, userId], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to update password"
                    });
                }

                // Revoke all other sessions except current for security
                const currentSessionId = req.headers['x-session-id'];
                if (currentSessionId) {
                    const revokeSql = `UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND session_id != ?`;
                    db.query(revokeSql, [userId, currentSessionId], () => { });
                }

                res.json({
                    success: true,
                    message: "Password updated successfully"
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    });
});

module.exports = router;