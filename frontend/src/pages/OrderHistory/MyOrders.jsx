// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './MyOrders.css';

// const MyOrders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const navigate = useNavigate();

//     const token = localStorage.getItem('token');
//     const user = JSON.parse(localStorage.getItem('user') || '{}');

//     useEffect(() => {
//         if (!token) {
//             navigate('/login');
//             return;
//         }
//         fetchOrders();
//     }, []);

//     const fetchOrders = async () => {
//         try {
//             const response = await axios.get(
//                 `http://localhost:5000/api/orders/user/orders`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 setOrders(response.data.orders || []);
//             }
//         } catch (error) {
//             console.error('Error fetching orders:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getStatusColor = (status) => {
//         const colors = {
//             'pending': '#ff9800',
//             'confirmed': '#4caf50',
//             'processing': '#2196f3',
//             'shipped': '#9c27b0',
//             'delivered': '#4caf50',
//             'cancelled': '#f44336'
//         };
//         return colors[status] || '#757575';
//     };

//     const getStatusIcon = (status) => {
//         const icons = {
//             'pending': '⏳',
//             'confirmed': '✅',
//             'processing': '🔄',
//             'shipped': '📦',
//             'delivered': '🎉',
//             'cancelled': '❌'
//         };
//         return icons[status] || '📋';
//     };

//     if (loading) {
//         return (
//             <div className="orders-loading">
//                 <div className="spinner"></div>
//                 <p>Loading your orders...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="my-orders-container">
//             <div className="orders-header">
//                 <h1>My Orders</h1>
//                 <p className="orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'} found</p>
//             </div>

//             {orders.length === 0 ? (
//                 <div className="no-orders">
//                     <div className="empty-state">
//                         <span className="empty-icon">🛍️</span>
//                         <h2>No orders yet</h2>
//                         <p>Looks like you haven't placed any orders yet.</p>
//                         <button
//                             className="btn-primary"
//                             onClick={() => navigate('/products')}
//                         >
//                             Start Shopping
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="orders-list">
//                     {orders.map((order) => (
//                         <div key={order.id} className="order-card">
//                             <div className="order-card-header">
//                                 <div className="order-info">
//                                     <div className="order-number">
//                                         <span className="label">Order #</span>
//                                         <span className="value">{order.order_number}</span>
//                                     </div>
//                                     <div className="order-date">
//                                         <span className="label">Placed on</span>
//                                         <span className="value">
//                                             {new Date(order.created_at).toLocaleDateString('en-IN', {
//                                                 day: 'numeric',
//                                                 month: 'short',
//                                                 year: 'numeric'
//                                             })}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <div className="order-status">
//                                     <span
//                                         className="status-badge"
//                                         style={{
//                                             backgroundColor: getStatusColor(order.order_status),
//                                             color: 'white'
//                                         }}
//                                     >
//                                         {getStatusIcon(order.order_status)} {order.order_status}
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="order-card-body">
//                                 <div className="order-items-preview">
//                                     {order.product_image && (
//                                         <img
//                                             src={order.product_image}
//                                             alt="Product"
//                                             className="product-thumbnail"
//                                         />
//                                     )}
//                                     <div className="order-summary">
//                                         <span className="item-count">
//                                             {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
//                                         </span>
//                                         <span className="total-amount">
//                                             ₹{order.total_amount}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="order-card-footer">
//                                 <div className="payment-method">
//                                     <span className="label">Payment:</span>
//                                     <span className="value">
//                                         {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}
//                                     </span>
//                                 </div>
//                                 <button
//                                     className="btn-view-order"
//                                     onClick={() => navigate(`/order-confirmation/${order.id}`, {
//                                         state: {
//                                             fromConfirmation: false,  // 🔥 IMPORTANT
//                                             orderId: order.id
//                                         }
//                                     })}
//                                 >
//                                     View Details →
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MyOrders;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [invoiceUrl, setInvoiceUrl] = useState(null);
    const [returnRequest, setReturnRequest] = useState({
        orderId: null,
        reason: '',
        comments: ''
    });
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [cancelMessage, setCancelMessage] = useState('');
    const [cancellationLimits, setCancellationLimits] = useState({
        pending: 24,
        processing: 12,
        confirmed: 6,
        refundMessage: '5-7'
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCancellationLimits();
        fetchOrders();
    }, []);

    // Fetch cancellation limits from server
    const fetchCancellationLimits = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/cancellation-limits`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setCancellationLimits({
                    pending: parseInt(response.data.settings.cancellation_time_pending) || 24,
                    processing: parseInt(response.data.settings.cancellation_time_processing) || 12,
                    confirmed: parseInt(response.data.settings.cancellation_time_confirmed) || 6,
                    refundMessage: response.data.settings.refund_time_message || '5-7'
                });
            }
        } catch (error) {
            console.error('Error fetching cancellation limits:', error);
        }
    };

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

    // Handle order cancellation
    const handleCancelOrder = async () => {
        if (!cancelReason) {
            alert('Please select a reason for cancellation');
            return;
        }

        setCancelling(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/orders/${orderToCancel}/cancel`,
                { reason: cancelReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const message = response.data.refundInitiated
                    ? `Order cancelled successfully. Refund will be processed within ${cancellationLimits.refundMessage} business days.`
                    : 'Order cancelled successfully';

                alert(message);
                fetchOrders();
                setShowCancelModal(false);
                setCancelReason('');
                setOrderToCancel(null);
                setCancelMessage('');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(error.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    // Handle order deletion
    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;

        setDeleting(true);
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/orders/${orderToDelete}/delete`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                alert('Order deleted successfully');
                fetchOrders();
                setShowDeleteModal(false);
                setOrderToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert(error.response?.data?.message || 'Failed to delete order');
        } finally {
            setDeleting(false);
        }
    };

    // Check if order can be cancelled
    const canCancelOrder = (order) => {
        const cancellableStatuses = ['pending', 'confirmed', 'processing'];

        if (order.order_status === 'shipped' ||
            order.order_status === 'delivered' ||
            order.order_status === 'cancelled') {
            return false;
        }

        if (!cancellableStatuses.includes(order.order_status)) {
            return false;
        }

        let timeLimit;
        switch (order.order_status) {
            case 'pending':
                timeLimit = cancellationLimits.pending;
                break;
            case 'processing':
                timeLimit = cancellationLimits.processing;
                break;
            case 'confirmed':
                timeLimit = cancellationLimits.confirmed;
                break;
            default:
                timeLimit = 24;
        }

        const orderDate = new Date(order.created_at);
        const hoursSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60);

        return hoursSinceOrder <= timeLimit;
    };

    // Get cancellation message with time left
    const getCancelMessage = (order) => {
        if (order.order_status === 'cancelled') return null;

        let timeLimit;
        switch (order.order_status) {
            case 'pending':
                timeLimit = cancellationLimits.pending;
                break;
            case 'processing':
                timeLimit = cancellationLimits.processing;
                break;
            case 'confirmed':
                timeLimit = cancellationLimits.confirmed;
                break;
            default:
                return null;
        }

        const orderDate = new Date(order.created_at);
        const hoursSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60);
        const hoursLeft = Math.max(0, timeLimit - hoursSinceOrder);

        if (hoursLeft > 0 && canCancelOrder(order)) {
            const minutesLeft = Math.floor((hoursLeft % 1) * 60);
            const hoursLeftInt = Math.floor(hoursLeft);

            let timeText = '';
            if (hoursLeftInt > 0) {
                timeText = `${hoursLeftInt}h ${minutesLeft > 0 ? `${minutesLeft}m` : ''}`;
            } else {
                timeText = `${minutesLeft} minutes`;
            }

            return {
                text: `⏰ Cancel within ${timeText}`,
                hoursLeft: hoursLeft,
                isUrgent: hoursLeft < 1
            };
        }

        return null;
    };

    // Check if order can be deleted
    const canDeleteOrder = (order) => {
        return order.order_status === 'cancelled';
    };

    // Handle order tracking
    const handleTrackOrder = async (orderId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/${orderId}/track`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setTrackingInfo(response.data.tracking);
                setShowTrackingModal(true);
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            alert('Unable to track order at the moment');
        }
    };

    // Handle reorder
    const handleReorder = async (orderId) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/orders/${orderId}/reorder`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Error reordering:', error);
            alert(error.response?.data?.message || 'Unable to reorder items');
        }
    };

    // Handle return request
    const handleReturnRequest = async () => {
        if (!returnRequest.reason) {
            alert('Please select a return reason');
            return;
        }

        setSubmittingReturn(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/orders/${returnRequest.orderId}/return`,
                returnRequest,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Return request submitted successfully');
                setShowReturnModal(false);
                setReturnRequest({ orderId: null, reason: '', comments: '' });
                fetchOrders();
            }
        } catch (error) {
            console.error('Error requesting return:', error);
            alert(error.response?.data?.message || 'Failed to submit return request');
        } finally {
            setSubmittingReturn(false);
        }
    };

    // Download invoice
    const downloadInvoice = async (orderId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/${orderId}/invoice`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Unable to download invoice');
        }
    };

    // Check if order can be returned
    const canReturnOrder = (order) => {
        const returnableStatuses = ['delivered'];
        const deliveryDate = new Date(order.delivered_at || order.created_at);
        const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
        return returnableStatuses.includes(order.order_status) && daysSinceDelivery <= 7;
    };

    // Filter and sort orders
    const getFilteredOrders = () => {
        let filtered = [...orders];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(order => order.order_status === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.items && order.items.some(item =>
                    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'amount-high':
                    return b.total_amount - a.total_amount;
                case 'amount-low':
                    return a.total_amount - b.total_amount;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'pending': '#ff9800',
            'confirmed': '#4caf50',
            'processing': '#2196f3',
            'shipped': '#9c27b0',
            'delivered': '#4caf50',
            'cancelled': '#f44336',
            'returned': '#ff5722',
            'refunded': '#607d8b',
            'refund_pending': '#ff9800',
            'return_requested': '#ff5722'
        };
        return colors[status] || '#757575';
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const icons = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '🔄',
            'shipped': '📦',
            'delivered': '🎉',
            'cancelled': '❌',
            'returned': '↩️',
            'refunded': '💰',
            'refund_pending': '⏳',
            'return_requested': '↩️'
        };
        return icons[status] || '📋';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const filteredOrders = getFilteredOrders();

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
                <p className="orders-count">{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found</p>
            </div>

            {/* Filters and Search Section */}
            <div className="orders-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by order # or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filter-controls">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refund_pending">Refund Pending</option>
                        <option value="refunded">Refunded</option>
                        <option value="return_requested">Return Requested</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount-high">Amount: High to Low</option>
                        <option value="amount-low">Amount: Low to High</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <div className="empty-state">
                        <span className="empty-icon">🛍️</span>
                        <h2>No orders found</h2>
                        <p>
                            {searchTerm || filterStatus !== 'all'
                                ? 'No orders match your search criteria'
                                : "Looks like you haven't placed any orders yet."}
                        </p>
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
                    {filteredOrders.map((order) => {
                        const cancelMsg = getCancelMessage(order);
                        return (
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
                                        {order.estimated_delivery && (
                                            <div className="estimated-delivery">
                                                <span className="label">Est. Delivery:</span>
                                                <span className="value">
                                                    {new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {/* Show cancellation timer */}
                                        {cancelMsg && (
                                            <div className={`cancel-timer ${cancelMsg.isUrgent ? 'urgent' : ''}`}>
                                                <span className="label">{cancelMsg.text}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="order-status">
                                        <span
                                            className="status-badge"
                                            style={{
                                                backgroundColor: getStatusColor(order.order_status),
                                                color: 'white'
                                            }}
                                        >
                                            {getStatusIcon(order.order_status)} {order.order_status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-items-preview">
                                        {order.items && order.items.map((item, index) => (
                                            <div key={index} className="order-item-mini">
                                                <img
                                                    src={item.product_image || '/uploads/products/default-product.jpg'}
                                                    alt={item.product_name}
                                                    className="product-thumbnail"
                                                />
                                                <div className="item-details">
                                                    <span className="item-name">{item.product_name}</span>
                                                    <span className="item-quantity">x{item.quantity}</span>
                                                    <span className="item-price">{formatCurrency(item.price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-row">
                                            <span className="summary-label">Subtotal:</span>
                                            <span>{formatCurrency(order.subtotal || order.total_amount)}</span>
                                        </div>
                                        {order.shipping_charge > 0 && (
                                            <div className="summary-row">
                                                <span className="summary-label">Shipping:</span>
                                                <span>{formatCurrency(order.shipping_charge)}</span>
                                            </div>
                                        )}
                                        {order.discount > 0 && (
                                            <div className="summary-row discount">
                                                <span className="summary-label">Discount:</span>
                                                <span>-{formatCurrency(order.discount)}</span>
                                            </div>
                                        )}
                                        <div className="summary-row total">
                                            <span className="summary-label">Total:</span>
                                            <span>{formatCurrency(order.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <div className="payment-method">
                                        <span className="label">Payment:</span>
                                        <span className="value">
                                            {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}
                                            {order.payment_status && (
                                                <span className={`payment-status ${order.payment_status}`}>
                                                    • {order.payment_status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="order-actions">
                                        {/* Track Order Button */}
                                        {['shipped', 'delivered'].includes(order.order_status) && (
                                            <button
                                                className="btn-track"
                                                onClick={() => handleTrackOrder(order.id)}
                                                title="Track your order"
                                            >
                                                🚚 Track
                                            </button>
                                        )}

                                        {/* Cancel Order Button */}
                                        {canCancelOrder(order) && (
                                            <button
                                                className="btn-cancel"
                                                onClick={() => {
                                                    setOrderToCancel(order.id);
                                                    setShowCancelModal(true);
                                                }}
                                                title={order.payment_method !== 'cod'
                                                    ? `Cancel within ${cancellationLimits[order.order_status]} hours for refund`
                                                    : 'Cancel order'}
                                            >
                                                ❌ Cancel
                                            </button>
                                        )}

                                        {/* Return Button */}
                                        {canReturnOrder(order) && (
                                            <button
                                                className="btn-return"
                                                onClick={() => {
                                                    setReturnRequest({ ...returnRequest, orderId: order.id });
                                                    setShowReturnModal(true);
                                                }}
                                                title="Return items within 7 days"
                                            >
                                                ↩️ Return
                                            </button>
                                        )}

                                        {/* Reorder Button */}
                                        {order.order_status !== 'cancelled' && order.order_status !== 'returned' && (
                                            <button
                                                className="btn-reorder"
                                                onClick={() => handleReorder(order.id)}
                                                title="Reorder items"
                                            >
                                                🔄 Reorder
                                            </button>
                                        )}

                                        {/* Download Invoice */}
                                        {order.order_status === 'delivered' && (
                                            <button
                                                className="btn-invoice"
                                                onClick={() => downloadInvoice(order.id)}
                                                title="Download invoice"
                                            >
                                                📄 Invoice
                                            </button>
                                        )}

                                        {/* Delete Order Button */}
                                        {canDeleteOrder(order) && (
                                            <button
                                                className="btn-delete"
                                                onClick={() => {
                                                    setOrderToDelete(order.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Permanently delete this order"
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}

                                        {/* View Details Button */}
                                        <button
                                            className="btn-view-order"
                                            onClick={() => navigate(`/order-confirmation/${order.id}`, {
                                                state: {
                                                    fromConfirmation: false,
                                                    orderId: order.id
                                                }
                                            })}
                                            title="View order details"
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cancel Order</h3>

                        {orderToCancel && orders.find(o => o.id === orderToCancel)?.payment_method !== 'cod' && (
                            <div className="cancel-info">
                                <p className="info-message">
                                    ⚠️ This is an online payment order. Cancellation will initiate a refund process.
                                    Refund will be processed within {cancellationLimits.refundMessage} business days.
                                </p>
                            </div>
                        )}

                        <p>Please select a reason for cancellation:</p>
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="modal-select"
                        >
                            <option value="">Select reason</option>
                            <option value="changed_mind">Changed my mind</option>
                            <option value="found_cheaper">Found cheaper elsewhere</option>
                            <option value="payment_issue">Payment issues</option>
                            <option value="delivery_too_long">Delivery too long</option>
                            <option value="wrong_item">Ordered wrong item</option>
                            <option value="duplicate_order">Duplicate order</option>
                            <option value="other">Other</option>
                        </select>

                        {cancelReason === 'other' && (
                            <textarea
                                placeholder="Please specify reason..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="modal-textarea"
                                rows="3"
                            />
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setOrderToCancel(null);
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Order Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content delete-modal">
                        <h3>Delete Order</h3>

                        <div className="delete-warning">
                            <span className="warning-icon">⚠️</span>
                            <p className="warning-title">Are you sure you want to delete this order?</p>
                            <p className="warning-text">
                                This action cannot be undone. The order will be permanently removed from your history.
                                {orderToDelete && orders.find(o => o.id === orderToDelete)?.payment_status === 'refund_pending' && (
                                    <span className="refund-warning">
                                        <br />Note: This order has a pending refund. Deleting it won't affect your refund status.
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setOrderToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeleteOrder}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {showTrackingModal && trackingInfo && (
                <div className="modal-overlay">
                    <div className="modal-content tracking-modal">
                        <h3>Track Order #{trackingInfo.orderNumber}</h3>

                        {trackingInfo.trackingNumber && (
                            <div className="tracking-number">
                                <strong>Tracking #:</strong> {trackingInfo.trackingNumber}
                                {trackingInfo.courierName && (
                                    <span> via {trackingInfo.courierName}</span>
                                )}
                            </div>
                        )}

                        <div className="tracking-timeline">
                            {trackingInfo.steps && trackingInfo.steps.map((step, index) => (
                                <div key={index} className={`timeline-item ${step.completed ? 'completed' : ''}`}>
                                    <div className="timeline-icon">{step.icon}</div>
                                    <div className="timeline-content">
                                        <h4>{step.title}</h4>
                                        <p>{step.description}</p>
                                        {step.date && (
                                            <span className="timeline-date">
                                                {new Date(step.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {trackingInfo.currentLocation && (
                            <div className="current-location">
                                <strong>📍 Current Location:</strong> {trackingInfo.currentLocation}
                            </div>
                        )}

                        {trackingInfo.estimatedDelivery && (
                            <div className="estimated-delivery-modal">
                                <strong>📅 Estimated Delivery:</strong>{' '}
                                {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-primary"
                                onClick={() => setShowTrackingModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Request Modal */}
            {showReturnModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Request Return</h3>

                        <div className="form-group">
                            <label>Reason for Return *</label>
                            <select
                                value={returnRequest.reason}
                                onChange={(e) => setReturnRequest({ ...returnRequest, reason: e.target.value })}
                                className="modal-select"
                            >
                                <option value="">Select reason</option>
                                <option value="defective">Product Defective/Damaged</option>
                                <option value="wrong_item">Wrong Item Delivered</option>
                                <option value="size_issue">Size/Fit Issue</option>
                                <option value="quality">Quality Not as Expected</option>
                                <option value="not_as_described">Not as Described</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Additional Comments (Optional)</label>
                            <textarea
                                placeholder="Please provide any additional details..."
                                value={returnRequest.comments}
                                onChange={(e) => setReturnRequest({ ...returnRequest, comments: e.target.value })}
                                className="modal-textarea"
                                rows="3"
                            />
                        </div>

                        <div className="return-policy-note">
                            <p>📝 Return Policy:</p>
                            <ul>
                                <li>Returns accepted within 7 days of delivery</li>
                                <li>Items must be unused and in original packaging</li>
                                <li>Refund will be processed after quality check ({cancellationLimits.refundMessage} business days)</li>
                                <li>Shipping charges are non-refundable</li>
                            </ul>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setReturnRequest({ orderId: null, reason: '', comments: '' });
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleReturnRequest}
                                disabled={submittingReturn}
                            >
                                {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;