const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");

// ===============================
// @desc    Get all addresses for a specific user
// @route   GET /api/users/:userId/addresses
// @access  Private
// ===============================
router.get("/:userId/addresses", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const authenticatedUserId = req.user.id;

    console.log("GET /api/users/:userId/addresses - userId:", userId, "authUserId:", authenticatedUserId);

    // Verify authorization
    if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to access this user's addresses"
        });
    }

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

        // Convert snake_case to camelCase for frontend
        const addresses = rows.map(addr => ({
            id: addr.id,
            userId: addr.user_id,
            addressType: addr.address_type,
            fullName: addr.full_name,
            addressLine: addr.address_line,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postal_code,
            country: addr.country,
            phone: addr.phone,
            isDefault: addr.is_default === 1,
            isActive: addr.is_active === 1,
            createdAt: addr.created_at,
            updatedAt: addr.updated_at
        }));

        return res.json({
            success: true,
            addresses: addresses
        });
    });
});

// ===============================
// @desc    Add new address for a specific user
// @route   POST /api/users/:userId/addresses
// @access  Private
// ===============================
router.post("/:userId/addresses", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const authenticatedUserId = req.user.id;

    console.log("POST /api/users/:userId/addresses - userId:", userId, "authUserId:", authenticatedUserId);
    console.log("Request body:", req.body);

    // Verify authorization
    if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to add address for this user"
        });
    }

    // Accept both camelCase and snake_case
    const full_name = req.body.full_name || req.body.fullName;
    const address_line = req.body.address_line || req.body.address || req.body.addressLine;
    const city = req.body.city;
    const state = req.body.state;
    const postal_code = req.body.postal_code || req.body.postalCode;
    const country = req.body.country || "India";
    const phone = req.body.phone;
    const address_type = req.body.address_type || req.body.addressType || "home";
    const is_default = req.body.is_default || req.body.isDefault || false;

    // Validation - Check all required fields
    const missingFields = [];
    if (!full_name) missingFields.push("fullName");
    if (!address_line) missingFields.push("address");
    if (!city) missingFields.push("city");
    if (!state) missingFields.push("state");
    if (!postal_code) missingFields.push("postalCode");
    if (!phone) missingFields.push("phone");

    if (missingFields.length > 0) {
        console.log("Missing fields:", missingFields);
        return res.status(400).json({
            success: false,
            message: `Please fill all required fields: ${missingFields.join(", ")}`
        });
    }

    // Validate phone (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return res.status(400).json({
            success: false,
            message: "Phone number must be 10 digits"
        });
    }

    // Validate postal code (6 digits for India)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(postal_code.replace(/\D/g, ''))) {
        return res.status(400).json({
            success: false,
            message: "Postal code must be 6 digits"
        });
    }

    // Check if this is the first address
    const checkFirstSql = `
        SELECT COUNT(*) as count FROM user_addresses 
        WHERE user_id = ? AND is_active = 1
    `;

    db.query(checkFirstSql, [userId], (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error checking existing addresses:", checkErr);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        const isFirstAddress = checkResult[0].count === 0;
        const shouldBeDefault = is_default || isFirstAddress;

        // If this address should be default, reset other addresses
        const processDefault = (callback) => {
            if (shouldBeDefault) {
                const resetSql = `
                    UPDATE user_addresses
                    SET is_default = 0
                    WHERE user_id = ? AND is_active = 1
                `;
                db.query(resetSql, [userId], (resetErr) => {
                    if (resetErr) {
                        console.error("Error resetting default addresses:", resetErr);
                        return callback(resetErr);
                    }
                    callback(null);
                });
            } else {
                callback(null);
            }
        };

        processDefault((err) => {
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
                userId,
                address_type,
                full_name,
                phone,
                address_line,
                city,
                state,
                postal_code,
                country,
                shouldBeDefault ? 1 : 0
            ];

            db.query(sql, values, (insertErr, result) => {
                if (insertErr) {
                    console.error("Error adding address:", insertErr);
                    return res.status(500).json({
                        success: false,
                        message: "Error adding address to database"
                    });
                }

                // Fetch the newly created address
                const fetchSql = `
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
                    WHERE id = ?
                `;

                db.query(fetchSql, [result.insertId], (fetchErr, rows) => {
                    if (fetchErr) {
                        console.error("Error fetching new address:", fetchErr);
                        return res.status(201).json({
                            success: true,
                            message: "Address added successfully",
                            addressId: result.insertId
                        });
                    }

                    // Convert to camelCase for frontend
                    const address = rows[0] ? {
                        id: rows[0].id,
                        userId: rows[0].user_id,
                        addressType: rows[0].address_type,
                        fullName: rows[0].full_name,
                        addressLine: rows[0].address_line,
                        city: rows[0].city,
                        state: rows[0].state,
                        postalCode: rows[0].postal_code,
                        country: rows[0].country,
                        phone: rows[0].phone,
                        isDefault: rows[0].is_default === 1,
                        isActive: rows[0].is_active === 1,
                        createdAt: rows[0].created_at,
                        updatedAt: rows[0].updated_at
                    } : null;

                    return res.status(201).json({
                        success: true,
                        message: "Address added successfully",
                        address: address,
                        isFirstAddress: isFirstAddress
                    });
                });
            });
        });
    });
});

// ===============================
// @desc    Update address for a specific user
// @route   PUT /api/users/:userId/addresses/:addressId
// @access  Private
// ===============================
router.put("/:userId/addresses/:addressId", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const authenticatedUserId = req.user.id;

    console.log("PUT /api/users/:userId/addresses/:addressId - userId:", userId, "addressId:", addressId, "authUserId:", authenticatedUserId);
    console.log("Update address data:", req.body);

    // Verify authorization
    if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to update address for this user"
        });
    }

    // Accept both camelCase and snake_case
    const full_name = req.body.full_name || req.body.fullName;
    const address_line = req.body.address_line || req.body.address || req.body.addressLine;
    const city = req.body.city;
    const state = req.body.state;
    const postal_code = req.body.postal_code || req.body.postalCode;
    const country = req.body.country;
    const phone = req.body.phone;
    const address_type = req.body.address_type || req.body.addressType;
    const is_default = req.body.is_default !== undefined ? req.body.is_default : req.body.isDefault;

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

        // Validate phone if provided
        if (phone) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number must be 10 digits"
                });
            }
        }

        // Validate postal code if provided
        if (postal_code) {
            const pincodeRegex = /^\d{6}$/;
            if (!pincodeRegex.test(postal_code.replace(/\D/g, ''))) {
                return res.status(400).json({
                    success: false,
                    message: "Postal code must be 6 digits"
                });
            }
        }

        // Handle default address logic
        const processDefault = (callback) => {
            if (is_default === true || is_default === 1 || is_default === "1") {
                const resetSql = `
                    UPDATE user_addresses
                    SET is_default = 0
                    WHERE user_id = ? AND id != ? AND is_active = 1
                `;
                db.query(resetSql, [userId, addressId], (resetErr) => {
                    if (resetErr) {
                        console.error("Error resetting default addresses:", resetErr);
                        return callback(resetErr);
                    }
                    callback(null);
                });
            } else {
                callback(null);
            }
        };

        processDefault((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Server error"
                });
            }

            // Build update query dynamically
            const updateFields = [];
            const updateValues = [];

            if (full_name !== undefined) {
                updateFields.push("full_name = ?");
                updateValues.push(full_name);
            }
            if (address_line !== undefined) {
                updateFields.push("address_line = ?");
                updateValues.push(address_line);
            }
            if (city !== undefined) {
                updateFields.push("city = ?");
                updateValues.push(city);
            }
            if (state !== undefined) {
                updateFields.push("state = ?");
                updateValues.push(state);
            }
            if (postal_code !== undefined) {
                updateFields.push("postal_code = ?");
                updateValues.push(postal_code);
            }
            if (country !== undefined) {
                updateFields.push("country = ?");
                updateValues.push(country);
            }
            if (phone !== undefined) {
                updateFields.push("phone = ?");
                updateValues.push(phone);
            }
            if (address_type !== undefined) {
                updateFields.push("address_type = ?");
                updateValues.push(address_type);
            }
            if (is_default !== undefined) {
                updateFields.push("is_default = ?");
                updateValues.push(is_default === true || is_default === 1 || is_default === "1" ? 1 : 0);
            }

            // Add updated_at timestamp
            updateFields.push("updated_at = CURRENT_TIMESTAMP");

            if (updateFields.length === 1) { // Only timestamp was added
                return res.status(400).json({
                    success: false,
                    message: "No fields to update"
                });
            }

            // Add addressId to values array
            updateValues.push(addressId);

            const updateSql = `
                UPDATE user_addresses
                SET ${updateFields.join(", ")}
                WHERE id = ? AND user_id = ?
            `;

            // Add userId to values array
            updateValues.push(userId);

            db.query(updateSql, updateValues, (updateErr, result) => {
                if (updateErr) {
                    console.error("Error updating address:", updateErr);
                    return res.status(500).json({
                        success: false,
                        message: "Error updating address"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Address not found"
                    });
                }

                // Fetch updated address
                const fetchSql = `
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
                    WHERE id = ?
                `;

                db.query(fetchSql, [addressId], (fetchErr, rows) => {
                    if (fetchErr) {
                        console.error("Error fetching updated address:", fetchErr);
                        return res.json({
                            success: true,
                            message: "Address updated successfully"
                        });
                    }

                    // Convert to camelCase for frontend
                    const address = rows[0] ? {
                        id: rows[0].id,
                        userId: rows[0].user_id,
                        addressType: rows[0].address_type,
                        fullName: rows[0].full_name,
                        addressLine: rows[0].address_line,
                        city: rows[0].city,
                        state: rows[0].state,
                        postalCode: rows[0].postal_code,
                        country: rows[0].country,
                        phone: rows[0].phone,
                        isDefault: rows[0].is_default === 1,
                        isActive: rows[0].is_active === 1,
                        createdAt: rows[0].created_at,
                        updatedAt: rows[0].updated_at
                    } : null;

                    return res.json({
                        success: true,
                        message: "Address updated successfully",
                        address: address
                    });
                });
            });
        });
    });
});

// ===============================
// @desc    Set address as default for a specific user
// @route   PUT /api/users/:userId/addresses/:addressId/default
// @access  Private
// ===============================
router.put("/:userId/addresses/:addressId/default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const authenticatedUserId = req.user.id;

    console.log("PUT /api/users/:userId/addresses/:addressId/default - userId:", userId, "addressId:", addressId, "authUserId:", authenticatedUserId);

    // Verify authorization
    if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to modify this user's addresses"
        });
    }

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
                SET is_default = 1, updated_at = CURRENT_TIMESTAMP
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
// @desc    Delete address (soft delete) for a specific user
// @route   DELETE /api/users/:userId/addresses/:addressId
// @access  Private
// ===============================
router.delete("/:userId/addresses/:addressId", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const authenticatedUserId = req.user.id;

    console.log("DELETE /api/users/:userId/addresses/:addressId - userId:", userId, "addressId:", addressId, "authUserId:", authenticatedUserId);

    // Verify authorization
    if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to delete this user's addresses"
        });
    }

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

        // Soft delete the address
        const deleteSql = `
            UPDATE user_addresses
            SET is_active = 0, is_default = 0, updated_at = CURRENT_TIMESTAMP
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
            if (isDefault === 1) {
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
                            SET is_default = 1, updated_at = CURRENT_TIMESTAMP
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
// @desc    Get default address for a specific user
// @route   GET /api/users/:userId/addresses/default
// @access  Private
// ===============================
router.get("/:userId/addresses/default", authenticate, (req, res) => {
    const db = req.db;
    const userId = req.params.userId;
    const authenticatedUserId = req.user.id;

    console.log("GET /api/users/:userId/addresses/default - userId:", userId, "authUserId:", authenticatedUserId);

    // Verify authorization
    if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to access this user's addresses"
        });
    }

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
            // Try to get any address as fallback
            const fallbackSql = `
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

                // Convert to camelCase
                const address = {
                    id: fallbackRows[0].id,
                    userId: fallbackRows[0].user_id,
                    addressType: fallbackRows[0].address_type,
                    fullName: fallbackRows[0].full_name,
                    addressLine: fallbackRows[0].address_line,
                    city: fallbackRows[0].city,
                    state: fallbackRows[0].state,
                    postalCode: fallbackRows[0].postal_code,
                    country: fallbackRows[0].country,
                    phone: fallbackRows[0].phone,
                    isDefault: fallbackRows[0].is_default === 1,
                    isActive: fallbackRows[0].is_active === 1,
                    createdAt: fallbackRows[0].created_at,
                    updatedAt: fallbackRows[0].updated_at
                };

                return res.json({
                    success: true,
                    address: address
                });
            });
        } else {
            // Convert to camelCase
            const address = {
                id: rows[0].id,
                userId: rows[0].user_id,
                addressType: rows[0].address_type,
                fullName: rows[0].full_name,
                addressLine: rows[0].address_line,
                city: rows[0].city,
                state: rows[0].state,
                postalCode: rows[0].postal_code,
                country: rows[0].country,
                phone: rows[0].phone,
                isDefault: rows[0].is_default === 1,
                isActive: rows[0].is_active === 1,
                createdAt: rows[0].created_at,
                updatedAt: rows[0].updated_at
            };

            return res.json({
                success: true,
                address: address
            });
        }
    });
});

module.exports = router;