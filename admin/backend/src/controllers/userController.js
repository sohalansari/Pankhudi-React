const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.promise().query('SELECT * FROM users WHERE id=?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, address, is_verified, is_premium, is_active, password } = req.body;
        if (!password) return res.status(400).json({ message: "Password is required" });

        // Check for duplicate phone or email
        const [existing] = await db.promise().query(
            "SELECT * FROM users WHERE phone=? OR email=?",
            [phone, email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "User with this phone or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.promise().query(
            `INSERT INTO users (name, email, phone, address, is_verified, is_premium, is_active, password, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [name, email, phone, address, is_verified ? 1 : 0, is_premium ? 1 : 0, is_active ? 1 : 0, hashedPassword]
        );

        const [newUser] = await db.promise().query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        res.status(201).json(newUser[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create user" });
    }
};

// Partial update user (safe)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['name', 'email', 'phone', 'address', 'is_verified', 'is_premium', 'is_active', 'password'];
        const fieldsToUpdate = [];
        const params = [];

        for (let field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'password' && req.body.password.trim() !== "") {
                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
                    fieldsToUpdate.push(`${field}=?`);
                    params.push(hashedPassword);
                } else if (field !== 'password') {
                    // Convert booleans to 0/1 for MySQL
                    if (field === 'is_verified' || field === 'is_premium' || field === 'is_active') {
                        params.push(req.body[field] ? 1 : 0);
                    } else {
                        params.push(req.body[field]);
                    }
                    fieldsToUpdate.push(`${field}=?`);
                }
            }
        }

        if (fieldsToUpdate.length === 0) return res.status(400).json({ message: "No valid fields to update" });

        const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id=?`;
        params.push(id);

        await db.promise().query(query, params);

        const [updatedUser] = await db.promise().query('SELECT * FROM users WHERE id=?', [id]);
        res.json(updatedUser[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update user" });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.promise().query('DELETE FROM users WHERE id=?', [id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

// Toggle verify/unverify
exports.toggleVerify = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;
        await db.promise().query('UPDATE users SET is_verified=? WHERE id=?', [is_verified ? 1 : 0, id]);
        const [updatedUser] = await db.promise().query('SELECT * FROM users WHERE id=?', [id]);
        res.json(updatedUser[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update verification" });
    }
};
