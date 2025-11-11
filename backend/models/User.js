const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationCodeExpiry: {
    type: Date
  },
  // ✅ Added fields for password reset
  resetCode: {
    type: String
  },
  resetCodeExpiry: {
    type: Number
  }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

module.exports = mongoose.model('User', UserSchema);