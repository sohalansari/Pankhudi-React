import React, { useState, useEffect } from 'react';
import UserTable from '../../components/UserTable/UserTable';
import mockApi from '../../utils/mockApi'; // Fixed import path
import './Users.css';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await mockApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="users-loading">Loading users...</div>;
    }

    return (
        <div className="users">
            <div className="users-header">
                <h1>User Management</h1>
                <button className="refresh-btn" onClick={fetchUsers}>
                    Refresh
                </button>
            </div>
            <UserTable users={users} />
        </div>
    );
}

export default Users;