const express = require('express');
const router = express.Router();
const path = require('path');

// GET all
router.get('/', (req, res) => {
    const db = req.app.locals.db;
    const sql = 'SELECT * FROM products ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        const parsed = results.map(r => ({ ...r, images: JSON.parse(r.images || '[]').map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`) }));
        res.json(parsed);
    });
});

// GET by id
router.get('/:id', (req, res) => {
    const db = req.app.locals.db;
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!results.length) return res.status(404).json({ success: false, message: 'Product not found' });
        const product = { ...results[0], images: JSON.parse(results[0].images || '[]').map(img => `${req.protocol}://${req.get('host')}/uploads/${img}`) };
        res.json(product);
    });
});

module.exports = router;
