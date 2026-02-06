import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ State for checkout type
    const [checkoutType, setCheckoutType] = useState(""); // "cart" or "direct"
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);

    // ✅ Form states
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
        email: ""
    });

    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [billingAddress, setBillingAddress] = useState({
        fullName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India"
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [orderNote, setOrderNote] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [saveAddressAsNew, setSaveAddressAsNew] = useState(false);

    // ✅ Get user token
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // ✅ Minimum order value for free shipping (as per business logic)
    const MIN_FREE_SHIPPING_AMOUNT = 1000;
    const DEFAULT_SHIPPING_CHARGE = 50;

    useEffect(() => {
        initializeCheckout();
    }, [location]);

    const initializeCheckout = async () => {
        setLoading(true);

        try {
            // ✅ Fetch user details from database
            if (token && user.id) {
                await fetchUserDetails();
                await fetchSavedAddresses();
            }

            // ✅ Check if coming from "Buy Now" or "Cart"
            if (location.state?.directBuy) {
                // Direct Buy Now flow
                setCheckoutType("direct");
                await fetchProductDetails(location.state.product);
            } else {
                // Cart checkout flow
                setCheckoutType("cart");
                await fetchCartItems();
            }

        } catch (error) {
            console.error("Checkout initialization error:", error);
            alert("Failed to initialize checkout");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch complete user details from database
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/${user.id}/details`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setUserDetails(response.data.user);

                // ✅ Pre-fill shipping address with user details
                if (response.data.user) {
                    const userData = response.data.user;
                    setShippingAddress(prev => ({
                        ...prev,
                        fullName: userData.name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                        address: userData.address || "",
                        city: userData.city || "",
                        state: userData.state || "",
                        postalCode: userData.postalCode || userData.postal_code || ""
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    // ✅ Fetch saved addresses for user
    const fetchSavedAddresses = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/${user.id}/addresses`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSavedAddresses(response.data.addresses || []);

                // Auto-select default address if available
                const defaultAddress = response.data.addresses?.find(addr => addr.isDefault);
                if (defaultAddress && !selectedSavedAddress) {
                    handleSavedAddressSelect(defaultAddress);
                }
            }
        } catch (error) {
            console.error("Error fetching saved addresses:", error);
            setSavedAddresses([]);
        }
    };

    // ✅ Save address to user's saved addresses
    const saveAddressToProfile = async (addressData) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/users/${user.id}/addresses/add`,
                {
                    fullName: addressData.fullName,
                    address: addressData.address,
                    city: addressData.city,
                    state: addressData.state,
                    postalCode: addressData.postalCode,
                    country: addressData.country,
                    phone: addressData.phone,
                    addressType: 'home',
                    isDefault: savedAddresses.length === 0 // Set as default if first address
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Refresh addresses list
                await fetchSavedAddresses();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error saving address:", error);
            return false;
        }
    };

    // ✅ Fetch complete product details from database
    const fetchProductDetails = async (productData) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/products/${productData.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const product = response.data.product || response.data;
            setProducts([{
                ...product,
                quantity: productData.quantity || 1,
                selectedSize: productData.selectedSize,
                selectedColor: productData.selectedColor,
                finalPrice: calculateFinalPrice(product),
                shipping_cost: product.shipping_cost || DEFAULT_SHIPPING_CHARGE,
                free_shipping: product.free_shipping || 0
            }]);
        } catch (error) {
            console.error("Error fetching product details:", error);
            // Fallback to passed data
            setProducts([{
                ...productData,
                shipping_cost: productData.shipping_cost || DEFAULT_SHIPPING_CHARGE,
                free_shipping: productData.free_shipping || 0
            }]);
        }
    };

    // ✅ UPDATED: Fetch cart items with better error handling
    const fetchCartItems = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        console.log("Fetching cart for user:", user.id);
        console.log("Token available:", !!token);

        try {
            // Try multiple endpoints
            let cartData = null;
            let cartItems = [];

            // Endpoints to try
            const endpoints = [
                `http://localhost:5000/api/cart`,
                `http://localhost:5000/api/cart/items`,
                `http://localhost:5000/api/cart/${user.id}`,
                `http://localhost:5000/api/cart/user/${user.id}`
            ];

            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const response = await axios.get(endpoint, {
                        headers: { Authorization: `Bearer ${token}` },
                        timeout: 5000
                    });

                    console.log(`Response from ${endpoint}:`, response.data);

                    if (response.data) {
                        cartData = response.data;
                        break;
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
                }
            }

            // Extract cart items from response
            if (cartData) {
                if (cartData.items) {
                    cartItems = cartData.items;
                } else if (cartData.cart) {
                    cartItems = Array.isArray(cartData.cart) ? cartData.cart : [cartData.cart];
                } else if (Array.isArray(cartData)) {
                    cartItems = cartData;
                } else if (cartData.data) {
                    cartItems = Array.isArray(cartData.data) ? cartData.data : [cartData.data];
                } else if (cartData.products) {
                    cartItems = cartData.products;
                }
            }

            console.log("Extracted cart items:", cartItems);

            // If no cart items found, check localStorage
            if (!cartItems || cartItems.length === 0) {
                console.log("No cart items from API, checking localStorage...");
                const localCart = localStorage.getItem('pankhudiCart');
                if (localCart) {
                    try {
                        cartItems = JSON.parse(localCart);
                        console.log("Found cart in localStorage:", cartItems);
                    } catch (parseError) {
                        console.error("Error parsing localStorage cart:", parseError);
                    }
                }
            }

            // If still no items
            if (!cartItems || cartItems.length === 0) {
                alert("Your cart is empty");
                navigate("/");
                return;
            }

            // Process cart items
            const productsWithDetails = [];

            for (const item of cartItems) {
                try {
                    let productDetails = null;

                    // Try to fetch product details if product_id exists
                    if (item.product_id || item.productId || item.id) {
                        const productId = item.product_id || item.productId || item.id;

                        try {
                            const productResponse = await axios.get(
                                `http://localhost:5000/api/products/${productId}`,
                                {
                                    headers: { Authorization: `Bearer ${token}` },
                                    timeout: 3000
                                }
                            );

                            productDetails = productResponse.data.product || productResponse.data;
                        } catch (productError) {
                            console.error(`Error fetching product ${productId}:`, productError.message);
                            // Continue with basic item data
                        }
                    }

                    // Combine item data with product details
                    const product = {
                        // Basic item data
                        id: item.product_id || item.productId || item.id,
                        quantity: item.quantity || 1,
                        selectedSize: item.size || item.selectedSize,
                        selectedColor: item.color || item.selectedColor,

                        // Product details (from API or fallback)
                        name: productDetails?.name || item.product_name || item.name || "Product",
                        price: parseFloat(productDetails?.price || item.price || 0),
                        discount: parseFloat(productDetails?.discount || item.discount || 0),
                        shipping_cost: parseFloat(productDetails?.shipping_cost || item.shipping_cost || DEFAULT_SHIPPING_CHARGE),
                        free_shipping: productDetails?.free_shipping || item.free_shipping || 0,
                        sku: productDetails?.sku || item.sku,
                        brand: productDetails?.brand || item.brand,
                        material: productDetails?.material || item.material,
                        images: productDetails?.images || (item.image ? [item.image] : []),

                        // Calculated fields
                        finalPrice: 0 // Will be calculated below
                    };

                    // Calculate final price
                    product.finalPrice = calculateFinalPrice(product);

                    productsWithDetails.push(product);

                } catch (itemError) {
                    console.error("Error processing cart item:", itemError);
                    // Add basic item as fallback
                    productsWithDetails.push({
                        id: item.product_id || item.productId || item.id || Date.now(),
                        name: item.product_name || item.name || "Product",
                        price: parseFloat(item.price || 0),
                        quantity: item.quantity || 1,
                        selectedSize: item.size || item.selectedSize,
                        selectedColor: item.color || item.selectedColor,
                        finalPrice: parseFloat(item.final_price || item.price || 0),
                        shipping_cost: parseFloat(item.shipping_cost || DEFAULT_SHIPPING_CHARGE),
                        free_shipping: item.free_shipping || 0,
                        images: item.image ? [item.image] : []
                    });
                }
            }

            console.log("Final products for checkout:", productsWithDetails);

            if (productsWithDetails.length === 0) {
                alert("No valid products found in cart");
                navigate("/cart");
                return;
            }

            setProducts(productsWithDetails);

        } catch (error) {
            console.error("Error in fetchCartItems:", error);

            // User-friendly error message
            let errorMessage = "Failed to load cart items";

            if (error.response) {
                console.error("Error response:", error.response.data);
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                console.error("Error request:", error.request);
                errorMessage = "Network error. Please check your connection.";
            }

            alert(errorMessage);

            // Try to use localStorage as last resort
            try {
                const localCart = localStorage.getItem('pankhudiCart');
                if (localCart) {
                    const cartItems = JSON.parse(localCart);
                    if (cartItems && cartItems.length > 0) {
                        alert("Using saved cart data from browser");
                        const processedItems = cartItems.map(item => ({
                            ...item,
                            finalPrice: calculateFinalPrice(item),
                            shipping_cost: item.shipping_cost || DEFAULT_SHIPPING_CHARGE,
                            free_shipping: item.free_shipping || 0
                        }));
                        setProducts(processedItems);
                        return;
                    }
                }
            } catch (localError) {
                console.error("Error reading localStorage:", localError);
            }

            navigate("/cart");
        }
    };

    // ✅ Calculate final price with discount
    const calculateFinalPrice = (product) => {
        if (!product) return 0;
        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount) || 0;

        if (discount > 0) {
            return price - (price * discount / 100);
        }
        return price;
    };

    // ✅ UPDATED: Calculate totals with proper shipping logic
    const calculateTotals = () => {
        // Calculate subtotal
        const subtotal = products.reduce((total, product) => {
            const price = product.finalPrice || product.price || 0;
            const quantity = product.quantity || 1;
            return total + (parseFloat(price) * parseInt(quantity));
        }, 0);

        // Calculate shipping details
        let shipping = 0;
        let hasFreeShipping = false;
        let shippingMessage = "";
        let individualShippingCost = 0;

        // Check individual product shipping costs
        individualShippingCost = products.reduce((total, product) => {
            return total + (parseFloat(product.shipping_cost) || DEFAULT_SHIPPING_CHARGE);
        }, 0);

        // Check if any product has free shipping
        const hasFreeShippingProduct = products.some(p => p.free_shipping === 1);

        // Check if order qualifies for free shipping (order value >= ₹1000)
        const qualifiesForFreeShipping = subtotal >= MIN_FREE_SHIPPING_AMOUNT;

        // Apply shipping logic
        if (hasFreeShippingProduct) {
            // If any product has free shipping
            shipping = 0;
            hasFreeShipping = true;
            shippingMessage = "Free shipping on selected products";
        } else if (qualifiesForFreeShipping) {
            // If order value is ₹1000 or more
            shipping = 0;
            hasFreeShipping = true;
            shippingMessage = `Order value qualifies for FREE shipping!`;
        } else {
            // Apply regular shipping charges
            shipping = individualShippingCost;
            hasFreeShipping = false;

            // Ensure minimum shipping charge
            if (shipping < DEFAULT_SHIPPING_CHARGE) {
                shipping = DEFAULT_SHIPPING_CHARGE;
            }

            shippingMessage = "Shipping charges apply";
        }

        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + shipping + tax;

        return {
            subtotal,
            shipping,
            tax,
            total,
            hasFreeShipping,
            shippingMessage,
            individualShippingCost,
            qualifiesForFreeShipping
        };
    };

    // ✅ Handle saved address selection
    const handleSavedAddressSelect = (address) => {
        setSelectedSavedAddress(address.id);
        setIsAddingNewAddress(false);
        setShippingAddress({
            fullName: address.fullName || address.full_name || userDetails?.name || "",
            address: address.addressLine || address.address_line || address.address || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || address.postal_code || "",
            country: address.country || "India",
            phone: address.phone || userDetails?.phone || "",
            email: userDetails?.email || shippingAddress.email || ""
        });
    };

    // ✅ Handle add new address click
    const handleAddNewAddressClick = () => {
        setIsAddingNewAddress(true);
        setSelectedSavedAddress(null);
        // Reset to empty form or user details
        setShippingAddress({
            fullName: userDetails?.name || "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
            phone: userDetails?.phone || "",
            email: userDetails?.email || ""
        });
    };

    // ✅ Handle address form submission
    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const requiredFields = ["fullName", "address", "city", "state", "postalCode", "phone", "email"];
        const missingFields = requiredFields.filter(field => !shippingAddress[field]?.trim());

        if (missingFields.length > 0) {
            alert(`Please fill in: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}`);
            return;
        }

        // Validate phone number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(shippingAddress.phone.replace(/\D/g, ''))) {
            alert("Please enter a valid 10-digit Indian phone number");
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shippingAddress.email)) {
            alert("Please enter a valid email address");
            return;
        }

        // Save address if checkbox is checked
        if (saveAddressAsNew && token) {
            try {
                const saved = await saveAddressToProfile(shippingAddress);
                if (saved) {
                    alert("Address saved to your profile!");
                }
            } catch (saveError) {
                console.error("Error saving address:", saveError);
                // Continue anyway
            }
        }

        // Copy to billing if same
        if (billingSameAsShipping) {
            setBillingAddress({ ...shippingAddress });
        }

        setStep(2);
    };

    // ✅ Handle payment method selection
    const handlePaymentSelect = (method) => {
        setPaymentMethod(method);
        setStep(3);
    };

    // ✅ Place order
    const handlePlaceOrder = async () => {
        if (!token) {
            alert("Please login to place order");
            navigate("/login");
            return;
        }

        setPlacingOrder(true);
        const { total } = calculateTotals();

        try {
            const orderData = {
                shippingAddress,
                billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
                paymentMethod,
                totalAmount: total,
                orderNote,
                items: products.map(product => ({
                    productId: product.id,
                    quantity: product.quantity || 1,
                    price: product.finalPrice || product.price,
                    size: product.selectedSize,
                    color: product.selectedColor,
                    shipping_cost: product.shipping_cost,
                    free_shipping: product.free_shipping,
                    productDetails: {
                        name: product.name,
                        sku: product.sku,
                        brand: product.brand,
                        material: product.material
                    }
                }))
            };

            let endpoint = "/api/orders/create";
            if (checkoutType === "direct") {
                endpoint = "/api/orders/direct-buy";
                orderData.productId = products[0].id;
            }

            console.log("Placing order with data:", orderData);

            const response = await axios.post(
                `http://localhost:5000${endpoint}`,
                orderData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log("Order response:", response.data);

            if (response.data.success) {
                // Clear cart if it was a cart checkout
                if (checkoutType === "cart") {
                    try {
                        await axios.delete(
                            `http://localhost:5000/api/cart/clear/${user.id}`,
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );
                    } catch (cartError) {
                        console.error("Error clearing cart:", cartError);
                        // Don't stop order confirmation if cart clear fails
                    }

                    // Also clear localStorage cart
                    localStorage.removeItem('pankhudiCart');
                }

                // Redirect to confirmation
                navigate("/order-confirmation", {
                    state: {
                        orderId: response.data.orderId,
                        orderDetails: response.data.order,
                        checkoutType
                    }
                });
            } else {
                throw new Error(response.data.message || "Failed to place order");
            }
        } catch (error) {
            console.error("Order placement error:", error);
            const errorMsg = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Failed to place order. Please try again.";
            alert(errorMsg);
        } finally {
            setPlacingOrder(false);
        }
    };

    // ✅ Render product shipping details
    const renderProductShippingDetails = () => {
        return products.map((product, index) => {
            const productShipping = parseFloat(product.shipping_cost) || DEFAULT_SHIPPING_CHARGE;
            const hasFreeShippingProduct = product.free_shipping === 1;

            return (
                <div key={index} className="product-shipping-info">
                    <div className="product-shipping-header">
                        <span className="product-name">{product.name}</span>
                        <span className="shipping-status">
                            {hasFreeShippingProduct ? (
                                <span className="free-shipping-badge">FREE Shipping</span>
                            ) : (
                                <span className="shipping-charge">Shipping: ₹{productShipping.toFixed(2)}</span>
                            )}
                        </span>
                    </div>
                </div>
            );
        });
    };

    // ✅ Render product summary with all details
    const renderProductSummary = () => {
        const {
            subtotal,
            shipping,
            tax,
            total,
            hasFreeShipping,
            shippingMessage,
            individualShippingCost,
            qualifiesForFreeShipping
        } = calculateTotals();

        return (
            <div className="checkout-product-summary">
                <div className="summary-header">
                    <h3>
                        {checkoutType === "direct" ? "Product Details" : `Order Summary (${products.length} items)`}
                    </h3>
                    <span className="edit-link" onClick={() => navigate(checkoutType === "cart" ? "/cart" : -1)}>
                        {checkoutType === "cart" ? "Edit Cart" : "Change Product"}
                    </span>
                </div>

                {/* Product Shipping Details */}
                {products.length > 0 && (
                    <div className="product-shipping-section">
                        <h4>Shipping Details</h4>
                        {renderProductShippingDetails()}
                    </div>
                )}

                <div className="checkout-products-list">
                    {products.map((product, index) => (
                        <div key={index} className="checkout-product-item">
                            <div className="product-image-section">
                                <img
                                    src={product.images?.[0] || product.image || "/images/placeholder-product.jpg"}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.src = "/images/placeholder-product.jpg";
                                    }}
                                />
                                <span className="product-quantity">x{product.quantity || 1}</span>
                            </div>

                            <div className="checkout-product-info">
                                <h4>{product.name}</h4>

                                {/* Product Details */}
                                <div className="product-details-list">
                                    {product.sku && (
                                        <div className="product-detail">
                                            <span className="detail-label">SKU:</span>
                                            <span className="detail-value">{product.sku}</span>
                                        </div>
                                    )}

                                    {product.selectedSize && (
                                        <div className="product-detail">
                                            <span className="detail-label">Size:</span>
                                            <span className="detail-value">{product.selectedSize}</span>
                                        </div>
                                    )}

                                    {product.selectedColor && (
                                        <div className="product-detail">
                                            <span className="detail-label">Color:</span>
                                            <span className="detail-value">{product.selectedColor}</span>
                                        </div>
                                    )}

                                    {product.material && (
                                        <div className="product-detail">
                                            <span className="detail-label">Material:</span>
                                            <span className="detail-value">{product.material}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Price Details */}
                                <div className="product-price-details">
                                    <div className="price-row">
                                        <span>Price:</span>
                                        <span>₹{parseFloat(product.price || 0).toFixed(2)}</span>
                                    </div>

                                    {product.discount > 0 && (
                                        <div className="price-row discount">
                                            <span>Discount ({product.discount}%):</span>
                                            <span>-₹{(product.price * product.discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="price-row final">
                                        <strong>Final Price:</strong>
                                        <strong>₹{(product.finalPrice || product.price).toFixed(2)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Totals */}
                <div className="checkout-price-breakdown">
                    <h4>Price Breakdown</h4>

                    <div className="price-row">
                        <span>Subtotal ({products.length} items)</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="price-row shipping-row">
                        <div className="shipping-details">
                            <span>Shipping</span>
                            {!hasFreeShipping && products.length === 1 && products[0].shipping_cost && (
                                <div className="shipping-note">
                                    (Product shipping: ₹{parseFloat(products[0].shipping_cost).toFixed(2)})
                                </div>
                            )}
                        </div>
                        <div className="shipping-amount">
                            {hasFreeShipping ? (
                                <div className="free-shipping-section">
                                    <span className="free-shipping">FREE</span>
                                    {shippingMessage && (
                                        <div className="shipping-message">
                                            <span className="tick-icon">✓</span> {shippingMessage}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span>₹{shipping.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    <div className="price-row">
                        <span>Tax (18% GST)</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>

                    <div className="price-row total-row">
                        <strong>Total Amount</strong>
                        <strong>₹{total.toFixed(2)}</strong>
                    </div>

                    {/* Free Shipping Information */}
                    {!hasFreeShipping && qualifiesForFreeShipping === false && subtotal < MIN_FREE_SHIPPING_AMOUNT && (
                        <div className="free-shipping-info">
                            <div className="free-shipping-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min((subtotal / MIN_FREE_SHIPPING_AMOUNT) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="progress-text">
                                    Add ₹{(MIN_FREE_SHIPPING_AMOUNT - subtotal).toFixed(2)} more for FREE shipping
                                </div>
                            </div>
                        </div>
                    )}

                    {hasFreeShipping && (
                        <div className="free-shipping-banner">
                            <div className="banner-icon">🚚</div>
                            <div className="banner-content">
                                <strong>Free Shipping Applied!</strong>
                                <p>You saved ₹{individualShippingCost.toFixed(2)} on shipping</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ✅ Render user details section
    const renderUserDetails = () => {
        if (!userDetails) return null;

        return (
            <div className="user-details-section">
                <h3>Your Account Details</h3>
                <div className="user-details-grid">
                    <div className="user-detail">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{userDetails.name}</span>
                    </div>
                    <div className="user-detail">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{userDetails.email}</span>
                    </div>
                    {userDetails.phone && (
                        <div className="user-detail">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{userDetails.phone}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="spinner"></div>
                <p>Loading checkout...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="checkout-empty">
                <h2>No items to checkout</h2>
                <p>Your cart is empty or product information is missing.</p>
                <div className="checkout-empty-actions">
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => navigate("/cart")}
                    >
                        View Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {/* Checkout Header */}
            <div className="checkout-header">
                <h1><span className="brand-name">Pankhudi</span> Secure Checkout </h1>
                <div className="checkout-type-badge">
                    {checkoutType === "direct" ? "Buy Now" : "Cart Checkout"}
                </div>
                {/* <div className="checkout-steps">
                    <div className={`step ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Address</div>
                    </div>
                    <div className={`step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Payment</div>
                    </div>
                    <div className={`step ${step === 3 ? "active" : ""}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Review</div>
                    </div>
                </div> */}

                <div className="checkout-steps">
                    <div className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                        <div className="circle">1</div>
                        <span>Address</span>
                    </div>

                    <div className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                        <div className="circle">2</div>
                        <span>Payment</span>
                    </div>

                    <div className={`step ${step >= 3 ? "active" : ""}`}>
                        <div className="circle">3</div>
                        <span>Review</span>
                    </div>

                    <div className={`progress step-${step}`}></div>
                </div>

            </div>

            <div className="checkout-content">
                {/* Left Column: Checkout Form */}
                <div className="checkout-form-column">
                    {/* Show user details */}
                    {userDetails && step === 1 && renderUserDetails()}

                    {step === 1 && (
                        <div className="address-form-section">
                            <h2>Shipping Address</h2>

                            {/* Saved Addresses */}
                            {savedAddresses.length > 0 && !isAddingNewAddress && (
                                <div className="saved-addresses">
                                    <h4>Saved Addresses</h4>
                                    <div className="address-list">
                                        {savedAddresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className={`address-card ${selectedSavedAddress === address.id ? "selected" : ""}`}
                                                onClick={() => handleSavedAddressSelect(address)}
                                            >
                                                <div className="address-card-header">
                                                    <span className="address-type">{address.addressType || address.address_type || "Home"}</span>
                                                    {address.isDefault && (
                                                        <span className="default-badge">Default</span>
                                                    )}
                                                </div>
                                                <div className="address-card-body">
                                                    <p><strong>{address.fullName || address.full_name}</strong></p>
                                                    <p>{address.addressLine || address.address_line || address.address}</p>
                                                    <p>{address.city}, {address.state} - {address.postalCode || address.postal_code}</p>
                                                    <p>{address.country}</p>
                                                    {address.phone && <p>📞 {address.phone}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="or-divider">
                                        <span>OR</span>
                                    </div>
                                    <button
                                        className="pankhudi-add-address-btn"
                                        onClick={handleAddNewAddressClick}
                                    >
                                        + Add New Address
                                    </button>
                                </div>
                            )}

                            {/* Address Form */}
                            {(isAddingNewAddress || savedAddresses.length === 0) && (
                                <form onSubmit={handleAddressSubmit}>
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={shippingAddress.fullName}
                                            onChange={(e) => setShippingAddress({
                                                ...shippingAddress,
                                                fullName: e.target.value
                                            })}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                value={shippingAddress.email}
                                                onChange={(e) => setShippingAddress({
                                                    ...shippingAddress,
                                                    email: e.target.value
                                                })}
                                                required
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone *</label>
                                            <input
                                                type="tel"
                                                value={shippingAddress.phone}
                                                onChange={(e) => setShippingAddress({
                                                    ...shippingAddress,
                                                    phone: e.target.value
                                                })}
                                                required
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Complete Address *</label>
                                        <textarea
                                            value={shippingAddress.address}
                                            onChange={(e) => setShippingAddress({
                                                ...shippingAddress,
                                                address: e.target.value
                                            })}
                                            rows="3"
                                            placeholder="House no, Building, Street, Area, Landmark"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City *</label>
                                            <input
                                                type="text"
                                                value={shippingAddress.city}
                                                onChange={(e) => setShippingAddress({
                                                    ...shippingAddress,
                                                    city: e.target.value
                                                })}
                                                required
                                                placeholder="Enter city"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>State *</label>
                                            <input
                                                type="text"
                                                value={shippingAddress.state}
                                                onChange={(e) => setShippingAddress({
                                                    ...shippingAddress,
                                                    state: e.target.value
                                                })}
                                                required
                                                placeholder="Enter state"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Postal Code *</label>
                                            <input
                                                type="text"
                                                value={shippingAddress.postalCode}
                                                onChange={(e) => setShippingAddress({
                                                    ...shippingAddress,
                                                    postalCode: e.target.value
                                                })}
                                                required
                                                placeholder="Enter PIN code"
                                                maxLength="6"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Country</label>
                                            <select
                                                value={shippingAddress.country}
                                                onChange={(e) => setShippingAddress({
                                                    ...shippingAddress,
                                                    country: e.target.value
                                                })}
                                            >
                                                <option value="India">India</option>
                                                <option value="USA">USA</option>
                                                <option value="UK">UK</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Save address option */}
                                    {token && (
                                        <div className="save-address-option">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={saveAddressAsNew}
                                                    onChange={(e) => setSaveAddressAsNew(e.target.checked)}
                                                />
                                                Save this address to my profile for future orders
                                            </label>
                                        </div>
                                    )}

                                    {/* Billing Address Section */}
                                    <div className="billing-address-section">
                                        <div className="billing-toggle">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={billingSameAsShipping}
                                                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                                />
                                                Billing address same as shipping address
                                            </label>
                                        </div>

                                        {!billingSameAsShipping && (
                                            <div className="billing-address-form">
                                                <h4>Billing Address</h4>
                                                <div className="form-group">
                                                    <label>Full Name *</label>
                                                    <input
                                                        type="text"
                                                        value={billingAddress.fullName}
                                                        onChange={(e) => setBillingAddress({
                                                            ...billingAddress,
                                                            fullName: e.target.value
                                                        })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Address *</label>
                                                    <textarea
                                                        value={billingAddress.address}
                                                        onChange={(e) => setBillingAddress({
                                                            ...billingAddress,
                                                            address: e.target.value
                                                        })}
                                                        rows="2"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>City *</label>
                                                        <input
                                                            type="text"
                                                            value={billingAddress.city}
                                                            onChange={(e) => setBillingAddress({
                                                                ...billingAddress,
                                                                city: e.target.value
                                                            })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>State *</label>
                                                        <input
                                                            type="text"
                                                            value={billingAddress.state}
                                                            onChange={(e) => setBillingAddress({
                                                                ...billingAddress,
                                                                state: e.target.value
                                                            })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Postal Code *</label>
                                                        <input
                                                            type="text"
                                                            value={billingAddress.postalCode}
                                                            onChange={(e) => setBillingAddress({
                                                                ...billingAddress,
                                                                postalCode: e.target.value
                                                            })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Country</label>
                                                        <select
                                                            value={billingAddress.country}
                                                            onChange={(e) => setBillingAddress({
                                                                ...billingAddress,
                                                                country: e.target.value
                                                            })}
                                                        >
                                                            <option value="India">India</option>
                                                            <option value="USA">USA</option>
                                                            <option value="UK">UK</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        {savedAddresses.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={() => {
                                                    setIsAddingNewAddress(false);
                                                    if (savedAddresses.length > 0) {
                                                        const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
                                                        handleSavedAddressSelect(defaultAddress);
                                                    }
                                                }}
                                            >
                                                Use Saved Address
                                            </button>
                                        )}
                                        <button type="submit" className="btn-primary">
                                            Continue to Payment
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="payment-section">
                            <h2>Select Payment Method</h2>

                            <div className="payment-options">
                                <div
                                    className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                                    onClick={() => handlePaymentSelect("cod")}
                                >
                                    <div className="payment-icon">💵</div>
                                    <div className="payment-details">
                                        <h4>Cash on Delivery</h4>
                                        <p>Pay when you receive the product</p>
                                        <p className="payment-note">Available for all orders</p>
                                    </div>
                                </div>

                                <div
                                    className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
                                    onClick={() => handlePaymentSelect("card")}
                                >
                                    <div className="payment-icon">💳</div>
                                    <div className="payment-details">
                                        <h4>Credit/Debit Card</h4>
                                        <p>Pay securely with your card</p>
                                        <p className="payment-note">Visa, Mastercard, RuPay accepted</p>
                                    </div>
                                </div>

                                <div
                                    className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}
                                    onClick={() => handlePaymentSelect("upi")}
                                >
                                    <div className="payment-icon">📱</div>
                                    <div className="payment-details">
                                        <h4>UPI</h4>
                                        <p>Pay using UPI apps</p>
                                        <p className="payment-note">Google Pay, PhonePe, Paytm</p>
                                    </div>
                                </div>

                                <div
                                    className={`payment-option ${paymentMethod === "netbanking" ? "selected" : ""}`}
                                    onClick={() => handlePaymentSelect("netbanking")}
                                >
                                    <div className="payment-icon">🏦</div>
                                    <div className="payment-details">
                                        <h4>Net Banking</h4>
                                        <p>Pay via online banking</p>
                                        <p className="payment-note">All major banks supported</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    Back to Address
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => setStep(3)}
                                >
                                    Review Order
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="review-section">
                            <h2>Review Your Order</h2>

                            <div className="review-section-grid">
                                <div className="review-address">
                                    <div className="review-section-header">
                                        <h3>Shipping Address</h3>
                                        <button
                                            className="btn-edit"
                                            onClick={() => setStep(1)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <div className="review-content">
                                        <p><strong>{shippingAddress.fullName}</strong></p>
                                        <p>{shippingAddress.address}</p>
                                        <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                                        <p>{shippingAddress.country}</p>
                                        <p>📞 {shippingAddress.phone}</p>
                                        <p>✉️ {shippingAddress.email}</p>
                                    </div>
                                </div>

                                {!billingSameAsShipping && (
                                    <div className="review-address">
                                        <div className="review-section-header">
                                            <h3>Billing Address</h3>
                                            <button
                                                className="btn-edit"
                                                onClick={() => setStep(1)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="review-content">
                                            <p><strong>{billingAddress.fullName}</strong></p>
                                            <p>{billingAddress.address}</p>
                                            <p>{billingAddress.city}, {billingAddress.state} - {billingAddress.postalCode}</p>
                                            <p>{billingAddress.country}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="review-payment">
                                    <div className="review-section-header">
                                        <h3>Payment Method</h3>
                                        <button
                                            className="btn-edit"
                                            onClick={() => setStep(2)}
                                        >
                                            Change
                                        </button>
                                    </div>
                                    <div className="review-content">
                                        <div className="payment-method-display">
                                            {paymentMethod === "cod" && "💵 Cash on Delivery"}
                                            {paymentMethod === "card" && "💳 Credit/Debit Card"}
                                            {paymentMethod === "upi" && "📱 UPI"}
                                            {paymentMethod === "netbanking" && "🏦 Net Banking"}
                                        </div>
                                        <p className="payment-status">
                                            Status: {paymentMethod === "cod" ? "Pay on Delivery" : "Pay Now"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="order-notes">
                                <h3>Order Notes (Optional)</h3>
                                <textarea
                                    placeholder="Add any special instructions for delivery, packaging, or timing..."
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <div className="terms-agreement">
                                <label>
                                    <input type="checkbox" required />
                                    I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setStep(2)}
                                >
                                    Back to Payment
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handlePlaceOrder}
                                    disabled={placingOrder}
                                >
                                    {placingOrder ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Placing Order...
                                        </>
                                    ) : (
                                        "Place Order"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="checkout-summary-column">
                    {renderProductSummary()}

                    <div className="checkout-security">
                        <div className="security-icon">🔒</div>
                        <div className="security-text">
                            <strong>100% Secure Checkout</strong>
                            <p>Your payment information is encrypted and secure</p>
                        </div>
                    </div>

                    <div className="checkout-help">
                        <p>Need help with your order?</p>
                        <div className="help-contacts">
                            <p>📞 Call: <a href="tel:+911234567890">+91 12345 67890</a></p>
                            <p>✉️ Email: <a href="mailto:support@pankhudi.com">support@pankhudi.com</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;