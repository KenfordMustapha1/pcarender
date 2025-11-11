// src/Components/StorePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useCart } from './CartContext'; // Import the CartContext
import './Storepage.css'; // Make sure this path is correct

function StorePage() {
  const { storeName } = useParams();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [messages, setMessages] = useState([]); // For buyer chat
  const [inboxMessages, setInboxMessages] = useState([]); // For seller inbox
  const [buyerConversations, setBuyerConversations] = useState([]);
  const [activeBuyerConversation, setActiveBuyerConversation] = useState(null);
  const [conversations, setConversations] = useState([]); // Seller conversations
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [buyerImagePreview, setBuyerImagePreview] = useState(null);
  const [totalSellerUnread, setTotalSellerUnread] = useState(0);

  // NEW STATE FOR DELETE CONFIRMATION
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null); // {type: 'buyer'/'seller', email: '...'}
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete

  // NEW STATE FOR SUCCESS MESSAGE
  const [successMessage, setSuccessMessage] = useState('');

  // NEW STATE FOR ADDING TO CART FROM STORE PAGE
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [cartToastMessage, setCartToastMessage] = useState('');
  const [showCartToast, setShowCartToast] = useState(false);
  const [stockError, setStockError] = useState('');

  const { addToCart } = useCart(); // Use the addToCart function from context

  const currentUserEmail = localStorage.getItem('email')?.trim() || null;
  const currentUserName = localStorage.getItem('name')?.trim() || 'User';
  const sellerEmail = decodeURIComponent(storeName);
  const isOwnStore = currentUserEmail &&
                     currentUserEmail.toLowerCase() === sellerEmail.toLowerCase();

  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const buyerFileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, inboxMessages]);

  // Socket setup
  useEffect(() => {
    if (!currentUserEmail) return;
    socket.current = io('http://localhost:5000');

    const handleReceiveMessage = (msg) => {
      if (!isOwnStore) {
        setBuyerConversations(prev => {
          const exists = prev.find(c => c.sellerEmail === msg.from);
          if (exists) {
            return prev.map(c =>
              c.sellerEmail === msg.from
                ? { ...c, lastMessage: msg.text || '🖼️ Image' }
                : c
            );
          } else {
            return [
              ...prev,
              {
                sellerEmail: msg.from,
                sellerName: 'Unknown Seller',
                lastMessage: msg.text || '🖼️ Image',
                timestamp: msg.timestamp || new Date()
              }
            ];
          }
        });
      }
      if (isOwnStore && activeConversation && msg.from === activeConversation.buyerEmail) {
        setInboxMessages(prev => [...prev, { ...msg, timestamp: msg.timestamp || new Date() }]);
      }
    };

    const handleReceiveImage = (msg) => {
      if (!isOwnStore) {
        setBuyerConversations(prev => {
          const exists = prev.find(c => c.sellerEmail === msg.from);
          if (exists) {
            return prev.map(c =>
              c.sellerEmail === msg.from
                ? { ...c, lastMessage: '🖼️ Image' }
                : c
            );
          } else {
            return [
              ...prev,
              {
                sellerEmail: msg.from,
                sellerName: 'Unknown Seller',
                lastMessage: '🖼️ Image',
                timestamp: msg.timestamp || new Date()
              }
            ];
          }
        });
      }
      if (isOwnStore && activeConversation && msg.from === activeConversation.buyerEmail) {
        setInboxMessages(prev => [...prev, { ...msg, timestamp: msg.timestamp || new Date() }]);
      }
    };

    socket.current.on('receive-message', handleReceiveMessage);
    socket.current.on('receive-image', handleReceiveImage);

    return () => {
      socket.current?.off('receive-message', handleReceiveMessage);
      socket.current?.off('receive-image', handleReceiveImage);
      socket.current?.disconnect();
    };
  }, [isOwnStore, currentUserEmail, activeConversation, activeBuyerConversation]);

  // Fetch store data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = decodeURIComponent(storeName);
        const [sellerRes, productsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/seller?email=${encodeURIComponent(email)}`),
          fetch(`http://localhost:5000/api/products?store=${encodeURIComponent(email)}`)
        ]);

        if (!sellerRes.ok) throw new Error('Seller not found');
        const sellerData = await sellerRes.json();
        const productsData = await productsRes.json();

        setSellerInfo(sellerData);
        setProducts(productsData);

        const followersRes = await fetch(`http://localhost:5000/api/followers?seller=${encodeURIComponent(email)}`);
        if (followersRes.ok) {
          const followersData = await followersRes.json();
          setFollowers(followersData.followers || []);
          setFollowerCount(followersData.followers?.length || 0);
        }

        if (currentUserEmail) {
          const isFollowingRes = await fetch(
            `http://localhost:5000/api/is-following?follower=${encodeURIComponent(currentUserEmail)}&seller=${encodeURIComponent(email)}`
          );
          if (isFollowingRes.ok) {
            const isFollowingData = await isFollowingRes.json();
            setIsFollowing(isFollowingData.isFollowing === true);
          }

          // Fetch buyer conversations (existing ones)
          if (!isOwnStore) {
            const buyerInboxRes = await fetch(`http://localhost:5000/api/buyer/inbox?buyerEmail=${encodeURIComponent(currentUserEmail)}`);
            if (buyerInboxRes.ok) {
              const data = await buyerInboxRes.json();
              setBuyerConversations(data.conversations || []);
            }
          }

          // Fetch seller inbox
          if (isOwnStore) {
            const sellerInboxRes = await fetch(`http://localhost:5000/api/seller/inbox?sellerEmail=${encodeURIComponent(currentUserEmail)}`);
            if (sellerInboxRes.ok) {
              const data = await sellerInboxRes.json();
              setConversations(data.conversations || []);
              const total = (data.conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
              setTotalSellerUnread(total);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load store.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeName, currentUserEmail, isOwnStore]);

  const handleFollowToggle = async () => {
    if (!currentUserEmail) {
      alert('Please log in to follow this seller.');
      return;
    }
    if (isOwnStore) {
      alert('You cannot follow your own store.');
      return;
    }
    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? '/api/unfollow' : '/api/follow';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerEmail: currentUserEmail, sellerEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update follow status');
      }

      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);

      if (showFollowers) {
        const followersRes = await fetch(`http://localhost:5000/api/followers?seller=${encodeURIComponent(sellerEmail)}`);
        if (followersRes.ok) {
          const followersData = await followersRes.json();
          setFollowers(followersData.followers || []);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // ✅ FIXED: Open chat for buyer — auto-create conversation with current seller
  const openChat = async () => {
    if (!currentUserEmail) {
      alert('Please log in to chat.');
      return;
    }
    if (isOwnStore) {
      setShowInbox(true);
    } else {
      // Create conversation object for current seller
      const currentSellerConv = {
        sellerEmail: sellerEmail,
        sellerName: sellerInfo?.name || 'Seller',
        lastMessage: 'Start a conversation...',
        timestamp: new Date()
      };

      // Activate this conversation
      setActiveBuyerConversation(currentSellerConv);
      setShowChat(true);

      // Load any existing messages
      try {
        const res = await fetch(
          `http://localhost:5000/api/chat?user1=${encodeURIComponent(currentUserEmail)}&user2=${encodeURIComponent(sellerEmail)}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setMessages([]);
      }

      // Join socket room
      socket.current.emit('join-chat', {
        buyerEmail: currentUserEmail,
        sellerEmail: sellerEmail
      });
    }
  };

  // Buyer opens a conversation (from list)
  const openBuyerConversation = async (conversation) => {
    setActiveBuyerConversation(conversation);
    socket.current.emit('join-chat', {
      buyerEmail: currentUserEmail,
      sellerEmail: conversation.sellerEmail
    });
    const res = await fetch(
      `http://localhost:5000/api/chat?user1=${encodeURIComponent(currentUserEmail)}&user2=${encodeURIComponent(conversation.sellerEmail)}`
    );
    const data = await res.json();
    setMessages(data.messages || []);
  };

  // Seller opens conversation
  const openConversation = async (conversation) => {
    if (conversation.unreadCount > 0) {
      await fetch('http://localhost:5000/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail: conversation.buyerEmail,
          sellerEmail: currentUserEmail
        })
      });

      const newUnread = conversation.unreadCount;
      setConversations(prev =>
        prev.map(c =>
          c.buyerEmail === conversation.buyerEmail
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
      setTotalSellerUnread(prev => Math.max(0, prev - newUnread));
    }

    setActiveConversation(conversation);
    socket.current.emit('join-chat', {
      buyerEmail: conversation.buyerEmail,
      sellerEmail: currentUserEmail
    });
    const res = await fetch(
      `http://localhost:5000/api/chat?user1=${encodeURIComponent(currentUserEmail)}&user2=${encodeURIComponent(conversation.buyerEmail)}`
    );
    const data = await res.json();
    setInboxMessages(data.messages || []);
  };

  // === SEND MESSAGE LOGIC ===
  const handleInboxSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !activeConversation) return;

    try {
      if (newMessage.trim()) {
        const optimisticMsg = {
          from: currentUserEmail,
          to: activeConversation.buyerEmail,
          text: newMessage,
          type: 'text',
          timestamp: new Date(),
          read: false
        };
        setInboxMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        socket.current.emit('send-message', {
          buyerEmail: activeConversation.buyerEmail,
          sellerEmail: currentUserEmail,
          text: newMessage,
          sender: currentUserEmail
        });
      }

      if (imagePreview) {
        const formData = new FormData();
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], 'chat-image.jpg', { type: 'image/jpeg' });
        formData.append('image', file);
        formData.append('from', currentUserEmail);
        formData.append('to', activeConversation.buyerEmail);

        const res = await fetch('http://localhost:5000/api/messages/image', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          const imageMsg = {
            from: currentUserEmail,
            to: activeConversation.buyerEmail,
            imageUrl: data.imageUrl,
            type: 'image',
            timestamp: new Date(),
            read: false
          };
          setInboxMessages(prev => [...prev, imageMsg]);
          setImagePreview(null);
        } else {
          throw new Error('Failed to send image');
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !buyerImagePreview) || !activeBuyerConversation) return;

    try {
      if (newMessage.trim()) {
        const optimisticMsg = {
          from: currentUserEmail,
          to: activeBuyerConversation.sellerEmail,
          text: newMessage,
          type: 'text',
          timestamp: new Date(),
          read: false
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        socket.current.emit('send-message', {
          buyerEmail: currentUserEmail,
          sellerEmail: activeBuyerConversation.sellerEmail,
          text: newMessage,
          sender: currentUserEmail
        });
      }

      if (buyerImagePreview) {
        const formData = new FormData();
        const response = await fetch(buyerImagePreview);
        const blob = await response.blob();
        const file = new File([blob], 'chat-image.jpg', { type: 'image/jpeg' });
        formData.append('image', file);
        formData.append('from', currentUserEmail);
        formData.append('to', activeBuyerConversation.sellerEmail);

        const res = await fetch('http://localhost:5000/api/messages/image', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          const imageMsg = {
            from: currentUserEmail,
            to: activeBuyerConversation.sellerEmail,
            imageUrl: data.imageUrl,
            type: 'image',
            timestamp: new Date(),
            read: false
          };
          setMessages(prev => [...prev, imageMsg]);
          setBuyerImagePreview(null);
        } else {
          throw new Error('Failed to send image');
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // === IMAGE HANDLERS ===
  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerBuyerFileInput = () => buyerFileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBuyerImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setBuyerImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearBuyerImagePreview = () => {
    setBuyerImagePreview(null);
    if (buyerFileInputRef.current) buyerFileInputRef.current.value = '';
  };

  // NEW FUNCTION: Delete Conversation
  const deleteConversation = async () => {
    if (!conversationToDelete || !currentUserEmail) return;
    setIsDeleting(true);
    try {
      const { type, email } = conversationToDelete;
      let targetEmail = email; // The email of the other user in the conversation
      // Determine the correct target email based on the conversation type
      let user1, user2;
      if (type === 'buyer') {
        // Current user is buyer, target is seller
        user1 = currentUserEmail;
        user2 = targetEmail;
      } else if (type === 'seller') {
        // Current user is seller, target is buyer
        user1 = currentUserEmail;
        user2 = targetEmail;
      } else {
        throw new Error("Invalid conversation type for deletion");
      }
      const response = await fetch(`http://localhost:5000/api/conversations/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Include credentials if necessary for authentication
          // 'Authorization': `Bearer ${token}` // If using tokens
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete conversation');
      }
      // Update state based on the type of conversation being deleted
      if (type === 'buyer') {
        // Update buyer conversations list
        setBuyerConversations(prev => prev.filter(c => c.sellerEmail !== targetEmail));
        // If the active conversation is the one being deleted, clear it
        if (activeBuyerConversation && activeBuyerConversation.sellerEmail === targetEmail) {
          setMessages([]); // Clear displayed messages
          setActiveBuyerConversation(null); // Clear active conversation
        }
      } else if (type === 'seller') {
        // Update seller conversations list
        setConversations(prev => prev.filter(c => c.buyerEmail !== targetEmail));
        // If the active conversation is the one being deleted, clear it
        if (activeConversation && activeConversation.buyerEmail === targetEmail) {
          setInboxMessages([]); // Clear displayed messages
          setActiveConversation(null); // Clear active conversation
        }
        // Update total unread count if necessary
        const deletedConv = conversations.find(c => c.buyerEmail === targetEmail);
        if (deletedConv && deletedConv.unreadCount > 0) {
            setTotalSellerUnread(prev => Math.max(0, prev - deletedConv.unreadCount));
        }
      }
      // Set success message state instead of alert
      setSuccessMessage('Conversation deleted successfully.');
      // Optional: Clear the success message after a few seconds
      setTimeout(() => {
         setSuccessMessage('');
      }, 3000); // Clears after 3 seconds

    } catch (err) {
      console.error('Delete conversation error:', err);
      alert(err.message || 'Failed to delete conversation. Please try again.'); // Keep alert for errors if desired
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setConversationToDelete(null); // Clear the stored conversation details
    }
  };

  // NEW FUNCTION: Open Delete Confirmation
  const openDeleteConfirmation = (type, email) => {
    setConversationToDelete({ type, email });
    setShowDeleteConfirmation(true);
  };

  // NEW FUNCTION: Close Delete Confirmation
  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setConversationToDelete(null);
  };

  // NEW FUNCTIONS: Handle adding product from Store Page
  const handleProductClick = (product) => {
    if (!product || !product.sizes || Object.keys(product.sizes).length === 0) return;
    setSelectedProduct(product);
    const sizes = Object.keys(product.sizes);
    setSelectedSize(sizes[0]);
    setQuantity(1);
    setStockError('');
  };

  const handleAddToCartFromStore = () => {
    if (!selectedProduct) return;

    // Check if the current user is the seller of this product
    if (currentUserEmail && selectedProduct.store.toLowerCase() === currentUserEmail.toLowerCase()) {
        setCartToastMessage("You cannot add your own product to the cart.");
        setShowCartToast(true);
        setTimeout(() => setShowCartToast(false), 3000);
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
    setCartToastMessage(`${quantity} × ${selectedProduct.name} (${selectedSize}) added to cart!`);
    setShowCartToast(true);
    setTimeout(() => setShowCartToast(false), 3000);
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

  // === LOADING / ERROR UI ===
  if (loading) {
    return (
      <div className="store-page">
        <div className="profile-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-info">
            <div className="skeleton-line short"></div>
            <div className="skeleton-line badge"></div>
          </div>
        </div>
        <div className="products-skeleton">
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line long"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-page error-view">
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h2>Store Not Found</h2>
          <p>{error}</p>
          <button onClick={() => window.history.back()} className="btn-primary">← Back to Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      {/* Render Success Message if state exists */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Render Cart Toast Message if state exists */}
      {showCartToast && (
        <div className="toast-notification">
          <div className="toast-icon">⚠️</div> {/* Changed icon for user error */}
          <div className="toast-message">{cartToastMessage}</div>
        </div>
      )}

      <div className="store-banner">
        <div className="store-header">
          <div className="seller-profile">
            <div className="avatar-placeholder">
              {getInitials(sellerInfo.name)}
            </div>
            <div className="seller-details">
              <h1 className="store-name">{sellerInfo.name}'s Store</h1>
              <div className={`verified-badge ${sellerInfo.isApproved ? 'active' : ''}`}>
                {sellerInfo.isApproved ? '✓ Verified Seller' : '⏳ Pending Approval'}
              </div>
            </div>
          </div>
          <div className="seller-actions">
            {!isOwnStore && (
              <button
                className={`btn-follow ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                <span>{isFollowing ? '✓' : '+'}</span>
                {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
              </button>
            )}
            {isOwnStore && (
              <button className="btn-own-store" disabled>🏪 Your Store</button>
            )}
            <button className="btn-chat" onClick={openChat}>
              💬 Chat
              {(isOwnStore && totalSellerUnread > 0) && (
                <span className="chat-unread-badge">{totalSellerUnread}</span>
              )}
            </button>
          </div>
        </div>
        <div className="seller-stats">
          <div className="stat-item">
            <span className="icon">📦</span>
            <span className="label">Products:</span>
            <span className="value">{products.length}</span>
          </div>
          <div
            className="stat-item clickable"
            onClick={() => setShowFollowers(!showFollowers)}
          >
            <span className="icon">👥</span>
            <span className="label">Followers:</span>
            <span className="value">{followerCount}</span>
          </div>
          <div className="stat-item">
            <span className="icon">⭐</span>
            <span className="label">Rating:</span>
            <span className="value">0 Ratings</span>
          </div>
          <div className="stat-item">
            <span className="icon">💬</span>
            <span className="label">Chat Response:</span>
            <span className="value">Fast</span>
          </div>
          <div className="stat-item">
            <span className="icon">📅</span>
            <span className="label">Joined:</span>
            <span className="value">57 Days Ago</span>
          </div>
        </div>

        {showFollowers && (
          <div className="followers-modal">
            <div className="followers-header">
              <h3>Followers ({followerCount})</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowFollowers(false)}
              >✕</button>
            </div>
            <div className="followers-list">
              {followers.length === 0 ? (
                <p className="no-followers">No followers yet</p>
              ) : (
                followers.map((follower, index) => (
                  <div key={index} className="follower-item">
                    <div className="follower-avatar">
                      {getInitials(follower.name)}
                    </div>
                    <div className="follower-info">
                      <div className="follower-name">{follower.name}</div>
                      <div className="follower-email">{follower.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BUYER CHAT MODAL */}
        {showChat && !isOwnStore && (
          <div className="chat-modal-overlay" onClick={() => {
            setShowChat(false);
            setBuyerImagePreview(null);
            setActiveBuyerConversation(null);
          }}>
            <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
              <div className="chat-header">
                <h3>💬 Messages</h3>
                <button className="close-modal-btn" onClick={() => {
                  setShowChat(false);
                  setBuyerImagePreview(null);
                  setActiveBuyerConversation(null);
                }}>✕</button>
              </div>
              <div className="inbox-layout">
                <div className="conversations-list">
                  <h4>Your Chats</h4>
                  {buyerConversations.length === 0 ? (
                    <p className="no-conversations">No chats yet</p>
                  ) : (
                    buyerConversations.map(conv => (
                      <div
                        key={conv.sellerEmail}
                        className={`conversation-item ${activeBuyerConversation?.sellerEmail === conv.sellerEmail ? 'active' : ''}`}
                        onClick={() => openBuyerConversation(conv)}
                      >
                        <div className="conv-avatar">
                          {getInitials(conv.sellerName)}
                        </div>
                        <div className="conv-info">
                          <div className="conv-name-and-delete"> {/* Wrap name and delete button */}
                            <strong>{conv.sellerName}</strong>
                            <button
                              className="delete-conversation-btn" // Add a CSS class
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the conversation open
                                openDeleteConfirmation('buyer', conv.sellerEmail);
                              }}
                              title="Delete Conversation"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="last-message">{conv.lastMessage || 'No messages'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-area">
                  {activeBuyerConversation ? (
                    <>
                      <div className="chat-header-small">
                        <div className="message-avatar">
                          {getInitials(activeBuyerConversation.sellerName)}
                        </div>
                        {activeBuyerConversation.sellerName}
                      </div>
                      <div className="chat-messages">
                        {messages.map((msg, i) => (
                          <div
                            key={i}
                            className={`message ${msg.from === currentUserEmail ? 'sent' : 'received'}`}
                          >
                            <div className="message-avatar">
                              {msg.from === currentUserEmail
                                ? getInitials(currentUserName)
                                : getInitials(activeBuyerConversation.sellerName)}
                            </div>
                            <div className="message-content">
                              {msg.type === 'image' ? (
                                <img
                                  src={msg.imageUrl?.startsWith('http')
                                    ? msg.imageUrl
                                    : `http://localhost:5000/uploads/${msg.imageUrl}`}
                                  alt="Sent"
                                  className="message-image"
                                  onLoad={() => console.log('Message image loaded successfully:', msg.imageUrl)}
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
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      <form className="chat-input" onSubmit={handleSendMessage}>
                        <input
                          type="file"
                          ref={buyerFileInputRef}
                          onChange={handleBuyerImageChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="attach-btn"
                          onClick={triggerBuyerFileInput}
                          aria-label="Attach image"
                        >
                          +
                        </button>
                        <div className="input-wrapper">
                          {buyerImagePreview && (
                            <div className="image-preview">
                              <img src={buyerImagePreview} alt="Preview" />
                              <button type="button" className="remove-image" onClick={clearBuyerImagePreview}>✕</button>
                            </div>
                          )}
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={buyerImagePreview ? "Add a caption..." : "Type a message..."}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!newMessage.trim() && !buyerImagePreview}
                          className="send-btn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="empty-chat">
                      <p>Select a seller to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SELLER INBOX */}
        {showInbox && isOwnStore && (
          <div className="chat-modal-overlay" onClick={() => {
            setShowInbox(false);
            setActiveConversation(null);
            setImagePreview(null);
          }}>
            <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
              <div className="chat-header">
                <h3>💬 Messages</h3>
                <button className="close-modal-btn" onClick={() => {
                  setShowInbox(false);
                  setActiveConversation(null);
                  setImagePreview(null);
                }}>✕</button>
              </div>
              <div className="inbox-layout">
                <div className="conversations-list">
                  <h4>Chats ({conversations.length})</h4>
                  {conversations.length === 0 ? (
                    <p className="no-conversations">No messages yet</p>
                  ) : (
                    conversations.map(conv => (
                      <div
                        key={conv.buyerEmail}
                        className={`conversation-item ${activeConversation?.buyerEmail === conv.buyerEmail ? 'active' : ''}`}
                        onClick={() => openConversation(conv)}
                      >
                        <div className="conv-avatar">
                          {getInitials(conv.buyerName)}
                        </div>
                        <div className="conv-info">
                          <div className="conv-name-and-delete"> {/* Wrap name and delete button */}
                            <strong>{conv.buyerName}</strong>
                            <button
                              className="delete-conversation-btn" // Add a CSS class
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the conversation open
                                openDeleteConfirmation('seller', conv.buyerEmail);
                              }}
                              title="Delete Conversation"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="last-message">{conv.lastMessage || 'No messages'}</div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-area">
                  {activeConversation ? (
                    <>
                      <div className="chat-header-small">
                        <div className="message-avatar">
                          {getInitials(activeConversation.buyerName)}
                        </div>
                        {activeConversation.buyerName}
                      </div>
                      <div className="chat-messages">
                        {inboxMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`message ${msg.from === currentUserEmail ? 'sent' : 'received'}`}
                          >
                            <div className="message-avatar">
                              {msg.from === currentUserEmail
                                ? getInitials(sellerInfo.name)
                                : getInitials(activeConversation.buyerName)}
                            </div>
                            <div className="message-content">
                              {msg.type === 'image' ? (
                                <img
                                  src={msg.imageUrl?.startsWith('http')
                                    ? msg.imageUrl
                                    : `http://localhost:5000/uploads/${msg.imageUrl}`}
                                  alt="Sent"
                                  className="message-image"
                                  onLoad={() => console.log('Message image loaded successfully:', msg.imageUrl)}
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
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      <form className="chat-input" onSubmit={handleInboxSendMessage}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="attach-btn"
                          onClick={triggerFileInput}
                          aria-label="Attach image"
                        >
                          +
                        </button>
                        <div className="input-wrapper">
                          {imagePreview && (
                            <div className="image-preview">
                              <img src={imagePreview} alt="Preview" />
                              <button type="button" className="remove-image" onClick={clearImagePreview}>✕</button>
                            </div>
                          )}
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={imagePreview ? "Add a caption..." : "Type a message..."}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!newMessage.trim() && !imagePreview}
                          className="send-btn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="empty-chat">
                      <p>Select a conversation to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteConfirmation && (
          <div className="delete-confirmation-overlay">
            <div className="delete-confirmation-modal">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this entire conversation? This action cannot be undone.</p>
              <div className="delete-confirmation-buttons">
                <button
                  className="btn btn-danger"
                  onClick={deleteConversation}
                  disabled={isDeleting} // Disable during deletion
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={closeDeleteConfirmation}
                  disabled={isDeleting} // Disable during deletion
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW MODAL: Product Detail for Adding to Cart from Store Page */}
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
                      <span className="store-link">{selectedProduct.store}</span>
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
                  onClick={handleAddToCartFromStore}
                  disabled={selectedProduct.quantity <= 0}
                >
                  {selectedProduct.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <div className="products-section">
        <div className="section-header">
          <h2>All Products ({products.length})</h2>
        </div>
        {products.length === 0 ? (
          <div className="empty-products">
            <div className="empty-icon">📦</div>
            <p>This seller hasn't listed any approved products yet.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card" onClick={() => handleProductClick(product)} role="button" tabIndex={0}>
                <div className="product-image">
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    onLoad={() => console.log('Product image loaded successfully:', product.image)}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'}
                  />
                </div>
                <div className="product-details">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">₱{Object.values(product.sizes)[0]?.toFixed(2) || '0.00'}</span>
                    <span className="product-stock">Stock: {product.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="page-footer">
        <button onClick={() => window.history.back()} className="btn-outline">
          ← Back to Marketplace
        </button>
      </div>
    </div>
  );
}

export default StorePage;