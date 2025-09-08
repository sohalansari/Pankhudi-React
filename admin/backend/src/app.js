require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/products");

const app = express();

// CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
        if (allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error(`CORS error: ${origin} Not allowed`));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);


// Test route
app.get("/", (req, res) => res.send("Admin backend running"));

module.exports = app;
