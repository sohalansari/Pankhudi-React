const db = require('../config/db');

// Get all sub-categories with parent category info
exports.getAllSubCategories = (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            category_id = '',
            sortBy = 'sc.id',
            sortOrder = 'DESC'
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = `
            SELECT sc.*, 
                   c.name as category_name,
                   c.id as category_id,
                   (SELECT COUNT(*) FROM sub_sub_categories ssc WHERE ssc.sub_category_id = sc.id) as sub_sub_category_count
            FROM sub_categories sc
            LEFT JOIN categories c ON sc.category_id = c.id
            WHERE 1=1
        `;
        let countQuery = `SELECT COUNT(*) as total FROM sub_categories sc WHERE 1=1`;
        const params = [];
        const countParams = [];

        // Search filter
        if (search) {
            query += ` AND (sc.name LIKE ? OR sc.description LIKE ?)`;
            countQuery += ` AND (sc.name LIKE ? OR sc.description LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Status filter
        if (status && status !== 'all') {
            query += ` AND sc.status = ?`;
            countQuery += ` AND sc.status = ?`;
            params.push(status);
            countParams.push(status);
        }

        // Category filter
        if (category_id && category_id !== 'all') {
            query += ` AND sc.category_id = ?`;
            countQuery += ` AND sc.category_id = ?`;
            params.push(category_id);
            countParams.push(category_id);
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

// Get single sub-category by ID
exports.getSubCategoryById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT sc.*, c.name as category_name 
         FROM sub_categories sc 
         LEFT JOIN categories c ON sc.category_id = c.id 
         WHERE sc.id = ?`,
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-category not found'
                });
            }

            res.json({
                success: true,
                data: results[0]
            });
        }
    );
};

// Create new sub-category
exports.createSubCategory = (req, res) => {
    const { name, description, category_id, status = 'active' } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Sub-category name is required'
        });
    }

    if (!category_id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

    // Check if category exists
    db.query('SELECT id FROM categories WHERE id = ?', [category_id], (catErr, catResults) => {
        if (catErr) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (catResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent category not found'
            });
        }

        // Create sub-category
        db.query(
            'INSERT INTO sub_categories (name, description, category_id, status) VALUES (?, ?, ?, ?)',
            [name, description || '', category_id, status],
            (err, result) => {
                if (err) {
                    console.error('Create error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create sub-category'
                    });
                }

                // Fetch the created sub-category with category name
                db.query(
                    `SELECT sc.*, c.name as category_name 
                     FROM sub_categories sc 
                     LEFT JOIN categories c ON sc.category_id = c.id 
                     WHERE sc.id = ?`,
                    [result.insertId],
                    (err2, results) => {
                        if (err2) {
                            return res.status(500).json({
                                success: false,
                                message: 'Sub-category created but failed to fetch details'
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: 'Sub-category created successfully',
                            data: results[0]
                        });
                    }
                );
            }
        );
    });
};

// Update sub-category
exports.updateSubCategory = (req, res) => {
    const { id } = req.params;
    const { name, description, category_id, status } = req.body;

    db.query(
        'UPDATE sub_categories SET name = ?, description = ?, category_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || '', category_id, status, id],
        (err, result) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update sub-category'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-category not found'
                });
            }

            // Fetch updated sub-category with category name
            db.query(
                `SELECT sc.*, c.name as category_name 
                 FROM sub_categories sc 
                 LEFT JOIN categories c ON sc.category_id = c.id 
                 WHERE sc.id = ?`,
                [id],
                (err2, results) => {
                    if (err2) {
                        return res.status(500).json({
                            success: false,
                            message: 'Updated but failed to fetch details'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Sub-category updated successfully',
                        data: results[0]
                    });
                }
            );
        }
    );
};

// Delete sub-category
exports.deleteSubCategory = (req, res) => {
    const { id } = req.params;

    // First check if sub-category has sub-sub-categories
    db.query('SELECT COUNT(*) as count FROM sub_sub_categories WHERE sub_category_id = ?', [id], (checkErr, checkResult) => {
        if (checkErr) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (checkResult[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete sub-category. It has sub-sub-categories. Delete them first.'
            });
        }

        // Delete sub-category
        db.query('DELETE FROM sub_categories WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete sub-category'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-category not found'
                });
            }

            res.json({
                success: true,
                message: 'Sub-category deleted successfully'
            });
        });
    });
};

// Update sub-category status
exports.updateSubCategoryStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'draft'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
    }

    db.query(
        'UPDATE sub_categories SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
                    message: 'Sub-category not found'
                });
            }

            res.json({
                success: true,
                message: 'Status updated successfully'
            });
        }
    );
};

// Get all sub-categories for dropdown
exports.getAllSubCategoriesForDropdown = (req, res) => {
    let { category_id } = req.query;

    let query = `
        SELECT sc.id, sc.name, sc.category_id, c.name as category_name
        FROM sub_categories sc
        LEFT JOIN categories c ON sc.category_id = c.id
        WHERE sc.status = "active"
    `;
    const params = [];

    if (category_id) {
        query += ` AND sc.category_id = ?`;
        params.push(category_id);
    }

    query += ` ORDER BY sc.name`;

    db.query(query, params, (err, results) => {
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
    });
};