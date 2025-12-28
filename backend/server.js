require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

/* ================= ROUTES ================= */
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const productsRoutes = require("./routes/products");
const chatRoutes = require("./routes/chat");
const cartRoutes = require("./routes/cart");
const reviewRoutes = require("./routes/reviews");
const searchRoutes = require("./routes/searchRoutes");
const categoryRoutes = require("./routes/categories");
const bannerRoutes = require("./routes/banner");

const app = express();

/* ================= BODY & CORS ================= */
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

/* ================= DB POOL ================= */
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pankhudi", // ✅ one fixed DB
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
});

/* ================= DB TEST ================= */
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Database connected successfully");
        connection.release();
    }
});

/* ================= DB MIDDLEWARE ================= */
app.use((req, res, next) => {
    req.db = db;
    next();
});

/* ================= STATIC FILES ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../admin/backend/src/uploads")));

/* ================= ROUTES ================= */
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);

/* ================= EXTRA CATEGORY APIs ================= */

// ✅ Sub Categories
app.get("/api/subcategories", (req, res) => {
    const sql = "SELECT * FROM sub_categories ORDER BY id DESC";
    req.db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Subcategories SQL Error:", err.sqlMessage);
            return res.status(500).json({
                message: "Subcategories fetch failed",
                error: err.sqlMessage,
            });
        }
        res.json(results);
    });
});

// ✅ Sub Sub Categories (FIXED TABLE NAME)
app.get("/api/subsubcategories", (req, res) => {
    const sql = "SELECT * FROM sub_sub_categories ORDER BY id DESC";
    req.db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ SubSubCategories SQL Error:", err.sqlMessage);
            return res.status(500).json({
                message: "SubSubCategories fetch failed",
                error: err.sqlMessage,
            });
        }
        res.json(results);
    });
});

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/* ================= FALLBACK ================= */
app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

/* ================= START SERVER ================= */
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🔍 Search API: http://localhost:${port}/api/search`);
});

/* ================= SAFETY ================= */
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
});
