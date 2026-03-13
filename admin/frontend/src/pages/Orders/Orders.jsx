import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../../utils/api';
import PageContainer from '../../components/PageContainer/PageContainer';
import "./Orders.css";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ status: '', search: '' });
    const [searchParams, setSearchParams] = useSearchParams();
    const [updatingOrder, setUpdatingOrder] = useState(null);

    const page = parseInt(searchParams.get('page')) || 1;
    const statusFilter = searchParams.get('status') || '';
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, searchQuery]);

    const fetchOrders = () => {
        setLoading(true);
        const params = { page, limit: 10 };
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;

        api.getAdminOrders(params)
            .then(res => {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching orders:', err);
                setLoading(false);
            });
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setUpdatingOrder(orderId);
        api.updateOrderStatus(orderId, { order_status: newStatus })
            .then(() => {
                fetchOrders(); // Refresh list
                setUpdatingOrder(null);
            })
            .catch(err => {
                console.error('Error updating status:', err);
                setUpdatingOrder(null);
            });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    };

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const clearFilters = () => {
        setSearchParams({});
    };

    if (loading) {
        return (
            <PageContainer title="Manage Orders">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading orders...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Manage Orders">
            <div className="orders-page">
                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setSearchParams({ status: e.target.value, page: '1' })}
                            className="filter-select"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Search by order # or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchParams({ search: e.target.value, page: '1' })}
                            className="search-input"
                        />
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear
                        </button>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="orders-table-container">
                    <div className="table-header">
                        <h3>Orders ({pagination.total || 0})</h3>
                        <div className="table-actions">
                            <button className="export-btn">Export CSV</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>#{order.order_number || order.id}</strong>
                                        </td>
                                        <td>
                                            <div className="customer-info">
                                                <div>{order.user_name}</div>
                                                <small>{order.user_email}</small>
                                            </div>
                                        </td>
                                        <td>{formatCurrency(order.total_amount)}</td>
                                        <td>
                                            <span className={`status-badge status-${getStatusColor(order.order_status)}`}>
                                                {order.order_status?.replace('_', ' ') || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => window.open(`/admin-orders/${order.id}`, '_blank')}
                                                >
                                                    View
                                                </button>
                                                <select
                                                    value={order.order_status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    disabled={updatingOrder === order.id}
                                                    className="status-select"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            <button
                                disabled={page === 1}
                                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: (page - 1).toString() })}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: (page + 1).toString() })}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}

export default Orders;

