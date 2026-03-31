const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Order routes
router.get('/', orderController.getOrders);
router.get('/stats', orderController.getStats);
router.get('/export', orderController.exportOrders);
router.get('/returns', orderController.getReturns);
router.get('/:id', orderController.getOrderDetails);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/payment', orderController.updatePaymentStatus);
router.post('/:id/tracking', orderController.addTracking);
router.put('/returns/:id', orderController.updateReturnStatus);

module.exports = router;