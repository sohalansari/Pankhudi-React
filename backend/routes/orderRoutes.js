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
//     // Create a fallback email service if not available
//     emailService = {
//         sendOrderConfirmation: async (orderData, userEmail, userName) => {
//             console.log("⚠️ Email service not available - Order confirmation email not sent");
//             console.log(`   Would send to: ${userEmail}`);
//             console.log(`   Order #: ${orderData.orderNumber}`);
//             return { success: false, error: "Email service not available" };
//         },
//         sendOrderStatusUpdate: async (orderData, userEmail, userName, status) => {
//             console.log("⚠️ Email service not available - Status update email not sent");
//             return { success: false, error: "Email service not available" };
//         },
//         testEmailConfig: async () => {
//             return { success: false, message: "Email service not available" };
//         }
//     };
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

// // Helper function for database queries with promises
// const queryAsync = (connection, sql, values) => {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, values, (err, results) => {
//             if (err) reject(err);
//             else resolve(results);
//         });
//     });
// };

// // ==================== 🎯 1. CREATE ORDER FROM CART ====================
// router.post("/create", authenticateToken, async (req, res) => {
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
//     db.getConnection(async (err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         try {
//             // ✅ Start transaction
//             await queryAsync(connection, 'START TRANSACTION');

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

//             const orderResult = await queryAsync(connection, orderQuery, orderValues);
//             const orderId = orderResult.insertId;
//             console.log("✅ Order ID:", orderId);

//             // ========== 2. GET ORDER NUMBER ==========
//             const numberResult = await queryAsync(connection,
//                 'SELECT order_number FROM orders WHERE id = ?', [orderId]
//             );
//             const orderNumber = (numberResult && numberResult[0]?.order_number) || `ORD-${Date.now()}`;
//             console.log("✅ Order Number:", orderNumber);

//             // ========== 3. INSERT ORDER ITEMS ==========
//             for (const item of items) {
//                 const itemTotal = (parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2);

//                 const itemQuery = `
//                     INSERT INTO order_items (
//                         order_id, order_number, product_id, product_name, sku,
//                         quantity, price, discount_percent, final_price,
//                         size, color, shipping_cost, free_shipping,
//                         tax_rate, tax_amount, total_price
//                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                 `;

//                 const itemValues = [
//                     orderId,
//                     orderNumber,
//                     item.productId,
//                     item.product_name || item.name || 'Product',
//                     item.sku || null,
//                     item.quantity || 1,
//                     item.price || 0,
//                     item.discount_percent || item.discount || 0,
//                     item.price || 0,
//                     item.size || null,
//                     item.color || null,
//                     item.shipping_cost || 0,
//                     item.free_shipping ? 1 : 0,
//                     item.tax_rate || 0,
//                     item.tax_amount || 0,
//                     itemTotal
//                 ];

//                 await queryAsync(connection, itemQuery, itemValues);

//                 // ========== 4. UPDATE STOCK ==========
//                 await queryAsync(connection,
//                     'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
//                     [item.quantity, item.productId, item.quantity]
//                 );
//             }

//             // ========== 5. CLEAR CART ==========
//             await queryAsync(connection, 'DELETE FROM cart WHERE user_id = ?', [userId]);

//             // ========== 6. COMMIT TRANSACTION ==========
//             await queryAsync(connection, 'COMMIT');
//             connection.release();

//             console.log("✅ Order created successfully!");
//             console.log(`📦 Order #${orderNumber}`);

//             // ========== 📧 GET USER EMAIL AND SEND CONFIRMATION ==========
//             try {
//                 // Get user email from database
//                 const userResult = await new Promise((resolve, reject) => {
//                     db.query('SELECT email, name FROM users WHERE id = ?', [userId], (err, results) => {
//                         if (err) reject(err);
//                         else resolve(results);
//                     });
//                 });

//                 if (userResult && userResult.length > 0) {
//                     const userEmail = userResult[0].email;
//                     const userName = userResult[0].name || 'Valued Customer';

//                     // Prepare order data for email
//                     const orderData = {
//                         orderId,
//                         orderNumber,
//                         items,
//                         shippingAddress,
//                         billingAddress: billingAddress || shippingAddress,
//                         paymentMethod,
//                         paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
//                         subtotal: subtotal || 0,
//                         taxAmount: taxAmount || 0,
//                         shippingCharge: shippingCharge || 0,
//                         totalAmount: totalAmount || 0,
//                         orderNote: orderNote || null,
//                         created_at: new Date()
//                     };

//                     // Send email asynchronously (don't wait for response)
//                     emailService.sendOrderConfirmation(orderData, userEmail, userName)
//                         .then(emailResult => {
//                             if (emailResult.success) {
//                                 console.log(`📧 Order confirmation email sent to ${userEmail}`);
//                             } else {
//                                 console.error(`❌ Failed to send email: ${emailResult.error}`);
//                             }
//                         })
//                         .catch(emailError => {
//                             console.error("❌ Email sending error:", emailError);
//                         });
//                 }
//             } catch (emailError) {
//                 console.error("❌ Error in email process:", emailError);
//                 // Don't fail the order if email fails
//             }

//             res.status(201).json({
//                 success: true,
//                 message: paymentMethod === 'cod'
//                     ? "Order placed successfully"
//                     : "Order created successfully",
//                 orderId: orderId,
//                 orderNumber: orderNumber,
//                 totalAmount: totalAmount,
//                 paymentStatus: paymentMethod === 'cod'
//                     ? 'pending'
//                     : (paymentId ? 'completed' : 'pending'),
//                 redirectTo: `/checkout/review/${orderId}`
//             });

//         } catch (error) {
//             // Rollback on error
//             await queryAsync(connection, 'ROLLBACK');
//             connection.release();
//             console.error("❌ Order creation error:", error);
//             res.status(500).json({
//                 success: false,
//                 message: "Failed to create order",
//                 error: error.message
//             });
//         }
//     });
// });

// // ==================== 🎯 2. DIRECT BUY ORDER ====================
// router.post("/direct-buy", authenticateToken, async (req, res) => {
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
//     db.getConnection(async (err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         try {
//             // ========== 1. GET PRODUCT DETAILS ==========
//             const productResults = await queryAsync(connection,
//                 'SELECT * FROM products WHERE id = ? AND status = "active"',
//                 [productId]
//             );

//             if (!productResults || productResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ success: false, message: "Product not found" });
//             }

//             const product = productResults[0];

//             // ========== 2. CHECK STOCK ==========
//             if (product.stock < quantity) {
//                 connection.release();
//                 return res.status(400).json({
//                     success: false,
//                     message: `Only ${product.stock} items available`
//                 });
//             }

//             // ========== 3. START TRANSACTION ==========
//             await queryAsync(connection, 'START TRANSACTION');

//             // ========== 4. INSERT ORDER ==========
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
//                     order_note, order_status, order_date, checkout_type
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
//                 shippingAddress.fullName || '',
//                 shippingAddress.address || '',
//                 shippingAddress.city || '',
//                 shippingAddress.state || '',
//                 shippingAddress.postalCode || '',
//                 shippingAddress.country || 'India',
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
//                 new Date(),
//                 'direct'
//             ];

//             const orderResult = await queryAsync(connection, orderQuery, orderValues);
//             const orderId = orderResult.insertId;
//             console.log("✅ Order ID:", orderId);

//             // ========== 5. GET ORDER NUMBER ==========
//             const numberResult = await queryAsync(connection,
//                 'SELECT order_number FROM orders WHERE id = ?',
//                 [orderId]
//             );
//             const orderNumber = (numberResult && numberResult[0]?.order_number) || `ORD-${Date.now()}`;
//             console.log("✅ Order Number:", orderNumber);

//             // ========== 6. INSERT ORDER ITEM ==========
//             const itemTotal = (parseFloat(subtotal) || 0).toFixed(2);

//             const itemQuery = `
//                 INSERT INTO order_items (
//                     order_id, order_number, product_id, product_name, sku,
//                     quantity, price, discount_percent, final_price,
//                     size, color, shipping_cost, free_shipping,
//                     tax_rate, tax_amount, total_price
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             const itemValues = [
//                 orderId,
//                 orderNumber,
//                 productId,
//                 product.name,
//                 product.sku || null,
//                 quantity,
//                 product.price,
//                 product.discount || 0,
//                 (subtotal / quantity) || product.price,
//                 size || null,
//                 color || null,
//                 product.shipping_cost || 0,
//                 product.free_shipping || 0,
//                 product.tax_rate || 0,
//                 taxAmount || 0,
//                 itemTotal
//             ];

//             await queryAsync(connection, itemQuery, itemValues);

//             // ========== 7. UPDATE STOCK ==========
//             await queryAsync(connection,
//                 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
//                 [quantity, productId, quantity]
//             );

//             // ========== 8. COMMIT TRANSACTION ==========
//             await queryAsync(connection, 'COMMIT');
//             connection.release();

//             console.log("✅ Direct buy order created!");

//             // ========== 📧 GET USER EMAIL AND SEND CONFIRMATION ==========
//             try {
//                 // Get user email from database
//                 const userResult = await new Promise((resolve, reject) => {
//                     db.query('SELECT email, name FROM users WHERE id = ?', [userId], (err, results) => {
//                         if (err) reject(err);
//                         else resolve(results);
//                     });
//                 });

//                 if (userResult && userResult.length > 0) {
//                     const userEmail = userResult[0].email;
//                     const userName = userResult[0].name || 'Valued Customer';

//                     // Prepare order data for email
//                     const orderData = {
//                         orderId,
//                         orderNumber,
//                         items: [{
//                             product_name: product.name,
//                             quantity: quantity,
//                             price: product.price,
//                             sku: product.sku
//                         }],
//                         shippingAddress,
//                         billingAddress: shippingAddress,
//                         paymentMethod,
//                         paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
//                         subtotal: subtotal || 0,
//                         taxAmount: taxAmount || 0,
//                         shippingCharge: shippingCharge || 0,
//                         totalAmount: totalAmount || 0,
//                         orderNote: orderNote || null,
//                         created_at: new Date()
//                     };

//                     // Send email asynchronously
//                     emailService.sendOrderConfirmation(orderData, userEmail, userName)
//                         .then(emailResult => {
//                             if (emailResult.success) {
//                                 console.log(`📧 Order confirmation email sent to ${userEmail}`);
//                             }
//                         })
//                         .catch(emailError => {
//                             console.error("❌ Email sending error:", emailError);
//                         });
//                 }
//             } catch (emailError) {
//                 console.error("❌ Error in email process:", emailError);
//             }

//             res.status(201).json({
//                 success: true,
//                 message: paymentMethod === 'cod'
//                     ? "Order placed successfully"
//                     : "Order created successfully",
//                 orderId: orderId,
//                 orderNumber: orderNumber,
//                 totalAmount: totalAmount,
//                 paymentStatus: paymentMethod === 'cod'
//                     ? 'pending'
//                     : (paymentId ? 'completed' : 'pending'),
//                 redirectTo: `/checkout/review/${orderId}`
//             });

//         } catch (error) {
//             // Rollback on error
//             await queryAsync(connection, 'ROLLBACK');
//             connection.release();
//             console.error("❌ Direct buy error:", error);
//             res.status(500).json({
//                 success: false,
//                 message: "Failed to create order",
//                 error: error.message
//             });
//         }
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

// // ==================== 🎯 4. CONFIRM ORDER WITH EMAIL ====================
// router.post("/:orderId/confirm", authenticateToken, async (req, res) => {
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
//     db.getConnection(async (err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         try {
//             // Get order details with user info
//             const getOrderQuery = `
//                 SELECT 
//                     o.*,
//                     u.name as user_name,
//                     u.email as user_email
//                 FROM orders o
//                 JOIN users u ON o.user_id = u.id
//                 WHERE o.id = ? AND o.user_id = ?
//             `;

//             const orderResults = await queryAsync(connection, getOrderQuery, [orderId, userId]);

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
//             const itemsResults = await queryAsync(connection,
//                 `SELECT 
//                     oi.*,
//                     '/uploads/products/default-product.jpg' as product_image
//                 FROM order_items oi
//                 WHERE oi.order_id = ?`,
//                 [orderId]
//             );

//             order.items = itemsResults || [];

//             // Start transaction
//             await queryAsync(connection, 'START TRANSACTION');

//             // 1. Update order status
//             const updateQuery = `
//                 UPDATE orders 
//                 SET order_status = 'confirmed',
//                     order_note = CONCAT(IFNULL(order_note, ''), '\n', ?),
//                     confirmed_at = ?,
//                     updated_at = ?
//                 WHERE id = ? AND user_id = ?
//             `;

//             await queryAsync(connection, updateQuery, [
//                 `Order confirmed by customer on ${new Date().toLocaleString()}. Notes: ${orderNote || 'No notes'}`,
//                 new Date(),
//                 new Date(),
//                 orderId,
//                 userId
//             ]);

//             // 2. Add status history
//             const historyQuery = `
//                 INSERT INTO order_status_history 
//                 (order_id, status, comment, created_by, created_at)
//                 VALUES (?, ?, ?, ?, ?)
//             `;

//             await queryAsync(connection, historyQuery, [
//                 orderId,
//                 'confirmed',
//                 `Order confirmed by customer. ${orderNote || 'No notes'}`,
//                 userId,
//                 new Date()
//             ]);

//             // 3. Clear cart (if any items left)
//             await queryAsync(connection, 'DELETE FROM cart WHERE user_id = ?', [userId]);

//             // 4. Commit transaction
//             await queryAsync(connection, 'COMMIT');
//             connection.release();

//             console.log("✅ Order confirmed successfully!");
//             console.log(`📦 Order #${order.order_number} confirmed for ${order.user_email}`);

//             // ========== 📧 SEND CONFIRMATION EMAIL ==========
//             let emailResult = { success: false, error: 'Email sending failed' };

//             try {
//                 console.log("📧 Attempting to send confirmation email...");

//                 // Prepare order data for email
//                 const orderData = {
//                     orderId: order.id,
//                     orderNumber: order.order_number,
//                     items: order.items,
//                     shippingAddress: {
//                         fullName: order.shipping_full_name,
//                         address: order.shipping_address,
//                         city: order.shipping_city,
//                         state: order.shipping_state,
//                         postalCode: order.shipping_postal_code,
//                         country: order.shipping_country,
//                         phone: order.shipping_phone,
//                         email: order.shipping_email
//                     },
//                     billingAddress: {
//                         fullName: order.billing_full_name,
//                         address: order.billing_address,
//                         city: order.billing_city,
//                         state: order.billing_state,
//                         postalCode: order.billing_postal_code,
//                         country: order.billing_country
//                     },
//                     paymentMethod: order.payment_method,
//                     paymentStatus: order.payment_status,
//                     subtotal: order.subtotal,
//                     taxAmount: order.tax_amount,
//                     shippingCharge: order.shipping_charge,
//                     totalAmount: order.total_amount,
//                     orderNote: order.order_note,
//                     created_at: order.order_date
//                 };

//                 // Send email
//                 emailResult = await emailService.sendOrderConfirmation(
//                     orderData,
//                     order.user_email,
//                     order.user_name || 'Valued Customer'
//                 );

//                 console.log(`📧 Email result:`, emailResult);
//             } catch (emailError) {
//                 console.error("❌ Email sending failed:");
//                 console.error(`   Message: ${emailError.message}`);
//                 emailResult = { success: false, error: emailError.message };
//             }

//             // Send Response
//             res.json({
//                 success: true,
//                 message: "Order confirmed successfully!",
//                 orderId: orderId,
//                 orderNumber: order.order_number,
//                 totalAmount: order.total_amount,
//                 redirectTo: `/order-confirmation/${orderId}`,
//                 email: {
//                     sent: emailResult.success,
//                     to: order.user_email,
//                     messageId: emailResult.messageId,
//                     error: emailResult.error
//                 }
//             });

//         } catch (error) {
//             // Rollback on error
//             await queryAsync(connection, 'ROLLBACK');
//             connection.release();
//             console.error("❌ Order confirmation error:", error);
//             res.status(500).json({
//                 success: false,
//                 message: "Failed to confirm order",
//                 error: error.message
//             });
//         }
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
//                         -- 🟢 PRODUCT TABLE से IMAGE FETCH करें
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

//             // ✅ Get order items with product images
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

// // ==================== 🎯 11. UPDATE ORDER STATUS WITH EMAIL NOTIFICATION ====================
// router.put("/:orderId/status", authenticateToken, async (req, res) => {
//     const db = req.db;
//     const { orderId } = req.params;
//     const { status, comment } = req.body;

//     console.log("========== 🔄 UPDATE ORDER STATUS ==========");
//     console.log("Order ID:", orderId);
//     console.log("New Status:", status);

//     // Check if user is admin (you can add your admin check logic here)
//     // For now, we'll allow any authenticated user to update status
//     // You should implement proper admin check

//     db.getConnection(async (err, connection) => {
//         if (err) {
//             console.error("❌ Connection error:", err);
//             return res.status(500).json({ success: false, message: "Database connection failed" });
//         }

//         try {
//             // Get order and user details
//             const orderQuery = `
//                 SELECT 
//                     o.*,
//                     u.name as user_name,
//                     u.email as user_email
//                 FROM orders o
//                 JOIN users u ON o.user_id = u.id
//                 WHERE o.id = ?
//             `;

//             const orderResults = await queryAsync(connection, orderQuery, [orderId]);

//             if (!orderResults || orderResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ success: false, message: "Order not found" });
//             }

//             const order = orderResults[0];

//             // Start transaction
//             await queryAsync(connection, 'START TRANSACTION');

//             // Update order status
//             const updateQuery = `
//                 UPDATE orders 
//                 SET order_status = ?,
//                     updated_at = ?
//                 WHERE id = ?
//             `;

//             await queryAsync(connection, updateQuery, [status, new Date(), orderId]);

//             // Add status history
//             const historyQuery = `
//                 INSERT INTO order_status_history 
//                 (order_id, status, comment, created_by, created_at)
//                 VALUES (?, ?, ?, ?, ?)
//             `;

//             await queryAsync(connection, historyQuery, [
//                 orderId,
//                 status,
//                 comment || `Status updated to ${status}`,
//                 req.user.id,
//                 new Date()
//             ]);

//             await queryAsync(connection, 'COMMIT');
//             connection.release();

//             console.log("✅ Order status updated successfully");

//             // ========== 📧 SEND STATUS UPDATE EMAIL ==========
//             try {
//                 if (order.user_email) {
//                     const orderData = {
//                         orderId: order.id,
//                         orderNumber: order.order_number,
//                         totalAmount: order.total_amount,
//                         created_at: order.order_date
//                     };

//                     await emailService.sendOrderStatusUpdate(
//                         orderData,
//                         order.user_email,
//                         order.user_name,
//                         status
//                     );

//                     console.log(`📧 Status update email sent to ${order.user_email}`);
//                 }
//             } catch (emailError) {
//                 console.error("❌ Failed to send status update email:", emailError);
//             }

//             res.json({
//                 success: true,
//                 message: "Order status updated successfully",
//                 newStatus: status
//             });

//         } catch (error) {
//             await queryAsync(connection, 'ROLLBACK');
//             connection.release();
//             console.error("❌ Status update error:", error);
//             res.status(500).json({
//                 success: false,
//                 message: "Failed to update order status",
//                 error: error.message
//             });
//         }
//     });
// });

// module.exports = router;


















const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const PDFDocument = require('pdfkit'); // You'll need to install: npm install pdfkit
const path = require('path');
const fs = require('fs');
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

// Helper function to generate order timeline
const generateOrderTimeline = (order, statusHistory) => {
    const timeline = [];
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    statusHistory.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    statusOrder.forEach(status => {
        const historyItem = statusHistory.find(h => h.status === status);
        if (historyItem) {
            timeline.push({
                status,
                title: status.charAt(0).toUpperCase() + status.slice(1),
                description: historyItem.comment || `Order ${status}`,
                date: historyItem.created_at,
                completed: true,
                icon: getStatusIcon(status)
            });
        }
    });

    // Add current location if order is shipped
    if (order.order_status === 'shipped' && order.tracking_number) {
        timeline.push({
            status: 'in_transit',
            title: 'In Transit',
            description: `Package with ${order.courier_name || 'courier'}`,
            date: new Date(),
            completed: true,
            icon: '🚚',
            location: order.current_location || 'In transit'
        });
    }

    return timeline;
};

const getStatusIcon = (status) => {
    const icons = {
        'pending': '⏳',
        'confirmed': '✅',
        'processing': '🔄',
        'shipped': '📦',
        'delivered': '🎉',
        'cancelled': '❌',
        'returned': '↩️',
        'refunded': '💰'
    };
    return icons[status] || '📋';
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

            // Generate estimated delivery date (5 days from now)
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

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
                    order_note, order_status, order_date, estimated_delivery
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
                new Date(),
                estimatedDelivery
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

            // ========== 5. ADD STATUS HISTORY ==========
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                paymentMethod === 'cod' ? 'pending' : 'processing',
                'Order created successfully',
                userId,
                new Date()
            ]);

            // ========== 6. CLEAR CART ==========
            await queryAsync(connection, 'DELETE FROM cart WHERE user_id = ?', [userId]);

            // ========== 7. COMMIT TRANSACTION ==========
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
                        created_at: new Date(),
                        estimated_delivery: estimatedDelivery
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
                estimatedDelivery: estimatedDelivery,
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

            // Generate estimated delivery date
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

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
                    order_note, order_status, order_date, checkout_type, estimated_delivery
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                'direct',
                estimatedDelivery
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

            // ========== 7. ADD STATUS HISTORY ==========
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                paymentMethod === 'cod' ? 'pending' : 'processing',
                'Direct buy order created',
                userId,
                new Date()
            ]);

            // ========== 8. UPDATE STOCK ==========
            await queryAsync(connection,
                'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [quantity, productId, quantity]
            );

            // ========== 9. COMMIT TRANSACTION ==========
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
                        created_at: new Date(),
                        estimated_delivery: estimatedDelivery
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
                estimatedDelivery: estimatedDelivery,
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
                    `SELECT 
                        oi.*,
                        CASE 
                            WHEN p.images IS NOT NULL AND p.images != '' THEN
                                CASE 
                                    WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
                                        TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
                                    ELSE 
                                        p.images
                                END
                            ELSE '/uploads/products/default-product.jpg'
                        END as product_image
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?`,
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
                    created_at: order.order_date,
                    estimated_delivery: order.estimated_delivery
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
// ==================== 🎯 5. GET USER ORDERS - WITH PRODUCT IMAGES ====================
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

                // ✅ FIXED QUERY - Without JSON_ARRAYAGG
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
                        o.estimated_delivery,
                        o.tracking_number,
                        o.courier_name,
                        COUNT(DISTINCT oi.id) as item_count,
                        -- Get first product image for preview
                        MIN(
                            CASE 
                                WHEN p.images IS NOT NULL AND p.images != '' THEN
                                    CASE 
                                        WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
                                            TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
                                        ELSE 
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
                        if (ordersErr) {
                            connection.release();
                            console.error("❌ Orders fetch error:", ordersErr);
                            return res.status(500).json({ success: false, message: "Failed to fetch orders" });
                        }

                        // Now fetch items separately for each order
                        const orderIds = ordersResults.map(order => order.id);

                        if (orderIds.length === 0) {
                            connection.release();
                            return res.json({
                                success: true,
                                orders: [],
                                pagination: {
                                    total: total,
                                    page: parseInt(page),
                                    limit: parseInt(limit),
                                    pages: Math.ceil(total / limit)
                                }
                            });
                        }

                        // Fetch all items for these orders
                        const itemsQuery = `
                            SELECT 
                                oi.*,
                                CASE 
                                    WHEN p.images IS NOT NULL AND p.images != '' THEN
                                        CASE 
                                            WHEN p.images LIKE '{%}' OR p.images LIKE '[%]' THEN
                                                TRIM(BOTH '"' FROM SUBSTRING_INDEX(SUBSTRING_INDEX(p.images, ',', 1), '[', -1))
                                            ELSE 
                                                p.images
                                        END
                                    ELSE '/uploads/products/default-product.jpg'
                                END as product_image
                            FROM order_items oi
                            LEFT JOIN products p ON oi.product_id = p.id
                            WHERE oi.order_id IN (?)
                            ORDER BY oi.order_id, oi.id
                        `;

                        connection.query(itemsQuery, [orderIds], (itemsErr, itemsResults) => {
                            connection.release();

                            if (itemsErr) {
                                console.error("❌ Items fetch error:", itemsErr);
                                return res.status(500).json({ success: false, message: "Failed to fetch items" });
                            }

                            // Group items by order_id
                            const itemsByOrder = {};
                            itemsResults.forEach(item => {
                                if (!itemsByOrder[item.order_id]) {
                                    itemsByOrder[item.order_id] = [];
                                }
                                itemsByOrder[item.order_id].push({
                                    ...item,
                                    price: parseFloat(item.price || 0).toFixed(2),
                                    final_price: parseFloat(item.final_price || 0).toFixed(2),
                                    total_price: parseFloat(item.total_price || 0).toFixed(2)
                                });
                            });

                            // Format orders with their items
                            const formattedOrders = (ordersResults || []).map(order => ({
                                ...order,
                                total_amount: parseFloat(order.total_amount).toFixed(2),
                                items: itemsByOrder[order.id] || [],
                                can_cancel: ['pending', 'confirmed'].includes(order.order_status),
                                can_return: order.order_status === 'delivered' &&
                                    (new Date() - new Date(order.order_date)) / (1000 * 60 * 60 * 24) <= 7
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
                        });
                    }
                );
            }
        );
    });
});
// ==================== 🎯 6. GET SINGLE ORDER DETAILS WITH PRODUCT IMAGES ====================
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
                u.email as customer_email
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
                    p.brand,
                    p.category_id
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;

            connection.query(itemsQuery, [orderId], (itemsErr, itemsResults) => {
                if (itemsErr) {
                    connection.release();
                    console.error("❌ Items fetch error:", itemsErr);
                    return res.status(500).json({ success: false, message: "Failed to fetch items" });
                }

                // ✅ Get status history
                const historyQuery = `
                    SELECT * FROM order_status_history 
                    WHERE order_id = ? 
                    ORDER BY created_at ASC
                `;

                connection.query(historyQuery, [orderId], (historyErr, historyResults) => {
                    if (historyErr) {
                        console.error("❌ History fetch error:", historyErr);
                        historyResults = [];
                    }

                    // Format response
                    const formattedOrder = {
                        ...order,
                        total_amount: parseFloat(order.total_amount || 0).toFixed(2),
                        subtotal: parseFloat(order.subtotal || 0).toFixed(2),
                        tax_amount: parseFloat(order.tax_amount || 0).toFixed(2),
                        shipping_charge: parseFloat(order.shipping_charge || 0).toFixed(2),
                        can_cancel: ['pending', 'confirmed'].includes(order.order_status),
                        can_return: order.order_status === 'delivered' &&
                            (new Date() - new Date(order.order_date)) / (1000 * 60 * 60 * 24) <= 7,
                        estimated_delivery: order.estimated_delivery,
                        items: (itemsResults || []).map(item => ({
                            ...item,
                            price: parseFloat(item.price || 0).toFixed(2),
                            final_price: parseFloat(item.final_price || 0).toFixed(2),
                            total_price: parseFloat(item.total_price || 0).toFixed(2),
                            product_image: item.product_image || '/uploads/products/default-product.jpg'
                        })),
                        status_history: historyResults || [],
                        timeline: generateOrderTimeline(order, historyResults || [])
                    };

                    connection.release();

                    res.json({
                        success: true,
                        order: formattedOrder
                    });
                });
            });
        });
    });
});

// ==================== 🎯 7. CANCEL ORDER ====================
router.post("/:orderId/cancel", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log("========== ❌ CANCEL ORDER ==========");
    console.log("Order ID:", orderId);
    console.log("Reason:", reason);

    if (!reason) {
        return res.status(400).json({
            success: false,
            message: "Cancellation reason is required"
        });
    }

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Check if order can be cancelled
            const orderQuery = `
                SELECT * FROM orders 
                WHERE id = ? AND user_id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];
            const cancellableStatuses = ['pending', 'confirmed'];

            if (!cancellableStatuses.includes(order.order_status)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Order cannot be cancelled in ${order.order_status} status`
                });
            }

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Update order status
            const updateQuery = `
                UPDATE orders 
                SET order_status = 'cancelled',
                    cancellation_reason = ?,
                    cancelled_at = ?,
                    updated_at = ?
                WHERE id = ?
            `;

            await queryAsync(connection, updateQuery, [
                reason,
                new Date(),
                new Date(),
                orderId
            ]);

            // Add status history
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                'cancelled',
                `Order cancelled by customer. Reason: ${reason}`,
                userId,
                new Date()
            ]);

            // Restore product stock
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = ?`;
            const items = await queryAsync(connection, itemsQuery, [orderId]);

            for (const item of items) {
                await queryAsync(connection,
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order cancelled successfully");

            // Send cancellation email
            try {
                const userQuery = 'SELECT email, name FROM users WHERE id = ?';
                const userResults = await queryAsync(connection, userQuery, [userId]);

                if (userResults && userResults.length > 0) {
                    const userEmail = userResults[0].email;
                    const userName = userResults[0].name;

                    // You can create an email template for cancellation
                    // await emailService.sendOrderCancellation(order, userEmail, userName, reason);
                }
            } catch (emailError) {
                console.error("❌ Failed to send cancellation email:", emailError);
            }

            res.json({
                success: true,
                message: "Order cancelled successfully",
                orderId: orderId,
                newStatus: 'cancelled'
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Order cancellation error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to cancel order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 8. TRACK ORDER ====================
router.get("/:orderId/track", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    console.log("========== 🚚 TRACK ORDER ==========");
    console.log("Order ID:", orderId);

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Get order details
            const orderQuery = `
                SELECT o.*, u.name as user_name, u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ? AND o.user_id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Get status history
            const historyQuery = `
                SELECT * FROM order_status_history 
                WHERE order_id = ? 
                ORDER BY created_at ASC
            `;

            const historyResults = await queryAsync(connection, historyQuery, [orderId]);

            // Generate tracking information
            const trackingInfo = {
                orderNumber: order.order_number,
                status: order.order_status,
                trackingNumber: order.tracking_number,
                courierName: order.courier_name,
                courierWebsite: order.courier_website,
                estimatedDelivery: order.estimated_delivery,
                currentLocation: order.current_location || 'Processing',
                lastUpdated: order.updated_at || order.order_date,
                steps: generateOrderTimeline(order, historyResults || [])
            };

            connection.release();

            res.json({
                success: true,
                tracking: trackingInfo
            });

        } catch (error) {
            connection.release();
            console.error("❌ Track order error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to track order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 9. REORDER ====================
router.post("/:orderId/reorder", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    console.log("========== 🔄 REORDER ==========");
    console.log("Original Order ID:", orderId);

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Get original order items
            const itemsQuery = `
                SELECT oi.*, p.stock, p.status as product_status
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `;

            const items = await queryAsync(connection, itemsQuery, [orderId]);

            if (!items || items.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order items not found" });
            }

            // Check stock availability
            const unavailableItems = items.filter(item =>
                item.stock < item.quantity || item.product_status !== 'active'
            );

            if (unavailableItems.length > 0) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: "Some items are no longer available",
                    unavailableItems: unavailableItems.map(item => ({
                        name: item.product_name,
                        available: item.stock,
                        requested: item.quantity
                    }))
                });
            }

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Clear existing cart
            await queryAsync(connection, 'DELETE FROM cart WHERE user_id = ?', [userId]);

            // Add items to cart
            for (const item of items) {
                const cartQuery = `
                    INSERT INTO cart (
                        user_id, product_id, quantity, size, color, 
                        added_at, session_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                await queryAsync(connection, cartQuery, [
                    userId,
                    item.product_id,
                    item.quantity,
                    item.size || null,
                    item.color || null,
                    new Date(),
                    null
                ]);
            }

            // Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Reorder successful - Items added to cart");

            res.json({
                success: true,
                message: "Items added to cart successfully",
                itemCount: items.length,
                redirectTo: '/cart'
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Reorder error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to reorder items",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 10. REQUEST RETURN ====================
router.post("/:orderId/return", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason, comments } = req.body;

    console.log("========== ↩️ RETURN REQUEST ==========");
    console.log("Order ID:", orderId);
    console.log("Reason:", reason);

    if (!reason) {
        return res.status(400).json({
            success: false,
            message: "Return reason is required"
        });
    }

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Check if order can be returned
            const orderQuery = `
                SELECT * FROM orders 
                WHERE id = ? AND user_id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Check if order is delivered and within return window (7 days)
            if (order.order_status !== 'delivered') {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: "Only delivered orders can be returned"
                });
            }

            const deliveryDate = new Date(order.delivered_at || order.order_date);
            const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));

            if (daysSinceDelivery > 7) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: "Return window has expired (7 days from delivery)"
                });
            }

            // Check if return already requested
            const returnCheckQuery = `
                SELECT * FROM order_returns 
                WHERE order_id = ?
            `;

            const existingReturns = await queryAsync(connection, returnCheckQuery, [orderId]);

            if (existingReturns && existingReturns.length > 0) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: "Return already requested for this order"
                });
            }

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Create return request
            const returnQuery = `
                INSERT INTO order_returns (
                    order_id, user_id, reason, comments, status, 
                    requested_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const returnResult = await queryAsync(connection, returnQuery, [
                orderId,
                userId,
                reason,
                comments || null,
                'pending',
                new Date(),
                new Date()
            ]);

            const returnId = returnResult.insertId;

            // Update order status
            const updateQuery = `
                UPDATE orders 
                SET order_status = 'return_requested',
                    return_request_id = ?,
                    updated_at = ?
                WHERE id = ?
            `;

            await queryAsync(connection, updateQuery, [
                returnId,
                new Date(),
                orderId
            ]);

            // Add status history
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                'return_requested',
                `Return requested by customer. Reason: ${reason}`,
                userId,
                new Date()
            ]);

            // Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Return request submitted successfully");

            res.json({
                success: true,
                message: "Return request submitted successfully",
                returnId: returnId,
                status: 'pending'
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Return request error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to submit return request",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 11. GENERATE INVOICE PDF ====================
router.get("/:orderId/invoice", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    console.log("========== 📄 GENERATE INVOICE ==========");
    console.log("Order ID:", orderId);

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Get order details with user info
            const orderQuery = `
                SELECT 
                    o.*,
                    u.name as user_name,
                    u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ? AND o.user_id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Get order items
            const itemsQuery = `
                SELECT * FROM order_items 
                WHERE order_id = ?
            `;

            const items = await queryAsync(connection, itemsQuery, [orderId]);

            connection.release();

            // Create PDF document
            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number}.pdf`);

            // Pipe PDF to response
            doc.pipe(res);

            // Add company logo/header
            doc.fontSize(20).text('Your Store Name', 50, 50);
            doc.fontSize(10).text('123 Business Street', 50, 75);
            doc.text('City, State - 123456', 50, 90);
            doc.text('Phone: +91 9876543210', 50, 105);
            doc.text('Email: support@yourstore.com', 50, 120);

            // Invoice title
            doc.fontSize(16).text('TAX INVOICE', 50, 160);

            // Invoice details
            doc.fontSize(10);
            doc.text(`Invoice No: INV-${order.order_number}`, 400, 160);
            doc.text(`Date: ${new Date(order.order_date).toLocaleDateString('en-IN')}`, 400, 175);
            doc.text(`Order No: ${order.order_number}`, 400, 190);

            // Billing and Shipping details
            doc.fontSize(12).text('Bill To:', 50, 220);
            doc.fontSize(10);
            doc.text(order.billing_full_name || order.shipping_full_name, 50, 240);
            doc.text(order.billing_address || order.shipping_address, 50, 255);
            doc.text(`${order.billing_city || order.shipping_city}, ${order.billing_state || order.shipping_state}`, 50, 270);
            doc.text(`PIN: ${order.billing_postal_code || order.shipping_postal_code}`, 50, 285);
            doc.text(`Phone: ${order.shipping_phone}`, 50, 300);
            doc.text(`Email: ${order.shipping_email}`, 50, 315);

            doc.fontSize(12).text('Ship To:', 300, 220);
            doc.fontSize(10);
            doc.text(order.shipping_full_name, 300, 240);
            doc.text(order.shipping_address, 300, 255);
            doc.text(`${order.shipping_city}, ${order.shipping_state}`, 300, 270);
            doc.text(`PIN: ${order.shipping_postal_code}`, 300, 285);
            doc.text(`Phone: ${order.shipping_phone}`, 300, 300);

            // Items table header
            let y = 350;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('S.No', 50, y);
            doc.text('Product', 100, y);
            doc.text('Qty', 300, y);
            doc.text('Price', 350, y);
            doc.text('Discount', 400, y);
            doc.text('Total', 450, y);

            // Draw line
            doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

            // Items
            doc.font('Helvetica');
            y += 30;
            items.forEach((item, index) => {
                doc.text((index + 1).toString(), 50, y);
                doc.text(item.product_name.substring(0, 30), 100, y);
                doc.text(item.quantity.toString(), 300, y);
                doc.text(`₹${parseFloat(item.price).toFixed(2)}`, 350, y);
                doc.text(`${item.discount_percent}%`, 400, y);
                doc.text(`₹${parseFloat(item.total_price).toFixed(2)}`, 450, y);
                y += 20;
            });

            // Draw line
            doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();

            // Summary
            y += 30;
            doc.font('Helvetica-Bold');
            doc.text('Subtotal:', 350, y);
            doc.font('Helvetica');
            doc.text(`₹${parseFloat(order.subtotal).toFixed(2)}`, 450, y);

            y += 20;
            doc.font('Helvetica-Bold');
            doc.text('Shipping:', 350, y);
            doc.font('Helvetica');
            doc.text(`₹${parseFloat(order.shipping_charge).toFixed(2)}`, 450, y);

            y += 20;
            doc.font('Helvetica-Bold');
            doc.text('Tax:', 350, y);
            doc.font('Helvetica');
            doc.text(`₹${parseFloat(order.tax_amount || 0).toFixed(2)}`, 450, y);

            y += 20;
            doc.moveTo(340, y - 5).lineTo(550, y - 5).stroke();

            y += 20;
            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('Total:', 350, y);
            doc.text(`₹${parseFloat(order.total_amount).toFixed(2)}`, 450, y);

            // Payment details
            y += 50;
            doc.fontSize(10);
            doc.text(`Payment Method: ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 50, y);
            y += 20;
            doc.text(`Payment Status: ${order.payment_status}`, 50, y);

            // Footer
            y += 50;
            doc.fontSize(8);
            doc.text('This is a computer generated invoice - no signature required', 50, y);
            doc.text('Thank you for shopping with us!', 50, y + 15);

            // Finalize PDF
            doc.end();

        } catch (error) {
            connection.release();
            console.error("❌ Invoice generation error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate invoice",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 12. UPDATE ORDER STATUS WITH EMAIL NOTIFICATION ====================
router.put("/:orderId/status", authenticateToken, async (req, res) => {
    const db = req.db;
    const { orderId } = req.params;
    const { status, comment, trackingNumber, courierName } = req.body;

    console.log("========== 🔄 UPDATE ORDER STATUS ==========");
    console.log("Order ID:", orderId);
    console.log("New Status:", status);

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

            // Build update query based on provided fields
            let updateFields = ['order_status = ?', 'updated_at = ?'];
            let updateValues = [status, new Date()];

            if (trackingNumber) {
                updateFields.push('tracking_number = ?');
                updateValues.push(trackingNumber);
            }

            if (courierName) {
                updateFields.push('courier_name = ?');
                updateValues.push(courierName);
            }

            // Add status-specific fields
            if (status === 'delivered') {
                updateFields.push('delivered_at = ?');
                updateValues.push(new Date());
            }

            updateValues.push(orderId);

            const updateQuery = `
                UPDATE orders 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `;

            await queryAsync(connection, updateQuery, updateValues);

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
                        created_at: order.order_date,
                        trackingNumber: trackingNumber || order.tracking_number,
                        courierName: courierName || order.courier_name
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

// ==================== 🎯 13. TEST EMAIL ROUTE ====================
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

// ==================== 🎯 14. CLEAR CART ====================
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

// ==================== 🎯 15. RAZORPAY PAYMENT ====================
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

// ==================== 🎯 16. VERIFY RAZORPAY PAYMENT ====================
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

// ==================== 🎯 7. CANCEL ORDER (Updated for Online Payments) ====================
router.post("/:orderId/cancel", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log("========== ❌ CANCEL ORDER ==========");
    console.log("Order ID:", orderId);
    console.log("Reason:", reason);

    if (!reason) {
        return res.status(400).json({
            success: false,
            message: "Cancellation reason is required"
        });
    }

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Check if order exists and belongs to user
            const orderQuery = `
                SELECT o.*, p.razorpay_payment_id, p.razorpay_order_id 
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                WHERE o.id = ? AND o.user_id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Check if order can be cancelled
            const cancellableStatuses = ['pending', 'confirmed', 'processing'];

            if (!cancellableStatuses.includes(order.order_status)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Order cannot be cancelled in ${order.order_status} status`
                });
            }

            // For online payments, check time limit (24 hours)
            if (order.payment_method !== 'cod') {
                const orderDate = new Date(order.order_date);
                const hoursSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60);

                if (hoursSinceOrder > 24) {
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: "Online payment orders can only be cancelled within 24 hours of placing"
                    });
                }
            }

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Update order status
            const updateQuery = `
                UPDATE orders 
                SET order_status = 'cancelled',
                    cancellation_reason = ?,
                    cancelled_at = ?,
                    updated_at = ?,
                    cancelled_by = ?
                WHERE id = ?
            `;

            await queryAsync(connection, updateQuery, [
                reason,
                new Date(),
                new Date(),
                userId,
                orderId
            ]);

            // Add status history
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                'cancelled',
                `Order cancelled by customer. Reason: ${reason}`,
                userId,
                new Date()
            ]);

            // Restore product stock
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = ?`;
            const items = await queryAsync(connection, itemsQuery, [orderId]);

            for (const item of items) {
                await queryAsync(connection,
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // If payment was made online, initiate refund process
            if (order.payment_method !== 'cod' && order.payment_status === 'completed') {
                // Update payment status to refund pending
                await queryAsync(connection,
                    'UPDATE orders SET payment_status = ? WHERE id = ?',
                    ['refund_pending', orderId]
                );

                // You can add refund logic here using Razorpay API
                // await processRefund(order.razorpay_payment_id);
            }

            // Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order cancelled successfully");

            // Send cancellation email
            try {
                const userQuery = 'SELECT email, name FROM users WHERE id = ?';
                const userResults = await queryAsync(db, userQuery, [userId]);

                if (userResults && userResults.length > 0) {
                    const userEmail = userResults[0].email;
                    const userName = userResults[0].name;

                    // Send cancellation email
                    await emailService.sendOrderCancellation(order, userEmail, userName, reason);
                }
            } catch (emailError) {
                console.error("❌ Failed to send cancellation email:", emailError);
            }

            res.json({
                success: true,
                message: order.payment_method !== 'cod'
                    ? "Order cancelled successfully. Refund will be processed within 5-7 business days."
                    : "Order cancelled successfully",
                orderId: orderId,
                newStatus: 'cancelled',
                refundInitiated: order.payment_method !== 'cod' && order.payment_status === 'completed'
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Order cancellation error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to cancel order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 17. DELETE ORDER (Admin/Customer for Cancelled Orders) ====================
router.delete("/:orderId/delete", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    // Check if user is admin (you can add your admin check logic)
    const isAdmin = req.user.role === 'admin';

    console.log("========== 🗑️ DELETE ORDER ==========");
    console.log("Order ID:", orderId);
    console.log("User ID:", userId);
    console.log("Is Admin:", isAdmin);

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Check if order exists
            const orderQuery = `SELECT * FROM orders WHERE id = ?`;
            const orderResults = await queryAsync(connection, orderQuery, [orderId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Check permissions:
            // - Admin can delete any cancelled order
            // - Customer can only delete their own cancelled orders
            if (!isAdmin) {
                if (order.user_id !== userId) {
                    connection.release();
                    return res.status(403).json({
                        success: false,
                        message: "You don't have permission to delete this order"
                    });
                }

                if (order.order_status !== 'cancelled') {
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: "Only cancelled orders can be deleted"
                    });
                }
            }

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Delete related records first (due to foreign key constraints)

            // 1. Delete from order_returns if exists
            await queryAsync(connection, 'DELETE FROM order_returns WHERE order_id = ?', [orderId]);

            // 2. Delete from order_status_history
            await queryAsync(connection, 'DELETE FROM order_status_history WHERE order_id = ?', [orderId]);

            // 3. Delete from order_items
            await queryAsync(connection, 'DELETE FROM order_items WHERE order_id = ?', [orderId]);

            // 4. Delete from payments if exists
            await queryAsync(connection, 'DELETE FROM payments WHERE order_id = ?', [orderId]);

            // 5. Finally delete the order
            await queryAsync(connection, 'DELETE FROM orders WHERE id = ?', [orderId]);

            // Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order deleted successfully");

            res.json({
                success: true,
                message: "Order deleted successfully",
                orderId: orderId
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Order deletion error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete order",
                error: error.message
            });
        }
    });
});

// ==================== 🎯 GET CANCELLATION TIME LIMITS ====================
router.get("/cancellation-limits", authenticateToken, async (req, res) => {
    const db = req.db;

    try {
        const query = `
            SELECT setting_key, setting_value 
            FROM order_settings 
            WHERE setting_key LIKE 'cancellation_time_%' OR setting_key = 'refund_time_message'
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error("❌ Error fetching settings:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch settings"
                });
            }

            const settings = {};
            results.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });

            res.json({
                success: true,
                settings: settings
            });
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== 🎯 UPDATED CANCEL ORDER WITH DYNAMIC LIMITS ====================
router.post("/:orderId/cancel", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log("========== ❌ CANCEL ORDER ==========");
    console.log("Order ID:", orderId);
    console.log("Reason:", reason);

    if (!reason) {
        return res.status(400).json({
            success: false,
            message: "Cancellation reason is required"
        });
    }

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error("❌ Connection error:", err);
            return res.status(500).json({ success: false, message: "Database connection failed" });
        }

        try {
            // Get cancellation time limits from settings
            const settingsQuery = `
                SELECT setting_key, setting_value 
                FROM order_settings 
                WHERE setting_key IN ('cancellation_time_pending', 'cancellation_time_processing', 'cancellation_time_confirmed', 'refund_time_message')
            `;

            const settingsResults = await queryAsync(connection, settingsQuery);
            const settings = {};
            settingsResults.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });

            // Default values if settings not found
            const timeLimits = {
                pending: parseInt(settings.cancellation_time_pending) || 24,
                processing: parseInt(settings.cancellation_time_processing) || 12,
                confirmed: parseInt(settings.cancellation_time_confirmed) || 6,
                refundMessage: settings.refund_time_message || '5-7'
            };

            // Check if order exists and belongs to user
            const orderQuery = `
                SELECT o.*, p.razorpay_payment_id, p.razorpay_order_id 
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                WHERE o.id = ? AND o.user_id = ?
            `;

            const orderResults = await queryAsync(connection, orderQuery, [orderId, userId]);

            if (!orderResults || orderResults.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const order = orderResults[0];

            // Check if order can be cancelled based on status
            const cancellableStatuses = ['pending', 'confirmed', 'processing'];

            if (!cancellableStatuses.includes(order.order_status)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Order cannot be cancelled in ${order.order_status} status`
                });
            }

            // Calculate time-based cancellation eligibility
            const orderDate = new Date(order.order_date);
            const hoursSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60);

            // Get time limit based on order status
            let timeLimit;
            switch (order.order_status) {
                case 'pending':
                    timeLimit = timeLimits.pending;
                    break;
                case 'processing':
                    timeLimit = timeLimits.processing;
                    break;
                case 'confirmed':
                    timeLimit = timeLimits.confirmed;
                    break;
                default:
                    timeLimit = 24; // default 24 hours
            }

            // Check if within time limit
            if (hoursSinceOrder > timeLimit) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Order cannot be cancelled after ${timeLimit} hours in ${order.order_status} status`,
                    timeLimit: timeLimit,
                    hoursPassed: Math.floor(hoursSinceOrder)
                });
            }

            // Start transaction
            await queryAsync(connection, 'START TRANSACTION');

            // Update order status
            const updateQuery = `
                UPDATE orders 
                SET order_status = 'cancelled',
                    cancellation_reason = ?,
                    cancelled_at = ?,
                    updated_at = ?,
                    cancelled_by = ?
                WHERE id = ?
            `;

            await queryAsync(connection, updateQuery, [
                reason,
                new Date(),
                new Date(),
                userId,
                orderId
            ]);

            // Add status history
            const historyQuery = `
                INSERT INTO order_status_history 
                (order_id, status, comment, created_by, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await queryAsync(connection, historyQuery, [
                orderId,
                'cancelled',
                `Order cancelled by customer. Reason: ${reason}`,
                userId,
                new Date()
            ]);

            // Restore product stock
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = ?`;
            const items = await queryAsync(connection, itemsQuery, [orderId]);

            for (const item of items) {
                await queryAsync(connection,
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // If payment was made online, initiate refund process
            let refundInitiated = false;
            if (order.payment_method !== 'cod' && order.payment_status === 'completed') {
                // Update payment status to refund pending
                await queryAsync(connection,
                    'UPDATE orders SET payment_status = ? WHERE id = ?',
                    ['refund_pending', orderId]
                );
                refundInitiated = true;

                // You can add refund logic here using Razorpay API
                // await processRefund(order.razorpay_payment_id);
            }

            // Commit transaction
            await queryAsync(connection, 'COMMIT');
            connection.release();

            console.log("✅ Order cancelled successfully");

            // Send cancellation email
            try {
                const userQuery = 'SELECT email, name FROM users WHERE id = ?';
                const userResults = await queryAsync(db, userQuery, [userId]);

                if (userResults && userResults.length > 0) {
                    const userEmail = userResults[0].email;
                    const userName = userResults[0].name;

                    // Send cancellation email
                    await emailService.sendOrderCancellation(order, userEmail, userName, reason, timeLimits.refundMessage);
                }
            } catch (emailError) {
                console.error("❌ Failed to send cancellation email:", emailError);
            }

            res.json({
                success: true,
                message: refundInitiated
                    ? `Order cancelled successfully. Refund will be processed within ${timeLimits.refundMessage} business days.`
                    : "Order cancelled successfully",
                orderId: orderId,
                newStatus: 'cancelled',
                refundInitiated: refundInitiated,
                refundTimeMessage: timeLimits.refundMessage
            });

        } catch (error) {
            await queryAsync(connection, 'ROLLBACK');
            connection.release();
            console.error("❌ Order cancellation error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to cancel order",
                error: error.message
            });
        }
    });
});

module.exports = router;