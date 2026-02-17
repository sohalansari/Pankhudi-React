// // backend > src > routes > categories.js
// const express = require('express');
// const router = express.Router();
// const path = require('path');
// const fs = require('fs');

// const categoriesController = require('../controllers/categoryController');
// const subcategoriesController = require('../controllers/subCategoryController');
// const subsubcategoriesController = require('../controllers/subSubCategoryController');

// // ============ FILE UPLOAD MIDDLEWARE ============
// const handleImageUpload = (req, res, next) => {
//     try {
//         if (!req.files || !req.files.image) {
//             req.file = null;
//             return next();
//         }

//         const image = req.files.image;

//         // Allowed file types
//         const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//         if (!allowedTypes.includes(image.mimetype)) {
//             req.file = { error: 'Invalid file type. Only JPEG, PNG, GIF, WebP are allowed.' };
//             return next();
//         }

//         // Max file size: 5MB
//         const maxSize = 5 * 1024 * 1024;
//         if (image.size > maxSize) {
//             req.file = { error: 'File size too large. Maximum size is 5MB.' };
//             return next();
//         }

//         // Determine upload directory based on route
//         let uploadDir = 'categories';
//         let tableName = 'categories';

//         if (req.originalUrl.includes('subcategories')) {
//             uploadDir = 'sub_categories';
//             tableName = 'sub_categories';
//         } else if (req.originalUrl.includes('subsubcategories')) {
//             uploadDir = 'sub_sub_categories';
//             tableName = 'sub_sub_categories';
//         }

//         // Get old image path for deletion (if updating)
//         req.tableName = tableName;
//         if (req.params.id) {
//             const db = require('../config/db');
//             db.query(`SELECT image FROM ${tableName} WHERE id = ?`, [req.params.id], (err, result) => {
//                 if (!err && result[0] && result[0].image) {
//                     req.oldImagePath = result[0].image;
//                 }
//                 continueUpload();
//             });
//         } else {
//             continueUpload();
//         }

//         function continueUpload() {
//             const dirPath = path.join(__dirname, '..', 'uploads', uploadDir);

//             // Create directory if it doesn't exist
//             if (!fs.existsSync(dirPath)) {
//                 fs.mkdirSync(dirPath, { recursive: true });
//                 console.log(`📁 Created directory: ${dirPath}`);
//             }

//             // Generate unique filename
//             const timestamp = Date.now();
//             const random = Math.random().toString(36).substring(2, 15);
//             const fileExt = path.extname(image.name).toLowerCase();
//             const filename = `${uploadDir}_${timestamp}_${random}${fileExt}`;
//             const filepath = path.join(dirPath, filename);

//             // Save file
//             image.mv(filepath, (err) => {
//                 if (err) {
//                     console.error('File save error:', err);
//                     req.file = null;
//                 } else {
//                     req.file = {
//                         filename: filename,
//                         path: `/uploads/${uploadDir}/${filename}`,
//                         fullPath: filepath
//                     };
//                 }
//                 next();
//             });
//         }
//     } catch (error) {
//         console.error('Upload middleware error:', error);
//         req.file = null;
//         next();
//     }
// };

// // ============ DELETE OLD IMAGE HELPER ============
// const deleteOldImage = (imagePath) => {
//     if (imagePath && imagePath.startsWith('/uploads/')) {
//         const fullPath = path.join(__dirname, '..', imagePath);
//         if (fs.existsSync(fullPath)) {
//             fs.unlink(fullPath, (err) => {
//                 if (err) {
//                     console.error('Error deleting old image:', err);
//                 } else {
//                     console.log(`🗑️ Deleted old image: ${fullPath}`);
//                 }
//             });
//         }
//     }
// };

// // ============ CATEGORY ROUTES ============

// // Get all categories
// router.get('/categories', categoriesController.getAllCategories);

// // Get all categories for dropdown (all status)
// router.get('/categories/list/all', categoriesController.getAllCategoriesForDropdown);

// // Get all active categories for dropdown
// router.get('/categories/list', categoriesController.getAllCategoriesList);

// // Get category statistics
// router.get('/categories/stats', categoriesController.getCategoryStats);

// // Get single category by ID
// router.get('/categories/:id', categoriesController.getCategoryById);

// // Create new category WITH image upload
// router.post('/categories', handleImageUpload, categoriesController.createCategory);

// // Update category
// router.put('/categories/:id', categoriesController.updateCategory);

// // Update category image only WITH image upload
// router.patch('/categories/:id/image', handleImageUpload, (req, res, next) => {
//     // Delete old image before updating
//     if (req.file && req.file.path && req.oldImagePath) {
//         deleteOldImage(req.oldImagePath);
//     }
//     categoriesController.updateCategoryImage(req, res);
// });

// // Update category status
// router.patch('/categories/:id/status', categoriesController.updateCategoryStatus);

// // Delete category
// router.delete('/categories/:id', categoriesController.deleteCategory);

// // ============ SUBCATEGORY ROUTES ============

// // Get all subcategories
// router.get('/subcategories', subcategoriesController.getAllSubCategories);

// // Get all subcategories for dropdown
// router.get('/subcategories/list/all', subcategoriesController.getAllSubCategoriesForDropdown);

// // Get all subcategories list
// router.get('/subcategories/list', subcategoriesController.getAllSubCategoriesList);

// // Get subcategories by category ID
// router.get('/subcategories/list/:categoryId', subcategoriesController.getSubCategoriesByCategory);

// // Get subcategory statistics
// router.get('/subcategories/stats', subcategoriesController.getSubCategoryStats);

// // Get single subcategory
// router.get('/subcategories/:id', subcategoriesController.getSubCategoryById);

// // Create new subcategory WITH image upload
// router.post('/subcategories', handleImageUpload, subcategoriesController.createSubCategory);

// // Update subcategory
// router.put('/subcategories/:id', subcategoriesController.updateSubCategory);

// // Update subcategory image WITH image upload
// router.patch('/subcategories/:id/image', handleImageUpload, (req, res, next) => {
//     if (req.file && req.file.path && req.oldImagePath) {
//         deleteOldImage(req.oldImagePath);
//     }
//     subcategoriesController.updateSubCategoryImage(req, res);
// });

// // Update subcategory status
// router.patch('/subcategories/:id/status', subcategoriesController.updateSubCategoryStatus);

// // Delete subcategory
// router.delete('/subcategories/:id', subcategoriesController.deleteSubCategory);

// // ============ SUBSUBCATEGORY ROUTES ============

// // Get all subsubcategories
// router.get('/subsubcategories', subsubcategoriesController.getAllSubSubCategories);

// // Get all subsubcategories for dropdown
// router.get('/subsubcategories/list/all', subsubcategoriesController.getAllSubSubCategoriesForDropdown);

// // Get all subsubcategories list
// router.get('/subsubcategories/list', subsubcategoriesController.getAllSubSubCategoriesList);

// // Get subsubcategories by subcategory ID
// router.get('/subsubcategories/list/:subCategoryId', subsubcategoriesController.getSubSubCategoriesBySubCategory);

// // Get subsubcategory statistics
// router.get('/subsubcategories/stats', subsubcategoriesController.getSubSubCategoryStats);

// // Get single subsubcategory
// router.get('/subsubcategories/:id', subsubcategoriesController.getSubSubCategoryById);

// // Create new subsubcategory WITH image upload
// router.post('/subsubcategories', handleImageUpload, subsubcategoriesController.createSubSubCategory);

// // Update subsubcategory
// router.put('/subsubcategories/:id', subsubcategoriesController.updateSubSubCategory);

// // Update subsubcategory image WITH image upload
// router.patch('/subsubcategories/:id/image', handleImageUpload, (req, res, next) => {
//     if (req.file && req.file.path && req.oldImagePath) {
//         deleteOldImage(req.oldImagePath);
//     }
//     subsubcategoriesController.updateSubSubCategoryImage(req, res);
// });

// // Update subsubcategory status
// router.patch('/subsubcategories/:id/status', subsubcategoriesController.updateSubSubCategoryStatus);

// // Delete subsubcategory
// router.delete('/subsubcategories/:id', subsubcategoriesController.deleteSubSubCategory);

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
        console.log('Upload Middleware - Request Headers:', req.headers['content-type']);
        console.log('Upload Middleware - Has files:', !!req.files);

        // Check if this is a form-data request
        const isFormData = req.headers['content-type'] &&
            req.headers['content-type'].includes('multipart/form-data');

        if (!isFormData || !req.files || !req.files.image) {
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

        const processUpload = () => {
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
                    req.file = { error: 'Failed to save image file' };
                } else {
                    req.file = {
                        filename: filename,
                        path: `/uploads/${uploadDir}/${filename}`,
                        fullPath: filepath,
                        mimetype: image.mimetype,
                        size: image.size
                    };
                    console.log('File saved successfully:', req.file.path);
                }
                next();
            });
        };

        // If updating, get old image first
        if (req.params.id) {
            const db = require('../config/db');
            db.query(`SELECT image FROM ${tableName} WHERE id = ?`, [req.params.id], (err, result) => {
                if (!err && result[0] && result[0].image) {
                    req.oldImagePath = result[0].image;
                }
                processUpload();
            });
        } else {
            processUpload();
        }

    } catch (error) {
        console.error('Upload middleware error:', error);
        req.file = { error: 'File upload processing error' };
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

// ============ MIDDLEWARE FOR PARSING FORM-DATA ============
// This middleware handles form-data parsing when files are included
const handleFormData = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';

    // If it's form-data, body parsing will be handled differently
    if (contentType.includes('multipart/form-data')) {
        // For form-data, body fields are available in req.body
        // We'll use express-fileupload which we already have in app.js
        console.log('Form-data detected, skipping JSON body parsing');
    }

    next();
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

// Update category (regular update without image upload)
router.put('/categories/:id', handleFormData, categoriesController.updateCategory);

// Update category with image upload (form-data)
router.put('/categories/:id/with-image', handleImageUpload, (req, res, next) => {
    // First handle the image, then pass to controller
    next();
}, categoriesController.updateCategory);

// Update category image only WITH image upload
router.patch('/categories/:id/image', handleImageUpload, (req, res) => {
    // Delete old image before updating
    if (req.file && req.file.path && req.oldImagePath) {
        deleteOldImage(req.oldImagePath);
    }
    categoriesController.updateCategoryImage(req, res);
});

// Update category status
router.patch('/categories/:id/status', categoriesController.updateCategoryStatus);

// Bulk update categories
router.post('/categories/bulk-update', categoriesController.bulkUpdateCategories);

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

// Update subcategory (regular update without image)
router.put('/subcategories/:id', subcategoriesController.updateSubCategory);

// Update subcategory with image upload
router.put('/subcategories/:id/with-image', handleImageUpload, subcategoriesController.updateSubCategory);

// Update subcategory image WITH image upload
router.patch('/subcategories/:id/image', handleImageUpload, (req, res) => {
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

// Update subsubcategory (regular update without image)
router.put('/subsubcategories/:id', subsubcategoriesController.updateSubSubCategory);

// Update subsubcategory with image upload
router.put('/subsubcategories/:id/with-image', handleImageUpload, subsubcategoriesController.updateSubSubCategory);

// Update subsubcategory image WITH image upload
router.patch('/subsubcategories/:id/image', handleImageUpload, (req, res) => {
    if (req.file && req.file.path && req.oldImagePath) {
        deleteOldImage(req.oldImagePath);
    }
    subsubcategoriesController.updateSubSubCategoryImage(req, res);
});

// Update subsubcategory status
router.patch('/subsubcategories/:id/status', subsubcategoriesController.updateSubSubCategoryStatus);

// Delete subsubcategory
router.delete('/subsubcategories/:id', subsubcategoriesController.deleteSubSubCategory);

// ============ HEALTH CHECK ROUTE ============
router.get('/categories/health', (req, res) => {
    res.json({
        success: true,
        message: 'Category management routes are working',
        timestamp: new Date().toISOString(),
        routes: {
            categories: {
                getAll: 'GET /api/categories',
                create: 'POST /api/categories',
                update: 'PUT /api/categories/:id',
                updateWithImage: 'PUT /api/categories/:id/with-image',
                updateImage: 'PATCH /api/categories/:id/image',
                delete: 'DELETE /api/categories/:id'
            },
            subcategories: {
                getAll: 'GET /api/subcategories',
                create: 'POST /api/subcategories',
                update: 'PUT /api/subcategories/:id'
            },
            subsubcategories: {
                getAll: 'GET /api/subsubcategories',
                create: 'POST /api/subsubcategories',
                update: 'PUT /api/subsubcategories/:id'
            }
        }
    });
});

module.exports = router;