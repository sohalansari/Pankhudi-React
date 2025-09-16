import React, { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
    const [remainingTime, setRemainingTime] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: "Admin User",
        avatar: "fas fa-user",
        role: "Administrator",
        notifications: 3
    });

    useEffect(() => {
        const auth = localStorage.getItem("auth");
        const loginTime = localStorage.getItem("loginTime");

        if (auth && loginTime) {
            const sessionLimit = 12 * 60 * 60 * 1000; // 12 hours

            const updateRemaining = () => {
                const now = Date.now();
                const diff = now - parseInt(loginTime, 10);
                const remaining = sessionLimit - diff;

                if (remaining <= 0) {
                    // session expired
                    localStorage.removeItem("auth");
                    localStorage.removeItem("loginTime");
                    localStorage.removeItem("rememberMe");
                    alert("Session expired. Please log in again.");
                    window.location.href = "/";
                } else {
                    setRemainingTime(remaining);
                }
            };

            // run immediately
            updateRemaining();
            // update every second
            const interval = setInterval(updateRemaining, 1000);
            return () => clearInterval(interval);
        } else {
            setRemainingTime(null);
        }
    }, []);

    const formatTime = (ms) => {
        if (ms === null || ms <= 0) return "";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("auth");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("rememberMe");
        window.location.href = "/";
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNotificationClick = () => {
        setUserData(prev => ({ ...prev, notifications: 0 }));
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <h3 className="navbar-title">Admin Dashboard</h3>
                </div>

                <div className={`navbar-content ${isMenuOpen ? 'active' : ''}`}>
                    {/* Session Timer */}
                    {remainingTime !== null && (
                        <div className="session-timer">
                            <i className="fas fa-clock"></i>
                            <strong>{formatTime(remainingTime)}</strong>
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="notification-bell" onClick={handleNotificationClick}>
                        <i className="fas fa-bell"></i>
                        {userData.notifications > 0 && (
                            <span className="notification-badge">{userData.notifications}</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="navbar-user-info">
                        <span className="user-name">{userData.name}</span>
                        <div className="user-avatar">
                            <i className={userData.avatar}></i>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="menu-toggle" onClick={toggleMenu}>
                    <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;