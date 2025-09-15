import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isCollapsed, onToggleCollapse }) {
    const location = useLocation();

    const menuItems = [
        { path: "/dashboard", name: "Dashboard", icon: "📊" },
        { path: "/users", name: "Users", icon: "👥" },
        { path: "/add-product", name: "Add Product", icon: "➕" },
        { path: "/products", name: "Manage Products", icon: "🛒" },
        { path: "/reports", name: "Reports", icon: "📄" },
        { path: "/settings", name: "Settings", icon: "⚙️" },
        { path: "/analytics", name: "Analytics", icon: "📈" },
        { path: "/content", name: "Content", icon: "📝" },
        { path: "/help", name: "Help & Support", icon: "❓" },


    ];

    return (
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <h2>{isCollapsed ? "PA" : "Pankhudi Admin"}</h2>
                <button className="toggle-btn" onClick={onToggleCollapse}>
                    {isCollapsed ? "→" : "←"}
                </button>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
                        <Link to={item.path}>
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-text">{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">AD</div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <p className="user-name">Admin User</p>
                            <p className="user-role">Super Admin</p>
                        </div>
                    )}
                </div>
                <button className="logout-btn">
                    <span>🚪</span>
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
