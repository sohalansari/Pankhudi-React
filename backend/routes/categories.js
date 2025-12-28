const express = require("express");
const router = express.Router();

/* =====================================================
   CATEGORIES
===================================================== */

/* FEATURED CATEGORIES
   GET /api/categories/featured
*/
router.get("/featured", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM categories WHERE status = 'Active' ORDER BY id DESC LIMIT 6",
        (err, results) => {
            if (err) {
                console.error("❌ Featured Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json(results);
        }
    );
});

/* ALL CATEGORIES
   GET /api/categories
*/
router.get("/", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM categories ORDER BY name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json(results);
        }
    );
});

/* SINGLE CATEGORY
   GET /api/categories/:id
*/
router.get("/:id", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM categories WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) {
                console.error("❌ Single Category Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            if (!results.length) {
                return res.status(404).json({ message: "Category not found" });
            }
            res.json(results[0]);
        }
    );
});

/* =====================================================
   SUB CATEGORIES
===================================================== */

/* ALL SUB CATEGORIES
   GET /api/categories/subcategories
*/
router.get("/subcategories/all", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM sub_categories ORDER BY name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Sub Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json(results);
        }
    );
});

/* SUB CATEGORIES BY CATEGORY ID
   GET /api/categories/subcategories/:categoryId
*/
router.get("/subcategories/:categoryId", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM sub_categories WHERE category_id = ?",
        [req.params.categoryId],
        (err, results) => {
            if (err) {
                console.error("❌ Sub Categories By Category Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json(results);
        }
    );
});

/* =====================================================
   SUB SUB CATEGORIES (FIXED TABLE NAME)
===================================================== */

/* ALL SUB SUB CATEGORIES
   GET /api/categories/subsubcategories
*/
router.get("/subsubcategories/all", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM sub_sub_categories ORDER BY name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Sub Sub Categories SQL Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json(results);
        }
    );
});

/* SUB SUB CATEGORIES BY SUB CATEGORY ID
   GET /api/categories/subsubcategories/:subCategoryId
*/
router.get("/subsubcategories/:subCategoryId", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT * FROM sub_sub_categories WHERE sub_category_id = ?",
        [req.params.subCategoryId],
        (err, results) => {
            if (err) {
                console.error("❌ Sub Sub Categories By Sub Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json(results);
        }
    );
});

module.exports = router;
