// backend/routes/reviewRoutes.js
const express = require("express");
const authenticate = require("../middleware/auth");
const router = express.Router();

// Helper function to format image URL
const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('/uploads')) {
        return `http://localhost:5000${imagePath}`;
    }
    return `http://localhost:5000/uploads/avatars/${imagePath}`;
};

// Helper function to build nested replies structure
const buildNestedReplies = (replies) => {
    const replyMap = {};
    const nestedReplies = [];

    replies.forEach(reply => {
        replyMap[reply.id] = {
            ...reply,
            nested_replies: [],
            user_image: formatImageUrl(reply.user_image)
        };
    });

    replies.forEach(reply => {
        if (reply.parent_reply_id && replyMap[reply.parent_reply_id]) {
            replyMap[reply.parent_reply_id].nested_replies.push(replyMap[reply.id]);
        } else if (!reply.parent_reply_id) {
            nestedReplies.push(replyMap[reply.id]);
        }
    });

    const sortReplies = (replyList) => {
        replyList.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        replyList.forEach(reply => {
            if (reply.nested_replies && reply.nested_replies.length > 0) {
                sortReplies(reply.nested_replies);
            }
        });
    };
    sortReplies(nestedReplies);

    return nestedReplies;
};

// ============================================
// NOTIFICATION HELPER FUNCTION
// ============================================
const createNotification = async (db, userId, type, message, reviewId = null, productId = null, replyId = null) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO notifications (user_id, type, message, review_id, product_id, reply_id, is_read, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())`;
        db.query(sql, [userId, type, message, reviewId, productId, replyId], (err, result) => {
            if (err) {
                console.error("Error creating notification:", err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// ============================================
// GET REVIEWS WITH NESTED REPLIES
// ============================================
router.get("/:productId", async (req, res) => {
    const db = req.db;
    const { productId } = req.params;

    try {
        const reviews = await new Promise((resolve, reject) => {
            db.query(
                `SELECT r.id, r.rating, r.review, r.created_at, r.user_id, r.approved,
                        r.admin_reply, 
                        DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
                        r.admin_reply_by,
                        COALESCE(u.name, 'Anonymous') AS user_name, 
                        u.avatar AS user_image,
                        u.email AS user_email
                 FROM reviews r
                 LEFT JOIN users u ON r.user_id = u.id
                 WHERE r.product_id = ? AND r.approved = 1
                 ORDER BY r.created_at DESC`,
                [productId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        const formattedResults = [];

        for (const review of reviews) {
            const replies = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id, rr.parent_reply_id,
                            COALESCE(u.name, 'Anonymous') AS user_name,
                            u.avatar AS user_image,
                            u.email AS user_email,
                            (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
                     FROM review_replies rr
                     LEFT JOIN users u ON rr.user_id = u.id
                     WHERE rr.review_id = ?
                     ORDER BY rr.created_at ASC`,
                    [review.id],
                    (err, replyResults) => {
                        if (err) reject(err);
                        else resolve(replyResults);
                    }
                );
            });

            const nestedReplies = buildNestedReplies(replies);

            formattedResults.push({
                id: review.id,
                rating: review.rating,
                review: review.review,
                created_at: review.created_at,
                user_id: review.user_id,
                approved: review.approved === 1,
                admin_reply: review.admin_reply || null,
                admin_reply_date: review.admin_reply_date || null,
                user_name: review.user_name,
                user_image: formatImageUrl(review.user_image),
                user_email: review.user_email,
                replies: nestedReplies
            });
        }

        res.json(formattedResults);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
});

// ============================================
// ADD NESTED REPLY WITH NOTIFICATION
// ============================================
// backend/routes/reviewRoutes.js

// ============================================
// ADD NESTED REPLY WITH NOTIFICATION - FIXED
// ============================================
router.post("/replies/:replyId/reply", authenticate, async (req, res) => {
    const db = req.db;
    const { replyId } = req.params;
    const { reply_text } = req.body;
    const user_id = req.user.id;
    // Get the actual user name from the authenticated user
    const user_name = req.user.name || 'Anonymous';

    if (!reply_text || reply_text.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Reply text is required"
        });
    }

    try {
        // Get parent reply details with product info
        const parentReply = await new Promise((resolve, reject) => {
            db.query(
                `SELECT rr.review_id, rr.user_id, rr.reply_text as parent_reply_text,
                        r.product_id,
                        p.name as product_name
                 FROM review_replies rr
                 LEFT JOIN reviews r ON rr.review_id = r.id
                 LEFT JOIN products p ON r.product_id = p.id
                 WHERE rr.id = ?`,
                [replyId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });

        if (!parentReply) {
            return res.status(404).json({
                success: false,
                message: 'Parent reply not found'
            });
        }

        const reviewId = parentReply.review_id;
        const productId = parentReply.product_id;

        // Insert the nested reply
        const result = await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO review_replies (review_id, user_id, reply_text, parent_reply_id, created_at) VALUES (?, ?, ?, ?, NOW())",
                [reviewId, user_id, reply_text, replyId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Get the inserted reply with full user details
        const newReply = await new Promise((resolve, reject) => {
            db.query(
                `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id, rr.parent_reply_id,
                        COALESCE(u.name, 'Anonymous') AS user_name,
                        u.avatar AS user_image,
                        u.email AS user_email,
                        (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
                 FROM review_replies rr
                 LEFT JOIN users u ON rr.user_id = u.id
                 WHERE rr.id = ?`,
                [result.insertId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });

        // Create notification for the user being replied to - USING ACTUAL USER NAME
        if (parentReply.user_id && parentReply.user_id !== user_id) {
            // Get the replying user's name from the database
            const replyingUser = await new Promise((resolve) => {
                db.query(
                    "SELECT name FROM users WHERE id = ?",
                    [user_id],
                    (err, results) => {
                        if (err || !results || results.length === 0) {
                            resolve({ name: user_name });
                        } else {
                            resolve(results[0]);
                        }
                    }
                );
            });

            const replyingUserName = replyingUser.name || user_name;

            // Create a clear notification message with the username
            const shortReply = reply_text.length > 80 ? reply_text.substring(0, 80) + '...' : reply_text;
            const notificationMessage = `${replyingUserName} replied to your comment: "${shortReply}"`;

            await createNotification(
                db,
                parentReply.user_id,
                'reply_mention',
                notificationMessage,
                reviewId,
                productId,
                result.insertId
            );
        }

        const formattedReply = {
            id: newReply.id,
            reply_text: newReply.reply_text,
            created_at: newReply.created_at,
            user_id: newReply.user_id,
            user_name: newReply.user_name,
            user_image: formatImageUrl(newReply.user_image),
            user_email: newReply.user_email,
            parent_reply_id: newReply.parent_reply_id,
            likes_count: newReply.likes_count || 0,
            nested_replies: []
        };

        res.status(201).json({
            success: true,
            message: "Reply added successfully",
            reply: formattedReply
        });

    } catch (err) {
        console.error("Error adding nested reply:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add reply",
            error: err.message
        });
    }
});

// ============================================
// ADD TOP-LEVEL REPLY WITH NOTIFICATION - FIXED
// ============================================
router.post("/:reviewId/replies", authenticate, async (req, res) => {
    const db = req.db;
    const { reviewId } = req.params;
    const { reply_text, parent_reply_id = null } = req.body;
    const user_id = req.user.id;
    const user_name = req.user.name || 'Anonymous';

    if (!reply_text || reply_text.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Reply text is required"
        });
    }

    try {
        // Get review details for notification
        const reviewDetails = await new Promise((resolve, reject) => {
            db.query(
                `SELECT r.user_id, r.product_id, p.name as product_name
                 FROM reviews r
                 LEFT JOIN products p ON r.product_id = p.id
                 WHERE r.id = ?`,
                [reviewId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });

        const result = await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO review_replies (review_id, user_id, reply_text, parent_reply_id, created_at) VALUES (?, ?, ?, ?, NOW())",
                [reviewId, user_id, reply_text, parent_reply_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        const newReply = await new Promise((resolve, reject) => {
            db.query(
                `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id, rr.parent_reply_id,
                        COALESCE(u.name, 'Anonymous') AS user_name,
                        u.avatar AS user_image,
                        u.email AS user_email,
                        (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
                 FROM review_replies rr
                 LEFT JOIN users u ON rr.user_id = u.id
                 WHERE rr.id = ?`,
                [result.insertId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });

        // Create notification for review owner - USING ACTUAL USER NAME
        if (reviewDetails && reviewDetails.user_id && reviewDetails.user_id !== user_id) {
            // Get the replying user's name from the database
            const replyingUser = await new Promise((resolve) => {
                db.query(
                    "SELECT name FROM users WHERE id = ?",
                    [user_id],
                    (err, results) => {
                        if (err || !results || results.length === 0) {
                            resolve({ name: user_name });
                        } else {
                            resolve(results[0]);
                        }
                    }
                );
            });

            const replyingUserName = replyingUser.name || user_name;

            // Create a clear notification message with the username
            const shortReply = reply_text.length > 80 ? reply_text.substring(0, 80) + '...' : reply_text;
            const notificationMessage = `${replyingUserName} replied to your review: "${shortReply}"`;

            await createNotification(
                db,
                reviewDetails.user_id,
                'reply',
                notificationMessage,
                reviewId,
                reviewDetails.product_id,
                result.insertId
            );
        }

        const formattedReply = {
            id: newReply.id,
            reply_text: newReply.reply_text,
            created_at: newReply.created_at,
            user_id: newReply.user_id,
            user_name: newReply.user_name,
            user_image: formatImageUrl(newReply.user_image),
            user_email: newReply.user_email,
            parent_reply_id: newReply.parent_reply_id,
            likes_count: newReply.likes_count || 0,
            nested_replies: []
        };

        res.status(201).json({
            success: true,
            message: "Reply added successfully",
            reply: formattedReply
        });

    } catch (err) {
        console.error("Error adding reply:", err);
        res.status(500).json({ success: false, message: "Failed to add reply" });
    }
});
// ============================================
// GET USER NOTIFICATIONS - FIXED
// ============================================
router.get("/notifications/:userId", authenticate, async (req, res) => {
    const db = req.db;
    const { userId } = req.params;
    const user_id = req.user.id;

    if (parseInt(userId) !== user_id) {
        return res.status(403).json({
            success: false,
            message: "You can only view your own notifications"
        });
    }

    try {
        // First check if table exists and has correct structure
        const tableCheck = await new Promise((resolve) => {
            db.query("SHOW TABLES LIKE 'notifications'", (err, results) => {
                resolve(results && results.length > 0);
            });
        });

        if (!tableCheck) {
            return res.json({
                success: true,
                notifications: [],
                unreadCount: 0
            });
        }

        // Get notifications with proper error handling
        const notifications = await new Promise((resolve, reject) => {
            db.query(
                `SELECT n.id, n.type, n.message, n.review_id, n.product_id, n.reply_id, n.is_read, n.created_at
                 FROM notifications n
                 WHERE n.user_id = ?
                 ORDER BY n.created_at DESC
                 LIMIT 50`,
                [userId],
                (err, results) => {
                    if (err) {
                        console.error("Error fetching notifications:", err);
                        resolve([]);
                    } else {
                        resolve(results || []);
                    }
                }
            );
        });

        // Get unread count
        const unreadResult = await new Promise((resolve) => {
            db.query(
                "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
                [userId],
                (err, results) => {
                    if (err) {
                        resolve({ count: 0 });
                    } else {
                        resolve(results[0] || { count: 0 });
                    }
                }
            );
        });

        // Get product names for notifications that have product_id
        const notificationsWithProducts = [];
        for (const notif of notifications) {
            let productName = null;
            let productImages = null;

            if (notif.product_id) {
                const product = await new Promise((resolve) => {
                    db.query(
                        "SELECT name, images FROM products WHERE id = ?",
                        [notif.product_id],
                        (err, results) => {
                            if (err || !results || results.length === 0) {
                                resolve(null);
                            } else {
                                resolve(results[0]);
                            }
                        }
                    );
                });

                if (product) {
                    productName = product.name;
                    productImages = product.images;
                }
            }

            notificationsWithProducts.push({
                ...notif,
                product_name: productName,
                product_images: productImages
            });
        }

        res.json({
            success: true,
            notifications: notificationsWithProducts,
            unreadCount: unreadResult.count || 0
        });

    } catch (err) {
        console.error("Error in notifications endpoint:", err);
        res.json({
            success: true,
            notifications: [],
            unreadCount: 0
        });
    }
});

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
router.put("/notifications/:id/read", authenticate, async (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const notification = await new Promise((resolve, reject) => {
            db.query(
                "SELECT user_id FROM notifications WHERE id = ?",
                [id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (notification.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: "You can only mark your own notifications as read"
            });
        }

        await new Promise((resolve, reject) => {
            db.query(
                "UPDATE notifications SET is_read = TRUE WHERE id = ?",
                [id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        res.json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({
            success: false,
            message: "Error marking notification as read"
        });
    }
});

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================
router.put("/notifications/:userId/read-all", authenticate, async (req, res) => {
    const db = req.db;
    const { userId } = req.params;
    const user_id = req.user.id;

    if (parseInt(userId) !== user_id) {
        return res.status(403).json({
            success: false,
            message: "You can only mark your own notifications as read"
        });
    }

    try {
        await new Promise((resolve, reject) => {
            db.query(
                "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
                [userId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({
            success: false,
            message: "Error marking notifications as read"
        });
    }
});

// ============================================
// DELETE NOTIFICATION
// ============================================
router.delete("/notifications/:id", authenticate, async (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const notification = await new Promise((resolve, reject) => {
            db.query(
                "SELECT user_id FROM notifications WHERE id = ?",
                [id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (notification.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own notifications"
            });
        }

        await new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM notifications WHERE id = ?",
                [id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        res.json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({
            success: false,
            message: "Error deleting notification"
        });
    }
});

// ============================================
// DELETE REPLY (with notification cleanup)
// ============================================
router.delete("/replies/:replyId", authenticate, (req, res) => {
    const db = req.db;
    const { replyId } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const checkSql = "SELECT user_id FROM review_replies WHERE id = ?";

    db.query(checkSql, [replyId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Reply not found" });
        }

        if (results[0].user_id !== user_id && user_role !== 'admin') {
            return res.status(403).json({ success: false, message: "You don't have permission to delete this reply" });
        }

        // Delete related notifications
        db.query("DELETE FROM notifications WHERE reply_id = ?", [replyId], (err) => {
            if (err) console.error("Error deleting notification:", err);

            // Delete nested replies
            db.query("DELETE FROM review_replies WHERE parent_reply_id = ?", [replyId], (err) => {
                if (err) console.error("Error deleting nested replies:", err);

                const deleteSql = "DELETE FROM review_replies WHERE id = ?";

                db.query(deleteSql, [replyId], (err, result) => {
                    if (err) {
                        console.error("Delete error:", err);
                        return res.status(500).json({ success: false, message: "Failed to delete reply" });
                    }

                    res.json({ success: true, message: "Reply deleted successfully" });
                });
            });
        });
    });
});

// ============================================
// LIKE/UNLIKE REPLY
// ============================================
router.post("/replies/:replyId/like", authenticate, (req, res) => {
    const db = req.db;
    const { replyId } = req.params;
    const user_id = req.user.id;

    const checkSql = "SELECT * FROM reply_likes WHERE reply_id = ? AND user_id = ?";

    db.query(checkSql, [replyId, user_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            const deleteSql = "DELETE FROM reply_likes WHERE reply_id = ? AND user_id = ?";

            db.query(deleteSql, [replyId, user_id], (err) => {
                if (err) {
                    console.error("Unlike error:", err);
                    return res.status(500).json({ success: false, message: "Failed to unlike reply" });
                }

                const countSql = "SELECT COUNT(*) as count FROM reply_likes WHERE reply_id = ?";

                db.query(countSql, [replyId], (err, countResults) => {
                    if (err) {
                        console.error("Count error:", err);
                        return res.status(500).json({ success: false, message: "Failed to get like count" });
                    }

                    res.json({ success: true, liked: false, likes_count: countResults[0].count });
                });
            });
        } else {
            const insertSql = "INSERT INTO reply_likes (reply_id, user_id) VALUES (?, ?)";

            db.query(insertSql, [replyId, user_id], (err) => {
                if (err) {
                    console.error("Like error:", err);
                    return res.status(500).json({ success: false, message: "Failed to like reply" });
                }

                const countSql = "SELECT COUNT(*) as count FROM reply_likes WHERE reply_id = ?";

                db.query(countSql, [replyId], (err, countResults) => {
                    if (err) {
                        console.error("Count error:", err);
                        return res.status(500).json({ success: false, message: "Failed to get like count" });
                    }

                    res.json({ success: true, liked: true, likes_count: countResults[0].count });
                });
            });
        }
    });
});

module.exports = router;