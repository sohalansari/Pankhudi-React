// // backend/routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const adminAuthController = require('../controllers/adminAuthController');
// const { protect, admin } = require('../middleware/authMiddleware');

// // Public routes
// router.post('/login', adminAuthController.adminLogin);
// router.post('/verify-2fa', adminAuthController.verify2FA);
// router.post('/forgot-password', adminAuthController.forgotPassword);
// router.post('/reset-password', adminAuthController.resetPassword);

// // Protected routes
// router.get('/verify', protect, admin, adminAuthController.verifyToken);
// router.post('/logout', protect, admin, adminAuthController.adminLogout);

// module.exports = router;



// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    adminLogin,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyToken
} = require('../controllers/adminAuthController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/verify', protect, admin, verifyToken);

module.exports = router;