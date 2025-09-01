import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FiCheckCircle,
    FiShoppingBag,
    FiTruck,
    FiClock,
    FiShare2,
    FiPrinter,
    FiHome,
    FiMapPin,
    FiChevronRight,
    FiCreditCard,
    FiDollarSign,
    FiPocket,
    FiGift,
    FiMail,
    FiPhone,
    FiUser
} from 'react-icons/fi';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [activeTab, setActiveTab] = useState('details');
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle back button and page time limit
    useEffect(() => {
        const handleBackButton = () => {
            navigate('/');
            return false;
        };

        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handleBackButton);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
            clearInterval(timer);
        };
    }, [navigate]);

    // Animation effect for premium feel
    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, [activeTab]);

    // Load order data
    useEffect(() => {
        const loadOrderData = () => {
            try {
                // First try to get from location state
                const orderFromState = location.state?.order;
                if (orderFromState) {
                    setOrder(orderFromState);
                    setLoading(false);
                    return;
                }

                // If not in state, check localStorage for orderHistory
                const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

                // Get the most recent order
                const mostRecentOrder = orderHistory.length > 0 ? orderHistory[orderHistory.length - 1] : null;

                if (mostRecentOrder) {
                    setOrder(mostRecentOrder);
                } else {
                    // If no order history, check for currentOrder or cart
                    const savedOrder = JSON.parse(localStorage.getItem('currentOrder')) ||
                        JSON.parse(localStorage.getItem('pankhudiCart'))?.[0];

                    if (savedOrder) {
                        // Create complete order object with defaults
                        const orderDetails = {
                            orderId: `PANKH${Date.now()}`,
                            date: new Date().toISOString(),
                            items: Array.isArray(savedOrder) ? savedOrder : [savedOrder],
                            shippingAddress: savedOrder.shippingAddress || {
                                type: 'home',
                                name: 'John Doe',
                                street: '123 Fashion Street',
                                city: 'Mumbai',
                                state: 'Maharashtra',
                                zip: '400001',
                                phone: '9876543210'
                            },
                            billingAddress: savedOrder.billingAddress || savedOrder.shippingAddress || {
                                type: 'home',
                                name: 'John Doe',
                                street: '123 Fashion Street',
                                city: 'Mumbai',
                                state: 'Maharashtra',
                                zip: '400001',
                                phone: '9876543210'
                            },
                            paymentMethod: savedOrder.paymentMethod || 'cod',
                            subtotal: savedOrder.price || savedOrder.product?.price || 0,
                            shipping: (savedOrder.price || savedOrder.product?.price || 0) > 5000 ? 0 : 150,
                            discount: savedOrder.discount || 0,
                            couponCode: savedOrder.couponCode || null,
                            status: 'confirmed',
                            trackingNumber: `TRACK${Math.floor(100000 + Math.random() * 900000)}`,
                            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                        };

                        // Calculate total
                        orderDetails.total = orderDetails.subtotal + orderDetails.shipping - orderDetails.discount;

                        setOrder(orderDetails);

                        // Save to order history
                        localStorage.setItem('orderHistory', JSON.stringify([...orderHistory, orderDetails]));
                    } else {
                        navigate('/');
                    }
                }
            } catch (error) {
                console.error('Error loading order data:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        loadOrderData();
        window.scrollTo(0, 0);
    }, [location, navigate]);

    const printOrder = () => {
        window.print();
    };

    const shareOrder = () => {
        if (navigator.share) {
            navigator.share({
                title: `My Pankhudi Order #${order.orderId || ''}`,
                text: `I just placed an order on Pankhudi for ₹${(order.totalAmount || order.total || 0).toLocaleString()}`,
                url: window.location.href,
            }).catch(console.error);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            alert('Order link copied to clipboard!');
        } else {
            alert('Sharing not supported in your browser');
        }
    };

    const formatPrice = (price) => {
        return price?.toLocaleString?.('en-IN') || '0';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const getItemsToDisplay = () => {
        if (order.items) {
            return order.items;
        }
        if (order.product) {
            return [order];
        }
        return [];
    };

    const renderPaymentMethodIcon = () => {
        switch (order.paymentMethod) {
            case 'credit-card':
                return <FiCreditCard className="payment-icon" />;
            case 'upi':
                return <FiPocket className="payment-icon" />;
            case 'netbanking':
                return <FiDollarSign className="payment-icon" />;
            default:
                return <FiDollarSign className="payment-icon" />;
        }
    };

    const renderStatusBadge = () => {
        let statusClass = '';
        let statusText = '';

        switch (order.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Confirmed';
                break;
            case 'shipped':
                statusClass = 'status-shipped';
                statusText = 'Shipped';
                break;
            case 'delivered':
                statusClass = 'status-delivered';
                statusText = 'Delivered';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                break;
            default:
                statusClass = 'status-processing';
                statusText = 'Processing';
        }

        return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
    };

    if (loading) {
        return (
            <div className="pankhudi-loading-screen">
                <div className="pankhudi-loading-spinner"></div>
                <p>Loading your order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="pankhudi-error-screen">
                <h2>No order found</h2>
                <p>Redirecting you to the homepage...</p>
                <Link to="/" className="pankhudi-home-link">Go Home Now</Link>
            </div>
        );
    }

    return (
        <div className="pankhudi-confirmation-container">
            {/* Header Section */}
            <div className={`pankhudi-confirmation-header ${isAnimating ? 'animate' : ''}`}>
                <div className="pankhudi-confirmation-success">
                    <div className="pankhudi-success-icon-container">
                        <FiCheckCircle className="pankhudi-success-icon" />
                        <div className="pankhudi-icon-pulse"></div>
                    </div>
                    <div>
                        <h1>Order Confirmed!</h1>
                        <p className="pankhudi-order-id">Order #: {order.orderId || 'N/A'}</p>
                    </div>
                </div>

                <div className="pankhudi-order-meta">
                    <div className="pankhudi-meta-item">
                        <span>Order Date</span>
                        <strong>{formatDate(order.date)}</strong>
                    </div>
                    <div className="pankhudi-meta-item">
                        <span>Status</span>
                        {renderStatusBadge()}
                    </div>
                    <div className="pankhudi-meta-item">
                        <span>Total Amount</span>
                        <strong className="pankhudi-total-amount">₹{formatPrice(order.totalAmount || order.total)}</strong>
                    </div>
                </div>

                <div className="pankhudi-order-actions">
                    <button onClick={printOrder} className="pankhudi-action-btn print">
                        <FiPrinter /> Print Invoice
                    </button>
                    <button onClick={shareOrder} className="pankhudi-action-btn share">
                        <FiShare2 /> Share Order
                    </button>
                    <div className="pankhudi-timer">
                        <FiClock /> Page closes in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="pankhudi-tab-nav">
                <button
                    className={`pankhudi-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Order Details
                </button>
                <button
                    className={`pankhudi-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shipping')}
                >
                    Shipping & Billing
                </button>
                <button
                    className={`pankhudi-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                >
                    Order Timeline
                </button>
            </div>

            {/* Tab Content */}
            <div className={`pankhudi-tab-content ${isAnimating ? 'animate' : ''}`}>
                {activeTab === 'details' && (
                    <div className="pankhudi-order-details">
                        <div className="pankhudi-payment-method">
                            <h3>
                                {renderPaymentMethodIcon()}
                                Payment Method
                            </h3>
                            <div className="pankhudi-payment-details">
                                <p>
                                    {order.paymentMethod === 'credit-card' ? 'Credit/Debit Card' :
                                        order.paymentMethod === 'upi' ? 'UPI Payment' :
                                            order.paymentMethod === 'netbanking' ? 'Net Banking' :
                                                'Cash on Delivery'}
                                </p>
                                {order.transactionId && (
                                    <p className="pankhudi-transaction-id">
                                        Transaction ID: <span>{order.transactionId}</span>
                                    </p>
                                )}
                                {order.paymentStatus && (
                                    <p className="pankhudi-payment-status">
                                        Status: <span className={order.paymentStatus.toLowerCase()}>{order.paymentStatus}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pankhudi-order-items-section">
                            <h3>Order Items ({getItemsToDisplay().length})</h3>
                            <div className="pankhudi-order-items-list">
                                {getItemsToDisplay().map((item, index) => {
                                    const product = item.product || item;
                                    return (
                                        <div key={index} className="pankhudi-confirmation-item">
                                            <div className="pankhudi-item-image-container">
                                                <img
                                                    src={product.image || '/default-product-image.jpg'}
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.src = '/default-product-image.jpg';
                                                    }}
                                                />
                                                <span className="pankhudi-item-quantity">Qty: {product.quantity || 1}</span>
                                            </div>
                                            <div className="pankhudi-item-details">
                                                <h4>{product.name}</h4>
                                                {product.selectedColor && (
                                                    <p className="pankhudi-item-attribute">
                                                        <span>Color:</span> {product.selectedColor}
                                                    </p>
                                                )}
                                                {product.selectedSize && (
                                                    <p className="pankhudi-item-attribute">
                                                        <span>Size:</span> {product.selectedSize}
                                                    </p>
                                                )}
                                                <div className="pankhudi-item-price-row">
                                                    <span className="pankhudi-item-price">
                                                        ₹{formatPrice(product.price)}
                                                    </span>
                                                    {product.originalPrice > product.price && (
                                                        <span className="pankhudi-original-price">
                                                            <del>₹{formatPrice(product.originalPrice)}</del>
                                                            <span className="discount-percent">
                                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                {product.inStock && (
                                                    <p className="pankhudi-stock-status in-stock">In Stock</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pankhudi-order-summary">
                            <h3>Order Summary</h3>
                            <div className="pankhudi-summary-grid">
                                <div className="pankhudi-summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{formatPrice(order.subtotal || (order.amount && (order.amount - (order.tax || 0))))}</span>
                                </div>
                                {order.tax && (
                                    <div className="pankhudi-summary-row">
                                        <span>Tax</span>
                                        <span>₹{formatPrice(order.tax)}</span>
                                    </div>
                                )}
                                <div className="pankhudi-summary-row">
                                    <span>Shipping</span>
                                    <span>₹{formatPrice(order.shipping || 0)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="pankhudi-summary-row discount">
                                        <span>Discount</span>
                                        <span>-₹{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                {order.couponCode && (
                                    <div className="pankhudi-summary-row coupon">
                                        <span>Coupon Applied ({order.couponCode})</span>
                                        <span>-₹{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                <div className="pankhudi-summary-row total">
                                    <span>Total Amount</span>
                                    <span>₹{formatPrice(order.totalAmount || order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <div className="pankhudi-address-section">
                        <div className="pankhudi-address-card shipping">
                            <h3>
                                <FiTruck className="address-icon" />
                                Shipping Address
                            </h3>
                            <div className="pankhudi-address-details">
                                <p className="pankhudi-address-type">
                                    {order.shippingAddress.type === 'home' ? <FiHome /> : <FiMapPin />}
                                    <span>{order.shippingAddress.type === 'home' ? 'Home Address' : 'Work Address'}</span>
                                </p>
                                <p className="pankhudi-address-name">
                                    <FiUser /> {order.shippingAddress.name}
                                </p>
                                <p className="pankhudi-address-street">{order.shippingAddress.street}</p>
                                <p className="pankhudi-address-city">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                                </p>
                                <p className="pankhudi-address-phone">
                                    <FiPhone /> {order.shippingAddress.phone}
                                </p>
                                {order.shippingAddress.email && (
                                    <p className="pankhudi-address-email">
                                        <FiMail /> {order.shippingAddress.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pankhudi-address-card billing">
                            <h3>
                                <FiCreditCard className="address-icon" />
                                Billing Address
                            </h3>
                            <div className="pankhudi-address-details">
                                {order.billingAddress ? (
                                    <>
                                        <p className="pankhudi-address-type">
                                            {order.billingAddress.type === 'home' ? <FiHome /> : <FiMapPin />}
                                            <span>{order.billingAddress.type === 'home' ? 'Home Address' : 'Work Address'}</span>
                                        </p>
                                        <p className="pankhudi-address-name">
                                            <FiUser /> {order.billingAddress.name}
                                        </p>
                                        <p className="pankhudi-address-street">{order.billingAddress.street}</p>
                                        <p className="pankhudi-address-city">
                                            {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.zip}
                                        </p>
                                        <p className="pankhudi-address-phone">
                                            <FiPhone /> {order.billingAddress.phone}
                                        </p>
                                    </>
                                ) : (
                                    <p className="pankhudi-same-address">Same as shipping address</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="pankhudi-timeline-section">
                        <div className="pankhudi-timeline-progress">
                            <div className="pankhudi-progress-bar">
                                <div className="pankhudi-progress-fill" style={{
                                    width: order.status === 'confirmed' ? '25%' :
                                        order.status === 'processing' ? '50%' :
                                            order.status === 'shipped' ? '75%' : '100%'
                                }}></div>
                            </div>
                            <div className="pankhudi-timeline-steps">
                                <div className={`pankhudi-timeline-step ${order.status === 'confirmed' ? 'active' : ''}`}>
                                    <div className="pankhudi-step-marker"></div>
                                    <div className="pankhudi-step-details">
                                        <h4>Order Confirmed</h4>
                                        <p>{formatDate(order.date)}</p>
                                        <p>Your order has been received</p>
                                    </div>
                                </div>
                                <div className={`pankhudi-timeline-step ${order.status === 'processing' ? 'active' : ''}`}>
                                    <div className="pankhudi-step-marker"></div>
                                    <div className="pankhudi-step-details">
                                        <h4>Processing</h4>
                                        {order.status === 'processing' && <p>{formatDate(order.processingDate)}</p>}
                                        <p>We're preparing your order</p>
                                    </div>
                                </div>
                                <div className={`pankhudi-timeline-step ${order.status === 'shipped' ? 'active' : ''}`}>
                                    <div className="pankhudi-step-marker"></div>
                                    <div className="pankhudi-step-details">
                                        <h4>Shipped</h4>
                                        {order.status === 'shipped' && <p>{formatDate(order.shippedDate)}</p>}
                                        <p>Your order is on the way</p>
                                        {order.trackingNumber && (
                                            <p className="pankhudi-tracking">
                                                Tracking #: <span>{order.trackingNumber}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className={`pankhudi-timeline-step ${order.status === 'delivered' ? 'active' : ''}`}>
                                    <div className="pankhudi-step-marker"></div>
                                    <div className="pankhudi-step-details">
                                        <h4>Delivered</h4>
                                        {order.status === 'delivered' ? (
                                            <>
                                                <p>{formatDate(order.deliveredDate)}</p>
                                                <p>Your order has been delivered</p>
                                            </>
                                        ) : (
                                            <p>Expected by {formatDate(order.estimatedDelivery)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pankhudi-delivery-estimate">
                            <FiClock className="estimate-icon" />
                            <div>
                                <h4>Estimated Delivery</h4>
                                <p>{formatDate(order.estimatedDelivery)} (5-7 business days)</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="pankhudi-confirmation-footer">
                <Link to="/products" className="pankhudi-footer-btn continue-shopping">
                    <FiShoppingBag /> Continue Shopping
                </Link>
                <Link to="/orders" className="pankhudi-footer-btn view-orders">
                    View Order History <FiChevronRight />
                </Link>
                {order.status === 'confirmed' && (
                    <button className="pankhudi-footer-btn cancel-order">
                        Cancel Order
                    </button>
                )}
            </div>

            {/* Special Offer Banner */}
            <div className="pankhudi-offer-banner">
                <FiGift className="offer-icon" />
                <div className="pankhudi-offer-content">
                    <h4>Special Offer for You!</h4>
                    <p>Get 15% off on your next order. Use code: PANKH15</p>
                </div>
                <button className="pankhudi-offer-btn">Copy Code</button>
            </div>
        </div>
    );
};

export default OrderConfirmation;