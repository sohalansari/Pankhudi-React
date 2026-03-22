import React, { useState, useEffect } from 'react';
import * as api from '../../utils/api';
import './Orders.css';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [error, setError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        date_from: '',
        date_to: '',
        search: '',
        page: 1,
        limit: 10
    });

    // Selected orders for bulk actions
    const [selectedOrders, setSelectedOrders] = useState([]);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Tracking modal
    const [trackingModal, setTrackingModal] = useState(false);
    const [trackingData, setTrackingData] = useState({
        tracking_number: '',
        courier_name: '',
        courier_website: ''
    });

    // Return modal
    const [returnModal, setReturnModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [returnRejectionReason, setReturnRejectionReason] = useState('');

    // Returns list modal
    const [returnsModal, setReturnsModal] = useState(false);
    const [returns, setReturns] = useState([]);
    const [returnsLoading, setReturnsLoading] = useState(false);
    const [returnsPagination, setReturnsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [returnFilters, setReturnFilters] = useState({
        status: '',
        page: 1,
        limit: 10
    });

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [filters.page, filters.status, filters.payment_status, filters.search, filters.date_from, filters.date_to]);

    useEffect(() => {
        if (returnsModal) {
            fetchReturns();
        }
    }, [returnFilters.page, returnFilters.status, returnsModal]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching orders with filters:', filters);
            const response = await api.getOrders(filters);
            console.log('Orders response:', response);

            if (response && response.success) {
                setOrders(response.data.orders || []);
                setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
            } else {
                setError(response?.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.response?.data?.message || error.message || 'Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.getOrderStats();
            console.log('Stats response:', response);

            if (response && response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchReturns = async () => {
        setReturnsLoading(true);
        try {
            const response = await api.getReturns({
                status: returnFilters.status,
                page: returnFilters.page,
                limit: returnFilters.limit
            });

            if (response && response.success) {
                setReturns(response.data.returns || []);
                setReturnsPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
            }
        } catch (error) {
            console.error('Error fetching returns:', error);
            alert('Error fetching return requests');
        } finally {
            setReturnsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page on filter change
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            payment_status: '',
            date_from: '',
            date_to: '',
            search: '',
            page: 1,
            limit: 10
        });
    };

    const handleViewOrder = async (orderId) => {
        setModalLoading(true);
        setModalOpen(true);
        try {
            const response = await api.getOrderDetails(orderId);
            console.log('Order details:', response);

            if (response && response.success) {
                setSelectedOrder(response.data);
            } else {
                alert(response?.message || 'Error fetching order details');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error fetching order details');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, comment = '') => {
        try {
            const response = await api.updateOrderStatus(orderId, {
                order_status: newStatus,
                comment
            });

            if (response && response.success) {
                fetchOrders();
                fetchStats();
                if (selectedOrder?.id === orderId) {
                    handleViewOrder(orderId);
                }
                alert('Status updated successfully');
            } else {
                alert(response?.message || 'Error updating status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleUpdatePayment = async (orderId, newStatus) => {
        try {
            const response = await api.updatePaymentStatus(orderId, {
                payment_status: newStatus
            });

            if (response && response.success) {
                fetchOrders();
                fetchStats();
                if (selectedOrder?.id === orderId) {
                    handleViewOrder(orderId);
                }
                alert('Payment status updated');
            } else {
                alert(response?.message || 'Error updating payment');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error updating payment');
        }
    };

    const handleUpdateReturnStatus = async (returnId, status) => {
        try {
            const data = { status };
            if (status === 'rejected') {
                if (!returnRejectionReason) {
                    alert('Please provide rejection reason');
                    return;
                }
                data.rejection_reason = returnRejectionReason;
            }

            const response = await api.updateReturnStatus(returnId, data);

            if (response && response.success) {
                setReturnModal(false);
                setSelectedReturn(null);
                setReturnRejectionReason('');
                fetchReturns();
                fetchStats();
                if (selectedOrder) {
                    handleViewOrder(selectedOrder.id);
                }
                alert(`Return request ${status} successfully`);
            } else {
                alert(response?.message || `Error ${status} return`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || `Error ${status} return`);
        }
    };

    const handleAddTracking = async (orderId) => {
        try {
            const response = await api.addTracking(orderId, trackingData);

            if (response && response.success) {
                setTrackingModal(false);
                setTrackingData({ tracking_number: '', courier_name: '', courier_website: '' });
                if (selectedOrder?.id === orderId) {
                    handleViewOrder(orderId);
                }
                alert('Tracking added successfully');
            } else {
                alert(response?.message || 'Error adding tracking');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error adding tracking');
        }
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map(o => o.id));
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Update ${selectedOrders.length} orders to ${newStatus}?`)) return;

        setLoading(true);
        try {
            for (const orderId of selectedOrders) {
                await api.updateOrderStatus(orderId, { order_status: newStatus });
            }

            setSelectedOrders([]);
            fetchOrders();
            fetchStats();
            alert('Bulk update completed');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error in bulk update');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.exportOrders({
                status: filters.status,
                payment_status: filters.payment_status,
                date_from: filters.date_from,
                date_to: filters.date_to
            });

            if (response && response.success) {
                const orders = response.data;

                if (orders.length === 0) {
                    alert('No orders to export');
                    return;
                }

                // Create CSV
                const headers = ['Order #', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'City', 'State', 'Pincode', 'Payment Method', 'Payment Status', 'Order Status', 'Subtotal', 'Shipping', 'Discount', 'Total', 'Items Count', 'Has Return'];
                const csvRows = [headers.join(',')];

                orders.forEach(order => {
                    const row = [
                        order.order_number,
                        new Date(order.order_date).toLocaleDateString(),
                        `"${order.shipping_full_name || ''}"`,
                        order.shipping_email || '',
                        order.shipping_phone || '',
                        `"${order.shipping_address || ''}"`,
                        order.shipping_city || '',
                        order.shipping_state || '',
                        order.shipping_postal_code || '',
                        order.payment_method || '',
                        order.payment_status || '',
                        order.order_status || '',
                        order.subtotal || 0,
                        order.shipping_charge || 0,
                        order.discount_amount || 0,
                        order.total_amount || 0,
                        order.total_items || 0,
                        order.has_return_request ? 'Yes' : 'No'
                    ];
                    csvRows.push(row.join(','));
                });

                const csvString = csvRows.join('\n');
                const blob = new Blob([csvString], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error exporting orders');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            'pending': 'badge-warning',
            'processing': 'badge-info',
            'shipped': 'badge-primary',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger',
            'returned': 'badge-secondary'
        };
        return `badge ${classes[status] || 'badge-secondary'}`;
    };

    const getPaymentBadgeClass = (status) => {
        const classes = {
            'pending': 'badge-warning',
            'completed': 'badge-success',
            'failed': 'badge-danger',
            'refunded': 'badge-secondary'
        };
        return `badge ${classes[status] || 'badge-secondary'}`;
    };

    const getReturnBadgeClass = (status) => {
        const classes = {
            'pending': 'badge-warning',
            'approved': 'badge-info',
            'rejected': 'badge-danger',
            'completed': 'badge-success'
        };
        return `badge ${classes[status] || 'badge-secondary'}`;
    };

    if (error) {
        return (
            <div className="orders-container">
                <div className="error-state">
                    <span className="error-icon">❌</span>
                    <h3>Error Loading Orders</h3>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="page-header">
                <h1 className="page-title">📦 Order Management</h1>
                <button
                    onClick={() => setReturnsModal(true)}
                    className="btn-view-returns"
                    title="View Return Requests"
                >
                    🔄 Return Requests {stats?.returns?.pending_returns > 0 &&
                        <span className="return-badge">{stats.returns.pending_returns}</span>
                    }
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">📊</span>
                        <div>
                            <div className="stat-value">{stats.today?.order_count || 0}</div>
                            <div className="stat-label">Today's Orders</div>
                            <small>{formatCurrency(stats.today?.revenue || 0)}</small>
                        </div>
                    </div>

                    {/* Status wise stats */}
                    {stats.by_status && stats.by_status.length > 0 ? (
                        stats.by_status.map(stat => (
                            <div className="stat-card" key={stat.order_status}>
                                <span className="stat-icon">
                                    {stat.order_status === 'pending' && '⏳'}
                                    {stat.order_status === 'processing' && '⚙️'}
                                    {stat.order_status === 'shipped' && '🚚'}
                                    {stat.order_status === 'delivered' && '✅'}
                                    {stat.order_status === 'cancelled' && '❌'}
                                    {stat.order_status === 'returned' && '🔄'}
                                </span>
                                <div>
                                    <div className="stat-value">{stat.count}</div>
                                    <div className="stat-label">{stat.order_status?.toUpperCase()}</div>
                                    <small>{formatCurrency(stat.total_amount)}</small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="stat-card">
                            <span className="stat-icon">📦</span>
                            <div>
                                <div className="stat-value">0</div>
                                <div className="stat-label">No Orders</div>
                            </div>
                        </div>
                    )}

                    {/* Return stats */}
                    {stats.returns && (
                        <div className="stat-card return-stat" onClick={() => setReturnsModal(true)} style={{ cursor: 'pointer' }}>
                            <span className="stat-icon">🔄</span>
                            <div>
                                <div className="stat-value">{stats.returns.count || 0}</div>
                                <div className="stat-label">Total Returns</div>
                                {stats.returns.pending_returns > 0 && (
                                    <small className="pending-returns">{stats.returns.pending_returns} pending</small>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="stat-card">
                        <span className="stat-icon">📈</span>
                        <div>
                            <div className="stat-value">{stats.weekly?.order_count || 0}</div>
                            <div className="stat-label">Weekly</div>
                            <small>{formatCurrency(stats.weekly?.revenue || 0)}</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon">💰</span>
                        <div>
                            <div className="stat-value">{pagination.total || 0}</div>
                            <div className="stat-label">Total Orders</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="filters-section">
                <div className="filters-header">
                    <h3>🔍 Filters</h3>
                    <button onClick={clearFilters} className="btn-clear">
                        Clear All
                    </button>
                </div>
                <div className="filters-grid">
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="filter-input"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                    </select>

                    <select
                        value={filters.payment_status}
                        onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                        className="filter-input"
                    >
                        <option value="">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>

                    <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        className="filter-input"
                        placeholder="From Date"
                    />

                    <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        className="filter-input"
                        placeholder="To Date"
                    />

                    <input
                        type="text"
                        placeholder="Search order #, customer, email, phone..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="filter-input search-input"
                    />

                    <button onClick={handleExport} className="btn-export">
                        📥 Export CSV
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
                <div className="bulk-actions">
                    <span className="selected-count">
                        {selectedOrders.length} orders selected
                    </span>
                    <div className="bulk-buttons">
                        <select
                            onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                            className="bulk-select"
                            defaultValue=""
                        >
                            <option value="" disabled>Update Status</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                            onClick={() => setSelectedOrders([])}
                            className="btn-clear-selection"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="table-wrapper">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <h3>No orders found</h3>
                        <p>Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    <>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === orders.length && orders.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Return</th>
                                    <th style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => handleSelectOrder(order.id)}
                                            />
                                        </td>
                                        <td>
                                            <strong>#{order.order_number}</strong>
                                            {order.user_name && <div><small>{order.user_name}</small></div>}
                                        </td>
                                        <td>
                                            <div>{formatDate(order.order_date)}</div>
                                            {order.estimated_delivery && (
                                                <small>Est: {new Date(order.estimated_delivery).toLocaleDateString()}</small>
                                            )}
                                        </td>
                                        <td>
                                            <div><strong>{order.shipping_full_name}</strong></div>
                                            <small>
                                                {order.shipping_email}<br />
                                                {order.shipping_phone}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="item-badge">
                                                {order.total_items || 0} items
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{formatCurrency(order.total_amount)}</strong>
                                            {order.discount_amount > 0 && (
                                                <div><small>Disc: {formatCurrency(order.discount_amount)}</small></div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={getPaymentBadgeClass(order.payment_status)}>
                                                {order.payment_status?.toUpperCase()}
                                            </span>
                                            {order.payment_method && (
                                                <div><small>{order.payment_method}</small></div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(order.order_status)}>
                                                {order.order_status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {order.has_return_request ? (
                                                <span className="badge badge-warning">Requested</span>
                                            ) : (
                                                <span className="badge badge-secondary">No</span>
                                            )}
                                        </td>
                                        <td className="action-buttons">
                                            <button
                                                onClick={() => handleViewOrder(order.id)}
                                                className="btn-view"
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            <select
                                                value={order.order_status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className="status-select"
                                                title="Update Status"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="returned">Returned</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handleFilterChange('page', filters.page - 1)}
                                    disabled={filters.page === 1}
                                    className="page-btn"
                                >
                                    ← Prev
                                </button>
                                <span className="page-info">
                                    Page {filters.page} of {pagination.totalPages} (Total: {pagination.total} orders)
                                </span>
                                <button
                                    onClick={() => handleFilterChange('page', filters.page + 1)}
                                    disabled={filters.page === pagination.totalPages}
                                    className="page-btn"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button onClick={() => setModalOpen(false)} className="modal-close">&times;</button>
                        </div>

                        {modalLoading ? (
                            <div className="modal-loading">
                                <div className="spinner"></div>
                                <p>Loading order details...</p>
                            </div>
                        ) : selectedOrder && (
                            <div className="modal-body">
                                <div className="order-info">
                                    <h3>Order #{selectedOrder.order_number}</h3>
                                    <p>Date: {formatDate(selectedOrder.order_date)}</p>
                                    {selectedOrder.user_name && (
                                        <p>Customer: {selectedOrder.user_name} ({selectedOrder.user_email})</p>
                                    )}
                                </div>

                                <div className="info-grid">
                                    <div className="info-section">
                                        <h4>Shipping Address</h4>
                                        <p><strong>{selectedOrder.shipping_full_name}</strong></p>
                                        <p>{selectedOrder.shipping_email}</p>
                                        <p>{selectedOrder.shipping_phone}</p>
                                        <p>{selectedOrder.shipping_address}</p>
                                        <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_postal_code}</p>
                                        <p>{selectedOrder.shipping_country}</p>
                                    </div>

                                    <div className="info-section">
                                        <h4>Billing Address</h4>
                                        <p><strong>{selectedOrder.billing_full_name || selectedOrder.shipping_full_name}</strong></p>
                                        <p>{selectedOrder.billing_address || selectedOrder.shipping_address}</p>
                                        <p>{selectedOrder.billing_city || selectedOrder.shipping_city}, {selectedOrder.billing_state || selectedOrder.shipping_state} - {selectedOrder.billing_postal_code || selectedOrder.shipping_postal_code}</p>
                                        <p>{selectedOrder.billing_country || selectedOrder.shipping_country}</p>
                                    </div>

                                    <div className="info-section">
                                        <h4>Order Status</h4>
                                        <div className="status-update">
                                            <select
                                                value={selectedOrder.order_status}
                                                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                                className="status-select-large"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="returned">Returned</option>
                                            </select>
                                        </div>

                                        {selectedOrder.shipped_date && (
                                            <p><small>Shipped: {formatDate(selectedOrder.shipped_date)}</small></p>
                                        )}
                                        {selectedOrder.delivered_date && (
                                            <p><small>Delivered: {formatDate(selectedOrder.delivered_date)}</small></p>
                                        )}
                                        {selectedOrder.cancelled_date && (
                                            <p><small>Cancelled: {formatDate(selectedOrder.cancelled_date)}</small></p>
                                        )}

                                        <h4 style={{ marginTop: '20px' }}>Payment Status</h4>
                                        <div className="status-update">
                                            <select
                                                value={selectedOrder.payment_status}
                                                onChange={(e) => handleUpdatePayment(selectedOrder.id, e.target.value)}
                                                className="status-select-large"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </div>
                                        <p><small>Method: {selectedOrder.payment_method}</small></p>
                                        {selectedOrder.payment_date && (
                                            <p><small>Paid on: {formatDate(selectedOrder.payment_date)}</small></p>
                                        )}

                                        {selectedOrder.tracking_number && (
                                            <div className="tracking-info" style={{ marginTop: '20px' }}>
                                                <h4>Tracking Info</h4>
                                                <p><strong>Courier:</strong> {selectedOrder.courier_name}</p>
                                                <p><strong>Tracking #:</strong> {selectedOrder.tracking_number}</p>
                                                {selectedOrder.courier_website && (
                                                    <p>
                                                        <a href={selectedOrder.courier_website} target="_blank" rel="noopener noreferrer">
                                                            Track Order
                                                        </a>
                                                    </p>
                                                )}
                                                <p><strong>Est. Delivery:</strong> {selectedOrder.estimated_delivery}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setTrackingModal(true);
                                                setTrackingData({
                                                    tracking_number: selectedOrder.tracking_number || '',
                                                    courier_name: selectedOrder.courier_name || '',
                                                    courier_website: selectedOrder.courier_website || ''
                                                });
                                            }}
                                            className="btn-add-tracking"
                                        >
                                            {selectedOrder.tracking_number ? 'Update Tracking' : 'Add Tracking'}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items Section */}
                                <div className="items-section">
                                    <h4>Order Items ({selectedOrder.items?.length || 0})</h4>
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>SKU</th>
                                                <th>Variants</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Discount</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map(item => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="product-info">
                                                                {item.product_name}
                                                                {item.product_images && (
                                                                    <small className="product-images">
                                                                        📸 {JSON.parse(item.product_images)?.length || 0} images
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>{item.sku || '-'}</td>
                                                        <td>
                                                            {item.size && <span className="variant-badge">Size: {item.size}</span>}
                                                            {item.color && <span className="variant-badge">Color: {item.color}</span>}
                                                        </td>
                                                        <td>{item.quantity}</td>
                                                        <td>{formatCurrency(item.price)}</td>
                                                        <td>
                                                            {item.discount_percent > 0 && (
                                                                <span className="discount-badge">{item.discount_percent}% off</span>
                                                            )}
                                                        </td>
                                                        <td>{formatCurrency(item.total_price || item.price * item.quantity)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center' }}>No items found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'right' }}>Subtotal:</td>
                                                <td>{formatCurrency(selectedOrder.subtotal)}</td>
                                            </tr>
                                            {selectedOrder.shipping_charge > 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'right' }}>Shipping:</td>
                                                    <td>{formatCurrency(selectedOrder.shipping_charge)}</td>
                                                </tr>
                                            )}
                                            {selectedOrder.tax_amount > 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'right' }}>Tax:</td>
                                                    <td>{formatCurrency(selectedOrder.tax_amount)}</td>
                                                </tr>
                                            )}
                                            {selectedOrder.discount_amount > 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'right' }}>Discount:</td>
                                                    <td>-{formatCurrency(selectedOrder.discount_amount)}</td>
                                                </tr>
                                            )}
                                            <tr className="total-row">
                                                <td colSpan="6" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
                                                <td><strong>{formatCurrency(selectedOrder.total_amount)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Return Requests Section */}
                                {selectedOrder.returns && selectedOrder.returns.length > 0 && (
                                    <div className="returns-section">
                                        <h4>Return Requests</h4>
                                        <div className="returns-list">
                                            {selectedOrder.returns.map(ret => (
                                                <div key={ret.id} className="return-item">
                                                    <div className="return-header">
                                                        <span className={getReturnBadgeClass(ret.status)}>
                                                            {ret.status?.toUpperCase()}
                                                        </span>
                                                        <span className="return-date">
                                                            Requested: {formatDate(ret.requested_at)}
                                                        </span>
                                                    </div>
                                                    <p><strong>Reason:</strong> {ret.reason}</p>
                                                    {ret.comments && (
                                                        <p><strong>Comments:</strong> {ret.comments}</p>
                                                    )}
                                                    {ret.rejection_reason && (
                                                        <p className="rejection-reason">
                                                            <strong>Rejection Reason:</strong> {ret.rejection_reason}
                                                        </p>
                                                    )}
                                                    {ret.status === 'pending' && (
                                                        <div className="return-actions">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReturn(ret);
                                                                    setReturnModal(true);
                                                                }}
                                                                className="btn-process-return"
                                                            >
                                                                Process Return
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status History */}
                                {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                                    <div className="status-history">
                                        <h4>Status History</h4>
                                        <div className="history-timeline">
                                            {selectedOrder.status_history.map(history => (
                                                <div key={history.id} className="history-item">
                                                    <span className={`badge ${getStatusBadgeClass(history.status)}`}>
                                                        {history.status}
                                                    </span>
                                                    <span className="history-date">{formatDate(history.created_at)}</span>
                                                    {history.comment && (
                                                        <p className="history-comment">{history.comment}</p>
                                                    )}
                                                    <small>By: {history.updated_by_name || 'System'}</small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {trackingModal && (
                <div className="modal-overlay" onClick={() => setTrackingModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Tracking Information</h2>
                            <button onClick={() => setTrackingModal(false)} className="modal-close">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Courier Name:</label>
                                <select
                                    value={trackingData.courier_name}
                                    onChange={(e) => setTrackingData({ ...trackingData, courier_name: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="">Select Courier</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="Blue Dart">Blue Dart</option>
                                    <option value="DTDC">DTDC</option>
                                    <option value="India Post">India Post</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="Ekart">Ekart</option>
                                    <option value="XpressBees">XpressBees</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tracking Number:</label>
                                <input
                                    type="text"
                                    value={trackingData.tracking_number}
                                    onChange={(e) => setTrackingData({ ...trackingData, tracking_number: e.target.value })}
                                    className="form-input"
                                    placeholder="Enter tracking number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Courier Website (for tracking):</label>
                                <input
                                    type="url"
                                    value={trackingData.courier_website}
                                    onChange={(e) => setTrackingData({ ...trackingData, courier_website: e.target.value })}
                                    className="form-input"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    onClick={() => handleAddTracking(selectedOrder.id)}
                                    className="btn-submit"
                                >
                                    Save Tracking
                                </button>
                                <button
                                    onClick={() => setTrackingModal(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Return Modal */}
            {returnModal && selectedReturn && (
                <div className="modal-overlay" onClick={() => setReturnModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Process Return Request</h2>
                            <button onClick={() => setReturnModal(false)} className="modal-close">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="return-details">
                                <p><strong>Order:</strong> #{selectedReturn.order_number}</p>
                                <p><strong>Customer:</strong> {selectedReturn.user_name}</p>
                                <p><strong>Reason:</strong> {selectedReturn.reason}</p>
                                {selectedReturn.comments && (
                                    <p><strong>Comments:</strong> {selectedReturn.comments}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Decision:</label>
                                <div className="return-decision-buttons">
                                    <button
                                        onClick={() => handleUpdateReturnStatus(selectedReturn.id, 'approved')}
                                        className="btn-approve"
                                    >
                                        ✅ Approve Return
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('rejection-section').style.display = 'block'}
                                        className="btn-reject"
                                    >
                                        ❌ Reject Return
                                    </button>
                                </div>
                            </div>

                            <div id="rejection-section" style={{ display: 'none', marginTop: '20px' }}>
                                <div className="form-group">
                                    <label>Rejection Reason:</label>
                                    <textarea
                                        value={returnRejectionReason}
                                        onChange={(e) => setReturnRejectionReason(e.target.value)}
                                        className="form-input"
                                        rows="3"
                                        placeholder="Enter reason for rejection"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        onClick={() => handleUpdateReturnStatus(selectedReturn.id, 'rejected')}
                                        className="btn-submit"
                                    >
                                        Confirm Rejection
                                    </button>
                                    <button
                                        onClick={() => {
                                            document.getElementById('rejection-section').style.display = 'none';
                                            setReturnRejectionReason('');
                                        }}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Returns List Modal */}
            {returnsModal && (
                <div className="modal-overlay" onClick={() => setReturnsModal(false)}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔄 Return Requests</h2>
                            <button onClick={() => setReturnsModal(false)} className="modal-close">&times;</button>
                        </div>

                        <div className="modal-body">
                            {/* Return Filters */}
                            <div className="returns-filters">
                                <select
                                    value={returnFilters.status}
                                    onChange={(e) => setReturnFilters({ ...returnFilters, status: e.target.value, page: 1 })}
                                    className="filter-input"
                                >
                                    <option value="">All Returns</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {returnsLoading ? (
                                <div className="loading">
                                    <div className="spinner"></div>
                                    <p>Loading returns...</p>
                                </div>
                            ) : returns.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">🔄</span>
                                    <h3>No return requests found</h3>
                                </div>
                            ) : (
                                <>
                                    <table className="returns-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Customer</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                                <th>Requested</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returns.map(ret => (
                                                <tr key={ret.id}>
                                                    <td>#{ret.order_number}</td>
                                                    <td>{ret.user_name}</td>
                                                    <td>{ret.reason}</td>
                                                    <td>
                                                        <span className={getReturnBadgeClass(ret.status)}>
                                                            {ret.status?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>{formatDateOnly(ret.requested_at)}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => {
                                                                setReturnsModal(false);
                                                                handleViewOrder(ret.order_id);
                                                            }}
                                                            className="btn-view"
                                                            title="View Order"
                                                        >
                                                            👁️ View Order
                                                        </button>
                                                        {ret.status === 'pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReturn(ret);
                                                                    setReturnModal(true);
                                                                    setReturnsModal(false);
                                                                }}
                                                                className="btn-process"
                                                            >
                                                                Process
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Returns Pagination */}
                                    {returnsPagination.totalPages > 1 && (
                                        <div className="pagination">
                                            <button
                                                onClick={() => setReturnFilters({ ...returnFilters, page: returnFilters.page - 1 })}
                                                disabled={returnFilters.page === 1}
                                                className="page-btn"
                                            >
                                                ← Prev
                                            </button>
                                            <span className="page-info">
                                                Page {returnFilters.page} of {returnsPagination.totalPages}
                                            </span>
                                            <button
                                                onClick={() => setReturnFilters({ ...returnFilters, page: returnFilters.page + 1 })}
                                                disabled={returnFilters.page === returnsPagination.totalPages}
                                                className="page-btn"
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;