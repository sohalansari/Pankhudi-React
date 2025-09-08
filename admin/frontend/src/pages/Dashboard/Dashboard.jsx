import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "./Dashboard.css";

function Dashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        verified_users: 0,
        active_users: 0,
        premium_users: 0,
        new_users_today: 0,
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0,
        inventory_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        new_orders_today: 0,
        return_requests: 0
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("month");
    const [activeTab, setActiveTab] = useState("overview");
    const [recentOrders, setRecentOrders] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [trafficData, setTrafficData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchRecentOrders();
        fetchSalesData();
        fetchTopProducts();
        fetchTrafficData();

        // Set up auto-refresh every 2 minutes
        const intervalId = setInterval(() => {
            fetchDashboardData();
            fetchRecentOrders();
            fetchSalesData();
        }, 120000);

        return () => clearInterval(intervalId);
    }, [timeRange]);

    const fetchDashboardData = () => {
        setLoading(true);
        api.get("/dashboard", { params: { period: timeRange } })
            .then((res) => {
                setStats(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching stats:", err);
                // Fallback data for demonstration
                setStats({
                    total_users: 1245,
                    verified_users: 980,
                    active_users: 645,
                    premium_users: 230,
                    new_users_today: 42,
                    total_orders: 356,
                    pending_orders: 28,
                    completed_orders: 312,
                    total_revenue: 45890,
                    inventory_items: 1240,
                    low_stock_items: 36,
                    out_of_stock_items: 12,
                    new_orders_today: 18,
                    return_requests: 7
                });
                setLoading(false);
            });
    };

    const fetchRecentOrders = () => {
        api.get("/recent-orders")
            .then((res) => {
                setRecentOrders(res.data);
            })
            .catch((err) => {
                console.error("Error fetching recent orders:", err);
                // Fallback data
                setRecentOrders([
                    { id: "ORD-2548", customer: "Rahul Sharma", product: "Men's Casual Shirt", amount: 2499, status: "completed", date: "2023-06-15" },
                    { id: "ORD-2547", customer: "Priya Patel", product: "Women's Summer Dress", amount: 3599, status: "shipped", date: "2023-06-14" },
                    { id: "ORD-2546", customer: "Amit Kumar", product: "Kids T-Shirt Pack", amount: 1599, status: "pending", date: "2023-06-14" },
                    { id: "ORD-2545", customer: "Neha Singh", product: "Women's Jeans", amount: 1899, status: "completed", date: "2023-06-13" },
                    { id: "ORD-2544", customer: "Rajesh Kumar", product: "Formal Shirt", amount: 1299, status: "shipped", date: "2023-06-13" }
                ]);
            });
    };

    const fetchSalesData = () => {
        api.get("/sales-data", { params: { period: timeRange } })
            .then((res) => {
                setSalesData(res.data);
            })
            .catch((err) => {
                console.error("Error fetching sales data:", err);
                // Fallback data
                const data = [];
                const days = timeRange === 'today' ? 24 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
                const labelType = timeRange === 'today' ? 'hour' : timeRange === 'week' ? 'day' : timeRange === 'month' ? 'date' : 'month';

                for (let i = 0; i < days; i++) {
                    let label;
                    if (timeRange === 'today') {
                        label = `${i}:00`;
                    } else if (timeRange === 'week') {
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        label = days[i];
                    } else if (timeRange === 'month') {
                        label = `Day ${i + 1}`;
                    } else {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        label = months[i];
                    }

                    data.push({
                        [labelType]: label,
                        sales: Math.floor(Math.random() * 10000) + 5000,
                        orders: Math.floor(Math.random() * 50) + 20,
                        visitors: Math.floor(Math.random() * 500) + 300
                    });
                }
                setSalesData(data);
            });
    };

    const fetchTopProducts = () => {
        api.get("/top-products")
            .then((res) => {
                setTopProducts(res.data);
            })
            .catch((err) => {
                console.error("Error fetching top products:", err);
                // Fallback data
                setTopProducts([
                    { name: "Women's Summer Dress", sales: 12540, units: 42 },
                    { name: "Men's Casual Shirt", sales: 9870, units: 33 },
                    { name: "Women's Jeans", sales: 8560, units: 28 },
                    { name: "Kids T-Shirt Pack", sales: 6540, units: 38 },
                    { name: "Formal Shirt", sales: 5430, units: 18 }
                ]);
            });
    };

    const fetchTrafficData = () => {
        api.get("/traffic-sources")
            .then((res) => {
                setTrafficData(res.data);
            })
            .catch((err) => {
                console.error("Error fetching traffic data:", err);
                // Fallback data
                setTrafficData([
                    { name: "Direct", value: 35 },
                    { name: "Social Media", value: 25 },
                    { name: "Google Search", value: 20 },
                    { name: "Email Campaign", value: 15 },
                    { name: "Referral", value: 5 }
                ]);
            });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const PercentageChange = ({ value }) => {
        const isPositive = value >= 0;
        const formattedValue = Math.abs(value).toFixed(0);

        return (
            <span className={`trend ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '↗' : '↘'} {formattedValue}%
            </span>
        );
    };

    const handleQuickAction = (action) => {
        // Add actual functionality for these actions
        console.log(`Performing action: ${action}`);
        // You can add modals, navigation, or API calls based on the action
    };

    const renderChart = () => {
        const labelType = timeRange === 'today' ? 'hour' : timeRange === 'week' ? 'day' : timeRange === 'month' ? 'date' : 'month';

        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={labelType} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                        formatter={(value, name) => {
                            if (name === 'sales') return [formatCurrency(value), 'Revenue'];
                            if (name === 'orders') return [value, 'Orders'];
                            return [value, 'Visitors'];
                        }}
                    />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sales"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Revenue"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="orders"
                        stroke="#82ca9d"
                        name="Orders"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="visitors"
                        stroke="#ffc658"
                        name="Visitors"
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    const renderTopProductsChart = () => {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="sales" name="Sales Amount" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderTrafficChart = () => {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={trafficData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    if (loading) {
        return (
            <PageContainer title="Dashboard">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Dashboard">
            {/* Scrollable content container */}
            <div className="dashboard-scrollable">
                {/* Header with time filter */}
                <div className="dashboard-header">
                    <div className="tabs">
                        <button
                            className={activeTab === "overview" ? "active" : ""}
                            onClick={() => setActiveTab("overview")}
                        >
                            <span className="tab-icon">📊</span>
                            Overview
                        </button>
                        <button
                            className={activeTab === "sales" ? "active" : ""}
                            onClick={() => setActiveTab("sales")}
                        >
                            <span className="tab-icon">💰</span>
                            Sales
                        </button>
                        <button
                            className={activeTab === "inventory" ? "active" : ""}
                            onClick={() => setActiveTab("inventory")}
                        >
                            <span className="tab-icon">📦</span>
                            Inventory
                        </button>
                        <button
                            className={activeTab === "customers" ? "active" : ""}
                            onClick={() => setActiveTab("customers")}
                        >
                            <span className="tab-icon">👥</span>
                            Customers
                        </button>
                    </div>
                    <div className="time-filter">
                        <div className="filter-with-icon">
                            <span className="filter-icon">📅</span>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="time-selector"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <button onClick={fetchDashboardData} className="refresh-btn">
                            <span className="refresh-icon">🔄</span>
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card">
                        <div className="summary-icon revenue">💰</div>
                        <div className="summary-content">
                            <h3>Total Revenue</h3>
                            <p>{formatCurrency(stats.total_revenue)}</p>
                            <div className="summary-footer">
                                <PercentageChange value={12} />
                                <span>vs last {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon orders">📦</div>
                        <div className="summary-content">
                            <h3>Total Orders</h3>
                            <p>{formatNumber(stats.total_orders)}</p>
                            <div className="summary-footer">
                                <PercentageChange value={8} />
                                <span>vs last {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon customers">👥</div>
                        <div className="summary-content">
                            <h3>New Customers</h3>
                            <p>{formatNumber(stats.new_users_today)}</p>
                            <div className="summary-footer">
                                <PercentageChange value={15} />
                                <span>vs yesterday</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon conversion">📈</div>
                        <div className="summary-content">
                            <h3>Conversion Rate</h3>
                            <p>{((stats.total_orders / stats.active_users) * 100 || 0).toFixed(1)}%</p>
                            <div className="summary-footer">
                                <PercentageChange value={3} />
                                <span>vs last {timeRange}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chart Area */}
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Sales Performance</h3>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color revenue"></div>
                                <span>Revenue</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color orders"></div>
                                <span>Orders</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color visitors"></div>
                                <span>Visitors</span>
                            </div>
                        </div>
                    </div>
                    {renderChart()}
                </div>

                {/* Additional Charts Row */}
                <div className="charts-row">
                    <div className="chart-box">
                        <h3>Top Selling Products</h3>
                        {renderTopProductsChart()}
                    </div>
                    <div className="chart-box">
                        <h3>Traffic Sources</h3>
                        {renderTrafficChart()}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total Users</h3>
                            <p>{formatNumber(stats.total_users)}</p>
                            <div className="card-footer">
                                <span className="sub-text">{formatNumber(stats.verified_users)} verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Completed Orders</h3>
                            <p>{formatNumber(stats.completed_orders)}</p>
                            <div className="card-footer">
                                <PercentageChange value={5} />
                                <span>vs previous {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card purple">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <h3>Premium Users</h3>
                            <p>{formatNumber(stats.premium_users)}</p>
                            <div className="card-footer">
                                <PercentageChange value={18} />
                                <span>vs previous {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card orange">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-content">
                            <h3>Return Requests</h3>
                            <p>{formatNumber(stats.return_requests)}</p>
                            <div className="card-footer">
                                <span className="trend negative">+3%</span>
                                <span>vs previous {timeRange}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row of Stats */}
                <div className="stats-grid">
                    <div className="stat-card red">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>Pending Orders</h3>
                            <p>{formatNumber(stats.pending_orders)}</p>
                            <div className="card-footer">
                                <span className="alert-badge">Needs attention</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card teal">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Inventory Items</h3>
                            <p>{formatNumber(stats.inventory_items)}</p>
                            <div className="card-footer">
                                <span>Total products</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card yellow">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>Low Stock</h3>
                            <p>{formatNumber(stats.low_stock_items)}</p>
                            <div className="card-footer">
                                <span className="alert-badge">Needs restocking</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card pink">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <h3>Out of Stock</h3>
                            <p>{formatNumber(stats.out_of_stock_items)}</p>
                            <div className="card-footer">
                                <span className="alert-badge">Urgent action needed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <button className="action-btn primary" onClick={() => handleQuickAction('add_product')}>
                            <span className="action-icon">➕</span>
                            <span>Add New Product</span>
                        </button>
                        <button className="action-btn secondary" onClick={() => handleQuickAction('sales_report')}>
                            <span className="action-icon">📊</span>
                            <span>View Sales Report</span>
                        </button>
                        <button className="action-btn secondary" onClick={() => handleQuickAction('manage_inventory')}>
                            <span className="action-icon">📦</span>
                            <span>Manage Inventory</span>
                        </button>
                        <button className="action-btn secondary" onClick={() => handleQuickAction('customer_management')}>
                            <span className="action-icon">👥</span>
                            <span>Customer Management</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="recent-activity">
                    <div className="section-header">
                        <h3>Recent Orders</h3>
                        <button className="view-all-btn">View All →</button>
                    </div>
                    <div className="activity-list">
                        {recentOrders.map((order, index) => (
                            <div className="activity-item" key={index}>
                                <div className="activity-details">
                                    <span className="order-id">{order.id}</span>
                                    <span className="customer">{order.customer}</span>
                                    <span className="product">{order.product}</span>
                                    <span className="date">{order.date}</span>
                                </div>
                                <div className="activity-amount">{formatCurrency(order.amount)}</div>
                                <div className={`activity-status ${order.status}`}>
                                    {order.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export default Dashboard;