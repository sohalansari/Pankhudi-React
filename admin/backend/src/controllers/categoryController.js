const db = require('../config/db');

// Get all categories with pagination and filters
exports.getAllCategories = (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sortBy = 'id',
            sortOrder = 'DESC'
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = `
            SELECT c.*, 
                (SELECT COUNT(*) FROM sub_categories sc WHERE sc.category_id = c.id) as sub_category_count,
                (SELECT COUNT(*) FROM sub_sub_categories ssc WHERE ssc.sub_category_id IN 
                    (SELECT id FROM sub_categories WHERE category_id = c.id)) as sub_sub_category_count
            FROM categories c 
            WHERE 1=1
        `;
        let countQuery = `SELECT COUNT(*) as total FROM categories WHERE 1=1`;
        const params = [];
        const countParams = [];

        // Search filter
        if (search) {
            query += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
            countQuery += ` AND (name LIKE ? OR description LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Status filter
        if (status && status !== 'all') {
            query += ` AND c.status = ?`;
            countQuery += ` AND status = ?`;
            params.push(status);
            countParams.push(status);
        }

        // Sorting
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        // Pagination
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute count query
        db.query(countQuery, countParams, (countErr, countResult) => {
            if (countErr) {
                console.error('Count query error:', countErr);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            // Execute main query
            db.query(query, params, (err, results) => {
                if (err) {
                    console.error('Main query error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                res.json({
                    success: true,
                    data: results,
                    pagination: {
                        currentPage: page,
                        itemsPerPage: limit,
                        totalItems,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                });
            });
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get single category by ID
exports.getCategoryById = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM categories WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Create new category
exports.createCategory = (req, res) => {
    const { name, description, status = 'active' } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Category name is required'
        });
    }

    db.query(
        'INSERT INTO categories (name, description, status) VALUES (?, ?, ?)',
        [name, description || '', status],
        (err, result) => {
            if (err) {
                console.error('Create error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create category'
                });
            }

            // Fetch the created category
            db.query('SELECT * FROM categories WHERE id = ?', [result.insertId], (err2, results) => {
                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: 'Category created but failed to fetch details'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Category created successfully',
                    data: results[0]
                });
            });
        }
    );
};

// Update category
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;

    db.query(
        'UPDATE categories SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || '', status, id],
        (err, result) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update category'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Fetch updated category
            db.query('SELECT * FROM categories WHERE id = ?', [id], (err2, results) => {
                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: 'Updated but failed to fetch details'
                    });
                }

                res.json({
                    success: true,
                    message: 'Category updated successfully',
                    data: results[0]
                });
            });
        }
    );
};

// Delete category
exports.deleteCategory = (req, res) => {
    const { id } = req.params;

    // First check if category has subcategories
    db.query('SELECT COUNT(*) as count FROM sub_categories WHERE category_id = ?', [id], (checkErr, checkResult) => {
        if (checkErr) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (checkResult[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category. It has subcategories. Delete subcategories first.'
            });
        }

        // Delete category
        db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete category'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        });
    });
};

// Update category status
exports.updateCategoryStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'draft'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
    }

    db.query(
        'UPDATE categories SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Status update error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update status'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            res.json({
                success: true,
                message: 'Status updated successfully'
            });
        }
    );
};

// Get all categories for dropdown (active only)
exports.getAllCategoriesForDropdown = (req, res) => {
    db.query(
        'SELECT id, name FROM categories WHERE status = "active" ORDER BY name',
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            res.json({
                success: true,
                data: results
            });
        }
    );
};

// Get category statistics
exports.getCategoryStats = (req, res) => {
    const queries = `
        SELECT COUNT(*) as total_categories FROM categories;
        SELECT COUNT(*) as total_sub_categories FROM sub_categories;
        SELECT COUNT(*) as total_sub_sub_categories FROM sub_sub_categories;
        SELECT status, COUNT(*) as count FROM categories GROUP BY status;
        SELECT COUNT(*) as active_categories FROM categories WHERE status = 'active';
        SELECT COUNT(*) as inactive_categories FROM categories WHERE status = 'inactive';
    `;

    db.query(queries, (err, results) => {
        if (err) {
            console.error('Stats error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics'
            });
        }

        const stats = {
            total_categories: results[0][0].total_categories,
            total_sub_categories: results[1][0].total_sub_categories,
            total_sub_sub_categories: results[2][0].total_sub_sub_categories,
            status_distribution: results[3],
            active_categories: results[4][0].active_categories,
            inactive_categories: results[5][0].inactive_categories
        };

        res.json({
            success: true,
            data: stats
        });
    });
};