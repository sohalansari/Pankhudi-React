const express = require("express");
const router = express.Router();

// Enhanced helper function to calculate product prices and discounts
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
        images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [],
        originalPrice: price,
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        hasDiscount: hasDiscount,
        displayPrice: parseFloat(finalPrice.toFixed(2)),
        displayDiscount: hasDiscount ? discountPercentage : 0
    };
};

// FIXED: Enhanced search query analyzer with better plural handling
const analyzeSearchQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    const analysis = {
        originalQuery: query,
        searchTerms: query,
        filters: {},
        category: null,
        brand: null,
        priceRange: null,
        extractedTerms: []
    };

    // Price filters with improved pattern matching
    const pricePatterns = [
        { pattern: /under\s*₹?\s*(\d+)/i, key: 'maxPrice' },
        { pattern: /below\s*₹?\s*(\d+)/i, key: 'maxPrice' },
        { pattern: /less than\s*₹?\s*(\d+)/i, key: 'maxPrice' },
        { pattern: /upto\s*₹?\s*(\d+)/i, key: 'maxPrice' },
        { pattern: /above\s*₹?\s*(\d+)/i, key: 'minPrice' },
        { pattern: /over\s*₹?\s*(\d+)/i, key: 'minPrice' },
        { pattern: /more than\s*₹?\s*(\d+)/i, key: 'minPrice' },
        { pattern: /between\s*₹?\s*(\d+)\s*and\s*₹?\s*(\d+)/i, key: 'priceRange' },
        { pattern: /₹?\s*(\d+)\s*to\s*₹?\s*(\d+)/i, key: 'priceRange' }
    ];

    pricePatterns.forEach(({ pattern, key }) => {
        const match = lowerQuery.match(pattern);
        if (match) {
            if (key === 'priceRange') {
                analysis.filters.minPrice = parseInt(match[1]);
                analysis.filters.maxPrice = parseInt(match[2]);
                analysis.priceRange = { min: parseInt(match[1]), max: parseInt(match[2]) };
            } else {
                analysis.filters[key] = parseInt(match[1]);
                analysis.priceRange = key === 'maxPrice'
                    ? { max: parseInt(match[1]) }
                    : { min: parseInt(match[1]) };
            }
            // Remove price pattern from search terms
            analysis.searchTerms = analysis.searchTerms.replace(pattern, '').trim();
        }
    });

    // FIXED: Improved category detection with better plural handling
    const categories = {
        'saree': 1, 'sarees': 1,
        'dress': 2, 'dresses': 2,
        'jewelry': 3, 'jewellery': 3, 'jewel': 3,
        'kurta': 4, 'kurtas': 4, 'kurti': 4, 'kurtis': 4, // Added kurtis
        'lehenga': 5, 'lehengas': 5,
        'earring': 6, 'earrings': 6,
        'bangle': 7, 'bangles': 7,
        'mobile': 8, 'phone': 8, 'smartphone': 8,
        'laptop': 9, 'notebook': 9,
        'shoes': 10, 'footwear': 10,
        'bag': 11, 'bags': 11, 'handbag': 11,
        'watch': 12, 'watches': 12
    };

    // FIXED: Better category extraction logic
    let foundCategory = null;
    let remainingQuery = analysis.searchTerms;

    // Sort categories by length (longer first) to avoid partial matches
    const sortedCategories = Object.keys(categories).sort((a, b) => b.length - a.length);

    for (const category of sortedCategories) {
        const categoryRegex = new RegExp(`\\b${category}\\b`, 'gi');
        if (categoryRegex.test(lowerQuery)) {
            foundCategory = categories[category];
            analysis.extractedTerms.push(category);
            // Remove only the exact category word
            remainingQuery = remainingQuery.replace(categoryRegex, '').trim();
            break; // Take the first longest match
        }
    }

    if (foundCategory) {
        analysis.category = foundCategory;
        analysis.searchTerms = remainingQuery;
    }

    // Brand detection
    const brands = ['nike', 'adidas', 'puma', 'zara', 'h&m', 'levi', 'gucci', 'prada', 'titan', 'fastrack', 'sony', 'samsung'];
    brands.forEach(brand => {
        const brandRegex = new RegExp(`\\b${brand}\\b`, 'gi');
        if (brandRegex.test(lowerQuery)) {
            analysis.brand = brand;
            analysis.extractedTerms.push(brand);
            analysis.searchTerms = analysis.searchTerms.replace(brandRegex, '').trim();
        }
    });

    // FIXED: Better search terms cleanup
    analysis.searchTerms = analysis.searchTerms.replace(/\s+/g, ' ').trim();

    // If search terms are very short (1-2 chars) and we have category, ignore them
    if (analysis.searchTerms.length <= 2 && analysis.category) {
        analysis.searchTerms = '';
    }

    return analysis;
};

// FIXED: Enhanced main search route with better query building
router.get("/", (req, res) => {
    const { q: query, category, sort, page = 1, limit = 20 } = req.query;
    const db = req.db;

    if (!query) {
        return res.status(400).json({
            success: false,
            error: "Query parameter is required"
        });
    }

    try {
        // Analyze the search query for natural language processing
        const analysis = analyzeSearchQuery(query);

        console.log('Search Analysis:', analysis);

        let sqlQuery = `
            SELECT 
                id, name, description, price, 
                discount, 
                rating, stock, category_id, 
                brand, images, status, created_at, updated_at
            FROM products 
            WHERE status = 'Active' 
        `;

        const queryParams = [];
        const conditions = [];

        // FIXED: Better text search conditions
        const hasMeaningfulSearchTerms = analysis.searchTerms.trim() && analysis.searchTerms.length > 1;

        if (hasMeaningfulSearchTerms) {
            conditions.push('(name LIKE ? OR description LIKE ? OR brand LIKE ?)');
            const searchTerm = `%${analysis.searchTerms.trim()}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Price filters from natural language
        if (analysis.filters.minPrice) {
            conditions.push('(price - (price * COALESCE(discount, 0) / 100)) >= ?');
            queryParams.push(analysis.filters.minPrice);
        }
        if (analysis.filters.maxPrice) {
            conditions.push('(price - (price * COALESCE(discount, 0) / 100)) <= ?');
            queryParams.push(analysis.filters.maxPrice);
        }

        // Category from natural language
        if (analysis.category) {
            conditions.push('category_id = ?');
            queryParams.push(analysis.category);
        }

        // Manual category filter (from query params)
        if (category && category !== 'all') {
            conditions.push('category_id = ?');
            queryParams.push(category);
        }

        // Brand from natural language
        if (analysis.brand) {
            conditions.push('brand LIKE ?');
            queryParams.push(`%${analysis.brand}%`);
        }

        // FIXED: Handle case where only category is detected
        if (conditions.length === 0) {
            if (analysis.category) {
                conditions.push('category_id = ?');
                queryParams.push(analysis.category);
            } else {
                // Fallback to basic search
                conditions.push('(name LIKE ? OR description LIKE ? OR brand LIKE ?)');
                const searchTerm = `%${query.trim()}%`;
                queryParams.push(searchTerm, searchTerm, searchTerm);
            }
        }

        // Combine all conditions
        if (conditions.length > 0) {
            sqlQuery += ' AND ' + conditions.join(' AND ');
        }

        // FIXED: Improved sorting logic
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
                // Smart default sorting
                if (hasMeaningfulSearchTerms) {
                    sqlQuery += ' ORDER BY (CASE WHEN name LIKE ? THEN 1 WHEN brand LIKE ? THEN 2 ELSE 3 END)';
                    const exactMatch = `${analysis.searchTerms.trim()}%`;
                    queryParams.push(exactMatch, exactMatch);
                } else if (analysis.category) {
                    sqlQuery += ' ORDER BY rating DESC, discount DESC';
                } else {
                    sqlQuery += ' ORDER BY rating DESC, created_at DESC';
                }
        }

        // Pagination
        const offset = (page - 1) * limit;
        sqlQuery += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        console.log('Final SQL Query:', sqlQuery);
        console.log('Query Params:', queryParams);

        db.query(sqlQuery, queryParams, (err, rows) => {
            if (err) {
                console.error('Search database error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Database search failed',
                    message: err.message
                });
            }

            const products = rows.map(calculateProductPrices);

            // Generate smart message based on analysis
            let message = `Found ${products.length} products`;

            if (analysis.filters.minPrice && analysis.filters.maxPrice) {
                message = `Showing ${products.length} products between ₹${analysis.filters.minPrice} and ₹${analysis.filters.maxPrice}`;
            } else if (analysis.filters.minPrice) {
                message = `Showing ${products.length} products above ₹${analysis.filters.minPrice}`;
            } else if (analysis.filters.maxPrice) {
                message = `Showing ${products.length} products under ₹${analysis.filters.maxPrice}`;
            } else if (analysis.category && analysis.extractedTerms.length > 0) {
                const categoryName = analysis.extractedTerms[0];
                message = `Showing ${products.length} ${categoryName} products`;
            } else if (analysis.originalQuery) {
                message = `Search results for "${analysis.originalQuery}" - ${products.length} products found`;
            }

            res.json({
                success: true,
                products,
                count: products.length,
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.length / limit),
                analyzedQuery: analysis,
                appliedFilters: analysis.filters,
                message: message
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

// FIXED: Quick search suggestions with better matching
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

        const searchPattern = `%${query}%`;
        const exactPattern = `${query}%`;

        const queryParams = [
            searchPattern, searchPattern, searchPattern,
            exactPattern, exactPattern
        ];

        db.query(sqlQuery, queryParams, (err, rows) => {
            if (err) {
                console.error('Suggestions error:', err);
                return res.json({
                    success: true,
                    suggestions: []
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
        res.json({
            success: true,
            suggestions: []
        });
    }
});

// Trending products
router.get("/trending", (req, res) => {
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
            AND stock > 0
            AND discount > 0
            ORDER BY 
                (rating * 0.6 + discount * 0.4) DESC,
                created_at DESC
            LIMIT 12
        `;

        db.query(sqlQuery, (err, rows) => {
            if (err) {
                console.error('Trending products error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch trending products'
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
            error: 'Trending route failed'
        });
    }
});

// Discounted products
router.get("/discounted", (req, res) => {
    const { page = 1, limit = 20, min_discount = 10 } = req.query;
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
            AND discount >= ?
            AND discount <= 100
            ORDER BY 
                discount DESC,
                rating DESC
            LIMIT ? OFFSET ?
        `;

        const offset = (page - 1) * limit;

        db.query(sqlQuery, [parseInt(min_discount), parseInt(limit), offset], (err, rows) => {
            if (err) {
                console.error('Discounted products error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch discounted products'
                });
            }

            const products = rows.map(calculateProductPrices);

            // Get total count
            db.query(
                'SELECT COUNT(*) as total FROM products WHERE status = "Active" AND discount >= ? AND discount <= 100',
                [parseInt(min_discount)],
                (countErr, countRows) => {
                    if (countErr) {
                        return res.json({
                            success: true,
                            products,
                            total: products.length,
                            totalPages: 1,
                            currentPage: parseInt(page)
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
            error: 'Discounted route failed'
        });
    }
});

// Search analytics
router.get("/analytics", (req, res) => {
    const { q: query } = req.query;
    const db = req.db;

    if (!query) {
        return res.status(400).json({
            success: false,
            error: "Query parameter is required"
        });
    }

    try {
        const analysis = analyzeSearchQuery(query);

        // Get price statistics
        const priceQuery = `
            SELECT 
                MIN(price - (price * COALESCE(discount, 0) / 100)) as minPrice,
                MAX(price - (price * COALESCE(discount, 0) / 100)) as maxPrice,
                AVG(price - (price * COALESCE(discount, 0) / 100)) as avgPrice,
                COUNT(*) as totalProducts
            FROM products 
            WHERE status = 'Active'
            AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)
        `;

        const searchPattern = `%${analysis.searchTerms}%`;

        db.query(priceQuery, [searchPattern, searchPattern, searchPattern], (priceErr, priceRows) => {
            if (priceErr) {
                console.error('Analytics price error:', priceErr);
                return res.json({
                    success: true,
                    analytics: {
                        analyzedQuery: analysis,
                        priceRange: analysis.priceRange,
                        totalProducts: 0
                    }
                });
            }

            const priceStats = priceRows[0];

            res.json({
                success: true,
                analytics: {
                    analyzedQuery: analysis,
                    priceRange: analysis.priceRange,
                    priceStatistics: priceStats,
                    totalProducts: priceStats.totalProducts
                }
            });
        });

    } catch (err) {
        console.error('Analytics route error:', err);
        res.status(500).json({
            success: false,
            error: 'Analytics route failed'
        });
    }
});

// Search by category
router.get("/category/:categoryId", (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sort = 'rating' } = req.query;
    const db = req.db;

    try {
        let sqlQuery = `
            SELECT 
                id, name, description, price, 
                discount, 
                rating, stock, category_id, 
                brand, images, status, created_at, updated_at
            FROM products 
            WHERE status = 'Active' 
            AND category_id = ?
        `;

        const queryParams = [categoryId];

        // Sorting
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
            case 'newest':
                sqlQuery += ' ORDER BY created_at DESC';
                break;
            default:
                sqlQuery += ' ORDER BY rating DESC, discount DESC';
        }

        // Pagination
        const offset = (page - 1) * limit;
        sqlQuery += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        db.query(sqlQuery, queryParams, (err, rows) => {
            if (err) {
                console.error('Category search error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Category search failed'
                });
            }

            const products = rows.map(calculateProductPrices);

            res.json({
                success: true,
                products,
                count: products.length,
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.length / limit)
            });
        });

    } catch (err) {
        console.error('Category route error:', err);
        res.status(500).json({
            success: false,
            error: 'Category route failed'
        });
    }
});

// Get all categories
router.get("/categories", (req, res) => {
    const categories = [
        { id: 1, name: "Sarees", slug: "sarees" },
        { id: 2, name: "Dresses", slug: "dresses" },
        { id: 3, name: "Jewelry", slug: "jewelry" },
        { id: 4, name: "Kurtas", slug: "kurtas" },
        { id: 5, name: "Lehengas", slug: "lehengas" },
        { id: 6, name: "Earrings", slug: "earrings" },
        { id: 7, name: "Bangles", slug: "bangles" },
        { id: 8, name: "Mobiles", slug: "mobiles" },
        { id: 9, name: "Laptops", slug: "laptops" },
        { id: 10, name: "Shoes", slug: "shoes" },
        { id: 11, name: "Bags", slug: "bags" },
        { id: 12, name: "Watches", slug: "watches" }
    ];

    res.json({
        success: true,
        categories
    });
});

module.exports = router;