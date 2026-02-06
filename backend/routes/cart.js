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

// // ------------------- Add to Cart -------------------
// router.post("/add", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { product_id, quantity } = req.body;

//     if (!userId) return res.status(400).json({ message: "User ID missing from token" });
//     if (!product_id || !quantity) return res.status(400).json({ message: "Product ID and quantity required" });

//     const qty = Number(quantity);
//     if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: "Invalid quantity" });

//     const checkProductSql = "SELECT * FROM products WHERE id = ?";
//     db.query(checkProductSql, [product_id], (err, productResults) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (productResults.length === 0) return res.status(404).json({ message: "Product not found" });

//         const product = productResults[0];
//         if (product.stock < qty) return res.status(400).json({ message: `Only ${product.stock} items in stock` });

//         const checkCartSql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
//         db.query(checkCartSql, [userId, product_id], (err, cartResults) => {
//             if (err) return res.status(500).json({ message: "Database error" });

//             if (cartResults.length > 0) {
//                 const newQty = cartResults[0].quantity + qty;
//                 const updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
//                 db.query(updateSql, [newQty, cartResults[0].id], (err) => {
//                     if (err) return res.status(500).json({ message: "Error while updating cart" });
//                     return res.status(200).json({
//                         message: "Cart updated successfully",
//                         cartId: cartResults[0].id,
//                         quantity: newQty,
//                     });
//                 });
//             } else {
//                 const insertSql = "INSERT INTO cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())";
//                 db.query(insertSql, [userId, product_id, qty], (err, insertResult) => {
//                     if (err) return res.status(500).json({ message: "Error while adding to cart" });
//                     return res.status(200).json({
//                         message: "Product added to cart successfully",
//                         cartId: insertResult.insertId,
//                         quantity: qty,
//                     });
//                 });
//             }
//         });
//     });
// });

// // ------------------- Get Cart by User -------------------
// router.get("/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = `
//       SELECT 
//           c.id AS cart_id,
//           c.quantity,
//           c.added_at,
//           p.id AS product_id,
//           p.name AS product_name,
//           p.price,
//           p.discount,
//           p.stock,
//           p.images,
//           CASE 
//               WHEN p.discount > 0 THEN ROUND(p.price * (1 - p.discount / 100), 2)
//               ELSE p.price
//           END AS final_price
//       FROM cart c
//       INNER JOIN products p ON c.product_id = p.id
//       WHERE c.user_id = ?
//       ORDER BY c.added_at DESC
//   `;

//     db.query(sql, [userId], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error" });

//         const items = results.map((item) => {
//             let firstImage = "placeholder.png";
//             try {
//                 const imgs = item.images ? JSON.parse(item.images) : [];
//                 if (imgs.length > 0) firstImage = imgs[0];
//             } catch {
//                 if (item.images) firstImage = item.images;
//             }

//             // If full URL given → extract filename
//             if (firstImage.startsWith("http")) {
//                 firstImage = path.basename(firstImage);
//             }

//             return {
//                 ...item,
//                 image: `http://localhost:5000/uploads/${firstImage}`,
//             };
//         });

//         res.json({ message: "Cart fetched successfully", items });
//     });
// });

// // ------------------- Update Quantity -------------------
// router.put("/update/:cartId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { cartId } = req.params;
//     const { quantity } = req.body;

//     if (!quantity || quantity <= 0) return res.status(400).json({ message: "Invalid quantity" });

//     const sql = "UPDATE cart SET quantity = ? WHERE id = ?";
//     db.query(sql, [quantity, cartId], (err) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         res.json({ message: "Quantity updated successfully" });
//     });
// });

// // ------------------- Delete Item -------------------
// router.delete("/delete/:cartId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { cartId } = req.params;

//     const sql = "DELETE FROM cart WHERE id = ?";
//     db.query(sql, [cartId], (err) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         res.json({ message: "Item removed from cart" });
//     });
// });

// // ------------------- Get Cart Count -------------------
// router.get("/count/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
//     db.query(sql, [userId], (err, results) => {
//         if (err) {
//             console.error("❌ Cart count error:", err);
//             return res.status(500).json({ error: "Internal server error" });
//         }
//         res.json({ count: results[0].count || 0 });
//     });
// });

// module.exports = router;








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

// // ------------------- Get Product Stock (NEW ENDPOINT) -------------------
// router.get("/product/:productId/stock", authenticateToken, (req, res) => {
//     const db = req.db;
//     const productId = req.params.productId;

//     if (!productId) {
//         return res.status(400).json({ message: "Product ID is required" });
//     }

//     const sql = "SELECT id, name, stock FROM products WHERE id = ?";
//     db.query(sql, [productId], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ message: "Database error" });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         const product = results[0];
//         res.json({
//             product_id: product.id,
//             product_name: product.name,
//             available_quantity: product.stock || 0
//         });
//     });
// });

// // ------------------- Bulk Get Product Stocks (NEW ENDPOINT) -------------------
// router.post("/products/stock/bulk", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { productIds } = req.body;

//     if (!Array.isArray(productIds) || productIds.length === 0) {
//         return res.status(400).json({ message: "Product IDs array is required" });
//     }

//     // Create placeholders for the SQL query
//     const placeholders = productIds.map(() => '?').join(',');
//     const sql = `SELECT id, name, stock FROM products WHERE id IN (${placeholders})`;

//     db.query(sql, productIds, (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ message: "Database error" });
//         }

//         // Create a map of productId -> stock
//         const stockMap = {};
//         results.forEach(product => {
//             stockMap[product.id] = {
//                 product_id: product.id,
//                 product_name: product.name,
//                 available_quantity: product.stock || 0
//             };
//         });

//         res.json({ stocks: stockMap });
//     });
// });

// // ------------------- Add to Cart (WITH STOCK VALIDATION) -------------------
// router.post("/add", authenticateToken, (req, res) => {
//     const db = req.db;
//     const userId = req.user.id;
//     const { product_id, quantity } = req.body;

//     if (!userId) return res.status(400).json({ message: "User ID missing from token" });
//     if (!product_id || !quantity) return res.status(400).json({ message: "Product ID and quantity required" });

//     const qty = Number(quantity);
//     if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: "Invalid quantity" });

//     const checkProductSql = "SELECT * FROM products WHERE id = ?";
//     db.query(checkProductSql, [product_id], (err, productResults) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (productResults.length === 0) return res.status(404).json({ message: "Product not found" });

//         const product = productResults[0];

//         // ✅ Check if product is out of stock
//         if (product.stock <= 0) {
//             return res.status(400).json({
//                 message: `"${product.name}" is currently out of stock`
//             });
//         }

//         // ✅ Check if requested quantity exceeds available stock
//         if (product.stock < qty) {
//             return res.status(400).json({
//                 message: `Only ${product.stock} items available for "${product.name}"`
//             });
//         }

//         // Check if item already exists in cart
//         const checkCartSql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
//         db.query(checkCartSql, [userId, product_id], (err, cartResults) => {
//             if (err) return res.status(500).json({ message: "Database error" });

//             if (cartResults.length > 0) {
//                 const cartItem = cartResults[0];
//                 const newQty = cartItem.quantity + qty;

//                 // ✅ Check if new total quantity exceeds stock
//                 if (product.stock < newQty) {
//                     const availableForAdd = product.stock - cartItem.quantity;
//                     if (availableForAdd <= 0) {
//                         return res.status(400).json({
//                             message: `Cannot add more. You already have ${cartItem.quantity} in cart, only ${product.stock} available total.`
//                         });
//                     }
//                     return res.status(400).json({
//                         message: `Can only add ${availableForAdd} more. You already have ${cartItem.quantity} in cart.`
//                     });
//                 }

//                 const updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
//                 db.query(updateSql, [newQty, cartItem.id], (err) => {
//                     if (err) return res.status(500).json({ message: "Error while updating cart" });
//                     return res.status(200).json({
//                         message: "Cart updated successfully",
//                         cartId: cartItem.id,
//                         quantity: newQty,
//                     });
//                 });
//             } else {
//                 // Insert new item
//                 const insertSql = "INSERT INTO cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())";
//                 db.query(insertSql, [userId, product_id, qty], (err, insertResult) => {
//                     if (err) return res.status(500).json({ message: "Error while adding to cart" });
//                     return res.status(200).json({
//                         message: "Product added to cart successfully",
//                         cartId: insertResult.insertId,
//                         quantity: qty,
//                     });
//                 });
//             }
//         });
//     });
// });

// // ------------------- Get Cart by User (WITH STOCK INFO) -------------------
// router.get("/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = `
//       SELECT 
//           c.id AS cart_id,
//           c.quantity,
//           c.added_at,
//           p.id AS product_id,
//           p.name AS product_name,
//           p.price,
//           p.discount,
//           p.stock,
//           p.images,
//           CASE 
//               WHEN p.discount > 0 THEN ROUND(p.price * (1 - p.discount / 100), 2)
//               ELSE p.price
//           END AS final_price
//       FROM cart c
//       INNER JOIN products p ON c.product_id = p.id
//       WHERE c.user_id = ?
//       ORDER BY c.added_at DESC
//   `;

//     db.query(sql, [userId], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error" });

//         const items = results.map((item) => {
//             let firstImage = "placeholder.png";
//             try {
//                 const imgs = item.images ? JSON.parse(item.images) : [];
//                 if (imgs.length > 0) firstImage = imgs[0];
//             } catch {
//                 if (item.images) firstImage = item.images;
//             }

//             // If full URL given → extract filename
//             if (firstImage.startsWith("http")) {
//                 firstImage = path.basename(firstImage);
//             }

//             return {
//                 ...item,
//                 image: `http://localhost:5000/uploads/${firstImage}`,
//                 // Add stock validation flags
//                 is_out_of_stock: item.stock <= 0,
//                 can_increase_quantity: item.quantity < item.stock,
//                 max_available: item.stock
//             };
//         });

//         res.json({
//             message: "Cart fetched successfully",
//             items,
//             stock_validation: true
//         });
//     });
// });

// // ------------------- Update Quantity (WITH STOCK VALIDATION) -------------------
// router.put("/update/:cartId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { cartId } = req.params;
//     const { quantity } = req.body;

//     if (!quantity || quantity <= 0) {
//         return res.status(400).json({
//             message: "Quantity must be greater than 0. To remove item, use delete endpoint."
//         });
//     }

//     // First, get the cart item with product info
//     const getCartItemSql = `
//         SELECT c.*, p.stock, p.name as product_name 
//         FROM cart c 
//         JOIN products p ON c.product_id = p.id 
//         WHERE c.id = ?
//     `;

//     db.query(getCartItemSql, [cartId], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (results.length === 0) return res.status(404).json({ message: "Cart item not found" });

//         const cartItem = results[0];
//         const availableStock = cartItem.stock;

//         // ✅ Check if product is out of stock
//         if (availableStock <= 0) {
//             return res.status(400).json({
//                 message: `"${cartItem.product_name}" is out of stock. Please remove it from cart.`
//             });
//         }

//         // ✅ Check if requested quantity exceeds available stock
//         if (quantity > availableStock) {
//             return res.status(400).json({
//                 message: `Only ${availableStock} items available for "${cartItem.product_name}". Cannot set quantity to ${quantity}.`
//             });
//         }

//         // Update the quantity
//         const updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
//         db.query(updateSql, [quantity, cartId], (err) => {
//             if (err) return res.status(500).json({ message: "Database error" });

//             res.json({
//                 message: "Quantity updated successfully",
//                 available_stock: availableStock,
//                 new_quantity: quantity
//             });
//         });
//     });
// });

// // ------------------- Delete Item -------------------
// router.delete("/delete/:cartId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { cartId } = req.params;

//     const sql = "DELETE FROM cart WHERE id = ?";
//     db.query(sql, [cartId], (err) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         res.json({ message: "Item removed from cart" });
//     });
// });

// // ------------------- Get Cart Count -------------------
// router.get("/count/:userId", authenticateToken, (req, res) => {
//     const db = req.db;
//     const { userId } = req.params;

//     const sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
//     db.query(sql, [userId], (err, results) => {
//         if (err) {
//             console.error("❌ Cart count error:", err);
//             return res.status(500).json({ error: "Internal server error" });
//         }
//         res.json({ count: results[0].count || 0 });
//     });
// });

// // ------------------- Check Cart Stock Status (NEW ENDPOINT) -------------------
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
//             return res.status(500).json({ message: "Database error" });
//         }

//         const stockIssues = results.filter(item =>
//             item.is_out_of_stock || !item.has_sufficient_stock
//         );

//         res.json({
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
const path = require("path");
require("dotenv").config();

// ------------------- Middleware: Verify Token -------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decodedUser;
        req.user.id = decodedUser.id || decodedUser.userId;
        next();
    });
};

// ✅ 1. Get User Cart with Complete Product Details (UPDATED)
router.get("/user/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

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
            p.name AS product_name,
            p.description,
            p.price AS product_price,
            p.discount AS product_discount,
            p.stock,
            p.brand,
            p.sku,
            p.material,
            p.weight,
            p.warranty,
            p.shipping_cost,
            p.free_shipping,
            p.images,
            p.status AS product_status,
            cat.name AS category_name,
            sc.name AS sub_category_name
        FROM cart c
        INNER JOIN products p ON c.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE c.user_id = ? AND p.status = 'active'
        ORDER BY c.added_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        const items = results.map((item) => {
            // Parse images
            let images = [];
            try {
                images = item.images ? JSON.parse(item.images) : [];
            } catch (e) {
                console.error("Error parsing images:", e);
            }

            // Calculate final price if not stored
            const price = parseFloat(item.price || item.product_price || 0);
            const discount = parseInt(item.discount || item.product_discount || 0);
            const finalPrice = discount > 0
                ? price - (price * discount / 100)
                : price;

            // Get image URL
            let imageUrl = "/images/placeholder-product.jpg";
            if (images && images.length > 0) {
                const firstImage = images[0];
                if (firstImage.startsWith("http")) {
                    imageUrl = firstImage;
                } else {
                    imageUrl = `http://localhost:5000/uploads/${firstImage}`;
                }
            }

            return {
                id: item.id,
                user_id: item.user_id,
                product_id: item.product_id,
                product_name: item.product_name,
                description: item.description,
                price: price,
                discount: discount,
                final_price: item.final_price || finalPrice,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                brand: item.brand,
                sku: item.sku,
                material: item.material,
                weight: item.weight,
                warranty: item.warranty,
                stock: item.stock,
                free_shipping: item.free_shipping,
                shipping_cost: item.shipping_cost,
                category_name: item.category_name,
                sub_category_name: item.sub_category_name,
                image: imageUrl,
                images: images,
                added_at: item.added_at,
                updated_at: item.updated_at,
                stock_status: item.stock <= 0 ? "out_of_stock" :
                    item.quantity > item.stock ? "insufficient" : "available"
            };
        });

        res.json({
            success: true,
            items: items,
            total_items: items.length,
            message: "Cart fetched successfully"
        });
    });
});

// ✅ 2. Add to Cart with Price and Variants (UPDATED)
router.post("/add", authenticateToken, (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const {
        product_id,
        quantity,
        size,
        color,
        price,
        discount
    } = req.body;

    if (!userId) return res.status(400).json({
        success: false,
        message: "User ID missing from token"
    });

    if (!product_id || !quantity) return res.status(400).json({
        success: false,
        message: "Product ID and quantity required"
    });

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({
        success: false,
        message: "Invalid quantity"
    });

    // First get product details
    const checkProductSql = `
        SELECT p.*, 
               (p.price * (1 - COALESCE(p.discount, 0) / 100)) as final_price 
        FROM products p 
        WHERE p.id = ? AND p.status = 'active'
    `;

    db.query(checkProductSql, [product_id], (err, productResults) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (productResults.length === 0) return res.status(404).json({
            success: false,
            message: "Product not found"
        });

        const product = productResults[0];

        // Check stock
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${product.name}" is currently out of stock`
            });
        }

        if (product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available for "${product.name}"`
            });
        }

        // Check if item already exists in cart with same variants
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
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (cartResults.length > 0) {
                // Update existing cart item
                const cartItem = cartResults[0];
                const newQty = cartItem.quantity + qty;

                // Check if new total quantity exceeds stock
                if (product.stock < newQty) {
                    const availableForAdd = product.stock - cartItem.quantity;
                    if (availableForAdd <= 0) {
                        return res.status(400).json({
                            success: false,
                            message: `Cannot add more. You already have ${cartItem.quantity} in cart, only ${product.stock} available total.`
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        message: `Can only add ${availableForAdd} more. You already have ${cartItem.quantity} in cart.`
                    });
                }

                const updateSql = `
                    UPDATE cart 
                    SET quantity = ?, 
                        price = COALESCE(?, price),
                        discount = COALESCE(?, discount),
                        final_price = COALESCE(?, final_price),
                        updated_at = NOW() 
                    WHERE id = ?
                `;

                const finalPrice = price && discount ?
                    price - (price * discount / 100) :
                    product.final_price;

                db.query(updateSql, [
                    newQty,
                    price || product.price,
                    discount || product.discount,
                    finalPrice,
                    cartItem.id
                ], (err) => {
                    if (err) {
                        console.error("Update error:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Error while updating cart"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Cart updated successfully",
                        cartId: cartItem.id,
                        quantity: newQty,
                    });
                });
            } else {
                // Insert new cart item
                const insertSql = `
                    INSERT INTO cart 
                    (user_id, product_id, quantity, size, color, price, discount, final_price, added_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `;

                const productPrice = price || product.price;
                const productDiscount = discount || product.discount;
                const finalPrice = productDiscount > 0 ?
                    productPrice - (productPrice * productDiscount / 100) :
                    productPrice;

                db.query(insertSql, [
                    userId,
                    product_id,
                    qty,
                    size,
                    color,
                    productPrice,
                    productDiscount,
                    finalPrice
                ], (err, insertResult) => {
                    if (err) {
                        console.error("Insert error:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Error while adding to cart"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Product added to cart successfully",
                        cartId: insertResult.insertId,
                        quantity: qty,
                    });
                });
            }
        });
    });
});

// ✅ 3. Update Cart Item Quantity (UPDATED)
router.put("/update/:cartId", authenticateToken, (req, res) => {
    const db = req.db;
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be greater than 0. To remove item, use delete endpoint."
        });
    }

    // Get cart item with product info
    const getCartItemSql = `
        SELECT c.*, p.stock, p.name as product_name 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.id = ?
    `;

    db.query(getCartItemSql, [cartId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) return res.status(404).json({
            success: false,
            message: "Cart item not found"
        });

        const cartItem = results[0];
        const availableStock = cartItem.stock;

        // Check stock
        if (availableStock <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${cartItem.product_name}" is out of stock. Please remove it from cart.`
            });
        }

        if (quantity > availableStock) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableStock} items available for "${cartItem.product_name}". Cannot set quantity to ${quantity}.`
            });
        }

        // Update quantity
        const updateSql = "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?";
        db.query(updateSql, [quantity, cartId], (err) => {
            if (err) {
                console.error("Update error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            res.json({
                success: true,
                message: "Quantity updated successfully",
                available_stock: availableStock,
                new_quantity: quantity
            });
        });
    });
});

// ✅ 4. Remove Item from Cart
router.delete("/delete/:cartId", authenticateToken, (req, res) => {
    const db = req.db;
    const { cartId } = req.params;

    const sql = "DELETE FROM cart WHERE id = ?";
    db.query(sql, [cartId], (err) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            message: "Item removed from cart"
        });
    });
});

// ✅ 5. Clear User's Cart (NEW - for checkout)
router.delete("/clear/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    // Verify user owns the cart
    if (req.user.id != userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to clear this cart"
        });
    }

    const sql = "DELETE FROM cart WHERE user_id = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Clear cart error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            message: "Cart cleared successfully",
            items_removed: result.affectedRows
        });
    });
});

// ✅ 6. Get Product Stock
router.get("/product/:productId/stock", authenticateToken, (req, res) => {
    const db = req.db;
    const productId = req.params.productId;

    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });
    }

    const sql = "SELECT id, name, stock FROM products WHERE id = ?";
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
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
            available_quantity: product.stock || 0
        });
    });
});

// ✅ 7. Bulk Get Product Stocks
router.post("/products/stock/bulk", authenticateToken, (req, res) => {
    const db = req.db;
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Product IDs array is required"
        });
    }

    const placeholders = productIds.map(() => '?').join(',');
    const sql = `SELECT id, name, stock FROM products WHERE id IN (${placeholders})`;

    db.query(sql, productIds, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        const stockMap = {};
        results.forEach(product => {
            stockMap[product.id] = {
                product_id: product.id,
                product_name: product.name,
                available_quantity: product.stock || 0
            };
        });

        res.json({
            success: true,
            stocks: stockMap
        });
    });
});

// ✅ 8. Get Cart Count
router.get("/count/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

    const sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Cart count error:", err);
            return res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }

        res.json({
            success: true,
            count: results[0].count || 0
        });
    });
});

// ✅ 9. Check Cart Stock Status (For checkout validation)
router.get("/check-stock/:userId", authenticateToken, (req, res) => {
    const db = req.db;
    const { userId } = req.params;

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
            console.error("Database error:", err);
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

module.exports = router;