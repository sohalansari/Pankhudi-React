const db = require('../config/db');

const Payment = {
    // Get all payments/transactions (admin)
    getAll: (filters = {}, callback) => {
        const { page = 1, limit = 20, status, payment_method, start_date, end_date } = filters;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (status) {
            whereClause += ' AND pt.status = ?';
            params.push(status);
        }
        if (payment_method) {
            whereClause += ' AND pt.payment_method = ?';
            params.push(payment_method);
        }
        if (start_date) {
            whereClause += ' AND pt.created_at >= ?';
            params.push(start_date);
        }
        if (end_date) {
            whereClause += ' AND pt.created_at <= ?';
            params.push(end_date);
        }

        const countQuery = `
      SELECT COUNT(*) as total FROM payment_transactions pt
      JOIN orders o ON pt.order_id = o.id
      JOIN users u ON pt.user_id = u.id
      ${whereClause}
    `;

        const paymentsQuery = `
      SELECT pt.*, o.order_number, u.name as user_name, u.email
      FROM payment_transactions pt
      JOIN orders o ON pt.order_id = o.id
      JOIN users u ON pt.user_id = u.id
      ${whereClause}
      ORDER BY pt.created_at DESC
      LIMIT ? OFFSET ?
    `;
        params.push(parseInt(limit), offset);

        db.query(countQuery, params.slice(0, -2), (err, countResult) => {
            if (err) return callback(err, null);
            db.query(paymentsQuery, params, (err, payments) => {
                if (err) return callback(err, null);
                callback(null, payments, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                });
            });
        });
    },

    getById: (id, callback) => {
        const query = `
      SELECT pt.*, o.order_number, u.name as user_name
      FROM payment_transactions pt
      JOIN orders o ON pt.order_id = o.id
      JOIN users u ON pt.user_id = u.id
      WHERE pt.id = ?
    `;
        db.query(query, [id], callback);
    },

    // Payment stats
    getStats: (callback) => {
        const statsQuery = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_success_amount,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
      FROM payment_transactions
    `;
        db.query(statsQuery, callback);
    },

    updateStatus: (id, status, callback) => {
        const query = 'UPDATE payment_transactions SET status = ?, updated_at = NOW() WHERE id = ?';
        db.query(query, [status, id], callback);
    }
};

module.exports = Payment;

