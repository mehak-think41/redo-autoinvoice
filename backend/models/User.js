const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  picture: { type: String, default: '' },
  googleId: { type: String, unique: true, sparse: true },
  watchLive: { type: Boolean, default: false },
  watchExpiry: Date,
  lastHistoryId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
