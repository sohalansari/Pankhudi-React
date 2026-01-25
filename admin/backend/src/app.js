// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require("path");

// const userRoutes = require("./routes/userRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const productRoutes = require("./routes/products");
// const reportsRoutes = require("./routes/adminReports");
// const cartRoutes = require("./routes/cartRoutes");

// // Import category routes
// const categoryRoutes = require("./routes/categories");
// const subCategoryRoutes = require("./routes/subcategories");
// const subSubCategoryRoutes = require("./routes/subsubcategories");
// const bannerRoutes = require('./routes/banner');

// const app = express();

// // ✅ CORS config
// app.use(cors({
//     origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // ✅ Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Static files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ Database Middleware (NEW ADDITION - सिर्फ यह line add करें)
// app.use((req, res, next) => {
//     req.db = require('./config/db');
//     next();
// });

// // ✅ Routes
// app.use("/api/users", userRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/admin/reports", reportsRoutes);
// app.use("/api/cart", cartRoutes);
// app.use('/api/banners', bannerRoutes);

// // ✅ Category Management Routes
// app.use('/api', categoryRoutes);
// app.use('/api', subCategoryRoutes);
// app.use('/api', subSubCategoryRoutes);

// // ✅ Global Statistics Endpoint - FIXED VERSION
// app.get('/api/global-stats', async (req, res) => {
//     try {
//         const db = require('./config/db');

//         // Individual queries - MySQL mein multiple queries single call mein allowed nahi hai
//         const queries = [
//             'SELECT COUNT(*) as total_categories FROM categories',
//             'SELECT COUNT(*) as total_sub_categories FROM sub_categories',
//             'SELECT COUNT(*) as total_sub_sub_categories FROM sub_sub_categories',
//             "SELECT COUNT(*) as active_categories FROM categories WHERE status = 'active'",
//             "SELECT COUNT(*) as active_sub_categories FROM sub_categories WHERE status = 'active'",
//             "SELECT COUNT(*) as active_sub_sub_categories FROM sub_sub_categories WHERE status = 'active'",
//             'SELECT name as latest_category FROM categories ORDER BY created_at DESC LIMIT 1',
//             'SELECT name as latest_sub_category FROM sub_categories ORDER BY created_at DESC LIMIT 1',
//             'SELECT name as latest_sub_sub_category FROM sub_sub_categories ORDER BY created_at DESC LIMIT 1'
//         ];

//         const results = [];

//         // Execute queries one by one
//         for (let i = 0; i < queries.length; i++) {
//             try {
//                 const queryResult = await new Promise((resolve, reject) => {
//                     db.query(queries[i], (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     });
//                 });
//                 results.push(queryResult);
//             } catch (err) {
//                 console.error(`Query ${i + 1} failed:`, err.message);
//                 // Default values for failed queries
//                 results.push([{ [getColumnName(i)]: 0 }]);
//             }
//         }

//         // Helper function to get column name
//         function getColumnName(index) {
//             const columns = [
//                 'total_categories',
//                 'total_sub_categories',
//                 'total_sub_sub_categories',
//                 'active_categories',
//                 'active_sub_categories',
//                 'active_sub_sub_categories',
//                 'latest_category',
//                 'latest_sub_category',
//                 'latest_sub_sub_category'
//             ];
//             return columns[index] || `result_${index}`;
//         }

//         // Extract data from results
//         const stats = {
//             categories: {
//                 total: results[0][0]?.total_categories || 0,
//                 active: results[3][0]?.active_categories || 0,
//                 latest: results[6][0]?.latest_category || 'N/A'
//             },
//             sub_categories: {
//                 total: results[1][0]?.total_sub_categories || 0,
//                 active: results[4][0]?.active_sub_categories || 0,
//                 latest: results[7][0]?.latest_sub_category || 'N/A'
//             },
//             sub_sub_categories: {
//                 total: results[2][0]?.total_sub_sub_categories || 0,
//                 active: results[5][0]?.active_sub_sub_categories || 0,
//                 latest: results[8][0]?.latest_sub_sub_category || 'N/A'
//             },
//             summary: {
//                 total_items: (results[0][0]?.total_categories || 0) +
//                     (results[1][0]?.total_sub_categories || 0) +
//                     (results[2][0]?.total_sub_sub_categories || 0),
//                 active_items: (results[3][0]?.active_categories || 0) +
//                     (results[4][0]?.active_sub_categories || 0) +
//                     (results[5][0]?.active_sub_sub_categories || 0),
//                 last_updated: new Date().toISOString()
//             }
//         };

//         res.json({
//             success: true,
//             data: stats
//         });
//     } catch (error) {
//         console.error('Global stats error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error fetching statistics'
//         });
//     }
// });

// // ✅ Database Health Check Endpoint (NEW ADDITION)
// app.get("/api/db-health", (req, res) => {
//     const db = req.db;

//     db.query('SELECT 1 as test', (error, results) => {
//         if (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Database connection failed",
//                 error: error.message
//             });
//         }

//         res.json({
//             success: true,
//             message: "Database is connected",
//             timestamp: new Date().toISOString()
//         });
//     });
// });

// // ✅ Health Check Endpoint
// app.get("/api/health", (req, res) => {
//     res.json({
//         success: true,
//         message: "Category Management API is running",
//         timestamp: new Date().toISOString(),
//         version: "1.0.0",
//         routes: [
//             "/api/categories",
//             "/api/subcategories",
//             "/api/subsubcategories",
//             "/api/global-stats",
//             "/api/db-health",
//             "/api/banners"
//         ]
//     });
// });

// // ✅ Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//         success: false,
//         message: "Something went wrong!",
//         error: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
// });

// // ✅ 404 handler
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "API endpoint not found"
//     });
// });

// module.exports = app;




require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();

// ✅ File Upload Middleware
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: 4
}));

// ✅ CORS config
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Create uploads directories
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const categoriesDir = path.join(uploadsDir, 'categories');
const subCategoriesDir = path.join(uploadsDir, 'sub_categories');
const subSubCategoriesDir = path.join(uploadsDir, 'sub_sub_categories');

[uploadsDir, categoriesDir, subCategoriesDir, subSubCategoriesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// ✅ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Database Middleware
app.use((req, res, next) => {
    req.db = require('./config/db');
    next();
});

// ✅ Import other routes
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/products");
const reportsRoutes = require("./routes/adminReports");
const cartRoutes = require("./routes/cartRoutes");
const bannerRoutes = require('./routes/banner');

// ✅ Import single category management routes file
const categoryManagementRoutes = require("./routes/categories");

// ✅ Mount routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/banners', bannerRoutes);

// ✅ Mount single category management routes
app.use("/api", categoryManagementRoutes);

// ✅ Global Statistics Endpoint
app.get('/api/global-stats', async (req, res) => {
    try {
        const db = req.db;

        const query = `
            SELECT 
                (SELECT COUNT(*) FROM categories) as total_categories,
                (SELECT COUNT(*) FROM sub_categories) as total_sub_categories,
                (SELECT COUNT(*) FROM sub_sub_categories) as total_sub_sub_categories,
                (SELECT COUNT(*) FROM categories WHERE status = 'active') as active_categories,
                (SELECT COUNT(*) FROM sub_categories WHERE status = 'active') as active_sub_categories,
                (SELECT COUNT(*) FROM sub_sub_categories WHERE status = 'active') as active_sub_sub_categories,
                (SELECT name FROM categories ORDER BY created_at DESC LIMIT 1) as latest_category,
                (SELECT name FROM sub_categories ORDER BY created_at DESC LIMIT 1) as latest_sub_category,
                (SELECT name FROM sub_sub_categories ORDER BY created_at DESC LIMIT 1) as latest_sub_sub_category
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Global stats query error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error fetching statistics'
                });
            }

            const data = results[0];

            const stats = {
                categories: {
                    total: data.total_categories || 0,
                    active: data.active_categories || 0,
                    latest: data.latest_category || 'N/A'
                },
                sub_categories: {
                    total: data.total_sub_categories || 0,
                    active: data.active_sub_categories || 0,
                    latest: data.latest_sub_category || 'N/A'
                },
                sub_sub_categories: {
                    total: data.total_sub_sub_categories || 0,
                    active: data.active_sub_sub_categories || 0,
                    latest: data.latest_sub_sub_category || 'N/A'
                },
                summary: {
                    total_items: (data.total_categories || 0) +
                        (data.total_sub_categories || 0) +
                        (data.total_sub_sub_categories || 0),
                    active_items: (data.active_categories || 0) +
                        (data.active_sub_categories || 0) +
                        (data.active_sub_sub_categories || 0),
                    last_updated: new Date().toISOString()
                }
            };

            res.json({
                success: true,
                data: stats
            });
        });
    } catch (error) {
        console.error('Global stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching statistics'
        });
    }
});

// ✅ File Upload Test Endpoint
app.post('/api/upload-test', (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const image = req.files.image;
        const timestamp = Date.now();
        const filename = `${timestamp}_${image.name.replace(/\s+/g, '_')}`;

        const testDir = path.join(__dirname, 'uploads', 'test');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        const filepath = path.join(testDir, filename);

        image.mv(filepath, (err) => {
            if (err) {
                console.error('File save error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save file'
                });
            }

            res.json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    filename: filename,
                    path: `/uploads/test/${filename}`,
                    size: image.size,
                    mimetype: image.mimetype
                }
            });
        });
    } catch (error) {
        console.error('Upload test error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during upload'
        });
    }
});

// ✅ Database Health Check
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

// ✅ Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        features: {
            fileUpload: true,
            categories: true,
            subcategories: true,
            subsubcategories: true
        },
        routes: {
            categories: "/api/categories",
            subcategories: "/api/subcategories",
            subsubcategories: "/api/subsubcategories",
            globalStats: "/api/global-stats",
            dbHealth: "/api/db-health",
            uploadTest: "/api/upload-test"
        }
    });
});

// ✅ Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: "File size too large. Maximum size is 5MB"
        });
    }

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
        message: "API endpoint not found",
        requestedUrl: req.originalUrl
    });
});

module.exports = app;