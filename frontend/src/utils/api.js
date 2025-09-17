const API_BASE_URL = "http://localhost:5000/api";

// -------------------- Products --------------------
export const fetchProducts = async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
};

// -------------------- Cart --------------------

// Add to cart
export const addToCart = async (user_id, product_id, quantity = 1) => {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, product_id, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
};

// Fetch all cart items for a user
export const fetchCart = async (user_id) => {
    const res = await fetch(`${API_BASE_URL}/cart/${user_id}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
};

// Update cart item quantity
export const updateCartItem = async (cart_id, quantity) => {
    const res = await fetch(`${API_BASE_URL}/cart/update/${cart_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart item");
    return res.json();
};

// Remove a single cart item
export const removeCartItem = async (cart_id) => {
    const res = await fetch(`${API_BASE_URL}/cart/remove/${cart_id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove item");
    return res.json();
};

// Clear entire cart for a user
export const clearCart = async (user_id) => {
    const res = await fetch(`${API_BASE_URL}/cart/clear/${user_id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear cart");
    return res.json();
};
