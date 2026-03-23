// // ============================================
// // APP.JS - Main Application Configuration
// // ============================================

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");
// const fileUpload = require("express-fileupload");
// const morgan = require("morgan");

// const app = express();

// // ============================================
// // 1. CONFIGURATION
// // ============================================

// // Environment variables
// const NODE_ENV = process.env.NODE_ENV || "development";
// const PORT = process.env.PORT || 5001;
// const CLIENT_URLS = process.env.CLIENT_URLS
//     ? process.env.CLIENT_URLS.split(",")
//     : ["http://localhost:3000", "http://localhost:3001"];

// // Upload directory setup
// const UPLOADS_DIR = path.join(__dirname, "uploads");
// const ensureDirectoryExists = (dir) => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//         console.log(`📁 Created directory: ${dir}`);
//     }
// };
// ensureDirectoryExists(UPLOADS_DIR);

// // ============================================
// // 2. MIDDLEWARE - Core
// // ============================================

// // CORS Configuration
// app.use(cors({
//     origin: CLIENT_URLS,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     exposedHeaders: ["Content-Disposition"]
// }));


// // Increase timeout for large file uploads
// app.use((req, res, next) => {
//     req.setTimeout(300000); // 5 minutes timeout
//     next();
// });

// // Static Files
// app.use("/uploads", express.static(UPLOADS_DIR));

// // Body Parsers
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // File Upload
// app.use(fileUpload({
//     createParentPath: true,
//     limits: { fileSize: 5 * 1024 * 1024 },
//     abortOnLimit: true,
//     responseOnLimit: "File size limit has been reached (5MB)",
//     useTempFiles: true,
//     tempFileDir: path.join(__dirname, 'temp'),
//     parseNested: true,
//     safeFileNames: true,
//     preserveExtension: 4
// }));

// // ============================================
// // 3. MIDDLEWARE - Logging
// // ============================================

// // Request Logger (Development only)
// if (NODE_ENV === "development") {
//     app.use(morgan("dev"));

//     // Custom detailed logger
//     app.use((req, res, next) => {
//         const start = Date.now();
//         res.on("finish", () => {
//             const duration = Date.now() - start;
//             const statusColor = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
//             console.log(
//                 `${statusColor}${req.method}\x1b[0m ${req.url} - ${res.statusCode} - ${duration}ms`
//             );
//         });
//         next();
//     });
// }

// // ============================================
// // 4. MIDDLEWARE - Database
// // ============================================

// app.use((req, res, next) => {
//     try {
//         req.db = require("./config/db");
//         next();
//     } catch (error) {
//         console.error("❌ Database connection error:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Database connection failed",
//             error: NODE_ENV === "development" ? error.message : undefined
//         });
//     }
// });

// // ============================================
// // 5. ROUTES - Import
// // ============================================

// // Main Routes
// const userRoutes = require("./routes/userRoutes");
// const productRoutes = require("./routes/products");
// const reportsRoutes = require("./routes/adminReports");
// const cartRoutes = require("./routes/cartRoutes");
// const bannerRoutes = require("./routes/banner");
// const categoryManagementRoutes = require("./routes/categories");
// const promoCodeRoutes = require("./routes/promoCodeRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");

// // ============================================
// // 6. ROUTES - Mount
// // ============================================

// // API Routes
// app.use("/api/users", userRoutes);
// app.use("/api", dashboardRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/admin/reports", reportsRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/banners", bannerRoutes);
// app.use("/api", categoryManagementRoutes);
// app.use("/api/promocodes", promoCodeRoutes);
// app.use("/api/orders", orderRoutes);

// // ============================================
// // 7. PUBLIC ENDPOINTS
// // ============================================

// // Root Endpoint
// app.get("/", (req, res) => {
//     res.json({
//         success: true,
//         message: "Admin Panel API is running",
//         timestamp: new Date().toISOString(),
//         version: "1.0.0",
//         environment: NODE_ENV,
//         endpoints: {
//             documentation: "See /api/health for available endpoints",
//             health: "/api/health",
//             dashboard: "/api/dashboard",
//             orders: "/api/orders",
//             products: "/api/products",
//             users: "/api/users",
//             categories: "/api/categories",
//             promoCodes: "/api/promocodes"
//         }
//     });
// });

// // Health Check
// app.get("/api/health", (req, res) => {
//     res.json({
//         success: true,
//         message: "API Server is running",
//         timestamp: new Date().toISOString(),
//         version: "1.0.0",
//         environment: NODE_ENV,
//         uptime: process.uptime(),
//         memory: {
//             rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
//             heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
//             heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
//         },
//         features: {
//             fileUpload: true,
//             categories: true,
//             products: true,
//             users: true,
//             promoCodes: true,
//             orders: true,
//             dashboard: true
//         }
//     });
// });

// // Database Health Check
// app.get("/api/db-health", async (req, res) => {
//     const db = req.db;

//     try {
//         // Test basic connection
//         const testResult = await new Promise((resolve, reject) => {
//             db.query("SELECT 1 as connected", (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results);
//             });
//         });

//         // Get order count
//         const orderCount = await new Promise((resolve) => {
//             db.query("SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL", (err, results) => {
//                 resolve(err ? "Error" : results[0]?.count || 0);
//             });
//         });

//         // Get user count
//         const userCount = await new Promise((resolve) => {
//             db.query("SELECT COUNT(*) as count FROM users WHERE is_deleted = 0", (err, results) => {
//                 resolve(err ? "Error" : results[0]?.count || 0);
//             });
//         });

//         res.json({
//             success: true,
//             message: "Database is connected",
//             timestamp: new Date().toISOString(),
//             database: process.env.DB_NAME || "pankhudi",
//             statistics: {
//                 orders: orderCount,
//                 users: userCount,
//                 connection: testResult[0]?.connected === 1 ? "OK" : "Failed"
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Database connection failed",
//             error: error.message
//         });
//     }
// });

// // Global Statistics
// app.get("/api/global-stats", async (req, res) => {
//     const db = req.db;

//     const queries = {
//         categories: "SELECT COUNT(*) as total FROM categories",
//         activeCategories: "SELECT COUNT(*) as count FROM categories WHERE status = 'active'",
//         subCategories: "SELECT COUNT(*) as total FROM sub_categories",
//         activeSubCategories: "SELECT COUNT(*) as count FROM sub_categories WHERE status = 'active'",
//         subSubCategories: "SELECT COUNT(*) as total FROM sub_sub_categories",
//         activeSubSubCategories: "SELECT COUNT(*) as count FROM sub_sub_categories WHERE status = 'active'",
//         promoCodes: "SELECT COUNT(*) as total FROM promo_codes",
//         activePromoCodes: "SELECT COUNT(*) as count FROM promo_codes WHERE is_active = 1",
//         orders: "SELECT COUNT(*) as total FROM orders WHERE deleted_at IS NULL",
//         todayOrders: "SELECT COUNT(*) as count FROM orders WHERE DATE(order_date) = CURDATE() AND deleted_at IS NULL",
//         latestCategory: "SELECT name FROM categories ORDER BY created_at DESC LIMIT 1",
//         latestSubCategory: "SELECT name FROM sub_categories ORDER BY created_at DESC LIMIT 1",
//         latestSubSubCategory: "SELECT name FROM sub_sub_categories ORDER BY created_at DESC LIMIT 1",
//         latestPromo: "SELECT code as name FROM promo_codes ORDER BY created_at DESC LIMIT 1",
//         latestOrder: "SELECT order_number as name FROM orders ORDER BY order_date DESC LIMIT 1"
//     };

//     try {
//         const results = {};
//         for (const [key, query] of Object.entries(queries)) {
//             results[key] = await new Promise((resolve) => {
//                 db.query(query, (err, result) => {
//                     if (err) resolve({ total: 0, count: 0, name: null });
//                     else resolve(result[0]);
//                 });
//             });
//         }

//         const stats = {
//             categories: {
//                 total: results.categories?.total || 0,
//                 active: results.activeCategories?.count || 0,
//                 latest: results.latestCategory?.name || "N/A"
//             },
//             subCategories: {
//                 total: results.subCategories?.total || 0,
//                 active: results.activeSubCategories?.count || 0,
//                 latest: results.latestSubCategory?.name || "N/A"
//             },
//             subSubCategories: {
//                 total: results.subSubCategories?.total || 0,
//                 active: results.activeSubSubCategories?.count || 0,
//                 latest: results.latestSubSubCategory?.name || "N/A"
//             },
//             promoCodes: {
//                 total: results.promoCodes?.total || 0,
//                 active: results.activePromoCodes?.count || 0,
//                 latest: results.latestPromo?.name || "N/A"
//             },
//             orders: {
//                 total: results.orders?.total || 0,
//                 today: results.todayOrders?.count || 0,
//                 latest: results.latestOrder?.name || "N/A"
//             }
//         };

//         res.json({ success: true, data: stats });
//     } catch (error) {
//         console.error("Global stats error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Error fetching statistics",
//             error: error.message
//         });
//     }
// });

// // ============================================
// // 8. TEST ENDPOINTS
// // ============================================

// app.get("/api/orders-test", (req, res) => {
//     res.json({
//         success: true,
//         message: "Orders API is working",
//         timestamp: new Date().toISOString(),
//         endpoints: {
//             list: "GET /api/orders - Get all orders (with filters)",
//             stats: "GET /api/orders/stats - Get order statistics",
//             details: "GET /api/orders/:id - Get single order details",
//             updateStatus: "PUT /api/orders/:id/status - Update order status",
//             updatePayment: "PUT /api/orders/:id/payment - Update payment status",
//             addTracking: "POST /api/orders/:id/tracking - Add tracking information",
//             export: "GET /api/orders/export - Export orders to CSV",
//             returns: "GET /api/orders/returns - Get return requests"
//         }
//     });
// });

// app.get("/api/promocodes-test", (req, res) => {
//     res.json({
//         success: true,
//         message: "Promo Codes API is working",
//         endpoints: [
//             "GET /api/promocodes - List all promo codes",
//             "GET /api/promocodes/:id - Get single promo code",
//             "POST /api/promocodes - Create promo code",
//             "PUT /api/promocodes/:id - Update promo code",
//             "PATCH /api/promocodes/:id/toggle - Toggle promo code status",
//             "DELETE /api/promocodes/:id - Delete promo code",
//             "POST /api/promocodes/validate - Validate promo code",
//             "POST /api/promocodes/:id/use - Use promo code",
//             "GET /api/promocodes/stats/overview - Get promo code statistics"
//         ]
//     });
// });

// // Test Body Endpoint
// app.post("/api/test-body", (req, res) => {
//     res.json({
//         success: true,
//         method: req.method,
//         contentType: req.headers["content-type"],
//         body: req.body,
//         files: req.files ? Object.keys(req.files) : null,
//         timestamp: new Date().toISOString()
//     });
// });

// // Test Upload Endpoint
// app.post("/api/test-upload", (req, res) => {
//     try {
//         if (!req.files || !req.files.image) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No file uploaded"
//             });
//         }

//         const image = req.files.image;
//         const testDir = path.join(UPLOADS_DIR, "test");
//         ensureDirectoryExists(testDir);

//         const uploadPath = path.join(testDir, `${Date.now()}_${image.name}`);

//         image.mv(uploadPath, (err) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Failed to save file",
//                     error: err.message
//                 });
//             }

//             res.json({
//                 success: true,
//                 message: "File uploaded successfully",
//                 data: {
//                     fileName: image.name,
//                     filePath: `/uploads/test/${path.basename(uploadPath)}`,
//                     size: image.size,
//                     mimetype: image.mimetype,
//                     bodyFields: req.body
//                 }
//             });
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message
//         });
//     }
// });

// // Debug Orders Endpoint
// app.get("/api/debug/orders", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT id, order_number, order_status, total_amount, order_date FROM orders WHERE deleted_at IS NULL ORDER BY order_date DESC LIMIT 5",
//         (err, orders) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Error fetching orders",
//                     error: err.message
//                 });
//             }

//             res.json({
//                 success: true,
//                 count: orders?.length || 0,
//                 orders: orders || []
//             });
//         }
//     );
// });

// // ============================================
// // 9. ERROR HANDLING
// // ============================================

// // 404 Handler
// app.use((req, res) => {
//     console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);

//     res.status(404).json({
//         success: false,
//         message: "API endpoint not found",
//         requestedUrl: req.originalUrl,
//         requestedMethod: req.method,
//         timestamp: new Date().toISOString(),
//         availableEndpoints: [
//             "GET /api/health - Health check",
//             "GET /api/db-health - Database health check",
//             "GET /api/global-stats - Global statistics",
//             "GET /api/orders-test - Orders API test",
//             "GET /api/promocodes-test - Promo codes API test",
//             "GET /api/orders - Orders management",
//             "GET /api/products - Products management",
//             "GET /api/users - Users management",
//             "GET /api/categories - Categories management",
//             "POST /api/test-body - Test request body",
//             "POST /api/test-upload - Test file upload"
//         ],
//         note: "Check your HTTP method (GET, POST, PUT, DELETE)"
//     });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//     console.error("🔥 Server Error:", err.stack);

//     // Handle JSON parsing errors
//     if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid JSON in request body"
//         });
//     }

//     // Handle file size limit
//     if (err.code === "LIMIT_FILE_SIZE") {
//         return res.status(413).json({
//             success: false,
//             message: "File size too large. Maximum size is 5MB"
//         });
//     }

//     // Generic error response
//     res.status(err.status || 500).json({
//         success: false,
//         message: err.message || "Internal server error",
//         error: NODE_ENV === "development" ? err.stack : undefined,
//         timestamp: new Date().toISOString()
//     });
// });
// // ✅ Fixed: Removed duplicate fileUpload middleware
// // Global fileUpload already configured above with proper Windows temp path
// console.log('✅ App middleware configured: fileUpload active');

// // ============================================
// // 10. EXPORT
// // ============================================

// module.exports = app;



















// ============================================
// APP.JS - Main Application Configuration
// ============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");

const app = express();

// ============================================
// 1. CONFIGURATION
// ============================================

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5001;
const CLIENT_URLS = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(",")
    : ["http://localhost:3000", "http://localhost:3001"];

// Upload directory setup
const UPLOADS_DIR = path.join(__dirname, "uploads");
const TEMP_DIR = path.join(__dirname, "temp");

const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
};
ensureDirectoryExists(UPLOADS_DIR);
ensureDirectoryExists(TEMP_DIR);

// ============================================
// 2. MIDDLEWARE - Core (IMPORTANT: Order matters!)
// ============================================

// ✅ Increase timeout for large file uploads - MUST be first
app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutes timeout
    res.setTimeout(300000); // 5 minutes timeout
    next();
});

// ✅ CORS Configuration
app.use(cors({
    origin: CLIENT_URLS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Disposition"],
    optionsSuccessStatus: 200
}));

// ✅ Body Parsers - INCREASED LIMITS for large form data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 }));

// ✅ File Upload - INCREASED LIMITS for product images
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB total
        files: 25 // Max 25 files
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached (50MB per file)",
    useTempFiles: true,
    tempFileDir: TEMP_DIR,
    parseNested: true,
    safeFileNames: true,
    preserveExtension: true,
    debug: NODE_ENV === "development", // Enable debug in development
    uploadTimeout: 300000, // 5 minutes upload timeout
    // Allow all file types for products
    fileFilter: (req, file) => {
        // Allow images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            return true;
        }
        return true; // Allow all files for now
    }
}));

// ✅ Add raw body logging for debugging (helps identify incomplete requests)
app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        let bodySize = 0;
        req.on('data', chunk => {
            bodySize += chunk.length;
            if (bodySize > 50 * 1024 * 1024) {
                console.warn(`⚠️ Large request body detected: ${(bodySize / 1024 / 1024).toFixed(2)}MB for ${req.url}`);
            }
        });
        req.on('end', () => {
            if (bodySize > 0) {
                console.log(`📦 Request body size: ${(bodySize / 1024 / 1024).toFixed(2)}MB for ${req.method} ${req.url}`);
            }
        });
    }
    next();
});

// Static Files
app.use("/uploads", express.static(UPLOADS_DIR, {
    maxAge: '1d', // Cache static files for 1 day
    etag: true
}));

// ============================================
// 3. MIDDLEWARE - Logging
// ============================================

// Request Logger (Development only)
if (NODE_ENV === "development") {
    app.use(morgan("dev"));

    // Custom detailed logger
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            const statusColor = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
            console.log(
                `${statusColor}${req.method}\x1b[0m ${req.url} - ${res.statusCode} - ${duration}ms`
            );

            // Log if response time is too high
            if (duration > 5000) {
                console.warn(`⚠️ Slow request: ${req.method} ${req.url} took ${duration}ms`);
            }
        });
        next();
    });
}

// ============================================
// 4. MIDDLEWARE - Database
// ============================================

app.use((req, res, next) => {
    try {
        req.db = require("./config/db");
        next();
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: NODE_ENV === "development" ? error.message : undefined
        });
    }
});

// ============================================
// 5. ROUTES - Import
// ============================================

// Main Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products");
const reportsRoutes = require("./routes/adminReports");
const cartRoutes = require("./routes/cartRoutes");
const bannerRoutes = require("./routes/banner");
const categoryManagementRoutes = require("./routes/categories");
const promoCodeRoutes = require("./routes/promoCodeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ============================================
// 6. ROUTES - Mount
// ============================================

// API Routes
app.use("/api/users", userRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api", categoryManagementRoutes);
app.use("/api/promocodes", promoCodeRoutes);
app.use("/api/orders", orderRoutes);

// ============================================
// 7. PUBLIC ENDPOINTS
// ============================================

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Admin Panel API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: NODE_ENV,
        endpoints: {
            documentation: "See /api/health for available endpoints",
            health: "/api/health",
            dashboard: "/api/dashboard",
            orders: "/api/orders",
            products: "/api/products",
            users: "/api/users",
            categories: "/api/categories",
            promoCodes: "/api/promocodes"
        }
    });
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API Server is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: NODE_ENV,
        uptime: process.uptime(),
        limits: {
            fileSize: "50MB",
            maxFiles: 25,
            bodyLimit: "50MB",
            timeout: "5 minutes"
        },
        memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        features: {
            fileUpload: true,
            categories: true,
            products: true,
            users: true,
            promoCodes: true,
            orders: true,
            dashboard: true
        }
    });
});

// Database Health Check
app.get("/api/db-health", async (req, res) => {
    const db = req.db;

    try {
        // Test basic connection
        const testResult = await new Promise((resolve, reject) => {
            db.query("SELECT 1 as connected", (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Get order count
        const orderCount = await new Promise((resolve) => {
            db.query("SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL", (err, results) => {
                resolve(err ? "Error" : results[0]?.count || 0);
            });
        });

        // Get user count
        const userCount = await new Promise((resolve) => {
            db.query("SELECT COUNT(*) as count FROM users WHERE is_deleted = 0", (err, results) => {
                resolve(err ? "Error" : results[0]?.count || 0);
            });
        });

        res.json({
            success: true,
            message: "Database is connected",
            timestamp: new Date().toISOString(),
            database: process.env.DB_NAME || "pankhudi",
            statistics: {
                orders: orderCount,
                users: userCount,
                connection: testResult[0]?.connected === 1 ? "OK" : "Failed"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// Global Statistics
app.get("/api/global-stats", async (req, res) => {
    const db = req.db;

    const queries = {
        categories: "SELECT COUNT(*) as total FROM categories",
        activeCategories: "SELECT COUNT(*) as count FROM categories WHERE status = 'active'",
        subCategories: "SELECT COUNT(*) as total FROM sub_categories",
        activeSubCategories: "SELECT COUNT(*) as count FROM sub_categories WHERE status = 'active'",
        subSubCategories: "SELECT COUNT(*) as total FROM sub_sub_categories",
        activeSubSubCategories: "SELECT COUNT(*) as count FROM sub_sub_categories WHERE status = 'active'",
        promoCodes: "SELECT COUNT(*) as total FROM promo_codes",
        activePromoCodes: "SELECT COUNT(*) as count FROM promo_codes WHERE is_active = 1",
        orders: "SELECT COUNT(*) as total FROM orders WHERE deleted_at IS NULL",
        todayOrders: "SELECT COUNT(*) as count FROM orders WHERE DATE(order_date) = CURDATE() AND deleted_at IS NULL",
        latestCategory: "SELECT name FROM categories ORDER BY created_at DESC LIMIT 1",
        latestSubCategory: "SELECT name FROM sub_categories ORDER BY created_at DESC LIMIT 1",
        latestSubSubCategory: "SELECT name FROM sub_sub_categories ORDER BY created_at DESC LIMIT 1",
        latestPromo: "SELECT code as name FROM promo_codes ORDER BY created_at DESC LIMIT 1",
        latestOrder: "SELECT order_number as name FROM orders ORDER BY order_date DESC LIMIT 1"
    };

    try {
        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            results[key] = await new Promise((resolve) => {
                db.query(query, (err, result) => {
                    if (err) resolve({ total: 0, count: 0, name: null });
                    else resolve(result[0]);
                });
            });
        }

        const stats = {
            categories: {
                total: results.categories?.total || 0,
                active: results.activeCategories?.count || 0,
                latest: results.latestCategory?.name || "N/A"
            },
            subCategories: {
                total: results.subCategories?.total || 0,
                active: results.activeSubCategories?.count || 0,
                latest: results.latestSubCategory?.name || "N/A"
            },
            subSubCategories: {
                total: results.subSubCategories?.total || 0,
                active: results.activeSubSubCategories?.count || 0,
                latest: results.latestSubSubCategory?.name || "N/A"
            },
            promoCodes: {
                total: results.promoCodes?.total || 0,
                active: results.activePromoCodes?.count || 0,
                latest: results.latestPromo?.name || "N/A"
            },
            orders: {
                total: results.orders?.total || 0,
                today: results.todayOrders?.count || 0,
                latest: results.latestOrder?.name || "N/A"
            }
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Global stats error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching statistics",
            error: error.message
        });
    }
});

// ============================================
// 8. TEST ENDPOINTS
// ============================================

app.get("/api/orders-test", (req, res) => {
    res.json({
        success: true,
        message: "Orders API is working",
        timestamp: new Date().toISOString(),
        endpoints: {
            list: "GET /api/orders - Get all orders (with filters)",
            stats: "GET /api/orders/stats - Get order statistics",
            details: "GET /api/orders/:id - Get single order details",
            updateStatus: "PUT /api/orders/:id/status - Update order status",
            updatePayment: "PUT /api/orders/:id/payment - Update payment status",
            addTracking: "POST /api/orders/:id/tracking - Add tracking information",
            export: "GET /api/orders/export - Export orders to CSV",
            returns: "GET /api/orders/returns - Get return requests"
        }
    });
});

app.get("/api/promocodes-test", (req, res) => {
    res.json({
        success: true,
        message: "Promo Codes API is working",
        endpoints: [
            "GET /api/promocodes - List all promo codes",
            "GET /api/promocodes/:id - Get single promo code",
            "POST /api/promocodes - Create promo code",
            "PUT /api/promocodes/:id - Update promo code",
            "PATCH /api/promocodes/:id/toggle - Toggle promo code status",
            "DELETE /api/promocodes/:id - Delete promo code",
            "POST /api/promocodes/validate - Validate promo code",
            "POST /api/promocodes/:id/use - Use promo code",
            "GET /api/promocodes/stats/overview - Get promo code statistics"
        ]
    });
});

// Test Body Endpoint
app.post("/api/test-body", (req, res) => {
    res.json({
        success: true,
        method: req.method,
        contentType: req.headers["content-type"],
        body: req.body,
        files: req.files ? Object.keys(req.files) : null,
        bodySize: req.rawBody ? req.rawBody.length : 0,
        timestamp: new Date().toISOString()
    });
});

// Test Upload Endpoint (with increased limits)
app.post("/api/test-upload", (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const image = req.files.image;
        const testDir = path.join(UPLOADS_DIR, "test");
        ensureDirectoryExists(testDir);

        const uploadPath = path.join(testDir, `${Date.now()}_${image.name}`);

        image.mv(uploadPath, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to save file",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "File uploaded successfully",
                data: {
                    fileName: image.name,
                    filePath: `/uploads/test/${path.basename(uploadPath)}`,
                    size: image.size,
                    sizeInMB: (image.size / 1024 / 1024).toFixed(2) + "MB",
                    mimetype: image.mimetype,
                    bodyFields: req.body
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});

// Debug Orders Endpoint
app.get("/api/debug/orders", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT id, order_number, order_status, total_amount, order_date FROM orders WHERE deleted_at IS NULL ORDER BY order_date DESC LIMIT 5",
        (err, orders) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching orders",
                    error: err.message
                });
            }

            res.json({
                success: true,
                count: orders?.length || 0,
                orders: orders || []
            });
        }
    );
});

// ============================================
// 9. ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);

    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        requestedUrl: req.originalUrl,
        requestedMethod: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            "GET /api/health - Health check",
            "GET /api/db-health - Database health check",
            "GET /api/global-stats - Global statistics",
            "GET /api/orders-test - Orders API test",
            "GET /api/promocodes-test - Promo codes API test",
            "GET /api/orders - Orders management",
            "GET /api/products - Products management",
            "GET /api/users - Users management",
            "GET /api/categories - Categories management",
            "POST /api/test-body - Test request body",
            "POST /api/test-upload - Test file upload"
        ],
        note: "Check your HTTP method (GET, POST, PUT, DELETE)"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack || err.message);

    // Handle multer errors from product route
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: "Too many files uploaded",
            details: `Maximum ${err.field} files allowed`
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: "File too large",
            details: "Maximum file size is 50MB per file"
        });
    }

    if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(413).json({
            success: false,
            message: "Form data too large",
            details: "Please reduce the number of fields or file sizes"
        });
    }

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body"
        });
    }

    // Handle file size limit from express-fileupload
    if (err.message && err.message.includes("File size limit")) {
        return res.status(413).json({
            success: false,
            message: "File size too large",
            details: "Maximum size is 50MB per file"
        });
    }

    // Handle unexpected end of form
    if (err.message === "Unexpected end of form") {
        return res.status(400).json({
            success: false,
            message: "Form data is incomplete",
            details: "The form submission was cut off. Please check:",
            suggestions: [
                "Try uploading fewer images at once",
                "Reduce the size of images (compress them first)",
                "Check your internet connection",
                "Increase the request timeout in your frontend",
                "Try submitting the form again"
            ]
        });
    }

    // Generic error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        error: NODE_ENV === "development" ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });
});

console.log('✅ App middleware configured: fileUpload active with 50MB limit');

// ============================================
// 10. EXPORT
// ============================================

module.exports = app;