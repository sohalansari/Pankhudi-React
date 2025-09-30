const express = require("express");
const router = express.Router();

// Helper function to calculate product prices and discounts - FIXED FOR PERCENTAGE
const calculateProductPrices = (product) => {
    const price = parseFloat(product.price) || 0;
    const discountPercentage = parseFloat(product.discount) || 0;

    // Calculate final price and discount amount
    let finalPrice = price;
    let discountAmount = 0;
    let hasDiscount = false;

    if (discountPercentage > 0 && discountPercentage <= 100) {
        discountAmount = (price * discountPercentage) / 100;
        finalPrice = price - discountAmount;
        hasDiscount = true;
    }

    return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        originalPrice: price,
        discountPercentage: discountPercentage, // This is the percentage from database
        discountAmount: discountAmount, // Calculated discount amount
        finalPrice: finalPrice, // Price after discount
        hasDiscount: hasDiscount,
        // For display purposes
        displayPrice: finalPrice,
        displayDiscount: hasDiscount ? discountPercentage : 0
    };
};

// 1. MAIN SEARCH ROUTE - Search products with filters and pagination
// GET http://localhost:5000/api/search?q=shirt&category=2&sort=price_low&page=1
router.get("/", (req, res) => {
    const { q: query, category, sort, page = 1, limit = 20 } = req.query;
    const db = req.db;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        let sqlQuery = `
            SELECT 
                id, name, description, price, 
                discount, 
                rating, stock, category_id, 
                brand, images, status, created_at, updated_at
            FROM products 
            WHERE status = 'Active' 
            AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)
        `;

        const queryParams = [`%${query}%`, `%${query}%`, `%${query}%`];

        // Category filter
        if (category && category !== 'all') {
            sqlQuery += ' AND category_id = ?';
            queryParams.push(category);
        }

        // Sorting - FIXED with proper percentage discount calculation
        switch (sort) {
            case 'price_low':
                sqlQuery += ' ORDER BY (price - (price * COALESCE(discount, 0) / 100)) ASC';
                break;
            case 'price_high':
                sqlQuery += ' ORDER BY (price - (price * COALESCE(discount, 0) / 100)) DESC';
                break;
            case 'discount_high':
                sqlQuery += ' ORDER BY discount DESC';
                break;
            case 'rating':
                sqlQuery += ' ORDER BY rating DESC';
                break;
            case 'newest':
                sqlQuery += ' ORDER BY created_at DESC';
                break;
            case 'trending':
                sqlQuery += ' ORDER BY rating DESC, discount DESC';
                break;
            default:
                sqlQuery += ' ORDER BY (CASE WHEN name LIKE ? THEN 1 WHEN brand LIKE ? THEN 2 ELSE 3 END)';
                queryParams.push(`${query}%`, `${query}%`);
        }

        // Pagination
        const offset = (page - 1) * limit;
        sqlQuery += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        db.query(sqlQuery, queryParams, (err, rows) => {
            if (err) {
                console.error('Search database error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Database search failed',
                    message: err.message
                });
            }

            // Process products with proper discount percentage calculation
            const products = rows.map(calculateProductPrices);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM products 
                WHERE status = 'Active' 
                AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)
            `;

            const countParams = [`%${query}%`, `%${query}%`, `%${query}%`];

            if (category && category !== 'all') {
                countQuery += ' AND category_id = ?';
                countParams.push(category);
            }

            db.query(countQuery, countParams, (countErr, countRows) => {
                if (countErr) {
                    console.error('Count query error:', countErr);
                    return res.status(500).json({
                        success: false,
                        error: 'Count query failed'
                    });
                }

                const total = countRows[0].total;

                res.json({
                    success: true,
                    products,
                    total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                    searchQuery: query
                });
            });
        });

    } catch (err) {
        console.error('Search route error:', err);
        res.status(500).json({
            success: false,
            error: 'Search route failed',
            message: err.message
        });
    }
});

// 2. QUICK SEARCH SUGGESTIONS - For search dropdown
// GET http://localhost:5000/api/search/suggestions?q=sh
router.get("/suggestions", (req, res) => {
    const { q: query } = req.query;
    const db = req.db;

    if (!query || query.length < 2) {
        return res.json({ success: true, suggestions: [] });
    }

    try {
        const sqlQuery = `
            SELECT 
                id, name, description, price, 
                discount, 
                images, brand, rating, category_id
            FROM products 
            WHERE status = 'Active' 
            AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)
            ORDER BY 
                CASE 
                    WHEN name LIKE ? THEN 1
                    WHEN brand LIKE ? THEN 2
                    ELSE 3
                END,
                rating DESC,
                discount DESC
            LIMIT 8
        `;

        const queryParams = [
            `%${query}%`, `%${query}%`, `%${query}%`,
            `${query}%`, `${query}%`
        ];

        db.query(sqlQuery, queryParams, (err, rows) => {
            if (err) {
                console.error('Suggestions error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch suggestions',
                    message: err.message
                });
            }

            const suggestions = rows.map(calculateProductPrices);

            res.json({
                success: true,
                suggestions
            });
        });

    } catch (err) {
        console.error('Suggestions route error:', err);
        res.status(500).json({
            success: false,
            error: 'Suggestions route failed',
            message: err.message
        });
    }
});

// 3. TRENDING PRODUCTS - For homepage and search suggestions
// GET http://localhost:5000/api/search/trending
router.get("/trending", (req, res) => {
    const db = req.db;

    try {
        // Using rating and discount to determine trending products
        const sqlQuery = `
            SELECT 
                id, name, description, price, 
                discount, 
                rating, stock, category_id, 
                brand, images, status, created_at, updated_at
            FROM products 
            WHERE status = 'Active' 
            AND stock > 0
            ORDER BY 
                discount DESC,
                rating DESC,
                created_at DESC
            LIMIT 12
        `;

        db.query(sqlQuery, (err, rows) => {
            if (err) {
                console.error('Trending products error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch trending products',
                    message: err.message
                });
            }

            const products = rows.map(calculateProductPrices);

            res.json({
                success: true,
                products,
                count: products.length
            });
        });

    } catch (err) {
        console.error('Trending route error:', err);
        res.status(500).json({
            success: false,
            error: 'Trending route failed',
            message: err.message
        });
    }
});

// 4. DISCOUNTED PRODUCTS - Products with actual discounts
// GET http://localhost:5000/api/search/discounted
router.get("/discounted", (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const db = req.db;

    try {
        const sqlQuery = `
            SELECT 
                id, name, description, price, 
                discount, 
                rating, stock, category_id, 
                brand, images, status, created_at, updated_at
            FROM products 
            WHERE status = 'Active' 
            AND discount > 0
            AND discount <= 100
            ORDER BY 
                discount DESC,
                rating DESC
            LIMIT ? OFFSET ?
        `;

        const offset = (page - 1) * limit;

        db.query(sqlQuery, [parseInt(limit), offset], (err, rows) => {
            if (err) {
                console.error('Discounted products error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch discounted products',
                    message: err.message
                });
            }

            const products = rows.map(calculateProductPrices);

            // Get total count of discounted products
            db.query(
                'SELECT COUNT(*) as total FROM products WHERE status = "Active" AND discount > 0 AND discount <= 100',
                (countErr, countRows) => {
                    if (countErr) {
                        console.error('Count query error:', countErr);
                        return res.status(500).json({
                            success: false,
                            error: 'Count query failed'
                        });
                    }

                    const total = countRows[0].total;

                    res.json({
                        success: true,
                        products,
                        total,
                        totalPages: Math.ceil(total / limit),
                        currentPage: parseInt(page)
                    });
                }
            );
        });

    } catch (err) {
        console.error('Discounted route error:', err);
        res.status(500).json({
            success: false,
            error: 'Discounted route failed',
            message: err.message
        });
    }
});







// GET /api/search?q=shirt&category=1&sort=price_low
router.get('/', async (req, res) => {
    try {
        const query = req.query.q || '';
        const category = req.query.category || '';
        const sort = req.query.sort || 'relevance';

        let sql = `
            SELECT 
                p.id, 
                p.name, 
                p.brand, 
                p.description, 
                p.price, 
                p.discount, 
                (p.price - p.discount) AS finalPrice,
                ROUND((p.discount / p.price) * 100, 2) AS discountPercent,
                p.rating, 
                p.stock
            FROM products p
            WHERE p.name LIKE ? OR p.description LIKE ?
        `;

        const values = [`%${query}%`, `%${query}%`];

        // Category filter
        if (category) {
            sql += ' AND p.category_id = ?';
            values.push(category);
        }

        // Sorting
        if (sort === 'price_low') {
            sql += ' ORDER BY finalPrice ASC';
        } else if (sort === 'price_high') {
            sql += ' ORDER BY finalPrice DESC';
        } else if (sort === 'rating') {
            sql += ' ORDER BY p.rating DESC';
        } else if (sort === 'newest') {
            sql += ' ORDER BY p.created_at DESC';
        } else {
            sql += ' ORDER BY p.name ASC';
        }

        const [rows] = await db.query(sql, values);

        res.json({
            success: true,
            products: rows
        });

    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});




module.exports = router;