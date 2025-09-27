const express = require("express");
const router = express.Router();

// ------------------- Get All Products -------------------
router.get("/", (req, res) => {
    const db = req.db;
    const sql = "SELECT * FROM products ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const parsed = results.map(r => {
            // Parse images
            let imgs = [];
            try {
                const parsedImages = JSON.parse(r.images);
                imgs = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
            } catch {
                imgs = r.images ? [r.images] : [];
            }

            // Calculate discount price
            const discountPrice = r.discount && r.discount > 0
                ? Math.round(r.price * (1 - r.discount / 100))
                : null;

            return {
                ...r,
                discountPrice, // add discounted price
                images: imgs.map(img => img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`)
            };
        });

        res.json(parsed);
    });
});

// ------------------- Get Single Product -------------------
router.get("/:id", (req, res) => {
    const db = req.db;
    const sql = "SELECT * FROM products WHERE id = ?";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!results.length) return res.status(404).json({ success: false, message: "Product not found" });

        let imgs = [];
        try {
            const parsedImages = JSON.parse(results[0].images);
            imgs = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
        } catch {
            imgs = results[0].images ? [results[0].images] : [];
        }

        const discountPrice = results[0].discount && results[0].discount > 0
            ? Math.round(results[0].price * (1 - results[0].discount / 100))
            : null;

        const product = {
            ...results[0],
            discountPrice,
            images: imgs.map(img => img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`)
        };

        res.json(product);
    });
});

// ------------------- Search Products -------------------
router.get("/search", (req, res) => {
    const db = req.db;
    const search = req.query.search || "";
    const sql = "SELECT * FROM products WHERE name LIKE ? LIMIT 10";

    db.query(sql, [`%${search}%`], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const parsed = results.map(r => {
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

            return {
                ...r,
                discountPrice,
                images: imgs.map(img => img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`)
            };
        });

        res.json(parsed);
    });
});

// ------------------- Trending Products -------------------
router.get("/trending", (req, res) => {
    const db = req.db;
    const sql = "SELECT * FROM products ORDER BY created_at DESC LIMIT 5";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const parsed = results.map(r => {
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

            return {
                ...r,
                discountPrice,
                images: imgs.map(img => img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`)
            };
        });

        res.json(parsed);
    });
});

module.exports = router;
