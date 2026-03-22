const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// ==================== VALIDATE PROMO CODE ====================
router.post("/validate", authenticateToken, (req, res) => {
    const db = req.db;
    const { promoCode, subtotal } = req.body;
    const userId = req.user.id;

    console.log("========== 🎟️ VALIDATE PROMO CODE ==========");
    console.log("Promo Code:", promoCode);
    console.log("User ID:", userId);
    console.log("Subtotal:", subtotal);

    if (!promoCode) {
        return res.status(400).json({
            success: false,
            valid: false,
            message: "Promo code is required"
        });
    }

    const promoQuery = `
        SELECT 
            id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            usage_limit,
            used_count,
            per_user_limit
        FROM promo_codes 
        WHERE code = ? 
        AND is_active = 1 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    `;

    db.query(promoQuery, [promoCode.toUpperCase()], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({
                success: false,
                valid: false,
                message: "Error validating promo code"
            });
        }

        if (!results || results.length === 0) {
            console.log("❌ Promo code not found:", promoCode);
            return res.json({
                success: true,
                valid: false,
                message: "Invalid or expired promo code"
            });
        }

        const promo = results[0];
        console.log("✅ Promo found:", promo.code);

        // Check global usage limit
        if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
            return res.json({
                success: true,
                valid: false,
                message: "Promo code usage limit exceeded"
            });
        }

        // Check per-user limit
        if (promo.per_user_limit > 0) {
            const usageQuery = `
                SELECT COUNT(*) as count 
                FROM promo_code_usage 
                WHERE promo_code_id = ? AND user_id = ?
            `;

            db.query(usageQuery, [promo.id, userId], (usageErr, usageResults) => {
                if (usageErr) {
                    console.error("❌ Usage check error:", usageErr);
                    return res.status(500).json({
                        success: false,
                        valid: false,
                        message: "Error checking promo usage"
                    });
                }

                const userUsageCount = usageResults[0].count;
                const remainingUses = promo.per_user_limit - userUsageCount;

                console.log(`User ${userId} has used this promo ${userUsageCount} times`);
                console.log(`Remaining uses: ${remainingUses}`);

                if (userUsageCount >= promo.per_user_limit) {
                    return res.json({
                        success: true,
                        valid: false,
                        message: `You have already used this promo code ${promo.per_user_limit} time(s)`
                    });
                }

                // Calculate discount for preview
                let discountAmount = 0;
                if (subtotal) {
                    if (promo.discount_type === 'percentage') {
                        discountAmount = (subtotal * promo.discount_value / 100);
                        if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
                            discountAmount = promo.max_discount_amount;
                        }
                    } else if (promo.discount_type === 'fixed') {
                        discountAmount = promo.discount_value;
                    }
                }

                // Valid promo
                res.json({
                    success: true,
                    valid: true,
                    promo: {
                        id: promo.id,
                        code: promo.code,
                        description: promo.description,
                        discountType: promo.discount_type,
                        discountValue: parseFloat(promo.discount_value),
                        minOrder: parseFloat(promo.min_order_amount),
                        maxDiscount: promo.max_discount_amount ? parseFloat(promo.max_discount_amount) : null,
                        perUserLimit: promo.per_user_limit,
                        userUsageCount: userUsageCount,
                        remainingUses: remainingUses
                    },
                    discountAmount: discountAmount || 0,
                    finalAmount: subtotal ? subtotal - discountAmount : 0,
                    message: "Promo code is valid! Apply to get discount."
                });
            });
        } else {
            // Calculate discount for preview
            let discountAmount = 0;
            if (subtotal) {
                if (promo.discount_type === 'percentage') {
                    discountAmount = (subtotal * promo.discount_value / 100);
                    if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
                        discountAmount = promo.max_discount_amount;
                    }
                } else if (promo.discount_type === 'fixed') {
                    discountAmount = promo.discount_value;
                }
            }

            // Valid promo (no per-user limit)
            res.json({
                success: true,
                valid: true,
                promo: {
                    id: promo.id,
                    code: promo.code,
                    description: promo.description,
                    discountType: promo.discount_type,
                    discountValue: parseFloat(promo.discount_value),
                    minOrder: parseFloat(promo.min_order_amount),
                    maxDiscount: promo.max_discount_amount ? parseFloat(promo.max_discount_amount) : null,
                    perUserLimit: null,
                    userUsageCount: 0,
                    remainingUses: null
                },
                discountAmount: discountAmount || 0,
                finalAmount: subtotal ? subtotal - discountAmount : 0,
                message: "Promo code is valid! Apply to get discount."
            });
        }
    });
});

// ==================== APPLY PROMO TO ORDER ====================
router.post("/apply", authenticateToken, (req, res) => {
    const db = req.db;
    const { promoCode, orderId, subtotal } = req.body;
    const userId = req.user.id;

    console.log("========== 🎟️ APPLY PROMO TO ORDER ==========");
    console.log("Promo Code:", promoCode);
    console.log("Order ID:", orderId);
    console.log("Subtotal:", subtotal);
    console.log("User ID:", userId);

    if (!promoCode) {
        return res.status(400).json({
            success: false,
            message: "Promo code is required"
        });
    }

    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: "Order ID is required to apply promo"
        });
    }

    const promoQuery = `
        SELECT * FROM promo_codes 
        WHERE code = ? AND is_active = 1 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    `;

    db.query(promoQuery, [promoCode.toUpperCase()], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (!results || results.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid promo code"
            });
        }

        const promo = results[0];

        // Check minimum order
        if (subtotal < promo.min_order_amount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${promo.min_order_amount} required`
            });
        }

        // Check global usage limit
        if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
            return res.status(400).json({
                success: false,
                message: "Promo code usage limit exceeded"
            });
        }

        // Check per-user limit
        if (promo.per_user_limit > 0) {
            const usageQuery = `
                SELECT COUNT(*) as count 
                FROM promo_code_usage 
                WHERE promo_code_id = ? AND user_id = ?
            `;

            db.query(usageQuery, [promo.id, userId], (usageErr, usageResults) => {
                if (usageErr) {
                    console.error("❌ Usage check error:", usageErr);
                    return res.status(500).json({ success: false, message: "Database error" });
                }

                if (usageResults[0].count >= promo.per_user_limit) {
                    return res.status(400).json({
                        success: false,
                        message: `You have already used this promo code ${promo.per_user_limit} time(s)`
                    });
                }

                applyPromoAndLog();
            });
        } else {
            applyPromoAndLog();
        }

        function applyPromoAndLog() {
            // Calculate discount
            let discountAmount = 0;
            let discountDetails = {};

            if (promo.discount_type === 'percentage') {
                discountAmount = (subtotal * promo.discount_value / 100);
                if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
                    discountAmount = promo.max_discount_amount;
                }
                discountDetails = {
                    type: 'percentage',
                    rate: promo.discount_value,
                    maxDiscount: promo.max_discount_amount
                };
            } else if (promo.discount_type === 'fixed') {
                discountAmount = promo.discount_value;
                discountDetails = {
                    type: 'fixed',
                    amount: promo.discount_value
                };
            } else if (promo.discount_type === 'shipping') {
                discountAmount = 0;
                discountDetails = {
                    type: 'shipping',
                    message: 'Free Shipping'
                };
            }

            const finalAmount = subtotal - discountAmount;

            // ✅ Update promo used_count
            db.query(
                'UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?',
                [promo.id],
                (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error("❌ Error updating promo count:", updateErr);
                    } else {
                        console.log(`✅ Promo used_count updated. Affected rows: ${updateResult.affectedRows}`);
                        console.log(`📊 New used_count: ${promo.used_count + 1}`);
                    }
                }
            );

            // ✅ Insert into promo_code_usage
            db.query(
                'INSERT INTO promo_code_usage (promo_code_id, user_id, order_id, used_at) VALUES (?, ?, ?, NOW())',
                [promo.id, userId, orderId],
                (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error("❌ Error inserting promo usage:", insertErr);
                        console.error("Error details:", insertErr.sqlMessage);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to log promo usage",
                            error: insertErr.message
                        });
                    }

                    console.log(`✅ Promo usage logged successfully!`);
                    console.log(`📊 Insert ID: ${insertResult.insertId}`);
                    console.log(`📊 Data: PromoID=${promo.id}, UserID=${userId}, OrderID=${orderId}`);

                    // ✅ Fetch the inserted record to confirm
                    db.query(
                        'SELECT * FROM promo_code_usage WHERE id = ?',
                        [insertResult.insertId],
                        (fetchErr, fetchResults) => {
                            if (!fetchErr && fetchResults.length > 0) {
                                console.log("✅ Verified inserted record:", fetchResults[0]);
                            }
                        }
                    );

                    res.json({
                        success: true,
                        message: "Promo code applied successfully",
                        discount: {
                            type: promo.discount_type,
                            amount: discountAmount,
                            code: promo.code,
                            description: promo.description,
                            details: discountDetails
                        },
                        orderDetails: {
                            subtotal: subtotal,
                            discountAmount: discountAmount,
                            finalAmount: finalAmount
                        }
                    });
                }
            );
        }
    });
});

// ==================== GET USER PROMO USAGE ====================
router.get("/usage/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;
    const { promoId } = req.query;

    console.log("========== 🎟️ GET PROMO USAGE ==========");
    console.log("User ID:", userId);
    console.log("Promo ID:", promoId);

    let query = `
        SELECT 
            pcu.*,
            pc.code as promo_code,
            pc.description as promo_description,
            pc.discount_type,
            pc.discount_value,
            o.order_number,
            o.total_amount as order_total,
            o.order_date
        FROM promo_code_usage pcu
        JOIN promo_codes pc ON pcu.promo_code_id = pc.id
        LEFT JOIN orders o ON pcu.order_id = o.id
        WHERE pcu.user_id = ?
    `;

    const params = [userId];

    if (promoId) {
        query += ` AND pcu.promo_code_id = ?`;
        params.push(promoId);
    }

    query += ` ORDER BY pcu.used_at DESC`;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("❌ Error fetching promo usage:", err);
            return res.status(500).json({
                success: false,
                message: "Error fetching promo usage"
            });
        }

        console.log(`✅ Found ${results.length} promo usage records`);

        res.json({
            success: true,
            usage: results
        });
    });
});

// ==================== CHECK PROMO AVAILABILITY ====================
router.get("/check/:code", authenticateToken, (req, res) => {
    const db = req.db;
    const { code } = req.params;
    const userId = req.user.id;

    console.log("========== 🎟️ CHECK PROMO AVAILABILITY ==========");
    console.log("Code:", code);
    console.log("User ID:", userId);

    const query = `
        SELECT 
            p.*,
            (SELECT COUNT(*) FROM promo_code_usage WHERE promo_code_id = p.id) as total_used,
            (SELECT COUNT(*) FROM promo_code_usage WHERE promo_code_id = p.id AND user_id = ?) as user_used
        FROM promo_codes p
        WHERE p.code = ? AND p.is_active = 1
        AND (p.start_date IS NULL OR p.start_date <= NOW())
        AND (p.end_date IS NULL OR p.end_date >= NOW())
    `;

    db.query(query, [userId, code.toUpperCase()], (err, results) => {
        if (err) {
            console.error("❌ Error checking promo:", err);
            return res.status(500).json({
                success: false,
                message: "Error checking promo"
            });
        }

        if (!results || results.length === 0) {
            return res.json({
                success: true,
                available: false,
                message: "Promo code not available"
            });
        }

        const promo = results[0];
        const available = (!promo.usage_limit || promo.total_used < promo.usage_limit) &&
            (!promo.per_user_limit || promo.user_used < promo.per_user_limit);

        const remainingGlobal = promo.usage_limit ? promo.usage_limit - promo.total_used : 'Unlimited';
        const remainingUser = promo.per_user_limit ? promo.per_user_limit - promo.user_used : 'Unlimited';

        res.json({
            success: true,
            available: available,
            promo: {
                id: promo.id,
                code: promo.code,
                description: promo.description,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                min_order_amount: promo.min_order_amount,
                max_discount_amount: promo.max_discount_amount,
                total_used: promo.total_used,
                user_used: promo.user_used,
                usage_limit: promo.usage_limit,
                per_user_limit: promo.per_user_limit,
                remaining_global: remainingGlobal,
                remaining_user: remainingUser
            },
            message: available ? "Promo code is available" : "Promo code is not available"
        });
    });
});

module.exports = router;