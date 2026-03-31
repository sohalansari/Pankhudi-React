// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Simple auth bypass for development
const bypassAuth = (req, res, next) => {
    req.user = { id: 1, role: 'admin', name: 'Admin User' };
    next();
};

router.use(bypassAuth);

// Dashboard routes
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/sales-data', dashboardController.getSalesData);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/traffic-sources', dashboardController.getTrafficSources);
router.get('/sales-by-category', dashboardController.getSalesByCategory);
router.get('/realtime-activity', dashboardController.getRealtimeActivity);
router.get('/export-dashboard', dashboardController.exportDashboardData);

module.exports = router;