const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/banners');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Multer configuration for banner images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter
});

// ✅ Simple admin check middleware (for demo)
const checkAdmin = (req, res, next) => {
    // For demo purposes, always allow access
    // In production, implement proper JWT verification
    req.user = {
        id: 1,
        role: 'admin',
        email: 'admin@pankhudi.com'
    };
    next();
};

// ==================== DATABASE HELPER FUNCTIONS ====================

// Helper to execute query with error handling
const executeQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// ==================== PUBLIC ROUTES ====================

// ✅ GET ALL ACTIVE BANNERS (For Frontend Display)
router.get('/active', async (req, res) => {
    try {
        console.log('Fetching active banners...');
        const db = req.db;

        const query = `
            SELECT id, title, description, image_path, position, 
                   redirect_url, discount_tag, display_order,
                   status, created_at
            FROM banners 
            WHERE status = 'active' 
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY display_order ASC, created_at DESC
        `;

        db.query(query, (error, banners) => {
            if (error) {
                console.error('Database error fetching active banners:', error);

                // Return demo data if table doesn't exist yet
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log('Banners table not found, returning demo data');
                    return res.json({
                        success: true,
                        message: 'Using demo data (table not created yet)',
                        demoData: true,
                        count: 2,
                        data: getDemoBanners()
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch banners',
                    error: error.message
                });
            }

            console.log(`Found ${banners.length} active banners`);

            // If no banners found, return empty array
            if (banners.length === 0) {
                return res.json({
                    success: true,
                    message: 'No active banners found',
                    demoData: false,
                    count: 0,
                    data: []
                });
            }

            // Add full URL to image paths
            const bannersWithUrl = banners.map(banner => ({
                id: banner.id,
                title: banner.title,
                description: banner.description,
                image_url: banner.image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                    : null,
                position: banner.position,
                redirect_url: banner.redirect_url,
                discount_tag: banner.discount_tag,
                display_order: banner.display_order,
                status: banner.status,
                created_at: banner.created_at
            }));

            res.json({
                success: true,
                demoData: false,
                count: banners.length,
                data: bannersWithUrl
            });
        });
    } catch (error) {
        console.error('Error fetching active banners:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ GET BANNERS BY POSITION
router.get('/position/:position', async (req, res) => {
    try {
        const { position } = req.params;
        const db = req.db;

        const query = `
            SELECT * FROM banners 
            WHERE position = ? 
            AND status = 'active'
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY display_order ASC
        `;

        db.query(query, [position], (error, banners) => {
            if (error) {
                console.error('Database error fetching banners by position:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch banners',
                    error: error.message
                });
            }

            // Add full URL to image paths
            const bannersWithUrl = banners.map(banner => ({
                ...banner,
                image_url: banner.image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                    : null
            }));

            res.json({
                success: true,
                position: position,
                count: banners.length,
                data: bannersWithUrl
            });
        });
    } catch (error) {
        console.error('Error fetching banners by position:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ==================== ADMIN ROUTES ====================

// ✅ GET ALL BANNERS (Admin - All banners including inactive)
router.get('/admin/all', checkAdmin, async (req, res) => {
    try {
        console.log('Admin fetching all banners...');
        const db = req.db;

        const query = `
            SELECT *, 
                DATE_FORMAT(created_at, '%d-%m-%Y %h:%i %p') as created_at_formatted,
                DATE_FORMAT(updated_at, '%d-%m-%Y %h:%i %p') as updated_at_formatted
            FROM banners 
            ORDER BY display_order ASC, created_at DESC
        `;

        db.query(query, (error, banners) => {
            if (error) {
                console.error('Database error fetching all banners:', error);

                // If table doesn't exist, return empty
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    return res.json({
                        success: true,
                        message: 'Banners table not created yet',
                        statistics: {
                            total: 0,
                            active: 0,
                            inactive: 0,
                            expired: 0
                        },
                        count: 0,
                        data: []
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch banners',
                    error: error.message
                });
            }

            console.log(`Admin found ${banners.length} banners`);

            // Add image URL and status indicator
            const bannersWithStats = banners.map(banner => ({
                ...banner,
                image_url: banner.image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                    : null,
                clicks: banner.clicks || 0,
                impressions: banner.impressions || 0,
                is_live: banner.status === 'active' &&
                    (!banner.start_date || new Date(banner.start_date) <= new Date()) &&
                    (!banner.end_date || new Date(banner.end_date) >= new Date())
            }));

            // Calculate statistics
            const totalBanners = banners.length;
            const activeBanners = banners.filter(b => b.status === 'active').length;
            const inactiveBanners = totalBanners - activeBanners;
            const expiredBanners = banners.filter(b =>
                b.end_date && new Date(b.end_date) < new Date()
            ).length;

            res.json({
                success: true,
                statistics: {
                    total: totalBanners,
                    active: activeBanners,
                    inactive: inactiveBanners,
                    expired: expiredBanners
                },
                count: banners.length,
                data: bannersWithStats
            });
        });
    } catch (error) {
        console.error('Error fetching all banners:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ GET BANNER BY ID (Admin)
router.get('/admin/:id', checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.db;

        const query = `SELECT * FROM banners WHERE id = ?`;

        db.query(query, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch banner',
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            const banner = results[0];
            banner.image_url = banner.image_path
                ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                : null;

            res.json({
                success: true,
                data: banner
            });
        });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ CREATE NEW BANNER (Admin)
router.post('/admin/create', checkAdmin, upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            description,
            position = 'home_top',
            display_order = 0,
            status = 'active',
            start_date,
            end_date,
            redirect_url,
            discount_tag
        } = req.body;

        const db = req.db;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Banner title is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Banner image is required'
            });
        }

        // Validate position
        const validPositions = ['home_top', 'home_middle', 'category_top', 'product_page', 'sidebar'];
        if (!validPositions.includes(position)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid banner position'
            });
        }

        const query = `
            INSERT INTO banners (
                title, description, image_path, position, 
                display_order, status, start_date, end_date, 
                redirect_url, discount_tag, clicks, impressions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
        `;

        const values = [
            title.trim(),
            description ? description.trim() : null,
            req.file.filename,
            position,
            parseInt(display_order) || 0,
            status,
            start_date || null,
            end_date || null,
            redirect_url || null,
            discount_tag || null
        ];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Database error:', error);

                // Delete uploaded file if DB error
                if (req.file && fs.existsSync(path.join(uploadsDir, req.file.filename))) {
                    fs.unlinkSync(path.join(uploadsDir, req.file.filename));
                }

                return res.status(500).json({
                    success: false,
                    message: 'Failed to create banner',
                    error: error.message
                });
            }

            res.json({
                success: true,
                message: 'Banner created successfully!',
                bannerId: result.insertId,
                image_url: `${req.protocol}://${req.get('host')}/uploads/banners/${req.file.filename}`
            });
        });
    } catch (error) {
        console.error('Error creating banner:', error);

        // Delete uploaded file if error
        if (req.file && fs.existsSync(path.join(uploadsDir, req.file.filename))) {
            fs.unlinkSync(path.join(uploadsDir, req.file.filename));
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ UPDATE BANNER (Admin)
router.put('/admin/update/:id', checkAdmin, upload.single('image'), async (req, res) => {
    try {
        const bannerId = req.params.id;
        const updateData = req.body;
        const db = req.db;

        // First get current banner
        const getQuery = `SELECT * FROM banners WHERE id = ?`;

        db.query(getQuery, [bannerId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch banner',
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            const currentBanner = results[0];
            let imagePath = currentBanner.image_path;

            // If new image uploaded, delete old one
            if (req.file) {
                // Delete old image if exists
                if (currentBanner.image_path) {
                    const oldImagePath = path.join(uploadsDir, currentBanner.image_path);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                imagePath = req.file.filename;
            }

            // Prepare update query
            const updateQuery = `
                UPDATE banners SET
                    title = ?,
                    description = ?,
                    image_path = ?,
                    position = ?,
                    display_order = ?,
                    status = ?,
                    start_date = ?,
                    end_date = ?,
                    redirect_url = ?,
                    discount_tag = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const values = [
                updateData.title || currentBanner.title,
                updateData.description !== undefined ? updateData.description : currentBanner.description,
                imagePath,
                updateData.position || currentBanner.position,
                updateData.display_order || currentBanner.display_order,
                updateData.status || currentBanner.status,
                updateData.start_date || currentBanner.start_date,
                updateData.end_date || currentBanner.end_date,
                updateData.redirect_url || currentBanner.redirect_url,
                updateData.discount_tag || currentBanner.discount_tag,
                bannerId
            ];

            db.query(updateQuery, values, (error, result) => {
                if (error) {
                    console.error('Database error:', error);

                    // Delete new uploaded file if DB error
                    if (req.file && fs.existsSync(path.join(uploadsDir, req.file.filename))) {
                        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
                    }

                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update banner',
                        error: error.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Banner updated successfully!'
                });
            });
        });
    } catch (error) {
        console.error('Error updating banner:', error);

        // Delete new uploaded file if error
        if (req.file && fs.existsSync(path.join(uploadsDir, req.file.filename))) {
            fs.unlinkSync(path.join(uploadsDir, req.file.filename));
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ DELETE BANNER (Admin)
router.delete('/admin/delete/:id', checkAdmin, async (req, res) => {
    try {
        const bannerId = req.params.id;
        const db = req.db;

        // First get banner to delete image
        const getQuery = `SELECT * FROM banners WHERE id = ?`;

        db.query(getQuery, [bannerId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch banner',
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            const banner = results[0];

            // Delete image file if exists
            if (banner.image_path) {
                const imagePath = path.join(uploadsDir, banner.image_path);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Delete from database
            const deleteQuery = `DELETE FROM banners WHERE id = ?`;

            db.query(deleteQuery, [bannerId], (error, result) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete banner',
                        error: error.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Banner deleted successfully!'
                });
            });
        });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ TOGGLE BANNER STATUS (Admin)
router.patch('/admin/toggle-status/:id', checkAdmin, async (req, res) => {
    try {
        const bannerId = req.params.id;
        const db = req.db;

        const query = `
            UPDATE banners 
            SET status = CASE 
                WHEN status = 'active' THEN 'inactive' 
                ELSE 'active' 
            END,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.query(query, [bannerId], (error, result) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update banner status',
                    error: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            res.json({
                success: true,
                message: 'Banner status updated!'
            });
        });
    } catch (error) {
        console.error('Error toggling banner status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ✅ BANNER STATISTICS (Admin)
router.get('/admin/statistics', checkAdmin, async (req, res) => {
    try {
        const db = req.db;

        // Get statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN end_date < NOW() THEN 1 ELSE 0 END) as expired
            FROM banners
        `;

        db.query(statsQuery, (error, stats) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch statistics',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: stats[0] || {
                    total: 0,
                    active: 0,
                    inactive: 0,
                    expired: 0
                }
            });
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Helper function for demo data (backup)
function getDemoBanners() {
    return [
        {
            id: 1,
            title: 'Summer Sale 2024',
            description: 'Get up to 50% off on summer collection',
            image_url: null,
            position: 'home_top',
            display_order: 1,
            status: 'active',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: 'New Arrivals',
            description: 'Check out our latest collection',
            image_url: null,
            position: 'home_middle',
            display_order: 2,
            status: 'active',
            created_at: new Date().toISOString()
        }
    ];
}

module.exports = router;