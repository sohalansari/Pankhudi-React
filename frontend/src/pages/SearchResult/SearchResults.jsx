import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        sort: 'relevance',
        priceRange: ''
    });

    const location = useLocation();
    const navigate = useNavigate();

    // Get search query from URL
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('query');

    // Get data from navigation state (if coming from header search)
    const navigationState = location.state;

    useEffect(() => {
        if (searchQuery) {
            fetchSearchResults(searchQuery);
        } else if (navigationState?.searchQuery) {
            setResults(navigationState.searchResults || []);
        }
    }, [searchQuery, navigationState]);

    const fetchSearchResults = async (query) => {
        setLoading(true);
        setError('');
        try {
            const url = new URL('http://localhost:5000/api/search');
            url.searchParams.append('q', query);

            if (filters.category) {
                url.searchParams.append('category', filters.category);
            }
            if (filters.sort) {
                url.searchParams.append('sort', filters.sort);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();

            if (data.success) {
                setResults(data.products || []);
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (err) {
            setError('Search results not available');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Refresh results with new filters
        if (searchQuery) {
            fetchSearchResults(searchQuery);
        }
    };

    // Related searches suggestions
    const relatedSearches = [
        `${searchQuery} dress`,
        `${searchQuery} saree`,
        `${searchQuery} collection`,
        `Designer ${searchQuery}`,
        `${searchQuery} for women`
    ];

    if (loading) {
        return (
            <div className="search-results-container">
                <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <p>Searching for "{searchQuery}"...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            {/* Search Header */}
            <div className="search-results-header">
                <h1>Search Results for "{searchQuery}"</h1>
                {results.length > 0 && (
                    <p className="results-count">{results.length} products found</p>
                )}
            </div>

            {/* Filters */}
            <div className="search-filters">
                <div className="filter-group">
                    <label>Category:</label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="1">Category 1</option>
                        <option value="2">Category 2</option>
                        <option value="3">Category 3</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sort by:</label>
                    <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
            </div>

            {/* Related Searches */}
            {results.length > 0 && (
                <div className="related-searches">
                    <h3>Related Searches</h3>
                    <div className="related-tags">
                        {relatedSearches.map((related, index) => (
                            <Link
                                key={index}
                                to={`/search?query=${encodeURIComponent(related)}`}
                                className="related-tag"
                            >
                                {related}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Results */}
            {error ? (
                <div className="search-error">
                    <p>{error}</p>
                    <button onClick={() => fetchSearchResults(searchQuery)}>
                        Try Again
                    </button>
                </div>
            ) : results.length === 0 && !loading ? (
                <div className="no-results">
                    <h3>No products found for "{searchQuery}"</h3>
                    <p>Try these suggestions:</p>
                    <ul className="suggestions-list">
                        <li>Check your spelling</li>
                        <li>Use more general terms</li>
                        <li>Browse our categories</li>
                    </ul>
                    <Link to="/products" className="browse-all-btn">
                        Browse All Products
                    </Link>
                </div>
            ) : (
                <div className="results-grid">
                    {results.map(product => (
                        <div key={product.id} className="product-card">
                            <Link to={`/ProductDetail/${product.id}`}>
                                <img
                                    src={product.images && product.images.length > 0 ? product.images[0] : '/default-product.png'}
                                    alt={product.name}
                                    className="product-image"
                                    onError={(e) => {
                                        e.target.src = '/default-product.png';
                                    }}
                                />
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-brand">{product.brand}</p>
                                    <p className="product-description">
                                        {product.description?.substring(0, 100)}...
                                    </p>
                                    <div className="product-price">
                                        {product.discount > 0 ? (
                                            <>
                                                <span className="current-price">₹{product.finalPrice}</span>
                                                <span className="original-price">₹{product.price}</span>
                                                <span className="discount-percent">
                                                    {product.discountPercent}% OFF
                                                </span>
                                            </>
                                        ) : (
                                            <span className="current-price">₹{product.price}</span>
                                        )}
                                    </div>
                                    <div className="product-meta">
                                        <span className="rating">⭐ {product.rating || '4.0'}</span>
                                        <span className="stock">{product.stock} in stock</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;