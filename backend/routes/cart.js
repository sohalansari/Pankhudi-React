const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ------------------- Middleware: Verify Token -------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decodedUser;
        req.user.id = decodedUser.id || decodedUser.userId;
        next();
    });
};

// ------------------- Add to Cart -------------------
router.post("/add", authenticateToken, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID missing from token" });
    if (!product_id || !quantity) return res.status(400).json({ message: "Product ID and quantity required" });

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: "Invalid quantity" });

    const checkProductSql = "SELECT * FROM products WHERE id = ?";
    db.query(checkProductSql, [product_id], (err, productResults) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (productResults.length === 0) return res.status(404).json({ message: "Product not found" });

        const product = productResults[0];
        if (product.stock < qty) return res.status(400).json({ message: `Only ${product.stock} items in stock` });

        const checkCartSql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
        db.query(checkCartSql, [userId, product_id], (err, cartResults) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (cartResults.length > 0) {
                const newQty = cartResults[0].quantity + qty;
                const updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
                db.query(updateSql, [newQty, cartResults[0].id], (err) => {
                    if (err) return res.status(500).json({ message: "Error while updating cart" });
                    return res.status(200).json({
                        message: "Cart updated successfully",
                        cartId: cartResults[0].id,
                        quantity: newQty,
                    });
                });
            } else {
                const insertSql = "INSERT INTO cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())";
                db.query(insertSql, [userId, product_id, qty], (err, insertResult) => {
                    if (err) return res.status(500).json({ message: "Error while adding to cart" });
                    return res.status(200).json({
                        message: "Product added to cart successfully",
                        cartId: insertResult.insertId,
                        quantity: qty,
                    });
                });
            }
        });
    });
});

// ------------------- Get Cart by User -------------------
router.get("/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    const sql = `
        SELECT 
            c.id AS cart_id,
            c.quantity,
            c.added_at,
            p.id AS product_id,
            p.name AS product_name,
            p.price,
            p.discount,
            p.stock,
            p.images,
            CASE 
                WHEN p.discount > 0 THEN ROUND(p.price * (1 - p.discount / 100), 2)
                ELSE p.price
            END AS final_price
        FROM cart c
        INNER JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        const items = results.map((item) => {
            let firstImage = "placeholder.png";
            try {
                const imgs = item.images ? JSON.parse(item.images) : [];
                if (imgs.length > 0) firstImage = imgs[0];
            } catch {
                if (item.images) firstImage = item.images;
            }
            return { ...item, image: `/uploads/${firstImage}` };
        });

        res.json({ message: "Cart fetched successfully", items });
    });
});

// ------------------- Update Quantity -------------------
router.put("/update/:cartId", authenticateToken, (req, res) => {
    const db = req.db;
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) return res.status(400).json({ message: "Invalid quantity" });

    const sql = "UPDATE cart SET quantity = ? WHERE id = ?";
    db.query(sql, [quantity, cartId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Quantity updated successfully" });
    });
});

// ------------------- Delete Item -------------------
router.delete("/delete/:cartId", authenticateToken, (req, res) => {
    const db = req.db;
    const { cartId } = req.params;

    const sql = "DELETE FROM cart WHERE id = ?";
    db.query(sql, [cartId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Item removed from cart" });
    });
});

// ------------------- Get Cart Count -------------------
router.get("/count/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    const sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Cart count error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ count: results[0].count || 0 });
    });
});

module.exports = router;
