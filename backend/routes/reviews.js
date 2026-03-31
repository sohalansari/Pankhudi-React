// // backend/routes/reviewRoutes.js
// const express = require("express");
// const authenticate = require("../middleware/auth");
// const router = express.Router();

// // ============================================
// // USER REVIEW ROUTES
// // ============================================

// // Add a review
// router.post("/", authenticate, async (req, res) => {
//     const db = req.db;
//     const { product_id, rating, review, approved } = req.body;
//     const user_id = req.user.id;

//     try {
//         if (!product_id || !rating || !review) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required."
//             });
//         }

//         if (rating < 1 || rating > 5) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Rating must be between 1 and 5."
//             });
//         }

//         // Check if user already reviewed
//         const existingReview = await new Promise((resolve, reject) => {
//             db.query(
//                 "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
//                 [product_id, user_id],
//                 (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results);
//                 }
//             );
//         });

//         if (existingReview && existingReview.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "You have already reviewed this product."
//             });
//         }

//         const isApproved = approved !== undefined ? (approved ? 1 : 0) : 1;

//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 "INSERT INTO reviews (product_id, user_id, rating, review, approved, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
//                 [product_id, user_id, rating, review, isApproved],
//                 (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result);
//                 }
//             );
//         });

//         const newReview = await new Promise((resolve, reject) => {
//             db.query(
//                 `SELECT r.id, r.rating, r.review, r.created_at, r.approved,
//                         r.admin_reply, 
//                         DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
//                         COALESCE(u.name, 'Anonymous') AS user_name,
//                         u.avatar AS user_image,
//                         u.id as user_id
//                  FROM reviews r
//                  LEFT JOIN users u ON r.user_id = u.id
//                  WHERE r.id = ?`,
//                 [result.insertId],
//                 (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results[0] || null);
//                 }
//             );
//         });

//         res.json({
//             success: true,
//             message: "Review submitted successfully!",
//             reviewId: result.insertId,
//             review: newReview,
//             approved: isApproved === 1
//         });

//     } catch (err) {
//         console.error("Error adding review:", err);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error."
//         });
//     }
// });

// // Get reviews for a product
// router.get("/:productId", async (req, res) => {
//     const db = req.db;
//     const { productId } = req.params;

//     const sql = `
//         SELECT r.id, r.rating, r.review, r.created_at, r.user_id, r.approved,
//                r.admin_reply, 
//                DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
//                r.admin_reply_by,
//                COALESCE(u.name, 'Anonymous') AS user_name, 
//                u.avatar AS user_image,
//                u.email AS user_email
//         FROM reviews r
//         LEFT JOIN users u ON r.user_id = u.id
//         WHERE r.product_id = ? AND r.approved = 1
//         ORDER BY r.created_at DESC
//     `;

//     db.query(sql, [productId], async (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ success: false, message: "Database error" });
//         }

//         const formattedResults = [];

//         for (const r of results) {
//             const replies = await new Promise((resolve, reject) => {
//                 db.query(
//                     `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
//                             COALESCE(u.name, 'Anonymous') AS user_name,
//                             u.avatar AS user_image,
//                             (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
//                      FROM review_replies rr
//                      LEFT JOIN users u ON rr.user_id = u.id
//                      WHERE rr.review_id = ?
//                      ORDER BY rr.created_at ASC`,
//                     [r.id],
//                     (err, replyResults) => {
//                         if (err) reject(err);
//                         else resolve(replyResults);
//                     }
//                 );
//             });

//             formattedResults.push({
//                 id: r.id,
//                 rating: r.rating,
//                 review: r.review,
//                 created_at: r.created_at,
//                 user_id: r.user_id,
//                 approved: r.approved === 1,
//                 admin_reply: r.admin_reply || null,
//                 admin_reply_date: r.admin_reply_date || null,
//                 user_name: r.user_name,
//                 user_image: r.user_image ? (r.user_image.startsWith('http') ? r.user_image : `http://localhost:5000/${r.user_image}`) : null,
//                 replies: replies || []
//             });
//         }

//         res.json(formattedResults);
//     });
// });

// // ============================================
// // REVIEW REPLIES APIs (CORRECTED ROUTES)
// // ============================================

// // Get replies for a review
// router.get("/:reviewId/replies", (req, res) => {
//     const db = req.db;
//     const { reviewId } = req.params;

//     const sql = `
//         SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
//                COALESCE(u.name, 'Anonymous') AS user_name,
//                u.avatar AS user_image,
//                (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
//         FROM review_replies rr
//         LEFT JOIN users u ON rr.user_id = u.id
//         WHERE rr.review_id = ?
//         ORDER BY rr.created_at ASC
//     `;

//     db.query(sql, [reviewId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ success: false, message: "Database error" });
//         }
//         res.json(results);
//     });
// });

// // Add reply to review
// router.post("/:reviewId/replies", authenticate, async (req, res) => {
//     const db = req.db;
//     const { reviewId } = req.params;
//     const { reply_text } = req.body;
//     const user_id = req.user.id;
//     const user_name = req.user.name || 'Anonymous';

//     if (!reply_text || reply_text.trim() === '') {
//         return res.status(400).json({
//             success: false,
//             message: "Reply text is required"
//         });
//     }

//     try {
//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 "INSERT INTO review_replies (review_id, user_id, reply_text, created_at) VALUES (?, ?, ?, NOW())",
//                 [reviewId, user_id, reply_text],
//                 (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result);
//                 }
//             );
//         });

//         const newReply = await new Promise((resolve, reject) => {
//             db.query(
//                 `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
//                         COALESCE(u.name, 'Anonymous') AS user_name,
//                         u.avatar AS user_image,
//                         (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
//                  FROM review_replies rr
//                  LEFT JOIN users u ON rr.user_id = u.id
//                  WHERE rr.id = ?`,
//                 [result.insertId],
//                 (err, results) => {
//                     if (err) reject(err);
//                     else resolve(results[0]);
//                 }
//             );
//         });

//         res.status(201).json({
//             success: true,
//             message: "Reply added successfully",
//             reply: {
//                 id: newReply.id,
//                 reply_text: newReply.reply_text,
//                 created_at: newReply.created_at,
//                 user_id: newReply.user_id,
//                 user_name: newReply.user_name,
//                 user_image: newReply.user_image ? (newReply.user_image.startsWith('http') ? newReply.user_image : `http://localhost:5000/${newReply.user_image}`) : null,
//                 likes_count: newReply.likes_count || 0
//             }
//         });

//     } catch (err) {
//         console.error("Error adding reply:", err);
//         res.status(500).json({ success: false, message: "Failed to add reply" });
//     }
// });

// // Delete reply - THIS IS THE CORRECT ROUTE FOR DELETE
// router.delete("/replies/:replyId", authenticate, (req, res) => {
//     const db = req.db;
//     const { replyId } = req.params;
//     const user_id = req.user.id;
//     const user_role = req.user.role;

//     const checkSql = "SELECT user_id FROM review_replies WHERE id = ?";

//     db.query(checkSql, [replyId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ success: false, message: "Database error" });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ success: false, message: "Reply not found" });
//         }

//         if (results[0].user_id !== user_id && user_role !== 'admin') {
//             return res.status(403).json({ success: false, message: "You don't have permission to delete this reply" });
//         }

//         const deleteSql = "DELETE FROM review_replies WHERE id = ?";

//         db.query(deleteSql, [replyId], (err, result) => {
//             if (err) {
//                 console.error("Delete error:", err);
//                 return res.status(500).json({ success: false, message: "Failed to delete reply" });
//             }

//             res.json({ success: true, message: "Reply deleted successfully" });
//         });
//     });
// });

// // Like/Unlike reply - THIS IS THE CORRECT ROUTE FOR LIKE
// router.post("/replies/:replyId/like", authenticate, (req, res) => {
//     const db = req.db;
//     const { replyId } = req.params;
//     const user_id = req.user.id;

//     const checkSql = "SELECT * FROM reply_likes WHERE reply_id = ? AND user_id = ?";

//     db.query(checkSql, [replyId, user_id], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ success: false, message: "Database error" });
//         }

//         if (results.length > 0) {
//             // Unlike
//             const deleteSql = "DELETE FROM reply_likes WHERE reply_id = ? AND user_id = ?";

//             db.query(deleteSql, [replyId, user_id], (err) => {
//                 if (err) {
//                     console.error("Unlike error:", err);
//                     return res.status(500).json({ success: false, message: "Failed to unlike reply" });
//                 }

//                 const countSql = "SELECT COUNT(*) as count FROM reply_likes WHERE reply_id = ?";

//                 db.query(countSql, [replyId], (err, countResults) => {
//                     if (err) {
//                         console.error("Count error:", err);
//                         return res.status(500).json({ success: false, message: "Failed to get like count" });
//                     }

//                     res.json({ success: true, liked: false, likes_count: countResults[0].count });
//                 });
//             });
//         } else {
//             // Like
//             const insertSql = "INSERT INTO reply_likes (reply_id, user_id) VALUES (?, ?)";

//             db.query(insertSql, [replyId, user_id], (err) => {
//                 if (err) {
//                     console.error("Like error:", err);
//                     return res.status(500).json({ success: false, message: "Failed to like reply" });
//                 }

//                 const countSql = "SELECT COUNT(*) as count FROM reply_likes WHERE reply_id = ?";

//                 db.query(countSql, [replyId], (err, countResults) => {
//                     if (err) {
//                         console.error("Count error:", err);
//                         return res.status(500).json({ success: false, message: "Failed to get like count" });
//                     }

//                     res.json({ success: true, liked: true, likes_count: countResults[0].count });
//                 });
//             });
//         }
//     });
// });

// // ============================================
// // ADMIN REPLY ROUTES
// // ============================================

// // Add admin reply
// router.post("/:reviewId/admin-reply", authenticate, (req, res) => {
//     const db = req.db;
//     const { reviewId } = req.params;
//     const { admin_reply } = req.body;
//     const user_id = req.user.id;
//     const user_role = req.user.role;

//     if (user_role !== 'admin') {
//         return res.status(403).json({ success: false, message: "Only admins can reply as admin" });
//     }

//     if (!admin_reply || admin_reply.trim() === '') {
//         return res.status(400).json({ success: false, message: "Admin reply text is required" });
//     }

//     const updateSql = `
//         UPDATE reviews 
//         SET admin_reply = ?, 
//             admin_reply_date = NOW(),
//             admin_reply_by = ?
//         WHERE id = ?
//     `;

//     db.query(updateSql, [admin_reply, user_id, reviewId], (err, result) => {
//         if (err) {
//             console.error("Error adding admin reply:", err);
//             return res.status(500).json({ success: false, message: "Failed to add admin reply" });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ success: false, message: "Review not found" });
//         }

//         res.json({ success: true, message: "Admin reply added successfully" });
//     });
// });

// // Delete a review
// router.delete("/:reviewId", authenticate, (req, res) => {
//     const db = req.db;
//     const { reviewId } = req.params;
//     const user_id = req.user.id;

//     const checkSql = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";

//     db.query(checkSql, [reviewId, user_id], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ success: false, message: "Database error" });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ success: false, message: "Review not found or you don't have permission to delete it" });
//         }

//         // Delete replies first
//         db.query("DELETE FROM review_replies WHERE review_id = ?", [reviewId], (err) => {
//             if (err) console.error("Error deleting replies:", err);

//             db.query("DELETE FROM reviews WHERE id = ? AND user_id = ?", [reviewId, user_id], (err, result) => {
//                 if (err) {
//                     console.error("Delete error:", err);
//                     return res.status(500).json({ success: false, message: "Failed to delete review" });
//                 }

//                 res.json({ success: true, message: "Review deleted successfully" });
//             });
//         });
//     });
// });

// module.exports = router;














// backend/routes/reviewRoutes.js
const express = require("express");
const authenticate = require("../middleware/auth");
const router = express.Router();

// ============================================
// USER REVIEW ROUTES
// ============================================

// Add a review - DIRECT APPROVE (No pending)
router.post("/", authenticate, async (req, res) => {
    const db = req.db;
    const { product_id, rating, review, approved } = req.body;
    const user_id = req.user.id;

    try {
        // Validate input
        if (!product_id || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5."
            });
        }

        // Check if user already reviewed this product
        const existingReview = await new Promise((resolve, reject) => {
            db.query(
                "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
                [product_id, user_id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        if (existingReview && existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product."
            });
        }

        const isApproved = approved !== undefined ? (approved ? 1 : 0) : 1;

        const result = await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO reviews (product_id, user_id, rating, review, approved, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
                [product_id, user_id, rating, review, isApproved],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Get the inserted review with FULL user details
        const newReview = await new Promise((resolve, reject) => {
            db.query(
                `SELECT r.id, r.rating, r.review, r.created_at, r.approved,
                        r.admin_reply, 
                        DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
                        COALESCE(u.name, 'Anonymous') AS user_name,
                        u.avatar AS user_image,
                        u.email AS user_email,
                        u.id as user_id
                 FROM reviews r
                 LEFT JOIN users u ON r.user_id = u.id
                 WHERE r.id = ?`,
                [result.insertId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0] || null);
                }
            );
        });

        res.json({
            success: true,
            message: "Review submitted successfully!",
            reviewId: result.insertId,
            review: {
                ...newReview,
                user_image: newReview.user_image ?
                    (newReview.user_image.startsWith('http') ? newReview.user_image : `http://localhost:5000/${newReview.user_image}`) : null
            },
            approved: isApproved === 1
        });

    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// Get reviews for a product with FULL user details
router.get("/:productId", async (req, res) => {
    const db = req.db;
    const { productId } = req.params;

    const sql = `
        SELECT r.id, r.rating, r.review, r.created_at, r.user_id, r.approved,
               r.admin_reply, 
               DATE_FORMAT(r.admin_reply_date, '%Y-%m-%d %H:%i:%s') as admin_reply_date,
               r.admin_reply_by,
               COALESCE(u.name, 'Anonymous') AS user_name, 
               u.avatar AS user_image,
               u.email AS user_email
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ? AND r.approved = 1
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [productId], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        const formattedResults = [];

        for (const r of results) {
            // Fetch replies for this review with FULL user details
            const replies = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
                            COALESCE(u.name, 'Anonymous') AS user_name,
                            u.avatar AS user_image,
                            u.email AS user_email,
                            (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
                     FROM review_replies rr
                     LEFT JOIN users u ON rr.user_id = u.id
                     WHERE rr.review_id = ?
                     ORDER BY rr.created_at ASC`,
                    [r.id],
                    (err, replyResults) => {
                        if (err) reject(err);
                        else resolve(replyResults);
                    }
                );
            });

            formattedResults.push({
                id: r.id,
                rating: r.rating,
                review: r.review,
                created_at: r.created_at,
                user_id: r.user_id,
                approved: r.approved === 1,
                admin_reply: r.admin_reply || null,
                admin_reply_date: r.admin_reply_date || null,
                user_name: r.user_name,
                user_image: r.user_image ?
                    (r.user_image.startsWith('http') ? r.user_image : `http://localhost:5000/${r.user_image}`) : null,
                user_email: r.user_email,
                replies: replies.map(reply => ({
                    ...reply,
                    user_image: reply.user_image ?
                        (reply.user_image.startsWith('http') ? reply.user_image : `http://localhost:5000/${reply.user_image}`) : null
                }))
            });
        }

        res.json(formattedResults);
    });
});

// ============================================
// REVIEW REPLIES APIs
// ============================================

// Get replies for a review with FULL user details
router.get("/:reviewId/replies", (req, res) => {
    const db = req.db;
    const { reviewId } = req.params;

    const sql = `
        SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
               COALESCE(u.name, 'Anonymous') AS user_name,
               u.avatar AS user_image,
               u.email AS user_email,
               (SELECT COUNT(*) FROM reply_likes WHERE reply_id = rr.id) as likes_count
        FROM review_replies rr
        LEFT JOIN users u ON rr.user_id = u.id
        WHERE rr.review_id = ?
        ORDER BY rr.created_at ASC
    `;

    db.query(sql, [reviewId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // Format user images
        const formattedResults = results.map(reply => ({
            ...reply,
            user_image: reply.user_image ?
                (reply.user_image.startsWith('http') ? reply.user_image : `http://localhost:5000/${reply.user_image}`) : null
        }));

        res.json(formattedResults);
    });
});

// Add reply to review with FULL user details
router.post("/:reviewId/replies", authenticate, async (req, res) => {
    const db = req.db;
    const { reviewId } = req.params;
    const { reply_text } = req.body;
    const user_id = req.user.id;
    const user_name = req.user.name || 'Anonymous';

    if (!reply_text || reply_text.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Reply text is required"
        });
    }

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO review_replies (review_id, user_id, reply_text, created_at) VALUES (?, ?, ?, NOW())",
                [reviewId, user_id, reply_text],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Get the inserted reply with FULL user details
        const newReply = await new Promise((resolve, reject) => {
            db.query(
                `SELECT rr.id, rr.reply_text, rr.created_at, rr.user_id,
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

        res.status(201).json({
            success: true,
            message: "Reply added successfully",
            reply: {
                id: newReply.id,
                reply_text: newReply.reply_text,
                created_at: newReply.created_at,
                user_id: newReply.user_id,
                user_name: newReply.user_name,
                user_image: newReply.user_image ?
                    (newReply.user_image.startsWith('http') ? newReply.user_image : `http://localhost:5000/${newReply.user_image}`) : null,
                user_email: newReply.user_email,
                likes_count: newReply.likes_count || 0
            }
        });

    } catch (err) {
        console.error("Error adding reply:", err);
        res.status(500).json({ success: false, message: "Failed to add reply" });
    }
});

// Delete reply
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

// Like/Unlike reply
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
            // Unlike
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
            // Like
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

// ============================================
// ADMIN REPLY ROUTES
// ============================================

// Add admin reply
router.post("/:reviewId/admin-reply", authenticate, (req, res) => {
    const db = req.db;
    const { reviewId } = req.params;
    const { admin_reply } = req.body;
    const user_id = req.user.id;
    const user_role = req.user.role;
    const admin_name = req.user.name || 'Admin';

    if (user_role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only admins can reply as admin" });
    }

    if (!admin_reply || admin_reply.trim() === '') {
        return res.status(400).json({ success: false, message: "Admin reply text is required" });
    }

    const updateSql = `
        UPDATE reviews 
        SET admin_reply = ?, 
            admin_reply_date = NOW(),
            admin_reply_by = ?
        WHERE id = ?
    `;

    db.query(updateSql, [admin_reply, admin_name, reviewId], (err, result) => {
        if (err) {
            console.error("Error adding admin reply:", err);
            return res.status(500).json({ success: false, message: "Failed to add admin reply" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({
            success: true,
            message: "Admin reply added successfully",
            admin_reply: admin_reply,
            admin_reply_date: new Date().toISOString()
        });
    });
});

// Delete a review
router.delete("/:reviewId", authenticate, (req, res) => {
    const db = req.db;
    const { reviewId } = req.params;
    const user_id = req.user.id;

    const checkSql = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";

    db.query(checkSql, [reviewId, user_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Review not found or you don't have permission to delete it" });
        }

        // Delete replies first
        db.query("DELETE FROM review_replies WHERE review_id = ?", [reviewId], (err) => {
            if (err) console.error("Error deleting replies:", err);

            db.query("DELETE FROM reviews WHERE id = ? AND user_id = ?", [reviewId, user_id], (err, result) => {
                if (err) {
                    console.error("Delete error:", err);
                    return res.status(500).json({ success: false, message: "Failed to delete review" });
                }

                res.json({ success: true, message: "Review deleted successfully" });
            });
        });
    });
});

module.exports = router;