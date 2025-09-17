// File: src/App.js
import React, { useState, useEffect } from 'react';
import './cart.css';

function Cart() {
    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/cart');
            const data = await response.json();
            setCartData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setLoading(false);
        }
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartData.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartData.map(item => item.id));
        }
    };

    const handleDeleteSelected = async () => {
        try {
            await fetch('http://localhost:5001/api/cart/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedItems }),
            });
            setSelectedItems([]);
            fetchCartData(); // Refresh data
        } catch (error) {
            console.error('Error deleting items:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading cart data...</div>;
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h1>Admin Dashboard - Cart Management</h1>
                <div className="user-info">
                    <span>Welcome, Admin</span>
                    <button className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="sidebar">
                    <h3>Navigation</h3>
                    <ul>
                        <li className="active">Cart Management</li>
                        <li>User Management</li>
                        <li>Product Management</li>
                        <li>Order Management</li>
                        <li>Reports</li>
                    </ul>
                </div>

                <div className="main-content">
                    <div className="content-header">
                        <h2>Cart Items</h2>
                        <div className="action-buttons">
                            <button
                                className="btn btn-danger"
                                disabled={selectedItems.length === 0}
                                onClick={handleDeleteSelected}
                            >
                                Delete Selected
                            </button>
                            <button className="btn btn-primary">Export Data</button>
                            <button className="btn btn-success" onClick={fetchCartData}>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="stats-cards">
                        <div className="stat-card">
                            <h4>Total Cart Items</h4>
                            <p>{cartData.length}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Active Users</h4>
                            <p>24</p>
                        </div>
                        <div className="stat-card">
                            <h4>Total Value</h4>
                            <p>$1,243.50</p>
                        </div>
                    </div>

                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === cartData.length && cartData.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Product ID</th>
                                    <th>Quantity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartData.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                            />
                                        </td>
                                        <td>{item.id}</td>
                                        <td>{item.user_id}</td>
                                        <td>{item.product_id}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            <button className="btn-edit">Edit</button>
                                            <button className="btn-delete">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;