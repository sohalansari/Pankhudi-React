const express = require('express');
const router = express.Router();
const subSubCategoryController = require('../controllers/subSubCategoryController');

// Get all sub-sub-categories with filters and pagination
router.get('/subsubcategories', subSubCategoryController.getAllSubSubCategories);

// Get single sub-sub-category
router.get('/subsubcategories/:id', subSubCategoryController.getSubSubCategoryById);

// Create sub-sub-category
router.post('/subsubcategories', subSubCategoryController.createSubSubCategory);

// Update sub-sub-category
router.put('/subsubcategories/:id', subSubCategoryController.updateSubSubCategory);

// Delete sub-sub-category
router.delete('/subsubcategories/:id', subSubCategoryController.deleteSubSubCategory);

// Update sub-sub-category status
router.patch('/subsubcategories/:id/status', subSubCategoryController.updateSubSubCategoryStatus);

// Get all sub-sub-categories for dropdown
router.get('/subsubcategories/list/all', subSubCategoryController.getAllSubSubCategoriesForDropdown);

module.exports = router;