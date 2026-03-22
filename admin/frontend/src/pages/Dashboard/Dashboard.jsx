import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, RadialBarChart, RadialBar
} from 'recharts';
import "./Dashboard.css";

function Dashboard() {
    // State Management
    const [dashboardStats, setDashboardStats] = useState({
        total_users: 0, verified_users: 0, active_users: 0, premium_users: 0,
        new_users_today: 0, total_orders: 0, pending_orders: 0, completed_orders: 0,
        total_revenue: 0, inventory_items: 0, low_stock_items: 0, out_of_stock_items: 0,
        new_orders_today: 0, return_requests: 0, pending_returns: 0,
        order_change: 0, revenue_change: 0, well_stocked_items: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [activeView, setActiveView] = useState("overview");
    const [latestOrders, setLatestOrders] = useState([]);
    const [salesPerformance, setSalesPerformance] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [trafficInsights, setTrafficInsights] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [realtimeActivity, setRealtimeActivity] = useState([]);
    const [orderPagination, setOrderPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [exporting, setExporting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Chart Colors
    const CHART_COLORS = ['#4361ee', '#06d6a0', '#ffb703', '#fb8500', '#9c27b0', '#ef4444', '#14b8a6', '#eab308'];

    // Load all data
    const loadAllData = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchDashboardMetrics(),
            fetchRecentOrdersList(),
            fetchSalesAnalytics(),
            fetchTopSellingProducts(),
            fetchTrafficAnalytics(),
            fetchCategorySales(),
            fetchRealtimeActivity()
        ]);
        setLastUpdated(new Date());
        setRefreshing(false);
    }, [selectedPeriod]);

    // Initial load and auto-refresh
    useEffect(() => {
        loadAllData();
        const autoRefresh = setInterval(() => loadAllData(), 120000);
        return () => clearInterval(autoRefresh);
    }, [selectedPeriod, loadAllData]);

    // Fetch Dashboard Metrics
    const fetchDashboardMetrics = async () => {
        try {
            const response = await api.get("/dashboard", { params: { period: selectedPeriod } });
            if (response.data?.success) {
                setDashboardStats(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard metrics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Recent Orders
    const fetchRecentOrdersList = async (page = 1) => {
        try {
            const response = await api.get("/recent-orders", { params: { limit: 5, page } });
            if (response.data?.success) {
                setLatestOrders(response.data.data);
                if (response.data.pagination) {
                    setOrderPagination(response.data.pagination);
                }
            }
        } catch (error) {
            console.error("Failed to fetch recent orders:", error);
        }
    };

    // Fetch Sales Analytics
    const fetchSalesAnalytics = async () => {
        try {
            const response = await api.get("/sales-data", { params: { period: selectedPeriod } });
            if (response.data?.success && Array.isArray(response.data.data)) {
                setSalesPerformance(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch sales analytics:", error);
        }
    };

    // Fetch Top Selling Products
    const fetchTopSellingProducts = async () => {
        try {
            const response = await api.get("/top-products", { params: { limit: 5 } });
            if (response.data?.success && Array.isArray(response.data.data)) {
                setBestSellers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch top products:", error);
        }
    };

    // Fetch Traffic Analytics
    const fetchTrafficAnalytics = async () => {
        try {
            const response = await api.get("/traffic-sources");
            if (response.data?.success && Array.isArray(response.data.data)) {
                setTrafficInsights(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch traffic analytics:", error);
        }
    };

    // Fetch Sales by Category
    const fetchCategorySales = async () => {
        try {
            const response = await api.get("/sales-by-category", { params: { period: selectedPeriod } });
            if (response.data?.success && Array.isArray(response.data.data)) {
                setCategorySales(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch category sales:", error);
        }
    };

    // Fetch Realtime Activity
    const fetchRealtimeActivity = async () => {
        try {
            const response = await api.get("/realtime-activity");
            if (response.data?.success && Array.isArray(response.data.data)) {
                setRealtimeActivity(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch realtime activity:", error);
        }
    };

    // Export Dashboard Data
    const handleExportData = async (format = 'csv') => {
        setExporting(true);
        try {
            const response = await api.get("/export-dashboard", { params: { format }, responseType: format === 'csv' ? 'blob' : 'json' });

            if (format === 'csv') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `dashboard_export_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }

            alert(`Dashboard data exported successfully as ${format.toUpperCase()}`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export dashboard data. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    // Navigate to Orders Page
    const navigateToOrders = () => {
        window.location.href = '/orders';
    };

    // Navigate to Products Page
    const navigateToProducts = () => {
        window.location.href = '/products';
    };

    // Navigate to Customers Page
    const navigateToCustomers = () => {
        window.location.href = '/customers';
    };

    // Navigate to Returns Page
    const navigateToReturns = () => {
        window.location.href = '/returns';
    };

    // Navigate to Inventory Page
    const navigateToInventory = () => {
        window.location.href = '/inventory';
    };

    // Navigate to Reports Page
    const navigateToReports = () => {
        window.location.href = '/reports';
    };

    // Quick Action Handlers
    const handleQuickAction = (action) => {
        switch (action) {
            case 'add_product':
                navigateToProducts();
                break;
            case 'sales_report':
                navigateToReports();
                break;
            case 'manage_inventory':
                navigateToInventory();
                break;
            case 'customer_management':
                navigateToCustomers();
                break;
            case 'view_orders':
                navigateToOrders();
                break;
            case 'process_returns':
                navigateToReturns();
                break;
            default:
                console.log(`Action: ${action}`);
        }
    };

    // Formatting Utilities
    const formatCurrencyValue = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatNumberValue = (num) => {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    };

    const formatDisplayDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (date) => {
        if (!date) return '-';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    // Trend Indicator Component
    const TrendIndicator = ({ value }) => {
        const isPositive = value >= 0;
        const formattedValue = Math.abs(value).toFixed(1);
        return (
            <span className={`trend-badge ${isPositive ? 'trend-up' : 'trend-down'}`}>
                {isPositive ? '▲' : '▼'} {formattedValue}%
            </span>
        );
    };

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        const statusMap = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled',
            'returned': 'status-returned'
        };
        return <span className={`status-badge ${statusMap[status] || 'status-default'}`}>{status}</span>;
    };

    // Chart Renderers
    const renderSalesChart = () => {
        if (!salesPerformance?.length) {
            return <div className="empty-chart-state">No sales data available</div>;
        }

        return (
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={salesPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#06d6a0" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="label" stroke="#6c757d" />
                    <YAxis yAxisId="left" stroke="#6c757d" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6c757d" />
                    <Tooltip
                        formatter={(value, name) => {
                            if (name === 'sales') return [formatCurrencyValue(value), 'Revenue'];
                            if (name === 'orders') return [value, 'Orders'];
                            return [value, 'Visitors'];
                        }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#4361ee" fill="url(#colorSales)" name="Revenue" strokeWidth={2} />
                    <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#06d6a0" fill="url(#colorOrders)" name="Orders" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="visitors" stroke="#ffb703" name="Visitors" strokeWidth={2} dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        );
    };

    const renderProductsChart = () => {
        if (!bestSellers?.length) {
            return <div className="empty-chart-state">No product data available</div>;
        }

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bestSellers} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis type="number" stroke="#6c757d" />
                    <YAxis type="category" dataKey="name" stroke="#6c757d" width={80} />
                    <Tooltip formatter={(value) => formatCurrencyValue(value)} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="sales" name="Sales Amount" fill="#4361ee" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderTrafficChart = () => {
        if (!trafficInsights?.length) {
            return <div className="empty-chart-state">No traffic data available</div>;
        }

        return (
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={trafficInsights}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#4361ee"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {trafficInsights.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const renderCategoryChart = () => {
        if (!categorySales?.length) {
            return <div className="empty-chart-state">No category data available</div>;
        }

        return (
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categorySales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="category" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip formatter={(value) => formatCurrencyValue(value)} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="total_sales" name="Sales" fill="#4361ee" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    // Loading State
    if (isLoading) {
        return (
            <PageContainer title="Analytics Dashboard">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard insights...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Analytics Dashboard">
            <div className="dashboard-layout">
                {/* Header Controls */}
                <div className="dashboard-controls">
                    <div className="view-tabs">
                        <button
                            className={`tab-button ${activeView === "overview" ? "tab-active" : ""}`}
                            onClick={() => setActiveView("overview")}
                        >
                            <span className="tab-icon">📊</span>
                            Overview
                        </button>
                        <button
                            className={`tab-button ${activeView === "sales" ? "tab-active" : ""}`}
                            onClick={() => setActiveView("sales")}
                        >
                            <span className="tab-icon">💰</span>
                            Sales
                        </button>
                        <button
                            className={`tab-button ${activeView === "inventory" ? "tab-active" : ""}`}
                            onClick={() => setActiveView("inventory")}
                        >
                            <span className="tab-icon">📦</span>
                            Inventory
                        </button>
                        <button
                            className={`tab-button ${activeView === "customers" ? "tab-active" : ""}`}
                            onClick={() => setActiveView("customers")}
                        >
                            <span className="tab-icon">👥</span>
                            Customers
                        </button>
                    </div>
                    <div className="period-selector">
                        <div className="period-selector-wrapper">
                            <span className="period-icon">📅</span>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="period-dropdown"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <button onClick={loadAllData} className="refresh-button" disabled={refreshing}>
                            <span className="refresh-icon">{refreshing ? '⏳' : '🔄'}</span>
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <div className="export-dropdown">
                            <button className="export-button" onClick={() => handleExportData('csv')} disabled={exporting}>
                                <span className="export-icon">📥</span>
                                {exporting ? 'Exporting...' : 'Export CSV'}
                            </button>
                            <button className="export-button json" onClick={() => handleExportData('json')} disabled={exporting}>
                                JSON
                            </button>
                        </div>
                    </div>
                </div>

                {/* Last Updated Info */}
                <div className="last-updated">
                    <span className="update-icon">⏱️</span>
                    Last updated: {formatDisplayDate(lastUpdated)}
                </div>

                {/* KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card" onClick={navigateToReports} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon revenue-icon">💰</div>
                        <div className="kpi-details">
                            <h3>Total Revenue</h3>
                            <p className="kpi-value">{formatCurrencyValue(dashboardStats.total_revenue)}</p>
                            <div className="kpi-footer">
                                <TrendIndicator value={dashboardStats.revenue_change || 0} />
                                <span>vs previous {selectedPeriod}</span>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={navigateToOrders} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon orders-icon">📦</div>
                        <div className="kpi-details">
                            <h3>Total Orders</h3>
                            <p className="kpi-value">{formatNumberValue(dashboardStats.total_orders)}</p>
                            <div className="kpi-footer">
                                <TrendIndicator value={dashboardStats.order_change || 0} />
                                <span>vs previous {selectedPeriod}</span>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={navigateToCustomers} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon customers-icon">👥</div>
                        <div className="kpi-details">
                            <h3>New Customers</h3>
                            <p className="kpi-value">{formatNumberValue(dashboardStats.new_users_today)}</p>
                            <div className="kpi-footer">
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon conversion-icon">📈</div>
                        <div className="kpi-details">
                            <h3>Conversion Rate</h3>
                            <p className="kpi-value">
                                {dashboardStats.active_users > 0
                                    ? ((dashboardStats.total_orders / dashboardStats.active_users) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <div className="kpi-footer">
                                <span>Orders / Active Users</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chart Section */}
                <div className="chart-panel">
                    <div className="chart-panel-header">
                        <h3>Sales Performance</h3>
                        <div className="chart-legend">
                            <div className="legend-dot revenue-dot"></div>
                            <span>Revenue</span>
                            <div className="legend-dot orders-dot"></div>
                            <span>Orders</span>
                            <div className="legend-dot visitors-dot"></div>
                            <span>Visitors</span>
                        </div>
                    </div>
                    {renderSalesChart()}
                </div>

                {/* Secondary Charts Row */}
                <div className="charts-row">
                    <div className="chart-widget">
                        <h3>Top Selling Products</h3>
                        {renderProductsChart()}
                    </div>
                    <div className="chart-widget">
                        <h3>Traffic Sources</h3>
                        {renderTrafficChart()}
                    </div>
                </div>

                {/* Third Row - Category Sales */}
                <div className="chart-panel">
                    <div className="chart-panel-header">
                        <h3>Sales by Category</h3>
                        <button className="view-link" onClick={navigateToProducts}>
                            View All Products →
                        </button>
                    </div>
                    {renderCategoryChart()}
                </div>

                {/* Metrics Grid */}
                <div className="metrics-grid">
                    <div className="metric-card metric-blue" onClick={navigateToCustomers} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">👥</div>
                        <div className="metric-content">
                            <h3>Total Users</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.total_users)}</p>
                            <div className="metric-footer">
                                <span className="metric-subtext">{formatNumberValue(dashboardStats.verified_users)} verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card metric-green" onClick={navigateToOrders} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">✅</div>
                        <div className="metric-content">
                            <h3>Completed Orders</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.completed_orders)}</p>
                            <div className="metric-footer">
                                <span>{((dashboardStats.completed_orders / dashboardStats.total_orders) * 100 || 0).toFixed(1)}% of total</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card metric-purple" onClick={navigateToCustomers} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">⭐</div>
                        <div className="metric-content">
                            <h3>Premium Users</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.premium_users)}</p>
                            <div className="metric-footer">
                                <span>{((dashboardStats.premium_users / dashboardStats.total_users) * 100 || 0).toFixed(1)}% of users</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card metric-orange" onClick={navigateToReturns} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">🔄</div>
                        <div className="metric-content">
                            <h3>Return Requests</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.return_requests)}</p>
                            <div className="metric-footer">
                                <span className={dashboardStats.pending_returns > 0 ? 'status-warning' : ''}>
                                    {dashboardStats.pending_returns} pending
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="metrics-grid">
                    <div className="metric-card metric-red" onClick={navigateToOrders} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">⏳</div>
                        <div className="metric-content">
                            <h3>Pending Orders</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.pending_orders)}</p>
                            <div className="metric-footer">
                                <span className={dashboardStats.pending_orders > 0 ? 'status-warning' : ''}>Needs attention</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card metric-teal" onClick={navigateToInventory} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">📊</div>
                        <div className="metric-content">
                            <h3>Inventory Items</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.inventory_items)}</p>
                            <div className="metric-footer">
                                <span>{formatNumberValue(dashboardStats.well_stocked_items)} well stocked</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card metric-yellow" onClick={navigateToInventory} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">⚠️</div>
                        <div className="metric-content">
                            <h3>Low Stock</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.low_stock_items)}</p>
                            <div className="metric-footer">
                                <span className="status-warning">Needs restocking</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card metric-pink" onClick={navigateToInventory} style={{ cursor: 'pointer' }}>
                        <div className="metric-icon">❌</div>
                        <div className="metric-content">
                            <h3>Out of Stock</h3>
                            <p className="metric-value">{formatNumberValue(dashboardStats.out_of_stock_items)}</p>
                            <div className="metric-footer">
                                <span className="status-critical">Urgent action needed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-section">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <button className="action-button action-primary" onClick={() => handleQuickAction('add_product')}>
                            <span className="action-icon">➕</span>
                            Add New Product
                        </button>
                        <button className="action-button action-secondary" onClick={() => handleQuickAction('sales_report')}>
                            <span className="action-icon">📊</span>
                            Sales Report
                        </button>
                        <button className="action-button action-secondary" onClick={() => handleQuickAction('manage_inventory')}>
                            <span className="action-icon">📦</span>
                            Manage Inventory
                        </button>
                        <button className="action-button action-secondary" onClick={() => handleQuickAction('customer_management')}>
                            <span className="action-icon">👥</span>
                            Customer Management
                        </button>
                        <button className="action-button action-secondary" onClick={() => handleQuickAction('view_orders')}>
                            <span className="action-icon">📋</span>
                            View All Orders
                        </button>
                        <button className="action-button action-secondary" onClick={() => handleQuickAction('process_returns')}>
                            <span className="action-icon">🔄</span>
                            Process Returns
                        </button>
                    </div>
                </div>

                {/* Recent Orders Section */}
                <div className="recent-section">
                    <div className="section-title">
                        <h3>Recent Orders</h3>
                        <button className="view-link" onClick={navigateToOrders}>
                            View All Orders →
                        </button>
                    </div>
                    <div className="orders-list">
                        {latestOrders?.length > 0 ? (
                            latestOrders.map((order, idx) => (
                                <div className="order-item" key={order.id || idx} onClick={() => window.location.href = `/orders/${order.id}`} style={{ cursor: 'pointer' }}>
                                    <div className="order-info">
                                        <span className="order-number">#{order.order_number}</span>
                                        <span className="customer-name">{order.customer}</span>
                                        <span className="order-date">{formatDisplayDate(order.date)}</span>
                                    </div>
                                    <div className="order-amount">{formatCurrencyValue(order.amount)}</div>
                                    <StatusBadge status={order.status} />
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No recent orders found</div>
                        )}
                    </div>
                    {orderPagination.totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => fetchRecentOrdersList(orderPagination.page - 1)}
                                disabled={orderPagination.page === 1}
                            >
                                ← Previous
                            </button>
                            <span className="pagination-info">
                                Page {orderPagination.page} of {orderPagination.totalPages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => fetchRecentOrdersList(orderPagination.page + 1)}
                                disabled={orderPagination.page === orderPagination.totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>

                {/* Realtime Activity Section */}
                <div className="realtime-section">
                    <div className="section-title">
                        <h3>Real-time Activity</h3>
                        <span className="live-badge">● LIVE</span>
                    </div>
                    <div className="activity-list">
                        {realtimeActivity?.length > 0 ? (
                            realtimeActivity.map((activity, idx) => (
                                <div className="activity-item" key={idx}>
                                    <div className="activity-icon">
                                        {activity.type === 'order' && '📦'}
                                        {activity.type === 'user' && '👤'}
                                        {activity.type === 'return' && '🔄'}
                                    </div>
                                    <div className="activity-details">
                                        <div className="activity-message">
                                            {activity.type === 'order' && `New order #${activity.reference} placed by ${activity.user_name}`}
                                            {activity.type === 'user' && `New user registered: ${activity.user_name}`}
                                            {activity.type === 'return' && `Return request ${activity.reference} created`}
                                        </div>
                                        <div className="activity-time">{formatRelativeTime(activity.timestamp)}</div>
                                    </div>
                                    {activity.amount && (
                                        <div className="activity-amount">{formatCurrencyValue(activity.amount)}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export default Dashboard;