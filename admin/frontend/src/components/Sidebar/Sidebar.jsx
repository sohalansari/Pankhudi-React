import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
    MdDashboard,
    MdPeople,
    MdShoppingCart,
    MdAddBox,
    MdCategory,
    MdSettings,
    MdHelp,
    MdAssessment
} from "react-icons/md";


function Sidebar({ isCollapsed, onToggleCollapse }) {
    const location = useLocation();
    const menuItems = [
        {
            path: "/dashboard",
            name: "Dashboard",
            icon: <MdDashboard />
        },
        {
            path: "/reports",
            name: "Reports & Analytics",
            icon: <MdAssessment />
        },
        {
            path: "/users",
            name: "Users",
            icon: <MdPeople />
        },
        {
            path: "/cart",
            name: "User Carts",
            icon: <MdShoppingCart />
        },
        {
            path: "/products",
            name: "Manage Products",
            icon: <MdShoppingCart />
        },
        {
            path: "/add-product",
            name: "Add Product",
            icon: <MdAddBox />
        },
        {
            path: "/categories",
            name: "Manage Categories",
            icon: <MdCategory />
        },
        {
            path: "/settings",
            name: "Settings",
            icon: <MdSettings />
        },
        {
            path: "/help",
            name: "Help & Support",
            icon: <MdHelp />
        }
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
