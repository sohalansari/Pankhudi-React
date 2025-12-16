const db = require('../config/db');

// Get all sub-sub-categories with parent info
exports.getAllSubSubCategories = (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sub_category_id = '',
            sortBy = 'ssc.id',
            sortOrder = 'DESC'
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = `
            SELECT ssc.*, 
                   sc.name as sub_category_name,
                   sc.id as sub_category_id,
                   c.name as category_name,
                   c.id as category_id
            FROM sub_sub_categories ssc
            LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id
            LEFT JOIN categories c ON sc.category_id = c.id
            WHERE 1=1
        `;
        let countQuery = `SELECT COUNT(*) as total FROM sub_sub_categories ssc WHERE 1=1`;
        const params = [];
        const countParams = [];

        // Search filter
        if (search) {
            query += ` AND (ssc.name LIKE ? OR ssc.description LIKE ?)`;
            countQuery += ` AND (ssc.name LIKE ? OR ssc.description LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Status filter
        if (status && status !== 'all') {
            query += ` AND ssc.status = ?`;
            countQuery += ` AND ssc.status = ?`;
            params.push(status);
            countParams.push(status);
        }

        // Sub-category filter
        if (sub_category_id && sub_category_id !== 'all') {
            query += ` AND ssc.sub_category_id = ?`;
            countQuery += ` AND ssc.sub_category_id = ?`;
            params.push(sub_category_id);
            countParams.push(sub_category_id);
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

// Get single sub-sub-category by ID
exports.getSubSubCategoryById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT ssc.*, 
                sc.name as sub_category_name,
                c.name as category_name
         FROM sub_sub_categories ssc
         LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id
         LEFT JOIN categories c ON sc.category_id = c.id
         WHERE ssc.id = ?`,
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
                    message: 'Sub-sub-category not found'
                });
            }

            res.json({
                success: true,
                data: results[0]
            });
        }
    );
};

// Create new sub-sub-category
exports.createSubSubCategory = (req, res) => {
    const { name, description, sub_category_id, status = 'active' } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Sub-sub-category name is required'
        });
    }

    if (!sub_category_id) {
        return res.status(400).json({
            success: false,
            message: 'Sub-category ID is required'
        });
    }

    // Check if sub-category exists
    db.query('SELECT id FROM sub_categories WHERE id = ?', [sub_category_id], (subCatErr, subCatResults) => {
        if (subCatErr) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (subCatResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent sub-category not found'
            });
        }

        // Create sub-sub-category
        db.query(
            'INSERT INTO sub_sub_categories (name, description, sub_category_id, status) VALUES (?, ?, ?, ?)',
            [name, description || '', sub_category_id, status],
            (err, result) => {
                if (err) {
                    console.error('Create error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create sub-sub-category'
                    });
                }

                // Fetch the created sub-sub-category with parent info
                db.query(
                    `SELECT ssc.*, 
                            sc.name as sub_category_name,
                            c.name as category_name
                     FROM sub_sub_categories ssc
                     LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id
                     LEFT JOIN categories c ON sc.category_id = c.id
                     WHERE ssc.id = ?`,
                    [result.insertId],
                    (err2, results) => {
                        if (err2) {
                            return res.status(500).json({
                                success: false,
                                message: 'Sub-sub-category created but failed to fetch details'
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: 'Sub-sub-category created successfully',
                            data: results[0]
                        });
                    }
                );
            }
        );
    });
};

// Update sub-sub-category
exports.updateSubSubCategory = (req, res) => {
    const { id } = req.params;
    const { name, description, sub_category_id, status } = req.body;

    db.query(
        'UPDATE sub_sub_categories SET name = ?, description = ?, sub_category_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || '', sub_category_id, status, id],
        (err, result) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update sub-sub-category'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-sub-category not found'
                });
            }

            // Fetch updated sub-sub-category with parent info
            db.query(
                `SELECT ssc.*, 
                        sc.name as sub_category_name,
                        c.name as category_name
                 FROM sub_sub_categories ssc
                 LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id
                 LEFT JOIN categories c ON sc.category_id = c.id
                 WHERE ssc.id = ?`,
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
                        message: 'Sub-sub-category updated successfully',
                        data: results[0]
                    });
                }
            );
        }
    );
};

// Delete sub-sub-category
exports.deleteSubSubCategory = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM sub_sub_categories WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete sub-sub-category'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sub-sub-category not found'
            });
        }

        res.json({
            success: true,
            message: 'Sub-sub-category deleted successfully'
        });
    });
};

// Update sub-sub-category status
exports.updateSubSubCategoryStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'draft'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
    }

    db.query(
        'UPDATE sub_sub_categories SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
                    message: 'Sub-sub-category not found'
                });
            }

            res.json({
                success: true,
                message: 'Status updated successfully'
            });
        }
    );
};

// Get all sub-sub-categories for dropdown
exports.getAllSubSubCategoriesForDropdown = (req, res) => {
    let { sub_category_id } = req.query;

    let query = `
        SELECT ssc.id, ssc.name, ssc.sub_category_id, sc.name as sub_category_name
        FROM sub_sub_categories ssc
        LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id
        WHERE ssc.status = "active"
    `;
    const params = [];

    if (sub_category_id) {
        query += ` AND ssc.sub_category_id = ?`;
        params.push(sub_category_id);
    }

    query += ` ORDER BY ssc.name`;

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