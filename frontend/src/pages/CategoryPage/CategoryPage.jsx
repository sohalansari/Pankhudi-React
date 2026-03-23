import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./CategoryPage.css";

const CategoryPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const subCategoryId = searchParams.get('sub_category');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        brand: '',
        inStock: true,
        onSale: false,
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });

    useEffect(() => {
        let count = 0;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        if (filters.brand) count++;
        if (!filters.inStock) count++;
        if (filters.onSale) count++;
        if (filters.sortBy !== 'created_at') count++;
        setActiveFiltersCount(count);
    }, [filters]);

    const fetchProducts = useCallback(async (filterParams = {}) => {
        try {
            setProductsLoading(true);
            let url = "http://localhost:5001/api/products";
            const params = new URLSearchParams();

            // Ensure only current category products are shown
            if (id && id !== "all") {
                params.append('category_id', id);
            }

            if (subCategoryId) {
                params.append('sub_category_id', subCategoryId);
            }

            const currentFilters = Object.keys(filterParams).length > 0 ? filterParams : filters;

            Object.keys(currentFilters).forEach(key => {
                if (key === 'minPrice' && currentFilters[key]) {
                    params.append('min_price', currentFilters[key]);
                } else if (key === 'maxPrice' && currentFilters[key]) {
                    params.append('max_price', currentFilters[key]);
                } else if (key === 'brand' && currentFilters[key]) {
                    params.append('brand', currentFilters[key]);
                } else if (key === 'inStock' && !currentFilters[key]) {
                    params.append('in_stock_only', 'true');
                } else if (key === 'onSale' && currentFilters[key]) {
                    params.append('on_sale', 'true');
                } else if (key === 'sortBy') {
                    if (currentFilters[key] === 'price') {
                        params.append('sort_by', 'price');
                        params.append('sort_order', 'ASC');
                    } else if (currentFilters[key] === 'price_desc') {
                        params.append('sort_by', 'price');
                        params.append('sort_order', 'DESC');
                    } else if (currentFilters[key] === 'name') {
                        params.append('sort_by', 'name');
                        params.append('sort_order', 'ASC');
                    } else if (currentFilters[key] === 'rating') {
                        params.append('sort_by', 'rating');
                        params.append('sort_order', 'DESC');
                    } else if (currentFilters[key] === 'discount') {
                        params.append('sort_by', 'discount');
                        params.append('sort_order', 'DESC');
                    } else {
                        params.append('sort_by', currentFilters[key]);
                        params.append('sort_order', 'DESC');
                    }
                }
            });

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log('Fetching products from:', url);
            const prodRes = await axios.get(url);

            console.log('Products received:', prodRes.data);

            // Filter products by category on client side to ensure correctness
            let filteredProducts = prodRes.data;
            if (id && id !== "all") {
                filteredProducts = prodRes.data.filter(product =>
                    product.category_id === parseInt(id)
                );
            }

            setProducts(filteredProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    }, [id, subCategoryId, filters]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const catRes = await axios.get("http://localhost:5001/api/products/categories/with-subcategories");
                console.log('Categories received:', catRes.data);
                setCategories(catRes.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (id && id !== "all") {
                try {
                    const res = await axios.get(`http://localhost:5001/api/products/categories/${id}/sub-categories`);
                    console.log('SubCategories received:', res.data);
                    setSubCategories(res.data);
                } catch (error) {
                    console.error("Error fetching sub-categories:", error);
                    setSubCategories([]);
                }
            } else {
                setSubCategories([]);
            }
        };

        fetchSubCategories();
    }, [id]);

    useEffect(() => {
        if (!loading) {
            fetchProducts();
        }
    }, [id, subCategoryId, fetchProducts, loading]);

    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...filters,
            [key]: value
        };
        setFilters(newFilters);
        if (key !== 'minPrice' && key !== 'maxPrice') {
            setTimeout(() => fetchProducts(newFilters), 0);
        }
    };

    const handlePriceChange = (key, value) => {
        handleFilterChange(key, value);
    };

    const handleSubCategoryChange = (subCatId) => {
        if (subCatId) {
            navigate(`/category/${id}?sub_category=${subCatId}`);
        } else {
            navigate(`/category/${id}`);
        }
    };

    const clearFilters = () => {
        const resetFilters = {
            minPrice: '',
            maxPrice: '',
            brand: '',
            inStock: true,
            onSale: false,
            sortBy: 'created_at',
            sortOrder: 'DESC'
        };
        setFilters(resetFilters);
        fetchProducts(resetFilters);
    };

    const toggleMobileFilters = () => {
        setShowMobileFilters(!showMobileFilters);
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return '₹0';
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // ✅ FIXED: Calculate discount amount and percentage
    const calculateDiscountInfo = (product) => {
        if (product.discount_price && product.discount_price < product.price) {
            const discountAmount = product.price - product.discount_price;
            const discountPercentage = Math.round((discountAmount / product.price) * 100);
            return {
                hasDiscount: true,
                discountAmount: discountAmount,
                discountPercentage: discountPercentage,
                finalPrice: product.discount_price
            };
        }
        return {
            hasDiscount: false,
            discountAmount: 0,
            discountPercentage: 0,
            finalPrice: product.price
        };
    };

    const currentCategory = id === "all"
        ? "All Products"
        : categories.find((cat) => cat.id === parseInt(id))?.name || "Category";

    const currentSubCategory = subCategoryId
        ? subCategories.find((subCat) => subCat.id === parseInt(subCategoryId))?.name
        : null;

    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const relatedSubCategories = id && id !== "all" ? subCategories : [];

    if (loading) return (
        <>
            <Header />
            <div className="shopspree-category-wrapper">
                <div className="shopspree-loader-container">
                    <div className="shopspree-spinner"></div>
                    <p>Loading categories...</p>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Header />
            <div className="shopspree-category-wrapper">
                {/* Breadcrumb Navigation */}
                <nav className="shopspree-breadcrumb-nav">
                    <span className="shopspree-breadcrumb-link" onClick={() => navigate('/')}>🏠 Home</span>
                    <span className="shopspree-breadcrumb-arrow">›</span>
                    <span className="shopspree-breadcrumb-link" onClick={() => navigate('/category/all')}>📚 Categories</span>
                    {id !== "all" && (
                        <>
                            <span className="shopspree-breadcrumb-arrow">›</span>
                            <span className="shopspree-breadcrumb-current">{currentCategory}</span>
                        </>
                    )}
                    {currentSubCategory && (
                        <>
                            <span className="shopspree-breadcrumb-arrow">›</span>
                            <span className="shopspree-breadcrumb-current">{currentSubCategory}</span>
                        </>
                    )}
                </nav>

                {/* Category Header */}
                <div className="shopspree-category-hero">
                    <div className="shopspree-hero-content">
                        <h1 className="shopspree-hero-title">{currentCategory}</h1>
                        {currentSubCategory && <h2 className="shopspree-hero-subtitle">{currentSubCategory}</h2>}
                        <p className="shopspree-product-counter">
                            🎯 {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </p>
                    </div>

                    <button className="shopspree-mobile-filter-btn" onClick={toggleMobileFilters}>
                        <span className="shopspree-filter-icon">🔍</span>
                        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                        {activeFiltersCount > 0 && <span className="shopspree-filter-badge">{activeFiltersCount}</span>}
                    </button>
                </div>

                <div className="shopspree-main-layout">
                    {/* Filters Sidebar */}
                    <div className={`shopspree-filters-panel ${showMobileFilters ? 'shopspree-filters-visible' : ''}`}>
                        <div className="shopspree-filters-header-mobile">
                            <h3 className="shopspree-filters-title">⚙️ Filters & Sort</h3>
                            <button className="shopspree-close-filters" onClick={toggleMobileFilters}>
                                <span>×</span>
                            </button>
                        </div>

                        <div className="shopspree-filters-body">
                            {/* Categories Filter */}
                            <div className="shopspree-filter-group">
                                <div className="shopspree-filter-group-header">
                                    <h4>📁 Categories</h4>
                                    <span className="shopspree-filter-count">{categories.length}</span>
                                </div>
                                <div className="shopspree-category-list">
                                    <div
                                        className={`shopspree-category-item ${id === "all" ? "shopspree-active" : ""}`}
                                        onClick={() => navigate('/category/all')}
                                    >
                                        <span className="shopspree-category-name">✨ All Products</span>
                                        <span className="shopspree-item-count">
                                            {categories.reduce((total, cat) => total + (cat.product_count || 0), 0)}
                                        </span>
                                    </div>
                                    {categories.map(category => (
                                        <div
                                            key={category.id}
                                            className={`shopspree-category-item ${id === category.id.toString() ? "shopspree-active" : ""}`}
                                            onClick={() => navigate(`/category/${category.id}`)}
                                        >
                                            <span className="shopspree-category-name">{category.name}</span>
                                            <span className="shopspree-item-count">{category.product_count || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Related Subcategories */}
                            {relatedSubCategories.length > 0 && (
                                <div className="shopspree-filter-group">
                                    <div className="shopspree-filter-group-header">
                                        <h4>📂 Sub Categories</h4>
                                        <span className="shopspree-filter-count">{relatedSubCategories.length}</span>
                                    </div>
                                    <div className="shopspree-subcategory-list">
                                        <div
                                            className={`shopspree-subcategory-item ${!subCategoryId ? "shopspree-active" : ""}`}
                                            onClick={() => handleSubCategoryChange(null)}
                                        >
                                            <span className="shopspree-subcategory-name">🎯 All {currentCategory}</span>
                                            <span className="shopspree-item-count">
                                                {categories.find(cat => cat.id === parseInt(id))?.product_count || 0}
                                            </span>
                                        </div>
                                        {relatedSubCategories.map(subCategory => (
                                            <div
                                                key={subCategory.id}
                                                className={`shopspree-subcategory-item ${subCategoryId === subCategory.id.toString() ? "shopspree-active" : ""}`}
                                                onClick={() => handleSubCategoryChange(subCategory.id)}
                                            >
                                                <span className="shopspree-subcategory-name">{subCategory.name}</span>
                                                <span className="shopspree-item-count">{subCategory.product_count || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range Filter */}
                            <div className="shopspree-filter-group">
                                <h4>💰 Price Range</h4>
                                <div className="shopspree-price-controls">
                                    <div className="shopspree-price-inputs">
                                        <input
                                            type="number"
                                            placeholder="Min ₹"
                                            value={filters.minPrice}
                                            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                            className="shopspree-price-field"
                                        />
                                        <span className="shopspree-price-dash">to</span>
                                        <input
                                            type="number"
                                            placeholder="Max ₹"
                                            value={filters.maxPrice}
                                            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                            className="shopspree-price-field"
                                        />
                                    </div>
                                    <button
                                        className="shopspree-apply-price"
                                        onClick={() => fetchProducts()}
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>

                            {/* Brands Filter */}
                            {uniqueBrands.length > 0 && (
                                <div className="shopspree-filter-group">
                                    <h4>🏷️ Brands</h4>
                                    <select
                                        value={filters.brand}
                                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                                        className="shopspree-brand-select"
                                    >
                                        <option value="">All Brands</option>
                                        {uniqueBrands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Availability Filter */}
                            <div className="shopspree-filter-group">
                                <h4>📦 Availability</h4>
                                <label className="shopspree-checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                        className="shopspree-checkbox-input"
                                    />
                                    <span className="shopspree-checkbox-custom"></span>
                                    <span className="shopspree-checkbox-label">Show Out of Stock</span>
                                </label>
                            </div>

                            {/* Discount Filter */}
                            <div className="shopspree-filter-group">
                                <h4>🏷️ Discount</h4>
                                <label className="shopspree-checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={filters.onSale}
                                        onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                                        className="shopspree-checkbox-input"
                                    />
                                    <span className="shopspree-checkbox-custom"></span>
                                    <span className="shopspree-checkbox-label">On Sale Only</span>
                                </label>
                            </div>

                            {/* Sort By */}
                            <div className="shopspree-filter-group">
                                <h4>🔄 Sort By</h4>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="shopspree-sort-select"
                                >
                                    <option value="created_at">✨ Newest First</option>
                                    <option value="price">💰 Price: Low to High</option>
                                    <option value="price_desc">💰 Price: High to Low</option>
                                    <option value="name">📝 Name: A to Z</option>
                                    <option value="rating">⭐ Highest Rated</option>
                                    <option value="discount">🏷️ Best Discount</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {activeFiltersCount > 0 && (
                                <button className="shopspree-clear-all-btn" onClick={clearFilters}>
                                    <span className="shopspree-clear-icon">🗑️</span>
                                    Clear All Filters ({activeFiltersCount})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Filter Overlay */}
                    {showMobileFilters && (
                        <div className="shopspree-overlay-backdrop" onClick={toggleMobileFilters}></div>
                    )}

                    {/* Products Main Section */}
                    <div className="shopspree-products-area">
                        <div className="shopspree-products-header">
                            <div className="shopspree-results-summary">
                                <span className="shopspree-results-text">
                                    📊 Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                                    {currentSubCategory && ` in ${currentSubCategory}`}
                                </span>
                                {activeFiltersCount > 0 && (
                                    <button className="shopspree-clear-filters-sm" onClick={clearFilters}>
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {productsLoading ? (
                            <div className="shopspree-products-loading">
                                <div className="shopspree-spinner"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="shopspree-products-grid">
                                {products.map((product) => {
                                    const discountInfo = calculateDiscountInfo(product);
                                    return (
                                        <div
                                            key={product.id}
                                            className={`shopspree-product-tile ${product.stock === 0 ? 'shopspree-out-of-stock' : ''}`}
                                            onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                        >
                                            <div className="shopspree-product-media">
                                                <img
                                                    src={product.images?.[0] || product.image || '/placeholder-image.jpg'}
                                                    alt={product.name}
                                                    className="shopspree-product-img"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                <div className="shopspree-product-badges">
                                                    {discountInfo.hasDiscount && (
                                                        <>
                                                            <span className="shopspree-discount-tag">
                                                                Save {formatPrice(discountInfo.discountAmount)}
                                                            </span>
                                                            <span className="shopspree-discount-percent">
                                                                {discountInfo.discountPercentage}% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                    {product.is_new && (
                                                        <span className="shopspree-new-tag">✨ NEW</span>
                                                    )}
                                                    {product.stock > 0 && product.stock <= 10 && (
                                                        <span className="shopspree-limited-tag">🔥 Limited Stock</span>
                                                    )}
                                                </div>
                                                {product.stock === 0 && (
                                                    <div className="shopspree-outofstock-overlay">
                                                        <span>Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="shopspree-product-details">
                                                <h3 className="shopspree-product-title">{product.name}</h3>
                                                <p className="shopspree-product-brand">{product.brand}</p>

                                                <div className="shopspree-pricing">
                                                    {discountInfo.hasDiscount ? (
                                                        <div className="shopspree-discounted-pricing">
                                                            <div className="shopspree-price-row">
                                                                <span className="shopspree-sale-price">
                                                                    {formatPrice(discountInfo.finalPrice)}
                                                                </span>
                                                                <span className="shopspree-original-price">
                                                                    {formatPrice(product.price)}
                                                                </span>
                                                            </div>
                                                            <div className="shopspree-savings">
                                                                <span className="shopspree-save-amount">
                                                                    💰 You save {formatPrice(discountInfo.discountAmount)}
                                                                </span>
                                                                <span className="shopspree-save-percent">
                                                                    ({discountInfo.discountPercentage}% off)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="shopspree-regular-pricing">
                                                            <span className="shopspree-current-price">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="shopspree-rating">
                                                    <span className="shopspree-stars">⭐</span>
                                                    <span className="shopspree-rating-value">{product.rating || 'New'}</span>
                                                    {product.total_reviews > 0 && (
                                                        <span className="shopspree-review-count">
                                                            ({product.total_reviews} reviews)
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="shopspree-stock-status">
                                                    {product.stock > 0 ? (
                                                        <span className="shopspree-instock">
                                                            ✅ {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                                                        </span>
                                                    ) : (
                                                        <span className="shopspree-outofstock">❌ Out of Stock</span>
                                                    )}
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="shopspree-quick-actions">
                                                    <button className="shopspree-quick-view">Quick View</button>
                                                    <button className="shopspree-add-to-cart">Add to Cart</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="shopspree-empty-state">
                                <div className="shopspree-empty-icon">🔍</div>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or browse different categories.</p>
                                <button
                                    className="shopspree-browse-btn"
                                    onClick={() => navigate('/category/all')}
                                >
                                    Browse All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CategoryPage;