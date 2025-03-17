const { verifyToken, validateGoogleTokens } = require('../utils/tokenUtils');

// Middleware to authenticate JWT token
const auth = async (req, res, next) => {
    // Get token from cookie or Authorization header
    const token = req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ?
            req.headers.authorization.split(' ')[1] : null);

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
        return res.status(401).json({ message: 'Token is not valid', error });
    }

    // Check if Google tokens are still valid
    const googleTokensValid = await validateGoogleTokens(decoded.id);

    if (!googleTokensValid) {
        return res.status(401).json({
            message: 'Google authentication expired',
            googleAuthRequired: true
        });
    }

    // Add user to request
    req.user = { _id: decoded.id };
    next();
};

module.exports = {
    auth
};