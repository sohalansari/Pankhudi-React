import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./ManageProducts.css";

const API = "http://localhost:5001/api/products";

// Sample categories data
const CATEGORIES = [
    { id: 1, name: "Men's Clothing", description: "Clothing for men" },
    { id: 2, name: "Women's Clothing", description: "Clothing for women" },
    { id: 3, name: "Kids' Clothing", description: "Clothing for children" },
    { id: 4, name: "Accessories", description: "Fashion accessories" },
    { id: 5, name: "Footwear", description: "Shoes and footwear" }
];

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [newVideo, setNewVideo] = useState(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterStock, setFilterStock] = useState("all");
    const [filterRating, setFilterRating] = useState("all");
    const [filterFeatured, setFilterFeatured] = useState("all");
    const [filterTrending, setFilterTrending] = useState("all");
    const [filterBestseller, setFilterBestseller] = useState("all");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Load products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API);
            setProducts(res.data);

            // Extract unique brands for filters
            const uniqueBrands = [...new Set(res.data.map(p => p.brand))].filter(Boolean);
            setBrands(uniqueBrands);
        } catch (err) {
            console.error("Error fetching:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ✅ Delete product
    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${API}/${id}`);
            setProducts(products.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // ✅ Start edit - opens modal
    const startEdit = (product) => {
        setEditingProduct(product);
        setEditForm({
            ...product,
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            colors: Array.isArray(product.colors) ? product.colors : [],
            features: Array.isArray(product.features) ? product.features : [],
            tags: Array.isArray(product.tags) ? product.tags : []
        });
        setNewImages([]);
        setNewVideo(null);
    };

    // ✅ Close modal
    const closeEditModal = () => {
        setEditingProduct(null);
        setEditForm({});
        setNewImages([]);
        setNewVideo(null);
    };

    // ✅ Save edit (with all new fields)
    const saveEdit = async () => {
        try {
            const formData = new FormData();

            // Append all form fields
            Object.keys(editForm).forEach((key) => {
                if (key !== "images" && key !== "video") {
                    if (Array.isArray(editForm[key])) {
                        // Append array fields as multiple entries
                        editForm[key].forEach(item => formData.append(key, item));
                    } else {
                        formData.append(key, editForm[key]);
                    }
                }
            });

            // Append old images and video
            formData.append("oldImages", JSON.stringify(editForm.images || []));
            if (editForm.video) {
                formData.append("oldVideo", editForm.video);
            }

            // Append new images
            newImages.forEach((img) => {
                formData.append("images", img);
            });

            // Append new video
            if (newVideo) {
                formData.append("video", newVideo);
            }

            await axios.put(`${API}/${editingProduct.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchProducts();
            closeEditModal();
            alert("Product updated successfully!");
        } catch (err) {
            console.error("Update error:", err);
            alert("Error updating product: " + (err.response?.data?.error || err.message));
        }
    };

    // ✅ Remove old image
    const removeOldImage = (index) => {
        const updated = [...editForm.images];
        updated.splice(index, 1);
        setEditForm({ ...editForm, images: updated });
    };

    // ✅ Remove video
    const removeVideo = () => {
        setEditForm({ ...editForm, video: null });
        setNewVideo(null);
    };

    // ✅ Handle array fields (sizes, colors, features)
    const handleArrayFieldChange = (field, value) => {
        const currentValues = [...(editForm[field] || [])];
        if (currentValues.includes(value)) {
            setEditForm({
                ...editForm,
                [field]: currentValues.filter(item => item !== value)
            });
        } else {
            setEditForm({
                ...editForm,
                [field]: [...currentValues, value]
            });
        }
    };

    // ✅ Handle tags input
    const handleTagsInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            const currentTags = [...(editForm.tags || [])];
            if (!currentTags.includes(newTag)) {
                setEditForm({
                    ...editForm,
                    tags: [...currentTags, newTag]
                });
            }
            e.target.value = '';
        }
    };

    // ✅ Remove tag
    const removeTag = (tagToRemove) => {
        setEditForm({
            ...editForm,
            tags: (editForm.tags || []).filter(tag => tag !== tagToRemove)
        });
    };

    // ✅ Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    // ✅ Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.brand?.toLowerCase().includes(search.toLowerCase()) ||
                p.sku?.toLowerCase().includes(search.toLowerCase()) ||
                String(p.category_id).includes(search);

            const matchesCategory = filterCategory ? p.category_id == filterCategory : true;
            const matchesBrand = filterBrand ? p.brand === filterBrand : true;
            const matchesStatus = filterStatus === "all" ? true : p.status === filterStatus;

            const matchesStock = filterStock === "all" ? true :
                filterStock === "low" ? p.stock < 10 :
                    filterStock === "out" ? p.stock === 0 : true;

            const matchesRating = filterRating === "all" ? true :
                Number(p.rating) >= Number(filterRating);

            const matchesFeatured = filterFeatured === "all" ? true :
                filterFeatured === "yes" ? p.is_featured : !p.is_featured;

            const matchesTrending = filterTrending === "all" ? true :
                filterTrending === "yes" ? p.is_trending : !p.is_trending;

            const matchesBestseller = filterBestseller === "all" ? true :
                filterBestseller === "yes" ? p.is_bestseller : !p.is_bestseller;

            return matchesSearch && matchesCategory && matchesBrand &&
                matchesStatus && matchesStock && matchesRating &&
                matchesFeatured && matchesTrending && matchesBestseller;
        });

        // Sort products
        return filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle numeric values
            if (sortBy === "price" || sortBy === "stock" || sortBy === "rating" || sortBy === "discount") {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [products, search, filterCategory, filterBrand, filterStatus, filterStock,
        filterRating, filterFeatured, filterTrending, filterBestseller, sortBy, sortOrder]);

    // ✅ Export products to CSV
    const exportToCSV = () => {
        const csvData = products.map(p => ({
            ID: p.id,
            SKU: p.sku,
            Name: p.name,
            Description: p.description,
            Price: p.price,
            Discount: p.discount,
            Rating: p.rating,
            Stock: p.stock,
            Brand: p.brand,
            Category: CATEGORIES.find(c => c.id === p.category_id)?.name || p.category_id,
            Status: p.status,
            'Is Featured': p.is_featured ? 'Yes' : 'No',
            'Is Trending': p.is_trending ? 'Yes' : 'No',
            'Is Bestseller': p.is_bestseller ? 'Yes' : 'No',
            Sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes,
            Colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors,
            Material: p.material,
            Features: Array.isArray(p.features) ? p.features.join(', ') : p.features,
            Tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "products_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ✅ Clear all filters
    const clearFilters = () => {
        setSearch("");
        setFilterCategory("");
        setFilterBrand("");
        setFilterStatus("all");
        setFilterStock("all");
        setFilterRating("all");
        setFilterFeatured("all");
        setFilterTrending("all");
        setFilterBestseller("all");
    };

    // Available options for sizes, colors, features
    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40"];
    const availableColors = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Gray", "Brown", "Multi-color"];
    const availableFeatures = ["Waterproof", "Eco-friendly", "Machine Washable", "Fast Drying", "Wrinkle Resistant", "Stain Resistant", "Breathable", "UV Protection"];

    return (
        <div className="manage-products-container">
            <div className="header-bar">
                <h2>Manage Products</h2>
                <div className="actions">
                    <button onClick={exportToCSV} className="btn btn-export">
                        <span className="icon">⬇</span> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-panel">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="🔍 Search by name, brand, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Brand</label>
                    <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
                        <option value="">All Brands</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Stock</label>
                    <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock (&lt;10)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Rating</label>
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                        <option value="all">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Featured</label>
                    <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
                        <option value="all">All</option>
                        <option value="yes">Featured</option>
                        <option value="no">Not Featured</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trending</label>
                    <select value={filterTrending} onChange={(e) => setFilterTrending(e.target.value)}>
                        <option value="all">All</option>
                        <option value="yes">Trending</option>
                        <option value="no">Not Trending</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Bestseller</label>
                    <select value={filterBestseller} onChange={(e) => setFilterBestseller(e.target.value)}>
                        <option value="all">All</option>
                        <option value="yes">Bestseller</option>
                        <option value="no">Not Bestseller</option>
                    </select>
                </div>

                <button onClick={clearFilters} className="btn btn-clear">
                    Clear Filters
                </button>
            </div>

            {/* Results Count */}
            <div className="results-info">
                <span>Showing {filteredAndSortedProducts.length} of {products.length} products</span>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("id")}>
                                    ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>SKU</th>
                                <th>Images</th>
                                <th onClick={() => handleSort("name")}>
                                    Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th onClick={() => handleSort("price")}>
                                    Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th onClick={() => handleSort("discount")}>
                                    Discount {sortBy === "discount" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th onClick={() => handleSort("stock")}>
                                    Stock {sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>Category</th>
                                <th>Brand</th>
                                <th>Status</th>
                                <th onClick={() => handleSort("rating")}>
                                    Rating {sortBy === "rating" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>Featured</th>
                                <th>Trending</th>
                                <th>Bestseller</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedProducts.length > 0 ? (
                                filteredAndSortedProducts.map((p) => (
                                    <tr key={p.id} className={p.stock === 0 ? "out-of-stock" : p.stock < 10 ? "low-stock" : ""}>
                                        <td>{p.id}</td>
                                        <td className="sku-cell">{p.sku}</td>
                                        <td>
                                            <div className="image-gallery">
                                                {p.images?.slice(0, 3).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={p.name}
                                                        className="product-thumb"
                                                    />
                                                ))}
                                                {p.images?.length > 3 && (
                                                    <span className="more-images">+{p.images.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="name-cell">{p.name}</td>
                                        <td>₹{p.price}</td>
                                        <td>{p.discount}%</td>
                                        <td className={p.stock === 0 ? "stock-out" : p.stock < 10 ? "stock-low" : ""}>
                                            {p.stock}
                                        </td>
                                        <td>{CATEGORIES.find(c => c.id === p.category_id)?.name || p.category_id}</td>
                                        <td>{p.brand}</td>
                                        <td className={`status-${p.status?.toLowerCase()}`}>
                                            {p.status}
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <span className="stars">{"⭐".repeat(Math.floor(p.rating))}</span>
                                                <span className="rating-value">{p.rating}</span>
                                            </div>
                                        </td>
                                        <td className="boolean-cell">
                                            {p.is_featured ? "✅" : "❌"}
                                        </td>
                                        <td className="boolean-cell">
                                            {p.is_trending ? "✅" : "❌"}
                                        </td>
                                        <td className="boolean-cell">
                                            {p.is_bestseller ? "✅" : "❌"}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn btn-edit" onClick={() => startEdit(p)}>✏ Edit</button>
                                                <button
                                                    className="btn btn-delete"
                                                    onClick={() => deleteProduct(p.id)}
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="15" className="no-results">
                                        <div className="no-results-content">
                                            <p>No products found matching your criteria</p>
                                            <button onClick={clearFilters} className="btn btn-clear">
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Edit Product - {editForm.name}</h3>
                            <button className="modal-close" onClick={closeEditModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-section">
                                <h4>Basic Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            value={editForm.name || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU *</label>
                                        <input
                                            value={editForm.sku || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, sku: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            value={editForm.brand || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, brand: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            value={editForm.category_id || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    category_id: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select Category</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="3"
                                        value={editForm.description || ""}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Pricing & Inventory</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={editForm.price || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, price: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount (%)</label>
                                        <input
                                            type="number"
                                            value={editForm.discount || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, discount: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            value={editForm.stock || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, stock: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <select
                                            value={editForm.rating || "0"}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    rating: e.target.value,
                                                })
                                            }
                                        >
                                            {[
                                                "0", "1", "1.5", "2", "2.5", "3",
                                                "3.5", "4", "4.5", "4.6", "4.7",
                                                "4.8", "4.9", "5"
                                            ].map((r) => (
                                                <option key={r} value={r}>
                                                    {r} {r !== "0" ? "⭐" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={editForm.status || "Active"}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="Active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Product Variants</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Sizes</label>
                                        <div className="checkbox-grid">
                                            {availableSizes.map(size => (
                                                <label key={size} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={(editForm.sizes || []).includes(size)}
                                                        onChange={() => handleArrayFieldChange('sizes', size)}
                                                    />
                                                    <span>{size}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Colors</label>
                                        <div className="checkbox-grid">
                                            {availableColors.map(color => (
                                                <label key={color} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={(editForm.colors || []).includes(color)}
                                                        onChange={() => handleArrayFieldChange('colors', color)}
                                                    />
                                                    <span>{color}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Specifications</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Material</label>
                                        <input
                                            value={editForm.material || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, material: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight</label>
                                        <input
                                            value={editForm.weight || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, weight: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dimensions</label>
                                        <input
                                            value={editForm.dimensions || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, dimensions: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Warranty</label>
                                        <input
                                            value={editForm.warranty || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, warranty: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Features</label>
                                    <div className="checkbox-grid">
                                        {availableFeatures.map(feature => (
                                            <label key={feature} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={(editForm.features || []).includes(feature)}
                                                    onChange={() => handleArrayFieldChange('features', feature)}
                                                />
                                                <span>{feature}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tags</label>
                                    <input
                                        type="text"
                                        placeholder="Type tag and press Enter"
                                        onKeyPress={handleTagsInput}
                                        className="tags-input"
                                    />
                                    <div className="tags-container">
                                        {(editForm.tags || []).map((tag, index) => (
                                            <span key={index} className="tag">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="tag-remove"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Marketing</h4>
                                <div className="form-row">
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_featured || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_featured: e.target.checked })
                                                }
                                            />
                                            <span>Featured Product</span>
                                        </label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_trending || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_trending: e.target.checked })
                                                }
                                            />
                                            <span>Trending Product</span>
                                        </label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_bestseller || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_bestseller: e.target.checked })
                                                }
                                            />
                                            <span>Bestseller Product</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Media</h4>
                                <div className="form-group">
                                    <label>Current Images</label>
                                    <div className="edit-images">
                                        {editForm.images?.map((img, i) => (
                                            <div key={i} className="img-wrapper">
                                                <img src={img} alt="" className="product-thumb" />
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeOldImage(i)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Add New Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setNewImages([...e.target.files])}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Product Video</label>
                                    {editForm.video && (
                                        <div className="video-preview">
                                            <video controls className="video-player">
                                                <source src={editForm.video} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            <button
                                                type="button"
                                                className="btn btn-remove-video"
                                                onClick={removeVideo}
                                            >
                                                Remove Video
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setNewVideo(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>SEO</h4>
                                <div className="form-group">
                                    <label>SEO Title</label>
                                    <input
                                        value={editForm.seo_title || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, seo_title: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SEO Description</label>
                                    <textarea
                                        rows="3"
                                        value={editForm.seo_description || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, seo_description: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Meta Keywords</label>
                                    <input
                                        value={editForm.meta_keywords || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, meta_keywords: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={closeEditModal}>Cancel</button>
                            <button className="btn btn-save" onClick={saveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}