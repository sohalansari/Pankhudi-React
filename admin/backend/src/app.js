require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload"); // Add this import

const app = express();

// ✅ 1. CORS Configuration - MUST COME FIRST
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Content-Length', 'X-Requested-With']
}));

// ✅ 2. Create uploads directory BEFORE static middleware
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// ✅ 3. Static files - BEFORE body parsers
app.use("/uploads", express.static(uploadsDir));

// ✅ 4. Body parsers - IMPORTANT: Order matters!
// For JSON requests
app.use(express.json({
    limit: '10mb'
}));

// For URL-encoded requests (form submissions without files)
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

// ✅ 5. File Upload Middleware - MUST COME AFTER body parsers
// This handles multipart/form-data (file uploads)
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached (5MB)',
    useTempFiles: false, // Important: Keep false for proper req.files handling
    tempFileDir: '/tmp/',
    parseNested: true,
    safeFileNames: true,
    preserveExtension: 4 // Keep original file extension
}));

// ✅ 6. Custom middleware to handle form-data body parsing
// This fixes the issue where req.body is empty for form-data requests
app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';

    // If it's multipart/form-data and we have files
    if (contentType.includes('multipart/form-data') && req.files) {
        // For form-data, text fields are available in req.body
        // But we need to make sure req.body is populated
        // express-fileupload automatically populates req.body for text fields
        // However, if we need to manually handle it:

        // Clone the original body parser middleware behavior
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            // Merge text fields from req.body with any existing data
            // This ensures text fields are available in req.body
            if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
                // req.body is already populated by express-fileupload
                console.log('Form-data text fields:', req.body);
            }
        }
    }

    next();
});

// ✅ 7. Database Middleware
app.use((req, res, next) => {
    req.db = require('./config/db');
    next();
});

// ✅ 8. Import routes
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/products");
const reportsRoutes = require("./routes/adminReports");
const cartRoutes = require("./routes/cartRoutes");
const bannerRoutes = require('./routes/banner');
const categoryManagementRoutes = require("./routes/categories");

// ✅ 9. Mount routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/banners', bannerRoutes);
app.use("/api", categoryManagementRoutes);

// ✅ 10. Test endpoints for debugging
app.post('/api/test-body', (req, res) => {
    console.log('Test Body - Content-Type:', req.headers['content-type']);
    console.log('Test Body - req.body:', req.body);
    console.log('Test Body - req.files:', req.files);
    console.log('Test Body - req.query:', req.query);
    console.log('Test Body - req.params:', req.params);

    res.json({
        success: true,
        body: req.body,
        files: req.files ? Object.keys(req.files) : null,
        contentType: req.headers['content-type'],
        method: req.method
    });
});

// Test file upload endpoint
app.post('/api/test-upload', (req, res) => {
    try {
        console.log('Test Upload - Content-Type:', req.headers['content-type']);
        console.log('Test Upload - Body keys:', Object.keys(req.body));
        console.log('Test Upload - Files:', req.files);

        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const image = req.files.image;
        const uploadPath = path.join(uploadsDir, 'test', image.name);

        // Create test directory if it doesn't exist
        const testDir = path.join(uploadsDir, 'test');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        image.mv(uploadPath, (err) => {
            if (err) {
                console.error('File move error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save file'
                });
            }

            res.json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    fileName: image.name,
                    filePath: `/uploads/test/${image.name}`,
                    size: image.size,
                    mimetype: image.mimetype,
                    bodyFields: req.body // Show any text fields sent with the file
                }
            });
        });
    } catch (error) {
        console.error('Test upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ 11. Health Check Endpoints (after all routes)
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API Server is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        uptime: process.uptime(),
        features: {
            fileUpload: true,
            categories: true,
            products: true,
            users: true
        }
    });
});

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

// ✅ 12. Global Statistics Endpoint
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

// ✅ 13. Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);

    // Handle specific errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body"
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: "File size too large. Maximum size is 5MB"
        });
    }

    // Express-fileupload errors
    if (err.message && err.message.includes('File size limit')) {
        return res.status(413).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// ✅ 14. 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        requestedUrl: req.originalUrl,
        availableEndpoints: [
            "/api/health",
            "/api/db-health",
            "/api/global-stats",
            "/api/test-body",
            "/api/test-upload",
            "/api/categories",
            "/api/subcategories",
            "/api/subsubcategories"
        ]
    });
});

module.exports = app;