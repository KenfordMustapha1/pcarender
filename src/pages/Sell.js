// src/pages/Sell.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import './Sell.css';

const Sell = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const [sellerName, setSellerName] = useState('');
  const [frontId, setFrontId] = useState(null);
  const [backId, setBackId] = useState(null);
  const [selfieId, setSelfieId] = useState(null);
  const [status, setStatus] = useState(''); // 'pending', 'approved', 'rejected', ''
  const [message, setMessage] = useState(''); // For success/error messages
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Payment Methods State - Initialize with full structure
  const [paymentMethods, setPaymentMethods] = useState({
    gcash: { number: '', qrCode: null },
    paymaya: { number: '', qrCode: null },
    bank: { number: '', qrCode: null }
  });
  // NEW: State to track *unsaved* changes made by the user in the form
  const [localPaymentChanges, setLocalPaymentChanges] = useState({
    gcash: { number: '', qrCode: null },
    paymaya: { number: '', qrCode: null },
    bank: { number: '', qrCode: null }
  });
  const [paymentFiles, setPaymentFiles] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  // NEW: Loading state for deletion
  const [paymentDeleting, setPaymentDeleting] = useState({ gcash: false, paymaya: false, bank: false });

  // NEW: Product Lists State
  const [products, setProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [rejectedProducts, setRejectedProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  // REMOVED: const [filteredProducts, setFilteredProducts] = useState([]); // Not used
  // REMOVED: const [searchTerm, setSearchTerm] = useState(''); // Not used
  const [showAddModal, setShowAddModal] = useState(false);
  // NEW: Move newProduct state declaration here, before any conditional returns
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price: '',
    description: '',
    image: null,
    sizesInput: '',
  });

  // NEW: State for transaction modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // NEW: State for product list tabs
  const [activeProductTab, setActiveProductTab] = useState('all'); // 'all', 'approved', 'rejected', 'pending'

  // REMOVED: const transactionHistoryRef = useRef(null); // Not used
  const paymentMethodRef = useRef(null); // Ref for payment methods section

  const frontIdRef = useRef(null);
  const backIdRef = useRef(null);
  const selfieIdRef = useRef(null);

  // NEW: Ref to store previous status - used to detect changes
  const previousStatusRef = useRef(status);

  // NEW: Fetch payment methods for seller
  const fetchPaymentMethods = useCallback(async () => {
    if (!currentUser) return;
    try {
      const storeEmail = localStorage.getItem('storeEmail') || currentUser.email;
      const res = await fetch(`http://localhost:5000/api/payment-methods/${encodeURIComponent(storeEmail)}`);
      const data = await res.json();
      // NEW: Correctly merge API data with previous state to avoid duplicate keys
      setPaymentMethods(prev => {
        // Start with the default structure
        const newState = {
          gcash: { number: '', qrCode: null, ...prev.gcash }, // Preserve previous if API fails
        };
        // Apply API data
        Object.assign(newState, data);
        // Ensure all three methods exist in the state object, filling from API data or defaulting
        newState.gcash = { number: '', qrCode: null, ...newState.gcash };
        newState.paymaya = { number: '', qrCode: null, ...newState.paymaya };
        newState.bank = { number: '', qrCode: null, ...newState.bank };
        return newState;
      });
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    }
  }, [currentUser]);

  // NEW: Fetch products by status
  const fetchProductsByStatus = useCallback(async (status) => {
    if (!currentUser) return;
    try {
      const storeEmail = localStorage.getItem('storeEmail') || currentUser.email;
      const res = await fetch(`http://localhost:5000/api/products/seller/${encodeURIComponent(storeEmail)}/status/${status}`);
      const data = await res.json();
      const productList = Array.isArray(data) ? data : [];
      if (status === 'Approved') {
        setApprovedProducts(productList);
      } else if (status === 'Rejected') {
        setRejectedProducts(productList);
      } else if (status === 'Pending') {
        setPendingProducts(productList);
      }
    } catch (err) {
      console.error(`Failed to fetch ${status} products:`, err);
    }
  }, [currentUser]);

  // Fetch all products (for initial load, then split by status)
  const fetchProducts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const storeEmail = localStorage.getItem('storeEmail') || currentUser.email;
      const res = await fetch(`http://localhost:5000/api/products/seller/${encodeURIComponent(storeEmail)}`);
      const data = await res.json();
      const productList = Array.isArray(data) ? data : [];
      setProducts(productList);

      // Separate products by status
      const approved = productList.filter(p => p.status === 'Approved');
      const rejected = productList.filter(p => p.status === 'Rejected');
      const pending = productList.filter(p => p.status === 'Pending');

      setApprovedProducts(approved);
      setRejectedProducts(rejected);
      setPendingProducts(pending);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, [currentUser]);

  // Check seller status using product store email
  const checkSellerStatus = useCallback(async () => {
    if (!currentUser) return;
    
    const sellerEmail = products.length > 0 ? products[0].store : currentUser.email;
    
    try {
      const res = await fetch(`http://localhost:5000/api/seller?email=${encodeURIComponent(sellerEmail)}`);
      const data = await res.json();
      if (res.ok && data.exists) {
        let newStatus = '';
        let newMessage = '';
        if (data.isApproved) {
          newStatus = 'approved';
          // NEW: Only set the message if status *changed* to approved
          if (previousStatusRef.current !== 'approved') {
              newMessage = "✅ Your verification has been approved!";
              // NEW: Clear message after 3 seconds for approved status
              setTimeout(() => {
                setMessage('');
              }, 3000);
          }
        } else if (data.rejected) {
          newStatus = 'rejected';
          newMessage = "❌ Your verification was rejected. Please upload again.";
        } else {
          newStatus = 'processing';
          newMessage = "⏳ Please wait while your verification is being processed...";
        }

        // NEW: Only update state if status changed
        if (previousStatusRef.current !== newStatus) {
          setStatus(newStatus);
          // NEW: Only set message if it's a new message (not empty for approved)
          if (newMessage) setMessage(newMessage);
        }
        setHasSubmitted(true);
        // Update ref after setting state
        previousStatusRef.current = newStatus;
      } else {
        setStatus('');
        setHasSubmitted(false);
        // NEW: Clear message if no seller exists
        if (previousStatusRef.current) {
          setMessage('');
        }
        previousStatusRef.current = '';
      }
    } catch (err) {
      console.error('Status check failed:', err);
      setStatus('');
      setHasSubmitted(false);
    }
  }, [currentUser, products]);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    checkSellerStatus();
    let interval;
    if (status !== 'approved') {
      interval = setInterval(checkSellerStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [checkSellerStatus, status]); // Include status in dependency to handle interval changes

  useEffect(() => {
    if (status === 'approved') {
      const interval = setInterval(fetchProducts, 5000);
      const paymentInterval = setInterval(() => {
         // NEW: Only fetch payment methods if there are no local changes
         if (!Object.values(localPaymentChanges).some(method => method.number !== '' || method.qrCode !== null)) {
             fetchPaymentMethods();
         }
      }, 5000);
      // Also fetch lists periodically
      const listInterval = setInterval(() => {
        fetchProductsByStatus('Approved');
        fetchProductsByStatus('Rejected');
        fetchProductsByStatus('Pending');
      }, 5000);
      
      return () => {
        clearInterval(interval);
        clearInterval(paymentInterval);
        clearInterval(listInterval);
      };
    }
  }, [status, fetchProducts, fetchPaymentMethods, fetchProductsByStatus, localPaymentChanges]);

  // NEW: Handle payment method changes - update local changes state
  const handlePaymentMethodChange = (method, field, value) => {
    setLocalPaymentChanges(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
    // Also update the main state so the UI reflects the change immediately
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  // NEW: Handle file changes for payment methods - update local changes state
  const handlePaymentFileChange = (method, file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG) for the QR code.');
      return;
    }
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      setError('File size must be under 5MB.');
      return;
    }
    setError('');
    setPaymentFiles(prev => ({
      ...prev,
      [method]: file
    }));
    // Update local changes state
    setLocalPaymentChanges(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        qrCode: file.name // Temporary name for display
      }
    }));
    // Update main state so UI reflects the change immediately
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        qrCode: file.name // Temporary name for display
      }
    }));
  };

  // NEW: Save payment methods
  const handleSavePaymentMethods = async () => {
    if (!currentUser) return;
    setPaymentLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('storeEmail', localStorage.getItem('storeEmail') || currentUser.email);
    
    // Append text fields from local changes
    formData.append('gcashNumber', localPaymentChanges.gcash.number);
    formData.append('paymayaNumber', localPaymentChanges.paymaya.number);
    formData.append('bankNumber', localPaymentChanges.bank.number);

    // Append files if they exist
    if (paymentFiles.gcash) formData.append('gcashQr', paymentFiles.gcash);
    if (paymentFiles.paymaya) formData.append('paymayaQr', paymentFiles.paymaya);
    if (paymentFiles.bank) formData.append('bankQr', paymentFiles.bank);

    try {
      const res = await fetch(`http://localhost:5000/api/payment-methods/${encodeURIComponent(currentUser.email)}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage("✅ Payment methods updated successfully!");
        // NEW: After saving, clear local changes and fetch the latest from server
        setLocalPaymentChanges({
          gcash: { number: '', qrCode: null },
          paymaya: { number: '', qrCode: null },
          bank: { number: '', qrCode: null }
        });
        setPaymentFiles({}); // Clear temporary file state
        fetchPaymentMethods(); // Refresh the state from the server
        setTimeout(() => setMessage(''), 3000); // Clear message after 3s
      } else {
        const data = await res.json();
        setError(data.msg || 'Failed to save payment methods');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Payment method save error:', err);
    } finally {
      setPaymentLoading(false);
    }
  };

  // NEW: Delete a specific payment method
  const handleDeletePaymentMethod = async (methodType) => {
    if (!currentUser) return;
    setPaymentDeleting(prev => ({ ...prev, [methodType]: true }));
    setError('');

    try {
      const res = await fetch(`http://localhost:5000/api/payment-methods/${encodeURIComponent(currentUser.email)}/${methodType}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json(); // Get the updated methods from the response
        setMessage(`✅ ${methodType.charAt(0).toUpperCase() + methodType.slice(1)} details removed successfully!`);
        // NEW: Update state immediately and clear local changes for this method
        setPaymentMethods(data.methods);
        setLocalPaymentChanges(prev => ({
          ...prev,
          [methodType]: { number: '', qrCode: null } // Clear local changes
        }));
        setPaymentFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[methodType]; // Clear any pending file for this method
            return newFiles;
        });
        // Optional: fetch again to ensure sync, but using the response is faster
        // fetchPaymentMethods();
        setTimeout(() => setMessage(''), 3000); // Clear message after 3s
      } else {
        const errorData = await res.json().catch(() => ({})); // Safely parse error response
        setError(errorData.msg || `Failed to remove ${methodType} details`);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error(`Payment method delete error for ${methodType}:`, err);
    } finally {
      setPaymentDeleting(prev => ({ ...prev, [methodType]: false }));
    }
  };

  if (loading) {
    return (
      <div className="verification-container">
        <div className="verification-in-progress">
          <div className="hourglass-container">
            <div className="hourglass"></div>
          </div>
          <h2>Initializing...</h2>
          <p>Verifying your session</p>
        </div>
      </div>
    );
  }

  const getFileName = (file) => file ? file.name : 'No file selected';

  const handleFileChange = (file, setter, maxSize = 5) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid file (JPG, PNG, or PDF).');
      return;
    }
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be under ${maxSize}MB.`);
      return;
    }
    setError('');
    setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!frontId || !backId || !selfieId) {
      setError('Please upload all required documents.');
      return;
    }

    setHasSubmitted(true);
    setError('');
    setMessage("⏳ Uploading verification...");

    const formData = new FormData();
    formData.append('frontId', frontId);
    formData.append('backId', backId);
    formData.append('selfieId', selfieId);
    formData.append('sellerName', sellerName);
    formData.append('email', currentUser.email);

    localStorage.setItem('storeEmail', currentUser.email);

    try {
      const res = await fetch('http://localhost:5000/api/verification/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Verification submitted successfully. Waiting for approval...");
        setStatus('processing');
        previousStatusRef.current = 'processing'; // Update ref immediately after setting state
      } else {
        setError(data.message || 'Failed to submit verification');
        setHasSubmitted(false);
        setMessage('');
        previousStatusRef.current = ''; // Update ref after clearing message
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      setHasSubmitted(false);
      setMessage('');
      previousStatusRef.current = ''; // Update ref after clearing message
    }
  };

  const handleResubmit = () => {
    setStatus('');
    setMessage('');
    setError('');
    setHasSubmitted(false);
    setFrontId(null);
    setBackId(null);
    setSelfieId(null);
    previousStatusRef.current = ''; // Update ref after clearing state
  };

  const handleRestock = async (productId, change) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/restock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change })
      });
      
      if (res.ok) {
        fetchProducts(); // Refresh all lists
      } else {
        const err = await res.json();
        alert(err.msg || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Restock error:', error);
      alert('Could not update stock');
    }
  };

  const renderPreview = (file) => {
    if (!file) return null;
    if (file.type.startsWith('image/')) {
      return <img src={URL.createObjectURL(file)} alt="Preview" className="file-preview" />;
    }
    return <div className="file-icon">📄</div>;
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { name, quantity, price, description, image, sizesInput } = newProduct;
    if (!name || !quantity || !price || !description || !image || !sizesInput?.trim()) {
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
    formData.append('store', currentUser.email);
    formData.append('quantity', parseInt(quantity));
    formData.append('sizes', JSON.stringify(sizes));
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchProducts(); // Refresh all lists
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

  const handleScrollToTransactions = () => {
    // NEW: Open the transaction modal instead of scrolling
    setShowTransactionModal(true);
  };

  const handleScrollToPaymentMethods = () => {
    paymentMethodRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // NEW: Function to get the active product list based on the selected tab
  const getActiveProductList = () => {
    switch (activeProductTab) {
      case 'approved':
        return approvedProducts;
      case 'rejected':
        return rejectedProducts;
      case 'pending':
        return pendingProducts;
      case 'all':
      default:
        return products;
    }
  };

  // Calculate summary for all products
  let totalProducts = 0, totalQuantity = 0, totalSold = 0, totalSales = 0;
  if (Array.isArray(products)) {
    totalProducts = products.length;
    totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
    totalSales = products.reduce((sum, p) => {
      const price = Object.values(p.sizes || {})[0] || 0;
      return sum + (p.sold * price);
    }, 0);
  }

  if (!currentUser) return null; // Conditional return *after* all hooks

  return (
    <div className="verification-container">
      {/* Verification Form */}
      {!hasSubmitted && status === '' && (
        <div className="form-card">
          <div className="form-header-wrapper">
            <div className="form-icon">🔒</div>
            <h2 className="form-header">Become a Verified Seller</h2>
            <p className="form-subtext">
              Complete your business verification to start selling on our marketplace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="verification-form" noValidate>
            <div className="form-group">
              <label>Full Name <span>*</span></label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Enter your legal name"
                required
              />
            </div>

            <div className="form-group">
              <label>Government-Issued ID (Front) <span>*</span></label>
              <div 
                className={`file-upload ${frontId ? 'has-file' : ''}`}
                onClick={() => frontIdRef.current?.click()}
              >
                {frontId ? renderPreview(frontId) : (
                  <>
                    <div className="file-upload-icon">📷</div>
                    <div className="file-upload-text">Upload front of your ID</div>
                  </>
                )}
                <div className="file-name">{getFileName(frontId)}</div>
                <input
                  type="file"
                  ref={frontIdRef}
                  onChange={(e) => handleFileChange(e.target.files[0], setFrontId)}
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Government-Issued ID (Back) <span>*</span></label>
              <div 
                className={`file-upload ${backId ? 'has-file' : ''}`}
                onClick={() => backIdRef.current?.click()}
              >
                {backId ? renderPreview(backId) : (
                  <>
                    <div className="file-upload-icon">📷</div>
                    <div className="file-upload-text">Upload back of your ID</div>
                  </>
                )}
                <div className="file-name">{getFileName(backId)}</div>
                <input
                  type="file"
                  ref={backIdRef}
                  onChange={(e) => handleFileChange(e.target.files[0], setBackId)}
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Business Certificate <span>*</span></label>
              <div 
                className={`file-upload ${selfieId ? 'has-file' : ''}`}
                onClick={() => selfieIdRef.current?.click()}
              >
                {selfieId ? renderPreview(selfieId) : (
                  <>
                    <div className="file-upload-icon">📎</div>
                    <div className="file-upload-text">Upload business certificate</div>
                  </>
                )}
                <div className="file-name">{getFileName(selfieId)}</div>
                <input
                  type="file"
                  ref={selfieIdRef}
                  onChange={(e) => handleFileChange(e.target.files[0], setSelfieId, 10)}
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={!!message}>
              {message ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          <div className="form-footer">
            <div className="footer-icon">🛡️</div>
            <p>Your documents are encrypted and stored securely.</p>
          </div>
        </div>
      )}

      {/* Processing / Rejected States */}
      {(hasSubmitted && status !== 'approved') && (
        <>
          {status === 'processing' && (
            <div className="verification-in-progress">
              <div className="hourglass-container">
                <div className="hourglass"></div>
              </div>
              <h2>Verification in Progress</h2>
              <p>{message}</p>
            </div>
          )}

          {status === 'rejected' && (
            <div className="verification-in-progress error">
              <div className="xmark">✕</div>
              <h2>Verification Rejected</h2>
              <p>Please review your documents and re-submit.</p>
              <button onClick={handleResubmit} className="reset-btn">
                Re-upload Documents
              </button>
            </div>
          )}
        </>
      )}

      {/* Dashboard */}
      {status === 'approved' && (
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Seller Dashboard</h1>
            <div className="header-actions">
              <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
                ➕ Add New Product
              </button>
              <button className="transaction-btn" onClick={handleScrollToPaymentMethods}>
                💳 Payment Methods
              </button>
              <button className="transaction-btn" onClick={handleScrollToTransactions}>
                📊 Transaction History
              </button>
            </div>
          </header>

          {/* NEW: Message Display */}
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <section className="summary-cards">
            <div className="card">
              <h3>Total Products</h3>
              <p>{totalProducts}</p>
            </div>
            <div className="card">
              <h3>Total Quantity Available</h3>
              <p>{totalQuantity}</p>
            </div>
            <div className="card">
              <h3>Total Quantity Sold</h3>
              <p>{totalSold}</p>
            </div>
            <div className="card">
              <h3>Total Sales</h3>
              <p>₱{totalSales.toFixed(2)}</p>
            </div>
          </section>

          {/* NEW: Payment Methods Section */}
          <section className="payment-methods-section" ref={paymentMethodRef}>
            <h2>Payment Methods</h2>
            <div className="payment-methods-container">
              <div className="payment-method">
                <h3>GCash</h3>
                {/* NEW: Use optional chaining (?.) and provide fallback */}
                <input
                  type="text"
                  placeholder="GCash Number"
                  value={paymentMethods?.gcash?.number || ''} // Use optional chaining and fallback to empty string
                  onChange={(e) => handlePaymentMethodChange('gcash', 'number', e.target.value)}
                />
                {/* NEW: Check if gcash object exists before accessing qrCode */}
                <div className="file-upload" onClick={() => document.getElementById('gcash-qr-upload')?.click()}>
                  {paymentMethods?.gcash?.qrCode ? ( // Check if gcash object and qrCode exist
                    <img src={`http://localhost:5000/uploads/${paymentMethods.gcash.qrCode}`} alt="GCash QR" className="qr-preview" />
                  ) : (
                    <div className="file-upload-placeholder">Upload GCash QR Code</div>
                  )}
                </div>
                <input
                  id="gcash-qr-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePaymentFileChange('gcash', e.target.files[0])}
                />
                {/* NEW: Check if gcash object exists before rendering delete button */}
                {paymentMethods?.gcash && (paymentMethods.gcash.number || paymentMethods.gcash.qrCode) && (
                  <button
                    className="delete-payment-btn"
                    onClick={() => handleDeletePaymentMethod('gcash')}
                    disabled={paymentDeleting.gcash}
                  >
                    {paymentDeleting.gcash ? 'Deleting...' : '🗑️ Remove'}
                  </button>
                )}
              </div>
              
              <div className="payment-method">
                <h3>PayMaya</h3>
                {/* NEW: Use optional chaining (?.) and provide fallback */}
                <input
                  type="text"
                  placeholder="PayMaya Number"
                  value={paymentMethods?.paymaya?.number || ''} // Use optional chaining and fallback to empty string
                  onChange={(e) => handlePaymentMethodChange('paymaya', 'number', e.target.value)}
                />
                {/* NEW: Check if paymaya object exists before accessing qrCode */}
                <div className="file-upload" onClick={() => document.getElementById('paymaya-qr-upload')?.click()}>
                  {paymentMethods?.paymaya?.qrCode ? ( // Check if paymaya object and qrCode exist
                    <img src={`http://localhost:5000/uploads/${paymentMethods.paymaya.qrCode}`} alt="PayMaya QR" className="qr-preview" />
                  ) : (
                    <div className="file-upload-placeholder">Upload PayMaya QR Code</div>
                  )}
                </div>
                <input
                  id="paymaya-qr-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePaymentFileChange('paymaya', e.target.files[0])}
                />
                {/* NEW: Check if paymaya object exists before rendering delete button */}
                {paymentMethods?.paymaya && (paymentMethods.paymaya.number || paymentMethods.paymaya.qrCode) && (
                  <button
                    className="delete-payment-btn"
                    onClick={() => handleDeletePaymentMethod('paymaya')}
                    disabled={paymentDeleting.paymaya}
                  >
                    {paymentDeleting.paymaya ? 'Deleting...' : '🗑️ Remove'}
                  </button>
                )}
              </div>
              
              <div className="payment-method">
                <h3>Bank Transfer</h3>
                {/* NEW: Use optional chaining (?.) and provide fallback */}
                <input
                  type="text"
                  placeholder="Bank Account Number"
                  value={paymentMethods?.bank?.number || ''} // Use optional chaining and fallback to empty string
                  onChange={(e) => handlePaymentMethodChange('bank', 'number', e.target.value)}
                />
                {/* NEW: Check if bank object exists before accessing qrCode */}
                <div className="file-upload" onClick={() => document.getElementById('bank-qr-upload')?.click()}>
                  {paymentMethods?.bank?.qrCode ? ( // Check if bank object and qrCode exist
                    <img src={`http://localhost:5000/uploads/${paymentMethods.bank.qrCode}`} alt="Bank QR" className="qr-preview" />
                  ) : (
                    <div className="file-upload-placeholder">Upload Bank QR Code</div>
                  )}
                </div>
                <input
                  id="bank-qr-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePaymentFileChange('bank', e.target.files[0])}
                />
                {/* NEW: Check if bank object exists before rendering delete button */}
                {paymentMethods?.bank && (paymentMethods.bank.number || paymentMethods.bank.qrCode) && (
                  <button
                    className="delete-payment-btn"
                    onClick={() => handleDeletePaymentMethod('bank')}
                    disabled={paymentDeleting.bank}
                  >
                    {paymentDeleting.bank ? 'Deleting...' : '🗑️ Remove'}
                  </button>
                )}
              </div>
            </div>
            <button onClick={handleSavePaymentMethods} disabled={paymentLoading} className="save-payment-btn">
              {paymentLoading ? 'Saving...' : 'Save Payment Methods'}
            </button>
          </section>

          {/* NEW: Combined Products Section with Tabs */}
          <section className="products-section">
            <div className="products-header">
              <h2>Products</h2>
              <div className="product-tabs">
                <button 
                  className={`product-tab ${activeProductTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveProductTab('all')}
                >
                  All ({products.length})
                </button>
                <button 
                  className={`product-tab ${activeProductTab === 'approved' ? 'active' : ''}`}
                  onClick={() => setActiveProductTab('approved')}
                >
                  Approved ({approvedProducts.length})
                </button>
                <button 
                  className={`product-tab ${activeProductTab === 'rejected' ? 'active' : ''}`}
                  onClick={() => setActiveProductTab('rejected')}
                >
                  Rejected ({rejectedProducts.length})
                </button>
                <button 
                  className={`product-tab ${activeProductTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveProductTab('pending')}
                >
                  Pending ({pendingProducts.length})
                </button>
              </div>
            </div>
            
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Sold</th>
                    <th>Revenue</th>
                    <th>Buyers</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getActiveProductList().map((product) => {
                    const price = Object.values(product.sizes || {})[0] || 0;
                    const revenue = (product.sold || 0) * price;
                    const buyersCount = product.buyers?.length || 0;
                    
                    return (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                          <td>
                          <div className="quantity-cell">
                            {product.status === 'Approved' ? (
                              <>
                                <button 
                                  className="restock-btn"
                                  onClick={() => handleRestock(product._id, -1)}
                                  disabled={product.quantity <= 0}
                                  title="Decrease stock"
                                >
                                  −
                                </button>
                                <span>{product.quantity}</span>
                                <button 
                                  className="restock-btn"
                                  onClick={() => handleRestock(product._id, 1)}
                                  title="Increase stock"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <span className="status-locked">{product.quantity}</span>
                            )}
                          </div>
                        </td>
                        <td>{product.sold || 0}</td>
                        <td>₱{revenue.toFixed(2)}</td>
                        <td>
                          {buyersCount > 0 ? (
                            <span>{buyersCount} {buyersCount === 1 ? 'Buyer' : 'Buyers'}</span>
                          ) : (
                            <span style={{ color: '#999' }}>No buyers</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge status-${product.status?.toLowerCase() || 'pending'}`}>
                            {product.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Add Product Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={newProduct.quantity}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (₱)</label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Sizes (comma-separated)</label>
                    <input
                      type="text"
                      name="sizesInput"
                      value={newProduct.sizesInput}
                      onChange={handleChange}
                      placeholder="e.g., Small, Medium, Large"
                    />
                  </div>
                  <div className="form-group">
                    <label>Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="modal-buttons">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* NEW: Transaction History Modal */}
          {showTransactionModal && (
            <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
              <div className="modal-content transaction-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Recent Transactions</h3>
                  <button className="close-button" onClick={() => setShowTransactionModal(false)}>×</button>
                </div>
                <div className="transactions-list">
                  {products.length === 0 ? (
                    <p>No transactions yet.</p>
                  ) : (
                    products.flatMap(product => {
                      if (!product.buyers || product.buyers.length === 0) return [];
                      
                      return product.buyers.map((buyer, idx) => {
                        const displaySize = buyer.selectedSize || 
                                            (product.sizes && Object.keys(product.sizes)[0]) || 
                                            'Default';
                        
                        const sizePrice = product.sizes && product.sizes[buyer.selectedSize] 
                                         ? product.sizes[buyer.selectedSize]
                                         : Object.values(product.sizes || {})[0] || 0;
                        
                        return (
                          <div key={`${product._id}-${buyer.buyerEmail}-${idx}`} className="transaction-item">
                            <div className="transaction-col">
                              <strong>{product.name}</strong>
                              <div className="size-info">Size: <strong>{displaySize}</strong></div>
                            </div>
                            <div className="transaction-col">
                              <div>Buyer: {buyer.buyerName || buyer.buyerEmail.split('@')[0]}</div>
                              <div className="buyer-email">{buyer.buyerEmail}</div>
                            </div>
                            <div className="transaction-col">
                              <div>Qty: <strong>{buyer.quantityBought}</strong></div>
                              <div className="total-spent">₱{(buyer.totalSpent || (buyer.quantityBought * sizePrice)).toFixed(2)}</div>
                            </div>
                            <div className="transaction-col">
                              <div className="payment-method">
                                {buyer.paymentMethod || 'N/A'}
                              </div>
                              <div className="purchase-date">
                                {new Date(buyer.lastPurchase || buyer.purchaseDate).toLocaleString('en-PH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sell;