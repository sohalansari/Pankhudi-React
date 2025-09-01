// api.js
const API_BASE_URL = 'http://localhost:5001';

export const fetchProducts = async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    return res.json();
};
