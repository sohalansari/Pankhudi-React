const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1]; // Authorization: Bearer <token>
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            req.user = decoded; // decoded should include user info like id
            next();
        });
    } catch (error) {
        console.error("verifyToken error:", error);
        res.status(500).json({ message: "Internal server error in token verification" });
    }
};
