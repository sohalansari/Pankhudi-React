// const db = require('../config/db');

// const orderController = {
//     // Get all orders with filters and pagination
//     getOrders: async (req, res) => {
//         try {
//             console.log("📦 Fetching orders...");

//             const page = parseInt(req.query.page) || 1;
//             const limit = parseInt(req.query.limit) || 10;
//             const offset = (page - 1) * limit;

//             const status = req.query.status || '';
//             const paymentStatus = req.query.payment_status || '';
//             const search = req.query.search || '';
//             const dateFrom = req.query.date_from || '';
//             const dateTo = req.query.date_to || '';

//             // Count query
//             let countQuery = `SELECT COUNT(*) as total FROM orders WHERE deleted_at IS NULL`;
//             let dataQuery = `
//                 SELECT 
//                     o.*,
//                     (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
//                     (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as total_items
//                 FROM orders o
//                 WHERE o.deleted_at IS NULL
//             `;

//             let params = [];
//             let countParams = [];

//             // Add filters
//             if (status) {
//                 dataQuery += ` AND o.order_status = ?`;
//                 countQuery += ` AND order_status = ?`;
//                 params.push(status);
//                 countParams.push(status);
//             }

//             if (paymentStatus) {
//                 dataQuery += ` AND o.payment_status = ?`;
//                 countQuery += ` AND payment_status = ?`;
//                 params.push(paymentStatus);
//                 countParams.push(paymentStatus);
//             }

//             if (search) {
//                 dataQuery += ` AND (o.order_number LIKE ? OR o.shipping_full_name LIKE ? OR o.shipping_email LIKE ?)`;
//                 countQuery += ` AND (order_number LIKE ? OR shipping_full_name LIKE ? OR shipping_email LIKE ?)`;
//                 const searchTerm = `%${search}%`;
//                 params.push(searchTerm, searchTerm, searchTerm);
//                 countParams.push(searchTerm, searchTerm, searchTerm);
//             }

//             if (dateFrom) {
//                 dataQuery += ` AND DATE(o.order_date) >= ?`;
//                 countQuery += ` AND DATE(order_date) >= ?`;
//                 params.push(dateFrom);
//                 countParams.push(dateFrom);
//             }

//             if (dateTo) {
//                 dataQuery += ` AND DATE(o.order_date) <= ?`;
//                 countQuery += ` AND DATE(order_date) <= ?`;
//                 params.push(dateTo);
//                 countParams.push(dateTo);
//             }

//             // Get total count using promise wrapper
//             const countResult = await new Promise((resolve, reject) => {
//                 db.query(countQuery, countParams, (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 });
//             });

//             const total = countResult[0]?.total || 0;

//             if (total === 0) {
//                 return res.json({
//                     success: true,
//                     data: {
//                         orders: [],
//                         pagination: { page, limit, total: 0, totalPages: 0 }
//                     }
//                 });
//             }

//             // Add pagination
//             dataQuery += ` ORDER BY o.order_date DESC LIMIT ? OFFSET ?`;
//             params.push(limit, offset);

//             // Get orders using promise wrapper
//             const orders = await new Promise((resolve, reject) => {
//                 db.query(dataQuery, params, (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 });
//             });

//             res.json({
//                 success: true,
//                 data: {
//                     orders: orders || [],
//                     pagination: {
//                         page,
//                         limit,
//                         total,
//                         totalPages: Math.ceil(total / limit)
//                     }
//                 }
//             });

//         } catch (error) {
//             console.error('❌ Error fetching orders:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error fetching orders',
//                 error: error.message
//             });
//         }
//     },

//     // Get order statistics
//     getStats: async (req, res) => {
//         try {
//             console.log("📊 Fetching stats...");

//             // Today's stats
//             const todayResult = await new Promise((resolve, reject) => {
//                 db.query(`
//                     SELECT 
//                         COUNT(*) as order_count, 
//                         COALESCE(SUM(total_amount), 0) as revenue
//                     FROM orders 
//                     WHERE DATE(order_date) = CURDATE() 
//                     AND deleted_at IS NULL
//                 `, (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 });
//             });

//             // Status wise stats
//             const statusResult = await new Promise((resolve, reject) => {
//                 db.query(`
//                     SELECT 
//                         order_status,
//                         COUNT(*) as count,
//                         COALESCE(SUM(total_amount), 0) as total_amount
//                     FROM orders 
//                     WHERE deleted_at IS NULL 
//                     GROUP BY order_status
//                 `, (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 });
//             });

//             // Weekly stats
//             const weeklyResult = await new Promise((resolve, reject) => {
//                 db.query(`
//                     SELECT 
//                         COUNT(*) as order_count, 
//                         COALESCE(SUM(total_amount), 0) as revenue
//                     FROM orders 
//                     WHERE order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
//                     AND deleted_at IS NULL
//                 `, (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 });
//             });

//             res.json({
//                 success: true,
//                 data: {
//                     today: todayResult[0] || { order_count: 0, revenue: 0 },
//                     by_status: statusResult || [],
//                     weekly: weeklyResult[0] || { order_count: 0, revenue: 0 }
//                 }
//             });

//         } catch (error) {
//             console.error('❌ Error fetching stats:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error fetching statistics',
//                 error: error.message
//             });
//         }
//     },

//     // Get single order details
//     getOrderDetails: async (req, res) => {
//         try {
//             const { id } = req.params;

//             // Get order
//             const orderResult = await new Promise((resolve, reject) => {
//                 db.query(
//                     `SELECT * FROM orders WHERE id = ? AND deleted_at IS NULL`,
//                     [id],
//                     (err, results) => {
//                         if (err) reject(err);
//                         else resolve(results);
//                     }
//                 );
//             });

//             if (!orderResult || orderResult.length === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Order not found'
//                 });
//             }

//             const order = orderResult[0];

//             // Get order items
//             const itemsResult = await new Promise((resolve, reject) => {
//                 db.query(
//                     `SELECT * FROM order_items WHERE order_id = ?`,
//                     [id],
//                     (err, results) => {
//                         if (err) reject(err);
//                         else resolve(results);
//                     }
//                 );
//             });

//             // Get status history
//             const historyResult = await new Promise((resolve, reject) => {
//                 db.query(
//                     `SELECT * FROM order_status_history 
//                      WHERE order_id = ? 
//                      ORDER BY created_at DESC`,
//                     [id],
//                     (err, results) => {
//                         if (err) reject(err);
//                         else resolve(results);
//                     }
//                 );
//             });

//             res.json({
//                 success: true,
//                 data: {
//                     ...order,
//                     items: itemsResult || [],
//                     status_history: historyResult || []
//                 }
//             });

//         } catch (error) {
//             console.error('❌ Error fetching order details:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error fetching order details',
//                 error: error.message
//             });
//         }
//     },

//     // Update order status
//     updateOrderStatus: async (req, res) => {
//         try {
//             const { id } = req.params;
//             const { order_status, comment } = req.body;

//             // Check if order exists
//             const order = await new Promise((resolve, reject) => {
//                 db.query(
//                     `SELECT * FROM orders WHERE id = ?`,
//                     [id],
//                     (err, results) => {
//                         if (err) reject(err);
//                         else resolve(results);
//                     }
//                 );
//             });

//             if (!order || order.length === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Order not found'
//                 });
//             }

//             const oldStatus = order[0].order_status;

//             // Update status
//             await new Promise((resolve, reject) => {
//                 db.query(
//                     `UPDATE orders 
//                      SET order_status = ?, 
//                          updated_at = NOW() 
//                      WHERE id = ?`,
//                     [order_status, id],
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//             });

//             // Add to history
//             await new Promise((resolve, reject) => {
//                 db.query(
//                     `INSERT INTO order_status_history (order_id, status, comment, created_at) 
//                      VALUES (?, ?, ?, NOW())`,
//                     [id, order_status, comment || `Status changed from ${oldStatus} to ${order_status}`],
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//             });

//             res.json({
//                 success: true,
//                 message: 'Order status updated successfully'
//             });

//         } catch (error) {
//             console.error('❌ Error updating order status:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error updating order status',
//                 error: error.message
//             });
//         }
//     },

//     // Update payment status
//     updatePaymentStatus: async (req, res) => {
//         try {
//             const { id } = req.params;
//             const { payment_status } = req.body;

//             await new Promise((resolve, reject) => {
//                 db.query(
//                     `UPDATE orders 
//                      SET payment_status = ?, 
//                          updated_at = NOW() 
//                      WHERE id = ?`,
//                     [payment_status, id],
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//             });

//             res.json({
//                 success: true,
//                 message: 'Payment status updated successfully'
//             });

//         } catch (error) {
//             console.error('❌ Error updating payment status:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error updating payment status',
//                 error: error.message
//             });
//         }
//     },

//     // Add tracking
//     addTracking: async (req, res) => {
//         try {
//             const { id } = req.params;
//             const { tracking_number, courier_name, courier_website } = req.body;

//             await new Promise((resolve, reject) => {
//                 db.query(
//                     `UPDATE orders 
//                      SET tracking_number = ?, 
//                          courier_name = ?, 
//                          courier_website = ?,
//                          updated_at = NOW() 
//                      WHERE id = ?`,
//                     [tracking_number, courier_name, courier_website, id],
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//             });

//             res.json({
//                 success: true,
//                 message: 'Tracking information added successfully'
//             });

//         } catch (error) {
//             console.error('❌ Error adding tracking:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error adding tracking',
//                 error: error.message
//             });
//         }
//     },

//     // Export orders
//     exportOrders: async (req, res) => {
//         try {
//             const { status, payment_status, date_from, date_to } = req.query;

//             let query = `SELECT * FROM orders WHERE deleted_at IS NULL`;
//             let params = [];

//             if (status) {
//                 query += ` AND order_status = ?`;
//                 params.push(status);
//             }
//             if (payment_status) {
//                 query += ` AND payment_status = ?`;
//                 params.push(payment_status);
//             }
//             if (date_from) {
//                 query += ` AND DATE(order_date) >= ?`;
//                 params.push(date_from);
//             }
//             if (date_to) {
//                 query += ` AND DATE(order_date) <= ?`;
//                 params.push(date_to);
//             }

//             query += ` ORDER BY order_date DESC`;

//             const orders = await new Promise((resolve, reject) => {
//                 db.query(query, params, (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 });
//             });

//             res.json({
//                 success: true,
//                 data: orders
//             });

//         } catch (error) {
//             console.error('❌ Error exporting orders:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Error exporting orders',
//                 error: error.message
//             });
//         }
//     }
// };

// module.exports = orderController;


















const db = require('../config/db');

const orderController = {
    // Get all orders with filters and pagination
    getOrders: async (req, res) => {
        try {
            console.log("📦 Fetching orders...");

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const status = req.query.status || '';
            const paymentStatus = req.query.payment_status || '';
            const search = req.query.search || '';
            const dateFrom = req.query.date_from || '';
            const dateTo = req.query.date_to || '';

            // Get user name from users table
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE o.deleted_at IS NULL
            `;

            let dataQuery = `
                SELECT 
                    o.*,
                    u.name as user_name,
                    u.email as user_email,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
                    (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as total_items,
                    (SELECT COUNT(*) FROM order_returns WHERE order_id = o.id AND status = 'pending') as has_return_request
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.deleted_at IS NULL
            `;

            let params = [];
            let countParams = [];

            // Add filters
            if (status) {
                dataQuery += ` AND o.order_status = ?`;
                countQuery += ` AND o.order_status = ?`;
                params.push(status);
                countParams.push(status);
            }

            if (paymentStatus) {
                dataQuery += ` AND o.payment_status = ?`;
                countQuery += ` AND o.payment_status = ?`;
                params.push(paymentStatus);
                countParams.push(paymentStatus);
            }

            if (search) {
                dataQuery += ` AND (o.order_number LIKE ? OR o.shipping_full_name LIKE ? OR o.shipping_email LIKE ? OR o.shipping_phone LIKE ?)`;
                countQuery += ` AND (o.order_number LIKE ? OR o.shipping_full_name LIKE ? OR o.shipping_email LIKE ? OR o.shipping_phone LIKE ?)`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
                countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            if (dateFrom) {
                dataQuery += ` AND DATE(o.order_date) >= ?`;
                countQuery += ` AND DATE(o.order_date) >= ?`;
                params.push(dateFrom);
                countParams.push(dateFrom);
            }

            if (dateTo) {
                dataQuery += ` AND DATE(o.order_date) <= ?`;
                countQuery += ` AND DATE(o.order_date) <= ?`;
                params.push(dateTo);
                countParams.push(dateTo);
            }

            // Get total count
            const countResult = await new Promise((resolve, reject) => {
                db.query(countQuery, countParams, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const total = countResult[0]?.total || 0;

            if (total === 0) {
                return res.json({
                    success: true,
                    data: {
                        orders: [],
                        pagination: { page, limit, total: 0, totalPages: 0 }
                    }
                });
            }

            // Add pagination
            dataQuery += ` ORDER BY o.order_date DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            // Get orders
            const orders = await new Promise((resolve, reject) => {
                db.query(dataQuery, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.json({
                success: true,
                data: {
                    orders: orders || [],
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error fetching orders:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching orders',
                error: error.message
            });
        }
    },

    // Get order statistics
    getStats: async (req, res) => {
        try {
            console.log("📊 Fetching stats...");

            // Today's stats
            const todayResult = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        COUNT(*) as order_count, 
                        COALESCE(SUM(total_amount), 0) as revenue
                    FROM orders 
                    WHERE DATE(order_date) = CURDATE() 
                    AND deleted_at IS NULL
                `, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Status wise stats
            const statusResult = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        order_status,
                        COUNT(*) as count,
                        COALESCE(SUM(total_amount), 0) as total_amount
                    FROM orders 
                    WHERE deleted_at IS NULL 
                    GROUP BY order_status
                `, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Payment status stats
            const paymentResult = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        payment_status,
                        COUNT(*) as count,
                        COALESCE(SUM(total_amount), 0) as total_amount
                    FROM orders 
                    WHERE deleted_at IS NULL 
                    GROUP BY payment_status
                `, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Return requests count
            const returnResult = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        COUNT(*) as count,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_returns
                    FROM order_returns
                `, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Weekly stats
            const weeklyResult = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        COUNT(*) as order_count, 
                        COALESCE(SUM(total_amount), 0) as revenue
                    FROM orders 
                    WHERE order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                    AND deleted_at IS NULL
                `, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.json({
                success: true,
                data: {
                    today: todayResult[0] || { order_count: 0, revenue: 0 },
                    by_status: statusResult || [],
                    by_payment: paymentResult || [],
                    returns: returnResult[0] || { count: 0, pending_returns: 0 },
                    weekly: weeklyResult[0] || { order_count: 0, revenue: 0 }
                }
            });

        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message
            });
        }
    },

    // Get single order details with items and returns
    getOrderDetails: async (req, res) => {
        try {
            const { id } = req.params;

            // Get order with user details
            const orderResult = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
                     FROM orders o
                     LEFT JOIN users u ON o.user_id = u.id
                     WHERE o.id = ? AND o.deleted_at IS NULL`,
                    [id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            if (!orderResult || orderResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            const order = orderResult[0];

            // Get order items with product details
            const itemsResult = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT oi.*, p.images as product_images
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.id
                     WHERE oi.order_id = ?`,
                    [id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            // Get status history with user names
            const historyResult = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT h.*, u.name as updated_by_name
                     FROM order_status_history h
                     LEFT JOIN users u ON h.created_by = u.id
                     WHERE h.order_id = ? 
                     ORDER BY h.created_at DESC`,
                    [id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            // Get return requests for this order
            const returnResult = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT r.*, u.name as user_name
                     FROM order_returns r
                     LEFT JOIN users u ON r.user_id = u.id
                     WHERE r.order_id = ?
                     ORDER BY r.requested_at DESC`,
                    [id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            // Get payment details if any
            const paymentResult = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT * FROM payments WHERE order_id = ?`,
                    [id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            res.json({
                success: true,
                data: {
                    ...order,
                    items: itemsResult || [],
                    status_history: historyResult || [],
                    returns: returnResult || [],
                    payments: paymentResult || []
                }
            });

        } catch (error) {
            console.error('❌ Error fetching order details:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching order details',
                error: error.message
            });
        }
    },

    // Update order status
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { order_status, comment } = req.body;
            const userId = req.user?.id || 1; // Get from auth middleware

            // Check if order exists
            const order = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT * FROM orders WHERE id = ? AND deleted_at IS NULL`,
                    [id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            if (!order || order.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            const oldStatus = order[0].order_status;
            const now = new Date();

            // Set date fields based on status
            let updateFields = ['order_status = ?', 'updated_at = NOW()'];
            let updateParams = [order_status];

            if (order_status === 'shipped' && oldStatus !== 'shipped') {
                updateFields.push('shipped_date = ?');
                updateParams.push(now);
            } else if (order_status === 'delivered' && oldStatus !== 'delivered') {
                updateFields.push('delivered_date = ?', 'delivered_at = ?');
                updateParams.push(now, now);
            } else if (order_status === 'cancelled' && oldStatus !== 'cancelled') {
                updateFields.push('cancelled_date = ?', 'cancelled_at = ?', 'cancelled_by = ?');
                updateParams.push(now, now, userId);
            }

            updateParams.push(id);

            // Update status
            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateParams,
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            // Add to history
            await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO order_status_history (order_id, status, comment, created_by, created_at) 
                     VALUES (?, ?, ?, ?, NOW())`,
                    [id, order_status, comment || `Status changed from ${oldStatus} to ${order_status}`, userId],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('❌ Error updating order status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating order status',
                error: error.message
            });
        }
    },

    // Update payment status
    updatePaymentStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;

            const now = new Date();

            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE orders 
                     SET payment_status = ?, 
                         payment_date = CASE WHEN ? = 'completed' AND payment_status != 'completed' THEN NOW() ELSE payment_date END,
                         updated_at = NOW() 
                     WHERE id = ? AND deleted_at IS NULL`,
                    [payment_status, payment_status, id],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            // Also update payment record if exists
            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE payments 
                     SET status = ?,
                         updated_at = NOW()
                     WHERE order_id = ?`,
                    [payment_status, id],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            res.json({
                success: true,
                message: 'Payment status updated successfully'
            });

        } catch (error) {
            console.error('❌ Error updating payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating payment status',
                error: error.message
            });
        }
    },

    // Add tracking
    addTracking: async (req, res) => {
        try {
            const { id } = req.params;
            const { tracking_number, courier_name, courier_website } = req.body;

            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE orders 
                     SET tracking_number = ?, 
                         courier_name = ?, 
                         courier_website = ?,
                         updated_at = NOW() 
                     WHERE id = ? AND deleted_at IS NULL`,
                    [tracking_number, courier_name, courier_website, id],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            res.json({
                success: true,
                message: 'Tracking information added successfully'
            });

        } catch (error) {
            console.error('❌ Error adding tracking:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding tracking',
                error: error.message
            });
        }
    },

    // Handle return request
    updateReturnStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, rejection_reason } = req.body;
            const userId = req.user?.id || 1;

            const now = new Date();

            let updateFields = ['status = ?', 'updated_at = ?'];
            let updateParams = [status, now];

            if (status === 'approved') {
                updateFields.push('approved_at = ?');
                updateParams.push(now);
            } else if (status === 'rejected') {
                updateFields.push('rejected_at = ?', 'rejection_reason = ?');
                updateParams.push(now, rejection_reason);
            } else if (status === 'completed') {
                updateFields.push('completed_at = ?');
                updateParams.push(now);
            }

            updateParams.push(id);

            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE order_returns SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateParams,
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            // If return is approved/completed, update order status
            if (status === 'approved' || status === 'completed') {
                await new Promise((resolve, reject) => {
                    db.query(
                        `UPDATE orders SET order_status = 'returned', updated_at = NOW() WHERE id = (SELECT order_id FROM order_returns WHERE id = ?)`,
                        [id],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
            }

            res.json({
                success: true,
                message: `Return request ${status} successfully`
            });

        } catch (error) {
            console.error('❌ Error updating return status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating return status',
                error: error.message
            });
        }
    },

    // Get all return requests
    getReturns: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const status = req.query.status || '';

            let query = `
                SELECT r.*, 
                       o.order_number, 
                       o.user_id,
                       u.name as user_name,
                       u.email as user_email
                FROM order_returns r
                JOIN orders o ON r.order_id = o.id
                JOIN users u ON r.user_id = u.id
                WHERE 1=1
            `;

            let countQuery = `SELECT COUNT(*) as total FROM order_returns WHERE 1=1`;
            let params = [];

            if (status) {
                query += ` AND r.status = ?`;
                countQuery += ` AND status = ?`;
                params.push(status);
            }

            query += ` ORDER BY r.requested_at DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const countResult = await new Promise((resolve, reject) => {
                db.query(countQuery, status ? [status] : [], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const returns = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const total = countResult[0]?.total || 0;

            res.json({
                success: true,
                data: {
                    returns: returns || [],
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error fetching returns:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching returns',
                error: error.message
            });
        }
    },

    // Export orders
    exportOrders: async (req, res) => {
        try {
            const { status, payment_status, date_from, date_to } = req.query;

            let query = `
                SELECT o.*, u.name as user_name, u.email as user_email
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.deleted_at IS NULL
            `;
            let params = [];

            if (status) {
                query += ` AND o.order_status = ?`;
                params.push(status);
            }
            if (payment_status) {
                query += ` AND o.payment_status = ?`;
                params.push(payment_status);
            }
            if (date_from) {
                query += ` AND DATE(o.order_date) >= ?`;
                params.push(date_from);
            }
            if (date_to) {
                query += ` AND DATE(o.order_date) <= ?`;
                params.push(date_to);
            }

            query += ` ORDER BY o.order_date DESC`;

            const orders = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('❌ Error exporting orders:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting orders',
                error: error.message
            });
        }
    }
};

module.exports = orderController;