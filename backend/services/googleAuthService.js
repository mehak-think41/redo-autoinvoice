const { google } = require('googleapis');
const User = require('../models/User');
const GoogleToken = require('../models/GoogleToken');

// Configure OAuth2 client
const getOAuth2Client = (redirectUri) => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );
};

// Get Google authentication URL
const getGoogleAuthURL = (redirectUri) => {
    const oauth2Client = getOAuth2Client(redirectUri);

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify' // Gmail read access
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Force to get refresh token
        scope: scopes
    });
};

// Process Google callback and get tokens
const processGoogleCallback = async (code, redirectUri) => {
    const oauth2Client = getOAuth2Client(redirectUri);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const userInfoResponse = await people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,photos'
    });

    const userInfo = userInfoResponse.data;
    const email = userInfo.emailAddresses[0].value;
    const name = userInfo.names[0].displayName;
    const picture = userInfo.photos[0].url;
    const googleId = userInfo.resourceName.split('/')[1];

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
        // Create new user
        user = new User({
            email,
            name,
            picture,
            googleId
        });
    } else {
        // Update existing user
        user.name = name;
        user.picture = picture;
        user.googleId = googleId;
        user.lastLogin = new Date();
    }

    await user.save();

    // Save Google tokens
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expiry_date);

    await GoogleToken.findOneAndUpdate(
        { userId: user._id },
        {
            userId: user._id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined, // Only update if provided
            expiresAt: expiryDate
        },
        { upsert: true, new: true }
    );

    return user;
};

// Refresh Google access token
const refreshGoogleToken = async (userId) => {
    const tokenRecord = await GoogleToken.findOne({ userId });

    if (!tokenRecord || !tokenRecord.refreshToken) {
        throw new Error('No refresh token available');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
        refresh_token: tokenRecord.refreshToken
    });

    try {
        const { tokens } = await oauth2Client.refreshAccessToken();
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expiry_date);

        // Update token in database
        await GoogleToken.findOneAndUpdate(
            { userId },
            {
                accessToken: tokens.access_token,
                expiresAt: expiryDate,
                refreshToken: tokens.refresh_token || tokenRecord.refreshToken
            },
            { new: true }
        );

        return true;
    } catch (error) {
        console.error('Failed to refresh Google token:', error);
        throw new Error('Failed to refresh token');
    }
};

// Execute authenticated Google API request
const executeGoogleApiRequest = async (userId, apiFunction) => {
    let tokenRecord = await GoogleToken.findOne({ userId });

    if (!tokenRecord) {
        throw new Error('No Google token found for this user');
    }

    // Check if token is expired and refresh if needed
    if (new Date() >= tokenRecord.expiresAt) {
        if (!tokenRecord.refreshToken) {
            throw new Error('Google session expired, please login again');
        }

        await refreshGoogleToken(userId);
        tokenRecord = await GoogleToken.findOne({ userId });
    }

    // Create authenticated client
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
        access_token: tokenRecord.accessToken
    });

    // Execute the provided API function with the authenticated client
    return await apiFunction(oauth2Client);
};

const watchGmailInbox = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.watchLive) throw new Error('Watch already active');


    let tokenRecord = await GoogleToken.findOne({ userId });
    if (!tokenRecord) throw new Error('No Google token found for this user');

    if (new Date() >= tokenRecord.expiresAt) {
        if (!tokenRecord.refreshToken) throw new Error('Google session expired, please login again');
        await refreshGoogleToken(userId);
        tokenRecord = await GoogleToken.findOne({ userId });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: tokenRecord.accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        await stopGmailWatch(userId);

        const response = await gmail.users.watch({
            userId: 'me',
            requestBody: {
                topicName: `projects/${process.env.GCP_PROJECT_ID}/topics/${process.env.GMAIL_PUBSUB_TOPIC}`,
                labelIds: ['INBOX'],
                labelFilterBehavior: 'INCLUDE'
            }
        });

        await User.findByIdAndUpdate(userId, {
            watchLive: true,
            watchExpiry: new Date(Date.now() + 604800000) // 7 days
        });

        return response.data;
    } catch (error) {
        console.error('Error setting up Gmail watch:', error);
        throw new Error('Failed to watch Gmail inbox');
    }
};

const stopGmailWatch = async (userId) => {
    const user = await User.findById(userId);
    if (!user || !user.watchLive) return { success: true }; // Already inactive


    let tokenRecord = await GoogleToken.findOne({ userId });
    if (!tokenRecord) throw new Error('No Google token found for this user');

    if (new Date() >= tokenRecord.expiresAt) {
        if (!tokenRecord.refreshToken) throw new Error('Google session expired, please login again');
        await refreshGoogleToken(userId);
        tokenRecord = await GoogleToken.findOne({ userId });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: tokenRecord.accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    try {

        await gmail.users.stop({ userId: 'me' });
        await User.findByIdAndUpdate(userId, {
            watchLive: false,
            watchExpiry: null
        });

        return { success: true, message: 'Live tracking stopped' };
    } catch (error) {
        console.error('Error stopping watch:', error);
        throw new Error('Failed to deactivate live tracking');
    }

};

const fetchFullEmail = async (userId, historyId) => {
    let tokenRecord = await GoogleToken.findOne({ userId });

    if (!tokenRecord) throw new Error('No Google token found for this user');

    if (new Date() >= tokenRecord.expiresAt) {
        if (!tokenRecord.refreshToken) throw new Error('Google session expired, please login again');
        await refreshGoogleToken(userId);
        tokenRecord = await GoogleToken.findOne({ userId });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: tokenRecord.accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const messages = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 1, // Only fetch the most recent email
        });

        if (!messages.data.messages || messages.data.messages.length === 0) {
            throw new Error('No recent emails found');
        }

        const messageId = messages.data.messages[0].id;

        // Fetch full email details
        const emailDetails = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        return emailDetails.data;

    } catch (error) {
        console.error('Error fetching email:', error);
        throw new Error('Failed to fetch email details');
    }
};

module.exports = {
    getGoogleAuthURL,
    processGoogleCallback,
    refreshGoogleToken,
    executeGoogleApiRequest,
    watchGmailInbox,
    stopGmailWatch,
    fetchFullEmail
};