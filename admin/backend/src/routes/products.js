const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../config/db");
const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

const BASE_URL = process.env.ADMIN_PUBLIC_URL || "http://localhost:5001";

/* ================================
   ✅ Add product with rating
================================ */
router.post("/add", upload.array("images", 4), (req, res) => {
    const {
        name,
        description,
        price,
        discount,
        stock,
        category_id,
        brand,
        status,
        rating,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name required" });

    const images = (req.files || []).map(
        (f) => `${BASE_URL}/uploads/${f.filename}`
    );

    const sql = `
        INSERT INTO products 
        (name, description, price, discount, stock, category_id, brand, images, status, rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            description || "",
            price || 0,
            discount || 0,
            stock || 0,
            category_id || null,
            brand || "",
            JSON.stringify(images),
            status || "active",
            rating || 0,  // ⭐ default 0
        ],
        (err, result) => {
            if (err) {
                console.error("DB Error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: "Product added",
                id: result.insertId,
                images,
                rating: rating || 0,
            });
        }
    );
});

/* ================================
   ✅ List products
================================ */
router.get("/", (req, res) => {
    const sql = "SELECT * FROM products ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const parsed = results.map((r) => ({
            ...r,
            images: JSON.parse(r.images || "[]"),
        }));
        res.json(parsed);
    });
});

/* ================================
   ✅ Update product with rating
================================ */
router.put("/:id", upload.array("images", 4), (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        price,
        discount,
        stock,
        category_id,
        brand,
        status,
        rating,  // ⭐ added
    } = req.body;

    let oldImages = [];
    if (req.body.oldImages) {
        try {
            oldImages = JSON.parse(req.body.oldImages);
        } catch (e) {
            oldImages = [];
        }
    }

    const newImages = (req.files || []).map(
        (f) => `${BASE_URL}/uploads/${f.filename}`
    );

    const finalImages = [...oldImages, ...newImages];

    const sql = `
        UPDATE products 
        SET name=?, description=?, price=?, discount=?, stock=?, category_id=?, brand=?, status=?, images=?, rating=?, updated_at=NOW()
        WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            description,
            price,
            discount,
            stock,
            category_id,
            brand,
            status,
            JSON.stringify(finalImages),
            rating || 0,
            id,
        ],
        (err, result) => {
            if (err) {
                console.error("Update Error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: "Product updated",
                affectedRows: result.affectedRows,
                images: finalImages,
                rating: rating || 0,
            });
        }
    );
});

/* ================================
   ✅ Delete product
================================ */
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id=?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Delete Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: "Product deleted",
            affectedRows: result.affectedRows,
        });
    });
});

module.exports = router;
