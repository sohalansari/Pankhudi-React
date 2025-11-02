import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./CategoryPage.css";

const CategoryPage = () => {
    const { id } = useParams(); // category id from URL
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ✅ initialize navigate

    // Category Map (for display names)
    const categoryMap = {
        1: "Men's Clothing",
        2: "Women's Clothing",
        3: "Kids' Clothing",
        4: "Accessories",
        5: "Footwear",
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let res;
                if (id === "all") {
                    // ✅ Fetch all products
                    res = await axios.get(`http://localhost:5000/api/products`);
                } else {
                    // ✅ Fetch category-specific products
                    res = await axios.get(`http://localhost:5000/api/products/category/${id}`);
                }
                setProducts(res.data);
            } catch (error) {
                console.error("Error fetching category products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [id]);


    if (loading) return <p className="loading">Loading products...</p>;

    return (
        <>
            <Header />
            <div className="category-container">
                <h2>{categoryMap[id] || "Category"}</h2>
                <div className="product-grid">
                    {products.length > 0 ? (
                        products.map((p) => (
                            <div
                                key={p.id}
                                className="product-card"
                                onClick={() => navigate(`/ProductDetail/${p.id}`)}
                            >
                                <img src={p.image} alt={p.name} />
                                <h3>{p.name}</h3>
                                <p>{p.price} ₹</p>
                            </div>

                        ))
                    ) : (
                        <p>No products found in this category.</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CategoryPage;
