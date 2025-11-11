import React, { useState, useEffect } from 'react';
import "./Productverification.css";

const ProductVerification = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null); 
  const [showBuyersModal, setShowBuyersModal] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalSales: 0
  });

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch('http://localhost:5000/api/products/all-status');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setAllProducts(data);
        calculateStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllProducts();
  }, []);

  function calculateStats(products) {
    const pending = products.filter(p => p.status === 'Pending').length;
    const approved = products.filter(p => p.status === 'Approved').length;
    const rejected = products.filter(p => p.status === 'Rejected').length;
    
    // Calculate total sales from ALL products (not just approved)
    const totalSales = products.reduce((sum, p) => {
      const price = Object.values(p.sizes || {})[0] || 0;
      return sum + (p.sold || 0) * price;
    }, 0);

    setStats({
      totalProducts: products.length,
      pending,
      approved,
      rejected,
      totalSales
    });
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3500);
  };

  const handleApprove = async (productId, productName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/approve`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        showToast(`Approved product: ${productName}`, 'success');
        setAllProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === productId ? { ...p, status: 'Approved' } : p
          )
        );
        const updatedProducts = allProducts.map(p => 
          p._id === productId ? { ...p, status: 'Approved' } : p
        );
        calculateStats(updatedProducts);
      } else {
        showToast('Failed to approve product', 'error');
      }
    } catch (err) {
      console.error('Error approving product:', err);
      showToast('Error approving product', 'error');
    }
  };

  const handleReject = async (productId, productName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reject`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        showToast(`Rejected product: ${productName}`, 'error');
        setAllProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === productId ? { ...p, status: 'Rejected' } : p
          )
        );
        const updatedProducts = allProducts.map(p => 
          p._id === productId ? { ...p, status: 'Rejected' } : p
        );
        calculateStats(updatedProducts);
      } else {
        showToast('Failed to reject product', 'error');
      }
    } catch (err) {
      console.error('Error rejecting product:', err);
      showToast('Error rejecting product', 'error');
    }
  };

  const filteredProducts = filter === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.status === filter);

  if (loading) return <p className="pv-loading">Loading product verifications...</p>;
  if (error) return <p className="pv-error-message">Error: {error}</p>;

  return (
    <div className="pv-container">
      <h1 className="pv-title">Product Verification Dashboard</h1>

      {/* Dashboard Stats Cards */}
      <div className="pv-stats-container">
        <div className="pv-stat-card pv-stat-total">
          <h3>Total Products</h3>
          <p className="pv-stat-number">{stats.totalProducts}</p>
        </div>
        <div className="pv-stat-card pv-stat-pending">
          <h3>Pending</h3>
          <p className="pv-stat-number">{stats.pending}</p>
        </div>
        <div className="pv-stat-card pv-stat-approved">
          <h3>Approved</h3>
          <p className="pv-stat-number">{stats.approved}</p>
        </div>
        <div className="pv-stat-card pv-stat-rejected">
          <h3>Rejected</h3>
          <p className="pv-stat-number">{stats.rejected}</p>
        </div>
        <div className="pv-stat-card pv-stat-sales">
          <h3>Total Sales</h3>
          <p className="pv-stat-number">₱{stats.totalSales.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pv-filter-tabs">
        <button 
          className={`pv-filter-tab ${filter === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilter('Pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`pv-filter-tab ${filter === 'Approved' ? 'active' : ''}`}
          onClick={() => setFilter('Approved')}
        >
          Approved ({stats.approved})
        </button>
        <button 
          className={`pv-filter-tab ${filter === 'Rejected' ? 'active' : ''}`}
          onClick={() => setFilter('Rejected')}
        >
          Rejected ({stats.rejected})
        </button>
        <button 
          className={`pv-filter-tab ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All ({stats.totalProducts})
        </button>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <p className="pv-empty-message">No {filter.toLowerCase()} products found.</p>
      ) : (
        <div className="pv-table-wrapper">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Seller</th>
                <th>Quantity</th>
                <th>Sold</th>
                <th>Revenue</th>
                <th>Buyers</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const price = Object.values(product.sizes || {})[0] || 0;
                const revenue = (product.sold || 0) * price;
                const buyersCount = product.buyers?.length || 0;
                
                return (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.store}</td>
                    <td>{product.quantity}</td>
                    <td>{product.sold || 0}</td>
                    <td>₱{revenue.toFixed(2)}</td>
                    <td>
                      {buyersCount > 0 ? (
                        <button 
                          className="pv-btn pv-btn-buyers"
                          onClick={() => setShowBuyersModal(product)}
                        >
                          {buyersCount} {buyersCount === 1 ? 'Buyer' : 'Buyers'}
                        </button>
                      ) : (
                        <span style={{ color: '#999' }}>No buyers</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`pv-badge ${
                          product.status === 'Approved'
                            ? 'pv-badge-approved'
                            : product.status === 'Rejected'
                            ? 'pv-badge-rejected'
                            : 'pv-badge-pending'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="pv-btn pv-btn-view"
                        onClick={() => setModalData({
                          productName: product.name,
                          productImage: product.image,
                          description: product.description,
                          store: product.store,
                          quantity: product.quantity,
                          sold: product.sold || 0,
                          sizes: product.sizes,
                          status: product.status,
                          buyers: product.buyers || []
                        })}
                      >
                        View
                      </button>
                      {product.status === 'Pending' && (
                        <>
                          <button
                            className="pv-btn pv-btn-accept"
                            onClick={() => handleApprove(product._id, product.name)}
                          >
                            Accept
                          </button>
                          <button
                            className="pv-btn pv-btn-reject"
                            onClick={() => handleReject(product._id, product.name)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {product.status === 'Rejected' && (
                        <button
                          className="pv-btn pv-btn-accept"
                          onClick={() => handleApprove(product._id, product.name)}
                        >
                          Re-approve
                        </button>
                      )}
                      {product.status === 'Approved' && (
                        <button
                          className="pv-btn pv-btn-reject"
                          onClick={() => handleReject(product._id, product.name)}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product View Modal */}
      {modalData && (
        <div className="pv-modal-backdrop" onClick={() => setModalData(null)}>
          <div className="pv-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{modalData.productName}</h2>
            {modalData.productImage && (
              <img
                src={`http://localhost:5000/uploads/${modalData.productImage}`}
                alt={modalData.productName}
                className="pv-modal-image"
              />
            )}
            <p className="pv-product-description">{modalData.description || 'No description provided.'}</p>
            <p><strong>Store:</strong> {modalData.store}</p>
            <p><strong>Status:</strong> <span className={`pv-badge pv-badge-${modalData.status.toLowerCase()}`}>{modalData.status}</span></p>
            <p><strong>Quantity Available:</strong> {modalData.quantity}</p>
            <p><strong>Quantity Sold:</strong> {modalData.sold}</p>
            <p><strong>Sizes & Prices:</strong></p>
            <ul>
              {modalData.sizes && Object.entries(modalData.sizes).map(([size, price]) => (
                <li key={size}>{size}: ₱{price.toFixed(2)}</li>
              ))}
            </ul>
            <button className="pv-btn pv-btn-cancel" onClick={() => setModalData(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Buyers Modal */}
      {showBuyersModal && (
        <div className="pv-modal-backdrop" onClick={() => setShowBuyersModal(null)}>
          <div className="pv-modal-content pv-buyers-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Buyers for {showBuyersModal.name}</h2>
            <div className="pv-buyers-list">
              {showBuyersModal.buyers && showBuyersModal.buyers.length > 0 ? (
                <table className="pv-buyers-table">
                  <thead>
                    <tr>
                      <th>Buyer Email</th>
                      <th>Quantity Bought</th>
                      <th>Total Spent</th>
                      <th>Payment Method</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showBuyersModal.buyers.map((buyer, index) => (
                      <tr key={index}>
                        <td>{buyer.buyerEmail}</td>
                        <td>{buyer.quantityBought}</td>
                        <td>₱{buyer.totalSpent?.toFixed(2)}</td>
                        <td>{buyer.paymentMethod || 'N/A'}</td>
                        <td>{new Date(buyer.purchaseDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No buyers yet</p>
              )}
            </div>
            <button className="pv-btn pv-btn-cancel" onClick={() => setShowBuyersModal(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`pv-toast ${
          toast.visible ? 'pv-toast-show' : ''
        } ${toast.type === 'error' ? 'pv-toast-error' : 'pv-toast-success'}`}
      >
        {toast.message}
      </div>
    </div>
  );
};

export default ProductVerification;