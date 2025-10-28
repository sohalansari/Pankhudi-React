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
    const [analyzedQuery, setAnalyzedQuery] = useState(null);
    const [appliedFilters, setAppliedFilters] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    // Get search data from navigation state or URL
    const navigationState = location.state || {};
    const searchQuery = navigationState?.searchQuery || new URLSearchParams(location.search).get('query') || '';

    // Safe results count
    const resultsCount = Array.isArray(results) ? results.length : 0;

    useEffect(() => {
        console.log('📍 Location state:', navigationState);
        console.log('🔍 Search query:', searchQuery);

        if (navigationState && Object.keys(navigationState).length > 0) {
            console.log('📦 Using navigation state data');
            // Data from header search
            setResults(Array.isArray(navigationState.searchResults) ? navigationState.searchResults : []);
            setAnalyzedQuery(navigationState.analyzedQuery || null);
            setAppliedFilters(navigationState.appliedFilters || {});
        } else if (searchQuery) {
            console.log('🌐 Fetching search results for:', searchQuery);
            // Direct URL search
            fetchSearchResults(searchQuery);
        } else {
            console.log('⚠️ No search query found');
            setError('Please enter a search query');
            setResults([]);
        }
    }, [searchQuery, navigationState]);

    const fetchSearchResults = async (query) => {
        if (!query) {
            setError('Search query is required');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const url = new URL('http://localhost:5000/api/search');
            url.searchParams.append('q', query);

            // Add filters to the request
            if (filters.category) {
                url.searchParams.append('category', filters.category);
            }
            if (filters.sort) {
                url.searchParams.append('sort', filters.sort);
            }

            console.log('🔍 Making search request to:', url.toString());

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Search failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📨 Search API Response:', data);

            // Handle the response structure from backend
            if (data.success) {
                setResults(Array.isArray(data.products) ? data.products : []);
                setAnalyzedQuery(data.analyzedQuery || null);
                setAppliedFilters(data.appliedFilters || {});

                if (data.products && data.products.length === 0) {
                    setError(`No products found for "${query}"`);
                }
            } else {
                throw new Error(data.error || 'Search failed');
            }

        } catch (err) {
            console.error('❌ Search error:', err);
            setError(err.message || 'Search results not available. Please try again.');
            setResults([]);
            setAnalyzedQuery(null);
            setAppliedFilters({});
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

    const handleQuickSearch = (newQuery) => {
        navigate('/search', {
            state: {
                searchQuery: newQuery
            }
        });
    };

    const removeFilter = (filterKey) => {
        const newAppliedFilters = { ...appliedFilters };
        delete newAppliedFilters[filterKey];
        setAppliedFilters(newAppliedFilters);

        // Refresh search without this filter
        if (searchQuery) {
            fetchSearchResults(searchQuery);
        }
    };

    // Smart related searches based on analyzed query
    const getRelatedSearches = () => {
        if (!analyzedQuery) return [];

        const baseTerms = analyzedQuery.searchTerms || analyzedQuery.originalQuery || searchQuery;
        if (!baseTerms) return [];

        const related = [];

        // Price-based suggestions
        if (analyzedQuery.filters?.maxPrice) {
            related.push(
                `${baseTerms} under ${analyzedQuery.filters.maxPrice + 500}`,
                `${baseTerms} under ${analyzedQuery.filters.maxPrice + 1000}`
            );
        }

        if (analyzedQuery.filters?.minPrice) {
            related.push(
                `${baseTerms} above ${analyzedQuery.filters.minPrice - 500}`,
                `${baseTerms} under ${analyzedQuery.filters.minPrice + 1000}`
            );
        }

        // Term-based suggestions
        if (analyzedQuery.extractedTerms?.length > 0) {
            analyzedQuery.extractedTerms.forEach(term => {
                if (term !== baseTerms) {
                    related.push(`${baseTerms} ${term}`, `${term} ${baseTerms}`);
                }
            });
        }

        // Default related searches
        const defaultSearches = [
            `${baseTerms} collection`,
            `Designer ${baseTerms}`,
            `${baseTerms} for women`,
            `Latest ${baseTerms}`,
            `Premium ${baseTerms}`
        ];

        return [...new Set([...related, ...defaultSearches])].slice(0, 8);
    };

    const getSearchTypeMessage = () => {
        if (!analyzedQuery) return `Search results for "${searchQuery}"`;

        switch (analyzedQuery.searchType) {
            case 'price':
                return `Products ${analyzedQuery.filters?.maxPrice ? `under ₹${analyzedQuery.filters.maxPrice}` : `above ₹${analyzedQuery.filters?.minPrice}`}`;
            case 'mixed':
                return `${analyzedQuery.searchTerms} ${analyzedQuery.filters?.maxPrice ? `under ₹${analyzedQuery.filters.maxPrice}` : `above ₹${analyzedQuery.filters?.minPrice}`}`;
            default:
                return `Search results for "${searchQuery}"`;
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="search-results-container">
                <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <p>Searching for "{searchQuery}"...</p>
                    {analyzedQuery && analyzedQuery.searchType === 'price' && (
                        <p className="search-type-hint">🔍 Price-based search detected</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            {/* Search Header */}
            <div className="search-results-header">
                <h1>{getSearchTypeMessage()}</h1>

                {/* Query Analysis Display */}
                {analyzedQuery && (
                    <div className="query-analysis">
                        <div className="analysis-details">
                            {analyzedQuery.searchType === 'price' && (
                                <span className="search-type-badge">💰 Price Search</span>
                            )}
                            {analyzedQuery.searchType === 'mixed' && (
                                <span className="search-type-badge">🔍 Mixed Search</span>
                            )}

                            {analyzedQuery.extractedTerms?.length > 0 && (
                                <span className="extracted-terms">
                                    Detected: {analyzedQuery.extractedTerms.join(', ')}
                                </span>
                            )}
                        </div>

                        {/* Applied Filters */}
                        {appliedFilters && Object.keys(appliedFilters).length > 0 && (
                            <div className="applied-filters">
                                <strong>Applied Filters:</strong>
                                {appliedFilters.maxPrice && (
                                    <span className="filter-tag">
                                        Under ₹{appliedFilters.maxPrice}
                                        <button onClick={() => removeFilter('maxPrice')}>×</button>
                                    </span>
                                )}
                                {appliedFilters.minPrice && (
                                    <span className="filter-tag">
                                        Above ₹{appliedFilters.minPrice}
                                        <button onClick={() => removeFilter('minPrice')}>×</button>
                                    </span>
                                )}
                                {appliedFilters.category && (
                                    <span className="filter-tag">
                                        Category: {appliedFilters.category}
                                        <button onClick={() => removeFilter('category')}>×</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {resultsCount > 0 && (
                    <p className="results-count">
                        {resultsCount} {resultsCount === 1 ? 'product' : 'products'} found
                        {analyzedQuery?.searchType === 'price' && ' matching your criteria'}
                    </p>
                )}
            </div>

            {/* Filters Section */}
            <div className="search-filters">
                <div className="filter-group">
                    <label>Category:</label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="1">Sarees</option>
                        <option value="2">Dresses</option>
                        <option value="3">Jewelry</option>
                        <option value="4">Kurtas</option>
                        <option value="5">Lehengas</option>
                        <option value="6">Earrings</option>
                        <option value="7">Bangles</option>
                        <option value="8">Mobiles</option>
                        <option value="9">Laptops</option>
                        <option value="10">Shoes</option>
                        <option value="11">Bags</option>
                        <option value="12">Watches</option>
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
                        <option value="discount_high">Best Discount</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest First</option>
                        <option value="trending">Trending</option>
                    </select>
                </div>

                {/* Quick Price Filters */}
                <div className="filter-group quick-price-filters">
                    <label>Quick Filters:</label>
                    <div className="price-filter-buttons">
                        <button
                            onClick={() => handleQuickSearch(`${searchQuery} under 500`)}
                            className={appliedFilters?.maxPrice === 500 ? 'active' : ''}
                        >
                            Under ₹500
                        </button>
                        <button
                            onClick={() => handleQuickSearch(`${searchQuery} under 1000`)}
                            className={appliedFilters?.maxPrice === 1000 ? 'active' : ''}
                        >
                            Under ₹1000
                        </button>
                        <button
                            onClick={() => handleQuickSearch(`${searchQuery} under 2000`)}
                            className={appliedFilters?.maxPrice === 2000 ? 'active' : ''}
                        >
                            Under ₹2000
                        </button>
                    </div>
                </div>
            </div>

            {/* Smart Related Searches */}
            {resultsCount > 0 && (
                <div className="related-searches">
                    <h3>💡 Try these related searches</h3>
                    <div className="related-tags">
                        {getRelatedSearches().map((related, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickSearch(related)}
                                className="related-tag"
                            >
                                {related}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {error ? (
                <div className="search-error">
                    <div className="error-icon">⚠️</div>
                    <h3>Search Failed</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button
                            onClick={() => fetchSearchResults(searchQuery)}
                            className="retry-btn"
                        >
                            Try Again
                        </button>
                        <Link to="/products" className="browse-all-btn">
                            Browse All Products
                        </Link>
                    </div>
                </div>
            ) : resultsCount === 0 ? (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No products found for "{searchQuery}"</h3>

                    {/* Smart suggestions based on query type */}
                    <div className="smart-suggestions">
                        {analyzedQuery?.searchType === 'price' ? (
                            <>
                                <p>Try adjusting your price range:</p>
                                <div className="price-suggestions">
                                    <button onClick={() => handleQuickSearch('under 1000')}>
                                        Under ₹1000
                                    </button>
                                    <button onClick={() => handleQuickSearch('under 2000')}>
                                        Under ₹2000
                                    </button>
                                    <button onClick={() => handleQuickSearch('under 5000')}>
                                        Under ₹5000
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Try these suggestions:</p>
                                <ul className="suggestions-list">
                                    <li>Check your spelling and try again</li>
                                    <li>Use more general search terms</li>
                                    <li>Browse by category instead</li>
                                    <li>Try different price ranges</li>
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="action-buttons">
                        <Link to="/products" className="browse-all-btn">
                            Browse All Products
                        </Link>
                        <button
                            onClick={() => navigate(-1)}
                            className="back-btn"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Results Grid */}
                    <div className="results-grid">
                        {results.map((product, index) => (
                            <div key={product?.id || `product-${index}`} className="product-card">
                                <Link to={`/ProductDetail/${product?.id || ''}`} className="product-link">
                                    <div className="product-image-container">
                                        <img
                                            src={product?.images?.[0] || '/default-product.png'}
                                            alt={product?.name || 'Product'}
                                            className="product-image"
                                            onError={(e) => {
                                                e.target.src = '/default-product.png';
                                            }}
                                        />
                                        {product?.discountPercentage > 0 && (
                                            <span className="discount-badge">
                                                {product.discountPercentage}% OFF
                                            </span>
                                        )}
                                        {product?.rating >= 4.5 && (
                                            <span className="trending-badge">🔥 Trending</span>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product?.name || 'Unnamed Product'}</h3>
                                        <p className="product-brand">{product?.brand || 'Unknown Brand'}</p>
                                        <p className="product-description">
                                            {product?.description?.substring(0, 80) || 'No description available'}...
                                        </p>
                                        <div className="product-price">
                                            {product?.hasDiscount ? (
                                                <>
                                                    <span className="current-price">₹{product?.finalPrice || '0'}</span>
                                                    <span className="original-price">₹{product?.originalPrice || '0'}</span>
                                                    <span className="discount-percent">
                                                        {product?.discountPercentage}% OFF
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="current-price">₹{product?.originalPrice || '0'}</span>
                                            )}
                                        </div>
                                        <div className="product-meta">
                                            <span className="rating">⭐ {product?.rating || '4.0'}</span>
                                            <span className={`stock ${product?.stock < 10 ? 'low-stock' : ''}`}>
                                                {product?.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {resultsCount >= 20 && (
                        <div className="load-more-section">
                            <button className="load-more-btn">
                                Load More Products
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;   