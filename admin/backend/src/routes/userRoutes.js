const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// =======================
// Single User Operations
// =======================

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

// Delete single user
router.delete('/:id', userController.deleteUser);

// Toggle verify/unverify
router.patch('/:id/verify', userController.toggleVerify);

// =======================
// Bulk User Operations (for admin page bulk actions)
// =======================

// Activate multiple users
router.patch('/bulk/activate', async (req, res, next) => {
    try {
        const { ids } = req.body; // array of user IDs
        if (!ids || !ids.length) return res.status(400).json({ message: "No user IDs provided" });
        await Promise.all(ids.map(id => userController.updateUser({ params: { id }, body: { is_active: true } }, { json: () => { } })));
        res.json({ message: `${ids.length} user(s) activated successfully` });
    } catch (err) { next(err); }
});

// Deactivate multiple users
router.patch('/bulk/deactivate', async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ message: "No user IDs provided" });
        await Promise.all(ids.map(id => userController.updateUser({ params: { id }, body: { is_active: false } }, { json: () => { } })));
        res.json({ message: `${ids.length} user(s) deactivated successfully` });
    } catch (err) { next(err); }
});

// Delete multiple users
router.delete('/bulk/delete', async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ message: "No user IDs provided" });
        await Promise.all(ids.map(id => userController.deleteUser({ params: { id } }, { json: () => { } })));
        res.json({ message: `${ids.length} user(s) deleted successfully` });
    } catch (err) { next(err); }
});

module.exports = router;
