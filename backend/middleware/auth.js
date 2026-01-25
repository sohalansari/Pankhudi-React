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











// const jwt = require("jsonwebtoken");

// // ===============================
// // @desc    Main authentication middleware
// // @route   All protected routes
// // ===============================
// function authenticate(req, res, next) {
//     try {
//         const authHeader = req.headers["authorization"] || req.headers["Authorization"];

//         // Check if token exists
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Access denied. No token provided.",
//                 code: "NO_TOKEN"
//             });
//         }

//         const token = authHeader.split(" ")[1];

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

//         // Attach user info to request
//         req.user = {
//             id: decoded.userId || decoded.id,
//             email: decoded.email,
//             name: decoded.name || "",
//             exp: decoded.exp // Token expiry timestamp
//         };

//         req.token = token; // Attach token to request

//         // Add token expiry check (optional - log for debugging)
//         const currentTime = Math.floor(Date.now() / 1000);
//         if (decoded.exp && decoded.exp < currentTime) {
//             console.warn("⚠️ Token expired but passed verification somehow");
//         }

//         next();

//     } catch (err) {
//         console.error("Auth Middleware Error:", err.message);

//         // Handle different error types
//         if (err.name === "TokenExpiredError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Session expired. Please login again.",
//                 code: "TOKEN_EXPIRED",
//                 expired: true
//             });
//         }

//         if (err.name === "JsonWebTokenError") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Invalid token.",
//                 code: "INVALID_TOKEN"
//             });
//         }

//         // Other errors
//         return res.status(403).json({
//             success: false,
//             message: "Authentication failed.",
//             code: "AUTH_FAILED"
//         });
//     }
// }

// // ===============================
// // @desc    Optional authentication (for public routes with optional auth)
// // @route   Public routes
// // ===============================
// function optionalAuthenticate(req, res, next) {
//     try {
//         const authHeader = req.headers["authorization"] || req.headers["Authorization"];

//         if (authHeader && authHeader.startsWith("Bearer ")) {
//             const token = authHeader.split(" ")[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

//             req.user = {
//                 id: decoded.userId || decoded.id,
//                 email: decoded.email,
//                 name: decoded.name || ""
//             };
//             req.token = token;
//             req.isAuthenticated = true;
//         } else {
//             req.isAuthenticated = false;
//         }
//     } catch (err) {
//         // Silent fail - don't throw error for optional auth
//         req.isAuthenticated = false;
//     }

//     next();
// }

// // ===============================
// // @desc    Admin check middleware
// // @route   Admin routes
// // ===============================
// function checkAdmin(req, res, next) {
//     // First authenticate
//     const authHeader = req.headers["authorization"] || req.headers["Authorization"];

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({
//             success: false,
//             message: "Access denied. No token provided."
//         });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

//         // Check if user is admin (modify based on your user structure)
//         if (!decoded.isAdmin && decoded.role !== 'admin') {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access denied. Admin privileges required."
//             });
//         }

//         req.user = {
//             id: decoded.userId || decoded.id,
//             email: decoded.email,
//             isAdmin: true,
//             role: decoded.role
//         };

//         next();
//     } catch (err) {
//         console.error("Admin Auth Error:", err.message);
//         return res.status(403).json({
//             success: false,
//             message: "Authentication failed."
//         });
//     }
// }

// // ===============================
// // @desc    Get user from token (without throwing error)
// // @route   For token verification API
// // ===============================
// function getUserFromToken(token) {
//     try {
//         if (!token) return null;

//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
//         return {
//             id: decoded.userId || decoded.id,
//             email: decoded.email,
//             name: decoded.name || "",
//             exp: decoded.exp
//         };
//     } catch (err) {
//         return null;
//     }
// }

// // ===============================
// // @desc    Verify token only (for API verification)
// // @route   GET /api/verify-token
// // ===============================
// function verifyTokenOnly(req, res) {
//     try {
//         const authHeader = req.headers["authorization"] || req.headers["Authorization"];

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.json({
//                 valid: false,
//                 authenticated: false,
//                 message: "No token provided"
//             });
//         }

//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

//         // Check token expiry
//         const currentTime = Math.floor(Date.now() / 1000);
//         const expiresIn = decoded.exp - currentTime;

//         return res.json({
//             valid: true,
//             authenticated: true,
//             user: {
//                 id: decoded.userId || decoded.id,
//                 email: decoded.email,
//                 name: decoded.name || ""
//             },
//             expiresAt: decoded.exp * 1000, // Convert to milliseconds
//             expiresIn: expiresIn > 0 ? expiresIn : 0 // Seconds remaining
//         });

//     } catch (err) {
//         console.error("Token verification error:", err.message);

//         if (err.name === "TokenExpiredError") {
//             return res.json({
//                 valid: false,
//                 authenticated: false,
//                 expired: true,
//                 message: "Token has expired"
//             });
//         }

//         return res.json({
//             valid: false,
//             authenticated: false,
//             message: "Invalid token"
//         });
//     }
// }

// // ===============================
// // Export all middleware functions
// // ===============================
// module.exports = {
//     authenticate,
//     optionalAuthenticate,
//     checkAdmin,
//     getUserFromToken,
//     verifyTokenOnly
// };