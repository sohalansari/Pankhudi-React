// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// require("dotenv").config();

// // ------------------- IMPORT EMAIL SERVICE -------------------
// let emailService;
// try {
//     emailService = require("../services/emailService");
//     console.log("📧 Email service loaded in orderRoutes");
// } catch (error) {
//     console.error("❌ Email service not loaded in orderRoutes:", error.message);
//     emailService = null;
// }

// // ------------------- Middleware: Verify Token -------------------
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
//         if (err) return res.status(403).json({ message: "Invalid token" });
//         req.user = decodedUser;
//         req.user.id = decodedUser.id || decodedUser.userId;
//         next();
//     });
// };

// // ==================== 🎯 1. CREATE ORDER FROM CART ====================
// router.post("/create", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     console.log("========== 📦 CREATE ORDER ==========");
//     console.log("User ID:", userId);
//     console.log("Payment Method:", req.body.paymentMethod);

//     const {
//         shippingAddress,
//         billingAddress,
//         paymentMethod,
//         paymentId,
//         paymentStatus,
//         subtotal,
//         taxAmount,
//         shippingCharge,
//         totalAmount,
//         orderNote,
//         items
//     } = req.body;

//     // ✅ Validation
//     if (!shippingAddress) {
//         return res.status(400).json({ success: false, message: "Shipping address is required" });
//     }
//     if (!paymentMethod) {
//         return res.status(400).json({ success: false, message: "Payment method is required" });
//     }
//     if (!items || !Array.isArray(items) || items.length === 0) {
//         return res.status(400).json({ success: false, message: "Items are required" });
//     }

//     // ✅ Get connection from pool
//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         // ✅ Start transaction
//         connection.beginTransaction((err) => {
//             if (err) {
//                 connection.release();
//                 console.error("❌ Begin transaction error:", err);
//                 return res.status(500).json({ success: false, message: "Failed to start transaction" });
//             }

//             // ========== 1. INSERT ORDER ==========
//             const orderQuery = `
//                 INSERT INTO orders (
//                     user_id, 
//                     shipping_full_name, shipping_address, shipping_city, 
//                     shipping_state, shipping_postal_code, shipping_country,
//                     shipping_phone, shipping_email,
//                     billing_full_name, billing_address, billing_city,
//                     billing_state, billing_postal_code, billing_country,
//                     payment_method, payment_id, payment_status,
//                     subtotal, tax_amount, shipping_charge, discount_amount, total_amount,
//                     order_note, order_status, order_date
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             const orderValues = [
//                 userId,
//                 shippingAddress.fullName || '',
//                 shippingAddress.address || '',
//                 shippingAddress.city || '',
//                 shippingAddress.state || '',
//                 shippingAddress.postalCode || '',
//                 shippingAddress.country || 'India',
//                 shippingAddress.phone || '',
//                 shippingAddress.email || '',
//                 billingAddress?.fullName || shippingAddress.fullName || '',
//                 billingAddress?.address || shippingAddress.address || '',
//                 billingAddress?.city || shippingAddress.city || '',
//                 billingAddress?.state || shippingAddress.state || '',
//                 billingAddress?.postalCode || shippingAddress.postalCode || '',
//                 billingAddress?.country || shippingAddress.country || 'India',
//                 paymentMethod,
//                 paymentId || null,
//                 paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
//                 subtotal || 0,
//                 taxAmount || 0,
//                 shippingCharge || 0,
//                 0,
//                 totalAmount || 0,
//                 orderNote || null,
//                 paymentMethod === 'cod' ? 'pending' : 'processing',
//                 new Date()
//             ];

//             connection.query(orderQuery, orderValues, (orderErr, orderResult) => {
//                 if (orderErr) {
//                     console.error("❌ Order insert error:", orderErr);
//                     return connection.rollback(() => {
//                         connection.release();
//                         res.status(500).json({
//                             success: false,
//                             message: "Failed to create order",
//                             error: orderErr.message
//                         });
//                     });
//                 }

//                 const orderId = orderResult.insertId;
//                 console.log("✅ Order ID:", orderId);

//                 // ========== 2. GET ORDER NUMBER ==========
//                 connection.query(
//                     'SELECT order_number FROM orders WHERE id = ?',
//                     [orderId],
//                     (numberErr, numberResult) => {
//                         if (numberErr) {
//                             console.error("❌ Order number error:", numberErr);
//                         }

//                         const orderNumber = (numberResult && numberResult[0]?.order_number) || `ORD-${Date.now()}`;
//                         console.log("✅ Order Number:", orderNumber);

//                         // ========== 3. INSERT ORDER ITEMS ==========
//                         let itemsProcessed = 0;
//                         let hasError = false;

//                         if (!items || items.length === 0) {
//                             // No items to insert
//                             itemsProcessed = 1;
//                         } else {
//                             items.forEach((item, index) => {
//                                 const itemTotal = (parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2);

//                                 const itemQuery = `
//                                     INSERT INTO order_items (
//                                         order_id, order_number, product_id, product_name, sku,
//                                         quantity, price, discount_percent, final_price,
//                                         size, color, shipping_cost, free_shipping,
//                                         tax_rate, tax_amount, total_price
//                                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                                 `;

//                                 const itemValues = [
//                                     orderId,
//                                     orderNumber,
//                                     item.productId,
//                                     item.product_name || item.name || 'Product',
//                                     item.sku || null,
//                                     item.quantity || 1,
//                                     item.price || 0,
//                                     item.discount_percent || item.discount || 0,
//                                     item.price || 0,
//                                     item.size || null,
//                                     item.color || null,
//                                     item.shipping_cost || 0,
//                                     item.free_shipping ? 1 : 0,
//                                     item.tax_rate || 0,
//                                     item.tax_amount || 0,
//                                     itemTotal
//                                 ];

//                                 connection.query(itemQuery, itemValues, (itemErr) => {
//                                     if (itemErr) {
//                                         console.error("❌ Item insert error:", itemErr);
//                                         hasError = true;
//                                     }

//                                     // ========== 4. UPDATE STOCK ==========
//                                     connection.query(
//                                         'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
//                                         [item.quantity, item.productId, item.quantity],
//                                         (stockErr) => {
//                                             if (stockErr) {
//                                                 console.error("❌ Stock update error:", stockErr);
//                                             }
//                                         }
//                                     );

//                                     itemsProcessed++;

//                                     // ✅ All items processed
//                                     if (itemsProcessed === items.length) {
//                                         if (hasError) {
//                                             return connection.rollback(() => {
//                                                 connection.release();
//                                                 res.status(500).json({
//                                                     success: false,
//                                                     message: "Failed to insert order items"
//                                                 });
//                                             });
//                                         }

//                                         // ========== 5. CLEAR CART ==========
//                                         connection.query(
//                                             'DELETE FROM cart WHERE user_id = ?',
//                                             [userId],
//                                             (cartErr) => {
//                                                 if (cartErr) {
//                                                     console.error("❌ Cart clear error:", cartErr);
//                                                 }

//                                                 // ========== 6. COMMIT TRANSACTION ==========
//                                                 connection.commit((commitErr) => {
//                                                     if (commitErr) {
//                                                         console.error("❌ Commit error:", commitErr);
//                                                         return connection.rollback(() => {
//                                                             connection.release();
//                                                             res.status(500).json({
//                                                                 success: false,
//                                                                 message: "Failed to commit transaction"
//                                                             });
//                                                         });
//                                                     }

//                                                     connection.release();
//                                                     console.log("✅ Order created successfully!");
//                                                     console.log(`📦 Order #${orderNumber}`);

//                                                     res.status(201).json({
//                                                         success: true,
//                                                         message: paymentMethod === 'cod'
//                                                             ? "Order placed successfully"
//                                                             : "Order created successfully",
//                                                         orderId: orderId,
//                                                         orderNumber: orderNumber,
//                                                         totalAmount: totalAmount,
//                                                         paymentStatus: paymentMethod === 'cod'
//                                                             ? 'pending'
//                                                             : (paymentId ? 'completed' : 'pending'),
//                                                         redirectTo: `/checkout/review/${orderId}`
//                                                     });
//                                                 });
//                                             }
//                                         );
//                                     }
//                                 });
//                             });
//                         }
//                     }
//                 );
//             });
//         });
//     });
// });

// // ==================== 🎯 2. DIRECT BUY ORDER ====================
// router.post("/direct-buy", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;

//     console.log("========== 📦 DIRECT BUY ==========");
//     console.log("Product ID:", req.body.productId);

//     const {
//         productId,
//         quantity = 1,
//         size,
//         color,
//         shippingAddress,
//         paymentMethod,
//         paymentId,
//         paymentStatus,
//         subtotal,
//         taxAmount,
//         shippingCharge,
//         totalAmount,
//         orderNote
//     } = req.body;

//     // ✅ Validation
//     if (!productId) {
//         return res.status(400).json({ success: false, message: "Product ID is required" });
//     }
//     if (!shippingAddress) {
//         return res.status(400).json({ success: false, message: "Shipping address is required" });
//     }
//     if (!paymentMethod) {
//         return res.status(400).json({ success: false, message: "Payment method is required" });
//     }

//     // ✅ Get connection
//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         // ========== 1. GET PRODUCT DETAILS ==========
//         connection.query(
//             'SELECT * FROM products WHERE id = ? AND status = "active"',
//             [productId],
//             (productErr, productResults) => {
//                 if (productErr) {
//                     connection.release();
//                     console.error("❌ Product fetch error:", productErr);
//                     return res.status(500).json({ success: false, message: "Failed to fetch product" });
//                 }

//                 if (!productResults || productResults.length === 0) {
//                     connection.release();
//                     return res.status(404).json({ success: false, message: "Product not found" });
//                 }

//                 const product = productResults[0];

//                 // ========== 2. CHECK STOCK ==========
//                 if (product.stock < quantity) {
//                     connection.release();
//                     return res.status(400).json({
//                         success: false,
//                         message: `Only ${product.stock} items available`
//                     });
//                 }

//                 // ========== 3. START TRANSACTION ==========
//                 connection.beginTransaction((err) => {
//                     if (err) {
//                         connection.release();
//                         console.error("❌ Begin transaction error:", err);
//                         return res.status(500).json({ success: false, message: "Failed to start transaction" });
//                     }

//                     // ========== 4. INSERT ORDER ==========
//                     const orderQuery = `
//                         INSERT INTO orders (
//                             user_id, 
//                             shipping_full_name, shipping_address, shipping_city, 
//                             shipping_state, shipping_postal_code, shipping_country,
//                             shipping_phone, shipping_email,
//                             billing_full_name, billing_address, billing_city,
//                             billing_state, billing_postal_code, billing_country,
//                             payment_method, payment_id, payment_status,
//                             subtotal, tax_amount, shipping_charge, discount_amount, total_amount,
//                             order_note, order_status, order_date, checkout_type
//                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                     `;

//                     const orderValues = [
//                         userId,
//                         shippingAddress.fullName || '',
//                         shippingAddress.address || '',
//                         shippingAddress.city || '',
//                         shippingAddress.state || '',
//                         shippingAddress.postalCode || '',
//                         shippingAddress.country || 'India',
//                         shippingAddress.phone || '',
//                         shippingAddress.email || '',
//                         shippingAddress.fullName || '',
//                         shippingAddress.address || '',
//                         shippingAddress.city || '',
//                         shippingAddress.state || '',
//                         shippingAddress.postalCode || '',
//                         shippingAddress.country || 'India',
//                         paymentMethod,
//                         paymentId || null,
//                         paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
//                         subtotal || 0,
//                         taxAmount || 0,
//                         shippingCharge || 0,
//                         0,
//                         totalAmount || 0,
//                         orderNote || null,
//                         paymentMethod === 'cod' ? 'pending' : 'processing',
//                         new Date(),
//                         'direct'
//                     ];

//                     connection.query(orderQuery, orderValues, (orderErr, orderResult) => {
//                         if (orderErr) {
//                             console.error("❌ Order insert error:", orderErr);
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 res.status(500).json({ success: false, message: "Failed to create order" });
//                             });
//                         }

//                         const orderId = orderResult.insertId;
//                         console.log("✅ Order ID:", orderId);

//                         // ========== 5. GET ORDER NUMBER ==========
//                         connection.query(
//                             'SELECT order_number FROM orders WHERE id = ?',
//                             [orderId],
//                             (numberErr, numberResult) => {
//                                 if (numberErr) {
//                                     console.error("❌ Order number error:", numberErr);
//                                 }

//                                 const orderNumber = (numberResult && numberResult[0]?.order_number) || `ORD-${Date.now()}`;
//                                 console.log("✅ Order Number:", orderNumber);

//                                 // ========== 6. INSERT ORDER ITEM ==========
//                                 const itemTotal = (parseFloat(subtotal) || 0).toFixed(2);

//                                 const itemQuery = `
//                                     INSERT INTO order_items (
//                                         order_id, order_number, product_id, product_name, sku,
//                                         quantity, price, discount_percent, final_price,
//                                         size, color, shipping_cost, free_shipping,
//                                         tax_rate, tax_amount, total_price
//                                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                                 `;

//                                 const itemValues = [
//                                     orderId,
//                                     orderNumber,
//                                     productId,
//                                     product.name,
//                                     product.sku || null,
//                                     quantity,
//                                     product.price,
//                                     product.discount || 0,
//                                     (subtotal / quantity) || product.price,
//                                     size || null,
//                                     color || null,
//                                     product.shipping_cost || 0,
//                                     product.free_shipping || 0,
//                                     product.tax_rate || 0,
//                                     taxAmount || 0,
//                                     itemTotal
//                                 ];

//                                 connection.query(itemQuery, itemValues, (itemErr) => {
//                                     if (itemErr) {
//                                         console.error("❌ Item insert error:", itemErr);
//                                         return connection.rollback(() => {
//                                             connection.release();
//                                             res.status(500).json({ success: false, message: "Failed to insert item" });
//                                         });
//                                     }

//                                     // ========== 7. UPDATE STOCK ==========
//                                     connection.query(
//                                         'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
//                                         [quantity, productId, quantity],
//                                         (stockErr) => {
//                                             if (stockErr) {
//                                                 console.error("❌ Stock update error:", stockErr);
//                                                 return connection.rollback(() => {
//                                                     connection.release();
//                                                     res.status(500).json({ success: false, message: "Failed to update stock" });
//                                                 });
//                                             }

//                                             // ========== 8. COMMIT TRANSACTION ==========
//                                             connection.commit((commitErr) => {
//                                                 if (commitErr) {
//                                                     console.error("❌ Commit error:", commitErr);
//                                                     return connection.rollback(() => {
//                                                         connection.release();
//                                                         res.status(500).json({ success: false, message: "Failed to commit transaction" });
//                                                     });
//                                                 }

//                                                 connection.release();
//                                                 console.log("✅ Direct buy order created!");

//                                                 res.status(201).json({
//                                                     success: true,
//                                                     message: paymentMethod === 'cod'
//                                                         ? "Order placed successfully"
//                                                         : "Order created successfully",
//                                                     orderId: orderId,
//                                                     orderNumber: orderNumber,
//                                                     totalAmount: totalAmount,
//                                                     paymentStatus: paymentMethod === 'cod'
//                                                         ? 'pending'
//                                                         : (paymentId ? 'completed' : 'pending'),
//                                                     redirectTo: `/checkout/review/${orderId}`
//                                                 });
//                                             });
//                                         }
//                                     );
//                                 });
//                             }
//                         );
//                     });
//                 });
//             }
//         );
//     });
// });

// // ==================== 🎯 3. GET ORDER FOR REVIEW ====================
// router.get("/:orderId/review", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { orderId } = req.params;

//     console.log("========== 📋 GET ORDER REVIEW ==========");
//     console.log("Order ID:", orderId);

//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         // ========== GET ORDER ==========
//         connection.query(
//             'SELECT * FROM orders WHERE id = ? AND user_id = ?',
//             [orderId, userId],
//             (orderErr, orderResults) => {
//                 if (orderErr) {
//                     connection.release();
//                     console.error("❌ Order fetch error:", orderErr);
//                     return res.status(500).json({ success: false, message: "Failed to fetch order" });
//                 }

//                 if (!orderResults || orderResults.length === 0) {
//                     connection.release();
//                     return res.status(404).json({ success: false, message: "Order not found" });
//                 }

//                 const order = orderResults[0];

//                 // ========== GET ORDER ITEMS ==========
//                 connection.query(
//                     'SELECT * FROM order_items WHERE order_id = ?',
//                     [orderId],
//                     (itemsErr, itemsResults) => {
//                         connection.release();

//                         if (itemsErr) {
//                             console.error("❌ Items fetch error:", itemsErr);
//                             return res.status(500).json({ success: false, message: "Failed to fetch order items" });
//                         }

//                         res.json({
//                             success: true,
//                             order: {
//                                 ...order,
//                                 items: itemsResults || []
//                             }
//                         });
//                     }
//                 );
//             }
//         );
//     });
// });

// // ==================== 🎯 4. CONFIRM ORDER WITH EMAIL (FIXED) ====================
// router.post("/:orderId/confirm", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { orderId } = req.params;
//     const { orderNote, termsAccepted } = req.body;

//     console.log("========== ✅ CONFIRM ORDER ==========");
//     console.log("Order ID:", orderId);
//     console.log("User ID:", userId);

//     if (!termsAccepted) {
//         return res.status(400).json({
//             success: false,
//             message: "Please accept terms and conditions"
//         });
//     }

//     // Get connection
//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         // Get order details with user info
//         const getOrderQuery = `
//             SELECT 
//                 o.*,
//                 u.name as user_name,
//                 u.email as user_email
//             FROM orders o
//             JOIN users u ON o.user_id = u.id
//             WHERE o.id = ? AND o.user_id = ?
//         `;

//         connection.query(getOrderQuery, [orderId, userId], (orderErr, orderResults) => {
//             if (orderErr) {
//                 connection.release();
//                 console.error("❌ Order fetch error:", orderErr);
//                 return res.status(500).json({ success: false, message: "Failed to fetch order" });
//             }

//             if (!orderResults || orderResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ success: false, message: "Order not found" });
//             }

//             const order = orderResults[0];

//             // Check if already confirmed
//             if (order.order_status === 'confirmed' || order.order_status === 'processing') {
//                 connection.release();
//                 return res.status(400).json({
//                     success: false,
//                     message: `Order is already ${order.order_status}`
//                 });
//             }

//             // Get order items
//             connection.query(
//                 `SELECT 
//                     oi.*,
//                     '/uploads/products/default-product.jpg' as product_image
//                 FROM order_items oi
//                 WHERE oi.order_id = ?`,
//                 [orderId],
//                 (itemsErr, itemsResults) => {
//                     if (itemsErr) {
//                         connection.release();
//                         console.error("❌ Items fetch error:", itemsErr);
//                         return res.status(500).json({ success: false, message: "Failed to fetch items" });
//                     }

//                     order.items = itemsResults || [];

//                     // Start transaction
//                     connection.beginTransaction((transactionErr) => {
//                         if (transactionErr) {
//                             connection.release();
//                             console.error("❌ Transaction error:", transactionErr);
//                             return res.status(500).json({ success: false, message: "Transaction failed" });
//                         }

//                         // 1. Update order status
//                         const updateQuery = `
//                             UPDATE orders 
//                             SET order_status = 'confirmed',
//                                 order_note = CONCAT(IFNULL(order_note, ''), '\n', ?),
//                                 confirmed_at = ?,
//                                 updated_at = ?
//                             WHERE id = ? AND user_id = ?
//                         `;

//                         connection.query(
//                             updateQuery,
//                             [
//                                 `Order confirmed by customer on ${new Date().toLocaleString()}. Notes: ${orderNote || 'No notes'}`,
//                                 new Date(),
//                                 new Date(),
//                                 orderId,
//                                 userId
//                             ],
//                             (updateErr, updateResult) => {
//                                 if (updateErr) {
//                                     return connection.rollback(() => {
//                                         connection.release();
//                                         console.error("❌ Update error:", updateErr);
//                                         res.status(500).json({ success: false, message: "Failed to confirm order" });
//                                     });
//                                 }

//                                 // 2. Add status history
//                                 const historyQuery = `
//                                     INSERT INTO order_status_history 
//                                     (order_id, status, comment, created_by, created_at)
//                                     VALUES (?, ?, ?, ?, ?)
//                                 `;

//                                 connection.query(
//                                     historyQuery,
//                                     [
//                                         orderId,
//                                         'confirmed',
//                                         `Order confirmed by customer. ${orderNote || 'No notes'}`,
//                                         userId,
//                                         new Date()
//                                     ],
//                                     (historyErr) => {
//                                         if (historyErr) {
//                                             console.error("❌ History error:", historyErr);
//                                         }

//                                         // 3. Clear cart
//                                         connection.query(
//                                             'DELETE FROM cart WHERE user_id = ?',
//                                             [userId],
//                                             (cartErr) => {
//                                                 if (cartErr) {
//                                                     console.error("❌ Cart clear error:", cartErr);
//                                                 }

//                                                 // 4. Commit transaction
//                                                 connection.commit(async (commitErr) => {
//                                                     if (commitErr) {
//                                                         return connection.rollback(() => {
//                                                             connection.release();
//                                                             console.error("❌ Commit error:", commitErr);
//                                                             res.status(500).json({ success: false, message: "Commit failed" });
//                                                         });
//                                                     }

//                                                     connection.release();
//                                                     console.log("✅ Order confirmed successfully!");
//                                                     console.log(`📦 Order #${order.order_number} confirmed for ${order.user_email}`);

//                                                     // ========== 📧 SEND EMAIL ==========
//                                                     let emailResult = { success: false, error: 'Email service not available' };

//                                                     if (emailService) {
//                                                         try {
//                                                             console.log("📧 Attempting to send confirmation email...");

//                                                             // Call email service
//                                                             emailResult = await emailService.sendOrderConfirmationEmail(
//                                                                 order,
//                                                                 order.user_email,
//                                                                 order.user_name || 'Valued Customer'
//                                                             );

//                                                             console.log(`📧 Email result:`, emailResult);
//                                                         } catch (emailError) {
//                                                             console.error("❌ Email sending failed:");
//                                                             console.error(`   Message: ${emailError.message}`);
//                                                             emailResult = { success: false, error: emailError.message };
//                                                         }
//                                                     } else {
//                                                         console.error("❌ Email service not available in orderRoutes");
//                                                     }

//                                                     // 5. Send Response
//                                                     res.json({
//                                                         success: true,
//                                                         message: "Order confirmed successfully!",
//                                                         orderId: orderId,
//                                                         orderNumber: order.order_number,
//                                                         totalAmount: order.total_amount,
//                                                         redirectTo: `/order-confirmation/${orderId}`,
//                                                         email: {
//                                                             sent: emailResult.success,
//                                                             to: order.user_email,
//                                                             messageId: emailResult.messageId,
//                                                             error: emailResult.error
//                                                         }
//                                                     });
//                                                 });
//                                             }
//                                         );
//                                     }
//                                 );
//                             }
//                         );
//                     });
//                 }
//             );
//         });
//     });
// });

// // ==================== 🎯 5. TEST EMAIL ROUTE ====================
// router.get("/test/email", authenticateToken, async (req, res) => {
//     console.log("========== 📧 TEST EMAIL ==========");

//     if (!emailService) {
//         return res.status(500).json({
//             success: false,
//             message: "Email service not loaded",
//             solution: "Please check if backend/services/emailService.js exists"
//         });
//     }

//     try {
//         const testResult = await emailService.testEmailConfig();
//         res.json({
//             success: testResult.success,
//             message: testResult.message || 'Email test completed',
//             details: testResult,
//             env: {
//                 EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
//                 EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set (hidden)" : "❌ Missing",
//                 FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000"
//             }
//         });
//     } catch (error) {
//         console.error("❌ Test email error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Email test failed",
//             error: error.message
//         });
//     }
// });

// // ==================== 🎯 6. CLEAR CART ====================
// router.delete("/cart/clear/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     console.log("========== 🗑️ CLEAR CART ==========");
//     console.log("User ID:", userId);

//     // ✅ Verify user
//     if (parseInt(userId) !== req.user.id) {
//         return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     // ========== DELETE CART ITEMS ==========
//     db.query('DELETE FROM cart WHERE user_id = ?', [userId], (err, result) => {
//         if (err) {
//             console.error("❌ Clear cart error:", err);
//             return res.status(500).json({ success: false, message: "Failed to clear cart" });
//         }

//         console.log("✅ Cart cleared successfully");
//         res.json({
//             success: true,
//             message: "Cart cleared successfully",
//             deletedCount: result.affectedRows
//         });
//     });
// });

// // ==================== 🎯 7. RAZORPAY PAYMENT ====================
// router.post("/payment/create-order", authenticateToken, async (req, res) => {
//     console.log("========== 💳 RAZORPAY CREATE ORDER ==========");

//     try {
//         let Razorpay;
//         try {
//             Razorpay = require("razorpay");
//         } catch (e) {
//             console.error("❌ Razorpay package not installed");
//             return res.status(500).json({
//                 success: false,
//                 message: "Payment gateway configuration error"
//             });
//         }

//         if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//             console.error("❌ Razorpay credentials missing");
//             return res.status(500).json({
//                 success: false,
//                 message: "Razorpay credentials not configured"
//             });
//         }

//         const razorpay = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET
//         });

//         const options = {
//             amount: req.body.amount,
//             currency: req.body.currency || "INR",
//             receipt: req.body.receipt || `receipt_${Date.now()}`,
//             notes: {
//                 userId: req.user.id,
//                 ...req.body.notes
//             }
//         };

//         const order = await razorpay.orders.create(options);
//         console.log("✅ Razorpay order created:", order.id);

//         res.json({
//             success: true,
//             order: order,
//             key_id: process.env.RAZORPAY_KEY_ID
//         });

//     } catch (error) {
//         console.error("❌ Razorpay error:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create payment order",
//             error: error.message
//         });
//     }
// });

// // ==================== 🎯 8. VERIFY RAZORPAY PAYMENT ====================
// router.post("/payment/verify", authenticateToken, (req, res) => {
//     console.log("========== ✅ VERIFY PAYMENT ==========");

//     const {
//         razorpay_payment_id,
//         razorpay_order_id,
//         razorpay_signature
//     } = req.body;

//     try {
//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         if (expectedSignature === razorpay_signature) {
//             console.log("✅ Payment verified successfully");
//             res.json({
//                 success: true,
//                 message: "Payment verified successfully",
//                 payment_id: razorpay_payment_id
//             });
//         } else {
//             console.error("❌ Invalid signature");
//             res.status(400).json({
//                 success: false,
//                 message: "Invalid payment signature"
//             });
//         }
//     } catch (error) {
//         console.error("❌ Verification error:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Payment verification failed"
//         });
//     }
// });

// // ==================== 🎯 9. GET USER ORDERS - WITH PRODUCT IMAGES ====================
// router.get("/user/orders", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { limit = 10, page = 1 } = req.query;
//     const offset = (page - 1) * limit;

//     console.log("========== 📋 GET USER ORDERS ==========");
//     console.log("User ID:", userId);

//     db.getConnection((err, connection) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         // ✅ Get total count
//         connection.query(
//             'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
//             [userId],
//             (countErr, countResult) => {
//                 if (countErr) {
//                     connection.release();
//                     return res.status(500).json({ success: false, message: "Failed to fetch orders count" });
//                 }

//                 const total = countResult[0]?.total || 0;

//                 // ✅ FIXED QUERY - Products table से images लें
//                 const ordersQuery = `
//                     SELECT 
//                         o.id,
//                         o.order_number,
//                         o.total_amount,
//                         o.order_status,
//                         o.payment_status,
//                         o.payment_method,
//                         o.order_date,
//                         o.order_date as created_at,
//                         o.shipping_full_name,
//                         o.shipping_phone,
//                         o.shipping_email,
//                         o.shipping_address,
//                         o.shipping_city,
//                         o.shipping_state,
//                         o.shipping_postal_code,
//                         o.shipping_country,
//                         DATE_ADD(o.order_date, INTERVAL 5 DAY) as estimated_delivery,
//                         COUNT(DISTINCT oi.id) as item_count,
//                         -- 🟢🟢🟢 PRODUCT TABLE से IMAGE FETCH करें 🟢🟢🟢
//                         MIN(
//                             CASE 
//                                 -- अगर p.images JSON है तो पहली image निकालें
//                                 WHEN p.images IS NOT NULL AND p.images != '' THEN
//                                     CASE 
//                                         WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
//                                             -- JSON array से पहली value extract
//                                             TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
//                                         ELSE 
//                                             -- सीधा URL
//                                             p.images
//                                     END
//                                 ELSE '/uploads/products/default-product.jpg'
//                             END
//                         ) as product_image,
//                         MIN(oi.product_name) as product_name
//                     FROM orders o
//                     LEFT JOIN order_items oi ON o.id = oi.order_id
//                     LEFT JOIN products p ON oi.product_id = p.id
//                     WHERE o.user_id = ?
//                     GROUP BY o.id
//                     ORDER BY o.order_date DESC
//                     LIMIT ? OFFSET ?
//                 `;

//                 connection.query(
//                     ordersQuery,
//                     [userId, parseInt(limit), parseInt(offset)],
//                     (ordersErr, ordersResults) => {
//                         connection.release();

//                         if (ordersErr) {
//                             console.error("❌ Orders fetch error:", ordersErr);
//                             return res.status(500).json({ success: false, message: "Failed to fetch orders" });
//                         }

//                         // Format orders with images
//                         const formattedOrders = (ordersResults || []).map(order => ({
//                             ...order,
//                             product_image: order.product_image || '/uploads/products/default-product.jpg',
//                             total_amount: parseFloat(order.total_amount).toFixed(2)
//                         }));

//                         res.json({
//                             success: true,
//                             orders: formattedOrders,
//                             pagination: {
//                                 total: total,
//                                 page: parseInt(page),
//                                 limit: parseInt(limit),
//                                 pages: Math.ceil(total / limit)
//                             }
//                         });
//                     }
//                 );
//             }
//         );
//     });
// });

// // ==================== 🎯 10. GET SINGLE ORDER DETAILS WITH PRODUCT IMAGES ====================
// router.get("/:orderId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { orderId } = req.params;

//     db.getConnection((err, connection) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         // ✅ Get order details
//         const orderQuery = `
//             SELECT 
//                 o.*,
//                 u.name as customer_name,
//                 u.email as customer_email,
//                 DATE_ADD(o.order_date, INTERVAL 5 DAY) as estimated_delivery
//             FROM orders o
//             LEFT JOIN users u ON o.user_id = u.id
//             WHERE o.id = ? AND o.user_id = ?
//         `;

//         connection.query(orderQuery, [orderId, userId], (orderErr, orderResults) => {
//             if (orderErr || !orderResults?.length) {
//                 connection.release();
//                 return res.status(404).json({ success: false, message: "Order not found" });
//             }

//             const order = orderResults[0];

//             // ✅ 🟢🟢🟢 Get order items with product images from products table 🟢🟢🟢
//             const itemsQuery = `
//                 SELECT 
//                     oi.*,
//                     -- Product table से image fetch करें
//                     CASE 
//                         WHEN p.images IS NOT NULL AND p.images != '' THEN
//                             CASE 
//                                 WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
//                                     TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
//                                 ELSE 
//                                     p.images
//                             END
//                         ELSE '/uploads/products/default-product.jpg'
//                     END as product_image,
//                     p.images as raw_images,
//                     p.brand,
//                     p.category_id
//                 FROM order_items oi
//                 LEFT JOIN products p ON oi.product_id = p.id
//                 WHERE oi.order_id = ?
//                 ORDER BY oi.id
//             `;

//             connection.query(itemsQuery, [orderId], (itemsErr, itemsResults) => {
//                 connection.release();

//                 if (itemsErr) {
//                     console.error("❌ Items fetch error:", itemsErr);
//                     return res.status(500).json({ success: false, message: "Failed to fetch items" });
//                 }

//                 // Format response
//                 const formattedOrder = {
//                     ...order,
//                     total_amount: parseFloat(order.total_amount || 0).toFixed(2),
//                     subtotal: parseFloat(order.subtotal || 0).toFixed(2),
//                     tax_amount: parseFloat(order.tax_amount || 0).toFixed(2),
//                     shipping_charge: parseFloat(order.shipping_charge || 0).toFixed(2),
//                     items: (itemsResults || []).map(item => ({
//                         ...item,
//                         price: parseFloat(item.price || 0).toFixed(2),
//                         final_price: parseFloat(item.final_price || 0).toFixed(2),
//                         total_price: parseFloat(item.total_price || 0).toFixed(2),
//                         product_image: item.product_image || '/uploads/products/default-product.jpg'
//                     }))
//                 };

//                 res.json({
//                     success: true,
//                     order: formattedOrder
//                 });
//             });
//         });
//     });
// });

// module.exports = router;














const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

// ------------------- IMPORT EMAIL SERVICE -------------------
let emailService;
try {
    emailService = require("../services/emailService");
    console.log("📧 Email service loaded in orderRoutes");
} catch (error) {
    console.error("❌ Email service not loaded in orderRoutes:", error.message);
    // Create a fallback email service if not available
    emailService = {
        sendOrderConfirmation: async (orderData, userEmail, userName) => {
            console.log("⚠️ Email service not available - Order confirmation email not sent");
            console.log(`   Would send to: ${userEmail}`);
            console.log(`   Order #: ${orderData.orderNumber}`);
            return { success: false, error: "Email service not available" };
        },
        sendOrderStatusUpdate: async (orderData, userEmail, userName, status) => {
            console.log("⚠️ Email service not available - Status update email not sent");
            return { success: false, error: "Email service not available" };
        },
        testEmailConfig: async () => {
            return { success: false, message: "Email service not available" };
        }
    };
}

// ------------------- Middleware: Verify Token -------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decodedUser;
        req.user.id = decodedUser.id || decodedUser.userId;
        next();
    });
};

// Helper function for database queries with promises
const queryAsync = (connection, sql, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// ==================== 🎯 1. CREATE ORDER FROM CART ====================
router.post("/create", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    console.log("========== 📦 CREATE ORDER ==========");
    console.log("User ID:", userId);
    console.log("Payment Method:", req.body.paymentMethod);

    const {
        shippingAddress,
        billingAddress,
        paymentMethod,
        paymentId,
        paymentStatus,
        subtotal,
        taxAmount,
        shippingCharge,
        totalAmount,
        orderNote,
        items
    } = req.body;

    // ✅ Validation
    if (!shippingAddress) {
        return res.status(400).json({ success: false, message: "Shipping address is required" });
    }
    if (!paymentMethod) {
        return res.status(400).json({ success: false, message: "Payment method is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Items are required" });
    }

    // ✅ Get connection from pool
    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // ✅ Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // ========== 1. INSERT ORDER ==========
            const orderQuery = `
                INSERT INTO orders (
                    user_id, 
                    shipping_full_name, shipping_address, shipping_city, 
                    shipping_state, shipping_postal_code, shipping_country,
                    shipping_phone, shipping_email,
                    billing_full_name, billing_address, billing_city,
                    billing_state, billing_postal_code, billing_country,
                    payment_method, payment_id, payment_status,
                    subtotal, tax_amount, shipping_charge, discount_amount, total_amount,
                    order_note, order_status, order_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const orderValues = [
                userId,
                shippingAddress.fullName || '',
                shippingAddress.address || '',
                shippingAddress.city || '',
                shippingAddress.state || '',
                shippingAddress.postalCode || '',
                shippingAddress.country || 'India',
                shippingAddress.phone || '',
                shippingAddress.email || '',
                billingAddress?.fullName || shippingAddress.fullName || '',
                billingAddress?.address || shippingAddress.address || '',
                billingAddress?.city || shippingAddress.city || '',
                billingAddress?.state || shippingAddress.state || '',
                billingAddress?.postalCode || shippingAddress.postalCode || '',
                billingAddress?.country || shippingAddress.country || 'India',
                paymentMethod,
                paymentId || null,
                paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
                subtotal || 0,
                taxAmount || 0,
                shippingCharge || 0,
                0,
                totalAmount || 0,
                orderNote || null,
                paymentMethod === 'cod' ? 'pending' : 'processing',
                new Date()
            ];

            const orderResult = await queryAsync(connection, orderQuery, orderValues);
            const orderId = orderResult.insertId;
            console.log("✅ Order ID:", orderId);

            // ========== 2. GET ORDER NUMBER ==========
            const numberResult = await queryAsync(connection,
                'SELECT order_number FROM orders WHERE id = ?', [orderId]
            );
            const orderNumber = (numberResult && numberResult[0]?.order_number) || `ORD-${Date.now()}`;
            console.log("✅ Order Number:", orderNumber);

            // ========== 3. INSERT ORDER ITEMS ==========
            for (const item of items) {
                const itemTotal = (parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2);

                const itemQuery = `
                    INSERT INTO order_items (
                        order_id, order_number, product_id, product_name, sku,
                        quantity, price, discount_percent, final_price,
                        size, color, shipping_cost, free_shipping,
                        tax_rate, tax_amount, total_price
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const itemValues = [
                    orderId,
                    orderNumber,
                    item.productId,
                    item.product_name || item.name || 'Product',
                    item.sku || null,
                    item.quantity || 1,
                    item.price || 0,
                    item.discount_percent || item.discount || 0,
                    item.price || 0,
                    item.size || null,
                    item.color || null,
                    item.shipping_cost || 0,
                    item.free_shipping ? 1 : 0,
                    item.tax_rate || 0,
                    item.tax_amount || 0,
                    itemTotal
                ];

                await queryAsync(connection, itemQuery, itemValues);

                // ========== 4. UPDATE STOCK ==========
                await queryAsync(connection,
                    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                    [item.quantity, item.productId, item.quantity]
                );
            }

            // ========== 5. CLEAR CART ==========
            await queryAsync(connection, 'DELETE FROM cart WHERE user_id = ?', [userId]);

            // ========== 6. COMMIT TRANSACTION ==========
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order created successfully!");
            console.log(`📦 Order #${orderNumber}`);

            // ========== 📧 GET USER EMAIL AND SEND CONFIRMATION ==========
            try {
                // Get user email from database
                const userResult = await new Promise((resolve, reject) => {
                    db.query('SELECT email, name FROM users WHERE id = ?', [userId], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (userResult && userResult.length > 0) {
                    const userEmail = userResult[0].email;
                    const userName = userResult[0].name || 'Valued Customer';

                    // Prepare order data for email
                    const orderData = {
                        orderId,
                        orderNumber,
                        items,
                        shippingAddress,
                        billingAddress: billingAddress || shippingAddress,
                        paymentMethod,
                        paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
                        subtotal: subtotal || 0,
                        taxAmount: taxAmount || 0,
                        shippingCharge: shippingCharge || 0,
                        totalAmount: totalAmount || 0,
                        orderNote: orderNote || null,
                        created_at: new Date()
                    };

                    // Send email asynchronously (don't wait for response)
                    emailService.sendOrderConfirmation(orderData, userEmail, userName)
                        .then(emailResult => {
                            if (emailResult.success) {
                                console.log(`📧 Order confirmation email sent to ${userEmail}`);
                            } else {
                                console.error(`❌ Failed to send email: ${emailResult.error}`);
                            }
                        })
                        .catch(emailError => {
                            console.error("❌ Email sending error:", emailError);
                        });
                }
            } catch (emailError) {
                console.error("❌ Error in email process:", emailError);
                // Don't fail the order if email fails
            }

            res.status(201).json({
                success: true,
                message: paymentMethod === 'cod'
                    ? "Order placed successfully"
                    : "Order created successfully",
                orderId: orderId,
                orderNumber: orderNumber,
                totalAmount: totalAmount,
                paymentStatus: paymentMethod === 'cod'
                    ? 'pending'
                    : (paymentId ? 'completed' : 'pending'),
                redirectTo: `/checkout/review/${orderId}`
            });

        } catch (error) {
            // Rollback on error
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Order creation error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 2. DIRECT BUY ORDER ====================
router.post("/direct-buy", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    console.log("========== 📦 DIRECT BUY ==========");
    console.log("Product ID:", req.body.productId);

    const {
        productId,
        quantity = 1,
        size,
        color,
        shippingAddress,
        paymentMethod,
        paymentId,
        paymentStatus,
        subtotal,
        taxAmount,
        shippingCharge,
        totalAmount,
        orderNote
    } = req.body;

    // ✅ Validation
    if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    if (!shippingAddress) {
        return res.status(400).json({ success: false, message: "Shipping address is required" });
    }
    if (!paymentMethod) {
        return res.status(400).json({ success: false, message: "Payment method is required" });
    }

    // ✅ Get connection
    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // ========== 1. GET PRODUCT DETAILS ==========
            const productResults = await queryAsync(connection,
                'SELECT * FROM products WHERE id = ? AND status = "active"',
                [productId]
            );

            if (!productResults || productResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            const product = productResults[0];

            // ========== 2. CHECK STOCK ==========
            if (product.stock < quantity) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available`
                });
            }

            // ========== 3. START TRANSACTION ==========
            await queryAsync(connection, 'START TRANSACTION');

            // ========== 4. INSERT ORDER ==========
            const orderQuery = `
                INSERT INTO orders (
                    user_id, 
                    shipping_full_name, shipping_address, shipping_city, 
                    shipping_state, shipping_postal_code, shipping_country,
                    shipping_phone, shipping_email,
                    billing_full_name, billing_address, billing_city,
                    billing_state, billing_postal_code, billing_country,
                    payment_method, payment_id, payment_status,
                    subtotal, tax_amount, shipping_charge, discount_amount, total_amount,
                    order_note, order_status, order_date, checkout_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const orderValues = [
                userId,
                shippingAddress.fullName || '',
                shippingAddress.address || '',
                shippingAddress.city || '',
                shippingAddress.state || '',
                shippingAddress.postalCode || '',
                shippingAddress.country || 'India',
                shippingAddress.phone || '',
                shippingAddress.email || '',
                shippingAddress.fullName || '',
                shippingAddress.address || '',
                shippingAddress.city || '',
                shippingAddress.state || '',
                shippingAddress.postalCode || '',
                shippingAddress.country || 'India',
                paymentMethod,
                paymentId || null,
                paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
                subtotal || 0,
                taxAmount || 0,
                shippingCharge || 0,
                0,
                totalAmount || 0,
                orderNote || null,
                paymentMethod === 'cod' ? 'pending' : 'processing',
                new Date(),
                'direct'
            ];

            const orderResult = await queryAsync(connection, orderQuery, orderValues);
            const orderId = orderResult.insertId;
            console.log("✅ Order ID:", orderId);

            // ========== 5. GET ORDER NUMBER ==========
            const numberResult = await queryAsync(connection,
                'SELECT order_number FROM orders WHERE id = ?',
                [orderId]
            );
            const orderNumber = (numberResult && numberResult[0]?.order_number) || `ORD-${Date.now()}`;
            console.log("✅ Order Number:", orderNumber);

            // ========== 6. INSERT ORDER ITEM ==========
            const itemTotal = (parseFloat(subtotal) || 0).toFixed(2);

            const itemQuery = `
                INSERT INTO order_items (
                    order_id, order_number, product_id, product_name, sku,
                    quantity, price, discount_percent, final_price,
                    size, color, shipping_cost, free_shipping,
                    tax_rate, tax_amount, total_price
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const itemValues = [
                orderId,
                orderNumber,
                productId,
                product.name,
                product.sku || null,
                quantity,
                product.price,
                product.discount || 0,
                (subtotal / quantity) || product.price,
                size || null,
                color || null,
                product.shipping_cost || 0,
                product.free_shipping || 0,
                product.tax_rate || 0,
                taxAmount || 0,
                itemTotal
            ];

            await queryAsync(connection, itemQuery, itemValues);

            // ========== 7. UPDATE STOCK ==========
            await queryAsync(connection,
                'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [quantity, productId, quantity]
            );

            // ========== 8. COMMIT TRANSACTION ==========
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Direct buy order created!");

            // ========== 📧 GET USER EMAIL AND SEND CONFIRMATION ==========
            try {
                // Get user email from database
                const userResult = await new Promise((resolve, reject) => {
                    db.query('SELECT email, name FROM users WHERE id = ?', [userId], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (userResult && userResult.length > 0) {
                    const userEmail = userResult[0].email;
                    const userName = userResult[0].name || 'Valued Customer';

                    // Prepare order data for email
                    const orderData = {
                        orderId,
                        orderNumber,
                        items: [{
                            product_name: product.name,
                            quantity: quantity,
                            price: product.price,
                            sku: product.sku
                        }],
                        shippingAddress,
                        billingAddress: shippingAddress,
                        paymentMethod,
                        paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
                        subtotal: subtotal || 0,
                        taxAmount: taxAmount || 0,
                        shippingCharge: shippingCharge || 0,
                        totalAmount: totalAmount || 0,
                        orderNote: orderNote || null,
                        created_at: new Date()
                    };

                    // Send email asynchronously
                    emailService.sendOrderConfirmation(orderData, userEmail, userName)
                        .then(emailResult => {
                            if (emailResult.success) {
                                console.log(`📧 Order confirmation email sent to ${userEmail}`);
                            }
                        })
                        .catch(emailError => {
                            console.error("❌ Email sending error:", emailError);
                        });
                }
            } catch (emailError) {
                console.error("❌ Error in email process:", emailError);
            }

            res.status(201).json({
                success: true,
                message: paymentMethod === 'cod'
                    ? "Order placed successfully"
                    : "Order created successfully",
                orderId: orderId,
                orderNumber: orderNumber,
                totalAmount: totalAmount,
                paymentStatus: paymentMethod === 'cod'
                    ? 'pending'
                    : (paymentId ? 'completed' : 'pending'),
                redirectTo: `/checkout/review/${orderId}`
            });

        } catch (error) {
            // Rollback on error
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Direct buy error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 3. GET ORDER FOR REVIEW ====================
router.get("/:orderId/review", authenticateToken, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    console.log("========== 📋 GET ORDER REVIEW ==========");
    console.log("Order ID:", orderId);

    db.getConnection((err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        // ========== GET ORDER ==========
        connection.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId],
            (orderErr, orderResults) => {
                if (orderErr) {
                    connection.release();
                    console.error("❌ Order fetch error:", orderErr);
                    return res.status(500).json({ success: false, message: "Failed to fetch order" });
                }

                if (!orderResults || orderResults.length === 0) {
                    connection.release();
                    return res.status(404).json({ success: false, message: "Order not found" });
                }

                const order = orderResults[0];

                // ========== GET ORDER ITEMS ==========
                connection.query(
                    'SELECT * FROM order_items WHERE order_id = ?',
                    [orderId],
                    (itemsErr, itemsResults) => {
                        connection.release();

                        if (itemsErr) {
                            console.error("❌ Items fetch error:", itemsErr);
                            return res.status(500).json({ success: false, message: "Failed to fetch order items" });
                        }

                        res.json({
                            success: true,
                            order: {
                                ...order,
                                items: itemsResults || []
                            }
                        });
                    }
                );
            }
        );
    });
});

// ==================== 🎯 4. CONFIRM ORDER WITH EMAIL ====================
router.post("/:orderId/confirm", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;
    const { orderNote, termsAccepted } = req.body;

    console.log("========== ✅ CONFIRM ORDER ==========");
    console.log("Order ID:", orderId);
    console.log("User ID:", userId);

    if (!termsAccepted) {
        return res.status(400).json({
            success: false,
            message: "Please accept terms and conditions"
        });
    }

    // Get connection
    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Get order details with user info
            const getOrderQuery = `
                SELECT 
                    o.*,
                    u.name as user_name,
                    u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ? AND o.user_id = ?
            `;

            const orderResults = await queryAsync(connection, getOrderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Check if already confirmed
            if (order.order_status === 'confirmed' || order.order_status === 'processing') {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Order is already ${order.order_status}`
                });
            }

            // Get order items
            const itemsResults = await queryAsync(connection,
                `SELECT 
                    oi.*,
                    '/uploads/products/default-product.jpg' as product_image
                FROM order_items oi
                WHERE oi.order_id = ?`,
                [orderId]
            );

            order.items = itemsResults || [];

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // 1. Update order status
            const updateQuery = `
                UPDATE orders 
                SET order_status = 'confirmed',
                    order_note = CONCAT(IFNULL(order_note, ''), '\n', ?),
                    confirmed_at = ?,
                    updated_at = ?
                WHERE id = ? AND user_id = ?
            `;

            await queryAsync(connection, updateQuery, [
                `Order confirmed by customer on ${new Date().toLocaleString()}. Notes: ${orderNote || 'No notes'}`,
                new Date(),
                new Date(),
                orderId,
                userId
            ]);

            // 2. Add status history
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                'confirmed',
                `Order confirmed by customer. ${orderNote || 'No notes'}`,
                userId,
                new Date()
            ]);

            // 3. Clear cart (if any items left)
            await queryAsync(connection, 'DELETE FROM cart WHERE user_id = ?', [userId]);

            // 4. Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order confirmed successfully!");
            console.log(`📦 Order #${order.order_number} confirmed for ${order.user_email}`);

            // ========== 📧 SEND CONFIRMATION EMAIL ==========
            let emailResult = { success: false, error: 'Email sending failed' };

            try {
                console.log("📧 Attempting to send confirmation email...");

                // Prepare order data for email
                const orderData = {
                    orderId: order.id,
                    orderNumber: order.order_number,
                    items: order.items,
                    shippingAddress: {
                        fullName: order.shipping_full_name,
                        address: order.shipping_address,
                        city: order.shipping_city,
                        state: order.shipping_state,
                        postalCode: order.shipping_postal_code,
                        country: order.shipping_country,
                        phone: order.shipping_phone,
                        email: order.shipping_email
                    },
                    billingAddress: {
                        fullName: order.billing_full_name,
                        address: order.billing_address,
                        city: order.billing_city,
                        state: order.billing_state,
                        postalCode: order.billing_postal_code,
                        country: order.billing_country
                    },
                    paymentMethod: order.payment_method,
                    paymentStatus: order.payment_status,
                    subtotal: order.subtotal,
                    taxAmount: order.tax_amount,
                    shippingCharge: order.shipping_charge,
                    totalAmount: order.total_amount,
                    orderNote: order.order_note,
                    created_at: order.order_date
                };

                // Send email
                emailResult = await emailService.sendOrderConfirmation(
                    orderData,
                    order.user_email,
                    order.user_name || 'Valued Customer'
                );

                console.log(`📧 Email result:`, emailResult);
            } catch (emailError) {
                console.error("❌ Email sending failed:");
                console.error(`   Message: ${emailError.message}`);
                emailResult = { success: false, error: emailError.message };
            }

            // Send Response
            res.json({
                success: true,
                message: "Order confirmed successfully!",
                orderId: orderId,
                orderNumber: order.order_number,
                totalAmount: order.total_amount,
                redirectTo: `/order-confirmation/${orderId}`,
                email: {
                    sent: emailResult.success,
                    to: order.user_email,
                    messageId: emailResult.messageId,
                    error: emailResult.error
                }
            });

        } catch (error) {
            // Rollback on error
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Order confirmation error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to confirm order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 5. TEST EMAIL ROUTE ====================
router.get("/test/email", authenticateToken, async (req, res) => {
    console.log("========== 📧 TEST EMAIL ==========");

    if (!emailService) {
        return res.status(500).json({
            success: false,
            message: "Email service not loaded",
            solution: "Please check if backend/services/emailService.js exists"
        });
    }

    try {
        const testResult = await emailService.testEmailConfig();
        res.json({
            success: testResult.success,
            message: testResult.message || 'Email test completed',
            details: testResult,
            env: {
                EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
                EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set (hidden)" : "❌ Missing",
                FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000"
            }
        });
    } catch (error) {
        console.error("❌ Test email error:", error);
        res.status(500).json({
            success: false,
            message: "Email test failed",
            error: error.message
        });
    }
});

// ==================== 🎯 6. CLEAR CART ====================
router.delete("/cart/clear/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    console.log("========== 🗑️ CLEAR CART ==========");
    console.log("User ID:", userId);

    // ✅ Verify user
    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // ========== DELETE CART ITEMS ==========
    db.query('DELETE FROM cart WHERE user_id = ?', [userId], (err, result) => {
        if (err) {
            console.error("❌ Clear cart error:", err);
            return res.status(500).json({ success: false, message: "Failed to clear cart" });
        }

        console.log("✅ Cart cleared successfully");
        res.json({
            success: true,
            message: "Cart cleared successfully",
            deletedCount: result.affectedRows
        });
    });
});

// ==================== 🎯 7. RAZORPAY PAYMENT ====================
router.post("/payment/create-order", authenticateToken, async (req, res) => {
    console.log("========== 💳 RAZORPAY CREATE ORDER ==========");

    try {
        let Razorpay;
        try {
            Razorpay = require("razorpay");
        } catch (e) {
            console.error("❌ Razorpay package not installed");
            return res.status(500).json({
                success: false,
                message: "Payment gateway configuration error"
            });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("❌ Razorpay credentials missing");
            return res.status(500).json({
                success: false,
                message: "Razorpay credentials not configured"
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: req.body.amount,
            currency: req.body.currency || "INR",
            receipt: req.body.receipt || `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                ...req.body.notes
            }
        };

        const order = await razorpay.orders.create(options);
        console.log("✅ Razorpay order created:", order.id);

        res.json({
            success: true,
            order: order,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("❌ Razorpay error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });
    }
});

// ==================== 🎯 8. VERIFY RAZORPAY PAYMENT ====================
router.post("/payment/verify", authenticateToken, (req, res) => {
    console.log("========== ✅ VERIFY PAYMENT ==========");

    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    } = req.body;

    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            console.log("✅ Payment verified successfully");
            res.json({
                success: true,
                message: "Payment verified successfully",
                payment_id: razorpay_payment_id
            });
        } else {
            console.error("❌ Invalid signature");
            res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }
    } catch (error) {
        console.error("❌ Verification error:", error.message);
        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
});

// ==================== 🎯 9. GET USER ORDERS - WITH PRODUCT IMAGES ====================
router.get("/user/orders", authenticateToken, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    console.log("========== 📋 GET USER ORDERS ==========");
    console.log("User ID:", userId);

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        // ✅ Get total count
        connection.query(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
            [userId],
            (countErr, countResult) => {
                if (countErr) {
                    connection.release();
                    return res.status(500).json({ success: false, message: "Failed to fetch orders count" });
                }

                const total = countResult[0]?.total || 0;

                // ✅ FIXED QUERY - Products table से images लें
                const ordersQuery = `
                    SELECT 
                        o.id,
                        o.order_number,
                        o.total_amount,
                        o.order_status,
                        o.payment_status,
                        o.payment_method,
                        o.order_date,
                        o.order_date as created_at,
                        o.shipping_full_name,
                        o.shipping_phone,
                        o.shipping_email,
                        o.shipping_address,
                        o.shipping_city,
                        o.shipping_state,
                        o.shipping_postal_code,
                        o.shipping_country,
                        DATE_ADD(o.order_date, INTERVAL 5 DAY) as estimated_delivery,
                        COUNT(DISTINCT oi.id) as item_count,
                        -- 🟢 PRODUCT TABLE से IMAGE FETCH करें
                        MIN(
                            CASE 
                                -- अगर p.images JSON है तो पहली image निकालें
                                WHEN p.images IS NOT NULL AND p.images != '' THEN
                                    CASE 
                                        WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
                                            -- JSON array से पहली value extract
                                            TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
                                        ELSE 
                                            -- सीधा URL
                                            p.images
                                    END
                                ELSE '/uploads/products/default-product.jpg'
                            END
                        ) as product_image,
                        MIN(oi.product_name) as product_name
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE o.user_id = ?
                    GROUP BY o.id
                    ORDER BY o.order_date DESC
                    LIMIT ? OFFSET ?
                `;

                connection.query(
                    ordersQuery,
                    [userId, parseInt(limit), parseInt(offset)],
                    (ordersErr, ordersResults) => {
                        connection.release();

                        if (ordersErr) {
                            console.error("❌ Orders fetch error:", ordersErr);
                            return res.status(500).json({ success: false, message: "Failed to fetch orders" });
                        }

                        // Format orders with images
                        const formattedOrders = (ordersResults || []).map(order => ({
                            ...order,
                            product_image: order.product_image || '/uploads/products/default-product.jpg',
                            total_amount: parseFloat(order.total_amount).toFixed(2)
                        }));

                        res.json({
                            success: true,
                            orders: formattedOrders,
                            pagination: {
                                total: total,
                                page: parseInt(page),
                                limit: parseInt(limit),
                                pages: Math.ceil(total / limit)
                            }
                        });
                    }
                );
            }
        );
    });
});

// ==================== 🎯 10. GET SINGLE ORDER DETAILS WITH PRODUCT IMAGES ====================
router.get("/:orderId", authenticateToken, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        // ✅ Get order details
        const orderQuery = `
            SELECT 
                o.*,
                u.name as customer_name,
                u.email as customer_email,
                DATE_ADD(o.order_date, INTERVAL 5 DAY) as estimated_delivery
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ? AND o.user_id = ?
        `;

        connection.query(orderQuery, [orderId, userId], (orderErr, orderResults) => {
            if (orderErr || !orderResults?.length) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // ✅ Get order items with product images
            const itemsQuery = `
                SELECT 
                    oi.*,
                    -- Product table से image fetch करें
                    CASE 
                        WHEN p.images IS NOT NULL AND p.images != '' THEN
                            CASE 
                                WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
                                    TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
                                ELSE 
                                    p.images
                            END
                        ELSE '/uploads/products/default-product.jpg'
                    END as product_image,
                    p.images as raw_images,
                    p.brand,
                    p.category_id
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;

            connection.query(itemsQuery, [orderId], (itemsErr, itemsResults) => {
                connection.release();

                if (itemsErr) {
                    console.error("❌ Items fetch error:", itemsErr);
                    return res.status(500).json({ success: false, message: "Failed to fetch items" });
                }

                // Format response
                const formattedOrder = {
                    ...order,
                    total_amount: parseFloat(order.total_amount || 0).toFixed(2),
                    subtotal: parseFloat(order.subtotal || 0).toFixed(2),
                    tax_amount: parseFloat(order.tax_amount || 0).toFixed(2),
                    shipping_charge: parseFloat(order.shipping_charge || 0).toFixed(2),
                    items: (itemsResults || []).map(item => ({
                        ...item,
                        price: parseFloat(item.price || 0).toFixed(2),
                        final_price: parseFloat(item.final_price || 0).toFixed(2),
                        total_price: parseFloat(item.total_price || 0).toFixed(2),
                        product_image: item.product_image || '/uploads/products/default-product.jpg'
                    }))
                };

                res.json({
                    success: true,
                    order: formattedOrder
                });
            });
        });
    });
});

// ==================== 🎯 11. UPDATE ORDER STATUS WITH EMAIL NOTIFICATION ====================
router.put("/:orderId/status", authenticateToken, async (req, res) => {
    const db = req.db;
    const { orderId } = req.params;
    const { status, comment } = req.body;

    console.log("========== 🔄 UPDATE ORDER STATUS ==========");
    console.log("Order ID:", orderId);
    console.log("New Status:", status);

    // Check if user is admin (you can add your admin check logic here)
    // For now, we'll allow any authenticated user to update status
    // You should implement proper admin check

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Get order and user details
            const orderQuery = `
                SELECT 
                    o.*,
                    u.name as user_name,
                    u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Update order status
            const updateQuery = `
                UPDATE orders 
                SET order_status = ?,
                    updated_at = ?
                WHERE id = ?
            `;

            await queryAsync(connection, updateQuery, [status, new Date(), orderId]);

            // Add status history
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                status,
                comment || `Status updated to ${status}`,
                req.user.id,
                new Date()
            ]);

            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order status updated successfully");

            // ========== 📧 SEND STATUS UPDATE EMAIL ==========
            try {
                if (order.user_email) {
                    const orderData = {
                        orderId: order.id,
                        orderNumber: order.order_number,
                        totalAmount: order.total_amount,
                        created_at: order.order_date
                    };

                    await emailService.sendOrderStatusUpdate(
                        orderData,
                        order.user_email,
                        order.user_name,
                        status
                    );

                    console.log(`📧 Status update email sent to ${order.user_email}`);
                }
            } catch (emailError) {
                console.error("❌ Failed to send status update email:", emailError);
            }

            res.json({
                success: true,
                message: "Order status updated successfully",
                newStatus: status
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Status update error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update order status",
                error: error.message
            });
        }
    });
});

module.exports = router;