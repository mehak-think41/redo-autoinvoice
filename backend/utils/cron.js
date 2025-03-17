const cron = require('node-cron');
const User = require('../models/User');
const { watchGmailInbox } = require('./services/googleAuthService');

// Daily check for expiring watches
cron.schedule('0 0 * * *', async () => {
    const expiringSoon = new Date(Date.now() + 86400000); // 24h before expiry

    const users = await User.find({
        watchLive: true,
        watchExpiry: { $lte: expiringSoon }
    });

    users.forEach(async (user) => {
        try {
            await watchGmailInbox(user._id);
            console.log(`Renewed watch for ${user.email}`);
        } catch (error) {
            console.error(`Failed to renew watch for ${user.email}:`, error);
        }
    });
});
