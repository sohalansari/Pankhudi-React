import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import PageContainer from "../../components/PageContainer/PageContainer";
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

    useEffect(() => {
        fetchDashboardData();
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const PercentageChange = ({ value }) => {
        const isPositive = value >= 0;
        const formattedValue = Math.abs(value).toFixed(0);

        return (
            <span className={`trend ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : '-'}{formattedValue}%
            </span>
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
                            Overview
                        </button>
                        <button
                            className={activeTab === "sales" ? "active" : ""}
                            onClick={() => setActiveTab("sales")}
                        >
                            Sales
                        </button>
                        <button
                            className={activeTab === "inventory" ? "active" : ""}
                            onClick={() => setActiveTab("inventory")}
                        >
                            Inventory
                        </button>
                    </div>
                    <div className="time-filter">
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
                        <button onClick={fetchDashboardData} className="refresh-btn">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card blue">
                        <h3>Total Users</h3>
                        <p>{stats.total_users}</p>
                    </div>
                    <div className="stat-card green">
                        <h3>Verified Users</h3>
                        <p>{stats.verified_users}</p>
                        <div className="card-footer">
                            <span className="trend positive">+12%</span>
                            <span>vs previous period</span>
                        </div>
                    </div>
                    <div className="stat-card yellow">
                        <h3>Active Users</h3>
                        <p>{stats.active_users}</p>
                        <div className="card-footer">
                            <span className="trend negative">-2%</span>
                            <span>vs previous period</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Total Revenue</h3>
                            <p>{formatCurrency(stats.total_revenue)}</p>
                            <div className="card-footer">
                                <PercentageChange value={12} />
                                <span>vs previous {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Total Orders</h3>
                            <p>{stats.total_orders}</p>
                            <div className="card-footer">
                                <PercentageChange value={8} />
                                <span>vs previous {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card purple">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>New Customers</h3>
                            <p>{stats.new_users_today}</p>
                            <div className="card-footer">
                                <PercentageChange value={15} />
                                <span>vs yesterday</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card orange">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-content">
                            <h3>Return Requests</h3>
                            <p>{stats.return_requests}</p>
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
                            <p>{stats.pending_orders}</p>
                            <div className="card-footer">
                                <span>Need attention</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card teal">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Completed Orders</h3>
                            <p>{stats.completed_orders}</p>
                            <div className="card-footer">
                                <PercentageChange value={5} />
                                <span>vs previous {timeRange}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card yellow">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Inventory Items</h3>
                            <p>{stats.inventory_items}</p>
                            <div className="card-footer">
                                <span>Total products</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card pink">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>Low Stock</h3>
                            <p>{stats.low_stock_items}</p>
                            <div className="card-footer">
                                <span>Need restocking</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <button className="action-btn primary">
                            <span className="action-icon">➕</span>
                            <span>Add New Product</span>
                        </button>
                        <button className="action-btn secondary">
                            <span className="action-icon">📊</span>
                            <span>View Sales Report</span>
                        </button>
                        <button className="action-btn secondary">
                            <span className="action-icon">📦</span>
                            <span>Manage Inventory</span>
                        </button>
                        <button className="action-btn secondary">
                            <span className="action-icon">👥</span>
                            <span>Customer Management</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="recent-activity">
                    <h3>Recent Orders</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="order-id">#ORD-2548</span>
                                <span className="customer">Rahul Sharma</span>
                                <span className="product">Men's Casual Shirt</span>
                            </div>
                            <div className="activity-amount">{formatCurrency(2499)}</div>
                            <div className="activity-status completed">Completed</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="order-id">#ORD-2547</span>
                                <span className="customer">Priya Patel</span>
                                <span className="product">Women's Summer Dress</span>
                            </div>
                            <div className="activity-amount">{formatCurrency(3599)}</div>
                            <div className="activity-status shipped">Shipped</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="order-id">#ORD-2546</span>
                                <span className="customer">Amit Kumar</span>
                                <span className="product">Kids T-Shirt Pack</span>
                            </div>
                            <div className="activity-amount">{formatCurrency(1599)}</div>
                            <div className="activity-status pending">Pending</div>
                        </div>
                        {/* Add more items to test scrolling */}
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="order-id">#ORD-2545</span>
                                <span className="customer">Neha Singh</span>
                                <span className="product">Women's Jeans</span>
                            </div>
                            <div className="activity-amount">{formatCurrency(1899)}</div>
                            <div className="activity-status completed">Completed</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="order-id">#ORD-2544</span>
                                <span className="customer">Rajesh Kumar</span>
                                <span className="product">Formal Shirt</span>
                            </div>
                            <div className="activity-amount">{formatCurrency(1299)}</div>
                            <div className="activity-status shipped">Shipped</div>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export default Dashboard;