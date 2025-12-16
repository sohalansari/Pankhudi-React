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













const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories with filters and pagination
router.get('/categories', categoryController.getAllCategories);

// Get single category
router.get('/categories/:id', categoryController.getCategoryById);

// Create category
router.post('/categories', categoryController.createCategory);

// Update category
router.put('/categories/:id', categoryController.updateCategory);

// Delete category
router.delete('/categories/:id', categoryController.deleteCategory);

// Update category status
router.patch('/categories/:id/status', categoryController.updateCategoryStatus);

// Get all categories for dropdown (active only)
router.get('/categories/list/all', categoryController.getAllCategoriesForDropdown);

// Get category statistics
router.get('/categories/stats', categoryController.getCategoryStats);

module.exports = router;