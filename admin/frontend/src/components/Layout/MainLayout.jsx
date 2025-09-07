import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";

function MainLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize to detect mobile devices
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            // Close mobile sidebar when switching to desktop
            if (!mobile && mobileSidebarOpen) {
                setMobileSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileSidebarOpen]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    const handleOverlayClick = () => {
        setMobileSidebarOpen(false);
    };

    // Close sidebar when clicking on overlay (for mobile)
    useEffect(() => {
        if (mobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileSidebarOpen]);

    return (
        <div className="app-container">
            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={handleOverlayClick}
                    style={{ display: mobileSidebarOpen ? 'block' : 'none' }}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar-wrapper ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
                <Sidebar
                    isCollapsed={isMobile ? false : sidebarCollapsed}
                    onToggleCollapse={isMobile ? toggleMobileSidebar : toggleSidebar}
                    isMobile={isMobile}
                />
            </div>

            {/* Main content */}
            <main className={`main-content ${!isMobile && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {/* Mobile header - only show on mobile */}
                {isMobile && (
                    <div className="mobile-header">
                        <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
                            ☰
                        </button>
                        <h1 className="mobile-title">Pankhudi Admin</h1>
                    </div>
                )}

                {/* Page content */}
                <div className="page-content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default MainLayout;