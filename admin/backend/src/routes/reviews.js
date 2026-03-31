// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get reviews for a product (public)
router.get('/product/:productId', reviewController.getPublicReviews);

// Get review statistics for a product (public)
router.get('/stats/:productId', reviewController.getReviewStats);

// Get replies for a review (public)
router.get('/:reviewId/replies', reviewController.getReplies);

// Get admin reply for a review (public)
router.get('/:reviewId/admin-reply', reviewController.getAdminReply);

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

// Add a review (authenticated users)
router.post('/', protect, reviewController.addReview);

// Update own review (authenticated users)
router.put('/:reviewId', protect, reviewController.updateUserReview);

// Delete own review (authenticated users)
router.delete('/:reviewId', protect, reviewController.deleteUserReview);

// Get user's review for a product (authenticated)
router.get('/user/:productId', protect, reviewController.getUserReview);

// Add reply to a review (authenticated users)
router.post('/:reviewId/replies', protect, reviewController.addReply);

// Delete own reply (authenticated users)
router.delete('/replies/:replyId', protect, reviewController.deleteReply);

// Like/Unlike a reply (authenticated users)
router.post('/replies/:replyId/like', protect, reviewController.likeReply);

// ============================================
// ADMIN ROUTES (Admin authentication required)
// ============================================

// All admin routes require admin authentication
router.use(protect, admin);

// Get all reviews with filters and pagination (admin)
router.get('/admin/all', reviewController.getAllReviews);

// Get review statistics (admin)
router.get('/admin/stats', reviewController.getAdminStats);

// Get a single review details (admin)
router.get('/admin/:id', reviewController.getReviewById);

// Moderate a review (approve/reject)
router.patch('/admin/:id/moderate', reviewController.moderateReview);

// Update any review (admin)
router.patch('/admin/:id', reviewController.updateReview);

// Delete any review and its replies (admin)
router.delete('/admin/:id', reviewController.deleteReview);

// Add or update admin reply
router.post('/admin/:id/reply', reviewController.addAdminReply);

// Update admin reply
router.put('/admin/:id/reply', reviewController.updateAdminReply);

// Delete admin reply
router.delete('/admin/:id/admin-reply', reviewController.deleteAdminReply);

// Bulk actions (approve, reject, delete)
router.post('/admin/bulk', reviewController.bulkAction);

// Get all replies for a review (admin)
router.get('/admin/:reviewId/all-replies', reviewController.getAllReplies);

// Delete any user reply (admin)
router.delete('/admin/replies/:replyId', reviewController.deleteAnyReply);

// Get pending reviews count (admin)
router.get('/admin/pending/count', reviewController.getPendingCount);

// Export reviews (admin)
router.get('/admin/export/csv', reviewController.exportReviews);




// These are the key admin routes that the frontend expects:
router.get('/admin/all', reviewController.getAllReviews);  // Changed from /admin to /admin/all
router.get('/admin/stats', reviewController.getAdminStats);  // Using getAdminStats instead of getReviewStats
router.patch('/admin/:id/moderate', reviewController.moderateReview);
router.patch('/admin/:id', reviewController.updateReview);
router.delete('/admin/:id', reviewController.deleteReview);
router.post('/admin/:id/reply', reviewController.addAdminReply);
router.post('/admin/bulk', reviewController.bulkAction);  // Changed from patch to post
router.delete('/admin/replies/:replyId', reviewController.deleteAnyReply);

module.exports = router;