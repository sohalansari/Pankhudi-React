const db = require('../config/db');

const PromoCode = {
    // Get all promo codes (admin)
    getAll: (filters = {}, callback) => {
        const { page = 1, limit = 20, active, search } = filters;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (active !== undefined) {
            whereClause += ' AND is_active = ?';
            params.push(active === true ? 1 : 0);
        }
        if (search) {
            whereClause += ' AND (code LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM promo_codes ${whereClause}`;
        const promosQuery = `
      SELECT pc.*, 
        (SELECT COUNT(*) FROM promo_code_usage pcu WHERE pcu.promo_code_id = pc.id) as usage_count,
        (SELECT COUNT(DISTINCT user_id) FROM promo_code_usage pcu WHERE pcu.promo_code_id = pc.id) as unique_users
      FROM promo_codes pc
      ${whereClause}
      ORDER BY pc.created_at DESC
      LIMIT ? OFFSET ?
    `;
        params.push(parseInt(limit), offset);

        db.query(countQuery, params.slice(0, -2), (err, countResult) => {
            if (err) return callback(err, null);
            db.query(promosQuery, params, (err, promos) => {
                if (err) return callback(err, null);
                callback(null, promos, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                });
            });
        });
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM promo_codes WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err || results.length === 0) return callback(err || new Error('Promo code not found'), null);
            callback(null, results[0]);
        });
    },

    create: (promoData, callback) => {
        const {
            code, description, discount_type, discount_value, min_order_amount,
            max_discount_amount, usage_limit, per_user_limit, start_date, end_date, is_active
        } = promoData;

        const query = 'INSERT INTO promo_codes SET ?';
        const data = {
            code, description, discount_type, discount_value, min_order_amount,
            max_discount_amount, usage_limit, per_user_limit: per_user_limit || 1,
            start_date, end_date, is_active: is_active ? 1 : 0
        };

        db.query(query, data, (err, result) => {
            if (err) return callback(err, null);
            PromoCode.getById(result.insertId, callback);
        });
    },

    update: (id, promoData, callback) => {
        const updates = { ...promoData };
        updates.is_active = updates.is_active ? 1 : 0;

        const query = 'UPDATE promo_codes SET ?, updated_at = NOW() WHERE id = ?';
        db.query(query, [updates, id], (err, result) => {
            if (err) return callback(err, null);
            PromoCode.getById(id, callback);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM promo_codes WHERE id = ?';
        db.query(query, [id], callback);
    },

    toggleActive: (id, callback) => {
        const query = `
      UPDATE promo_codes 
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = ?
    `;
        db.query(query, [id], (err, result) => {
            if (err) return callback(err, null);
            PromoCode.getById(id, callback);
        });
    }
};

module.exports = PromoCode;

