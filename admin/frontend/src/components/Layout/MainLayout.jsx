// src/components/Layout/MainLayout.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";

function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // State management
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved === "true";
    });
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [adminInfo, setAdminInfo] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState(3);
    const [showNotifications, setShowNotifications] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Load admin info and session data
    useEffect(() => {
        const adminData = localStorage.getItem("adminData");
        if (adminData) {
            try {
                setAdminInfo(JSON.parse(adminData));
            } catch (e) {
                console.error("Failed to parse admin data");
            }
        }

        // Session timer logic
        const auth = localStorage.getItem("auth");
        const loginTime = localStorage.getItem("loginTime");
        const tokenExpiry = localStorage.getItem("tokenExpiry");

        if ((auth || localStorage.getItem("adminToken")) && (loginTime || tokenExpiry)) {
            const sessionLimit = 12 * 60 * 60 * 1000;
            const startTime = parseInt(loginTime, 10) || parseInt(tokenExpiry, 10) - sessionLimit;

            const updateRemaining = () => {
                const now = Date.now();
                const diff = now - startTime;
                const remaining = sessionLimit - diff;

                if (remaining <= 0) {
                    localStorage.removeItem("auth");
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminData");
                    localStorage.removeItem("loginTime");
                    localStorage.removeItem("tokenExpiry");
                    localStorage.removeItem("rememberMe");
                    alert("Session expired. Please log in again.");
                    navigate("/login", { replace: true });
                } else {
                    setRemainingTime(remaining);
                }
            };

            updateRemaining();
            const interval = setInterval(updateRemaining, 1000);
            return () => clearInterval(interval);
        }
    }, [navigate]);

    // Update current time
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile && mobileSidebarOpen) setMobileSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileSidebarOpen]);

    // Save sidebar state
    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
    }, [sidebarCollapsed]);

    // Prevent body scroll on mobile
    useEffect(() => {
        document.body.style.overflow = mobileSidebarOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [mobileSidebarOpen]);

    // Format time
    const formatTime = (ms) => {
        if (!ms || ms <= 0) return "";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    // Logout function
    const handleLogout = useCallback(() => {
        const itemsToRemove = [
            "adminToken", "adminData", "auth", "loginTime", "tokenExpiry",
            "sidebarCollapsed", "adminRememberMe", "adminRememberedEmail",
            "adminLoginAttempts", "adminLockUntil"
        ];
        itemsToRemove.forEach(item => localStorage.removeItem(item));
        sessionStorage.clear();
        navigate("/login", { replace: true });
    }, [navigate]);

    // Toggle functions
    const toggleSidebar = useCallback(() => {
        if (isMobile) {
            setMobileSidebarOpen(prev => !prev);
        } else {
            setSidebarCollapsed(prev => !prev);
        }
    }, [isMobile]);

    const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
    const toggleUserMenu = useCallback(() => {
        setShowUserMenu(prev => !prev);
        if (showNotifications) setShowNotifications(false);
    }, [showNotifications]);
    const toggleNotifications = useCallback(() => {
        setShowNotifications(prev => !prev);
        if (showUserMenu) setShowUserMenu(false);
        if (notifications > 0) setNotifications(0);
    }, [showUserMenu, notifications]);
    const toggleMobileMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('.user-menu-container')) setShowUserMenu(false);
            if (showNotifications && !e.target.closest('.notifications-container')) setShowNotifications(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu, showNotifications]);

    // Get admin initials
    const getInitials = () => adminInfo?.name ? adminInfo.name.charAt(0).toUpperCase() : 'A';
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div className="layout">
            {/* Sidebar Overlay */}
            {mobileSidebarOpen && <div className="layout-overlay" onClick={closeMobileSidebar} />}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''} ${mobileSidebarOpen ? 'sidebar--open' : ''}`}>
                <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} isMobile={isMobile} onCloseMobile={closeMobileSidebar} />
            </aside>

            {/* Main Content */}
            <main className={`main ${sidebarCollapsed ? 'main--expanded' : ''}`}>
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <button className="header-btn menu-btn" onClick={toggleSidebar}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                        <div className="breadcrumb">
                            <span>Dashboard</span>
                            {location.pathname !== '/dashboard' && (
                                <>
                                    <span className="breadcrumb-sep">/</span>
                                    <span className="breadcrumb-active">{location.pathname.split('/').pop()}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="header-right">
                        {/* Session Timer */}
                        {remainingTime && (
                            <div className="session-timer">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>{formatTime(remainingTime)}</span>
                            </div>
                        )}

                        {/* Date Time */}
                        <div className="datetime">
                            <div className="time">{formattedTime}</div>
                            <div className="date">{formattedDate}</div>
                        </div>

                        {/* Notifications */}
                        <div className="notifications-container">
                            <button className={`header-btn ${showNotifications ? 'active' : ''}`} onClick={toggleNotifications}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {notifications > 0 && <span className="badge">{notifications}</span>}
                            </button>
                            {showNotifications && (
                                <div className="dropdown dropdown-notifications">
                                    <div className="dropdown-header">
                                        <h4>Notifications</h4>
                                        <button onClick={toggleNotifications}>Clear</button>
                                    </div>
                                    <div className="dropdown-list">
                                        {notifications > 0 ? (
                                            <>
                                                <div className="notification-item">
                                                    <span>📝</span>
                                                    <div><p>New review received</p><span>2 min ago</span></div>
                                                </div>
                                                <div className="notification-item">
                                                    <span>🛒</span>
                                                    <div><p>New order #ORD-12345</p><span>15 min ago</span></div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="empty-state">No new notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="user-menu-container">
                            <button className={`user-btn ${showUserMenu ? 'active' : ''}`} onClick={toggleUserMenu}>
                                <div className="avatar">{getInitials()}</div>
                                <div className="user-info">
                                    <span className="user-name">{adminInfo?.name || 'Admin User'}</span>
                                    <span className="user-role">Administrator</span>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {showUserMenu && (
                                <div className="dropdown dropdown-user">
                                    <div className="dropdown-header">
                                        <div className="avatar-lg">{getInitials()}</div>
                                        <div>
                                            <div className="user-name-lg">{adminInfo?.name || 'Admin User'}</div>
                                            <div className="user-email">{adminInfo?.email || 'admin@pankhudi.com'}</div>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={() => navigate('/admin/profile')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        My Profile
                                    </button>
                                    <button className="dropdown-item" onClick={() => navigate('/admin/settings')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        Settings
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item danger" onClick={handleLogout}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-menu-header">
                            <div className="avatar">{getInitials()}</div>
                            <div>
                                <div className="name">{adminInfo?.name || 'Admin User'}</div>
                                <div className="role">Administrator</div>
                            </div>
                        </div>
                        {remainingTime && (
                            <div className="mobile-session">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>Session: {formatTime(remainingTime)}</span>
                            </div>
                        )}
                        <button className="mobile-menu-item" onClick={() => { navigate('/admin/profile'); setIsMenuOpen(false); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            My Profile
                        </button>
                        <button className="mobile-menu-item" onClick={() => { navigate('/admin/settings'); setIsMenuOpen(false); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Settings
                        </button>
                        <div className="mobile-menu-divider"></div>
                        <button className="mobile-menu-item danger" onClick={handleLogout}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}

                {/* Page Content */}
                <div className="content">{children}</div>

                {/* Footer */}
                <footer className="footer">
                    <p>&copy; 2025 Pankhudi Foundation. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="/privacy">Privacy Policy</a>
                        <span>|</span>
                        <a href="/terms">Terms of Service</a>
                        <span>|</span>
                        <span className="version">v2.0.0</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default MainLayout;