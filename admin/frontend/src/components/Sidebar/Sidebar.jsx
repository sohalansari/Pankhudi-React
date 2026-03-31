// src/components/Sidebar/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isCollapsed, onToggleCollapse, isMobile, onCloseMobile }) {
    const menuItems = [
        { path: "/dashboard", icon: "📊", label: "Dashboard" },
        { path: "/products", icon: "📦", label: "Products" },
        { path: "/add-product", icon: "➕", label: "Add Product" },
        { path: "/orders", icon: "🛒", label: "Orders" },
        { path: "/users", icon: "👥", label: "Users" },
        { path: "/categories", icon: "📁", label: "Categories" },
        { path: "/banners", icon: "🎨", label: "Banners" },
        { path: "/promocodes", icon: "🏷️", label: "Promo Codes" },
        { path: "/reviews", icon: "⭐", label: "Reviews" },
        { path: "/reports", icon: "📈", label: "Reports" },
        { path: "/settings", icon: "⚙️", label: "Settings" },
    ];

    const handleClick = () => {
        if (isMobile && onCloseMobile) onCloseMobile();
    };

    return (
        <div className="sidebar-container">
            {/* Logo */}
            <div className="logo">
                {!isCollapsed ? (
                    <>
                        <span className="logo-icon">🕊️</span>
                        <div className="logo-text">
                            <span className="logo-title">Pankhudi</span>
                            <span className="logo-subtitle">Admin Panel</span>
                        </div>
                    </>
                ) : (
                    <span className="logo-icon">🕊️</span>
                )}
            </div>
            {/* Toggle Button */}
            {!isMobile && (
                <button className="toggle-b" onClick={onToggleCollapse}>
                    {isCollapsed ? "→" : "←"}
                </button>
            )}

            {/* Navigation */}
            <nav className="nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleClick}
                        title={isCollapsed ? item.label : ""}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>


        </div>
    );
}

export default Sidebar;