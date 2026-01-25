// backend > src > controllers > subCategoryController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Helper function to delete image file
const deleteImageFile = (imagePath) => {
    if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error('Error deleting subcategory image:', err);
                } else {
                    console.log(`🗑️ Deleted subcategory image: ${fullPath}`);
                }
            });
        }
    }
};

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

// Create new sub-category with image upload
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

    let imageUrl = '';
    if (req.file) {
        if (req.file.error) {
            return res.status(400).json({
                success: false,
                message: req.file.error
            });
        }
        imageUrl = req.file.path;
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
            'INSERT INTO sub_categories (name, description, category_id, status, image) VALUES (?, ?, ?, ?, ?)',
            [name, description || '', category_id, status, imageUrl],
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

    // First get old image path
    db.query('SELECT image FROM sub_categories WHERE id = ?', [id], (selectErr, selectResult) => {
        if (selectErr) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        const oldImagePath = selectResult[0]?.image;

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

                // If image is being removed (empty string sent), delete old image
                if (req.body.image === '' && oldImagePath) {
                    deleteImageFile(oldImagePath);
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
    });
};

// Update sub-category image only
exports.updateSubCategoryImage = (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image file uploaded'
        });
    }

    if (req.file.error) {
        return res.status(400).json({
            success: false,
            message: req.file.error
        });
    }

    const imageUrl = req.file.path;

    db.query(
        'UPDATE sub_categories SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [imageUrl, id],
        (err, result) => {
            if (err) {
                console.error('Image update error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update image'
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
                message: 'Sub-category image updated successfully',
                data: {
                    imageUrl: imageUrl
                }
            });
        }
    );
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

// Delete sub-category
exports.deleteSubCategory = (req, res) => {
    const { id } = req.params;

    // First get sub-category image path
    db.query('SELECT image FROM sub_categories WHERE id = ?', [id], (imgErr, imgResult) => {
        if (imgErr) {
            console.error('Image fetch error:', imgErr);
        }

        const imagePath = imgResult[0]?.image;

        // Check if sub-category has sub-sub-categories
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

                // Delete associated image file
                if (imagePath) {
                    deleteImageFile(imagePath);
                }

                res.json({
                    success: true,
                    message: 'Sub-category deleted successfully'
                });
            });
        });
    });
};

// Get all sub-categories for dropdown
exports.getAllSubCategoriesForDropdown = (req, res) => {
    let { category_id } = req.query;
    const showAll = req.query.all === 'true' || req.query.all === '1';

    let query = `
        SELECT sc.id, sc.name, sc.category_id, c.name as category_name
        FROM sub_categories sc
        LEFT JOIN categories c ON sc.category_id = c.id
    `;
    const params = [];

    if (!showAll) {
        query += ` WHERE sc.status = "active"`;
    }

    if (category_id) {
        if (showAll) {
            query += ` WHERE sc.category_id = ?`;
        } else {
            query += ` AND sc.category_id = ?`;
        }
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

// Get sub-categories by category ID
exports.getSubCategoriesByCategory = (req, res) => {
    const { categoryId } = req.params;
    const showAll = req.query.all === 'true' || req.query.all === '1';

    let query = `
        SELECT sc.id, sc.name, sc.description, sc.image, sc.status, sc.created_at
        FROM sub_categories sc
        WHERE sc.category_id = ?
    `;
    const params = [categoryId];

    if (!showAll) {
        query += ` AND sc.status = "active"`;
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

// Get sub-category statistics
exports.getSubCategoryStats = (req, res) => {
    const queries = `
        SELECT COUNT(*) as total_sub_categories FROM sub_categories;
        SELECT status, COUNT(*) as count FROM sub_categories GROUP BY status;
        SELECT COUNT(*) as active_sub_categories FROM sub_categories WHERE status = 'active';
        SELECT COUNT(*) as inactive_sub_categories FROM sub_categories WHERE status = 'inactive';
        SELECT name as latest_sub_category FROM sub_categories ORDER BY created_at DESC LIMIT 1;
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
            total_sub_categories: results[0][0].total_sub_categories,
            status_distribution: results[1],
            active_sub_categories: results[2][0].active_sub_categories,
            inactive_sub_categories: results[3][0].inactive_sub_categories,
            latest_sub_category: results[4][0]?.latest_sub_category || 'None'
        };

        res.json({
            success: true,
            data: stats
        });
    });
};

// Get all sub-categories list
exports.getAllSubCategoriesList = (req, res) => {
    const showAll = req.query.all === 'true' || req.query.all === '1';

    let query = `
        SELECT sc.id, sc.name, sc.category_id, sc.image, c.name as category_name
        FROM sub_categories sc
        LEFT JOIN categories c ON sc.category_id = c.id
    `;
    if (!showAll) {
        query += ' WHERE sc.status = "active"';
    }
    query += ' ORDER BY sc.name';

    db.query(query, (err, results) => {
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