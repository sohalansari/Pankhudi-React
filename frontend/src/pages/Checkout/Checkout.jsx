// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Checkout.css";

// const Checkout = () => {
//     const location = useLocation();
//     const navigate = useNavigate();

//     // ==================== STATE MANAGEMENT ====================

//     // ✅ Checkout type state
//     const [checkoutType, setCheckoutType] = useState(""); // "cart" or "direct"
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [userDetails, setUserDetails] = useState(null);
//     const [orderPlaced, setOrderPlaced] = useState(false);

//     // ✅ Form states
//     const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
//     const [shippingAddress, setShippingAddress] = useState({
//         fullName: "",
//         address: "",
//         city: "",
//         state: "",
//         postalCode: "",
//         country: "India",
//         phone: "",
//         email: ""
//     });

//     const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
//     const [billingAddress, setBillingAddress] = useState({
//         fullName: "",
//         address: "",
//         city: "",
//         state: "",
//         postalCode: "",
//         country: "India"
//     });

//     // ✅ Payment states
//     const [paymentMethod, setPaymentMethod] = useState("cod");
//     const [orderNote, setOrderNote] = useState("");
//     const [placingOrder, setPlacingOrder] = useState(false);
//     const [orderSuccess, setOrderSuccess] = useState(false);
//     const [orderDetails, setOrderDetails] = useState(null);

//     // ✅ Address management states
//     const [savedAddresses, setSavedAddresses] = useState([]);
//     const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
//     const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
//     const [saveAddressAsNew, setSaveAddressAsNew] = useState(false);

//     // ✅ Edit address states
//     const [editingAddressId, setEditingAddressId] = useState(null);
//     const [editAddressForm, setEditAddressForm] = useState({});
//     const [addressActionLoading, setAddressActionLoading] = useState(false);

//     // ✅ New address features
//     const [addressType, setAddressType] = useState("home");
//     const [markAsDefault, setMarkAsDefault] = useState(false);
//     const [addressErrors, setAddressErrors] = useState({});

//     // ✅ Promo code states
//     const [promoCode, setPromoCode] = useState("");
//     const [promoApplied, setPromoApplied] = useState(false);
//     const [promoDiscount, setPromoDiscount] = useState(0);
//     const [promoError, setPromoError] = useState("");
//     const [promoData, setPromoData] = useState(null);

//     // ✅ Email notification state
//     const [emailSent, setEmailSent] = useState(false);
//     const [emailError, setEmailError] = useState(null);

//     // ✅ Razorpay state
//     const [razorpayLoaded, setRazorpayLoaded] = useState(false);

//     // ✅ Get user token and details
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user") || "{}");

//     // ✅ Constants
//     const MIN_FREE_SHIPPING_AMOUNT = 1000;
//     const DEFAULT_SHIPPING_CHARGE = 0;

//     // ==================== EFFECTS ====================

//     // ✅ Load Razorpay script
//     useEffect(() => {
//         const loadRazorpayScript = () => {
//             return new Promise((resolve) => {
//                 const script = document.createElement("script");
//                 script.src = "https://checkout.razorpay.com/v1/checkout.js";
//                 script.onload = () => {
//                     setRazorpayLoaded(true);
//                     resolve(true);
//                 };
//                 script.onerror = () => {
//                     console.error("Failed to load Razorpay SDK");
//                     resolve(false);
//                 };
//                 document.body.appendChild(script);
//             });
//         };

//         loadRazorpayScript();
//     }, []);

//     // ✅ Initialize checkout
//     useEffect(() => {
//         initializeCheckout();
//     }, [location]);

//     // ==================== INITIALIZATION FUNCTIONS ====================

//     const initializeCheckout = async () => {
//         setLoading(true);

//         try {
//             // ✅ Fetch user details from database
//             if (token && user.id) {
//                 await fetchUserDetails();
//                 await fetchSavedAddresses();
//             }

//             // ✅ Check if coming from "Buy Now" or "Cart"
//             if (location.state?.directBuy) {
//                 setCheckoutType("direct");
//                 await fetchProductDetails(location.state.product);
//             } else {
//                 setCheckoutType("cart");
//                 await fetchCartItems();
//             }

//         } catch (error) {
//             console.error("Checkout initialization error:", error);
//             showNotification("Failed to initialize checkout", "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ✅ Fetch complete user details from database
//     const fetchUserDetails = async () => {
//         try {
//             const response = await axios.get(
//                 `http://localhost:5000/api/users/${user.id}/details`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 setUserDetails(response.data.user);
//             }
//         } catch (error) {
//             console.error("Error fetching user details:", error);
//         }
//     };

//     // ✅ Fetch saved addresses for user
//     const fetchSavedAddresses = async () => {
//         try {
//             const response = await axios.get(
//                 `http://localhost:5000/api/users/${user.id}/addresses`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 setSavedAddresses(response.data.addresses || []);

//                 // Auto-select default address if exists
//                 const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
//                 if (defaultAddress) {
//                     handleSavedAddressSelect(defaultAddress);
//                 }
//             }
//         } catch (error) {
//             console.error("Error fetching saved addresses:", error);
//             setSavedAddresses([]);
//         }
//     };

//     // ==================== NOTIFICATION FUNCTION ====================

//     const showNotification = (message, type = "success") => {
//         // You can replace this with a proper toast notification
//         if (type === "success") {
//             alert(`✅ ${message}`);
//         } else {
//             alert(`❌ ${message}`);
//         }
//     };

//     // ==================== PRODUCT FUNCTIONS ====================

//     // ✅ Fetch product details
//     const fetchProductDetails = async (productData) => {
//         try {
//             const response = await axios.get(
//                 `http://localhost:5000/api/products/${productData.id}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             const product = response.data.product || response.data;
//             setProducts([{
//                 ...product,
//                 quantity: productData.quantity || 1,
//                 selectedSize: productData.selectedSize,
//                 selectedColor: productData.selectedColor,
//                 finalPrice: calculateFinalPrice(product),
//                 shipping_cost: product.shipping_cost || DEFAULT_SHIPPING_CHARGE,
//                 free_shipping: product.free_shipping || 0,
//                 tax_rate: product.tax_rate || 0,
//                 tax_amount: calculateTaxAmount(product)
//             }]);
//         } catch (error) {
//             console.error("Error fetching product details:", error);
//             setProducts([{
//                 ...productData,
//                 shipping_cost: productData.shipping_cost || DEFAULT_SHIPPING_CHARGE,
//                 free_shipping: productData.free_shipping || 0,
//                 tax_rate: productData.tax_rate || 0,
//                 tax_amount: calculateTaxAmount(productData),
//                 finalPrice: calculateFinalPrice(productData)
//             }]);
//         }
//     };

//     // ✅ Fetch cart items
//     const fetchCartItems = async () => {
//         if (!token) {
//             navigate("/login");
//             return;
//         }

//         try {
//             const response = await axios.get(
//                 `http://localhost:5000/api/cart/user/${user.id}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 const items = response.data.items || [];

//                 if (items.length === 0) {
//                     showNotification("Your cart is empty", "error");
//                     navigate("/");
//                     return;
//                 }

//                 // Process items with complete details
//                 const processedItems = await Promise.all(items.map(async (item) => {
//                     // Fetch full product details including images
//                     try {
//                         const productResponse = await axios.get(
//                             `http://localhost:5000/api/products/${item.product_id}`,
//                             {
//                                 headers: { Authorization: `Bearer ${token}` }
//                             }
//                         );
//                         const product = productResponse.data.product || productResponse.data;

//                         return {
//                             id: item.product_id,
//                             name: item.product_name,
//                             price: item.price,
//                             discount: item.discount,
//                             finalPrice: item.discount_price || item.final_price || item.price,
//                             quantity: item.quantity,
//                             selectedSize: item.size,
//                             selectedColor: item.color,
//                             shipping_cost: item.shipping_cost || DEFAULT_SHIPPING_CHARGE,
//                             free_shipping: item.free_shipping || 0,
//                             tax_rate: item.tax_rate || 0,
//                             tax_amount: calculateTaxAmount(item),
//                             sku: product.sku || item.sku,
//                             brand: product.brand || item.brand,
//                             material: product.material,
//                             images: product.images || (product.image ? [product.image] : []),
//                             description: product.description
//                         };
//                     } catch (error) {
//                         // Fallback to cart data
//                         return {
//                             id: item.product_id,
//                             name: item.product_name,
//                             price: item.price,
//                             discount: item.discount,
//                             finalPrice: item.discount_price || item.final_price || item.price,
//                             quantity: item.quantity,
//                             selectedSize: item.size,
//                             selectedColor: item.color,
//                             shipping_cost: item.shipping_cost || DEFAULT_SHIPPING_CHARGE,
//                             free_shipping: item.free_shipping || 0,
//                             tax_rate: item.tax_rate || 0,
//                             tax_amount: calculateTaxAmount(item),
//                             sku: item.sku,
//                             brand: item.brand,
//                             material: item.material,
//                             images: item.images || (item.image ? [item.image] : [])
//                         };
//                     }
//                 }));

//                 setProducts(processedItems);
//             }
//         } catch (error) {
//             console.error("Error fetching cart:", error);
//             showNotification("Failed to load cart items", "error");
//             navigate("/cart");
//         }
//     };

//     // ✅ Calculate final price with discount
//     const calculateFinalPrice = (product) => {
//         if (!product) return 0;
//         const price = parseFloat(product.price) || 0;
//         const discount = parseFloat(product.discount) || 0;

//         if (discount > 0) {
//             return parseFloat((price - (price * discount / 100)).toFixed(2));
//         }
//         return price;
//     };

//     // ✅ Calculate tax amount for a product
//     const calculateTaxAmount = (product) => {
//         if (!product.tax_rate || product.tax_rate === 0) return 0;
//         const price = product.finalPrice || calculateFinalPrice(product) || product.price || 0;
//         const taxRate = parseFloat(product.tax_rate) / 100;
//         return parseFloat((price * taxRate).toFixed(2));
//     };

//     // ==================== CALCULATE TOTALS WITH PROMO ====================

//     const calculateTotals = () => {
//         const subtotal = products.reduce((total, product) => {
//             const price = product.finalPrice || product.price || 0;
//             const quantity = product.quantity || 1;
//             return total + (parseFloat(price) * parseInt(quantity));
//         }, 0);

//         const tax = products.reduce((total, product) => {
//             if (product.tax_rate && product.tax_rate > 0) {
//                 const price = product.finalPrice || product.price || 0;
//                 const quantity = product.quantity || 1;
//                 const taxRate = parseFloat(product.tax_rate) / 100;
//                 return total + (parseFloat(price) * parseInt(quantity) * taxRate);
//             }
//             return total;
//         }, 0);

//         let shipping = 0;
//         let hasFreeShipping = false;
//         let shippingMessage = "";

//         const individualShippingCost = products.reduce((total, product) => {
//             if (product.shipping_cost && product.shipping_cost > 0) {
//                 return total + (parseFloat(product.shipping_cost) * (product.quantity || 1));
//             }
//             return total;
//         }, 0);

//         const hasFreeShippingProduct = products.some(p => p.free_shipping === 1);
//         const qualifiesForFreeShipping = subtotal >= MIN_FREE_SHIPPING_AMOUNT;

//         if (hasFreeShippingProduct) {
//             shipping = 0;
//             hasFreeShipping = true;
//             shippingMessage = "Free shipping on selected products";
//         } else if (qualifiesForFreeShipping) {
//             shipping = 0;
//             hasFreeShipping = true;
//             shippingMessage = "Order qualifies for FREE shipping!";
//         } else {
//             shipping = individualShippingCost > 0 ? individualShippingCost : 0;
//             hasFreeShipping = false;
//             shippingMessage = shipping > 0 ? "Standard shipping charges apply" : "";
//         }

//         // Apply promo discount
//         const discountAmount = promoApplied ? (subtotal * promoDiscount / 100) : 0;
//         const total = subtotal + shipping + tax - discountAmount;

//         return {
//             subtotal: parseFloat(subtotal.toFixed(2)),
//             shipping: parseFloat(shipping.toFixed(2)),
//             tax: parseFloat(tax.toFixed(2)),
//             discount: parseFloat(discountAmount.toFixed(2)),
//             total: parseFloat(total.toFixed(2)),
//             hasFreeShipping,
//             shippingMessage,
//             hasTax: tax > 0,
//             hasShipping: shipping > 0,
//             hasDiscount: discountAmount > 0,
//             itemCount: products.length
//         };
//     };

//     // ==================== PROMO CODE FUNCTIONS ====================

//     const handleApplyPromo = async () => {
//         if (!promoCode.trim()) {
//             setPromoError("Please enter a promo code");
//             return;
//         }

//         try {
//             const response = await axios.post("http://localhost:5000/api/promo/validate", {
//                 promoCode: promoCode
//             });

//             if (response.data.valid) {
//                 setPromoApplied(true);
//                 setPromoDiscount(response.data.promo.discount);
//                 setPromoData(response.data.promo);
//                 setPromoError("");
//                 showNotification("Promo code applied successfully!", "success");
//             } else {
//                 setPromoError("Invalid or expired promo code");
//             }
//         } catch (error) {
//             setPromoError("Error applying promo code");
//             console.error("Promo error:", error);
//         }
//     };

//     const handleRemovePromo = () => {
//         setPromoApplied(false);
//         setPromoDiscount(0);
//         setPromoCode("");
//         setPromoData(null);
//         showNotification("Promo code removed", "success");
//     };

//     // ==================== ADVANCED ADDRESS MANAGEMENT FUNCTIONS ====================

//     // ✅ Validate individual field
//     const validateAddressField = (fieldName, value) => {
//         const errors = { ...addressErrors };

//         switch (fieldName) {
//             case 'phone':
//                 const phoneRegex = /^[6-9]\d{9}$/;
//                 if (!phoneRegex.test(value.replace(/\D/g, ''))) {
//                     errors.phone = "Please enter a valid 10-digit mobile number starting with 6-9";
//                 } else {
//                     delete errors.phone;
//                 }
//                 break;

//             case 'email':
//                 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                 if (!emailRegex.test(value)) {
//                     errors.email = "Please enter a valid email address";
//                 } else {
//                     delete errors.email;
//                 }
//                 break;

//             case 'postalCode':
//                 const pincodeRegex = /^\d{6}$/;
//                 if (!pincodeRegex.test(value.replace(/\D/g, ''))) {
//                     errors.postalCode = "Please enter a valid 6-digit PIN code";
//                 } else {
//                     delete errors.postalCode;
//                 }
//                 break;

//             default:
//                 break;
//         }

//         setAddressErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     // ✅ Delete address
//     const handleDeleteAddress = async (addressId) => {
//         if (!window.confirm("Are you sure you want to delete this address?")) {
//             return;
//         }

//         setAddressActionLoading(true);
//         try {
//             const response = await axios.delete(
//                 `http://localhost:5000/api/users/${user.id}/addresses/${addressId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 await fetchSavedAddresses();

//                 // If deleted address was selected, clear selection
//                 if (selectedSavedAddress === addressId) {
//                     setSelectedSavedAddress(null);
//                 }

//                 showNotification("Address deleted successfully!", "success");
//             }
//         } catch (error) {
//             console.error("Error deleting address:", error);
//             showNotification("Failed to delete address", "error");
//         } finally {
//             setAddressActionLoading(false);
//         }
//     };

//     // ✅ Select saved address
//     const handleSavedAddressSelect = (address) => {
//         setSelectedSavedAddress(address.id);
//         setIsAddingNewAddress(false);
//         setEditingAddressId(null);

//         // Fill shipping address with selected address
//         setShippingAddress({
//             fullName: address.fullName || address.full_name || userDetails?.name || "",
//             address: address.addressLine || address.address_line || address.address || "",
//             city: address.city || "",
//             state: address.state || "",
//             postalCode: address.postalCode || address.postal_code || "",
//             country: address.country || "India",
//             phone: address.phone || userDetails?.phone || "",
//             email: address.email || userDetails?.email || shippingAddress.email || ""
//         });

//         setSaveAddressAsNew(false);
//     };

//     // ✅ Add new address click
//     const handleAddNewAddressClick = () => {
//         setIsAddingNewAddress(true);
//         setSelectedSavedAddress(null);
//         setEditingAddressId(null);
//         setAddressType("home");
//         setMarkAsDefault(false);
//         setAddressErrors({});

//         // Pre-fill with user details if available
//         setShippingAddress({
//             fullName: userDetails?.name || "",
//             address: "",
//             city: "",
//             state: "",
//             postalCode: "",
//             country: "India",
//             phone: userDetails?.phone || "",
//             email: userDetails?.email || ""
//         });
//     };

//     // ✅ Edit address click
//     const handleEditAddressClick = (address) => {
//         setEditingAddressId(address.id);
//         setEditAddressForm({
//             fullName: address.fullName || address.full_name || "",
//             address: address.addressLine || address.address_line || address.address || "",
//             city: address.city || "",
//             state: address.state || "",
//             postalCode: address.postalCode || address.postal_code || "",
//             country: address.country || "India",
//             phone: address.phone || "",
//             addressType: address.addressType || address.address_type || "home",
//             email: address.email || ""
//         });
//     };

//     // ✅ Cancel edit address
//     const handleCancelEditAddress = () => {
//         setEditingAddressId(null);
//         setEditAddressForm({});
//     };

//     // ✅ Save edited address
//     const handleSaveEditedAddress = async (addressId) => {
//         setAddressActionLoading(true);
//         try {
//             const updatePayload = {
//                 fullName: editAddressForm.fullName,
//                 address: editAddressForm.address,
//                 city: editAddressForm.city,
//                 state: editAddressForm.state,
//                 postalCode: editAddressForm.postalCode,
//                 country: editAddressForm.country,
//                 phone: editAddressForm.phone,
//                 email: editAddressForm.email,
//                 addressType: editAddressForm.addressType || 'home'
//             };

//             console.log("Updating address with payload:", updatePayload);

//             const response = await axios.put(
//                 `http://localhost:5000/api/users/${user.id}/addresses/${addressId}`,
//                 updatePayload,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 await fetchSavedAddresses();
//                 setEditingAddressId(null);
//                 setEditAddressForm({});
//                 showNotification("Address updated successfully!", "success");
//             }
//         } catch (error) {
//             console.error("Error updating address:", error);
//             if (error.response) {
//                 showNotification(`Failed to update address: ${error.response.data.message || 'Unknown error'}`, "error");
//             } else {
//                 showNotification("Failed to update address", "error");
//             }
//         } finally {
//             setAddressActionLoading(false);
//         }
//     };

//     // ✅ Set default address
//     const handleSetDefaultAddress = async (addressId) => {
//         try {
//             const response = await axios.put(
//                 `http://localhost:5000/api/users/${user.id}/addresses/${addressId}/default`,
//                 {},
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 await fetchSavedAddresses();
//                 showNotification("Default address updated!", "success");
//             }
//         } catch (error) {
//             console.error("Error setting default address:", error);
//             showNotification("Failed to set default address", "error");
//         }
//     };

//     // ✅ Continue with saved address
//     const handleContinueWithSavedAddress = (e) => {
//         e.preventDefault();

//         if (!selectedSavedAddress) {
//             showNotification("Please select an address", "error");
//             return;
//         }

//         setStep(2);
//     };

//     // ✅ Cancel new address
//     const handleCancelNewAddress = () => {
//         setIsAddingNewAddress(false);
//         setSelectedSavedAddress(null);
//         setAddressErrors({});

//         // If there are saved addresses, select the default one
//         if (savedAddresses.length > 0) {
//             const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
//             handleSavedAddressSelect(defaultAddress);
//         }
//     };

//     // ✅ Save address to profile
//     const saveAddressToProfile = async (addressData) => {
//         if (!token || !user.id) {
//             console.log("User not logged in, skipping address save");
//             return false;
//         }

//         try {
//             const addressPayload = {
//                 fullName: addressData.fullName,
//                 address: addressData.address,
//                 city: addressData.city,
//                 state: addressData.state,
//                 postalCode: addressData.postalCode,
//                 country: addressData.country || "India",
//                 phone: addressData.phone,
//                 email: addressData.email,
//                 addressType: addressData.addressType || addressType || 'home',
//                 isDefault: addressData.isDefault || markAsDefault || savedAddresses.length === 0
//             };

//             console.log("Saving address to profile:", addressPayload);

//             const response = await axios.post(
//                 `http://localhost:5000/api/users/${user.id}/addresses`,
//                 addressPayload,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             if (response.data.success) {
//                 console.log("Address saved successfully");
//                 setMarkAsDefault(false);
//                 setAddressType("home");
//                 return true;
//             } else {
//                 console.error("Failed to save address:", response.data.message);
//                 return false;
//             }
//         } catch (error) {
//             console.error("Error saving address to profile:", error);
//             return false;
//         }
//     };

//     // ==================== ADDRESS FORM SUBMIT ====================

//     const handleAddressSubmit = async (e) => {
//         e.preventDefault();

//         // Trim all fields
//         const trimmedAddress = {
//             fullName: shippingAddress.fullName?.trim() || "",
//             address: shippingAddress.address?.trim() || "",
//             city: shippingAddress.city?.trim() || "",
//             state: shippingAddress.state?.trim() || "",
//             postalCode: shippingAddress.postalCode?.trim() || "",
//             phone: shippingAddress.phone?.trim() || "",
//             email: shippingAddress.email?.trim() || "",
//             country: shippingAddress.country || "India",
//             addressType: addressType,
//             isDefault: markAsDefault
//         };

//         // Validate all fields
//         let isValid = true;
//         const errors = {};

//         const requiredFields = [
//             { field: "fullName", label: "Full Name" },
//             { field: "address", label: "Address" },
//             { field: "city", label: "City" },
//             { field: "state", label: "State" },
//             { field: "postalCode", label: "Postal Code" },
//             { field: "phone", label: "Phone" },
//             { field: "email", label: "Email" }
//         ];

//         requiredFields.forEach(f => {
//             if (!trimmedAddress[f.field]) {
//                 errors[f.field] = `${f.label} is required`;
//                 isValid = false;
//             }
//         });

//         const phoneRegex = /^[6-9]\d{9}$/;
//         if (trimmedAddress.phone && !phoneRegex.test(trimmedAddress.phone.replace(/\D/g, ''))) {
//             errors.phone = "Please enter a valid 10-digit Indian mobile number starting with 6-9";
//             isValid = false;
//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (trimmedAddress.email && !emailRegex.test(trimmedAddress.email)) {
//             errors.email = "Please enter a valid email address";
//             isValid = false;
//         }

//         const pincodeRegex = /^\d{6}$/;
//         if (trimmedAddress.postalCode && !pincodeRegex.test(trimmedAddress.postalCode.replace(/\D/g, ''))) {
//             errors.postalCode = "Please enter a valid 6-digit PIN code";
//             isValid = false;
//         }

//         setAddressErrors(errors);

//         if (!isValid) {
//             showNotification("Please fix the errors in the form", "error");
//             return;
//         }

//         setShippingAddress(trimmedAddress);
//         setIsAddingNewAddress(true);

//         try {
//             if (saveAddressAsNew && token) {
//                 const addressSaved = await saveAddressToProfile(trimmedAddress);

//                 if (addressSaved) {
//                     showNotification("Address saved successfully to your profile!", "success");
//                     setSaveAddressAsNew(false);
//                     await fetchSavedAddresses();
//                 }
//             }

//             if (billingSameAsShipping) {
//                 setBillingAddress({ ...trimmedAddress });
//             }

//             setIsAddingNewAddress(false);
//             setStep(2);

//         } catch (error) {
//             console.error("Error in address submission:", error);
//             showNotification("There was an error processing your address. Please try again.", "error");
//         } finally {
//             setIsAddingNewAddress(false);
//         }
//     };

//     // ==================== EMAIL NOTIFICATION FUNCTION ====================

//     const sendOrderConfirmationEmail = async (orderData) => {
//         try {
//             console.log("📧 Sending order confirmation email...");

//             const emailPayload = {
//                 to: orderData.shippingAddress.email || userDetails?.email,
//                 userName: orderData.shippingAddress.fullName || userDetails?.name,
//                 orderNumber: orderData.orderNumber,
//                 orderDate: new Date().toLocaleDateString('en-IN', {
//                     day: 'numeric',
//                     month: 'long',
//                     year: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 }),
//                 products: products.map(p => ({
//                     name: p.name,
//                     quantity: p.quantity,
//                     price: p.finalPrice || p.price,
//                     total: ((p.finalPrice || p.price) * (p.quantity || 1)).toFixed(2),
//                     image: p.images?.[0] || p.image || '/images/placeholder-product.jpg',
//                     sku: p.sku,
//                     size: p.selectedSize,
//                     color: p.selectedColor
//                 })),
//                 subtotal: orderData.subtotal,
//                 shipping: orderData.shipping,
//                 tax: orderData.tax,
//                 discount: orderData.discount,
//                 total: orderData.total,
//                 paymentMethod: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)',
//                 paymentStatus: orderData.paymentStatus,
//                 shippingAddress: orderData.shippingAddress,
//                 billingAddress: orderData.billingAddress,
//                 orderNote: orderData.orderNote,
//                 estimatedDelivery: getEstimatedDeliveryDate(),
//                 trackingUrl: `${window.location.origin}/orders/${orderData.orderId}`,
//                 supportEmail: 'support@pankhudi.com',
//                 supportPhone: '+91 12345 67890'
//             };

//             const response = await axios.post(
//                 'http://localhost:5000/api/email/send-order-confirmation',
//                 emailPayload,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             if (response.data.success) {
//                 console.log("✅ Order confirmation email sent successfully!");
//                 setEmailSent(true);
//                 setEmailError(null);
//                 return true;
//             } else {
//                 throw new Error(response.data.message || "Failed to send email");
//             }
//         } catch (error) {
//             console.error("❌ Error sending order confirmation email:", error);
//             setEmailError(error.message);
//             return false;
//         }
//     };

//     const getEstimatedDeliveryDate = () => {
//         const date = new Date();
//         date.setDate(date.getDate() + 5); // Add 5 days
//         return date.toLocaleDateString('en-IN', {
//             day: 'numeric',
//             month: 'long',
//             year: 'numeric'
//         });
//     };

//     // ==================== PAYMENT FUNCTIONS ====================

//     const handlePaymentSelect = (method) => {
//         setPaymentMethod(method);

//         if (method === "cod") {
//             setStep(3);
//         } else if (method === "razorpay") {
//             handleRazorpayPayment();
//         }
//     };

//     const handleRazorpayPayment = async () => {
//         if (!razorpayLoaded) {
//             showNotification("Payment gateway is loading. Please try again.", "error");
//             return;
//         }

//         setPlacingOrder(true);

//         try {
//             const totals = calculateTotals();

//             const response = await axios.post(
//                 "http://localhost:5000/api/payment/create-order",
//                 {
//                     amount: Math.round(totals.total * 100),
//                     currency: "INR",
//                     receipt: `receipt_${Date.now()}`,
//                     notes: {
//                         userId: user.id,
//                         checkoutType: checkoutType,
//                         email: shippingAddress.email || userDetails?.email
//                     }
//                 },
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (!response.data.success) {
//                 throw new Error(response.data.message || "Failed to create payment order");
//             }

//             const orderData = response.data.order;

//             const options = {
//                 key: response.data.key_id,
//                 amount: orderData.amount,
//                 currency: orderData.currency,
//                 name: "Pankhudi",
//                 description: `Payment for ${products.length} item(s)`,
//                 order_id: orderData.id,
//                 handler: async (paymentResponse) => {
//                     try {
//                         const verifyResponse = await axios.post(
//                             "http://localhost:5000/api/payment/verify",
//                             {
//                                 razorpay_payment_id: paymentResponse.razorpay_payment_id,
//                                 razorpay_order_id: paymentResponse.razorpay_order_id,
//                                 razorpay_signature: paymentResponse.razorpay_signature
//                             },
//                             {
//                                 headers: { Authorization: `Bearer ${token}` }
//                             }
//                         );

//                         if (verifyResponse.data.success) {
//                             await placeOrder("razorpay", paymentResponse.razorpay_payment_id, "completed");
//                         } else {
//                             showNotification("Payment verification failed. Please try again.", "error");
//                         }
//                     } catch (error) {
//                         console.error("Payment verification error:", error);
//                         showNotification("Payment verification failed. Your order will be reviewed.", "error");
//                         await placeOrder("razorpay", paymentResponse.razorpay_payment_id, "pending");
//                     }
//                 },
//                 prefill: {
//                     name: shippingAddress.fullName || userDetails?.name,
//                     email: shippingAddress.email || userDetails?.email,
//                     contact: shippingAddress.phone || userDetails?.phone
//                 },
//                 notes: {
//                     address: shippingAddress.address,
//                     city: shippingAddress.city,
//                     state: shippingAddress.state,
//                     pincode: shippingAddress.postalCode
//                 },
//                 theme: {
//                     color: "#FF6B6B"
//                 },
//                 modal: {
//                     ondismiss: function () {
//                         setPlacingOrder(false);
//                     }
//                 }
//             };

//             const razorpay = new window.Razorpay(options);
//             razorpay.open();

//         } catch (error) {
//             console.error("Razorpay payment error:", error);
//             showNotification("Failed to initialize payment. Please try again or choose Cash on Delivery.", "error");
//             setPlacingOrder(false);
//         }
//     };

//     // ==================== ORDER PLACEMENT WITH EMAIL ====================

//     const placeOrder = async (paymentMethodType = paymentMethod, paymentId = null, paymentStatus = "completed") => {
//         try {
//             const totals = calculateTotals();

//             const orderData = {
//                 userId: user.id,
//                 shippingAddress,
//                 billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
//                 paymentMethod: paymentMethodType,
//                 paymentId,
//                 paymentStatus,
//                 subtotal: totals.subtotal,
//                 taxAmount: totals.tax,
//                 shippingCharge: totals.shipping,
//                 discountAmount: totals.discount,
//                 totalAmount: totals.total,
//                 orderNote,
//                 items: products.map(product => ({
//                     productId: product.id,
//                     product_name: product.name,
//                     quantity: product.quantity || 1,
//                     price: product.finalPrice || product.price,
//                     size: product.selectedSize,
//                     color: product.selectedColor,
//                     shipping_cost: product.shipping_cost,
//                     free_shipping: product.free_shipping,
//                     tax_rate: product.tax_rate || 0,
//                     tax_amount: product.tax_amount || 0,
//                     sku: product.sku,
//                     image: product.images?.[0] || product.image
//                 }))
//             };

//             let endpoint = "/api/orders/create";
//             if (checkoutType === "direct") {
//                 endpoint = "/api/orders/direct-buy";
//                 orderData.productId = products[0].id;
//             }

//             console.log("📦 Placing order with data:", orderData);

//             const response = await axios.post(
//                 `http://localhost:5000${endpoint}`,
//                 orderData,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );

//             if (response.data.success) {
//                 // ✅ Store order details
//                 setOrderDetails({
//                     orderId: response.data.orderId,
//                     orderNumber: response.data.orderNumber,
//                     total: totals.total,
//                     ...response.data
//                 });

//                 // ✅ Send order confirmation email
//                 const emailData = {
//                     orderId: response.data.orderId,
//                     orderNumber: response.data.orderNumber,
//                     shippingAddress,
//                     billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
//                     paymentMethod: paymentMethodType,
//                     paymentStatus,
//                     subtotal: totals.subtotal,
//                     shipping: totals.shipping,
//                     tax: totals.tax,
//                     discount: totals.discount,
//                     total: totals.total,
//                     orderNote
//                 };

//                 const emailSent = await sendOrderConfirmationEmail(emailData);

//                 // ✅ Clear cart if it was cart checkout
//                 if (checkoutType === "cart") {
//                     try {
//                         await axios.delete(
//                             `http://localhost:5000/api/cart/clear/${user.id}`,
//                             {
//                                 headers: { Authorization: `Bearer ${token}` }
//                             }
//                         );
//                         localStorage.removeItem('pankhudiCart');
//                     } catch (cartError) {
//                         console.error("Error clearing cart:", cartError);
//                     }
//                 }

//                 // ✅ Show success message
//                 setOrderSuccess(true);
//                 setOrderPlaced(true);

//                 // ✅ Navigate to confirmation after delay
//                 setTimeout(() => {
//                     navigate("/order-confirmation", {
//                         state: {
//                             orderId: response.data.orderId,
//                             orderNumber: response.data.orderNumber,
//                             totalAmount: totals.total,
//                             fromConfirmation: true,
//                             paymentMethod: paymentMethodType,
//                             orderData: response.data.order,
//                             emailSent: emailSent,
//                             emailError: emailError
//                         }
//                     });
//                 }, 2000);

//             } else {
//                 throw new Error(response.data.message || "Failed to place order");
//             }
//         } catch (error) {
//             console.error("Order placement error:", error);
//             showNotification(error.response?.data?.message || error.message || "Failed to place order", "error");
//             throw error;
//         } finally {
//             setPlacingOrder(false);
//         }
//     };

//     const handlePlaceOrder = async () => {
//         if (!token) {
//             showNotification("Please login to place order", "error");
//             navigate("/login");
//             return;
//         }

//         if (paymentMethod === "cod") {
//             setPlacingOrder(true);
//             await placeOrder("cod");
//         }
//     };

//     // ==================== RENDER FUNCTIONS ====================

//     const renderProductSummary = () => {
//         const totals = calculateTotals();

//         return (
//             <div className="checkout-product-summary">
//                 <div className="summary-header">
//                     <h3>
//                         {checkoutType === "direct" ? "Product Details" : `Order Summary (${products.length} items)`}
//                     </h3>
//                     <span className="edit-link" onClick={() => navigate(checkoutType === "cart" ? "/cart" : -1)}>
//                         {checkoutType === "cart" ? "Edit Cart" : "Change Product"}
//                     </span>
//                 </div>

//                 <div className="checkout-products-list">
//                     {products.map((product, index) => (
//                         <div key={index} className="checkout-product-item">
//                             <div className="product-image-section">
//                                 <img
//                                     src={product.images?.[0] || product.image || "/images/placeholder-product.jpg"}
//                                     alt={product.name}
//                                     onError={(e) => {
//                                         e.target.src = "/images/placeholder-product.jpg";
//                                     }}
//                                 />
//                                 <span className="product-quantity">x{product.quantity || 1}</span>
//                             </div>
//                             <div className="checkout-product-info">
//                                 <h4>{product.name}</h4>
//                                 <div className="product-details-list">
//                                     {product.sku && <span>SKU: {product.sku}</span>}
//                                     {product.selectedSize && <span>Size: {product.selectedSize}</span>}
//                                     {product.selectedColor && <span>Color: {product.selectedColor}</span>}
//                                 </div>
//                                 <div className="product-price">
//                                     ₹{(product.finalPrice || product.price).toFixed(2)}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Promo Code Section */}
//                 <div className="promo-code-section">
//                     <h4>🎟️ Have a promo code?</h4>
//                     <div className="promo-input-group">
//                         <input
//                             type="text"
//                             placeholder="Enter promo code"
//                             value={promoCode}
//                             onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
//                             disabled={promoApplied}
//                         />
//                         {!promoApplied ? (
//                             <button
//                                 onClick={handleApplyPromo}
//                                 className="btn-promo"
//                             >
//                                 Apply
//                             </button>
//                         ) : (
//                             <button
//                                 onClick={handleRemovePromo}
//                                 className="btn-promo remove"
//                             >
//                                 Remove
//                             </button>
//                         )}
//                     </div>
//                     {promoError && <p className="promo-error">{promoError}</p>}
//                     {promoApplied && promoData && (
//                         <div className="promo-success">
//                             <p>🎉 {promoDiscount}% discount applied!</p>
//                             {promoData.maxDiscount && (
//                                 <p className="promo-note">Max discount: ₹{promoData.maxDiscount}</p>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <div className="checkout-price-breakdown">
//                     <div className="price-row" title="Price before tax and shipping">
//                         <span>Subtotal ({totals.itemCount} items)</span>
//                         <span>₹{totals.subtotal.toFixed(2)}</span>
//                     </div>

//                     {totals.hasDiscount && (
//                         <div className="price-row discount-row" title="Promo code discount">
//                             <span>Discount ({promoDiscount}%)</span>
//                             <span>-₹{totals.discount.toFixed(2)}</span>
//                         </div>
//                     )}

//                     {totals.hasShipping && (
//                         <div className="price-row" title={totals.shippingMessage}>
//                             <span>Shipping</span>
//                             <span>
//                                 {totals.hasFreeShipping ? (
//                                     <span className="free-shipping">FREE</span>
//                                 ) : (
//                                     `₹${totals.shipping.toFixed(2)}`
//                                 )}
//                             </span>
//                         </div>
//                     )}

//                     {totals.hasFreeShipping && (
//                         <div className="free-shipping-badge">
//                             🚚 {totals.shippingMessage}
//                         </div>
//                     )}

//                     {totals.hasTax && (
//                         <div className="price-row" title="Goods and Services Tax">
//                             <span>Tax (GST)</span>
//                             <span>₹{totals.tax.toFixed(2)}</span>
//                         </div>
//                     )}

//                     <div className="price-row total-row">
//                         <strong>Total</strong>
//                         <strong>₹{totals.total.toFixed(2)}</strong>
//                     </div>
//                 </div>

//                 {/* Email Status */}
//                 {orderPlaced && (
//                     <div className={`email-status ${emailSent ? 'success' : 'pending'}`}>
//                         {emailSent ? (
//                             <p>✅ Order confirmation email sent to {shippingAddress.email}</p>
//                         ) : (
//                             <p>⏳ Sending order confirmation email...</p>
//                         )}
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const renderUserDetails = () => {
//         if (!userDetails) return null;

//         return (
//             <div className="user-details-section">
//                 <h3>Your Account</h3>
//                 <div className="user-details-grid">
//                     <div className="user-detail">
//                         <span className="detail-label">Name:</span>
//                         <span className="detail-value">{userDetails.name}</span>
//                     </div>
//                     <div className="user-detail">
//                         <span className="detail-label">Email:</span>
//                         <span className="detail-value">{userDetails.email}</span>
//                     </div>
//                     {userDetails.phone && (
//                         <div className="user-detail">
//                             <span className="detail-label">Phone:</span>
//                             <span className="detail-value">{userDetails.phone}</span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const renderAddressStep = () => {
//         return (
//             <div className="address-form-section">
//                 <h2>Shipping Address</h2>

//                 <div className="address-info-message">
//                     <span className="info-icon">ℹ️</span>
//                     <span className="info-text">
//                         {savedAddresses.length > 0
//                             ? "Please select an address from your saved addresses or add a new one."
//                             : "Please add your shipping address below."}
//                     </span>
//                 </div>

//                 {/* Saved Addresses Section */}
//                 {savedAddresses.length > 0 && !isAddingNewAddress && (
//                     <>
//                         <div className="saved-addresses">
//                             <div className="saved-addresses-header">
//                                 <h4>Your Saved Addresses</h4>
//                                 <span className="address-count">
//                                     {savedAddresses.length} {savedAddresses.length === 1 ? 'Address' : 'Addresses'}
//                                     {savedAddresses.filter(a => a.isDefault).length > 0 && (
//                                         <span className="default-count">
//                                             ({savedAddresses.filter(a => a.isDefault).length} Default)
//                                         </span>
//                                     )}
//                                 </span>
//                             </div>

//                             <div className="address-list">
//                                 {savedAddresses.map((address) => (
//                                     <div key={address.id} className="address-item-wrapper">
//                                         {editingAddressId === address.id ? (
//                                             <div className="address-edit-form">
//                                                 <h5>Edit Address</h5>
//                                                 <div className="form-group">
//                                                     <label>Full Name</label>
//                                                     <input
//                                                         type="text"
//                                                         value={editAddressForm.fullName || ''}
//                                                         onChange={(e) => setEditAddressForm({
//                                                             ...editAddressForm,
//                                                             fullName: e.target.value
//                                                         })}
//                                                     />
//                                                 </div>
//                                                 <div className="form-group">
//                                                     <label>Address</label>
//                                                     <textarea
//                                                         value={editAddressForm.address || ''}
//                                                         onChange={(e) => setEditAddressForm({
//                                                             ...editAddressForm,
//                                                             address: e.target.value
//                                                         })}
//                                                         rows="2"
//                                                     />
//                                                 </div>
//                                                 <div className="form-row">
//                                                     <div className="form-group">
//                                                         <label>City</label>
//                                                         <input
//                                                             type="text"
//                                                             value={editAddressForm.city || ''}
//                                                             onChange={(e) => setEditAddressForm({
//                                                                 ...editAddressForm,
//                                                                 city: e.target.value
//                                                             })}
//                                                         />
//                                                     </div>
//                                                     <div className="form-group">
//                                                         <label>State</label>
//                                                         <input
//                                                             type="text"
//                                                             value={editAddressForm.state || ''}
//                                                             onChange={(e) => setEditAddressForm({
//                                                                 ...editAddressForm,
//                                                                 state: e.target.value
//                                                             })}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                                 <div className="form-row">
//                                                     <div className="form-group">
//                                                         <label>Postal Code</label>
//                                                         <input
//                                                             type="text"
//                                                             value={editAddressForm.postalCode || ''}
//                                                             onChange={(e) => setEditAddressForm({
//                                                                 ...editAddressForm,
//                                                                 postalCode: e.target.value
//                                                             })}
//                                                         />
//                                                     </div>
//                                                     <div className="form-group">
//                                                         <label>Phone</label>
//                                                         <input
//                                                             type="tel"
//                                                             value={editAddressForm.phone || ''}
//                                                             onChange={(e) => setEditAddressForm({
//                                                                 ...editAddressForm,
//                                                                 phone: e.target.value
//                                                             })}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                                 <div className="form-group">
//                                                     <label>Email</label>
//                                                     <input
//                                                         type="email"
//                                                         value={editAddressForm.email || ''}
//                                                         onChange={(e) => setEditAddressForm({
//                                                             ...editAddressForm,
//                                                             email: e.target.value
//                                                         })}
//                                                     />
//                                                 </div>
//                                                 <div className="form-group">
//                                                     <label>Address Type</label>
//                                                     <select
//                                                         value={editAddressForm.addressType || 'home'}
//                                                         onChange={(e) => setEditAddressForm({
//                                                             ...editAddressForm,
//                                                             addressType: e.target.value
//                                                         })}
//                                                     >
//                                                         <option value="home">Home</option>
//                                                         <option value="office">Office</option>
//                                                         <option value="other">Other</option>
//                                                     </select>
//                                                 </div>
//                                                 <div className="edit-actions">
//                                                     <button
//                                                         className="btn-save"
//                                                         onClick={() => handleSaveEditedAddress(address.id)}
//                                                         disabled={addressActionLoading}
//                                                     >
//                                                         {addressActionLoading ? "Saving..." : "Save Changes"}
//                                                     </button>
//                                                     <button
//                                                         className="btn-cancel"
//                                                         onClick={handleCancelEditAddress}
//                                                         disabled={addressActionLoading}
//                                                     >
//                                                         Cancel
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div
//                                                 className={`address-card ${selectedSavedAddress === address.id ? "selected" : ""}`}
//                                                 onClick={() => handleSavedAddressSelect(address)}
//                                             >
//                                                 <div className="address-card-header">
//                                                     <div className="address-type-section">
//                                                         <span className={`address-type-badge ${address.addressType || address.address_type || 'home'}`}>
//                                                             {address.addressType || address.address_type || "Home"}
//                                                         </span>
//                                                         {address.isDefault && (
//                                                             <span className="default-badge">⭐ DEFAULT</span>
//                                                         )}
//                                                     </div>
//                                                     <div className="address-actions">
//                                                         <button
//                                                             className="address-action-btn edit-btn"
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 handleEditAddressClick(address);
//                                                             }}
//                                                             title="Edit address"
//                                                             disabled={addressActionLoading}
//                                                         >
//                                                             ✏️
//                                                         </button>
//                                                         {!address.isDefault && (
//                                                             <button
//                                                                 className="address-action-btn default-btn"
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleSetDefaultAddress(address.id);
//                                                                 }}
//                                                                 title="Set as default"
//                                                                 disabled={addressActionLoading}
//                                                             >
//                                                                 ⭐
//                                                             </button>
//                                                         )}
//                                                         <button
//                                                             className="address-action-btn delete-btn"
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 handleDeleteAddress(address.id);
//                                                             }}
//                                                             title="Delete address"
//                                                             disabled={addressActionLoading}
//                                                         >
//                                                             🗑️
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                                 <div className="address-card-body">
//                                                     <p className="address-name"><strong>{address.fullName || address.full_name}</strong></p>
//                                                     <p className="address-line">{address.addressLine || address.address_line || address.address}</p>
//                                                     <p className="address-city-state">{address.city}, {address.state} - {address.postalCode || address.postal_code}</p>
//                                                     <p className="address-country">{address.country}</p>
//                                                     {address.phone && <p className="address-phone">📞 {address.phone}</p>}
//                                                     {address.email && <p className="address-email">✉️ {address.email}</p>}
//                                                 </div>
//                                                 {selectedSavedAddress === address.id && (
//                                                     <div className="address-selected-indicator">
//                                                         <span className="selected-check">✓</span> Selected
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>

//                             {selectedSavedAddress && !editingAddressId && (
//                                 <div className="selected-address-actions">
//                                     <button
//                                         className="btn-primary btn-large continue-btn"
//                                         onClick={handleContinueWithSavedAddress}
//                                     >
//                                         Continue to Payment
//                                     </button>
//                                     <p className="address-confirm-message">
//                                         ✓ Address selected successfully
//                                     </p>
//                                 </div>
//                             )}

//                             <div className="or-divider">
//                                 <span>OR</span>
//                             </div>

//                             <button
//                                 className="pankhudi-add-address-btn"
//                                 onClick={handleAddNewAddressClick}
//                             >
//                                 + Add New Address
//                             </button>
//                         </div>
//                     </>
//                 )}

//                 {(isAddingNewAddress || savedAddresses.length === 0) && (
//                     <form onSubmit={handleAddressSubmit} className="new-address-form">
//                         <div className="new-address-header">
//                             <h4>{savedAddresses.length === 0 ? "Add Shipping Address" : "Add New Address"}</h4>
//                         </div>

//                         <div className="form-group">
//                             <label>Address Type</label>
//                             <div className="address-type-selector">
//                                 <label className={`type-option ${addressType === 'home' ? 'selected' : ''}`}>
//                                     <input
//                                         type="radio"
//                                         name="addressType"
//                                         value="home"
//                                         checked={addressType === 'home'}
//                                         onChange={(e) => setAddressType(e.target.value)}
//                                     />
//                                     <span className="type-icon">🏠</span>
//                                     <span>Home</span>
//                                 </label>
//                                 <label className={`type-option ${addressType === 'office' ? 'selected' : ''}`}>
//                                     <input
//                                         type="radio"
//                                         name="addressType"
//                                         value="office"
//                                         checked={addressType === 'office'}
//                                         onChange={(e) => setAddressType(e.target.value)}
//                                     />
//                                     <span className="type-icon">🏢</span>
//                                     <span>Office</span>
//                                 </label>
//                                 <label className={`type-option ${addressType === 'other' ? 'selected' : ''}`}>
//                                     <input
//                                         type="radio"
//                                         name="addressType"
//                                         value="other"
//                                         checked={addressType === 'other'}
//                                         onChange={(e) => setAddressType(e.target.value)}
//                                     />
//                                     <span className="type-icon">📍</span>
//                                     <span>Other</span>
//                                 </label>
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label>Full Name <span className="required">*</span></label>
//                             <input
//                                 type="text"
//                                 value={shippingAddress.fullName}
//                                 onChange={(e) => setShippingAddress({
//                                     ...shippingAddress,
//                                     fullName: e.target.value
//                                 })}
//                                 className={addressErrors.fullName ? 'error' : ''}
//                                 required
//                                 placeholder="Enter your full name"
//                             />
//                             {addressErrors.fullName && (
//                                 <span className="error-message">{addressErrors.fullName}</span>
//                             )}
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Email <span className="required">*</span></label>
//                                 <input
//                                     type="email"
//                                     value={shippingAddress.email}
//                                     onChange={(e) => {
//                                         setShippingAddress({
//                                             ...shippingAddress,
//                                             email: e.target.value
//                                         });
//                                         validateAddressField('email', e.target.value);
//                                     }}
//                                     className={addressErrors.email ? 'error' : ''}
//                                     required
//                                     placeholder="your@email.com"
//                                 />
//                                 {addressErrors.email && (
//                                     <span className="error-message">{addressErrors.email}</span>
//                                 )}
//                             </div>
//                             <div className="form-group">
//                                 <label>Phone <span className="required">*</span></label>
//                                 <input
//                                     type="tel"
//                                     value={shippingAddress.phone}
//                                     onChange={(e) => {
//                                         setShippingAddress({
//                                             ...shippingAddress,
//                                             phone: e.target.value
//                                         });
//                                         validateAddressField('phone', e.target.value);
//                                     }}
//                                     className={addressErrors.phone ? 'error' : ''}
//                                     required
//                                     placeholder="10-digit mobile number"
//                                     maxLength="10"
//                                 />
//                                 {addressErrors.phone && (
//                                     <span className="error-message">{addressErrors.phone}</span>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label>Complete Address <span className="required">*</span></label>
//                             <textarea
//                                 value={shippingAddress.address}
//                                 onChange={(e) => setShippingAddress({
//                                     ...shippingAddress,
//                                     address: e.target.value
//                                 })}
//                                 rows="3"
//                                 placeholder="House no, Building, Street, Area, Landmark"
//                                 required
//                             />
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>City <span className="required">*</span></label>
//                                 <input
//                                     type="text"
//                                     value={shippingAddress.city}
//                                     onChange={(e) => setShippingAddress({
//                                         ...shippingAddress,
//                                         city: e.target.value
//                                     })}
//                                     required
//                                     placeholder="Enter city"
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>State <span className="required">*</span></label>
//                                 <input
//                                     type="text"
//                                     value={shippingAddress.state}
//                                     onChange={(e) => setShippingAddress({
//                                         ...shippingAddress,
//                                         state: e.target.value
//                                     })}
//                                     required
//                                     placeholder="Enter state"
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Postal Code <span className="required">*</span></label>
//                                 <input
//                                     type="text"
//                                     value={shippingAddress.postalCode}
//                                     onChange={(e) => {
//                                         setShippingAddress({
//                                             ...shippingAddress,
//                                             postalCode: e.target.value
//                                         });
//                                         validateAddressField('postalCode', e.target.value);
//                                     }}
//                                     className={addressErrors.postalCode ? 'error' : ''}
//                                     required
//                                     placeholder="Enter PIN code"
//                                     maxLength="6"
//                                 />
//                                 {addressErrors.postalCode && (
//                                     <span className="error-message">{addressErrors.postalCode}</span>
//                                 )}
//                             </div>
//                             <div className="form-group">
//                                 <label>Country</label>
//                                 <select
//                                     value={shippingAddress.country}
//                                     onChange={(e) => setShippingAddress({
//                                         ...shippingAddress,
//                                         country: e.target.value
//                                     })}
//                                 >
//                                     <option value="India">India</option>
//                                     <option value="USA">USA</option>
//                                     <option value="UK">UK</option>
//                                 </select>
//                             </div>
//                         </div>

//                         {token && (
//                             <div className="additional-options">
//                                 <div className="checkbox-group">
//                                     <label className="checkbox-label">
//                                         <input
//                                             type="checkbox"
//                                             checked={markAsDefault}
//                                             onChange={(e) => setMarkAsDefault(e.target.checked)}
//                                         />
//                                         <span>Set as default address</span>
//                                     </label>
//                                 </div>

//                                 <div className="checkbox-group">
//                                     <label className="checkbox-label">
//                                         <input
//                                             type="checkbox"
//                                             checked={saveAddressAsNew}
//                                             onChange={(e) => setSaveAddressAsNew(e.target.checked)}
//                                         />
//                                         <span>Save this address to my profile</span>
//                                     </label>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="billing-address-section">
//                             <div className="billing-toggle">
//                                 <label className="checkbox-label">
//                                     <input
//                                         type="checkbox"
//                                         checked={billingSameAsShipping}
//                                         onChange={(e) => setBillingSameAsShipping(e.target.checked)}
//                                     />
//                                     <span>Billing address same as shipping address</span>
//                                 </label>
//                             </div>

//                             {!billingSameAsShipping && (
//                                 <div className="billing-address-form">
//                                     <h4>Billing Address</h4>
//                                     <div className="form-group">
//                                         <label>Full Name *</label>
//                                         <input
//                                             type="text"
//                                             value={billingAddress.fullName}
//                                             onChange={(e) => setBillingAddress({
//                                                 ...billingAddress,
//                                                 fullName: e.target.value
//                                             })}
//                                             required
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Address *</label>
//                                         <textarea
//                                             value={billingAddress.address}
//                                             onChange={(e) => setBillingAddress({
//                                                 ...billingAddress,
//                                                 address: e.target.value
//                                             })}
//                                             rows="2"
//                                             required
//                                         />
//                                     </div>
//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label>City *</label>
//                                             <input
//                                                 type="text"
//                                                 value={billingAddress.city}
//                                                 onChange={(e) => setBillingAddress({
//                                                     ...billingAddress,
//                                                     city: e.target.value
//                                                 })}
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>State *</label>
//                                             <input
//                                                 type="text"
//                                                 value={billingAddress.state}
//                                                 onChange={(e) => setBillingAddress({
//                                                     ...billingAddress,
//                                                     state: e.target.value
//                                                 })}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label>Postal Code *</label>
//                                             <input
//                                                 type="text"
//                                                 value={billingAddress.postalCode}
//                                                 onChange={(e) => setBillingAddress({
//                                                     ...billingAddress,
//                                                     postalCode: e.target.value
//                                                 })}
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="form-group">
//                                             <label>Country</label>
//                                             <select
//                                                 value={billingAddress.country}
//                                                 onChange={(e) => setBillingAddress({
//                                                     ...billingAddress,
//                                                     country: e.target.value
//                                                 })}
//                                             >
//                                                 <option value="India">India</option>
//                                                 <option value="USA">USA</option>
//                                                 <option value="UK">UK</option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="form-actions">
//                             {savedAddresses.length > 0 && (
//                                 <button
//                                     type="button"
//                                     className="btn-secondary"
//                                     onClick={handleCancelNewAddress}
//                                 >
//                                     Cancel
//                                 </button>
//                             )}
//                             <button type="submit" className="btn-primary">
//                                 Save & Continue to Payment
//                             </button>
//                         </div>
//                     </form>
//                 )}
//             </div>
//         );
//     };

//     const renderPaymentStep = () => {
//         return (
//             <div className="payment-section">
//                 <h2>Select Payment Method</h2>

//                 <div className="payment-options-container">
//                     <p className="payment-subtitle">Choose your preferred payment option:</p>

//                     <div className="payment-options">
//                         <div
//                             className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
//                             onClick={() => handlePaymentSelect("cod")}
//                         >
//                             <div className="payment-option-content">
//                                 <div className="payment-icon-wrapper">
//                                     <span className="payment-icon">💵</span>
//                                 </div>
//                                 <div className="payment-details">
//                                     <h4>Cash on Delivery</h4>
//                                     <p className="payment-description">Pay when you receive the product</p>
//                                     <div className="payment-features">
//                                         <span className="feature-badge">No extra charges</span>
//                                         <span className="feature-badge">Pay at doorstep</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div
//                             className={`payment-option ${paymentMethod === "razorpay" ? "selected" : ""}`}
//                             onClick={() => handlePaymentSelect("razorpay")}
//                         >
//                             <div className="payment-option-content">
//                                 <div className="payment-icon-wrapper">
//                                     <img
//                                         src="https://razorpay.com/assets/razorpay-logo.svg"
//                                         alt="Razorpay"
//                                         className="razorpay-logo"
//                                     />
//                                 </div>
//                                 <div className="payment-details">
//                                     <h4>Razorpay</h4>
//                                     <p className="payment-description">Instant & Secure Online Payment</p>
//                                     <div className="payment-features">
//                                         <span className="feature-badge">Credit/Debit Card</span>
//                                         <span className="feature-badge">UPI</span>
//                                         <span className="feature-badge">Net Banking</span>
//                                         <span className="feature-badge">Wallet</span>
//                                     </div>
//                                     <p className="payment-note">✅ 100% Secure | Instant Confirmation</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="form-actions">
//                     <button
//                         className="btn-secondary"
//                         onClick={() => setStep(1)}
//                     >
//                         ← Back to Address
//                     </button>
//                     {paymentMethod === "cod" && (
//                         <button
//                             className="btn-primary"
//                             onClick={() => setStep(3)}
//                         >
//                             Continue to Review
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const renderReviewStep = () => {
//         const totals = calculateTotals();

//         return (
//             <div className="review-section">
//                 <h2>Review Your Order</h2>

//                 {orderSuccess && (
//                     <div className="order-success-message">
//                         <div className="success-icon">✅</div>
//                         <h3>Order Placed Successfully!</h3>
//                         <p>Your order has been placed. Redirecting to confirmation...</p>
//                     </div>
//                 )}

//                 <div className="review-section-grid">
//                     <div className="review-address">
//                         <div className="review-section-header">
//                             <h3>Shipping Address</h3>
//                             <button
//                                 className="btn-edit"
//                                 onClick={() => setStep(1)}
//                                 disabled={orderSuccess}
//                             >
//                                 ✏️ Edit
//                             </button>
//                         </div>
//                         <div className="review-content">
//                             <p><strong>{shippingAddress.fullName}</strong></p>
//                             <p>{shippingAddress.address}</p>
//                             <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
//                             <p>{shippingAddress.country}</p>
//                             <p className="address-contact">
//                                 <span>📞 {shippingAddress.phone}</span>
//                                 <span>✉️ {shippingAddress.email}</span>
//                             </p>
//                         </div>
//                     </div>

//                     <div className="review-payment">
//                         <div className="review-section-header">
//                             <h3>Payment Method</h3>
//                             <button
//                                 className="btn-edit"
//                                 onClick={() => setStep(2)}
//                                 disabled={orderSuccess}
//                             >
//                                 ✏️ Change
//                             </button>
//                         </div>
//                         <div className="review-content">
//                             <div className="payment-method-display">
//                                 {paymentMethod === "cod" && (
//                                     <>
//                                         <span className="payment-icon">💵</span>
//                                         <span>Cash on Delivery</span>
//                                     </>
//                                 )}
//                                 {paymentMethod === "razorpay" && (
//                                     <>
//                                         <img
//                                             src="https://razorpay.com/assets/razorpay-logo.svg"
//                                             alt="Razorpay"
//                                             className="razorpay-small-logo"
//                                         />
//                                         <span>Razorpay (Card/UPI/NetBanking)</span>
//                                     </>
//                                 )}
//                             </div>
//                             <p className="payment-status">
//                                 {paymentMethod === "cod" ? "Pay on Delivery" : "Online Payment"}
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="review-order-summary">
//                     <h3>Order Summary</h3>
//                     <div className="review-items">
//                         {products.map((product, index) => (
//                             <div key={index} className="review-item">
//                                 <div className="review-item-info">
//                                     <span className="item-name">{product.name}</span>
//                                     <span className="item-quantity">x{product.quantity || 1}</span>
//                                     {product.selectedSize && (
//                                         <span className="item-variant">Size: {product.selectedSize}</span>
//                                     )}
//                                     {product.selectedColor && (
//                                         <span className="item-variant">Color: {product.selectedColor}</span>
//                                     )}
//                                 </div>
//                                 <div className="review-item-price">
//                                     ₹{((product.finalPrice || product.price) * (product.quantity || 1)).toFixed(2)}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="review-totals">
//                         <div className="total-row">
//                             <span>Subtotal</span>
//                             <span>₹{totals.subtotal.toFixed(2)}</span>
//                         </div>
//                         {totals.hasDiscount && (
//                             <div className="total-row discount">
//                                 <span>Discount ({promoDiscount}%)</span>
//                                 <span>-₹{totals.discount.toFixed(2)}</span>
//                             </div>
//                         )}
//                         <div className="total-row">
//                             <span>Shipping</span>
//                             <span>{totals.hasFreeShipping ? 'FREE' : `₹${totals.shipping.toFixed(2)}`}</span>
//                         </div>
//                         <div className="total-row">
//                             <span>Tax (GST)</span>
//                             <span>₹{totals.tax.toFixed(2)}</span>
//                         </div>
//                         <div className="total-row grand-total">
//                             <span>Total</span>
//                             <span>₹{totals.total.toFixed(2)}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="order-notes">
//                     <h3>Order Notes (Optional)</h3>
//                     <textarea
//                         placeholder="Add any special instructions (e.g., delivery timing, gift message, etc.)"
//                         value={orderNote}
//                         onChange={(e) => setOrderNote(e.target.value)}
//                         rows="3"
//                         disabled={orderSuccess}
//                     />
//                 </div>

//                 <div className="terms-agreement">
//                     <label className="checkbox-label">
//                         <input type="checkbox" required disabled={orderSuccess} />
//                         <span>
//                             I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
//                         </span>
//                     </label>
//                 </div>

//                 <div className="form-actions">
//                     <button
//                         className="btn-secondary"
//                         onClick={() => setStep(2)}
//                         disabled={placingOrder || orderSuccess}
//                     >
//                         ← Back to Payment
//                     </button>
//                     <button
//                         className="btn-primary btn-large"
//                         onClick={handlePlaceOrder}
//                         disabled={placingOrder || orderSuccess}
//                     >
//                         {placingOrder ? (
//                             <>
//                                 <span className="spinner-small"></span>
//                                 Placing Order...
//                             </>
//                         ) : orderSuccess ? (
//                             "Order Placed ✓"
//                         ) : (
//                             `Place Order • ₹${totals.total.toFixed(2)}`
//                         )}
//                     </button>
//                 </div>

//                 {/* Email Status */}
//                 {emailSent && (
//                     <div className="email-notification success">
//                         <p>✅ Order confirmation email sent to {shippingAddress.email}</p>
//                     </div>
//                 )}
//                 {emailError && (
//                     <div className="email-notification error">
//                         <p>❌ Failed to send email: {emailError}</p>
//                         <p>But your order is confirmed! You can check order status in your account.</p>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // ==================== MAIN RENDER ====================

//     if (loading) {
//         return (
//             <div className="checkout-loading">
//                 <div className="spinner"></div>
//                 <p>Loading checkout...</p>
//             </div>
//         );
//     }

//     if (products.length === 0) {
//         return (
//             <div className="checkout-empty">
//                 <h2>No items to checkout</h2>
//                 <p>Your cart is empty or product information is missing.</p>
//                 <button
//                     className="btn-primary"
//                     onClick={() => navigate("/products")}
//                 >
//                     Continue Shopping
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="checkout-container">
//             <div className="checkout-header">
//                 <h1>
//                     <span className="brand-name">Pankhudi</span>
//                     <span className="checkout-title">Secure Checkout</span>
//                 </h1>

//                 <div className="checkout-steps">
//                     <div className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
//                         <div className="circle">{step > 1 ? "✓" : "1"}</div>
//                         <span>Address</span>
//                     </div>
//                     <div className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
//                         <div className="circle">{step > 2 ? "✓" : "2"}</div>
//                         <span>Payment</span>
//                     </div>
//                     <div className={`step ${step >= 3 ? "active" : ""}`}>
//                         <div className="circle">3</div>
//                         <span>Review</span>
//                     </div>
//                 </div>
//             </div>

//             <div className="checkout-content">
//                 <div className="checkout-form-column">
//                     {step === 1 && renderAddressStep()}
//                     {step === 2 && renderPaymentStep()}
//                     {step === 3 && renderReviewStep()}
//                 </div>

//                 <div className="checkout-summary-column">
//                     {renderProductSummary()}

//                     <div className="checkout-security">
//                         <div className="security-icon">🔒</div>
//                         <div className="security-text">
//                             <strong>100% Secure Checkout</strong>
//                             <p>Your payment information is encrypted</p>
//                         </div>
//                     </div>

//                     <div className="checkout-help">
//                         <p className="help-title">Need help?</p>
//                         <p className="help-phone">📞 +91 12345 67890</p>
//                         <p className="help-email">✉️ support@pankhudi.com</p>
//                         <p className="help-hours">Available 24/7</p>
//                     </div>

//                     {/* Email Information */}
//                     <div className="email-info">
//                         <p className="email-info-title">📧 Order Confirmation</p>
//                         <p className="email-info-text">
//                             Order details will be sent to: <strong>{shippingAddress.email || userDetails?.email || 'your email'}</strong>
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Checkout;














import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ==================== STATE MANAGEMENT ====================
    const [checkoutType, setCheckoutType] = useState(""); // "cart" or "direct"
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review

    // Address States
    const [shippingAddress, setShippingAddress] = useState({
        fullName: "", address: "", city: "", state: "", postalCode: "",
        country: "India", phone: "", email: ""
    });
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [billingAddress, setBillingAddress] = useState({
        fullName: "", address: "", city: "", state: "", postalCode: "", country: "India"
    });

    // Saved Addresses
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [saveAddressAsNew, setSaveAddressAsNew] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [editAddressForm, setEditAddressForm] = useState({});
    const [addressActionLoading, setAddressActionLoading] = useState(false);
    const [addressType, setAddressType] = useState("home");
    const [markAsDefault, setMarkAsDefault] = useState(false);
    const [addressErrors, setAddressErrors] = useState({});

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [orderNote, setOrderNote] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    // Promo Code States
    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoError, setPromoError] = useState("");
    const [promoData, setPromoData] = useState(null);

    // Email States
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(null);

    // User Token
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Constants
    const MIN_FREE_SHIPPING_AMOUNT = 1000;
    const DEFAULT_SHIPPING_CHARGE = 0;

    // ==================== EFFECTS ====================
    useEffect(() => {
        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => { setRazorpayLoaded(true); resolve(true); };
                script.onerror = () => { console.error("Failed to load Razorpay SDK"); resolve(false); };
                document.body.appendChild(script);
            });
        };
        loadRazorpayScript();
    }, []);

    useEffect(() => {
        initializeCheckout();
    }, [location]);

    // ==================== INITIALIZATION ====================
    const initializeCheckout = async () => {
        setLoading(true);
        try {
            if (token && user.id) {
                await fetchUserDetails();
                await fetchSavedAddresses();
            }
            if (location.state?.directBuy) {
                setCheckoutType("direct");
                await fetchProductDetails(location.state.product);
            } else {
                setCheckoutType("cart");
                await fetchCartItems();
            }
        } catch (error) {
            console.error("Checkout initialization error:", error);
            showNotification("Failed to initialize checkout", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/${user.id}/details`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) setUserDetails(response.data.user);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const fetchSavedAddresses = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/${user.id}/addresses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setSavedAddresses(response.data.addresses || []);
                const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
                if (defaultAddress) handleSavedAddressSelect(defaultAddress);
            }
        } catch (error) {
            console.error("Error fetching saved addresses:", error);
            setSavedAddresses([]);
        }
    };

    const showNotification = (message, type = "success") => {
        alert(`${type === "success" ? "✅" : "❌"} ${message}`);
    };

    // ==================== PRODUCT FUNCTIONS ====================
    const fetchProductDetails = async (productData) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/products/${productData.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const product = response.data.product || response.data;
            setProducts([{
                ...product,
                quantity: productData.quantity || 1,
                selectedSize: productData.selectedSize,
                selectedColor: productData.selectedColor,
                finalPrice: calculateFinalPrice(product),
                shipping_cost: product.shipping_cost || DEFAULT_SHIPPING_CHARGE,
                free_shipping: product.free_shipping || 0,
                tax_rate: product.tax_rate || 0,
                tax_amount: calculateTaxAmount(product)
            }]);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };

    const fetchCartItems = async () => {
        if (!token) { navigate("/login"); return; }
        try {
            const response = await axios.get(
                `http://localhost:5000/api/cart/user/${user.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                const items = response.data.items || [];
                if (items.length === 0) {
                    showNotification("Your cart is empty", "error");
                    navigate("/");
                    return;
                }
                const processedItems = items.map(item => ({
                    id: item.product_id,
                    name: item.product_name,
                    price: item.price,
                    discount: item.discount,
                    finalPrice: item.discount_price || item.final_price || item.price,
                    quantity: item.quantity,
                    selectedSize: item.size,
                    selectedColor: item.color,
                    shipping_cost: item.shipping_cost || DEFAULT_SHIPPING_CHARGE,
                    free_shipping: item.free_shipping || 0,
                    tax_rate: item.tax_rate || 0,
                    tax_amount: calculateTaxAmount(item),
                    sku: item.sku,
                    brand: item.brand,
                    images: item.images || (item.image ? [item.image] : [])
                }));
                setProducts(processedItems);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            showNotification("Failed to load cart items", "error");
            navigate("/cart");
        }
    };

    const calculateFinalPrice = (product) => {
        if (!product) return 0;
        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount) || 0;
        return discount > 0 ? parseFloat((price - (price * discount / 100)).toFixed(2)) : price;
    };

    const calculateTaxAmount = (product) => {
        if (!product.tax_rate || product.tax_rate === 0) return 0;
        const price = product.finalPrice || calculateFinalPrice(product) || product.price || 0;
        const taxRate = parseFloat(product.tax_rate) / 100;
        return parseFloat((price * taxRate).toFixed(2));
    };

    // ==================== CALCULATE TOTALS ====================
    const calculateTotals = () => {
        const subtotal = products.reduce((total, product) => {
            const price = product.finalPrice || product.price || 0;
            return total + (parseFloat(price) * parseInt(product.quantity || 1));
        }, 0);

        const tax = products.reduce((total, product) => {
            if (product.tax_rate && product.tax_rate > 0) {
                const price = product.finalPrice || product.price || 0;
                const taxRate = parseFloat(product.tax_rate) / 100;
                return total + (parseFloat(price) * parseInt(product.quantity || 1) * taxRate);
            }
            return total;
        }, 0);

        let shipping = 0;
        let hasFreeShipping = false;
        let shippingMessage = "";

        const individualShippingCost = products.reduce((total, product) => {
            if (product.shipping_cost && product.shipping_cost > 0) {
                return total + (parseFloat(product.shipping_cost) * (product.quantity || 1));
            }
            return total;
        }, 0);

        const hasFreeShippingProduct = products.some(p => p.free_shipping === 1);
        const qualifiesForFreeShipping = subtotal >= MIN_FREE_SHIPPING_AMOUNT;

        if (hasFreeShippingProduct || qualifiesForFreeShipping) {
            shipping = 0;
            hasFreeShipping = true;
            shippingMessage = hasFreeShippingProduct ? "Free shipping on selected products" : "Order qualifies for FREE shipping!";
        } else {
            shipping = individualShippingCost > 0 ? individualShippingCost : 0;
        }

        const discountAmount = promoApplied ? (subtotal * promoDiscount / 100) : 0;
        const total = subtotal + shipping + tax - discountAmount;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            discount: parseFloat(discountAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            hasFreeShipping,
            shippingMessage,
            hasTax: tax > 0,
            hasShipping: shipping > 0,
            hasDiscount: discountAmount > 0,
            itemCount: products.length
        };
    };

    // ==================== PROMO CODE ====================
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            setPromoError("Please enter a promo code");
            return;
        }

        try {
            setPromoError("");

            // ✅ FIXED: Token included in headers
            const response = await axios.post(
                "http://localhost:5000/api/promo/validate",
                { promoCode: promoCode.toUpperCase() },
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Important
                    }
                }
            );

            console.log("Promo response:", response.data);

            if (response.data.valid) {
                const promo = response.data.promo;

                // Check minimum order amount
                const { subtotal } = calculateTotals();
                if (subtotal < promo.minOrder) {
                    setPromoError(`Minimum order of ₹${promo.minOrder} required`);
                    return;
                }

                setPromoApplied(true);
                setPromoDiscount(promo.discount);
                setPromoData(promo);

                showNotification(`Promo code applied! ${promo.description || ''}`, "success");
            } else {
                setPromoError(response.data.message || "Invalid promo code");
            }
        } catch (error) {
            console.error("Promo error:", error);

            // Better error handling
            if (error.response?.status === 401) {
                setPromoError("Please login to apply promo code");
                showNotification("Please login to apply promo code", "error");
            } else if (error.response?.data?.message) {
                setPromoError(error.response.data.message);
            } else {
                setPromoError("Error applying promo code");
            }
        }
    };

    const handleRemovePromo = () => {
        setPromoApplied(false);
        setPromoDiscount(0);
        setPromoCode("");
        setPromoData(null);
        showNotification("Promo code removed", "success");
    };

    // ==================== ADDRESS VALIDATION ====================
    const validateAddressField = (fieldName, value) => {
        const errors = { ...addressErrors };
        switch (fieldName) {
            case 'phone':
                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                    errors.phone = "Please enter a valid 10-digit mobile number starting with 6-9";
                } else delete errors.phone;
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.email = "Please enter a valid email address";
                } else delete errors.email;
                break;
            case 'postalCode':
                const pincodeRegex = /^\d{6}$/;
                if (!pincodeRegex.test(value.replace(/\D/g, ''))) {
                    errors.postalCode = "Please enter a valid 6-digit PIN code";
                } else delete errors.postalCode;
                break;
            default: break;
        }
        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ==================== ADDRESS MANAGEMENT ====================
    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        setAddressActionLoading(true);
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/users/${user.id}/addresses/${addressId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                await fetchSavedAddresses();
                if (selectedSavedAddress === addressId) setSelectedSavedAddress(null);
                showNotification("Address deleted successfully!", "success");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            showNotification("Failed to delete address", "error");
        } finally {
            setAddressActionLoading(false);
        }
    };

    const handleSavedAddressSelect = (address) => {
        setSelectedSavedAddress(address.id);
        setIsAddingNewAddress(false);
        setEditingAddressId(null);
        setShippingAddress({
            fullName: address.fullName || address.full_name || userDetails?.name || "",
            address: address.addressLine || address.address_line || address.address || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || address.postal_code || "",
            country: address.country || "India",
            phone: address.phone || userDetails?.phone || "",
            email: address.email || userDetails?.email || shippingAddress.email || ""
        });
        setSaveAddressAsNew(false);
    };

    const handleAddNewAddressClick = () => {
        setIsAddingNewAddress(true);
        setSelectedSavedAddress(null);
        setEditingAddressId(null);
        setAddressType("home");
        setMarkAsDefault(false);
        setAddressErrors({});
        setShippingAddress({
            fullName: userDetails?.name || "",
            address: "", city: "", state: "", postalCode: "",
            country: "India",
            phone: userDetails?.phone || "",
            email: userDetails?.email || ""
        });
    };

    const handleEditAddressClick = (address) => {
        setEditingAddressId(address.id);
        setEditAddressForm({
            fullName: address.fullName || address.full_name || "",
            address: address.addressLine || address.address_line || address.address || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || address.postal_code || "",
            country: address.country || "India",
            phone: address.phone || "",
            addressType: address.addressType || address.address_type || "home",
            email: address.email || ""
        });
    };

    const handleCancelEditAddress = () => {
        setEditingAddressId(null);
        setEditAddressForm({});
    };

    const handleSaveEditedAddress = async (addressId) => {
        setAddressActionLoading(true);
        try {
            const updatePayload = {
                fullName: editAddressForm.fullName,
                address: editAddressForm.address,
                city: editAddressForm.city,
                state: editAddressForm.state,
                postalCode: editAddressForm.postalCode,
                country: editAddressForm.country,
                phone: editAddressForm.phone,
                email: editAddressForm.email,
                addressType: editAddressForm.addressType || 'home'
            };
            const response = await axios.put(
                `http://localhost:5000/api/users/${user.id}/addresses/${addressId}`,
                updatePayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                await fetchSavedAddresses();
                setEditingAddressId(null);
                setEditAddressForm({});
                showNotification("Address updated successfully!", "success");
            }
        } catch (error) {
            console.error("Error updating address:", error);
            showNotification(`Failed to update address: ${error.response?.data?.message || 'Unknown error'}`, "error");
        } finally {
            setAddressActionLoading(false);
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/users/${user.id}/addresses/${addressId}/default`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                await fetchSavedAddresses();
                showNotification("Default address updated!", "success");
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            showNotification("Failed to set default address", "error");
        }
    };

    const handleContinueWithSavedAddress = (e) => {
        e.preventDefault();
        if (!selectedSavedAddress) {
            showNotification("Please select an address", "error");
            return;
        }
        setStep(2);
    };

    const handleCancelNewAddress = () => {
        setIsAddingNewAddress(false);
        setSelectedSavedAddress(null);
        setAddressErrors({});
        if (savedAddresses.length > 0) {
            const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
            handleSavedAddressSelect(defaultAddress);
        }
    };

    const saveAddressToProfile = async (addressData) => {
        if (!token || !user.id) return false;
        try {
            const addressPayload = {
                fullName: addressData.fullName,
                address: addressData.address,
                city: addressData.city,
                state: addressData.state,
                postalCode: addressData.postalCode,
                country: addressData.country || "India",
                phone: addressData.phone,
                email: addressData.email,
                addressType: addressData.addressType || addressType || 'home',
                isDefault: addressData.isDefault || markAsDefault || savedAddresses.length === 0
            };
            const response = await axios.post(
                `http://localhost:5000/api/users/${user.id}/addresses`,
                addressPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.data.success) {
                setMarkAsDefault(false);
                setAddressType("home");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error saving address to profile:", error);
            return false;
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const trimmedAddress = {
            fullName: shippingAddress.fullName?.trim() || "",
            address: shippingAddress.address?.trim() || "",
            city: shippingAddress.city?.trim() || "",
            state: shippingAddress.state?.trim() || "",
            postalCode: shippingAddress.postalCode?.trim() || "",
            phone: shippingAddress.phone?.trim() || "",
            email: shippingAddress.email?.trim() || "",
            country: shippingAddress.country || "India",
            addressType: addressType,
            isDefault: markAsDefault
        };

        let isValid = true;
        const errors = {};
        const requiredFields = [
            { field: "fullName", label: "Full Name" },
            { field: "address", label: "Address" },
            { field: "city", label: "City" },
            { field: "state", label: "State" },
            { field: "postalCode", label: "Postal Code" },
            { field: "phone", label: "Phone" },
            { field: "email", label: "Email" }
        ];

        requiredFields.forEach(f => {
            if (!trimmedAddress[f.field]) {
                errors[f.field] = `${f.label} is required`;
                isValid = false;
            }
        });

        const phoneRegex = /^[6-9]\d{9}$/;
        if (trimmedAddress.phone && !phoneRegex.test(trimmedAddress.phone.replace(/\D/g, ''))) {
            errors.phone = "Please enter a valid 10-digit mobile number starting with 6-9";
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (trimmedAddress.email && !emailRegex.test(trimmedAddress.email)) {
            errors.email = "Please enter a valid email address";
            isValid = false;
        }

        const pincodeRegex = /^\d{6}$/;
        if (trimmedAddress.postalCode && !pincodeRegex.test(trimmedAddress.postalCode.replace(/\D/g, ''))) {
            errors.postalCode = "Please enter a valid 6-digit PIN code";
            isValid = false;
        }

        setAddressErrors(errors);
        if (!isValid) {
            showNotification("Please fix the errors in the form", "error");
            return;
        }

        setShippingAddress(trimmedAddress);
        setIsAddingNewAddress(true);

        try {
            if (saveAddressAsNew && token) {
                const addressSaved = await saveAddressToProfile(trimmedAddress);
                if (addressSaved) {
                    showNotification("Address saved successfully to your profile!", "success");
                    setSaveAddressAsNew(false);
                    await fetchSavedAddresses();
                }
            }
            if (billingSameAsShipping) setBillingAddress({ ...trimmedAddress });
            setIsAddingNewAddress(false);
            setStep(2);
        } catch (error) {
            console.error("Error in address submission:", error);
            showNotification("There was an error processing your address. Please try again.", "error");
        } finally {
            setIsAddingNewAddress(false);
        }
    };

    // ==================== EMAIL FUNCTION ====================
    const sendOrderConfirmationEmail = async (orderData) => {
        try {
            console.log("📧 Sending order confirmation email...");

            // ✅ FIXED: Correct tracking URL with orderId
            const trackingUrl = `${window.location.origin}/order-confirmation/${orderData.orderId}`;

            const emailPayload = {
                to: orderData.shippingAddress.email || userDetails?.email,
                userName: orderData.shippingAddress.fullName || userDetails?.name,
                orderNumber: orderData.orderNumber,
                orderId: orderData.orderId,
                orderDate: new Date().toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }),
                products: products.map(p => ({
                    name: p.name, quantity: p.quantity,
                    price: p.finalPrice || p.price,
                    total: ((p.finalPrice || p.price) * (p.quantity || 1)).toFixed(2),
                    image: p.images?.[0] || p.image || '/images/placeholder-product.jpg',
                    sku: p.sku, size: p.selectedSize, color: p.selectedColor
                })),
                subtotal: orderData.subtotal,
                shipping: orderData.shipping,
                tax: orderData.tax,
                discount: orderData.discount,
                total: orderData.total,
                paymentMethod: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
                shippingAddress: orderData.shippingAddress,
                trackingUrl: trackingUrl, // ✅ FIXED
                supportEmail: 'support@pankhudi.com',
                supportPhone: '+91 12345 67890'
            };

            const response = await axios.post(
                'http://localhost:5000/api/email/send-order-confirmation',
                emailPayload,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                console.log("✅ Order confirmation email sent successfully!");
                setEmailSent(true);
                setEmailError(null);
                return true;
            } else {
                throw new Error(response.data.message || "Failed to send email");
            }
        } catch (error) {
            console.error("❌ Error sending order confirmation email:", error);
            setEmailError(error.message);
            return false;
        }
    };

    const getEstimatedDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // ==================== PAYMENT FUNCTIONS ====================
    const handlePaymentSelect = (method) => {
        setPaymentMethod(method);
        if (method === "cod") {
            setStep(3);
        } else if (method === "razorpay") {
            handleRazorpayPayment();
        }
    };

    const handleRazorpayPayment = async () => {
        if (!razorpayLoaded) {
            showNotification("Payment gateway is loading. Please try again.", "error");
            return;
        }
        setPlacingOrder(true);
        try {
            const { total } = calculateTotals();
            const response = await axios.post(
                "http://localhost:5000/api/payment/create-order",
                {
                    amount: Math.round(total * 100),
                    currency: "INR",
                    receipt: `receipt_${Date.now()}`,
                    notes: { userId: user.id, checkoutType: checkoutType, email: shippingAddress.email || userDetails?.email }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data.success) throw new Error(response.data.message || "Failed to create payment order");

            const orderData = response.data.order;
            const options = {
                key: response.data.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Pankhudi",
                description: `Payment for ${products.length} item(s)`,
                order_id: orderData.id,
                handler: async (paymentResponse) => {
                    try {
                        const verifyResponse = await axios.post(
                            "http://localhost:5000/api/payment/verify",
                            {
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_signature: paymentResponse.razorpay_signature
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (verifyResponse.data.success) {
                            await placeOrder("razorpay", paymentResponse.razorpay_payment_id, "completed");
                        } else {
                            showNotification("Payment verification failed. Please try again.", "error");
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        showNotification("Payment verification failed. Your order will be reviewed.", "error");
                        await placeOrder("razorpay", paymentResponse.razorpay_payment_id, "pending");
                    }
                },
                prefill: {
                    name: shippingAddress.fullName || userDetails?.name,
                    email: shippingAddress.email || userDetails?.email,
                    contact: shippingAddress.phone || userDetails?.phone
                },
                theme: { color: "#0066FF" }, // Blue theme
                modal: { ondismiss: () => setPlacingOrder(false) }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Razorpay payment error:", error);
            showNotification("Failed to initialize payment. Please try again or choose Cash on Delivery.", "error");
            setPlacingOrder(false);
        }
    };

    // ==================== ORDER PLACEMENT ====================
    const placeOrder = async (paymentMethodType = paymentMethod, paymentId = null, paymentStatus = "completed") => {
        try {
            const totals = calculateTotals();
            const orderData = {
                userId: user.id,
                shippingAddress,
                billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
                paymentMethod: paymentMethodType,
                paymentId,
                paymentStatus,
                subtotal: totals.subtotal,
                taxAmount: totals.tax,
                shippingCharge: totals.shipping,
                discountAmount: totals.discount,
                totalAmount: totals.total,
                orderNote,
                items: products.map(product => ({
                    productId: product.id,
                    product_name: product.name,
                    quantity: product.quantity || 1,
                    price: product.finalPrice || product.price,
                    size: product.selectedSize,
                    color: product.selectedColor,
                    shipping_cost: product.shipping_cost,
                    free_shipping: product.free_shipping,
                    tax_rate: product.tax_rate || 0,
                    tax_amount: product.tax_amount || 0,
                    sku: product.sku,
                    image: product.images?.[0] || product.image
                }))
            };

            let endpoint = "/api/orders/create";
            if (checkoutType === "direct") {
                endpoint = "/api/orders/direct-buy";
                orderData.productId = products[0].id;
            }

            const response = await axios.post(
                `http://localhost:5000${endpoint}`,
                orderData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setOrderDetails({
                    orderId: response.data.orderId,
                    orderNumber: response.data.orderNumber,
                    total: totals.total,
                    ...response.data
                });

                const emailData = {
                    orderId: response.data.orderId,
                    orderNumber: response.data.orderNumber,
                    shippingAddress,
                    billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
                    paymentMethod: paymentMethodType,
                    paymentStatus,
                    subtotal: totals.subtotal,
                    shipping: totals.shipping,
                    tax: totals.tax,
                    discount: totals.discount,
                    total: totals.total,
                    orderNote
                };

                const emailSent = await sendOrderConfirmationEmail(emailData);

                if (checkoutType === "cart") {
                    try {
                        await axios.delete(
                            `http://localhost:5000/api/cart/clear/${user.id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        localStorage.removeItem('pankhudiCart');
                    } catch (cartError) {
                        console.error("Error clearing cart:", cartError);
                    }
                }

                setOrderSuccess(true);

                // ✅ FIXED: Navigate to correct URL with orderId
                setTimeout(() => {
                    navigate(`/order-confirmation/${response.data.orderId}`, {
                        state: {
                            orderId: response.data.orderId,
                            orderNumber: response.data.orderNumber,
                            totalAmount: totals.total,
                            fromConfirmation: true,
                            paymentMethod: paymentMethodType,
                            emailSent: emailSent,
                            emailError: emailError
                        }
                    });
                }, 2000);
            } else {
                throw new Error(response.data.message || "Failed to place order");
            }
        } catch (error) {
            console.error("Order placement error:", error);
            showNotification(error.response?.data?.message || error.message || "Failed to place order", "error");
            throw error;
        } finally {
            setPlacingOrder(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            showNotification("Please login to place order", "error");
            navigate("/login");
            return;
        }
        if (paymentMethod === "cod") {
            setPlacingOrder(true);
            await placeOrder("cod");
        }
    };

    // ==================== RENDER FUNCTIONS ====================
    const renderProductSummary = () => {
        const totals = calculateTotals();
        return (
            <div className="checkout-product-summary">
                <div className="summary-header">
                    <h3>{checkoutType === "direct" ? "Product Details" : `Order Summary (${products.length} items)`}</h3>
                    <span className="edit-link" onClick={() => navigate(checkoutType === "cart" ? "/cart" : -1)}>
                        {checkoutType === "cart" ? "Edit Cart" : "Change Product"}
                    </span>
                </div>
                <div className="checkout-products-list">
                    {products.map((product, index) => (
                        <div key={index} className="checkout-product-item">
                            <div className="product-image-section">
                                <img src={product.images?.[0] || product.image || "/images/placeholder-product.jpg"} alt={product.name} />
                                <span className="product-quantity">x{product.quantity || 1}</span>
                            </div>
                            <div className="checkout-product-info">
                                <h4>{product.name}</h4>
                                <div className="product-details-list">
                                    {product.sku && <span>SKU: {product.sku}</span>}
                                    {product.selectedSize && <span>Size: {product.selectedSize}</span>}
                                    {product.selectedColor && <span>Color: {product.selectedColor}</span>}
                                </div>
                                <div className="product-price">₹{(product.finalPrice || product.price).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="promo-code-section">
                    <h4>🎟️ Have a promo code?</h4>
                    <div className="promo-input-group">
                        <input type="text" placeholder="Enter promo code" value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())} disabled={promoApplied} />
                        {!promoApplied ? (
                            <button onClick={handleApplyPromo} className="btn-promo">Apply</button>
                        ) : (
                            <button onClick={handleRemovePromo} className="btn-promo remove">Remove</button>
                        )}
                    </div>
                    {promoError && <p className="promo-error">{promoError}</p>}
                    {promoApplied && promoData && (
                        <div className="promo-success">
                            <p>🎉 {promoDiscount}% discount applied!</p>
                            {promoData.maxDiscount && <p className="promo-note">Max discount: ₹{promoData.maxDiscount}</p>}
                        </div>
                    )}
                </div>
                <div className="checkout-price-breakdown">
                    <div className="price-row"><span>Subtotal ({totals.itemCount} items)</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                    {totals.hasDiscount && <div className="price-row discount-row"><span>Discount ({promoDiscount}%)</span><span>-₹{totals.discount.toFixed(2)}</span></div>}
                    {totals.hasShipping && (
                        <div className="price-row">
                            <span>Shipping</span>
                            <span>{totals.hasFreeShipping ? <span className="free-shipping">FREE</span> : `₹${totals.shipping.toFixed(2)}`}</span>
                        </div>
                    )}
                    {totals.hasFreeShipping && <div className="free-shipping-badge">🚚 {totals.shippingMessage}</div>}
                    {totals.hasTax && <div className="price-row"><span>Tax (GST)</span><span>₹{totals.tax.toFixed(2)}</span></div>}
                    <div className="price-row total-row"><strong>Total</strong><strong>₹{totals.total.toFixed(2)}</strong></div>
                </div>
            </div>
        );
    };

    const renderAddressStep = () => {
        return (
            <div className="address-form-section">
                <h2>Shipping Address</h2>
                <div className="address-info-message">
                    <span className="info-icon">ℹ️</span>
                    <span className="info-text">
                        {savedAddresses.length > 0 ? "Select an address or add a new one." : "Add your shipping address below."}
                    </span>
                </div>

                {savedAddresses.length > 0 && !isAddingNewAddress && (
                    <>
                        <div className="saved-addresses">
                            <div className="saved-addresses-header">
                                <h4>Your Saved Addresses</h4>
                                <span className="address-count">{savedAddresses.length} {savedAddresses.length === 1 ? 'Address' : 'Addresses'}</span>
                            </div>
                            <div className="address-list">
                                {savedAddresses.map((address) => (
                                    <div key={address.id} className="address-item-wrapper">
                                        {editingAddressId === address.id ? (
                                            <div className="address-edit-form">
                                                <h5>Edit Address</h5>
                                                <div className="form-group">
                                                    <label>Full Name</label>
                                                    <input type="text" value={editAddressForm.fullName || ''}
                                                        onChange={(e) => setEditAddressForm({ ...editAddressForm, fullName: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Address</label>
                                                    <textarea value={editAddressForm.address || ''}
                                                        onChange={(e) => setEditAddressForm({ ...editAddressForm, address: e.target.value })} rows="2" />
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>City</label>
                                                        <input type="text" value={editAddressForm.city || ''}
                                                            onChange={(e) => setEditAddressForm({ ...editAddressForm, city: e.target.value })} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>State</label>
                                                        <input type="text" value={editAddressForm.state || ''}
                                                            onChange={(e) => setEditAddressForm({ ...editAddressForm, state: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Postal Code</label>
                                                        <input type="text" value={editAddressForm.postalCode || ''}
                                                            onChange={(e) => setEditAddressForm({ ...editAddressForm, postalCode: e.target.value })} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Phone</label>
                                                        <input type="tel" value={editAddressForm.phone || ''}
                                                            onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input type="email" value={editAddressForm.email || ''}
                                                        onChange={(e) => setEditAddressForm({ ...editAddressForm, email: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Address Type</label>
                                                    <select value={editAddressForm.addressType || 'home'}
                                                        onChange={(e) => setEditAddressForm({ ...editAddressForm, addressType: e.target.value })}>
                                                        <option value="home">Home</option>
                                                        <option value="office">Office</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="edit-actions">
                                                    <button className="btn-save" onClick={() => handleSaveEditedAddress(address.id)} disabled={addressActionLoading}>
                                                        {addressActionLoading ? "Saving..." : "Save Changes"}
                                                    </button>
                                                    <button className="btn-cancel" onClick={handleCancelEditAddress} disabled={addressActionLoading}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`address-card ${selectedSavedAddress === address.id ? "selected" : ""}`}
                                                onClick={() => handleSavedAddressSelect(address)}>
                                                <div className="address-card-header">
                                                    <div className="address-type-section">
                                                        <span className={`address-type-badge ${address.addressType || address.address_type || 'home'}`}>
                                                            {address.addressType || address.address_type || "Home"}
                                                        </span>
                                                        {address.isDefault && <span className="default-badge">⭐ DEFAULT</span>}
                                                    </div>
                                                    <div className="address-actions">
                                                        <button className="address-action-btn edit-btn" onClick={(e) => { e.stopPropagation(); handleEditAddressClick(address); }}>✏️</button>
                                                        {!address.isDefault && (
                                                            <button className="address-action-btn default-btn" onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(address.id); }}>⭐</button>
                                                        )}
                                                        <button className="address-action-btn delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}>🗑️</button>
                                                    </div>
                                                </div>
                                                <div className="address-card-body">
                                                    <p className="address-name"><strong>{address.fullName || address.full_name}</strong></p>
                                                    <p className="address-line">{address.addressLine || address.address_line || address.address}</p>
                                                    <p className="address-city-state">{address.city}, {address.state} - {address.postalCode || address.postal_code}</p>
                                                    <p className="address-country">{address.country}</p>
                                                    {address.phone && <p className="address-phone">📞 {address.phone}</p>}
                                                    {address.email && <p className="address-email">✉️ {address.email}</p>}
                                                </div>
                                                {selectedSavedAddress === address.id && (
                                                    <div className="address-selected-indicator"><span className="selected-check">✓</span> Selected</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {selectedSavedAddress && !editingAddressId && (
                                <div className="selected-address-actions">
                                    <button className="btn-primary btn-large continue-btn" onClick={handleContinueWithSavedAddress}>
                                        Continue to Payment
                                    </button>
                                    <p className="address-confirm-message">✓ Address selected successfully</p>
                                </div>
                            )}
                            <div className="or-divider"><span>OR</span></div>
                            <button className="pankhudi-add-address-btn" onClick={handleAddNewAddressClick}>+ Add New Address</button>
                        </div>
                    </>
                )}

                {(isAddingNewAddress || savedAddresses.length === 0) && (
                    <form onSubmit={handleAddressSubmit} className="new-address-form">
                        <div className="new-address-header">
                            <h4>{savedAddresses.length === 0 ? "Add Shipping Address" : "Add New Address"}</h4>
                        </div>
                        <div className="form-group">
                            <label>Address Type</label>
                            <div className="address-type-selector">
                                {['home', 'office', 'other'].map(type => (
                                    <label key={type} className={`type-option ${addressType === type ? 'selected' : ''}`}>
                                        <input type="radio" name="addressType" value={type} checked={addressType === type}
                                            onChange={(e) => setAddressType(e.target.value)} />
                                        <span className="type-icon">{type === 'home' ? '🏠' : type === 'office' ? '🏢' : '📍'}</span>
                                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Full Name <span className="required">*</span></label>
                            <input type="text" value={shippingAddress.fullName}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                className={addressErrors.fullName ? 'error' : ''} required placeholder="Enter your full name" />
                            {addressErrors.fullName && <span className="error-message">{addressErrors.fullName}</span>}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email <span className="required">*</span></label>
                                <input type="email" value={shippingAddress.email}
                                    onChange={(e) => { setShippingAddress({ ...shippingAddress, email: e.target.value }); validateAddressField('email', e.target.value); }}
                                    className={addressErrors.email ? 'error' : ''} required placeholder="your@email.com" />
                                {addressErrors.email && <span className="error-message">{addressErrors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Phone <span className="required">*</span></label>
                                <input type="tel" value={shippingAddress.phone}
                                    onChange={(e) => { setShippingAddress({ ...shippingAddress, phone: e.target.value }); validateAddressField('phone', e.target.value); }}
                                    className={addressErrors.phone ? 'error' : ''} required placeholder="10-digit mobile number" maxLength="10" />
                                {addressErrors.phone && <span className="error-message">{addressErrors.phone}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Complete Address <span className="required">*</span></label>
                            <textarea value={shippingAddress.address}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                rows="3" placeholder="House no, Building, Street, Area, Landmark" required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City <span className="required">*</span></label>
                                <input type="text" value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} required placeholder="Enter city" />
                            </div>
                            <div className="form-group">
                                <label>State <span className="required">*</span></label>
                                <input type="text" value={shippingAddress.state}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} required placeholder="Enter state" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Postal Code <span className="required">*</span></label>
                                <input type="text" value={shippingAddress.postalCode}
                                    onChange={(e) => { setShippingAddress({ ...shippingAddress, postalCode: e.target.value }); validateAddressField('postalCode', e.target.value); }}
                                    className={addressErrors.postalCode ? 'error' : ''} required placeholder="Enter PIN code" maxLength="6" />
                                {addressErrors.postalCode && <span className="error-message">{addressErrors.postalCode}</span>}
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <select value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}>
                                    <option value="India">India</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                </select>
                            </div>
                        </div>
                        {token && (
                            <div className="additional-options">
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={markAsDefault} onChange={(e) => setMarkAsDefault(e.target.checked)} />
                                        <span>Set as default address</span>
                                    </label>
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={saveAddressAsNew} onChange={(e) => setSaveAddressAsNew(e.target.checked)} />
                                        <span>Save this address to my profile</span>
                                    </label>
                                </div>
                            </div>
                        )}
                        <div className="billing-address-section">
                            <div className="billing-toggle">
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} />
                                    <span>Billing address same as shipping address</span>
                                </label>
                            </div>
                            {!billingSameAsShipping && (
                                <div className="billing-address-form">
                                    <h4>Billing Address</h4>
                                    <div className="form-group"><label>Full Name *</label><input type="text" value={billingAddress.fullName}
                                        onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })} required /></div>
                                    <div className="form-group"><label>Address *</label><textarea value={billingAddress.address}
                                        onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })} rows="2" required /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>City *</label><input type="text" value={billingAddress.city}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} required /></div>
                                        <div className="form-group"><label>State *</label><input type="text" value={billingAddress.state}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Postal Code *</label><input type="text" value={billingAddress.postalCode}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })} required /></div>
                                        <div className="form-group"><label>Country</label>
                                            <select value={billingAddress.country} onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}>
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
                            {savedAddresses.length > 0 && <button type="button" className="btn-secondary" onClick={handleCancelNewAddress}>Cancel</button>}
                            <button type="submit" className="btn-primary">Save & Continue to Payment</button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    const renderPaymentStep = () => {
        return (
            <div className="payment-section">
                <h2>Select Payment Method</h2>
                <div className="payment-options-container">
                    <p className="payment-subtitle">Choose your preferred payment option:</p>
                    <div className="payment-options">
                        <div className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`} onClick={() => handlePaymentSelect("cod")}>
                            <div className="payment-option-content">
                                <div className="payment-icon-wrapper"><span className="payment-icon">💵</span></div>
                                <div className="payment-details">
                                    <h4>Cash on Delivery</h4>
                                    <p className="payment-description">Pay when you receive the product</p>
                                    <div className="payment-features">
                                        <span className="feature-badge">No extra charges</span>
                                        <span className="feature-badge">Pay at doorstep</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`payment-option ${paymentMethod === "razorpay" ? "selected" : ""}`} onClick={() => handlePaymentSelect("razorpay")}>
                            <div className="payment-option-content">
                                <div className="payment-icon-wrapper"><img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="razorpay-logo" /></div>
                                <div className="payment-details">
                                    <h4>Razorpay</h4>
                                    <p className="payment-description">Instant & Secure Online Payment</p>
                                    <div className="payment-features">
                                        <span className="feature-badge">Card/UPI/NetBanking</span>
                                    </div>
                                    <p className="payment-note">✅ 100% Secure | Instant Confirmation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setStep(1)}>← Back to Address</button>
                    {paymentMethod === "cod" && <button className="btn-primary" onClick={() => setStep(3)}>Continue to Review</button>}
                </div>
            </div>
        );
    };

    const renderReviewStep = () => {
        const totals = calculateTotals();
        return (
            <div className="review-section">
                <h2>Review Your Order</h2>
                {orderSuccess && (
                    <div className="order-success-message">
                        <div className="success-icon">✅</div>
                        <h3>Order Placed Successfully!</h3>
                        <p>Your order has been placed. Redirecting to confirmation...</p>
                    </div>
                )}
                <div className="review-section-grid">
                    <div className="review-address">
                        <div className="review-section-header">
                            <h3>Shipping Address</h3>
                            <button className="btn-edit" onClick={() => setStep(1)} disabled={orderSuccess}>✏️ Edit</button>
                        </div>
                        <div className="review-content">
                            <p><strong>{shippingAddress.fullName}</strong></p>
                            <p>{shippingAddress.address}</p>
                            <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                            <p>{shippingAddress.country}</p>
                            <p className="address-contact"><span>📞 {shippingAddress.phone}</span><span>✉️ {shippingAddress.email}</span></p>
                        </div>
                    </div>
                    <div className="review-payment">
                        <div className="review-section-header">
                            <h3>Payment Method</h3>
                            <button className="btn-edit" onClick={() => setStep(2)} disabled={orderSuccess}>✏️ Change</button>
                        </div>
                        <div className="review-content">
                            <div className="payment-method-display">
                                {paymentMethod === "cod" ? (
                                    <><span className="payment-icon">💵</span><span>Cash on Delivery</span></>
                                ) : (
                                    <><img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="razorpay-small-logo" /><span>Razorpay</span></>
                                )}
                            </div>
                            <p className="payment-status">{paymentMethod === "cod" ? "Pay on Delivery" : "Online Payment"}</p>
                        </div>
                    </div>
                </div>
                <div className="review-order-summary">
                    <h3>Order Summary</h3>
                    <div className="review-items">
                        {products.map((product, index) => (
                            <div key={index} className="review-item">
                                <div className="review-item-info">
                                    <span className="item-name">{product.name}</span>
                                    <span className="item-quantity">x{product.quantity || 1}</span>
                                    {product.selectedSize && <span className="item-variant">Size: {product.selectedSize}</span>}
                                    {product.selectedColor && <span className="item-variant">Color: {product.selectedColor}</span>}
                                </div>
                                <div className="review-item-price">₹{((product.finalPrice || product.price) * (product.quantity || 1)).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="review-totals">
                        <div className="total-row"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                        {totals.hasDiscount && <div className="total-row discount"><span>Discount ({promoDiscount}%)</span><span>-₹{totals.discount.toFixed(2)}</span></div>}
                        <div className="total-row"><span>Shipping</span><span>{totals.hasFreeShipping ? 'FREE' : `₹${totals.shipping.toFixed(2)}`}</span></div>
                        <div className="total-row"><span>Tax (GST)</span><span>₹{totals.tax.toFixed(2)}</span></div>
                        <div className="total-row grand-total"><span>Total</span><span>₹{totals.total.toFixed(2)}</span></div>
                    </div>
                </div>
                <div className="order-notes">
                    <h3>Order Notes (Optional)</h3>
                    <textarea placeholder="Add any special instructions" value={orderNote} onChange={(e) => setOrderNote(e.target.value)} rows="3" disabled={orderSuccess} />
                </div>
                <div className="terms-agreement">
                    <label className="checkbox-label">
                        <input type="checkbox" required disabled={orderSuccess} />
                        <span>I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a></span>
                    </label>
                </div>
                <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setStep(2)} disabled={placingOrder || orderSuccess}>← Back to Payment</button>
                    <button className="btn-primary btn-large" onClick={handlePlaceOrder} disabled={placingOrder || orderSuccess}>
                        {placingOrder ? <><span className="spinner-small"></span> Placing Order...</> :
                            orderSuccess ? "Order Placed ✓" : `Place Order • ₹${totals.total.toFixed(2)}`}
                    </button>
                </div>
                {emailSent && <div className="email-notification success"><p>✅ Order confirmation email sent to {shippingAddress.email}</p></div>}
                {emailError && <div className="email-notification error"><p>❌ Failed to send email: {emailError}</p></div>}
            </div>
        );
    };

    // ==================== MAIN RENDER ====================
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
                <button className="btn-primary" onClick={() => navigate("/products")}>Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1><span className="brand-name">Pankhudi</span> <span className="checkout-title">Secure Checkout</span></h1>
                <div className="checkout-steps">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className={`step ${step >= num ? "active" : ""} ${step > num ? "completed" : ""}`}>
                            <div className="circle">{step > num ? "✓" : num}</div>
                            <span>{num === 1 ? "Address" : num === 2 ? "Payment" : "Review"}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="checkout-content">
                <div className="checkout-form-column">
                    {step === 1 && renderAddressStep()}
                    {step === 2 && renderPaymentStep()}
                    {step === 3 && renderReviewStep()}
                </div>
                <div className="checkout-summary-column">
                    {renderProductSummary()}
                    <div className="checkout-security">
                        <div className="security-icon">🔒</div>
                        <div className="security-text">
                            <strong>100% Secure Checkout</strong>
                            <p>Your payment information is encrypted</p>
                        </div>
                    </div>
                    <div className="checkout-help">
                        <p className="help-title">Need help?</p>
                        <p className="help-phone">📞 +91 12345 67890</p>
                        <p className="help-email">✉️ support@pankhudi.com</p>
                        <p className="help-hours">Available 24/7</p>
                    </div>
                    <div className="email-info">
                        <p className="email-info-title">📧 Order Confirmation</p>
                        <p className="email-info-text">
                            Order details will be sent to: <strong>{shippingAddress.email || userDetails?.email || 'your email'}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;