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

// // 🔄 Get all return requests
// export async function getReturns(params = {}) {
//     try {
//         const response = await api.get("/orders/returns", { params });
//         return response.data;
//     } catch (error) {
//         console.error("❌ Error fetching returns:", error);
//         throw error;
//     }
// }

// // 🔄 Update return request status
// export async function updateReturnStatus(returnId, data) {
//     try {
//         const response = await api.put(`/orders/returns/${returnId}`, data);
//         return response.data;
//     } catch (error) {
//         console.error(`❌ Error updating return ${returnId}:`, error);
//         throw error;
//     }
// }

// // ==================== CART APIs ====================

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
// export async function addToCart(productId, quantity = 1, size = null, color = null) {
//     try {
//         const response = await api.post("/cart", { productId, quantity, size, color });
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

// // ==================== AUTH APIs ====================

// // 🔐 Admin login
// export async function adminLogin(credentials) {
//     try {
//         const response = await api.post("/auth/login", credentials);
//         if (response.data.token) {
//             localStorage.setItem("adminToken", response.data.token);
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
//             localStorage.removeItem("adminToken");
//             delete api.defaults.headers.common["Authorization"];
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;


// src/utils/api.js
import axios from "axios";

// Base URL of your backend API
const api = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==================== TOKEN MANAGEMENT ====================

// Get token from localStorage (unified key)
export const getToken = () => {
    // Try both possible token keys for compatibility
    return localStorage.getItem("token") || localStorage.getItem("adminToken");
};

// Set token in localStorage and axios headers
export const setToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("adminToken", token); // Keep both for compatibility
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        delete api.defaults.headers.common["Authorization"];
    }
};

// Clear all tokens
export const clearTokens = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    delete api.defaults.headers.common["Authorization"];
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Get user role from token
export const getUserRole = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        return decoded.role || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Check if user is admin
export const isAdmin = () => {
    return getUserRole() === 'admin';
};

// ==================== INTERCEPTORS ====================

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = getToken();
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
        // Handle 401 Unauthorized (token expired or invalid)
        if (error.response?.status === 401) {
            console.log('Unauthorized! Clearing tokens and redirecting...');
            clearTokens();
            window.location.href = "/login";
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.log('Access forbidden!');
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

// ==================== AUTH APIs ====================

// 🔐 Login (unified - works for both user and admin)
export async function login(credentials) {
    try {
        const response = await api.post("/auth/login", credentials);
        if (response.data.token) {
            setToken(response.data.token);

            // Store user info if available
            if (response.data.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }
        }
        return response.data;
    } catch (error) {
        console.error("❌ Error logging in:", error);
        throw error;
    }
}

// 🔐 Admin login (alias for backward compatibility)
export async function adminLogin(credentials) {
    return login(credentials);
}

// 🔐 Logout (unified - clears everything)
export async function logout() {
    try {
        // Optional: Call logout API to invalidate token on server
        const token = getToken();
        if (token) {
            await api.post("/auth/logout").catch(() => { });
        }
    } catch (error) {
        console.error("❌ Error during logout API call:", error);
    } finally {
        // Clear all tokens and storage
        clearTokens();

        // Clear any other application state if needed
        sessionStorage.clear();

        // Force reload to clear all cached data
        window.location.href = "/login";
    }
}

// 🔐 Admin logout (alias for backward compatibility)
export async function adminLogout() {
    return logout();
}

// 🔐 Get current authenticated user
export async function getCurrentUser() {
    try {
        const response = await api.get("/auth/me");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching current user:", error);
        throw error;
    }
}

// 🔐 Get current admin (alias for backward compatibility)
export async function getCurrentAdmin() {
    return getCurrentUser();
}

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

// ==================== REVIEW APIs ====================

// 📝 Get reviews for a product (public)
export async function getProductReviews(productId) {
    try {
        const response = await api.get(`/reviews/${productId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        throw error;
    }
}

// 📝 Add a review (authenticated)
export async function addReview(productId, rating, review) {
    try {
        const response = await api.post("/reviews", {
            product_id: productId,
            rating,
            review,
            approved: true
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error adding review:", error);
        throw error;
    }
}

// 📝 Delete own review (authenticated)
export async function deleteReview(reviewId) {
    try {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting review:", error);
        throw error;
    }
}

// 💬 Get replies for a review (public)
export async function getReviewReplies(reviewId) {
    try {
        const response = await api.get(`/reviews/${reviewId}/replies`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching replies:", error);
        throw error;
    }
}

// 💬 Add reply to a review (authenticated)
export async function addReply(reviewId, replyText) {
    try {
        const response = await api.post(`/reviews/${reviewId}/replies`, {
            reply_text: replyText
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error adding reply:", error);
        throw error;
    }
}

// ❤️ Like/unlike a reply (authenticated)
export async function likeReply(replyId) {
    try {
        const response = await api.post(`/reviews/replies/${replyId}/like`);
        return response.data;
    } catch (error) {
        console.error("❌ Error liking reply:", error);
        throw error;
    }
}

// ==================== ADMIN REVIEW APIs ====================

// 📊 Get admin review statistics
export async function getAdminReviewStats() {
    try {
        const response = await api.get("/reviews/admin/stats");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching admin review stats:", error);
        throw error;
    }
}

// 📋 Get all reviews (admin)
export async function getAllReviews(params = {}) {
    try {
        const response = await api.get("/reviews/admin/all", { params });
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching all reviews:", error);
        throw error;
    }
}

// ✏️ Moderate a review (admin)
export async function moderateReview(reviewId, approved) {
    try {
        const response = await api.patch(`/reviews/admin/${reviewId}/moderate`, { approved });
        return response.data;
    } catch (error) {
        console.error("❌ Error moderating review:", error);
        throw error;
    }
}

// ✏️ Update any review (admin)
export async function updateReviewAdmin(reviewId, data) {
    try {
        const response = await api.patch(`/reviews/admin/${reviewId}`, data);
        return response.data;
    } catch (error) {
        console.error("❌ Error updating review:", error);
        throw error;
    }
}

// 🗑️ Delete any review (admin)
export async function deleteReviewAdmin(reviewId) {
    try {
        const response = await api.delete(`/reviews/admin/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting review:", error);
        throw error;
    }
}

// 💬 Add admin reply (admin)
export async function addAdminReply(reviewId, reply) {
    try {
        const response = await api.post(`/reviews/admin/${reviewId}/reply`, { reply });
        return response.data;
    } catch (error) {
        console.error("❌ Error adding admin reply:", error);
        throw error;
    }
}

// 🔄 Bulk actions (admin)
export async function bulkReviewAction(action, reviewIds) {
    try {
        const response = await api.post("/reviews/admin/bulk", {
            action,
            review_ids: reviewIds
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error performing bulk action:", error);
        throw error;
    }
}

// 🗑️ Delete any user reply (admin)
export async function deleteUserReply(replyId) {
    try {
        const response = await api.delete(`/reviews/admin/replies/${replyId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting reply:", error);
        throw error;
    }
}

export default api;