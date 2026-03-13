const db = require('../config/db');

const Category = {
    // Get all categories (with subcats)
    getAll: (callback) => {
        const query = `
      SELECT c.*, COUNT(sc.id) as sub_categories_count
      FROM categories c
      LEFT JOIN sub_categories sc ON c.id = sc.category_id AND sc.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.name
    `;
        db.query(query, callback);
    },

    // Get single category with hierarchy
    getById: (id, callback) => {
        const queries = [
            // Category
            `SELECT * FROM categories WHERE id = ? AND status = 'active'`,
            // Sub categories
            `SELECT * FROM sub_categories WHERE category_id = ? AND status = 'active' ORDER BY name`,
            // Sub-sub categories (count)
            `SELECT sc.*, ssc_count FROM sub_categories sc 
       LEFT JOIN (SELECT sub_category_id, COUNT(*) as ssc_count 
                  FROM sub_sub_categories WHERE status = 'active' GROUP BY sub_category_id) ssc 
       ON sc.id = ssc.sub_category_id 
       WHERE sc.category_id = ? AND sc.status = 'active' ORDER BY sc.name`
        ];

        db.query(queries[0], [id], (err, category) => {
            if (err || !category.length) return callback(err || new Error('Category not found'), null);

            db.query(queries[1], [id], (err, subCats) => {
                if (err) return callback(err, null);

                db.query(queries[2], [id], (err, subSubCats) => {
                    if (err) return callback(err, null);

                    const result = {
                        category: category[0],
                        sub_categories: subCats,
                        sub_sub_categories: subSubCats
                    };
                    callback(null, result);
                });
            });
        });
    },

    // Create category
    create: (data, callback) => {
        const { name, description, image, is_featured = 0 } = data;
        const query = 'INSERT INTO categories (name, description, image, is_featured, created_at) VALUES (?, ?, ?, ?, NOW())';
        db.query(query, [name, description, image, is_featured], (err, result) => {
            if (err) return callback(err, null);
            Category.getById(result.insertId, callback);
        });
    },

    // Update
    update: (id, data, callback) => {
        const fields = [];
        const params = [];

        Object.keys(data).forEach(key => {
            fields.push(`${key} = ?`);
            params.push(data[key]);
        });
        params.push(id);

        const query = `UPDATE categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        db.query(query, params, (err, result) => {
            if (err) return callback(err, null);
            Category.getById(id, callback);
        });
    },

    // Toggle status
    toggleStatus: (id, callback) => {
        const query = `
      UPDATE categories 
      SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END 
      WHERE id = ?
    `;
        db.query(query, [id], callback);
    }
};

module.exports = Category;

