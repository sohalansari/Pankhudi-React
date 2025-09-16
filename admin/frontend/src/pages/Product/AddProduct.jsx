// AddProduct.js
import React, { useState } from "react";
import axios from "axios";
import "./AddProduct.css";

const API = "http://localhost:5001";

export default function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        discount: "",
        rating: "0",
        stock: "",
        category_id: "",
        brand: "",
        status: "active"
    });
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [categories, setCategories] = useState([
        { id: 1, name: "Men's Clothing", description: "Clothing for men" },
        { id: 2, name: "Women's Clothing", description: "Clothing for women" },
        { id: 3, name: "Kids' Clothing", description: "Clothing for children" },
        { id: 4, name: "Accessories", description: "Fashion accessories" },
        { id: 5, name: "Footwear", description: "Shoes and footwear" }
    ]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [categoryErrors, setCategoryErrors] = useState({});
    const [categoryLoading, setCategoryLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.price || form.price <= 0) newErrors.price = "Valid price is required";
        if (form.discount < 0 || form.discount > 100) newErrors.discount = "Discount must be between 0–100%";
        if (form.rating < 0 || form.rating > 5) newErrors.rating = "Rating must be between 0 and 5";
        if (form.stock < 0) newErrors.stock = "Stock cannot be negative";
        if (!form.category_id) newErrors.category_id = "Category is required";
        if (files.length === 0) newErrors.images = "At least one image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateCategoryForm = () => {
        const newErrors = {};
        if (!newCategory.name.trim()) newErrors.name = "Category name is required";
        setCategoryErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const onCategoryChange = e => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
        if (categoryErrors[name]) setCategoryErrors({ ...categoryErrors, [name]: "" });
    };

    const onFiles = e => {
        const list = Array.from(e.target.files).slice(0, 4);
        setFiles(list);
        setPreviews(list.map(f => URL.createObjectURL(f)));
        if (errors.images) setErrors({ ...errors, images: "" });
    };

    const removeImage = index => {
        const newFiles = [...files];
        const newPreviews = [...previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const submit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const fd = new FormData();
        Object.entries(form).forEach(([key, val]) => fd.append(key, val));
        files.forEach(f => fd.append("images", f));

        try {
            const res = await axios.post(`${API}/api/products/add`, fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("✅ Product added successfully!");
            setForm({
                name: "",
                description: "",
                price: "",
                discount: "",
                rating: "0",
                stock: "",
                category_id: "",
                brand: "",
                status: "active"
            });
            setFiles([]);
            setPreviews([]);
            setErrors({});
            console.log(res.data);
        } catch (err) {
            console.error("Error:", err.response?.data || err.message);
            alert("❌ Upload failed! " + (err.response?.data?.message || "Please check your connection."));
        } finally {
            setLoading(false);
        }
    };

    const addCategory = e => {
        e.preventDefault();
        if (!validateCategoryForm()) return;

        setCategoryLoading(true);
        setTimeout(() => {
            const newCat = {
                id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
                name: newCategory.name,
                description: newCategory.description
            };

            setCategories([...categories, newCat]);
            setForm({ ...form, category_id: newCat.id });
            alert("✅ Category added successfully!");

            setShowCategoryModal(false);
            setNewCategory({ name: "", description: "" });
            setCategoryLoading(false);
        }, 800);
    };

    return (
        <div className="premium-container">
            <div className="premium-card">
                <h2 className="premium-title">Add New Product</h2>
                <p className="premium-subtitle">Fill in the details below to add a new product to your catalog</p>

                <form className="premium-form" onSubmit={submit}>
                    <div className="form-section">
                        <h3 className="section-title">Basic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Product Name *</label>
                                <input
                                    id="name"
                                    name="name"
                                    placeholder="Enter product name"
                                    value={form.name}
                                    onChange={onChange}
                                    className={`form-input ${errors.name ? "input-error" : ""}`}
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="brand" className="form-label">Brand</label>
                                <input
                                    id="brand"
                                    name="brand"
                                    placeholder="Brand name"
                                    value={form.brand}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Product description..."
                                value={form.description}
                                onChange={onChange}
                                rows="4"
                                className="form-textarea"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Pricing & Inventory</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="price" className="form-label">Price (₹) *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">₹</span>
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        placeholder="0.00"
                                        value={form.price}
                                        onChange={onChange}
                                        min="0"
                                        step="0.01"
                                        className={`form-input ${errors.price ? "input-error" : ""}`}
                                    />
                                </div>
                                {errors.price && <span className="error-text">{errors.price}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="discount" className="form-label">Discount (%)</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">%</span>
                                    <input
                                        id="discount"
                                        name="discount"
                                        type="number"
                                        placeholder="0"
                                        value={form.discount}
                                        onChange={onChange}
                                        min="0"
                                        max="100"
                                        className={`form-input ${errors.discount ? "input-error" : ""}`}
                                    />
                                </div>
                                {errors.discount && <span className="error-text">{errors.discount}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="stock" className="form-label">Stock Quantity</label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    placeholder="0"
                                    value={form.stock}
                                    onChange={onChange}
                                    min="0"
                                    className={`form-input ${errors.stock ? "input-error" : ""}`}
                                />
                                {errors.stock && <span className="error-text">{errors.stock}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="rating" className="form-label">Rating (0–5)</label>
                                <select
                                    id="rating"
                                    name="rating"
                                    value={form.rating}
                                    onChange={onChange}
                                    className={`form-select ${errors.rating ? "input-error" : ""}`}
                                >
                                    {["0", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "4.6", "4.7", "4.8", "4.9", "5"]
                                        .map(r => (
                                            <option key={r} value={r}>{r} {r !== "0" && "★"}</option>
                                        ))}
                                </select>
                                {errors.rating && <span className="error-text">{errors.rating}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Categorization</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <div className="category-header">
                                    <label htmlFor="category_id" className="form-label">Category *</label>
                                    <button
                                        type="button"
                                        className="add-category-btn"
                                        onClick={() => setShowCategoryModal(true)}
                                    >
                                        + Add New
                                    </button>
                                </div>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={onChange}
                                    className={`form-select ${errors.category_id ? "input-error" : ""}`}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <span className="error-text">{errors.category_id}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="status" className="form-label">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={onChange}
                                    className="form-select"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Product Images</h3>
                        <div className="form-group">
                            <label htmlFor="images" className="form-label">Upload Images *</label>
                            <div className="file-upload-area">
                                <input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={onFiles}
                                    className="file-input"
                                />
                                <div className="file-upload-content">
                                    <div className="file-upload-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                    </div>
                                    <p className="file-upload-text">Drag & drop images here or click to browse</p>
                                    <p className="file-upload-subtext">Up to 4 images (JPEG, PNG, WEBP)</p>
                                </div>
                            </div>
                            {errors.images && <span className="error-text">{errors.images}</span>}
                        </div>

                        {previews.length > 0 && (
                            <div className="image-previews">
                                <p className="preview-title">Selected Images:</p>
                                <div className="preview-grid">
                                    {previews.map((src, i) => (
                                        <div key={i} className="preview-item">
                                            <img src={src} alt={`preview-${i}`} />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(i)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${loading ? "loading" : ""}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Adding Product...
                            </>
                        ) : (
                            "Add Product"
                        )}
                    </button>
                </form>
            </div>

            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Add New Category</h3>
                                <button
                                    className="modal-close-btn"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setNewCategory({ name: "", description: "" });
                                        setCategoryErrors({});
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <form className="modal-form" onSubmit={addCategory}>
                                <div className="form-group">
                                    <label htmlFor="categoryName" className="form-label">Category Name *</label>
                                    <input
                                        id="categoryName"
                                        name="name"
                                        placeholder="Enter category name"
                                        value={newCategory.name}
                                        onChange={onCategoryChange}
                                        className={`form-input ${categoryErrors.name ? "input-error" : ""}`}
                                    />
                                    {categoryErrors.name && <span className="error-text">{categoryErrors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="categoryDescription" className="form-label">Description</label>
                                    <textarea
                                        id="categoryDescription"
                                        name="description"
                                        placeholder="Category description (optional)"
                                        value={newCategory.description}
                                        onChange={onCategoryChange}
                                        rows="3"
                                        className="form-textarea"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowCategoryModal(false);
                                            setNewCategory({ name: "", description: "" });
                                            setCategoryErrors({});
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`submit-btn ${categoryLoading ? "loading" : ""}`}
                                        disabled={categoryLoading}
                                    >
                                        {categoryLoading ? (
                                            <>
                                                <span className="spinner"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            "Add Category"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}