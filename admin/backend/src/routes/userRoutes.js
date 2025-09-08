const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Full update (replace all fields)
router.put('/:id', userController.updateUser);

// Partial update (for specific fields like password or status)
router.patch('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Toggle verify/unverify
router.patch('/:id/verify', userController.toggleVerify);

module.exports = router;
