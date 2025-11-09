import React, { useEffect, useState } from "react";
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
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        brand: '',
        inStock: true, // Show all products by default
        onSale: false,
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });

    // ✅ FIXED: Fetch categories and initial products
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const catRes = await axios.get("http://localhost:5001/api/products/categories/with-subcategories");
                setCategories(catRes.data);

                // ✅ FIXED: Fetch products immediately after categories
                await fetchProducts();
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]); // Only depend on id

    // ✅ FIXED: Fetch subcategories when category changes
    useEffect(() => {
        const fetchSubCategories = async () => {
            if (id && id !== "all") {
                try {
                    const res = await axios.get(`http://localhost:5001/api/products/categories/${id}/sub-categories`);
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

    // ✅ FIXED: Auto-fetch products when category or subcategory changes
    useEffect(() => {
        if (!loading && categories.length > 0) {
            fetchProducts();
        }
    }, [id, subCategoryId, categories]); // Added categories to dependency

    // ✅ FIXED: Improved product fetching with proper parameters
    const fetchProducts = async (filterParams = {}) => {
        try {
            setProductsLoading(true);
            let url = "http://localhost:5001/api/products";
            const params = new URLSearchParams();

            // ✅ FIXED: Always include category and subcategory parameters
            if (id && id !== "all") {
                params.append('category_id', id);
            }

            if (subCategoryId) {
                params.append('sub_category_id', subCategoryId);
            }

            // ✅ FIXED: Use current filters or passed filters
            const currentFilters = Object.keys(filterParams).length > 0 ? filterParams : filters;

            // Apply all filters
            Object.keys(currentFilters).forEach(key => {
                if (key === 'minPrice' && currentFilters[key]) {
                    params.append('min_price', currentFilters[key]);
                } else if (key === 'maxPrice' && currentFilters[key]) {
                    params.append('max_price', currentFilters[key]);
                } else if (key === 'brand' && currentFilters[key]) {
                    params.append('brand', currentFilters[key]);
                } else if (key === 'inStock' && !currentFilters[key]) {
                    // ✅ FIXED: Only filter by stock when inStock is false
                    params.append('in_stock_only', 'true');
                } else if (key === 'onSale' && currentFilters[key]) {
                    params.append('on_sale', 'true');
                } else if (key === 'sortBy' && currentFilters[key]) {
                    params.append('sort_by', currentFilters[key]);
                }
            });

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log('Fetching products from:', url); // Debug log

            const prodRes = await axios.get(url);
            setProducts(prodRes.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    // ✅ FIXED: Handle filter changes properly
    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...filters,
            [key]: value
        };
        setFilters(newFilters);
        fetchProducts(newFilters);
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

    // ✅ FIXED: Improved price formatting
    const formatPrice = (price) => {
        if (!price || isNaN(price)) return '₹0';
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // ✅ FIXED: Calculate discount percentage
    const calculateDiscountPercentage = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0;
        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    };

    // ✅ FIXED: Calculate savings amount
    const calculateSavings = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice) return 0;
        return originalPrice - discountPrice;
    };

    // ✅ FIXED: Get display price with discount logic
    const getDisplayPrice = (product) => {
        // Check if product has discount_price and it's different from regular price
        if (product.discount_price && product.discount_price < product.price) {
            return {
                originalPrice: product.price,
                discountPrice: product.discount_price,
                discountPercentage: calculateDiscountPercentage(product.price, product.discount_price),
                hasDiscount: true
            };
        }

        return {
            originalPrice: product.price,
            discountPrice: product.price,
            discountPercentage: 0,
            hasDiscount: false
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
            <div className="category-container">
                <div className="loading-spinner-container">
                    <div className="loading-spinner"></div>
                    <p>Loading categories...</p>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Header />
            <div className="category-container">
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb">
                    <span className="breadcrumb-item" onClick={() => navigate('/')}>Home</span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item" onClick={() => navigate('/category/all')}>Categories</span>
                    {id !== "all" && (
                        <>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-item current">{currentCategory}</span>
                        </>
                    )}
                    {currentSubCategory && (
                        <>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-item current">{currentSubCategory}</span>
                        </>
                    )}
                </nav>

                {/* Category Header */}
                <div className="category-header">
                    <div className="category-title-section">
                        <h1 className="category-title">{currentCategory}</h1>
                        {currentSubCategory && <h2 className="subcategory-title">{currentSubCategory}</h2>}
                        <p className="products-count">
                            {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </p>
                    </div>

                    <button className="mobile-filter-toggle" onClick={toggleMobileFilters}>
                        <span className="filter-icon">⚙️</span>
                        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div className="category-content">
                    {/* Filters Sidebar */}
                    <div className={`filters-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}>
                        <div className="filter-header-mobile">
                            <h3 className="filter-title">Filters & Sort</h3>
                            <button className="close-filters" onClick={toggleMobileFilters}>
                                <span>×</span>
                            </button>
                        </div>

                        <div className="filters-content">
                            {/* Categories Filter */}
                            <div className="filter-section">
                                <div className="filter-header">
                                    <h4>Categories</h4>
                                    <span className="filter-count">{categories.length}</span>
                                </div>
                                <div className="category-list">
                                    <div
                                        className={`category-item ${id === "all" ? "active" : ""}`}
                                        onClick={() => navigate('/category/all')}
                                    >
                                        <span className="category-name">All Products</span>
                                        <span className="product-count">
                                            {categories.reduce((total, cat) => total + (cat.product_count || 0), 0)}
                                        </span>
                                    </div>
                                    {categories.map(category => (
                                        <div
                                            key={category.id}
                                            className={`category-item ${id === category.id.toString() ? "active" : ""}`}
                                            onClick={() => navigate(`/category/${category.id}`)}
                                        >
                                            <span className="category-name">{category.name}</span>
                                            <span className="product-count">{category.product_count || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Related Subcategories */}
                            {relatedSubCategories.length > 0 && (
                                <div className="filter-section">
                                    <div className="filter-header">
                                        <h4>Sub Categories</h4>
                                        <span className="filter-count">{relatedSubCategories.length}</span>
                                    </div>
                                    <div className="subcategory-list">
                                        <div
                                            className={`subcategory-item ${!subCategoryId ? "active" : ""}`}
                                            onClick={() => handleSubCategoryChange(null)}
                                        >
                                            <span className="subcategory-name">All {currentCategory}</span>
                                            <span className="product-count">
                                                {categories.find(cat => cat.id === parseInt(id))?.product_count || 0}
                                            </span>
                                        </div>
                                        {relatedSubCategories.map(subCategory => (
                                            <div
                                                key={subCategory.id}
                                                className={`subcategory-item ${subCategoryId === subCategory.id.toString() ? "active" : ""}`}
                                                onClick={() => handleSubCategoryChange(subCategory.id)}
                                            >
                                                <span className="subcategory-name">{subCategory.name}</span>
                                                <span className="product-count">{subCategory.product_count || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range Filter */}
                            <div className="filter-section">
                                <h4>Price Range</h4>
                                <div className="price-filter">
                                    <div className="price-inputs">
                                        <input
                                            type="number"
                                            placeholder="Min ₹"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="price-input"
                                        />
                                        <span className="price-separator">to</span>
                                        <input
                                            type="number"
                                            placeholder="Max ₹"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="price-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Brands Filter */}
                            {uniqueBrands.length > 0 && (
                                <div className="filter-section">
                                    <h4>Brands</h4>
                                    <select
                                        value={filters.brand}
                                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                                        className="brand-select"
                                    >
                                        <option value="">All Brands</option>
                                        {uniqueBrands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Availability Filter */}
                            <div className="filter-section">
                                <h4>Availability</h4>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">Show Out of Stock</span>
                                </label>
                                <p className="filter-note">
                                    {filters.inStock ? 'Showing all products including out of stock' : 'Showing only in-stock products'}
                                </p>
                            </div>

                            {/* Discount Filter */}
                            <div className="filter-section">
                                <h4>Discount</h4>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.onSale}
                                        onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">On Sale Only</span>
                                </label>
                            </div>

                            {/* Sort By */}
                            <div className="filter-section">
                                <h4>Sort By</h4>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="sort-select"
                                >
                                    <option value="created_at">Newest First</option>
                                    <option value="price">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="discount">Best Discount</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <button className="clear-filters-btn" onClick={clearFilters}>
                                <span className="clear-icon">🗑️</span>
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filter Overlay */}
                    {showMobileFilters && (
                        <div className="mobile-filter-overlay" onClick={toggleMobileFilters}></div>
                    )}

                    {/* Products Main Section */}
                    <div className="products-main">
                        <div className="products-header">
                            <div className="results-info">
                                <span className="results-text">
                                    Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                                    {currentSubCategory && ` in ${currentSubCategory}`}
                                </span>
                                <span className="active-filters">
                                    {filters.onSale && <span className="active-filter-tag">On Sale</span>}
                                    {filters.brand && <span className="active-filter-tag">Brand: {filters.brand}</span>}
                                    {(filters.minPrice || filters.maxPrice) && (
                                        <span className="active-filter-tag">
                                            Price: {filters.minPrice || '0'} - {filters.maxPrice || 'Any'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {productsLoading ? (
                            <div className="loading-products">
                                <div className="loading-spinner"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="product-grid">
                                {products.map((product) => {
                                    // ✅ FIXED: Calculate price information for each product
                                    const priceInfo = getDisplayPrice(product);

                                    return (
                                        <div
                                            key={product.id}
                                            className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
                                            onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                        >
                                            <div className="product-image-container">
                                                <img
                                                    src={product.images?.[0] || product.image || '/placeholder-image.jpg'}
                                                    alt={product.name}
                                                    className="product-image"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                {/* ✅ FIXED: Discount badge with correct percentage */}
                                                <div className="product-badges">
                                                    {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 && (
                                                        <span className="discount-badge">
                                                            {priceInfo.discountPercentage}% OFF
                                                        </span>
                                                    )}
                                                    {product.isNew && (
                                                        <span className="new-badge">NEW</span>
                                                    )}
                                                </div>
                                                {product.stock === 0 && (
                                                    <div className="out-of-stock-overlay">
                                                        <span>Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="product-info">
                                                <h3 className="product-name">{product.name}</h3>
                                                <p className="product-brand">{product.brand}</p>

                                                <div className="product-category-info">
                                                    {product.sub_category_name ? (
                                                        <span className="sub-category-badge">
                                                            {product.sub_category_name}
                                                        </span>
                                                    ) : (
                                                        <span className="category-badge">
                                                            {product.category_name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* ✅ FIXED: Price display with proper discount calculation */}
                                                <div className="product-price-section">
                                                    {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 ? (
                                                        <div className="discounted-price">
                                                            <div className="price-row">
                                                                <span className="current-price">
                                                                    {formatPrice(priceInfo.discountPrice)}
                                                                </span>
                                                                <span className="original-price">
                                                                    {formatPrice(priceInfo.originalPrice)}
                                                                </span>
                                                            </div>
                                                            <div className="savings-info">
                                                                <span className="savings-amount">
                                                                    You save {formatPrice(priceInfo.originalPrice - priceInfo.discountPrice)}
                                                                </span>
                                                                <span className="discount-percentage">
                                                                    ({priceInfo.discountPercentage}% off)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="regular-price">
                                                            <span className="current-price">
                                                                {formatPrice(priceInfo.originalPrice)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                <div className="product-rating">
                                                    <span className="rating-stars">⭐</span>
                                                    <span className="rating-value">{product.rating || 'New'}</span>
                                                    {product.total_reviews && (
                                                        <span className="review-count">
                                                            ({product.total_reviews})
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Status */}
                                                <div className="product-stock">
                                                    {product.stock > 0 ? (
                                                        <span className="in-stock">
                                                            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                                                        </span>
                                                    ) : (
                                                        <span className="out-of-stock-text">Out of Stock</span>
                                                    )}
                                                </div>

                                                {/* Features */}
                                                {product.features && product.features.length > 0 && (
                                                    <div className="product-features">
                                                        {product.features.slice(0, 2).map((feature, index) => (
                                                            <span key={index} className="feature-tag">
                                                                {feature}
                                                            </span>
                                                        ))}
                                                        {product.features.length > 2 && (
                                                            <span className="more-features">
                                                                +{product.features.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="no-products">
                                <div className="no-products-icon">📦</div>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or browse different categories.</p>
                                <button
                                    className="browse-all-btn"
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