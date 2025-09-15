const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ MySQL connection

// 📊 Get Admin Reports
router.get("/", async (req, res) => {
    try {
        const reportData = {};

        // ---- Users ----
        const [totalUsers] = await db.promise().query("SELECT COUNT(*) AS totalUsers FROM users");
        reportData.totalUsers = totalUsers[0].totalUsers;

        const [activeUsers] = await db.promise().query("SELECT COUNT(*) AS activeUsers FROM users WHERE is_active=1");
        reportData.activeUsers = activeUsers[0].activeUsers;

        const [premiumUsers] = await db.promise().query("SELECT COUNT(*) AS premiumUsers FROM users WHERE is_premium=1");
        reportData.premiumUsers = premiumUsers[0].premiumUsers;

        const [verifiedUsers] = await db.promise().query("SELECT COUNT(*) AS verifiedUsers FROM users WHERE is_verified=1");
        reportData.verifiedUsers = verifiedUsers[0].verifiedUsers;

        // ---- Products ----
        const [totalProducts] = await db.promise().query("SELECT COUNT(*) AS totalProducts FROM products");
        reportData.totalProducts = totalProducts[0].totalProducts;

        const [activeProducts] = await db.promise().query("SELECT COUNT(*) AS activeProducts FROM products WHERE status='Active'");
        reportData.activeProducts = activeProducts[0].activeProducts;

        const [inactiveProducts] = await db.promise().query("SELECT COUNT(*) AS inactiveProducts FROM products WHERE status='Inactive'");
        reportData.inactiveProducts = inactiveProducts[0].inactiveProducts;

        const [lowStockProducts] = await db.promise().query("SELECT COUNT(*) AS lowStockProducts FROM products WHERE stock < 5");
        reportData.lowStockProducts = lowStockProducts[0].lowStockProducts;

        // ---- 📈 User Growth (last 12 months logins) ----
        const [userGrowth] = await db.promise().query(`
            SELECT 
             DATE_FORMAT(created_at, '%b') AS month,
             COUNT(*) AS users
             FROM users
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY MIN(created_at);

        `);

        // Ensure all 12 months appear (even if 0 users in some months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = new Date().getMonth(); // 0-11
        const last12 = Array.from({ length: 12 }, (_, i) => {
            let m = (currentMonth - 11 + i + 12) % 12;
            return months[m];
        });

        reportData.userGrowth = last12.map(month => {
            const found = userGrowth.find(row => row.month === month);
            return { month, users: found ? found.users : 0 };
        });

        // ✅ Final response
        res.json({ success: true, data: reportData });

    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
