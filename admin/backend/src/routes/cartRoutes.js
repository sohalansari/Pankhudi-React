const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all cart items
router.get("/", (req, res) => {
    const sql = "SELECT * FROM cart ORDER BY added_at DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error while fetching cart:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        res.status(200).json(results);
    });
});

module.exports = router;
