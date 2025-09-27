import axios from 'axios';
const API_BASE_URL = "http://localhost:5000/api";

// -------------------- Products --------------------
export const fetchProducts = async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
};

// -------------------- Cart --------------------

// Add to cart
export const addToCart = async (product_id, quantity = 1) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
};

// Fetch all cart items for a user
export const fetchCartItems = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return [];

    const res = await fetch(`${API_BASE_URL}/cart/${user.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Failed to fetch cart items");
    const data = await res.json();
    return data.items || [];
};

// Fetch cart count
export const fetchCartCount = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/count/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Failed to fetch cart count");
    return res.json(); // returns { count: number }
};

// Update cart item quantity
export const updateCartItem = async (cart_id, quantity) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/update/${cart_id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart item");
    return res.json();
};

// Remove a single cart item
export const removeCartItem = async (cart_id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/delete/${cart_id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Failed to remove cart item");
    return res.json();
};

// Clear entire cart for a user
export const clearCart = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return { message: "User not logged in" };

    const res = await fetch(`${API_BASE_URL}/cart/clear/${user.id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Failed to clear cart");
    return res.json();
};

// utils/api.js

export const searchProducts = async (query) => {
    const res = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}`);
    return res.json();
};

export const fetchTrendingProducts = async () => {
    const res = await fetch('http://localhost:5000/api/products/trending');
    return res.json();
};
