import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./ManageProducts.css";

const API = "http://localhost:5001/api/products";

// Sample categories data - in a real app, you would fetch these from your API
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
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterStock, setFilterStock] = useState("all");
    const [filterRating, setFilterRating] = useState("all");
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
        setEditForm({ ...product });
        setNewImages([]);
    };

    // ✅ Close modal
    const closeEditModal = () => {
        setEditingProduct(null);
        setEditForm({});
        setNewImages([]);
    };

    // ✅ Save edit (with multiple image upload + rating)
    const saveEdit = async () => {
        try {
            const formData = new FormData();
            Object.keys(editForm).forEach((key) => {
                if (key !== "images") formData.append(key, editForm[key]);
            });
            formData.append("oldImages", JSON.stringify(editForm.images || []));
            newImages.forEach((img) => {
                formData.append("images", img);
            });

            await axios.put(`${API}/${editingProduct.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchProducts();
            closeEditModal();
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    // ✅ Remove old image
    const removeOldImage = (index) => {
        const updated = [...editForm.images];
        updated.splice(index, 1);
        setEditForm({ ...editForm, images: updated });
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
                String(p.category_id).includes(search);

            const matchesCategory = filterCategory ? p.category_id == filterCategory : true;
            const matchesBrand = filterBrand ? p.brand === filterBrand : true;
            const matchesStatus = filterStatus === "all" ? true : p.status === filterStatus;

            const matchesStock = filterStock === "all" ? true :
                filterStock === "low" ? p.stock < 10 :
                    filterStock === "out" ? p.stock === 0 : true;

            const matchesRating = filterRating === "all" ? true :
                Number(p.rating) >= Number(filterRating);

            return matchesSearch && matchesCategory && matchesBrand &&
                matchesStatus && matchesStock && matchesRating;
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
    }, [products, search, filterCategory, filterBrand, filterStatus, filterStock, filterRating, sortBy, sortOrder]);

    // ✅ Export products to CSV
    const exportToCSV = () => {
        const csv = Papa.unparse(products);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "products_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ✅ Import products from CSV
    const importCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                try {
                    await axios.post(`${API}/bulk`, results.data);
                    fetchProducts();
                    alert("Products imported successfully!");
                } catch (err) {
                    console.error("Import error:", err);
                }
            },
        });
    };

    // ✅ Clear all filters
    const clearFilters = () => {
        setSearch("");
        setFilterCategory("");
        setFilterBrand("");
        setFilterStatus("all");
        setFilterStock("all");
        setFilterRating("all");
    };

    return (
        <div className="manage-products-container">
            <div className="header-bar">
                <h2>Manage Products</h2>
                <div className="actions">
                    <button onClick={exportToCSV} className="btn btn-export">
                        <span className="icon">⬇</span> Export CSV
                    </button>
                    <label className="btn btn-import">
                        <span className="icon">⬆</span> Import CSV
                        <input type="file" accept=".csv" hidden onChange={importCSV} />
                    </label>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-panel">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
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
                    <label>Min Rating</label>
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                        <option value="all">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
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
                                <th>Images</th>
                                <th onClick={() => handleSort("name")}>
                                    Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>Description</th>
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedProducts.length > 0 ? (
                                filteredAndSortedProducts.map((p) => (
                                    <tr key={p.id} className={p.stock === 0 ? "out-of-stock" : p.stock < 10 ? "low-stock" : ""}>
                                        <td>{p.id}</td>
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
                                        <td>{p.name}</td>
                                        <td className="description-cell">{p.description?.slice(0, 40)}...</td>
                                        <td>₹{p.price}</td>
                                        <td>{p.discount}%</td>
                                        <td className={p.stock === 0 ? "stock-out" : p.stock < 10 ? "stock-low" : ""}>
                                            {p.stock}
                                        </td>
                                        <td>{CATEGORIES.find(c => c.id === p.category_id)?.name || p.category_id}</td>
                                        <td>{p.brand}</td>
                                        <td
                                            className={
                                                p.status === "active"
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {p.status}
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <span className="stars">{"⭐".repeat(Math.floor(p.rating))}</span>
                                                <span className="rating-value">{p.rating}</span>
                                            </div>
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
                                    <td colSpan="12" className="no-results">
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
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Product</h3>
                            <button className="modal-close" onClick={closeEditModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        value={editForm.name || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        value={editForm.price || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, price: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-row">
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
                                    <label>Category</label>
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

                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        value={editForm.brand || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, brand: e.target.value })
                                        }
                                    />
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={editForm.status || "active"}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

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
                            </div>

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
                                    onChange={(e) => setNewImages([...e.target.files])}
                                />
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