const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();

// Add item to cart
router.post('/api/cart', cartController.addToCart);

// Get all cart items for a user
router.get('/api/cart/:userId', cartController.getCartItems);

// Optional: update and delete routes
router.put('/api/cart/:id', cartController.updateCartItem);
router.delete('/api/cart/:id', cartController.deleteCartItem);

module.exports = router;
