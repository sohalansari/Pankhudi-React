// // src/controllers/orderAdminController.js
// const db = require("../config/db");

// // Get all orders
// exports.getAllOrders = (req, res) => {
//     const query = `
//         SELECT
//             o.*,
//             u.name as customer_name,
//             u.email,
//             u.phone
//         FROM orders o
//         JOIN users u ON o.user_id = u.id
//         WHERE o.deleted_at IS NULL
//         ORDER BY o.created_at DESC
//     `;

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error("Error fetching orders:", err);
//             return res.status(500).json({ error: err.message });
//         }
//         res.json(results);
//     });
// };

// // Get order details by ID
// exports.getOrderDetails = (req, res) => {
//     const { id } = req.params;

//     const query = `
//         SELECT
//             o.*,
//             u.name as customer_name,
//             u.email,
//             u.phone,
//             u.address
//         FROM orders o
//         JOIN users u ON o.user_id = u.id
//         WHERE o.id = ? AND o.deleted_at IS NULL
//     `;

//     db.query(query, [id], (err, results) => {
//         if (err) {
//             console.error("Error fetching order details:", err);
//             return res.status(500).json({ error: err.message });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // Get order items
//         const itemsQuery = `
//             SELECT oi.*, p.name as product_name
//             FROM order_items oi
//             JOIN products p ON oi.product_id = p.id
//             WHERE oi.order_id = ?
//         `;

//         db.query(itemsQuery, [id], (err2, items) => {
//             if (err2) {
//                 console.error("Error fetching order items:", err2);
//                 return res.status(500).json({ error: err2.message });
//             }

//             res.json({
//                 ...results[0],
//                 items: items
//             });
//         });
//     });
// };

// // Update order status
// exports.updateOrderStatus = (req, res) => {
//     const { id } = req.params;
//     const { order_status, tracking_number, courier_name } = req.body;

//     const query = `
//         UPDATE orders
//         SET order_status = ?,
//             tracking_number = ?,
//             courier_name = ?,
//             updated_at = NOW()
//         WHERE id = ? AND deleted_at IS NULL
//     `;

//     db.query(query, [order_status, tracking_number, courier_name, id], (err, result) => {
//         if (err) {
//             console.error("Error updating order:", err);
//             return res.status(500).json({ error: err.message });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // Add to status history
//         const historyQuery = `
//             INSERT INTO order_status_history (order_id, status, comment, created_at)
//             VALUES (?, ?, 'Status updated by admin', NOW())
//         `;

//         db.query(historyQuery, [id, order_status], (err2) => {
//             if (err2) {
//                 console.error("Error adding status history:", err2);
//             }
//         });

//         res.json({
//             success: true,
//             message: "Order status updated successfully"
//         });
//     });
// };