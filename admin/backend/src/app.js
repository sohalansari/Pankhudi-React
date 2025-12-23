require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/products");
const reportsRoutes = require("./routes/adminReports");
const cartRoutes = require("./routes/cartRoutes");

// Import category routes
const categoryRoutes = require("./routes/categories");
const subCategoryRoutes = require("./routes/subcategories");
const subSubCategoryRoutes = require("./routes/subsubcategories");
const bannerRoutes = require('./routes/banner');

const app = express();

// ✅ CORS config
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Database Middleware (NEW ADDITION - सिर्फ यह line add करें)
app.use((req, res, next) => {
    req.db = require('./config/db');
    next();
});

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/banners', bannerRoutes);

// ✅ Category Management Routes
app.use('/api', categoryRoutes);
app.use('/api', subCategoryRoutes);
app.use('/api', subSubCategoryRoutes);

// ✅ Global Statistics Endpoint - FIXED VERSION
app.get('/api/global-stats', async (req, res) => {
    try {
        const db = require('./config/db');

        // Individual queries - MySQL mein multiple queries single call mein allowed nahi hai
        const queries = [
            'SELECT COUNT(*) as total_categories FROM categories',
            'SELECT COUNT(*) as total_sub_categories FROM sub_categories',
            'SELECT COUNT(*) as total_sub_sub_categories FROM sub_sub_categories',
            "SELECT COUNT(*) as active_categories FROM categories WHERE status = 'active'",
            "SELECT COUNT(*) as active_sub_categories FROM sub_categories WHERE status = 'active'",
            "SELECT COUNT(*) as active_sub_sub_categories FROM sub_sub_categories WHERE status = 'active'",
            'SELECT name as latest_category FROM categories ORDER BY created_at DESC LIMIT 1',
            'SELECT name as latest_sub_category FROM sub_categories ORDER BY created_at DESC LIMIT 1',
            'SELECT name as latest_sub_sub_category FROM sub_sub_categories ORDER BY created_at DESC LIMIT 1'
        ];

        const results = [];

        // Execute queries one by one
        for (let i = 0; i < queries.length; i++) {
            try {
                const queryResult = await new Promise((resolve, reject) => {
                    db.query(queries[i], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                results.push(queryResult);
            } catch (err) {
                console.error(`Query ${i + 1} failed:`, err.message);
                // Default values for failed queries
                results.push([{ [getColumnName(i)]: 0 }]);
            }
        }

        // Helper function to get column name
        function getColumnName(index) {
            const columns = [
                'total_categories',
                'total_sub_categories',
                'total_sub_sub_categories',
                'active_categories',
                'active_sub_categories',
                'active_sub_sub_categories',
                'latest_category',
                'latest_sub_category',
                'latest_sub_sub_category'
            ];
            return columns[index] || `result_${index}`;
        }

        // Extract data from results
        const stats = {
            categories: {
                total: results[0][0]?.total_categories || 0,
                active: results[3][0]?.active_categories || 0,
                latest: results[6][0]?.latest_category || 'N/A'
            },
            sub_categories: {
                total: results[1][0]?.total_sub_categories || 0,
                active: results[4][0]?.active_sub_categories || 0,
                latest: results[7][0]?.latest_sub_category || 'N/A'
            },
            sub_sub_categories: {
                total: results[2][0]?.total_sub_sub_categories || 0,
                active: results[5][0]?.active_sub_sub_categories || 0,
                latest: results[8][0]?.latest_sub_sub_category || 'N/A'
            },
            summary: {
                total_items: (results[0][0]?.total_categories || 0) +
                    (results[1][0]?.total_sub_categories || 0) +
                    (results[2][0]?.total_sub_sub_categories || 0),
                active_items: (results[3][0]?.active_categories || 0) +
                    (results[4][0]?.active_sub_categories || 0) +
                    (results[5][0]?.active_sub_sub_categories || 0),
                last_updated: new Date().toISOString()
            }
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Global stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching statistics'
        });
    }
});

// ✅ Database Health Check Endpoint (NEW ADDITION)
app.get("/api/db-health", (req, res) => {
    const db = req.db;

    db.query('SELECT 1 as test', (error, results) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: error.message
            });
        }

        res.json({
            success: true,
            message: "Database is connected",
            timestamp: new Date().toISOString()
        });
    });
});

// ✅ Health Check Endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Category Management API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        routes: [
            "/api/categories",
            "/api/subcategories",
            "/api/subsubcategories",
            "/api/global-stats",
            "/api/db-health",
            "/api/banners"
        ]
    });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

module.exports = app;