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
        sub_category_id: ''
    });

    // Dropdown data
    const [categoriesList, setCategoriesList] = useState([]);
    const [subCategoriesList, setSubCategoriesList] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // ============ API BASE URL ============
    const API_URL = 'http://localhost:5001/api';

    // ============ STATISTICS FUNCTIONS ============
    const fetchGlobalStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/global-stats`);
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
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                sortBy: 'id',
                sortOrder: 'DESC'
            }).toString();

            const response = await fetch(`${API_URL}/categories?${queryParams}`);
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
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                category_id: categoryFilter === 'all' ? '' : categoryFilter,
                sortBy: 'id',
                sortOrder: 'DESC'
            }).toString();

            const response = await fetch(`${API_URL}/subcategories?${queryParams}`);
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
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                sub_category_id: subCategoryFilter === 'all' ? '' : subCategoryFilter,
                sortBy: 'id',
                sortOrder: 'DESC'
            }).toString();

            const response = await fetch(`${API_URL}/subsubcategories?${queryParams}`);
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

    // ============ DROPDOWN FUNCTIONS - FIXED ============
    const fetchCategoriesForDropdown = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/categories/list/all`);
            const data = await response.json();
            if (data.success) {
                setCategoriesList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch categories dropdown error:', err);
        }
    }, []);

    // FIXED: Sub-categories dropdown function for ALL sub-categories
    const fetchSubCategoriesForDropdown = useCallback(async (categoryId = '') => {
        try {
            let url = `${API_URL}/subcategories/list/all`;

            // If categoryId is provided, filter by category
            if (categoryId && categoryId !== '') {
                url += `?category_id=${categoryId}`;
            }

            console.log('Fetching sub-categories dropdown from:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Sub-categories dropdown data:', data);

            if (data.success) {
                setSubCategoriesList(data.data || []);
            } else {
                console.error('Failed to fetch sub-categories for dropdown:', data.message);
                setSubCategoriesList([]);
            }
        } catch (err) {
            console.error('Fetch sub-categories dropdown error:', err);
            setSubCategoriesList([]);
        }
    }, []);

    // NEW: Fetch ALL sub-categories without filter (for sub-sub-categories form)
    const fetchAllSubCategoriesForDropdown = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/subcategories/list/all`);
            const data = await response.json();
            if (data.success) {
                setSubCategoriesList(data.data || []);
            }
        } catch (err) {
            console.error('Fetch all sub-categories dropdown error:', err);
        }
    }, []);

    // ============ FORM HANDLERS ============
    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            status: 'active',
            category_id: '',
            sub_category_id: ''
        });
        setFormMode('add');
        setShowForm(false);
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

        // Load dropdown data based on active tab
        if (activeTab === 'subsubcategories') {
            // Load ALL sub-categories for sub-sub-categories form
            fetchAllSubCategoriesForDropdown();
        }
    };

    const openEditForm = (item) => {
        // Prepare form data based on active tab
        let formDataToSet = {
            id: item.id,
            name: item.name,
            description: item.description || '',
            status: item.status || 'active',
            category_id: '',
            sub_category_id: ''
        };

        if (activeTab === 'subcategories') {
            formDataToSet.category_id = item.category_id || '';
        } else if (activeTab === 'subsubcategories') {
            formDataToSet.sub_category_id = item.sub_category_id || '';
        }

        setFormData(formDataToSet);
        setFormMode('edit');
        setShowForm(true);

        // Load dropdown data based on active tab
        if (activeTab === 'subcategories' && item.category_id) {
            fetchSubCategoriesForDropdown(item.category_id);
        } else if (activeTab === 'subsubcategories') {
            // Load ALL sub-categories for sub-sub-categories edit form
            fetchAllSubCategoriesForDropdown();
        }
    };

    // ============ TAB CHANGE HANDLER ============
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);

        // Load dropdown data when switching to sub-sub-categories tab
        if (tab === 'subsubcategories') {
            fetchAllSubCategoriesForDropdown();
        }
    };

    // ============ CRUD OPERATIONS ============
    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            let url = '';
            let data = {};

            if (activeTab === 'categories') {
                url = `${API_URL}/categories`;
                data = {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status
                };
            } else if (activeTab === 'subcategories') {
                url = `${API_URL}/subcategories`;
                data = {
                    name: formData.name,
                    description: formData.description,
                    category_id: formData.category_id,
                    status: formData.status
                };
            } else {
                url = `${API_URL}/subsubcategories`;
                data = {
                    name: formData.name,
                    description: formData.description,
                    sub_category_id: formData.sub_category_id,
                    status: formData.status
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
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
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            let url = '';
            let data = {};

            if (activeTab === 'categories') {
                url = `${API_URL}/categories/${formData.id}`;
                data = {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status
                };
            } else if (activeTab === 'subcategories') {
                url = `${API_URL}/subcategories/${formData.id}`;
                data = {
                    name: formData.name,
                    description: formData.description,
                    category_id: formData.category_id,
                    status: formData.status
                };
            } else {
                url = `${API_URL}/subsubcategories/${formData.id}`;
                data = {
                    name: formData.name,
                    description: formData.description,
                    sub_category_id: formData.sub_category_id,
                    status: formData.status
                };
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
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
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
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

            const response = await fetch(url, { method: 'DELETE' });
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
                headers: { 'Content-Type': 'application/json' },
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

    // ============ HELPER FUNCTIONS ============
    const refreshAllData = async () => {
        // Refresh current tab data
        if (activeTab === 'categories') {
            await fetchCategories();
            await fetchCategoriesForDropdown();
        } else if (activeTab === 'subcategories') {
            await fetchSubCategories();
        } else {
            await fetchSubSubCategories();
            // Refresh sub-categories dropdown for sub-sub-categories
            await fetchAllSubCategoriesForDropdown();
        }

        // Refresh statistics
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
        // Initial data fetch
        fetchCategoriesForDropdown();
        fetchGlobalStats();

        // Load sub-categories for dropdown if on sub-sub-categories tab
        if (activeTab === 'subsubcategories') {
            fetchAllSubCategoriesForDropdown();
        }
    }, []);

    useEffect(() => {
        // Fetch data when active tab changes
        if (activeTab === 'categories') {
            fetchCategories();
        } else if (activeTab === 'subcategories') {
            fetchSubCategories();
        } else {
            fetchSubSubCategories();
            // Also load sub-categories dropdown for sub-sub-categories
            fetchAllSubCategoriesForDropdown();
        }
    }, [activeTab, currentPage, itemsPerPage]);

    useEffect(() => {
        // Fetch sub-categories when category filter changes (for sub-categories tab)
        if (activeTab === 'subcategories' && categoryFilter !== 'all') {
            fetchSubCategoriesForDropdown(categoryFilter);
        }
    }, [categoryFilter, activeTab]);

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
                onClick={() => handleTabChange('categories')}
            >
                <i className="fas fa-list"></i> Categories ({stats.categories.total})
            </button>
            <button
                className={`tab-btn ${activeTab === 'subcategories' ? 'active' : ''}`}
                onClick={() => handleTabChange('subcategories')}
            >
                <i className="fas fa-sitemap"></i> Sub-Categories ({stats.sub_categories.total})
            </button>
            <button
                className={`tab-btn ${activeTab === 'subsubcategories' ? 'active' : ''}`}
                onClick={() => handleTabChange('subsubcategories')}
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
                                {subCat.name}
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
                                {subCategoriesList.length === 0 && (
                                    <p className="form-help-text">
                                        <i className="fas fa-info-circle"></i> Please add sub-categories first
                                    </p>
                                )}
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
                            <button type="submit" className="submit-btn" disabled={activeTab === 'subsubcategories' && !formData.sub_category_id}>
                                {formMode === 'add' ? (
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
                        {data.map((item) => (
                            <tr key={item.id}>
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
                        ))}
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
                    <p className="subtitle">Manage categories, sub-categories, and sub-sub-categories</p>
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