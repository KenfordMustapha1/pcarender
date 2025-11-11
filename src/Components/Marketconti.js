// src/Components/Marketconti.js
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from './CartContext';
import './Marketconti.css';

function Marketconti() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [stockError, setStockError] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  // Get current user's email from localStorage
  const currentUserEmail = localStorage.getItem('email')?.trim() || null;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 10000);
    const handleInventoryUpdate = () => fetchProducts();
    window.addEventListener('inventoryUpdate', handleInventoryUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('inventoryUpdate', handleInventoryUpdate);
    };
  }, [fetchProducts]);

  const filteredProducts = products
    .filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !product.hidden // 👈 Only show non-hidden products
    );

  const handleProductClick = (product) => {
    if (!product || !product.sizes || Object.keys(product.sizes).length === 0) return;
    setSelectedProduct(product);
    const sizes = Object.keys(product.sizes);
    setSelectedSize(sizes[0]);
    setQuantity(1);
    setStockError('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Check if the current user is the seller of this product
    if (currentUserEmail && selectedProduct.store.toLowerCase() === currentUserEmail.toLowerCase()) {
        setToastMessage("You cannot add your own product to the cart.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return; // Exit the function if the user is the seller
    }

    if (quantity > selectedProduct.quantity) {
      setStockError(`Only ${selectedProduct.quantity} in stock`);
      return;
    }

    const item = {
      name: selectedProduct.name,
      image: selectedProduct.image,
      price: selectedProduct.sizes[selectedSize],
      selectedSize,
      quantity,
      store: selectedProduct.store, // This is the seller's email
      stock: selectedProduct.quantity,
    };

    addToCart(item);
    setToastMessage(`${quantity} × ${selectedProduct.name} (${selectedSize}) added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setSelectedProduct(null);
    setQuantity(1);
    setStockError('');
  };

  const handleIncreaseQuantity = () => {
    if (quantity < selectedProduct.quantity) {
      setQuantity(q => q + 1);
      setStockError('');
    } else {
      setStockError(`Maximum ${selectedProduct.quantity} allowed`);
    }
  };

  const handleDecreaseQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
    if (quantity > 1) setStockError('');
  };

  return (
    <div className="marketplace-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Amazing Products</h1>
          <p className="hero-subtitle">Shop fresh, local, and sustainable goods from trusted sellers</p>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="products-grid">
        {loading ? (
          <div className="loading-container">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line long"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No products found</h3>
            <p>Try different search terms or browse our categories</p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <ProductCard key={index} product={product} onClick={handleProductClick} />
          ))
        )}
      </div>

      {/* FIXED MODAL STRUCTURE */}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)} aria-label="Close">
              ✕
            </button>

            <div className="modal-content-wrapper">
              <div className="modal-image-section">
                <img
                  src={`http://localhost:5000/uploads/${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'}
                />
              </div>

              <div className="modal-info-section">
                <h2 className="modal-product-title">{selectedProduct.name}</h2>
                <p className="modal-description">{selectedProduct.description}</p>

                <div className="product-meta-section">
                  <div className="meta-item">
                    <span className="meta-label">Store</span>
                    <button
                      className="store-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/store/${encodeURIComponent(selectedProduct.store)}`;
                      }}
                    >
                      {selectedProduct.store}
                    </button>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Availability</span>
                    <span className={`stock-status ${selectedProduct.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {selectedProduct.quantity > 0 ? `${selectedProduct.quantity} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="product-options">
                  <div className="option-group">
                    <label className="option-label">Size</label>
                    <div className="size-options">
                      {Object.keys(selectedProduct.sizes).map((size) => (
                        <button
                          key={size}
                          className={`size-option ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                          disabled={selectedProduct.quantity <= 0}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="option-group">
                    <label className="option-label">Quantity</label>
                    <div className="quantity-selector">
                      <button
                        className="quantity-btn"
                        onClick={handleDecreaseQuantity}
                        disabled={quantity <= 1 || selectedProduct.quantity <= 0}
                      >
                        −
                      </button>
                      <span className="quantity-value">{quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={handleIncreaseQuantity}
                        disabled={quantity >= selectedProduct.quantity || selectedProduct.quantity <= 0}
                      >
                        +
                      </button>
                    </div>
                    {stockError && <div className="error-message">{stockError}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* FIXED FOOTER - ALWAYS VISIBLE */}
            <div className="modal-footer">
              <div className="price-section">
                <span className="total-label">Total:</span>
                <span className="total-price">
                  ₱{(selectedProduct.sizes[selectedSize] * quantity).toFixed(2)}
                </span>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={selectedProduct.quantity <= 0}
              >
                {selectedProduct.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast-notification">
          <div className="toast-icon">⚠️</div> {/* Changed icon for user error */}
          <div className="toast-message">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}

const ProductCard = ({ product, onClick }) => {
  const firstPrice = Object.values(product.sizes || {})[0] || 0;
  const stockStatus = product.quantity > 10 ? 'in-stock' :
                     product.quantity > 0 ? 'low-stock' : 'out-of-stock';

  return (
    <div className={`product-card ${stockStatus}`} onClick={() => onClick(product)} role="button" tabIndex={0}>
      <div className="product-badge">
        {stockStatus === 'low-stock' && 'Low Stock'}
        {stockStatus === 'out-of-stock' && 'Out of Stock'}
      </div>
      <div className="product-image-container">
        <img
          src={`http://localhost:5000/uploads/${product.image}`}
          alt={product.name}
          onError={(e) => e.target.src = '  https://via.placeholder.com/300x300?text=No+Image'}
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-meta">
          <span className="product-store">{product.store}</span>
          <span className="product-rating">★★★★☆</span>
        </div>
        <div className="product-price">₱{firstPrice.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default Marketconti;