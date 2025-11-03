// AddProduct.js - UPDATED WITH CUSTOM FEATURES, COLORS AND SIZES
import React, { useState } from "react";
import axios from "axios";
import MDEditor from '@uiw/react-md-editor';
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
        status: "active",
        sizes: [],
        colors: [],
        material: "",
        weight: "",
        dimensions: "",
        warranty: "",
        features: [],
        tags: [],
        sku: "",
        is_featured: false,
        is_trending: false,
        is_bestseller: false,
        seo_title: "",
        seo_description: "",
        meta_keywords: ""
    });

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [categories, setCategories] = useState([
        { id: 1, name: "Men's Clothing", description: "Clothing for men" },
        { id: 2, name: "Women's Clothing", description: "Clothing for women" },
        { id: 3, name: "Kids' Clothing", description: "Clothing for children" },
        { id: 4, name: "Accessories", description: "Fashion accessories" },
        { id: 5, name: "Footwear", description: "Shoes and footwear" }
    ]);

    // Customizable options that admin can add to
    const [availableSizes, setAvailableSizes] = useState(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40"]);
    const [availableColors, setAvailableColors] = useState(["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Gray", "Brown", "Multi-color"]);
    const [availableFeatures, setAvailableFeatures] = useState(["Waterproof", "Eco-friendly", "Machine Washable", "Fast Drying", "Wrinkle Resistant", "Stain Resistant", "Breathable", "UV Protection"]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Modals state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);

    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [newSize, setNewSize] = useState("");
    const [newColor, setNewColor] = useState("");
    const [newFeature, setNewFeature] = useState("");

    const [categoryErrors, setCategoryErrors] = useState({});
    const [categoryLoading, setCategoryLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.description.trim()) newErrors.description = "Product description is required";
        if (!form.price || form.price <= 0) newErrors.price = "Valid price is required";
        if (form.discount < 0 || form.discount > 100) newErrors.discount = "Discount must be between 0–100%";
        if (form.rating < 0 || form.rating > 5) newErrors.rating = "Rating must be between 0 and 5";
        if (form.stock < 0) newErrors.stock = "Stock cannot be negative";
        if (!form.category_id) newErrors.category_id = "Category is required";
        if (files.length === 0) newErrors.images = "At least one image is required";
        if (!form.sku.trim()) newErrors.sku = "SKU is required";

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
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const onCategoryChange = e => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
        if (categoryErrors[name]) setCategoryErrors({ ...categoryErrors, [name]: "" });
    };

    // Markdown editor change handler
    const handleDescriptionChange = (value) => {
        setForm({ ...form, description: value });
        if (errors.description) setErrors({ ...errors, description: "" });
    };

    // Image files handler
    const onFiles = e => {
        const list = Array.from(e.target.files).slice(0, 4);
        setFiles(list);
        setPreviews(list.map(f => URL.createObjectURL(f)));
        if (errors.images) setErrors({ ...errors, images: "" });
    };

    // Video file handler
    const onVideoFile = e => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                alert("Please select a valid video file");
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                alert("Video file size should be less than 50MB");
                return;
            }

            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = index => {
        const newFiles = [...files];
        const newPreviews = [...previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const removeVideo = () => {
        setVideoFile(null);
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
            setVideoPreview(null);
        }
    };

    // Handle multiple selections (sizes, colors, features)
    const handleMultiSelect = (field, value) => {
        const currentValues = [...form[field]];
        if (currentValues.includes(value)) {
            setForm({
                ...form,
                [field]: currentValues.filter(item => item !== value)
            });
        } else {
            setForm({
                ...form,
                [field]: [...currentValues, value]
            });
        }
    };

    // Handle tags input
    const handleTagsInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (!form.tags.includes(newTag)) {
                setForm({
                    ...form,
                    tags: [...form.tags, newTag]
                });
            }
            e.target.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setForm({
            ...form,
            tags: form.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Add new size
    const addNewSize = (e) => {
        e.preventDefault();
        if (newSize.trim() && !availableSizes.includes(newSize.trim())) {
            setAvailableSizes([...availableSizes, newSize.trim()]);
            setNewSize("");
            setShowSizeModal(false);
            alert("✅ Size added successfully!");
        } else if (availableSizes.includes(newSize.trim())) {
            alert("❌ This size already exists!");
        }
    };

    // Add new color
    const addNewColor = (e) => {
        e.preventDefault();
        if (newColor.trim() && !availableColors.includes(newColor.trim())) {
            setAvailableColors([...availableColors, newColor.trim()]);
            setNewColor("");
            setShowColorModal(false);
            alert("✅ Color added successfully!");
        } else if (availableColors.includes(newColor.trim())) {
            alert("❌ This color already exists!");
        }
    };

    // Add new feature
    const addNewFeature = (e) => {
        e.preventDefault();
        if (newFeature.trim() && !availableFeatures.includes(newFeature.trim())) {
            setAvailableFeatures([...availableFeatures, newFeature.trim()]);
            setNewFeature("");
            setShowFeatureModal(false);
            alert("✅ Feature added successfully!");
        } else if (availableFeatures.includes(newFeature.trim())) {
            alert("❌ This feature already exists!");
        }
    };

    // Remove size from available sizes
    const removeSize = (sizeToRemove) => {
        if (window.confirm(`Are you sure you want to remove "${sizeToRemove}"?`)) {
            setAvailableSizes(availableSizes.filter(size => size !== sizeToRemove));
            // Also remove from selected sizes in form
            setForm({
                ...form,
                sizes: form.sizes.filter(size => size !== sizeToRemove)
            });
        }
    };

    // Remove color from available colors
    const removeColor = (colorToRemove) => {
        if (window.confirm(`Are you sure you want to remove "${colorToRemove}"?`)) {
            setAvailableColors(availableColors.filter(color => color !== colorToRemove));
            // Also remove from selected colors in form
            setForm({
                ...form,
                colors: form.colors.filter(color => color !== colorToRemove)
            });
        }
    };

    // Remove feature from available features
    const removeFeature = (featureToRemove) => {
        if (window.confirm(`Are you sure you want to remove "${featureToRemove}"?`)) {
            setAvailableFeatures(availableFeatures.filter(feature => feature !== featureToRemove));
            // Also remove from selected features in form
            setForm({
                ...form,
                features: form.features.filter(feature => feature !== featureToRemove)
            });
        }
    };

    const submit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const fd = new FormData();

        // Append all form fields
        Object.entries(form).forEach(([key, val]) => {
            if (Array.isArray(val)) {
                val.forEach(item => fd.append(key, item));
            } else {
                fd.append(key, val);
            }
        });

        // Append image files
        files.forEach(f => fd.append("images", f));

        // Append video file if exists
        if (videoFile) {
            fd.append("video", videoFile);
        }

        try {
            const res = await axios.post(`${API}/api/products/add`, fd, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("✅ Product added successfully!");
            // Reset form
            setForm({
                name: "",
                description: "",
                price: "",
                discount: "",
                rating: "0",
                stock: "",
                category_id: "",
                brand: "",
                status: "active",
                sizes: [],
                colors: [],
                material: "",
                weight: "",
                dimensions: "",
                warranty: "",
                features: [],
                tags: [],
                sku: "",
                is_featured: false,
                is_trending: false,
                is_bestseller: false,
                seo_title: "",
                seo_description: "",
                meta_keywords: ""
            });
            setFiles([]);
            setPreviews([]);
            setVideoFile(null);
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
                setVideoPreview(null);
            }
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
                    {/* Basic Information Section */}
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

                            <div className="form-group">
                                <label htmlFor="sku" className="form-label">SKU *</label>
                                <input
                                    id="sku"
                                    name="sku"
                                    placeholder="Product SKU"
                                    value={form.sku}
                                    onChange={onChange}
                                    className={`form-input ${errors.sku ? "input-error" : ""}`}
                                />
                                {errors.sku && <span className="error-text">{errors.sku}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Description *
                                <span className="help-text">(Use markdown for formatting: # Heading, **Bold**, *Italic*, - Lists)</span>
                            </label>
                            <div className={`md-editor-container ${errors.description ? "editor-error" : ""}`}>
                                <MDEditor
                                    value={form.description}
                                    onChange={handleDescriptionChange}
                                    height={200}
                                    preview="edit"
                                    className="md-editor"
                                />
                            </div>
                            {errors.description && <span className="error-text">{errors.description}</span>}
                        </div>
                    </div>

                    {/* Pricing & Inventory Section */}
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

                    {/* Product Variants Section */}
                    <div className="form-section">
                        <h3 className="section-title">Product Variants</h3>

                        {/* Sizes Section */}
                        <div className="form-group">
                            <div className="option-header">
                                <label className="form-label">Available Sizes</label>
                                <button
                                    type="button"
                                    className="add-option-btn"
                                    onClick={() => setShowSizeModal(true)}
                                >
                                    + Add New Size
                                </button>
                            </div>
                            <div className="multi-select-grid with-remove">
                                {availableSizes.map(size => (
                                    <div key={size} className="checkbox-item-with-remove">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.sizes.includes(size)}
                                                onChange={() => handleMultiSelect('sizes', size)}
                                                className="checkbox-input"
                                            />
                                            <span className="checkbox-text">{size}</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="remove-option-btn"
                                            onClick={() => removeSize(size)}
                                            title="Remove size"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Colors Section */}
                        <div className="form-group">
                            <div className="option-header">
                                <label className="form-label">Available Colors</label>
                                <button
                                    type="button"
                                    className="add-option-btn"
                                    onClick={() => setShowColorModal(true)}
                                >
                                    + Add New Color
                                </button>
                            </div>
                            <div className="multi-select-grid with-remove">
                                {availableColors.map(color => (
                                    <div key={color} className="checkbox-item-with-remove">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.colors.includes(color)}
                                                onChange={() => handleMultiSelect('colors', color)}
                                                className="checkbox-input"
                                            />
                                            <span className="checkbox-text">{color}</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="remove-option-btn"
                                            onClick={() => removeColor(color)}
                                            title="Remove color"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Specifications Section */}
                    <div className="form-section">
                        <h3 className="section-title">Product Specifications</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="material" className="form-label">Material</label>
                                <input
                                    id="material"
                                    name="material"
                                    placeholder="e.g., Cotton, Polyester, Leather"
                                    value={form.material}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="weight" className="form-label">Weight</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">⚖️</span>
                                    <input
                                        id="weight"
                                        name="weight"
                                        placeholder="e.g., 0.5 kg"
                                        value={form.weight}
                                        onChange={onChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="dimensions" className="form-label">Dimensions</label>
                                <input
                                    id="dimensions"
                                    name="dimensions"
                                    placeholder="e.g., 10x5x2 inches"
                                    value={form.dimensions}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="warranty" className="form-label">Warranty</label>
                                <input
                                    id="warranty"
                                    name="warranty"
                                    placeholder="e.g., 1 Year"
                                    value={form.warranty}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="form-group">
                            <div className="option-header">
                                <label className="form-label">Features</label>
                                <button
                                    type="button"
                                    className="add-option-btn"
                                    onClick={() => setShowFeatureModal(true)}
                                >
                                    + Add New Feature
                                </button>
                            </div>
                            <div className="multi-select-grid with-remove">
                                {availableFeatures.map(feature => (
                                    <div key={feature} className="checkbox-item-with-remove">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.features.includes(feature)}
                                                onChange={() => handleMultiSelect('features', feature)}
                                                className="checkbox-input"
                                            />
                                            <span className="checkbox-text">{feature}</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="remove-option-btn"
                                            onClick={() => removeFeature(feature)}
                                            title="Remove feature"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tags" className="form-label">Tags</label>
                            <div className="tags-input-container">
                                <input
                                    id="tags"
                                    type="text"
                                    placeholder="Type tag and press Enter"
                                    onKeyPress={handleTagsInput}
                                    className="form-input"
                                />
                                <div className="tags-container">
                                    {form.tags.map((tag, index) => (
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
                    </div>

                    {/* Marketing & SEO Section */}
                    <div className="form-section">
                        <h3 className="section-title">Marketing & SEO</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="checkbox-label-large">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={form.is_featured}
                                        onChange={onChange}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Featured Product</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label-large">
                                    <input
                                        type="checkbox"
                                        name="is_trending"
                                        checked={form.is_trending}
                                        onChange={onChange}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Trending Product</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label-large">
                                    <input
                                        type="checkbox"
                                        name="is_bestseller"
                                        checked={form.is_bestseller}
                                        onChange={onChange}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Best Seller</span>
                                </label>
                            </div>
                        </div>

                        {/* Video Upload Section */}
                        <div className="form-group">
                            <label htmlFor="video" className="form-label">Product Video</label>
                            <div className="video-upload-area">
                                <input
                                    id="video"
                                    type="file"
                                    accept="video/*"
                                    onChange={onVideoFile}
                                    className="file-input"
                                />
                                <div className="video-upload-content">
                                    <div className="video-upload-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                        </svg>
                                    </div>
                                    <p className="video-upload-text">Click to upload product video</p>
                                    <p className="video-upload-subtext">MP4, MOV, AVI (Max 50MB)</p>
                                </div>
                            </div>

                            {videoPreview && (
                                <div className="video-preview">
                                    <p className="preview-title">Video Preview:</p>
                                    <div className="video-preview-container">
                                        <video controls className="video-player">
                                            <source src={videoPreview} type={videoFile?.type} />
                                            Your browser does not support the video tag.
                                        </video>
                                        <button
                                            type="button"
                                            className="remove-video-btn"
                                            onClick={removeVideo}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                            Remove Video
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="seo_title" className="form-label">SEO Title</label>
                                <input
                                    id="seo_title"
                                    name="seo_title"
                                    placeholder="SEO optimized title"
                                    value={form.seo_title}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="seo_description" className="form-label">SEO Description</label>
                                <textarea
                                    id="seo_description"
                                    name="seo_description"
                                    placeholder="SEO meta description"
                                    value={form.seo_description}
                                    onChange={onChange}
                                    rows="3"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="meta_keywords" className="form-label">Meta Keywords</label>
                                <input
                                    id="meta_keywords"
                                    name="meta_keywords"
                                    placeholder="keyword1, keyword2, keyword3"
                                    value={form.meta_keywords}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categorization Section */}
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
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Images Section */}
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

            {/* Category Modal */}
            {showCategoryModal && (
                <SimpleModal
                    title="Add New Category"
                    onClose={() => {
                        setShowCategoryModal(false);
                        setNewCategory({ name: "", description: "" });
                        setCategoryErrors({});
                    }}
                >
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
                </SimpleModal>
            )}

            {/* Size Modal */}
            {showSizeModal && (
                <SimpleModal
                    title="Add New Size"
                    onClose={() => {
                        setShowSizeModal(false);
                        setNewSize("");
                    }}
                >
                    <form className="modal-form" onSubmit={addNewSize}>
                        <div className="form-group">
                            <label htmlFor="newSize" className="form-label">Size Name *</label>
                            <input
                                id="newSize"
                                type="text"
                                placeholder="e.g., XS, S, M, L, XL, 28, 30, etc."
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                className="form-input"
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowSizeModal(false);
                                    setNewSize("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!newSize.trim()}
                            >
                                Add Size
                            </button>
                        </div>
                    </form>
                </SimpleModal>
            )}

            {/* Color Modal */}
            {showColorModal && (
                <SimpleModal
                    title="Add New Color"
                    onClose={() => {
                        setShowColorModal(false);
                        setNewColor("");
                    }}
                >
                    <form className="modal-form" onSubmit={addNewColor}>
                        <div className="form-group">
                            <label htmlFor="newColor" className="form-label">Color Name *</label>
                            <input
                                id="newColor"
                                type="text"
                                placeholder="e.g., Red, Blue, Green, etc."
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="form-input"
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowColorModal(false);
                                    setNewColor("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!newColor.trim()}
                            >
                                Add Color
                            </button>
                        </div>
                    </form>
                </SimpleModal>
            )}

            {/* Feature Modal */}
            {showFeatureModal && (
                <SimpleModal
                    title="Add New Feature"
                    onClose={() => {
                        setShowFeatureModal(false);
                        setNewFeature("");
                    }}
                >
                    <form className="modal-form" onSubmit={addNewFeature}>
                        <div className="form-group">
                            <label htmlFor="newFeature" className="form-label">Feature Name *</label>
                            <input
                                id="newFeature"
                                type="text"
                                placeholder="e.g., Waterproof, Eco-friendly, etc."
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                className="form-input"
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowFeatureModal(false);
                                    setNewFeature("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!newFeature.trim()}
                            >
                                Add Feature
                            </button>
                        </div>
                    </form>
                </SimpleModal>
            )}
        </div>
    );
}

// Simple Modal Component for reusability
const SimpleModal = ({ title, onClose, children }) => (
    <div className="modal-overlay">
        <div className="modal-container">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button
                        className="modal-close-btn"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    </div>
);