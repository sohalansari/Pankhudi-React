const db = require('../config/db');

const Order = {
    // Get all orders (admin)
    getAll: (filters = {}, callback) => {
        const { page = 1, limit = 20, status, search } = filters;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE o.deleted_at IS NULL';
        const params = [];

        if (status) {
            whereClause += ' AND o.order_status = ?';
            params.push(status);
        }
        if (search) {
            whereClause += ' AND (o.order_number LIKE ? OR u.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const countQuery = `
      SELECT COUNT(*) as total FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ${whereClause}
    `;

        const ordersQuery = `
      SELECT 
        o.*, 
        u.name as user_name, 
        u.email as user_email, 
        u.phone as user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
        params.push(parseInt(limit), offset);

        db.query(countQuery, params.slice(0, -2), (err, countResult) => {
            if (err) return callback(err, null);
            db.query(ordersQuery, params, (err, orders) => {
                if (err) return callback(err, null);
                callback(null, orders, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                });
            });
        });
    },

    // Get order details with items
    getById: (id, callback) => {
        const query = `
      SELECT 
        o.*, 
        u.name as user_name, u.email, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.deleted_at IS NULL
    `;
        db.query(query, [id], (err, orderResults) => {
            if (err || orderResults.length === 0) return callback(err || new Error('Order not found'), null);

            const order = orderResults[0];

            // Get order items
            db.query(`
        SELECT 
          product_id, product_name, product_image, sku, 
          quantity, price, discount_percent, final_price, 
          size, color, shipping_cost, free_shipping, tax_rate, tax_amount
        FROM order_items 
        WHERE order_id = ?
      `, [id], (err, items) => {
                if (err) return callback(err, null);
                order.items = items;
                callback(null, order);
            });
        });
    },

    // Update order status
    updateStatus: (id, status, notes, callback) => {
        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) {
            return callback(new Error('Invalid status'), null);
        }

        let query = 'UPDATE orders SET order_status = ?, updated_at = NOW()';
        let params = [status];

        if (notes) {
            query += ', admin_notes = ?';
            params.push(notes);
        }
        query += ' WHERE id = ? AND deleted_at IS NULL';
        params.push(id);

        db.query(query, params, callback);
    },

    // Get recent orders (dashboard)
    getRecent: (limit = 10, callback) => {
        const query = `
      SELECT o.id, o.order_number, o.total_amount, o.order_status, 
             o.created_at, u.name as customer_name, u.phone
      FROM orders o JOIN users u ON o.user_id = u.id
      WHERE o.deleted_at IS NULL
      ORDER BY o.created_at DESC LIMIT ?
    `;
        db.query(query, [limit], callback);
    }
};

module.exports = Order;

