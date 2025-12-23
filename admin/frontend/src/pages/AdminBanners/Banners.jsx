import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Banners.css';

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        position: 'home_top',
        display_order: 0,
        status: 'active',
        redirect_url: '',
        discount_tag: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');

    const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

    // ✅ Fetch banners
    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API}/api/banners/admin/all`, {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });

            if (response.data.success && Array.isArray(response.data.data)) {
                setBanners(response.data.data);
                toast.success(`Loaded ${response.data.data.length} banners`);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // ✅ Handle form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ Handle image upload - FIXED VERSION
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Max 5MB allowed.');
                e.target.value = ''; // Reset input
                return;
            }

            // Check file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid file type. Only JPEG, PNG, GIF, WebP allowed.');
                e.target.value = ''; // Reset input
                return;
            }

            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ✅ Custom file input click handler
    const triggerFileInput = () => {
        document.getElementById('imageInput').click();
    };

    // ✅ Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            position: 'home_top',
            display_order: banners.length + 1,
            status: 'active',
            redirect_url: '',
            discount_tag: '',
            image: null
        });
        setImagePreview('');
        setEditingBanner(null);
        // Reset file input
        if (document.getElementById('imageInput')) {
            document.getElementById('imageInput').value = '';
        }
    };

    // ✅ Open form for new banner
    const handleNewBanner = () => {
        resetForm();
        setShowForm(true);
    };

    // ✅ Open form for editing
    const handleEditBanner = (banner) => {
        setFormData({
            title: banner.title,
            description: banner.description || '',
            position: banner.position || 'home_top',
            display_order: banner.display_order || 0,
            status: banner.status || 'active',
            redirect_url: banner.redirect_url || '',
            discount_tag: banner.discount_tag || '',
            image: null
        });
        setImagePreview(banner.image_url || '');
        setEditingBanner(banner);
        setShowForm(true);
    };

    // ✅ Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Banner title is required');
            return;
        }

        if (!editingBanner && !formData.image) {
            toast.error('Please select an image');
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Add all form fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('position', formData.position);
            formDataToSend.append('display_order', formData.display_order);
            formDataToSend.append('status', formData.status);

            if (formData.redirect_url) {
                formDataToSend.append('redirect_url', formData.redirect_url);
            }

            if (formData.discount_tag) {
                formDataToSend.append('discount_tag', formData.discount_tag);
            }

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Authorization': 'Bearer admin-token',
                    'Content-Type': 'multipart/form-data'
                }
            };

            let response;
            if (editingBanner) {
                response = await axios.put(
                    `${API}/api/banners/admin/update/${editingBanner.id}`,
                    formDataToSend,
                    config
                );
            } else {
                response = await axios.post(
                    `${API}/api/banners/admin/create`,
                    formDataToSend,
                    config
                );
            }

            if (response.data.success) {
                toast.success(response.data.message || 'Operation successful');
                setShowForm(false);
                resetForm();
                fetchBanners();
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            toast.error(error.response?.data?.message || 'Failed to save banner');
        }
    };

    // ✅ Delete banner
    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) {
            return;
        }

        try {
            const response = await axios.delete(`${API}/api/banners/admin/delete/${id}`, {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });

            if (response.data.success) {
                toast.success('Banner deleted successfully');
                fetchBanners();
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Failed to delete banner');
        }
    };

    // ✅ Toggle status
    const handleToggleStatus = async (id) => {
        try {
            const response = await axios.patch(
                `${API}/api/banners/admin/toggle-status/${id}`,
                {},
                {
                    headers: {
                        'Authorization': 'Bearer admin-token'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Status updated');
                fetchBanners();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    // ✅ Available positions
    const positions = [
        { value: 'home_top', label: 'Home Page Top' },
        { value: 'home_middle', label: 'Home Page Middle' },
        { value: 'category_top', label: 'Category Page Top' },
        { value: 'product_page', label: 'Product Page' },
        { value: 'sidebar', label: 'Sidebar' }
    ];

    return (
        <div className="banner-management">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>📸 Banner Management</h1>
                    <p>Manage website banners and promotions</p>
                </div>
                <button className="btn btn-primary" onClick={handleNewBanner}>
                    + Add New Banner
                </button>
            </div>

            {/* Stats */}
            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-number">{banners.length}</span>
                    <span className="stat-label">Total Banners</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">
                        {banners.filter(b => b.status === 'active').length}
                    </span>
                    <span className="stat-label">Active</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">
                        {banners.filter(b => b.status === 'inactive').length}
                    </span>
                    <span className="stat-label">Inactive</span>
                </div>
            </div>

            {/* Banners List */}
            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading banners...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📷</div>
                    <h3>No Banners Found</h3>
                    <p>Create your first banner to get started</p>
                    <button className="btn btn-primary" onClick={handleNewBanner}>
                        Create Banner
                    </button>
                </div>
            ) : (
                <div className="banners-grid">
                    {banners.map(banner => (
                        <div key={banner.id} className="banner-card">
                            <div className="banner-image">
                                <img
                                    src={banner.image_url || 'https://via.placeholder.com/400x200'}
                                    alt={banner.title}
                                />
                                <div className="banner-badges">
                                    <span className={`status-badge ${banner.status}`}>
                                        {banner.status}
                                    </span>
                                    {banner.discount_tag && (
                                        <span className="discount-badge">
                                            {banner.discount_tag}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="banner-info">
                                <h3>{banner.title}</h3>
                                {banner.description && (
                                    <p className="description">{banner.description}</p>
                                )}

                                <div className="banner-meta">
                                    <span className="meta-item">
                                        Position: {banner.position}
                                    </span>
                                    <span className="meta-item">
                                        Order: {banner.display_order || 0}
                                    </span>
                                </div>

                                <div className="banner-actions">
                                    <button
                                        className="btn-icon btn-edit"
                                        onClick={() => handleEditBanner(banner)}
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-status"
                                        onClick={() => handleToggleStatus(banner.id)}
                                        title="Toggle Status"
                                    >
                                        {banner.status === 'active' ? '⏸️' : '▶️'}
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h2>
                            <button className="close-btn" onClick={() => { setShowForm(false); resetForm(); }}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="banner-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter banner title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Enter description"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Position</label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                    >
                                        {positions.map(pos => (
                                            <option key={pos.value} value={pos.value}>
                                                {pos.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={formData.display_order}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Redirect URL</label>
                                    <input
                                        type="url"
                                        name="redirect_url"
                                        value={formData.redirect_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Discount Tag</label>
                                    <input
                                        type="text"
                                        name="discount_tag"
                                        value={formData.discount_tag}
                                        onChange={handleInputChange}
                                        placeholder="50% OFF"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <div className="status-toggle">
                                    <button
                                        type="button"
                                        className={`status-btn ${formData.status === 'active' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        className={`status-btn ${formData.status === 'inactive' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>

                            {/* ✅ FIXED IMAGE UPLOAD SECTION */}
                            <div className="form-group">
                                <label>Banner Image {!editingBanner && '*'}</label>

                                {/* Hidden file input */}
                                <input
                                    id="imageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    required={!editingBanner}
                                />

                                {/* Custom upload area */}
                                <div
                                    className="image-upload-area"
                                    onClick={triggerFileInput}
                                >
                                    {imagePreview ? (
                                        <div className="image-preview-container">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="image-preview"
                                            />
                                            <div className="image-overlay">
                                                <span className="change-text">Click to change image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <div className="upload-icon">
                                                📁
                                            </div>
                                            <div className="upload-text">
                                                <p>Click to upload image</p>
                                                <p className="upload-hint">Max 5MB • JPG, PNG, GIF, WebP</p>
                                                <p className="upload-hint">Recommended: 1200x400px</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* File info */}
                                {formData.image && (
                                    <div className="file-info">
                                        <span>Selected: {formData.image.name}</span>
                                        <span>Size: {(formData.image.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;