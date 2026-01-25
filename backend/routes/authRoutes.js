// const express = require('express');
// const router = express.Router();
// const { authenticate, verifyTokenOnly, attachUserIfExists } = require('../middleware/auth');
// const generateJWT = require('../utils/generateJWT');

// // ✅ IMPORTANT: Token verify करने का API (Frontend के लिए)
// // यह API सिर्फ token check करता है, कोई data return नहीं करता
// router.get('/verify-token', (req, res) => {
//     return verifyTokenOnly(req, res);
// });

// // ✅ Token refresh का API (Optional)
// router.post('/refresh-token', (req, res) => {
//     try {
//         const { refreshToken } = req.body;

//         if (!refreshToken) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Refresh token required'
//             });
//         }

//         // Verify refresh token (अलग secret use कर सकते हैं)
//         const decoded = jwt.verify(
//             refreshToken,
//             process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
//         );

//         // New access token generate करें
//         const newAccessToken = generateJWT({
//             userId: decoded.userId || decoded.id,
//             email: decoded.email,
//             name: decoded.name
//         });

//         res.json({
//             success: true,
//             token: newAccessToken,
//             expiresIn: '24h'
//         });

//     } catch (error) {
//         console.error('Refresh token error:', error);

//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Refresh token expired',
//                 expired: true
//             });
//         }

//         res.status(403).json({
//             success: false,
//             message: 'Invalid refresh token'
//         });
//     }
// });

// // ✅ Validate और User Info देने का API
// router.get('/validate', authenticate, (req, res) => {
//     try {
//         // Database se user details fetch karo (agar chahiye toh)
//         // const userDetails = await User.findById(req.user.id);

//         res.json({
//             success: true,
//             authenticated: true,
//             user: req.user,
//             session: {
//                 expiresAt: req.user.exp * 1000,
//                 timeRemaining: req.user.exp - Math.floor(Date.now() / 1000)
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// // ✅ Logout endpoint (Frontend se localStorage clear करने के लिए)
// router.post('/logout', authenticate, (req, res) => {
//     // Server side agar blacklist maintain karna ho toh yahan karo
//     res.json({
//         success: true,
//         message: 'Logged out successfully'
//     });
// });

// // ✅ Check session status (Public route)
// router.get('/session-status', attachUserIfExists, (req, res) => {
//     if (req.user) {
//         res.json({
//             authenticated: true,
//             user: req.user
//         });
//     } else {
//         res.json({
//             authenticated: false,
//             message: 'No active session'
//         });
//     }
// });

// module.exports = router;