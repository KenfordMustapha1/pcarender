const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  userId: String,
  productName: String,
  selectedSize: String,
  quantity: Number,
  price: Number,
  store: String,
  image: String,
});

module.exports = mongoose.model('CartItem', CartItemSchema);