import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './PromoCodes.css';

function PromoCodes() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expiring: 0,
        totalUsage: 0
    });
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        per_user_limit: '1',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchPromos();
        fetchStats();
    }, []);

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/promocodes');
            setPromos(response.data.promos || []);
        } catch (error) {
            console.error('Error fetching promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/promocodes/stats/overview');
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            description: promo.description || '',
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            min_order_amount: promo.min_order_amount || '',
            max_discount_amount: promo.max_discount_amount || '',
            usage_limit: promo.usage_limit || '',
            per_user_limit: promo.per_user_limit || '1',
            start_date: promo.start_date ? promo.start_date.split(' ')[0] : '',
            end_date: promo.end_date ? promo.end_date.split(' ')[0] : '',
            is_active: promo.is_active === 1 ? true : false
        });
        setShowAddForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingPromo) {
                // Update existing promo
                await api.put(`/promocodes/${editingPromo.id}`, formData);
                alert('Promo code updated successfully');
            } else {
                // Create new promo
                await api.post('/promocodes', formData);
                alert('Promo code created successfully');
            }

            // Reset form and refresh list
            setShowAddForm(false);
            setEditingPromo(null);
            setFormData({
                code: '',
                description: '',
                discount_type: 'percentage',
                discount_value: '',
                min_order_amount: '',
                max_discount_amount: '',
                usage_limit: '',
                per_user_limit: '1',
                start_date: '',
                end_date: '',
                is_active: true
            });
            fetchPromos();
            fetchStats();
        } catch (error) {
            console.error('Error saving promo:', error);
            alert(error.response?.data?.message || 'Error saving promo code');
        }
    };

    const handleDelete = async (id, code) => {
        if (window.confirm(`Are you sure you want to delete promo code "${code}"?`)) {
            try {
                await api.delete(`/promocodes/${id}`);
                alert('Promo code deleted successfully');
                fetchPromos();
                fetchStats();
            } catch (error) {
                console.error('Error deleting promo:', error);
                alert(error.response?.data?.message || 'Error deleting promo code');
            }
        }
    };

    const toggleStatus = async (id) => {
        try {
            await api.patch(`/promocodes/${id}/toggle`);
            fetchPromos();
            fetchStats();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert(error.response?.data?.message || 'Error toggling promo status');
        }
    };

    const filteredPromos = promos.filter(promo => {
        const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || promo.discount_type === filterType;
        return matchesSearch && matchesType;
    });

    const getDiscountTypeLabel = (type) => {
        switch (type) {
            case 'percentage': return '% Off';
            case 'fixed': return '₹ Off';
            case 'shipping': return 'Free Shipping';
            default: return type;
        }
    };

    const isExpiringSoon = (endDate) => {
        if (!endDate) return false;
        const end = new Date(endDate);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date();
    };

    return (
        <div className="promo-codes-page">
            {/* Header */}
            <div className="page-header">
                <h1>Promo Codes</h1>
                <div className="header-actions">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search promo codes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => {
                        setEditingPromo(null);
                        setFormData({
                            code: '',
                            description: '',
                            discount_type: 'percentage',
                            discount_value: '',
                            min_order_amount: '',
                            max_discount_amount: '',
                            usage_limit: '',
                            per_user_limit: '1',
                            start_date: '',
                            end_date: '',
                            is_active: true
                        });
                        setShowAddForm(true);
                    }}>
                        <i className="fas fa-plus"></i>
                        Add New Promo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fas fa-tags"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Promos</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Expiring Soon</span>
                        <span className="stat-value">{stats.expiring}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Usage</span>
                        <span className="stat-value">{stats.totalUsage}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        All Promos
                    </button>
                    <button
                        className={`filter-tab ${filterType === 'percentage' ? 'active' : ''}`}
                        onClick={() => setFilterType('percentage')}
                    >
                        Percentage
                    </button>
                    <button
                        className={`filter-tab ${filterType === 'fixed' ? 'active' : ''}`}
                        onClick={() => setFilterType('fixed')}
                    >
                        Fixed Amount
                    </button>
                    <button
                        className={`filter-tab ${filterType === 'shipping' ? 'active' : ''}`}
                        onClick={() => setFilterType('shipping')}
                    >
                        Free Shipping
                    </button>
                </div>
            </div>

            {/* Promo Codes Table */}
            <div className="table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading promo codes...</p>
                    </div>
                ) : (
                    <table className="promo-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Max Discount</th>
                                <th>Usage</th>
                                <th>Per User</th>
                                <th>Valid Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromos.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="no-data">
                                        No promo codes found
                                    </td>
                                </tr>
                            ) : (
                                filteredPromos.map(promo => (
                                    <tr key={promo.id} className={
                                        isExpired(promo.end_date) ? 'expired-row' :
                                            isExpiringSoon(promo.end_date) ? 'expiring-row' : ''
                                    }>
                                        <td>
                                            <span className="promo-code">{promo.code}</span>
                                        </td>
                                        <td>
                                            <span className="promo-description">
                                                {promo.description || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`discount-badge ${promo.discount_type}`}>
                                                {promo.discount_type === 'shipping'
                                                    ? 'FREE SHIPPING'
                                                    : `${promo.discount_value}${promo.discount_type === 'percentage' ? '%' : '₹'}`}
                                                <small className="discount-type">
                                                    {getDiscountTypeLabel(promo.discount_type)}
                                                </small>
                                            </span>
                                        </td>
                                        <td>
                                            {promo.min_order_amount > 0
                                                ? `₹${promo.min_order_amount}+`
                                                : 'No min'}
                                        </td>
                                        <td>
                                            {promo.max_discount_amount
                                                ? `₹${promo.max_discount_amount}`
                                                : promo.discount_type === 'percentage' ? 'No max' : '-'}
                                        </td>
                                        <td>
                                            <div className="usage-info">
                                                <span className="usage-count">{promo.used_count || 0}</span>
                                                {promo.usage_limit && (
                                                    <>
                                                        <span className="usage-separator">/</span>
                                                        <span className="usage-limit">{promo.usage_limit}</span>
                                                    </>
                                                )}
                                            </div>
                                            {promo.usage_limit && (
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${((promo.used_count || 0) / promo.usage_limit) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {promo.per_user_limit || '∞'}
                                        </td>
                                        <td>
                                            <div className="valid-period">
                                                {promo.start_date && (
                                                    <span>From: {new Date(promo.start_date).toLocaleDateString()}</span>
                                                )}
                                                {promo.end_date && (
                                                    <span className={isExpired(promo.end_date) ? 'expired-date' : ''}>
                                                        To: {new Date(promo.end_date).toLocaleDateString()}
                                                        {isExpiringSoon(promo.end_date) && !isExpired(promo.end_date) && (
                                                            <span className="expiring-badge">Expiring soon</span>
                                                        )}
                                                        {isExpired(promo.end_date) && (
                                                            <span className="expired-badge">Expired</span>
                                                        )}
                                                    </span>
                                                )}
                                                {!promo.start_date && !promo.end_date && (
                                                    <span>No expiry</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${promo.is_active ? 'active' : 'inactive'}`}>
                                                {promo.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(promo)}
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className={`action-btn ${promo.is_active ? 'deactivate' : 'activate'}`}
                                                    onClick={() => toggleStatus(promo.id)}
                                                    title={promo.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <i className={`fas fa-${promo.is_active ? 'ban' : 'check-circle'}`}></i>
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(promo.id, promo.code)}
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}</h2>
                            <button className="close-btn" onClick={() => {
                                setShowAddForm(false);
                                setEditingPromo(null);
                            }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Promo Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder="e.g., SUMMER2024"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of this promo"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Discount Type</label>
                                        <select
                                            name="discount_type"
                                            value={formData.discount_type}
                                            onChange={handleInputChange}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                            <option value="shipping">Free Shipping</option>
                                        </select>
                                    </div>

                                    {formData.discount_type !== 'shipping' && (
                                        <div className="form-group">
                                            <label>Discount Value *</label>
                                            <input
                                                type="number"
                                                name="discount_value"
                                                value={formData.discount_value}
                                                onChange={handleInputChange}
                                                placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                                                min="0"
                                                max={formData.discount_type === 'percentage' ? 100 : null}
                                                step="0.01"
                                                required={formData.discount_type !== 'shipping'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Min Order Amount (₹)</label>
                                        <input
                                            type="number"
                                            name="min_order_amount"
                                            value={formData.min_order_amount}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {formData.discount_type === 'percentage' && (
                                        <div className="form-group">
                                            <label>Max Discount (₹)</label>
                                            <input
                                                type="number"
                                                name="max_discount_amount"
                                                value={formData.max_discount_amount}
                                                onChange={handleInputChange}
                                                placeholder="No limit"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Total Usage Limit</label>
                                        <input
                                            type="number"
                                            name="usage_limit"
                                            value={formData.usage_limit}
                                            onChange={handleInputChange}
                                            placeholder="Unlimited"
                                            min="1"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Per User Limit</label>
                                        <input
                                            type="number"
                                            name="per_user_limit"
                                            value={formData.per_user_limit}
                                            onChange={handleInputChange}
                                            placeholder="1"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="datetime-local"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                            type="datetime-local"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowAddForm(false);
                                    setEditingPromo(null);
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingPromo ? 'Update Promo' : 'Create Promo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PromoCodes;