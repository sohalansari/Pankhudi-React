import React from 'react';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <div className="navbar">
            <div className="navbar-left">
                <h3>Admin Panel</h3>
            </div>
            <div className="navbar-right">
                <span className="user-name">Hello, {user?.name}</span>
                <button onClick={logout} className="logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;