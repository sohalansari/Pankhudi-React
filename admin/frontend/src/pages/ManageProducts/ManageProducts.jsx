import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse"; // ✅ CSV import/export के लिए
import "./ManageProducts.css";

const API = "http://localhost:5001/api/products";

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [search, setSearch] = useState("");

    // ✅ Load products
    const fetchProducts = async () => {
        try {
            const res = await axios.get(API);
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ✅ Delete product
    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${API}/${id}`);
            setProducts(products.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // ✅ Start edit
    const startEdit = (product) => {
        setEditingId(product.id);
        setEditForm({ ...product });
        setNewImages([]);
    };

    // ✅ Save edit (with multiple image upload)
    const saveEdit = async (id) => {
        try {
            const formData = new FormData();
            Object.keys(editForm).forEach((key) => {
                if (key !== "images") formData.append(key, editForm[key]);
            });

            // पुरानी images भेजो
            formData.append("oldImages", JSON.stringify(editForm.images || []));

            // नई images भेजो
            newImages.forEach((img) => {
                formData.append("images", img);
            });

            await axios.put(`${API}/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchProducts();
            setEditingId(null);
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    // ✅ Remove old image
    const removeOldImage = (index) => {
        const updated = [...editForm.images];
        updated.splice(index, 1);
        setEditForm({ ...editForm, images: updated });
    };

    // ✅ Search filter
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.category_id).includes(search)
    );

    // ✅ Export products to CSV
    const exportToCSV = () => {
        const csv = Papa.unparse(products);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "products_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ✅ Import products from CSV
    const importCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                try {
                    await axios.post(`${API}/bulk`, results.data); // ⚡ Backend bulk import route चाहिए
                    fetchProducts();
                    alert("Products imported successfully!");
                } catch (err) {
                    console.error("Import error:", err);
                }
            },
        });
    };

    return (
        <div className="manage-products-container">
            <div className="header-bar">
                <h2>Manage Products</h2>

                <div className="actions">
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={exportToCSV}>⬇ Export CSV</button>
                    <label className="import-btn">
                        ⬆ Import CSV
                        <input type="file" accept=".csv" hidden onChange={importCSV} />
                    </label>
                </div>
            </div>

            <table className="products-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Images</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>
                                {editingId === p.id ? (
                                    <div className="edit-images">
                                        {editForm.images?.map((img, i) => (
                                            <div key={i} className="img-wrapper">
                                                <img src={img} alt="" className="product-thumb" />
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeOldImage(i)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => setNewImages([...e.target.files])}
                                        />
                                    </div>
                                ) : (
                                    p.images?.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={p.name}
                                            className="product-thumb"
                                        />
                                    ))
                                )}
                            </td>

                            {editingId === p.id ? (
                                <>
                                    <td>
                                        <input
                                            value={editForm.name}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, name: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, price: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={editForm.discount}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    discount: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, stock: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={editForm.category_id}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    category_id: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={editForm.brand}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, brand: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => saveEdit(p.id)}>💾 Save</button>
                                        <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{p.name}</td>
                                    <td>{p.description?.slice(0, 40)}...</td>
                                    <td>₹{p.price}</td>
                                    <td>{p.discount}%</td>
                                    <td>{p.stock}</td>
                                    <td>{p.category_id}</td>
                                    <td>{p.brand}</td>
                                    <td
                                        className={
                                            p.status === "active"
                                                ? "status-active"
                                                : "status-inactive"
                                        }
                                    >
                                        {p.status}
                                    </td>
                                    <td>
                                        <button onClick={() => startEdit(p)}>✏ Edit</button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteProduct(p.id)}
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
