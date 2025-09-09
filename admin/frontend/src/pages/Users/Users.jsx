import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import * as XLSX from "xlsx";
import "./Users.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ verified: "all", premium: "all", active: "all" });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [editingUser, setEditingUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Fetch users on mount
    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            setUsers(response.data);
            setFilteredUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch users. Please try again later.");
            setLoading(false);
            console.error(err);
        }
    };

    // Refresh data function
    const handleRefresh = () => {
        fetchUsers();
        setSearchTerm("");
        setFilters({ verified: "all", premium: "all", active: "all" });
        setSelectedUsers([]);
        setCurrentPage(1);
    };

    // Filter & Search
    useEffect(() => {
        let result = users;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.name?.toLowerCase().includes(lower) ||
                u.email?.toLowerCase().includes(lower) ||
                u.phone?.toLowerCase().includes(lower) ||
                u.address?.toLowerCase().includes(lower)
            );
        }

        if (filters.verified !== "all") result = result.filter(u => u.is_verified === (filters.verified === "true"));
        if (filters.premium !== "all") result = result.filter(u => u.is_premium === (filters.premium === "true"));
        if (filters.active !== "all") result = result.filter(u => u.is_active === (filters.active === "true"));

        setFilteredUsers(result);
        setCurrentPage(1);
    }, [users, searchTerm, filters]);

    // Sorting
    const sortedUsers = useMemo(() => {
        let sortable = [...filteredUsers];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                let aVal = a[sortConfig.key] ?? "";
                let bVal = b[sortConfig.key] ?? "";
                if (typeof aVal === 'string') return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                return sortConfig.direction === 'ascending' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
            });
        }
        return sortable;
    }, [filteredUsers, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const currentUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedUsers.slice(start, start + itemsPerPage);
    }, [sortedUsers, currentPage, itemsPerPage]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    // Selection
    const toggleSelectAll = () => {
        if (selectedUsers.length === currentUsers.length) setSelectedUsers([]);
        else setSelectedUsers(currentUsers.map(u => u.id));
    };

    const toggleUserSelection = (id) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Export
    const exportToExcel = (data, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const handleExport = (scope) => {
        let data = [], fileName = "";
        switch (scope) {
            case "all": data = users; fileName = "all_users"; break;
            case "filtered": data = filteredUsers; fileName = "filtered_users"; break;
            case "selected": data = users.filter(u => selectedUsers.includes(u.id)); fileName = "selected_users"; break;
            default: return;
        }
        const formatted = data.map(u => ({
            ID: u.id,
            Name: u.name,
            Email: u.email,
            Phone: u.phone || "N/A",
            Address: u.address || "N/A",
            Verified: u.is_verified ? "Yes" : "No",
            Premium: u.is_premium ? "Yes" : "No",
            Active: u.is_active ? "Yes" : "No",
            "Created At": new Date(u.created_at).toLocaleString(),
            "Last Login": u.last_login ? new Date(u.last_login).toLocaleString() : "Never"
        }));
        exportToExcel(formatted, fileName);
        setShowExportOptions(false);
    };

    // User Actions (PATCH for safe updates)
    const handleUserAction = async (action, user) => {
        try {
            let endpoint = `/users/${user.id}`;
            let data = {};

            switch (action) {
                case "verify":
                    endpoint += "/verify";
                    data = { is_verified: !user.is_verified };
                    await api.patch(endpoint, data);
                    break;
                case "activate":
                    data = { is_active: true };
                    await api.patch(endpoint, data);
                    break;
                case "deactivate":
                    data = { is_active: false };
                    await api.patch(endpoint, data);
                    break;
                case "delete":
                    await api.delete(endpoint);
                    break;
                default: return;
            }

            await fetchUsers();
        } catch (err) {
            setError(`Failed to ${action} user. Please try again.`);
            console.error(err);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedUsers.length === 0) { setError("Please select at least one user."); return; }
        for (const id of selectedUsers) {
            const user = users.find(u => u.id === id);
            if (user) await handleUserAction(action, user);
        }
        setSelectedUsers([]);
    };

    // Edit User
    const handleEditUser = (user) => { setEditingUser(user); setShowUserModal(true); };

    // Save User (PATCH or POST)
    const handleSaveUser = async (userData) => {
        try {
            if (editingUser?.id) {
                const response = await api.patch(`/users/${editingUser.id}`, userData);
                const updatedUser = response.data;
                setUsers(prev => prev.map(u => (u.id === editingUser.id ? updatedUser : u)));
            } else {
                const response = await api.post("/users", userData);
                setUsers(prev => [response.data, ...prev]);
            }
            setShowUserModal(false);
            setEditingUser(null);
            setError(null);
        } catch (err) {
            console.error("Save user error:", err.response?.data || err.message);
            setError("Failed to save user. Please try again.");
        }
    };

    const renderSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    if (loading) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="users-page">
            {/* Header */}
            <div className="page-header">
                <h2>User Management</h2>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingUser({});
                            setShowUserModal(true);
                        }}
                    >Add New User</button>

                    {/* Refresh Button */}
                    <button
                        className="btn btn-secondary"
                        onClick={handleRefresh}
                        title="Refresh data"
                    >
                        Refresh Data
                    </button>

                    <div className="export-dropdown">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowExportOptions(!showExportOptions)}
                        >Export Data</button>
                        {showExportOptions && (
                            <div className="export-options">
                                <button onClick={() => handleExport("all")}>Export All</button>
                                <button onClick={() => handleExport("filtered")}>Export Filtered</button>
                                <button
                                    onClick={() => handleExport("selected")}
                                    disabled={selectedUsers.length === 0}
                                >
                                    Export Selected ({selectedUsers.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-panel">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <select
                        value={filters.verified}
                        onChange={e => setFilters({ ...filters, verified: e.target.value })}
                    >
                        <option value="all">All Verification</option>
                        <option value="true">Verified</option>
                        <option value="false">Not Verified</option>
                    </select>

                    <select
                        value={filters.premium}
                        onChange={e => setFilters({ ...filters, premium: e.target.value })}
                    >
                        <option value="all">All Premium</option>
                        <option value="true">Premium</option>
                        <option value="false">Standard</option>
                    </select>

                    <select
                        value={filters.active}
                        onChange={e => setFilters({ ...filters, active: e.target.value })}
                    >
                        <option value="all">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                <div className="items-per-page">
                    <span>Show </span>
                    <select
                        value={itemsPerPage}
                        onChange={e => setItemsPerPage(parseInt(e.target.value))}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                    <span> entries</span>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="bulk-actions">
                <span>{selectedUsers.length} user(s) selected</span>
                <button
                    onClick={() => handleBulkAction("activate")}
                    disabled={selectedUsers.length === 0}
                >Activate Selected</button>
                <button
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={selectedUsers.length === 0}
                >Deactivate Selected</button>
                <button
                    onClick={() => handleBulkAction("delete")}
                    disabled={selectedUsers.length === 0}
                    className="danger"
                >Delete Selected</button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th><input
                                type="checkbox"
                                checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                onChange={toggleSelectAll}
                                disabled={currentUsers.length === 0}
                            /></th>
                            <th onClick={() => handleSort("id")}>ID {renderSortIndicator("id")}</th>
                            <th onClick={() => handleSort("name")}>Name {renderSortIndicator("name")}</th>
                            <th onClick={() => handleSort("email")}>Email {renderSortIndicator("email")}</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th onClick={() => handleSort("is_verified")}>Verified {renderSortIndicator("is_verified")}</th>
                            <th onClick={() => handleSort("is_premium")}>Premium {renderSortIndicator("is_premium")}</th>
                            <th onClick={() => handleSort("is_active")}>Status {renderSortIndicator("is_active")}</th>
                            <th onClick={() => handleSort("created_at")}>Created At {renderSortIndicator("created_at")}</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? currentUsers.map(user => (
                            <tr key={user.id} className={!user.is_active ? "inactive" : ""}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleUserSelection(user.id)}
                                    />
                                </td>
                                <td>{user.id}</td>
                                <td>
                                    {user.profile_picture && <img src={user.profile_picture} alt={user.name} className="user-avatar" />}
                                    {user.name}
                                </td>
                                <td>{user.email}</td>
                                <td>{user.phone || "N/A"}</td>
                                <td>{user.address || "N/A"}</td>
                                <td>{user.is_verified ? "✅" : "❌"}</td>
                                <td>{user.is_premium ? "⭐" : "—"}</td>
                                <td>
                                    <span className={`status ${user.is_active ? "active" : "inactive"}`}>
                                        {user.is_active ? "🟢 Active" : "🔴 Inactive"}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleString()}</td>
                                <td>{user.last_login ? new Date(user.last_login).toLocaleString() : "—"}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon edit"
                                            onClick={() => handleEditUser(user)}
                                            title="Edit user"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="btn-icon verify"
                                            onClick={() => handleUserAction("verify", user)}
                                            title={user.is_verified ? "Unverify user" : "Verify user"}
                                        >
                                            {user.is_verified ? "❌" : "✅"}
                                        </button>

                                        {user.is_active ? (
                                            <button
                                                className="btn-icon deactivate"
                                                onClick={() => handleUserAction("deactivate", user)}
                                                title="Deactivate user"
                                            >
                                                ⏸️
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-icon activate"
                                                onClick={() => handleUserAction("activate", user)}
                                                title="Activate user"
                                            >
                                                ▶️
                                            </button>
                                        )}

                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleUserAction("delete", user)}
                                            title="Delete user"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="12" className="no-data">No users found matching your criteria</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination-controls">
                <div className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} entries
                </div>
                <div className="pagination-buttons">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                        .map((page, index, array) => {
                            const previous = array[index - 1];
                            if (previous && page - previous > 1) return <React.Fragment key={`ellipsis-${page}`}><span>...</span><button className={currentPage === page ? "active" : ""} onClick={() => setCurrentPage(page)}>{page}</button></React.Fragment>;
                            return <button key={page} className={currentPage === page ? "active" : ""} onClick={() => setCurrentPage(page)}>{page}</button>;
                        })
                    }
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>

            {showUserModal && <UserModal user={editingUser} onSave={handleSaveUser} onClose={() => { setShowUserModal(false); setEditingUser(null); }} />}
        </div>
    );
}

// User Modal
function UserModal({ user, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        is_verified: false,
        is_premium: false,
        is_active: true,
        password: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                is_verified: user.is_verified || false,
                is_premium: user.is_premium || false,
                is_active: user.is_active ?? true,
                password: ""
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = { ...formData };
        if (user.id && !formData.password) delete dataToSend.password; // edit user, empty password ignored
        onSave(dataToSend);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>{user.id ? "Edit User" : "Add New User"}</h3>
                    <button className="close-btn" onClick={onClose}>✖️</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <label>Name<input type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
                    <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} required /></label>
                    <label>Phone<input type="text" name="phone" value={formData.phone} onChange={handleChange} /></label>
                    <label>Address<input type="text" name="address" value={formData.address} onChange={handleChange} /></label>
                    <label><input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleChange} /> Verified</label>
                    <label><input type="checkbox" name="is_premium" checked={formData.is_premium} onChange={handleChange} /> Premium</label>
                    <label><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active</label>

                    <label>Password
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!user.id}
                            placeholder={user.id ? "Leave blank to keep current password" : ""}
                        />
                    </label>

                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">{user.id ? "Update" : "Add"}</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Users;