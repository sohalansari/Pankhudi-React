// backend/controllers/reviewController.js
const db = require('../config/db');

// Helper function to promisify db query
const queryAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// ============================================
// PUBLIC METHODS
// ============================================

// Get public reviews for a product
const getPublicReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await queryAsync(`
            SELECT r.id, r.rating, r.review, r.created_at, r.user_id,
                   r.admin_reply, 
                   DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
                   COALESCE(u.name, 'Anonymous') AS user_name,
                   u.avatar AS user_image,
                   u.email AS user_email
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.approved = 1
            ORDER BY r.created_at DESC
        `, [productId]);

        // Fetch replies for each review
        for (let review of reviews) {
            const replies = await queryAsync(`
                SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
                       COALESCE(u.name, 'Anonymous') AS user_name,
                       u.avatar AS user_image,
                       (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
                FROM review_replies rr
                LEFT JOIN users u ON rr.user_id = u.id
                WHERE rr.review_id = ?
                ORDER BY rr.created_at ASC
            `, [review.id]);
            review.replies = replies;
        }

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching public reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// Get review statistics
const getReviewStats = async (req, res) => {
    try {
        const { productId } = req.params;

        const stats = await queryAsync(`
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as avg_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews
            WHERE product_id = ? AND approved = 1
        `, [productId]);

        const result = stats[0] || {
            total_reviews: 0,
            avg_rating: 0,
            five_star: 0,
            four_star: 0,
            three_star: 0,
            two_star: 0,
            one_star: 0
        };

        res.json({
            success: true,
            stats: {
                ...result,
                avg_rating: parseFloat(result.avg_rating).toFixed(1)
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};

// Get replies for a review
const getReplies = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const replies = await queryAsync(`
            SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
                   COALESCE(u.name, 'Anonymous') AS user_name,
                   u.avatar AS user_image,
                   (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
            FROM review_replies rr
            LEFT JOIN users u ON rr.user_id = u.id
            WHERE rr.review_id = ?
            ORDER BY rr.created_at ASC
        `, [reviewId]);

        res.json(replies);
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching replies',
            error: error.message
        });
    }
};

// Get admin reply for a review
const getAdminReply = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const result = await queryAsync(`
            SELECT admin_reply, 
                   DATE_FORMAT(admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
                   admin_reply_by
            FROM reviews
            WHERE id = ? AND admin_reply IS NOT NULL
        `, [reviewId]);

        if (result.length === 0) {
            return res.json({
                success: true,
                hasAdminReply: false
            });
        }

        res.json({
            success: true,
            hasAdminReply: true,
            adminReply: result[0]
        });
    } catch (error) {
        console.error('Error fetching admin reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin reply',
            error: error.message
        });
    }
};

// ============================================
// USER AUTHENTICATED METHODS
// ============================================

// Add a review
const addReview = async (req, res) => {
    try {
        const { product_id, rating, review, approved } = req.body;
        const user_id = req.user.id;

        if (!product_id || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await queryAsync(
            'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
            [product_id, user_id]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        const isApproved = approved !== undefined ? (approved ? 1 : 0) : 1;

        const result = await queryAsync(
            'INSERT INTO reviews (product_id, user_id, rating, review, approved, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [product_id, user_id, rating, review, isApproved]
        );

        const newReview = await queryAsync(`
            SELECT r.id, r.rating, r.review, r.created_at, r.approved,
                   r.admin_reply, 
                   DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
                   COALESCE(u.name, 'Anonymous') AS user_name,
                   u.avatar AS user_image,
                   u.id as user_id
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [result.insertId]);

        res.json({
            success: true,
            message: 'Review submitted successfully',
            reviewId: result.insertId,
            review: newReview[0],
            approved: isApproved === 1
        });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: error.message
        });
    }
};

// Update own review
const updateUserReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, review } = req.body;
        const user_id = req.user.id;

        if (!rating || !review) {
            return res.status(400).json({
                success: false,
                message: 'Rating and review are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check ownership
        const existingReview = await queryAsync(
            'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
            [reviewId, user_id]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or you don\'t have permission to edit it'
            });
        }

        await queryAsync(
            'UPDATE reviews SET rating = ?, review = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
            [rating, review, reviewId, user_id]
        );

        res.json({
            success: true,
            message: 'Review updated successfully'
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};

// Delete own review
const deleteUserReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const user_id = req.user.id;

        // Check ownership
        const existingReview = await queryAsync(
            'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
            [reviewId, user_id]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or you don\'t have permission to delete it'
            });
        }

        // Delete replies and likes first
        await queryAsync('DELETE FROM reply_likes WHERE reply_id IN (SELECT id FROM review_replies WHERE review_id = ?)', [reviewId]);
        await queryAsync('DELETE FROM review_replies WHERE review_id = ?', [reviewId]);
        await queryAsync('DELETE FROM reviews WHERE id = ? AND user_id = ?', [reviewId, user_id]);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
};

// Get user's review for a product
const getUserReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.id;

        const review = await queryAsync(`
            SELECT id, rating, review, created_at, approved,
                   admin_reply, 
                   DATE_FORMAT(admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date
            FROM reviews
            WHERE product_id = ? AND user_id = ?
            LIMIT 1
        `, [productId, user_id]);

        if (review.length === 0) {
            return res.json({
                success: true,
                hasReview: false
            });
        }

        res.json({
            success: true,
            hasReview: true,
            review: {
                ...review[0],
                approved: review[0].approved === 1
            }
        });

    } catch (error) {
        console.error('Error fetching user review:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message
        });
    }
};

// Add reply to a review
const addReply = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reply_text } = req.body;
        const user_id = req.user.id;
        const user_name = req.user.name || 'Anonymous';

        if (!reply_text || reply_text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reply text is required'
            });
        }

        const result = await queryAsync(
            'INSERT INTO review_replies (review_id, user_id, reply_text, created_at) VALUES (?, ?, ?, NOW())',
            [reviewId, user_id, reply_text]
        );

        const newReply = await queryAsync(`
            SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
                   COALESCE(u.name, 'Anonymous') AS user_name,
                   u.avatar AS user_image,
                   (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
            FROM review_replies rr
            LEFT JOIN users u ON rr.user_id = u.id
            WHERE rr.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            reply: newReply[0]
        });

    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding reply',
            error: error.message
        });
    }
};

// Delete own reply
const deleteReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const user_id = req.user.id;

        const reply = await queryAsync(
            'SELECT user_id FROM review_replies WHERE id = ?',
            [replyId]
        );

        if (reply.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        if (reply[0].user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You don\'t have permission to delete this reply'
            });
        }

        await queryAsync('DELETE FROM reply_likes WHERE reply_id = ?', [replyId]);
        await queryAsync('DELETE FROM review_replies WHERE id = ?', [replyId]);

        res.json({
            success: true,
            message: 'Reply deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting reply',
            error: error.message
        });
    }
};

// Like/Unlike a reply
const likeReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const user_id = req.user.id;

        const existingLike = await queryAsync(
            'SELECT * FROM reply_likes WHERE reply_id = ? AND user_id = ?',
            [replyId, user_id]
        );

        if (existingLike.length > 0) {
            // Unlike
            await queryAsync(
                'DELETE FROM reply_likes WHERE reply_id = ? AND user_id = ?',
                [replyId, user_id]
            );
        } else {
            // Like
            await queryAsync(
                'INSERT INTO reply_likes (reply_id, user_id) VALUES (?, ?)',
                [replyId, user_id]
            );
        }

        const likeCount = await queryAsync(
            'SELECT COUNT(*) as count FROM reply_likes WHERE reply_id = ?',
            [replyId]
        );

        res.json({
            success: true,
            liked: existingLike.length === 0,
            likes_count: likeCount[0].count
        });

    } catch (error) {
        console.error('Error liking reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking reply',
            error: error.message
        });
    }
};

// ============================================
// ADMIN METHODS
// ============================================

// Get all reviews with filters and pagination
const getAllReviews = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            approved,
            search,
            rating_min,
            rating_max,
            sort_by = 'created_at',
            sort_order = 'DESC',
            include_replies = true
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = [];
        let params = [];

        if (approved !== undefined && approved !== '') {
            whereConditions.push('r.approved = ?');
            params.push(approved === 'true' ? 1 : 0);
        }

        if (rating_min) {
            whereConditions.push('r.rating >= ?');
            params.push(parseInt(rating_min));
        }
        if (rating_max) {
            whereConditions.push('r.rating <= ?');
            params.push(parseInt(rating_max));
        }

        if (search) {
            whereConditions.push('(r.review LIKE ? OR p.name LIKE ? OR u.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await queryAsync(`
            SELECT COUNT(*) as total 
            FROM reviews r 
            LEFT JOIN products p ON r.product_id = p.id 
            LEFT JOIN users u ON r.user_id = u.id 
            ${whereClause}
        `, params);
        const total = countResult[0]?.total || 0;

        // Get reviews
        const reviews = await queryAsync(`
            SELECT 
                r.id,
                r.product_id,
                r.user_id,
                r.rating,
                r.review,
                r.approved,
                r.admin_reply,
                r.admin_reply_date,
                r.created_at,
                r.updated_at,
                p.name as product_name,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar,
                (SELECT COUNT(*) FROM review_replies WHERE review_id = r.id) as replies_count,
                (SELECT COUNT(*) FROM reply_likes WHERE reply_id IN (SELECT id FROM review_replies WHERE review_id = r.id)) as total_likes
            FROM reviews r 
            LEFT JOIN products p ON r.product_id = p.id 
            LEFT JOIN users u ON r.user_id = u.id 
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order} 
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);

        // Fetch replies if requested
        if (include_replies === 'true' || include_replies === true) {
            for (let review of reviews) {
                const replies = await queryAsync(`
                    SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
                           COALESCE(u.name, 'Anonymous') AS user_name,
                           u.avatar AS user_image,
                           (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
                    FROM review_replies rr
                    LEFT JOIN users u ON rr.user_id = u.id
                    WHERE rr.review_id = ?
                    ORDER BY rr.created_at ASC
                `, [review.id]);
                review.replies = replies;
            }
        }

        res.json({
            success: true,
            reviews: reviews || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// Moderate a review (approve/reject)
const moderateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;

        await queryAsync(
            'UPDATE reviews SET approved = ?, moderated_by = ?, moderated_at = NOW() WHERE id = ?',
            [approved ? 1 : 0, req.user.id, id]
        );

        res.json({
            success: true,
            message: `Review ${approved ? 'approved' : 'rejected'} successfully`
        });

    } catch (error) {
        console.error('Error moderating review:', error);
        res.status(500).json({
            success: false,
            message: 'Error moderating review',
            error: error.message
        });
    }
};

// Update any review (admin)
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review, approved } = req.body;

        await queryAsync(
            'UPDATE reviews SET rating = ?, review = ?, approved = ?, updated_at = NOW() WHERE id = ?',
            [rating, review, approved ? 1 : 0, id]
        );

        res.json({
            success: true,
            message: 'Review updated successfully'
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};

// Delete any review and its replies (admin)
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await queryAsync('SELECT * FROM reviews WHERE id = ?', [id]);

        if (!review || review.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Delete all replies and likes
        await queryAsync('DELETE FROM reply_likes WHERE reply_id IN (SELECT id FROM review_replies WHERE review_id = ?)', [id]);
        await queryAsync('DELETE FROM review_replies WHERE review_id = ?', [id]);
        await queryAsync('DELETE FROM reviews WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Review and all associated replies deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
};

// Add or update admin reply
const addAdminReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || reply.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reply cannot be empty'
            });
        }

        await queryAsync(
            'UPDATE reviews SET admin_reply = ?, admin_reply_date = NOW(), admin_reply_by = ? WHERE id = ?',
            [reply, req.user.id, id]
        );

        res.json({
            success: true,
            message: 'Admin reply added successfully'
        });

    } catch (error) {
        console.error('Error adding admin reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding admin reply',
            error: error.message
        });
    }
};

// Delete admin reply
const deleteAdminReply = async (req, res) => {
    try {
        const { id } = req.params;

        await queryAsync(
            'UPDATE reviews SET admin_reply = NULL, admin_reply_date = NULL, admin_reply_by = NULL WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Admin reply deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting admin reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting admin reply',
            error: error.message
        });
    }
};

// Bulk actions (approve, reject, delete)
const bulkAction = async (req, res) => {
    try {
        const { action, review_ids } = req.body;

        if (!review_ids || review_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No reviews selected'
            });
        }

        const placeholders = review_ids.map(() => '?').join(',');

        if (action === 'delete') {
            // Delete all replies and likes for these reviews
            await queryAsync(`DELETE FROM reply_likes WHERE reply_id IN (SELECT id FROM review_replies WHERE review_id IN (${placeholders}))`, review_ids);
            await queryAsync(`DELETE FROM review_replies WHERE review_id IN (${placeholders})`, review_ids);
            await queryAsync(`DELETE FROM reviews WHERE id IN (${placeholders})`, review_ids);

            res.json({
                success: true,
                message: `${review_ids.length} reviews deleted successfully`
            });
        } else if (action === 'approve') {
            await queryAsync(`UPDATE reviews SET approved = 1, moderated_by = ?, moderated_at = NOW() WHERE id IN (${placeholders})`, [req.user.id, ...review_ids]);
            res.json({
                success: true,
                message: `${review_ids.length} reviews approved successfully`
            });
        } else if (action === 'reject') {
            await queryAsync(`UPDATE reviews SET approved = 0, moderated_by = ?, moderated_at = NOW() WHERE id IN (${placeholders})`, [req.user.id, ...review_ids]);
            res.json({
                success: true,
                message: `${review_ids.length} reviews rejected successfully`
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }

    } catch (error) {
        console.error('Error in bulk action:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk action',
            error: error.message
        });
    }
};

// Get all replies for a review (admin)
const getAllReplies = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const replies = await queryAsync(`
            SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
                   COALESCE(u.name, 'Anonymous') AS user_name,
                   u.email AS user_email,
                   u.avatar AS user_image,
                   (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
            FROM review_replies rr
            LEFT JOIN users u ON rr.user_id = u.id
            WHERE rr.review_id = ?
            ORDER BY rr.created_at DESC
        `, [reviewId]);

        res.json({
            success: true,
            replies
        });

    } catch (error) {
        console.error('Error fetching all replies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching replies',
            error: error.message
        });
    }
};

// Delete any user reply (admin)
const deleteAnyReply = async (req, res) => {
    try {
        const { replyId } = req.params;

        const reply = await queryAsync('SELECT id FROM review_replies WHERE id = ?', [replyId]);

        if (reply.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        await queryAsync('DELETE FROM reply_likes WHERE reply_id = ?', [replyId]);
        await queryAsync('DELETE FROM review_replies WHERE id = ?', [replyId]);

        res.json({
            success: true,
            message: 'Reply deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting reply',
            error: error.message
        });
    }
};
// Add these methods to your reviewController.js

// Get a single review by ID (admin)
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await queryAsync(`
            SELECT r.*, 
                   p.name as product_name,
                   p.sku as product_sku,
                   u.name as user_name,
                   u.email as user_email,
                   u.avatar as user_avatar,
                   (SELECT COUNT(*) FROM review_replies WHERE review_id = r.id) as replies_count,
                   (SELECT COUNT(*) FROM reply_likes WHERE reply_id IN (SELECT id FROM review_replies WHERE review_id = r.id)) as total_likes
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [id]);

        if (review.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Fetch replies for this review
        const replies = await queryAsync(`
            SELECT rr.*, 
                   COALESCE(u.name, 'Anonymous') as user_name,
                   u.email as user_email,
                   u.avatar as user_image,
                   (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
            FROM review_replies rr
            LEFT JOIN users u ON rr.user_id = u.id
            WHERE rr.review_id = ?
            ORDER BY rr.created_at DESC
        `, [id]);

        res.json({
            success: true,
            review: review[0],
            replies
        });

    } catch (error) {
        console.error('Error fetching review by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message
        });
    }
};

// Get admin statistics with more details
const getAdminStats = async (req, res) => {
    try {
        // Get basic stats
        const basicStats = await queryAsync(`
            SELECT 
                COUNT(*) as total_reviews,
                SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) as approved_reviews,
                SUM(CASE WHEN approved = 0 THEN 1 ELSE 0 END) as pending_reviews,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT product_id) as products_with_reviews,
                (SELECT COUNT(*) FROM review_replies) as total_replies,
                (SELECT COUNT(*) FROM reply_likes) as total_likes,
                (SELECT COUNT(*) FROM reviews WHERE DATE(created_at) = CURDATE()) as today_reviews,
                (SELECT COUNT(*) FROM reviews WHERE WEEK(created_at) = WEEK(CURDATE())) as this_week_reviews,
                (SELECT COUNT(*) FROM reviews WHERE MONTH(created_at) = MONTH(CURDATE())) as this_month_reviews
            FROM reviews
        `);

        // Get rating distribution
        const ratingDistribution = await queryAsync(`
            SELECT 
                rating,
                COUNT(*) as count
            FROM reviews
            GROUP BY rating
            ORDER BY rating DESC
        `);

        // Get top products by reviews
        const topProducts = await queryAsync(`
            SELECT 
                p.id,
                p.name,
                COUNT(r.id) as review_count,
                AVG(r.rating) as avg_rating
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY review_count DESC
            LIMIT 10
        `);

        // Get recent reviews
        const recentReviews = await queryAsync(`
            SELECT 
                r.id,
                r.rating,
                r.review,
                r.created_at,
                r.approved,
                p.name as product_name,
                u.name as user_name
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            stats: basicStats[0] || {},
            ratingDistribution,
            topProducts,
            recentReviews
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};

// Update admin reply
const updateAdminReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || reply.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reply cannot be empty'
            });
        }

        const result = await queryAsync(
            'UPDATE reviews SET admin_reply = ?, admin_reply_date = NOW(), admin_reply_by = ? WHERE id = ? AND admin_reply IS NOT NULL',
            [reply, req.user.id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No existing admin reply found for this review'
            });
        }

        res.json({
            success: true,
            message: 'Admin reply updated successfully'
        });

    } catch (error) {
        console.error('Error updating admin reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating admin reply',
            error: error.message
        });
    }
};

// Get pending reviews count
const getPendingCount = async (req, res) => {
    try {
        const result = await queryAsync(`
            SELECT COUNT(*) as count
            FROM reviews
            WHERE approved = 0
        `);

        res.json({
            success: true,
            count: result[0]?.count || 0
        });

    } catch (error) {
        console.error('Error fetching pending count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending count',
            error: error.message
        });
    }
};

// Export reviews as CSV
const exportReviews = async (req, res) => {
    try {
        const { format = 'csv', approved, start_date, end_date } = req.query;

        let whereConditions = [];
        let params = [];

        if (approved !== undefined && approved !== '') {
            whereConditions.push('r.approved = ?');
            params.push(approved === 'true' ? 1 : 0);
        }

        if (start_date) {
            whereConditions.push('DATE(r.created_at) >= ?');
            params.push(start_date);
        }

        if (end_date) {
            whereConditions.push('DATE(r.created_at) <= ?');
            params.push(end_date);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const reviews = await queryAsync(`
            SELECT 
                r.id,
                r.rating,
                r.review,
                r.created_at,
                r.approved,
                r.admin_reply,
                r.admin_reply_date,
                p.name as product_name,
                p.sku as product_sku,
                u.name as user_name,
                u.email as user_email,
                (SELECT COUNT(*) FROM review_replies WHERE review_id = r.id) as replies_count,
                (SELECT COUNT(*) FROM reply_likes WHERE reply_id IN (SELECT id FROM review_replies WHERE review_id = r.id)) as total_likes
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u ON r.user_id = u.id
            ${whereClause}
            ORDER BY r.created_at DESC
        `, params);

        if (format === 'json') {
            return res.json({
                success: true,
                reviews,
                total: reviews.length
            });
        }

        // Generate CSV
        const csvHeaders = [
            'Review ID',
            'Product Name',
            'Product SKU',
            'User Name',
            'User Email',
            'Rating',
            'Review Content',
            'Status',
            'Created Date',
            'Admin Reply',
            'Admin Reply Date',
            'Total Replies',
            'Total Likes'
        ];

        const csvRows = reviews.map(review => [
            review.id,
            review.product_name || 'N/A',
            review.product_sku || 'N/A',
            review.user_name || 'Anonymous',
            review.user_email || 'N/A',
            review.rating,
            `"${(review.review || '').replace(/"/g, '""')}"`,
            review.approved ? 'Approved' : 'Pending',
            new Date(review.created_at).toISOString(),
            `"${(review.admin_reply || '').replace(/"/g, '""')}"`,
            review.admin_reply_date ? new Date(review.admin_reply_date).toISOString() : '',
            review.replies_count || 0,
            review.total_likes || 0
        ]);

        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=reviews_export_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting reviews',
            error: error.message
        });
    }
};

// Make sure to export all the new methods
module.exports = {
    // Public methods
    getPublicReviews,
    getReviewStats,
    getReplies,
    getAdminReply,

    // User authenticated methods
    addReview,
    updateUserReview,
    deleteUserReview,
    getUserReview,
    addReply,
    deleteReply,
    likeReply,

    // Admin methods
    getAllReviews,
    getReviewById,
    getAdminStats,
    moderateReview,
    updateReview,
    deleteReview,
    addAdminReply,
    updateAdminReply,
    deleteAdminReply,
    bulkAction,
    getAllReplies,
    deleteAnyReply,
    getPendingCount,
    exportReviews
};
// module.exports = {
//     // Public methods
//     getPublicReviews,
//     getReviewStats,
//     getReplies,
//     getAdminReply,

//     // User authenticated methods
//     addReview,
//     updateUserReview,
//     deleteUserReview,
//     getUserReview,
//     addReply,
//     deleteReply,
//     likeReply,

//     // Admin methods
//     getAllReviews,
//     moderateReview,
//     updateReview,
//     deleteReview,
//     addAdminReply,
//     deleteAdminReply,
//     bulkAction,
//     getAllReplies,
//     deleteAnyReply
// };