// // backend > src > controllers > categoryController.js
// const db = require('../config/db');
// const path = require('path');
// const fs = require('fs');

// // ============ HELPER FUNCTION TO DELETE IMAGE ============
// const deleteImageFile = (imagePath) => {
//     if (imagePath && imagePath.startsWith('/uploads/')) {
//         const fullPath = path.join(__dirname, '..', imagePath);
//         if (fs.existsSync(fullPath)) {
//             fs.unlink(fullPath, (err) => {
//                 if (err) {
//                     console.error('Error deleting image file:', err);
//                 } else {
//                     console.log(`🗑️ Deleted image file: ${fullPath}`);
//                 }
//             });
//         }
//     }
// };

// // Get all categories with pagination and filters
// exports.getAllCategories = (req, res) => {
//     try {
//         let {
//             page = 1,
//             limit = 10,
//             search = '',
//             status = '',
//             sortBy = 'id',
//             sortOrder = 'DESC'
//         } = req.query;

//         page = parseInt(page);
//         limit = parseInt(limit);
//         const offset = (page - 1) * limit;

//         let query = `
//             SELECT c.*, 
//                 (SELECT COUNT(*) FROM sub_categories sc WHERE sc.category_id = c.id) as sub_category_count,
//                 (SELECT COUNT(*) FROM sub_sub_categories ssc WHERE ssc.sub_category_id IN 
//                     (SELECT id FROM sub_categories WHERE category_id = c.id)) as sub_sub_category_count
//             FROM categories c 
//             WHERE 1=1
//         `;
//         let countQuery = `SELECT COUNT(*) as total FROM categories WHERE 1=1`;
//         const params = [];
//         const countParams = [];

//         // Search filter
//         if (search) {
//             query += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
//             countQuery += ` AND (name LIKE ? OR description LIKE ?)`;
//             const searchTerm = `%${search}%`;
//             params.push(searchTerm, searchTerm);
//             countParams.push(searchTerm, searchTerm);
//         }

//         // Status filter
//         if (status && status !== 'all') {
//             query += ` AND c.status = ?`;
//             countQuery += ` AND status = ?`;
//             params.push(status);
//             countParams.push(status);
//         }

//         // Sorting
//         query += ` ORDER BY ${sortBy} ${sortOrder}`;

//         // Pagination
//         query += ` LIMIT ? OFFSET ?`;
//         params.push(limit, offset);

//         // Execute count query
//         db.query(countQuery, countParams, (countErr, countResult) => {
//             if (countErr) {
//                 console.error('Count query error:', countErr);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Database error'
//                 });
//             }

//             const totalItems = countResult[0].total;
//             const totalPages = Math.ceil(totalItems / limit);

//             // Execute main query
//             db.query(query, params, (err, results) => {
//                 if (err) {
//                     console.error('Main query error:', err);
//                     return res.status(500).json({
//                         success: false,
//                         message: 'Database error'
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     data: results,
//                     pagination: {
//                         currentPage: page,
//                         itemsPerPage: limit,
//                         totalItems,
//                         totalPages,
//                         hasNextPage: page < totalPages,
//                         hasPrevPage: page > 1
//                     }
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Controller error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// };

// // Get all categories for dropdown (active only)
// exports.getAllCategoriesForDropdown = (req, res) => {
//     db.query(
//         'SELECT id, name FROM categories WHERE status = "active" ORDER BY name',
//         (err, results) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Database error'
//                 });
//             }

//             res.json({
//                 success: true,
//                 data: results
//             });
//         }
//     );
// };

// // Get all active categories for dropdown
// exports.getAllCategoriesList = (req, res) => {
//     db.query(
//         'SELECT id, name FROM categories WHERE status = "active" ORDER BY name',
//         (err, results) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Database error'
//                 });
//             }

//             res.json({
//                 success: true,
//                 data: results
//             });
//         }
//     );
// };

// // Get category statistics
// exports.getCategoryStats = (req, res) => {
//     const queries = `
//         SELECT COUNT(*) as total_categories FROM categories;
//         SELECT COUNT(*) as total_sub_categories FROM sub_categories;
//         SELECT COUNT(*) as total_sub_sub_categories FROM sub_sub_categories;
//         SELECT status, COUNT(*) as count FROM categories GROUP BY status;
//         SELECT COUNT(*) as active_categories FROM categories WHERE status = 'active';
//         SELECT COUNT(*) as inactive_categories FROM categories WHERE status = 'inactive';
//     `;

//     db.query(queries, (err, results) => {
//         if (err) {
//             console.error('Stats error:', err);
//             return res.status(500).json({
//                 success: false,
//                 message: 'Failed to fetch statistics'
//             });
//         }

//         const stats = {
//             total_categories: results[0][0].total_categories,
//             total_sub_categories: results[1][0].total_sub_categories,
//             total_sub_sub_categories: results[2][0].total_sub_sub_categories,
//             status_distribution: results[3],
//             active_categories: results[4][0].active_categories,
//             inactive_categories: results[5][0].inactive_categories
//         };

//         res.json({
//             success: true,
//             data: stats
//         });
//     });
// };

// // Get single category by ID
// exports.getCategoryById = (req, res) => {
//     const { id } = req.params;

//     db.query('SELECT * FROM categories WHERE id = ?', [id], (err, results) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: 'Database error'
//             });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Category not found'
//             });
//         }

//         res.json({
//             success: true,
//             data: results[0]
//         });
//     });
// };

// // Create new category
// exports.createCategory = (req, res) => {
//     const { name, description, status = 'active' } = req.body;

//     if (!name) {
//         return res.status(400).json({
//             success: false,
//             message: 'Category name is required'
//         });
//     }

//     let imageUrl = '';
//     if (req.file) {
//         if (req.file.error) {
//             return res.status(400).json({
//                 success: false,
//                 message: req.file.error
//             });
//         }
//         imageUrl = req.file.path;
//     }

//     db.query(
//         'INSERT INTO categories (name, description, status, image) VALUES (?, ?, ?, ?)',
//         [name, description || '', status, imageUrl],
//         (err, result) => {
//             if (err) {
//                 console.error('Create error:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Failed to create category'
//                 });
//             }

//             // Fetch the created category
//             db.query('SELECT * FROM categories WHERE id = ?', [result.insertId], (err2, results) => {
//                 if (err2) {
//                     return res.status(500).json({
//                         success: false,
//                         message: 'Category created but failed to fetch details'
//                     });
//                 }

//                 res.status(201).json({
//                     success: true,
//                     message: 'Category created successfully',
//                     data: results[0]
//                 });
//             });
//         }
//     );
// };

// // Update category
// exports.updateCategory = (req, res) => {
//     const { id } = req.params;
//     const { name, description, status } = req.body;

//     // First get old image path
//     db.query('SELECT image FROM categories WHERE id = ?', [id], (selectErr, selectResult) => {
//         if (selectErr) {
//             return res.status(500).json({
//                 success: false,
//                 message: 'Database error'
//             });
//         }

//         const oldImagePath = selectResult[0]?.image;

//         db.query(
//             'UPDATE categories SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
//             [name, description || '', status, id],
//             (err, result) => {
//                 if (err) {
//                     console.error('Update error:', err);
//                     return res.status(500).json({
//                         success: false,
//                         message: 'Failed to update category'
//                     });
//                 }

//                 if (result.affectedRows === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: 'Category not found'
//                     });
//                 }

//                 // If image is being removed (empty string sent), delete old image
//                 if (req.body.image === '' && oldImagePath) {
//                     deleteImageFile(oldImagePath);
//                 }

//                 // Fetch updated category
//                 db.query('SELECT * FROM categories WHERE id = ?', [id], (err2, results) => {
//                     if (err2) {
//                         return res.status(500).json({
//                             success: false,
//                             message: 'Updated but failed to fetch details'
//                         });
//                     }

//                     res.json({
//                         success: true,
//                         message: 'Category updated successfully',
//                         data: results[0]
//                     });
//                 });
//             }
//         );
//     });
// };

// // Update category image only
// exports.updateCategoryImage = (req, res) => {
//     const { id } = req.params;

//     if (!req.file) {
//         return res.status(400).json({
//             success: false,
//             message: 'No image file uploaded'
//         });
//     }

//     if (req.file.error) {
//         return res.status(400).json({
//             success: false,
//             message: req.file.error
//         });
//     }

//     const imageUrl = req.file.path;

//     db.query(
//         'UPDATE categories SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
//         [imageUrl, id],
//         (err, result) => {
//             if (err) {
//                 console.error('Image update error:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Failed to update image'
//                 });
//             }

//             if (result.affectedRows === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Category not found'
//                 });
//             }

//             res.json({
//                 success: true,
//                 message: 'Category image updated successfully',
//                 data: {
//                     imageUrl: imageUrl
//                 }
//             });
//         }
//     );
// };

// // Update category status
// exports.updateCategoryStatus = (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!['active', 'inactive', 'draft'].includes(status)) {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid status value'
//         });
//     }

//     db.query(
//         'UPDATE categories SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
//         [status, id],
//         (err, result) => {
//             if (err) {
//                 console.error('Status update error:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Failed to update status'
//                 });
//             }

//             if (result.affectedRows === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Category not found'
//                 });
//             }

//             res.json({
//                 success: true,
//                 message: 'Status updated successfully'
//             });
//         }
//     );
// };

// // Delete category
// exports.deleteCategory = (req, res) => {
//     const { id } = req.params;

//     // First get category image path
//     db.query('SELECT image FROM categories WHERE id = ?', [id], (imgErr, imgResult) => {
//         if (imgErr) {
//             console.error('Image fetch error:', imgErr);
//         }

//         const imagePath = imgResult[0]?.image;

//         // Check if category has subcategories
//         db.query('SELECT COUNT(*) as count FROM sub_categories WHERE category_id = ?', [id], (checkErr, checkResult) => {
//             if (checkErr) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Database error'
//                 });
//             }

//             if (checkResult[0].count > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Cannot delete category. It has subcategories. Delete subcategories first.'
//                 });
//             }

//             // Delete category
//             db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
//                 if (err) {
//                     console.error('Delete error:', err);
//                     return res.status(500).json({
//                         success: false,
//                         message: 'Failed to delete category'
//                     });
//                 }

//                 if (result.affectedRows === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: 'Category not found'
//                     });
//                 }

//                 // Delete associated image file
//                 if (imagePath) {
//                     deleteImageFile(imagePath);
//                 }

//                 res.json({
//                     success: true,
//                     message: 'Category deleted successfully'
//                 });
//             });
//         });
//     });
// };






// backend > src > controllers > categoryController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// ============ HELPER FUNCTION TO DELETE IMAGE ============
const deleteImageFile = (imagePath) => {
    if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log(`🗑️ Deleted image file: ${fullPath}`);
                }
            });
        }
    }
};

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

// Get all active categories for dropdown
exports.getAllCategoriesList = (req, res) => {
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

// Get single category by ID
exports.getCategoryById = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

    db.query('SELECT * FROM categories WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Get category by ID error:', err);
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
    console.log('Create Category Request Body:', req.body);
    console.log('Create Category Request File:', req.file);

    const { name, description, status = 'active' } = req.body;

    // Validate request body
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: 'Request body is required'
        });
    }

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Category name is required'
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

    db.query(
        'INSERT INTO categories (name, description, status, image) VALUES (?, ?, ?, ?)',
        [name, description || '', status, imageUrl],
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
                    console.error('Fetch created category error:', err2);
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

// Update category - FIXED VERSION
exports.updateCategory = (req, res) => {
    console.log('Update Category Request Body:', req.body);
    console.log('Update Category Request Params:', req.params);
    console.log('Update Category Request File:', req.file);

    // Check if body exists
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Request body is empty or undefined'
        });
    }

    const { name, description, status } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Category name is required'
        });
    }

    // First get old image path
    db.query('SELECT image FROM categories WHERE id = ?', [id], (selectErr, selectResult) => {
        if (selectErr) {
            console.error('Get old image error:', selectErr);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (selectResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const oldImagePath = selectResult[0]?.image;

        // Prepare update values
        const updateValues = [name, description || '', status || 'active', id];

        db.query(
            'UPDATE categories SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            updateValues,
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

                // If image is being removed (empty string sent), delete old image
                if (req.body.image === '' && oldImagePath) {
                    deleteImageFile(oldImagePath);
                }

                // Fetch updated category
                db.query('SELECT * FROM categories WHERE id = ?', [id], (err2, results) => {
                    if (err2) {
                        console.error('Fetch updated category error:', err2);
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
    });
};

// Update category image only
exports.updateCategoryImage = (req, res) => {
    console.log('Update Category Image Request File:', req.file);
    console.log('Update Category Image Request Params:', req.params);

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

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
        'UPDATE categories SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
                    message: 'Category not found'
                });
            }

            res.json({
                success: true,
                message: 'Category image updated successfully',
                data: {
                    imageUrl: imageUrl
                }
            });
        }
    );
};

// Update category status
exports.updateCategoryStatus = (req, res) => {
    console.log('Update Category Status Request Body:', req.body);
    console.log('Update Category Status Request Params:', req.params);

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

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

// Delete category
exports.deleteCategory = (req, res) => {
    console.log('Delete Category Request Params:', req.params);

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

    // First get category image path
    db.query('SELECT image FROM categories WHERE id = ?', [id], (imgErr, imgResult) => {
        if (imgErr) {
            console.error('Image fetch error:', imgErr);
        }

        const imagePath = imgResult[0]?.image;

        // Check if category has subcategories
        db.query('SELECT COUNT(*) as count FROM sub_categories WHERE category_id = ?', [id], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Check subcategories error:', checkErr);
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

                // Delete associated image file
                if (imagePath) {
                    deleteImageFile(imagePath);
                }

                res.json({
                    success: true,
                    message: 'Category deleted successfully'
                });
            });
        });
    });
};

// Bulk update categories
exports.bulkUpdateCategories = (req, res) => {
    console.log('Bulk Update Request Body:', req.body);

    if (!req.body || !Array.isArray(req.body.ids) || !req.body.action) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request format. Expected { ids: [], action: "activate|deactivate|delete" }'
        });
    }

    const { ids, action } = req.body;

    if (ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No categories selected'
        });
    }

    const placeholders = ids.map(() => '?').join(',');

    if (action === 'delete') {
        // Check if any category has subcategories
        db.query(
            `SELECT COUNT(*) as count FROM sub_categories WHERE category_id IN (${placeholders})`,
            ids,
            (checkErr, checkResult) => {
                if (checkErr) {
                    console.error('Bulk delete check error:', checkErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (checkResult[0].count > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot delete categories that have subcategories'
                    });
                }

                // Get image paths before deletion
                db.query(
                    `SELECT image FROM categories WHERE id IN (${placeholders})`,
                    ids,
                    (imgErr, imgResults) => {
                        if (imgErr) {
                            console.error('Bulk image fetch error:', imgErr);
                        }

                        // Delete categories
                        db.query(
                            `DELETE FROM categories WHERE id IN (${placeholders})`,
                            ids,
                            (err, result) => {
                                if (err) {
                                    console.error('Bulk delete error:', err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Failed to delete categories'
                                    });
                                }

                                // Delete associated image files
                                imgResults.forEach(row => {
                                    if (row.image) {
                                        deleteImageFile(row.image);
                                    }
                                });

                                res.json({
                                    success: true,
                                    message: `${result.affectedRows} categories deleted successfully`
                                });
                            }
                        );
                    }
                );
            }
        );
    } else {
        // For activate/deactivate actions
        const statusValue = action === 'activate' ? 'active' : 'inactive';

        db.query(
            `UPDATE categories SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [statusValue, ...ids],
            (err, result) => {
                if (err) {
                    console.error('Bulk status update error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update categories'
                    });
                }

                res.json({
                    success: true,
                    message: `${result.affectedRows} categories updated to ${statusValue}`
                });
            }
        );
    }
};