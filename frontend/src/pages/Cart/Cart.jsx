import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [removingItems, setRemovingItems] = useState(new Set());
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

    // Fetch cart items with enhanced error handling
    const fetchCart = async () => {
        if (!userId || !token) {
            setCartItems([]);
            setLoading(false);
            setError("Please login to view your cart");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`http://localhost:5000/api/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000 // 10 second timeout
            });
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            const errorMessage = error.response?.data?.message ||
                error.code === 'ECONNABORTED' ? "Request timeout" :
                "Failed to fetch cart items";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Update quantity with loading state
    const updateQuantity = async (cartId, newQty, productName) => {
        if (newQty <= 0) return;

        setUpdatingItems(prev => new Set(prev).add(cartId));
        try {
            await axios.put(
                `http://localhost:5000/api/cart/update/${cartId}`,
                { quantity: newQty },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                }
            );
            await fetchCart();
        } catch (error) {
            console.error("Update error:", error);
            alert(`Failed to update quantity for ${productName}`);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartId);
                return newSet;
            });
        }
    };

    // Remove item with confirmation and loading state
    const removeItem = async (cartId, productName) => {
        if (!window.confirm(`Are you sure you want to remove "${productName}" from your cart?`)) return;

        setRemovingItems(prev => new Set(prev).add(cartId));
        try {
            await axios.delete(`http://localhost:5000/api/cart/delete/${cartId}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            });
            await fetchCart();
        } catch (error) {
            console.error("Remove error:", error);
            alert(`Failed to remove ${productName}`);
        } finally {
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartId);
                return newSet;
            });
        }
    };

    // Apply promo code with validation
    const applyPromoCode = async () => {
        if (!promoCode.trim()) {
            setError("Please enter a promo code");
            return;
        }

        setApplyingPromo(true);
        setError("");
        try {
            // Simulate API call for promo code validation
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Promo code validation logic
            const promoCodes = {
                "SAVE10": 0.1,
                "WELCOME15": 0.15,
                "FREESHIP": 0.05 // Free shipping equivalent
            };

            const code = promoCode.toUpperCase().trim();
            if (promoCodes[code]) {
                setDiscount(promoCodes[code]);
                setError("");
            } else {
                setError("Invalid promo code");
                setDiscount(0);
            }
        } catch (error) {
            setError("Failed to apply promo code");
        } finally {
            setApplyingPromo(false);
        }
    };

    // Clear promo code
    const clearPromoCode = () => {
        setPromoCode("");
        setDiscount(0);
        setError("");
    };

    // Handle product click to redirect to product details
    const handleProductClick = (productId) => {
        navigate(`/ProductDetail/${productId}`);
    };

    // Handle buy now button click
    const handleBuyNow = (product) => {
        //implement direct purchase logic here
        // For now, redirect to checkout with single product
        navigate('/checkout', {
            state: {
                products: [product],
                total: (product.final_price || product.price) * product.quantity
            }
        });
    };

    // Calculate prices
    const subtotal = cartItems.reduce(
        (acc, item) => acc + (item.final_price || item.price) * item.quantity,
        0
    );

    const discountAmount = subtotal * discount;
    const total = Math.max(0, subtotal - discountAmount);
    const savings = cartItems.reduce(
        (acc, item) => acc + (item.discount > 0 ? (item.price - (item.final_price || item.price)) * item.quantity : 0),
        0
    );

    useEffect(() => {
        fetchCart();
    }, [userId, token]);

    // Auto-remove error message after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="pankhudi-cart-wrapper">
            {/* Header Section */}
            <div className="pankhudi-cart-header">
                <button className="pankhudi-back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1 className="brand-name">Pankhudi</h1>
                <div className="pankhudi-cart-stats">
                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="pankhudi-error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="pankhudi-error-close">×</button>
                </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
                <div className="pankhudi-loading-container">
                    <div className="pankhudi-skeleton-header"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="pankhudi-cart-item-skeleton">
                            <div className="pankhudi-skeleton-image"></div>
                            <div className="pankhudi-skeleton-details">
                                <div className="pankhudi-skeleton-line"></div>
                                <div className="pankhudi-skeleton-line pankhudi-short"></div>
                                <div className="pankhudi-skeleton-line pankhudi-shorter"></div>
                            </div>
                            <div className="pankhudi-skeleton-actions">
                                <div className="pankhudi-skeleton-btn"></div>
                                <div className="pankhudi-skeleton-btn pankhudi-short"></div>
                            </div>
                        </div>
                    ))}
                    <div className="pankhudi-skeleton-summary"></div>
                </div>
            )}

            {/* Empty Cart */}
            {!loading && !cartItems.length && !error && (
                <div className="pankhudi-empty-cart">
                    <div className="pankhudi-empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Discover amazing products and add them to your cart!</p>
                    <button className="pankhudi-continue-shopping-btn" onClick={() => navigate('/products')}>
                        Start Shopping
                    </button>
                </div>
            )}

            {/* Cart Items */}
            {!loading && cartItems.length > 0 && (
                <div className="pankhudi-cart-content">
                    <div className="pankhudi-cart-items-section">
                        <div className="pankhudi-section-header">
                            <h2>Cart Items</h2>
                            {savings > 0 && (
                                <div className="pankhudi-total-savings">
                                    Total Savings: <span className="pankhudi-savings-amount">₹{savings.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pankhudi-cart-items">
                            {cartItems.map((item) => {
                                const discountedPrice = item.final_price || item.price;
                                const itemSavings = item.discount > 0 ? (item.price - discountedPrice) * item.quantity : 0;
                                const isUpdating = updatingItems.has(item.cart_id);
                                const isRemoving = removingItems.has(item.cart_id);

                                return (
                                    <div key={item.cart_id} className={`pankhudi-cart-item ${isRemoving ? 'pankhudi-removing' : ''}`}>
                                        <div className="pankhudi-product-infos">
                                            <div
                                                className="pankhudi-product-images"
                                                onClick={() => handleProductClick(item.product_id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.product_name}
                                                    onError={(e) => {
                                                        e.target.src = '/images/placeholder-product.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="pankhudi-product-details">
                                                <h3
                                                    className="pankhudi-product-names"
                                                    onClick={() => handleProductClick(item.product_id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {item.product_name}
                                                </h3>
                                                <div className="pankhudi-price-info">
                                                    {item.discount > 0 ? (
                                                        <>
                                                            <span className="pankhudi-original-prices">₹{item.price}</span>
                                                            <span className="pankhudi-discounted-price">₹{discountedPrice}</span>
                                                            <span className="pankhudi-discount-badge">{item.discount}% OFF</span>
                                                        </>
                                                    ) : (
                                                        <span className="pankhudi-price">₹{item.price}</span>
                                                    )}
                                                </div>
                                                {itemSavings > 0 && (
                                                    <div className="pankhudi-savings">You save ₹{itemSavings.toFixed(2)}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pankhudi-item-controls">
                                            <div className="pankhudi-quantity-section">
                                                <label>Quantity:</label>
                                                <div className="pankhudi-quantity-controls">
                                                    <button
                                                        className={`pankhudi-qty-btn pankhudi-minus ${isUpdating ? 'pankhudi-disabled' : ''}`}
                                                        onClick={() => !isUpdating && updateQuantity(item.cart_id, item.quantity - 1, item.product_name)}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? <div className="pankhudi-spinner"></div> : '−'}
                                                    </button>
                                                    <span className="pankhudi-quantity">{item.quantity}</span>
                                                    <button
                                                        className={`pankhudi-qty-btn pankhudi-plus ${isUpdating ? 'pankhudi-disabled' : ''}`}
                                                        onClick={() => !isUpdating && updateQuantity(item.cart_id, item.quantity + 1, item.product_name)}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? <div className="pankhudi-spinner"></div> : '+'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pankhudi-item-total">
                                                ₹{(discountedPrice * item.quantity).toFixed(2)}
                                            </div>

                                            <div className="pankhudi-action-buttons">
                                                <button
                                                    className="pankhudi-buy-now-btn"
                                                    onClick={() => handleBuyNow(item)}
                                                >
                                                    Buy Now
                                                </button>

                                                <button
                                                    className={`pankhudi-remove-btn ${isRemoving ? 'pankhudi-removing' : ''}`}
                                                    onClick={() => !isRemoving && removeItem(item.cart_id, item.product_name)}
                                                    disabled={isRemoving}
                                                >
                                                    {isRemoving ? (
                                                        <div className="pankhudi-spinner pankhudi-small"></div>
                                                    ) : (
                                                        <>
                                                            <span className="pankhudi-trash-icon">🗑️</span> Remove
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pankhudi-cart-summary">
                        <div className="pankhudi-summary-card">
                            <h2>Order Summary</h2>

                            <div className="pankhudi-summary-line">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="pankhudi-summary-line pankhudi-discount">
                                    <span>
                                        Discount {promoCode && `(${promoCode})`}
                                        <button onClick={clearPromoCode} className="pankhudi-clear-promo">×</button>
                                    </span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="pankhudi-promo-section">
                                <div className="pankhudi-promo-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="pankhudi-promo-input"
                                        disabled={applyingPromo}
                                    />
                                    <button
                                        onClick={applyPromoCode}
                                        disabled={applyingPromo || !promoCode.trim()}
                                        className="pankhudi-apply-promo-btn"
                                    >
                                        {applyingPromo ? <div className="pankhudi-spinner"></div> : 'Apply'}
                                    </button>
                                </div>
                            </div>

                            <div className="pankhudi-summary-total">
                                <span>Total Amount</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>

                            <button className="pankhudi-checkout-btn">
                                Proceed to Checkout
                            </button>

                            <div className="pankhudi-secure-checkout">
                                <span className="pankhudi-lock-icon">🔒</span>
                                Secure checkout · Encrypted transaction
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;