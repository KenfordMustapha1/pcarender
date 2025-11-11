// src/Components/CartPage.js
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';
import io from 'socket.io-client';
import './CartPage.css';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    selectedItems,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
  } = useCart();

  const [showChatBox, setShowChatBox] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info', buttons: [] });

  const socket = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Seller payment methods state
  const [sellerPaymentMethods, setSellerPaymentMethods] = useState(null);

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showSimpleAlert = (title, message, type) => {
    setAlertData({ title, message, type, buttons: [{ text: 'OK', action: 'ok' }] });
    setShowAlert(true);
  };

  const selectedProducts = useMemo(() => {
    return cartItems.filter(item =>
      selectedItems.includes(`${item.name}-${item.selectedSize}`)
    );
  }, [cartItems, selectedItems]);

  const subtotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedProducts]);

  const allSelected = useMemo(() => {
    return cartItems.length > 0 && cartItems.every(item => selectedItems.includes(`${item.name}-${item.selectedSize}`));
  }, [cartItems, selectedItems]);

  const sellerEmail = selectedProducts.length > 0 ? selectedProducts[0].store : null;
  const buyerEmail = localStorage.getItem('email')?.trim() || null;
  const currentUserName = localStorage.getItem('name')?.trim() || 'Buyer';

  // Fetch seller's payment methods
  useEffect(() => {
    if (sellerEmail) {
      const fetchPaymentMethods = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/payment-methods/${encodeURIComponent(sellerEmail)}`);
          const data = await res.json();
          setSellerPaymentMethods(data);
        } catch (err) {
          console.error('Failed to fetch seller payment methods:', err);
          setSellerPaymentMethods(null);
        }
      };
      fetchPaymentMethods();
    }
  }, [sellerEmail]);

  useEffect(() => {
    if (!showChatBox || !sellerEmail || !buyerEmail) return;

    socket.current = io('http://localhost:5000');
    socket.current.emit('join-chat', { buyerEmail, sellerEmail });

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/chat?user1=${encodeURIComponent(buyerEmail)}&user2=${encodeURIComponent(sellerEmail)}`
        );
        const data = await res.json();
        setChatMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadMessages();

    const handleMessage = (msg) => {
      if ((msg.from === sellerEmail && msg.to === buyerEmail) ||
          (msg.from === buyerEmail && msg.to === sellerEmail)) {
        setChatMessages(prev => [...prev, { ...msg, timestamp: msg.timestamp || new Date() }]);
      }
    };

    socket.current.on('receive-message', handleMessage);
    socket.current.on('receive-image', handleMessage);

    return () => {
      socket.current?.off('receive-message', handleMessage);
      socket.current?.off('receive-image', handleMessage);
      socket.current?.disconnect();
    };
  }, [showChatBox, sellerEmail, buyerEmail]);

  const handleSelectAllChange = (e) => {
    const allKeys = cartItems.map(item => `${item.name}-${item.selectedSize}`);
    e.target.checked ? selectAllItems(allKeys) : deselectAllItems();
  };

  const handleContactClick = () => {
    if (selectedProducts.length > 0) {
      const sellers = [...new Set(selectedProducts.map(p => p.store))];
      if (sellers.length > 1) {
        showSimpleAlert('Multiple Sellers', 'Please select items from only one seller to chat.', 'warning');
        return;
      }
      setShowChatBox(true);
    }
  };

  const handleOpenPayment = () => {
    // Validate profile completion
    const name = localStorage.getItem('name');
    const province = localStorage.getItem('profileProvince');
    const city = localStorage.getItem('profileCity');
    const barangay = localStorage.getItem('profileBarangay');

    if (!name || !name.trim()) {
      showSimpleAlert('Profile Incomplete', 'Your name is required to complete your purchase. Please update your profile with your full name.', 'warning');
      return;
    }

    if (!province || !city || !barangay) {
      showSimpleAlert('Address Required', 'To ensure accurate delivery, please complete your shipping address. This includes your province, city, and barangay.', 'warning');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleClosePayment = () => setShowPaymentModal(false);

  const handleConfirmPayment = async (paymentData) => {
    setIsClosing(true);
    try {
      const userEmail = localStorage.getItem('email');
      const storeEmail = selectedProducts[0]?.store || '';

      const res = await fetch('http://localhost:5000/api/purchases/close-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail: userEmail,
          storeEmail,
          products: selectedProducts.map(p => ({
            name: p.name,
            selectedSize: p.selectedSize,
            quantity: p.quantity,
            price: p.price
          })),
          paymentData
        })
      });

      const data = await res.json();

      if (res.ok) {
        selectedProducts.forEach(item => {
          removeFromCart(item.name, item.selectedSize);
        });
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
        setShowPaymentModal(false);
        setShowChatBox(false);
        showToastMessage('Payment successful! Deal closed.');
      } else {
        showSimpleAlert('Payment Failed', data.msg || 'Failed to close deal', 'error');
      }
    } catch (err) {
      console.error('Error closing deal:', err);
      showSimpleAlert('Connection Error', 'Could not connect to server. Please check your internet connection and try again.', 'error');
    } finally {
      setIsClosing(false);
    }
  };

  const handleAlertAction = (action) => {
    if (action === 'goToProfile') {
      window.location.href = '/account/my-profile';
    }
    setShowAlert(false);
  };

  return (
    <div className="cart-container">
      <div className="cart-items">
        <h2 className="cart-header">Shopping Cart</h2>
        <div className="cart-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAllChange}
            id="select-all"
          />
          <label htmlFor="select-all">
            SELECT ALL ({cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''})
          </label>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          cartItems.map((item, index) => {
            const key = `${item.name}-${item.selectedSize}`;
            return (
              <div key={index} className="cart-item">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(key)}
                  onChange={() => toggleSelectItem(item.name, item.selectedSize)}
                />
                <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-supplier">{item.store}</div>
                </div>
                <div className="cart-item-price">₱{item.price.toFixed(2)}</div>
                <div className="cart-item-quantity">
                  <button onClick={() => updateQuantity(item.name, item.selectedSize, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => {
                      if (item.quantity < item.stock) {
                        updateQuantity(item.name, item.selectedSize, 1);
                      } else {
                        showToastMessage(`Only ${item.stock} in stock for ${item.name}`);
                      }
                    }}
                    className={item.quantity >= item.stock ? 'max-quantity-btn' : ''}
                  >
                    +
                  </button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.name, item.selectedSize)}>
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="summary-total">
          <span>Subtotal:</span>
          <strong>₱{subtotal.toFixed(2)}</strong>
        </div>
        <button
          className="checkout-button"
          onClick={handleContactClick}
          disabled={selectedProducts.length === 0}
        >
          Buy Now ({selectedItems.length})
        </button>
      </div>

      {showToast && <div className="custom-toast">{toastMessage}</div>}

      {showChatBox && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowChatBox(false)}>×</button>
            <ChatBox
              selectedProducts={selectedProducts}
              onOpenPayment={handleOpenPayment}
              isClosing={isClosing}
              messages={chatMessages}
              onSendMessage={(text) => {
                if (!text.trim() || !socket.current) return;
                setChatMessages(prev => [...prev, {
                  from: buyerEmail,
                  to: sellerEmail,
                  text,
                  type: 'text',
                  timestamp: new Date(),
                  read: false
                }]);
                socket.current.emit('send-message', {
                  buyerEmail,
                  sellerEmail,
                  text,
                  sender: buyerEmail
                });
              }}
              currentUserName={currentUserName}
              sellerName={selectedProducts[0]?.storeName || 'Seller'}
            />
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <button className="close-button" onClick={handleClosePayment}>×</button>
            <PaymentModal
              selectedProducts={selectedProducts}
              subtotal={subtotal}
              onConfirm={handleConfirmPayment}
              onCancel={handleClosePayment}
              isClosing={isClosing}
              showAlert={showSimpleAlert}
              sellerPaymentMethods={sellerPaymentMethods} // Pass payment methods to modal
            />
          </div>
        </div>
      )}

      {/* Simple Alert Modal */}
      {showAlert && (
        <div className="modal-overlay">
          <div className="modal-content simple-alert">
            <div className="alert-header">
              <span className="alert-icon">
                {alertData.type === 'warning' ? '⚠️' : alertData.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <h3 className="alert-title">{alertData.title}</h3>
              <button className="close-button" onClick={() => setShowAlert(false)}>×</button>
            </div>
            <div className="alert-body">
              <p>{alertData.message}</p>
              {alertData.type === 'warning' && alertData.title === 'Address Required' && (
                <div className="address-warning">
                  <span className="address-icon">📍</span>
                  <div className="address-text">
                    <strong>Complete your address to ensure delivery:</strong>
                    <ul>
                      <li>Province</li>
                      <li>City</li>
                      <li>Barangay</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="alert-actions">
              {alertData.buttons.map((btn, index) => (
                <button
                  key={index}
                  className={`btn ${btn.action === 'cancel' ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleAlertAction(btn.action)}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ChatBox ---
const ChatBox = ({ 
  selectedProducts, 
  onOpenPayment, 
  isClosing,
  messages,
  onSendMessage,
  currentUserName,
  sellerName
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="chat-box">
      <h3 className="modal-title">Message to Seller</h3>

      {selectedProducts.map((product, idx) => (
        <div key={idx} className="product-preview">
          <img
            src={`http://localhost:5000/uploads/${product.image}`}
            alt={product.name}
          />
          <div className="product-details">
            <strong>{product.name}</strong>
            <div>Size: {product.selectedSize}</div>
            <div>Price: ₱{product.price.toFixed(2)} × {product.quantity}</div>
          </div>
        </div>
      ))}

      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isSent = msg.from === localStorage.getItem('email')?.trim();
          return (
            <div key={idx} className={`message ${isSent ? 'sent' : 'received'}`}>
              <div className="message-avatar">
                {isSent ? getInitials(currentUserName) : getInitials(sellerName)}
              </div>
              <div className="message-content">
                {msg.type === 'image' ? (
                  <img 
                    src={msg.imageUrl?.startsWith('http') 
                      ? msg.imageUrl 
                      : `http://localhost:5000/uploads/${msg.imageUrl}`}
                    alt="Sent" 
                    className="message-image"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found'}
                  />
                ) : (
                  <div className="message-bubble">{msg.text}</div>
                )}
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        placeholder="Add a note..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isClosing}
        className="chat-textarea"
      />

      <div className="modal-actions">
        <button
          className="btn-primary"
          onClick={onOpenPayment}
          disabled={isClosing}
        >
          {isClosing ? 'Processing...' : 'Close Deal'}
        </button>
        <button
          className="btn-secondary"
          onClick={handleSend}
          disabled={isClosing}
        >
          Send Message
        </button>
      </div>
    </div>
  );
};

// --- PaymentModal ---
const PaymentModal = ({ selectedProducts, subtotal, onConfirm, onCancel, isClosing, showAlert, sellerPaymentMethods }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Get user profile data
  const userName = localStorage.getItem('name') || 'N/A';
  const province = localStorage.getItem('profileProvince') || '';
  const city = localStorage.getItem('profileCity') || '';
  const barangay = localStorage.getItem('profileBarangay') || '';
  
  const fullAddress = province && city && barangay 
    ? `${barangay}, ${city}, ${province}` 
    : 'N/A';

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrImage(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  // Get seller's payment info based on selected method
  const getPaymentInfo = () => {
    if (!sellerPaymentMethods) return null;
    return sellerPaymentMethods[paymentMethod.toLowerCase()];
  };

  const handleSubmit = () => {
    if (!paymentMethod) {
      showAlert('Payment Method Required', 'Please select a payment method to proceed with your purchase.', 'warning');
      setCurrentStep(1);
      return;
    }
    if (paymentMethod !== 'Cash on Delivery' && !qrImage) {
      showAlert('Payment Proof Required', 'Please upload a clear photo of your payment receipt or confirmation.', 'warning');
      setCurrentStep(2);
      return;
    }
    if (paymentMethod !== 'Cash on Delivery' && !referenceNumber.trim()) {
      showAlert('Reference Number Required', 'Please enter the transaction reference number from your payment confirmation.', 'warning');
      setCurrentStep(3);
      return;
    }

    const paymentData = {
      method: paymentMethod,
      referenceNumber: paymentMethod !== 'Cash on Delivery' ? referenceNumber : null,
      qrImage: paymentMethod !== 'Cash on Delivery' && qrImage ? qrImage.name : null, // Just the filename
      timestamp: new Date().toISOString(),
    };
    onConfirm(paymentData);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !paymentMethod) {
      showAlert('Payment Method Required', 'Please select a payment method to proceed with your purchase.', 'warning');
      return;
    }
    if (currentStep === 2 && paymentMethod !== 'Cash on Delivery' && !qrImage) {
      showAlert('Payment Proof Required', 'Please upload a clear photo of your payment receipt or confirmation.', 'warning');
      return;
    }
    if (currentStep === 3 && paymentMethod !== 'Cash on Delivery' && !referenceNumber.trim()) {
      showAlert('Reference Number Required', 'Please enter the transaction reference number from your payment confirmation.', 'warning');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // REMOVED: const hasDigitalPaymentMethods = sellerPaymentMethods && ( ... ) // No longer used

  return (
    <div className="payment-content">
      <h3 className="modal-title">Secure Payment</h3>
      
      {/* Progress indicator */}
      <div className="payment-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Method</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Proof</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Reference</div>
        </div>
      </div>

      <div className="payment-summary">
        <h4>Order Summary</h4>
        {selectedProducts.map((product, idx) => (
          <div key={idx} className="payment-product-item">
            <span>{product.name} ({product.selectedSize})</span>
            <span>x{product.quantity}</span>
            <span>₱{(product.price * product.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="payment-total">
          <strong>Total:</strong>
          <strong>₱{subtotal.toFixed(2)}</strong>
        </div>
      </div>

      {/* User Information Section */}
      <div className="payment-summary" style={{ marginTop: '20px' }}>
        <h4>Delivery Information</h4>
        <div className="user-info-section">
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{userName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Address:</span>
            <span className="info-value">{fullAddress}</span>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="payment-step-content">
        {currentStep === 1 && (
          <div className="payment-step">
            <h4>Select Payment Method</h4>
            <div className="payment-methods">
              {/* Cash on Delivery is always available */}
              <label
                key="Cash on Delivery"
                className={`payment-method-option ${
                  paymentMethod === 'Cash on Delivery' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery</span>
              </label>
              {/* Digital methods with availability check */}
              {['GCash', 'PayMaya', 'Bank Transfer'].map((method) => {
                const methodKey = method.toLowerCase();
                const methodData = sellerPaymentMethods ? sellerPaymentMethods[methodKey] : null;
                const isAvailable = methodData && (methodData.qrCode || methodData.number);
                return (
                  <label
                    key={method}
                    className={`payment-method-option ${
                      paymentMethod === method ? 'selected' : ''
                    } ${!isAvailable ? 'unavailable' : ''}`}
                    style={{ opacity: isAvailable ? 1 : 0.5 }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!isAvailable}
                    />
                    <span>{method} {isAvailable ? '' : '(Unavailable)'}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="payment-step">
            <h4>Upload Payment Proof</h4>
            {/* Show seller's QR code for reference (only for digital methods) */}
            {paymentMethod && paymentMethod !== 'Cash on Delivery' && getPaymentInfo() && getPaymentInfo().qrCode && (
              <div className="seller-qr-reference">
                <p>Upload a screenshot of your payment to:</p>
                <img 
                  src={`http://localhost:5000/uploads/${getPaymentInfo().qrCode}`} 
                  alt={`${paymentMethod} QR Code`}
                  style={{ maxWidth: '200px', margin: '10px 0' }}
                />
                {getPaymentInfo().number && (
                  <p>Account Number: {getPaymentInfo().number}</p>
                )}
              </div>
            )}
            {/* Show message for COD */}
            {paymentMethod === 'Cash on Delivery' && (
              <div className="cod-info">
                <p>No payment proof required. You will pay the delivery person upon receipt.</p>
              </div>
            )}
            {/* Only show upload input for digital methods */}
            {paymentMethod !== 'Cash on Delivery' && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="file-input"
                />
                {qrPreview && (
                  <div className="qr-preview">
                    <img src={qrPreview} alt="Payment proof" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="payment-step">
            <h4>Reference Number</h4>
            {/* Show message for COD */}
            {paymentMethod === 'Cash on Delivery' && (
              <p>No reference number required for Cash on Delivery.</p>
            )}
            {/* Only show input for digital methods */}
            {paymentMethod !== 'Cash on Delivery' && (
              <input
                type="text"
                placeholder="Enter transaction reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="reference-input"
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="modal-actions">
        <button
          className="btn-secondary"
          onClick={currentStep > 1 ? handlePrevStep : onCancel}
          disabled={isClosing}
        >
          {currentStep > 1 ? 'Back' : 'Cancel'}
        </button>
        <button
          className="btn-primary"
          onClick={handleNextStep}
          disabled={isClosing}
        >
          {currentStep < 3 ? 'Next' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
};

export default CartPage;