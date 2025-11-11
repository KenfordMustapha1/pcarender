const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  store: String,
  quantity: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,
    default: 0
  },
  image: String,
  sizes: {
    type: Map,
    of: Number,
    default: {}
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  hidden: {
    type: Boolean,
    default: false
  },
  buyers: [{
    buyerEmail: String,
    buyerName: String,
    quantityBought: Number,
    totalSpent: Number,
    purchaseDate: Date,
    lastPurchase: Date,
    paymentMethod: String,
    selectedSize: String  // ✅ ADD THIS LINE
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);