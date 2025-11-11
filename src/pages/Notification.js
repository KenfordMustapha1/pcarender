// src/pages/Notification.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../Components/AuthContext'; // ✅ FIXED IMPORT PATH
import io from 'socket.io-client';
import './Notification.css';

const Notification = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // ✅ Fetch notifications wrapped in useCallback to fix ESLint warning
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/notifications?userEmail=${encodeURIComponent(currentUser.email)}`
      );
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [currentUser]);

  // ✅ Initialize socket connection
  useEffect(() => {
    if (!currentUser?.email) return;

    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current.on('new-notification', (data) => {
      if (data.userEmail === currentUser.email) {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Optional: show browser notification
        if (window.Notification && Notification.permission === 'granted') {
          new Notification(data.notification.title, {
            body: data.notification.message,
            icon: '/logo192.png',
          });
        }
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser]);

  // ✅ Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();

    // Request browser notification permission
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUser.email }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        const wasUnread = notifications.find((n) => n._id === notificationId)?.isRead === false;
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'product_approved':
        return '✅';
      case 'product_rejected':
        return '❌';
      case 'new_order':
        return '🛒';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <FaBell size={48} color="#ccc" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">{formatTimestamp(notif.createdAt)}</div>
                  </div>
                  <button
                    className="delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif._id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
