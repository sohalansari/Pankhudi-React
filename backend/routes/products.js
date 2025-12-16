const express = require("express");
const router = express.Router();
// ------------------ Helper: Parse Product with Sub-Category Support ------------------
const parseProduct = (r, req) => {
    let imgs = [];
    try {
        const parsedImages = JSON.parse(r.images);
        imgs = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
    } catch {
        imgs = r.images ? [r.images] : [];
    }

    // Video URL handling - CORRECT COLUMN NAME: video
    let videoUrl = null;
    if (r.video) {
        try {
            // Check if it's already a full URL
            if (r.video.startsWith('http')) {
                videoUrl = r.video;
            } else {
                // Relative path hai toh full URL banao
                videoUrl = `${req.protocol}://${req.get("host")}/uploads/${r.video}`;
            }
        } catch (error) {
            console.error("Error parsing video URL:", error);
            videoUrl = null;
        }
    }

    // ✅ FIXED: Correct discount price calculation
    const originalPrice = parseFloat(r.price) || 0;
    const discountPercentage = parseFloat(r.discount) || 0;

    let discountPrice = null;
    if (discountPercentage > 0 && discountPercentage <= 100) {
        discountPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
        // Ensure discount price is not higher than original price
        if (discountPrice >= originalPrice) {
            discountPrice = null;
        }
    }

    const createdAt = new Date(r.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const isNew = diffDays <= 10;

    // Parse tags if they exist
    let tags = [];
    if (r.tags) {
        try {
            tags = JSON.parse(r.tags);
        } catch {
            tags = r.tags ? r.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        }
    }

    // Parse variants if they exist
    let sizes = [];
    let colors = [];
    let materials = [];

    if (r.sizes) {
        try {
            sizes = JSON.parse(r.sizes);
        } catch {
            sizes = r.sizes ? r.sizes.split(',').map(size => size.trim()).filter(size => size) : [];
        }
    }

    if (r.colors) {
        try {
            colors = JSON.parse(r.colors);
        } catch {
            colors = r.colors ? r.colors.split(',').map(color => color.trim()).filter(color => color) : [];
        }
    }

    if (r.materials) {
        try {
            materials = JSON.parse(r.materials);
        } catch {
            materials = r.materials ? r.materials.split(',').map(material => material.trim()).filter(material => material) : [];
        }
    }

    // Parse features if they exist
    let features = [];
    if (r.features) {
        try {
            features = JSON.parse(r.features);
        } catch {
            features = r.features ? r.features.split(',').map(feature => feature.trim()).filter(feature => feature) : [];
        }
    }

    // Category and Sub-category handling
    let categoryName = 'Uncategorized';
    if (r.category_name) {
        categoryName = r.category_name;
    } else if (r.category) {
        categoryName = r.category;
    } else if (r.category_id) {
        categoryName = `Category ${r.category_id}`;
    }

    let subCategoryName = null;
    if (r.sub_category_name) {
        subCategoryName = r.sub_category_name;
    } else if (r.sub_category_id) {
        subCategoryName = `Sub-category ${r.sub_category_id}`;
    }

    return {
        id: r.id,
        name: r.name,
        sku: r.sku,
        description: r.description,
        short_description: r.short_description,
        price: originalPrice, // ✅ Original price
        discount: discountPercentage, // ✅ Discount percentage
        discountPrice: discountPrice, // ✅ Correct discounted price
        rating: parseFloat(r.rating) || 0,
        stock: parseInt(r.stock) || 0,
        category_id: r.category_id,
        category: categoryName,
        sub_category_id: r.sub_category_id,
        sub_category_name: subCategoryName,
        brand: r.brand || 'Unknown Brand',

        // Product specifications
        weight: r.weight ? parseFloat(r.weight) : null,
        dimensions: r.dimensions,
        material: r.material,
        color: r.color,
        size: r.size,
        warranty_period: r.warranty_period,
        return_policy: r.return_policy,

        // Variants arrays
        sizes: sizes,
        colors: colors,
        materials: materials,

        // SEO fields
        meta_title: r.meta_title,
        meta_description: r.meta_description,
        meta_keywords: r.meta_keywords,
        slug: r.slug,
        tags: tags,

        // VIDEO URL - CORRECT COLUMN NAME: video
        video_url: videoUrl,

        // Inventory management
        min_order_quantity: parseInt(r.min_order_quantity) || 1,
        max_order_quantity: r.max_order_quantity ? parseInt(r.max_order_quantity) : null,
        low_stock_threshold: parseInt(r.low_stock_threshold) || 10,
        is_virtual: Boolean(r.is_virtual),
        is_downloadable: Boolean(r.is_downloadable),
        download_link: r.download_link,

        // Shipping & tax
        shipping_class: r.shipping_class,
        tax_class: r.tax_class,
        shipping_cost: r.shipping_cost ? parseFloat(r.shipping_cost) : 0,
        free_shipping: Boolean(r.free_shipping),
        estimated_delivery: r.estimated_delivery,

        // Product status and flags
        status: r.status || 'Active',
        isNew,
        is_trending: Boolean(r.is_trending),
        is_featured: Boolean(r.is_featured),
        is_bestseller: Boolean(r.is_bestseller),
        is_on_sale: Boolean(r.is_on_sale),

        // Additional product info
        model_number: r.model_number,
        upc: r.upc,
        manufacturer: r.manufacturer,
        country_of_origin: r.country_of_origin,

        // Technical specifications
        power_requirements: r.power_requirements,
        compatibility: r.compatibility,
        features: features,

        // Digital product specific
        file_size: r.file_size,
        file_format: r.file_format,
        download_limit: r.download_limit ? parseInt(r.download_limit) : null,
        download_expiry: r.download_expiry,

        // Images
        images: imgs.map(img => img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`),
        image: imgs.length > 0 ? (imgs[0].startsWith('http') ? imgs[0] : `${req.protocol}://${req.get("host")}/uploads/${imgs[0]}`) : null,

        // Timestamps
        created_at: r.created_at,
        updated_at: r.updated_at
    };
};
// ------------------ Get All Products with Sub-Category Support ------------------
router.get("/", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const {
        category_id,
        sub_category_id,
        featured,
        trending,
        bestseller,
        search,
        min_price,
        max_price,
        brand,
        limit = 20,
        page = 1
    } = req.query;

    let sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.status = 'Active'
    `;

    const params = [];
    const conditions = [];

    // Add search condition
    if (search) {
        conditions.push("(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.tags LIKE ?)");
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add category filter
    if (category_id) {
        conditions.push("p.category_id = ?");
        params.push(category_id);
    }

    // Add sub-category filter
    if (sub_category_id) {
        conditions.push("p.sub_category_id = ?");
        params.push(sub_category_id);
    }

    // Add brand filter
    if (brand) {
        conditions.push("p.brand = ?");
        params.push(brand);
    }

    // Add price range filter
    if (min_price) {
        conditions.push("p.price >= ?");
        params.push(min_price);
    }
    if (max_price) {
        conditions.push("p.price <= ?");
        params.push(max_price);
    }

    // Add featured/trending/bestseller filters
    if (featured === 'true') {
        conditions.push("p.is_featured = 1");
    }
    if (trending === 'true') {
        conditions.push("p.is_trending = 1");
    }
    if (bestseller === 'true') {
        conditions.push("p.is_bestseller = 1");
    }

    // Combine all conditions
    if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
    }

    // Add sorting and pagination
    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Get Single Product with Sub-Category Support ------------------
router.get("/:id", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const productId = req.params.id;

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.id = ?
    `;

    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = parseProduct(results[0], req);
        res.json(product);
    });
});

// ------------------ Search Products with Sub-Category Support ------------------
router.get("/search", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const search = req.query.search || "";

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE (p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ? OR p.description LIKE ?) 
        AND p.status = 'Active' 
        LIMIT 10
    `;

    db.query(sql, [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Trending Products with Sub-Category Support ------------------
router.get("/trending", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.is_trending = 1 AND p.status = 'Active' 
        ORDER BY p.created_at DESC 
        LIMIT 5
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Featured Products with Sub-Category Support ------------------
router.get("/featured", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.is_featured = 1 AND p.status = 'Active' 
        ORDER BY p.created_at DESC 
        LIMIT 8
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Bestseller Products with Sub-Category Support ------------------
router.get("/bestsellers", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.is_bestseller = 1 AND p.status = 'Active' 
        ORDER BY p.rating DESC, p.created_at DESC 
        LIMIT 8
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Sale Products with Sub-Category Support ------------------
router.get("/sale", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE (p.discount > 0 OR p.is_on_sale = 1) AND p.status = 'Active' 
        ORDER BY p.discount DESC 
        LIMIT 8
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Related Products with Sub-Category Support ------------------
router.get("/related/:category", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const category = req.params.category;
    const limit = parseInt(req.query.limit) || 4;
    const excludeId = req.query.exclude || 0;

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.category_id = ? AND p.id != ? AND p.status = 'Active'
        ORDER BY p.rating DESC, p.created_at DESC 
        LIMIT ?
    `;

    db.query(sql, [category, excludeId, limit], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Get Category-wise Products with Sub-Category Support ------------------
router.get("/category/:id", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const categoryId = req.params.id;
    const { sub_category_id } = req.query;

    let sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.category_id = ? AND p.status = 'Active'
    `;

    const params = [categoryId];

    // Add sub-category filter if provided
    if (sub_category_id) {
        sql += " AND p.sub_category_id = ?";
        params.push(sub_category_id);
    }

    sql += " ORDER BY p.created_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found in this category."
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Get Products by Slug with Sub-Category Support ------------------
router.get("/slug/:slug", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const slug = req.params.slug;

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.slug = ? AND p.status = 'Active'
    `;

    db.query(sql, [slug], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = parseProduct(results[0], req);
        res.json(product);
    });
});

// ------------------ Filter Products with Sub-Category Support ------------------
router.get("/filter/products", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const {
        category,
        sub_category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        isFeatured,
        isTrending,
        isBestseller,
        onSale,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        page = 1,
        limit = 12
    } = req.query;

    let sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.status = 'Active'
    `;
    const params = [];

    // Build WHERE conditions
    if (category) {
        sql += " AND p.category_id = ?";
        params.push(category);
    }
    if (sub_category) {
        sql += " AND p.sub_category_id = ?";
        params.push(sub_category);
    }
    if (brand) {
        sql += " AND p.brand = ?";
        params.push(brand);
    }
    if (minPrice) {
        sql += " AND p.price >= ?";
        params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
        sql += " AND p.price <= ?";
        params.push(parseFloat(maxPrice));
    }
    if (inStock === 'true') {
        sql += " AND p.stock > 0";
    }
    if (isFeatured === 'true') {
        sql += " AND p.is_featured = 1";
    }
    if (isTrending === 'true') {
        sql += " AND p.is_trending = 1";
    }
    if (isBestseller === 'true') {
        sql += " AND p.is_bestseller = 1";
    }
    if (onSale === 'true') {
        sql += " AND (p.discount > 0 OR p.is_on_sale = 1)";
    }

    // Add sorting
    const validSortColumns = ['name', 'price', 'rating', 'created_at', 'stock', 'discount'];
    const sortColumn = validSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortColumn} ${order}`;

    // Add pagination
    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        // Get total count for pagination
        let countSql = `
            SELECT COUNT(*) as total 
            FROM products p 
            WHERE p.status = 'Active'
        `;
        const countParams = [];

        if (category) {
            countSql += " AND p.category_id = ?";
            countParams.push(category);
        }
        if (sub_category) {
            countSql += " AND p.sub_category_id = ?";
            countParams.push(sub_category);
        }
        if (brand) {
            countSql += " AND p.brand = ?";
            countParams.push(brand);
        }
        if (minPrice) {
            countSql += " AND p.price >= ?";
            countParams.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            countSql += " AND p.price <= ?";
            countParams.push(parseFloat(maxPrice));
        }

        db.query(countSql, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error("Count query error:", countErr);
                return res.status(500).json({
                    success: false,
                    message: "Count query failed: " + countErr.message
                });
            }

            const total = countResults[0].total;
            const totalPages = Math.ceil(total / limit);

            const products = results.map(r => parseProduct(r, req));

            res.json({
                products: products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts: total,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });
        });
    });
});

// ------------------ Get Low Stock Products with Sub-Category Support ------------------
router.get("/inventory/low-stock", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.stock <= p.low_stock_threshold AND p.status = 'Active'
        ORDER BY p.stock ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Get Products by Brand with Sub-Category Support ------------------
router.get("/brand/:brand", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const brand = req.params.brand;

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.brand = ? AND p.status = 'Active' 
        ORDER BY p.created_at DESC
    `;

    db.query(sql, [brand], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Get All Brands ------------------
router.get("/brands/all", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND status = 'Active' ORDER BY brand";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const brands = results.map(r => r.brand).filter(brand => brand);
        res.json(brands);
    });
});

// ------------------ Get Products with Discount with Sub-Category Support ------------------
router.get("/discount/special", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.discount > 0 AND p.status = 'Active' 
        ORDER BY p.discount DESC 
        LIMIT 8
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ Get New Arrivals with Sub-Category Support ------------------
router.get("/new-arrivals", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.status = 'Active' 
        ORDER BY p.created_at DESC 
        LIMIT 8
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

// ------------------ NEW: Get Categories with Sub-Categories ------------------
router.get("/categories/with-subcategories", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = `
        SELECT 
            c.*,
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'Active') as product_count
        FROM categories c 
        WHERE c.status = 'active' 
        ORDER BY c.name
    `;

    db.query(sql, (err, categories) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        // Get sub-categories for each category
        const getSubCategories = (categoryId) => {
            return new Promise((resolve) => {
                const subSql = `
                    SELECT 
                        sc.*,
                        (SELECT COUNT(*) FROM products p WHERE p.sub_category_id = sc.id AND p.status = 'Active') as product_count
                    FROM sub_categories sc 
                    WHERE sc.category_id = ? AND sc.status = 'active' 
                    ORDER BY sc.name
                `;
                db.query(subSql, [categoryId], (err, subCategories) => {
                    if (err) {
                        console.error("Sub-categories error:", err);
                        resolve([]);
                    } else {
                        resolve(subCategories);
                    }
                });
            });
        };

        // Fetch sub-categories for all categories
        Promise.all(categories.map(cat => getSubCategories(cat.id)))
            .then(subCategoriesArray => {
                const categoriesWithSubs = categories.map((cat, index) => ({
                    ...cat,
                    sub_categories: subCategoriesArray[index]
                }));
                res.json(categoriesWithSubs);
            })
            .catch(error => {
                console.error("Error fetching sub-categories:", error);
                res.json(categories); // Return categories without sub-categories if error
            });
    });
});

// ------------------ NEW: Get Sub-Categories by Category ------------------
router.get("/categories/:categoryId/sub-categories", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const categoryId = req.params.categoryId;

    const sql = `
        SELECT 
            sc.*,
            (SELECT COUNT(*) FROM products p WHERE p.sub_category_id = sc.id AND p.status = 'Active') as product_count
        FROM sub_categories sc 
        WHERE sc.category_id = ? AND sc.status = 'active' 
        ORDER BY sc.name
    `;

    db.query(sql, [categoryId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        res.json(results);
    });
});

// ------------------ NEW: Get Products by Sub-Category ------------------
router.get("/sub-category/:subCategoryId", (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const subCategoryId = req.params.subCategoryId;

    const sql = `
        SELECT 
            p.*, 
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id 
        WHERE p.sub_category_id = ? AND p.status = 'Active' 
        ORDER BY p.created_at DESC
    `;

    db.query(sql, [subCategoryId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database query failed: " + err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found in this sub-category."
            });
        }

        const products = results.map(r => parseProduct(r, req));
        res.json(products);
    });
});

module.exports = router;