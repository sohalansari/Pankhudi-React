import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationDropdown.css';

const NotificationDropdown = ({ userId, userName }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/reviews/notifications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/reviews/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/reviews/notifications/${userId}/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, is_read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId, e) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/reviews/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            if (notifications.find(n => n.id === notificationId && !n.is_read)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Navigate to product page with review section
        if (notification.product_id) {
            navigate(`/ProductDetail/${notification.product_id}?scrollTo=reviews`);
        } else if (notification.review_id) {
            // If no product_id but has review_id, try to get product from review
            try {
                const token = localStorage.getItem('token');
                const reviewResponse = await axios.get(`http://localhost:5000/api/reviews/${notification.review_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (reviewResponse.data && reviewResponse.data.product_id) {
                    navigate(`/ProductDetail/${reviewResponse.data.product_id}?scrollTo=reviews`);
                }
            } catch (err) {
                console.error('Error fetching review details:', err);
                navigate('/');
            }
        } else {
            navigate('/');
        }

        setIsOpen(false);
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'reply':
                return '💬';
            case 'reply_mention':
                return '🔔';
            case 'admin_reply':
                return '🛡️';
            default:
                return '📢';
        }
    };

    // Get notification class based on type
    const getNotificationClass = (type) => {
        switch (type) {
            case 'reply':
                return 'notification-reply';
            case 'reply_mention':
                return 'notification-mention';
            case 'admin_reply':
                return 'notification-admin';
            default:
                return '';
        }
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return 'Just now';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Just now';

            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Just now';
        }
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Poll for new notifications when dropdown is open
    useEffect(() => {
        if (userId && isOpen) {
            fetchNotifications();
        }
    }, [userId, isOpen]);

    // Initial fetch and periodic refresh
    useEffect(() => {
        if (userId) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [userId]);

    if (!userId) return null;

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <button
                className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="mark-all-read">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading && notifications.length === 0 ? (
                            <div className="notification-loading">
                                <div className="spinner"></div>
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span>🔔</span>
                                <p>No notifications yet</p>
                                <small>When someone replies to your comments, you'll see them here</small>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.is_read ? 'unread' : ''} ${getNotificationClass(notification.type)}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-message">{notification.message}</p>
                                        <div className="notification-meta">
                                            <span className="notification-time">
                                                {formatTime(notification.created_at)}
                                            </span>
                                            {notification.product_name && (
                                                <span className="notification-product">
                                                    on {notification.product_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="notification-delete"
                                        onClick={(e) => deleteNotification(notification.id, e)}
                                        title="Delete"
                                        aria-label="Delete notification"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <Link to="/notifications" onClick={() => setIsOpen(false)}>
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;