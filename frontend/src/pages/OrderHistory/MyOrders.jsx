import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/user/orders`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#ff9800',
            'confirmed': '#4caf50',
            'processing': '#2196f3',
            'shipped': '#9c27b0',
            'delivered': '#4caf50',
            'cancelled': '#f44336'
        };
        return colors[status] || '#757575';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '🔄',
            'shipped': '📦',
            'delivered': '🎉',
            'cancelled': '❌'
        };
        return icons[status] || '📋';
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <h1>My Orders</h1>
                <p className="orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'} found</p>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="empty-state">
                        <span className="empty-icon">🛍️</span>
                        <h2>No orders yet</h2>
                        <p>Looks like you haven't placed any orders yet.</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/products')}
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="order-info">
                                    <div className="order-number">
                                        <span className="label">Order #</span>
                                        <span className="value">{order.order_number}</span>
                                    </div>
                                    <div className="order-date">
                                        <span className="label">Placed on</span>
                                        <span className="value">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="order-status">
                                    <span
                                        className="status-badge"
                                        style={{
                                            backgroundColor: getStatusColor(order.order_status),
                                            color: 'white'
                                        }}
                                    >
                                        {getStatusIcon(order.order_status)} {order.order_status}
                                    </span>
                                </div>
                            </div>

                            <div className="order-card-body">
                                <div className="order-items-preview">
                                    {order.product_image && (
                                        <img
                                            src={order.product_image}
                                            alt="Product"
                                            className="product-thumbnail"
                                        />
                                    )}
                                    <div className="order-summary">
                                        <span className="item-count">
                                            {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                                        </span>
                                        <span className="total-amount">
                                            ₹{order.total_amount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <div className="payment-method">
                                    <span className="label">Payment:</span>
                                    <span className="value">
                                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}
                                    </span>
                                </div>
                                <button
                                    className="btn-view-order"
                                    onClick={() => navigate(`/order-confirmation/${order.id}`, {
                                        state: {
                                            fromConfirmation: false,  // 🔥 IMPORTANT
                                            orderId: order.id
                                        }
                                    })}
                                >
                                    View Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;