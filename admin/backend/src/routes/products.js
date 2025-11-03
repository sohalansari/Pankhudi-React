const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../config/db");
const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage for images and videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    }
});

const BASE_URL = process.env.ADMIN_PUBLIC_URL || "http://localhost:5001";

/* ================================
   ✅ Add product - OPTIMIZED FOR YOUR TABLE
================================ */
router.post("/add", upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    const {
        name,
        description,
        price,
        discount,
        stock,
        category_id,
        brand,
        status,
        rating,
        // New fields
        sizes,
        colors,
        material,
        weight,
        dimensions,
        warranty,
        features,
        tags,
        sku,
        is_featured,
        is_trending,
        is_bestseller,
        seo_title,
        seo_description,
        meta_keywords,
        // Existing fields from your table
        short_description,
        return_policy,
        slug,
        min_order_quantity,
        max_order_quantity,
        low_stock_threshold,
        is_virtual,
        is_downloadable,
        download_link,
        shipping_class,
        tax_class,
        shipping_cost,
        free_shipping
    } = req.body;

    // Validation
    if (!name) return res.status(400).json({ error: "Product name is required" });
    if (!sku) return res.status(400).json({ error: "SKU is required" });
    if (!category_id) return res.status(400).json({ error: "Category is required" });

    // Process images
    const images = (req.files['images'] || []).map(
        (f) => `${BASE_URL}/uploads/${f.filename}`
    );

    // Process video
    let video = null;
    if (req.files['video'] && req.files['video'][0]) {
        video = `${BASE_URL}/uploads/${req.files['video'][0].filename}`;
    }

    // Parse array fields to JSON
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
    const colorsArray = Array.isArray(colors) ? colors : (colors ? [colors] : []);
    const featuresArray = Array.isArray(features) ? features : (features ? [features] : []);
    const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);

    // Convert boolean fields
    const isFeaturedBool = is_featured === 'true' || is_featured === true || is_featured === 1;
    const isTrendingBool = is_trending === 'true' || is_trending === true || is_trending === 1;
    const isBestsellerBool = is_bestseller === 'true' || is_bestseller === true || is_bestseller === 1;
    const isVirtualBool = is_virtual === 'true' || is_virtual === true || is_virtual === 1;
    const isDownloadableBool = is_downloadable === 'true' || is_downloadable === true || is_downloadable === 1;
    const freeShippingBool = free_shipping === 'true' || free_shipping === true || free_shipping === 1;

    const sql = `
        INSERT INTO products 
        (name, description, short_description, price, discount, stock, category_id, brand, 
         images, status, rating, sizes, colors, material, weight, dimensions, warranty, 
         features, tags, sku, is_featured, is_trending, is_bestseller, video, seo_title, 
         seo_description, meta_keywords, return_policy, slug, min_order_quantity, 
         max_order_quantity, low_stock_threshold, is_virtual, is_downloadable, download_link,
         shipping_class, tax_class, shipping_cost, free_shipping) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            description || "",
            short_description || "",
            price || 0,
            discount || 0,
            stock || 0,
            category_id,
            brand || "",
            JSON.stringify(images),
            status || "Active",
            rating || 0,
            JSON.stringify(sizesArray),
            JSON.stringify(colorsArray),
            material || "",
            weight || "",
            dimensions || "",
            warranty || "",
            JSON.stringify(featuresArray),
            JSON.stringify(tagsArray),
            sku,
            isFeaturedBool ? 1 : 0,
            isTrendingBool ? 1 : 0,
            isBestsellerBool ? 1 : 0,
            video,
            seo_title || "",
            seo_description || "",
            meta_keywords || "",
            return_policy || "",
            slug || generateSlug(name),
            min_order_quantity || 1,
            max_order_quantity || null,
            low_stock_threshold || 10,
            isVirtualBool ? 1 : 0,
            isDownloadableBool ? 1 : 0,
            download_link || "",
            shipping_class || "",
            tax_class || "",
            shipping_cost || 0,
            freeShippingBool ? 1 : 0
        ],
        (err, result) => {
            if (err) {
                console.error("DB Error:", err);
                // Delete uploaded files if DB operation fails
                if (req.files) {
                    Object.values(req.files).flat().forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: "Product added successfully",
                id: result.insertId,
                images,
                video,
                rating: rating || 0,
            });
        }
    );
});

/* ================================
   ✅ List products - OPTIMIZED
================================ */
router.get("/", (req, res) => {
    const sql = "SELECT * FROM products ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const parsed = results.map((r) => ({
            ...r,
            images: safeJsonParse(r.images, []),
            sizes: safeJsonParse(r.sizes, []),
            colors: safeJsonParse(r.colors, []),
            features: safeJsonParse(r.features, []),
            tags: safeJsonParse(r.tags, []),
            is_featured: Boolean(r.is_featured),
            is_trending: Boolean(r.is_trending),
            is_bestseller: Boolean(r.is_bestseller)
        }));
        res.json(parsed);
    });
});

/* ================================
   ✅ Update product - OPTIMIZED
================================ */
router.put("/:id", upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        price,
        discount,
        stock,
        category_id,
        brand,
        status,
        rating,
        // New fields
        sizes,
        colors,
        material,
        weight,
        dimensions,
        warranty,
        features,
        tags,
        sku,
        is_featured,
        is_trending,
        is_bestseller,
        seo_title,
        seo_description,
        meta_keywords,
        // Existing fields
        short_description,
        return_policy,
        slug,
        min_order_quantity,
        max_order_quantity,
        low_stock_threshold,
        is_virtual,
        is_downloadable,
        download_link,
        shipping_class,
        tax_class,
        shipping_cost,
        free_shipping,
        oldImages,
        oldVideo
    } = req.body;

    // Validation
    if (!name) return res.status(400).json({ error: "Product name is required" });
    if (!sku) return res.status(400).json({ error: "SKU is required" });
    if (!category_id) return res.status(400).json({ error: "Category is required" });

    // Process old images
    let finalImages = [];
    try {
        finalImages = oldImages ? JSON.parse(oldImages) : [];
    } catch (e) {
        finalImages = [];
    }

    // Add new images
    if (req.files['images']) {
        const newImages = req.files['images'].map(
            (f) => `${BASE_URL}/uploads/${f.filename}`
        );
        finalImages = [...finalImages, ...newImages];
    }

    // Process video
    let finalVideo = oldVideo || null;
    if (req.files['video'] && req.files['video'][0]) {
        finalVideo = `${BASE_URL}/uploads/${req.files['video'][0].filename}`;
        // Delete old video if exists and new one is uploaded
        if (oldVideo) {
            const oldVideoPath = path.join(uploadDir, path.basename(oldVideo));
            if (fs.existsSync(oldVideoPath)) {
                fs.unlinkSync(oldVideoPath);
            }
        }
    }

    // Parse array fields
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
    const colorsArray = Array.isArray(colors) ? colors : (colors ? [colors] : []);
    const featuresArray = Array.isArray(features) ? features : (features ? [features] : []);
    const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);

    // Convert boolean fields
    const isFeaturedBool = is_featured === 'true' || is_featured === true || is_featured === 1;
    const isTrendingBool = is_trending === 'true' || is_trending === true || is_trending === 1;
    const isBestsellerBool = is_bestseller === 'true' || is_bestseller === true || is_bestseller === 1;
    const isVirtualBool = is_virtual === 'true' || is_virtual === true || is_virtual === 1;
    const isDownloadableBool = is_downloadable === 'true' || is_downloadable === true || is_downloadable === 1;
    const freeShippingBool = free_shipping === 'true' || free_shipping === true || free_shipping === 1;

    const sql = `
        UPDATE products 
        SET name=?, description=?, short_description=?, price=?, discount=?, stock=?, 
            category_id=?, brand=?, status=?, images=?, rating=?, sizes=?, colors=?, 
            material=?, weight=?, dimensions=?, warranty=?, features=?, tags=?, sku=?, 
            is_featured=?, is_trending=?, is_bestseller=?, video=?, seo_title=?, 
            seo_description=?, meta_keywords=?, return_policy=?, slug=?, min_order_quantity=?, 
            max_order_quantity=?, low_stock_threshold=?, is_virtual=?, is_downloadable=?, 
            download_link=?, shipping_class=?, tax_class=?, shipping_cost=?, free_shipping=?,
            updated_at=NOW()
        WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            description,
            short_description || "",
            price || 0,
            discount || 0,
            stock || 0,
            category_id,
            brand || "",
            status || "Active",
            JSON.stringify(finalImages),
            rating || 0,
            JSON.stringify(sizesArray),
            JSON.stringify(colorsArray),
            material || "",
            weight || "",
            dimensions || "",
            warranty || "",
            JSON.stringify(featuresArray),
            JSON.stringify(tagsArray),
            sku,
            isFeaturedBool ? 1 : 0,
            isTrendingBool ? 1 : 0,
            isBestsellerBool ? 1 : 0,
            finalVideo,
            seo_title || "",
            seo_description || "",
            meta_keywords || "",
            return_policy || "",
            slug || generateSlug(name),
            min_order_quantity || 1,
            max_order_quantity || null,
            low_stock_threshold || 10,
            isVirtualBool ? 1 : 0,
            isDownloadableBool ? 1 : 0,
            download_link || "",
            shipping_class || "",
            tax_class || "",
            shipping_cost || 0,
            freeShippingBool ? 1 : 0,
            id
        ],
        (err, result) => {
            if (err) {
                console.error("Update Error:", err);
                // Delete newly uploaded files if DB operation fails
                if (req.files) {
                    Object.values(req.files).flat().forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: "Product updated successfully",
                affectedRows: result.affectedRows,
                images: finalImages,
                video: finalVideo,
            });
        }
    );
});

// Helper function to generate slug
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Helper function to safely parse JSON
function safeJsonParse(str, defaultValue) {
    try {
        return str ? JSON.parse(str) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

// Export other routes as before...
module.exports = router;