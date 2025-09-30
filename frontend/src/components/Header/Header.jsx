import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { fetchCartCount } from '../../utils/api';
import {
    FiSearch,
    FiUser,
    FiHeart,
    FiShoppingBag,
    FiMenu,
    FiX,
    FiLogOut,
    FiClock,
    FiHelpCircle,
    FiSettings,
    FiHome,
    FiMic,
    FiImage,
    FiChevronDown,
    FiChevronUp,
    FiMapPin,
    FiFilter,
    FiRefreshCw
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { RiChatAiLine } from "react-icons/ri";
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlistItemsCount, setWishlistItemsCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [userAddress, setUserAddress] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [trendingRefreshTime, setTrendingRefreshTime] = useState(0);
    const [isRefreshingTrending, setIsRefreshingTrending] = useState(false);

    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchContainerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navigate = useNavigate();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    // Popular search suggestions
    const popularSearches = [
        "Sarees", "Dresses", "Jewelry", "Kurtas", "Lehenga",
        "Earrings", "Bangles", "Wedding Collection", "Summer Dresses"
    ];

    // Fetch user data and recent searches
    const fetchUserData = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        try {
            const userFromStorage = localStorage.getItem('user');
            if (userFromStorage) {
                const userData = JSON.parse(userFromStorage);
                setUserData(userData);

                const savedAddress = localStorage.getItem('userAddress') ||
                    userData.address ||
                    'Add your delivery address';
                setUserAddress(savedAddress);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }

        // Load recent searches
        const savedSearches = localStorage.getItem('recentSearches');
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    };

    // Save search to recent searches
    const saveToRecentSearches = (query) => {
        if (!query.trim()) return;

        const updatedSearches = [
            query,
            ...recentSearches.filter(search => search.toLowerCase() !== query.toLowerCase())
        ].slice(0, 5); // Keep only last 5 searches

        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    };

    // Refresh trending products manually - FIXED WITH LOADING STATE
    const refreshTrendingProducts = async () => {
        try {
            setIsRefreshingTrending(true);
            setTrendingRefreshTime(Date.now()); // Force re-fetch
            const res = await fetch(`http://localhost:5000/api/search/trending?t=${Date.now()}`);
            const data = await res.json();
            if (data.success) {
                setTrendingProducts(data.products || []);
            }
        } catch (err) {
            console.error('Failed to refresh trending products:', err);
        } finally {
            setIsRefreshingTrending(false);
        }
    };

    // Auto-refresh trending products every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refreshTrendingProducts();
        }, 2 * 60 * 1000); // 2 minutes

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isLoggedIn && userData) {
            const address = userData.address || localStorage.getItem('userAddress') || 'Add your delivery address';
            setUserAddress(address);
            if (userData.address) {
                localStorage.setItem('userAddress', userData.address);
            }
        } else {
            setUserAddress('');
        }
    }, [isLoggedIn, userData]);

    // Fetch cart count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                if (!userData?.id) return;
                const data = await fetchCartCount(userData.id);
                setCartItemsCount(data.count || 0);
            } catch (err) {
                console.error("Error fetching cart count:", err);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 10000);
        return () => clearInterval(interval);
    }, [userData]);

    useEffect(() => {
        fetchUserData();
        const handleStorageChange = () => {
            fetchUserData();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const updateCounts = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            setCartItemsCount(cart.reduce((total, item) => total + (item.quantity || 1), 0));
            setWishlistItemsCount(wishlist.length);
        };
        updateCounts();
        window.addEventListener('storage', updateCounts);
        return () => window.removeEventListener('storage', updateCounts);
    }, []);

    // Enhanced click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close dropdowns
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }

            // Close search suggestions when clicking outside
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSearchSuggestions(false);
            }

            // Close mobile menu when clicking outside
            if (isMobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest('.mobile-menu-toggle-btn')) {
                closeMobileMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Live search suggestions
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
                if (!res.ok) throw new Error('Suggestions failed');
                const data = await res.json();
                setSearchResults(data.suggestions || []);
            } catch (err) {
                console.error('Suggestions error:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Trending Products with cache busting
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/search/trending?t=${trendingRefreshTime}`);
                const data = await res.json();
                if (data.success) {
                    setTrendingProducts(data.products || []);
                }
            } catch (err) {
                console.error('Trending products fetch error:', err);
                setTrendingProducts([]);
            }
        };
        fetchTrending();
    }, [trendingRefreshTime]);

    // Enhanced Search Handler
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            try {
                const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();

                // Save to recent searches
                saveToRecentSearches(searchQuery);

                // Navigate to search results page with data
                navigate('/search', {
                    state: {
                        searchResults: data.products,
                        searchQuery: searchQuery,
                        totalResults: data.total
                    }
                });

                setSearchQuery('');
                setSearchResults([]);
                setShowSearchSuggestions(false);
                closeMobileMenu();
                setIsSearchExpanded(false);

            } catch (err) {
                console.error('Search error:', err);
                // Fallback to simple search
                navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
            }
        }
    };

    // Enhanced click handler for suggestions - FIXED
    const handleSuggestionClick = (e, callback) => {
        e.preventDefault();
        e.stopPropagation();
        if (callback) {
            callback();
        }
    };

    // Fixed search handlers
    const handleQuickSearch = (query) => {
        setSearchQuery(query);
        saveToRecentSearches(query);
        navigate('/search', {
            state: {
                searchQuery: query
            }
        });
        setShowSearchSuggestions(false);
        setSearchResults([]);
        closeMobileMenu();
        setIsSearchExpanded(false);
    };

    const handleProductClick = (productId) => {
        if (productId) {
            navigate(`/ProductDetail/${productId}`);
            setSearchQuery('');
            setSearchResults([]);
            setShowSearchSuggestions(false);
            closeMobileMenu();
        }
    };

    // Voice Search
    const handleVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                setSearchQuery('Listening...');
            };

            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                setSearchQuery(transcript);
                setIsListening(false);
                searchInputRef.current?.focus();
            };

            recognition.onerror = (e) => {
                setIsListening(false);
                setSearchQuery('');
                if (e.error !== 'no-speech') {
                    alert('Error occurred in recognition: ' + e.error);
                }
            };

            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert('Voice search is not supported in your browser. Try Chrome or Edge.');
        }
    };

    // Image Search
    const handleImageSearch = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                alert(`Image search for ${file.name} would be processed here`);
                // Implement actual image search logic here
            }
        };
        input.click();
    };

    // Clear Recent Searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Logout Handlers
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userAddress');
        setIsLoggedIn(false);
        setUserData(null);
        setUserAddress('');
        setActiveDropdown(null);
        setShowLogoutConfirm(false);
        setShowLogoutSuccess(true);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleSuccessClose = () => {
        setShowLogoutSuccess(false);
        navigate('/login');
        closeMobileMenu();
    };

    // Dropdown and Menu Handlers
    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    };

    useEffect(() => {
        return () => {
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        };
    }, []);

    const toggleSearch = () => {
        setIsSearchExpanded(!isSearchExpanded);
        if (!isSearchExpanded) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    // User Avatar Functions
    const getUserInitials = () => {
        if (!userData?.name) return '';
        return userData.name
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    const getUserAvatarColor = () => {
        if (!userData?.name) return '#6c5ce7';
        const colors = [
            '#6c5ce7', '#00b894', '#fd79a8', '#e17055',
            '#0984e3', '#d63031', '#fdcb6e', '#00cec9'
        ];
        const hash = userData.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return colors[hash % colors.length];
    };

    // Enhanced Navigation Handler for Mobile Menu
    const handleMobileNavigation = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    // Render Search Suggestions - COMPLETELY FIXED CLICK ISSUES
    const renderSearchSuggestions = () => {
        const hasSearchResults = Array.isArray(searchResults) && searchResults.length > 0;
        const hasTrendingProducts = Array.isArray(trendingProducts) && trendingProducts.length > 0;
        const hasRecentSearches = recentSearches.length > 0;

        if (!showSearchSuggestions) return null;

        return (
            <div
                className="search-suggestions-dropdown"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Recent Searches */}
                {hasRecentSearches && !searchQuery && (
                    <div className="suggestions-section">
                        <div className="suggestions-header">
                            <span>Recent Searches</span>
                            <button
                                className="clear-recent-btn"
                                onClick={(e) => handleSuggestionClick(e, clearRecentSearches)}
                            >
                                Clear
                            </button>
                        </div>
                        {recentSearches.map((search, index) => (
                            <div
                                key={index}
                                className="search-suggestion-item recent-search"
                                onClick={(e) => handleSuggestionClick(e, () => handleQuickSearch(search))}
                            >
                                <FiClock size={16} />
                                <span>{search}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Popular Searches */}
                {!searchQuery && (
                    <div className="suggestions-section">
                        <div className="suggestions-header">
                            <span>Popular Searches</span>
                        </div>
                        <div className="popular-tags">
                            {popularSearches.map((search, index) => (
                                <button
                                    key={index}
                                    className="popular-tag"
                                    onClick={(e) => handleSuggestionClick(e, () => handleQuickSearch(search))}
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {searchQuery && hasSearchResults && (
                    <div className="suggestions-section">
                        <div className="suggestions-header">
                            <span>Products</span>
                            {searchLoading && <span className="searching-text">Searching...</span>}
                        </div>
                        {searchResults.slice(0, 5).map(item => {
                            // FIXED: Use discount percentage from backend
                            const originalPrice = parseFloat(item.originalPrice || item.price) || 0;
                            const discountPercentage = parseFloat(item.discountPercentage || item.discount) || 0;
                            const discountAmount = discountPercentage > 0 ? (originalPrice * discountPercentage) / 100 : 0;
                            const finalPrice = discountPercentage > 0 ? (originalPrice - discountAmount) : originalPrice;

                            return (
                                <div
                                    key={item.id}
                                    className="search-suggestion-item product-suggestion"
                                    onClick={(e) => handleSuggestionClick(e, () => handleProductClick(item.id))}
                                >
                                    <img
                                        src={item.images && item.images.length > 0 ? item.images[0] : '/default-product.png'}
                                        alt={item.name}
                                        className="suggestion-image"
                                        onError={(e) => {
                                            e.target.src = '/default-product.png';
                                        }}
                                    />
                                    <div className="suggestion-details">
                                        <p className="suggestion-name">{item.name}</p>
                                        <p className="suggestion-description">
                                            {item.description?.split("\n").slice(0, 2).join(" ").substring(0, 60)}...
                                        </p>
                                        <div className="suggestion-price">
                                            {discountPercentage > 0 ? (
                                                <>
                                                    <span className="discounted-price">₹{finalPrice.toFixed(2)}</span>
                                                    <span className="original-price">₹{originalPrice.toFixed(2)}</span>
                                                    <span className="discount-badge">
                                                        {discountPercentage}% OFF
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="normal-price">₹{originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* View All Results */}
                        {searchResults.length > 5 && (
                            <div
                                className="view-all-results"
                                onClick={(e) => handleSuggestionClick(e, handleSearch)}
                            >
                                View all {searchResults.length} results for "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}

                {/* No Results */}
                {searchQuery && !hasSearchResults && !searchLoading && (
                    <div className="suggestions-section">
                        <div className="no-results-suggestion">
                            <p>No products found for "{searchQuery}"</p>
                            <button
                                className="browse-all-btn"
                                onClick={(e) => handleSuggestionClick(e, () => navigate('/products'))}
                            >
                                Browse All Products
                            </button>
                        </div>
                    </div>
                )}

                {/* Trending Products when no search query */}
                {!searchQuery && hasTrendingProducts && (
                    <div className="suggestions-section">
                        <div className="suggestions-header">
                            <span>Trending Now</span>
                            <button
                                className={`refresh-trending-btn ${isRefreshingTrending ? 'refreshing' : ''}`}
                                onClick={(e) => handleSuggestionClick(e, refreshTrendingProducts)}
                                title="Refresh trending products"
                                disabled={isRefreshingTrending}
                            >
                                <FiRefreshCw size={12} className={isRefreshingTrending ? 'spinning' : ''} />
                            </button>
                        </div>
                        {trendingProducts.map(item => {
                            // FIXED: Use discount percentage from backend for trending
                            const originalPrice = parseFloat(item.originalPrice || item.price) || 0;
                            const discountPercentage = parseFloat(item.discountPercentage || item.discount) || 0;
                            const discountAmount = discountPercentage > 0 ? (originalPrice * discountPercentage) / 100 : 0;
                            const finalPrice = discountPercentage > 0 ? (originalPrice - discountAmount) : originalPrice;

                            return (
                                <div
                                    key={item.id}
                                    className="search-suggestion-item product-suggestion"
                                    onClick={(e) => handleSuggestionClick(e, () => handleProductClick(item.id))}
                                >
                                    <img
                                        src={item.images && item.images.length > 0 ? item.images[0] : '/default-product.png'}
                                        alt={item.name}
                                        className="suggestion-image"
                                        onError={(e) => {
                                            e.target.src = '/default-product.png';
                                        }}
                                    />
                                    <div className="suggestion-details">
                                        <p className="suggestion-name">{item.name}</p>
                                        <div className="suggestion-price trending-price">
                                            {discountPercentage > 0 ? (
                                                <>
                                                    <span className="discounted-price">₹{finalPrice.toFixed(2)}</span>
                                                    <span className="original-price">₹{originalPrice.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="normal-price">₹{originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                        <div className="trending-badge">
                                            🔥 Trending
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Mobile Search Suggestions - COMPLETELY FIXED CLICK ISSUES
    const renderMobileSearchSuggestions = () => {
        const hasSearchResults = Array.isArray(searchResults) && searchResults.length > 0;
        const hasTrendingProducts = Array.isArray(trendingProducts) && trendingProducts.length > 0;
        const hasRecentSearches = recentSearches.length > 0;

        if (!showSearchSuggestions) return null;

        return (
            <div
                className="mobile-search-suggestions-dropdown"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Recent Searches */}
                {hasRecentSearches && !searchQuery && (
                    <div className="mobile-suggestions-section">
                        <div className="mobile-suggestions-header">
                            <span>Recent Searches</span>
                            <button
                                className="mobile-clear-recent-btn"
                                onClick={(e) => handleSuggestionClick(e, clearRecentSearches)}
                            >
                                Clear
                            </button>
                        </div>
                        {recentSearches.map((search, index) => (
                            <div
                                key={index}
                                className="mobile-recent-search-item"
                                onClick={(e) => handleSuggestionClick(e, () => handleQuickSearch(search))}
                            >
                                <FiClock size={16} />
                                <span>{search}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Popular Searches */}
                {!searchQuery && (
                    <div className="mobile-suggestions-section">
                        <div className="mobile-suggestions-header">
                            <span>Popular Searches</span>
                        </div>
                        <div className="mobile-popular-tags">
                            {popularSearches.map((search, index) => (
                                <button
                                    key={index}
                                    className="mobile-popular-tag"
                                    onClick={(e) => handleSuggestionClick(e, () => handleQuickSearch(search))}
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {searchQuery && hasSearchResults && (
                    <div className="mobile-suggestions-section">
                        <div className="mobile-suggestions-header">
                            <span>Products</span>
                            {searchLoading && <span className="searching-text">Searching...</span>}
                        </div>
                        {searchResults.slice(0, 5).map(item => {
                            // FIXED: Use discount percentage from backend
                            const originalPrice = parseFloat(item.originalPrice || item.price) || 0;
                            const discountPercentage = parseFloat(item.discountPercentage || item.discount) || 0;
                            const discountAmount = discountPercentage > 0 ? (originalPrice * discountPercentage) / 100 : 0;
                            const finalPrice = discountPercentage > 0 ? (originalPrice - discountAmount) : originalPrice;

                            return (
                                <div
                                    key={item.id}
                                    className="mobile-search-suggestion-item"
                                    onClick={(e) => handleSuggestionClick(e, () => handleProductClick(item.id))}
                                >
                                    <img
                                        src={item.images && item.images.length > 0 ? item.images[0] : '/default-product.png'}
                                        alt={item.name}
                                        className="mobile-suggestion-image"
                                        onError={(e) => {
                                            e.target.src = '/default-product.png';
                                        }}
                                    />
                                    <div className="mobile-suggestion-details">
                                        <p className="mobile-suggestion-name">{item.name}</p>
                                        <p className="mobile-suggestion-description">
                                            {item.description?.split("\n").slice(0, 2).join(" ").substring(0, 60)}...
                                        </p>
                                        <div className="mobile-suggestion-price">
                                            {discountPercentage > 0 ? (
                                                <>
                                                    <span className="mobile-discounted-price">₹{finalPrice.toFixed(2)}</span>
                                                    <span className="mobile-original-price">₹{originalPrice.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="mobile-normal-price">₹{originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* View All Results */}
                        {searchResults.length > 5 && (
                            <div
                                className="mobile-view-all-results"
                                onClick={(e) => handleSuggestionClick(e, handleSearch)}
                            >
                                View all {searchResults.length} results for "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}

                {/* No Results */}
                {searchQuery && !hasSearchResults && !searchLoading && (
                    <div className="mobile-suggestions-section">
                        <div className="mobile-no-results-suggestion">
                            <p>No products found for "{searchQuery}"</p>
                            <button
                                className="mobile-browse-all-btn"
                                onClick={(e) => handleSuggestionClick(e, () => handleMobileNavigation('/products'))}
                            >
                                Browse All Products
                            </button>
                        </div>
                    </div>
                )}

                {/* Trending Products */}
                {!searchQuery && hasTrendingProducts && (
                    <div className="mobile-suggestions-section">
                        <div className="mobile-suggestions-header">
                            <span>Trending Now</span>
                            <button
                                className={`mobile-refresh-trending-btn ${isRefreshingTrending ? 'refreshing' : ''}`}
                                onClick={(e) => handleSuggestionClick(e, refreshTrendingProducts)}
                                title="Refresh trending products"
                                disabled={isRefreshingTrending}
                            >
                                <FiRefreshCw size={12} className={isRefreshingTrending ? 'spinning' : ''} />
                            </button>
                        </div>
                        {trendingProducts.map(item => {
                            // FIXED: Use discount percentage from backend for trending
                            const originalPrice = parseFloat(item.originalPrice || item.price) || 0;
                            const discountPercentage = parseFloat(item.discountPercentage || item.discount) || 0;
                            const discountAmount = discountPercentage > 0 ? (originalPrice * discountPercentage) / 100 : 0;
                            const finalPrice = discountPercentage > 0 ? (originalPrice - discountAmount) : originalPrice;

                            return (
                                <div
                                    key={item.id}
                                    className="mobile-search-suggestion-item"
                                    onClick={(e) => handleSuggestionClick(e, () => handleProductClick(item.id))}
                                >
                                    <img
                                        src={item.images && item.images.length > 0 ? item.images[0] : '/default-product.png'}
                                        alt={item.name}
                                        className="mobile-suggestion-image"
                                        onError={(e) => {
                                            e.target.src = '/default-product.png';
                                        }}
                                    />
                                    <div className="mobile-suggestion-details">
                                        <p className="mobile-suggestion-name">{item.name}</p>
                                        <div className="mobile-suggestion-price">
                                            {discountPercentage > 0 ? (
                                                <>
                                                    <span className="mobile-discounted-price">₹{finalPrice.toFixed(2)}</span>
                                                    <span className="mobile-original-price">₹{originalPrice.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="mobile-normal-price">₹{originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                        <div className="mobile-trending-badge">
                                            🔥 Trending
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Loading State */}
                {searchLoading && (
                    <div className="mobile-search-loading">
                        <div className="mobile-loading-spinner"></div>
                        <span>Searching...</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <header className={`header-main ${isScrolled ? 'header-scrolled' : ''}`}>
            <div className="header-container-main">
                {/* Brand and Mobile Menu Toggle */}
                <div className="header-brand-section">
                    <motion.button
                        className="mobile-menu-toggle-btn"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                        whileTap={{ scale: 0.9 }}
                    >
                        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </motion.button>

                    <Link to="/" className="logo-main" onClick={closeMobileMenu}>
                        <motion.h1
                            className="logo-text-main"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Pankhudi
                        </motion.h1>
                        <motion.span
                            className="logo-tagline-main"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            ELEGANCE REDEFINED
                        </motion.span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="desktop-nav-section">
                    {/* User Info Display */}
                    {isLoggedIn && userData && (
                        <div className="user-info-display-main">
                            <motion.div
                                className="user-welcome-text"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Hi, <span className="user-name-highlight">{userData.name?.split(' ')[0]}</span>
                            </motion.div>
                            <motion.div
                                className="user-address-display"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => navigate('/profile/address')}
                            >
                                <FiMapPin size={14} className="address-icon" />
                                <span className="address-text">
                                    Deliver to: {userAddress.length > 25 ? `${userAddress.substring(0, 25)}...` : userAddress}
                                </span>
                            </motion.div>
                        </div>
                    )}

                    {/* Main Navigation Links */}
                    <nav className="desktop-nav-links-container">
                        <ul className="desktop-nav-list">
                            <motion.li
                                className="desktop-nav-item"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/ai-chat"
                                    className="desktop-nav-link"
                                    activeClassName="active-nav-link"
                                >
                                    <RiChatAiLine size={20} />  AI Chat
                                </NavLink>
                            </motion.li>
                            <motion.li
                                className="desktop-nav-item"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/products"
                                    className="desktop-nav-link"
                                    activeClassName="active-nav-link"
                                >
                                    Shop
                                </NavLink>
                            </motion.li>
                            <motion.li
                                className="desktop-nav-item"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/collections"
                                    className="desktop-nav-link"
                                    activeClassName="active-nav-link"
                                >
                                    Collections
                                </NavLink>
                            </motion.li>
                            <motion.li
                                className="desktop-nav-item"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/about"
                                    className="desktop-nav-link"
                                    activeClassName="active-nav-link"
                                >
                                    About
                                </NavLink>
                            </motion.li>
                        </ul>
                    </nav>

                    {/* Enhanced Search Bar */}
                    <div
                        className={`desktop-search-container ${isSearchExpanded ? 'search-expanded' : ''}`}
                        ref={searchContainerRef}
                    >
                        <form onSubmit={handleSearch} className="desktop-search-form">
                            <motion.div
                                className="desktop-search-input-group"
                                initial={false}
                                animate={{ width: isSearchExpanded ? '100%' : '0px' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Search for dresses, sarees, jewelry..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSearchSuggestions(true)}
                                    ref={searchInputRef}
                                    className="desktop-search-input-field"
                                />
                                <div className="desktop-search-actions">
                                    <motion.button
                                        type="button"
                                        className={`desktop-search-action-btn ${isListening ? 'voice-active' : ''}`}
                                        onClick={handleVoiceSearch}
                                        aria-label="Voice search"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiMic size={18} />
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className="desktop-search-action-btn"
                                        onClick={handleImageSearch}
                                        aria-label="Image search"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiImage size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                            <motion.button
                                type={isSearchExpanded ? 'submit' : 'button'}
                                className="desktop-search-submit-btn"
                                aria-label="Search"
                                onClick={isSearchExpanded ? null : toggleSearch}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiSearch size={18} />
                            </motion.button>
                        </form>

                        {/* Enhanced Search Suggestions */}
                        {renderSearchSuggestions()}
                    </div>

                    {/* User Actions */}
                    <div className="desktop-user-actions-container" ref={dropdownRef}>
                        {isLoggedIn ? (
                            <div className="user-profile-dropdown-wrapper">
                                <motion.button
                                    className="user-profile-btn-main"
                                    onClick={() => toggleDropdown('user')}
                                    aria-expanded={activeDropdown === 'user'}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div
                                        className="user-avatar-circle"
                                        style={{ backgroundColor: getUserAvatarColor() }}
                                    >
                                        {userData?.name ? (
                                            <span className="avatar-initials-text">{getUserInitials()}</span>
                                        ) : (
                                            <FiUser size={20} />
                                        )}
                                    </div>
                                    <span className="user-name-text">
                                        {userData?.name?.split(' ')[0] || 'Account'}
                                    </span>
                                    {activeDropdown === 'user' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                </motion.button>

                                <AnimatePresence>
                                    {activeDropdown === 'user' && (
                                        <motion.div
                                            className="user-dropdown-menu"
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        >
                                            <div className="dropdown-header-section">
                                                <div
                                                    className="dropdown-avatar-large"
                                                    style={{ backgroundColor: getUserAvatarColor() }}
                                                >
                                                    {userData?.name ? (
                                                        <span className="avatar-initials-large">{getUserInitials()}</span>
                                                    ) : (
                                                        <FiUser size={24} />
                                                    )}
                                                </div>
                                                <div className="user-info-section">
                                                    <p className="user-fullname-text">{userData?.name || 'Hi, User'}</p>
                                                    <p className="user-email-text">{userData?.email || 'youremail@gmail.com'}</p>
                                                    {userData?.phone && <p className="user-phone-text">{userData.phone}</p>}
                                                </div>
                                            </div>
                                            <div className="dropdown-items-container">
                                                <motion.div whileHover={{ scale: 1.02 }}>
                                                    <NavLink
                                                        to={`/profile/${userData?.id || 'user'}`}
                                                        className="dropdown-item-link"
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <FiUser size={16} /> My Profile
                                                    </NavLink>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }}>
                                                    <NavLink
                                                        to="/orders"
                                                        className="dropdown-item-link"
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <FiClock size={16} /> Orders
                                                    </NavLink>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }}>
                                                    <NavLink
                                                        to="/wishlist"
                                                        className="dropdown-item-link"
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <FiHeart size={16} /> Wishlist
                                                        {wishlistItemsCount > 0 && (
                                                            <span className="dropdown-badge">{wishlistItemsCount}</span>
                                                        )}
                                                    </NavLink>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }}>
                                                    <NavLink
                                                        to="/settings"
                                                        className="dropdown-item-link"
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <FiSettings size={16} /> Settings
                                                    </NavLink>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <button
                                                        className="dropdown-item-link logout-btn"
                                                        onClick={handleLogout}
                                                    >
                                                        <FiLogOut size={16} /> Logout
                                                    </button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="auth-buttons-wrapper">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <NavLink
                                        to="/login"
                                        className="login-btn-main"
                                        activeClassName="active-btn"
                                    >
                                        Login
                                    </NavLink>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <NavLink
                                        to="/register"
                                        className="signup-btn-main"
                                        activeClassName="active-btn"
                                    >
                                        Sign Up
                                    </NavLink>
                                </motion.div>
                            </div>
                        )}

                        <motion.div
                            className="nav-icon-wrapper"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <NavLink
                                to="/cart"
                                className="nav-icon-btn"
                                activeClassName="active-icon"
                            >
                                <FiShoppingBag size={22} />
                                {cartItemsCount > 0 && (
                                    <motion.span
                                        className="nav-badge-circle"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                    >
                                        {cartItemsCount}
                                    </motion.span>
                                )}
                            </NavLink>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            className="mobile-menu-backdrop-layer"
                            onClick={closeMobileMenu}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        <motion.div
                            className="mobile-menu-container"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            ref={mobileMenuRef}
                        >
                            {/* Mobile Menu Header with Close Button */}
                            <div className="mobile-menu-header-section">
                                <div className="mobile-menu-header-top">
                                    <h3 className="mobile-menu-title">Menu</h3>
                                    <motion.button
                                        className="mobile-menu-close-btn"
                                        onClick={closeMobileMenu}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        aria-label="Close menu"
                                    >
                                        <FiX size={24} />
                                    </motion.button>
                                </div>

                                {isLoggedIn ? (
                                    <div className="mobile-user-profile-wrapper">
                                        <div
                                            className="mobile-user-avatar-circle"
                                            style={{ backgroundColor: getUserAvatarColor() }}
                                        >
                                            {userData?.name ? (
                                                <span className="mobile-avatar-initials">{getUserInitials()}</span>
                                            ) : (
                                                <FiUser size={28} />
                                            )}
                                        </div>
                                        <div className="mobile-user-info-section">
                                            <p className="mobile-user-name-text">{userData?.name || 'Hi, User'}</p>
                                            <p className="mobile-user-email-text">{userData?.email || 'yourmail@gmail.com'}</p>
                                            {userAddress && (
                                                <div
                                                    className="mobile-user-address-text"
                                                    onClick={() => handleMobileNavigation('/profile/address')}
                                                >
                                                    <FiMapPin size={12} />
                                                    {userAddress.length > 30 ? `${userAddress.substring(0, 30)}...` : userAddress}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mobile-auth-buttons-container">
                                        <motion.button
                                            className="mobile-login-btn-main"
                                            onClick={() => handleMobileNavigation('/login')}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Login
                                        </motion.button>
                                        <motion.button
                                            className="mobile-signup-btn-main"
                                            onClick={() => handleMobileNavigation('/register')}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Sign Up
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Search */}
                            <div className="mobile-search-wrapper">
                                <form onSubmit={handleSearch} className="mobile-search-form-container">
                                    <div className="mobile-search-input-group">
                                        <input
                                            type="text"
                                            placeholder="Search for products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setShowSearchSuggestions(true)}
                                            className="mobile-search-input-field"
                                            ref={searchInputRef}
                                        />
                                        <button
                                            type="submit"
                                            className="mobile-search-submit-btn"
                                            disabled={!searchQuery.trim()}
                                        >
                                            <FiSearch size={18} />
                                        </button>
                                    </div>
                                    <div className="mobile-search-options-container">
                                        <motion.button
                                            type="button"
                                            className={`mobile-search-option-btn ${isListening ? 'voice-active' : ''}`}
                                            onClick={handleVoiceSearch}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiMic size={16} /> Voice
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            className="mobile-search-option-btn"
                                            onClick={handleImageSearch}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiImage size={16} /> Image
                                        </motion.button>
                                    </div>
                                </form>

                                {/* Mobile Search Suggestions */}
                                {renderMobileSearchSuggestions()}
                            </div>

                            <nav className="mobile-nav-section">
                                <ul className="mobile-nav-list-container">
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <button
                                            className="mobile-nav-link-item"
                                            onClick={() => handleMobileNavigation('/')}
                                        >
                                            <FiHome size={20} /> Home
                                        </button>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <button
                                            className="mobile-nav-link-item"
                                            onClick={() => handleMobileNavigation('/ai-chat')}
                                        >
                                            <RiChatAiLine size={20} /> AI Chat
                                        </button>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <button
                                            className="mobile-nav-link-item"
                                            onClick={() => handleMobileNavigation('/products')}
                                        >
                                            <FiShoppingBag size={20} /> Shop All
                                        </button>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <button
                                            className="mobile-nav-link-item"
                                            onClick={() => handleMobileNavigation('/collections')}
                                        >
                                            <FiImage size={20} /> Collections
                                        </button>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <button
                                            className="mobile-nav-link-item"
                                            onClick={() => handleMobileNavigation('/about')}
                                        >
                                            <FiHelpCircle size={20} /> About Us
                                        </button>
                                    </motion.li>

                                    {isLoggedIn && (
                                        <>
                                            <li className="mobile-nav-section-title">My Account</li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <button
                                                    className="mobile-nav-link-item"
                                                    onClick={() => handleMobileNavigation(`/profile/${userData?.id || 'user'}`)}
                                                >
                                                    <FiUser size={20} /> Profile
                                                </button>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <button
                                                    className="mobile-nav-link-item"
                                                    onClick={() => handleMobileNavigation('/orders')}
                                                >
                                                    <FiClock size={20} /> Orders
                                                </button>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <button
                                                    className="mobile-nav-link-item"
                                                    onClick={() => handleMobileNavigation('/wishlist')}
                                                >
                                                    <FiHeart size={20} /> Wishlist
                                                    {wishlistItemsCount > 0 && (
                                                        <motion.span
                                                            className="mobile-nav-badge-item"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            {wishlistItemsCount}
                                                        </motion.span>
                                                    )}
                                                </button>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <button
                                                    className="mobile-nav-link-item"
                                                    onClick={() => handleMobileNavigation('/settings')}
                                                >
                                                    <FiSettings size={20} /> Settings
                                                </button>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <button
                                                    className="mobile-logout-btn-main"
                                                    onClick={handleLogout}
                                                >
                                                    <FiLogOut size={20} /> Logout
                                                </button>
                                            </motion.li>
                                        </>
                                    )}
                                </ul>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
                <div className="custom-alert-overlay">
                    <div className="custom-alert-box">
                        <h3 className="custom-alert-title">Confirm Logout</h3>
                        <p className="custom-alert-message">
                            Are you sure you want to logout from <span className="pankhudi-brand">Pankhudi</span>?
                        </p>
                        <div className="custom-alert-buttons">
                            <button
                                className="custom-alert-btn custom-alert-btn-cancel"
                                onClick={cancelLogout}
                            >
                                Cancel
                            </button>
                            <button
                                className="custom-alert-btn custom-alert-btn-confirm"
                                onClick={confirmLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Success Dialog */}
            {showLogoutSuccess && (
                <div className="custom-alert-overlay">
                    <div className="custom-alert-box">
                        <h3 className="custom-alert-title">Logged Out Successfully</h3>
                        <p className="custom-alert-message">
                            You have been successfully logged out from <span className="pankhudi-brand">Pankhudi</span>.
                            <br />
                            We hope to see you again soon!
                        </p>
                        <div className="custom-alert-buttons">
                            <button
                                className="custom-alert-btn custom-alert-btn-ok"
                                onClick={handleSuccessClose}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;