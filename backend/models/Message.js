// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String },
  imageUrl: { type: String }, // For image messages
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  read: { type: Boolean, default: false }, // Add this field
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);