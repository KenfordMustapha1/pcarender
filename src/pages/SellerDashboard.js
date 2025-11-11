import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/Marketconti.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price: '',
    description: '',
    store: '',
    image: null,
    sizesInput: '',
  });

  // Fetch products with stable reference
  const fetchProducts = useCallback(async () => {
    try {
      const sellerEmail = localStorage.getItem('sellerEmail');
      if (!sellerEmail) {
        navigate('/sell');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/products/seller/${encodeURIComponent(sellerEmail)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected array but got:', data);
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, [navigate]);

  // Check seller approval status
  const checkSellerApproval = useCallback(async () => {
    const sellerEmail = localStorage.getItem('sellerEmail');
    if (!sellerEmail) {
      navigate('/sell');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/seller?email=${encodeURIComponent(sellerEmail)}`);
      const data = await res.json();

      if (!res.ok || !data.exists || !data.isApproved) {
        navigate('/sell');
      }
    } catch (err) {
      console.error('Approval check failed:', err);
      navigate('/sell');
    }
  }, [navigate]);

  // Main effect: verify + load data
  useEffect(() => {
    checkSellerApproval();

    const sellerEmail = localStorage.getItem('sellerEmail');
    if (sellerEmail) {
      setNewProduct((prev) => ({ ...prev, store: sellerEmail }));
      fetchProducts();

      const interval = setInterval(fetchProducts, 5000);
      return () => clearInterval(interval);
    }
  }, [checkSellerApproval, fetchProducts]);

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setNewProduct({
      ...newProduct,
      image: e.target.files[0],
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const { name, quantity, price, description, image, sizesInput } = newProduct;
    const { store } = newProduct;

    if (!name || !quantity || !price || !description || !store || !image || !sizesInput?.trim()) {
      alert('Please fill all fields including sizes');
      return;
    }

    let sizes = {};
    const sizeList = sizesInput.split(',').map(s => s.trim());
    sizeList.forEach(size => {
      sizes[size] = parseFloat(price);
    });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('store', store);
    formData.append('quantity', parseInt(quantity));
    formData.append('sizes', JSON.stringify(sizes));
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchProducts();
        setShowAddModal(false);
        setNewProduct({
          name: '',
          quantity: '',
          price: '',
          description: '',
          image: null,
          sizesInput: '',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Could not connect to server');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Could not connect to server');
    }
  };

  // Summary stats
  let totalProducts = 0;
  let totalQuantity = 0;
  let totalSold = 0;
  let totalSales = 0;

  if (Array.isArray(products)) {
    totalProducts = products.length;
    totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
    totalSales = products.reduce((sum, p) => {
      const price = Object.values(p.sizes || {})[0] || 0;
      return sum + (p.sold * price);
    }, 0);
  }

  const styles = {
    dashboardContainer: {
      maxWidth: '1000px',
      margin: '30px auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '0 20px',
      color: '#222',
    },
    dashboardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
    },
    addProductBtn: {
      backgroundColor: '#2c9e4f',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      fontSize: '1rem',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    summaryCards: {
      display: 'flex',
      gap: '15px',
      marginBottom: '35px',
      flexWrap: 'wrap',
    },
    card: {
      flex: '1',
      backgroundColor: '#2c9e4f',
      color: 'white',
      borderRadius: '10px',
      padding: '25px',
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      minWidth: '180px',
    },
    label: {
      fontWeight: '600',
      marginBottom: '6px',
      display: 'block',
      color: '#222',
    },
    input: {
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '1rem',
      outlineColor: '#2c9e4f',
      width: '100%',
      boxSizing: 'border-box',
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      marginTop: '25px',
    },
    cancelBtn: {
      backgroundColor: '#999',
      color: '#fff',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
    },
    submitBtn: {
      backgroundColor: '#2c9e4f',
      color: '#fff',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
    },
    deleteBtn: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
  };

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.dashboardHeader}>
        <h1>Seller Dashboard</h1>
        <button
          style={styles.addProductBtn}
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add New Product
        </button>
      </header>

      <section style={styles.summaryCards}>
        <div style={styles.card}>
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div style={styles.card}>
          <h3>Total Quantity Available</h3>
          <p>{totalQuantity}</p>
        </div>
        <div style={styles.card}>
          <h3>Total Quantity Sold</h3>
          <p>{totalSold}</p>
        </div>
        <div style={styles.card}>
          <h3>Total Sales</h3>
          <p>₱{totalSales.toFixed(2)}</p>
        </div>
      </section>

      <section>
        <h2>Products</h2>
        {products.length === 0 ? (
          <p>No products yet. Add some!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #2c9e4f' }}>
                <th style={styles.label}>Name</th>
                <th style={styles.label}>Qty Available</th>
                <th style={styles.label}>Price</th>
                <th style={styles.label}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{product.name}</td>
                  <td style={{ padding: '12px' }}>{product.quantity}</td>
                  <td style={{ padding: '12px' }}>{Object.values(product.sizes || {})[0]?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '30px 25px',
              width: '90%',
              maxWidth: '450px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <label style={styles.label}>
                Product Name
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Description
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleChange}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Quantity
                <input
                  type="number"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  min="0"
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Price (₱)
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Sizes (comma-separated)
                <input
                  type="text"
                  name="sizesInput"
                  value={newProduct.sizesInput}
                  onChange={handleChange}
                  placeholder="e.g., Small, Medium"
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Product Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: '100%' }}
                />
              </label>
              <div style={styles.modalButtons}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;