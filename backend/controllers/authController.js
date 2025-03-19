const { generateToken } = require('../utils/tokenUtils');
const googleAuthService = require('../services/googleAuthService');
const User = require('../models/User');
const GoogleToken = require('../models/GoogleToken');

const redirectUri = `${process.env.SERVER_URL}/api/auth/google/callback`;

const getGoogleAuthURL = (req, res) => {
    const url = googleAuthService.getGoogleAuthURL(redirectUri);
    res.json({ url });
};

const googleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        // Get user data from Google OAuth
        const { googleId, name, email, picture, accessToken, refreshToken, expiresAt } =
            await googleAuthService.processGoogleCallback(code, redirectUri);

        // Check if the user exists
        let user = await User.findOne({ googleId });

        // If user doesn't exist, create a new one
        if (!user) {
            user = new User({ googleId, name, email, picture });
            await user.save();
        }

        // Save or update tokens in the database
        await GoogleToken.findOneAndUpdate(
            { userId: user._id },
            { accessToken, refreshToken, expiresAt },
            { upsert: true, new: true }
        );

        // Generate JWT for session
        const token = generateToken(user._id);

        // Set the JWT as a cookie with appropriate settings for cross-domain
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-domain redirects
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            path: '/' // Ensure cookie is available on all paths
        });

        // Redirect user to frontend dashboard directly
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);

    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
};


const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//enhance logout function(delete google token from db)
const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
    getGoogleAuthURL,
    googleCallback,
    getCurrentUser,
    logout
};