// controllers/promoCodeController.js
const db = require('../config/db');

// Get all promo codes
exports.getAllPromoCodes = (req, res) => {
    const query = `
        SELECT * FROM promo_codes 
        ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching promos:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        res.json({
            success: true,
            promos: results
        });
    });
};

// Get single promo code by ID
exports.getPromoCodeById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM promo_codes WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching promo:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }

        res.json({
            success: true,
            promo: results[0]
        });
    });
};

// Create new promo code
exports.createPromoCode = (req, res) => {
    const {
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        per_user_limit,
        start_date,
        end_date,
        is_active
    } = req.body;

    // Validation
    if (!code || !discount_type || !discount_value) {
        return res.status(400).json({
            success: false,
            message: 'Code, discount type and discount value are required'
        });
    }

    // Check if code already exists
    const checkQuery = 'SELECT id FROM promo_codes WHERE code = ?';
    db.query(checkQuery, [code], (err, results) => {
        if (err) {
            console.error('Error checking promo code:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Promo code already exists'
            });
        }

        // Insert new promo code
        const insertQuery = `
            INSERT INTO promo_codes (
                code, description, discount_type, discount_value, 
                min_order_amount, max_discount_amount, usage_limit, 
                used_count, per_user_limit, start_date, end_date, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
        `;

        const values = [
            code.toUpperCase(),
            description || null,
            discount_type,
            discount_value,
            min_order_amount || 0.00,
            max_discount_amount || null,
            usage_limit || null,
            per_user_limit || 1,
            start_date || null,
            end_date || null,
            is_active !== undefined ? is_active : 1
        ];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error creating promo code:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error',
                    error: err.message
                });
            }

            // Fetch the created promo code
            const fetchQuery = 'SELECT * FROM promo_codes WHERE id = ?';
            db.query(fetchQuery, [result.insertId], (err, promo) => {
                if (err) {
                    return res.status(201).json({
                        success: true,
                        message: 'Promo code created successfully',
                        id: result.insertId
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Promo code created successfully',
                    promo: promo[0]
                });
            });
        });
    });
};

// Update promo code
exports.updatePromoCode = (req, res) => {
    const { id } = req.params;
    const {
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        per_user_limit,
        start_date,
        end_date,
        is_active
    } = req.body;

    // Check if promo exists
    const checkQuery = 'SELECT id FROM promo_codes WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error checking promo:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }

        // Check if new code already exists (excluding current promo)
        if (code) {
            const codeCheckQuery = 'SELECT id FROM promo_codes WHERE code = ? AND id != ?';
            db.query(codeCheckQuery, [code, id], (err, codeResults) => {
                if (err) {
                    console.error('Error checking promo code:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (codeResults.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Promo code already exists'
                    });
                }

                // Proceed with update
                updatePromoCode();
            });
        } else {
            updatePromoCode();
        }

        function updatePromoCode() {
            const updateQuery = `
                UPDATE promo_codes SET
                    code = COALESCE(?, code),
                    description = ?,
                    discount_type = COALESCE(?, discount_type),
                    discount_value = COALESCE(?, discount_value),
                    min_order_amount = COALESCE(?, min_order_amount),
                    max_discount_amount = ?,
                    usage_limit = ?,
                    per_user_limit = COALESCE(?, per_user_limit),
                    start_date = ?,
                    end_date = ?,
                    is_active = COALESCE(?, is_active)
                WHERE id = ?
            `;

            const values = [
                code ? code.toUpperCase() : null,
                description,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount_amount || null,
                usage_limit || null,
                per_user_limit,
                start_date || null,
                end_date || null,
                is_active,
                id
            ];

            db.query(updateQuery, values, (err, result) => {
                if (err) {
                    console.error('Error updating promo code:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error',
                        error: err.message
                    });
                }

                // Fetch updated promo
                const fetchQuery = 'SELECT * FROM promo_codes WHERE id = ?';
                db.query(fetchQuery, [id], (err, promo) => {
                    if (err) {
                        return res.json({
                            success: true,
                            message: 'Promo code updated successfully'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Promo code updated successfully',
                        promo: promo[0]
                    });
                });
            });
        }
    });
};

// Toggle promo code active status
exports.togglePromoStatus = (req, res) => {
    const { id } = req.params;

    const query = `
        UPDATE promo_codes 
        SET is_active = NOT is_active 
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error toggling promo status:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }

        // Fetch updated status
        const fetchQuery = 'SELECT is_active FROM promo_codes WHERE id = ?';
        db.query(fetchQuery, [id], (err, promo) => {
            if (err) {
                return res.json({
                    success: true,
                    message: 'Promo status toggled successfully'
                });
            }

            res.json({
                success: true,
                message: 'Promo status toggled successfully',
                is_active: promo[0].is_active
            });
        });
    });
};

// Delete promo code
exports.deletePromoCode = (req, res) => {
    const { id } = req.params;

    // First delete related promo usage records
    const deleteUsageQuery = 'DELETE FROM promo_code_usage WHERE promo_code_id = ?';
    db.query(deleteUsageQuery, [id], (err) => {
        if (err) {
            console.error('Error deleting promo usage:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        // Then delete the promo code
        const deleteQuery = 'DELETE FROM promo_codes WHERE id = ?';
        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error deleting promo code:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Promo code not found'
                });
            }

            res.json({
                success: true,
                message: 'Promo code deleted successfully'
            });
        });
    });
};

// Validate promo code
exports.validatePromoCode = (req, res) => {
    const { code, user_id, order_amount } = req.body;

    const query = `
        SELECT * FROM promo_codes 
        WHERE code = ? 
        AND is_active = 1 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
    `;

    db.query(query, [code], (err, results) => {
        if (err) {
            console.error('Error validating promo:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired promo code'
            });
        }

        const promo = results[0];

        // Check minimum order amount
        if (order_amount < promo.min_order_amount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount should be ₹${promo.min_order_amount}`
            });
        }

        // Check per user limit
        if (user_id && promo.per_user_limit) {
            const checkUserQuery = `
                SELECT COUNT(*) as used_count 
                FROM promo_code_usage 
                WHERE promo_code_id = ? AND user_id = ?
            `;
            db.query(checkUserQuery, [promo.id, user_id], (err, usageResults) => {
                if (err) {
                    console.error('Error checking user usage:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (usageResults[0].used_count >= promo.per_user_limit) {
                    return res.status(400).json({
                        success: false,
                        message: `You have already used this promo code ${promo.per_user_limit} time(s)`
                    });
                }

                calculateDiscount(promo, order_amount, res);
            });
        } else {
            calculateDiscount(promo, order_amount, res);
        }
    });
};

// Helper function to calculate discount
function calculateDiscount(promo, order_amount, res) {
    let discount_amount = 0;

    if (promo.discount_type === 'percentage') {
        discount_amount = (order_amount * promo.discount_value) / 100;
        if (promo.max_discount_amount && discount_amount > promo.max_discount_amount) {
            discount_amount = promo.max_discount_amount;
        }
    } else if (promo.discount_type === 'fixed') {
        discount_amount = promo.discount_value;
    } else if (promo.discount_type === 'shipping') {
        discount_amount = 0; // Free shipping
    }

    res.json({
        success: true,
        promo: promo,
        discount_amount: Math.round(discount_amount * 100) / 100,
        final_amount: order_amount - discount_amount
    });
}

// Use promo code (increment usage)
exports.usePromoCode = (req, res) => {
    const { id } = req.params;
    const { user_id, order_id } = req.body;

    // Increment usage count
    const updateQuery = `
        UPDATE promo_codes 
        SET used_count = used_count + 1 
        WHERE id = ?
    `;

    db.query(updateQuery, [id], (err, result) => {
        if (err) {
            console.error('Error incrementing usage:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        // Record usage
        if (user_id && order_id) {
            const usageQuery = `
                INSERT INTO promo_code_usage (promo_code_id, user_id, order_id) 
                VALUES (?, ?, ?)
            `;
            db.query(usageQuery, [id, user_id, order_id], (err) => {
                if (err) {
                    console.error('Error recording usage:', err);
                }
            });
        }

        res.json({
            success: true,
            message: 'Promo code used successfully'
        });
    });
};
// Get promo code statistics - Fixed version
exports.getPromoStats = (req, res) => {
    const db = req.db; // Make sure db is accessible

    // Execute queries one by one
    db.query('SELECT COUNT(*) as total FROM promo_codes', (err1, totalResult) => {
        if (err1) {
            console.error('Error fetching total stats:', err1);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        db.query('SELECT COUNT(*) as active FROM promo_codes WHERE is_active = 1', (err2, activeResult) => {
            if (err2) {
                console.error('Error fetching active stats:', err2);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            const expiringQuery = `
                SELECT COUNT(*) as expiring 
                FROM promo_codes 
                WHERE end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
                AND is_active = 1
            `;

            db.query(expiringQuery, (err3, expiringResult) => {
                if (err3) {
                    console.error('Error fetching expiring stats:', err3);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                db.query('SELECT SUM(used_count) as totalUsage FROM promo_codes', (err4, usageResult) => {
                    if (err4) {
                        console.error('Error fetching usage stats:', err4);
                        return res.status(500).json({
                            success: false,
                            message: 'Database error'
                        });
                    }

                    res.json({
                        success: true,
                        stats: {
                            total: totalResult[0].total,
                            active: activeResult[0].active,
                            expiring: expiringResult[0].expiring,
                            totalUsage: usageResult[0].totalUsage || 0
                        }
                    });
                });
            });
        });
    });
};