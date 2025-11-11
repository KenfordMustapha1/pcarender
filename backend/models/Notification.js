  // models/Notification.js
  const mongoose = require('mongoose');

  const notificationSchema = new mongoose.Schema({
    userEmail: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'product_approved',
        'product_rejected',
        'seller_submitted',
        'seller_approved',
        'seller_rejected',
        'info'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  module.exports = mongoose.model('Notification', notificationSchema);