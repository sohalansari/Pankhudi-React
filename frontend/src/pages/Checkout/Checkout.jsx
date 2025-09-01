import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiChevronDown, FiChevronUp, FiCreditCard, FiTruck, FiHome, FiMapPin, FiEdit2, FiX, FiLock } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [total, setTotal] = useState(0);
    const [expandedSection, setExpandedSection] = useState('shipping');
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            type: 'home',
            name: 'Sohal Ansari',
            street: 'Near Nurani Masjid Kurla East',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400001',
            phone: '8574814934',
            isDefault: true
        },
        {
            id: 2,
            type: 'work',
            name: 'Sohal Ansari',
            street: '456 Business Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400002',
            phone: '8574814934',
            isDefault: false
        }
    ]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        type: 'home',
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        isDefault: false
    });
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    useEffect(() => {
        // Auto scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Restore scroll if body has overflow hidden
        document.body.style.overflow = 'auto';

        return () => {
            // Cleanup (in case you want to control scroll again later)
            document.body.style.overflow = 'auto';
        };
    }, []);
    // Auto scroll to top on page load
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Load saved data
        const savedOrder = localStorage.getItem('currentOrder');
        const savedCart = localStorage.getItem('pankhudiCart');
        const savedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
        const savedCardDetails = localStorage.getItem('cardDetails');
        const savedUpiId = localStorage.getItem('upiId');
        const savedBank = localStorage.getItem('selectedBank');
        const savedShippingDetails = JSON.parse(localStorage.getItem('shippingDetails'));

        if (savedOrder) {
            const orderData = JSON.parse(savedOrder);
            setOrder(orderData);
            setCartItems([orderData.product]);
        } else if (savedCart) {
            const cartData = JSON.parse(savedCart);
            setCartItems(cartData);
        }

        if (savedPaymentMethod) {
            setPaymentMethod(savedPaymentMethod);
        }
        if (savedCardDetails) {
            setCardDetails(JSON.parse(savedCardDetails));
        }
        if (savedUpiId) {
            setUpiId(savedUpiId);
        }
        if (savedBank) {
            setSelectedBank(savedBank);
        }
        if (savedShippingDetails) {
            setSelectedAddress(savedShippingDetails.selectedAddress);
            setShipping(savedShippingDetails.shipping);
            setSubtotal(savedShippingDetails.subtotal);
            setDiscount(savedShippingDetails.discount);
            setTotal(savedShippingDetails.total);
        }

        // Set default address if none selected
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress && !selectedAddress) {
            setSelectedAddress(defaultAddress.id);
        }
    }, []);

    // Calculate totals whenever cart items or discount changes
    useEffect(() => {
        const subtotalCalc = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        setSubtotal(subtotalCalc);
        const shippingCalc = subtotalCalc > 5000 ? 0 : 150;
        setShipping(shippingCalc);
        const totalCalc = subtotalCalc + shippingCalc - discount;
        setTotal(totalCalc);
    }, [cartItems, discount]);

    // Save shipping details to localStorage
    const saveShippingDetails = () => {
        const shippingData = {
            selectedAddress,
            shipping,
            subtotal,
            discount,
            total
        };
        localStorage.setItem('shippingDetails', JSON.stringify(shippingData));
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        localStorage.setItem('selectedPaymentMethod', method);
    };

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'PAN10') {
            const newDiscount = subtotal * 0.1;
            setDiscount(newDiscount);
            setCouponApplied(true);
            showNotification('Coupon applied successfully! 10% discount added.');

            // Update shipping details with new discount
            saveShippingDetails();
        } else {
            showNotification('Invalid coupon code');
        }
    };

    const removeCoupon = () => {
        setDiscount(0);
        setCouponApplied(false);
        setCouponCode('');
        saveShippingDetails(); // Update shipping details
    };

    const handleAddressSelect = (id) => {
        setSelectedAddress(id);
        saveShippingDetails(); // Save immediately when address changes
    };

    const handleAddressFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const saveNewAddress = () => {
        const newId = addresses.length + 1;
        const addressToAdd = { ...newAddress, id: newId };

        if (addressToAdd.isDefault) {
            setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
        }

        setAddresses(prev => [...prev, addressToAdd]);
        setSelectedAddress(newId);
        setShowAddressForm(false);
        setNewAddress({
            type: 'home',
            name: '',
            street: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
            isDefault: false
        });

        // Save the new address and shipping details
        saveShippingDetails();
    };

    const proceedToPayment = () => {
        if (!selectedAddress) {
            showNotification('Please select a delivery address');
            return;
        }
        saveShippingDetails(); // Save before proceeding
        setExpandedSection('payment');
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;

        // Format card number with spaces every 4 digits
        if (name === 'number') {
            const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            const updatedCardDetails = { ...cardDetails, [name]: formattedValue };
            setCardDetails(updatedCardDetails);
            localStorage.setItem('cardDetails', JSON.stringify(updatedCardDetails));
            return;
        }

        // Format expiry date with slash
        if (name === 'expiry') {
            const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
            const updatedCardDetails = { ...cardDetails, [name]: formattedValue };
            setCardDetails(updatedCardDetails);
            localStorage.setItem('cardDetails', JSON.stringify(updatedCardDetails));
            return;
        }

        const updatedCardDetails = { ...cardDetails, [name]: value };
        setCardDetails(updatedCardDetails);
        localStorage.setItem('cardDetails', JSON.stringify(updatedCardDetails));
    };

    const validatePaymentDetails = () => {
        if (paymentMethod === 'credit-card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                showNotification('Please fill all card details');
                return false;
            }

            // Simple validation for card number (16 digits)
            const cleanCardNumber = cardDetails.number.replace(/\s/g, '');
            if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
                showNotification('Please enter a valid 16-digit card number');
                return false;
            }

            // Validate expiry date (MM/YY format)
            if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
                showNotification('Please enter a valid expiry date (MM/YY)');
                return false;
            }

            // Validate CVV (3 or 4 digits)
            if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
                showNotification('Please enter a valid CVV (3 or 4 digits)');
                return false;
            }
        }

        if (paymentMethod === 'upi' && !upiId) {
            showNotification('Please enter your UPI ID');
            return false;
        }

        if (paymentMethod === 'netbanking' && !selectedBank) {
            showNotification('Please select your bank');
            return false;
        }

        return true;
    };

    const getPaymentDetails = () => {
        switch (paymentMethod) {
            case 'credit-card':
                return {
                    method: 'Credit Card',
                    details: `Card ending with ${cardDetails.number.slice(-4)}`,
                    cardName: cardDetails.name
                };
            case 'upi':
                return {
                    method: 'UPI',
                    details: upiId
                };
            case 'netbanking':
                return {
                    method: 'Net Banking',
                    details: selectedBank
                };
            case 'cod':
                return {
                    method: 'Cash on Delivery',
                    details: 'Pay when you receive your order'
                };
            default:
                return {
                    method: paymentMethod,
                    details: ''
                };
        }
    };

    const createOrder = (status, transactionId = null) => {
        // Get shipping details from local storage first
        const savedShippingDetails = JSON.parse(localStorage.getItem('shippingDetails'));
        const selectedAddr = addresses.find(addr => addr.id === selectedAddress) ||
            (savedShippingDetails && savedShippingDetails.selectedAddress);

        if (!selectedAddr) {
            showNotification('Please select a delivery address');
            return;
        }

        // Use shipping details from local storage if available
        const finalShipping = savedShippingDetails ? savedShippingDetails.shipping : shipping;
        const finalSubtotal = savedShippingDetails ? savedShippingDetails.subtotal : subtotal;
        const finalDiscount = savedShippingDetails ? savedShippingDetails.discount : discount;
        const finalTotal = savedShippingDetails ? savedShippingDetails.total : total;

        const formattedItems = cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize
        }));

        const orderDetails = {
            orderId: `PANKH${Date.now()}`,
            date: new Date().toISOString(),
            items: formattedItems,
            shippingAddress: selectedAddr,
            paymentMethod,
            subtotal: finalSubtotal,
            shipping: finalShipping,
            discount: finalDiscount,
            total: finalTotal,
            status: status,
            transactionId: transactionId,
            paymentDetails: getPaymentDetails(),
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
        };

        // Save to order history
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        localStorage.setItem('orderHistory', JSON.stringify([...orderHistory, orderDetails]));

        // Clear temporary data
        localStorage.removeItem('selectedPaymentMethod');
        localStorage.removeItem('cardDetails');
        localStorage.removeItem('upiId');
        localStorage.removeItem('selectedBank');
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('pankhudiCart');
        localStorage.removeItem('shippingDetails');

        navigate('/order-confirmation', { state: { order: orderDetails } });
    };

    const redirectToDummyPayment = () => {
        if (!paymentMethod) {
            showNotification('Please select a payment method');
            return;
        }

        if (!validatePaymentDetails()) {
            return;
        }

        // Get the selected address
        const selectedAddr = addresses.find(addr => addr.id === selectedAddress);

        // Save shipping details again to ensure they're up to date
        saveShippingDetails();

        // For COD, place the order directly
        if (paymentMethod === 'cod') {
            createOrder('confirmed');
            return;
        }

        // Prepare payment data with all necessary details
        const paymentData = {
            amount: total,
            currency: 'INR',
            method: paymentMethod,
            orderId: `PANKH${Date.now()}`,
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            })),
            shippingDetails: {
                address: selectedAddr,
                shippingCharge: shipping
            },
            ...(paymentMethod === 'credit-card' && {
                cardDetails,
                maskedCard: `**** **** **** ${cardDetails.number.slice(-4)}`
            }),
            ...(paymentMethod === 'upi' && { upiId }),
            ...(paymentMethod === 'netbanking' && { bank: selectedBank }),
            callbackUrl: `${window.location.origin}/order-confirmation`,
            customerDetails: selectedAddr
        };

        // Store payment data temporarily
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));

        // Redirect to dummy payment page with all necessary data
        navigate('/dummy-payment', {
            state: {
                paymentData,
                orderSummary: {
                    items: cartItems,
                    subtotal,
                    shipping,
                    discount,
                    total,
                    shippingAddress: selectedAddr
                }
            }
        });
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'pankhudi-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('pankhudi-notification-show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('pankhudi-notification-show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    return (
        <div className="pankhudi-checkout-container">
            <div className="pankhudi-checkout-header">
                <Link to="/" className="pankhudi-checkout-logo">Pankhudi</Link>
                <div className="pankhudi-checkout-steps">
                    <div className={`pankhudi-step ${expandedSection === 'shipping' ? 'active' : ''}`}>
                        <span>1</span>
                        <p>Shipping</p>
                    </div>
                    <div className={`pankhudi-step ${expandedSection === 'payment' ? 'active' : ''}`}>
                        <span>2</span>
                        <p>Payment</p>
                    </div>
                    <div className="pankhudi-step">
                        <span>3</span>
                        <p>Confirmation</p>
                    </div>
                </div>
            </div>

            <div className="pankhudi-checkout-main">
                <div className="pankhudi-checkout-form">
                    {/* Shipping Section */}
                    <div className="pankhudi-checkout-section">
                        <div
                            className="pankhudi-section-header"
                            onClick={() => setExpandedSection(expandedSection === 'shipping' ? null : 'shipping')}
                        >
                            <h2>
                                <FiTruck className="pankhudi-section-icon" />
                                Shipping Information
                            </h2>
                            {expandedSection === 'shipping' ? <FiChevronUp /> : <FiChevronDown />}
                        </div>

                        {expandedSection === 'shipping' && (
                            <div className="pankhudi-section-content">
                                <h3>Select Delivery Address</h3>
                                <div className="pankhudi-address-list">
                                    {addresses.map(address => (
                                        <div
                                            key={address.id}
                                            className={`pankhudi-address-card ${selectedAddress === address.id ? 'selected' : ''}`}
                                            onClick={() => handleAddressSelect(address.id)}
                                        >
                                            <div className="pankhudi-address-type">
                                                {address.type === 'home' ? <FiHome /> : <FiMapPin />}
                                                <span>{address.type === 'home' ? 'Home' : 'Work'}</span>
                                                {address.isDefault && <span className="pankhudi-default-badge">Default</span>}
                                            </div>
                                            <p className="pankhudi-address-name">{address.name}</p>
                                            <p className="pankhudi-address-street">{address.street}</p>
                                            <p className="pankhudi-address-city">{address.city}, {address.state} - {address.zip}</p>
                                            <p className="pankhudi-address-phone">Phone: {address.phone}</p>
                                            <button className="pankhudi-edit-address">
                                                <FiEdit2 /> Edit
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {showAddressForm ? (
                                    <div className="pankhudi-new-address-form">
                                        <h3>Add New Address</h3>
                                        <div className="pankhudi-form-group">
                                            <label>Address Type</label>
                                            <select
                                                name="type"
                                                value={newAddress.type}
                                                onChange={handleAddressFormChange}
                                            >
                                                <option value="home">Home</option>
                                                <option value="work">Work</option>
                                            </select>
                                        </div>
                                        <div className="pankhudi-form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={newAddress.name}
                                                onChange={handleAddressFormChange}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div className="pankhudi-form-group">
                                            <label>Street Address</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={newAddress.street}
                                                onChange={handleAddressFormChange}
                                                placeholder="House number and street name"
                                            />
                                        </div>
                                        <div className="pankhudi-form-row">
                                            <div className="pankhudi-form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={newAddress.city}
                                                    onChange={handleAddressFormChange}
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                            <div className="pankhudi-form-group">
                                                <label>State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={newAddress.state}
                                                    onChange={handleAddressFormChange}
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                            <div className="pankhudi-form-group">
                                                <label>ZIP Code</label>
                                                <input
                                                    type="text"
                                                    name="zip"
                                                    value={newAddress.zip}
                                                    onChange={handleAddressFormChange}
                                                    placeholder="Enter ZIP code"
                                                />
                                            </div>
                                        </div>
                                        <div className="pankhudi-form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={newAddress.phone}
                                                onChange={handleAddressFormChange}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="pankhudi-form-checkbox">
                                            <input
                                                type="checkbox"
                                                id="defaultAddress"
                                                name="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={handleAddressFormChange}
                                            />
                                            <label htmlFor="defaultAddress">Set as default address</label>
                                        </div>
                                        <div className="pankhudi-form-actions">
                                            <button
                                                className="pankhudi-cancel-btn"
                                                onClick={() => setShowAddressForm(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="pankhudi-save-btn"
                                                onClick={saveNewAddress}
                                            >
                                                Save Address
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="pankhudi-add-address-btn"
                                        onClick={() => setShowAddressForm(true)}
                                    >
                                        + Add New Address
                                    </button>
                                )}

                                <div className="pankhudi-shipping-actions">
                                    <Link to="/cart" className="pankhudi-back-to-cart">
                                        ← Back to Cart
                                    </Link>
                                    <button
                                        className="pankhudi-proceed-btn"
                                        onClick={proceedToPayment}
                                        disabled={!selectedAddress}
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="pankhudi-checkout-section">
                        <div
                            className="pankhudi-section-header"
                            onClick={() => setExpandedSection(expandedSection === 'payment' ? null : 'payment')}
                        >
                            <h2>
                                <FiCreditCard className="pankhudi-section-icon" />
                                Payment Method
                            </h2>
                            {expandedSection === 'payment' ? <FiChevronUp /> : <FiChevronDown />}
                        </div>

                        {expandedSection === 'payment' && (
                            <div className="pankhudi-section-content">
                                <div className="pankhudi-payment-security-banner">
                                    <FiLock className="pankhudi-security-icon" />
                                    <span>Secure Payment</span>
                                    <span>•</span>
                                    <span>SSL Encrypted</span>
                                    <span>•</span>
                                    <span>Your data is safe</span>
                                </div>

                                <div className="pankhudi-payment-methods">
                                    <div
                                        className={`pankhudi-payment-method ${paymentMethod === 'credit-card' ? 'selected' : ''}`}
                                        onClick={() => handlePaymentMethodChange('credit-card')}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === 'credit-card'}
                                            onChange={() => { }}
                                        />
                                        <div className="pankhudi-payment-details">
                                            <h3>Credit/Debit Card</h3>
                                            <p>Pay using Visa, Mastercard, Rupay, or other cards</p>
                                        </div>
                                    </div>

                                    <div
                                        className={`pankhudi-payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                        onClick={() => handlePaymentMethodChange('upi')}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === 'upi'}
                                            onChange={() => { }}
                                        />
                                        <div className="pankhudi-payment-details">
                                            <h3>UPI Payment</h3>
                                            <p>Pay using Google Pay, PhonePe, Paytm or other UPI apps</p>
                                        </div>
                                    </div>

                                    <div
                                        className={`pankhudi-payment-method ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                                        onClick={() => handlePaymentMethodChange('netbanking')}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === 'netbanking'}
                                            onChange={() => { }}
                                        />
                                        <div className="pankhudi-payment-details">
                                            <h3>Net Banking</h3>
                                            <p>Pay directly from your bank account</p>
                                        </div>
                                    </div>

                                    <div
                                        className={`pankhudi-payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                        onClick={() => handlePaymentMethodChange('cod')}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => { }}
                                        />
                                        <div className="pankhudi-payment-details">
                                            <h3>Cash on Delivery</h3>
                                            <p>Pay when you receive your order</p>
                                        </div>
                                    </div>
                                </div>

                                {paymentMethod === 'credit-card' && (
                                    <div className="pankhudi-card-details">
                                        <h3>Card Details</h3>
                                        <div className="pankhudi-form-group">
                                            <label>Card Number</label>
                                            <input
                                                type="text"
                                                name="number"
                                                value={cardDetails.number}
                                                onChange={handleCardInputChange}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                            />
                                        </div>
                                        <div className="pankhudi-form-row">
                                            <div className="pankhudi-form-group">
                                                <label>Expiry Date</label>
                                                <input
                                                    type="text"
                                                    name="expiry"
                                                    value={cardDetails.expiry}
                                                    onChange={handleCardInputChange}
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                />
                                            </div>
                                            <div className="pankhudi-form-group">
                                                <label>CVV</label>
                                                <input
                                                    type="password"
                                                    name="cvv"
                                                    value={cardDetails.cvv}
                                                    onChange={handleCardInputChange}
                                                    placeholder="123"
                                                    maxLength="3"
                                                />
                                            </div>
                                        </div>
                                        <div className="pankhudi-form-group">
                                            <label>Name on Card</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={cardDetails.name}
                                                onChange={handleCardInputChange}
                                                placeholder="Enter name as on card"
                                            />
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'upi' && (
                                    <div className="pankhudi-upi-details">
                                        <h3>Enter UPI ID</h3>
                                        <div className="pankhudi-form-group">
                                            <input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => {
                                                    setUpiId(e.target.value);
                                                    localStorage.setItem('upiId', e.target.value);
                                                }}
                                                placeholder="yourname@upi"
                                            />
                                        </div>
                                        <p className="pankhudi-upi-note">You'll be redirected to your UPI app to complete the payment</p>
                                    </div>
                                )}

                                {paymentMethod === 'netbanking' && (
                                    <div className="pankhudi-netbanking-details">
                                        <h3>Select Bank</h3>
                                        <select
                                            value={selectedBank}
                                            onChange={(e) => {
                                                setSelectedBank(e.target.value);
                                                localStorage.setItem('selectedBank', e.target.value);
                                            }}
                                        >
                                            <option value="">Select your bank</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="kotak">Kotak Mahindra Bank</option>
                                        </select>
                                        <p className="pankhudi-netbanking-note">You'll be redirected to your bank's website to complete the payment</p>
                                    </div>
                                )}

                                <div className="pankhudi-payment-actions">
                                    <button
                                        className="pankhudi-back-btn"
                                        onClick={() => setExpandedSection('shipping')}
                                    >
                                        ← Back to Shipping
                                    </button>
                                    <button
                                        className="pankhudi-place-order-btn"
                                        onClick={redirectToDummyPayment}
                                        disabled={isProcessingPayment}
                                    >
                                        {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pankhudi-order-summary">
                    <h2>Order Summary</h2>
                    <div className="pankhudi-summary-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="pankhudi-summary-item">
                                <div className="pankhudi-item-image">
                                    <img src={item.image} alt={item.name} />
                                    <span className="pankhudi-item-quantity">{item.quantity || 1}</span>
                                </div>
                                <div className="pankhudi-item-details">
                                    <h4>{item.name}</h4>
                                    {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                                    <p className="pankhudi-item-price">₹{item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pankhudi-coupon-section">
                        <h3>Apply Coupon</h3>
                        {couponApplied ? (
                            <div className="pankhudi-coupon-applied">
                                <p>Coupon: {couponCode} (-₹{discount.toLocaleString()})</p>
                                <button onClick={removeCoupon}>
                                    <FiX />
                                </button>
                            </div>
                        ) : (
                            <div className="pankhudi-coupon-input">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button onClick={applyCoupon}>Apply</button>
                            </div>
                        )}
                    </div>

                    <div className="pankhudi-summary-totals">
                        <div className="pankhudi-summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="pankhudi-summary-row">
                            <span>Shipping</span>
                            <span>₹{shipping.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="pankhudi-summary-row pankhudi-discount-row">
                                <span>Discount</span>
                                <span>-₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="pankhudi-summary-row pankhudi-total-row">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;