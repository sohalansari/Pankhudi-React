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
    MdAssessment,
    MdImage, // ✅ Banner के लिए सही icon
    MdCollections
} from "react-icons/md";

function Sidebar({ isCollapsed, onToggleCollapse }) {
    const location = useLocation();

    // ✅ Organized menu items by category
    const menuItems = [
        // Dashboard Section
        {
            path: "/dashboard",
            name: "Dashboard",
            icon: <MdDashboard />,
            category: "main"
        },
        {
            path: "/reports",
            name: "Reports & Analytics",
            icon: <MdAssessment />,
            category: "main"
        },

        // Users Section
        {
            path: "/users",
            name: "Users",
            icon: <MdPeople />,
            category: "users"
        },
        {
            path: "/cart",
            name: "User Carts",
            icon: <MdShoppingCart />,
            category: "users"
        },

        // Products Section
        {
            path: "/products",
            name: "Manage Products",
            icon: <MdShoppingCart />,
            category: "products"
        },
        {
            path: "/add-product",
            name: "Add Product",
            icon: <MdAddBox />,
            category: "products"
        },
        {
            path: "/categories",
            name: "Manage Categories",
            icon: <MdCategory />,
            category: "products"
        },

        // ✅ Banners Section (New)
        {
            path: "/banners",
            name: "Manage Banners",
            icon: <MdImage />, // ✅ Correct icon for banners
            category: "content"
        },
        {
            path: "/banner/create",
            name: "Create Banner",
            icon: <MdAddBox />,
            category: "content"
        },
        {
            path: "/banner-slider",
            name: "Banner Slider",
            icon: <MdCollections />,
            category: "content"
        },

        // Settings Section
        {
            path: "/settings",
            name: "Settings",
            icon: <MdSettings />,
            category: "settings"
        },
        {
            path: "/help",
            name: "Help & Support",
            icon: <MdHelp />,
            category: "settings"
        }
    ];

    // Group menu items by category
    const groupedMenuItems = menuItems.reduce((groups, item) => {
        if (!groups[item.category]) {
            groups[item.category] = [];
        }
        groups[item.category].push(item);
        return groups;
    }, {});

    // Category labels
    const categoryLabels = {
        main: "Dashboard",
        users: "Users Management",
        products: "Products Management",
        content: "Content Management", // ✅ New category
        settings: "Settings"
    };

    return (
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <h2>{isCollapsed ? "PA" : "Pankhudi Admin"}</h2>
                <button className="toggle-btn" onClick={onToggleCollapse}>
                    {isCollapsed ? "→" : "←"}
                </button>
            </div>

            <ul className="sidebar-menu">
                {Object.keys(groupedMenuItems).map((category) => (
                    <React.Fragment key={category}>
                        {!isCollapsed && (
                            <li className="menu-category">
                                <span className="category-label">
                                    {categoryLabels[category]}
                                </span>
                            </li>
                        )}

                        {groupedMenuItems[category].map((item) => (
                            <li
                                key={item.path}
                                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                            >
                                <Link to={item.path}>
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {isCollapsed ? "A" : "AD"}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <p className="user-name">Admin User</p>
                            <p className="user-role">Super Admin</p>
                        </div>
                    )}
                </div>
                <button className="logout-btn">
                    <span className="logout-icon">🚪</span>
                    {!isCollapsed && <span className="logout-text">Logout</span>}
                </button>
            </div>
        </div>
    );
}

export default Sidebar;