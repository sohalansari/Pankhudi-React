import React, { useState, useEffect, useCallback } from 'react';
import './CategoryManagement.css';

const CategoryManagement = () => {
    // ============ STATE VARIABLES ============
    const [activeTab, setActiveTab] = useState('categories');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Data states
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([]);

    // Statistics state
    const [stats, setStats] = useState({
        categories: { total: 0, active: 0, latest: 'Loading...' },
        sub_categories: { total: 0, active: 0, latest: 'Loading...' },
        sub_sub_categories: { total: 0, active: 0, latest: 'Loading...' },
        summary: { total_items: 0, active_items: 0, last_updated: '' }
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [subCategoryFilter, setSubCategoryFilter] = useState('all');

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('add');

    // Form data
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        status: 'active',
        category_id: '',
        sub_category_id: '',
        image: null
    });

    // Image preview state
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState('');

    // Dropdown data
    const [categoriesList, setCategoriesList] = useState([]);
    const [subCategoriesList, setSubCategoriesList] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // ============ API BASE URL ============
    const API_URL = 'http://localhost:5001/api';
    const IMAGE_BASE_URL = 'http://localhost:5001';

    // ============ HELPER FUNCTIONS ============
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';

        // Check if it's already a full URL
        if (imagePath.startsWith('http')) return imagePath;

        // Check if it's a relative path starting with /uploads
        if (imagePath.startsWith('/uploads/')) {
            return `${IMAGE_BASE_URL}${imagePath}`;
        }

        // For old format or just filename
        let folder = '';
        if (activeTab === 'categories') folder = 'categories';
        else if (activeTab === 'subcategories') folder = 'sub_categories';
        else if (activeTab === 'subsubcategories') folder = 'sub_sub_categories';

        return `${IMAGE_BASE_URL}/uploads/${folder}/${imagePath}`;
    };

    const getImageUrlForItem = (imagePath, type) => {
        if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';

        if (imagePath.startsWith('http')) return imagePath;

        if (imagePath.startsWith('/uploads/')) {
            return `${IMAGE_BASE_URL}${imagePath}`;
        }

        let folder = '';
        if (type === 'category') folder = 'categories';
        else if (type === 'subcategory') folder = 'sub_categories';
        else if (type === 'subsubcategory') folder = 'sub_sub_categories';

        return `${IMAGE_BASE_URL}/uploads/${folder}/${imagePath}`;
    };

    // ============ STATISTICS FUNCTIONS ============
    const fetchGlobalStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/global-stats`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch global stats:', err);
        }
    }, []);

    // ============ FETCH FUNCTIONS ============
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                sortBy: 'id',
                sortOrder: 'DESC'
            }).toString();

            const response = await fetch(`${API_URL}/categories?${queryParams}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.success) {
                setCategories(data.data || []);
                setTotalItems(data.pagination?.totalItems || 0);
            } else {
                setError(data.message || 'Failed to fetch categories');
            }
        } catch (err) {
            console.error('Fetch categories error:', err);
            setError('Failed to fetch categories. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

    const fetchSubCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                category_id: categoryFilter === 'all' ? '' : categoryFilter,
                sortBy: 'id',
                sortOrder: 'DESC'
            }).toString();

            const response = await fetch(`${API_URL}/subcategories?${queryParams}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.success) {
                setSubCategories(data.data || []);
                setTotalItems(data.pagination?.totalItems || 0);
            } else {
                setError(data.message || 'Failed to fetch sub-categories');
            }
        } catch (err) {
            console.error('Fetch sub-categories error:', err);
            setError('Failed to fetch sub-categories. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, statusFilter, categoryFilter]);

    const fetchSubSubCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                sub_category_id: subCategoryFilter === 'all' ? '' : subCategoryFilter,
                sortBy: 'id',
                sortOrder: 'DESC'
            }).toString();

            const response = await fetch(`${API_URL}/subsubcategories?${queryParams}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.success) {
                setSubSubCategories(data.data || []);
                setTotalItems(data.pagination?.totalItems || 0);
            } else {
                setError(data.message || 'Failed to fetch sub-sub-categories');
            }
        } catch (err) {
            console.error('Fetch sub-sub-categories error:', err);
            setError('Failed to fetch sub-sub-categories. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, statusFilter, subCategoryFilter]);

    // ============ DROPDOWN FUNCTIONS ============
    const fetchCategoriesForDropdown = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/categories/list/all`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.success) {
                setCategoriesList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch categories dropdown error:', err);
        }
    }, []);

    const fetchAllSubCategoriesForDropdown = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/subcategories/list/all`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.success) {
                setSubCategoriesList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch all sub-categories dropdown error:', err);
        }
    }, []);

    // ============ IMAGE HANDLING FUNCTIONS ============
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        setExistingImage('');
    };

    // ============ FORM HANDLERS ============
    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            status: 'active',
            category_id: '',
            sub_category_id: '',
            image: null
        });
        setImagePreview(null);
        setExistingImage('');
        setFormMode('add');
        setShowForm(false);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openAddForm = () => {
        resetForm();
        setFormMode('add');
        setShowForm(true);

        if (activeTab === 'subsubcategories') {
            fetchAllSubCategoriesForDropdown();
        }
    };

    const openEditForm = (item) => {
        let formDataToSet = {
            id: item.id,
            name: item.name,
            description: item.description || '',
            status: item.status || 'active',
            category_id: item.category_id || '',
            sub_category_id: item.sub_category_id || '',
            image: null
        };

        if (activeTab === 'subcategories') {
            formDataToSet.category_id = item.category_id || '';
        } else if (activeTab === 'subsubcategories') {
            formDataToSet.sub_category_id = item.sub_category_id || '';
        }

        setFormData(formDataToSet);
        setExistingImage(item.image || '');

        // Set image preview
        if (item.image) {
            let type = '';
            if (activeTab === 'categories') type = 'category';
            else if (activeTab === 'subcategories') type = 'subcategory';
            else type = 'subsubcategory';

            setImagePreview(getImageUrlForItem(item.image, type));
        } else {
            setImagePreview(null);
        }

        setFormMode('edit');
        setShowForm(true);

        if (activeTab === 'subsubcategories') {
            fetchAllSubCategoriesForDropdown();
        }
    };

    // ============ CRUD OPERATIONS ============
    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate required fields
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (activeTab === 'subcategories' && !formData.category_id) {
            setError('Please select a category');
            return;
        }

        if (activeTab === 'subsubcategories' && !formData.sub_category_id) {
            setError('Please select a sub-category');
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Add common fields
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('status', formData.status);

            // Add parent IDs based on tab
            if (activeTab === 'subcategories') {
                formDataToSend.append('category_id', formData.category_id);
            } else if (activeTab === 'subsubcategories') {
                formDataToSend.append('sub_category_id', formData.sub_category_id);
            }

            // Add image if exists
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            let url = '';
            if (activeTab === 'categories') {
                url = `${API_URL}/categories`;
            } else if (activeTab === 'subcategories') {
                url = `${API_URL}/subcategories`;
            } else {
                url = `${API_URL}/subsubcategories`;
            }

            setLoading(true);
            const response = await fetch(url, {
                method: 'POST',
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message || 'Item added successfully!');
                setShowForm(false);
                resetForm();
                await refreshAllData();
            } else {
                setError(result.message || 'Failed to add item');
            }
        } catch (err) {
            console.error('Add error:', err);
            setError('Failed to add item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate required fields
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (activeTab === 'subcategories' && !formData.category_id) {
            setError('Please select a category');
            return;
        }

        if (activeTab === 'subsubcategories' && !formData.sub_category_id) {
            setError('Please select a sub-category');
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Add common fields
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('status', formData.status);

            // Add parent IDs based on tab
            if (activeTab === 'subcategories') {
                formDataToSend.append('category_id', formData.category_id);
            } else if (activeTab === 'subsubcategories') {
                formDataToSend.append('sub_category_id', formData.sub_category_id);
            }

            // Add image if exists
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            let url = '';
            if (activeTab === 'categories') {
                url = `${API_URL}/categories/${formData.id}`;
            } else if (activeTab === 'subcategories') {
                url = `${API_URL}/subcategories/${formData.id}`;
            } else {
                url = `${API_URL}/subsubcategories/${formData.id}`;
            }

            setLoading(true);
            const response = await fetch(url, {
                method: 'PUT',
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message || 'Item updated successfully!');
                setShowForm(false);
                resetForm();
                await refreshAllData();
            } else {
                setError(result.message || 'Failed to update item');
            }
        } catch (err) {
            console.error('Edit error:', err);
            setError('Failed to update item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        setError('');
        setSuccess('');

        try {
            let url = '';

            if (activeTab === 'categories') {
                url = `${API_URL}/categories/${id}`;
            } else if (activeTab === 'subcategories') {
                url = `${API_URL}/subcategories/${id}`;
            } else {
                url = `${API_URL}/subsubcategories/${id}`;
            }

            const response = await fetch(url, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                setSuccess(result.message || 'Item deleted successfully!');
                await refreshAllData();
            } else {
                setError(result.message || 'Failed to delete item');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete item. Please try again.');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setError('');
        setSuccess('');

        try {
            let url = '';

            if (activeTab === 'categories') {
                url = `${API_URL}/categories/${id}/status`;
            } else if (activeTab === 'subcategories') {
                url = `${API_URL}/subcategories/${id}/status`;
            } else {
                url = `${API_URL}/subsubcategories/${id}/status`;
            }

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message || 'Status updated successfully!');
                await refreshAllData();
            } else {
                setError(result.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Status update error:', err);
            setError('Failed to update status. Please try again.');
        }
    };

    // ============ UPDATE IMAGE FUNCTION ============
    const handleUpdateImage = async (id) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
                return;
            }

            try {
                const formDataToSend = new FormData();
                formDataToSend.append('image', file);

                let url = '';
                if (activeTab === 'categories') {
                    url = `${API_URL}/categories/${id}/image`;
                } else if (activeTab === 'subcategories') {
                    url = `${API_URL}/subcategories/${id}/image`;
                } else {
                    url = `${API_URL}/subsubcategories/${id}/image`;
                }

                const response = await fetch(url, {
                    method: 'PATCH',
                    body: formDataToSend
                });

                const result = await response.json();

                if (result.success) {
                    setSuccess('Image updated successfully!');
                    await refreshAllData();
                } else {
                    setError(result.message || 'Failed to update image');
                }
            } catch (err) {
                console.error('Update image error:', err);
                setError('Failed to update image. Please try again.');
            }
        };

        fileInput.click();
    };

    // ============ HELPER FUNCTIONS ============
    const refreshAllData = async () => {
        if (activeTab === 'categories') {
            await fetchCategories();
            await fetchCategoriesForDropdown();
        } else if (activeTab === 'subcategories') {
            await fetchSubCategories();
        } else {
            await fetchSubSubCategories();
            await fetchAllSubCategoriesForDropdown();
        }
        await fetchGlobalStats();
    };

    const handleSearch = () => {
        setCurrentPage(1);
        if (activeTab === 'categories') {
            fetchCategories();
        } else if (activeTab === 'subcategories') {
            fetchSubCategories();
        } else {
            fetchSubSubCategories();
        }
    };

    const handleFilterChange = () => {
        setCurrentPage(1);
        if (activeTab === 'categories') {
            fetchCategories();
        } else if (activeTab === 'subcategories') {
            fetchSubCategories();
        } else {
            fetchSubSubCategories();
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSubCategoryFilter('all');
        setCurrentPage(1);
        refreshAllData();
    };

    // ============ EFFECTS ============
    useEffect(() => {
        fetchCategoriesForDropdown();
        fetchGlobalStats();

        if (activeTab === 'subsubcategories') {
            fetchAllSubCategoriesForDropdown();
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'categories') {
            fetchCategories();
        } else if (activeTab === 'subcategories') {
            fetchSubCategories();
        } else {
            fetchSubSubCategories();
            fetchAllSubCategoriesForDropdown();
        }
    }, [activeTab, currentPage, itemsPerPage]);

    useEffect(() => {
        if (activeTab === 'subcategories') {
            fetchSubCategories();
        }
    }, [categoryFilter]);

    useEffect(() => {
        if (activeTab === 'subsubcategories') {
            fetchSubSubCategories();
        }
    }, [subCategoryFilter]);

    // ============ RENDER FUNCTIONS ============
    const renderStats = () => (
        <div className="stats-container">
            <div className="stat-card">
                <div className="stat-icon category-icon">
                    <i className="fas fa-layer-group"></i>
                </div>
                <div className="stat-info">
                    <h3>{stats.categories.total}</h3>
                    <p>Total Categories</p>
                    <div className="stat-details">
                        <span className="active-stat">{stats.categories.active} Active</span>
                        <span className="latest-stat">Latest: {stats.categories.latest}</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon subcategory-icon">
                    <i className="fas fa-sitemap"></i>
                </div>
                <div className="stat-info">
                    <h3>{stats.sub_categories.total}</h3>
                    <p>Total Sub-Categories</p>
                    <div className="stat-details">
                        <span className="active-stat">{stats.sub_categories.active} Active</span>
                        <span className="latest-stat">Latest: {stats.sub_categories.latest}</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon subsubcategory-icon">
                    <i className="fas fa-stream"></i>
                </div>
                <div className="stat-info">
                    <h3>{stats.sub_sub_categories.total}</h3>
                    <p>Total Sub-Sub-Categories</p>
                    <div className="stat-details">
                        <span className="active-stat">{stats.sub_sub_categories.active} Active</span>
                        <span className="latest-stat">Latest: {stats.sub_sub_categories.latest}</span>
                    </div>
                </div>
            </div>

            <div className="stat-card total-card">
                <div className="stat-icon total-icon">
                    <i className="fas fa-chart-pie"></i>
                </div>
                <div className="stat-info">
                    <h3>{stats.summary.total_items}</h3>
                    <p>Total Items</p>
                    <div className="stat-details">
                        <span className="active-stat">{stats.summary.active_items} Active</span>
                        <span className="inactive-stat">
                            {stats.summary.total_items - stats.summary.active_items} Inactive
                        </span>
                    </div>
                    <div className="stat-footer">
                        <small>Updated: {stats.summary.last_updated ?
                            new Date(stats.summary.last_updated).toLocaleTimeString() :
                            'Loading...'}</small>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabs = () => (
        <div className="tabs-container">
            <button
                className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
            >
                <i className="fas fa-list"></i> Categories ({stats.categories.total})
            </button>
            <button
                className={`tab-btn ${activeTab === 'subcategories' ? 'active' : ''}`}
                onClick={() => setActiveTab('subcategories')}
            >
                <i className="fas fa-sitemap"></i> Sub-Categories ({stats.sub_categories.total})
            </button>
            <button
                className={`tab-btn ${activeTab === 'subsubcategories' ? 'active' : ''}`}
                onClick={() => setActiveTab('subsubcategories')}
            >
                <i className="fas fa-stream"></i> Sub-Sub-Categories ({stats.sub_sub_categories.total})
            </button>
        </div>
    );

    const renderFilters = () => (
        <div className="filters-container">
            <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder={`Search ${activeTab} by name or description...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="search-btn">
                    Search
                </button>
            </div>

            <div className="filter-controls">
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        handleFilterChange();
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                </select>

                {activeTab === 'subcategories' && (
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            handleFilterChange();
                        }}
                    >
                        <option value="all">All Categories</option>
                        {categoriesList.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}

                {activeTab === 'subsubcategories' && (
                    <select
                        value={subCategoryFilter}
                        onChange={(e) => {
                            setSubCategoryFilter(e.target.value);
                            handleFilterChange();
                        }}
                    >
                        <option value="all">All Sub-Categories</option>
                        {subCategoriesList.map(subCat => (
                            <option key={subCat.id} value={subCat.id}>
                                {subCat.name} {subCat.category_name ? `(${subCat.category_name})` : ''}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                </select>

                <button onClick={handleRefresh} className="refresh-btn">
                    <i className="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        </div>
    );

    const renderForm = () => {
        if (!showForm) return null;

        const formTitle = formMode === 'add'
            ? `Add New ${activeTab.slice(0, -1).replace('subsub', 'Sub-Sub-').replace('sub', 'Sub-')}`
            : `Edit ${activeTab.slice(0, -1).replace('subsub', 'Sub-Sub-').replace('sub', 'Sub-')}`;

        return (
            <div className="form-modal-overlay" onClick={(e) => {
                if (e.target.className === 'form-modal-overlay') resetForm();
            }}>
                <div className="form-modal">
                    <div className="form-header">
                        <h3>{formTitle}</h3>
                        <button onClick={resetForm} className="close-btn">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={formMode === 'add' ? handleAdd : handleEdit}>
                        {formMode === 'edit' && (
                            <div className="form-group">
                                <label>ID</label>
                                <input
                                    type="text"
                                    name="id"
                                    value={formData.id}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter name"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter description (optional)"
                                rows="3"
                            />
                        </div>

                        {/* Image Upload Field */}
                        <div className="form-group">
                            <label>Image {formMode === 'edit' && '(Optional)'}</label>
                            <div className="image-upload-container">
                                {(imagePreview) && (
                                    <div className="image-preview-container">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="image-preview"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="clear-image-btn"
                                        >
                                            <i className="fas fa-times"></i> Remove
                                        </button>
                                    </div>
                                )}
                                <div className="file-upload-wrapper">
                                    <label htmlFor="image-upload" className="file-upload-label">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span>{formMode === 'edit' ? 'Change Image' : 'Choose Image'}</span>
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="file-input"
                                    />
                                    <p className="file-help-text">
                                        Supports: JPG, PNG, GIF, WebP | Max: 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'subcategories' && (
                            <div className="form-group">
                                <label>Parent Category *</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categoriesList.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {activeTab === 'subsubcategories' && (
                            <div className="form-group">
                                <label>Parent Sub-Category *</label>
                                <select
                                    name="sub_category_id"
                                    value={formData.sub_category_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Sub-Category</option>
                                    {subCategoriesList.length > 0 ? (
                                        subCategoriesList.map(subCat => (
                                            <option key={subCat.id} value={subCat.id}>
                                                {subCat.name} {subCat.category_name ? `(${subCat.category_name})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No sub-categories available</option>
                                    )}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="cancel-btn">
                                Cancel
                            </button>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Processing...
                                    </>
                                ) : formMode === 'add' ? (
                                    <>
                                        <i className="fas fa-plus"></i> Add
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i> Update
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderTable = () => {
        const data = activeTab === 'categories' ? categories :
            activeTab === 'subcategories' ? subCategories : subSubCategories;

        if (loading && data.length === 0) {
            return (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading {activeTab}...</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <h3>No {activeTab} found</h3>
                    <p>Try changing your search or filter criteria</p>
                    <button onClick={openAddForm} className="add-first-btn">
                        <i className="fas fa-plus"></i> Add Your First {activeTab.slice(0, -1).replace('subsub', 'Sub-Sub-').replace('sub', 'Sub-')}
                    </button>
                </div>
            );
        }

        return (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            {activeTab === 'subcategories' && <th>Category</th>}
                            {activeTab === 'subsubcategories' && (
                                <>
                                    <th>Sub-Category</th>
                                    <th>Category</th>
                                </>
                            )}
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            // Determine type for image URL
                            let type = '';
                            if (activeTab === 'categories') type = 'category';
                            else if (activeTab === 'subcategories') type = 'subcategory';
                            else type = 'subsubcategory';

                            return (
                                <tr key={item.id}>
                                    <td className="image-cell">
                                        <div className="table-image-wrapper">
                                            <img
                                                src={getImageUrlForItem(item.image, type)}
                                                alt={item.name}
                                                className="table-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                                    e.target.style.backgroundColor = '#f5f5f5';
                                                }}
                                            />
                                            <button
                                                className="update-image-btn"
                                                onClick={() => handleUpdateImage(item.id)}
                                                title="Update Image"
                                            >
                                                <i className="fas fa-camera"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td>{item.id}</td>
                                    <td className="name-cell">
                                        <strong>{item.name}</strong>
                                    </td>
                                    <td>{item.description || <em className="text-muted">No description</em>}</td>

                                    {activeTab === 'subcategories' && (
                                        <td>
                                            <span className="parent-info">
                                                <i className="fas fa-folder"></i> {item.category_name || 'N/A'}
                                            </span>
                                        </td>
                                    )}

                                    {activeTab === 'subsubcategories' && (
                                        <>
                                            <td>
                                                <span className="parent-info">
                                                    <i className="fas fa-sitemap"></i> {item.sub_category_name || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="parent-info">
                                                    <i className="fas fa-folder"></i> {item.category_name || 'N/A'}
                                                </span>
                                            </td>
                                        </>
                                    )}

                                    <td>
                                        <span className={`status-badge status-${item.status}`}>
                                            <i className={`fas fa-circle ${item.status === 'active' ? 'active' : 'inactive'}`}></i>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="action-buttons">
                                        <button
                                            className="edit-btn"
                                            onClick={() => openEditForm(item)}
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(item.id)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button
                                            className={`status-toggle-btn ${item.status === 'active' ? 'active' : 'inactive'}`}
                                            onClick={() => handleStatusChange(item.id,
                                                item.status === 'active' ? 'inactive' : 'active'
                                            )}
                                            title={`Mark as ${item.status === 'active' ? 'Inactive' : 'Active'}`}
                                        >
                                            <i className={`fas fa-toggle-${item.status === 'active' ? 'on' : 'off'}`}></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return null;

        return (
            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn prev"
                >
                    <i className="fas fa-chevron-left"></i> Previous
                </button>

                <div className="page-numbers">
                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            );
                        } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                        ) {
                            return <span key={page} className="ellipsis">...</span>;
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn next"
                >
                    Next <i className="fas fa-chevron-right"></i>
                </button>

                <div className="page-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                </div>
            </div>
        );
    };

    // ============ MAIN RENDER ============
    return (
        <div className="category-management-container">
            <div className="header">
                <div className="header-left">
                    <h1>
                        <i className="fas fa-sitemap"></i> Category Management
                    </h1>
                    <p className="subtitle">Manage categories, sub-categories, and sub-sub-categories with images</p>
                </div>
                <div className="header-right">
                    <button className="refresh-all-btn" onClick={handleRefresh} title="Refresh All">
                        <i className="fas fa-redo"></i>
                    </button>
                    <button className="add-btn" onClick={openAddForm}>
                        <i className="fas fa-plus"></i> Add New
                    </button>
                </div>
            </div>

            {renderStats()}

            <div className="alert-container">
                {error && (
                    <div className="alert error">
                        <i className="fas fa-exclamation-circle"></i>
                        <div className="alert-content">
                            <strong>Error:</strong> {error}
                        </div>
                        <button onClick={() => setError('')} className="close-alert">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {success && (
                    <div className="alert success">
                        <i className="fas fa-check-circle"></i>
                        <div className="alert-content">
                            <strong>Success:</strong> {success}
                        </div>
                        <button onClick={() => setSuccess('')} className="close-alert">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}
            </div>

            {renderTabs()}
            {renderFilters()}
            {renderTable()}
            {renderPagination()}
            {renderForm()}
        </div>
    );
};

export default CategoryManagement;