import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [shippingOption, setShippingOption] = useState('standard');
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItems(storedCart);
            setIsLoading(false);
        }, 500);
    }, []);

    const handleQuantityChange = (id, newQuantity) => {
        const updatedCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        );
        updateCart(updatedCart);
    };

    const handleRemove = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        updateCart(updatedCart);
    };

    const updateCart = (updatedCart) => {
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const applyCoupon = () => {
        const validCoupons = {
            'SAVE10': 0.1,
            'WELCOME20': 0.2,
            'FREESHIP': 0
        };

        if (validCoupons[couponCode] !== undefined) {
            setDiscount(validCoupons[couponCode]);
            alert(`Coupon applied successfully! ${couponCode === 'FREESHIP' ? 'Free shipping activated!' : `${validCoupons[couponCode] * 100}% discount applied`}`);
        } else {
            setDiscount(0);
            alert('Invalid coupon code');
        }
    };

    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getShippingCost = () => {
        if (couponCode === 'FREESHIP') return 0;
        const subtotal = getSubtotal();
        if (subtotal > 5000) return 0;
        return shippingOption === 'express' ? 200 : 100;
    };

    const getTotal = () => {
        const subtotal = getSubtotal();
        const shipping = getShippingCost();
        return subtotal - (subtotal * discount) + shipping;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const navigateToProduct = (productId) => {
        navigate(`/product/${productId}`);
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        navigate('/checkout');
    };

    const buyNow = (product) => {
        const singleItemCart = [product];
        localStorage.setItem('cart', JSON.stringify(singleItemCart));
        navigate('/checkout');
    };

    const continueShopping = () => {
        navigate('/products');
    };

    const goBack = () => {
        navigate(-1);
    };

    const goHome = () => {
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="cart-loading">
                <div className="loading-spinner"></div>
                <p>Loading your cart...</p>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            {/* Header with navigation */}
            <header className="cart-header-nav">
                <div className="nav-container">
                    <button className="nav-btn back-btn" onClick={goBack}>
                        <span className="nav-icon">←</span> Back
                    </button>
                    <h1 className="website-title" onClick={goHome}>Pankhudi</h1>
                    <button className="nav-btn home-btn" onClick={goHome}>
                        <span className="nav-icon">⌂</span> Home
                    </button>
                </div>
            </header>

            <div className="cart-container">
                <div className="cart-header">
                    <h2>Your Shopping Cart</h2>
                    <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Looks like you haven't added anything to your cart yet</p>
                        <button className="continue-shopping-btn" onClick={continueShopping}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items-section">
                            {cartItems.map(item => (
                                <div className="cart-item-card" key={item.id} onClick={() => navigateToProduct(item.id)}>
                                    <div className="cart-item-image-container">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="cart-img"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150?text=Product+Image';
                                            }}
                                        />
                                    </div>
                                    <div className="cart-details">
                                        <h3 className="cart-item-name">{item.name}</h3>
                                        <p className="cart-item-size">Size: {item.size}</p>
                                        <p className="cart-item-price">Price: {formatPrice(item.price)}</p>

                                        <div className="quantity-selector">
                                            <button
                                                className="quantity-btn minus"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(item.id, item.quantity - 1);
                                                }}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="quantity-value">{item.quantity}</span>
                                            <button
                                                className="quantity-btn plus"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(item.id, item.quantity + 1);
                                                }}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-actions">
                                        <p className="item-total">{formatPrice(item.price * item.quantity)}</p>
                                        <button
                                            className="remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(item.id);
                                            }}
                                            aria-label={`Remove ${item.name} from cart`}
                                        >
                                            <span className="remove-icon">×</span> Remove
                                        </button>
                                        <button
                                            className="buy-now-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                buyNow(item);
                                            }}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-section">
                            <div className="summary-card">
                                <h3 className="summary-title">Order Summary</h3>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(getSubtotal())}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="summary-row discount-row">
                                        <span>Discount ({couponCode})</span>
                                        <span>-{formatPrice(getSubtotal() * discount)}</span>
                                    </div>
                                )}

                                <div className="summary-row">
                                    <div className="shipping-options">
                                        <label>Shipping</label>
                                        <select
                                            value={shippingOption}
                                            onChange={(e) => setShippingOption(e.target.value)}
                                            className="shipping-select"
                                        >
                                            <option value="standard">Standard (3-5 days) - {formatPrice(100)}</option>
                                            <option value="express">Express (1-2 days) - {formatPrice(200)}</option>
                                        </select>
                                    </div>
                                    <span>{formatPrice(getShippingCost())}</span>
                                </div>

                                <div className="coupon-section">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="coupon-input"
                                    />
                                    <button onClick={applyCoupon} className="apply-coupon-btn">
                                        Apply
                                    </button>
                                </div>

                                <div className="summary-total-row">
                                    <span>Total</span>
                                    <span className="total-price">{formatPrice(getTotal())}</span>
                                </div>

                                <button
                                    className="checkout-btn"
                                    onClick={proceedToCheckout}
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    className="continue-shopping-btn secondary"
                                    onClick={continueShopping}
                                >
                                    Continue Shopping
                                </button>
                            </div>

                            <div className="security-info">
                                <div className="security-item">
                                    <span className="security-icon">🔒</span>
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">🔄</span>
                                    <span>Easy Returns</span>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">📦</span>
                                    <span>Free Shipping on orders over {formatPrice(5000)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;