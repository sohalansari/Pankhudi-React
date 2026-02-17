// const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");
// const db = require("../config/db");
// const router = express.Router();

// // ✅ Ensure uploads folder exists
// const uploadDir = path.join(__dirname, "..", "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // ✅ FIXED: Multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) =>
//         cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname)),
// });

// // ✅ FIXED: Proper Multer configuration with correct field names
// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 50 * 1024 * 1024 // 50MB limit for videos
//     },
//     fileFilter: (req, file, cb) => {
//         // ✅ FIXED: Check field names exactly as they come from frontend
//         if (file.fieldname === 'images') {
//             if (file.mimetype.startsWith('image/')) {
//                 cb(null, true);
//             } else {
//                 cb(new Error('Only image files are allowed for images field'), false);
//             }
//         } else if (file.fieldname === 'video') {
//             if (file.mimetype.startsWith('video/')) {
//                 cb(null, true);
//             } else {
//                 cb(new Error('Only video files are allowed for video field'), false);
//             }
//         } else {
//             // ✅ FIXED: Allow other non-file fields to pass through
//             cb(null, true);
//         }
//     }
// });

// const BASE_URL = process.env.ADMIN_PUBLIC_URL || "http://localhost:5001";

// // Helper function to safely parse JSON
// function safeJsonParse(str, defaultValue) {
//     try {
//         return str ? JSON.parse(str) : defaultValue;
//     } catch (e) {
//         return defaultValue;
//     }
// }

// // Helper function to generate slug
// function generateSlug(name) {
//     if (!name) return '';
//     return name
//         .toLowerCase()
//         .replace(/[^a-z0-9 -]/g, '')
//         .replace(/\s+/g, '-')
//         .replace(/-+/g, '-')
//         .trim();
// }

// // Helper function to convert to boolean
// function toBoolean(value) {
//     if (value === undefined || value === null) return false;
//     return value === 'true' || value === true || value === 1 || value === '1';
// }

// // Helper function to parse number safely
// function safeParseNumber(value, defaultValue = 0) {
//     if (value === undefined || value === null || value === '') return defaultValue;
//     const num = parseFloat(value);
//     return isNaN(num) ? defaultValue : num;
// }

// // Helper function to parse integer safely
// function safeParseInt(value, defaultValue = 0) {
//     if (value === undefined || value === null || value === '') return defaultValue;
//     const num = parseInt(value);
//     return isNaN(num) ? defaultValue : num;
// }

// /* ================================
//    ✅ CATEGORY ROUTES
// ================================ */

// // Get all categories
// router.get("/categories", (req, res) => {
//     const sql = "SELECT * FROM categories WHERE status = 'active' ORDER BY name";
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Categories Error:", err);
//             return res.status(500).json({ error: "Failed to fetch categories" });
//         }
//         res.json(results);
//     });
// });

// // Add new category
// router.post("/categories", (req, res) => {
//     const { name, description, status = 'active' } = req.body;

//     if (!name) {
//         return res.status(400).json({ error: "Category name is required" });
//     }

//     const sql = "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)";
//     db.query(sql, [name, description || "", status], (err, result) => {
//         if (err) {
//             console.error("Add Category Error:", err);
//             return res.status(500).json({ error: "Failed to add category" });
//         }
//         res.json({
//             message: "Category added successfully",
//             category: {
//                 id: result.insertId,
//                 name,
//                 description,
//                 status
//             }
//         });
//     });
// });

// /* ================================
//    ✅ SUB-CATEGORY ROUTES
// ================================ */

// // Get all sub-categories
// router.get("/sub-categories", (req, res) => {
//     const sql = `
//         SELECT sc.*, c.name as category_name 
//         FROM sub_categories sc 
//         LEFT JOIN categories c ON sc.category_id = c.id 
//         WHERE sc.status = 'active' 
//         ORDER BY sc.name
//     `;
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Sub-Categories Error:", err);
//             return res.status(500).json({ error: "Failed to fetch sub-categories" });
//         }
//         res.json(results);
//     });
// });

// // Get sub-categories by category ID
// router.get("/sub-categories/category/:categoryId", (req, res) => {
//     const { categoryId } = req.params;

//     const sql = `
//         SELECT sc.*, c.name as category_name 
//         FROM sub_categories sc 
//         LEFT JOIN categories c ON sc.category_id = c.id 
//         WHERE sc.category_id = ? AND sc.status = 'active' 
//         ORDER BY sc.name
//     `;

//     db.query(sql, [categoryId], (err, results) => {
//         if (err) {
//             console.error("Sub-Categories by Category Error:", err);
//             return res.status(500).json({ error: "Failed to fetch sub-categories" });
//         }
//         res.json(results);
//     });
// });

// // Add new sub-category
// router.post("/sub-categories", (req, res) => {
//     const { name, description, category_id, status = 'active' } = req.body;

//     if (!name) {
//         return res.status(400).json({ error: "Sub-category name is required" });
//     }
//     if (!category_id) {
//         return res.status(400).json({ error: "Category ID is required" });
//     }

//     const sql = "INSERT INTO sub_categories (name, description, category_id, status) VALUES (?, ?, ?, ?)";
//     db.query(sql, [name, description || "", category_id, status], (err, result) => {
//         if (err) {
//             console.error("Add Sub-Category Error:", err);
//             return res.status(500).json({ error: "Failed to add sub-category" });
//         }
//         res.json({
//             message: "Sub-category added successfully",
//             sub_category: {
//                 id: result.insertId,
//                 name,
//                 description,
//                 category_id,
//                 status
//             }
//         });
//     });
// });

// /* ================================
//    ✅ SUB-SUB-CATEGORY ROUTES
// ================================ */

// // Get all sub-sub-categories
// router.get("/sub-sub-categories", (req, res) => {
//     const sql = `
//         SELECT ssc.*, sc.name as sub_category_name, c.name as category_name 
//         FROM sub_sub_categories ssc 
//         LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id 
//         LEFT JOIN categories c ON sc.category_id = c.id 
//         WHERE ssc.status = 'active' 
//         ORDER BY ssc.name
//     `;
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Sub-Sub-Categories Error:", err);
//             return res.status(500).json({ error: "Failed to fetch sub-sub-categories" });
//         }
//         res.json(results);
//     });
// });

// // Get sub-sub-categories by sub-category ID
// router.get("/sub-sub-categories/subcategory/:subCategoryId", (req, res) => {
//     const { subCategoryId } = req.params;

//     const sql = `
//         SELECT ssc.*, sc.name as sub_category_name, c.name as category_name 
//         FROM sub_sub_categories ssc 
//         LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id 
//         LEFT JOIN categories c ON sc.category_id = c.id 
//         WHERE ssc.sub_category_id = ? AND ssc.status = 'active' 
//         ORDER BY ssc.name
//     `;

//     db.query(sql, [subCategoryId], (err, results) => {
//         if (err) {
//             console.error("Sub-Sub-Categories by Sub-Category Error:", err);
//             return res.status(500).json({ error: "Failed to fetch sub-sub-categories" });
//         }
//         res.json(results);
//     });
// });

// // Add new sub-sub-category
// router.post("/sub-sub-categories", (req, res) => {
//     const { name, description, sub_category_id, status = 'active' } = req.body;

//     if (!name) {
//         return res.status(400).json({ error: "Sub-sub-category name is required" });
//     }
//     if (!sub_category_id) {
//         return res.status(400).json({ error: "Sub-category ID is required" });
//     }

//     const sql = "INSERT INTO sub_sub_categories (name, description, sub_category_id, status) VALUES (?, ?, ?, ?)";
//     db.query(sql, [name, description || "", sub_category_id, status], (err, result) => {
//         if (err) {
//             console.error("Add Sub-Sub-Category Error:", err);
//             return res.status(500).json({ error: "Failed to add sub-sub-category" });
//         }
//         res.json({
//             message: "Sub-sub-category added successfully",
//             sub_sub_category: {
//                 id: result.insertId,
//                 name,
//                 description,
//                 sub_category_id,
//                 status
//             }
//         });
//     });
// });

// /* ================================
//    ✅ ADD PRODUCT - WITH SUB-SUB-CATEGORY SUPPORT
// ================================ */

// // ✅ FIXED: Multer middleware with correct field names
// router.post("/add", upload.fields([
//     { name: 'images', maxCount: 10 }, // ✅ CHANGED: Increased to 10 to match frontend
//     { name: 'video', maxCount: 1 }
// ]), (req, res) => {
//     console.log("📦 Received product data:", req.body);
//     console.log("📁 Received files:", req.files);

//     // ✅ FIXED: Debug log to see exact field names
//     if (req.files) {
//         console.log("📋 File fields received:", Object.keys(req.files));
//         if (req.files['images']) {
//             console.log(`🖼️ Images received: ${req.files['images'].length} files`);
//         }
//         if (req.files['video']) {
//             console.log(`🎥 Video received: ${req.files['video'].length} files`);
//         }
//     }

//     const {
//         name,
//         description,
//         short_description,
//         price,
//         discount,
//         stock,
//         category_id,
//         sub_category_id,
//         sub_sub_category_id, // ✅ NEW: Sub-sub-category ID
//         brand,
//         status = "active",
//         rating = 0,
//         sizes,
//         colors,
//         material,
//         weight,
//         dimensions,
//         warranty,
//         features,
//         tags,
//         sku,
//         is_featured = false,
//         is_trending = false,
//         is_bestseller = false,
//         seo_title,
//         seo_description,
//         meta_keywords,
//         return_policy,
//         slug,
//         min_order_quantity = 1,
//         max_order_quantity,
//         low_stock_threshold = 10,
//         is_virtual = false,
//         is_downloadable = false,
//         download_link,
//         shipping_class,
//         tax_class,
//         shipping_cost = 0,
//         free_shipping = false
//     } = req.body;

//     // Validation
//     if (!name) return res.status(400).json({ error: "Product name is required" });
//     if (!sku) return res.status(400).json({ error: "SKU is required" });
//     if (!category_id) return res.status(400).json({ error: "Category is required" });

//     // ✅ FIXED: Process images - handle case where no images are uploaded
//     const images = (req.files && req.files['images']) ? req.files['images'].map(
//         (f) => `${BASE_URL}/uploads/${f.filename}`
//     ) : [];

//     // ✅ FIXED: Process video - handle case where no video is uploaded
//     let video = null;
//     if (req.files && req.files['video'] && req.files['video'][0]) {
//         video = `${BASE_URL}/uploads/${req.files['video'][0].filename}`;
//     }

//     // Parse array fields to JSON
//     const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
//     const colorsArray = Array.isArray(colors) ? colors : (colors ? [colors] : []);
//     const featuresArray = Array.isArray(features) ? features : (features ? [features] : []);
//     const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);

//     // Convert boolean fields
//     const isFeaturedBool = toBoolean(is_featured);
//     const isTrendingBool = toBoolean(is_trending);
//     const isBestsellerBool = toBoolean(is_bestseller);
//     const isVirtualBool = toBoolean(is_virtual);
//     const isDownloadableBool = toBoolean(is_downloadable);
//     const freeShippingBool = toBoolean(free_shipping);

//     // Parse numeric fields safely
//     const parsedPrice = safeParseNumber(price, 0);
//     const parsedDiscount = safeParseNumber(discount, 0);
//     const parsedStock = safeParseInt(stock, 0);
//     const parsedRating = safeParseNumber(rating, 0);
//     const parsedMinOrderQty = safeParseInt(min_order_quantity, 1);
//     const parsedMaxOrderQty = max_order_quantity ? safeParseInt(max_order_quantity) : null;
//     const parsedLowStockThreshold = safeParseInt(low_stock_threshold, 10);
//     const parsedShippingCost = safeParseNumber(shipping_cost, 0);

//     // ✅ UPDATED: SQL Query with sub_sub_category_id
//     const sql = `
//         INSERT INTO products 
//         (name, description, short_description, price, discount, stock, category_id, sub_category_id, sub_sub_category_id, brand, 
//          images, status, rating, sizes, colors, material, weight, dimensions, warranty, 
//          features, tags, sku, is_featured, is_trending, is_bestseller, video, seo_title, 
//          seo_description, meta_keywords, return_policy, slug, min_order_quantity, 
//          max_order_quantity, low_stock_threshold, is_virtual, is_downloadable, download_link,
//          shipping_class, tax_class, shipping_cost, free_shipping) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     // ✅ UPDATED: Values array with sub_sub_category_id (41 values now)
//     const values = [
//         name,
//         description || "",
//         short_description || "",
//         parsedPrice,
//         parsedDiscount,
//         parsedStock,
//         category_id,
//         sub_category_id || null,
//         sub_sub_category_id || null, // ✅ NEW: Sub-sub-category ID
//         brand || "",
//         JSON.stringify(images),
//         status,
//         parsedRating,
//         JSON.stringify(sizesArray),
//         JSON.stringify(colorsArray),
//         material || "",
//         weight || "",
//         dimensions || "",
//         warranty || "",
//         JSON.stringify(featuresArray),
//         JSON.stringify(tagsArray),
//         sku,
//         isFeaturedBool ? 1 : 0,
//         isTrendingBool ? 1 : 0,
//         isBestsellerBool ? 1 : 0,
//         video,
//         seo_title || "",
//         seo_description || "",
//         meta_keywords || "",
//         return_policy || "",
//         slug || generateSlug(name),
//         parsedMinOrderQty,
//         parsedMaxOrderQty,
//         parsedLowStockThreshold,
//         isVirtualBool ? 1 : 0,
//         isDownloadableBool ? 1 : 0,
//         download_link || "",
//         shipping_class || "",
//         tax_class || "",
//         parsedShippingCost,
//         freeShippingBool ? 1 : 0
//     ];

//     console.log("🔢 Values count:", values.length);
//     console.log("📊 Values:", values);

//     db.query(sql, values, (err, result) => {
//         if (err) {
//             console.error("❌ DB Error:", err);
//             // Delete uploaded files if DB operation fails
//             if (req.files) {
//                 Object.values(req.files).flat().forEach(file => {
//                     if (fs.existsSync(file.path)) {
//                         fs.unlinkSync(file.path);
//                     }
//                 });
//             }
//             return res.status(500).json({
//                 error: "Database operation failed",
//                 details: err.message,
//                 sqlMessage: err.sqlMessage
//             });
//         }

//         console.log("✅ Product inserted with ID:", result.insertId);

//         // Fetch the created product with category, sub-category and sub-sub-category details
//         const fetchSql = `
//             SELECT p.*, 
//                    c.name as category_name, 
//                    sc.name as sub_category_name,
//                    ssc.name as sub_sub_category_name 
//             FROM products p 
//             LEFT JOIN categories c ON p.category_id = c.id 
//             LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
//             LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
//             WHERE p.id = ?
//         `;

//         db.query(fetchSql, [result.insertId], (fetchErr, productResult) => {
//             if (fetchErr) {
//                 console.error("Fetch Product Error:", fetchErr);
//                 // Still return success but without joined data
//                 return res.json({
//                     message: "Product added successfully",
//                     product: {
//                         id: result.insertId,
//                         name,
//                         sku,
//                         images,
//                         video,
//                         category_id,
//                         sub_category_id,
//                         sub_sub_category_id // ✅ NEW
//                     }
//                 });
//             }

//             const product = productResult[0];
//             if (product) {
//                 // Parse JSON fields
//                 product.images = safeJsonParse(product.images, []);
//                 product.sizes = safeJsonParse(product.sizes, []);
//                 product.colors = safeJsonParse(product.colors, []);
//                 product.features = safeJsonParse(product.features, []);
//                 product.tags = safeJsonParse(product.tags, []);
//                 product.is_featured = Boolean(product.is_featured);
//                 product.is_trending = Boolean(product.is_trending);
//                 product.is_bestseller = Boolean(product.is_bestseller);
//             }

//             res.json({
//                 message: "Product added successfully",
//                 product
//             });
//         });
//     });
// });

// /* ================================
//    ✅ LIST PRODUCTS - WITH SUB-SUB-CATEGORY SUPPORT
// ================================ */
// router.get("/", (req, res) => {
//     const { category_id, sub_category_id, sub_sub_category_id, featured, trending, bestseller } = req.query;

//     let sql = `
//         SELECT p.*, 
//                c.name as category_name, 
//                sc.name as sub_category_name,
//                ssc.name as sub_sub_category_name 
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
//         LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
//         WHERE 1=1
//     `;
//     const params = [];

//     // Add filters
//     if (category_id) {
//         sql += " AND p.category_id = ?";
//         params.push(category_id);
//     }
//     if (sub_category_id) {
//         sql += " AND p.sub_category_id = ?";
//         params.push(sub_category_id);
//     }
//     if (sub_sub_category_id) { // ✅ NEW: Sub-sub-category filter
//         sql += " AND p.sub_sub_category_id = ?";
//         params.push(sub_sub_category_id);
//     }
//     if (featured === 'true') {
//         sql += " AND p.is_featured = 1";
//     }
//     if (trending === 'true') {
//         sql += " AND p.is_trending = 1";
//     }
//     if (bestseller === 'true') {
//         sql += " AND p.is_bestseller = 1";
//     }

//     sql += " ORDER BY p.created_at DESC";

//     db.query(sql, params, (err, results) => {
//         if (err) {
//             console.error("Products List Error:", err);
//             return res.status(500).json({ error: "Failed to fetch products" });
//         }

//         const parsed = results.map((product) => ({
//             ...product,
//             images: safeJsonParse(product.images, []),
//             sizes: safeJsonParse(product.sizes, []),
//             colors: safeJsonParse(product.colors, []),
//             features: safeJsonParse(product.features, []),
//             tags: safeJsonParse(product.tags, []),
//             is_featured: Boolean(product.is_featured),
//             is_trending: Boolean(product.is_trending),
//             is_bestseller: Boolean(product.is_bestseller)
//         }));

//         res.json(parsed);
//     });
// });

// /* ================================
//    ✅ GET SINGLE PRODUCT - WITH SUB-SUB-CATEGORY SUPPORT
// ================================ */
// router.get("/:id", (req, res) => {
//     const { id } = req.params;

//     const sql = `
//         SELECT p.*, 
//                c.name as category_name, 
//                sc.name as sub_category_name,
//                ssc.name as sub_sub_category_name 
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
//         LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
//         WHERE p.id = ?
//     `;

//     db.query(sql, [id], (err, results) => {
//         if (err) {
//             console.error("Product Fetch Error:", err);
//             return res.status(500).json({ error: "Failed to fetch product" });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         const product = results[0];
//         // Parse JSON fields
//         product.images = safeJsonParse(product.images, []);
//         product.sizes = safeJsonParse(product.sizes, []);
//         product.colors = safeJsonParse(product.colors, []);
//         product.features = safeJsonParse(product.features, []);
//         product.tags = safeJsonParse(product.tags, []);
//         product.is_featured = Boolean(product.is_featured);
//         product.is_trending = Boolean(product.is_trending);
//         product.is_bestseller = Boolean(product.is_bestseller);

//         res.json(product);
//     });
// });

// /* ================================
//    ✅ UPDATE PRODUCT - WITH SUB-SUB-CATEGORY SUPPORT
// ================================ */
// router.put("/:id", upload.fields([
//     { name: 'images', maxCount: 4 },
//     { name: 'video', maxCount: 1 }
// ]), (req, res) => {
//     const { id } = req.params;
//     const {
//         name,
//         description,
//         price,
//         discount,
//         stock,
//         category_id,
//         sub_category_id,
//         sub_sub_category_id, // ✅ NEW: Sub-sub-category ID
//         brand,
//         status = "active",
//         rating = 0,
//         sizes,
//         colors,
//         material,
//         weight,
//         dimensions,
//         warranty,
//         features,
//         tags,
//         sku,
//         is_featured = false,
//         is_trending = false,
//         is_bestseller = false,
//         seo_title,
//         seo_description,
//         meta_keywords,
//         short_description,
//         return_policy,
//         slug,
//         min_order_quantity = 1,
//         max_order_quantity,
//         low_stock_threshold = 10,
//         is_virtual = false,
//         is_downloadable = false,
//         download_link,
//         shipping_class,
//         tax_class,
//         shipping_cost = 0,
//         free_shipping = false,
//         oldImages,
//         oldVideo
//     } = req.body;

//     // Validation
//     if (!name) return res.status(400).json({ error: "Product name is required" });
//     if (!sku) return res.status(400).json({ error: "SKU is required" });
//     if (!category_id) return res.status(400).json({ error: "Category is required" });

//     // Process old images
//     let finalImages = [];
//     try {
//         finalImages = oldImages ? JSON.parse(oldImages) : [];
//     } catch (e) {
//         finalImages = [];
//     }

//     // Add new images
//     if (req.files['images']) {
//         const newImages = req.files['images'].map(
//             (f) => `${BASE_URL}/uploads/${f.filename}`
//         );
//         finalImages = [...finalImages, ...newImages];
//     }

//     // Process video
//     let finalVideo = oldVideo || null;
//     if (req.files['video'] && req.files['video'][0]) {
//         finalVideo = `${BASE_URL}/uploads/${req.files['video'][0].filename}`;
//         // Delete old video if exists and new one is uploaded
//         if (oldVideo) {
//             const oldVideoPath = path.join(uploadDir, path.basename(oldVideo));
//             if (fs.existsSync(oldVideoPath)) {
//                 fs.unlinkSync(oldVideoPath);
//             }
//         }
//     }

//     // Parse array fields
//     const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
//     const colorsArray = Array.isArray(colors) ? colors : (colors ? [colors] : []);
//     const featuresArray = Array.isArray(features) ? features : (features ? [features] : []);
//     const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);

//     // Convert boolean fields
//     const isFeaturedBool = toBoolean(is_featured);
//     const isTrendingBool = toBoolean(is_trending);
//     const isBestsellerBool = toBoolean(is_bestseller);
//     const isVirtualBool = toBoolean(is_virtual);
//     const isDownloadableBool = toBoolean(is_downloadable);
//     const freeShippingBool = toBoolean(free_shipping);

//     // Parse numeric fields safely
//     const parsedPrice = safeParseNumber(price, 0);
//     const parsedDiscount = safeParseNumber(discount, 0);
//     const parsedStock = safeParseInt(stock, 0);
//     const parsedRating = safeParseNumber(rating, 0);
//     const parsedMinOrderQty = safeParseInt(min_order_quantity, 1);
//     const parsedMaxOrderQty = max_order_quantity ? safeParseInt(max_order_quantity) : null;
//     const parsedLowStockThreshold = safeParseInt(low_stock_threshold, 10);
//     const parsedShippingCost = safeParseNumber(shipping_cost, 0);

//     // ✅ UPDATED: Update query with sub_sub_category_id
//     const sql = `
//         UPDATE products 
//         SET name=?, description=?, short_description=?, price=?, discount=?, stock=?, 
//             category_id=?, sub_category_id=?, sub_sub_category_id=?, brand=?, status=?, images=?, rating=?, sizes=?, colors=?, 
//             material=?, weight=?, dimensions=?, warranty=?, features=?, tags=?, sku=?, 
//             is_featured=?, is_trending=?, is_bestseller=?, video=?, seo_title=?, 
//             seo_description=?, meta_keywords=?, return_policy=?, slug=?, min_order_quantity=?, 
//             max_order_quantity=?, low_stock_threshold=?, is_virtual=?, is_downloadable=?, 
//             download_link=?, shipping_class=?, tax_class=?, shipping_cost=?, free_shipping=?,
//             updated_at=NOW()
//         WHERE id=?
//     `;

//     const values = [
//         name,
//         description || "",
//         short_description || "",
//         parsedPrice,
//         parsedDiscount,
//         parsedStock,
//         category_id,
//         sub_category_id || null,
//         sub_sub_category_id || null, // ✅ NEW: Sub-sub-category ID
//         brand || "",
//         status,
//         JSON.stringify(finalImages),
//         parsedRating,
//         JSON.stringify(sizesArray),
//         JSON.stringify(colorsArray),
//         material || "",
//         weight || "",
//         dimensions || "",
//         warranty || "",
//         JSON.stringify(featuresArray),
//         JSON.stringify(tagsArray),
//         sku,
//         isFeaturedBool ? 1 : 0,
//         isTrendingBool ? 1 : 0,
//         isBestsellerBool ? 1 : 0,
//         finalVideo,
//         seo_title || "",
//         seo_description || "",
//         meta_keywords || "",
//         return_policy || "",
//         slug || generateSlug(name),
//         parsedMinOrderQty,
//         parsedMaxOrderQty,
//         parsedLowStockThreshold,
//         isVirtualBool ? 1 : 0,
//         isDownloadableBool ? 1 : 0,
//         download_link || "",
//         shipping_class || "",
//         tax_class || "",
//         parsedShippingCost,
//         freeShippingBool ? 1 : 0,
//         id
//     ];

//     db.query(sql, values, (err, result) => {
//         if (err) {
//             console.error("Update Error:", err);
//             // Delete newly uploaded files if DB operation fails
//             if (req.files) {
//                 Object.values(req.files).flat().forEach(file => {
//                     if (fs.existsSync(file.path)) {
//                         fs.unlinkSync(file.path);
//                     }
//                 });
//             }
//             return res.status(500).json({
//                 error: "Update failed",
//                 details: err.message
//             });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         // Fetch updated product with category, sub-category and sub-sub-category details
//         const fetchSql = `
//             SELECT p.*, 
//                    c.name as category_name, 
//                    sc.name as sub_category_name,
//                    ssc.name as sub_sub_category_name 
//             FROM products p 
//             LEFT JOIN categories c ON p.category_id = c.id 
//             LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
//             LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
//             WHERE p.id = ?
//         `;

//         db.query(fetchSql, [id], (fetchErr, productResult) => {
//             if (fetchErr) {
//                 console.error("Fetch Updated Product Error:", fetchErr);
//                 return res.json({
//                     message: "Product updated successfully",
//                     affectedRows: result.affectedRows
//                 });
//             }

//             const product = productResult[0];
//             if (product) {
//                 // Parse JSON fields
//                 product.images = safeJsonParse(product.images, []);
//                 product.sizes = safeJsonParse(product.sizes, []);
//                 product.colors = safeJsonParse(product.colors, []);
//                 product.features = safeJsonParse(product.features, []);
//                 product.tags = safeJsonParse(product.tags, []);
//                 product.is_featured = Boolean(product.is_featured);
//                 product.is_trending = Boolean(product.is_trending);
//                 product.is_bestseller = Boolean(product.is_bestseller);
//             }

//             res.json({
//                 message: "Product updated successfully",
//                 product,
//                 affectedRows: result.affectedRows
//             });
//         });
//     });
// });

// /* ================================
//    ✅ DELETE PRODUCT
// ================================ */
// router.delete("/:id", (req, res) => {
//     const { id } = req.params;

//     // First, get product to delete associated files
//     const selectSql = "SELECT images, video FROM products WHERE id = ?";
//     db.query(selectSql, [id], (selectErr, results) => {
//         if (selectErr) {
//             console.error("Select Product Error:", selectErr);
//             return res.status(500).json({ error: "Failed to delete product" });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         const product = results[0];

//         // Delete associated files
//         try {
//             // Delete images
//             const images = safeJsonParse(product.images, []);
//             images.forEach(image => {
//                 const imagePath = path.join(uploadDir, path.basename(image));
//                 if (fs.existsSync(imagePath)) {
//                     fs.unlinkSync(imagePath);
//                 }
//             });

//             // Delete video
//             if (product.video) {
//                 const videoPath = path.join(uploadDir, path.basename(product.video));
//                 if (fs.existsSync(videoPath)) {
//                     fs.unlinkSync(videoPath);
//                 }
//             }
//         } catch (fileErr) {
//             console.error("File Deletion Error:", fileErr);
//             // Continue with DB deletion even if file deletion fails
//         }

//         // Delete from database
//         const deleteSql = "DELETE FROM products WHERE id = ?";
//         db.query(deleteSql, [id], (deleteErr, result) => {
//             if (deleteErr) {
//                 console.error("Delete Product Error:", deleteErr);
//                 return res.status(500).json({ error: "Failed to delete product" });
//             }

//             res.json({
//                 message: "Product deleted successfully",
//                 affectedRows: result.affectedRows
//             });
//         });
//     });
// });

// /* ================================
//    ✅ SEARCH PRODUCTS
// ================================ */
// router.get("/search/:query", (req, res) => {
//     const { query } = req.params;
//     const searchTerm = `%${query}%`;

//     const sql = `
//         SELECT p.*, 
//                c.name as category_name, 
//                sc.name as sub_category_name,
//                ssc.name as sub_sub_category_name 
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
//         LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
//         WHERE p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?
//         ORDER BY p.created_at DESC
//     `;

//     db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
//         if (err) {
//             console.error("Search Error:", err);
//             return res.status(500).json({ error: "Search failed" });
//         }

//         const parsed = results.map((product) => ({
//             ...product,
//             images: safeJsonParse(product.images, []),
//             sizes: safeJsonParse(product.sizes, []),
//             colors: safeJsonParse(product.colors, []),
//             features: safeJsonParse(product.features, []),
//             tags: safeJsonParse(product.tags, []),
//             is_featured: Boolean(product.is_featured),
//             is_trending: Boolean(product.is_trending),
//             is_bestseller: Boolean(product.is_bestseller)
//         }));

//         res.json(parsed);
//     });
// });

// module.exports = router;


















const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../config/db");
const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ FIXED: Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname)),
});

// ✅ CRITICAL FIX: Increase ALL limits dramatically
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 30,
        parts: 500, // CRITICAL: Increase parts limit
        fieldSize: 10 * 1024 * 1024, // 10MB per field
        headerPairs: 2000
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'images') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for images field'), false);
            }
        } else if (file.fieldname === 'video') {
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new Error('Only video files are allowed for video field'), false);
            }
        } else {
            cb(null, true);
        }
    }
});

const BASE_URL = process.env.ADMIN_PUBLIC_URL || "http://localhost:5001";

// ✅ Helper: Safe JSON parse with cleaning
function safeJsonParse(str, defaultValue) {
    if (!str) return defaultValue;
    try {
        // Clean the string - remove any backticks or extra quotes
        let cleanStr = str;
        if (typeof str === 'string') {
            // Remove backticks if present
            cleanStr = str.replace(/`/g, '');
            // Remove extra quotes at start/end
            cleanStr = cleanStr.replace(/^"+|"+$/g, '');
        }
        return JSON.parse(cleanStr);
    } catch (e) {
        console.warn("JSON parse error:", e.message, "for value:", str);
        return defaultValue;
    }
}

// ✅ Helper: Generate slug
function generateSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ✅ Helper: Convert to boolean
function toBoolean(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value === 'true' || value === '1' || value === 'yes';
    }
    return Boolean(value);
}

// ✅ Helper: Parse number
function safeParseNumber(value, defaultValue = 0) {
    if (value === undefined || value === null || value === '') return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

// ✅ Helper: Parse integer
function safeParseInt(value, defaultValue = 0) {
    if (value === undefined || value === null || value === '') return defaultValue;
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
}

/* ================================
   ✅ CATEGORY ROUTES
================================ */
router.get("/categories", (req, res) => {
    const sql = "SELECT * FROM categories WHERE status = 'active' ORDER BY name";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Categories Error:", err);
            return res.status(500).json({ error: "Failed to fetch categories" });
        }
        res.json(results);
    });
});

router.post("/categories", (req, res) => {
    const { name, description, status = 'active' } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });
    const sql = "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)";
    db.query(sql, [name, description || "", status], (err, result) => {
        if (err) {
            console.error("Add Category Error:", err);
            return res.status(500).json({ error: "Failed to add category" });
        }
        res.json({
            message: "Category added successfully",
            category: { id: result.insertId, name, description, status }
        });
    });
});

/* ================================
   ✅ SUB-CATEGORY ROUTES
================================ */
router.get("/sub-categories", (req, res) => {
    const sql = `
        SELECT sc.*, c.name as category_name 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.category_id = c.id 
        WHERE sc.status = 'active' 
        ORDER BY sc.name
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Sub-Categories Error:", err);
            return res.status(500).json({ error: "Failed to fetch sub-categories" });
        }
        res.json(results);
    });
});

router.get("/sub-categories/category/:categoryId", (req, res) => {
    const { categoryId } = req.params;
    const sql = `
        SELECT sc.*, c.name as category_name 
        FROM sub_categories sc 
        LEFT JOIN categories c ON sc.category_id = c.id 
        WHERE sc.category_id = ? AND sc.status = 'active' 
        ORDER BY sc.name
    `;
    db.query(sql, [categoryId], (err, results) => {
        if (err) {
            console.error("Sub-Categories by Category Error:", err);
            return res.status(500).json({ error: "Failed to fetch sub-categories" });
        }
        res.json(results);
    });
});

router.post("/sub-categories", (req, res) => {
    const { name, description, category_id, status = 'active' } = req.body;
    if (!name) return res.status(400).json({ error: "Sub-category name is required" });
    if (!category_id) return res.status(400).json({ error: "Category ID is required" });
    const sql = "INSERT INTO sub_categories (name, description, category_id, status) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, description || "", category_id, status], (err, result) => {
        if (err) {
            console.error("Add Sub-Category Error:", err);
            return res.status(500).json({ error: "Failed to add sub-category" });
        }
        res.json({
            message: "Sub-category added successfully",
            sub_category: { id: result.insertId, name, description, category_id, status }
        });
    });
});

/* ================================
   ✅ SUB-SUB-CATEGORY ROUTES
================================ */
router.get("/sub-sub-categories", (req, res) => {
    const sql = `
        SELECT ssc.*, sc.name as sub_category_name, c.name as category_name 
        FROM sub_sub_categories ssc 
        LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id 
        LEFT JOIN categories c ON sc.category_id = c.id 
        WHERE ssc.status = 'active' 
        ORDER BY ssc.name
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Sub-Sub-Categories Error:", err);
            return res.status(500).json({ error: "Failed to fetch sub-sub-categories" });
        }
        res.json(results);
    });
});

router.get("/sub-sub-categories/subcategory/:subCategoryId", (req, res) => {
    const { subCategoryId } = req.params;
    const sql = `
        SELECT ssc.*, sc.name as sub_category_name, c.name as category_name 
        FROM sub_sub_categories ssc 
        LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id 
        LEFT JOIN categories c ON sc.category_id = c.id 
        WHERE ssc.sub_category_id = ? AND ssc.status = 'active' 
        ORDER BY ssc.name
    `;
    db.query(sql, [subCategoryId], (err, results) => {
        if (err) {
            console.error("Sub-Sub-Categories by Sub-Category Error:", err);
            return res.status(500).json({ error: "Failed to fetch sub-sub-categories" });
        }
        res.json(results);
    });
});

router.post("/sub-sub-categories", (req, res) => {
    const { name, description, sub_category_id, status = 'active' } = req.body;
    if (!name) return res.status(400).json({ error: "Sub-sub-category name is required" });
    if (!sub_category_id) return res.status(400).json({ error: "Sub-category ID is required" });
    const sql = "INSERT INTO sub_sub_categories (name, description, sub_category_id, status) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, description || "", sub_category_id, status], (err, result) => {
        if (err) {
            console.error("Add Sub-Sub-Category Error:", err);
            return res.status(500).json({ error: "Failed to add sub-sub-category" });
        }
        res.json({
            message: "Sub-sub-category added successfully",
            sub_sub_category: { id: result.insertId, name, description, sub_category_id, status }
        });
    });
});

/* ================================
   ✅ ADD PRODUCT
================================ */
router.post("/add", upload.fields([
    { name: 'images', maxCount: 20 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    console.log("📦 Adding product...");

    const {
        name, description, short_description, price, discount, stock,
        category_id, sub_category_id, sub_sub_category_id, brand,
        status = "active", rating = 0,
        sizes, colors, material, weight, dimensions, warranty,
        features, tags, sku,
        is_featured = false, is_trending = false, is_bestseller = false,
        seo_title, seo_description, meta_keywords,
        return_policy, slug,
        min_order_quantity = 1, max_order_quantity, low_stock_threshold = 10,
        is_virtual = false, is_downloadable = false, download_link,
        shipping_class, tax_class, shipping_cost = 0, free_shipping = false
    } = req.body;

    if (!name) return res.status(400).json({ error: "Product name is required" });
    if (!sku) return res.status(400).json({ error: "SKU is required" });
    if (!category_id) return res.status(400).json({ error: "Category is required" });

    // Process images
    const images = (req.files && req.files['images']) ?
        req.files['images'].map(f => `${BASE_URL}/uploads/${f.filename}`) : [];

    // Process video
    let video = null;
    if (req.files && req.files['video'] && req.files['video'][0]) {
        video = `${BASE_URL}/uploads/${req.files['video'][0].filename}`;
    }

    // Parse JSON fields safely
    const sizesArray = safeJsonParse(sizes, []);
    const colorsArray = safeJsonParse(colors, []);
    const featuresArray = safeJsonParse(features, []);
    const tagsArray = safeJsonParse(tags, []);

    // Convert booleans
    const isFeaturedBool = toBoolean(is_featured) ? 1 : 0;
    const isTrendingBool = toBoolean(is_trending) ? 1 : 0;
    const isBestsellerBool = toBoolean(is_bestseller) ? 1 : 0;
    const isVirtualBool = toBoolean(is_virtual) ? 1 : 0;
    const isDownloadableBool = toBoolean(is_downloadable) ? 1 : 0;
    const freeShippingBool = toBoolean(free_shipping) ? 1 : 0;

    // Parse numbers
    const parsedPrice = safeParseNumber(price, 0);
    const parsedDiscount = safeParseNumber(discount, 0);
    const parsedStock = safeParseInt(stock, 0);
    const parsedRating = safeParseNumber(rating, 0);
    const parsedMinOrderQty = safeParseInt(min_order_quantity, 1);
    const parsedMaxOrderQty = max_order_quantity ? safeParseInt(max_order_quantity) : null;
    const parsedLowStockThreshold = safeParseInt(low_stock_threshold, 10);
    const parsedShippingCost = safeParseNumber(shipping_cost, 0);

    const sql = `
        INSERT INTO products 
        (name, description, short_description, price, discount, stock, 
         category_id, sub_category_id, sub_sub_category_id, brand, 
         images, status, rating, sizes, colors, material, weight, 
         dimensions, warranty, features, tags, sku, 
         is_featured, is_trending, is_bestseller, video, 
         seo_title, seo_description, meta_keywords, return_policy, slug, 
         min_order_quantity, max_order_quantity, low_stock_threshold, 
         is_virtual, is_downloadable, download_link,
         shipping_class, tax_class, shipping_cost, free_shipping) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name, description || "", short_description || "",
        parsedPrice, parsedDiscount, parsedStock,
        category_id, sub_category_id || null, sub_sub_category_id || null, brand || "",
        JSON.stringify(images), status, parsedRating,
        JSON.stringify(sizesArray), JSON.stringify(colorsArray),
        material || "", weight || "", dimensions || "", warranty || "",
        JSON.stringify(featuresArray), JSON.stringify(tagsArray), sku,
        isFeaturedBool, isTrendingBool, isBestsellerBool, video,
        seo_title || "", seo_description || "", meta_keywords || "",
        return_policy || "", slug || generateSlug(name),
        parsedMinOrderQty, parsedMaxOrderQty, parsedLowStockThreshold,
        isVirtualBool, isDownloadableBool, download_link || "",
        shipping_class || "", tax_class || "", parsedShippingCost, freeShippingBool
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("❌ DB Error:", err);
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
            }
            return res.status(500).json({ error: "Database operation failed", details: err.message });
        }

        console.log("✅ Product added with ID:", result.insertId);
        res.json({
            message: "Product added successfully",
            product: { id: result.insertId, name, sku }
        });
    });
});

/* ================================
   ✅ LIST PRODUCTS
================================ */
router.get("/", (req, res) => {
    const sql = `
        SELECT p.*, c.name as category_name, sc.name as sub_category_name, ssc.name as sub_sub_category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
        ORDER BY p.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Products List Error:", err);
            return res.status(500).json({ error: "Failed to fetch products" });
        }

        const parsed = results.map((product) => ({
            ...product,
            images: safeJsonParse(product.images, []),
            sizes: safeJsonParse(product.sizes, []),
            colors: safeJsonParse(product.colors, []),
            features: safeJsonParse(product.features, []),
            tags: safeJsonParse(product.tags, []),
            is_featured: Boolean(product.is_featured),
            is_trending: Boolean(product.is_trending),
            is_bestseller: Boolean(product.is_bestseller)
        }));

        res.json(parsed);
    });
});

/* ================================
   ✅ GET SINGLE PRODUCT
================================ */
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT p.*, c.name as category_name, sc.name as sub_category_name, ssc.name as sub_sub_category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
        WHERE p.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Product Fetch Error:", err);
            return res.status(500).json({ error: "Failed to fetch product" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = results[0];
        product.images = safeJsonParse(product.images, []);
        product.sizes = safeJsonParse(product.sizes, []);
        product.colors = safeJsonParse(product.colors, []);
        product.features = safeJsonParse(product.features, []);
        product.tags = safeJsonParse(product.tags, []);
        product.is_featured = Boolean(product.is_featured);
        product.is_trending = Boolean(product.is_trending);
        product.is_bestseller = Boolean(product.is_bestseller);

        res.json(product);
    });
});

/* ================================
   ✅ 🔥🔥🔥 COMPLETE REWRITE - UPDATE PRODUCT
   ================================ */
router.put("/:id", (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Processing update for product ID: ${id}`);

    // ✅ Check if this is multipart/form-data or application/json
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');

    if (isMultipart) {
        // Handle multipart form data with files
        const uploadMiddleware = upload.fields([
            { name: 'images', maxCount: 10 },
            { name: 'video', maxCount: 1 }
        ]);

        return uploadMiddleware(req, res, (err) => {
            if (err) {
                console.error("❌ Multer Error:", err);
                return res.status(400).json({
                    error: "File upload error",
                    details: err.message
                });
            }

            // Process the multipart form data
            processProductUpdate(req, res, id);
        });
    } else {
        // Handle JSON data (no files)
        processProductUpdate(req, res, id);
    }
});

// Shared update function
function processProductUpdate(req, res, id) {
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');

    // Get data from either req.body (JSON) or req.body (multipart)
    let body = req.body;

    console.log("📦 Update data received");

    const {
        name, description, short_description, price, discount, stock,
        category_id, sub_category_id, sub_sub_category_id, brand,
        status = "active", rating = 0,
        sizes, colors, material, weight, dimensions, warranty,
        features, tags, sku,
        is_featured = false, is_trending = false, is_bestseller = false,
        seo_title, seo_description, meta_keywords,
        return_policy, slug,
        min_order_quantity = 1, max_order_quantity, low_stock_threshold = 10,
        is_virtual = false, is_downloadable = false, download_link,
        shipping_class, tax_class, shipping_cost = 0, free_shipping = false,
        oldImages, oldVideo
    } = body;

    // Validation
    if (!name) return res.status(400).json({ error: "Product name is required" });
    if (!sku) return res.status(400).json({ error: "SKU is required" });
    if (!category_id) return res.status(400).json({ error: "Category is required" });

    // ✅ Handle array fields - support both JSON strings and comma-separated strings
    let sizesArray = [];
    if (sizes) {
        if (typeof sizes === 'string') {
            if (sizes.startsWith('[')) {
                try { sizesArray = JSON.parse(sizes); } catch (e) { sizesArray = []; }
            } else {
                sizesArray = sizes.split(',').filter(s => s.trim());
            }
        } else if (Array.isArray(sizes)) {
            sizesArray = sizes;
        }
    }

    let colorsArray = [];
    if (colors) {
        if (typeof colors === 'string') {
            if (colors.startsWith('[')) {
                try { colorsArray = JSON.parse(colors); } catch (e) { colorsArray = []; }
            } else {
                colorsArray = colors.split(',').filter(s => s.trim());
            }
        } else if (Array.isArray(colors)) {
            colorsArray = colors;
        }
    }

    let featuresArray = [];
    if (features) {
        if (typeof features === 'string') {
            if (features.startsWith('[')) {
                try { featuresArray = JSON.parse(features); } catch (e) { featuresArray = []; }
            } else {
                featuresArray = features.split(',').filter(s => s.trim());
            }
        } else if (Array.isArray(features)) {
            featuresArray = features;
        }
    }

    let tagsArray = [];
    if (tags) {
        if (typeof tags === 'string') {
            if (tags.startsWith('[')) {
                try { tagsArray = JSON.parse(tags); } catch (e) { tagsArray = []; }
            } else {
                tagsArray = tags.split(',').filter(s => s.trim());
            }
        } else if (Array.isArray(tags)) {
            tagsArray = tags;
        }
    }

    // ✅ Handle images
    let finalImages = [];
    if (oldImages) {
        if (typeof oldImages === 'string') {
            try { finalImages = JSON.parse(oldImages); } catch (e) { finalImages = []; }
        } else if (Array.isArray(oldImages)) {
            finalImages = oldImages;
        }
    }

    // Add new images if they exist (multipart only)
    if (isMultipart && req.files && req.files['images']) {
        const newImages = req.files['images'].map(f => `${BASE_URL}/uploads/${f.filename}`);
        finalImages = [...finalImages, ...newImages];
    }

    // ✅ Handle video
    let finalVideo = oldVideo || null;
    if (isMultipart && req.files && req.files['video'] && req.files['video'][0]) {
        finalVideo = `${BASE_URL}/uploads/${req.files['video'][0].filename}`;
        // Delete old video if it exists
        if (oldVideo) {
            try {
                const oldVideoPath = path.join(uploadDir, path.basename(oldVideo));
                if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
            } catch (fileErr) {
                console.error("Error deleting old video:", fileErr);
            }
        }
    }

    // Convert booleans
    const isFeaturedBool = toBoolean(is_featured) ? 1 : 0;
    const isTrendingBool = toBoolean(is_trending) ? 1 : 0;
    const isBestsellerBool = toBoolean(is_bestseller) ? 1 : 0;
    const isVirtualBool = toBoolean(is_virtual) ? 1 : 0;
    const isDownloadableBool = toBoolean(is_downloadable) ? 1 : 0;
    const freeShippingBool = toBoolean(free_shipping) ? 1 : 0;

    // Parse numbers
    const parsedPrice = safeParseNumber(price, 0);
    const parsedDiscount = safeParseNumber(discount, 0);
    const parsedStock = safeParseInt(stock, 0);
    const parsedRating = safeParseNumber(rating, 0);
    const parsedMinOrderQty = safeParseInt(min_order_quantity, 1);
    const parsedMaxOrderQty = max_order_quantity ? safeParseInt(max_order_quantity) : null;
    const parsedLowStockThreshold = safeParseInt(low_stock_threshold, 10);
    const parsedShippingCost = safeParseNumber(shipping_cost, 0);

    const sql = `
        UPDATE products 
        SET name=?, description=?, short_description=?, price=?, discount=?, stock=?, 
            category_id=?, sub_category_id=?, sub_sub_category_id=?, brand=?, status=?, 
            images=?, rating=?, sizes=?, colors=?, material=?, weight=?, dimensions=?, 
            warranty=?, features=?, tags=?, sku=?, 
            is_featured=?, is_trending=?, is_bestseller=?, video=?, 
            seo_title=?, seo_description=?, meta_keywords=?, return_policy=?, slug=?, 
            min_order_quantity=?, max_order_quantity=?, low_stock_threshold=?, 
            is_virtual=?, is_downloadable=?, download_link=?, 
            shipping_class=?, tax_class=?, shipping_cost=?, free_shipping=?,
            updated_at=NOW()
        WHERE id=?
    `;

    const values = [
        name, description || "", short_description || "",
        parsedPrice, parsedDiscount, parsedStock,
        category_id, sub_category_id || null, sub_sub_category_id || null, brand || "",
        status, JSON.stringify(finalImages), parsedRating,
        JSON.stringify(sizesArray), JSON.stringify(colorsArray),
        material || "", weight || "", dimensions || "", warranty || "",
        JSON.stringify(featuresArray), JSON.stringify(tagsArray), sku,
        isFeaturedBool, isTrendingBool, isBestsellerBool, finalVideo,
        seo_title || "", seo_description || "", meta_keywords || "",
        return_policy || "", slug || generateSlug(name),
        parsedMinOrderQty, parsedMaxOrderQty, parsedLowStockThreshold,
        isVirtualBool, isDownloadableBool, download_link || "",
        shipping_class || "", tax_class || "", parsedShippingCost, freeShippingBool,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("❌ Update Error:", err);
            // Delete uploaded files if DB fails
            if (isMultipart && req.files) {
                Object.values(req.files).flat().forEach(file => {
                    try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) { }
                });
            }
            return res.status(500).json({ error: "Update failed", details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        console.log(`✅ Product ${id} updated successfully`);
        res.json({
            message: "Product updated successfully",
            affectedRows: result.affectedRows
        });
    });
}

/* ================================
   ✅ DELETE PRODUCT
================================ */
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const selectSql = "SELECT images, video FROM products WHERE id = ?";
    db.query(selectSql, [id], (selectErr, results) => {
        if (selectErr) {
            console.error("Select Product Error:", selectErr);
            return res.status(500).json({ error: "Failed to delete product" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = results[0];

        // Delete files
        try {
            const images = safeJsonParse(product.images, []);
            images.forEach(image => {
                const imagePath = path.join(uploadDir, path.basename(image));
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            });
            if (product.video) {
                const videoPath = path.join(uploadDir, path.basename(product.video));
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            }
        } catch (fileErr) {
            console.error("File Deletion Error:", fileErr);
        }

        const deleteSql = "DELETE FROM products WHERE id = ?";
        db.query(deleteSql, [id], (deleteErr, result) => {
            if (deleteErr) {
                console.error("Delete Product Error:", deleteErr);
                return res.status(500).json({ error: "Failed to delete product" });
            }
            res.json({ message: "Product deleted successfully", affectedRows: result.affectedRows });
        });
    });
});

/* ================================
   ✅ SEARCH PRODUCTS
================================ */
router.get("/search/:query", (req, res) => {
    const { query } = req.params;
    const searchTerm = `%${query}%`;

    const sql = `
        SELECT p.*, c.name as category_name, sc.name as sub_category_name, ssc.name as sub_sub_category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id 
        WHERE p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?
        ORDER BY p.created_at DESC
    `;

    db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error("Search Error:", err);
            return res.status(500).json({ error: "Search failed" });
        }

        const parsed = results.map((product) => ({
            ...product,
            images: safeJsonParse(product.images, []),
            sizes: safeJsonParse(product.sizes, []),
            colors: safeJsonParse(product.colors, []),
            features: safeJsonParse(product.features, []),
            tags: safeJsonParse(product.tags, []),
            is_featured: Boolean(product.is_featured),
            is_trending: Boolean(product.is_trending),
            is_bestseller: Boolean(product.is_bestseller)
        }));

        res.json(parsed);
    });
});

module.exports = router;