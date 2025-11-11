// src/Components/Navbar2.js
import React, { useState, useRef, useEffect } from 'react';
import { FaComment } from 'react-icons/fa';
import { useLocation, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import {
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
  FaCogs,
  FaClipboardList
} from 'react-icons/fa';
import { Link as RouterLink } from "react-router-dom";
import "./Navbar2.css";
import logo1 from '../images/image3.png';
import { useCart } from '../Components/CartContext';
import Notification from '../pages/Notification';
import { useAuth } from '../Components/AuthContext';
import io from 'socket.io-client';

const Navbar2 = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const chatDropdownRef = useRef(null);
  const socketRef = useRef(null);
  const { cartItems } = useCart();
  const { currentUser, logout: authLogout } = useAuth();

  // Chat notification states
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [isSellerView, setIsSellerView] = useState(false);

  const getUserName = () => {
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    authLogout();
    navigate("/login");
  };

  // Check if current user is a seller
  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!currentUser?.email) return;
      
      try {
        const res = await fetch(
          `http://localhost:5000/api/seller?email=${encodeURIComponent(currentUser.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setIsSellerView(data.exists && data.isApproved);
        }
      } catch (err) {
        console.error('Error checking seller status:', err);
      }
    };
    
    checkSellerStatus();
  }, [currentUser]);

  // Fetch conversations and unread counts
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser?.email) return;

      try {
        let endpoint;
        if (isSellerView) {
          endpoint = `http://localhost:5000/api/seller/inbox?sellerEmail=${encodeURIComponent(currentUser.email)}`;
        } else {
          endpoint = `http://localhost:5000/api/buyer/inbox?buyerEmail=${encodeURIComponent(currentUser.email)}`;
        }

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const convos = data.conversations || [];
          setConversations(convos);

          // Calculate total unread (for sellers AND buyers now)
          const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setTotalUnreadMessages(total);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };

    fetchConversations();

    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [currentUser, isSellerView]);

  // Socket.io for real-time updates
  useEffect(() => {
    if (!currentUser?.email) return;

    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('receive-message', (msg) => {
      // Only update if the message is TO the current user
      if (msg.to !== currentUser.email) return;

      setConversations(prev => {
        const updatedConvos = [...prev];
        let found = false;

        if (isSellerView) {
          const index = updatedConvos.findIndex(c => c.buyerEmail === msg.from);
          if (index >= 0) {
            updatedConvos[index] = {
              ...updatedConvos[index],
              lastMessage: msg.text || '🖼️ Image',
              lastMessageFrom: msg.from,
              unreadCount: (updatedConvos[index].unreadCount || 0) + 1,
              timestamp: new Date()
            };
            found = true;
          }
        } else {
          const index = updatedConvos.findIndex(c => c.sellerEmail === msg.from);
          if (index >= 0) {
            updatedConvos[index] = {
              ...updatedConvos[index],
              lastMessage: msg.text || '🖼️ Image',
              lastMessageFrom: msg.from,
              unreadCount: (updatedConvos[index].unreadCount || 0) + 1,
              timestamp: new Date()
            };
            found = true;
          }
        }

        if (!found && isSellerView && msg.from !== currentUser.email) {
          updatedConvos.unshift({
            buyerEmail: msg.from,
            buyerName: msg.from.split('@')[0],
            lastMessage: msg.text || '🖼️ Image',
            lastMessageFrom: msg.from,
            unreadCount: 1,
            timestamp: new Date()
          });
        } else if (!found && !isSellerView && msg.from !== currentUser.email) {
          updatedConvos.unshift({
            sellerEmail: msg.from,
            sellerName: msg.from.split('@')[0],
            lastMessage: msg.text || '🖼️ Image',
            lastMessageFrom: msg.from,
            unreadCount: 1,
            timestamp: new Date()
          });
        }

        return updatedConvos;
      });

      // Increment total unread
      setTotalUnreadMessages(prev => prev + 1);
    });

    socketRef.current.on('receive-image', (msg) => {
      // Only update if the message is TO the current user
      if (msg.to !== currentUser.email) return;

      setConversations(prev => {
        const updatedConvos = [...prev];
        
        if (isSellerView) {
          const index = updatedConvos.findIndex(c => c.buyerEmail === msg.from);
          if (index >= 0) {
            updatedConvos[index] = {
              ...updatedConvos[index],
              lastMessage: '🖼️ Image',
              lastMessageFrom: msg.from,
              unreadCount: (updatedConvos[index].unreadCount || 0) + 1,
              timestamp: new Date()
            };
          }
        } else {
          const index = updatedConvos.findIndex(c => c.sellerEmail === msg.from);
          if (index >= 0) {
            updatedConvos[index] = {
              ...updatedConvos[index],
              lastMessage: '🖼️ Image',
              lastMessageFrom: msg.from,
              unreadCount: (updatedConvos[index].unreadCount || 0) + 1,
              timestamp: new Date()
            };
          }
        }
        
        return updatedConvos;
      });

      // Increment total unread
      setTotalUnreadMessages(prev => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser, isSellerView]);

  // Handle conversation click with unread mark and navigation
  const handleConversationClick = async (conversation) => {
    if (isSellerView) {
      // Mark messages as read for seller
      if (conversation.unreadCount > 0) {
        try {
          await fetch('http://localhost:5000/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              buyerEmail: conversation.buyerEmail, 
              sellerEmail: currentUser.email 
            })
          });

          // Update local state
          const unreadCount = conversation.unreadCount;
          setConversations(prev =>
            prev.map(c => 
              c.buyerEmail === conversation.buyerEmail 
                ? { ...c, unreadCount: 0 } 
                : c
            )
          );
          setTotalUnreadMessages(prev => Math.max(0, prev - unreadCount));
        } catch (err) {
          console.error('Failed to mark messages as read:', err);
        }
      }
      
      // Navigate to own store
      navigate(`/store/${encodeURIComponent(currentUser.email)}`);
    } else {
      // Buyer clicking on seller
      if (conversation.unreadCount > 0) {
        try {
          await fetch('http://localhost:5000/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              buyerEmail: currentUser.email, 
              sellerEmail: conversation.sellerEmail 
            })
          });

          // Update local state
          const unreadCount = conversation.unreadCount;
          setConversations(prev =>
            prev.map(c => 
              c.sellerEmail === conversation.sellerEmail 
                ? { ...c, unreadCount: 0 } 
                : c
            )
          );
          setTotalUnreadMessages(prev => Math.max(0, prev - unreadCount));
        } catch (err) {
          console.error('Failed to mark messages as read:', err);
        }
      }
      
      // Navigate to seller's store
      navigate(`/store/${encodeURIComponent(conversation.sellerEmail)}`);
    }
    
    setShowChatDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (chatDropdownRef.current && !chatDropdownRef.current.contains(event.target)) {
        setShowChatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Determine if message was sent or received
  const getMessageDirection = (conversation) => {
    if (!conversation.lastMessageFrom) return '';
    
    if (conversation.lastMessageFrom === currentUser.email) {
      return 'You: ';
    }
    return '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo1} alt="PCA Logo" className="logo-image" />
      </div>

      <ul className="navbar-links">
        {isHomePage ? (
          <>
            <li><ScrollLink to="home" smooth={true} duration={800} offset={-80}>Home</ScrollLink></li>
            <li><ScrollLink to="about" smooth={true} duration={800} offset={-80}>About</ScrollLink></li>
            <li><ScrollLink to="contact-us" smooth={true} duration={800} offset={-80}>Contact Us</ScrollLink></li>
          </>
        ) : (
          <>
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/">About</RouterLink></li>
            <li><RouterLink to="/">Contact Us</RouterLink></li>
          </>
        )}
        <li><RouterLink to="/market">Market</RouterLink></li>
      </ul>

      <div className="navbar-auth">
        <RouterLink to="/cartpage" className="navbar-icon cart-icon-with-count">
          <FaShoppingCart />
          {cartItems.length > 0 && (
            <span className="cart-count">{cartItems.length}</span>
          )}
        </RouterLink>

        <Notification />
        
        {/* CHAT ICON WITH DROPDOWN */}
        <div className="chat-dropdown-wrapper" ref={chatDropdownRef}>
          <button 
            className="navbar-icon chat-icon-btn"
            onClick={() => setShowChatDropdown(!showChatDropdown)}
          >
            <FaComment />
            {totalUnreadMessages > 0 && (
              <span className="chat-count">{totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}</span>
            )}
          </button>

          {showChatDropdown && (
            <div className="chat-dropdown-menu">
              <div className="chat-dropdown-header">
                <h3>💬 Messages</h3>
                {totalUnreadMessages > 0 && (
                  <span className="unread-badge">{totalUnreadMessages} unread</span>
                )}
              </div>

              <div className="chat-conversations-list">
                {conversations.length === 0 ? (
                  <div className="no-conversations">
                    <FaComment size={48} color="#ccc" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  conversations.map((conv, index) => (
                    <div
                      key={index}
                      className="chat-conversation-item"
                      onClick={() => handleConversationClick(conv)}
                    >
                      <div className="chat-conv-avatar">
                        {isSellerView 
                          ? getInitials(conv.buyerName || conv.buyerEmail)
                          : getInitials(conv.sellerName || conv.sellerEmail)
                        }
                      </div>
                      <div className="chat-conv-info">
                        <div className="chat-conv-name">
                          {isSellerView 
                            ? (conv.buyerName || conv.buyerEmail.split('@')[0])
                            : (conv.sellerName || conv.sellerEmail.split('@')[0])
                          }
                        </div>
                        <div className="chat-conv-last-message">
                          <span className="message-prefix">{getMessageDirection(conv)}</span>
                          {conv.lastMessage || 'No messages'}
                        </div>
                        <div className="chat-conv-time">
                          {formatTimestamp(conv.timestamp)}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="chat-conv-unread">{conv.unreadCount}</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="chat-dropdown-footer">
                <p className="chat-hint">
                  {isSellerView 
                    ? 'Click to view conversation in your store' 
                    : 'Click to open chat with seller'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown-wrapper" ref={dropdownRef}>
          {(() => {
                const profileImage = localStorage.getItem('profileImage');
                const initial = currentUser?.email 
                  ? currentUser.email.charAt(0).toUpperCase() 
                  : 'U';

                return profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="navbar-profile-avatar"
                    onClick={() => setShowDropdown(!showDropdown)}
                  />
                ) : (
                  <div
                    className="navbar-profile-initial"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {initial}
                  </div>
                );
              })()}
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-user-avatar">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <div className="dropdown-user-info">
                  <div className="dropdown-username">{getUserName()}</div>
                  <div className="dropdown-user-email">{currentUser?.email}</div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <RouterLink 
                to="/account/my-profile" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FaUser className="dropdown-icon" /> My Account
              </RouterLink>
              <RouterLink 
                to="/account/privacy-settings" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FaCogs className="dropdown-icon" /> Settings
              </RouterLink>
              <RouterLink 
                to="/registrationpage" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FaClipboardList className="dropdown-icon" /> Application
              </RouterLink>
              <RouterLink 
                to="/permit-application" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FaClipboardList className="dropdown-icon" /> Permit Application
              </RouterLink>
              
              <div className="dropdown-divider"></div>
              
              <button 
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }} 
                className="dropdown-item logout-button"
              >
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;