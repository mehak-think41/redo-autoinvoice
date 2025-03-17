const express = require('express');
const router = express.Router();
const { getGmailInbox, getGmailInboxLive, watchLive } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.post('/google/webhook', getGmailInboxLive);

// Protect all routes in this router
router.use(auth);

router.get('/google/gmail', getGmailInbox);

router.post('/watchlive', watchLive);

module.exports = router;