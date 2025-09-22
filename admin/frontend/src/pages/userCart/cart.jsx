import React, { useEffect, useState } from "react";
import { getCartItems } from "../../utils/api";
import * as XLSX from "xlsx";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import "./cart.css";

const CartList = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCartItems();
            setCart(data);
        } catch (error) {
            console.error("❌ Error fetching cart:", error);
            setError("Failed to fetch cart items. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        const interval = setInterval(fetchCart, 30000); // 30-second refresh
        return () => clearInterval(interval);
    }, []);

    // ✅ Export to Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(cart);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CartItems");
        XLSX.writeFile(workbook, "CartItems.xlsx");
    };

    // ✅ Search filter
    const filteredCart = cart.filter(
        (item) =>
            item.user_id.toString().includes(search) ||
            item.product_id.toString().includes(search) ||
            (item.id && item.id.toString().includes(search)) ||
            (item.quantity && item.quantity.toString().includes(search))
    );

    // ✅ Sorting
    const sortedCart = [...filteredCart].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) {
            return 0;
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <FaSort />;
        }
        return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
    };


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedCart.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedCart.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) {
            return;
        }
        setCurrentPage(pageNumber);
    };

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h2>🛒 Admin Cart View</h2>
                <div className="cart-actions">
                    <input
                        type="text"
                        placeholder="🔍 Search all fields"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={exportToExcel} className="action-btn export-btn">
                        ⬇️ Export to Excel
                    </button>
                </div>
            </div>
            <hr />

            {loading ? (
                <p className="loading-state">Loading cart items...</p>
            ) : error ? (
                <p className="error-state">{error}</p>
            ) : sortedCart.length === 0 ? (
                <p className="empty-state">No items found in cart.</p>
            ) : (
                <>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("id")}>
                                    ID {getSortIcon("id")}
                                </th>
                                <th onClick={() => handleSort("user_id")}>
                                    User ID {getSortIcon("user_id")}
                                </th>
                                <th onClick={() => handleSort("product_id")}>
                                    Product ID {getSortIcon("product_id")}
                                </th>
                                <th onClick={() => handleSort("quantity")}>
                                    Quantity {getSortIcon("quantity")}
                                </th>
                                <th onClick={() => handleSort("added_at")}>
                                    Added At {getSortIcon("added_at")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.user_id}</td>
                                    <td>{item.product_id}</td>
                                    <td>{item.quantity}</td>
                                    <td>{new Date(item.added_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination-controls">
                        <div className="items-per-page">
                            Items per page:
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="page-buttons">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartList;