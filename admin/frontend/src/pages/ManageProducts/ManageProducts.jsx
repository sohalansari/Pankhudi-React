// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import Papa from "papaparse";
// import "./ManageProducts.css";

// const API = "http://localhost:5001/api/products";

// export default function ManageProducts() {
//     const [products, setProducts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [subCategories, setSubCategories] = useState([]);
//     const [subSubCategories, setSubSubCategories] = useState([]); // ✅ NEW: Sub-sub-categories state
//     const [editingProduct, setEditingProduct] = useState(null);
//     const [editForm, setEditForm] = useState({});
//     const [newImages, setNewImages] = useState([]);
//     const [newVideo, setNewVideo] = useState(null);
//     const [search, setSearch] = useState("");
//     const [filterCategory, setFilterCategory] = useState("");
//     const [filterSubCategory, setFilterSubCategory] = useState("");
//     const [filterSubSubCategory, setFilterSubSubCategory] = useState(""); // ✅ NEW: Sub-sub-category filter
//     const [filterBrand, setFilterBrand] = useState("");
//     const [filterStatus, setFilterStatus] = useState("all");
//     const [filterStock, setFilterStock] = useState("all");
//     const [filterRating, setFilterRating] = useState("all");
//     const [filterFeatured, setFilterFeatured] = useState("all");
//     const [filterTrending, setFilterTrending] = useState("all");
//     const [filterBestseller, setFilterBestseller] = useState("all");
//     const [sortBy, setSortBy] = useState("id");
//     const [sortOrder, setSortOrder] = useState("desc");
//     const [brands, setBrands] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [categoriesLoading, setCategoriesLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [selectedProducts, setSelectedProducts] = useState([]);

//     // ✅ Load categories, sub-categories and sub-sub-categories
//     const fetchCategories = async () => {
//         try {
//             const [categoriesRes, subCategoriesRes, subSubCategoriesRes] = await Promise.all([
//                 axios.get(`${API}/categories`),
//                 axios.get(`${API}/sub-categories`),
//                 axios.get(`${API}/sub-sub-categories`) // ✅ NEW: Fetch sub-sub-categories
//             ]);
//             setCategories(categoriesRes.data);
//             setSubCategories(subCategoriesRes.data);
//             setSubSubCategories(subSubCategoriesRes.data); // ✅ NEW: Set sub-sub-categories
//         } catch (err) {
//             console.error("Error fetching categories:", err);
//         } finally {
//             setCategoriesLoading(false);
//         }
//     };

//     // ✅ Load products
//     const fetchProducts = async () => {
//         try {
//             setLoading(true);
//             const res = await axios.get(API);
//             setProducts(res.data);

//             // Extract unique brands for filters
//             const uniqueBrands = [...new Set(res.data.map(p => p.brand))].filter(Boolean);
//             setBrands(uniqueBrands);
//         } catch (err) {
//             console.error("Error fetching products:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCategories();
//         fetchProducts();
//     }, []);

//     // ✅ Get filtered sub-categories based on selected category
//     const filteredSubCategories = useMemo(() => {
//         if (!filterCategory) return [];
//         return subCategories.filter(subCat => subCat.category_id == filterCategory);
//     }, [filterCategory, subCategories]);

//     // ✅ Get filtered sub-sub-categories based on selected sub-category
//     const filteredSubSubCategories = useMemo(() => {
//         if (!filterSubCategory) return [];
//         return subSubCategories.filter(subSubCat => subSubCat.sub_category_id == filterSubCategory);
//     }, [filterSubCategory, subSubCategories]);

//     // ✅ Get sub-categories for edit form based on selected category
//     const editFormSubCategories = useMemo(() => {
//         if (!editForm.category_id) return [];
//         return subCategories.filter(subCat => subCat.category_id == editForm.category_id);
//     }, [editForm.category_id, subCategories]);

//     // ✅ Get sub-sub-categories for edit form based on selected sub-category
//     const editFormSubSubCategories = useMemo(() => {
//         if (!editForm.sub_category_id) return [];
//         return subSubCategories.filter(subSubCat => subSubCat.sub_category_id == editForm.sub_category_id);
//     }, [editForm.sub_category_id, subSubCategories]);

//     // ✅ Delete product
//     const deleteProduct = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this product?")) return;
//         try {
//             await axios.delete(`${API}/${id}`);
//             setProducts(products.filter((p) => p.id !== id));
//             setSelectedProducts(selectedProducts.filter(productId => productId !== id));
//             alert("✅ Product deleted successfully!");
//         } catch (err) {
//             console.error("Delete error:", err);
//             alert("❌ Error deleting product: " + (err.response?.data?.error || err.message));
//         }
//     };

//     // ✅ Bulk delete products
//     const bulkDeleteProducts = async () => {
//         if (!selectedProducts.length) {
//             alert("Please select products to delete");
//             return;
//         }

//         if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;

//         try {
//             const deletePromises = selectedProducts.map(id =>
//                 axios.delete(`${API}/${id}`)
//             );
//             await Promise.all(deletePromises);

//             setProducts(products.filter(p => !selectedProducts.includes(p.id)));
//             setSelectedProducts([]);
//             alert(`✅ ${selectedProducts.length} products deleted successfully!`);
//         } catch (err) {
//             console.error("Bulk delete error:", err);
//             alert("❌ Error deleting products: " + (err.response?.data?.error || err.message));
//         }
//     };

//     // ✅ Toggle product selection
//     const toggleProductSelection = (id) => {
//         setSelectedProducts(prev =>
//             prev.includes(id)
//                 ? prev.filter(productId => productId !== id)
//                 : [...prev, id]
//         );
//     };

//     // ✅ Select all products
//     const selectAllProducts = () => {
//         if (selectedProducts.length === filteredAndSortedProducts.length) {
//             setSelectedProducts([]);
//         } else {
//             setSelectedProducts(filteredAndSortedProducts.map(p => p.id));
//         }
//     };

//     // ✅ Start edit - opens modal
//     const startEdit = (product) => {
//         setEditingProduct(product);
//         setEditForm({
//             ...product,
//             sizes: Array.isArray(product.sizes) ? product.sizes : [],
//             colors: Array.isArray(product.colors) ? product.colors : [],
//             features: Array.isArray(product.features) ? product.features : [],
//             tags: Array.isArray(product.tags) ? product.tags : [],
//             category_id: product.category_id || "",
//             sub_category_id: product.sub_category_id || "",
//             sub_sub_category_id: product.sub_sub_category_id || "", // ✅ NEW: Sub-sub-category ID
//             short_description: product.short_description || "",
//             weight: product.weight || "",
//             dimensions: product.dimensions || "",
//             warranty: product.warranty || "",
//             return_policy: product.return_policy || "",
//             slug: product.slug || "",
//             min_order_quantity: product.min_order_quantity || 1,
//             max_order_quantity: product.max_order_quantity || "",
//             low_stock_threshold: product.low_stock_threshold || 10,
//             is_virtual: product.is_virtual || false,
//             is_downloadable: product.is_downloadable || false,
//             download_link: product.download_link || "",
//             shipping_class: product.shipping_class || "",
//             tax_class: product.tax_class || "",
//             shipping_cost: product.shipping_cost || 0,
//             free_shipping: product.free_shipping || false
//         });
//         setNewImages([]);
//         setNewVideo(null);
//     };

//     // ✅ Close modal
//     const closeEditModal = () => {
//         setEditingProduct(null);
//         setEditForm({});
//         setNewImages([]);
//         setNewVideo(null);
//         setSaving(false);
//     };

//     // ✅ Save edit (with sub-sub-category support)
//     const saveEdit = async () => {
//         try {
//             setSaving(true);
//             const formData = new FormData();

//             // Append all form fields
//             Object.keys(editForm).forEach((key) => {
//                 if (key !== "images" && key !== "video" && key !== "category_name" && key !== "sub_category_name" && key !== "sub_sub_category_name") {
//                     if (Array.isArray(editForm[key])) {
//                         // Append array fields as multiple entries
//                         editForm[key].forEach(item => formData.append(key, item));
//                     } else {
//                         formData.append(key, editForm[key]);
//                     }
//                 }
//             });

//             // Append old images and video
//             formData.append("oldImages", JSON.stringify(editForm.images || []));
//             if (editForm.video) {
//                 formData.append("oldVideo", editForm.video);
//             }

//             // Append new images
//             newImages.forEach((img) => {
//                 formData.append("images", img);
//             });

//             // Append new video
//             if (newVideo) {
//                 formData.append("video", newVideo);
//             }

//             await axios.put(`${API}/${editingProduct.id}`, formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });

//             fetchProducts();
//             closeEditModal();
//             alert("✅ Product updated successfully!");
//         } catch (err) {
//             console.error("Update error:", err);
//             alert("❌ Error updating product: " + (err.response?.data?.error || err.message));
//         } finally {
//             setSaving(false);
//         }
//     };

//     // ✅ Remove old image
//     const removeOldImage = (index) => {
//         const updated = [...editForm.images];
//         updated.splice(index, 1);
//         setEditForm({ ...editForm, images: updated });
//     };

//     // ✅ Remove video
//     const removeVideo = () => {
//         setEditForm({ ...editForm, video: null });
//         setNewVideo(null);
//     };

//     // ✅ Handle array fields (sizes, colors, features)
//     const handleArrayFieldChange = (field, value) => {
//         const currentValues = [...(editForm[field] || [])];
//         if (currentValues.includes(value)) {
//             setEditForm({
//                 ...editForm,
//                 [field]: currentValues.filter(item => item !== value)
//             });
//         } else {
//             setEditForm({
//                 ...editForm,
//                 [field]: [...currentValues, value]
//             });
//         }
//     };

//     // ✅ Handle tags input
//     const handleTagsInput = (e) => {
//         if (e.key === 'Enter' && e.target.value.trim()) {
//             e.preventDefault();
//             const newTag = e.target.value.trim();
//             const currentTags = [...(editForm.tags || [])];
//             if (!currentTags.includes(newTag)) {
//                 setEditForm({
//                     ...editForm,
//                     tags: [...currentTags, newTag]
//                 });
//             }
//             e.target.value = '';
//         }
//     };

//     // ✅ Remove tag
//     const removeTag = (tagToRemove) => {
//         setEditForm({
//             ...editForm,
//             tags: (editForm.tags || []).filter(tag => tag !== tagToRemove)
//         });
//     };

//     // ✅ Handle category change in edit form
//     const handleCategoryChange = (categoryId) => {
//         setEditForm({
//             ...editForm,
//             category_id: categoryId,
//             sub_category_id: "", // Reset sub-category when category changes
//             sub_sub_category_id: "" // ✅ NEW: Reset sub-sub-category
//         });
//     };

//     // ✅ Handle sub-category change in edit form
//     const handleSubCategoryChange = (subCategoryId) => {
//         setEditForm({
//             ...editForm,
//             sub_category_id: subCategoryId,
//             sub_sub_category_id: "" // ✅ NEW: Reset sub-sub-category when sub-category changes
//         });
//     };

//     // ✅ Handle sort
//     const handleSort = (field) => {
//         if (sortBy === field) {
//             setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//         } else {
//             setSortBy(field);
//             setSortOrder("asc");
//         }
//     };

//     // ✅ Quick status update
//     const quickUpdateStatus = async (productId, newStatus) => {
//         try {
//             await axios.put(`${API}/${productId}`, {
//                 status: newStatus
//             });

//             // Update local state
//             setProducts(products.map(p =>
//                 p.id === productId ? { ...p, status: newStatus } : p
//             ));

//             alert(`✅ Status updated to ${newStatus}`);
//         } catch (err) {
//             console.error("Quick update error:", err);
//             alert("❌ Error updating status");
//         }
//     };

//     // ✅ Filter and sort products
//     const filteredAndSortedProducts = useMemo(() => {
//         let filtered = products.filter((p) => {
//             const matchesSearch =
//                 p.name.toLowerCase().includes(search.toLowerCase()) ||
//                 p.brand?.toLowerCase().includes(search.toLowerCase()) ||
//                 p.sku?.toLowerCase().includes(search.toLowerCase()) ||
//                 String(p.category_id).includes(search);

//             const matchesCategory = filterCategory ? p.category_id == filterCategory : true;
//             const matchesSubCategory = filterSubCategory ? p.sub_category_id == filterSubCategory : true;
//             const matchesSubSubCategory = filterSubSubCategory ? p.sub_sub_category_id == filterSubSubCategory : true; // ✅ NEW: Sub-sub-category filter
//             const matchesBrand = filterBrand ? p.brand === filterBrand : true;
//             const matchesStatus = filterStatus === "all" ? true : p.status === filterStatus;

//             const matchesStock = filterStock === "all" ? true :
//                 filterStock === "low" ? p.stock < 10 :
//                     filterStock === "out" ? p.stock === 0 : true;

//             const matchesRating = filterRating === "all" ? true :
//                 Number(p.rating) >= Number(filterRating);

//             const matchesFeatured = filterFeatured === "all" ? true :
//                 filterFeatured === "yes" ? p.is_featured : !p.is_featured;

//             const matchesTrending = filterTrending === "all" ? true :
//                 filterTrending === "yes" ? p.is_trending : !p.is_trending;

//             const matchesBestseller = filterBestseller === "all" ? true :
//                 filterBestseller === "yes" ? p.is_bestseller : !p.is_bestseller;

//             return matchesSearch && matchesCategory && matchesSubCategory && matchesSubSubCategory && matchesBrand &&
//                 matchesStatus && matchesStock && matchesRating &&
//                 matchesFeatured && matchesTrending && matchesBestseller;
//         });

//         // Sort products
//         return filtered.sort((a, b) => {
//             let aValue = a[sortBy];
//             let bValue = b[sortBy];

//             // Handle numeric values
//             if (sortBy === "price" || sortBy === "stock" || sortBy === "rating" || sortBy === "discount" || sortBy === "id") {
//                 aValue = Number(aValue);
//                 bValue = Number(bValue);
//             }

//             // Handle date fields
//             if (sortBy === "created_at" || sortBy === "updated_at") {
//                 aValue = new Date(aValue);
//                 bValue = new Date(bValue);
//             }

//             if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
//             if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [products, search, filterCategory, filterSubCategory, filterSubSubCategory, filterBrand, filterStatus, filterStock,
//         filterRating, filterFeatured, filterTrending, filterBestseller, sortBy, sortOrder]);

//     // ✅ Export products to CSV
//     const exportToCSV = () => {
//         const csvData = products.map(p => ({
//             ID: p.id,
//             SKU: p.sku,
//             Name: p.name,
//             Description: p.description,
//             'Short Description': p.short_description || '',
//             Price: p.price,
//             Discount: p.discount,
//             Rating: p.rating,
//             Stock: p.stock,
//             Brand: p.brand,
//             Category: p.category_name || `Category ${p.category_id}`,
//             'Sub Category': p.sub_category_name || (p.sub_category_id ? `Sub-category ${p.sub_category_id}` : 'Not Set'),
//             'Sub-Sub Category': p.sub_sub_category_name || (p.sub_sub_category_id ? `Sub-sub-category ${p.sub_sub_category_id}` : 'Not Set'), // ✅ NEW: Sub-sub-category in export
//             Status: p.status,
//             'Is Featured': p.is_featured ? 'Yes' : 'No',
//             'Is Trending': p.is_trending ? 'Yes' : 'No',
//             'Is Bestseller': p.is_bestseller ? 'Yes' : 'No',
//             Sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes,
//             Colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors,
//             Material: p.material,
//             Features: Array.isArray(p.features) ? p.features.join(', ') : p.features,
//             Tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags,
//             'Min Order Qty': p.min_order_quantity || 1,
//             'Max Order Qty': p.max_order_quantity || '',
//             'Low Stock Threshold': p.low_stock_threshold || 10,
//             'Virtual Product': p.is_virtual ? 'Yes' : 'No',
//             'Downloadable': p.is_downloadable ? 'Yes' : 'No',
//             'Free Shipping': p.free_shipping ? 'Yes' : 'No',
//             'Shipping Cost': p.shipping_cost || 0
//         }));

//         const csv = Papa.unparse(csvData);
//         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     // ✅ Clear all filters
//     const clearFilters = () => {
//         setSearch("");
//         setFilterCategory("");
//         setFilterSubCategory("");
//         setFilterSubSubCategory(""); // ✅ NEW: Clear sub-sub-category filter
//         setFilterBrand("");
//         setFilterStatus("all");
//         setFilterStock("all");
//         setFilterRating("all");
//         setFilterFeatured("all");
//         setFilterTrending("all");
//         setFilterBestseller("all");
//         setSelectedProducts([]);
//     };

//     // Available options for sizes, colors, features
//     const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40"];
//     const availableColors = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Gray", "Brown", "Multi-color"];
//     const availableFeatures = ["Waterproof", "Eco-friendly", "Machine Washable", "Fast Drying", "Wrinkle Resistant", "Stain Resistant", "Breathable", "UV Protection"];

//     return (
//         <div className="manage-products-container">
//             <div className="header-bar">
//                 <h2>Manage Products ({products.length})</h2>
//                 <div className="actions">
//                     <button onClick={exportToCSV} className="btn btn-export">
//                         <span className="icon">📥</span> Export CSV
//                     </button>
//                     {selectedProducts.length > 0 && (
//                         <button onClick={bulkDeleteProducts} className="btn btn-danger">
//                             <span className="icon">🗑</span> Delete Selected ({selectedProducts.length})
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Bulk Actions */}
//             {selectedProducts.length > 0 && (
//                 <div className="bulk-actions-bar">
//                     <span>{selectedProducts.length} product(s) selected</span>
//                     <div className="bulk-actions">
//                         <button onClick={bulkDeleteProducts} className="btn btn-sm btn-danger">
//                             Delete Selected
//                         </button>
//                         <button onClick={() => setSelectedProducts([])} className="btn btn-sm btn-clear">
//                             Clear Selection
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Filters Section */}
//             <div className="filters-panel">
//                 <div className="filter-group">
//                     <input
//                         type="text"
//                         placeholder="🔍 Search by name, brand, SKU..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="search-input"
//                     />
//                 </div>

//                 <div className="filter-group">
//                     <label>Category</label>
//                     <select value={filterCategory} onChange={(e) => {
//                         setFilterCategory(e.target.value);
//                         setFilterSubCategory(""); // Reset sub-category when category changes
//                         setFilterSubSubCategory(""); // ✅ NEW: Reset sub-sub-category
//                     }}>
//                         <option value="">All Categories</option>
//                         {categories.map(cat => (
//                             <option key={cat.id} value={cat.id}>{cat.name}</option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Sub-category filter */}
//                 <div className="filter-group">
//                     <label>Sub Category</label>
//                     <select
//                         value={filterSubCategory}
//                         onChange={(e) => {
//                             setFilterSubCategory(e.target.value);
//                             setFilterSubSubCategory(""); // ✅ NEW: Reset sub-sub-category when sub-category changes
//                         }}
//                         disabled={!filterCategory}
//                     >
//                         <option value="">All Sub-categories</option>
//                         {filteredSubCategories.map(subCat => (
//                             <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
//                         ))}
//                     </select>
//                     {!filterCategory && (
//                         <div className="filter-help-text">Select category first</div>
//                     )}
//                 </div>

//                 {/* ✅ NEW: Sub-sub-category filter */}
//                 <div className="filter-group">
//                     <label>Sub-Sub Category</label>
//                     <select
//                         value={filterSubSubCategory}
//                         onChange={(e) => setFilterSubSubCategory(e.target.value)}
//                         disabled={!filterSubCategory}
//                     >
//                         <option value="">All Sub-Sub-categories</option>
//                         {filteredSubSubCategories.map(subSubCat => (
//                             <option key={subSubCat.id} value={subSubCat.id}>{subSubCat.name}</option>
//                         ))}
//                     </select>
//                     {!filterSubCategory && (
//                         <div className="filter-help-text">Select sub-category first</div>
//                     )}
//                 </div>

//                 <div className="filter-group">
//                     <label>Brand</label>
//                     <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
//                         <option value="">All Brands</option>
//                         {brands.map(brand => (
//                             <option key={brand} value={brand}>{brand}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Status</label>
//                     <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//                         <option value="all">All Status</option>
//                         <option value="active">Active</option>
//                         <option value="inactive">Inactive</option>
//                         <option value="draft">Draft</option>
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Stock</label>
//                     <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
//                         <option value="all">All Stock</option>
//                         <option value="low">Low Stock (&lt;10)</option>
//                         <option value="out">Out of Stock</option>
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Rating</label>
//                     <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
//                         <option value="all">All Ratings</option>
//                         <option value="4">4+ Stars</option>
//                         <option value="3">3+ Stars</option>
//                         <option value="2">2+ Stars</option>
//                         <option value="1">1+ Stars</option>
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Featured</label>
//                     <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
//                         <option value="all">All</option>
//                         <option value="yes">Featured</option>
//                         <option value="no">Not Featured</option>
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Trending</label>
//                     <select value={filterTrending} onChange={(e) => setFilterTrending(e.target.value)}>
//                         <option value="all">All</option>
//                         <option value="yes">Trending</option>
//                         <option value="no">Not Trending</option>
//                     </select>
//                 </div>

//                 <div className="filter-group">
//                     <label>Bestseller</label>
//                     <select value={filterBestseller} onChange={(e) => setFilterBestseller(e.target.value)}>
//                         <option value="all">All</option>
//                         <option value="yes">Bestseller</option>
//                         <option value="no">Not Bestseller</option>
//                     </select>
//                 </div>

//                 <button onClick={clearFilters} className="btn btn-clear">
//                     Clear Filters
//                 </button>
//             </div>

//             {/* Results Count */}
//             <div className="results-info">
//                 <span>Showing {filteredAndSortedProducts.length} of {products.length} products</span>
//                 {(filterCategory || filterSubCategory || filterSubSubCategory) && (
//                     <span className="filter-info">
//                         {filterCategory && ` • Category: ${categories.find(c => c.id == filterCategory)?.name}`}
//                         {filterSubCategory && ` • Sub-category: ${subCategories.find(sc => sc.id == filterSubCategory)?.name}`}
//                         {filterSubSubCategory && ` • Sub-sub-category: ${subSubCategories.find(ssc => ssc.id == filterSubSubCategory)?.name}`}
//                     </span>
//                 )}
//             </div>

//             {loading ? (
//                 <div className="loading">🔄 Loading products...</div>
//             ) : (
//                 <div className="table-container">
//                     <table className="products-table">
//                         <thead>
//                             <tr>
//                                 <th>
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
//                                         onChange={selectAllProducts}
//                                         disabled={filteredAndSortedProducts.length === 0}
//                                     />
//                                 </th>
//                                 <th onClick={() => handleSort("id")}>
//                                     ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
//                                 </th>
//                                 <th>SKU</th>
//                                 <th>Images</th>
//                                 <th onClick={() => handleSort("name")}>
//                                     Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
//                                 </th>
//                                 <th onClick={() => handleSort("price")}>
//                                     Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
//                                 </th>
//                                 <th onClick={() => handleSort("discount")}>
//                                     Discount {sortBy === "discount" && (sortOrder === "asc" ? "↑" : "↓")}
//                                 </th>
//                                 <th onClick={() => handleSort("stock")}>
//                                     Stock {sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
//                                 </th>
//                                 <th>Category</th>
//                                 <th>Sub Category</th>
//                                 <th>Sub-Sub Category</th> {/* ✅ NEW: Sub-sub-category column */}
//                                 <th>Brand</th>
//                                 <th>Status</th>
//                                 <th onClick={() => handleSort("rating")}>
//                                     Rating {sortBy === "rating" && (sortOrder === "asc" ? "↑" : "↓")}
//                                 </th>
//                                 <th>Featured</th>
//                                 <th>Trending</th>
//                                 <th>Bestseller</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filteredAndSortedProducts.length > 0 ? (
//                                 filteredAndSortedProducts.map((p) => (
//                                     <tr key={p.id} className={p.stock === 0 ? "out-of-stock" : p.stock < 10 ? "low-stock" : ""}>
//                                         <td>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedProducts.includes(p.id)}
//                                                 onChange={() => toggleProductSelection(p.id)}
//                                             />
//                                         </td>
//                                         <td>{p.id}</td>
//                                         <td className="sku-cell">{p.sku}</td>
//                                         <td>
//                                             <div className="image-gallery">
//                                                 {p.images?.slice(0, 3).map((img, i) => (
//                                                     <img
//                                                         key={i}
//                                                         src={img}
//                                                         alt={p.name}
//                                                         className="product-thumb"
//                                                         onError={(e) => {
//                                                             e.target.src = '/placeholder-image.jpg';
//                                                         }}
//                                                     />
//                                                 ))}
//                                                 {p.images?.length > 3 && (
//                                                     <span className="more-images">+{p.images.length - 3} more</span>
//                                                 )}
//                                                 {(!p.images || p.images.length === 0) && (
//                                                     <span className="no-images">📷</span>
//                                                 )}
//                                             </div>
//                                         </td>
//                                         <td className="name-cell">{p.name}</td>
//                                         <td>₹{p.price}</td>
//                                         <td>{p.discount}%</td>
//                                         <td className={p.stock === 0 ? "stock-out" : p.stock < 10 ? "stock-low" : ""}>
//                                             {p.stock}
//                                         </td>
//                                         <td>
//                                             <span className="category-badge">
//                                                 {p.category_name || `Category ${p.category_id}`}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             {p.sub_category_name ? (
//                                                 <span className="sub-category-badge">
//                                                     {p.sub_category_name}
//                                                 </span>
//                                             ) : (
//                                                 <span className="no-sub-category">-</span>
//                                             )}
//                                         </td>
//                                         {/* ✅ NEW: Sub-sub-category display */}
//                                         <td>
//                                             {p.sub_sub_category_name ? (
//                                                 <span className="sub-sub-category-badge">
//                                                     {p.sub_sub_category_name}
//                                                 </span>
//                                             ) : (
//                                                 <span className="no-sub-sub-category">-</span>
//                                             )}
//                                         </td>
//                                         <td>{p.brand || '-'}</td>
//                                         <td>
//                                             <select
//                                                 value={p.status}
//                                                 onChange={(e) => quickUpdateStatus(p.id, e.target.value)}
//                                                 className={`status-select status-${p.status}`}
//                                             >
//                                                 <option value="active">Active</option>
//                                                 <option value="inactive">Inactive</option>
//                                                 <option value="draft">Draft</option>
//                                             </select>
//                                         </td>
//                                         <td>
//                                             <div className="rating-display">
//                                                 <span className="stars">{"⭐".repeat(Math.floor(p.rating))}</span>
//                                                 <span className="rating-value">{p.rating}</span>
//                                             </div>
//                                         </td>
//                                         <td className="boolean-cell">
//                                             {p.is_featured ? "✅" : "❌"}
//                                         </td>
//                                         <td className="boolean-cell">
//                                             {p.is_trending ? "✅" : "❌"}
//                                         </td>
//                                         <td className="boolean-cell">
//                                             {p.is_bestseller ? "✅" : "❌"}
//                                         </td>
//                                         <td>
//                                             <div className="action-buttons">
//                                                 <button className="btn btn-edit" onClick={() => startEdit(p)}>✏ Edit</button>
//                                                 <button
//                                                     className="btn btn-delete"
//                                                     onClick={() => deleteProduct(p.id)}
//                                                 >
//                                                     🗑 Delete
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="18" className="no-results"> {/* ✅ UPDATED: colSpan from 17 to 18 */}
//                                         <div className="no-results-content">
//                                             <p>📭 No products found matching your criteria</p>
//                                             <button onClick={clearFilters} className="btn btn-clear">
//                                                 Clear Filters
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {/* Edit Product Modal */}
//             {editingProduct && (
//                 <div className="modal-overlay">
//                     <div className="modal-content large-modal">
//                         <div className="modal-header">
//                             <h3>Edit Product - {editForm.name}</h3>
//                             <button className="modal-close" onClick={closeEditModal}>×</button>
//                         </div>

//                         <div className="modal-body">
//                             {/* Basic Information Section */}
//                             <div className="form-section">
//                                 <h4>Basic Information</h4>
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Product Name *</label>
//                                         <input
//                                             value={editForm.name || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, name: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>SKU *</label>
//                                         <input
//                                             value={editForm.sku || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, sku: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Brand</label>
//                                         <input
//                                             value={editForm.brand || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, brand: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Category *</label>
//                                         <select
//                                             value={editForm.category_id || ""}
//                                             onChange={(e) => handleCategoryChange(e.target.value)}
//                                         >
//                                             <option value="">Select Category</option>
//                                             {categories.map(cat => (
//                                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Sub Category</label>
//                                         <select
//                                             value={editForm.sub_category_id || ""}
//                                             onChange={(e) => handleSubCategoryChange(e.target.value)}
//                                             disabled={!editForm.category_id}
//                                         >
//                                             <option value="">Select Sub-category</option>
//                                             {editFormSubCategories.map(subCat => (
//                                                 <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
//                                             ))}
//                                         </select>
//                                         {!editForm.category_id && (
//                                             <div className="form-help-text">Select a category first</div>
//                                         )}
//                                     </div>
//                                     {/* ✅ NEW: Sub-sub-category field */}
//                                     <div className="form-group">
//                                         <label>Sub-Sub Category</label>
//                                         <select
//                                             value={editForm.sub_sub_category_id || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({
//                                                     ...editForm,
//                                                     sub_sub_category_id: e.target.value,
//                                                 })
//                                             }
//                                             disabled={!editForm.sub_category_id}
//                                         >
//                                             <option value="">Select Sub-sub-category</option>
//                                             {editFormSubSubCategories.map(subSubCat => (
//                                                 <option key={subSubCat.id} value={subSubCat.id}>{subSubCat.name}</option>
//                                             ))}
//                                         </select>
//                                         {!editForm.sub_category_id && (
//                                             <div className="form-help-text">Select a sub-category first</div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Short Description</label>
//                                     <textarea
//                                         rows="2"
//                                         value={editForm.short_description || ""}
//                                         onChange={(e) =>
//                                             setEditForm({ ...editForm, short_description: e.target.value })
//                                         }
//                                         placeholder="Brief description for product listings"
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Description</label>
//                                     <textarea
//                                         rows="4"
//                                         value={editForm.description || ""}
//                                         onChange={(e) =>
//                                             setEditForm({
//                                                 ...editForm,
//                                                 description: e.target.value,
//                                             })
//                                         }
//                                     />
//                                 </div>
//                             </div>

//                             {/* Pricing & Inventory Section */}
//                             <div className="form-section">
//                                 <h4>Pricing & Inventory</h4>
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Price (₹) *</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.price || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, price: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Discount (%)</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.discount || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, discount: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Stock</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.stock || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, stock: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Min Order Quantity</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.min_order_quantity || 1}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, min_order_quantity: e.target.value })
//                                             }
//                                             min="1"
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Max Order Quantity</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.max_order_quantity || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, max_order_quantity: e.target.value })
//                                             }
//                                             placeholder="No limit"
//                                             min="1"
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Low Stock Alert</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.low_stock_threshold || 10}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, low_stock_threshold: e.target.value })
//                                             }
//                                             min="0"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Rating</label>
//                                         <select
//                                             value={editForm.rating || "0"}
//                                             onChange={(e) =>
//                                                 setEditForm({
//                                                     ...editForm,
//                                                     rating: e.target.value,
//                                                 })
//                                             }
//                                         >
//                                             {[
//                                                 "0", "1", "1.5", "2", "2.5", "3",
//                                                 "3.5", "4", "4.5", "4.6", "4.7",
//                                                 "4.8", "4.9", "5"
//                                             ].map((r) => (
//                                                 <option key={r} value={r}>
//                                                     {r} {r !== "0" ? "⭐" : ""}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Status</label>
//                                         <select
//                                             value={editForm.status || "active"}
//                                             onChange={(e) =>
//                                                 setEditForm({
//                                                     ...editForm,
//                                                     status: e.target.value,
//                                                 })
//                                             }
//                                         >
//                                             <option value="active">Active</option>
//                                             <option value="inactive">Inactive</option>
//                                             <option value="draft">Draft</option>
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Product Variants Section */}
//                             <div className="form-section">
//                                 <h4>Product Variants</h4>
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Sizes</label>
//                                         <div className="checkbox-grid">
//                                             {availableSizes.map(size => (
//                                                 <label key={size} className="checkbox-label">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={(editForm.sizes || []).includes(size)}
//                                                         onChange={() => handleArrayFieldChange('sizes', size)}
//                                                     />
//                                                     <span>{size}</span>
//                                                 </label>
//                                             ))}
//                                         </div>
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Colors</label>
//                                         <div className="checkbox-grid">
//                                             {availableColors.map(color => (
//                                                 <label key={color} className="checkbox-label">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={(editForm.colors || []).includes(color)}
//                                                         onChange={() => handleArrayFieldChange('colors', color)}
//                                                     />
//                                                     <span>{color}</span>
//                                                 </label>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Specifications Section */}
//                             <div className="form-section">
//                                 <h4>Specifications</h4>
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Material</label>
//                                         <input
//                                             value={editForm.material || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, material: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Weight</label>
//                                         <input
//                                             value={editForm.weight || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, weight: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Dimensions</label>
//                                         <input
//                                             value={editForm.dimensions || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, dimensions: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Warranty</label>
//                                         <input
//                                             value={editForm.warranty || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, warranty: e.target.value })
//                                             }
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Return Policy</label>
//                                         <textarea
//                                             rows="2"
//                                             value={editForm.return_policy || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, return_policy: e.target.value })
//                                             }
//                                             placeholder="Return policy details"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Features</label>
//                                     <div className="checkbox-grid">
//                                         {availableFeatures.map(feature => (
//                                             <label key={feature} className="checkbox-label">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={(editForm.features || []).includes(feature)}
//                                                     onChange={() => handleArrayFieldChange('features', feature)}
//                                                 />
//                                                 <span>{feature}</span>
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Tags</label>
//                                     <input
//                                         type="text"
//                                         placeholder="Type tag and press Enter"
//                                         onKeyPress={handleTagsInput}
//                                         className="tags-input"
//                                     />
//                                     <div className="tags-container">
//                                         {(editForm.tags || []).map((tag, index) => (
//                                             <span key={index} className="tag">
//                                                 {tag}
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => removeTag(tag)}
//                                                     className="tag-remove"
//                                                 >
//                                                     ×
//                                                 </button>
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Shipping & Digital Settings */}
//                             <div className="form-section">
//                                 <h4>Shipping & Digital Settings</h4>
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label className="checkbox-label-large">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={editForm.is_virtual || false}
//                                                 onChange={(e) =>
//                                                     setEditForm({ ...editForm, is_virtual: e.target.checked })
//                                                 }
//                                             />
//                                             <span>Virtual Product (No shipping)</span>
//                                         </label>
//                                     </div>
//                                     <div className="form-group">
//                                         <label className="checkbox-label-large">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={editForm.is_downloadable || false}
//                                                 onChange={(e) =>
//                                                     setEditForm({ ...editForm, is_downloadable: e.target.checked })
//                                                 }
//                                             />
//                                             <span>Downloadable Product</span>
//                                         </label>
//                                     </div>
//                                     <div className="form-group">
//                                         <label className="checkbox-label-large">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={editForm.free_shipping || false}
//                                                 onChange={(e) =>
//                                                     setEditForm({ ...editForm, free_shipping: e.target.checked })
//                                                 }
//                                             />
//                                             <span>Free Shipping</span>
//                                         </label>
//                                     </div>
//                                 </div>

//                                 {editForm.is_downloadable && (
//                                     <div className="form-group">
//                                         <label>Download Link</label>
//                                         <input
//                                             value={editForm.download_link || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, download_link: e.target.value })
//                                             }
//                                             placeholder="https://example.com/download/file.zip"
//                                         />
//                                     </div>
//                                 )}

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Shipping Class</label>
//                                         <input
//                                             value={editForm.shipping_class || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, shipping_class: e.target.value })
//                                             }
//                                             placeholder="Standard, Express, etc."
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Tax Class</label>
//                                         <input
//                                             value={editForm.tax_class || ""}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, tax_class: e.target.value })
//                                             }
//                                             placeholder="Standard, Reduced, Zero"
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Shipping Cost (₹)</label>
//                                         <input
//                                             type="number"
//                                             value={editForm.shipping_cost || 0}
//                                             onChange={(e) =>
//                                                 setEditForm({ ...editForm, shipping_cost: e.target.value })
//                                             }
//                                             min="0"
//                                             step="0.01"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Marketing Section */}
//                             <div className="form-section">
//                                 <h4>Marketing</h4>
//                                 <div className="form-row">
//                                     <div className="form-group checkbox-group">
//                                         <label className="checkbox-label-large">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={editForm.is_featured || false}
//                                                 onChange={(e) =>
//                                                     setEditForm({ ...editForm, is_featured: e.target.checked })
//                                                 }
//                                             />
//                                             <span>Featured Product</span>
//                                         </label>
//                                     </div>
//                                     <div className="form-group checkbox-group">
//                                         <label className="checkbox-label-large">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={editForm.is_trending || false}
//                                                 onChange={(e) =>
//                                                     setEditForm({ ...editForm, is_trending: e.target.checked })
//                                                 }
//                                             />
//                                             <span>Trending Product</span>
//                                         </label>
//                                     </div>
//                                     <div className="form-group checkbox-group">
//                                         <label className="checkbox-label-large">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={editForm.is_bestseller || false}
//                                                 onChange={(e) =>
//                                                     setEditForm({ ...editForm, is_bestseller: e.target.checked })
//                                                 }
//                                             />
//                                             <span>Bestseller Product</span>
//                                         </label>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Media Section */}
//                             <div className="form-section">
//                                 <h4>Media</h4>
//                                 <div className="form-group">
//                                     <label>Current Images</label>
//                                     <div className="edit-images">
//                                         {editForm.images?.map((img, i) => (
//                                             <div key={i} className="img-wrapper">
//                                                 <img src={img} alt="" className="product-thumb" />
//                                                 <button
//                                                     type="button"
//                                                     className="remove-btn"
//                                                     onClick={() => removeOldImage(i)}
//                                                 >
//                                                     ✕
//                                                 </button>
//                                             </div>
//                                         ))}
//                                         {(!editForm.images || editForm.images.length === 0) && (
//                                             <div className="no-images-message">No images uploaded</div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Add New Images</label>
//                                     <input
//                                         type="file"
//                                         multiple
//                                         accept="image/*"
//                                         onChange={(e) => setNewImages([...e.target.files])}
//                                     />
//                                     {newImages.length > 0 && (
//                                         <div className="new-images-info">
//                                             {newImages.length} new image(s) selected
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Product Video</label>
//                                     {editForm.video && (
//                                         <div className="video-preview">
//                                             <video controls className="video-player">
//                                                 <source src={editForm.video} type="video/mp4" />
//                                                 Your browser does not support the video tag.
//                                             </video>
//                                             <button
//                                                 type="button"
//                                                 className="btn btn-remove-video"
//                                                 onClick={removeVideo}
//                                             >
//                                                 Remove Video
//                                             </button>
//                                         </div>
//                                     )}
//                                     <input
//                                         type="file"
//                                         accept="video/*"
//                                         onChange={(e) => setNewVideo(e.target.files[0])}
//                                     />
//                                     {newVideo && (
//                                         <div className="new-video-info">
//                                             New video selected: {newVideo.name}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* SEO Section */}
//                             <div className="form-section">
//                                 <h4>SEO</h4>
//                                 <div className="form-group">
//                                     <label>URL Slug</label>
//                                     <input
//                                         value={editForm.slug || ""}
//                                         onChange={(e) =>
//                                             setEditForm({ ...editForm, slug: e.target.value })
//                                         }
//                                         placeholder="product-url-slug"
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>SEO Title</label>
//                                     <input
//                                         value={editForm.seo_title || ""}
//                                         onChange={(e) =>
//                                             setEditForm({ ...editForm, seo_title: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>SEO Description</label>
//                                     <textarea
//                                         rows="3"
//                                         value={editForm.seo_description || ""}
//                                         onChange={(e) =>
//                                             setEditForm({ ...editForm, seo_description: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Meta Keywords</label>
//                                     <input
//                                         value={editForm.meta_keywords || ""}
//                                         onChange={(e) =>
//                                             setEditForm({ ...editForm, meta_keywords: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="modal-footer">
//                             <button className="btn btn-cancel" onClick={closeEditModal} disabled={saving}>
//                                 Cancel
//                             </button>
//                             <button className="btn btn-save" onClick={saveEdit} disabled={saving}>
//                                 {saving ? "🔄 Saving..." : "💾 Save Changes"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }














import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./ManageProducts.css";

const API = "http://localhost:5001/api/products";

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [newVideo, setNewVideo] = useState(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterSubCategory, setFilterSubCategory] = useState("");
    const [filterSubSubCategory, setFilterSubSubCategory] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterStock, setFilterStock] = useState("all");
    const [filterRating, setFilterRating] = useState("all");
    const [filterFeatured, setFilterFeatured] = useState("all");
    const [filterTrending, setFilterTrending] = useState("all");
    const [filterBestseller, setFilterBestseller] = useState("all");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("desc");
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [apiError, setApiError] = useState(null);

    // ✅ Load categories, sub-categories and sub-sub-categories
    const fetchCategories = async () => {
        try {
            const [categoriesRes, subCategoriesRes, subSubCategoriesRes] = await Promise.all([
                axios.get(`${API}/categories`),
                axios.get(`${API}/sub-categories`),
                axios.get(`${API}/sub-sub-categories`)
            ]);
            setCategories(categoriesRes.data);
            setSubCategories(subCategoriesRes.data);
            setSubSubCategories(subSubCategoriesRes.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // ✅ Load products with error handling
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setApiError(null);
            const res = await axios.get(API);

            // Ensure products is always an array
            const productsData = Array.isArray(res.data) ? res.data :
                (res.data.products ? res.data.products : []);

            setProducts(productsData);

            // Extract unique brands for filters
            const uniqueBrands = [...new Set(productsData.map(p => p.brand).filter(Boolean))];
            setBrands(uniqueBrands);
        } catch (err) {
            console.error("Error fetching products:", err);
            setApiError(err.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    // ✅ Get filtered sub-categories based on selected category
    const filteredSubCategories = useMemo(() => {
        if (!filterCategory) return [];
        return subCategories.filter(subCat => String(subCat.category_id) === String(filterCategory));
    }, [filterCategory, subCategories]);

    // ✅ Get filtered sub-sub-categories based on selected sub-category
    const filteredSubSubCategories = useMemo(() => {
        if (!filterSubCategory) return [];
        return subSubCategories.filter(subSubCat => String(subSubCat.sub_category_id) === String(filterSubCategory));
    }, [filterSubCategory, subSubCategories]);

    // ✅ Get sub-categories for edit form based on selected category
    const editFormSubCategories = useMemo(() => {
        if (!editForm.category_id) return [];
        return subCategories.filter(subCat => String(subCat.category_id) === String(editForm.category_id));
    }, [editForm.category_id, subCategories]);

    // ✅ Get sub-sub-categories for edit form based on selected sub-category
    const editFormSubSubCategories = useMemo(() => {
        if (!editForm.sub_category_id) return [];
        return subSubCategories.filter(subSubCat => String(subSubCat.sub_category_id) === String(editForm.sub_category_id));
    }, [editForm.sub_category_id, subSubCategories]);

    // ✅ Delete product
    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${API}/${id}`);
            setProducts(products.filter((p) => p.id !== id));
            setSelectedProducts(selectedProducts.filter(productId => productId !== id));
            alert("✅ Product deleted successfully!");
        } catch (err) {
            console.error("Delete error:", err);
            alert("❌ Error deleting product: " + (err.response?.data?.error || err.message));
        }
    };

    // ✅ Bulk delete products
    const bulkDeleteProducts = async () => {
        if (!selectedProducts.length) {
            alert("Please select products to delete");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;

        try {
            const deletePromises = selectedProducts.map(id =>
                axios.delete(`${API}/${id}`)
            );
            await Promise.all(deletePromises);

            setProducts(products.filter(p => !selectedProducts.includes(p.id)));
            setSelectedProducts([]);
            alert(`✅ ${selectedProducts.length} products deleted successfully!`);
        } catch (err) {
            console.error("Bulk delete error:", err);
            alert("❌ Error deleting products: " + (err.response?.data?.error || err.message));
        }
    };

    // ✅ Toggle product selection
    const toggleProductSelection = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id)
                ? prev.filter(productId => productId !== id)
                : [...prev, id]
        );
    };

    // ✅ Select all products
    const selectAllProducts = () => {
        if (selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredAndSortedProducts.map(p => p.id));
        }
    };

    // ✅ Start edit - opens modal
    const startEdit = (product) => {
        setEditingProduct(product);
        setEditForm({
            ...product,
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            colors: Array.isArray(product.colors) ? product.colors : [],
            features: Array.isArray(product.features) ? product.features : [],
            tags: Array.isArray(product.tags) ? product.tags : [],
            category_id: product.category_id || "",
            sub_category_id: product.sub_category_id || "",
            sub_sub_category_id: product.sub_sub_category_id || "",
            short_description: product.short_description || "",
            weight: product.weight || "",
            dimensions: product.dimensions || "",
            warranty: product.warranty || "",
            return_policy: product.return_policy || "",
            slug: product.slug || "",
            min_order_quantity: product.min_order_quantity || 1,
            max_order_quantity: product.max_order_quantity || "",
            low_stock_threshold: product.low_stock_threshold || 10,
            is_virtual: product.is_virtual || false,
            is_downloadable: product.is_downloadable || false,
            download_link: product.download_link || "",
            shipping_class: product.shipping_class || "",
            tax_class: product.tax_class || "",
            shipping_cost: product.shipping_cost || 0,
            free_shipping: product.free_shipping || false
        });
        setNewImages([]);
        setNewVideo(null);
    };

    // ✅ Close modal
    const closeEditModal = () => {
        setEditingProduct(null);
        setEditForm({});
        setNewImages([]);
        setNewVideo(null);
        setSaving(false);
    };

    // 🔥🔥🔥 COMPLETE REWRITE - Save edit with minimal fields
    const saveEdit = async () => {
        try {
            setSaving(true);

            // ✅ APPROACH 1: Try sending as JSON first (no file uploads)
            // Only use FormData if we have new files
            if (newImages.length === 0 && !newVideo) {
                console.log("📤 Sending as JSON (no new files)");

                // Create a clean JSON object
                const jsonData = {
                    id: editForm.id,
                    sku: editForm.sku,
                    name: editForm.name,
                    description: editForm.description,
                    short_description: editForm.short_description,
                    price: editForm.price,
                    discount: editForm.discount,
                    rating: editForm.rating,
                    stock: editForm.stock,
                    weight: editForm.weight,
                    dimensions: editForm.dimensions,
                    material: editForm.material,
                    colors: JSON.stringify(editForm.colors || []),
                    sizes: JSON.stringify(editForm.sizes || []),
                    warranty: editForm.warranty,
                    return_policy: editForm.return_policy,
                    slug: editForm.slug,
                    seo_title: editForm.seo_title,
                    seo_description: editForm.seo_description,
                    meta_keywords: editForm.meta_keywords,
                    tags: JSON.stringify(editForm.tags || []),
                    features: JSON.stringify(editForm.features || []),
                    min_order_quantity: editForm.min_order_quantity,
                    max_order_quantity: editForm.max_order_quantity,
                    low_stock_threshold: editForm.low_stock_threshold,
                    status: editForm.status,
                    category_id: editForm.category_id,
                    brand: editForm.brand,
                    sub_category_id: editForm.sub_category_id,
                    sub_sub_category_id: editForm.sub_sub_category_id,
                    is_featured: editForm.is_featured ? 'true' : 'false',
                    is_trending: editForm.is_trending ? 'true' : 'false',
                    is_bestseller: editForm.is_bestseller ? 'true' : 'false',
                    is_virtual: editForm.is_virtual ? 'true' : 'false',
                    is_downloadable: editForm.is_downloadable ? 'true' : 'false',
                    download_link: editForm.download_link,
                    shipping_class: editForm.shipping_class,
                    tax_class: editForm.tax_class,
                    free_shipping: editForm.free_shipping ? 'true' : 'false',
                    shipping_cost: editForm.shipping_cost,
                    oldImages: JSON.stringify(editForm.images || []),
                    oldVideo: editForm.video || ''
                };

                console.log("📤 JSON Data keys:", Object.keys(jsonData));

                await axios.put(`${API}/${editingProduct.id}`, jsonData, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 30000
                });

                await fetchProducts();
                closeEditModal();
                alert("✅ Product updated successfully!");
                return;
            }

            // ✅ APPROACH 2: Only use FormData when we HAVE to (with new files)
            console.log("📤 Sending as FormData with files");
            const formData = new FormData();

            // Add ONLY essential fields - NO array fields as they cause issues
            const essentialFields = {
                'id': editForm.id,
                'sku': editForm.sku,
                'name': editForm.name,
                'description': editForm.description,
                'short_description': editForm.short_description,
                'price': editForm.price,
                'discount': editForm.discount,
                'rating': editForm.rating,
                'stock': editForm.stock,
                'weight': editForm.weight,
                'dimensions': editForm.dimensions,
                'material': editForm.material,
                'warranty': editForm.warranty,
                'return_policy': editForm.return_policy,
                'slug': editForm.slug,
                'seo_title': editForm.seo_title,
                'seo_description': editForm.seo_description,
                'meta_keywords': editForm.meta_keywords,
                'min_order_quantity': editForm.min_order_quantity,
                'max_order_quantity': editForm.max_order_quantity,
                'low_stock_threshold': editForm.low_stock_threshold,
                'status': editForm.status,
                'category_id': editForm.category_id,
                'brand': editForm.brand,
                'sub_category_id': editForm.sub_category_id,
                'sub_sub_category_id': editForm.sub_sub_category_id
            };

            // Add essential fields
            Object.entries(essentialFields).forEach(([key, value]) => {
                if (value != null) {
                    formData.append(key, String(value));
                }
            });

            // Add boolean fields
            const booleanFields = {
                'is_featured': editForm.is_featured,
                'is_trending': editForm.is_trending,
                'is_bestseller': editForm.is_bestseller,
                'is_virtual': editForm.is_virtual,
                'is_downloadable': editForm.is_downloadable,
                'free_shipping': editForm.free_shipping
            };

            Object.entries(booleanFields).forEach(([key, value]) => {
                formData.append(key, value ? 'true' : 'false');
            });

            // Add other string fields
            if (editForm.download_link) formData.append('download_link', editForm.download_link);
            if (editForm.shipping_class) formData.append('shipping_class', editForm.shipping_class);
            if (editForm.tax_class) formData.append('tax_class', editForm.tax_class);
            if (editForm.shipping_cost) formData.append('shipping_cost', String(editForm.shipping_cost));

            // ✅ CRITICAL FIX: Send array fields as SIMPLE comma-separated strings, NOT JSON
            if (editForm.colors && editForm.colors.length > 0) {
                formData.append('colors', editForm.colors.join(','));
            }

            if (editForm.sizes && editForm.sizes.length > 0) {
                formData.append('sizes', editForm.sizes.join(','));
            }

            if (editForm.features && editForm.features.length > 0) {
                formData.append('features', editForm.features.join(','));
            }

            if (editForm.tags && editForm.tags.length > 0) {
                formData.append('tags', editForm.tags.join(','));
            }

            // ✅ Send oldImages as simple string
            if (editForm.images && editForm.images.length > 0) {
                formData.append('oldImages', JSON.stringify(editForm.images));
            }

            // ✅ Send oldVideo
            if (editForm.video) {
                formData.append('oldVideo', editForm.video);
            }

            // ✅ Add new images - MAX 5 images to reduce size
            if (newImages && newImages.length > 0) {
                const imagesToUpload = newImages.slice(0, 5);
                imagesToUpload.forEach((img) => {
                    formData.append('images', img);
                });
            }

            // ✅ Add new video
            if (newVideo) {
                formData.append('video', newVideo);
            }

            // Debug - log FormData size
            let size = 0;
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    size += pair[1].size;
                    console.log(`${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
                } else {
                    size += String(pair[1]).length;
                    console.log(`${pair[0]}: ${String(pair[1]).substring(0, 50)}${String(pair[1]).length > 50 ? '...' : ''}`);
                }
            }
            console.log(`📊 Approximate FormData size: ${size} bytes`);

            await axios.put(`${API}/${editingProduct.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                timeout: 120000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            await fetchProducts();
            closeEditModal();
            alert("✅ Product updated successfully!");
        } catch (err) {
            console.error("❌ Update error:", err);
            if (err.response) {
                alert("❌ Server error: " + (err.response.data?.error || err.response.data?.details || err.message));
            } else if (err.request) {
                alert("❌ No response from server. Please check if backend is running.");
            } else {
                alert("❌ Error: " + err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    // ✅ Remove old image
    const removeOldImage = (index) => {
        const updated = [...editForm.images];
        updated.splice(index, 1);
        setEditForm({ ...editForm, images: updated });
    };

    // ✅ Remove video
    const removeVideo = () => {
        setEditForm({ ...editForm, video: null });
        setNewVideo(null);
    };

    // ✅ Handle array fields (sizes, colors, features)
    const handleArrayFieldChange = (field, value) => {
        const currentValues = [...(editForm[field] || [])];
        if (currentValues.includes(value)) {
            setEditForm({
                ...editForm,
                [field]: currentValues.filter(item => item !== value)
            });
        } else {
            setEditForm({
                ...editForm,
                [field]: [...currentValues, value]
            });
        }
    };

    // ✅ Handle tags input
    const handleTagsInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            const currentTags = [...(editForm.tags || [])];
            if (!currentTags.includes(newTag)) {
                setEditForm({
                    ...editForm,
                    tags: [...currentTags, newTag]
                });
            }
            e.target.value = '';
        }
    };

    // ✅ Remove tag
    const removeTag = (tagToRemove) => {
        setEditForm({
            ...editForm,
            tags: (editForm.tags || []).filter(tag => tag !== tagToRemove)
        });
    };

    // ✅ Handle category change in edit form
    const handleCategoryChange = (categoryId) => {
        setEditForm({
            ...editForm,
            category_id: categoryId,
            sub_category_id: "",
            sub_sub_category_id: ""
        });
    };

    // ✅ Handle sub-category change in edit form
    const handleSubCategoryChange = (subCategoryId) => {
        setEditForm({
            ...editForm,
            sub_category_id: subCategoryId,
            sub_sub_category_id: ""
        });
    };

    // ✅ Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    // ✅ Quick status update
    const quickUpdateStatus = async (productId, newStatus) => {
        try {
            await axios.put(`${API}/${productId}`, {
                status: newStatus
            });

            setProducts(products.map(p =>
                p.id === productId ? { ...p, status: newStatus } : p
            ));

            alert(`✅ Status updated to ${newStatus}`);
        } catch (err) {
            console.error("Quick update error:", err);
            alert("❌ Error updating status");
        }
    };

    // ✅ Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        // Ensure products is an array
        const productsArray = Array.isArray(products) ? products : [];

        let filtered = productsArray.filter((p) => {
            // Skip null/undefined products
            if (!p) return false;

            const matchesSearch = !search ||
                (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
                (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
                (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
                String(p.category_id || '').includes(search);

            const matchesCategory = !filterCategory || String(p.category_id) === String(filterCategory);
            const matchesSubCategory = !filterSubCategory || String(p.sub_category_id) === String(filterSubCategory);
            const matchesSubSubCategory = !filterSubSubCategory || String(p.sub_sub_category_id) === String(filterSubSubCategory);
            const matchesBrand = !filterBrand || p.brand === filterBrand;
            const matchesStatus = filterStatus === "all" || p.status === filterStatus;

            const stock = Number(p.stock) || 0;
            const matchesStock = filterStock === "all" ? true :
                filterStock === "low" ? stock < 10 && stock > 0 :
                    filterStock === "out" ? stock === 0 : true;

            const rating = Number(p.rating) || 0;
            const matchesRating = filterRating === "all" ? true :
                rating >= Number(filterRating);

            const matchesFeatured = filterFeatured === "all" ? true :
                filterFeatured === "yes" ? p.is_featured : !p.is_featured;

            const matchesTrending = filterTrending === "all" ? true :
                filterTrending === "yes" ? p.is_trending : !p.is_trending;

            const matchesBestseller = filterBestseller === "all" ? true :
                filterBestseller === "yes" ? p.is_bestseller : !p.is_bestseller;

            return matchesSearch && matchesCategory && matchesSubCategory && matchesSubSubCategory &&
                matchesBrand && matchesStatus && matchesStock && matchesRating &&
                matchesFeatured && matchesTrending && matchesBestseller;
        });

        // Sort products
        return filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === "price" || sortBy === "stock" || sortBy === "rating" || sortBy === "discount" || sortBy === "id") {
                aValue = Number(aValue || 0);
                bValue = Number(bValue || 0);
            }

            if (sortBy === "created_at" || sortBy === "updated_at") {
                aValue = new Date(aValue || 0).getTime();
                bValue = new Date(bValue || 0).getTime();
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [products, search, filterCategory, filterSubCategory, filterSubSubCategory, filterBrand,
        filterStatus, filterStock, filterRating, filterFeatured, filterTrending, filterBestseller,
        sortBy, sortOrder]);

    // ✅ Export products to CSV
    const exportToCSV = () => {
        const productsArray = Array.isArray(products) ? products : [];
        const csvData = productsArray.map(p => ({
            ID: p.id,
            SKU: p.sku,
            Name: p.name,
            Description: p.description,
            'Short Description': p.short_description || '',
            Price: p.price,
            Discount: p.discount,
            Rating: p.rating,
            Stock: p.stock,
            Brand: p.brand,
            Category: p.category_name || `Category ${p.category_id}`,
            'Sub Category': p.sub_category_name || (p.sub_category_id ? `Sub-category ${p.sub_category_id}` : 'Not Set'),
            'Sub-Sub Category': p.sub_sub_category_name || (p.sub_sub_category_id ? `Sub-sub-category ${p.sub_sub_category_id}` : 'Not Set'),
            Status: p.status,
            'Is Featured': p.is_featured ? 'Yes' : 'No',
            'Is Trending': p.is_trending ? 'Yes' : 'No',
            'Is Bestseller': p.is_bestseller ? 'Yes' : 'No',
            Sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes,
            Colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors,
            Material: p.material,
            Features: Array.isArray(p.features) ? p.features.join(', ') : p.features,
            Tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags,
            'Min Order Qty': p.min_order_quantity || 1,
            'Max Order Qty': p.max_order_quantity || '',
            'Low Stock Threshold': p.low_stock_threshold || 10,
            'Virtual Product': p.is_virtual ? 'Yes' : 'No',
            'Downloadable': p.is_downloadable ? 'Yes' : 'No',
            'Free Shipping': p.free_shipping ? 'Yes' : 'No',
            'Shipping Cost': p.shipping_cost || 0
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ✅ Clear all filters
    const clearFilters = () => {
        setSearch("");
        setFilterCategory("");
        setFilterSubCategory("");
        setFilterSubSubCategory("");
        setFilterBrand("");
        setFilterStatus("all");
        setFilterStock("all");
        setFilterRating("all");
        setFilterFeatured("all");
        setFilterTrending("all");
        setFilterBestseller("all");
        setSelectedProducts([]);
    };

    // Available options for sizes, colors, features
    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40"];
    const availableColors = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Gray", "Brown", "Multi-color"];
    const availableFeatures = ["Waterproof", "Eco-friendly", "Machine Washable", "Fast Drying", "Wrinkle Resistant", "Stain Resistant", "Breathable", "UV Protection"];

    // Check if products is array before using length
    const productsCount = Array.isArray(products) ? products.length : 0;
    const filteredCount = filteredAndSortedProducts.length;

    return (
        <div className="manage-products-container">
            <div className="header-bar">
                <h2>Manage Products ({productsCount})</h2>
                <div className="actions">
                    <button onClick={exportToCSV} className="btn btn-export">
                        <span className="icon">📥</span> Export CSV
                    </button>
                    {selectedProducts.length > 0 && (
                        <button onClick={bulkDeleteProducts} className="btn btn-danger">
                            <span className="icon">🗑</span> Delete Selected ({selectedProducts.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="bulk-actions-bar">
                    <span>{selectedProducts.length} product(s) selected</span>
                    <div className="bulk-actions">
                        <button onClick={bulkDeleteProducts} className="btn btn-sm btn-danger">
                            Delete Selected
                        </button>
                        <button onClick={() => setSelectedProducts([])} className="btn btn-sm btn-clear">
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="filters-panel">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="🔍 Search by name, brand, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select value={filterCategory} onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setFilterSubCategory("");
                        setFilterSubSubCategory("");
                    }}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sub Category</label>
                    <select
                        value={filterSubCategory}
                        onChange={(e) => {
                            setFilterSubCategory(e.target.value);
                            setFilterSubSubCategory("");
                        }}
                        disabled={!filterCategory}
                    >
                        <option value="">All Sub-categories</option>
                        {filteredSubCategories.map(subCat => (
                            <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                        ))}
                    </select>
                    {!filterCategory && (
                        <div className="filter-help-text">Select category first</div>
                    )}
                </div>

                <div className="filter-group">
                    <label>Sub-Sub Category</label>
                    <select
                        value={filterSubSubCategory}
                        onChange={(e) => setFilterSubSubCategory(e.target.value)}
                        disabled={!filterSubCategory}
                    >
                        <option value="">All Sub-Sub-categories</option>
                        {filteredSubSubCategories.map(subSubCat => (
                            <option key={subSubCat.id} value={subSubCat.id}>{subSubCat.name}</option>
                        ))}
                    </select>
                    {!filterSubCategory && (
                        <div className="filter-help-text">Select sub-category first</div>
                    )}
                </div>

                <div className="filter-group">
                    <label>Brand</label>
                    <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
                        <option value="">All Brands</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Stock</label>
                    <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock (&lt;10)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Rating</label>
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                        <option value="all">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Featured</label>
                    <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
                        <option value="all">All</option>
                        <option value="yes">Featured</option>
                        <option value="no">Not Featured</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trending</label>
                    <select value={filterTrending} onChange={(e) => setFilterTrending(e.target.value)}>
                        <option value="all">All</option>
                        <option value="yes">Trending</option>
                        <option value="no">Not Trending</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Bestseller</label>
                    <select value={filterBestseller} onChange={(e) => setFilterBestseller(e.target.value)}>
                        <option value="all">All</option>
                        <option value="yes">Bestseller</option>
                        <option value="no">Not Bestseller</option>
                    </select>
                </div>

                <button onClick={clearFilters} className="btn btn-clear">
                    Clear Filters
                </button>
            </div>

            {/* Results Count */}
            <div className="results-info">
                <span>Showing {filteredCount} of {productsCount} products</span>
                {(filterCategory || filterSubCategory || filterSubSubCategory) && (
                    <span className="filter-info">
                        {filterCategory && ` • Category: ${categories.find(c => String(c.id) === String(filterCategory))?.name}`}
                        {filterSubCategory && ` • Sub-category: ${subCategories.find(sc => String(sc.id) === String(filterSubCategory))?.name}`}
                        {filterSubSubCategory && ` • Sub-sub-category: ${subSubCategories.find(ssc => String(ssc.id) === String(filterSubSubCategory))?.name}`}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="loading">🔄 Loading products...</div>
            ) : apiError ? (
                <div className="error-message">
                    ❌ Error loading products: {apiError}
                    <button onClick={fetchProducts} className="btn btn-retry">Retry</button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === filteredCount && filteredCount > 0}
                                        onChange={selectAllProducts}
                                        disabled={filteredCount === 0}
                                    />
                                </th>
                                <th onClick={() => handleSort("id")}>
                                    ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>SKU</th>
                                <th>Images</th>
                                <th onClick={() => handleSort("name")}>
                                    Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th onClick={() => handleSort("price")}>
                                    Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th onClick={() => handleSort("discount")}>
                                    Discount {sortBy === "discount" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th onClick={() => handleSort("stock")}>
                                    Stock {sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>Category</th>
                                <th>Sub Category</th>
                                <th>Sub-Sub Category</th>
                                <th>Brand</th>
                                <th>Status</th>
                                <th onClick={() => handleSort("rating")}>
                                    Rating {sortBy === "rating" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>Featured</th>
                                <th>Trending</th>
                                <th>Bestseller</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedProducts.length > 0 ? (
                                filteredAndSortedProducts.map((p) => (
                                    <tr key={p.id} className={p.stock === 0 ? "out-of-stock" : p.stock < 10 ? "low-stock" : ""}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(p.id)}
                                                onChange={() => toggleProductSelection(p.id)}
                                            />
                                        </td>
                                        <td>{p.id}</td>
                                        <td className="sku-cell">{p.sku}</td>
                                        <td>
                                            <div className="image-gallery">
                                                {p.images?.slice(0, 3).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={p.name}
                                                        className="product-thumb"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                ))}
                                                {p.images?.length > 3 && (
                                                    <span className="more-images">+{p.images.length - 3} more</span>
                                                )}
                                                {(!p.images || p.images.length === 0) && (
                                                    <span className="no-images">📷</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="name-cell">{p.name}</td>
                                        <td>₹{p.price}</td>
                                        <td>{p.discount}%</td>
                                        <td className={p.stock === 0 ? "stock-out" : p.stock < 10 ? "stock-low" : ""}>
                                            {p.stock}
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {p.category_name || `Category ${p.category_id}`}
                                            </span>
                                        </td>
                                        <td>
                                            {p.sub_category_name ? (
                                                <span className="sub-category-badge">
                                                    {p.sub_category_name}
                                                </span>
                                            ) : (
                                                <span className="no-sub-category">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {p.sub_sub_category_name ? (
                                                <span className="sub-sub-category-badge">
                                                    {p.sub_sub_category_name}
                                                </span>
                                            ) : (
                                                <span className="no-sub-sub-category">-</span>
                                            )}
                                        </td>
                                        <td>{p.brand || '-'}</td>
                                        <td>
                                            <select
                                                value={p.status}
                                                onChange={(e) => quickUpdateStatus(p.id, e.target.value)}
                                                className={`status-select status-${p.status}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <span className="stars">{"⭐".repeat(Math.floor(p.rating))}</span>
                                                <span className="rating-value">{p.rating}</span>
                                            </div>
                                        </td>
                                        <td className="boolean-cell">
                                            {p.is_featured ? "✅" : "❌"}
                                        </td>
                                        <td className="boolean-cell">
                                            {p.is_trending ? "✅" : "❌"}
                                        </td>
                                        <td className="boolean-cell">
                                            {p.is_bestseller ? "✅" : "❌"}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn btn-edit" onClick={() => startEdit(p)}>✏ Edit</button>
                                                <button
                                                    className="btn btn-delete"
                                                    onClick={() => deleteProduct(p.id)}
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="18" className="no-results">
                                        <div className="no-results-content">
                                            <p>📭 No products found matching your criteria</p>
                                            <button onClick={clearFilters} className="btn btn-clear">
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Edit Product - {editForm.name}</h3>
                            <button className="modal-close" onClick={closeEditModal}>×</button>
                        </div>

                        <div className="modal-body">
                            {/* Basic Information Section */}
                            <div className="form-section">
                                <h4>Basic Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            value={editForm.name || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU *</label>
                                        <input
                                            value={editForm.sku || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, sku: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            value={editForm.brand || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, brand: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            value={editForm.category_id || ""}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Sub Category</label>
                                        <select
                                            value={editForm.sub_category_id || ""}
                                            onChange={(e) => handleSubCategoryChange(e.target.value)}
                                            disabled={!editForm.category_id}
                                        >
                                            <option value="">Select Sub-category</option>
                                            {editFormSubCategories.map(subCat => (
                                                <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                                            ))}
                                        </select>
                                        {!editForm.category_id && (
                                            <div className="form-help-text">Select a category first</div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Sub-Sub Category</label>
                                        <select
                                            value={editForm.sub_sub_category_id || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    sub_sub_category_id: e.target.value,
                                                })
                                            }
                                            disabled={!editForm.sub_category_id}
                                        >
                                            <option value="">Select Sub-sub-category</option>
                                            {editFormSubSubCategories.map(subSubCat => (
                                                <option key={subSubCat.id} value={subSubCat.id}>{subSubCat.name}</option>
                                            ))}
                                        </select>
                                        {!editForm.sub_category_id && (
                                            <div className="form-help-text">Select a sub-category first</div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Short Description</label>
                                    <textarea
                                        rows="2"
                                        value={editForm.short_description || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, short_description: e.target.value })
                                        }
                                        placeholder="Brief description for product listings"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="4"
                                        value={editForm.description || ""}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Pricing & Inventory Section */}
                            <div className="form-section">
                                <h4>Pricing & Inventory</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={editForm.price || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, price: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount (%)</label>
                                        <input
                                            type="number"
                                            value={editForm.discount || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, discount: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            value={editForm.stock || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, stock: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Min Order Quantity</label>
                                        <input
                                            type="number"
                                            value={editForm.min_order_quantity || 1}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, min_order_quantity: e.target.value })
                                            }
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Max Order Quantity</label>
                                        <input
                                            type="number"
                                            value={editForm.max_order_quantity || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, max_order_quantity: e.target.value })
                                            }
                                            placeholder="No limit"
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Low Stock Alert</label>
                                        <input
                                            type="number"
                                            value={editForm.low_stock_threshold || 10}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, low_stock_threshold: e.target.value })
                                            }
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <select
                                            value={editForm.rating || "0"}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    rating: e.target.value,
                                                })
                                            }
                                        >
                                            {[
                                                "0", "1", "1.5", "2", "2.5", "3",
                                                "3.5", "4", "4.5", "4.6", "4.7",
                                                "4.8", "4.9", "5"
                                            ].map((r) => (
                                                <option key={r} value={r}>
                                                    {r} {r !== "0" ? "⭐" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={editForm.status || "active"}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Product Variants Section */}
                            <div className="form-section">
                                <h4>Product Variants</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Sizes</label>
                                        <div className="checkbox-grid">
                                            {availableSizes.map(size => (
                                                <label key={size} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={(editForm.sizes || []).includes(size)}
                                                        onChange={() => handleArrayFieldChange('sizes', size)}
                                                    />
                                                    <span>{size}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Colors</label>
                                        <div className="checkbox-grid">
                                            {availableColors.map(color => (
                                                <label key={color} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={(editForm.colors || []).includes(color)}
                                                        onChange={() => handleArrayFieldChange('colors', color)}
                                                    />
                                                    <span>{color}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications Section */}
                            <div className="form-section">
                                <h4>Specifications</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Material</label>
                                        <input
                                            value={editForm.material || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, material: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight</label>
                                        <input
                                            value={editForm.weight || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, weight: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dimensions</label>
                                        <input
                                            value={editForm.dimensions || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, dimensions: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Warranty</label>
                                        <input
                                            value={editForm.warranty || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, warranty: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Return Policy</label>
                                        <textarea
                                            rows="2"
                                            value={editForm.return_policy || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, return_policy: e.target.value })
                                            }
                                            placeholder="Return policy details"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Features</label>
                                    <div className="checkbox-grid">
                                        {availableFeatures.map(feature => (
                                            <label key={feature} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={(editForm.features || []).includes(feature)}
                                                    onChange={() => handleArrayFieldChange('features', feature)}
                                                />
                                                <span>{feature}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tags</label>
                                    <input
                                        type="text"
                                        placeholder="Type tag and press Enter"
                                        onKeyPress={handleTagsInput}
                                        className="tags-input"
                                    />
                                    <div className="tags-container">
                                        {(editForm.tags || []).map((tag, index) => (
                                            <span key={index} className="tag">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="tag-remove"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping & Digital Settings */}
                            <div className="form-section">
                                <h4>Shipping & Digital Settings</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_virtual || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_virtual: e.target.checked })
                                                }
                                            />
                                            <span>Virtual Product (No shipping)</span>
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_downloadable || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_downloadable: e.target.checked })
                                                }
                                            />
                                            <span>Downloadable Product</span>
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.free_shipping || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, free_shipping: e.target.checked })
                                                }
                                            />
                                            <span>Free Shipping</span>
                                        </label>
                                    </div>
                                </div>

                                {editForm.is_downloadable && (
                                    <div className="form-group">
                                        <label>Download Link</label>
                                        <input
                                            value={editForm.download_link || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, download_link: e.target.value })
                                            }
                                            placeholder="https://example.com/download/file.zip"
                                        />
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Shipping Class</label>
                                        <input
                                            value={editForm.shipping_class || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, shipping_class: e.target.value })
                                            }
                                            placeholder="Standard, Express, etc."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tax Class</label>
                                        <input
                                            value={editForm.tax_class || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, tax_class: e.target.value })
                                            }
                                            placeholder="Standard, Reduced, Zero"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Shipping Cost (₹)</label>
                                        <input
                                            type="number"
                                            value={editForm.shipping_cost || 0}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, shipping_cost: e.target.value })
                                            }
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Marketing Section */}
                            <div className="form-section">
                                <h4>Marketing</h4>
                                <div className="form-row">
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_featured || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_featured: e.target.checked })
                                                }
                                            />
                                            <span>Featured Product</span>
                                        </label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_trending || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_trending: e.target.checked })
                                                }
                                            />
                                            <span>Trending Product</span>
                                        </label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label-large">
                                            <input
                                                type="checkbox"
                                                checked={editForm.is_bestseller || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, is_bestseller: e.target.checked })
                                                }
                                            />
                                            <span>Bestseller Product</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="form-section">
                                <h4>Media</h4>
                                <div className="form-group">
                                    <label>Current Images</label>
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
                                        {(!editForm.images || editForm.images.length === 0) && (
                                            <div className="no-images-message">No images uploaded</div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Add New Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setNewImages([...e.target.files])}
                                    />
                                    {newImages.length > 0 && (
                                        <div className="new-images-info">
                                            {newImages.length} new image(s) selected
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Product Video</label>
                                    {editForm.video && (
                                        <div className="video-preview">
                                            <video controls className="video-player">
                                                <source src={editForm.video} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            <button
                                                type="button"
                                                className="btn btn-remove-video"
                                                onClick={removeVideo}
                                            >
                                                Remove Video
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setNewVideo(e.target.files[0])}
                                    />
                                    {newVideo && (
                                        <div className="new-video-info">
                                            New video selected: {newVideo.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className="form-section">
                                <h4>SEO</h4>
                                <div className="form-group">
                                    <label>URL Slug</label>
                                    <input
                                        value={editForm.slug || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, slug: e.target.value })
                                        }
                                        placeholder="product-url-slug"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SEO Title</label>
                                    <input
                                        value={editForm.seo_title || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, seo_title: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SEO Description</label>
                                    <textarea
                                        rows="3"
                                        value={editForm.seo_description || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, seo_description: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Meta Keywords</label>
                                    <input
                                        value={editForm.meta_keywords || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, meta_keywords: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={closeEditModal} disabled={saving}>
                                Cancel
                            </button>
                            <button className="btn btn-save" onClick={saveEdit} disabled={saving}>
                                {saving ? "🔄 Saving..." : "💾 Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}