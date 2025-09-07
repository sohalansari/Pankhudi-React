import React, { useState, useEffect } from 'react';
import mockApi from '../../utils/mockApi'; // Fixed import path
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await mockApi.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <h1>Dashboard</h1>
                <div className="loading">Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Users</h3>
                    <p className="stat-number">{stats.activeUsers}</p>
                </div>
                <div className="stat-card">
                    <h3>New Users (7 days)</h3>
                    <p className="stat-number">{stats.newUsers}</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;