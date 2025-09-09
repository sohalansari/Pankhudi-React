const jwt = require('jsonwebtoken');

function generateJWT(payload) {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    return jwt.sign(payload, secret, { expiresIn: '2h' });
}

module.exports = generateJWT;
