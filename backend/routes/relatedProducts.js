// const express = require('express');
// const router = express.Router();
// const mysql = require('mysql2'); // ✅ mysql2 use karein

// // ✅ Create separate database connection for related products
// const db = mysql.createPool({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "user_db",
//     port: process.env.DB_PORT || 3306,
//     connectionLimit: 10,
// });

// // ✅ Promise wrapper for database queries
// const dbExecute = (query, params) => {
//     return new Promise((resolve, reject) => {
//         db.query(query, params, (error, results) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve([results]);
//             }
//         });
//     });
// };

// // Get related products for a product
// router.get('/product/:productId', async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { limit = 8 } = req.query;

//         const query = `
//             SELECT
//                 p.*,
//                 c.name as category_name,
//                 sc.name as sub_category_name,
//                 rp.relation_type,
//                 rp.score
//             FROM related_products rp
//             JOIN products p ON rp.related_product_id = p.id
//             LEFT JOIN categories c ON p.category_id = c.id
//             LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//             WHERE rp.product_id = ?
//             AND p.stock > 0
//             ORDER BY rp.score DESC, p.rating DESC
//             LIMIT ?
//         `;

//         const relatedProducts = await dbExecute(query, [productId, parseInt(limit)]);

//         res.json({
//             success: true,
//             data: relatedProducts[0]
//         });
//     } catch (error) {
//         console.error('Related products error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// // Get cart-based recommendations
// router.get('/cart/recommendations', async (req, res) => {
//     try {
//         const { cart_items, user_id, limit = 12 } = req.query;

//         let recommendations = [];

//         if (cart_items && cart_items.length > 0) {
//             const cartItemIds = cart_items.split(',').map(id => parseInt(id));

//             // Based on categories of cart items
//             const categoryQuery = `
//                 SELECT DISTINCT
//                     p.*,
//                     c.name as category_name,
//                     sc.name as sub_category_name,
//                     'category_based' as recommendation_type,
//                     RAND() as score
//                 FROM products p
//                 LEFT JOIN categories c ON p.category_id = c.id
//                 LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//                 WHERE p.category_id IN (
//                     SELECT DISTINCT category_id
//                     FROM products
//                     WHERE id IN (?)
//                 )
//                 AND p.id NOT IN (?)
//                 AND p.stock > 0
//                 ORDER BY p.rating DESC, p.created_at DESC
//                 LIMIT ?
//             `;

//             const categoryResults = await dbExecute(categoryQuery, [
//                 cartItemIds, cartItemIds, parseInt(limit)
//             ]);

//             recommendations = [...categoryResults[0]];
//         }

//         // If no cart items or not enough recommendations, show trending products
//         if (recommendations.length < limit) {
//             const remainingLimit = parseInt(limit) - recommendations.length;
//             const trendingQuery = `
//                 SELECT
//                     p.*,
//                     c.name as category_name,
//                     sc.name as sub_category_name,
//                     'trending' as recommendation_type,
//                     RAND() as score
//                 FROM products p
//                 LEFT JOIN categories c ON p.category_id = c.id
//                 LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//                 WHERE p.stock > 0
//                 AND p.is_trending = TRUE
//                 AND p.id NOT IN (?)
//                 ORDER BY p.rating DESC
//                 LIMIT ?
//             `;

//             const recommendationIds = recommendations.map(p => p.id);
//             const trendingResults = await dbExecute(trendingQuery, [
//                 recommendationIds.length > 0 ? recommendationIds : [0],
//                 remainingLimit
//             ]);

//             recommendations = [...recommendations, ...trendingResults[0]];
//         }

//         // If still no products, show any available products
//         if (recommendations.length === 0) {
//             const fallbackQuery = `
//                 SELECT
//                     p.*,
//                     c.name as category_name,
//                     sc.name as sub_category_name,
//                     'featured' as recommendation_type,
//                     RAND() as score
//                 FROM products p
//                 LEFT JOIN categories c ON p.category_id = c.id
//                 LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//                 WHERE p.stock > 0
//                 ORDER BY p.created_at DESC
//                 LIMIT ?
//             `;

//             const fallbackResults = await dbExecute(fallbackQuery, [parseInt(limit)]);
//             recommendations = fallbackResults[0];
//         }

//         res.json({
//             success: true,
//             data: recommendations
//         });
//     } catch (error) {
//         console.error('Cart recommendations error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// // Get frequently bought together
// router.get('/frequently-bought-together/:productId', async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { limit = 4 } = req.query;

//         const query = `
//             SELECT
//                 p.*,
//                 c.name as category_name,
//                 sc.name as sub_category_name,
//                 COUNT(*) as purchase_count
//             FROM order_items oi1
//             JOIN orders o ON oi1.order_id = o.id
//             JOIN order_items oi2 ON o.id = oi2.order_id
//             JOIN products p ON oi2.product_id = p.id
//             LEFT JOIN categories c ON p.category_id = c.id
//             LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//             WHERE oi1.product_id = ?
//             AND oi2.product_id != ?
//             AND p.stock > 0
//             GROUP BY p.id
//             ORDER BY purchase_count DESC
//             LIMIT ?
//         `;

//         const frequentlyBought = await dbExecute(query, [productId, productId, parseInt(limit)]);

//         res.json({
//             success: true,
//             data: frequentlyBought[0]
//         });
//     } catch (error) {
//         console.error('Frequently bought together error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// // Get personalized recommendations based on user behavior
// router.get('/personalized/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { limit = 8 } = req.query;

//         const query = `
//             SELECT DISTINCT
//                 p.*,
//                 c.name as category_name,
//                 sc.name as sub_category_name,
//                 'personalized' as recommendation_type,
//                 COUNT(ub.id) as interaction_score
//             FROM user_behavior ub
//             JOIN products p ON ub.product_id = p.id
//             LEFT JOIN categories c ON p.category_id = c.id
//             LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//             WHERE ub.user_id = ?
//             AND ub.behavior_type IN ('view', 'add_to_cart', 'purchase')
//             AND p.stock > 0
//             GROUP BY p.id
//             ORDER BY interaction_score DESC, p.rating DESC
//             LIMIT ?
//         `;

//         const personalizedRecs = await dbExecute(query, [userId, parseInt(limit)]);

//         res.json({
//             success: true,
//             data: personalizedRecs[0]
//         });
//     } catch (error) {
//         console.error('Personalized recommendations error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// // Get similar products by category and attributes
// router.get('/similar/:productId', async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { limit = 6 } = req.query;

//         const query = `
//             SELECT
//                 p2.*,
//                 c.name as category_name,
//                 sc.name as sub_category_name,
//                 'similar' as relation_type,
//                 (
//                     CASE
//                         WHEN p2.category_id = p1.category_id THEN 0.8
//                         ELSE 0.2
//                     END +
//                     CASE
//                         WHEN p2.sub_category_id = p1.sub_category_id THEN 0.5
//                         ELSE 0.1
//                     END +
//                     CASE
//                         WHEN ABS(p2.price - p1.price) / p1.price < 0.3 THEN 0.3
//                         ELSE 0.1
//                     END +
//                     RAND() * 0.2
//                 ) as similarity_score
//             FROM products p1
//             CROSS JOIN products p2
//             LEFT JOIN categories c ON p2.category_id = c.id
//             LEFT JOIN sub_categories sc ON p2.sub_category_id = sc.id
//             WHERE p1.id = ?
//             AND p2.id != ?
//             AND p2.stock > 0
//             ORDER BY similarity_score DESC
//             LIMIT ?
//         `;

//         const similarProducts = await dbExecute(query, [productId, productId, parseInt(limit)]);

//         res.json({
//             success: true,
//             data: similarProducts[0]
//         });
//     } catch (error) {
//         console.error('Similar products error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// // Track user behavior for recommendations
// router.post('/track-behavior', async (req, res) => {
//     try {
//         const { user_id, product_id, behavior_type, session_id } = req.body;

//         const query = `
//             INSERT INTO user_behavior (user_id, product_id, behavior_type, session_id)
//             VALUES (?, ?, ?, ?)
//         `;

//         await dbExecute(query, [user_id, product_id, behavior_type, session_id]);

//         res.json({
//             success: true,
//             message: 'Behavior tracked successfully'
//         });
//     } catch (error) {
//         console.error('Track behavior error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });





// // Temporary fix - return empty data until DB is fixed
// router.get('/cart/recommendations', async (req, res) => {
//     try {
//         // Temporary: Return empty array
//         res.json({
//             success: true,
//             data: []
//         });
//     } catch (error) {
//         console.error('Cart recommendations error:', error);
//         res.json({
//             success: true,
//             data: []
//         });
//     }
// });

// router.get('/frequently-bought-together/:productId', async (req, res) => {
//     try {
//         // Temporary: Return empty array
//         res.json({
//             success: true,
//             data: []
//         });
//     } catch (error) {
//         console.error('Frequently bought together error:', error);
//         res.json({
//             success: true,
//             data: []
//         });
//     }
// });

// module.exports = router;