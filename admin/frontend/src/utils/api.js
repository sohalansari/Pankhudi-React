
// import axios from "axios";

// // Base URL of your backend API
// const api = axios.create({
//     baseURL: "http://localhost:5001/api",
//     withCredentials: true,
// });

// // ==================== ORDER MANAGEMENT APIs ====================

// // 📦 Get all orders with filters and pagination
// export async function getOrders(params = {}) {
//     try {
//         const response = await api.get("/orders", { params });
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//         throw error;
//     }
// }

// // 📊 Get order statistics
// export async function getOrderStats() {
//     try {
//         const response = await api.get("/orders/stats");
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error fetching order stats:", error);
//         throw error;
//     }
// }

// // 🔍 Get single order details by ID
// export async function getOrderDetails(orderId) {
//     try {
//         const response = await api.get(`/orders/${orderId}`);
//         return response.data;
//     } catch (error) {
//         console.error(`❌ Error fetching order ${orderId}:`, error);
//         throw error;
//     }
// }

// // ✏️ Update order status
// export async function updateOrderStatus(orderId, data) {
//     try {
//         const response = await api.put(`/orders/${orderId}/status`, data);
//         return response.data;
//     } catch (error) {
//         console.error(`❌ Error updating order ${orderId} status:`, error);
//         throw error;
//     }
// }

// // 💰 Update payment status
// export async function updatePaymentStatus(orderId, data) {
//     try {
//         const response = await api.put(`/orders/${orderId}/payment`, data);
//         return response.data;
//     } catch (error) {
//         console.error(`❌ Error updating order ${orderId} payment:`, error);
//         throw error;
//     }
// }

// // 📦 Add tracking information
// export async function addTracking(orderId, data) {
//     try {
//         const response = await api.post(`/orders/${orderId}/tracking`, data);
//         return response.data;
//     } catch (error) {
//         console.error(`❌ Error adding tracking to order ${orderId}:`, error);
//         throw error;
//     }
// }

// // 📥 Export orders to CSV
// export async function exportOrders(params = {}) {
//     try {
//         const response = await api.get("/orders/export", { params });
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error exporting orders:", error);
//         throw error;
//     }
// }

// // ==================== CART APIs (Your existing code) ====================

// // 🛒 Get all cart items
// export async function getCartItems() {
//     try {
//         const response = await api.get("/cart");
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error fetching cart items:", error);
//         throw error;
//     }
// }

// // 🛒 Add item to cart
// export async function addToCart(productId, quantity = 1) {
//     try {
//         const response = await api.post("/cart", { productId, quantity });
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error adding to cart:", error);
//         throw error;
//     }
// }

// // 🛒 Update cart item quantity
// export async function updateCartItem(cartItemId, quantity) {
//     try {
//         const response = await api.put(`/cart/${cartItemId}`, { quantity });
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error updating cart item:", error);
//         throw error;
//     }
// }

// // 🛒 Remove item from cart
// export async function removeFromCart(cartItemId) {
//     try {
//         const response = await api.delete(`/cart/${cartItemId}`);
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error removing from cart:", error);
//         throw error;
//     }
// }

// // 🛒 Clear entire cart
// export async function clearCart() {
//     try {
//         const response = await api.delete("/cart");
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error clearing cart:", error);
//         throw error;
//     }
// }

// // ==================== AUTH APIs (if needed) ====================

// // 🔐 Admin login
// export async function adminLogin(credentials) {
//     try {
//         const response = await api.post("/auth/login", credentials);
//         if (response.data.token) {
//             localStorage.setItem("adminToken", response.data.token);
//             // Set default authorization header for all future requests
//             api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
//         }
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error logging in:", error);
//         throw error;
//     }
// }

// // 🔐 Admin logout
// export async function adminLogout() {
//     try {
//         localStorage.removeItem("adminToken");
//         delete api.defaults.headers.common["Authorization"];
//         const response = await api.post("/auth/logout");
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error logging out:", error);
//         throw error;
//     }
// }

// // 🔐 Check if admin is authenticated
// export function isAuthenticated() {
//     return !!localStorage.getItem("adminToken");
// }

// // 🔐 Get current admin user
// export async function getCurrentAdmin() {
//     try {
//         const response = await api.get("/auth/me");
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error fetching current admin:", error);
//         throw error;
//     }
// }

// // ==================== INTERCEPTORS ====================

// // Add token to requests if available
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("adminToken");
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Handle response errors
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Unauthorized - clear token and redirect to login
//             localStorage.removeItem("adminToken");
//             delete api.defaults.headers.common["Authorization"];
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;













import axios from "axios";

// Base URL of your backend API
const api = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
});

// ==================== ORDER MANAGEMENT APIs ====================

// 📦 Get all orders with filters and pagination
export async function getOrders(params = {}) {
    try {
        const response = await api.get("/orders", { params });
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        throw error;
    }
}

// 📊 Get order statistics
export async function getOrderStats() {
    try {
        const response = await api.get("/orders/stats");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching order stats:", error);
        throw error;
    }
}

// 🔍 Get single order details by ID
export async function getOrderDetails(orderId) {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching order ${orderId}:`, error);
        throw error;
    }
}

// ✏️ Update order status
export async function updateOrderStatus(orderId, data) {
    try {
        const response = await api.put(`/orders/${orderId}/status`, data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error updating order ${orderId} status:`, error);
        throw error;
    }
}

// 💰 Update payment status
export async function updatePaymentStatus(orderId, data) {
    try {
        const response = await api.put(`/orders/${orderId}/payment`, data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error updating order ${orderId} payment:`, error);
        throw error;
    }
}

// 📦 Add tracking information
export async function addTracking(orderId, data) {
    try {
        const response = await api.post(`/orders/${orderId}/tracking`, data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error adding tracking to order ${orderId}:`, error);
        throw error;
    }
}

// 📥 Export orders to CSV
export async function exportOrders(params = {}) {
    try {
        const response = await api.get("/orders/export", { params });
        return response.data;
    } catch (error) {
        console.error("❌ Error exporting orders:", error);
        throw error;
    }
}

// 🔄 Get all return requests
export async function getReturns(params = {}) {
    try {
        const response = await api.get("/orders/returns", { params });
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching returns:", error);
        throw error;
    }
}

// 🔄 Update return request status
export async function updateReturnStatus(returnId, data) {
    try {
        const response = await api.put(`/orders/returns/${returnId}`, data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error updating return ${returnId}:`, error);
        throw error;
    }
}

// ==================== CART APIs ====================

// 🛒 Get all cart items
export async function getCartItems() {
    try {
        const response = await api.get("/cart");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching cart items:", error);
        throw error;
    }
}

// 🛒 Add item to cart
export async function addToCart(productId, quantity = 1, size = null, color = null) {
    try {
        const response = await api.post("/cart", { productId, quantity, size, color });
        return response.data;
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        throw error;
    }
}

// 🛒 Update cart item quantity
export async function updateCartItem(cartItemId, quantity) {
    try {
        const response = await api.put(`/cart/${cartItemId}`, { quantity });
        return response.data;
    } catch (error) {
        console.error("❌ Error updating cart item:", error);
        throw error;
    }
}

// 🛒 Remove item from cart
export async function removeFromCart(cartItemId) {
    try {
        const response = await api.delete(`/cart/${cartItemId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error removing from cart:", error);
        throw error;
    }
}

// 🛒 Clear entire cart
export async function clearCart() {
    try {
        const response = await api.delete("/cart");
        return response.data;
    } catch (error) {
        console.error("❌ Error clearing cart:", error);
        throw error;
    }
}

// ==================== AUTH APIs ====================

// 🔐 Admin login
export async function adminLogin(credentials) {
    try {
        const response = await api.post("/auth/login", credentials);
        if (response.data.token) {
            localStorage.setItem("adminToken", response.data.token);
            api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        }
        return response.data;
    } catch (error) {
        console.error("❌ Error logging in:", error);
        throw error;
    }
}

// 🔐 Admin logout
export async function adminLogout() {
    try {
        localStorage.removeItem("adminToken");
        delete api.defaults.headers.common["Authorization"];
        const response = await api.post("/auth/logout");
        return response.data;
    } catch (error) {
        console.error("❌ Error logging out:", error);
        throw error;
    }
}

// 🔐 Check if admin is authenticated
export function isAuthenticated() {
    return !!localStorage.getItem("adminToken");
}

// 🔐 Get current admin user
export async function getCurrentAdmin() {
    try {
        const response = await api.get("/auth/me");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching current admin:", error);
        throw error;
    }
}

// ==================== INTERCEPTORS ====================

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("adminToken");
            delete api.defaults.headers.common["Authorization"];
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;