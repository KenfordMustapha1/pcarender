// models/Follower.js
const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
  followerEmail: { type: String, required: true, index: true },
  sellerEmail: { type: String, required: true, index: true },
  followedAt: { type: Date, default: Date.now }
});

followerSchema.index({ followerEmail: 1, sellerEmail: 1 }, { unique: true });

module.exports = mongoose.model('Follower', followerSchema);