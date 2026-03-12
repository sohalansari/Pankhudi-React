// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';
// import './OrderConfirmation.css';

// const OrderConfirmation = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { orderId: urlOrderId } = useParams();

//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [emailStatus, setEmailStatus] = useState('sending');
//     const [estimatedDelivery, setEstimatedDelivery] = useState('');
//     const [pageMode, setPageMode] = useState('details'); // Default 'details'

//     const token = localStorage.getItem('token');
//     const user = JSON.parse(localStorage.getItem('user') || '{}');

//     // ✅ Location state से data लें
//     const { orderId: stateOrderId, orderNumber, totalAmount, fromConfirmation, orderData } = location.state || {};

//     useEffect(() => {
//         // 🔥 IMPORTANT: Page Mode Decide करें
//         const isFromConfirmation = fromConfirmation === true;
//         const hasStateData = !!(stateOrderId || orderNumber || totalAmount || orderData);

//         console.log('📍 Page Mode Debug:', {
//             fromConfirmation: isFromConfirmation,
//             hasStateData,
//             urlOrderId,
//             stateOrderId
//         });

//         // ✅ Mode set करें
//         if (isFromConfirmation) {
//             setPageMode('confirmation');
//             document.title = 'Order Confirmed - Pankhudi';
//         } else {
//             setPageMode('details');
//             document.title = `Order #${urlOrderId || stateOrderId} - Pankhudi`;
//         }

//         // ✅ Order ID decide करें
//         const finalOrderId = urlOrderId || stateOrderId;

//         if (!finalOrderId) {
//             console.error('❌ No order ID found');
//             navigate('/orders');
//             return;
//         }

//         // ✅ Agar state में पूरा order data है तो पहले से set करें
//         if (orderData) {
//             console.log('📦 Setting order from state data');
//             setOrder(orderData);
//             setEmailStatus('sent');
//         }

//         // ✅ Order details fetch करें
//         fetchOrderDetails(finalOrderId);

//         // ✅ Estimated delivery date set करें
//         const deliveryDate = new Date();
//         deliveryDate.setDate(deliveryDate.getDate() + 5);
//         setEstimatedDelivery(deliveryDate.toLocaleDateString('en-IN', {
//             day: 'numeric',
//             month: 'long',
//             year: 'numeric'
//         }));

//         // ✅ Scroll to top
//         window.scrollTo(0, 0);

//     }, [urlOrderId, stateOrderId, fromConfirmation, orderData]);

//     const fetchOrderDetails = async (orderId) => {
//         // ✅ Agar already data है तो fetch न करें
//         if (order && order.id === orderId) {
//             setLoading(false);
//             return;
//         }

//         try {
//             console.log('🔍 Fetching order details for ID:', orderId);

//             const response = await axios.get(
//                 `http://localhost:5000/api/orders/${orderId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 console.log('✅ Order fetched successfully');
//                 setOrder(response.data.order);
//                 setEmailStatus('sent');
//             }
//         } catch (error) {
//             console.error('❌ Error fetching order:', error);
//             setEmailStatus('failed');

//             // ✅ Agar 5 सेकंड में data नहीं आया तो orders page पर भेजें
//             setTimeout(() => {
//                 if (!order) {
//                     navigate('/orders');
//                 }
//             }, 5000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getStatusIcon = (status) => {
//         const icons = {
//             'pending': '⏳',
//             'confirmed': '✅',
//             'processing': '🔄',
//             'shipped': '📦',
//             'delivered': '🎉',
//             'cancelled': '❌',
//             'refunded': '💰'
//         };
//         return icons[status?.toLowerCase()] || '📋';
//     };

//     const getStatusColor = (status) => {
//         const colors = {
//             'pending': '#ff9800',
//             'confirmed': '#4caf50',
//             'processing': '#2196f3',
//             'shipped': '#9c27b0',
//             'delivered': '#4caf50',
//             'cancelled': '#f44336',
//             'refunded': '#607d8b'
//         };
//         return colors[status?.toLowerCase()] || '#757575';
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('en-IN', {
//             style: 'currency',
//             currency: 'INR',
//             minimumFractionDigits: 2
//         }).format(amount || 0);
//     };

//     // ✅ Loading State
//     if (loading) {
//         return (
//             <div className="confirmation-loading">
//                 <div className="spinner">
//                     <div className="double-bounce1"></div>
//                     <div className="double-bounce2"></div>
//                 </div>
//                 <p>Loading order details...</p>
//                 <p className="loading-subtitle">Please wait while we fetch your order information</p>
//             </div>
//         );
//     }

//     // ✅ Error State
//     if (!order) {
//         return (
//             <div className="confirmation-error">
//                 <div className="error-icon">❌</div>
//                 <h2>Order Not Found</h2>
//                 <p>We couldn't find your order. The order may have been deleted or you don't have permission to view it.</p>
//                 <div className="error-actions">
//                     <button
//                         className="btn-primary"
//                         onClick={() => navigate('/orders')}
//                     >
//                         View My Orders
//                     </button>
//                     <button
//                         className="btn-secondary"
//                         onClick={() => navigate('/products')}
//                     >
//                         Continue Shopping
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="order-confirmation-wrapper">
//             <div className="order-confirmation-container">

//                 {/* 🎉 Confirmation Mode Header - New Order */}
//                 {pageMode === 'confirmation' ? (
//                     <div className="success-header">
//                         <div className="success-animation">
//                             <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
//                                 <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
//                                 <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
//                             </svg>
//                         </div>

//                         <h1>Order Confirmed! 🎉</h1>
//                         <p className="confirmation-message">
//                             Thank you for shopping with <span className="brand-highlight">Pankhudi</span>!
//                         </p>
//                         <p className="order-success-message">
//                             Your order has been placed successfully and is being processed.
//                         </p>

//                         {/* Email Status Badge */}
//                         <div className={`email-status-badge ${emailStatus}`}>
//                             {emailStatus === 'sending' && (
//                                 <>
//                                     <span className="status-icon">📧</span>
//                                     <span>Sending confirmation email...</span>
//                                     <span className="loading-dots"></span>
//                                 </>
//                             )}
//                             {emailStatus === 'sent' && (
//                                 <>
//                                     <span className="status-icon">✅</span>
//                                     <span>Confirmation email sent to </span>
//                                     <strong>{order?.shipping_email || user.email}</strong>
//                                 </>
//                             )}
//                             {emailStatus === 'failed' && (
//                                 <>
//                                     <span className="status-icon">⚠️</span>
//                                     <span>Email delivery failed. You can view order details below.</span>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 ) : (
//                     /* 📋 Details Mode Header - View Existing Order */
//                     <div className="details-header">
//                         <div className="back-navigation">
//                             <button
//                                 className="back-button"
//                                 onClick={() => {
//                                     // ✅ Check karo ki kahan se aaye hain
//                                     if (window.history.length > 2) {
//                                         navigate(-1);
//                                     } else {
//                                         navigate('/orders');
//                                     }
//                                 }}
//                             >
//                                 ← Back to Orders
//                             </button>
//                         </div>
//                         <div className="details-title">
//                             <h1>Order Details</h1>
//                             <span className="order-number-badge">#{order?.order_number}</span>
//                         </div>
//                         <p className="order-placed-date">
//                             Placed on {new Date(order?.order_date).toLocaleDateString('en-IN', {
//                                 weekday: 'long',
//                                 day: 'numeric',
//                                 month: 'long',
//                                 year: 'numeric'
//                             })}
//                         </p>
//                     </div>
//                 )}

//                 {/* 📋 Main Order Details Card - Common for both modes */}
//                 <div className="order-main-card">
//                     <div className="order-header-grid">
//                         <div className="order-number-section">
//                             <span className="label">Order Number</span>
//                             <h2 className="order-number">#{order?.order_number}</h2>
//                             <span className="order-date">
//                                 {new Date(order?.order_date).toLocaleString('en-IN', {
//                                     day: 'numeric',
//                                     month: 'long',
//                                     year: 'numeric',
//                                     hour: '2-digit',
//                                     minute: '2-digit'
//                                 })}
//                             </span>
//                         </div>

//                         <div className="order-status-section">
//                             <div
//                                 className="current-status"
//                                 style={{ backgroundColor: getStatusColor(order?.order_status) }}
//                             >
//                                 {getStatusIcon(order?.order_status)} {order?.order_status?.toUpperCase()}
//                             </div>
//                             <div className="estimated-delivery">
//                                 <span className="label">Estimated Delivery</span>
//                                 <span className="date">{estimatedDelivery}</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Order Status Tracker */}
//                     <div className="order-status-tracker">
//                         <div className={`status-step ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order?.order_status) ? 'completed' : ''} ${order?.order_status === 'confirmed' ? 'active' : ''}`}>
//                             <div className="step-icon">✓</div>
//                             <span className="step-label">Confirmed</span>
//                             {order?.order_status === 'confirmed' && <span className="step-date">Just now</span>}
//                         </div>
//                         <div className={`status-step ${['processing', 'shipped', 'delivered'].includes(order?.order_status) ? 'completed' : ''} ${order?.order_status === 'processing' ? 'active' : ''}`}>
//                             <div className="step-icon">🔄</div>
//                             <span className="step-label">Processing</span>
//                         </div>
//                         <div className={`status-step ${['shipped', 'delivered'].includes(order?.order_status) ? 'completed' : ''} ${order?.order_status === 'shipped' ? 'active' : ''}`}>
//                             <div className="step-icon">📦</div>
//                             <span className="step-label">Shipped</span>
//                         </div>
//                         <div className={`status-step ${order?.order_status === 'delivered' ? 'completed active' : ''}`}>
//                             <div className="step-icon">✅</div>
//                             <span className="step-label">Delivered</span>
//                         </div>
//                     </div>

//                     {/* Payment & Total Summary */}
//                     <div className="payment-summary-grid">
//                         <div className="payment-method-card">
//                             <div className="card-icon">💳</div>
//                             <div className="card-content">
//                                 <span className="label">Payment Method</span>
//                                 <span className="value">
//                                     {order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
//                                 </span>
//                                 <span className="payment-status" style={{
//                                     color: order?.payment_status === 'completed' ? '#4caf50' : '#ff9800'
//                                 }}>
//                                     {order?.payment_status === 'completed' ? '✓ Paid' : '⏳ Pending'}
//                                 </span>
//                             </div>
//                         </div>

//                         <div className="total-amount-card">
//                             <div className="card-icon">💰</div>
//                             <div className="card-content">
//                                 <span className="label">Total Amount</span>
//                                 <span className="value amount">{formatCurrency(order?.total_amount)}</span>
//                                 {order?.payment_method === 'cod' && (
//                                     <span className="payment-note">Pay on delivery</span>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 🛍️ Order Items Section */}
//                 <div className="order-items-section">
//                     <div className="section-header">
//                         <h3>Order Items ({order?.items?.length || 0})</h3>
//                     </div>

//                     <div className="items-list">
//                         {order?.items?.map((item, index) => (
//                             <div key={index} className="order-item-card">
//                                 <div className="item-image-wrapper">
//                                     <img
//                                         src={item.product_image || '/uploads/products/default-product.jpg'}
//                                         alt={item.product_name}
//                                         className="item-image"
//                                         onError={(e) => {
//                                             e.target.src = '/uploads/products/default-product.jpg';
//                                         }}
//                                     />
//                                     <span className="item-quantity-badge">x{item.quantity}</span>
//                                 </div>

//                                 <div className="item-details-wrapper">
//                                     <div className="item-info">
//                                         <h4 className="item-name">{item.product_name}</h4>
//                                         <div className="item-specs">
//                                             {item.sku && <span className="sku">SKU: {item.sku}</span>}
//                                             {item.size && <span className="size">Size: {item.size}</span>}
//                                             {item.color && <span className="color">Color: {item.color}</span>}
//                                         </div>
//                                     </div>

//                                     <div className="item-pricing">
//                                         <div className="price-breakdown">
//                                             <span className="unit-price">₹{parseFloat(item.price).toFixed(2)}</span>
//                                             <span className="multiply">×</span>
//                                             <span className="quantity">{item.quantity}</span>
//                                             <span className="equals">=</span>
//                                             <span className="total-price">₹{parseFloat(item.total_price).toFixed(2)}</span>
//                                         </div>
//                                         {item.discount_percent > 0 && (
//                                             <span className="discount-badge">
//                                                 {item.discount_percent}% OFF
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Price Summary */}
//                     <div className="price-summary-card">
//                         <h4>Price Summary</h4>
//                         <div className="price-rows">
//                             <div className="price-ro">
//                                 <span>Subtotal</span>
//                                 <span>{formatCurrency(order?.subtotal)}</span>
//                             </div>
//                             {parseFloat(order?.shipping_charge || 0) > 0 && (
//                                 <div className="price-row">
//                                     <span>Shipping Charge</span>
//                                     <span>{formatCurrency(order?.shipping_charge)}</span>
//                                 </div>
//                             )}
//                             {parseFloat(order?.tax_amount || 0) > 0 && (
//                                 <div className="price-row">
//                                     <span>Tax</span>
//                                     <span>{formatCurrency(order?.tax_amount)}</span>
//                                 </div>
//                             )}
//                             {parseFloat(order?.discount_amount || 0) > 0 && (
//                                 <div className="price-row discount">
//                                     <span>Discount</span>
//                                     <span>-{formatCurrency(order?.discount_amount)}</span>
//                                 </div>
//                             )}
//                             <div className="price-row total">
//                                 <span>Total Amount</span>
//                                 <span className="total-amount">{formatCurrency(order?.total_amount)}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 📦 Shipping Address */}
//                 <div className="shipping-address-section">
//                     <div className="section-header">
//                         <h3>📦 Shipping Address</h3>
//                     </div>

//                     <div className="address-details-card">
//                         <div className="recipient-info">
//                             <strong>{order?.shipping_full_name}</strong>
//                         </div>
//                         <div className="full-address">
//                             <p>{order?.shipping_address}</p>
//                             <p>{order?.shipping_city}, {order?.shipping_state} - {order?.shipping_postal_code}</p>
//                             <p>{order?.shipping_country}</p>
//                         </div>
//                         <div className="contact-info">
//                             <div className="contact-item">
//                                 <span className="icon">📞</span>
//                                 <span>{order?.shipping_phone}</span>
//                             </div>
//                             <div className="contact-item">
//                                 <span className="icon">✉️</span>
//                                 <span>{order?.shipping_email}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 📱 Order Actions - Mode based */}
//                 <div className="order-actions-section">
//                     {pageMode === 'confirmation' ? (
//                         <>
//                             <div className="track-order-card">
//                                 <div className="track-icon">📍</div>
//                                 <div className="track-content">
//                                     <h4>Track Your Order</h4>
//                                     <p>Get real-time updates on your order status</p>
//                                     <button
//                                         className="btn-track"
//                                         onClick={() => navigate(`/order-confirmation/${order?.id}`)}
//                                     >
//                                         Track Order →
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="action-buttons">
//                                 <button
//                                     className="btn-primary"
//                                     onClick={() => navigate('/orders')}
//                                 >
//                                     <span className="btn-icon">📋</span>
//                                     View All Orders
//                                 </button>
//                                 <button
//                                     className="btn-secondary"
//                                     onClick={() => navigate('/products')}
//                                 >
//                                     <span className="btn-icon">🛍️</span>
//                                     Continue Shopping
//                                 </button>
//                                 <button
//                                     className="btn-outline"
//                                     onClick={() => window.print()}
//                                 >
//                                     <span className="btn-icon">🖨️</span>
//                                     Print Invoice
//                                 </button>
//                             </div>
//                         </>
//                     ) : (
//                         <div className="action-buttons details-mode">
//                             <button
//                                 className="btn-primary"
//                                 onClick={() => navigate('/orders')}
//                             >
//                                 <span className="btn-icon">📋</span>
//                                 Back to Orders
//                             </button>
//                             <button
//                                 className="btn-secondary"
//                                 onClick={() => navigate('/products')}
//                             >
//                                 <span className="btn-icon">🛍️</span>
//                                 Continue Shopping
//                             </button>
//                             <button
//                                 className="btn-outline"
//                                 onClick={() => window.print()}
//                             >
//                                 <span className="btn-icon">🖨️</span>
//                                 Print Invoice
//                             </button>
//                             {order?.order_status === 'shipped' && (
//                                 <button
//                                     className="btn-track-order"
//                                     onClick={() => window.open(`/track-order/${order?.id}`, '_blank')}
//                                 >
//                                     <span className="btn-icon">📍</span>
//                                     Track Shipment
//                                 </button>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* ❓ Need Help */}
//                 <div className="need-help-section">
//                     <div className="help-content">
//                         <span className="help-icon">❓</span>
//                         <div className="help-text">
//                             <h4>Need help with your order?</h4>
//                             <p>Our support team is available 24/7</p>
//                         </div>
//                         <div className="help-actions">
//                             <a href="/contact" className="help-link">Contact Support</a>
//                             <span className="separator">•</span>
//                             <a href="/faq" className="help-link">FAQ</a>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 📝 Order Notes */}
//                 {order?.order_note && (
//                     <div className="order-notes-section">
//                         <h4>📝 Order Notes</h4>
//                         <p>{order.order_note}</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default OrderConfirmation;







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
    const [pageMode, setPageMode] = useState('details');
    const [cancellationLimits, setCancellationLimits] = useState({
        pending: 24,
        processing: 12,
        confirmed: 6,
        refundMessage: '5-7'
    });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnRequest, setReturnRequest] = useState({
        reason: '',
        comments: ''
    });
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ✅ Location state से data लें
    const { orderId: stateOrderId, orderNumber, totalAmount, fromConfirmation, orderData } = location.state || {};

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // 🔥 Page Mode Decide करें
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

        // Fetch cancellation limits
        fetchCancellationLimits();

        // ✅ Agar state में पूरा order data है तो पहले से set करें
        if (orderData) {
            console.log('📦 Setting order from state data');
            setOrder(orderData);
            setEmailStatus('sent');
        }

        // ✅ Order details fetch करें
        fetchOrderDetails(finalOrderId);

        window.scrollTo(0, 0);

    }, [urlOrderId, stateOrderId, fromConfirmation, orderData]);

    // Fetch cancellation limits
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

                // Set estimated delivery from order data
                if (response.data.order.estimated_delivery) {
                    setEstimatedDelivery(new Date(response.data.order.estimated_delivery).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }));
                } else {
                    const deliveryDate = new Date(response.data.order.order_date);
                    deliveryDate.setDate(deliveryDate.getDate() + 5);
                    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }));
                }
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

    // Handle order cancellation
    const handleCancelOrder = async () => {
        if (!cancelReason) {
            alert('Please select a reason for cancellation');
            return;
        }

        setCancelling(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/orders/${order.id}/cancel`,
                { reason: cancelReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const message = response.data.refundInitiated
                    ? `Order cancelled successfully. Refund will be processed within ${cancellationLimits.refundMessage} business days.`
                    : 'Order cancelled successfully';

                alert(message);
                fetchOrderDetails(order.id); // Refresh order details
                setShowCancelModal(false);
                setCancelReason('');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(error.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
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
                `http://localhost:5000/api/orders/${order.id}/return`,
                returnRequest,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Return request submitted successfully');
                fetchOrderDetails(order.id); // Refresh order details
                setShowReturnModal(false);
                setReturnRequest({ reason: '', comments: '' });
            }
        } catch (error) {
            console.error('Error requesting return:', error);
            alert(error.response?.data?.message || 'Failed to submit return request');
        } finally {
            setSubmittingReturn(false);
        }
    };

    // Handle order deletion
    const handleDeleteOrder = async () => {
        setDeleting(true);
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/orders/${order.id}/delete`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                alert('Order deleted successfully');
                navigate('/orders');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert(error.response?.data?.message || 'Failed to delete order');
        } finally {
            setDeleting(false);
        }
    };

    // Handle track order
    const handleTrackOrder = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/${order.id}/track`,
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
    const handleReorder = async () => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/orders/${order.id}/reorder`,
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

    // Download invoice
    const downloadInvoice = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/${order.id}/invoice`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.order_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Unable to download invoice');
        }
    };

    // Check if order can be cancelled
    const canCancelOrder = () => {
        if (!order) return false;

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

    // Get cancellation time left
    const getCancelTimeLeft = () => {
        if (!order || !canCancelOrder()) return null;

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

        if (hoursLeft <= 0) return null;

        const minutesLeft = Math.floor((hoursLeft % 1) * 60);
        const hoursLeftInt = Math.floor(hoursLeft);

        if (hoursLeftInt > 0) {
            return `${hoursLeftInt}h ${minutesLeft > 0 ? `${minutesLeft}m` : ''}`;
        } else {
            return `${minutesLeft} minutes`;
        }
    };

    // Check if order can be returned
    const canReturnOrder = () => {
        if (!order) return false;

        const returnableStatuses = ['delivered'];
        const deliveryDate = new Date(order.delivered_at || order.created_at);
        const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
        return returnableStatuses.includes(order.order_status) && daysSinceDelivery <= 7;
    };

    // Check if order can be deleted
    const canDeleteOrder = () => {
        return order?.order_status === 'cancelled';
    };

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
            'returned': '#ff5722',
            'refunded': '#607d8b',
            'refund_pending': '#ff9800',
            'return_requested': '#ff5722'
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

    const cancelTimeLeft = getCancelTimeLeft();

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
                            {cancelTimeLeft && (
                                <div className="cancel-timer">
                                    <span className="timer-label">⏰ Cancel within:</span>
                                    <span className="timer-value">{cancelTimeLeft}</span>
                                </div>
                            )}
                        </div>

                        <div className="order-status-section">
                            <div
                                className="current-status"
                                style={{ backgroundColor: getStatusColor(order?.order_status) }}
                            >
                                {getStatusIcon(order?.order_status)} {order?.order_status?.toUpperCase().replace('_', ' ')}
                            </div>
                            <div className="estimated-delivery">
                                <span className="label">Estimated Delivery</span>
                                <span className="date">{estimatedDelivery}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Tracker */}
                    {!['cancelled', 'returned'].includes(order?.order_status) && (
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
                    )}

                    {/* Payment & Total Summary */}
                    <div className="payment-summary-grid">
                        <div className="payment-method-card">
                            <div className="card-icon">💳</div>
                            <div className="card-content">
                                <span className="label">Payment Method</span>
                                <span className="value">
                                    {order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </span>
                                <span className="payment-status" style={{
                                    color: order?.payment_status === 'completed' ? '#4caf50' :
                                        order?.payment_status === 'refunded' ? '#607d8b' : '#ff9800'
                                }}>
                                    {order?.payment_status === 'completed' ? '✓ Paid' :
                                        order?.payment_status === 'refunded' ? '💰 Refunded' :
                                            order?.payment_status === 'refund_pending' ? '⏳ Refund Pending' : '⏳ Pending'}
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
                            <div className="price-row">
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

                {/* 📱 Order Actions - Enhanced with all features */}
                <div className="order-actions-section">
                    <div className="action-buttons-grid">
                        {/* Track Order Button */}
                        {['shipped', 'delivered'].includes(order?.order_status) && (
                            <button
                                className="action-btn track-btn"
                                onClick={handleTrackOrder}
                            >
                                <span className="btn-icon">🚚</span>
                                <span className="btn-text">Track Order</span>
                            </button>
                        )}

                        {/* Cancel Order Button */}
                        {canCancelOrder() && (
                            <button
                                className="action-btn cancel-btn"
                                onClick={() => setShowCancelModal(true)}
                            >
                                <span className="btn-icon">❌</span>
                                <span className="btn-text">Cancel Order</span>
                                {cancelTimeLeft && <span className="btn-badge">{cancelTimeLeft} left</span>}
                            </button>
                        )}

                        {/* Return Button */}
                        {canReturnOrder() && (
                            <button
                                className="action-btn return-btn"
                                onClick={() => setShowReturnModal(true)}
                            >
                                <span className="btn-icon">↩️</span>
                                <span className="btn-text">Return Items</span>
                            </button>
                        )}

                        {/* Reorder Button */}
                        {order?.order_status !== 'cancelled' && order?.order_status !== 'returned' && (
                            <button
                                className="action-btn reorder-btn"
                                onClick={handleReorder}
                            >
                                <span className="btn-icon">🔄</span>
                                <span className="btn-text">Reorder</span>
                            </button>
                        )}

                        {/* Download Invoice */}
                        {order?.order_status === 'delivered' && (
                            <button
                                className="action-btn invoice-btn"
                                onClick={downloadInvoice}
                            >
                                <span className="btn-icon">📄</span>
                                <span className="btn-text">Download Invoice</span>
                            </button>
                        )}

                        {/* Delete Order Button */}
                        {canDeleteOrder() && (
                            <button
                                className="action-btn delete-btn"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <span className="btn-icon">🗑️</span>
                                <span className="btn-text">Delete Order</span>
                            </button>
                        )}

                        {/* View All Orders */}
                        <button
                            className="action-btn secondary-btn"
                            onClick={() => navigate('/orders')}
                        >
                            <span className="btn-icon">📋</span>
                            <span className="btn-text">All Orders</span>
                        </button>

                        {/* Continue Shopping */}
                        <button
                            className="action-btn primary-btn"
                            onClick={() => navigate('/products')}
                        >
                            <span className="btn-icon">🛍️</span>
                            <span className="btn-text">Continue Shopping</span>
                        </button>

                        {/* Print Invoice */}
                        <button
                            className="action-btn outline-btn"
                            onClick={() => window.print()}
                        >
                            <span className="btn-icon">🖨️</span>
                            <span className="btn-text">Print</span>
                        </button>
                    </div>
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

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cancel Order</h3>

                        {order?.payment_method !== 'cod' && (
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
                                    setReturnRequest({ reason: '', comments: '' });
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
                                {order?.payment_status === 'refund_pending' && (
                                    <span className="refund-warning">
                                        <br />Note: This order has a pending refund. Deleting it won't affect your refund status.
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
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
        </div>
    );
};

export default OrderConfirmation;