// AddProduct.js - UPDATED WITH FIXED CATEGORY ERROR
import React, { useState, useEffect } from "react";
import axios from "axios";
import MDEditor from '@uiw/react-md-editor';
import "./AddProduct.css";

const API = "http://localhost:5001";

export default function AddProduct() {
    // ✅ ENHANCED: Initial form state as a constant for easy reset
    const initialFormState = {
        name: "",
        description: "",
        short_description: "",
        price: "",
        discount: "",
        rating: "0",
        stock: "",
        category_id: "",
        sub_category_id: "",
        sub_sub_category_id: "",
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
        meta_keywords: "",
        return_policy: "",
        slug: "",
        min_order_quantity: "1",
        max_order_quantity: "",
        low_stock_threshold: "10",
        is_virtual: false,
        is_downloadable: false,
        download_link: "",
        shipping_class: "",
        tax_class: "",
        shipping_cost: "0",
        free_shipping: false
    };

    const [form, setForm] = useState(initialFormState);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    // Categories state - FIXED: Ensure arrays are always initialized
    const [categories, setCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [filteredSubSubCategories, setFilteredSubSubCategories] = useState([]);

    // Customizable options
    const [availableSizes, setAvailableSizes] = useState(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40"]);
    const [availableColors, setAvailableColors] = useState(["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Gray", "Brown", "Multi-color"]);
    const [availableFeatures, setAvailableFeatures] = useState(["Waterproof", "Eco-friendly", "Machine Washable", "Fast Drying", "Wrinkle Resistant", "Stain Resistant", "Breathable", "UV Protection"]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Modals state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [showSubSubCategoryModal, setShowSubSubCategoryModal] = useState(false);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);

    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [newSubCategory, setNewSubCategory] = useState({ name: "", description: "", category_id: "" });
    const [newSubSubCategory, setNewSubSubCategory] = useState({ name: "", description: "", sub_category_id: "" });
    const [newSize, setNewSize] = useState("");
    const [newColor, setNewColor] = useState("");
    const [newFeature, setNewFeature] = useState("");

    const [categoryErrors, setCategoryErrors] = useState({});
    const [subCategoryErrors, setSubCategoryErrors] = useState({});
    const [subSubCategoryErrors, setSubSubCategoryErrors] = useState({});
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [subCategoryLoading, setSubCategoryLoading] = useState(false);
    const [subSubCategoryLoading, setSubSubCategoryLoading] = useState(false);

    // ✅ NEW: Success state to show confirmation
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch categories from database on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch sub-categories when category changes
    useEffect(() => {
        if (form.category_id) {
            fetchSubCategories(form.category_id);
        } else {
            setFilteredSubCategories([]);
            setFilteredSubSubCategories([]);
            setForm(prev => ({
                ...prev,
                sub_category_id: "",
                sub_sub_category_id: ""
            }));
        }
    }, [form.category_id]);

    // Fetch sub-sub-categories when sub-category changes
    useEffect(() => {
        if (form.sub_category_id) {
            fetchSubSubCategories(form.sub_category_id);
        } else {
            setFilteredSubSubCategories([]);
            setForm(prev => ({ ...prev, sub_sub_category_id: "" }));
        }
    }, [form.sub_category_id]);

    // Auto-generate slug from product name
    useEffect(() => {
        if (form.name && !form.slug) {
            const generatedSlug = form.name
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setForm(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [form.name]);

    // Fetch categories from backend - FIXED VERSION
    const fetchCategories = async () => {
        try {
            console.log('🔄 Fetching categories...');
            const response = await axios.get(`${API}/api/categories`);

            if (response.data.success) {
                setCategories(response.data.data || []); // ✅ Ensure array
                console.log(`✅ Loaded ${(response.data.data || []).length} categories`);
            } else {
                console.error('❌ Failed to fetch categories:', response.data.message);
                setCategories([]); // ✅ Set empty array on error
            }
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            setCategories([]); // ✅ Set empty array on error
        }
    };

    // Fetch sub-categories from backend - FIXED VERSION
    const fetchSubCategories = async (categoryId) => {
        try {
            console.log(`🔄 Fetching sub-categories for category: ${categoryId}`);

            // ✅ UPDATED: Use correct API endpoint for filtered sub-categories
            const response = await axios.get(`${API}/api/subcategories?category_id=${categoryId}`);

            console.log('Sub-categories API response:', response.data);

            if (response.data.success) {
                setFilteredSubCategories(response.data.data || []); // ✅ Ensure array
                setForm(prev => ({
                    ...prev,
                    sub_category_id: "",
                    sub_sub_category_id: ""
                }));
                console.log(`✅ Loaded ${(response.data.data || []).length} sub-categories`);
            } else {
                console.error('❌ Failed to fetch sub-categories:', response.data.message);
                setFilteredSubCategories([]); // ✅ Set empty array on error
            }
        } catch (error) {
            console.error('❌ Error fetching sub-categories:', error);
            console.error('Error details:', error.response?.data || error.message);
            setFilteredSubCategories([]); // ✅ Set empty array on error
        }
    };

    // Fetch sub-sub-categories from backend - FIXED VERSION
    const fetchSubSubCategories = async (subCategoryId) => {
        try {
            console.log(`🔄 Fetching sub-sub-categories for sub-category: ${subCategoryId}`);

            // ✅ UPDATED: Use correct API endpoint
            const response = await axios.get(`${API}/api/subsubcategories?sub_category_id=${subCategoryId}`);

            console.log('Sub-sub-categories API response:', response.data);

            if (response.data.success) {
                setFilteredSubSubCategories(response.data.data || []); // ✅ Ensure array
                setForm(prev => ({ ...prev, sub_sub_category_id: "" }));
                console.log(`✅ Loaded ${(response.data.data || []).length} sub-sub-categories`);
            } else {
                console.error('❌ Failed to fetch sub-sub-categories:', response.data.message);
                setFilteredSubSubCategories([]); // ✅ Set empty array on error
            }
        } catch (error) {
            console.error('❌ Error fetching sub-sub-categories:', error);
            console.error('Error details:', error.response?.data || error.message);
            setFilteredSubSubCategories([]); // ✅ Set empty array on error
        }
    };

    // ✅ ENHANCED: Complete form reset function
    const resetForm = () => {
        setForm(initialFormState);
        setFiles([]);

        // Clean up all preview URLs to prevent memory leaks
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);

        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }
        setVideoFile(null);
        setVideoPreview(null);

        setErrors({});

        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });
    };

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
        if (form.min_order_quantity < 1) newErrors.min_order_quantity = "Minimum order quantity must be at least 1";
        if (form.max_order_quantity && form.max_order_quantity < form.min_order_quantity) {
            newErrors.max_order_quantity = "Maximum order quantity must be greater than minimum";
        }
        if (form.low_stock_threshold < 0) newErrors.low_stock_threshold = "Low stock threshold cannot be negative";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateCategoryForm = () => {
        const newErrors = {};
        if (!newCategory.name.trim()) newErrors.name = "Category name is required";
        setCategoryErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSubCategoryForm = () => {
        const newErrors = {};
        if (!newSubCategory.name.trim()) newErrors.name = "Sub-category name is required";
        if (!newSubCategory.category_id) newErrors.category_id = "Please select a category";
        setSubCategoryErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSubSubCategoryForm = () => {
        const newErrors = {};
        if (!newSubSubCategory.name.trim()) newErrors.name = "Sub-sub-category name is required";
        if (!newSubSubCategory.sub_category_id) newErrors.sub_category_id = "Please select a sub-category";
        setSubSubCategoryErrors(newErrors);
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

    const onSubCategoryChange = e => {
        const { name, value } = e.target;
        setNewSubCategory({ ...newSubCategory, [name]: value });
        if (subCategoryErrors[name]) setSubCategoryErrors({ ...subCategoryErrors, [name]: "" });
    };

    const onSubSubCategoryChange = e => {
        const { name, value } = e.target;
        setNewSubSubCategory({ ...newSubSubCategory, [name]: value });
        if (subSubCategoryErrors[name]) setSubSubCategoryErrors({ ...subSubCategoryErrors, [name]: "" });
    };

    // Markdown editor change handler
    const handleDescriptionChange = (value) => {
        setForm({ ...form, description: value });
        if (errors.description) setErrors({ ...errors, description: "" });
    };

    // ✅ ENHANCED: Image files handler - Admin can select multiple images at once
    const onFiles = e => {
        const selectedFiles = Array.from(e.target.files);

        // Check if adding new files would exceed the limit
        const totalFiles = files.length + selectedFiles.length;
        if (totalFiles > 10) {
            alert("Maximum 10 images allowed. You can select up to " + (10 - files.length) + " more images.");
            return;
        }

        // Combine existing files with new ones
        const updatedFiles = [...files, ...selectedFiles.slice(0, 10 - files.length)];
        setFiles(updatedFiles);

        // Create previews for all files
        const updatedPreviews = updatedFiles.map(f => URL.createObjectURL(f));
        setPreviews(updatedPreviews);

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

        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const removeVideo = () => {
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }
        setVideoFile(null);
        setVideoPreview(null);
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

    // Add new category with database
    const addCategory = async e => {
        e.preventDefault();
        if (!validateCategoryForm()) return;

        setCategoryLoading(true);
        try {
            const response = await axios.post(`${API}/api/categories`, newCategory);

            if (response.data.success) {
                // Refresh categories list
                await fetchCategories();
                // Set the new category as selected
                setForm({ ...form, category_id: response.data.data.id });

                alert("✅ Category added successfully!");
                setShowCategoryModal(false);
                setNewCategory({ name: "", description: "" });
            } else {
                alert("❌ " + response.data.message);
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert("❌ Error adding category!");
        } finally {
            setCategoryLoading(false);
        }
    };

    // Add new sub-category with database
    const addNewSubCategory = async e => {
        e.preventDefault();
        if (!validateSubCategoryForm()) return;

        setSubCategoryLoading(true);
        try {
            const response = await axios.post(`${API}/api/subcategories`, newSubCategory);

            if (response.data.success) {
                // Refresh sub-categories list
                await fetchSubCategories(form.category_id);
                // Set the new sub-category as selected
                setForm(prev => ({ ...prev, sub_category_id: response.data.data.id }));

                alert("✅ Sub-category added successfully!");
                setShowSubCategoryModal(false);
                setNewSubCategory({ name: "", description: "", category_id: "" });
            } else {
                alert("❌ " + response.data.message);
            }
        } catch (error) {
            console.error('Error adding sub-category:', error);
            alert("❌ Error adding sub-category!");
        } finally {
            setSubCategoryLoading(false);
        }
    };

    // Add new sub-sub-category with database
    const addNewSubSubCategory = async e => {
        e.preventDefault();
        if (!validateSubSubCategoryForm()) return;

        setSubSubCategoryLoading(true);
        try {
            const response = await axios.post(`${API}/api/subsubcategories`, newSubSubCategory);

            if (response.data.success) {
                // Refresh sub-sub-categories list
                await fetchSubSubCategories(form.sub_category_id);
                // Set the new sub-sub-category as selected
                setForm(prev => ({ ...prev, sub_sub_category_id: response.data.data.id }));

                alert("✅ Sub-sub-category added successfully!");
                setShowSubSubCategoryModal(false);
                setNewSubSubCategory({ name: "", description: "", sub_category_id: "" });
            } else {
                alert("❌ " + response.data.message);
            }
        } catch (error) {
            console.error('Error adding sub-sub-category:', error);
            alert("❌ Error adding sub-sub-category!");
        } finally {
            setSubSubCategoryLoading(false);
        }
    };

    // Remove size from available sizes
    const removeSize = (sizeToRemove) => {
        if (window.confirm(`Are you sure you want to remove "${sizeToRemove}"?`)) {
            setAvailableSizes(availableSizes.filter(size => size !== sizeToRemove));
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
            setForm({
                ...form,
                features: form.features.filter(feature => feature !== featureToRemove)
            });
        }
    };

    // ✅ ENHANCED: Submit function with proper form reset
    const submit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const fd = new FormData();

        // ✅ FIXED: Append all form fields including sub_sub_category_id
        Object.entries(form).forEach(([key, val]) => {
            if (Array.isArray(val)) {
                val.forEach(item => fd.append(key, item));
            } else {
                fd.append(key, val);
            }
        });

        // ✅ ENHANCED: Append multiple image files - Admin can upload multiple images
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

            if (res.data.success) {
                // ✅ ENHANCED: Show success message and reset form
                setShowSuccess(true);

                // Reset the entire form
                resetForm();

                // Hide success message after 3 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);

            } else {
                alert("❌ " + res.data.message);
            }
        } catch (err) {
            console.error("Error:", err.response?.data || err.message);
            alert("❌ Upload failed! " + (err.response?.data?.message || "Please check your connection."));
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Function to add another product (reset form without success message)
    const addAnotherProduct = () => {
        resetForm();
        setShowSuccess(false);
    };

    return (
        <div className="premium-container">
            {/* ✅ ENHANCED: Success Message */}
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-message">
                        <div className="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h3 className="success-title">Product Added Successfully!</h3>
                        <p className="success-subtitle">Your product has been added to the catalog.</p>
                        <div className="success-actions">
                            <button
                                className="success-btn primary"
                                onClick={addAnotherProduct}
                            >
                                Add Another Product
                            </button>
                            <button
                                className="success-btn secondary"
                                onClick={() => window.location.href = '/products'}
                            >
                                View All Products
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                        {/* Short Description Field */}
                        <div className="form-group">
                            <label htmlFor="short_description" className="form-label">Short Description</label>
                            <textarea
                                id="short_description"
                                name="short_description"
                                placeholder="Brief description of the product (optional)"
                                value={form.short_description}
                                onChange={onChange}
                                rows="3"
                                className="form-textarea"
                            />
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
                                    style={{
                                        color: 'black',
                                        backgroundColor: 'white'
                                    }}
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

                        {/* Inventory Management Fields */}
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="min_order_quantity" className="form-label">Min Order Quantity</label>
                                <input
                                    id="min_order_quantity"
                                    name="min_order_quantity"
                                    type="number"
                                    placeholder="1"
                                    value={form.min_order_quantity}
                                    onChange={onChange}
                                    min="1"
                                    className={`form-input ${errors.min_order_quantity ? "input-error" : ""}`}
                                />
                                {errors.min_order_quantity && <span className="error-text">{errors.min_order_quantity}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="max_order_quantity" className="form-label">Max Order Quantity</label>
                                <input
                                    id="max_order_quantity"
                                    name="max_order_quantity"
                                    type="number"
                                    placeholder="No limit"
                                    value={form.max_order_quantity}
                                    onChange={onChange}
                                    min="1"
                                    className={`form-input ${errors.max_order_quantity ? "input-error" : ""}`}
                                />
                                {errors.max_order_quantity && <span className="error-text">{errors.max_order_quantity}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="low_stock_threshold" className="form-label">Low Stock Alert</label>
                                <input
                                    id="low_stock_threshold"
                                    name="low_stock_threshold"
                                    type="number"
                                    placeholder="10"
                                    value={form.low_stock_threshold}
                                    onChange={onChange}
                                    min="0"
                                    className={`form-input ${errors.low_stock_threshold ? "input-error" : ""}`}
                                />
                                {errors.low_stock_threshold && <span className="error-text">{errors.low_stock_threshold}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Categorization Section - FIXED: Safe array mapping */}
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
                                    {Array.isArray(categories) && categories.length > 0 ? (
                                        categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No categories available</option>
                                    )}
                                </select>
                                {errors.category_id && <span className="error-text">{errors.category_id}</span>}
                            </div>

                            <div className="form-group">
                                <div className="category-header">
                                    <label htmlFor="sub_category_id" className="form-label">Sub Category</label>
                                    <button
                                        type="button"
                                        className="add-category-btn"
                                        onClick={() => setShowSubCategoryModal(true)}
                                        disabled={!form.category_id}
                                    >
                                        + Add New
                                    </button>
                                </div>
                                <select
                                    id="sub_category_id"
                                    name="sub_category_id"
                                    value={form.sub_category_id}
                                    onChange={onChange}
                                    className={`form-select ${errors.sub_category_id ? "input-error" : ""}`}
                                    disabled={!form.category_id}
                                >
                                    <option value="">Select a sub-category</option>
                                    {Array.isArray(filteredSubCategories) && filteredSubCategories.length > 0 ? (
                                        filteredSubCategories.map(subCat => (
                                            <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No sub-categories available</option>
                                    )}
                                </select>
                                {!form.category_id && (
                                    <span className="help-text">Please select a category first</span>
                                )}
                                {errors.sub_category_id && <span className="error-text">{errors.sub_category_id}</span>}
                            </div>

                            <div className="form-group">
                                <div className="category-header">
                                    <label htmlFor="sub_sub_category_id" className="form-label">Sub-Sub Category</label>
                                    <button
                                        type="button"
                                        className="add-category-btn"
                                        onClick={() => setShowSubSubCategoryModal(true)}
                                        disabled={!form.sub_category_id}
                                    >
                                        + Add New
                                    </button>
                                </div>
                                <select
                                    id="sub_sub_category_id"
                                    name="sub_sub_category_id"
                                    value={form.sub_sub_category_id}
                                    onChange={onChange}
                                    className="form-select"
                                    disabled={!form.sub_category_id}
                                >
                                    <option value="">Select a sub-sub-category</option>
                                    {Array.isArray(filteredSubSubCategories) && filteredSubSubCategories.length > 0 ? (
                                        filteredSubSubCategories.map(subSubCat => (
                                            <option key={subSubCat.id} value={subSubCat.id}>{subSubCat.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No sub-sub-categories available</option>
                                    )}
                                </select>
                                {!form.sub_category_id && (
                                    <span className="help-text">Please select a sub-category first</span>
                                )}
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
                                {Array.isArray(availableSizes) && availableSizes.map(size => (
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
                                {Array.isArray(availableColors) && availableColors.map(color => (
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
                                {Array.isArray(availableFeatures) && availableFeatures.map(feature => (
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
                                    {Array.isArray(form.tags) && form.tags.map((tag, index) => (
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

                        {/* Return Policy Field */}
                        <div className="form-group">
                            <label htmlFor="return_policy" className="form-label">Return Policy</label>
                            <textarea
                                id="return_policy"
                                name="return_policy"
                                placeholder="Return policy details (optional)"
                                value={form.return_policy}
                                onChange={onChange}
                                rows="3"
                                className="form-textarea"
                            />
                        </div>
                    </div>

                    {/* Digital Product Section */}
                    <div className="form-section">
                        <h3 className="section-title">Digital Product Settings</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="checkbox-label-large">
                                    <input
                                        type="checkbox"
                                        name="is_virtual"
                                        checked={form.is_virtual}
                                        onChange={onChange}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Virtual Product (No shipping required)</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label-large">
                                    <input
                                        type="checkbox"
                                        name="is_downloadable"
                                        checked={form.is_downloadable}
                                        onChange={onChange}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Downloadable Product</span>
                                </label>
                            </div>
                        </div>

                        {form.is_downloadable && (
                            <div className="form-group">
                                <label htmlFor="download_link" className="form-label">Download Link</label>
                                <input
                                    id="download_link"
                                    name="download_link"
                                    placeholder="https://example.com/download/file.zip"
                                    value={form.download_link}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>
                        )}
                    </div>

                    {/* Shipping & Tax Section */}
                    <div className="form-section">
                        <h3 className="section-title">Shipping & Tax</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="shipping_class" className="form-label">Shipping Class</label>
                                <input
                                    id="shipping_class"
                                    name="shipping_class"
                                    placeholder="e.g., Standard, Express, Free"
                                    value={form.shipping_class}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tax_class" className="form-label">Tax Class</label>
                                <input
                                    id="tax_class"
                                    name="tax_class"
                                    placeholder="e.g., Standard, Reduced, Zero"
                                    value={form.tax_class}
                                    onChange={onChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="shipping_cost" className="form-label">Shipping Cost (₹)</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">₹</span>
                                    <input
                                        id="shipping_cost"
                                        name="shipping_cost"
                                        type="number"
                                        placeholder="0.00"
                                        value={form.shipping_cost}
                                        onChange={onChange}
                                        min="0"
                                        step="0.01"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label-large">
                                    <input
                                        type="checkbox"
                                        name="free_shipping"
                                        checked={form.free_shipping}
                                        onChange={onChange}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Free Shipping</span>
                                </label>
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

                        {/* Slug Field */}
                        <div className="form-group">
                            <label htmlFor="slug" className="form-label">URL Slug</label>
                            <input
                                id="slug"
                                name="slug"
                                placeholder="product-url-slug"
                                value={form.slug}
                                onChange={onChange}
                                className="form-input"
                            />
                            <span className="help-text">SEO-friendly URL (auto-generated from product name)</span>
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

                    {/* ✅ ENHANCED: Product Images Section - Multiple Image Upload */}
                    <div className="form-section">
                        <h3 className="section-title">Product Images</h3>
                        <div className="form-group">
                            <label htmlFor="images" className="form-label">
                                Upload Images *
                                <span className="help-text">(You can select multiple images at once - up to 10 images)</span>
                            </label>
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
                                    <p className="file-upload-subtext">Up to 10 images (JPEG, PNG, WEBP) - {files.length}/10 selected</p>
                                </div>
                            </div>
                            {errors.images && <span className="error-text">{errors.images}</span>}
                        </div>

                        {previews.length > 0 && (
                            <div className="image-previews">
                                <p className="preview-title">Selected Images ({previews.length}/10):</p>
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

            {/* All your modals remain exactly the same */}
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

            {/* Sub-Category Modal */}
            {showSubCategoryModal && (
                <SimpleModal
                    title="Add New Sub-Category"
                    onClose={() => {
                        setShowSubCategoryModal(false);
                        setNewSubCategory({ name: "", description: "", category_id: "" });
                        setSubCategoryErrors({});
                    }}
                >
                    <form className="modal-form" onSubmit={addNewSubCategory}>
                        <div className="form-group">
                            <label htmlFor="subCategoryName" className="form-label">Sub-Category Name *</label>
                            <input
                                id="subCategoryName"
                                name="name"
                                placeholder="Enter sub-category name"
                                value={newSubCategory.name}
                                onChange={onSubCategoryChange}
                                className={`form-input ${subCategoryErrors.name ? "input-error" : ""}`}
                            />
                            {subCategoryErrors.name && <span className="error-text">{subCategoryErrors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="subCategoryParent" className="form-label">Parent Category *</label>
                            <select
                                id="subCategoryParent"
                                name="category_id"
                                value={newSubCategory.category_id}
                                onChange={onSubCategoryChange}
                                className={`form-select ${subCategoryErrors.category_id ? "input-error" : ""}`}
                            >
                                <option value="">Select a category</option>
                                {Array.isArray(categories) && categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {subCategoryErrors.category_id && <span className="error-text">{subCategoryErrors.category_id}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="subCategoryDescription" className="form-label">Description</label>
                            <textarea
                                id="subCategoryDescription"
                                name="description"
                                placeholder="Sub-category description (optional)"
                                value={newSubCategory.description}
                                onChange={onSubCategoryChange}
                                rows="3"
                                className="form-textarea"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowSubCategoryModal(false);
                                    setNewSubCategory({ name: "", description: "", category_id: "" });
                                    setSubCategoryErrors({});
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`submit-btn ${subCategoryLoading ? "loading" : ""}`}
                                disabled={subCategoryLoading}
                            >
                                {subCategoryLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Adding...
                                    </>
                                ) : (
                                    "Add Sub-Category"
                                )}
                            </button>
                        </div>
                    </form>
                </SimpleModal>
            )}

            {/* Sub-Sub-Category Modal */}
            {showSubSubCategoryModal && (
                <SimpleModal
                    title="Add New Sub-Sub-Category"
                    onClose={() => {
                        setShowSubSubCategoryModal(false);
                        setNewSubSubCategory({ name: "", description: "", sub_category_id: "" });
                        setSubSubCategoryErrors({});
                    }}
                >
                    <form className="modal-form" onSubmit={addNewSubSubCategory}>
                        <div className="form-group">
                            <label htmlFor="subSubCategoryName" className="form-label">Sub-Sub-Category Name *</label>
                            <input
                                id="subSubCategoryName"
                                name="name"
                                placeholder="Enter sub-sub-category name"
                                value={newSubSubCategory.name}
                                onChange={onSubSubCategoryChange}
                                className={`form-input ${subSubCategoryErrors.name ? "input-error" : ""}`}
                            />
                            {subSubCategoryErrors.name && <span className="error-text">{subSubCategoryErrors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="subSubCategoryParent" className="form-label">Parent Sub-Category *</label>
                            <select
                                id="subSubCategoryParent"
                                name="sub_category_id"
                                value={newSubSubCategory.sub_category_id}
                                onChange={onSubSubCategoryChange}
                                className={`form-select ${subSubCategoryErrors.sub_category_id ? "input-error" : ""}`}
                            >
                                <option value="">Select a sub-category</option>
                                {Array.isArray(filteredSubCategories) && filteredSubCategories.map(subCat => (
                                    <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                                ))}
                            </select>
                            {subSubCategoryErrors.sub_category_id && <span className="error-text">{subSubCategoryErrors.sub_category_id}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="subSubCategoryDescription" className="form-label">Description</label>
                            <textarea
                                id="subSubCategoryDescription"
                                name="description"
                                placeholder="Sub-sub-category description (optional)"
                                value={newSubSubCategory.description}
                                onChange={onSubSubCategoryChange}
                                rows="3"
                                className="form-textarea"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowSubSubCategoryModal(false);
                                    setNewSubSubCategory({ name: "", description: "", sub_category_id: "" });
                                    setSubSubCategoryErrors({});
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`submit-btn ${subSubCategoryLoading ? "loading" : ""}`}
                                disabled={subSubCategoryLoading}
                            >
                                {subSubCategoryLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Adding...
                                    </>
                                ) : (
                                    "Add Sub-Sub-Category"
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