import React from "react";
import "./Navbar.css";

function Navbar() {
    const handleLogout = () => {
        localStorage.removeItem("auth");
        window.location.reload();
    };

    return (
        <div className="navbar">
            <div className="navbar-content">
                <h3 className="navbar-title">Welcome Admin</h3>
                <div className="navbar-user-info">
                    <span className="user-name">Admin User</span>
                    <div className="user-avatar">
                        <i className="fas fa-user"></i>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;