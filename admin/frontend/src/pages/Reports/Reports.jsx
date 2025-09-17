import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area
} from "recharts";
import {
    FiDownload,
    FiFilter,
    FiRefreshCw,
    FiUsers,
    FiShoppingBag,
    FiStar,
    FiAlertTriangle,
    FiTrendingUp,
    FiPieChart,
    FiDollarSign,
    FiCalendar,
    FiBarChart2,
    FiUserCheck,
    FiBox,
    FiShoppingCart,
    FiCreditCard
} from "react-icons/fi";
import "./AdminReports.css";

// Reusable Card Component
function Card({ children, className = "", hover = true }) {
    return (
        <div className={`card ${className} ${hover ? 'card-hover' : ''}`}>
            {children}
        </div>
    );
}

function CardContent({ children }) {
    return <div className="card-content">{children}</div>;
}

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label} : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${payload[0].name} : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

// Date Range Selector
const DateRangeSelector = ({ onDateChange, isOpen, toggleOpen }) => {
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prev) => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onDateChange(dateRange);
        toggleOpen();
    };

    const handleClear = () => {
        setDateRange({ start: "", end: "" });
        onDateChange({});
        toggleOpen();
    };

    return (
        <div className="filter-dropdown">
            <button className="filter-toggle" onClick={toggleOpen}>
                <FiFilter /> Filters
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="filter-content"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3>Filter by Date Range</h3>
                        <div className="date-inputs">
                            <div className="input-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    name="start"
                                    value={dateRange.start}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    name="end"
                                    value={dateRange.end}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button onClick={handleApply} className="apply-btn">
                                Apply
                            </button>
                            <button onClick={handleClear} className="clear-btn">
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Report Type Selector
const ReportTypeSelector = ({ reportType, setReportType }) => {
    const reportTypes = [
        { id: "daily", name: "Daily", icon: <FiCalendar /> },
        { id: "weekly", name: "Weekly", icon: <FiBarChart2 /> },
        { id: "monthly", name: "Monthly", icon: <FiTrendingUp /> },
        { id: "yearly", name: "Yearly", icon: <FiPieChart /> },
    ];

    return (
        <div className="report-type-selector">
            <h3>Report Period:</h3>
            <div className="report-type-buttons">
                {reportTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={`report-type-btn ${reportType === type.id ? "active" : ""}`}
                    >
                        {type.icon}
                        <span>{type.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Export Button Component
const ExportButton = ({ data, variant = "primary" }) => {
    const handleExport = () => {
        // In a real app, this would generate a CSV/PDF report
        console.log("Exporting data:", data);
        alert("Export functionality would be implemented here!");
    };

    return (
        <motion.button
            className={`export-btn ${variant}`}
            onClick={handleExport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <FiDownload />
            <span>Export Report</span>
        </motion.button>
    );
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
    return (
        <div className="loading-container">
            <div className="skeleton-header"></div>
            <div className="skeleton-filters">
                <div className="skeleton-filter"></div>
                <div className="skeleton-filter"></div>
            </div>
            <div className="skeleton-tabs"></div>
            <div className="skeleton-cards">
                {[1, 2, 3, 4].map(item => (
                    <div key={item} className="skeleton-card"></div>
                ))}
            </div>
            <div className="skeleton-charts">
                {[1, 2, 3, 4].map(item => (
                    <div key={item} className="skeleton-chart"></div>
                ))}
            </div>
        </div>
    );
};

// Main Reports Component
export default function Reports() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({});
    const [reportType, setReportType] = useState("daily");
    const [activeTab, setActiveTab] = useState("overview");
    const [filterOpen, setFilterOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Toggle filter dropdown
    const toggleFilter = () => setFilterOpen(!filterOpen);

    // Fetch reports data
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const params = { ...dateRange, type: reportType };
                const res = await axios.get(
                    "http://localhost:5001/api/admin/reports",
                    { params }
                );
                if (res.data.success) {
                    setReports(res.data.data);
                    setError(null);
                } else {
                    setError(res.data.message || "Failed to fetch reports");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching reports");
            } finally {
                setLoading(false);
            }
        };

        // Simulate API call with timeout for demo
        const timer = setTimeout(fetchReports, 1500);
        return () => clearTimeout(timer);
    }, [dateRange, reportType]);

    // Toggle dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, [darkMode]);

    // Process data for charts
    const chartData = useMemo(() => {
        if (!reports) return null;

        // User data for bar chart
        const userData = [
            { name: "Total Users", value: reports.totalUsers, icon: <FiUsers /> },
            { name: "Active Users", value: reports.activeUsers, icon: <FiUserCheck /> },
            { name: "Premium Users", value: reports.premiumUsers, icon: <FiStar /> },
            { name: "Verified Users", value: reports.verifiedUsers, icon: <FiUserCheck /> },
        ];

        // Product data for bar chart
        const productData = [
            { name: "Total Products", value: reports.totalProducts, icon: <FiShoppingBag /> },
            { name: "Active Products", value: reports.activeProducts, icon: <FiBox /> },
            { name: "Inactive Products", value: reports.inactiveProducts, icon: <FiAlertTriangle /> },
            { name: "Low Stock", value: reports.lowStockProducts, icon: <FiAlertTriangle /> },
        ];

        // User growth data (if not available from API, generate sample)
        const userGrowthData = reports.userGrowth || Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2023, i).toLocaleString('default', { month: 'short' }),
            users: Math.floor(Math.random() * 100) + 50
        }));

        // User status data for pie chart
        const userStatusData = [
            { name: "Active", value: reports.activeUsers, color: "#0088FE" },
            { name: "Inactive", value: reports.totalUsers - reports.activeUsers, color: "#FF8042" },
        ];

        // Financial data (if not available from API, generate sample)
        const financialData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2023, i).toLocaleString('default', { month: 'short' }),
            revenue: Math.floor(Math.random() * 10000) + 5000,
            expenses: Math.floor(Math.random() * 5000) + 2000,
        }));

        return {
            userData,
            productData,
            userGrowthData,
            userStatusData,
            financialData
        };
    }, [reports]);

    // Refresh data
    const refreshData = () => {
        setLoading(true);
        setTimeout(() => {
            setReports(prev => ({ ...prev }));
            setLoading(false);
        }, 1000);
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-box">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={refreshData} className="retry-btn">
                        <FiRefreshCw /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!reports) return <p className="p-6">No reports data available.</p>;

    const tabs = [
        { id: "overview", name: "Overview", icon: <FiBarChart2 /> },
        { id: "users", name: "Users", icon: <FiUsers /> },
        { id: "products", name: "Products", icon: <FiShoppingBag /> },
        { id: "financial", name: "Financial", icon: <FiDollarSign /> },
    ];

    return (
        <div className="reports-page">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        📊 Admin Dashboard
                    </motion.h1>
                    <div className="header-actions">
                        <button
                            className="theme-toggle"
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button className="refresh-btn" onClick={refreshData}>
                            <FiRefreshCw />
                        </button>
                        <ExportButton data={reports} />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls">
                <DateRangeSelector
                    onDateChange={setDateRange}
                    isOpen={filterOpen}
                    toggleOpen={toggleFilter}
                />
                <ReportTypeSelector reportType={reportType} setReportType={setReportType} />
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <motion.div
                className="summary-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <div className="summary-card">
                        <div className="icon-wrapper users">
                            <FiUsers />
                        </div>
                        <div className="summary-content">
                            <h3>Total Users</h3>
                            <p className="big-value">{reports.totalUsers}</p>
                            <span className="trend positive">+5.2% from last month</span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="summary-card">
                        <div className="icon-wrapper products">
                            <FiShoppingBag />
                        </div>
                        <div className="summary-content">
                            <h3>Total Products</h3>
                            <p className="big-value">{reports.totalProducts}</p>
                            <span className="trend positive">+2.7% from last month</span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="summary-card">
                        <div className="icon-wrapper premium">
                            <FiStar />
                        </div>
                        <div className="summary-content">
                            <h3>Premium Users</h3>
                            <p className="big-value">{reports.premiumUsers}</p>
                            <span className="trend positive">+8.3% from last month</span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="summary-card">
                        <div className="icon-wrapper alert">
                            <FiAlertTriangle />
                        </div>
                        <div className="summary-content">
                            <h3>Out of Stock</h3>
                            <p className="big-value">{reports.lowStockProducts}</p>
                            <span className="trend negative">+3.1% from last month</span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Users Chart */}
                <Card>
                    <CardContent>
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <FiUsers /> Users Analytics
                            </h2>
                            <div className="chart-actions">
                                <button className="chart-action-btn">
                                    <FiDownload />
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.userData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="value"
                                    fill="var(--primary-gradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Products Chart */}
                <Card>
                    <CardContent>
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <FiShoppingBag /> Products Overview
                            </h2>
                            <div className="chart-actions">
                                <button className="chart-action-btn">
                                    <FiDownload />
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.productData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="value"
                                    fill="var(--success-gradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Growth Chart */}
                <Card>
                    <CardContent>
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <FiTrendingUp /> User Growth
                            </h2>
                            <div className="chart-actions">
                                <button className="chart-action-btn">
                                    <FiDownload />
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData.userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="var(--primary-color)"
                                    fill="url(#userGrowthGradient)"
                                />
                                <defs>
                                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Status Chart */}
                <Card>
                    <CardContent>
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <FiPieChart /> User Status
                            </h2>
                            <div className="chart-actions">
                                <button className="chart-action-btn">
                                    <FiDownload />
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.userStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.userStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Financial Chart */}
                <Card className="span-2">
                    <CardContent>
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <FiDollarSign /> Financial Overview
                            </h2>
                            <div className="chart-actions">
                                <button className="chart-action-btn">
                                    <FiDownload />
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData.financialData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--success-color)"
                                    strokeWidth={2}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="var(--danger-color)"
                                    strokeWidth={2}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Actions */}
            <div className="footer-actions">
                <ExportButton data={reports} variant="secondary" />
                <button className="help-btn">Need Help?</button>
            </div>
        </div>
    );
}