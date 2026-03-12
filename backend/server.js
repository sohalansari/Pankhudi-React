require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require('fs');

/* ================= EMAIL SERVICE ================= */
// Create email service directory if it doesn't exist
const emailServiceDir = path.join(__dirname, 'services');
if (!fs.existsSync(emailServiceDir)) {
    fs.mkdirSync(emailServiceDir, { recursive: true });
}

// Import email service
let emailService;
try {
    emailService = require("./services/emailService");
    console.log("✅ Email service loaded successfully");
} catch (error) {
    console.error("❌ Error loading email service:", error.message);
    console.log("⚠️ Email service will be created on server start");
    emailService = null;
}

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
const addressRoutes = require("./routes/address");
const paymentRoutes = require("./routes/paymentRoutes");
const promoRoutes = require("./routes/promoRoutes");

// ✅ NEW CHECKOUT-RELATED ROUTES
const orderRoutes = require("./routes/orderRoutes");
const productDetailRoutes = require("./routes/productDetailRoutes");
const userAddressRoutes = require("./routes/address");

// email logs route
const emailRoutes = require("./routes/emailRoutes");

// ✅ IMPORT USER ROUTES WITH ERROR HANDLING
let userRoutes;
try {
    userRoutes = require("./routes/userRoutes");
    console.log("✅ userRoutes loaded successfully");
} catch (error) {
    console.error("❌ Error loading userRoutes:", error.message);
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

            // ✅ Create email_logs table if not exists
            connection.query(`
                CREATE TABLE IF NOT EXISTS email_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT,
                    recipient VARCHAR(255) NOT NULL,
                    subject VARCHAR(255) NOT NULL,
                    message_id VARCHAR(255),
                    status ENUM('pending', 'sent', 'failed', 'logged') DEFAULT 'pending',
                    error TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sent_at DATETIME,
                    INDEX idx_order_id (order_id),
                    INDEX idx_status (status),
                    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
                )
            `, (tableErr) => {
                if (tableErr) {
                    console.error("⚠️ Email logs table creation error:", tableErr.message);
                } else {
                    console.log("✅ Email logs table ready");
                }
            });

            // ✅ Create user_addresses table if not exists (important for addresses)
            connection.query(`
                CREATE TABLE IF NOT EXISTS user_addresses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    address_type ENUM('home', 'office', 'other') DEFAULT 'home',
                    full_name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    address_line TEXT NOT NULL,
                    city VARCHAR(100) NOT NULL,
                    state VARCHAR(100) NOT NULL,
                    postal_code VARCHAR(20) NOT NULL,
                    country VARCHAR(100) DEFAULT 'India',
                    is_default TINYINT(1) DEFAULT 0,
                    is_active TINYINT(1) DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_is_default (is_default),
                    INDEX idx_is_active (is_active),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (tableErr) => {
                if (tableErr) {
                    console.error("⚠️ User addresses table creation error:", tableErr.message);
                } else {
                    console.log("✅ User addresses table ready");
                }
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

/* ================= EMAIL SERVICE MIDDLEWARE ================= */
// Make email service available to all routes
app.use((req, res, next) => {
    req.emailService = emailService;
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
app.use("/api/product-details", productDetailRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/payment", paymentRoutes);



app.use("/api/users", userAddressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/promo", promoRoutes);

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

// ✅ Get All Categories with Hierarchy
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
            id: "razorpay",
            name: "Razorpay",
            description: "Pay via Card, UPI, Net Banking, Wallet",
            available: true,
            icon: "🟣"
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

// ✅ Get Checkout Summary
app.post("/api/checkout/summary", async (req, res) => {
    try {
        const { items, shippingMethod = "standard" } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items are required"
            });
        }

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

        let shipping = 0;
        if (!hasFreeShipping) {
            shipping = shippingMethod === "express" ? 100 : 50;
        }

        const tax = subtotal * 0.18;
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

// ✅ FALLBACK USER ROUTES (ये तब use होंगे जब userAddressRoutes में न हों)
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

/* ================= 📧 EMAIL TEST ENDPOINT ================= */
app.get("/api/test-email", async (req, res) => {
    console.log("========== 📧 TEST EMAIL ENDPOINT ==========");

    if (!emailService) {
        return res.status(500).json({
            success: false,
            message: "Email service not loaded",
            solution: "Please check if backend/services/emailService.js exists"
        });
    }

    try {
        const testResult = await emailService.testEmailConfig();
        res.json({
            success: testResult.success,
            message: testResult.message || "Email test completed",
            details: testResult,
            env: {
                EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
                EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Missing",
                FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000"
            }
        });
    } catch (error) {
        console.error("❌ Test email error:", error);
        res.status(500).json({
            success: false,
            message: "Email test failed",
            error: error.message
        });
    }
});

/* ================= EMAIL LOGS ENDPOINT ================= */
app.get("/api/email-logs", (req, res) => {
    const db = req.db;
    const { limit = 20 } = req.query;

    db.query(`
        SELECT * FROM email_logs 
        ORDER BY created_at DESC 
        LIMIT ?
    `, [parseInt(limit)], (err, results) => {
        if (err) {
            console.error("❌ Email logs fetch error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch email logs"
            });
        }

        res.json({
            success: true,
            logs: results || []
        });
    });
});

/* ================= DATABASE HEALTH CHECK ================= */
app.get("/api/db-health", (req, res) => {
    const requiredTables = [
        'users', 'products', 'cart', 'orders', 'order_items',
        'categories', 'sub_categories', 'sub_sub_categories',
        'user_addresses', 'email_logs'
    ];

    const checkPromises = requiredTables.map(table => {
        return new Promise((resolve) => {
            req.db.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
                resolve({
                    table,
                    exists: results && results.length > 0,
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
                email: emailService ? "✅ Ready" : "❌ Not configured",
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
            email: emailService ? "loaded" : "not loaded",
            api: "running",
            memory: process.memoryUsage()
        },
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            EMAIL_CONFIGURED: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
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
            addresses: "/api/users/:userId/addresses", // नया endpoint
            categories: "/api/categories/*",
            checkout: {
                summary: "POST /api/checkout/summary",
                shippingMethods: "GET /api/shipping-methods",
                paymentMethods: "GET /api/payment-methods",
                promoValidation: "POST /api/promo/validate"
            },
            email: {
                test: "GET /api/test-email",
                logs: "GET /api/email-logs"
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

// Route debugging endpoint - सभी registered routes दिखाने के लिए
app.get("/api/debug/routes", (req, res) => {
    const routes = [];

    function print(path, layer) {
        if (layer.route) {
            layer.route.stack.forEach(print.bind(null, path + layer.route.path));
        } else if (layer.name === 'router' && layer.handle.stack) {
            layer.handle.stack.forEach(print.bind(null, path + layer.regexp.source));
        } else if (layer.method) {
            routes.push({
                method: layer.method.toUpperCase(),
                path: path,
                name: layer.name
            });
        }
    }

    app._router.stack.forEach(print.bind(null, ''));

    res.json({
        success: true,
        totalRoutes: routes.length,
        routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
});

/* ================= FALLBACK ================= */
app.use((req, res) => {
    console.log("❌ 404 - Route not found:", req.method, req.url);
    res.status(404).json({
        success: false,
        message: "Route not found",
        requestedUrl: req.originalUrl,
        availableRoutes: ["/api", "/health", "/api/health/detailed", "/api/test-email", "/api/email-logs", "/api/debug/routes"]
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
    console.log(`🏠 Address API: http://localhost:${port}/api/users/:userId/addresses`);
    console.log(`📧 Email API: http://localhost:${port}/api/test-email`);
    console.log(`📋 Email Logs: http://localhost:${port}/api/email-logs`);
    console.log(`🔧 Debug Routes: http://localhost:${port}/api/debug/routes`);

    // Test email configuration on startup
    if (emailService) {
        emailService.testEmailConfig().then(result => {
            if (result.success) {
                console.log("✅ Email service is ready");
            } else {
                console.warn("⚠️ Email service not configured properly");
                console.warn("   Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
                console.warn("   Or check backend/services/emailService.js");
            }
        }).catch(err => {
            console.error("❌ Email service test failed:", err.message);
        });
    } else {
        console.warn("⚠️ Email service not loaded");
        console.warn("   Please create backend/services/emailService.js");
    }

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