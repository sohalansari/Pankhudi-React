import axios from "axios";

// Base URL of your backend API
const api = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
});

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

export default api;