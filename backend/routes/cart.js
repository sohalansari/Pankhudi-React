// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const path = require("path");
// require("dotenv").config();

// // ------------------- Middleware: Verify Token -------------------
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
//         if (err) return res.status(403).json({ message: "Invalid token" });
//         req.user = decodedUser;
//         req.user.id = decodedUser.id || decodedUser.userId;
//         next();
//     });
// };

// // ✅ 1. Get User Cart with Complete Product Details (UPDATED)
// router.get("/user/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = `
//         SELECT 
//             c.id,
//             c.user_id,
//             c.product_id,
//             c.quantity,
//             c.size,
//             c.color,
//             c.price,
//             c.discount,
//             c.final_price,
//             c.added_at,
//             c.updated_at,
//             p.name AS product_name,
//             p.description,
//             p.price AS product_price,
//             p.discount AS product_discount,
//             p.stock,
//             p.brand,
//             p.sku,
//             p.material,
//             p.weight,
//             p.warranty,
//             p.shipping_cost,
//             p.free_shipping,
//             p.images,
//             p.status AS product_status,
//             cat.name AS category_name,
//             sc.name AS sub_category_name
//         FROM cart c
//         INNER JOIN products p ON c.product_id = p.id
//         LEFT JOIN categories cat ON p.category_id = cat.id
//         LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//         WHERE c.user_id = ? AND p.status = 'active'
//         ORDER BY c.added_at DESC
//     `;

//     db.query(sql, [userId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ message: "Database error" });
//         }

//         const items = results.map((item) => {
//             // Parse images
//             let images = [];
//             try {
//                 images = item.images ? JSON.parse(item.images) : [];
//             } catch (e) {
//                 console.error("Error parsing images:", e);
//             }

//             // Calculate final price if not stored
//             const price = parseFloat(item.price || item.product_price || 0);
//             const discount = parseInt(item.discount || item.product_discount || 0);
//             const finalPrice = discount > 0
//                 ? price - (price * discount / 100)
//                 : price;

//             // Get image URL
//             let imageUrl = "/images/placeholder-product.jpg";
//             if (images && images.length > 0) {
//                 const firstImage = images[0];
//                 if (firstImage.startsWith("http")) {
//                     imageUrl = firstImage;
//                 } else {
//                     imageUrl = `http://localhost:5000/uploads/${firstImage}`;
//                 }
//             }

//             return {
//                 id: item.id,
//                 user_id: item.user_id,
//                 product_id: item.product_id,
//                 product_name: item.product_name,
//                 description: item.description,
//                 price: price,
//                 discount: discount,
//                 final_price: item.final_price || finalPrice,
//                 quantity: item.quantity,
//                 size: item.size,
//                 color: item.color,
//                 brand: item.brand,
//                 sku: item.sku,
//                 material: item.material,
//                 weight: item.weight,
//                 warranty: item.warranty,
//                 stock: item.stock,
//                 free_shipping: item.free_shipping,
//                 shipping_cost: item.shipping_cost,
//                 category_name: item.category_name,
//                 sub_category_name: item.sub_category_name,
//                 image: imageUrl,
//                 images: images,
//                 added_at: item.added_at,
//                 updated_at: item.updated_at,
//                 stock_status: item.stock <= 0 ? "out_of_stock" :
//                     item.quantity > item.stock ? "insufficient" : "available"
//             };
//         });

//         res.json({
//             success: true,
//             items: items,
//             total_items: items.length,
//             message: "Cart fetched successfully"
//         });
//     });
// });

// // ✅ 2. Add to Cart with Price and Variants (UPDATED)
// router.post("/add", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const {
//         product_id,
//         quantity,
//         size,
//         color,
//         price,
//         discount
//     } = req.body;

//     if (!userId) return res.status(400).json({
//         success: false,
//         message: "User ID missing from token"
//     });

//     if (!product_id || !quantity) return res.status(400).json({
//         success: false,
//         message: "Product ID and quantity required"
//     });

//     const qty = Number(quantity);
//     if (isNaN(qty) || qty <= 0) return res.status(400).json({
//         success: false,
//         message: "Invalid quantity"
//     });

//     // First get product details
//     const checkProductSql = `
//         SELECT p.*, 
//                (p.price * (1 - COALESCE(p.discount, 0) / 100)) as final_price 
//         FROM products p 
//         WHERE p.id = ? AND p.status = 'active'
//     `;

//     db.query(checkProductSql, [product_id], (err, productResults) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         if (productResults.length === 0) return res.status(404).json({
//             success: false,
//             message: "Product not found"
//         });

//         const product = productResults[0];

//         // Check stock
//         if (product.stock <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: `"${product.name}" is currently out of stock`
//             });
//         }

//         if (product.stock < qty) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Only ${product.stock} items available for "${product.name}"`
//             });
//         }

//         // Check if item already exists in cart with same variants
//         const checkCartSql = `
//             SELECT * FROM cart 
//             WHERE user_id = ? AND product_id = ? 
//             AND ((size IS NULL AND ? IS NULL) OR size = ?)
//             AND ((color IS NULL AND ? IS NULL) OR color = ?)
//         `;

//         db.query(checkCartSql, [
//             userId, product_id,
//             size, size,
//             color, color
//         ], (err, cartResults) => {
//             if (err) {
//                 console.error("Database error:", err);
//                 return res.status(500).json({
//                     success: false,
//                     message: "Database error"
//                 });
//             }

//             if (cartResults.length > 0) {
//                 // Update existing cart item
//                 const cartItem = cartResults[0];
//                 const newQty = cartItem.quantity + qty;

//                 // Check if new total quantity exceeds stock
//                 if (product.stock < newQty) {
//                     const availableForAdd = product.stock - cartItem.quantity;
//                     if (availableForAdd <= 0) {
//                         return res.status(400).json({
//                             success: false,
//                             message: `Cannot add more. You already have ${cartItem.quantity} in cart, only ${product.stock} available total.`
//                         });
//                     }
//                     return res.status(400).json({
//                         success: false,
//                         message: `Can only add ${availableForAdd} more. You already have ${cartItem.quantity} in cart.`
//                     });
//                 }

//                 const updateSql = `
//                     UPDATE cart 
//                     SET quantity = ?, 
//                         price = COALESCE(?, price),
//                         discount = COALESCE(?, discount),
//                         final_price = COALESCE(?, final_price),
//                         updated_at = NOW() 
//                     WHERE id = ?
//                 `;

//                 const finalPrice = price && discount ?
//                     price - (price * discount / 100) :
//                     product.final_price;

//                 db.query(updateSql, [
//                     newQty,
//                     price || product.price,
//                     discount || product.discount,
//                     finalPrice,
//                     cartItem.id
//                 ], (err) => {
//                     if (err) {
//                         console.error("Update error:", err);
//                         return res.status(500).json({
//                             success: false,
//                             message: "Error while updating cart"
//                         });
//                     }

//                     return res.status(200).json({
//                         success: true,
//                         message: "Cart updated successfully",
//                         cartId: cartItem.id,
//                         quantity: newQty,
//                     });
//                 });
//             } else {
//                 // Insert new cart item
//                 const insertSql = `
//                     INSERT INTO cart 
//                     (user_id, product_id, quantity, size, color, price, discount, final_price, added_at) 
//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
//                 `;

//                 const productPrice = price || product.price;
//                 const productDiscount = discount || product.discount;
//                 const finalPrice = productDiscount > 0 ?
//                     productPrice - (productPrice * productDiscount / 100) :
//                     productPrice;

//                 db.query(insertSql, [
//                     userId,
//                     product_id,
//                     qty,
//                     size,
//                     color,
//                     productPrice,
//                     productDiscount,
//                     finalPrice
//                 ], (err, insertResult) => {
//                     if (err) {
//                         console.error("Insert error:", err);
//                         return res.status(500).json({
//                             success: false,
//                             message: "Error while adding to cart"
//                         });
//                     }

//                     return res.status(200).json({
//                         success: true,
//                         message: "Product added to cart successfully",
//                         cartId: insertResult.insertId,
//                         quantity: qty,
//                     });
//                 });
//             }
//         });
//     });
// });

// // ✅ 3. Update Cart Item Quantity (UPDATED)
// router.put("/update/:cartId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { cartId } = req.params;
//     const { quantity } = req.body;

//     if (!quantity || quantity <= 0) {
//         return res.status(400).json({
//             success: false,
//             message: "Quantity must be greater than 0. To remove item, use delete endpoint."
//         });
//     }

//     // Get cart item with product info
//     const getCartItemSql = `
//         SELECT c.*, p.stock, p.name as product_name 
//         FROM cart c 
//         JOIN products p ON c.product_id = p.id 
//         WHERE c.id = ?
//     `;

//     db.query(getCartItemSql, [cartId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         if (results.length === 0) return res.status(404).json({
//             success: false,
//             message: "Cart item not found"
//         });

//         const cartItem = results[0];
//         const availableStock = cartItem.stock;

//         // Check stock
//         if (availableStock <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: `"${cartItem.product_name}" is out of stock. Please remove it from cart.`
//             });
//         }

//         if (quantity > availableStock) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Only ${availableStock} items available for "${cartItem.product_name}". Cannot set quantity to ${quantity}.`
//             });
//         }

//         // Update quantity
//         const updateSql = "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?";
//         db.query(updateSql, [quantity, cartId], (err) => {
//             if (err) {
//                 console.error("Update error:", err);
//                 return res.status(500).json({
//                     success: false,
//                     message: "Database error"
//                 });
//             }

//             res.json({
//                 success: true,
//                 message: "Quantity updated successfully",
//                 available_stock: availableStock,
//                 new_quantity: quantity
//             });
//         });
//     });
// });

// // ✅ 4. Remove Item from Cart
// router.delete("/delete/:cartId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { cartId } = req.params;

//     const sql = "DELETE FROM cart WHERE id = ?";
//     db.query(sql, [cartId], (err) => {
//         if (err) {
//             console.error("Delete error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Item removed from cart"
//         });
//     });
// });

// // ✅ 5. Clear User's Cart (NEW - for checkout)
// router.delete("/clear/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     // Verify user owns the cart
//     if (req.user.id != userId) {
//         return res.status(403).json({
//             success: false,
//             message: "Unauthorized to clear this cart"
//         });
//     }

//     const sql = "DELETE FROM cart WHERE user_id = ?";
//     db.query(sql, [userId], (err, result) => {
//         if (err) {
//             console.error("Clear cart error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Cart cleared successfully",
//             items_removed: result.affectedRows
//         });
//     });
// });

// // ✅ 6. Get Product Stock
// router.get("/product/:productId/stock", authenticateToken, (req, res) => {
//     const db = req.db;
//     const productId = req.params.productId;

//     if (!productId) {
//         return res.status(400).json({
//             success: false,
//             message: "Product ID is required"
//         });
//     }

//     const sql = "SELECT id, name, stock FROM products WHERE id = ?";
//     db.query(sql, [productId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Product not found"
//             });
//         }

//         const product = results[0];
//         res.json({
//             success: true,
//             product_id: product.id,
//             product_name: product.name,
//             available_quantity: product.stock || 0
//         });
//     });
// });

// // ✅ 7. Bulk Get Product Stocks
// router.post("/products/stock/bulk", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { productIds } = req.body;

//     if (!Array.isArray(productIds) || productIds.length === 0) {
//         return res.status(400).json({
//             success: false,
//             message: "Product IDs array is required"
//         });
//     }

//     const placeholders = productIds.map(() => '?').join(',');
//     const sql = `SELECT id, name, stock FROM products WHERE id IN (${placeholders})`;

//     db.query(sql, productIds, (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         const stockMap = {};
//         results.forEach(product => {
//             stockMap[product.id] = {
//                 product_id: product.id,
//                 product_name: product.name,
//                 available_quantity: product.stock || 0
//             };
//         });

//         res.json({
//             success: true,
//             stocks: stockMap
//         });
//     });
// });

// // ✅ 8. Get Cart Count
// router.get("/count/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
//     db.query(sql, [userId], (err, results) => {
//         if (err) {
//             console.error("Cart count error:", err);
//             return res.status(500).json({
//                 success: false,
//                 error: "Internal server error"
//             });
//         }

//         res.json({
//             success: true,
//             count: results[0].count || 0
//         });
//     });
// });

// // ✅ 9. Check Cart Stock Status (For checkout validation)
// router.get("/check-stock/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = `
//         SELECT 
//             c.id as cart_id,
//             c.quantity,
//             p.id as product_id,
//             p.name as product_name,
//             p.stock,
//             p.stock >= c.quantity as has_sufficient_stock,
//             p.stock = 0 as is_out_of_stock,
//             GREATEST(0, p.stock - c.quantity) as can_add_more,
//             CASE 
//                 WHEN p.stock = 0 THEN 'out_of_stock'
//                 WHEN p.stock < c.quantity THEN 'insufficient_stock'
//                 ELSE 'sufficient_stock'
//             END as stock_status
//         FROM cart c
//         JOIN products p ON c.product_id = p.id
//         WHERE c.user_id = ?
//     `;

//     db.query(sql, [userId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error"
//             });
//         }

//         const stockIssues = results.filter(item =>
//             item.is_out_of_stock || !item.has_sufficient_stock
//         );

//         res.json({
//             success: true,
//             items: results,
//             has_stock_issues: stockIssues.length > 0,
//             stock_issues: stockIssues,
//             summary: {
//                 total_items: results.length,
//                 out_of_stock: results.filter(item => item.is_out_of_stock).length,
//                 insufficient_stock: results.filter(item => !item.has_sufficient_stock && !item.is_out_of_stock).length,
//                 sufficient_stock: results.filter(item => item.has_sufficient_stock && !item.is_out_of_stock).length
//             }
//         });
//     });
// });

// module.exports = router;














































const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ------------------- Helper: Parse Cart Item (EXACT DISCOUNT CALCULATION) -------------------
const parseCartItem = (item, req) => {
    // ✅ Parse Images from JSON
    let images = [];
    try {
        if (item.images) {
            const parsedImages = JSON.parse(item.images);
            images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
        }
    } catch {
        images = item.images ? [item.images] : [];
    }

    // ✅ Process Image URLs
    const processedImages = images.map(img =>
        img && (img.startsWith('http') ? img : `${req.protocol}://${req.get("host")}/uploads/${img}`)
    ).filter(img => img);

    const mainImage = processedImages.length > 0
        ? processedImages[0]
        : `${req.protocol}://${req.get("host")}/images/placeholder-product.jpg`;

    // ✅ 🟢🟢🟢 EXACT DISCOUNT CALCULATION - Price 500, Discount 10% → Discount Price 450 🟢🟢🟢
    const originalPrice = parseFloat(item.price || item.product_price || 0);
    const discountPercent = parseFloat(item.discount || item.product_discount || 0);

    let discountPrice = originalPrice;

    if (discountPercent > 0 && discountPercent <= 100) {
        const discountAmount = originalPrice * (discountPercent / 100); // 500 * 0.10 = 50
        discountPrice = originalPrice - discountAmount; // 500 - 50 = 450
        discountPrice = parseFloat(discountPrice.toFixed(2)); // 450.00
    }

    // ✅ Calculate line totals
    const quantity = parseInt(item.quantity) || 1;
    const lineTotal = parseFloat((discountPrice * quantity).toFixed(2));
    const originalLineTotal = parseFloat((originalPrice * quantity).toFixed(2));
    const savedAmount = parseFloat((originalLineTotal - lineTotal).toFixed(2));
    const savedPerItem = parseFloat((originalPrice - discountPrice).toFixed(2));

    return {
        // 🆔 Cart identifiers
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        quantity: quantity,
        size: item.size || null,
        color: item.color || null,
        added_at: item.added_at,
        updated_at: item.updated_at,

        // 💰 EXACT PRICE FIELDS (Match product page 100%)
        price: originalPrice,              // 500.00
        discount: discountPercent,         // 10
        discount_price: discountPrice,     // 450.00 ✅ EXACT DISCOUNTED PRICE
        final_price: discountPrice,        // 450.00 (backward compatibility)

        // 💰 Savings per item
        saved_per_item: savedPerItem,      // 50.00

        // 📊 Line totals
        line_total: lineTotal,                    // 450.00 × quantity
        original_line_total: originalLineTotal,   // 500.00 × quantity
        saved_amount: savedAmount,                // Total savings

        // 📦 Product details
        product_name: item.product_name || item.name,
        description: item.description,
        short_description: item.short_description,
        slug: item.slug,
        sku: item.sku,
        brand: item.brand || 'Unknown Brand',
        stock: parseInt(item.stock) || 0,
        low_stock_threshold: parseInt(item.low_stock_threshold) || 0,
        min_order_quantity: parseInt(item.min_order_quantity) || 1,
        max_order_quantity: parseInt(item.max_order_quantity) || 100,

        // 📁 Category details
        category_id: item.category_id,
        category_name: item.category_name,
        sub_category_id: item.sub_category_id,
        sub_category_name: item.sub_category_name,
        sub_sub_category_id: item.sub_sub_category_id,
        sub_sub_category_name: item.sub_sub_category_name,

        // 🎨 Product attributes
        material: item.material,
        weight: item.weight,
        dimensions: item.dimensions,
        warranty: item.warranty,

        // 🔄 Variants
        sizes: item.sizes ? (() => { try { return JSON.parse(item.sizes); } catch { return []; } })() : [],
        colors: item.colors ? (() => { try { return JSON.parse(item.colors); } catch { return []; } })() : [],
        features: item.features ? (() => { try { return JSON.parse(item.features); } catch { return []; } })() : [],

        // 🖼️ Images
        images: processedImages,
        image: mainImage,

        // 🚚 Shipping
        shipping_class: item.shipping_class || 'Standard',
        tax_class: item.tax_class || '0',
        shipping_cost: parseFloat(item.shipping_cost) || 0,
        free_shipping: item.free_shipping === 1 || item.free_shipping === true || item.free_shipping === 'true',

        // 🏷️ Product status
        status: item.product_status || item.status || 'active',
        is_featured: item.is_featured === 1 || item.is_featured === true,
        is_trending: item.is_trending === 1 || item.is_trending === true,
        is_bestseller: item.is_bestseller === 1 || item.is_bestseller === true,
        is_virtual: item.is_virtual === 1 || item.is_virtual === true,
        is_downloadable: item.is_downloadable === 1 || item.is_downloadable === true,

        // 📊 Stock status
        stock_status: (parseInt(item.stock) || 0) <= 0 ? 'out_of_stock' :
            parseInt(item.quantity) > parseInt(item.stock) ? 'insufficient' : 'available',

        // 💾 Digital product
        download_link: item.download_link,

        // 🔍 SEO
        seo_title: item.seo_title,
        seo_description: item.seo_description,
        meta_keywords: item.meta_keywords,

        // 📋 Return policy
        return_policy: item.return_policy,

        // 🎥 Video
        video_url: item.video ? (
            item.video.startsWith('http') ? item.video :
                `${req.protocol}://${req.get("host")}/uploads/${item.video}`
        ) : null,

        // ⭐ Rating
        rating: parseFloat(item.rating) || 0,

        // ⏰ Timestamps
        created_at: item.created_at,
        updated_at: item.updated_at
    };
};

// ------------------- Middleware: Verify Token -------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - No token provided"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        req.user = decodedUser;
        req.user.id = decodedUser.id || decodedUser.userId;
        next();
    });
};

// ============================================================================
// ✅ 1. GET USER CART - Complete cart with exact discount calculation
// ============================================================================
router.get("/user/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    // Verify user owns this cart
    if (parseInt(req.user.id) !== parseInt(userId)) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to view this cart"
        });
    }

    const sql = `
        SELECT 
            c.id,
            c.user_id,
            c.product_id,
            c.quantity,
            c.size,
            c.color,
            c.price,
            c.discount,
            c.final_price,
            c.added_at,
            c.updated_at,
            
            -- 📦 Product details (EXACT from products table)
            p.name AS product_name,
            p.name,
            p.slug,
            p.description,
            p.short_description,
            p.price AS product_price,
            p.discount AS product_discount,
            p.stock,
            p.low_stock_threshold,
            p.min_order_quantity,
            p.max_order_quantity,
            p.sku,
            p.brand,
            p.images,
            p.sizes,
            p.colors,
            p.material,
            p.weight,
            p.dimensions,
            p.warranty,
            p.features,
            p.tags,
            p.status AS product_status,
            p.is_featured,
            p.is_trending,
            p.is_bestseller,
            p.is_virtual,
            p.is_downloadable,
            p.download_link,
            p.shipping_class,
            p.tax_class,
            p.shipping_cost,
            p.free_shipping,
            p.seo_title,
            p.seo_description,
            p.meta_keywords,
            p.return_policy,
            p.video,
            p.rating,
            p.created_at,
            p.updated_at AS product_updated_at,
            
            -- 📁 Category details
            cat.id AS category_id,
            cat.name AS category_name,
            sc.id AS sub_category_id,
            sc.name AS sub_category_name,
            ssc.id AS sub_sub_category_id,
            ssc.name AS sub_sub_category_name
            
        FROM cart c
        INNER JOIN products p ON c.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
        LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
        WHERE c.user_id = ? AND p.status = 'active'
        ORDER BY c.added_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Database error in GET /user/:userId:", err);
            return res.status(500).json({
                success: false,
                message: "Database error occurred",
                error: err.message
            });
        }

        // ✅ Parse each cart item with exact discount calculation
        const items = results.map(item => parseCartItem(item, req));

        // ✅ Calculate cart totals
        let subtotal = 0;
        let originalSubtotal = 0;
        let totalQuantity = 0;
        let totalItems = items.length;
        let totalSaved = 0;
        let hasFreeShippingItem = false;
        let maxShippingCost = 0;

        items.forEach(item => {
            subtotal += item.line_total;
            originalSubtotal += item.original_line_total;
            totalQuantity += item.quantity;
            totalSaved += item.saved_amount;

            if (item.free_shipping) {
                hasFreeShippingItem = true;
            }
            if (!item.free_shipping && item.shipping_cost > maxShippingCost) {
                maxShippingCost = item.shipping_cost;
            }
        });

        // ✅ Shipping calculation
        const freeShippingThreshold = 500; // Can be moved to settings
        const standardShippingCharge = 50; // Can be moved to settings

        let shipping = 0;
        let hasFreeShipping = false;

        if (hasFreeShippingItem) {
            hasFreeShipping = true;
            shipping = 0;
        } else if (subtotal >= freeShippingThreshold) {
            hasFreeShipping = true;
            shipping = 0;
        } else {
            shipping = Math.max(standardShippingCharge, maxShippingCost);
            hasFreeShipping = false;
        }

        // ✅ Tax calculation (18% GST)
        const taxRate = 18;
        const tax = parseFloat((subtotal * taxRate / 100).toFixed(2));

        // ✅ Final total
        const total = parseFloat((subtotal + shipping + tax).toFixed(2));

        res.json({
            success: true,
            items: items,
            totals: {
                // 💰 Price totals
                subtotal: parseFloat(subtotal.toFixed(2)),           // After product discounts
                original_subtotal: parseFloat(originalSubtotal.toFixed(2)), // Before discounts
                total_saved: parseFloat(totalSaved.toFixed(2)),      // Total savings from discounts

                // 🚚 Shipping
                shipping: parseFloat(shipping.toFixed(2)),
                has_free_shipping: hasFreeShipping,
                free_shipping_threshold: freeShippingThreshold,

                // 💸 Tax
                tax: tax,
                tax_rate: taxRate,

                // 🎯 Final
                total: total,

                // 📊 Counts
                total_items: totalItems,
                total_quantity: totalQuantity
            },
            message: "Cart fetched successfully"
        });
    });
});

// ============================================================================
// ✅ 2. ADD TO CART - With exact discount calculation
// ============================================================================
router.post("/add", authenticateToken, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const {
        product_id,
        quantity = 1,
        size = null,
        color = null
    } = req.body;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    if (!product_id) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid quantity"
        });
    }

    // ✅ Get product details with exact price and discount
    const getProductSql = `
        SELECT 
            p.*,
            c.name as category_name,
            sc.name as sub_category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.id = ? AND p.status = 'active'
    `;

    db.query(getProductSql, [product_id], (err, productResults) => {
        if (err) {
            console.error("❌ Database error in POST /add:", err);
            return res.status(500).json({
                success: false,
                message: "Database error occurred"
            });
        }

        if (productResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found or inactive"
            });
        }

        const product = productResults[0];

        // ✅ 🟢🟢🟢 EXACT DISCOUNT CALCULATION 🟢🟢🟢
        const originalPrice = parseFloat(product.price);
        const discountPercent = parseFloat(product.discount || 0);

        let discountPrice = originalPrice;
        if (discountPercent > 0 && discountPercent <= 100) {
            const discountAmount = originalPrice * (discountPercent / 100);
            discountPrice = originalPrice - discountAmount;
            discountPrice = parseFloat(discountPrice.toFixed(2));
        }

        // ✅ Check stock
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${product.name}" is out of stock`
            });
        }

        if (product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available for "${product.name}"`
            });
        }

        // ✅ Check min/max order quantity
        if (qty < product.min_order_quantity) {
            return res.status(400).json({
                success: false,
                message: `Minimum order quantity is ${product.min_order_quantity}`
            });
        }

        if (product.max_order_quantity && qty > product.max_order_quantity) {
            return res.status(400).json({
                success: false,
                message: `Maximum order quantity is ${product.max_order_quantity}`
            });
        }

        // ✅ Check if item already in cart with same variants
        const checkCartSql = `
            SELECT * FROM cart 
            WHERE user_id = ? AND product_id = ? 
            AND ((size IS NULL AND ? IS NULL) OR size = ?)
            AND ((color IS NULL AND ? IS NULL) OR color = ?)
        `;

        db.query(checkCartSql, [
            userId, product_id,
            size, size,
            color, color
        ], (err, cartResults) => {
            if (err) {
                console.error("❌ Database error in cart check:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error occurred"
                });
            }

            if (cartResults.length > 0) {
                // ✅ Update existing cart item
                const cartItem = cartResults[0];
                const newQty = cartItem.quantity + qty;

                // Check stock for updated quantity
                if (product.stock < newQty) {
                    const availableToAdd = product.stock - cartItem.quantity;
                    if (availableToAdd <= 0) {
                        return res.status(400).json({
                            success: false,
                            message: `Cannot add more. You already have ${cartItem.quantity} in cart`
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        message: `Can only add ${availableToAdd} more. You have ${cartItem.quantity} in cart`
                    });
                }

                const updateSql = `
                    UPDATE cart 
                    SET quantity = ?,
                        price = ?,
                        discount = ?,
                        final_price = ?,
                        updated_at = NOW()
                    WHERE id = ?
                `;

                db.query(updateSql, [
                    newQty,
                    originalPrice,
                    discountPercent,
                    discountPrice,
                    cartItem.id
                ], (err) => {
                    if (err) {
                        console.error("❌ Error updating cart:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Failed to update cart"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Cart updated successfully",
                        cart_id: cartItem.id,
                        quantity: newQty,
                        price: originalPrice,
                        discount: discountPercent,
                        discount_price: discountPrice,
                        final_price: discountPrice
                    });
                });

            } else {
                // ✅ Insert new cart item
                const insertSql = `
                    INSERT INTO cart 
                    (user_id, product_id, quantity, size, color, price, discount, final_price, added_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `;

                db.query(insertSql, [
                    userId,
                    product_id,
                    qty,
                    size,
                    color,
                    originalPrice,
                    discountPercent,
                    discountPrice
                ], (err, result) => {
                    if (err) {
                        console.error("❌ Error inserting to cart:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Failed to add to cart"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Product added to cart successfully",
                        cart_id: result.insertId,
                        quantity: qty,
                        price: originalPrice,
                        discount: discountPercent,
                        discount_price: discountPrice,
                        final_price: discountPrice
                    });
                });
            }
        });
    });
});

// ============================================================================
// ✅ 3. UPDATE CART ITEM QUANTITY
// ============================================================================
router.put("/update/:cartId", authenticateToken, (req, res) => {
    const db = req.db;
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    if (!quantity || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be greater than 0"
        });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty)) {
        return res.status(400).json({
            success: false,
            message: "Invalid quantity"
        });
    }

    // ✅ Get cart item with product details
    const getCartItemSql = `
        SELECT c.*, p.stock, p.name as product_name, 
               p.min_order_quantity, p.max_order_quantity
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.id = ? AND c.user_id = ?
    `;

    db.query(getCartItemSql, [cartId, req.user.id], (err, results) => {
        if (err) {
            console.error("❌ Database error in PUT /update:", err);
            return res.status(500).json({
                success: false,
                message: "Database error occurred"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        const cartItem = results[0];

        // ✅ Check min/max order quantity
        if (qty < cartItem.min_order_quantity) {
            return res.status(400).json({
                success: false,
                message: `Minimum order quantity is ${cartItem.min_order_quantity}`
            });
        }

        if (cartItem.max_order_quantity && qty > cartItem.max_order_quantity) {
            return res.status(400).json({
                success: false,
                message: `Maximum order quantity is ${cartItem.max_order_quantity}`
            });
        }

        // ✅ Check stock
        if (cartItem.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${cartItem.product_name}" is out of stock`
            });
        }

        if (qty > cartItem.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${cartItem.stock} units available for "${cartItem.product_name}"`
            });
        }

        // ✅ Update quantity
        const updateSql = "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?";
        db.query(updateSql, [qty, cartId], (err) => {
            if (err) {
                console.error("❌ Error updating quantity:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update quantity"
                });
            }

            res.json({
                success: true,
                message: "Quantity updated successfully",
                quantity: qty,
                stock_available: cartItem.stock
            });
        });
    });
});

// ============================================================================
// ✅ 4. REMOVE ITEM FROM CART
// ============================================================================
router.delete("/delete/:cartId", authenticateToken, (req, res) => {
    const db = req.db;
    const { cartId } = req.params;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    // ✅ Verify item belongs to user and delete
    const sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
    db.query(sql, [cartId, req.user.id], (err, result) => {
        if (err) {
            console.error("❌ Error deleting cart item:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to remove item"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found or unauthorized"
            });
        }

        res.json({
            success: true,
            message: "Item removed from cart successfully"
        });
    });
});

// ============================================================================
// ✅ 5. CLEAR USER CART
// ============================================================================
router.delete("/clear/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    // Verify user owns this cart
    if (parseInt(req.user.id) !== parseInt(userId)) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to clear this cart"
        });
    }

    const sql = "DELETE FROM cart WHERE user_id = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("❌ Error clearing cart:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to clear cart"
            });
        }

        res.json({
            success: true,
            message: "Cart cleared successfully",
            items_removed: result.affectedRows
        });
    });
});

// ============================================================================
// ✅ 6. GET CART COUNT
// ============================================================================
router.get("/count/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    // Verify user owns this cart
    if (parseInt(req.user.id) !== parseInt(userId)) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Error getting cart count:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            count: results[0].count || 0
        });
    });
});

// ============================================================================
// ✅ 7. CHECK CART STOCK (For checkout validation)
// ============================================================================
router.get("/check-stock/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    // Verify user owns this cart
    if (parseInt(req.user.id) !== parseInt(userId)) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const sql = `
        SELECT 
            c.id as cart_id,
            c.quantity,
            p.id as product_id,
            p.name as product_name,
            p.stock,
            p.stock >= c.quantity as has_sufficient_stock,
            p.stock = 0 as is_out_of_stock,
            GREATEST(0, p.stock - c.quantity) as can_add_more,
            CASE 
                WHEN p.stock = 0 THEN 'out_of_stock'
                WHEN p.stock < c.quantity THEN 'insufficient_stock'
                ELSE 'sufficient_stock'
            END as stock_status
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Error checking stock:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        const stockIssues = results.filter(item =>
            item.is_out_of_stock || !item.has_sufficient_stock
        );

        res.json({
            success: true,
            items: results,
            has_stock_issues: stockIssues.length > 0,
            stock_issues: stockIssues,
            summary: {
                total_items: results.length,
                out_of_stock: results.filter(item => item.is_out_of_stock).length,
                insufficient_stock: results.filter(item => !item.has_sufficient_stock && !item.is_out_of_stock).length,
                sufficient_stock: results.filter(item => item.has_sufficient_stock && !item.is_out_of_stock).length
            }
        });
    });
});

// ============================================================================
// ✅ 8. GET PRODUCT STOCK
// ============================================================================
router.get("/product/:productId/stock", authenticateToken, (req, res) => {
    const db = req.db;
    const { productId } = req.params;

    if (!db) {
        return res.status(500).json({
            success: false,
            message: "Database connection not available"
        });
    }

    const sql = "SELECT id, name, stock, min_order_quantity, max_order_quantity FROM products WHERE id = ? AND status = 'active'";
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error("❌ Error getting product stock:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = results[0];
        res.json({
            success: true,
            product_id: product.id,
            product_name: product.name,
            available_quantity: product.stock || 0,
            min_order_quantity: product.min_order_quantity || 1,
            max_order_quantity: product.max_order_quantity || 100
        });
    });
});

module.exports = router;