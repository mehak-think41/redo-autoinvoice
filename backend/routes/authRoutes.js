const express = require('express');
const router = express.Router();
const { getGoogleAuthURL, googleCallback, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Google Auth Routes
router.get('/google/url', getGoogleAuthURL);
router.get('/google/callback', googleCallback);

// Get current user
router.get('/me', auth, getCurrentUser);

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: "Logged out" });
});

module.exports = router;