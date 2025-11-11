import React from 'react';
import { useCart } from './CartContext'; // ✅ Destructured import
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // ✅ Call the hook

  const handleAddToCart = () => {
    const selectedSize = 'Default';
    const price = product.sizes[selectedSize] || 0;

    addToCart({
      name: product.name,
      image: product.image,
      price: price,
      selectedSize: selectedSize,
      quantity: 1,
    });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h4>{product.name}</h4>
      <p>₱{price.toFixed(2)}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;