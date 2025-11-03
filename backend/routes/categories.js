const express = require("express");
const router = express.Router();

// ---------- Get All Categories ----------
router.get("/", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM categories ORDER BY name ASC", (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json(results);
    });
});

// ---------- Get Single Category ----------
router.get("/:id", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM categories WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!results.length) return res.status(404).json({ success: false, message: "Category not found" });
        res.json(results[0]);
    });
});

// ---------- Add New Category ----------
router.post("/", (req, res) => {
    const db = req.db;
    const { name, slug, description, status } = req.body;
    db.query(
        "INSERT INTO categories (name, slug, description, status) VALUES (?, ?, ?, ?)",
        [name, slug, description, status || 'Active'],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Category added successfully", id: result.insertId });
        }
    );
});

// ---------- Update Category ----------
router.put("/:id", (req, res) => {
    const db = req.db;
    const { name, slug, description, status } = req.body;
    db.query(
        "UPDATE categories SET name=?, slug=?, description=?, status=? WHERE id=?",
        [name, slug, description, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Category updated successfully" });
        }
    );
});

// ---------- Delete Category ----------
router.delete("/:id", (req, res) => {
    const db = req.db;
    db.query("DELETE FROM categories WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Category deleted successfully" });
    });
});

module.exports = router;
