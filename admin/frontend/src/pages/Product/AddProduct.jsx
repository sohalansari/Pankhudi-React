import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProduct.css";

const API = "http://localhost:5001";

export default function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        discount: "",
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
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: ""
    });
    const [categoryErrors, setCategoryErrors] = useState({});
    const [categoryLoading, setCategoryLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.price || form.price <= 0) newErrors.price = "Valid price is required";
        if (form.discount < 0 || form.discount > 100) newErrors.discount = "Discount must be between 0-100%";
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
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const onCategoryChange = e => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
        // Clear error when user starts typing
        if (categoryErrors[name]) {
            setCategoryErrors({ ...categoryErrors, [name]: "" });
        }
    };

    const onFiles = e => {
        const list = Array.from(e.target.files).slice(0, 4); // max 4 images
        setFiles(list);
        setPreviews(list.map(f => URL.createObjectURL(f)));
        // Clear image error when files are selected
        if (errors.images) {
            setErrors({ ...errors, images: "" });
        }
    };

    const removeImage = (index) => {
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
            alert("Product added successfully!");
            // Reset form
            setForm({
                name: "",
                description: "",
                price: "",
                discount: "",
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
            alert("Upload failed! " + (err.response?.data?.message || "Please check your connection."));
        } finally {
            setLoading(false);
        }
    };

    const addCategory = (e) => {
        e.preventDefault();

        if (!validateCategoryForm()) return;

        setCategoryLoading(true);

        // Simulate API call with timeout
        setTimeout(() => {
            // Create new category
            const newCat = {
                id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
                name: newCategory.name,
                description: newCategory.description
            };

            // Update categories list
            const updatedCategories = [...categories, newCat];
            setCategories(updatedCategories);

            // Set the newly created category as selected
            setForm({ ...form, category_id: newCat.id });

            alert("Category added successfully!");

            // Close modal and reset form
            setShowCategoryModal(false);
            setNewCategory({
                name: "",
                description: ""
            });

            setCategoryLoading(false);
        }, 800);
    };

    return (
        <div className="add-product-container">
            <h2>Add New Product</h2>
            <form className="add-product-form" onSubmit={submit}>
                <div className="form-group">
                    <label htmlFor="name">Product Name *</label>
                    <input
                        id="name"
                        name="name"
                        placeholder="Enter product name"
                        value={form.name}
                        onChange={onChange}
                        className={errors.name ? "error" : ""}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="price">Price ($) *</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="0.00"
                            value={form.price}
                            onChange={onChange}
                            min="0"
                            step="0.01"
                            className={errors.price ? "error" : ""}
                        />
                        {errors.price && <span className="error-text">{errors.price}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="discount">Discount (%)</label>
                        <input
                            id="discount"
                            name="discount"
                            type="number"
                            placeholder="0"
                            value={form.discount}
                            onChange={onChange}
                            min="0"
                            max="100"
                            className={errors.discount ? "error" : ""}
                        />
                        {errors.discount && <span className="error-text">{errors.discount}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="stock">Stock Quantity</label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            placeholder="0"
                            value={form.stock}
                            onChange={onChange}
                            min="0"
                            className={errors.stock ? "error" : ""}
                        />
                        {errors.stock && <span className="error-text">{errors.stock}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="brand">Brand</label>
                        <input
                            id="brand"
                            name="brand"
                            placeholder="Brand name"
                            value={form.brand}
                            onChange={onChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="category-header">
                        <label htmlFor="category_id">Category *</label>
                        <button
                            type="button"
                            className="add-category-btn"
                            onClick={() => setShowCategoryModal(true)}
                        >
                            + Add New Category
                        </button>
                    </div>
                    <select
                        id="category_id"
                        name="category_id"
                        value={form.category_id}
                        onChange={onChange}
                        className={errors.category_id ? "error" : ""}
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <span className="error-text">{errors.category_id}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Product description..."
                        value={form.description}
                        onChange={onChange}
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={onChange}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="images">Product Images *</label>
                    <div className="file-input-container">
                        <input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={onFiles}
                            className={errors.images ? "error" : ""}
                        />
                        <span className="file-input-label">Choose up to 4 images</span>
                    </div>
                    {errors.images && <span className="error-text">{errors.images}</span>}
                </div>

                {previews.length > 0 && (
                    <div className="image-previews">
                        <p>Selected Images:</p>
                        <div className="preview-container">
                            {previews.map((src, i) => (
                                <div key={i} className="preview-item">
                                    <img src={src} alt={`preview-${i}`} />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => removeImage(i)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className={`submit-btn ${loading ? "loading" : ""}`}
                    disabled={loading}
                >
                    {loading ? "Adding Product..." : "Add Product"}
                </button>
            </form>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New Category</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setNewCategory({ name: "", description: "" });
                                    setCategoryErrors({});
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form className="category-form" onSubmit={addCategory}>
                            <div className="form-group">
                                <label htmlFor="categoryName">Category Name *</label>
                                <input
                                    id="categoryName"
                                    name="name"
                                    placeholder="Enter category name"
                                    value={newCategory.name}
                                    onChange={onCategoryChange}
                                    className={categoryErrors.name ? "error" : ""}
                                />
                                {categoryErrors.name && <span className="error-text">{categoryErrors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryDescription">Description</label>
                                <textarea
                                    id="categoryDescription"
                                    name="description"
                                    placeholder="Category description (optional)"
                                    value={newCategory.description}
                                    onChange={onCategoryChange}
                                    rows="3"
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
                                    {categoryLoading ? "Adding..." : "Add Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}