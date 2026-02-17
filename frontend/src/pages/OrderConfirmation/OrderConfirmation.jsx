import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId: urlOrderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailStatus, setEmailStatus] = useState('sending');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [pageMode, setPageMode] = useState('details'); // Default 'details'

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ✅ Location state से data लें
    const { orderId: stateOrderId, orderNumber, totalAmount, fromConfirmation, orderData } = location.state || {};

    useEffect(() => {
        // 🔥 IMPORTANT: Page Mode Decide करें
        const isFromConfirmation = fromConfirmation === true;
        const hasStateData = !!(stateOrderId || orderNumber || totalAmount || orderData);

        console.log('📍 Page Mode Debug:', {
            fromConfirmation: isFromConfirmation,
            hasStateData,
            urlOrderId,
            stateOrderId
        });

        // ✅ Mode set करें
        if (isFromConfirmation) {
            setPageMode('confirmation');
            document.title = 'Order Confirmed - Pankhudi';
        } else {
            setPageMode('details');
            document.title = `Order #${urlOrderId || stateOrderId} - Pankhudi`;
        }

        // ✅ Order ID decide करें
        const finalOrderId = urlOrderId || stateOrderId;

        if (!finalOrderId) {
            console.error('❌ No order ID found');
            navigate('/orders');
            return;
        }

        // ✅ Agar state में पूरा order data है तो पहले से set करें
        if (orderData) {
            console.log('📦 Setting order from state data');
            setOrder(orderData);
            setEmailStatus('sent');
        }

        // ✅ Order details fetch करें
        fetchOrderDetails(finalOrderId);

        // ✅ Estimated delivery date set करें
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        setEstimatedDelivery(deliveryDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }));

        // ✅ Scroll to top
        window.scrollTo(0, 0);

    }, [urlOrderId, stateOrderId, fromConfirmation, orderData]);

    const fetchOrderDetails = async (orderId) => {
        // ✅ Agar already data है तो fetch न करें
        if (order && order.id === orderId) {
            setLoading(false);
            return;
        }

        try {
            console.log('🔍 Fetching order details for ID:', orderId);

            const response = await axios.get(
                `http://localhost:5000/api/orders/${orderId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                console.log('✅ Order fetched successfully');
                setOrder(response.data.order);
                setEmailStatus('sent');
            }
        } catch (error) {
            console.error('❌ Error fetching order:', error);
            setEmailStatus('failed');

            // ✅ Agar 5 सेकंड में data नहीं आया तो orders page पर भेजें
            setTimeout(() => {
                if (!order) {
                    navigate('/orders');
                }
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '🔄',
            'shipped': '📦',
            'delivered': '🎉',
            'cancelled': '❌',
            'refunded': '💰'
        };
        return icons[status?.toLowerCase()] || '📋';
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#ff9800',
            'confirmed': '#4caf50',
            'processing': '#2196f3',
            'shipped': '#9c27b0',
            'delivered': '#4caf50',
            'cancelled': '#f44336',
            'refunded': '#607d8b'
        };
        return colors[status?.toLowerCase()] || '#757575';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // ✅ Loading State
    if (loading) {
        return (
            <div className="confirmation-loading">
                <div className="spinner">
                    <div className="double-bounce1"></div>
                    <div className="double-bounce2"></div>
                </div>
                <p>Loading order details...</p>
                <p className="loading-subtitle">Please wait while we fetch your order information</p>
            </div>
        );
    }

    // ✅ Error State
    if (!order) {
        return (
            <div className="confirmation-error">
                <div className="error-icon">❌</div>
                <h2>Order Not Found</h2>
                <p>We couldn't find your order. The order may have been deleted or you don't have permission to view it.</p>
                <div className="error-actions">
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/orders')}
                    >
                        View My Orders
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/products')}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-confirmation-wrapper">
            <div className="order-confirmation-container">

                {/* 🎉 Confirmation Mode Header - New Order */}
                {pageMode === 'confirmation' ? (
                    <div className="success-header">
                        <div className="success-animation">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>

                        <h1>Order Confirmed! 🎉</h1>
                        <p className="confirmation-message">
                            Thank you for shopping with <span className="brand-highlight">Pankhudi</span>!
                        </p>
                        <p className="order-success-message">
                            Your order has been placed successfully and is being processed.
                        </p>

                        {/* Email Status Badge */}
                        <div className={`email-status-badge ${emailStatus}`}>
                            {emailStatus === 'sending' && (
                                <>
                                    <span className="status-icon">📧</span>
                                    <span>Sending confirmation email...</span>
                                    <span className="loading-dots"></span>
                                </>
                            )}
                            {emailStatus === 'sent' && (
                                <>
                                    <span className="status-icon">✅</span>
                                    <span>Confirmation email sent to </span>
                                    <strong>{order?.shipping_email || user.email}</strong>
                                </>
                            )}
                            {emailStatus === 'failed' && (
                                <>
                                    <span className="status-icon">⚠️</span>
                                    <span>Email delivery failed. You can view order details below.</span>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* 📋 Details Mode Header - View Existing Order */
                    <div className="details-header">
                        <div className="back-navigation">
                            <button
                                className="back-button"
                                onClick={() => {
                                    // ✅ Check karo ki kahan se aaye hain
                                    if (window.history.length > 2) {
                                        navigate(-1);
                                    } else {
                                        navigate('/orders');
                                    }
                                }}
                            >
                                ← Back to Orders
                            </button>
                        </div>
                        <div className="details-title">
                            <h1>Order Details</h1>
                            <span className="order-number-badge">#{order?.order_number}</span>
                        </div>
                        <p className="order-placed-date">
                            Placed on {new Date(order?.order_date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                )}

                {/* 📋 Main Order Details Card - Common for both modes */}
                <div className="order-main-card">
                    <div className="order-header-grid">
                        <div className="order-number-section">
                            <span className="label">Order Number</span>
                            <h2 className="order-number">#{order?.order_number}</h2>
                            <span className="order-date">
                                {new Date(order?.order_date).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>

                        <div className="order-status-section">
                            <div
                                className="current-status"
                                style={{ backgroundColor: getStatusColor(order?.order_status) }}
                            >
                                {getStatusIcon(order?.order_status)} {order?.order_status?.toUpperCase()}
                            </div>
                            <div className="estimated-delivery">
                                <span className="label">Estimated Delivery</span>
                                <span className="date">{estimatedDelivery}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Tracker */}
                    <div className="order-status-tracker">
                        <div className={`status-step ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order?.order_status) ? 'completed' : ''} ${order?.order_status === 'confirmed' ? 'active' : ''}`}>
                            <div className="step-icon">✓</div>
                            <span className="step-label">Confirmed</span>
                            {order?.order_status === 'confirmed' && <span className="step-date">Just now</span>}
                        </div>
                        <div className={`status-step ${['processing', 'shipped', 'delivered'].includes(order?.order_status) ? 'completed' : ''} ${order?.order_status === 'processing' ? 'active' : ''}`}>
                            <div className="step-icon">🔄</div>
                            <span className="step-label">Processing</span>
                        </div>
                        <div className={`status-step ${['shipped', 'delivered'].includes(order?.order_status) ? 'completed' : ''} ${order?.order_status === 'shipped' ? 'active' : ''}`}>
                            <div className="step-icon">📦</div>
                            <span className="step-label">Shipped</span>
                        </div>
                        <div className={`status-step ${order?.order_status === 'delivered' ? 'completed active' : ''}`}>
                            <div className="step-icon">✅</div>
                            <span className="step-label">Delivered</span>
                        </div>
                    </div>

                    {/* Payment & Total Summary */}
                    <div className="payment-summary-grid">
                        <div className="payment-method-card">
                            <div className="card-icon">💳</div>
                            <div className="card-content">
                                <span className="label">Payment Method</span>
                                <span className="value">
                                    {order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                                </span>
                                <span className="payment-status" style={{
                                    color: order?.payment_status === 'completed' ? '#4caf50' : '#ff9800'
                                }}>
                                    {order?.payment_status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                                </span>
                            </div>
                        </div>

                        <div className="total-amount-card">
                            <div className="card-icon">💰</div>
                            <div className="card-content">
                                <span className="label">Total Amount</span>
                                <span className="value amount">{formatCurrency(order?.total_amount)}</span>
                                {order?.payment_method === 'cod' && (
                                    <span className="payment-note">Pay on delivery</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🛍️ Order Items Section */}
                <div className="order-items-section">
                    <div className="section-header">
                        <h3>Order Items ({order?.items?.length || 0})</h3>
                    </div>

                    <div className="items-list">
                        {order?.items?.map((item, index) => (
                            <div key={index} className="order-item-card">
                                <div className="item-image-wrapper">
                                    <img
                                        src={item.product_image || '/uploads/products/default-product.jpg'}
                                        alt={item.product_name}
                                        className="item-image"
                                        onError={(e) => {
                                            e.target.src = '/uploads/products/default-product.jpg';
                                        }}
                                    />
                                    <span className="item-quantity-badge">x{item.quantity}</span>
                                </div>

                                <div className="item-details-wrapper">
                                    <div className="item-info">
                                        <h4 className="item-name">{item.product_name}</h4>
                                        <div className="item-specs">
                                            {item.sku && <span className="sku">SKU: {item.sku}</span>}
                                            {item.size && <span className="size">Size: {item.size}</span>}
                                            {item.color && <span className="color">Color: {item.color}</span>}
                                        </div>
                                    </div>

                                    <div className="item-pricing">
                                        <div className="price-breakdown">
                                            <span className="unit-price">₹{parseFloat(item.price).toFixed(2)}</span>
                                            <span className="multiply">×</span>
                                            <span className="quantity">{item.quantity}</span>
                                            <span className="equals">=</span>
                                            <span className="total-price">₹{parseFloat(item.total_price).toFixed(2)}</span>
                                        </div>
                                        {item.discount_percent > 0 && (
                                            <span className="discount-badge">
                                                {item.discount_percent}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Summary */}
                    <div className="price-summary-card">
                        <h4>Price Summary</h4>
                        <div className="price-rows">
                            <div className="price-ro">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order?.subtotal)}</span>
                            </div>
                            {parseFloat(order?.shipping_charge || 0) > 0 && (
                                <div className="price-row">
                                    <span>Shipping Charge</span>
                                    <span>{formatCurrency(order?.shipping_charge)}</span>
                                </div>
                            )}
                            {parseFloat(order?.tax_amount || 0) > 0 && (
                                <div className="price-row">
                                    <span>Tax</span>
                                    <span>{formatCurrency(order?.tax_amount)}</span>
                                </div>
                            )}
                            {parseFloat(order?.discount_amount || 0) > 0 && (
                                <div className="price-row discount">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order?.discount_amount)}</span>
                                </div>
                            )}
                            <div className="price-row total">
                                <span>Total Amount</span>
                                <span className="total-amount">{formatCurrency(order?.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📦 Shipping Address */}
                <div className="shipping-address-section">
                    <div className="section-header">
                        <h3>📦 Shipping Address</h3>
                    </div>

                    <div className="address-details-card">
                        <div className="recipient-info">
                            <strong>{order?.shipping_full_name}</strong>
                        </div>
                        <div className="full-address">
                            <p>{order?.shipping_address}</p>
                            <p>{order?.shipping_city}, {order?.shipping_state} - {order?.shipping_postal_code}</p>
                            <p>{order?.shipping_country}</p>
                        </div>
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="icon">📞</span>
                                <span>{order?.shipping_phone}</span>
                            </div>
                            <div className="contact-item">
                                <span className="icon">✉️</span>
                                <span>{order?.shipping_email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📱 Order Actions - Mode based */}
                <div className="order-actions-section">
                    {pageMode === 'confirmation' ? (
                        <>
                            <div className="track-order-card">
                                <div className="track-icon">📍</div>
                                <div className="track-content">
                                    <h4>Track Your Order</h4>
                                    <p>Get real-time updates on your order status</p>
                                    <button
                                        className="btn-track"
                                        onClick={() => navigate(`/order-confirmation/${order?.id}`)}
                                    >
                                        Track Order →
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate('/orders')}
                                >
                                    <span className="btn-icon">📋</span>
                                    View All Orders
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => navigate('/products')}
                                >
                                    <span className="btn-icon">🛍️</span>
                                    Continue Shopping
                                </button>
                                <button
                                    className="btn-outline"
                                    onClick={() => window.print()}
                                >
                                    <span className="btn-icon">🖨️</span>
                                    Print Invoice
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="action-buttons details-mode">
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/orders')}
                            >
                                <span className="btn-icon">📋</span>
                                Back to Orders
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate('/products')}
                            >
                                <span className="btn-icon">🛍️</span>
                                Continue Shopping
                            </button>
                            <button
                                className="btn-outline"
                                onClick={() => window.print()}
                            >
                                <span className="btn-icon">🖨️</span>
                                Print Invoice
                            </button>
                            {order?.order_status === 'shipped' && (
                                <button
                                    className="btn-track-order"
                                    onClick={() => window.open(`/track-order/${order?.id}`, '_blank')}
                                >
                                    <span className="btn-icon">📍</span>
                                    Track Shipment
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ❓ Need Help */}
                <div className="need-help-section">
                    <div className="help-content">
                        <span className="help-icon">❓</span>
                        <div className="help-text">
                            <h4>Need help with your order?</h4>
                            <p>Our support team is available 24/7</p>
                        </div>
                        <div className="help-actions">
                            <a href="/contact" className="help-link">Contact Support</a>
                            <span className="separator">•</span>
                            <a href="/faq" className="help-link">FAQ</a>
                        </div>
                    </div>
                </div>

                {/* 📝 Order Notes */}
                {order?.order_note && (
                    <div className="order-notes-section">
                        <h4>📝 Order Notes</h4>
                        <p>{order.order_note}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderConfirmation;