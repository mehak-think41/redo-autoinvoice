const mongoose = require('mongoose');

const EmailLog = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emailAddress: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: String, required: true },
    body: { type: String, requied: true },
    s3Links: [{ filename: String, url: String }], // Array to store S3 URLs of attachments
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', EmailLog);
