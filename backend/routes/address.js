const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");

// ===============================
// @desc    Get all addresses for user
// @route   GET /api/address
// @access  Private
// ===============================
router.get("/", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `
        SELECT
            id,
            user_id,
            address_type,
            full_name,
            address_line,
            city,
            state,
            postal_code,
            country,
            phone,
            is_default,
            is_active,
            created_at,
            updated_at
        FROM user_addresses
        WHERE user_id = ? AND is_active = 1
        ORDER BY
            is_default DESC,
            created_at DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching addresses:", err);
            return res.status(500).json({
                success: false,
                message: "Server error fetching addresses"
            });
        }

        return res.json({
            success: true,
            addresses: rows
        });
    });
});

// ===============================
// @desc    Get single address by ID
// @route   GET /api/address/:id
// @access  Private
// ===============================
router.get("/:id", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;

    const sql = `
        SELECT * FROM user_addresses
        WHERE id = ? AND user_id = ? AND is_active = 1
    `;

    db.query(sql, [addressId, userId], (err, rows) => {
        if (err) {
            console.error("Error fetching address:", err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Address not found or unauthorized"
            });
        }

        return res.json({
            success: true,
            address: rows[0]
        });
    });
});

// ===============================
// @desc    Add new address
// @route   POST /api/address
// @access  Private
// ===============================
router.post("/", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const {
        address_type = "home",
        full_name,
        phone,
        address_line,
        city,
        state,
        postal_code,
        country = "India",
        is_default = 0
    } = req.body;

    // Validation
    if (!full_name || !phone || !address_line || !city || !state || !postal_code) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields"
        });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Phone must be 10 digits"
        });
    }

    // Reset other addresses' default status if this is set as default
    const resetDefault = (callback) => {
        if (is_default == 1) {
            const resetSql = `
                UPDATE user_addresses
                SET is_default = 0
                WHERE user_id = ? AND is_active = 1
            `;
            db.query(resetSql, [userId], (err) => {
                if (err) {
                    console.error("Error resetting default addresses:", err);
                    return callback(err);
                }
                callback(null);
            });
        } else {
            callback(null);
        }
    };

    resetDefault((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        const sql = `
            INSERT INTO user_addresses (
                user_id, address_type, full_name, phone,
                address_line, city, state,
                postal_code, country, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            userId, address_type, full_name, phone,
            address_line, city, state, postal_code,
            country, is_default
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error adding address:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error adding address"
                });
            }

            // Fetch the newly created address
            const fetchSql = `
                SELECT * FROM user_addresses
                WHERE id = ?
            `;

            db.query(fetchSql, [result.insertId], (fetchErr, rows) => {
                if (fetchErr) {
                    console.error("Error fetching new address:", fetchErr);
                    return res.status(500).json({
                        success: false,
                        message: "Address added but could not retrieve details"
                    });
                }

                return res.json({
                    success: true,
                    message: "Address added successfully",
                    address: rows[0]
                });
            });
        });
    });
});

// ===============================
// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
// ===============================
router.put("/:id", authenticate, (req, res) => {
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

    // Check if address exists and belongs to user
    const checkSql = `
        SELECT id FROM user_addresses
        WHERE id = ? AND user_id = ? AND is_active = 1
    `;

    db.query(checkSql, [addressId, userId], (checkErr, rows) => {
        if (checkErr) {
            console.error("Error checking address:", checkErr);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Address not found or unauthorized"
            });
        }

        // Validate phone if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Phone must be 10 digits"
            });
        }

        // Reset other addresses' default status if this is set as default
        const resetDefault = (callback) => {
            if (is_default == 1) {
                const resetSql = `
                    UPDATE user_addresses
                    SET is_default = 0
                    WHERE user_id = ? AND id != ? AND is_active = 1
                `;
                db.query(resetSql, [userId, addressId], (err) => {
                    if (err) {
                        console.error("Error resetting default addresses:", err);
                        return callback(err);
                    }
                    callback(null);
                });
            } else {
                callback(null);
            }
        };

        resetDefault((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Server error"
                });
            }

            // Build update query dynamically
            const updateFields = [];
            const updateValues = [];

            if (address_type !== undefined) updateFields.push("address_type = ?"), updateValues.push(address_type);
            if (full_name !== undefined) updateFields.push("full_name = ?"), updateValues.push(full_name);
            if (phone !== undefined) updateFields.push("phone = ?"), updateValues.push(phone);
            if (address_line !== undefined) updateFields.push("address_line = ?"), updateValues.push(address_line);
            if (city !== undefined) updateFields.push("city = ?"), updateValues.push(city);
            if (state !== undefined) updateFields.push("state = ?"), updateValues.push(state);
            if (postal_code !== undefined) updateFields.push("postal_code = ?"), updateValues.push(postal_code);
            if (country !== undefined) updateFields.push("country = ?"), updateValues.push(country);
            if (is_default !== undefined) updateFields.push("is_default = ?"), updateValues.push(is_default);

            // Update timestamp
            updateFields.push("updated_at = CURRENT_TIMESTAMP");

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No fields to update"
                });
            }

            updateValues.push(addressId);
            const updateSql = `
                UPDATE user_addresses
                SET ${updateFields.join(", ")}
                WHERE id = ?
            `;

            db.query(updateSql, updateValues, (updateErr, result) => {
                if (updateErr) {
                    console.error("Error updating address:", updateErr);
                    return res.status(500).json({
                        success: false,
                        message: "Error updating address"
                    });
                }

                // Fetch updated address
                const fetchSql = `
                    SELECT * FROM user_addresses
                    WHERE id = ?
                `;

                db.query(fetchSql, [addressId], (fetchErr, rows) => {
                    if (fetchErr) {
                        console.error("Error fetching updated address:", fetchErr);
                        return res.status(500).json({
                            success: false,
                            message: "Address updated but could not retrieve details"
                        });
                    }

                    return res.json({
                        success: true,
                        message: "Address updated successfully",
                        address: rows[0]
                    });
                });
            });
        });
    });
});

// ===============================
// @desc    Soft delete address (set is_active = 0)
// @route   DELETE /api/address/:id
// @access  Private
// ===============================
router.delete("/:id", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;

    // Check if address exists and belongs to user
    const checkSql = `
        SELECT id, is_default FROM user_addresses
        WHERE id = ? AND user_id = ? AND is_active = 1
    `;

    db.query(checkSql, [addressId, userId], (checkErr, rows) => {
        if (checkErr) {
            console.error("Error checking address:", checkErr);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Address not found or unauthorized"
            });
        }

        const isDefault = rows[0].is_default;

        // Soft delete the address (set is_active = 0)
        const deleteSql = `
            UPDATE user_addresses
            SET is_active = 0, is_default = 0
            WHERE id = ? AND user_id = ?
        `;

        db.query(deleteSql, [addressId, userId], (deleteErr, result) => {
            if (deleteErr) {
                console.error("Error deleting address:", deleteErr);
                return res.status(500).json({
                    success: false,
                    message: "Error deleting address"
                });
            }

            // If deleted address was default, set another as default
            if (isDefault == 1) {
                const findNewDefaultSql = `
                    SELECT id FROM user_addresses
                    WHERE user_id = ? AND is_active = 1
                    ORDER BY created_at DESC
                    LIMIT 1
                `;

                db.query(findNewDefaultSql, [userId], (findErr, defaultRows) => {
                    if (findErr) {
                        console.error("Error finding new default address:", findErr);
                        return res.json({
                            success: true,
                            message: "Address deleted successfully"
                        });
                    }

                    if (defaultRows.length > 0) {
                        const updateDefaultSql = `
                            UPDATE user_addresses
                            SET is_default = 1
                            WHERE id = ?
                        `;

                        db.query(updateDefaultSql, [defaultRows[0].id], (updateErr) => {
                            if (updateErr) {
                                console.error("Error setting new default address:", updateErr);
                            }
                            return res.json({
                                success: true,
                                message: "Address deleted successfully"
                            });
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "Address deleted successfully"
                        });
                    }
                });
            } else {
                return res.json({
                    success: true,
                    message: "Address deleted successfully"
                });
            }
        });
    });
});

// ===============================
// @desc    Set address as default
// @route   PUT /api/address/:id/set-default
// @access  Private
// ===============================
router.put("/:id/set-default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressId = req.params.id;

    // Check if address exists and belongs to user
    const checkSql = `
        SELECT id FROM user_addresses
        WHERE id = ? AND user_id = ? AND is_active = 1
    `;

    db.query(checkSql, [addressId, userId], (checkErr, rows) => {
        if (checkErr) {
            console.error("Error checking address:", checkErr);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Address not found or unauthorized"
            });
        }

        // Reset all other addresses to non-default
        const resetSql = `
            UPDATE user_addresses
            SET is_default = 0
            WHERE user_id = ? AND is_active = 1
        `;

        db.query(resetSql, [userId], (resetErr) => {
            if (resetErr) {
                console.error("Error resetting default addresses:", resetErr);
                return res.status(500).json({
                    success: false,
                    message: "Server error"
                });
            }

            // Set this address as default
            const setDefaultSql = `
                UPDATE user_addresses
                SET is_default = 1
                WHERE id = ? AND user_id = ?
            `;

            db.query(setDefaultSql, [addressId, userId], (setErr, result) => {
                if (setErr) {
                    console.error("Error setting default address:", setErr);
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

                return res.json({
                    success: true,
                    message: "Default address updated successfully"
                });
            });
        });
    });
});

// ===============================
// @desc    Reset all addresses default status
// @route   PUT /api/address/reset-default
// @access  Private
// ===============================
router.put("/reset-default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `
        UPDATE user_addresses
        SET is_default = 0
        WHERE user_id = ? AND is_active = 1
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Error resetting default addresses:", err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        return res.json({
            success: true,
            message: "Default addresses reset successfully"
        });
    });
});

// ===============================
// @desc    Get default address
// @route   GET /api/address/default
// @access  Private
// ===============================
router.get("/default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const sql = `
        SELECT * FROM user_addresses
        WHERE user_id = ? AND is_default = 1 AND is_active = 1
        LIMIT 1
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching default address:", err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!rows.length) {
            // Try to get any address
            const fallbackSql = `
                SELECT * FROM user_addresses
                WHERE user_id = ? AND is_active = 1
                ORDER BY created_at DESC
                LIMIT 1
            `;

            db.query(fallbackSql, [userId], (fallbackErr, fallbackRows) => {
                if (fallbackErr) {
                    console.error("Error fetching fallback address:", fallbackErr);
                    return res.json({
                        success: true,
                        address: null,
                        message: "No addresses found"
                    });
                }

                if (!fallbackRows.length) {
                    return res.json({
                        success: true,
                        address: null,
                        message: "No addresses found"
                    });
                }

                return res.json({
                    success: true,
                    address: fallbackRows[0]
                });
            });
        } else {
            return res.json({
                success: true,
                address: rows[0]
            });
        }
    });
});

// ===============================
// @desc    Get all addresses including inactive (for admin)
// @route   GET /api/address/all
// @access  Private
// ===============================
router.get("/all", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    // Check if user is admin (you can add your own logic here)
    const sql = `
        SELECT
            id,
            user_id,
            address_type,
            full_name,
            address_line,
            city,
            state,
            postal_code,
            country,
            phone,
            is_default,
            is_active,
            created_at,
            updated_at
        FROM user_addresses
        WHERE user_id = ?
        ORDER BY
            is_active DESC,
            is_default DESC,
            created_at DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching all addresses:", err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        return res.json({
            success: true,
            addresses: rows
        });
    });
});

module.exports = router;