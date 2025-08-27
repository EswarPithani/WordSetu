// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔍 DEBUG: Log what's in the token
        console.log('🔍 Decoded token:', decoded);
        console.log('🔍 User ID from token:', decoded.id);

        // ✅ Set both for compatibility
        req.user = { id: decoded.id };
        req.userId = decoded.id;

        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};