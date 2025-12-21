// backend/routes/banner.js
const express = require('express');
const router = express.Router();

// 📌 GET ALL BANNERS (आपके Home.jsx के लिए compatible)
router.get('/', async (req, res) => {
    try {
        // req.db का उपयोग करें (आपके server.js में set किया गया है)
        const query = `
            SELECT * FROM banners 
            WHERE status = 'active' 
            ORDER BY display_order ASC
        `;

        req.db.query(query, (error, banners) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error',
                    error: error.message
                });
            }

            // Format को Home.jsx के according करें
            const formattedBanners = banners.map(banner => ({
                id: banner.id,
                image: banner.image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                    : 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80',
                title: banner.title,
                subtitle: banner.description || '',
                link: banner.redirect_url || '/',
                buttonText: 'Shop Now',
                theme: banner.position || 'home_top',
                discount: banner.discount_tag || ''
            }));

            res.json(formattedBanners);
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json([]);
    }
});

// 📌 GET ACTIVE BANNERS (Alternative endpoint)
router.get('/active', async (req, res) => {
    try {
        const query = `
            SELECT * FROM banners 
            WHERE status = 'active' 
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY display_order ASC
        `;

        req.db.query(query, (error, banners) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            const formattedBanners = banners.map(banner => ({
                ...banner,
                image_url: banner.image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                    : null
            }));

            res.json({
                success: true,
                count: banners.length,
                data: formattedBanners
            });
        });
    } catch (error) {
        console.error('Error fetching active banners:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 📌 GET BANNERS BY POSITION
router.get('/position/:position', async (req, res) => {
    try {
        const { position } = req.params;

        const query = `
            SELECT * FROM banners 
            WHERE position = ? 
            AND status = 'active'
            ORDER BY display_order ASC
        `;

        req.db.query(query, [position], (error, banners) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            const formattedBanners = banners.map(banner => ({
                ...banner,
                image_url: banner.image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/banners/${banner.image_path}`
                    : null
            }));

            res.json({
                success: true,
                position: position,
                count: banners.length,
                data: formattedBanners
            });
        });
    } catch (error) {
        console.error('Error fetching banners by position:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 📌 GET BANNER BY ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT * FROM banners 
            WHERE id = ? AND status = 'active'
        `;

        req.db.query(query, [req.params.id], (error, banners) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (banners.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            const banner = banners[0];
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
            message: 'Server error'
        });
    }
});

module.exports = router;