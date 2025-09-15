import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
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
} from "recharts";
import "./AdminReports.css";

// Reusable Card
function Card({ children, className = "" }) {
    return <div className={`card ${className}`}>{children}</div>;
}

function CardContent({ children }) {
    return <div className="card-content">{children}</div>;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{label}</p>
                <p className="value">{`Value: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

// Date Range Selector
const DateRangeSelector = ({ onDateChange }) => {
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prev) => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onDateChange(dateRange);
    };

    return (
        <div className="filter-box">
            <h3>Filter by Date:</h3>
            <div className="flex gap-3 flex-wrap">
                <div>
                    <label>Start Date</label>
                    <input
                        type="date"
                        name="start"
                        value={dateRange.start}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>End Date</label>
                    <input
                        type="date"
                        name="end"
                        value={dateRange.end}
                        onChange={handleChange}
                    />
                </div>
                <div className="self-end">
                    <button onClick={handleApply} className="apply-btn">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

// Report Type Selector
const ReportTypeSelector = ({ reportType, setReportType }) => {
    const reportTypes = [
        { id: "daily", name: "Daily" },
        { id: "weekly", name: "Weekly" },
        { id: "monthly", name: "Monthly" },
        { id: "yearly", name: "Yearly" },
    ];

    return (
        <div className="filter-box">
            <h3>Report Type:</h3>
            <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={`report-type-btn ${reportType === type.id ? "active" : ""}`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function Reports() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({});
    const [reportType, setReportType] = useState("daily");
    const [activeTab, setActiveTab] = useState("overview");

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
        fetchReports();
    }, [dateRange, reportType]);

    if (loading) {
        return (
            <div className="loading-box">
                <div className="spinner"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-box">
                <strong>Error: </strong> {error}
            </div>
        );
    }

    if (!reports) return <p className="p-6">No reports data available.</p>;

    // Data
    const userData = [
        { name: "Total Users", value: reports.totalUsers },
        { name: "Active Users", value: reports.activeUsers },
        { name: "Premium Users", value: reports.premiumUsers },
        { name: "Verified Users", value: reports.verifiedUsers },
    ];

    const productData = [
        { name: "Total Products", value: reports.totalProducts },
        { name: "Active Products", value: reports.activeProducts },
        { name: "Inactive Products", value: reports.inactiveProducts },
        { name: "Low Stock", value: reports.lowStockProducts },
    ];

    // ✅ API se userGrowth data use karo (12 months)
    const userGrowthData = reports.userGrowth || [];

    const userStatusData = [
        { name: "Active", value: reports.activeUsers },
        { name: "Inactive", value: reports.totalUsers - reports.activeUsers },
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    const tabs = [
        { id: "overview", name: "Overview" },
        { id: "users", name: "Users" },
        { id: "products", name: "Products" },
        { id: "financial", name: "Financial" },
    ];

    return (
        <div className="reports-page">
            <h1>📊 Admin Reports Dashboard</h1>

            {/* Controls */}
            <DateRangeSelector onDateChange={setDateRange} />
            <ReportTypeSelector reportType={reportType} setReportType={setReportType} />

            {/* Tabs */}
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? "active" : ""}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <h3>Total Users</h3>
                        <p className="big-value">{reports.totalUsers}</p>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <h3>Total Products</h3>
                        <p className="big-value">{reports.totalProducts}</p>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <h3>Premium Users</h3>
                        <p className="big-value">{reports.premiumUsers}</p>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <h3>Low Stock</h3>
                        <p className="big-value">{reports.lowStockProducts}</p>
                    </Card>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <Card>
                    <CardContent>
                        <h2 className="chart-title">👥 Users Report</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h2 className="chart-title">📦 Products Report</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h2 className="chart-title">📈 User Growth</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h2 className="chart-title">🥧 User Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    dataKey="value"
                                >
                                    {userStatusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Export Button */}
            <div className="export-box">
                <button className="export-btn">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Export Report
                </button>
            </div>
        </div>
    );
}
