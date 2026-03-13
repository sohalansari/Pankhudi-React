const db = require('../config/db');

const Product = {
    // Get all products (admin view)
    getAll: (filters = {}, callback) => {
        const {
            page = 1, limit = 20, category_id, sub_category_id, sub_sub_category_id,
            stock_status, search, status
        } = filters;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE p.status = ?';
        const params = ['Active'];

        if (category_id) {
            whereClause += ' AND p.category_id = ?';
            params.push(category_id);
        }
        if (sub_category_id) {
            whereClause += ' AND p.sub_category_id = ?';
            params.push(sub_category_id);
        }
        if (sub_sub_category_id) {
            whereClause += ' AND p.sub_sub_category_id = ?';
            params.push(sub_sub_category_id);
        }
        if (search) {
            whereClause += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status) {
            whereClause += ' AND p.status = ?';
            params.push(status);
        }
        if (stock_status === 'low_stock') {
            whereClause += ' AND p.stock <= p.low_stock_threshold AND p.stock > 0';
        } else if (stock_status === 'out_of_stock') {
            whereClause += ' AND p.stock <= 0';
        }

        const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
        const productsQuery = `
      SELECT p.*, 
        c.name as category_name,
        sc.name as sub_category_name, 
        ssc.name as sub_sub_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
        params.push(parseInt(limit), offset);

        db.query(countQuery, params.slice(0, -2), (err, countResult) => {
            if (err) return callback(err, null);
            db.query(productsQuery, params, (err, products) => {
                if (err) return callback(err, null);

                // Parse JSON fields
                const parsedProducts = products.map(p => ({
                    ...p,
                    images: p.images ? JSON.parse(p.images) : [],
                    sizes: p.sizes ? JSON.parse(p.sizes) : [],
                    colors: p.colors ? JSON.parse(p.colors) : [],
                    features: p.features ? JSON.parse(p.features) : [],
                    tags: p.tags ? JSON.parse(p.tags) : []
                }));

                callback(null, parsedProducts, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                });
            });
        });
    },

    // Get single product
    getById: (id, callback) => {
        const query = `
      SELECT p.*, 
        c.name as category_name,
        sc.name as sub_category_name, 
        ssc.name as sub_sub_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
      WHERE p.id = ?
    `;
        db.query(query, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, null);

            const product = results[0];
            product.images = product.images ? JSON.parse(product.images) : [];
            product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
            product.colors = product.colors ? JSON.parse(product.colors) : [];
            product.features = product.features ? JSON.parse(product.features) : [];
            product.tags = product.tags ? JSON.parse(product.tags) : [];

            callback(null, product);
        });
    },

    // Create product (admin)
    create: (productData, callback) => {
        const {
            sku, name, slug, description, short_description, price, discount, stock,
            low_stock_threshold, category_id, sub_category_id, sub_sub_category_id,
            brand, sizes, colors, material, weight, dimensions, warranty, features,
            tags, status = 'Active'
        } = productData;

        const query = `
      INSERT INTO products (
        sku, name, slug, description, short_description, price, discount, stock,
        low_stock_threshold, category_id, sub_category_id, sub_sub_category_id,
        brand, sizes, colors, material, weight, dimensions, warranty, features,
        tags, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

        const params = [
            sku, name, slug, description, short_description, price, discount, stock,
            low_stock_threshold, category_id, sub_category_id, sub_sub_category_id,
            brand, JSON.stringify(sizes || []), JSON.stringify(colors || []), material,
            weight, dimensions, warranty, JSON.stringify(features || []), JSON.stringify(tags || []),
            status
        ];

        db.query(query, params, (err, result) => {
            if (err) return callback(err, null);
            Product.getById(result.insertId, callback);
        });
    },

    // Update product
    update: (id, productData, callback) => {
        const updates = [];
        const params = [];

        Object.keys(productData).forEach(key => {
            if (['sizes', 'colors', 'features', 'tags'].includes(key)) {
                updates.push(`${key} = ?`);
                params.push(JSON.stringify(productData[key]));
            } else {
                updates.push(`${key} = ?`);
                params.push(productData[key]);
            }
        });

        const query = `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
        params.push(id);

        db.query(query, params, (err, result) => {
            if (err) return callback(err, null);
            Product.getById(id, callback);
        });
    },

    // Delete/Soft delete
    delete: (id, callback) => {
        const query = 'UPDATE products SET status = "Inactive" WHERE id = ?';
        db.query(query, [id], callback);
    },

    // Low stock products
    getLowStock: (callback) => {
        const query = 'SELECT * FROM products WHERE stock <= low_stock_threshold AND stock > 0';
        db.query(query, callback);
    }
};

module.exports = Product;

