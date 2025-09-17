import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [applyingPromo, setApplyingPromo] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

    // Fetch cart items
    const fetchCart = async () => {
        if (!userId || !token) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            alert(error.response?.data?.message || "Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    };

    // Update quantity
    const updateQuantity = async (cartId, newQty) => {
        if (newQty <= 0) return;
        try {
            await axios.put(
                `http://localhost:5000/api/cart/update/${cartId}`,
                { quantity: newQty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCart();
        } catch (error) {
            console.error("Update error:", error);
            alert(error.response?.data?.message || "Failed to update quantity");
        }
    };

    // Remove item
    const removeItem = async (cartId) => {
        if (!window.confirm("Are you sure you want to remove this item?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/cart/delete/${cartId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchCart();
        } catch (error) {
            console.error("Remove error:", error);
            alert(error.response?.data?.message || "Failed to remove item");
        }
    };

    // Apply promo code
    const applyPromoCode = async () => {
        if (!promoCode.trim()) return;

        setApplyingPromo(true);
        try {
            // Simulate API call for promo code validation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app,validate the promo code with backend
            if (promoCode.toUpperCase() === "SAVE10") {
                setDiscount(0.1); // 10% discount
                alert("Promo code applied successfully!");
            } else {
                alert("Invalid promo code");
            }
        } catch (error) {
            alert("Failed to apply promo code");
        } finally {
            setApplyingPromo(false);
        }
    };

    // Calculate prices
    const subtotal = cartItems.reduce(
        (acc, item) => acc + (item.final_price || item.price) * item.quantity,
        0
    );

    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    useEffect(() => {
        fetchCart();
    }, [userId, token]);

    return (
        <div className="cart-container">
            <div className="cart-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <span className="back-arrow">←</span> Continue Shopping
                </button>
                <h1 className="site-name">Your Shopping Cart</h1>
                <div className="cart-stats">
                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </div>
            </div>

            {loading && (
                <div className="loading-container">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="cart-item-skeleton">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-details">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line shorter"></div>
                            </div>
                            <div className="skeleton-actions"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty cart */}
            {!loading && !cartItems.length && (
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
                        Continue Shopping
                    </button>
                </div>
            )}

            {/* Cart items */}
            {!loading && cartItems.length > 0 && (
                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map((item) => {
                            const discountedPrice = item.final_price || item.price;
                            const discountAmount = item.discount > 0 ? Math.round(item.price - discountedPrice) : 0;

                            return (
                                <div key={item.cart_id} className="cart-item">
                                    <div className="product-inf">
                                        <div className="product-images">
                                            <img src={`http://localhost:5000/${item.image}`} alt={item.product_name} />
                                        </div>
                                        <div className="product-details">
                                            <h2 className="product-name">{item.product_name}</h2>
                                            <div className="price-info">
                                                {item.discount > 0 ? (
                                                    <>
                                                        <span className="original-price">₹{item.price}</span>
                                                        <span className="discounted-price">₹{discountedPrice}</span>
                                                        <span className="discount-badge">{item.discount}% OFF</span>
                                                    </>
                                                ) : (
                                                    <span className="price">₹{item.price}</span>
                                                )}
                                            </div>
                                            {discountAmount > 0 && (
                                                <div className="savings">You save ₹{discountAmount * item.quantity}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="item-controls">
                                        <div className="quantity-controls">
                                            <button
                                                className="qty-btn minus"
                                                onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                                            >−</button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                className="qty-btn plus"
                                                onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeItem(item.cart_id)}
                                        >
                                            <span className="trash-icon">🗑️</span> Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-card">
                            <h2>Order Summary</h2>
                            <div className="summary-line">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="summary-line discount">
                                    <span>Discount</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="promo-section">
                                <input
                                    type="text"
                                    placeholder="Enter promo code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="promo-input"
                                />
                                <button
                                    onClick={applyPromoCode}
                                    disabled={applyingPromo}
                                    className="apply-promo-btn"
                                >
                                    {applyingPromo ? 'Applying...' : 'Apply'}
                                </button>
                            </div>

                            <div className="summary-total">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>

                            <button className="checkout-btn">
                                Proceed to Checkout
                            </button>

                            <div className="secure-checkout">
                                <span className="lock-icon">🔒</span>
                                Secure checkout
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;