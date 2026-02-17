// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Cart.css";

// const CartPage = () => {
//     const [cartItems, setCartItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [updatingItems, setUpdatingItems] = useState(new Set());
//     const [removingItems, setRemovingItems] = useState(new Set());
//     const [promoCode, setPromoCode] = useState("");
//     const [applyingPromo, setApplyingPromo] = useState(false);
//     const [error, setError] = useState("");
//     const [cartSummary, setCartSummary] = useState(null);
//     const [taxRate, setTaxRate] = useState(18);
//     const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);
//     const [standardShippingCharge, setStandardShippingCharge] = useState(50);

//     const navigate = useNavigate();
//     const token = localStorage.getItem("token");
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     const userId = storedUser?.id;

//     // ✅ Fetch cart items
//     const fetchCart = useCallback(async () => {
//         if (!userId || !token) {
//             setCartItems([]);
//             setLoading(false);
//             setError("Please login to view your cart");
//             return;
//         }

//         try {
//             setLoading(true);
//             setError("");

//             const cartResponse = await axios.get(
//                 `http://localhost:5000/api/cart/user/${userId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                     timeout: 10000,
//                 }
//             );

//             console.log("Cart API Response:", cartResponse.data);

//             if (cartResponse.data.success) {
//                 const items = cartResponse.data.items || [];
//                 setCartItems(items);

//                 // ✅ Calculate summary
//                 calculateCartSummary(items);

//                 localStorage.setItem(`cart_${userId}`, JSON.stringify({
//                     items: items,
//                     timestamp: new Date().toISOString()
//                 }));
//             } else {
//                 throw new Error(cartResponse.data.message || "Failed to fetch cart");
//             }

//         } catch (err) {
//             console.error("Error fetching cart:", err);

//             let errorMessage = "Failed to fetch cart items";
//             if (err.response?.data?.message) {
//                 errorMessage = err.response.data.message;
//             } else if (err.response?.status === 401) {
//                 errorMessage = "Please login to view your cart";
//                 navigate("/login");
//             } else if (err.code === "ECONNABORTED") {
//                 errorMessage = "Request timeout. Please check your connection.";
//             }

//             setError(errorMessage);

//             try {
//                 const savedCart = localStorage.getItem(`cart_${userId}`);
//                 if (savedCart) {
//                     const { items = [] } = JSON.parse(savedCart) || {};
//                     if (items && items.length > 0) {
//                         setCartItems(items);
//                         calculateCartSummary(items);
//                         setError("Using saved cart data (API unavailable)");
//                     }
//                 }
//             } catch (localErr) {
//                 console.error("Error loading saved cart:", localErr);
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [userId, token, navigate]);

//     // ✅ Calculate cart summary with proper shipping logic
//     const calculateCartSummary = (items) => {
//         if (!items || items.length === 0) {
//             setCartSummary({
//                 subtotal: 0,
//                 shipping: 0,
//                 tax: 0,
//                 discount: 0,
//                 total: 0,
//                 totalItems: 0,
//                 totalQuantity: 0,
//                 hasFreeShipping: false,
//                 shippingCharge: 0
//             });
//             return;
//         }

//         // Calculate subtotal and check for free shipping items
//         let subtotal = 0;
//         let totalQuantity = 0;
//         let hasFreeShippingItem = false;
//         let maxShippingCost = 0; // Track highest shipping cost among items

//         items.forEach(item => {
//             const price = parseFloat(item.final_price || item.price || 0);
//             const quantity = parseInt(item.quantity || 1);
//             const itemTotal = price * quantity;

//             subtotal += itemTotal;
//             totalQuantity += quantity;

//             // Check for free shipping item
//             if (item.free_shipping === 1 || item.free_shipping === true || item.free_shipping === "true") {
//                 hasFreeShippingItem = true;
//             }

//             // Track shipping cost (for non-free shipping items)
//             if (!item.free_shipping) {
//                 const itemShippingCost = parseFloat(item.shipping_cost || standardShippingCharge);
//                 maxShippingCost = Math.max(maxShippingCost, itemShippingCost);
//             }
//         });

//         // ✅ SHIPPING LOGIC:
//         let shipping = 0;
//         let hasFreeShipping = false;

//         // Rule 1: If ANY item has free shipping, entire order gets free shipping
//         if (hasFreeShippingItem) {
//             hasFreeShipping = true;
//             shipping = 0;
//         }
//         // Rule 2: If subtotal reaches free shipping threshold
//         else if (subtotal >= freeShippingThreshold) {
//             hasFreeShipping = true;
//             shipping = 0;
//         }
//         // Rule 3: Apply shipping charges
//         else {
//             // If no free shipping items, use the highest shipping cost among items
//             // OR standard shipping charge, whichever is higher
//             shipping = Math.max(standardShippingCharge, maxShippingCost);
//             hasFreeShipping = false;
//         }

//         // Calculate tax
//         const tax = (subtotal * taxRate) / 100;

//         // Calculate discount
//         const discount = cartSummary?.discount || 0;

//         // Calculate total
//         const total = Math.max(0, subtotal + shipping + tax - discount);

//         const summary = {
//             subtotal: parseFloat(subtotal.toFixed(2)),
//             shipping: parseFloat(shipping.toFixed(2)),
//             tax: parseFloat(tax.toFixed(2)),
//             discount: parseFloat(discount.toFixed(2)),
//             total: parseFloat(total.toFixed(2)),
//             totalItems: items.length,
//             totalQuantity: totalQuantity,
//             hasFreeShipping: hasFreeShipping,
//             freeShippingThreshold: freeShippingThreshold,
//             standardShippingCharge: standardShippingCharge,
//             taxRate: taxRate,
//             shippingCharge: shipping,
//             hasFreeShippingItem: hasFreeShippingItem
//         };

//         setCartSummary(summary);
//         console.log("Cart Summary Calculated:", summary);
//         console.log("Free Shipping Item Present:", hasFreeShippingItem);
//         console.log("Shipping Charge Applied:", shipping);
//     };

//     // ✅ Format currency
//     const formatCurrency = (value) => {
//         if (value === undefined || value === null || isNaN(value)) {
//             return "0.00";
//         }
//         return parseFloat(value).toFixed(2);
//     };

//     // ✅ Update quantity
//     const updateQuantity = async (cartId, newQty) => {
//         const currentItem = cartItems.find(item => item.id === cartId);
//         if (!currentItem) return { success: false, message: "Item not found" };

//         if (newQty < 1) {
//             return await removeItem(cartId, currentItem.product_name);
//         }

//         setUpdatingItems((prev) => new Set(prev).add(cartId));
//         try {
//             const updateResponse = await axios.put(
//                 `http://localhost:5000/api/cart/update/${cartId}`,
//                 { quantity: newQty },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     },
//                     timeout: 5000,
//                 }
//             );

//             if (updateResponse.data.success) {
//                 const updatedItems = cartItems.map(item =>
//                     item.id === cartId ? { ...item, quantity: newQty } : item
//                 );
//                 setCartItems(updatedItems);
//                 calculateCartSummary(updatedItems);

//                 return { success: true, data: updateResponse.data };
//             } else {
//                 return { success: false, message: updateResponse.data.message };
//             }

//         } catch (err) {
//             console.error("Update quantity error:", err);

//             let errorMsg = "Failed to update quantity";
//             if (err.response?.data?.message) {
//                 errorMsg = err.response.data.message;
//             }

//             await fetchCart();
//             return { success: false, message: errorMsg };
//         } finally {
//             setUpdatingItems((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(cartId);
//                 return newSet;
//             });
//         }
//     };

//     // ✅ Remove item
//     const removeItem = async (cartId, productName) => {
//         setRemovingItems((prev) => new Set(prev).add(cartId));
//         try {
//             const deleteResponse = await axios.delete(
//                 `http://localhost:5000/api/cart/delete/${cartId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     },
//                     timeout: 5000,
//                 }
//             );

//             if (deleteResponse.data.success) {
//                 const updatedItems = cartItems.filter(item => item.id !== cartId);
//                 setCartItems(updatedItems);
//                 calculateCartSummary(updatedItems);

//                 return { success: true, data: deleteResponse.data };
//             } else {
//                 return { success: false, message: deleteResponse.data.message };
//             }

//         } catch (err) {
//             console.error("Remove item error:", err);

//             let errorMsg = `Failed to remove ${productName}`;
//             if (err.response?.data?.message) {
//                 errorMsg = err.response.data.message;
//             }

//             return { success: false, message: errorMsg };
//         } finally {
//             setRemovingItems((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(cartId);
//                 return newSet;
//             });
//         }
//     };

//     // ✅ Clear cart
//     const clearCart = async () => {
//         try {
//             const clearResponse = await axios.delete(
//                 `http://localhost:5000/api/cart/clear/${userId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                     timeout: 5000,
//                 }
//             );

//             if (clearResponse.data.success) {
//                 setCartItems([]);
//                 setCartSummary({
//                     subtotal: 0,
//                     shipping: 0,
//                     tax: 0,
//                     discount: 0,
//                     total: 0,
//                     totalItems: 0,
//                     totalQuantity: 0,
//                     hasFreeShipping: false,
//                     shippingCharge: 0
//                 });
//                 localStorage.removeItem(`cart_${userId}`);
//                 return { success: true, data: clearResponse.data };
//             } else {
//                 return { success: false, message: clearResponse.data.message };
//             }
//         } catch (err) {
//             console.error("Clear cart error:", err);
//             return { success: false, message: "Failed to clear cart" };
//         }
//     };

//     // ✅ Apply promo code
//     const applyPromoCode = async () => {
//         if (!promoCode.trim()) {
//             setError("Please enter a promo code");
//             return;
//         }

//         setApplyingPromo(true);
//         setError("");
//         try {
//             const response = await axios.post(
//                 "http://localhost:5000/api/promo/validatePromo",
//                 { promoCode: promoCode.trim() },
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success && response.data.valid) {
//                 const discountAmount = response.data.discountAmount || 0;
//                 const discountPercent = response.data.discountPercent || 0;

//                 let discount = 0;
//                 if (discountPercent > 0) {
//                     discount = (cartSummary.subtotal * discountPercent) / 100;
//                 } else {
//                     discount = discountAmount;
//                 }

//                 setCartSummary(prev => ({
//                     ...prev,
//                     discount: parseFloat(discount.toFixed(2)),
//                     total: parseFloat((prev.subtotal + prev.shipping + prev.tax - discount).toFixed(2))
//                 }));

//                 setError("");
//             } else {
//                 setError(response.data.message || "Invalid or expired promo code");
//             }
//         } catch (err) {
//             setError("Failed to apply promo code");
//         } finally {
//             setApplyingPromo(false);
//         }
//     };

//     // ✅ Remove promo code
//     const removePromoCode = () => {
//         setPromoCode("");
//         if (cartSummary) {
//             setCartSummary(prev => ({
//                 ...prev,
//                 discount: 0,
//                 total: parseFloat((prev.subtotal + prev.shipping + prev.tax).toFixed(2))
//             }));
//         }
//     };

//     // ✅ Handle checkout
//     const handleCheckout = async () => {
//         if (cartItems.length === 0) {
//             setError("Your cart is empty");
//             return;
//         }

//         try {
//             const stockResponse = await axios.get(
//                 `http://localhost:5000/api/cart/check-stock/${userId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (stockResponse.data.success && stockResponse.data.has_stock_issues) {
//                 const issues = stockResponse.data.stock_issues || [];
//                 const issueMessages = issues.map(issue => {
//                     if (issue.is_out_of_stock) {
//                         return `${issue.product_name} is out of stock`;
//                     } else {
//                         return `${issue.product_name}: Only ${issue.stock} available (you have ${issue.quantity})`;
//                     }
//                 });

//                 setError("Stock issues: " + issueMessages.join(", "));
//                 return;
//             }

//             navigate("/checkout", {
//                 state: {
//                     checkoutType: "cart",
//                     cartItems: cartItems.map(item => ({
//                         cartId: item.id,
//                         productId: item.product_id,
//                         name: item.product_name,
//                         price: item.price,
//                         discount: item.discount,
//                         finalPrice: item.final_price,
//                         quantity: item.quantity,
//                         image: item.image,
//                         brand: item.brand,
//                         sku: item.sku,
//                         material: item.material,
//                         weight: item.weight,
//                         warranty: item.warranty,
//                         size: item.size,
//                         color: item.color,
//                         shipping_cost: item.shipping_cost,
//                         free_shipping: item.free_shipping,
//                         stock_status: item.stock_status,
//                         available_stock: item.stock
//                     })),
//                     cartSummary: cartSummary,
//                     timestamp: new Date().toISOString()
//                 }
//             });

//         } catch (err) {
//             console.error("Stock check error:", err);
//             setError("Unable to verify stock. Please try again.");
//         }
//     };

//     // ✅ Handle Buy Now
//     const handleBuyNow = async (item) => {
//         try {
//             const stockResponse = await axios.get(
//                 `http://localhost:5000/api/cart/product/${item.product_id}/stock`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (stockResponse.data.success) {
//                 const availableStock = stockResponse.data.available_quantity || 0;

//                 if (availableStock <= 0) {
//                     setError(`"${item.product_name}" is out of stock`);
//                     return;
//                 }

//                 if (item.quantity > availableStock) {
//                     setError(`Only ${availableStock} units available for "${item.product_name}"`);
//                     return;
//                 }

//                 const price = parseFloat(item.final_price || item.price || 0);
//                 const quantity = item.quantity || 1;
//                 const subtotal = price * quantity;
//                 const shipping = item.free_shipping ? 0 : (item.shipping_cost || standardShippingCharge);
//                 const tax = (subtotal * taxRate) / 100;
//                 const total = subtotal + shipping + tax;

//                 navigate("/checkout", {
//                     state: {
//                         checkoutType: "direct",
//                         product: {
//                             productId: item.product_id,
//                             name: item.product_name,
//                             price: item.price,
//                             discount: item.discount,
//                             finalPrice: item.final_price,
//                             quantity: item.quantity,
//                             image: item.image,
//                             brand: item.brand,
//                             sku: item.sku,
//                             material: item.material,
//                             weight: item.weight,
//                             warranty: item.warranty,
//                             size: item.size,
//                             color: item.color,
//                             shipping_cost: item.shipping_cost,
//                             free_shipping: item.free_shipping,
//                             stock: item.stock
//                         },
//                         cartSummary: {
//                             subtotal: parseFloat(subtotal.toFixed(2)),
//                             shipping: parseFloat(shipping.toFixed(2)),
//                             tax: parseFloat(tax.toFixed(2)),
//                             discount: 0,
//                             total: parseFloat(total.toFixed(2)),
//                             totalItems: 1,
//                             totalQuantity: quantity,
//                             hasFreeShipping: item.free_shipping ? true : false
//                         }
//                     }
//                 });
//             }
//         } catch (err) {
//             console.error("Stock check error:", err);
//             setError("Unable to check stock. Please try again.");
//         }
//     };

//     // ✅ Get stock status
//     const getStockStatus = (item) => {
//         if (!item) return { status: "loading", available: 0 };

//         const availableStock = item.stock || 0;
//         const stockStatus = item.stock_status || "available";

//         switch (stockStatus) {
//             case "out_of_stock":
//                 return { status: "out_of_stock", available: 0 };
//             case "insufficient":
//             case "insufficient_stock":
//                 return { status: "exceeds_stock", available: availableStock };
//             default:
//                 if (availableStock <= 5) {
//                     return { status: "low_stock", available: availableStock };
//                 }
//                 return { status: "in_stock", available: availableStock };
//         }
//     };

//     // ✅ Handle quantity change
//     const handleQuantityChange = async (item, change) => {
//         const newQty = item.quantity + change;
//         const result = await updateQuantity(item.id, newQty);

//         if (!result.success && result.message) {
//             setError(result.message);
//         }
//     };

//     // ✅ Handle remove click
//     const handleRemoveClick = async (item) => {
//         const result = await removeItem(item.id, item.product_name);

//         if (!result.success && result.message) {
//             setError(result.message);
//         }
//     };

//     // ✅ Fetch settings
//     useEffect(() => {
//         const fetchSettings = async () => {
//             try {
//                 const settingsResponse = await axios.get(
//                     "http://localhost:5000/api/cart/settings",
//                     {
//                         headers: { Authorization: `Bearer ${token}` }
//                     }
//                 );

//                 if (settingsResponse.data.success) {
//                     const { taxRate, freeShippingThreshold, shippingCharge } = settingsResponse.data.settings;
//                     setTaxRate(taxRate);
//                     setFreeShippingThreshold(freeShippingThreshold);
//                     setStandardShippingCharge(shippingCharge);
//                 }
//             } catch (err) {
//                 console.error("Error fetching settings:", err);
//             }
//         };

//         if (token) {
//             fetchSettings();
//         }
//     }, [token]);

//     // ✅ Initialize cart
//     useEffect(() => {
//         if (userId && token) {
//             fetchCart();
//         } else {
//             setLoading(false);
//             setError("Please login to view your cart");
//         }
//     }, [fetchCart, userId, token]);

//     useEffect(() => {
//         if (error) {
//             const timer = setTimeout(() => setError(""), 5000);
//             return () => clearTimeout(timer);
//         }
//     }, [error]);

//     // ✅ Recalculate summary when cart items change
//     useEffect(() => {
//         if (cartItems.length > 0) {
//             calculateCartSummary(cartItems);
//         }
//     }, [cartItems]);

//     return (
//         <div className="pankhudi-cart-wrapper">
//             {/* Header */}
//             <div className="pankhudi-cart-header">
//                 <button className="pankhudi-back-btn" onClick={() => navigate(-1)}>
//                     ← Back
//                 </button>
//                 <h1 className="brand-name">Pankhudi</h1>
//                 <div className="pankhudi-cart-stats">
//                     {cartSummary ? `${cartSummary.totalQuantity || 0} Items` : "0 Items"} in Cart
//                 </div>
//             </div>

//             {/* Error */}
//             {error && (
//                 <div className="pankhudi-error-banner">
//                     <span>{error}</span>
//                     <button onClick={() => setError("")} className="pankhudi-error-close">
//                         ×
//                     </button>
//                 </div>
//             )}

//             {/* Loading */}
//             {loading && (
//                 <div className="pankhudi-loading-container">
//                     <div className="pankhudi-skeleton-header"></div>
//                     {[1, 2, 3].map((i) => (
//                         <div key={i} className="pankhudi-cart-item-skeleton">
//                             <div className="pankhudi-skeleton-image"></div>
//                             <div className="pankhudi-skeleton-details">
//                                 <div className="pankhudi-skeleton-line"></div>
//                                 <div className="pankhudi-skeleton-line pankhudi-short"></div>
//                                 <div className="pankhudi-skeleton-line pankhudi-shorter"></div>
//                             </div>
//                             <div className="pankhudi-skeleton-actions">
//                                 <div className="pankhudi-skeleton-btn"></div>
//                                 <div className="pankhudi-skeleton-btn pankhudi-short"></div>
//                             </div>
//                         </div>
//                     ))}
//                     <div className="pankhudi-skeleton-summary"></div>
//                 </div>
//             )}

//             {/* Empty Cart */}
//             {!loading && cartItems.length === 0 && !error && (
//                 <div className="pankhudi-empty-cart">
//                     <div className="pankhudi-empty-cart-icon">🛒</div>
//                     <h2>Your cart is empty</h2>
//                     <p>Add some amazing products to get started!</p>
//                     <button
//                         className="pankhudi-continue-shopping-btn"
//                         onClick={() => navigate("/ProductDetail")}
//                     >
//                         Start Shopping
//                     </button>
//                 </div>
//             )}

//             {/* Cart Items */}
//             {!loading && cartItems.length > 0 && cartSummary && (
//                 <div className="pankhudi-cart-content">
//                     <div className="pankhudi-cart-items-section">
//                         <div className="pankhudi-section-header">
//                             <h2>Cart Items ({cartSummary.totalQuantity} items)</h2>
//                             <button
//                                 className="pankhudi-clear-cart-btn"
//                                 onClick={clearCart}
//                             >
//                                 Clear All
//                             </button>
//                         </div>

//                         <div className="pankhudi-cart-items">
//                             {cartItems.map((item) => {
//                                 const isUpdating = updatingItems.has(item.id);
//                                 const isRemoving = removingItems.has(item.id);
//                                 const stockStatus = getStockStatus(item);
//                                 const isOutOfStock = stockStatus.status === "out_of_stock";
//                                 const exceedsStock = stockStatus.status === "exceeds_stock";
//                                 const isLowStock = stockStatus.status === "low_stock";

//                                 return (
//                                     <div
//                                         key={item.id}
//                                         className={`pankhudi-cart-item ${isRemoving ? "pankhudi-removing" : ""} ${isOutOfStock ? "pankhudi-out-of-stock" : ""}`}
//                                     >
//                                         <div className="pankhudi-product-infos">
//                                             <div
//                                                 className="pankhudi-product-images"
//                                                 onClick={() => navigate(`/ProductDetail/${item.product_id}`)}
//                                                 style={{ cursor: "pointer" }}
//                                             >
//                                                 <img
//                                                     src={item.image}
//                                                     alt={item.product_name}
//                                                     onError={(e) => {
//                                                         e.target.src = "/images/placeholder-product.jpg";
//                                                     }}
//                                                 />
//                                                 {isOutOfStock && (
//                                                     <div className="pankhudi-out-of-stock-overlay">
//                                                         <span>OUT OF STOCK</span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className="pankhudi-product-details">
//                                                 <h3
//                                                     className="pankhudi-product-names"
//                                                     onClick={() => navigate(`/ProductDetail/${item.product_id}`)}
//                                                     style={{ cursor: "pointer" }}
//                                                 >
//                                                     {item.product_name}
//                                                     {item.brand && (
//                                                         <span className="pankhudi-brand"> - {item.brand}</span>
//                                                     )}
//                                                     {item.quantity > 1 && (
//                                                         <span className="pankhudi-item-quantity-badge">
//                                                             ×{item.quantity}
//                                                         </span>
//                                                     )}
//                                                 </h3>

//                                                 <div className="pankhudi-product-specs">
//                                                     {item.sku && <span>SKU: {item.sku}</span>}
//                                                     {item.size && <span>Size: {item.size}</span>}
//                                                     {item.color && <span>Color: {item.color}</span>}
//                                                     {item.material && <span>Material: {item.material}</span>}
//                                                 </div>

//                                                 {/* Shipping Info for each item */}
//                                                 <div className="pankhudi-item-shipping-info">
//                                                     {item.free_shipping ? (
//                                                         <span className="pankhudi-free-shipping-badge">🚚 FREE Shipping</span>
//                                                     ) : item.shipping_cost && item.shipping_cost > 0 ? (
//                                                         <span className="pankhudi-shipping-cost">Shipping: ₹{formatCurrency(item.shipping_cost)}</span>
//                                                     ) : null}
//                                                 </div>

//                                                 <div className="pankhudi-price-info">
//                                                     {item.discount > 0 ? (
//                                                         <>
//                                                             <span className="pankhudi-original-prices">
//                                                                 ₹{formatCurrency(item.price)}
//                                                             </span>
//                                                             <span className="pankhudi-discounted-price">
//                                                                 ₹{formatCurrency(item.final_price)}
//                                                             </span>
//                                                             <span className="pankhudi-discount">
//                                                                 {item.discount}% OFF
//                                                             </span>
//                                                         </>
//                                                     ) : (
//                                                         <span className="pankhudi-price">
//                                                             ₹{formatCurrency(item.price)}
//                                                         </span>
//                                                     )}
//                                                 </div>

//                                                 <div className={`pankhudi-stock-info ${isOutOfStock ? 'pankhudi-stock-out' : ''}`}>
//                                                     {stockStatus.status === "loading" ? (
//                                                         <span>Checking stock...</span>
//                                                     ) : isOutOfStock ? (
//                                                         <span className="pankhudi-out-of-stock-text">Out of Stock</span>
//                                                     ) : isLowStock ? (
//                                                         <span className="pankhudi-low-stock-text">
//                                                             Only {stockStatus.available} left in stock!
//                                                         </span>
//                                                     ) : exceedsStock ? (
//                                                         <span className="pankhudi-exceeds-stock-text">
//                                                             Only {stockStatus.available} available (you have {item.quantity})
//                                                         </span>
//                                                     ) : (
//                                                         <span className="pankhudi-in-stock-text">
//                                                             In Stock: {stockStatus.available} units available
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="pankhudi-item-controls">
//                                             <div className="pankhudi-quantity-section">
//                                                 <label>Quantity:</label>
//                                                 <div className="pankhudi-quantity-controls">
//                                                     <button
//                                                         className={`pankhudi-qty-btn pankhudi-minus ${isUpdating || isOutOfStock ? "pankhudi-disabled" : ""}`}
//                                                         onClick={() => !isUpdating && !isOutOfStock && handleQuantityChange(item, -1)}
//                                                         disabled={isUpdating || isOutOfStock}
//                                                     >
//                                                         {isUpdating ? "..." : "−"}
//                                                     </button>
//                                                     <span className="pankhudi-quantity">{item.quantity}</span>
//                                                     <button
//                                                         className={`pankhudi-qty-btn pankhudi-plus ${isUpdating || isOutOfStock || item.quantity >= stockStatus.available ? "pankhudi-disabled" : ""}`}
//                                                         onClick={() => !isUpdating && !isOutOfStock && item.quantity < stockStatus.available && handleQuantityChange(item, 1)}
//                                                         disabled={isUpdating || isOutOfStock || item.quantity >= stockStatus.available}
//                                                     >
//                                                         {isUpdating ? "..." : "+"}
//                                                     </button>
//                                                 </div>
//                                             </div>

//                                             <div className="pankhudi-item-total">
//                                                 <div className="pankhudi-item-total-amount">
//                                                     ₹{formatCurrency((parseFloat(item.final_price || 0) * item.quantity))}
//                                                 </div>
//                                                 {item.quantity > 1 && (
//                                                     <div className="pankhudi-item-unit-price">
//                                                         ₹{formatCurrency(item.final_price)} each
//                                                     </div>
//                                                 )}
//                                             </div>

//                                             <div className="pankhudi-action-buttons">
//                                                 <button
//                                                     className={`pankhudi-buy-now-btn ${isOutOfStock || exceedsStock ? "pankhudi-disabled-btn" : ""}`}
//                                                     onClick={() => handleBuyNow(item)}
//                                                     disabled={isOutOfStock || exceedsStock}
//                                                 >
//                                                     {isOutOfStock ? "Out of Stock" : "Buy Now"}
//                                                 </button>

//                                                 <button
//                                                     className={`pankhudi-remove-btn ${isRemoving ? "pankhudi-removing" : ""}`}
//                                                     onClick={() => handleRemoveClick(item)}
//                                                     disabled={isRemoving}
//                                                 >
//                                                     {isRemoving ? "..." : "Remove"}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {/* Order Summary */}
//                     <div className="pankhudi-cart-summary">
//                         <div className="pankhudi-summary-card">
//                             <h2>Order Summary</h2>

//                             <div className="pankhudi-summary-line">
//                                 <span>Subtotal ({cartSummary.totalQuantity} items)</span>
//                                 <span>₹{formatCurrency(cartSummary.subtotal)}</span>
//                             </div>

//                             <div className="pankhudi-summary-line">
//                                 <span>Shipping</span>
//                                 <span>
//                                     {cartSummary.hasFreeShipping ? (
//                                         <span className="pankhudi-free-shipping">FREE</span>
//                                     ) : (
//                                         `₹${formatCurrency(cartSummary.shipping)}`
//                                     )}
//                                 </span>
//                             </div>

//                             {/* Shipping Info Message */}
//                             <div className="pankhudi-shipping-info-message">
//                                 {cartSummary.hasFreeShipping ? (
//                                     <div className="pankhudi-free-shipping-info">
//                                         {cartSummary.hasFreeShippingItem ? (
//                                             <span>🎉 Your order qualifies for FREE shipping!</span>
//                                         ) : (
//                                             <span>🎉 Order value qualifies for FREE shipping!</span>
//                                         )}
//                                     </div>
//                                 ) : cartSummary.subtotal < freeShippingThreshold ? (
//                                     <div className="pankhudi-shipping-threshold-note">
//                                         Add ₹{formatCurrency(freeShippingThreshold - cartSummary.subtotal)} more for FREE shipping
//                                     </div>
//                                 ) : null}
//                             </div>

//                             <div className="pankhudi-summary-line">
//                                 <span>Tax ({cartSummary.taxRate || taxRate}%)</span>
//                                 <span>₹{formatCurrency(cartSummary.tax)}</span>
//                             </div>

//                             {cartSummary.discount > 0 && (
//                                 <div className="pankhudi-summary-line pankhudi-discount-line">
//                                     <span>
//                                         Discount
//                                         <button
//                                             onClick={removePromoCode}
//                                             className="pankhudi-clear-promo"
//                                             title="Remove discount"
//                                         >
//                                             ×
//                                         </button>
//                                     </span>
//                                     <span className="pankhudi-discount-amount">-₹{formatCurrency(cartSummary.discount)}</span>
//                                 </div>
//                             )}

//                             {/* Promo Code */}
//                             <div className="pankhudi-promo-section">
//                                 <div className="pankhudi-promo-input-group">
//                                     <input
//                                         type="text"
//                                         placeholder="Enter promo code"
//                                         value={promoCode}
//                                         onChange={(e) => setPromoCode(e.target.value)}
//                                         className="pankhudi-promo-input"
//                                         disabled={applyingPromo}
//                                     />
//                                     <button
//                                         onClick={applyPromoCode}
//                                         disabled={applyingPromo || !promoCode.trim()}
//                                         className="pankhudi-apply-promo-btn"
//                                     >
//                                         {applyingPromo ? "..." : "Apply"}
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="pankhudi-summary-total">
//                                 <span>Total Amount</span>
//                                 <span className="pankhudi-total-amount">₹{formatCurrency(cartSummary.total)}</span>
//                             </div>

//                             <button
//                                 className="pankhudi-checkout-btn"
//                                 onClick={handleCheckout}
//                                 disabled={cartItems.some(item => {
//                                     const status = getStockStatus(item);
//                                     return status.status === "out_of_stock" || status.status === "exceeds_stock";
//                                 })}
//                             >
//                                 Proceed to Checkout
//                             </button>

//                             <div className="pankhudi-secure-checkout">
//                                 <span className="pankhudi-lock-icon">🔒</span>
//                                 Secure checkout · Encrypted transaction
//                             </div>

//                             <div className="pankhudi-continue-shopping">
//                                 <button
//                                     onClick={() => navigate("/products")}
//                                     className="pankhudi-continue-btn"
//                                 >
//                                     ← Continue Shopping
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CartPage;





import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [removingItems, setRemovingItems] = useState(new Set());
    const [promoCode, setPromoCode] = useState("");
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [error, setError] = useState("");
    const [cartSummary, setCartSummary] = useState(null);
    const [taxRate, setTaxRate] = useState(18);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);
    const [standardShippingCharge, setStandardShippingCharge] = useState(50);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    // ✅ Fetch cart items - FIXED VERSION
    const fetchCart = useCallback(async () => {
        if (!userId || !token) {
            setCartItems([]);
            setLoading(false);
            setError("Please login to view your cart");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // ✅ FIXED: First try to fetch from database API
            const cartResponse = await axios.get(
                `http://localhost:5000/api/cart/user/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                }
            );

            if (cartResponse.data.success) {
                const items = cartResponse.data.items || cartResponse.data.cart || [];

                setCartItems(items);
                // ✅ Calculate summary
                calculateCartSummary(items);

                // ✅ Clear localStorage - Don't store cart data here
                localStorage.removeItem(`cart_${userId}`);

            } else {
                // If API returns error but has items in data
                if (cartResponse.data.items || cartResponse.data.cart) {
                    const items = cartResponse.data.items || cartResponse.data.cart || [];
                    setCartItems(items);
                    calculateCartSummary(items);
                    console.log("Using items from response data despite error flag");
                } else {
                    throw new Error(cartResponse.data.message || "Failed to fetch cart");
                }
            }

        } catch (err) {
            let errorMessage = "Failed to fetch cart items";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = "Please login to view your cart";
                navigate("/login");
            } else if (err.code === "ECONNABORTED") {
                errorMessage = "Request timeout. Please check your connection.";
            }

            setError(errorMessage);

            // ✅ IMPORTANT FIX: Don't fallback to localStorage
            // Instead show empty cart or error
            setCartItems([]);
            calculateCartSummary([]);

        } finally {
            setLoading(false);
        }
    }, [userId, token, navigate]);

    // ✅ Calculate cart summary with proper shipping logic
    const calculateCartSummary = (items) => {
        if (!items || items.length === 0) {
            setCartSummary({
                subtotal: 0,
                shipping: 0,
                tax: 0,
                discount: 0,
                total: 0,
                totalItems: 0,
                totalQuantity: 0,
                hasFreeShipping: false,
                shippingCharge: 0
            });
            return;
        }

        // Calculate subtotal and check for free shipping items
        let subtotal = 0;
        let totalQuantity = 0;
        let hasFreeShippingItem = false;
        let maxShippingCost = 0;

        items.forEach(item => {
            const price = parseFloat(item.final_price || item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            const itemTotal = price * quantity;

            subtotal += itemTotal;
            totalQuantity += quantity;

            // Check for free shipping item
            if (item.free_shipping === 1 || item.free_shipping === true || item.free_shipping === "true") {
                hasFreeShippingItem = true;
            }

            // Track shipping cost
            if (!item.free_shipping) {
                const itemShippingCost = parseFloat(item.shipping_cost || standardShippingCharge);
                maxShippingCost = Math.max(maxShippingCost, itemShippingCost);
            }
        });

        // ✅ SHIPPING LOGIC:
        let shipping = 0;
        let hasFreeShipping = false;

        // Rule 1: If ANY item has free shipping, entire order gets free shipping
        if (hasFreeShippingItem) {
            hasFreeShipping = true;
            shipping = 0;
        }
        // Rule 2: If subtotal reaches free shipping threshold
        else if (subtotal >= freeShippingThreshold) {
            hasFreeShipping = true;
            shipping = 0;
        }
        // Rule 3: Apply shipping charges
        else {
            shipping = Math.max(standardShippingCharge, maxShippingCost);
            hasFreeShipping = false;
        }

        // Calculate tax
        const tax = (subtotal * taxRate) / 100;

        // Calculate discount
        const discount = cartSummary?.discount || 0;

        // Calculate total
        const total = Math.max(0, subtotal + shipping + tax - discount);

        const summary = {
            subtotal: parseFloat(subtotal.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            totalItems: items.length,
            totalQuantity: totalQuantity,
            hasFreeShipping: hasFreeShipping,
            freeShippingThreshold: freeShippingThreshold,
            standardShippingCharge: standardShippingCharge,
            taxRate: taxRate,
            shippingCharge: shipping,
            hasFreeShippingItem: hasFreeShippingItem
        };

        setCartSummary(summary);
    };

    // ✅ Format currency
    const formatCurrency = (value) => {
        if (value === undefined || value === null || isNaN(value)) {
            return "0.00";
        }
        return parseFloat(value).toFixed(2);
    };

    // ✅ Update quantity
    const updateQuantity = async (cartId, newQty) => {
        const currentItem = cartItems.find(item => item.id === cartId);
        if (!currentItem) return { success: false, message: "Item not found" };

        if (newQty < 1) {
            return await removeItem(cartId, currentItem.product_name);
        }

        setUpdatingItems((prev) => new Set(prev).add(cartId));
        try {
            const updateResponse = await axios.put(
                `http://localhost:5000/api/cart/update/${cartId}`,
                { quantity: newQty },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000,
                }
            );

            if (updateResponse.data.success) {
                const updatedItems = cartItems.map(item =>
                    item.id === cartId ? { ...item, quantity: newQty } : item
                );
                setCartItems(updatedItems);
                calculateCartSummary(updatedItems);

                return { success: true, data: updateResponse.data };
            } else {
                return { success: false, message: updateResponse.data.message };
            }

        } catch (err) {
            console.error("Update quantity error:", err);
            return { success: false, message: "Failed to update quantity" };
        } finally {
            setUpdatingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(cartId);
                return newSet;
            });
        }
    };

    // ✅ Remove item
    const removeItem = async (cartId, productName) => {
        setRemovingItems((prev) => new Set(prev).add(cartId));
        try {
            const deleteResponse = await axios.delete(
                `http://localhost:5000/api/cart/delete/${cartId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 5000,
                }
            );

            if (deleteResponse.data.success) {
                const updatedItems = cartItems.filter(item => item.id !== cartId);
                setCartItems(updatedItems);
                calculateCartSummary(updatedItems);

                return { success: true, data: deleteResponse.data };
            } else {
                return { success: false, message: deleteResponse.data.message };
            }

        } catch (err) {
            console.error("Remove item error:", err);
            return { success: false, message: "Failed to remove item" };
        } finally {
            setRemovingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(cartId);
                return newSet;
            });
        }
    };

    // ✅ Clear cart
    const clearCart = async () => {
        try {
            const clearResponse = await axios.delete(
                `http://localhost:5000/api/cart/clear/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000,
                }
            );

            if (clearResponse.data.success) {
                setCartItems([]);
                setCartSummary({
                    subtotal: 0,
                    shipping: 0,
                    tax: 0,
                    discount: 0,
                    total: 0,
                    totalItems: 0,
                    totalQuantity: 0,
                    hasFreeShipping: false,
                    shippingCharge: 0
                });
                // Clear localStorage too
                localStorage.removeItem(`cart_${userId}`);
                return { success: true, data: clearResponse.data };
            } else {
                return { success: false, message: clearResponse.data.message };
            }
        } catch (err) {
            console.error("Clear cart error:", err);
            return { success: false, message: "Failed to clear cart" };
        }
    };

    // ✅ Apply promo code
    const applyPromoCode = async () => {
        if (!promoCode.trim()) {
            setError("Please enter a promo code");
            return;
        }

        setApplyingPromo(true);
        setError("");
        try {
            const response = await axios.post(
                "http://localhost:5000/api/promo/validate",
                { promoCode: promoCode.trim() },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success && response.data.valid) {
                const discountAmount = response.data.discountAmount || 0;
                const discountPercent = response.data.discountPercent || 0;

                let discount = 0;
                if (discountPercent > 0) {
                    discount = (cartSummary.subtotal * discountPercent) / 100;
                } else {
                    discount = discountAmount;
                }

                setCartSummary(prev => ({
                    ...prev,
                    discount: parseFloat(discount.toFixed(2)),
                    total: parseFloat((prev.subtotal + prev.shipping + prev.tax - discount).toFixed(2))
                }));

                setError("");
            } else {
                setError(response.data.message || "Invalid or expired promo code");
            }
        } catch (err) {
            setError("Failed to apply promo code");
        } finally {
            setApplyingPromo(false);
        }
    };

    // ✅ Remove promo code
    const removePromoCode = () => {
        setPromoCode("");
        if (cartSummary) {
            setCartSummary(prev => ({
                ...prev,
                discount: 0,
                total: parseFloat((prev.subtotal + prev.shipping + prev.tax).toFixed(2))
            }));
        }
    };

    // ✅ Handle checkout
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            setError("Your cart is empty");
            return;
        }

        try {
            // Pass cart items to checkout
            navigate("/checkout", {
                state: {
                    checkoutType: "cart",
                    cartItems: cartItems.map(item => ({
                        cartId: item.id,
                        productId: item.product_id,
                        name: item.product_name,
                        price: item.price,
                        discount: item.discount,
                        finalPrice: item.final_price,
                        quantity: item.quantity,
                        image: item.image,
                        brand: item.brand,
                        sku: item.sku,
                        material: item.material,
                        size: item.size,
                        color: item.color,
                        shipping_cost: item.shipping_cost,
                        free_shipping: item.free_shipping
                    })),
                    cartSummary: cartSummary
                }
            });

        } catch (err) {
            console.error("Checkout error:", err);
            setError("Unable to proceed to checkout. Please try again.");
        }
    };

    // ✅ Handle Buy Now
    const handleBuyNow = async (item) => {
        try {
            const price = parseFloat(item.final_price || item.price || 0);
            const quantity = item.quantity || 1;
            const subtotal = price * quantity;
            const shipping = item.free_shipping ? 0 : (item.shipping_cost || standardShippingCharge);
            const tax = (subtotal * taxRate) / 100;
            const total = subtotal + shipping + tax;

            navigate("/checkout", {
                state: {
                    checkoutType: "direct",
                    product: {
                        id: item.product_id,
                        name: item.product_name,
                        price: item.price,
                        discount: item.discount,
                        finalPrice: item.final_price,
                        quantity: item.quantity,
                        image: item.image,
                        brand: item.brand,
                        sku: item.sku,
                        material: item.material,
                        size: item.size,
                        color: item.color,
                        shipping_cost: item.shipping_cost,
                        free_shipping: item.free_shipping
                    },
                    cartSummary: {
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        shipping: parseFloat(shipping.toFixed(2)),
                        tax: parseFloat(tax.toFixed(2)),
                        discount: 0,
                        total: parseFloat(total.toFixed(2)),
                        totalItems: 1,
                        totalQuantity: quantity,
                        hasFreeShipping: item.free_shipping ? true : false
                    }
                }
            });
        } catch (err) {
            console.error("Buy Now error:", err);
            setError("Unable to proceed. Please try again.");
        }
    };

    // ✅ Get stock status
    const getStockStatus = (item) => {
        if (!item) return { status: "loading", available: 0 };

        const availableStock = item.stock || 0;
        const stockStatus = item.stock_status || "available";

        switch (stockStatus) {
            case "out_of_stock":
                return { status: "out_of_stock", available: 0 };
            case "insufficient":
            case "insufficient_stock":
                return { status: "exceeds_stock", available: availableStock };
            default:
                if (availableStock <= 5) {
                    return { status: "low_stock", available: availableStock };
                }
                return { status: "in_stock", available: availableStock };
        }
    };

    // ✅ Handle quantity change
    const handleQuantityChange = async (item, change) => {
        const newQty = item.quantity + change;
        const result = await updateQuantity(item.id, newQty);

        if (!result.success && result.message) {
            setError(result.message);
        }
    };

    // ✅ Handle remove click
    const handleRemoveClick = async (item) => {
        const result = await removeItem(item.id, item.product_name);

        if (!result.success && result.message) {
            setError(result.message);
        }
    };

    // ✅ Fetch settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsResponse = await axios.get(
                    "http://localhost:5000/api/cart/settings",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (settingsResponse.data.success) {
                    const { taxRate, freeShippingThreshold, shippingCharge } = settingsResponse.data.settings;
                    setTaxRate(taxRate);
                    setFreeShippingThreshold(freeShippingThreshold);
                    setStandardShippingCharge(shippingCharge);
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };

        if (token) {
            fetchSettings();
        }
    }, [token]);

    // ✅ Initialize cart - FIXED
    useEffect(() => {
        if (userId && token) {
            fetchCart();
        } else {
            setLoading(false);
            setError("Please login to view your cart");
        }
    }, [fetchCart, userId, token]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // ✅ Recalculate summary when cart items change
    useEffect(() => {
        if (cartItems.length > 0) {
            calculateCartSummary(cartItems);
        }
    }, [cartItems]);

    return (
        <div className="pankhudi-cart-wrapper">
            {/* Header */}
            <div className="pankhudi-cart-header">
                <button className="pankhudi-back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1 className="brand-name">Pankhudi</h1>
                <div className="pankhudi-cart-stats">
                    {cartSummary ? `${cartSummary.totalQuantity || 0} Items` : "0 Items"} in Cart
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="pankhudi-error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="pankhudi-error-close">
                        ×
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="pankhudi-loading-container">
                    <div className="pankhudi-skeleton-header"></div>
                    {[1, 2, 3].map((i) => (
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
            {!loading && cartItems.length === 0 && !error && (
                <div className="pankhudi-empty-cart">
                    <div className="pankhudi-empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add some amazing products to get started!</p>
                    <button
                        className="pankhudi-continue-shopping-btn"
                        onClick={() => navigate("/products")}
                    >
                        Start Shopping
                    </button>
                </div>
            )}

            {/* Cart Items */}
            {!loading && cartItems.length > 0 && cartSummary && (
                <div className="pankhudi-cart-content">
                    <div className="pankhudi-cart-items-section">
                        <div className="pankhudi-section-header">
                            <h2>Cart Items ({cartSummary.totalQuantity} items)</h2>
                            <button
                                className="pankhudi-clear-cart-btn"
                                onClick={clearCart}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="pankhudi-cart-items">
                            {cartItems.map((item) => {
                                const isUpdating = updatingItems.has(item.id);
                                const isRemoving = removingItems.has(item.id);
                                const stockStatus = getStockStatus(item);
                                const isOutOfStock = stockStatus.status === "out_of_stock";
                                const exceedsStock = stockStatus.status === "exceeds_stock";
                                const isLowStock = stockStatus.status === "low_stock";

                                return (
                                    <div
                                        key={item.id}
                                        className={`pankhudi-cart-item ${isRemoving ? "pankhudi-removing" : ""} ${isOutOfStock ? "pankhudi-out-of-stock" : ""}`}
                                    >
                                        <div className="pankhudi-product-infos">
                                            <div
                                                className="pankhudi-product-images"
                                                onClick={() => navigate(`/ProductDetail/${item.product_id}`)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <img
                                                    src={item.image || "/images/placeholder-product.jpg"}
                                                    alt={item.product_name}
                                                    onError={(e) => {
                                                        e.target.src = "/images/placeholder-product.jpg";
                                                    }}
                                                />
                                                {isOutOfStock && (
                                                    <div className="pankhudi-out-of-stock-overlay">
                                                        <span>OUT OF STOCK</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="pankhudi-product-details">
                                                <h3
                                                    className="pankhudi-product-names"
                                                    onClick={() => navigate(`/ProductDetail/${item.product_id}`)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {item.product_name}
                                                    {item.brand && (
                                                        <span className="pankhudi-brand"> - {item.brand}</span>
                                                    )}
                                                    {item.quantity > 1 && (
                                                        <span className="pankhudi-item-quantity-badge">
                                                            ×{item.quantity}
                                                        </span>
                                                    )}
                                                </h3>

                                                {/* ✅ FIXED: Product specs - Only show if available */}
                                                <div className="pankhudi-product-specs">
                                                    {/* Always show SKU if available */}
                                                    {item.sku && <span className="pankhudi-spec-item">SKU: {item.sku}</span>}

                                                    {/* Show size only if available */}
                                                    {item.size && item.size.trim() !== "" && (
                                                        <span className="pankhudi-spec-item">Size: {item.size}</span>
                                                    )}

                                                    {/* Show color only if available */}
                                                    {item.color && item.color.trim() !== "" && (
                                                        <span className="pankhudi-spec-item">Color: {item.color}</span>
                                                    )}

                                                    {/* Show material only if available */}
                                                    {item.material && item.material.trim() !== "" && (
                                                        <span className="pankhudi-spec-item">Material: {item.material}</span>
                                                    )}

                                                    {/* If no specs except SKU, don't show the container */}
                                                    {!item.size && !item.color && !item.material && !item.sku && (
                                                        <div className="pankhudi-no-specs">
                                                            <span className="pankhudi-spec-item">No additional details</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Shipping Info for each item */}
                                                <div className="pankhudi-item-shipping-info">
                                                    {item.free_shipping ? (
                                                        <span className="pankhudi-free-shipping-badge">🚚 FREE Shipping</span>
                                                    ) : item.shipping_cost && item.shipping_cost > 0 ? (
                                                        <span className="pankhudi-shipping-cost">Shipping: ₹{formatCurrency(item.shipping_cost)}</span>
                                                    ) : null}
                                                </div>

                                                <div className="pankhudi-price-info">
                                                    {item.discount > 0 ? (
                                                        <>
                                                            <span className="pankhudi-original-prices">
                                                                ₹{formatCurrency(item.price)}
                                                            </span>
                                                            <span className="pankhudi-discounted-price">
                                                                ₹{formatCurrency(item.final_price)}
                                                            </span>
                                                            <span className="pankhudi-discount">
                                                                {item.discount}% OFF
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="pankhudi-price">
                                                            ₹{formatCurrency(item.price)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={`pankhudi-stock-info ${isOutOfStock ? 'pankhudi-stock-out' : ''}`}>
                                                    {stockStatus.status === "loading" ? (
                                                        <span>Checking stock...</span>
                                                    ) : isOutOfStock ? (
                                                        <span className="pankhudi-out-of-stock-text">Out of Stock</span>
                                                    ) : isLowStock ? (
                                                        <span className="pankhudi-low-stock-text">
                                                            Only {stockStatus.available} left in stock!
                                                        </span>
                                                    ) : exceedsStock ? (
                                                        <span className="pankhudi-exceeds-stock-text">
                                                            Only {stockStatus.available} available (you have {item.quantity})
                                                        </span>
                                                    ) : (
                                                        <span className="pankhudi-in-stock-text">
                                                            In Stock: {stockStatus.available} units available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pankhudi-item-controls">
                                            <div className="pankhudi-quantity-section">
                                                <label>Quantity:</label>
                                                <div className="pankhudi-quantity-controls">
                                                    <button
                                                        className={`pankhudi-qty-btn pankhudi-minus ${isUpdating || isOutOfStock ? "pankhudi-disabled" : ""}`}
                                                        onClick={() => !isUpdating && !isOutOfStock && handleQuantityChange(item, -1)}
                                                        disabled={isUpdating || isOutOfStock}
                                                    >
                                                        {isUpdating ? "..." : "−"}
                                                    </button>
                                                    <span className="pankhudi-quantity">{item.quantity}</span>
                                                    <button
                                                        className={`pankhudi-qty-btn pankhudi-plus ${isUpdating || isOutOfStock || item.quantity >= stockStatus.available ? "pankhudi-disabled" : ""}`}
                                                        onClick={() => !isUpdating && !isOutOfStock && item.quantity < stockStatus.available && handleQuantityChange(item, 1)}
                                                        disabled={isUpdating || isOutOfStock || item.quantity >= stockStatus.available}
                                                    >
                                                        {isUpdating ? "..." : "+"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pankhudi-item-total">
                                                <div className="pankhudi-item-total-amount">
                                                    ₹{formatCurrency((parseFloat(item.final_price || 0) * item.quantity))}
                                                </div>
                                                {item.quantity > 1 && (
                                                    <div className="pankhudi-item-unit-price">
                                                        ₹{formatCurrency(item.final_price)} each
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pankhudi-action-buttons">
                                                <button
                                                    className={`pankhudi-buy-now-btn ${isOutOfStock || exceedsStock ? "pankhudi-disabled-btn" : ""}`}
                                                    onClick={() => handleBuyNow(item)}
                                                    disabled={isOutOfStock || exceedsStock}
                                                >
                                                    {isOutOfStock ? "Out of Stock" : "Buy Now"}
                                                </button>

                                                <button
                                                    className={`pankhudi-remove-btn ${isRemoving ? "pankhudi-removing" : ""}`}
                                                    onClick={() => handleRemoveClick(item)}
                                                    disabled={isRemoving}
                                                >
                                                    {isRemoving ? "..." : "Remove"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="pankhudi-cart-summary">
                        <div className="pankhudi-summary-card">
                            <h2>Order Summary</h2>

                            <div className="pankhudi-summary-line">
                                <span>Subtotal ({cartSummary.totalQuantity} items)</span>
                                <span>₹{formatCurrency(cartSummary.subtotal)}</span>
                            </div>

                            <div className="pankhudi-summary-line">
                                <span>Shipping</span>
                                <span>
                                    {cartSummary.hasFreeShipping ? (
                                        <span className="pankhudi-free-shipping">FREE</span>
                                    ) : (
                                        `₹${formatCurrency(cartSummary.shipping)}`
                                    )}
                                </span>
                            </div>

                            {/* Shipping Info Message */}
                            <div className="pankhudi-shipping-info-message">
                                {cartSummary.hasFreeShipping ? (
                                    <div className="pankhudi-free-shipping-info">
                                        {cartSummary.hasFreeShippingItem ? (
                                            <span>🎉 Your order qualifies for FREE shipping!</span>
                                        ) : (
                                            <span>🎉 Order value qualifies for FREE shipping!</span>
                                        )}
                                    </div>
                                ) : cartSummary.subtotal < freeShippingThreshold ? (
                                    <div className="pankhudi-shipping-threshold-note">
                                        Add ₹{formatCurrency(freeShippingThreshold - cartSummary.subtotal)} more for FREE shipping
                                    </div>
                                ) : null}
                            </div>

                            <div className="pankhudi-summary-line">
                                <span>Tax ({cartSummary.taxRate || taxRate}%)</span>
                                <span>₹{formatCurrency(cartSummary.tax)}</span>
                            </div>

                            {cartSummary.discount > 0 && (
                                <div className="pankhudi-summary-line pankhudi-discount-line">
                                    <span>
                                        Discount
                                        <button
                                            onClick={removePromoCode}
                                            className="pankhudi-clear-promo"
                                            title="Remove discount"
                                        >
                                            ×
                                        </button>
                                    </span>
                                    <span className="pankhudi-discount-amount">-₹{formatCurrency(cartSummary.discount)}</span>
                                </div>
                            )}

                            {/* Promo Code */}
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
                                        {applyingPromo ? "..." : "Apply"}
                                    </button>
                                </div>
                            </div>

                            <div className="pankhudi-summary-total">
                                <span>Total Amount</span>
                                <span className="pankhudi-total-amount">₹{formatCurrency(cartSummary.total)}</span>
                            </div>

                            <button
                                className="pankhudi-checkout-btn"
                                onClick={handleCheckout}
                                disabled={cartItems.some(item => {
                                    const status = getStockStatus(item);
                                    return status.status === "out_of_stock" || status.status === "exceeds_stock";
                                })}
                            >
                                Proceed to Checkout
                            </button>

                            <div className="pankhudi-secure-checkout">
                                <span className="pankhudi-lock-icon">🔒</span>
                                Secure checkout · Encrypted transaction
                            </div>

                            <div className="pankhudi-continue-shopping">
                                <button
                                    onClick={() => navigate("/products")}
                                    className="pankhudi-continue-btn"
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;