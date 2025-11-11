// src/Components/SellerInbox.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './SellerInbox.css';

function SellerInbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const sellerEmail = localStorage.getItem('email');

  // Redirect if not logged in or not a seller
  useEffect(() => {
    if (!sellerEmail) {
      navigate('/login');
      return;
    }
    // Optional: verify seller status via API
  }, [sellerEmail, navigate]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      const res = await fetch(`http://localhost:5000/api/seller/inbox?sellerEmail=${encodeURIComponent(sellerEmail)}`);
      const data = await res.json();
      setConversations(data.conversations || []);
      setLoading(false);
    };
    loadConversations();
  }, [sellerEmail]);

  // Socket setup
  useEffect(() => {
    socket.current = io('http://localhost:5000');

   socket.current.on('receive-message', (msg) => {
  // Prevent duplicate messages from self
  if (msg.sender === sellerEmail) return;

  if (activeChat && msg.from === activeChat.buyerEmail) {
    setMessages(prev => [...prev, msg]);
  }

  // Refresh conversations list to reflect unread counts
  const loadConversations = async () => {
    const res = await fetch(`http://localhost:5000/api/seller/inbox?sellerEmail=${encodeURIComponent(sellerEmail)}`);
    const data = await res.json();
    setConversations(data.conversations || []);
  };
  loadConversations();
});


    return () => {
      socket.current?.disconnect();
    };
  }, [sellerEmail, activeChat]);

  const openConversation = async (conversation) => {
    setActiveChat(conversation);

    // Mark as read
    await fetch('http://localhost:5000/api/messages/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerEmail: conversation.buyerEmail, sellerEmail })
    });

    // Load full chat
    const res = await fetch(
      `http://localhost:5000/api/chat?user1=${encodeURIComponent(sellerEmail)}&user2=${encodeURIComponent(conversation.buyerEmail)}`
    );
    const data = await res.json();
    setMessages(data.messages || []);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      buyerEmail: activeChat.buyerEmail,
      sellerEmail: sellerEmail,
      text: newMessage,
      sender: sellerEmail
    };

    socket.current.emit('send-message', messageData);
    setMessages(prev => [...prev, { ...messageData, timestamp: new Date() }]);
    setNewMessage('');
  };

  if (loading) {
    return <div className="inbox-container">Loading conversations...</div>;
  }

  return (
    <div className="inbox-container">
      <h2>Seller Inbox</h2>

      <div className="inbox-layout">
        {/* Conversations List */}
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.buyerEmail}
                className={`conversation-item ${activeChat?.buyerEmail === conv.buyerEmail ? 'active' : ''}`}
                onClick={() => openConversation(conv)}
              >
                <div className="conv-info">
                  <strong>{conv.buyerName}</strong>
                  <div className="last-message">{conv.lastMessage}</div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="unread-badge">{conv.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeChat ? (
            <>
              <div className="chat-header">
                Chat with {activeChat.buyerName} ({activeChat.buyerEmail})
              </div>
              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`message ${msg.from === sellerEmail ? 'sent' : 'received'}`}
                  >
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a reply..."
                />
                <button type="submit">Send</button>
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
  );
}

export default SellerInbox;