const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  sellerName: String,
  email: String,
  idFileUrl: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Verification', VerificationSchema);
