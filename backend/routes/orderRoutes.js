const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
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

// ✅ 1. Create Order from Cart
router.post("/create", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const {
        shippingAddress,
        billingAddress,
        paymentMethod,
        orderNote,
        shippingMethod = "standard"
    } = req.body;

    try {
        // Validate required fields
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Shipping address and payment method are required"
            });
        }

        // Get user's cart items
        const [cartItems] = await db.query(`
            SELECT 
                c.*,
                p.name as product_name,
                p.sku,
                p.brand,
                p.material,
                p.weight,
                p.warranty,
                p.images,
                p.stock as available_stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ? AND p.status = 'active'
        `, [userId]);

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Check stock for all items
        const stockIssues = [];
        cartItems.forEach(item => {
            if (item.available_stock <= 0) {
                stockIssues.push(`${item.product_name} is out of stock`);
            } else if (item.quantity > item.available_stock) {
                stockIssues.push(`${item.product_name}: Only ${item.available_stock} available (you have ${item.quantity})`);
            }
        });

        if (stockIssues.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Stock issues found",
                issues: stockIssues
            });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        cartItems.forEach(item => {
            const itemPrice = parseFloat(item.final_price || item.price || 0);
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;

            // Parse images
            let images = [];
            try {
                images = item.images ? JSON.parse(item.images) : [];
            } catch (e) {
                console.error("Error parsing images:", e);
            }

            orderItems.push({
                product_id: item.product_id,
                product_name: item.product_name,
                sku: item.sku,
                brand: item.brand,
                material: item.material,
                weight: item.weight,
                warranty: item.warranty,
                price: itemPrice,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                item_total: itemTotal,
                image: images[0] || null
            });
        });

        // Calculate shipping
        const hasFreeShipping = cartItems.some(item => item.free_shipping === 1);
        let shippingCharge = 0;

        if (!hasFreeShipping) {
            shippingCharge = cartItems.reduce((sum, item) => {
                return sum + (parseFloat(item.shipping_cost) || 0);
            }, 0);

            if (shippingCharge < 50) shippingCharge = 50;
            if (shippingMethod === "express") shippingCharge += 50;
        }

        const taxAmount = subtotal * 0.18; // 18% GST
        const discountAmount = cartItems.reduce((sum, item) => {
            const discount = parseFloat(item.discount || 0);
            if (discount > 0) {
                const originalPrice = parseFloat(item.price || 0);
                return sum + ((originalPrice * discount / 100) * item.quantity);
            }
            return sum;
        }, 0);

        const totalAmount = subtotal + shippingCharge + taxAmount - discountAmount;

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Start transaction
        await db.query("START TRANSACTION");

        try {
            // 1. Create order
            const [orderResult] = await db.query(`
                INSERT INTO orders SET ?
            `, {
                order_number: orderNumber,
                user_id: userId,
                subtotal: subtotal.toFixed(2),
                shipping_charge: shippingCharge.toFixed(2),
                tax_amount: taxAmount.toFixed(2),
                discount_amount: discountAmount.toFixed(2),
                total_amount: totalAmount.toFixed(2),
                shipping_full_name: shippingAddress.fullName,
                shipping_phone: shippingAddress.phone,
                shipping_email: shippingAddress.email,
                shipping_address: shippingAddress.address,
                shipping_city: shippingAddress.city,
                shipping_state: shippingAddress.state,
                shipping_postal_code: shippingAddress.postalCode,
                shipping_country: shippingAddress.country || "India",
                billing_full_name: billingAddress?.fullName || shippingAddress.fullName,
                billing_phone: billingAddress?.phone || shippingAddress.phone,
                billing_email: billingAddress?.email || shippingAddress.email,
                billing_address: billingAddress?.address || shippingAddress.address,
                billing_city: billingAddress?.city || shippingAddress.city,
                billing_state: billingAddress?.state || shippingAddress.state,
                billing_postal_code: billingAddress?.postalCode || shippingAddress.postalCode,
                billing_country: billingAddress?.country || shippingAddress.country || "India",
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
                order_status: 'pending',
                order_notes: orderNote,
                shipping_method: shippingMethod,
                created_at: new Date()
            });

            const orderId = orderResult.insertId;

            // 2. Create order items
            for (const item of orderItems) {
                await db.query(`
                    INSERT INTO order_items SET ?
                `, {
                    order_id: orderId,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_sku: item.sku,
                    brand: item.brand,
                    material: item.material,
                    weight: item.weight,
                    warranty: item.warranty,
                    price: item.price,
                    discount: cartItems.find(ci => ci.product_id === item.product_id)?.discount || 0,
                    final_price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    item_total: item.item_total,
                    product_image: item.image
                });

                // 3. Update product stock
                await db.query(`
                    UPDATE products 
                    SET stock = stock - ? 
                    WHERE id = ? AND stock >= ?
                `, [item.quantity, item.product_id, item.quantity]);
            }

            // 4. Clear user's cart
            await db.query("DELETE FROM cart WHERE user_id = ?", [userId]);

            // Commit transaction
            await db.query("COMMIT");

            // 5. Save shipping address if not saved
            if (shippingAddress.saveAddress) {
                await db.query(`
                    INSERT INTO user_addresses SET ?
                `, {
                    user_id: userId,
                    address_type: 'home',
                    full_name: shippingAddress.fullName,
                    phone: shippingAddress.phone,
                    email: shippingAddress.email,
                    address_line1: shippingAddress.address,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postal_code: shippingAddress.postalCode,
                    country: shippingAddress.country || "India",
                    is_default: 1
                });
            }

            res.status(201).json({
                success: true,
                message: "Order placed successfully",
                orderId: orderId,
                orderNumber: orderNumber,
                totalAmount: totalAmount.toFixed(2),
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from now
            });

        } catch (error) {
            // Rollback transaction on error
            await db.query("ROLLBACK");
            console.error("Order creation error:", error);
            throw error;
        }

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
    }
});

// ✅ 2. Direct Buy Now (Single Product)
router.post("/direct-buy", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    const {
        productId,
        quantity = 1,
        size,
        color,
        shippingAddress,
        paymentMethod,
        orderNote,
        shippingMethod = "standard"
    } = req.body;

    try {
        // Validate required fields
        if (!productId || !shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Product, shipping address and payment method are required"
            });
        }

        // Get product details
        const [products] = await db.query(`
            SELECT * FROM products 
            WHERE id = ? AND status = 'active'
        `, [productId]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];

        // Check stock
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${product.name}" is out of stock`
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available for "${product.name}"`
            });
        }

        // Calculate price
        const price = parseFloat(product.price);
        const discount = parseFloat(product.discount) || 0;
        const finalPrice = discount > 0 ?
            price - (price * discount / 100) : price;
        const itemTotal = finalPrice * quantity;

        // Calculate shipping
        let shippingCharge = 0;
        if (product.free_shipping !== 1) {
            shippingCharge = parseFloat(product.shipping_cost) || 0;
            if (shippingCharge < 50) shippingCharge = 50;
            if (shippingMethod === "express") shippingCharge += 50;
        }

        const taxAmount = itemTotal * 0.18;
        const discountAmount = discount > 0 ? (price * discount / 100) * quantity : 0;
        const totalAmount = itemTotal + shippingCharge + taxAmount - discountAmount;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Parse images
        let images = [];
        try {
            images = product.images ? JSON.parse(product.images) : [];
        } catch (e) {
            console.error("Error parsing images:", e);
        }

        // Start transaction
        await db.query("START TRANSACTION");

        try {
            // 1. Create order
            const [orderResult] = await db.query(`
                INSERT INTO orders SET ?
            `, {
                order_number: orderNumber,
                user_id: userId,
                subtotal: itemTotal.toFixed(2),
                shipping_charge: shippingCharge.toFixed(2),
                tax_amount: taxAmount.toFixed(2),
                discount_amount: discountAmount.toFixed(2),
                total_amount: totalAmount.toFixed(2),
                shipping_full_name: shippingAddress.fullName,
                shipping_phone: shippingAddress.phone,
                shipping_email: shippingAddress.email,
                shipping_address: shippingAddress.address,
                shipping_city: shippingAddress.city,
                shipping_state: shippingAddress.state,
                shipping_postal_code: shippingAddress.postalCode,
                shipping_country: shippingAddress.country || "India",
                billing_full_name: shippingAddress.fullName,
                billing_phone: shippingAddress.phone,
                billing_email: shippingAddress.email,
                billing_address: shippingAddress.address,
                billing_city: shippingAddress.city,
                billing_state: shippingAddress.state,
                billing_postal_code: shippingAddress.postalCode,
                billing_country: shippingAddress.country || "India",
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
                order_status: 'pending',
                order_notes: orderNote,
                shipping_method: shippingMethod,
                is_direct_buy: 1,
                created_at: new Date()
            });

            const orderId = orderResult.insertId;

            // 2. Create order item
            await db.query(`
                INSERT INTO order_items SET ?
            `, {
                order_id: orderId,
                product_id: productId,
                product_name: product.name,
                product_sku: product.sku,
                brand: product.brand,
                material: product.material,
                weight: product.weight,
                warranty: product.warranty,
                price: price,
                discount: discount,
                final_price: finalPrice,
                quantity: quantity,
                size: size,
                color: color,
                item_total: itemTotal,
                product_image: images[0] || null
            });

            // 3. Update product stock
            await db.query(`
                UPDATE products 
                SET stock = stock - ? 
                WHERE id = ? AND stock >= ?
            `, [quantity, productId, quantity]);

            // Commit transaction
            await db.query("COMMIT");

            res.status(201).json({
                success: true,
                message: "Order placed successfully",
                orderId: orderId,
                orderNumber: orderNumber,
                totalAmount: totalAmount.toFixed(2),
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });

        } catch (error) {
            await db.query("ROLLBACK");
            console.error("Direct buy error:", error);
            throw error;
        }

    } catch (error) {
        console.error("Direct buy error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message
        });
    }
});

// ✅ 3. Get Order Details
router.get("/:orderId", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { orderId } = req.params;

    try {
        // Get order
        const [orders] = await db.query(`
            SELECT o.*, 
                   CONCAT(u.name) as customer_name,
                   u.email as customer_email,
                   u.phone as customer_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, userId]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = orders[0];

        // Get order items
        const [orderItems] = await db.query(`
            SELECT * FROM order_items 
            WHERE order_id = ?
            ORDER BY id
        `, [orderId]);

        // Get order status history
        const [statusHistory] = await db.query(`
            SELECT * FROM order_status_history 
            WHERE order_id = ?
            ORDER BY created_at DESC
        `, [orderId]);

        res.json({
            success: true,
            order: {
                ...order,
                items: orderItems,
                status_history: statusHistory
            }
        });

    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details"
        });
    }
});

// ✅ 4. Get User's Orders
router.get("/user/orders", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // Get total count
        const [countResult] = await db.query(`
            SELECT COUNT(*) as total FROM orders WHERE user_id = ?
        `, [userId]);

        // Get orders
        const [orders] = await db.query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.payment_method,
                o.created_at,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `, [userId, parseInt(limit), offset]);

        res.json({
            success: true,
            orders: orders,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
});

// ✅ 5. Get Saved Addresses
router.get("/user/addresses", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    try {
        const [addresses] = await db.query(`
            SELECT * FROM user_addresses 
            WHERE user_id = ?
            ORDER BY is_default DESC, created_at DESC
        `, [userId]);

        res.json({
            success: true,
            addresses: addresses
        });

    } catch (error) {
        console.error("Get addresses error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
});

// ✅ 6. Save New Address
router.post("/user/addresses", authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;
    const addressData = req.body;

    try {
        // If setting as default, unset other defaults
        if (addressData.is_default === 1) {
            await db.query(`
                UPDATE user_addresses 
                SET is_default = 0 
                WHERE user_id = ?
            `, [userId]);
        }

        const [result] = await db.query(`
            INSERT INTO user_addresses SET ?
        `, {
            user_id: userId,
            ...addressData,
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Address saved successfully",
            addressId: result.insertId
        });

    } catch (error) {
        console.error("Save address error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save address"
        });
    }
});

module.exports = router;