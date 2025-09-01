import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiShoppingBag,
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiX,
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiChevronUp,
    FiEye,
    FiTrash2,
    FiHome,
    FiArrowLeft,
    FiPrinter,
    FiDollarSign,
    FiPackage,
    FiCalendar,
    FiUser,
    FiMapPin,
    FiCreditCard,
    FiRepeat,
    FiStar
} from 'react-icons/fi';
import './OrderHistory.css';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOption, setSortOption] = useState('newest');

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    // Load orders from localStorage with simulated loading
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const savedOrders = localStorage.getItem('orderHistory');
            if (savedOrders) {
                try {
                    const parsedOrders = JSON.parse(savedOrders);
                    const normalizedOrders = Array.isArray(parsedOrders) ?
                        parsedOrders.map(normalizeOrder) :
                        [normalizeOrder(parsedOrders)];

                    // Sort orders by date
                    const sortedOrders = normalizedOrders.sort((a, b) =>
                        new Date(b.date) - new Date(a.date)
                    );

                    setOrders(sortedOrders);
                    setFilteredOrders(sortedOrders);
                } catch (error) {
                    console.error('Error parsing order history:', error);
                    setOrders([]);
                    setFilteredOrders([]);
                }
            }
            setIsLoading(false);
        }, 800); // Simulate network delay

        return () => clearTimeout(timer);
    }, []);

    // Normalize order structure
    const normalizeOrder = (order) => {
        if (!order) return null;

        if (order.items || order.product) {
            return {
                orderId: order.orderId || `PANKH${Date.now()}`,
                date: order.date || new Date().toISOString(),
                items: order.items || [order.product || order],
                shippingAddress: order.shippingAddress || order.deliveryAddress || {
                    type: 'home',
                    name: '',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    phone: ''
                },
                paymentMethod: order.paymentMethod || 'cod',
                paymentStatus: order.paymentStatus || 'completed',
                transactionId: order.transactionId || `TXN${Date.now()}`,
                subtotal: order.subtotal || order.amount || (order.product?.price || order.price || 0),
                shipping: order.shipping || 0,
                discount: order.discount || 0,
                tax: order.tax || 0,
                total: order.total || order.totalAmount ||
                    ((order.amount || (order.product?.price || order.price || 0)) +
                        (order.shipping || 0) -
                        (order.discount || 0)),
                status: order.status || 'confirmed',
                trackingNumber: order.trackingNumber || `TRACK${Math.floor(Math.random() * 1000000)}`,
                estimatedDelivery: order.estimatedDelivery ||
                    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                rating: order.rating || null
            };
        }

        return {
            orderId: `PANKH${Date.now()}`,
            date: new Date().toISOString(),
            items: [order],
            shippingAddress: order.shippingAddress || {
                type: 'home',
                name: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                phone: ''
            },
            paymentMethod: 'cod',
            subtotal: order.price || 0,
            shipping: 0,
            discount: 0,
            total: order.price || 0,
            status: 'confirmed',
            trackingNumber: `TRACK${Math.floor(Math.random() * 1000000)}`,
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            rating: null
        };
    };

    // Get items to display from an order
    const getOrderItems = (order) => {
        if (order.items) return order.items;
        if (order.product) return [order.product];
        return [order];
    };

    // Apply filters and sorting
    useEffect(() => {
        let result = [...orders];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(order => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    order?.orderId?.toLowerCase().includes(searchLower) ||
                    getOrderItems(order).some(item =>
                        item?.name?.toLowerCase().includes(searchLower) ||
                        item?.product?.name?.toLowerCase().includes(searchLower)
                    )
                );
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(order => order?.status === statusFilter);
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            switch (dateFilter) {
                case 'last30':
                    result = result.filter(order => new Date(order?.date) > thirtyDaysAgo);
                    break;
                case 'last6months':
                    result = result.filter(order => new Date(order?.date) > sixMonthsAgo);
                    break;
                case 'lastyear':
                    result = result.filter(order => new Date(order?.date) > oneYearAgo);
                    break;
                case 'older':
                    result = result.filter(order => new Date(order?.date) <= oneYearAgo);
                    break;
                default:
                    break;
            }
        }

        // Apply price filter
        if (priceFilter !== 'all') {
            switch (priceFilter) {
                case 'under1000':
                    result = result.filter(order => order?.total < 1000);
                    break;
                case '1000-5000':
                    result = result.filter(order => order?.total >= 1000 && order?.total <= 5000);
                    break;
                case '5000-10000':
                    result = result.filter(order => order?.total > 5000 && order?.total <= 10000);
                    break;
                case 'over10000':
                    result = result.filter(order => order?.total > 10000);
                    break;
                default:
                    break;
            }
        }

        // Apply sorting
        switch (sortOption) {
            case 'newest':
                result.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'price-high':
                result.sort((a, b) => b.total - a.total);
                break;
            case 'price-low':
                result.sort((a, b) => a.total - b.total);
                break;
            default:
                break;
        }

        setFilteredOrders(result);
    }, [searchQuery, statusFilter, dateFilter, priceFilter, sortOption, orders]);

    const removeFromHistory = (orderId) => {
        if (window.confirm('Are you sure you want to remove this order from your history?')) {
            const updatedOrders = orders.filter(order => order?.orderId !== orderId);
            setOrders(updatedOrders);
            localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <FiCheckCircle className="order-status-icon confirmed" />;
            case 'shipped':
                return <FiTruck className="order-status-icon shipped" />;
            case 'delivered':
                return <FiCheckCircle className="order-status-icon delivered" />;
            case 'cancelled':
                return <FiX className="order-status-icon cancelled" />;
            default:
                return <FiClock className="order-status-icon pending" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmed';
            case 'shipped':
                return 'Shipped';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Pending Payment';
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(normalizeOrder(order));
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    const cancelOrder = (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            const updatedOrders = orders.map(order =>
                order?.orderId === orderId ? { ...order, status: 'cancelled' } : order
            );
            setOrders(updatedOrders);
            localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateFilter('all');
        setPriceFilter('all');
        setSortOption('newest');
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatPrice = (price) => {
        return price?.toLocaleString?.('en-IN') || '0';
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const handleRateOrder = (orderId, rating) => {
        const updatedOrders = orders.map(order =>
            order?.orderId === orderId ? { ...order, rating } : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
    };

    return (
        <div className="order-history-container">
            {/* Navigation Controls */}
            <div className="order-history-nav">
                <button onClick={handleBack} className="nav-buttons back-buttons">
                    <FiArrowLeft /> Back
                </button>
                <button onClick={handleGoHome} className="nav-buttons home-nav">
                    <FiHome /> Home
                </button>
            </div>

            {/* Main Header */}
            <div className="order-history-header">
                <div className="header-content">
                    <FiShoppingBag className="header-icon" />
                    <h1>My Orders</h1>
                    <p>View and manage your order history</p>
                </div>
                <div className="order-count-badge">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
                </div>
            </div>

            {/* Controls Section */}
            <div className="order-controls-section">
                <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by order ID or product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="control-buttons">
                    <button
                        className={`filter-button ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    <div className="sort-dropdown">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="sort-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="price-low">Price: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="filters-section">
                    <div className="filter-group">
                        <label className="filter-label">
                            <FiPackage /> Order Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <FiCalendar /> Order Date
                        </label>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Time</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="last6months">Last 6 Months</option>
                            <option value="lastyear">Last Year</option>
                            <option value="older">Older</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <FiDollarSign /> Order Value
                        </label>
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Any Price</option>
                            <option value="under1000">Under ₹1000</option>
                            <option value="1000-5000">₹1000 - ₹5000</option>
                            <option value="5000-10000">₹5000 - ₹10000</option>
                            <option value="over10000">Over ₹10000</option>
                        </select>
                    </div>

                    <button onClick={clearFilters} className="clear-filters-button">
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredOrders.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <FiShoppingBag />
                    </div>
                    <h3>No orders found</h3>
                    <p>We couldn't find any orders matching your criteria</p>
                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || priceFilter !== 'all' ? (
                        <button onClick={clearFilters} className="cta-button">
                            Clear Filters
                        </button>
                    ) : (
                        <Link to="/products" className="cta-button">
                            Start Shopping
                        </Link>
                    )}
                </div>
            )}

            {/* Orders List */}
            {!isLoading && filteredOrders.length > 0 && (
                <div className="orders-list">
                    {filteredOrders.map(order => {
                        const normalizedOrder = normalizeOrder(order);
                        const items = getOrderItems(normalizedOrder);
                        const isExpanded = expandedOrderId === normalizedOrder?.orderId;

                        return (
                            <div
                                key={normalizedOrder?.orderId}
                                className={`order-card ${normalizedOrder?.status} ${isExpanded ? 'expanded' : ''}`}
                            >
                                <div className="order-card-header" onClick={() => toggleOrderExpand(normalizedOrder?.orderId)}>
                                    <div className="order-meta">
                                        <h3 className="order-id">Order #{normalizedOrder?.orderId}</h3>
                                        <p className="order-date">
                                            <FiCalendar /> {formatDate(normalizedOrder?.date)}
                                        </p>
                                    </div>
                                    <div className="order-status">
                                        {getStatusIcon(normalizedOrder?.status)}
                                        <span>{getStatusText(normalizedOrder?.status)}</span>
                                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="order-card-expanded">
                                        <div className="order-items-preview">
                                            {items.slice(0, 3).map((item, index) => {
                                                const product = item.product || item;
                                                return (
                                                    <div key={`${normalizedOrder?.orderId}-${index}`} className="order-item-preview">
                                                        <img
                                                            src={product?.image || '/default-product-image.jpg'}
                                                            alt={product?.name}
                                                            className="item-image"
                                                            onError={(e) => {
                                                                e.target.src = '/default-product-image.jpg';
                                                            }}
                                                        />
                                                        <div className="item-info">
                                                            <h4>{product?.name}</h4>
                                                            <p className="item-price">₹{formatPrice(product?.price)}</p>
                                                            {product?.originalPrice > product?.price && (
                                                                <p className="original-price">
                                                                    <del>₹{formatPrice(product.originalPrice)}</del>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {items.length > 3 && (
                                                <div className="more-items-indicator">
                                                    +{items.length - 3} more items
                                                </div>
                                            )}
                                        </div>

                                        <div className="order-summary">
                                            <div className="summary-row">
                                                <span>Items ({items.length})</span>
                                                <span>₹{formatPrice(normalizedOrder?.subtotal)}</span>
                                            </div>
                                            {normalizedOrder?.discount > 0 && (
                                                <div className="summary-row discount">
                                                    <span>Discount</span>
                                                    <span>-₹{formatPrice(normalizedOrder?.discount)}</span>
                                                </div>
                                            )}
                                            <div className="summary-row">
                                                <span>Delivery</span>
                                                <span>₹{formatPrice(normalizedOrder?.shipping || 0)}</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span>Total Amount</span>
                                                <span>₹{formatPrice(normalizedOrder?.total)}</span>
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <button
                                                className="action-button view-details"
                                                onClick={() => viewOrderDetails(normalizedOrder)}
                                            >
                                                <FiEye /> View Details
                                            </button>
                                            {normalizedOrder?.status === 'delivered' && !normalizedOrder.rating && (
                                                <div className="rating-section">
                                                    <p>Rate your order:</p>
                                                    <div className="rating-stars">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <FiStar
                                                                key={star}
                                                                className={`star ${star <= (normalizedOrder.rating || 0) ? 'filled' : ''}`}
                                                                onClick={() => handleRateOrder(normalizedOrder.orderId, star)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                className="action-button buy-again"
                                            >
                                                <FiRepeat /> Buy Again
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="order-card-footer">
                                    <div className="footer-total">
                                        <span>Total:</span>
                                        <span className="total-amount">₹{formatPrice(normalizedOrder?.total)}</span>
                                    </div>
                                    <div className="footer-actions">
                                        <button
                                            className="mini-action-button"
                                            onClick={() => viewOrderDetails(normalizedOrder)}
                                            title="View Details"
                                        >
                                            <FiEye />
                                        </button>
                                        {normalizedOrder?.status === 'delivered' && (
                                            <button
                                                className="mini-action-button"
                                                title="Buy Again"
                                            >
                                                <FiRepeat />
                                            </button>
                                        )}
                                        <button
                                            className="mini-action-button remove"
                                            onClick={() => removeFromHistory(normalizedOrder?.orderId)}
                                            title="Remove from History"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="order-details-modal">
                    <div className="modal-overlay" onClick={closeOrderDetails}></div>
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeOrderDetails}>
                            <FiX />
                        </button>

                        <div className="modal-header">
                            <h2>
                                <FiShoppingBag /> Order #{selectedOrder?.orderId}
                            </h2>
                            <div className={`order-status-badge ${selectedOrder?.status}`}>
                                {getStatusIcon(selectedOrder?.status)}
                                {getStatusText(selectedOrder?.status)}
                            </div>
                        </div>

                        <div className="modal-sections">
                            {/* Order Summary Section */}
                            <div className="modal-section">
                                <h3 className="section-title">
                                    <FiPackage /> Order Summary
                                </h3>
                                <div className="order-items-list">
                                    {getOrderItems(selectedOrder).map((item, index) => {
                                        const product = item.product || item;

                                        return (
                                            <div key={index} className="order-item-detail">
                                                <img
                                                    src={product?.image || '/default-product-image.jpg'}
                                                    alt={product?.name}
                                                    className="item-detail-image"
                                                />

                                                <div className="item-detail-info">
                                                    <h4>{product?.name}</h4>

                                                    {product?.selectedColor && (
                                                        <p className="item-attribute">
                                                            Color: <span>{product.selectedColor}</span>
                                                        </p>
                                                    )}

                                                    {product?.selectedSize && (
                                                        <p className="item-attribute">
                                                            Size: <span>{product.selectedSize}</span>
                                                        </p>
                                                    )}

                                                    <p className="item-price">
                                                        ₹{formatPrice(product?.price)}
                                                        {product?.originalPrice > product?.price && (
                                                            <span className="original-price">
                                                                <del>₹{formatPrice(product.originalPrice)}</del>
                                                                <span className="discount-badge">
                                                                    {Math.round(
                                                                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                                                                    )}% OFF
                                                                </span>
                                                            </span>
                                                        )}
                                                    </p>

                                                    <p className="item-quantity">Quantity: 1</p>
                                                </div>

                                                {selectedOrder?.status === 'delivered' && (
                                                    <button className="rate-product-button">
                                                        <FiStar /> Rate Product
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>

                            {/* Delivery Information Section */}
                            <div className="modal-section">
                                <h3 className="section-title">
                                    <FiTruck /> Delivery Information
                                </h3>
                                <div className="delivery-info">
                                    <div className="info-row">
                                        <span className="info-label">
                                            <FiUser /> Recipient:
                                        </span>
                                        <span className="info-value">
                                            {selectedOrder?.shippingAddress?.name}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">
                                            <FiMapPin /> Address:
                                        </span>
                                        <span className="info-value">
                                            {selectedOrder?.shippingAddress?.street}, {selectedOrder?.shippingAddress?.city},
                                            {selectedOrder?.shippingAddress?.state} - {selectedOrder?.shippingAddress?.zip}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">
                                            <FiCalendar /> Estimated Delivery:
                                        </span>
                                        <span className="info-value">
                                            {formatDate(selectedOrder?.estimatedDelivery)}
                                        </span>
                                    </div>
                                    {selectedOrder?.status === 'shipped' && (
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FiTruck /> Tracking Number:
                                            </span>
                                            <span className="info-value tracking-number">
                                                {selectedOrder?.trackingNumber}
                                                <button className="track-button">Track Order</button>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Information Section */}
                            <div className="modal-section">
                                <h3 className="section-title">
                                    <FiCreditCard /> Payment Information
                                </h3>
                                <div className="payment-info">
                                    <div className="info-row">
                                        <span className="info-label">Payment Method:</span>
                                        <span className="info-value">
                                            {selectedOrder?.paymentMethod === 'credit-card' ? 'Credit/Debit Card' :
                                                selectedOrder?.paymentMethod === 'upi' ? 'UPI Payment' :
                                                    selectedOrder?.paymentMethod === 'netbanking' ? 'Net Banking' : 'Cash on Delivery'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Payment Status:</span>
                                        <span className={`info-value payment-status ${selectedOrder?.paymentStatus}`}>
                                            {selectedOrder?.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                    {selectedOrder?.transactionId && (
                                        <div className="info-row">
                                            <span className="info-label">Transaction ID:</span>
                                            <span className="info-value transaction-id">
                                                {selectedOrder?.transactionId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Timeline Section */}
                            <div className="modal-section">
                                <h3 className="section-title">
                                    <FiClock /> Order Timeline
                                </h3>
                                <div className="timeline">
                                    <div className={`timeline-step ${['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(selectedOrder?.status) ? 'active' : ''}`}>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4>Order Placed</h4>
                                            <p>{formatDate(selectedOrder?.date)}</p>
                                        </div>
                                    </div>
                                    <div className={`timeline-step ${['confirmed', 'shipped', 'delivered', 'cancelled'].includes(selectedOrder?.status) ? 'active' : ''}`}>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4>Order Confirmed</h4>
                                            {['confirmed', 'shipped', 'delivered', 'cancelled'].includes(selectedOrder?.status) ? (
                                                <p>{formatDate(new Date(new Date(selectedOrder.date).getTime() + 3600000))}</p>
                                            ) : (
                                                <p>Pending</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`timeline-step ${['shipped', 'delivered'].includes(selectedOrder?.status) ? 'active' : ''}`}>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4>Shipped</h4>
                                            {['shipped', 'delivered'].includes(selectedOrder?.status) ? (
                                                <p>{formatDate(new Date(new Date(selectedOrder.date).getTime() + 86400000))}</p>
                                            ) : selectedOrder?.status === 'cancelled' ? (
                                                <p>Cancelled before shipping</p>
                                            ) : (
                                                <p>Processing</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`timeline-step ${selectedOrder?.status === 'delivered' ? 'active' : ''}`}>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4>Delivered</h4>
                                            {selectedOrder?.status === 'delivered' ? (
                                                <p>{formatDate(selectedOrder?.estimatedDelivery)}</p>
                                            ) : selectedOrder?.status === 'cancelled' ? (
                                                <p>Order was cancelled</p>
                                            ) : (
                                                <p>Expected by {formatDate(selectedOrder?.estimatedDelivery)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Total Section */}
                            <div className="modal-section total-section">
                                <h3 className="section-title">
                                    <FiDollarSign /> Order Total
                                </h3>
                                <div className="order-total-breakdown">
                                    <div className="total-row">
                                        <span>Subtotal</span>
                                        <span>₹{formatPrice(selectedOrder?.subtotal)}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Shipping</span>
                                        <span>₹{formatPrice(selectedOrder?.shipping || 0)}</span>
                                    </div>
                                    {selectedOrder?.discount > 0 && (
                                        <div className="total-row discount">
                                            <span>Discount</span>
                                            <span>-₹{formatPrice(selectedOrder?.discount)}</span>
                                        </div>
                                    )}
                                    <div className="total-row grand-total">
                                        <span>Total</span>
                                        <span>₹{formatPrice(selectedOrder?.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="action-button print-button" onClick={() => window.print()}>
                                <FiPrinter /> Print Invoice
                            </button>
                            {selectedOrder?.status === 'delivered' && (
                                <button className="action-button buy-again-button">
                                    <FiRepeat /> Buy Again
                                </button>
                            )}
                            {(selectedOrder?.status === 'pending' || selectedOrder?.status === 'confirmed') && (
                                <button
                                    className="action-button cancel-button"
                                    onClick={() => {
                                        cancelOrder(selectedOrder?.orderId);
                                        closeOrderDetails();
                                    }}
                                >
                                    <FiX /> Cancel Order
                                </button>
                            )}
                            <button
                                className="action-button remove-button"
                                onClick={() => {
                                    removeFromHistory(selectedOrder?.orderId);
                                    closeOrderDetails();
                                }}
                            >
                                <FiTrash2 /> Remove from History
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;