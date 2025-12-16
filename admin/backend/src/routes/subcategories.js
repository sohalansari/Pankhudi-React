const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Get all sub-categories with filters and pagination
router.get('/subcategories', subCategoryController.getAllSubCategories);

// Get single sub-category
router.get('/subcategories/:id', subCategoryController.getSubCategoryById);

// Create sub-category
router.post('/subcategories', subCategoryController.createSubCategory);

// Update sub-category
router.put('/subcategories/:id', subCategoryController.updateSubCategory);

// Delete sub-category
router.delete('/subcategories/:id', subCategoryController.deleteSubCategory);

// Update sub-category status
router.patch('/subcategories/:id/status', subCategoryController.updateSubCategoryStatus);

// Get all sub-categories for dropdown
router.get('/subcategories/list/all', subCategoryController.getAllSubCategoriesForDropdown);

module.exports = router;