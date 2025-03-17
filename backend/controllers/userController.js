const User = require('../models/User');
const googleAuthService = require('../services/googleAuthService');
const EmailLog = require('../models/EmailLog'); // Import the schema
const { google } = require('googleapis');
const GoogleToken = require('../models/GoogleToken');
const { processInvoice } = require('./docController');

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_ID, // Replace with your actual access key
  secretAccessKey: process.env.AWS_SECRET_ID, // Replace with your actual secret key
  region: 'ap-south-1',
});


const getGmailInbox = async (req, res) => {
  try {
    const userId = req.user._id;
    const emails = await googleAuthService.getLatestEmails(userId);

    res.json({ success: true, emails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const watchLive = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.watchLive) {
      // Deactivate live watch
      await googleAuthService.stopGmailWatch(userId);
      user.watchLive = false;
      await user.save();
      console.log(`Stopped Gmail watch for user: ${user._id} (${user.name})`);
      return res.json({ success: true, message: 'Gmail live tracking deactivated' });
    }

    // Activate live watch
    const result = await googleAuthService.watchGmailInbox(userId);
    user.watchLive = true;
    await user.save();
    console.log(`Activated Gmail watch for user: ${user._id} (${user.name})`);
    return res.json({ success: true, message: 'Gmail live tracking activated', data: result });
  } catch (error) {
    console.error('Error toggling Gmail live watch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const getOAuth2Client = (redirectUri) => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

const getGmailInboxLive = async (req, res) => {
  res.status(200).send('OK'); // Acknowledge request immediately

  try {
    const { message } = req.body;
    if (!message || !message.data) {
      console.warn('Invalid message received:', req.body);
      return;
    }

    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8');
    const emailData = JSON.parse(decodedData);
    const { emailAddress, historyId } = emailData;

    const user = await User.findOne({ email: emailAddress });
    if (!user) {
      console.warn('User not found for email:', emailAddress);
      return;
    }

    const fullEmail = await googleAuthService.fetchFullEmail(user._id, historyId);
    if (!fullEmail) {
      console.warn('No email content found.');
      return;
    }
    let emailBody = '';

    const headers = fullEmail.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
    const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date';

    const attachments = [];
    if (fullEmail.payload.parts) {
      for (const part of fullEmail.payload.parts) {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            attachmentId: part.body.attachmentId,
          });
        }
      }
    }

    let s3Links = [];
    userID = user._id

    let tokenRecord = await GoogleToken.findOne({ userId: userID });

    if (!tokenRecord) throw new Error('No Google token found for this user');

    if (new Date() >= tokenRecord.expiresAt) {
      if (!tokenRecord.refreshToken) throw new Error('Google session expired, please login again');
      await refreshGoogleToken(userID);
      tokenRecord = await GoogleToken.findOne({ userId: userID });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: tokenRecord.accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    if (attachments.length > 0) {

      for (const attachment of attachments) {
        const attachmentData = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: fullEmail.id,
          id: attachment.attachmentId,
        });

        const fileBuffer = Buffer.from(attachmentData.data.data, 'base64');

        const s3Key = `gmail_attachments/${Date.now()}_${attachment.filename}`;

        const params = {
          Bucket: 'demo-auto-invoice', // Your S3 bucket name
          Key: s3Key, // File path in S3
          Body: fileBuffer,
          ContentType: attachment.mimeType,
        };

        const uploadResult = await s3.upload(params).promise();
        // Save S3 link
        s3Links.push({ filename: attachment.filename, url: uploadResult.Location });
      }
    } else {
      console.log('No attachments found.');
    }

    const rawEmail = await gmail.users.messages.get({
      userId: 'me',
      id: fullEmail.id,
      format: 'raw',
    });

    if (rawEmail.data.raw) {
      const decodedRawEmail = Buffer.from(rawEmail.data.raw, 'base64').toString('utf-8');
      emailBody = decodedRawEmail;
    }

    if (emailBody == "" || emailBody == " " || emailBody == null) {
      emailBody = fullEmail.snippet
    }

    // Save email data and S3 links in MongoDB
    const emailRecord = new EmailLog({
      userId: user._id,
      emailAddress,
      subject,
      date,
      body: emailBody,
      s3Links,
    });

    await emailRecord.save();
    console.log('Email data and attachments saved to database.');

    // supports only single file, update it
    const result = await processInvoice(s3Links[0].url, user._id, emailRecord._id);


  } catch (error) {
    console.error('Error handling Gmail webhook:', error);
  }
};

module.exports = {
  getGmailInbox,
  getGmailInboxLive,
  watchLive
};