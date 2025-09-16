const express = require('express');
const router = express.Router();

// get all products
router.get('/', (req, res) => {
    const db = req.app.locals.db;
    const sql = 'SELECT * FROM products ORDER BY created_at DESC';
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
            return {
                ...r,
                // point to this server’s /uploads
                images: imgs.map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`)
            };
        });

        res.json(parsed);
    });
});

// get single product
router.get('/:id', (req, res) => {
    const db = req.app.locals.db;
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!results.length) return res.status(404).json({ success: false, message: 'Product not found' });

        let imgs = [];
        try {
            const parsedImages = JSON.parse(results[0].images);
            imgs = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
        } catch {
            imgs = results[0].images ? [results[0].images] : [];
        }

        const product = {
            ...results[0],
            images: imgs.map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`)
        };

        res.json(product);
    });
});

module.exports = router;
