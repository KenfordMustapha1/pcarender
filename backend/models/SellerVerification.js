const mongoose = require('mongoose');

const SellerVerificationSchema = new mongoose.Schema({
  sellerName: { type: String, required: true },
  email: { type: String, required: true },
  idFileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('SellerVerification', SellerVerificationSchema);
