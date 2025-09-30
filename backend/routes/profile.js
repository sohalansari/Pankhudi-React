const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
        cb(null, `avatar_${req.user.id}${ext}`);
    }
});
const upload = multer({ storage });

// ===============================
// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
// ===============================
router.get("/profile", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `
        SELECT id, name, email, phone, address, avatar, is_premium, created_at
        FROM users
        WHERE id = ? AND is_active = 1 AND is_deleted = 0
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Server error" });
        if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

        let user = rows[0];
        if (user.avatar) user.avatar = `http://localhost:5000/${user.avatar}`;
        user.createdAt = user.created_at;

        return res.json({ success: true, user });
    });
});

// ===============================
// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
// ===============================
router.put("/profile", authenticate, upload.single("avatar"), async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { name, email, phone, address, is_premium, password } = req.body;

    if (name && name.length < 3) return res.status(400).json({ success: false, message: "Name must be at least 3 characters" });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Invalid email format" });
    if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: "Phone must be 10 digits" });

    let hashedPassword = null;
    if (password && password.length >= 8) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const avatarPath = req.file ? `uploads/avatars/${req.file.filename}` : undefined;

    const updateFields = [];
    const updateValues = [];

    if (name) updateFields.push("name = ?"), updateValues.push(name);
    if (email) updateFields.push("email = ?"), updateValues.push(email);
    if (phone) updateFields.push("phone = ?"), updateValues.push(phone);
    if (address) updateFields.push("address = ?"), updateValues.push(address);
    if (typeof is_premium !== "undefined") updateFields.push("is_premium = ?"), updateValues.push(is_premium);
    if (hashedPassword) updateFields.push("password = ?"), updateValues.push(hashedPassword);
    if (avatarPath) updateFields.push("avatar = ?"), updateValues.push(avatarPath);

    if (!updateFields.length) return res.status(400).json({ success: false, message: "No valid fields to update" });

    updateValues.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    db.query(sql, updateValues, (err) => {
        if (err) return res.status(500).json({ success: false, message: "Server error" });

        const selectSql = `
            SELECT id, name, email, phone, address, avatar, is_premium, created_at
            FROM users
            WHERE id = ?
        `;
        db.query(selectSql, [userId], (err2, rows) => {
            if (err2) return res.status(500).json({ success: false, message: "Server error" });

            let user = rows[0];
            if (user.avatar) user.avatar = `http://localhost:5000/${user.avatar}`;
            user.createdAt = user.created_at;

            return res.json({ success: true, user });
        });
    });
});

// ===============================
// @desc    Delete user avatar
// @route   DELETE /api/profile/avatar
// @access  Private
// ===============================
router.delete("/profile/avatar", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `SELECT avatar FROM users WHERE id = ?`;
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Server error" });
        if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

        const avatarPath = rows[0].avatar;
        if (avatarPath && fs.existsSync(path.join(__dirname, "../", avatarPath))) {
            fs.unlinkSync(path.join(__dirname, "../", avatarPath));
        }

        db.query(`UPDATE users SET avatar = NULL WHERE id = ?`, [userId], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: "Server error" });
            return res.json({ success: true, message: "Avatar deleted successfully" });
        });
    });
});

// ===============================
// @desc    Update password
// @route   PUT /api/profile/password
// @access  Private
// ===============================
router.put("/profile/password", authenticate, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Both current and new password are required" });
    }

    db.query(`SELECT password FROM users WHERE id = ?`, [userId], async (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Server error" });
        if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });

        if (newPassword.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: "Server error" });
            return res.json({ success: true, message: "Password updated successfully" });
        });
    });
});

module.exports = router;
