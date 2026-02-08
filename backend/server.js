// require("dotenv").config();
// const express = require("express");
// const mysql = require("mysql");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const path = require("path");

// /* ================= ROUTES ================= */
// const authRoutes = require("./routes/auth");
// const profileRoutes = require("./routes/profile");
// const productsRoutes = require("./routes/products");
// const chatRoutes = require("./routes/chat");
// const cartRoutes = require("./routes/cart");
// const reviewRoutes = require("./routes/reviews");
// const searchRoutes = require("./routes/searchRoutes");
// const categoryRoutes = require("./routes/categories");
// const bannerRoutes = require("./routes/banner");



// const app = express();

// /* ================= BODY & CORS ================= */
// app.use(bodyParser.json({ limit: "5mb" }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         credentials: true,
//     })
// );

// /* ================= DB POOL ================= */
// const db = mysql.createPool({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "pankhudi", // ✅ one fixed DB
//     port: process.env.DB_PORT || 3306,
//     connectionLimit: 10,
// });

// /* ================= DB TEST ================= */
// db.getConnection((err, connection) => {
//     if (err) {
//         console.error("❌ Database connection failed:", err.message);
//     } else {
//         console.log("✅ Database connected successfully");
//         connection.release();
//     }
// });

// /* ================= DB MIDDLEWARE ================= */
// app.use((req, res, next) => {
//     req.db = db;
//     next();
// });

// /* ================= STATIC FILES ================= */
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "../admin/backend/src/uploads")));

// /* ================= ROUTES ================= */
// app.use("/api", authRoutes);
// app.use("/api", profileRoutes);
// app.use("/api/products", productsRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/search", searchRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/banners", bannerRoutes);

// /* ================= EXTRA CATEGORY APIs ================= */

// // ✅ Sub Categories
// app.get("/api/subcategories", (req, res) => {
//     const sql = "SELECT * FROM sub_categories ORDER BY id DESC";
//     req.db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ Subcategories SQL Error:", err.sqlMessage);
//             return res.status(500).json({
//                 message: "Subcategories fetch failed",
//                 error: err.sqlMessage,
//             });
//         }
//         res.json(results);
//     });
// });

// // ✅ Sub Sub Categories (FIXED TABLE NAME)
// app.get("/api/subsubcategories", (req, res) => {
//     const sql = "SELECT * FROM sub_sub_categories ORDER BY id DESC";
//     req.db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ SubSubCategories SQL Error:", err.sqlMessage);
//             return res.status(500).json({
//                 message: "SubSubCategories fetch failed",
//                 error: err.sqlMessage,
//             });
//         }
//         res.json(results);
//     });
// });

// /* ================= HEALTH CHECK ================= */
// app.get("/health", (req, res) => {
//     res.json({ status: "ok" });
// });

// /* ================= FALLBACK ================= */
// app.use((req, res) => {
//     res.status(404).json({ message: "Not found" });
// });

// /* ================= START SERVER ================= */
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//     console.log(`🚀 Server running on http://localhost:${port}`);
//     console.log(`🔍 Search API: http://localhost:${port}/api/search`);
// });

// /* ================= SAFETY ================= */
// process.on("unhandledRejection", (reason) => {
//     console.error("❌ Unhandled Rejection:", reason);
// });



// require("dotenv").config();
// const express = require("express");
// const mysql = require("mysql");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const path = require("path");

// /* ================= ROUTES ================= */
// const authRoutes = require("./routes/auth");
// const profileRoutes = require("./routes/profile");
// const productsRoutes = require("./routes/products");
// const chatRoutes = require("./routes/chat");
// const cartRoutes = require("./routes/cart");
// const reviewRoutes = require("./routes/reviews");
// const searchRoutes = require("./routes/searchRoutes");
// const categoryRoutes = require("./routes/categories");
// const bannerRoutes = require("./routes/banner");

// // ✅ NEW CHECKOUT-RELATED ROUTES
// const orderRoutes = require("./routes/orderRoutes");
// const userRoutes = require("./routes/userRoutes");
// const productDetailRoutes = require("./routes/productDetailRoutes");

// const app = express();

// /* ================= BODY & CORS ================= */
// app.use(bodyParser.json({ limit: "5mb" }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization"]
//     })
// );

// /* ================= DB POOL WITH ENHANCED CONFIG ================= */
// const db = mysql.createPool({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "pankhudi",
//     port: process.env.DB_PORT || 3306,
//     connectionLimit: 20,
//     waitForConnections: true,
//     queueLimit: 0,
//     enableKeepAlive: true,
//     keepAliveInitialDelay: 0,
//     charset: 'utf8mb4',
//     timezone: 'local'
// });

// /* ================= DB TEST WITH RETRY LOGIC ================= */
// const testDatabaseConnection = (retries = 3, delay = 2000) => {
//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error("❌ Database connection failed:", err.message);

//             if (retries > 0) {
//                 console.log(`🔄 Retrying connection... (${retries} attempts left)`);
//                 setTimeout(() => testDatabaseConnection(retries - 1, delay), delay);
//             } else {
//                 console.error("💥 Failed to connect to database after multiple attempts");
//             }
//         } else {
//             console.log("✅ Database connected successfully");

//             // Test query to ensure tables exist
//             connection.query("SELECT 1", (queryErr) => {
//                 if (queryErr) {
//                     console.error("⚠️ Database query test failed:", queryErr.message);
//                 } else {
//                     console.log("✅ Database query test successful");
//                 }
//                 connection.release();
//             });
//         }
//     });
// };

// testDatabaseConnection();

// /* ================= ENHANCED DB MIDDLEWARE ================= */
// app.use((req, res, next) => {
//     req.db = db;

//     // Add query helper methods
//     req.db.queryAsync = (sql, params) => {
//         return new Promise((resolve, reject) => {
//             db.query(sql, params, (err, results) => {
//                 if (err) {
//                     console.error("Database Query Error:", err);
//                     reject(err);
//                 } else {
//                     resolve(results);
//                 }
//             });
//         });
//     };

//     next();
// });

// /* ================= ERROR HANDLING MIDDLEWARE ================= */
// app.use((err, req, res, next) => {
//     console.error("🚨 Server Error:", err.stack);

//     if (err.code === 'ECONNREFUSED') {
//         return res.status(503).json({
//             success: false,
//             message: "Database connection failed. Please try again later."
//         });
//     }

//     if (err.code === 'ER_NO_SUCH_TABLE') {
//         return res.status(500).json({
//             success: false,
//             message: "Database table not found. Please check your database setup."
//         });
//     }

//     res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
// });

// /* ================= STATIC FILES ================= */
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "../admin/backend/src/uploads")));

// // Serve static images for products
// app.use("/product-images", express.static(path.join(__dirname, "uploads/products")));

// // Serve placeholder image
// app.get("/images/placeholder-product.jpg", (req, res) => {
//     res.sendFile(path.join(__dirname, "public/images/placeholder-product.jpg"));
// });

// /* ================= API ROUTES ================= */
// console.log("📦 Loading API routes...");

// // Existing routes
// app.use("/api", authRoutes);
// app.use("/api", profileRoutes);
// app.use("/api/products", productsRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/search", searchRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/banners", bannerRoutes);

// // ✅ NEW CHECKOUT-RELATED ROUTES
// app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/product-details", productDetailRoutes);

// console.log("✅ All routes loaded successfully");

// /* ================= EXTRA CATEGORY APIs ================= */
// console.log("📂 Loading category APIs...");

// // ✅ Sub Categories
// app.get("/api/subcategories", (req, res) => {
//     const sql = "SELECT * FROM sub_categories WHERE status = 'active' ORDER BY id DESC";
//     req.db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ Subcategories SQL Error:", err.message);
//             return res.status(500).json({
//                 success: false,
//                 message: "Subcategories fetch failed",
//                 error: process.env.NODE_ENV === 'development' ? err.message : undefined
//             });
//         }
//         res.json({
//             success: true,
//             data: results
//         });
//     });
// });

// // ✅ Sub Sub Categories
// app.get("/api/subsubcategories", (req, res) => {
//     const sql = "SELECT * FROM sub_sub_categories WHERE status = 'active' ORDER BY id DESC";
//     req.db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ SubSubCategories SQL Error:", err.message);
//             return res.status(500).json({
//                 success: false,
//                 message: "SubSubCategories fetch failed",
//                 error: process.env.NODE_ENV === 'development' ? err.message : undefined
//             });
//         }
//         res.json({
//             success: true,
//             data: results
//         });
//     });
// });

// // ✅ Get All Categories with Hierarchy (NEW)
// app.get("/api/categories/hierarchy", (req, res) => {
//     const sql = `
//         SELECT 
//             c.id as category_id,
//             c.name as category_name,
//             c.slug as category_slug,
//             sc.id as sub_category_id,
//             sc.name as sub_category_name,
//             sc.slug as sub_category_slug,
//             ssc.id as sub_sub_category_id,
//             ssc.name as sub_sub_category_name,
//             ssc.slug as sub_sub_category_slug
//         FROM categories c
//         LEFT JOIN sub_categories sc ON c.id = sc.category_id AND sc.status = 'active'
//         LEFT JOIN sub_sub_categories ssc ON sc.id = ssc.sub_category_id AND ssc.status = 'active'
//         WHERE c.status = 'active'
//         ORDER BY c.id, sc.id, ssc.id
//     `;

//     req.db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ Categories hierarchy error:", err.message);
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch categories hierarchy"
//             });
//         }

//         // Organize into hierarchical structure
//         const categories = {};
//         results.forEach(row => {
//             if (!categories[row.category_id]) {
//                 categories[row.category_id] = {
//                     id: row.category_id,
//                     name: row.category_name,
//                     slug: row.category_slug,
//                     sub_categories: {}
//                 };
//             }

//             if (row.sub_category_id && !categories[row.category_id].sub_categories[row.sub_category_id]) {
//                 categories[row.category_id].sub_categories[row.sub_category_id] = {
//                     id: row.sub_category_id,
//                     name: row.sub_category_name,
//                     slug: row.sub_category_slug,
//                     sub_sub_categories: []
//                 };
//             }

//             if (row.sub_sub_category_id) {
//                 categories[row.category_id].sub_categories[row.sub_category_id].sub_sub_categories.push({
//                     id: row.sub_sub_category_id,
//                     name: row.sub_sub_category_name,
//                     slug: row.sub_sub_category_slug
//                 });
//             }
//         });

//         res.json({
//             success: true,
//             data: Object.values(categories)
//         });
//     });
// });

// console.log("✅ Category APIs loaded");

// /* ================= CHECKOUT HELPER APIs ================= */
// console.log("🛒 Loading checkout helper APIs...");

// // ✅ Get Shipping Methods
// app.get("/api/shipping-methods", (req, res) => {
//     const shippingMethods = [
//         {
//             id: "standard",
//             name: "Standard Shipping",
//             description: "Delivery in 5-7 business days",
//             cost: 50,
//             estimated_days: "5-7"
//         },
//         {
//             id: "express",
//             name: "Express Shipping",
//             description: "Delivery in 2-3 business days",
//             cost: 100,
//             estimated_days: "2-3"
//         },
//         {
//             id: "free",
//             name: "Free Shipping",
//             description: "Delivery in 7-10 business days",
//             cost: 0,
//             estimated_days: "7-10",
//             min_order: 500
//         }
//     ];

//     res.json({
//         success: true,
//         data: shippingMethods
//     });
// });

// // ✅ Get Payment Methods
// app.get("/api/payment-methods", (req, res) => {
//     const paymentMethods = [
//         {
//             id: "cod",
//             name: "Cash on Delivery",
//             description: "Pay when you receive the product",
//             available: true,
//             icon: "💵"
//         },
//         {
//             id: "card",
//             name: "Credit/Debit Card",
//             description: "Pay securely with your card",
//             available: true,
//             icon: "💳"
//         },
//         {
//             id: "upi",
//             name: "UPI",
//             description: "Pay using UPI apps",
//             available: true,
//             icon: "📱"
//         },
//         {
//             id: "netbanking",
//             name: "Net Banking",
//             description: "Pay via online banking",
//             available: true,
//             icon: "🏦"
//         }
//     ];

//     res.json({
//         success: true,
//         data: paymentMethods
//     });
// });

// // ✅ Validate Promo Code
// app.post("/api/promo/validate", (req, res) => {
//     const { promoCode } = req.body;

//     // Mock promo codes - in production, query from database
//     const validPromoCodes = {
//         "WELCOME10": { discount: 10, minOrder: 0, maxDiscount: 500, type: "percentage" },
//         "SAVE20": { discount: 20, minOrder: 1000, maxDiscount: 1000, type: "percentage" },
//         "FREESHIP": { discount: 0, freeShipping: true, minOrder: 500, type: "shipping" },
//         "FLAT100": { discount: 100, minOrder: 500, maxDiscount: 100, type: "fixed" }
//     };

//     const code = promoCode?.toUpperCase().trim();

//     if (validPromoCodes[code]) {
//         res.json({
//             success: true,
//             valid: true,
//             promo: validPromoCodes[code],
//             message: "Promo code applied successfully"
//         });
//     } else {
//         res.json({
//             success: false,
//             valid: false,
//             message: "Invalid or expired promo code"
//         });
//     }
// });

// // ✅ Get Checkout Summary (for cart validation)
// app.post("/api/checkout/summary", async (req, res) => {
//     try {
//         const { items, shippingMethod = "standard" } = req.body;

//         if (!items || !Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Items are required"
//             });
//         }

//         // Calculate totals
//         let subtotal = 0;
//         let discountTotal = 0;
//         let hasFreeShipping = false;

//         for (const item of items) {
//             const price = parseFloat(item.price || 0);
//             const quantity = parseInt(item.quantity || 1);
//             const discount = parseFloat(item.discount || 0);

//             const itemTotal = price * quantity;
//             subtotal += itemTotal;

//             if (discount > 0) {
//                 discountTotal += (price * discount / 100) * quantity;
//             }

//             if (item.free_shipping) {
//                 hasFreeShipping = true;
//             }
//         }

//         // Calculate shipping
//         let shipping = 0;
//         if (!hasFreeShipping) {
//             shipping = shippingMethod === "express" ? 100 : 50;
//         }

//         const tax = subtotal * 0.18; // 18% GST
//         const total = subtotal + shipping + tax - discountTotal;

//         res.json({
//             success: true,
//             summary: {
//                 subtotal: subtotal.toFixed(2),
//                 shipping: shipping.toFixed(2),
//                 tax: tax.toFixed(2),
//                 discount: discountTotal.toFixed(2),
//                 total: total.toFixed(2),
//                 hasFreeShipping,
//                 itemsCount: items.length
//             }
//         });

//     } catch (error) {
//         console.error("Checkout summary error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to calculate checkout summary"
//         });
//     }
// });

// console.log("✅ Checkout helper APIs loaded");

// /* ================= DATABASE HEALTH CHECK ================= */
// app.get("/api/db-health", (req, res) => {
//     const requiredTables = [
//         'users', 'products', 'cart', 'orders', 'order_items',
//         'categories', 'sub_categories', 'sub_sub_categories',
//         'user_addresses'
//     ];

//     const checkPromises = requiredTables.map(table => {
//         return new Promise((resolve) => {
//             req.db.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
//                 resolve({
//                     table,
//                     exists: results.length > 0,
//                     error: err ? err.message : null
//                 });
//             });
//         });
//     });

//     Promise.all(checkPromises)
//         .then(results => {
//             const missingTables = results.filter(r => !r.exists);
//             const errors = results.filter(r => r.error);

//             res.json({
//                 success: true,
//                 database: process.env.DB_NAME,
//                 tables: results,
//                 status: missingTables.length === 0 ? "healthy" : "incomplete",
//                 missingTables: missingTables.map(t => t.table),
//                 errors: errors.length > 0 ? errors : null
//             });
//         })
//         .catch(error => {
//             res.status(500).json({
//                 success: false,
//                 message: "Database health check failed",
//                 error: error.message
//             });
//         });
// });

// /* ================= HEALTH CHECK ================= */
// app.get("/health", (req, res) => {
//     // Test database connection
//     req.db.getConnection((err, connection) => {
//         if (err) {
//             return res.status(503).json({
//                 status: "unhealthy",
//                 database: "disconnected",
//                 message: "Database connection failed",
//                 error: err.message
//             });
//         }

//         connection.ping((pingErr) => {
//             connection.release();

//             if (pingErr) {
//                 return res.status(503).json({
//                     status: "unhealthy",
//                     database: "unresponsive",
//                     message: "Database ping failed"
//                 });
//             }

//             res.json({
//                 status: "healthy",
//                 database: "connected",
//                 timestamp: new Date().toISOString(),
//                 uptime: process.uptime(),
//                 memory: process.memoryUsage()
//             });
//         });
//     });
// });

// // Detailed health endpoint
// app.get("/api/health/detailed", (req, res) => {
//     const health = {
//         status: "healthy",
//         timestamp: new Date().toISOString(),
//         services: {
//             database: "checking...",
//             api: "running",
//             memory: process.memoryUsage()
//         }
//     };

//     req.db.getConnection((err, connection) => {
//         if (err) {
//             health.status = "unhealthy";
//             health.services.database = "disconnected";
//             health.error = err.message;
//             return res.status(503).json(health);
//         }

//         connection.query("SELECT 1", (queryErr) => {
//             connection.release();

//             if (queryErr) {
//                 health.status = "unhealthy";
//                 health.services.database = "query_failed";
//                 health.error = queryErr.message;
//                 return res.status(503).json(health);
//             }

//             health.services.database = "connected";
//             res.json(health);
//         });
//     });
// });

// /* ================= API DOCUMENTATION ================= */
// app.get("/api", (req, res) => {
//     const apiDocs = {
//         name: "Pankhudi E-commerce API",
//         version: "1.0.0",
//         description: "Complete e-commerce API with checkout support",
//         endpoints: {
//             auth: "/api/auth/*",
//             products: "/api/products/*",
//             cart: "/api/cart/*",
//             orders: "/api/orders/*",
//             users: "/api/users/*",
//             categories: "/api/categories/*",
//             checkout: {
//                 summary: "POST /api/checkout/summary",
//                 shippingMethods: "GET /api/shipping-methods",
//                 paymentMethods: "GET /api/payment-methods",
//                 promoValidation: "POST /api/promo/validate"
//             }
//         },
//         health: {
//             basic: "/health",
//             detailed: "/api/health/detailed",
//             database: "/api/db-health"
//         }
//     };

//     res.json(apiDocs);
// });

// /* ================= FALLBACK ================= */
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "Route not found",
//         requestedUrl: req.originalUrl,
//         availableRoutes: ["/api", "/health", "/api/health/detailed"]
//     });
// });

// /* ================= START SERVER ================= */
// const port = process.env.PORT || 5000;

// const server = app.listen(port, () => {
//     console.log(`\n🚀 Server running on http://localhost:${port}`);
//     console.log(`📚 API Documentation: http://localhost:${port}/api`);
//     console.log(`❤️  Health Check: http://localhost:${port}/health`);
//     console.log(`🛒 Checkout API: http://localhost:${port}/api/orders`);
//     console.log(`🛍️  Cart API: http://localhost:${port}/api/cart`);
//     console.log(`🔍 Search API: http://localhost:${port}/api/search`);
//     console.log(`\n✅ Ready for checkout implementation!\n`);
// });

// /* ================= GRACEFUL SHUTDOWN ================= */
// const gracefulShutdown = () => {
//     console.log("\n🔴 Received shutdown signal...");

//     server.close(() => {
//         console.log("✅ HTTP server closed");

//         db.end((err) => {
//             if (err) {
//                 console.error("❌ Error closing database pool:", err);
//                 process.exit(1);
//             }
//             console.log("✅ Database pool closed");
//             process.exit(0);
//         });
//     });

//     // Force shutdown after 10 seconds
//     setTimeout(() => {
//         console.error("💥 Forcing shutdown after timeout");
//         process.exit(1);
//     }, 10000);
// };

// process.on('SIGTERM', gracefulShutdown);
// process.on('SIGINT', gracefulShutdown);

// /* ================= ERROR HANDLING ================= */
// process.on("unhandledRejection", (reason, promise) => {
//     console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
// });

// process.on("uncaughtException", (error) => {
//     console.error("💥 Uncaught Exception:", error);
//     gracefulShutdown();
// });

// /* ================= DATABASE AUTO-RECONNECT ================= */
// db.on('error', (err) => {
//     console.error('💥 Database pool error:', err);

//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//         console.log('🔄 Attempting to reconnect to database...');
//         testDatabaseConnection();
//     }
// });

























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
// Import the addresses routes
const addressRoutes = require("./routes/address");
// const settingsRoutes = require("./routes/settings");
// const securityRoutes = require("./routes/security");



// ✅ NEW CHECKOUT-RELATED ROUTES
const orderRoutes = require("./routes/orderRoutes");
const productDetailRoutes = require("./routes/productDetailRoutes");

// ✅ IMPORT USER ROUTES WITH ERROR HANDLING
let userRoutes;
try {
    userRoutes = require("./routes/userRoutes");
    console.log("✅ userRoutes loaded successfully");
} catch (error) {
    console.error("❌ Error loading userRoutes:", error.message);
    // Create a simple router as fallback
    const express = require("express");
    userRoutes = express.Router();
    userRoutes.get("*", (req, res) => {
        res.status(500).json({
            success: false,
            message: "User routes are currently unavailable. Please check server configuration."
        });
    });
}

const app = express();

/* ================= BODY & CORS ================= */
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

/* ================= DB POOL WITH ENHANCED CONFIG ================= */
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pankhudi",
    port: process.env.DB_PORT || 3306,
    connectionLimit: 20,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: 'local'
});

/* ================= DB TEST WITH RETRY LOGIC ================= */
const testDatabaseConnection = (retries = 3, delay = 2000) => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error("❌ Database connection failed:", err.message);

            if (retries > 0) {
                console.log(`🔄 Retrying connection... (${retries} attempts left)`);
                setTimeout(() => testDatabaseConnection(retries - 1, delay), delay);
            } else {
                console.error("💥 Failed to connect to database after multiple attempts");
            }
        } else {
            console.log("✅ Database connected successfully");

            // Test query to ensure tables exist
            connection.query("SELECT 1", (queryErr) => {
                if (queryErr) {
                    console.error("⚠️ Database query test failed:", queryErr.message);
                } else {
                    console.log("✅ Database query test successful");
                }
                connection.release();
            });
        }
    });
};

testDatabaseConnection();

/* ================= ENHANCED DB MIDDLEWARE ================= */
app.use((req, res, next) => {
    req.db = db;

    // Add query helper methods
    req.db.queryAsync = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) {
                    console.error("Database Query Error:", err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    };

    next();
});

/* ================= ERROR HANDLING MIDDLEWARE ================= */
app.use((err, req, res, next) => {
    console.error("🚨 Server Error:", err.stack);

    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: "Database connection failed. Please try again later."
        });
    }

    if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
            success: false,
            message: "Database table not found. Please check your database setup."
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

/* ================= STATIC FILES ================= */
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "../admin/backend/src/uploads")));

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
}));

app.use("/uploads", express.static(path.join(__dirname, "../admin/backend/src/uploads"), {
    setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
}));


// Serve static images for products
app.use("/product-images", express.static(path.join(__dirname, "uploads/products")));

// Serve placeholder image
app.get("/images/placeholder-product.jpg", (req, res) => {
    res.sendFile(path.join(__dirname, "public/images/placeholder-product.jpg"));
});

/* ================= API ROUTES ================= */
console.log("📦 Loading API routes...");

// Existing routes
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);

// ✅ NEW CHECKOUT-RELATED ROUTES
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes); // ✅ This will work now with error handling
app.use("/api/product-details", productDetailRoutes);
// Add this line in your routes section (after other routes)
app.use("/api/address", addressRoutes);
// app.use("/api/settings", settingsRoutes);
// app.use("/api/security", securityRoutes);

console.log("✅ All routes loaded successfully");

/* ================= EXTRA CATEGORY APIs ================= */
console.log("📂 Loading category APIs...");

// ✅ Sub Categories
app.get("/api/subcategories", (req, res) => {
    const sql = "SELECT * FROM sub_categories WHERE status = 'active' ORDER BY id DESC";
    req.db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Subcategories SQL Error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Subcategories fetch failed",
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// ✅ Sub Sub Categories
app.get("/api/subsubcategories", (req, res) => {
    const sql = "SELECT * FROM sub_sub_categories WHERE status = 'active' ORDER BY id DESC";
    req.db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ SubSubCategories SQL Error:", err.message);
            return res.status(500).json({
                success: false,
                message: "SubSubCategories fetch failed",
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// ✅ Get All Categories with Hierarchy (NEW)
app.get("/api/categories/hierarchy", (req, res) => {
    const sql = `
        SELECT 
            c.id as category_id,
            c.name as category_name,
            c.slug as category_slug,
            sc.id as sub_category_id,
            sc.name as sub_category_name,
            sc.slug as sub_category_slug,
            ssc.id as sub_sub_category_id,
            ssc.name as sub_sub_category_name,
            ssc.slug as sub_sub_category_slug
        FROM categories c
        LEFT JOIN sub_categories sc ON c.id = sc.category_id AND sc.status = 'active'
        LEFT JOIN sub_sub_categories ssc ON sc.id = ssc.sub_category_id AND ssc.status = 'active'
        WHERE c.status = 'active'
        ORDER BY c.id, sc.id, ssc.id
    `;

    req.db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Categories hierarchy error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch categories hierarchy"
            });
        }

        // Organize into hierarchical structure
        const categories = {};
        results.forEach(row => {
            if (!categories[row.category_id]) {
                categories[row.category_id] = {
                    id: row.category_id,
                    name: row.category_name,
                    slug: row.category_slug,
                    sub_categories: {}
                };
            }

            if (row.sub_category_id && !categories[row.category_id].sub_categories[row.sub_category_id]) {
                categories[row.category_id].sub_categories[row.sub_category_id] = {
                    id: row.sub_category_id,
                    name: row.sub_category_name,
                    slug: row.sub_category_slug,
                    sub_sub_categories: []
                };
            }

            if (row.sub_sub_category_id) {
                categories[row.category_id].sub_categories[row.sub_category_id].sub_sub_categories.push({
                    id: row.sub_sub_category_id,
                    name: row.sub_sub_category_name,
                    slug: row.sub_sub_category_slug
                });
            }
        });

        res.json({
            success: true,
            data: Object.values(categories)
        });
    });
});

console.log("✅ Category APIs loaded");

/* ================= CHECKOUT HELPER APIs ================= */
console.log("🛒 Loading checkout helper APIs...");

// ✅ Get Shipping Methods
app.get("/api/shipping-methods", (req, res) => {
    const shippingMethods = [
        {
            id: "standard",
            name: "Standard Shipping",
            description: "Delivery in 5-7 business days",
            cost: 50,
            estimated_days: "5-7"
        },
        {
            id: "express",
            name: "Express Shipping",
            description: "Delivery in 2-3 business days",
            cost: 100,
            estimated_days: "2-3"
        },
        {
            id: "free",
            name: "Free Shipping",
            description: "Delivery in 7-10 business days",
            cost: 0,
            estimated_days: "7-10",
            min_order: 500
        }
    ];

    res.json({
        success: true,
        data: shippingMethods
    });
});

// ✅ Get Payment Methods
app.get("/api/payment-methods", (req, res) => {
    const paymentMethods = [
        {
            id: "cod",
            name: "Cash on Delivery",
            description: "Pay when you receive the product",
            available: true,
            icon: "💵"
        },
        {
            id: "card",
            name: "Credit/Debit Card",
            description: "Pay securely with your card",
            available: true,
            icon: "💳"
        },
        {
            id: "upi",
            name: "UPI",
            description: "Pay using UPI apps",
            available: true,
            icon: "📱"
        },
        {
            id: "netbanking",
            name: "Net Banking",
            description: "Pay via online banking",
            available: true,
            icon: "🏦"
        }
    ];

    res.json({
        success: true,
        data: paymentMethods
    });
});

// ✅ Validate Promo Code
app.post("/api/promo/validate", (req, res) => {
    const { promoCode } = req.body;

    // Mock promo codes - in production, query from database
    const validPromoCodes = {
        "WELCOME10": { discount: 10, minOrder: 0, maxDiscount: 500, type: "percentage" },
        "SAVE20": { discount: 20, minOrder: 1000, maxDiscount: 1000, type: "percentage" },
        "FREESHIP": { discount: 0, freeShipping: true, minOrder: 500, type: "shipping" },
        "FLAT100": { discount: 100, minOrder: 500, maxDiscount: 100, type: "fixed" }
    };

    const code = promoCode?.toUpperCase().trim();

    if (validPromoCodes[code]) {
        res.json({
            success: true,
            valid: true,
            promo: validPromoCodes[code],
            message: "Promo code applied successfully"
        });
    } else {
        res.json({
            success: false,
            valid: false,
            message: "Invalid or expired promo code"
        });
    }
});

// ✅ Get Checkout Summary (for cart validation)
app.post("/api/checkout/summary", async (req, res) => {
    try {
        const { items, shippingMethod = "standard" } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items are required"
            });
        }

        // Calculate totals
        let subtotal = 0;
        let discountTotal = 0;
        let hasFreeShipping = false;

        for (const item of items) {
            const price = parseFloat(item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            const discount = parseFloat(item.discount || 0);

            const itemTotal = price * quantity;
            subtotal += itemTotal;

            if (discount > 0) {
                discountTotal += (price * discount / 100) * quantity;
            }

            if (item.free_shipping) {
                hasFreeShipping = true;
            }
        }

        // Calculate shipping
        let shipping = 0;
        if (!hasFreeShipping) {
            shipping = shippingMethod === "express" ? 100 : 50;
        }

        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + shipping + tax - discountTotal;

        res.json({
            success: true,
            summary: {
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                tax: tax.toFixed(2),
                discount: discountTotal.toFixed(2),
                total: total.toFixed(2),
                hasFreeShipping,
                itemsCount: items.length
            }
        });

    } catch (error) {
        console.error("Checkout summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate checkout summary"
        });
    }
});

console.log("✅ Checkout helper APIs loaded");

// ✅ FALLBACK USER ROUTES (in case userRoutes.js fails)
app.get("/api/users/:id/details", (req, res) => {
    const userId = req.params.id;
    const db = req.db;

    db.query(`
        SELECT id, name, email, phone, address, city, state, 
               postal_code as postalCode, country, avatar, is_verified as isVerified
        FROM users 
        WHERE id = ? AND is_active = 1 AND is_deleted = 0
    `, [userId], (err, results) => {
        if (err) {
            console.error("Get user error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch user details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: results[0]
        });
    });
});

app.get("/api/users/:id/addresses", (req, res) => {
    const userId = req.params.id;
    const db = req.db;

    db.query(`
        SELECT 
            id, user_id as userId, 
            address_type as addressType,
            full_name as fullName,
            address_line as addressLine,
            city, state, 
            postal_code as postalCode,
            country, phone, 
            is_default as isDefault
        FROM user_addresses 
        WHERE user_id = ? AND is_active = 1
        ORDER BY is_default DESC, created_at DESC
    `, [userId], (err, results) => {
        if (err) {
            console.error("Get addresses error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch addresses"
            });
        }

        res.json({
            success: true,
            addresses: results
        });
    });
});

/* ================= DATABASE HEALTH CHECK ================= */
app.get("/api/db-health", (req, res) => {
    const requiredTables = [
        'users', 'products', 'cart', 'orders', 'order_items',
        'categories', 'sub_categories', 'sub_sub_categories',
        'user_addresses'
    ];

    const checkPromises = requiredTables.map(table => {
        return new Promise((resolve) => {
            req.db.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
                resolve({
                    table,
                    exists: results.length > 0,
                    error: err ? err.message : null
                });
            });
        });
    });

    Promise.all(checkPromises)
        .then(results => {
            const missingTables = results.filter(r => !r.exists);
            const errors = results.filter(r => r.error);

            res.json({
                success: true,
                database: process.env.DB_NAME,
                tables: results,
                status: missingTables.length === 0 ? "healthy" : "incomplete",
                missingTables: missingTables.map(t => t.table),
                errors: errors.length > 0 ? errors : null
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: "Database health check failed",
                error: error.message
            });
        });
});

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
    // Test database connection
    req.db.getConnection((err, connection) => {
        if (err) {
            return res.status(503).json({
                status: "unhealthy",
                database: "disconnected",
                message: "Database connection failed",
                error: err.message
            });
        }

        connection.ping((pingErr) => {
            connection.release();

            if (pingErr) {
                return res.status(503).json({
                    status: "unhealthy",
                    database: "unresponsive",
                    message: "Database ping failed"
                });
            }

            res.json({
                status: "healthy",
                database: "connected",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        });
    });
});

// Detailed health endpoint
app.get("/api/health/detailed", (req, res) => {
    const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
            database: "checking...",
            api: "running",
            memory: process.memoryUsage()
        }
    };

    req.db.getConnection((err, connection) => {
        if (err) {
            health.status = "unhealthy";
            health.services.database = "disconnected";
            health.error = err.message;
            return res.status(503).json(health);
        }

        connection.query("SELECT 1", (queryErr) => {
            connection.release();

            if (queryErr) {
                health.status = "unhealthy";
                health.services.database = "query_failed";
                health.error = queryErr.message;
                return res.status(503).json(health);
            }

            health.services.database = "connected";
            res.json(health);
        });
    });
});

/* ================= API DOCUMENTATION ================= */
app.get("/api", (req, res) => {
    const apiDocs = {
        name: "Pankhudi E-commerce API",
        version: "1.0.0",
        description: "Complete e-commerce API with checkout support",
        endpoints: {
            auth: "/api/auth/*",
            products: "/api/products/*",
            cart: "/api/cart/*",
            orders: "/api/orders/*",
            users: "/api/users/*",
            categories: "/api/categories/*",
            checkout: {
                summary: "POST /api/checkout/summary",
                shippingMethods: "GET /api/shipping-methods",
                paymentMethods: "GET /api/payment-methods",
                promoValidation: "POST /api/promo/validate"
            }
        },
        health: {
            basic: "/health",
            detailed: "/api/health/detailed",
            database: "/api/db-health"
        }
    };

    res.json(apiDocs);
});

/* ================= FALLBACK ================= */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        requestedUrl: req.originalUrl,
        availableRoutes: ["/api", "/health", "/api/health/detailed"]
    });
});

/* ================= START SERVER ================= */
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`\n🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`❤️  Health Check: http://localhost:${port}/health`);
    console.log(`🛒 Checkout API: http://localhost:${port}/api/orders`);
    console.log(`🛍️  Cart API: http://localhost:${port}/api/cart`);
    console.log(`🔍 Search API: http://localhost:${port}/api/search`);
    console.log(`👤 User API: http://localhost:${port}/api/users`);
    console.log(`\n✅ Server is fully operational!\n`);
});

/* ================= GRACEFUL SHUTDOWN ================= */
const gracefulShutdown = () => {
    console.log("\n🔴 Received shutdown signal...");

    server.close(() => {
        console.log("✅ HTTP server closed");

        db.end((err) => {
            if (err) {
                console.error("❌ Error closing database pool:", err);
                process.exit(1);
            }
            console.log("✅ Database pool closed");
            process.exit(0);
        });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error("💥 Forcing shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/* ================= ERROR HANDLING ================= */
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    gracefulShutdown();
});

/* ================= DATABASE AUTO-RECONNECT ================= */
db.on('error', (err) => {
    console.error('💥 Database pool error:', err);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 Attempting to reconnect to database...');
        testDatabaseConnection();
    }
});