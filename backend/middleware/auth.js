const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

        // Minimal info for all routes
        req.user = {
            id: decoded.userId,      // required for reviews & profile
            email: decoded.email,    // optional, profile route ke liye
        };

        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.status(403).json({ success: false, message: "Invalid or expired token." });
    }
}

module.exports = authenticate;
