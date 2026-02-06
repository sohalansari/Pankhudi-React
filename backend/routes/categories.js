// const express = require("express");
// const router = express.Router();

// /* =====================================================
//    CATEGORIES
// ===================================================== */

// /* FEATURED CATEGORIES
//    GET /api/categories/featured
// */
// router.get("/featured", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM categories WHERE status = 'Active' ORDER BY id DESC LIMIT 6",
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Featured Categories Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             res.json(results);
//         }
//     );
// });

// /* ALL CATEGORIES
//    GET /api/categories
// */
// router.get("/", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM categories ORDER BY name ASC",
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Categories Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             res.json(results);
//         }
//     );
// });

// /* SINGLE CATEGORY
//    GET /api/categories/:id
// */
// router.get("/:id", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM categories WHERE id = ?",
//         [req.params.id],
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Single Category Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             if (!results.length) {
//                 return res.status(404).json({ message: "Category not found" });
//             }
//             res.json(results[0]);
//         }
//     );
// });

// /* =====================================================
//    SUB CATEGORIES
// ===================================================== */

// /* ALL SUB CATEGORIES
//    GET /api/categories/subcategories
// */
// router.get("/subcategories/all", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM sub_categories ORDER BY name ASC",
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Sub Categories Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             res.json(results);
//         }
//     );
// });

// /* SUB CATEGORIES BY CATEGORY ID
//    GET /api/categories/subcategories/:categoryId
// */
// router.get("/subcategories/:categoryId", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM sub_categories WHERE category_id = ?",
//         [req.params.categoryId],
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Sub Categories By Category Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             res.json(results);
//         }
//     );
// });

// /* =====================================================
//    SUB SUB CATEGORIES (FIXED TABLE NAME)
// ===================================================== */

// /* ALL SUB SUB CATEGORIES
//    GET /api/categories/subsubcategories
// */
// router.get("/subsubcategories/all", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM sub_sub_categories ORDER BY name ASC",
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Sub Sub Categories SQL Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             res.json(results);
//         }
//     );
// });

// /* SUB SUB CATEGORIES BY SUB CATEGORY ID
//    GET /api/categories/subsubcategories/:subCategoryId
// */
// router.get("/subsubcategories/:subCategoryId", (req, res) => {
//     const db = req.db;

//     db.query(
//         "SELECT * FROM sub_sub_categories WHERE sub_category_id = ?",
//         [req.params.subCategoryId],
//         (err, results) => {
//             if (err) {
//                 console.error("❌ Sub Sub Categories By Sub Error:", err.sqlMessage);
//                 return res.status(500).json({ message: err.sqlMessage });
//             }
//             res.json(results);
//         }
//     );
// });

// module.exports = router;





const express = require("express");
const router = express.Router();

/* =====================================================
   CATEGORIES
===================================================== */

/* FEATURED CATEGORIES
   GET /api/categories/featured
*/
router.get("/featured", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT id, name, status, image, description FROM categories WHERE status = 'active' ORDER BY id DESC LIMIT 6",
        (err, results) => {
            if (err) {
                console.error("❌ Featured Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(category => ({
                ...category,
                image: category.image ? processImageUrl(category.image, req) : null
            }));

            res.json(processedResults);
        }
    );
});

/* ALL CATEGORIES
   GET /api/categories
*/
router.get("/", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT id, name, status, image, description FROM categories ORDER BY name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(category => ({
                ...category,
                image: category.image ? processImageUrl(category.image, req) : null
            }));

            res.json(processedResults);
        }
    );
});

/* SINGLE CATEGORY
   GET /api/categories/:id
*/
router.get("/:id", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT id, name, status, image, description FROM categories WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) {
                console.error("❌ Single Category Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }
            if (!results.length) {
                return res.status(404).json({ message: "Category not found" });
            }

            // Agar image URL relative hai to absolute URL banaye
            const category = {
                ...results[0],
                image: results[0].image ? processImageUrl(results[0].image, req) : null
            };

            res.json(category);
        }
    );
});

/* =====================================================
   SUB CATEGORIES
===================================================== */

/* ALL SUB CATEGORIES
   GET /api/subcategories
*/
router.get("/subcategories/all", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT sc.*, c.name as category_name FROM sub_categories sc LEFT JOIN categories c ON sc.category_id = c.id ORDER BY sc.name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Sub Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(subCategory => ({
                ...subCategory,
                // Frontend code 'image_url' field expect kar raha hai, isliye 'image' ko 'image_url' mein map karo
                image_url: subCategory.image ? processImageUrl(subCategory.image, req) : null,
                // Original image bhi rakh do
                image: subCategory.image ? processImageUrl(subCategory.image, req) : null
            }));

            res.json(processedResults);
        }
    );
});

/* SUB CATEGORIES BY CATEGORY ID
   GET /api/categories/subcategories/:categoryId
*/
router.get("/subcategories/:categoryId", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT sc.*, c.name as category_name FROM sub_categories sc LEFT JOIN categories c ON sc.category_id = c.id WHERE sc.category_id = ? ORDER BY sc.name ASC",
        [req.params.categoryId],
        (err, results) => {
            if (err) {
                console.error("❌ Sub Categories By Category Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(subCategory => ({
                ...subCategory,
                // Frontend code 'image_url' field expect kar raha hai
                image_url: subCategory.image ? processImageUrl(subCategory.image, req) : null,
                image: subCategory.image ? processImageUrl(subCategory.image, req) : null
            }));

            res.json(processedResults);
        }
    );
});

/* =====================================================
   SUB SUB CATEGORIES
===================================================== */

/* ALL SUB SUB CATEGORIES
   GET /api/categories/subsubcategories
*/
router.get("/subsubcategories/all", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT ssc.*, sc.name as sub_category_name, c.name as category_name FROM sub_sub_categories ssc LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id LEFT JOIN categories c ON sc.category_id = c.id ORDER BY ssc.name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Sub Sub Categories SQL Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(subSubCategory => ({
                ...subSubCategory,
                // Frontend code 'image_url' field expect kar raha hai
                image_url: subSubCategory.image ? processImageUrl(subSubCategory.image, req) : null,
                image: subSubCategory.image ? processImageUrl(subSubCategory.image, req) : null
            }));

            res.json(processedResults);
        }
    );
});

/* SUB SUB CATEGORIES BY SUB CATEGORY ID
   GET /api/categories/subsubcategories/:subCategoryId
*/
router.get("/subsubcategories/:subCategoryId", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT ssc.*, sc.name as sub_category_name, c.name as category_name FROM sub_sub_categories ssc LEFT JOIN sub_categories sc ON ssc.sub_category_id = sc.id LEFT JOIN categories c ON sc.category_id = c.id WHERE ssc.sub_category_id = ? ORDER BY ssc.name ASC",
        [req.params.subCategoryId],
        (err, results) => {
            if (err) {
                console.error("❌ Sub Sub Categories By Sub Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(subSubCategory => ({
                ...subSubCategory,
                // Frontend code 'image_url' field expect kar raha hai
                image_url: subSubCategory.image ? processImageUrl(subSubCategory.image, req) : null,
                image: subSubCategory.image ? processImageUrl(subSubCategory.image, req) : null
            }));

            res.json(processedResults);
        }
    );
});

/* =====================================================
   ALTERNATIVE ROUTES FOR FRONTEND COMPATIBILITY
===================================================== */

/* GET /api/subcategories (alternative route for frontend compatibility) */
router.get("/subcategories", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT sc.*, c.name as category_name FROM sub_categories sc LEFT JOIN categories c ON sc.category_id = c.id WHERE sc.status = 'active' OR sc.status IS NULL ORDER BY sc.name ASC",
        (err, results) => {
            if (err) {
                console.error("❌ Sub Categories (Alternative) Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(subCategory => ({
                id: subCategory.id,
                name: subCategory.name,
                category_id: subCategory.category_id,
                slug: subCategory.slug || subCategory.name.toLowerCase().replace(/\s+/g, '-'),
                image_url: subCategory.image ? processImageUrl(subCategory.image, req) : null,
                is_active: subCategory.status === 'active' || subCategory.status === undefined
            }));

            res.json({
                success: true,
                data: processedResults
            });
        }
    );
});

/* =====================================================
   QUICK SUB CATEGORIES (FOR HOMEPAGE)
===================================================== */

/* GET /api/subcategories/quick (for homepage quick categories) */
router.get("/subcategories/quick", (req, res) => {
    const db = req.db;

    db.query(
        "SELECT sc.*, c.name as category_name FROM sub_categories sc LEFT JOIN categories c ON sc.category_id = c.id WHERE (sc.status = 'active' OR sc.status IS NULL) AND sc.image IS NOT NULL ORDER BY sc.name ASC LIMIT 10",
        (err, results) => {
            if (err) {
                console.error("❌ Quick Sub Categories Error:", err.sqlMessage);
                return res.status(500).json({ message: err.sqlMessage });
            }

            // Agar image URL relative hai to absolute URL banaye
            const processedResults = results.map(subCategory => ({
                id: subCategory.id,
                name: subCategory.name,
                category_id: subCategory.category_id,
                slug: subCategory.slug || subCategory.name.toLowerCase().replace(/\s+/g, '-'),
                image_url: subCategory.image ? processImageUrl(subCategory.image, req) : null
            }));

            res.json({
                success: true,
                data: processedResults
            });
        }
    );
});

/* =====================================================
   HELPER FUNCTIONS
===================================================== */

// Image URL processor function
function processImageUrl(imagePath, req) {
    if (!imagePath) return null;

    // Trim whitespace
    imagePath = imagePath.trim();

    // Agar already absolute URL hai
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Agar relative path hai to absolute URL banaye
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Agar path / se start ho raha hai
    if (imagePath.startsWith('/')) {
        return `${baseUrl}${imagePath}`;
    }

    // Agar relative path hai without /
    return `${baseUrl}/${imagePath}`;
}

module.exports = router;