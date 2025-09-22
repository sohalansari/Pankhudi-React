require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/products");
const reportsRoutes = require("./routes/adminReports");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

// ✅ CORS config
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // React ports
    credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/cart", cartRoutes);   // 🛒 cart route enabled

// ✅ Test route
app.get("/", (req, res) => {
    res.send("🚀 Admin backend running...");
});


module.exports = app;
