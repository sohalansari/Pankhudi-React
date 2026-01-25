// // src/routes/categories.js - Callback Version
// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// // Get all categories
// router.get('/categories', (req, res) => {
//     console.log('📦 Fetching categories from database...');

//     db.query('SELECT * FROM categories WHERE status = "active"', (err, rows) => {
//         if (err) {
//             console.error('❌ Error fetching categories:', err);
//             return res.status(500).json({
//                 success: false,
//                 message: 'Server error fetching categories',
//                 error: err.message
//             });
//         }

//         console.log(`✅ Found ${rows.length} categories`);
//         res.json({
//             success: true,
//             data: rows,
//             count: rows.length
//         });
//     });
// });

// // Get sub-categories by category ID
// router.get('/subcategories/:categoryId', (req, res) => {
//     const { categoryId } = req.params;
//     console.log(`📦 Fetching sub-categories for category ID: ${categoryId}`);

//     db.query(
//         'SELECT * FROM sub_categories WHERE category_id = ? AND status = "active"',
//         [categoryId],
//         (err, rows) => {
//             if (err) {
//                 console.error('❌ Error fetching sub-categories:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Server error fetching sub-categories',
//                     error: err.message
//                 });
//             }

//             console.log(`✅ Found ${rows.length} sub-categories for category ${categoryId}`);
//             res.json({
//                 success: true,
//                 data: rows,
//                 count: rows.length
//             });
//         }
//     );
// });

// // Get sub-sub-categories by sub-category ID
// router.get('/subsubcategories/:subCategoryId', (req, res) => {
//     const { subCategoryId } = req.params;
//     console.log(`📦 Fetching sub-sub-categories for sub-category ID: ${subCategoryId}`);

//     db.query(
//         'SELECT * FROM sub_sub_categories WHERE sub_category_id = ? AND status = "active"',
//         [subCategoryId],
//         (err, rows) => {
//             if (err) {
//                 console.error('❌ Error fetching sub-sub-categories:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Server error fetching sub-sub-categories',
//                     error: err.message
//                 });
//             }

//             console.log(`✅ Found ${rows.length} sub-sub-categories for sub-category ${subCategoryId}`);
//             res.json({
//                 success: true,
//                 data: rows,
//                 count: rows.length
//             });
//         }
//     );
// });

// // Add new category
// router.post('/categories', (req, res) => {
//     const { name, description } = req.body;

//     if (!name) {
//         return res.status(400).json({
//             success: false,
//             message: 'Category name is required'
//         });
//     }

//     console.log(`➕ Adding new category: ${name}`);

//     db.query(
//         'INSERT INTO categories (name, description, status) VALUES (?, ?, "active")',
//         [name, description || ''],
//         (err, result) => {
//             if (err) {
//                 console.error('❌ Error adding category:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Error adding category',
//                     error: err.message
//                 });
//             }

//             console.log(`✅ Category added with ID: ${result.insertId}`);
//             res.json({
//                 success: true,
//                 id: result.insertId,
//                 name,
//                 description: description || '',
//                 message: 'Category added successfully!'
//             });
//         }
//     );
// });

// module.exports = router;













// const express = require('express');
// const router = express.Router();
// const categoryController = require('../controllers/categoryController');

// // Get all categories with filters and pagination
// router.get('/categories', categoryController.getAllCategories);

// // Get single category
// router.get('/categories/:id', categoryController.getCategoryById);

// // Create category
// router.post('/categories', categoryController.createCategory);

// // Update category
// router.put('/categories/:id', categoryController.updateCategory);

// // Delete category
// router.delete('/categories/:id', categoryController.deleteCategory);

// // Update category status
// router.patch('/categories/:id/status', categoryController.updateCategoryStatus);

// // Get all categories for dropdown (active only)
// router.get('/categories/list/all', categoryController.getAllCategoriesForDropdown);

// // Get category statistics
// router.get('/categories/stats', categoryController.getCategoryStats);

// module.exports = router;











// backend > src > routes > categories.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const categoriesController = require('../controllers/categoryController');
const subcategoriesController = require('../controllers/subCategoryController');
const subsubcategoriesController = require('../controllers/subSubCategoryController');

// ============ FILE UPLOAD MIDDLEWARE ============
const handleImageUpload = (req, res, next) => {
    try {
        if (!req.files || !req.files.image) {
            req.file = null;
            return next();
        }

        const image = req.files.image;

        // Allowed file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(image.mimetype)) {
            req.file = { error: 'Invalid file type. Only JPEG, PNG, GIF, WebP are allowed.' };
            return next();
        }

        // Max file size: 5MB
        const maxSize = 5 * 1024 * 1024;
        if (image.size > maxSize) {
            req.file = { error: 'File size too large. Maximum size is 5MB.' };
            return next();
        }

        // Determine upload directory based on route
        let uploadDir = 'categories';
        let tableName = 'categories';

        if (req.originalUrl.includes('subcategories')) {
            uploadDir = 'sub_categories';
            tableName = 'sub_categories';
        } else if (req.originalUrl.includes('subsubcategories')) {
            uploadDir = 'sub_sub_categories';
            tableName = 'sub_sub_categories';
        }

        // Get old image path for deletion (if updating)
        req.tableName = tableName;
        if (req.params.id) {
            const db = require('../config/db');
            db.query(`SELECT image FROM ${tableName} WHERE id = ?`, [req.params.id], (err, result) => {
                if (!err && result[0] && result[0].image) {
                    req.oldImagePath = result[0].image;
                }
                continueUpload();
            });
        } else {
            continueUpload();
        }

        function continueUpload() {
            const dirPath = path.join(__dirname, '..', 'uploads', uploadDir);

            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`📁 Created directory: ${dirPath}`);
            }

            // Generate unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const fileExt = path.extname(image.name).toLowerCase();
            const filename = `${uploadDir}_${timestamp}_${random}${fileExt}`;
            const filepath = path.join(dirPath, filename);

            // Save file
            image.mv(filepath, (err) => {
                if (err) {
                    console.error('File save error:', err);
                    req.file = null;
                } else {
                    req.file = {
                        filename: filename,
                        path: `/uploads/${uploadDir}/${filename}`,
                        fullPath: filepath
                    };
                }
                next();
            });
        }
    } catch (error) {
        console.error('Upload middleware error:', error);
        req.file = null;
        next();
    }
};

// ============ DELETE OLD IMAGE HELPER ============
const deleteOldImage = (imagePath) => {
    if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                } else {
                    console.log(`🗑️ Deleted old image: ${fullPath}`);
                }
            });
        }
    }
};

// ============ CATEGORY ROUTES ============

// Get all categories
router.get('/categories', categoriesController.getAllCategories);

// Get all categories for dropdown (all status)
router.get('/categories/list/all', categoriesController.getAllCategoriesForDropdown);

// Get all active categories for dropdown
router.get('/categories/list', categoriesController.getAllCategoriesList);

// Get category statistics
router.get('/categories/stats', categoriesController.getCategoryStats);

// Get single category by ID
router.get('/categories/:id', categoriesController.getCategoryById);

// Create new category WITH image upload
router.post('/categories', handleImageUpload, categoriesController.createCategory);

// Update category
router.put('/categories/:id', categoriesController.updateCategory);

// Update category image only WITH image upload
router.patch('/categories/:id/image', handleImageUpload, (req, res, next) => {
    // Delete old image before updating
    if (req.file && req.file.path && req.oldImagePath) {
        deleteOldImage(req.oldImagePath);
    }
    categoriesController.updateCategoryImage(req, res);
});

// Update category status
router.patch('/categories/:id/status', categoriesController.updateCategoryStatus);

// Delete category
router.delete('/categories/:id', categoriesController.deleteCategory);

// ============ SUBCATEGORY ROUTES ============

// Get all subcategories
router.get('/subcategories', subcategoriesController.getAllSubCategories);

// Get all subcategories for dropdown
router.get('/subcategories/list/all', subcategoriesController.getAllSubCategoriesForDropdown);

// Get all subcategories list
router.get('/subcategories/list', subcategoriesController.getAllSubCategoriesList);

// Get subcategories by category ID
router.get('/subcategories/list/:categoryId', subcategoriesController.getSubCategoriesByCategory);

// Get subcategory statistics
router.get('/subcategories/stats', subcategoriesController.getSubCategoryStats);

// Get single subcategory
router.get('/subcategories/:id', subcategoriesController.getSubCategoryById);

// Create new subcategory WITH image upload
router.post('/subcategories', handleImageUpload, subcategoriesController.createSubCategory);

// Update subcategory
router.put('/subcategories/:id', subcategoriesController.updateSubCategory);

// Update subcategory image WITH image upload
router.patch('/subcategories/:id/image', handleImageUpload, (req, res, next) => {
    if (req.file && req.file.path && req.oldImagePath) {
        deleteOldImage(req.oldImagePath);
    }
    subcategoriesController.updateSubCategoryImage(req, res);
});

// Update subcategory status
router.patch('/subcategories/:id/status', subcategoriesController.updateSubCategoryStatus);

// Delete subcategory
router.delete('/subcategories/:id', subcategoriesController.deleteSubCategory);

// ============ SUBSUBCATEGORY ROUTES ============

// Get all subsubcategories
router.get('/subsubcategories', subsubcategoriesController.getAllSubSubCategories);

// Get all subsubcategories for dropdown
router.get('/subsubcategories/list/all', subsubcategoriesController.getAllSubSubCategoriesForDropdown);

// Get all subsubcategories list
router.get('/subsubcategories/list', subsubcategoriesController.getAllSubSubCategoriesList);

// Get subsubcategories by subcategory ID
router.get('/subsubcategories/list/:subCategoryId', subsubcategoriesController.getSubSubCategoriesBySubCategory);

// Get subsubcategory statistics
router.get('/subsubcategories/stats', subsubcategoriesController.getSubSubCategoryStats);

// Get single subsubcategory
router.get('/subsubcategories/:id', subsubcategoriesController.getSubSubCategoryById);

// Create new subsubcategory WITH image upload
router.post('/subsubcategories', handleImageUpload, subsubcategoriesController.createSubSubCategory);

// Update subsubcategory
router.put('/subsubcategories/:id', subsubcategoriesController.updateSubSubCategory);

// Update subsubcategory image WITH image upload
router.patch('/subsubcategories/:id/image', handleImageUpload, (req, res, next) => {
    if (req.file && req.file.path && req.oldImagePath) {
        deleteOldImage(req.oldImagePath);
    }
    subsubcategoriesController.updateSubSubCategoryImage(req, res);
});

// Update subsubcategory status
router.patch('/subsubcategories/:id/status', subsubcategoriesController.updateSubSubCategoryStatus);

// Delete subsubcategory
router.delete('/subsubcategories/:id', subsubcategoriesController.deleteSubSubCategory);

module.exports = router;