const jwt = require('jsonwebtoken');
const GoogleToken = require('../models/GoogleToken');

// Generate JWT token for authenticated users
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

// Check if user's Google tokens are valid
const validateGoogleTokens = async (userId) => {
    const tokenRecord = await GoogleToken.findOne({ userId });

    if (!tokenRecord) {
        return false;
    }

    // Check if access token is expired
    if (new Date() >= tokenRecord.expiresAt) {
        // If no refresh token, user needs to re-authenticate
        if (!tokenRecord.refreshToken) {
            return false;
        }

        try {
            // Try to refresh the token
            const googleAuthService = require('../services/googleAuthService');
            await googleAuthService.refreshGoogleToken(userId);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    return true;
};

module.exports = {
    generateToken,
    verifyToken,
    validateGoogleTokens
};