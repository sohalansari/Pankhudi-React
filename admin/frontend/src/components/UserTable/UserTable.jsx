import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import "./Users.css";

function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get("/users")
            .then((res) => setUsers(res.data))
            .catch((err) => console.error("Error fetching users:", err));
    }, []);

    return (
        <div className="users-page">
            <h2>All Users</h2>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Verified</th>
                        <th>Premium</th>
                        <th>Active</th>
                        <th>Created At</th>
                        <th>Last Login</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>
                                    {user.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user.name}
                                            className="user-avatar"
                                        />
                                    ) : null}
                                    {user.name}
                                </td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.address || "N/A"}</td>
                                <td>{user.is_verified ? "✅" : "❌"}</td>
                                <td>{user.is_premium ? "⭐" : "—"}</td>
                                <td>{user.is_active ? "🟢" : "🔴"}</td>
                                <td>{new Date(user.created_at).toLocaleString()}</td>
                                <td>{user.last_login ? new Date(user.last_login).toLocaleString() : "—"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Users;
