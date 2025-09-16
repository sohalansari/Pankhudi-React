require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const productsRoutes = require("./routes/products");
const chatRoutes = require("./routes/chat"); // ✅ added chat route

const app = express();

// body & cors
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

// ✅ DB connection (pool)
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "user_db",
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
});

// attach db to app for routes
app.locals.db = db;

// ✅ serve uploads folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// console.log("📂 Serving static files from:", path.join(__dirname, "uploads"));

// ✅ routes
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
// app.use("/api/products", productsRoutes);
app.use("/api/chat", chatRoutes); // ✅ register chat route




app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Products routes
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);






// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// fallback
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});
