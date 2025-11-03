import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./CategoryPage.css";

const CategoryPage = () => {
    const { id } = useParams(); // category id from URL
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // ✅ all categories
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Fetch categories and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get categories list
                const catRes = await axios.get("http://localhost:5000/api/categories");
                setCategories(catRes.data);

                // Get products (either all or by category)
                let prodRes;
                if (id === "all") {
                    prodRes = await axios.get("http://localhost:5000/api/products");
                } else {
                    prodRes = await axios.get(`http://localhost:5000/api/products/category/${id}`);
                }
                setProducts(prodRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // ✅ Find current category name dynamically
    const currentCategory =
        id === "all"
            ? "All Products"
            : categories.find((cat) => cat.id === parseInt(id))?.name || "Category";

    if (loading) return <p className="loading">Loading products...</p>;

    return (
        <>
            <Header />
            <div className="category-container">
                <h2>{currentCategory}</h2>
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
                                {/* ✅ Show category name on each product (optional) */}
                                {p.category_name && <small>{p.category_name}</small>}
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
