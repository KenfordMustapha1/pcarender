const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SellerSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  frontIdPath: String,
  backIdPath: String,
  selfieIdPath: String,
  isApproved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);