// MarketPage.js - Replace your existing Market component with this code
// Current actual time: Tuesday, November 11, 2025

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './MarketPage.css';

// Keep your banner imports
import banner1 from '../images/market-pic/caro-main2.jpg';
import banner2 from '../images/market-pic/caro-main1.jpg';
import banner3 from '../images/market-pic/caro-main3.jpg';

function Market() {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      // Filter approved products and sort by sold quantity
      const approved = data.filter(p => p.status === 'Approved' && !p.hidden);
      const sorted = approved.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      
      // Get top 6 trending products
      setTrendingProducts(sorted.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch trending products:', err);
      setTrendingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const bannerItems = [
    { img: banner1, caption: "Fresh Coconut Product – Naturally Fermented" },
    { img: banner2, caption: "Premium Coconut Oil for a Healthier Life" },
    { img: banner3, caption: "Fresh Coconut Yogurt" }
  ];

  const goToMarketconti = () => {
    navigate('/marketconti');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const goToStore = (storeEmail) => {
    // --- CORRECTED LINE ---
    navigate(`/store/${encodeURIComponent(storeEmail)}`);
    closeModal();
  };

  return (
    <div className="market-container">
      {/* Banner Carousel Section */}
      <div className="carousel-section-wrapper">
        <div className="top-banner">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            showIndicators={true}
            interval={3000}
          >
            {bannerItems.map((item, index) => (
              <div key={index} className="banner-slide">
                <img src={item.img} alt={`Slide ${index + 1}`} className="banner-image" />
                <p className="carousel-caption">{item.caption}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Categories Header */}
      <div className="categories-header-container">
        <div className="categories-header">
          <h2 className="categories-title">🔥 Trending Products</h2>
          <button className="show-more" onClick={goToMarketconti}>
            View All Products →
          </button>
        </div>
      </div>

      {/* Trending Products Scroll */}
      <div className="categories-scroll-container">
        {loading ? (
          <div className="loading-trending">
            <div className="loading-spinner"></div>
            <p>Loading trending products...</p>
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="empty-trending">
            <p>No trending products available at the moment</p>
            <button className="browse-all-btn" onClick={goToMarketconti}>
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="categories-scroll">
            {trendingProducts.map((product) => {
              const firstPrice = Object.values(product.sizes || {})[0] || 0;
              const soldCount = product.sold || 0;
              
              return (
                <div 
                  key={product._id} 
                  className="category-card trending-product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="trending-badge">
                    <span className="fire-icon">🔥</span>
                    <span className="sold-count">{soldCount} sold</span>
                  </div>
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    className="category-image"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200x160?text=No+Image'}
                  />
                  <div className="product-info-section">
                    <span className="category-name">{product.name}</span>
                    <span className="product-price">₱{firstPrice.toFixed(2)}</span>
                    <button 
                      className="product-store-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToStore(product.store);
                      }}
                    >
                      {product.store}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>✕</button>
            
            <div className="modal-content-grid">
              <div className="modal-image-section">
                <img
                  src={`http://localhost:5000/uploads/${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'}
                />
              </div>
              
              <div className="modal-details-section">
                <h2 className="modal-product-title">{selectedProduct.name}</h2>
                <p className="modal-product-description">{selectedProduct.description}</p>
                
                <div className="modal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📦</span>
                    <div className="stat-info">
                      <span className="stat-label">Total Sold</span>
                      <span className="stat-value">{selectedProduct.sold || 0} units</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div className="stat-info">
                      <span className="stat-label">Stock Available</span>
                      <span className="stat-value">{selectedProduct.quantity || 0} units</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                      <span className="stat-label">Buyers</span>
                      <span className="stat-value">{selectedProduct.buyers?.length || 0} customers</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-icon">🏪</span>
                    <div className="stat-info">
                      <span className="stat-label">Seller</span>
                      <button 
                        className="modal-store-btn"
                        onClick={() => goToStore(selectedProduct.store)}
                      >
                        {selectedProduct.store}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="modal-pricing">
                  <h3>Available Sizes & Prices</h3>
                  <div className="sizes-grid">
                    {Object.entries(selectedProduct.sizes || {}).map(([size, price]) => (
                      <div key={size} className="size-price-card">
                        <span className="size-label">{size}</span>
                        <span className="price-label">₱{price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  className="view-product-btn" 
                  onClick={() => {
                    closeModal();
                    goToMarketconti();
                  }}
                >
                  View in Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Market;