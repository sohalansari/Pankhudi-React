const express = require("express");
const router = express.Router();

// ✅ Get Complete Product Details
router.get("/:id/complete", async (req, res) => {
    try {
        const productId = req.params.id;

        const [products] = await req.db.queryAsync(`
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug,
                sc.name as sub_category_name,
                sc.slug as sub_category_slug,
                ssc.name as sub_sub_category_name,
                ssc.slug as sub_sub_category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id AND c.status = 'active'
            LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id AND sc.status = 'active'
            LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id AND ssc.status = 'active'
            WHERE p.id = ? AND p.status = 'active'
        `, [productId]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];

        // Parse JSON fields
        const parsedProduct = {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            sizes: product.sizes ? JSON.parse(product.sizes) : [],
            colors: product.colors ? JSON.parse(product.colors) : [],
            features: product.features ? JSON.parse(product.features) : [],
            tags: product.tags ? JSON.parse(product.tags) : [],
            // Calculate prices
            final_price: product.discount > 0 ?
                product.price - (product.price * product.discount / 100) :
                product.price,
            // Convert to boolean
            is_featured: product.is_featured === 1,
            is_trending: product.is_trending === 1,
            is_bestseller: product.is_bestseller === 1,
            free_shipping: product.free_shipping === 1
        };

        res.json({
            success: true,
            product: parsedProduct
        });

    } catch (error) {
        console.error("Get product details error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product details",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ✅ Get Multiple Products by IDs
router.post("/bulk", async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Product IDs array required"
            });
        }

        const placeholders = productIds.map(() => '?').join(',');
        const [products] = await req.db.queryAsync(`
            SELECT 
                id,
                name,
                price,
                discount,
                images,
                brand,
                sku,
                stock,
                status
            FROM products 
            WHERE id IN (${placeholders}) AND status = 'active'
        `, productIds);

        // Parse images and calculate final price
        const parsedProducts = products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            final_price: product.discount > 0 ?
                product.price - (product.price * product.discount / 100) :
                product.price
        }));

        res.json({
            success: true,
            products: parsedProducts
        });

    } catch (error) {
        console.error("Bulk products error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
});

module.exports = router;