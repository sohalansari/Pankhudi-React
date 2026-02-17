const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// Import email service
let emailService;
try {
    emailService = require("../services/emailService");
    console.log("📧 Email service loaded in emailRoutes");
} catch (error) {
    console.error("❌ Email service not loaded:", error.message);
    // Create fallback email service
    emailService = {
        sendOrderConfirmation: async (orderData, userEmail, userName) => {
            console.log("⚠️ Email service not available");
            return { success: false, error: "Email service not available" };
        }
    };
}

// ==================== SEND ORDER CONFIRMATION EMAIL ====================
router.post("/send-order-confirmation", authenticateToken, async (req, res) => {
    console.log("========== 📧 SEND ORDER CONFIRMATION EMAIL ==========");

    try {
        const {
            to,
            userName,
            orderNumber,
            orderDate,
            products,
            subtotal,
            shipping,
            tax,
            discount,
            total,
            paymentMethod,
            paymentStatus,
            shippingAddress,
            billingAddress,
            orderNote,
            estimatedDelivery,
            trackingUrl,
            supportEmail,
            supportPhone
        } = req.body;

        // Validate required fields
        if (!to || !orderNumber) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: email and order number are required"
            });
        }

        console.log(`📧 Preparing email for: ${to}`);
        console.log(`📦 Order #: ${orderNumber}`);

        // Prepare order data for email service
        const orderData = {
            orderId: req.body.orderId,
            orderNumber,
            items: products.map(p => ({
                product_name: p.name,
                quantity: p.quantity,
                price: p.price,
                total: p.total,
                image: p.image,
                sku: p.sku,
                size: p.size,
                color: p.color
            })),
            shippingAddress: {
                fullName: shippingAddress?.fullName || '',
                address: shippingAddress?.address || '',
                city: shippingAddress?.city || '',
                state: shippingAddress?.state || '',
                postalCode: shippingAddress?.postalCode || '',
                country: shippingAddress?.country || 'India',
                phone: shippingAddress?.phone || '',
                email: shippingAddress?.email || to
            },
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            paymentStatus,
            subtotal,
            taxAmount: tax,
            shippingCharge: shipping,
            discountAmount: discount,
            totalAmount: total,
            orderNote,
            created_at: new Date(orderDate)
        };

        // Send email using email service
        const emailResult = await emailService.sendOrderConfirmation(
            orderData,
            to,
            userName || 'Valued Customer'
        );

        if (emailResult.success) {
            console.log(`✅ Order confirmation email sent successfully to ${to}`);

            // Log email in database (optional)
            try {
                const db = req.db;
                if (db) {
                    const logQuery = `
                        INSERT INTO email_logs 
                        (recipient, subject, order_number, status, message_id, created_at) 
                        VALUES (?, ?, ?, ?, ?, NOW())
                    `;
                    db.query(logQuery, [
                        to,
                        `Order Confirmation #${orderNumber}`,
                        orderNumber,
                        'sent',
                        emailResult.messageId || null
                    ]);
                }
            } catch (logError) {
                console.error("Error logging email:", logError);
            }

            res.json({
                success: true,
                message: "Order confirmation email sent successfully",
                messageId: emailResult.messageId,
                to: to
            });
        } else {
            throw new Error(emailResult.error || "Failed to send email");
        }

    } catch (error) {
        console.error("❌ Error sending order confirmation email:", error);

        // Log failed email
        try {
            const db = req.db;
            if (db && req.body.orderNumber) {
                const logQuery = `
                    INSERT INTO email_logs 
                    (recipient, subject, order_number, status, error, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(logQuery, [
                    req.body.to,
                    `Order Confirmation #${req.body.orderNumber}`,
                    req.body.orderNumber,
                    'failed',
                    error.message
                ]);
            }
        } catch (logError) {
            console.error("Error logging failed email:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Failed to send order confirmation email",
            error: error.message
        });
    }
});

// ==================== SEND ORDER STATUS UPDATE EMAIL ====================
router.post("/send-status-update", authenticateToken, async (req, res) => {
    console.log("========== 📧 SEND ORDER STATUS UPDATE EMAIL ==========");

    try {
        const {
            to,
            userName,
            orderNumber,
            status,
            comment,
            trackingUrl
        } = req.body;

        if (!to || !orderNumber || !status) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Get order details from database
        const db = req.db;
        const orderQuery = "SELECT * FROM orders WHERE order_number = ?";

        db.query(orderQuery, [orderNumber], async (err, orderResults) => {
            if (err) {
                console.error("Error fetching order:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (!orderResults || orderResults.length === 0) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Prepare order data
            const orderData = {
                orderId: order.id,
                orderNumber: order.order_number,
                totalAmount: order.total_amount,
                created_at: order.order_date
            };

            // Send status update email
            const emailResult = await emailService.sendOrderStatusUpdate(
                orderData,
                to,
                userName,
                status,
                comment,
                trackingUrl
            );

            if (emailResult.success) {
                console.log(`✅ Status update email sent to ${to}`);
                res.json({
                    success: true,
                    message: "Status update email sent successfully",
                    messageId: emailResult.messageId
                });
            } else {
                throw new Error(emailResult.error || "Failed to send email");
            }
        });

    } catch (error) {
        console.error("❌ Error sending status update email:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send status update email",
            error: error.message
        });
    }
});

// ==================== TEST EMAIL CONFIGURATION ====================
router.get("/test-config", authenticateToken, async (req, res) => {
    console.log("========== 📧 TEST EMAIL CONFIGURATION ==========");

    try {
        const testResult = await emailService.testEmailConfig();

        res.json({
            success: testResult.success,
            message: testResult.message || "Email configuration test completed",
            details: testResult,
            env: {
                EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
                EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Missing",
                EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com (default)",
                EMAIL_PORT: process.env.EMAIL_PORT || "587 (default)"
            }
        });
    } catch (error) {
        console.error("❌ Email test error:", error);
        res.status(500).json({
            success: false,
            message: "Email configuration test failed",
            error: error.message
        });
    }
});

// ==================== GET EMAIL LOGS ====================
router.get("/logs", authenticateToken, async (req, res) => {
    console.log("========== 📧 GET EMAIL LOGS ==========");

    try {
        const db = req.db;
        const { limit = 50, orderNumber } = req.query;

        let query = "SELECT * FROM email_logs";
        let params = [];

        if (orderNumber) {
            query += " WHERE order_number = ?";
            params.push(orderNumber);
        }

        query += " ORDER BY created_at DESC LIMIT ?";
        params.push(parseInt(limit));

        db.query(query, params, (err, results) => {
            if (err) {
                console.error("Error fetching email logs:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            res.json({
                success: true,
                logs: results || []
            });
        });
    } catch (error) {
        console.error("❌ Error fetching email logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch email logs",
            error: error.message
        });
    }
});

module.exports = router;