const express = require("express");
const authenticate = require("../middleware/auth");
const router = express.Router();

// Add a review
router.post("/", authenticate, async (req, res) => {
    const db = req.db;
    const { product_id, rating, review } = req.body;
    const user_id = req.user.id; // JWT se
    try {
        if (!product_id || !rating || !review) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be 1-5." });
        }

        // Check if user already reviewed this product
        const [existingReview] = await new Promise((resolve, reject) => {
            db.query("SELECT id FROM reviews WHERE product_id=? AND user_id=?", [product_id, user_id], (err, results) => {
                if (err) reject(err); else resolve(results);
            });
        });
        if (existingReview?.length) return res.status(400).json({ success: false, message: "Already reviewed." });

        // Insert review
        db.query(
            "INSERT INTO reviews (product_id, user_id, rating, review) VALUES (?, ?, ?, ?)",
            [product_id, user_id, rating, review],
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: "DB error" });
                res.json({ success: true, message: "Review added.", reviewId: result.insertId });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get reviews for a product (join with users)
router.get("/:productId", (req, res) => {
    const db = req.db;
    const { productId } = req.params;

    const sql = `
        SELECT r.id, r.rating, r.review, r.created_at, r.user_id,
               COALESCE(u.name, 'Anonymous') AS user_name, 
               u.avatar AS user_image,
               u.email AS user_email
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "DB error" });

        // prepend full URL for avatars
        results = results.map(r => ({
            ...r,
            user_image: r.user_image ? `http://localhost:5000/${r.user_image}` : null
        }));

        res.json(results);
    });
});

// Delete a review
router.delete("/:reviewId", authenticate, (req, res) => {
    const db = req.db;
    const { reviewId } = req.params;
    const user_id = req.user.id;

    // First, check if the review exists and belongs to the user
    const checkSql = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";

    db.query(checkSql, [reviewId, user_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            // Review not found or doesn't belong to user
            return res.status(404).json({
                success: false,
                message: "Review not found or you don't have permission to delete it"
            });
        }

        // Delete the review
        const deleteSql = "DELETE FROM reviews WHERE id = ? AND user_id = ?";

        db.query(deleteSql, [reviewId, user_id], (err, result) => {
            if (err) {
                console.error("Delete error:", err);
                return res.status(500).json({ success: false, message: "Failed to delete review" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found"
                });
            }

            res.json({
                success: true,
                message: "Review deleted successfully"
            });
        });
    });
});

// Get user's review for a specific product (optional - for frontend checks)
router.get("/user/:productId", authenticate, (req, res) => {
    const db = req.db;
    const { productId } = req.params;
    const user_id = req.user.id;

    const sql = `
        SELECT r.id, r.rating, r.review, r.created_at
        FROM reviews r
        WHERE r.product_id = ? AND r.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [productId, user_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.json({ success: true, hasReview: false });
        }

        res.json({
            success: true,
            hasReview: true,
            review: results[0]
        });
    });
});

module.exports = router;