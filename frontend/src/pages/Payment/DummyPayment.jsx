import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiCreditCard, FiCheckCircle, FiXCircle, FiLoader, FiChevronRight, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './DummyPayment.css';

const DummyPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentData, setPaymentData] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [activeTab, setActiveTab] = useState('details');
    const [cardFlip, setCardFlip] = useState(false);
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);
    useEffect(() => {
        if (location.state?.paymentData) {
            setPaymentData(location.state.paymentData);
            sessionStorage.setItem('paymentData', JSON.stringify(location.state.paymentData));
        } else {
            const savedPaymentData = sessionStorage.getItem('paymentData');
            if (savedPaymentData) {
                setPaymentData(JSON.parse(savedPaymentData));
            } else {
                navigate('/checkout');
            }
        }
        const order = JSON.parse(localStorage.getItem('currentOrder'));
        if (order) {
            setCurrentOrder(order);
        } else {
            navigate('/checkout');
        }
    }, [location.state, navigate]);

    const processPayment = () => {
        setIsProcessing(true);

        // Simulate API call to payment gateway
        setTimeout(() => {
            const isSuccess = Math.random() < 0.8;
            setPaymentStatus(isSuccess ? 'success' : 'failed');
            setIsProcessing(false);

            if (isSuccess) {
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            completePayment();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }, 3000);
    };

    const completePayment = () => {
        if (!currentOrder || !paymentData) return;

        const orderDetails = {
            orderId: paymentData.orderId,
            date: new Date().toISOString(),
            product: currentOrder.product,
            paymentMethod: paymentData.method,
            amount: paymentData.amount,
            status: 'confirmed',
            transactionId: `TXN${Date.now()}`,
            paymentStatus: 'completed',
            deliveryAddress: JSON.parse(localStorage.getItem('shippingAddress')),
            tax: currentOrder.product.price * 0.18,
            totalAmount: currentOrder.product.price * 1.18
        };

        // Add to order history
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        localStorage.setItem('orderHistory', JSON.stringify([...orderHistory, orderDetails]));

        // Clear temporary storage
        sessionStorage.removeItem('paymentData');
        localStorage.removeItem('currentOrder');

        // Navigate to confirmation page
        navigate('/order-confirmation', { state: { order: orderDetails } });
    };

    const renderPaymentMethodIcon = () => {
        switch (paymentData?.method) {
            case 'credit-card':
                return <FiCreditCard className="payment-method-icon" />;
            case 'upi':
                return <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/upi-icon.png" alt="UPI" className="payment-method-icon" />;
            case 'netbanking':
                return <img src="https://static.vecteezy.com/system/resources/previews/000/287/729/original/internet-banking-vector-icon.jpg" alt="Net Banking" className="payment-method-icon" />;
            default:
                return <FiCreditCard className="payment-method-icon" />;
        }
    };

    const renderPaymentMethodDetails = () => {
        if (!paymentData) return null;

        switch (paymentData.method) {
            case 'credit-card':
                return (
                    <div className={`payment-card ${cardFlip ? 'flipped' : ''}`}>
                        <div className="card-face front">
                            <div className="card-chip"></div>
                            <div className="card-number">
                                •••• •••• •••• {paymentData.cardDetails?.number?.slice(-4)}
                            </div>
                            <div className="card-details">
                                <div>
                                    <span className="card-label">Card Holder</span>
                                    <span>{paymentData.cardDetails?.name}</span>
                                </div>
                                <div>
                                    <span className="card-label">Expires</span>
                                    <span>{paymentData.cardDetails?.expiry}</span>
                                </div>
                            </div>
                            <button
                                className="card-flip-btn"
                                onClick={() => setCardFlip(!cardFlip)}
                            >
                                Show CVV
                            </button>
                        </div>
                        <div className="card-face back">
                            <div className="card-magnetic-strip"></div>
                            <div className="card-cvv">
                                <span>CVV</span>
                                <span>{paymentData.cardDetails?.cvv}</span>
                            </div>
                        </div>
                        <button
                            className="card-flip-btn"
                            onClick={() => setCardFlip(!cardFlip)}
                        >
                            {cardFlip ? 'Show Card Front' : 'Show CVV'}
                        </button>
                    </div>
                );
            case 'upi':
                return (
                    <div className="payment-details-upi">
                        <div className="upi-id-display">
                            <span>UPI ID:</span>
                            <span className="upi-id-value">{paymentData.upiId}</span>
                        </div>
                        <div className="upi-apps-grid">
                            {['Google Pay', 'PhonePe', 'Paytm', 'Amazon Pay', 'BHIM'].map(app => (
                                <div key={app} className="upi-app-tile">
                                    <img
                                        src={`https://logo.clearbit.com/${app.toLowerCase().replace(' ', '')}.com`}
                                        alt={app}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/50';
                                        }}
                                    />
                                    <span>{app}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'netbanking':
                return (
                    <div className="payment-details-netbanking">
                        <div className="bank-logo">
                            <img
                                src={`https://logo.clearbit.com/${paymentData.bank.toLowerCase().replace(' ', '')}.com`}
                                alt={paymentData.bank}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100x50';
                                }}
                            />
                        </div>
                        <div className="bank-redirect-notice">
                            <FiChevronRight className="redirect-icon" />
                            <p>You will be securely redirected to {paymentData.bank}'s authentication page</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderOrderSummary = () => {
        if (!currentOrder) return null;

        return (
            <div className="order-summary-details">
                <h3>Order #{paymentData?.orderId || 'N/A'}</h3>
                <div className="summary-items">
                    <div className="summary-item">
                        <div
                            className="item-image"
                            style={{ backgroundImage: `url(${currentOrder.product.image})` }}
                        ></div>
                        <div className="item-details">
                            <h4>{currentOrder.product.name}</h4>
                            <p>Quantity: 1</p>
                            <p>Color: {currentOrder.product.selectedColor}</p>
                            <p>Size: {currentOrder.product.selectedSize}</p>
                            <div className="price-container">
                                <span className="original-price">
                                    ₹{currentOrder.product.originalPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="discounted-price">
                                    ₹{currentOrder.product.price.toLocaleString('en-IN')}
                                </span>
                                {currentOrder.product.discount > 0 && (
                                    <span className="discount-badge">
                                        {currentOrder.product.discount}% OFF
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="item-price">
                            ₹{currentOrder.product.price.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="summary-totals">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{currentOrder.product.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>FREE</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax (18%)</span>
                        <span>₹{(currentOrder.product.price * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row grand-total">
                        <span>Total Amount</span>
                        <span>₹{(currentOrder.product.price * 1.18).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (!paymentData || !currentOrder) {
        return (
            <div className="payment-container loading-screen">
                <div className="payment-loading">
                    <div className="loading-spinner">
                        <div className="spinner-circle"></div>
                        <div className="spinner-circle"></div>
                        <div className="spinner-circle"></div>
                    </div>
                    <p>Loading your secure payment details...</p>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'success') {
        return (
            <div className="payment-container success-screen">
                <motion.div
                    className="payment-success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="success-animation">
                        <svg className="checkmark" viewBox="0 0 52 52">
                            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h2>Payment Successful!</h2>
                    <p className="success-amount">₹{(currentOrder.product.price * 1.18).toLocaleString('en-IN')}</p>
                    <p className="success-message">
                        Your order for <strong>{currentOrder.product.name}</strong> has been confirmed.
                    </p>

                    <div className="countdown-container">
                        <div className="countdown-circle">
                            <svg className="countdown-svg" viewBox="0 0 36 36">
                                <path
                                    className="countdown-circle-bg"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="countdown-circle"
                                    strokeDasharray={`${(countdown / 5) * 100}, 100`}
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="countdown-text">{countdown}</span>
                        </div>
                        <p>Redirecting to order confirmation</p>
                    </div>

                    <button
                        className="payment-action-button"
                        onClick={completePayment}
                    >
                        View Order Details Now
                    </button>
                </motion.div>
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="payment-container failed-screen">
                <motion.div
                    className="payment-failed"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="failure-animation">
                        <svg className="crossmark" viewBox="0 0 52 52">
                            <circle className="crossmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="crossmark-cross" fill="none" d="M16 16 36 36 M36 16 16 36" />
                        </svg>
                    </div>
                    <h2>Payment Failed</h2>
                    <p className="failure-message">
                        We couldn't process your payment of ₹{(currentOrder.product.price * 1.18).toLocaleString('en-IN')}
                    </p>
                    <p className="failure-reason">Reason: Payment gateway timeout (Code: PG-408)</p>

                    <div className="payment-actions">
                        <button
                            className="payment-action-button"
                            onClick={() => setPaymentStatus(null)}
                        >
                            Try Payment Again
                        </button>
                        <button
                            className="payment-action-button secondary"
                            onClick={() => navigate('/checkout')}
                        >
                            Change Payment Method
                        </button>
                    </div>

                    <div className="support-contact">
                        <p>Need help? Contact our support team:</p>
                        <a href="mailto:support@pankhudi.com">support@pankhudi.com</a>
                        <a href="tel:+911234567890">+91 12345 67890</a>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <div className="payment-header">
                <div className="payment-logo">
                    <span className="logo-icon">🛍️</span>
                    <span className="logo-text">Pankhudi</span>
                    <span className="logo-badge">Premium</span>
                </div>
                <div className="payment-security">
                    <FiShield className="shield-icon" />
                    <span>256-bit SSL Secured</span>
                    <div className="trust-badges">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/verisign-5-569486.png" alt="Verisign" />
                        <img src="https://cdn.iconscout.com/icon/free/png-256/pci-compliance-1-569479.png" alt="PCI Compliant" />
                    </div>
                </div>
            </div>

            <div className="payment-progress-tracker">
                <div className="progress-steps">
                    <div className="progress-connector completed"></div>
                    <div className="progress-step completed">
                        <div className="step-number">1</div>
                        <div className="step-label">Shipping</div>
                    </div>
                    <div className="progress-connector completed"></div>
                    <div className="progress-step active">
                        <div className="step-number">2</div>
                        <div className="step-label">Payment</div>
                    </div>
                    <div className="progress-connector"></div>
                    <div className="progress-step">
                        <div className="step-number">3</div>
                        <div className="step-label">Confirmation</div>
                    </div>
                </div>
            </div>

            <div className="payment-content-wrapper">
                <div className="payment-main-content">
                    <div className="payment-tabs">
                        <button
                            className={`payment-tab ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Payment Details
                        </button>
                        <button
                            className={`payment-tab ${activeTab === 'summary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('summary')}
                        >
                            Order Summary
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: activeTab === 'details' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: activeTab === 'details' ? -20 : 20 }}
                            transition={{ duration: 0.3 }}
                            className="tab-content"
                        >
                            {activeTab === 'details' ? (
                                <div className="payment-method-details">
                                    <h3>
                                        {renderPaymentMethodIcon()}
                                        {paymentData.method === 'credit-card' && 'Credit/Debit Card'}
                                        {paymentData.method === 'upi' && 'UPI Payment'}
                                        {paymentData.method === 'netbanking' && 'Net Banking'}
                                        <span className="method-change" onClick={() => navigate('/checkout')}>
                                            Change
                                        </span>
                                    </h3>
                                    {renderPaymentMethodDetails()}
                                </div>
                            ) : (
                                renderOrderSummary()
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="payment-actions">
                        <button
                            className={`payment-button ${isProcessing ? 'processing' : ''}`}
                            onClick={processPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="button-spinner"></div>
                                    Processing Payment...
                                </>
                            ) : (
                                `Pay ₹${(currentOrder.product.price * 1.18).toLocaleString('en-IN')}`
                            )}
                        </button>
                        <button
                            className="payment-button secondary"
                            onClick={() => navigate('/checkout')}
                            disabled={isProcessing}
                        >
                            Back to Checkout
                        </button>
                    </div>
                </div>

                <div className="payment-sidebar">
                    <div className="sidebar-card secure-payment-card">
                        <FiLock className="lock-icon" />
                        <h4>Secure Payment</h4>
                        <p>Your payment information is processed securely. We do not store your credit card details.</p>
                        <div className="security-badges">
                            <img src="https://cdn.iconscout.com/icon/free/png-256/norton-5-569493.png" alt="Norton Secured" />
                            <img src="https://cdn.iconscout.com/icon/free/png-256/mcafee-3-569485.png" alt="McAfee Secure" />
                        </div>
                    </div>

                    <div className="sidebar-card support-card">
                        <h4>Need Help?</h4>
                        <p>Our customer support is available 24/7 to assist you with your payment.</p>
                        <button className="support-button">
                            Contact Support
                        </button>
                    </div>

                    <div className="sidebar-card benefits-card">
                        <h4>Pankhudi Premium Benefits</h4>
                        <ul>
                            <li>Free shipping on all orders</li>
                            <li>Extended return period (30 days)</li>
                            <li>Exclusive member discounts</li>
                            <li>Priority customer support</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="payment-footer">
                <p>© 2023 Pankhudi. All rights reserved.</p>
                <div className="footer-linkss">
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Refund Policy</a>
                </div>
            </div>
        </div>
    );
};

export default DummyPayment;