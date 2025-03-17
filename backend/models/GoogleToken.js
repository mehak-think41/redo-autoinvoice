const mongoose = require('mongoose');

const GoogleTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Automatically delete expired tokens
GoogleTokenSchema.statics.cleanupExpiredTokens = async function () {
    await this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('GoogleToken', GoogleTokenSchema);
