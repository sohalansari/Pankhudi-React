// const express = require('express');
// const router = express.Router();
// const orderController = require('../controllers/orderController');

// // Test route to check if orders exist
// router.get('/test', async (req, res) => {
//     try {
//         const db = require('../config/db');
//         const orders = await db.query('SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL');
//         res.json({
//             message: 'Order routes working',
//             orderCount: orders[0]?.count || 0,
//             timestamp: new Date().toISOString()
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Order routes
// router.get('/', orderController.getOrders);
// router.get('/stats', orderController.getStats);
// router.get('/export', orderController.exportOrders);
// router.get('/:id', orderController.getOrderDetails);
// router.put('/:id/status', orderController.updateOrderStatus);
// router.put('/:id/payment', orderController.updatePaymentStatus);
// router.post('/:id/tracking', orderController.addTracking);

// module.exports = router;











const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

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