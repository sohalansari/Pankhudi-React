const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        req.user = decodedUser;
        req.user.id = decodedUser.id || decodedUser.userId;
        next();
    });
};

// ✅ 1. Get User Details
router.get("/:id/details", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access to user data"
        });
    }

    try {
        const sql = `
            SELECT 
                id, name, email, phone, address, city, state, 
                postal_code as postalCode, country, avatar, 
                is_verified as isVerified, created_at as createdAt
            FROM users 
            WHERE id = ? AND is_active = 1 AND is_deleted = 0
        `;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error occurred"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                user: results[0]
            });
        });

    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ✅ 2. Get User Addresses (Updated for new table structure)
router.get("/:id/addresses", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // First check if table exists
        const checkTableSql = "SHOW TABLES LIKE 'user_addresses'";
        db.query(checkTableSql, async (tableErr, tableResults) => {
            if (tableErr) {
                console.error("Check table error:", tableErr);
                return res.json({
                    success: true,
                    addresses: []
                });
            }

            if (tableResults.length === 0) {
                // Table doesn't exist yet
                return res.json({
                    success: true,
                    addresses: [],
                    message: "No addresses saved yet"
                });
            }

            // Check table columns
            const describeSql = "DESCRIBE user_addresses";
            db.query(describeSql, async (descErr, columns) => {
                if (descErr) {
                    console.error("Describe table error:", descErr);
                    return res.json({
                        success: true,
                        addresses: []
                    });
                }

                // Build query based on actual columns
                const columnNames = columns.map(col => col.Field);

                // Create column mapping
                const columnMap = {
                    'id': 'id',
                    'user_id': 'userId',
                    'address_type': 'addressType',
                    'full_name': 'fullName',
                    'address_line': 'addressLine',
                    'city': 'city',
                    'state': 'state',
                    'postal_code': 'postalCode',
                    'country': 'country',
                    'phone': 'phone',
                    'is_default': 'isDefault',
                    'is_active': 'isActive',
                    'created_at': 'createdAt'
                };

                // Build SELECT clause
                const selectClause = Object.entries(columnMap)
                    .filter(([dbCol]) => columnNames.includes(dbCol))
                    .map(([dbCol, alias]) => `${dbCol} as ${alias}`)
                    .join(', ');

                if (!selectClause) {
                    return res.json({
                        success: true,
                        addresses: []
                    });
                }

                const sql = `
                    SELECT ${selectClause}
                    FROM user_addresses 
                    WHERE user_id = ? AND is_active = 1
                    ORDER BY is_default DESC, created_at DESC
                `;

                db.query(sql, [userId], (err, results) => {
                    if (err) {
                        console.error("Database query error:", err);
                        // Fallback to simple query
                        const fallbackSql = "SELECT * FROM user_addresses WHERE user_id = ?";
                        db.query(fallbackSql, [userId], (fallbackErr, fallbackResults) => {
                            if (fallbackErr) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to fetch addresses"
                                });
                            }

                            // Format results
                            const formattedResults = fallbackResults.map(addr => ({
                                id: addr.id,
                                userId: addr.user_id,
                                addressType: addr.address_type || 'home',
                                fullName: addr.full_name || '',
                                addressLine: addr.address_line || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                postalCode: addr.postal_code || '',
                                country: addr.country || 'India',
                                phone: addr.phone || '',
                                isDefault: addr.is_default || false,
                                isActive: addr.is_active || 1,
                                createdAt: addr.created_at
                            }));

                            res.json({
                                success: true,
                                addresses: formattedResults
                            });
                        });
                        return;
                    }

                    res.json({
                        success: true,
                        addresses: results || []
                    });
                });
            });
        });

    } catch (error) {
        console.error("Get addresses error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ✅ 3. Add New Address (Updated for new structure)
router.post("/:id/addresses/add", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);
    const addressData = req.body;

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // Validate required fields
        const requiredFields = ['fullName', 'address', 'city', 'state', 'postalCode', 'phone'];
        const missingFields = requiredFields.filter(field => !addressData[field]?.trim());

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please fill all required fields: ${missingFields.join(', ')}`
            });
        }

        // Prepare address object for new table structure
        const newAddress = {
            user_id: userId,
            address_type: addressData.addressType || 'home',
            full_name: addressData.fullName.trim(),
            address_line: addressData.address.trim(),
            city: addressData.city.trim(),
            state: addressData.state.trim(),
            postal_code: addressData.postalCode.trim(),
            country: addressData.country || 'India',
            phone: addressData.phone.trim(),
            is_default: addressData.isDefault ? 1 : 0,
            is_active: 1
        };

        // Check if this is the first address
        const checkAddressesSql = "SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ? AND is_active = 1";

        db.query(checkAddressesSql, [userId], async (checkErr, checkResults) => {
            if (checkErr) {
                console.error("Check addresses error:", checkErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to check existing addresses"
                });
            }

            const addressCount = checkResults[0]?.count || 0;

            // If first address, set as default
            if (addressCount === 0) {
                newAddress.is_default = 1;
            }

            // If setting as default and not first address, update other addresses
            if (newAddress.is_default === 1 && addressCount > 0) {
                try {
                    await db.queryAsync(`
                        UPDATE user_addresses 
                        SET is_default = 0 
                        WHERE user_id = ? AND is_active = 1
                    `, [userId]);
                } catch (updateErr) {
                    console.error("Update default addresses error:", updateErr);
                    // Continue anyway
                }
            }

            // Insert new address
            const insertSql = "INSERT INTO user_addresses SET ?";
            db.query(insertSql, [newAddress], (insertErr, result) => {
                if (insertErr) {
                    console.error("Insert address error:", insertErr);

                    // Try to create table if it doesn't exist
                    if (insertErr.code === 'ER_NO_SUCH_TABLE') {
                        const createTableSql = `
                            CREATE TABLE IF NOT EXISTS user_addresses (
                                id INT PRIMARY KEY AUTO_INCREMENT,
                                user_id INT NOT NULL,
                                address_type VARCHAR(20) DEFAULT 'home',
                                full_name VARCHAR(100) NOT NULL,
                                address_line VARCHAR(255) NOT NULL,
                                city VARCHAR(100) NOT NULL,
                                state VARCHAR(100) NOT NULL,
                                postal_code VARCHAR(20) NOT NULL,
                                country VARCHAR(50) DEFAULT 'India',
                                phone VARCHAR(20) NOT NULL,
                                is_default TINYINT(1) DEFAULT 0,
                                is_active TINYINT(1) DEFAULT 1,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                INDEX idx_user_id (user_id),
                                INDEX idx_is_active (is_active),
                                INDEX idx_is_default (is_default)
                            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                        `;

                        db.query(createTableSql, (createErr) => {
                            if (createErr) {
                                console.error("Create table error:", createErr);
                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to create addresses table"
                                });
                            }

                            // Retry insertion
                            db.query(insertSql, [newAddress], (retryErr, retryResult) => {
                                if (retryErr) {
                                    console.error("Retry insert error:", retryErr);
                                    return res.status(500).json({
                                        success: false,
                                        message: "Failed to add address"
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: "Address added successfully",
                                    addressId: retryResult.insertId,
                                    address: newAddress
                                });
                            });
                        });
                        return;
                    }

                    return res.status(500).json({
                        success: false,
                        message: "Failed to add address",
                        error: process.env.NODE_ENV === 'development' ? insertErr.message : undefined
                    });
                }

                res.json({
                    success: true,
                    message: "Address added successfully",
                    addressId: result.insertId,
                    address: newAddress,
                    isFirstAddress: addressCount === 0
                });
            });
        });

    } catch (error) {
        console.error("Add address error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add address",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ✅ 4. Update User Profile
router.put("/:id/update", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // Remove sensitive fields
        const allowedFields = ['name', 'phone', 'address', 'city', 'state', 'postalCode', 'country', 'avatar'];
        const filteredData = {};

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });

        // Map frontend field names to database column names
        const dbData = {
            name: filteredData.name,
            phone: filteredData.phone,
            address: filteredData.address,
            city: filteredData.city,
            state: filteredData.state,
            postal_code: filteredData.postalCode,
            country: filteredData.country,
            avatar: filteredData.avatar,
            updated_at: new Date()
        };

        // Remove undefined values
        Object.keys(dbData).forEach(key => {
            if (dbData[key] === undefined) {
                delete dbData[key];
            }
        });

        if (Object.keys(dbData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });
        }

        await db.queryAsync(`
            UPDATE users 
            SET ? 
            WHERE id = ?
        `, [dbData, userId]);

        res.json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ✅ 5. Delete Address (Soft delete)
router.delete("/:id/addresses/:addressId", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);
    const addressId = parseInt(req.params.addressId);

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // First check if address exists and belongs to user
        const checkSql = "SELECT id, is_default FROM user_addresses WHERE id = ? AND user_id = ? AND is_active = 1";

        db.query(checkSql, [addressId, userId], async (checkErr, checkResults) => {
            if (checkErr) {
                console.error("Check address error:", checkErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to verify address"
                });
            }

            if (checkResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            const address = checkResults[0];

            // If deleting default address, need to set another as default
            if (address.is_default === 1) {
                // Find another address to set as default
                const findNewDefaultSql = "SELECT id FROM user_addresses WHERE user_id = ? AND id != ? AND is_active = 1 LIMIT 1";

                db.query(findNewDefaultSql, [userId, addressId], async (findErr, findResults) => {
                    if (findErr) {
                        console.error("Find new default error:", findErr);
                        // Continue with deletion anyway
                    }

                    // Soft delete the address
                    const deleteSql = "UPDATE user_addresses SET is_active = 0 WHERE id = ?";

                    db.query(deleteSql, [addressId], async (deleteErr, deleteResult) => {
                        if (deleteErr) {
                            console.error("Delete address error:", deleteErr);
                            return res.status(500).json({
                                success: false,
                                message: "Failed to delete address"
                            });
                        }

                        // Set new default if another address exists
                        if (findResults && findResults.length > 0) {
                            const newDefaultId = findResults[0].id;
                            await db.queryAsync(
                                "UPDATE user_addresses SET is_default = 1 WHERE id = ?",
                                [newDefaultId]
                            );
                        }

                        res.json({
                            success: true,
                            message: "Address deleted successfully",
                            wasDefault: true,
                            newDefaultSet: findResults && findResults.length > 0
                        });
                    });
                });
            } else {
                // Just soft delete non-default address
                const deleteSql = "UPDATE user_addresses SET is_active = 0 WHERE id = ?";

                db.query(deleteSql, [addressId], (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        console.error("Delete address error:", deleteErr);
                        return res.status(500).json({
                            success: false,
                            message: "Failed to delete address"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Address deleted successfully"
                    });
                });
            }
        });

    } catch (error) {
        console.error("Delete address error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    }
});

// ✅ 6. Set Default Address
router.put("/:id/addresses/:addressId/set-default", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);
    const addressId = parseInt(req.params.addressId);

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // Start transaction
        await db.queryAsync("START TRANSACTION");

        // Remove default from all addresses
        await db.queryAsync(`
            UPDATE user_addresses 
            SET is_default = 0 
            WHERE user_id = ? AND is_active = 1
        `, [userId]);

        // Set new default address
        const result = await db.queryAsync(`
            UPDATE user_addresses 
            SET is_default = 1 
            WHERE id = ? AND user_id = ? AND is_active = 1
        `, [addressId, userId]);

        if (result.affectedRows === 0) {
            await db.queryAsync("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Address not found or not active"
            });
        }

        // Commit transaction
        await db.queryAsync("COMMIT");

        res.json({
            success: true,
            message: "Default address updated successfully"
        });

    } catch (error) {
        // Rollback on error
        await db.queryAsync("ROLLBACK");
        console.error("Set default address error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to set default address"
        });
    }
});

// ✅ 7. Update Address
router.put("/:id/addresses/:addressId/update", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);
    const addressId = parseInt(req.params.addressId);
    const addressData = req.body;

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // Prepare update data
        const updateData = {};

        if (addressData.fullName) updateData.full_name = addressData.fullName;
        if (addressData.address) updateData.address_line = addressData.address;
        if (addressData.city) updateData.city = addressData.city;
        if (addressData.state) updateData.state = addressData.state;
        if (addressData.postalCode) updateData.postal_code = addressData.postalCode;
        if (addressData.country) updateData.country = addressData.country;
        if (addressData.phone) updateData.phone = addressData.phone;
        if (addressData.addressType) updateData.address_type = addressData.addressType;

        updateData.updated_at = new Date();

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            });
        }

        const result = await db.queryAsync(`
            UPDATE user_addresses 
            SET ? 
            WHERE id = ? AND user_id = ? AND is_active = 1
        `, [updateData, addressId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found or not active"
            });
        }

        res.json({
            success: true,
            message: "Address updated successfully"
        });

    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update address"
        });
    }
});

// ✅ 8. Get Default Address
router.get("/:id/addresses/default", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // Check if table exists first
        const checkTableSql = "SHOW TABLES LIKE 'user_addresses'";
        db.query(checkTableSql, (tableErr, tableResults) => {
            if (tableErr || tableResults.length === 0) {
                return res.json({
                    success: true,
                    address: null,
                    message: "No addresses table found"
                });
            }

            const sql = `
                SELECT 
                    id, user_id as userId, 
                    address_type as addressType,
                    full_name as fullName,
                    address_line as addressLine,
                    city, state, 
                    postal_code as postalCode,
                    country, phone, 
                    is_default as isDefault
                FROM user_addresses 
                WHERE user_id = ? AND is_default = 1 AND is_active = 1
                LIMIT 1
            `;

            db.query(sql, [userId], (err, results) => {
                if (err) {
                    console.error("Database query error:", err);
                    return res.json({
                        success: true,
                        address: null
                    });
                }

                res.json({
                    success: true,
                    address: results.length > 0 ? results[0] : null
                });
            });
        });

    } catch (error) {
        console.error("Get default address error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ✅ 9. Health Check for User Routes
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "User routes are operational",
        timestamp: new Date().toISOString()
    });
});

// ✅ 10. Get User Stats
router.get("/:id/stats", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = parseInt(req.params.id);

    // Authorization check
    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        // Check if tables exist
        const checkTablesSql = "SHOW TABLES";
        db.query(checkTablesSql, async (tableErr, tableResults) => {
            if (tableErr) {
                return res.json({
                    success: true,
                    stats: {
                        orderCount: 0,
                        addressCount: 0
                    }
                });
            }

            const tables = tableResults.map(row => Object.values(row)[0]);

            let orderCount = 0;
            let addressCount = 0;

            // Get order count if orders table exists
            if (tables.includes('orders')) {
                try {
                    const orderResult = await db.queryAsync(`
                        SELECT COUNT(*) as orderCount 
                        FROM orders 
                        WHERE user_id = ? AND status != 'cancelled'
                    `, [userId]);
                    orderCount = orderResult[0]?.orderCount || 0;
                } catch (orderErr) {
                    console.error("Get order count error:", orderErr);
                }
            }

            // Get address count if user_addresses table exists
            if (tables.includes('user_addresses')) {
                try {
                    const addressResult = await db.queryAsync(`
                        SELECT COUNT(*) as addressCount 
                        FROM user_addresses 
                        WHERE user_id = ? AND is_active = 1
                    `, [userId]);
                    addressCount = addressResult[0]?.addressCount || 0;
                } catch (addressErr) {
                    console.error("Get address count error:", addressErr);
                }
            }

            res.json({
                success: true,
                stats: {
                    orderCount,
                    addressCount
                }
            });
        });

    } catch (error) {
        console.error("Get user stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user statistics"
        });
    }
});

// ✅ 11. Initialize User Addresses Table (Helper endpoint)
router.post("/initialize-table", authenticateToken, async (req, res) => {
    // This is a special endpoint to create the table if needed
    // Should only be accessible by admin in production

    try {
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS user_addresses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                address_type VARCHAR(20) DEFAULT 'home',
                full_name VARCHAR(100) NOT NULL,
                address_line VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                country VARCHAR(50) DEFAULT 'India',
                phone VARCHAR(20) NOT NULL,
                is_default TINYINT(1) DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_is_active (is_active),
                INDEX idx_is_default (is_default)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await db.queryAsync(createTableSql);

        res.json({
            success: true,
            message: "User addresses table initialized successfully"
        });

    } catch (error) {
        console.error("Initialize table error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize table"
        });
    }
});

module.exports = router;