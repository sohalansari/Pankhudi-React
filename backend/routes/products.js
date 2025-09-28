const express = require("express");
const router = express.Router();

// ------------------ Helper: Parse Product ------------------
const parseProduct = (r, req) => {
    let imgs = [];
    try {
        const parsedImages = JSON.parse(r.images);
        imgs = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
    } catch {
        imgs = r.images ? [r.images] : [];
    }

    const discountPrice = r.discount && r.discount > 0
        ? Math.round(r.price * (1 - r.discount / 100))
        : null;

    const createdAt = new Date(r.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const isNew = diffDays <= 10;

    return {
        ...r,
        discountPrice,
        isNew,
        image: imgs.length > 0 ? (imgs[0].startsWith('http') ? imgs[0] : `${req.protocol}://${req.get("host")}/uploads/${imgs[0]}`) : null,
        images: imgs.map(img => img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`)
    };
};

// ------------------ Get All Products ------------------
router.get("/", (req, res) => {
    const db = req.db;
    const sql = "SELECT * FROM products ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json(results.map(r => parseProduct(r, req)));
    });
});

// ------------------ Get Single Product ------------------
router.get("/:id", (req, res) => {
    const db = req.db;
    const sql = "SELECT * FROM products WHERE id = ?";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!results.length) return res.status(404).json({ success: false, message: "Product not found" });

        res.json(parseProduct(results[0], req));
    });
});

// ------------------ Search Products ------------------
router.get("/search", (req, res) => {
    const db = req.db;
    const search = req.query.search || "";
    const sql = "SELECT * FROM products WHERE name LIKE ? LIMIT 10";

    db.query(sql, [`%${search}%`], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json(results.map(r => parseProduct(r, req)));
    });
});

// ------------------ Trending Products ------------------
router.get("/trending", (req, res) => {
    const db = req.db;
    const sql = "SELECT * FROM products ORDER BY created_at DESC LIMIT 5";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json(results.map(r => parseProduct(r, req)));
    });
});

// ------------------ Related Products ------------------
router.get("/related/:category", (req, res) => {
    const db = req.db;
    const category = req.params.category;
    const limit = parseInt(req.query.limit) || 4;
    const excludeId = req.query.exclude || 0;

    const sql = `
        SELECT * FROM products
        WHERE category = ? AND id != ?
        LIMIT ?
    `;
    db.query(sql, [category, excludeId, limit], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json(results.map(r => parseProduct(r, req)));
    });
});

module.exports = router;
