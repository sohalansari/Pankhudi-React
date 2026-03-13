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
    MdImage,
    MdCollections,
    MdPayment,
    MdLocalOffer,
    MdRateReview
} from "react-icons/md";

function Sidebar({ isCollapsed, onToggleCollapse }) {
    const location = useLocation();

    // ✅ Complete menu for ALL pages & SQL tables
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

        // Users & Addresses
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

        // Products & Categories (ALL levels)
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
            name: "Categories",
            icon: <MdCategory />,
            category: "products"
        },
        // Orders & Payments
        {
            path: "/orders",
            name: "Orders",
            icon: <MdShoppingCart />,
            category: "orders"
        },
        {
            path: "/payments",
            name: "Payments",
            icon: <MdPayment />,
            category: "orders"
        },

        // Content Management
        {
            path: "/banners",
            name: "Banners",
            icon: <MdImage />,
            category: "content"
        },
        {
            path: "/promocodes",
            name: "Promo Codes",
            icon: <MdLocalOffer />,
            category: "content"
        },

        // Reviews
        {
            path: "/reviews",
            name: "Reviews",
            icon: <MdRateReview />,
            category: "content"
        },

        // Settings
        {
            path: "/settings",
            name: "Settings",
            icon: <MdSettings />,
            category: "settings"
        },
        {
            path: "/help",
            name: "Help",
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
        users: "Users & Carts",
        products: "Products & Categories",
        orders: "Orders & Payments",
        content: "Content & Reviews",
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