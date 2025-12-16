import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { fetchCartCount } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
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
    FiRefreshCw,
    FiTag,
    FiLayers,
    FiGrid,
    FiHash,
    FiCheck,
    FiChevronRight
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

    // NEW: Category-based search states
    const [allCategories, setAllCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [allSubSubCategories, setAllSubSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(null);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [categorySearchLoading, setCategorySearchLoading] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
        category: null,
        sub_category: null,
        sub_sub_category: null,
        price_range: null,
        sort_by: 'relevance'
    });

    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchContainerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileSearchContainerRef = useRef(null);
    const categoryFilterRef = useRef(null);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    // Popular search suggestions with categories
    const popularSearches = [
        { text: "Sarees", category: "Ethnic Wear" },
        { text: "Dresses", category: "Western Wear" },
        { text: "Kurtas", category: "Ethnic Wear" },
        { text: "Kurti", category: "Ethnic Wear" },
        { text: "Lehenga", category: "Festive Wear" },
        { text: "Bangles", category: "Jewelry" },
        { text: "Wedding Collection", category: "Special Occasion" },
        { text: "Summer Dresses", category: "Seasonal" }
    ];

    // Price ranges for filtering
    const priceRanges = [
        { id: '0-500', label: 'Under ₹500' },
        { id: '500-1000', label: '₹500 - ₹1000' },
        { id: '1000-2000', label: '₹1000 - ₹2000' },
        { id: '2000-5000', label: '₹2000 - ₹5000' },
        { id: '5000-10000', label: '₹5000 - ₹10000' },
        { id: '10000+', label: 'Above ₹10000' }
    ];

    // Sort options
    const sortOptions = [
        { id: 'relevance', label: 'Relevance' },
        { id: 'price_low_high', label: 'Price: Low to High' },
        { id: 'price_high_low', label: 'Price: High to Low' },
        { id: 'newest', label: 'Newest First' },
        { id: 'rating', label: 'Highest Rated' },
        { id: 'discount', label: 'Best Discount' }
    ];

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch main categories
                const categoriesRes = await fetch('http://localhost:5000/api/categories');
                const categoriesData = await categoriesRes.json();
                if (categoriesData.success) {
                    setAllCategories(categoriesData.data || []);
                }

                // Fetch sub categories
                const subCategoriesRes = await fetch('http://localhost:5000/api/subcategories');
                const subCategoriesData = await subCategoriesRes.json();
                if (subCategoriesData.success) {
                    setAllSubCategories(subCategoriesData.data || []);
                }

                // Fetch sub-sub categories
                const subSubCategoriesRes = await fetch('http://localhost:5000/api/subsubcategories');
                const subSubCategoriesData = await subSubCategoriesRes.json();
                if (subSubCategoriesData.success) {
                    setAllSubSubCategories(subSubCategoriesData.data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback data
                setAllCategories([
                    { id: 1, name: 'Women', slug: 'women' },
                    { id: 2, name: 'Men', slug: 'men' },
                    { id: 3, name: 'Kids', slug: 'kids' },
                    { id: 4, name: 'Ethnic Wear', slug: 'ethnic-wear' }
                ]);
            }
        };

        fetchCategories();
    }, []);

    // Get sub-categories for selected category
    const getSubCategoriesForCategory = (categoryId) => {
        return allSubCategories.filter(sub => sub.category_id === categoryId);
    };

    // Get sub-sub-categories for selected sub-category
    const getSubSubCategoriesForSubCategory = (subCategoryId) => {
        return allSubSubCategories.filter(subSub => subSub.sub_category_id === subCategoryId);
    };

    // Get category name by ID
    const getCategoryNameById = (id) => {
        const category = allCategories.find(cat => cat.id === id);
        return category ? category.name : '';
    };

    // Get sub-category name by ID
    const getSubCategoryNameById = (id) => {
        const subCategory = allSubCategories.find(sub => sub.id === id);
        return subCategory ? subCategory.name : '';
    };

    // Get sub-sub-category name by ID
    const getSubSubCategoryNameById = (id) => {
        const subSubCategory = allSubSubCategories.find(subSub => subSub.id === id);
        return subSubCategory ? subSubCategory.name : '';
    };

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
            ...recentSearches.filter(search =>
                typeof search === 'string' &&
                search.toLowerCase() !== query.toLowerCase()
            )
        ].slice(0, 5);

        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    };

    // Refresh trending products
    const refreshTrendingProducts = async () => {
        try {
            setIsRefreshingTrending(true);
            setTrendingRefreshTime(Date.now());
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
        }, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

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

    // Initialize component
    useEffect(() => {
        fetchUserData();
        const handleStorageChange = () => {
            fetchUserData();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update counts from localStorage
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

    // NEW: Enhanced search toggle functionality
    const toggleSearch = () => {
        if (isSearchExpanded) {
            closeSearch();
        } else {
            openSearch();
        }
    };

    // Open search function
    const openSearch = () => {
        setIsSearchExpanded(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    // Close search function
    const closeSearch = () => {
        setIsSearchExpanded(false);
        setShowSearchSuggestions(false);
        setShowCategoryFilter(false);
        setSearchQuery('');
        setSearchResults([]);
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    };

    // NEW: Escape key to close search
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                if (isSearchExpanded) {
                    closeSearch();
                }
                if (showSearchSuggestions) {
                    setShowSearchSuggestions(false);
                }
                if (showCategoryFilter) {
                    setShowCategoryFilter(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isSearchExpanded, showSearchSuggestions, showCategoryFilter]);

    // NEW: Enhanced click outside handler with category filter
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close dropdowns
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }

            // Close category filter when clicking outside
            if (showCategoryFilter &&
                categoryFilterRef.current &&
                !categoryFilterRef.current.contains(event.target) &&
                !event.target.closest('.category-filter-toggle-btn')) {
                setShowCategoryFilter(false);
            }

            // Close expanded desktop search when clicking outside
            if (isSearchExpanded &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)) {
                closeSearch();
            }

            // Close search suggestions when clicking outside (desktop)
            if (searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target) &&
                !isMobileMenuOpen) {
                setShowSearchSuggestions(false);
            }

            // Don't close mobile menu when clicking on search suggestions
            if (isMobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest('.mobile-menu-toggle-btn')) {

                const isClickInMobileSearch = mobileSearchContainerRef.current?.contains(event.target);
                const isClickInSearchSuggestions = event.target.closest('.mobile-search-suggestions-dropdown');
                const isClickInSearchInput = event.target.closest('.mobile-search-input-field');
                const isClickInSearchButton = event.target.closest('.mobile-search-submit-btn');
                const isClickInSearchOption = event.target.closest('.mobile-search-option-btn');
                const isClickInSearchClear = event.target.closest('.mobile-search-clear-btn');

                if (!isClickInMobileSearch && !isClickInSearchSuggestions &&
                    !isClickInSearchInput && !isClickInSearchButton &&
                    !isClickInSearchOption && !isClickInSearchClear) {
                    closeMobileMenu();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen, isSearchExpanded, showCategoryFilter]);

    // NEW: Enhanced search with category filtering
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                // Build query parameters
                const params = new URLSearchParams({
                    q: encodeURIComponent(searchQuery)
                });

                // Add category filters if selected
                if (selectedCategory) {
                    params.append('category_id', selectedCategory);
                }
                if (selectedSubCategory) {
                    params.append('sub_category_id', selectedSubCategory);
                }
                if (selectedSubSubCategory) {
                    params.append('sub_sub_category_id', selectedSubSubCategory);
                }

                const res = await fetch(`http://localhost:5000/api/search/suggestions?${params}`);
                if (!res.ok) throw new Error('Suggestions failed');
                const data = await res.json();

                const filteredResults = (data.suggestions || []).filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                ).sort((a, b) => {
                    const aStartsWith = a.name.toLowerCase().startsWith(searchQuery.toLowerCase());
                    const bStartsWith = b.name.toLowerCase().startsWith(searchQuery.toLowerCase());

                    if (aStartsWith && !bStartsWith) return -1;
                    if (!aStartsWith && bStartsWith) return 1;

                    const aNameMatch = a.name.toLowerCase().indexOf(searchQuery.toLowerCase());
                    const bNameMatch = b.name.toLowerCase().indexOf(searchQuery.toLowerCase());

                    return aNameMatch - bNameMatch;
                });

                setSearchResults(filteredResults);
            } catch (err) {
                console.error('Suggestions error:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, selectedSubCategory, selectedSubSubCategory]);

    // Trending Products
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

    // NEW: Enhanced Search Handler with Category Filtering
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim() || selectedCategory || selectedSubCategory || selectedSubSubCategory) {
            try {
                const analyzedQuery = analyzeSearchQuery(searchQuery);

                // Build search query with filters
                const params = new URLSearchParams();
                if (searchQuery.trim()) {
                    params.append('q', encodeURIComponent(searchQuery));
                }
                if (selectedCategory) {
                    params.append('category_id', selectedCategory);
                }
                if (selectedSubCategory) {
                    params.append('sub_category_id', selectedSubCategory);
                }
                if (selectedSubSubCategory) {
                    params.append('sub_sub_category_id', selectedSubSubCategory);
                }
                if (appliedFilters.price_range) {
                    params.append('price_range', appliedFilters.price_range);
                }
                if (appliedFilters.sort_by) {
                    params.append('sort_by', appliedFilters.sort_by);
                }

                const response = await fetch(`http://localhost:5000/api/search?${params}`);
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();

                if (searchQuery.trim()) {
                    saveToRecentSearches(searchQuery);
                }

                navigate('/search', {
                    state: {
                        searchResults: data.products,
                        searchQuery: searchQuery,
                        analyzedQuery: analyzedQuery,
                        totalResults: data.count,
                        appliedFilters: {
                            ...appliedFilters,
                            category: selectedCategory,
                            sub_category: selectedSubCategory,
                            sub_sub_category: selectedSubSubCategory
                        },
                        filters: data.filters || {},
                        message: data.message || getSearchMessage(searchQuery, selectedCategory, selectedSubCategory, selectedSubSubCategory)
                    }
                });

                setSearchQuery('');
                setSearchResults([]);
                setShowSearchSuggestions(false);
                closeMobileMenu();
                closeSearch();

            } catch (err) {
                console.error('Search error:', err);
                navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
            }
        }
    };

    // Get appropriate search message
    const getSearchMessage = (query, categoryId, subCategoryId, subSubCategoryId) => {
        if (query.trim() && categoryId) {
            return `Search results for "${query}" in ${getCategoryNameById(categoryId)}`;
        } else if (query.trim()) {
            return `Search results for "${query}"`;
        } else if (categoryId) {
            const categoryName = getCategoryNameById(categoryId);
            const subCategoryName = subCategoryId ? getSubCategoryNameById(subCategoryId) : '';
            const subSubCategoryName = subSubCategoryId ? getSubSubCategoryNameById(subSubCategoryId) : '';

            if (subSubCategoryName) {
                return `Products in ${categoryName} > ${subCategoryName} > ${subSubCategoryName}`;
            } else if (subCategoryName) {
                return `Products in ${categoryName} > ${subCategoryName}`;
            } else {
                return `Products in ${categoryName}`;
            }
        }
        return 'Search results';
    };

    // Analyze search query for natural language processing
    const analyzeSearchQuery = (query) => {
        const analyzed = {
            originalQuery: query,
            searchTerms: query,
            filters: {},
            category: null,
            sub_category: null,
            sub_sub_category: null
        };

        // Price filters
        const pricePatterns = [
            { pattern: /under\s*(\d+)/i, key: 'maxPrice' },
            { pattern: /below\s*(\d+)/i, key: 'maxPrice' },
            { pattern: /less than\s*(\d+)/i, key: 'maxPrice' },
            { pattern: /upto\s*(\d+)/i, key: 'maxPrice' },
            { pattern: /above\s*(\d+)/i, key: 'minPrice' },
            { pattern: /over\s*(\d+)/i, key: 'minPrice' }
        ];

        pricePatterns.forEach(({ pattern, key }) => {
            const match = query.match(pattern);
            if (match) {
                analyzed.filters[key] = parseInt(match[1]);
                analyzed.searchTerms = analyzed.searchTerms.replace(pattern, '').trim();
            }
        });

        // Category detection
        const categories = [
            { pattern: /saree|sarees|sari/i, category: 'Sarees' },
            { pattern: /dress|dresses|gown/i, category: 'Dresses' },
            { pattern: /kurta|kurtas|kurti/i, category: 'Kurtas' },
            { pattern: /lehenga|lehengas/i, category: 'Lehengas' },
            { pattern: /jewelry|jewellery|jewellry/i, category: 'Jewelry' },
            { pattern: /bag|bags|handbag/i, category: 'Bags' },
            { pattern: /shoes|footwear|sneakers/i, category: 'Footwear' }
        ];

        categories.forEach(({ pattern, category }) => {
            if (analyzed.searchTerms.toLowerCase().match(pattern)) {
                analyzed.category = category;
            }
        });

        return analyzed;
    };

    // Quick search handler
    const handleQuickSearch = (query) => {
        setSearchQuery(query);
        saveToRecentSearches(query);

        const analyzedQuery = analyzeSearchQuery(query);

        navigate('/search', {
            state: {
                searchQuery: query,
                analyzedQuery: analyzedQuery
            }
        });
        setShowSearchSuggestions(false);
        setSearchResults([]);
        closeMobileMenu();
        closeSearch();
    };

    // NEW: Handle category-based search
    const handleCategorySearch = (categoryId = null, subCategoryId = null, subSubCategoryId = null) => {
        setSelectedCategory(categoryId);
        setSelectedSubCategory(subCategoryId);
        setSelectedSubSubCategory(subSubCategoryId);

        // If category is selected, trigger search automatically
        if (categoryId || subCategoryId || subSubCategoryId) {
            const searchParams = new URLSearchParams();
            if (categoryId) searchParams.append('category_id', categoryId);
            if (subCategoryId) searchParams.append('sub_category_id', subCategoryId);
            if (subSubCategoryId) searchParams.append('sub_sub_category_id', subSubCategoryId);

            navigate(`/search?${searchParams.toString()}`, {
                state: {
                    appliedFilters: {
                        category: categoryId,
                        sub_category: subCategoryId,
                        sub_sub_category: subSubCategoryId
                    },
                    message: getSearchMessage('', categoryId, subCategoryId, subSubCategoryId)
                }
            });

            setShowCategoryFilter(false);
            closeMobileMenu();
            closeSearch();
        }
    };

    // Clear all category filters
    const clearCategoryFilters = () => {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setSelectedSubSubCategory(null);
        setAppliedFilters({
            ...appliedFilters,
            category: null,
            sub_category: null,
            sub_sub_category: null
        });
    };

    // Toggle category filter
    const toggleCategoryFilter = () => {
        setShowCategoryFilter(!showCategoryFilter);
        if (!showCategoryFilter) {
            setTimeout(() => {
                const firstCategoryBtn = document.querySelector('.category-item-btn');
                if (firstCategoryBtn) firstCategoryBtn.focus();
            }, 100);
        }
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

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim().length > 0) {
            setShowSearchSuggestions(true);
        } else {
            setShowSearchSuggestions(false);
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
                setShowSearchSuggestions(true);
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
                const formData = new FormData();
                formData.append('image', file);

                fetch('http://localhost:5000/api/search/image', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            navigate('/search', {
                                state: {
                                    searchResults: data.products,
                                    searchQuery: 'Image Search',
                                    isImageSearch: true
                                }
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Image search error:', err);
                        alert('Image search failed. Please try again.');
                    });
            }
        };
        input.click();
    };

    // Clear Recent Searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Enhanced Logout Handlers
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

        if (logout) {
            logout();
        }

        setShowLogoutConfirm(false);
        setShowLogoutSuccess(true);

        closeMobileMenu();
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleSuccessClose = () => {
        setShowLogoutSuccess(false);
        navigate('/login');
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

    // Calculate product price
    const calculateProductPrice = (item) => {
        const originalPrice = parseFloat(item.originalPrice || item.price || item.mrp || 0);
        const discountPercentage = parseFloat(item.discountPercentage || item.discount || 0);

        const validDiscount = Math.max(0, Math.min(100, discountPercentage));
        const discountAmount = validDiscount > 0 ? (originalPrice * validDiscount) / 100 : 0;
        const finalPrice = validDiscount > 0 ? (originalPrice - discountAmount) : originalPrice;

        return {
            originalPrice,
            discountPercentage: validDiscount,
            finalPrice
        };
    };

    // NEW: Category Filter Component
    const renderCategoryFilter = () => {
        if (!showCategoryFilter) return null;

        const subCategories = selectedCategory ? getSubCategoriesForCategory(selectedCategory) : [];
        const subSubCategories = selectedSubCategory ? getSubSubCategoriesForSubCategory(selectedSubCategory) : [];

        return (
            <div
                className="category-filter-dropdown"
                ref={categoryFilterRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="category-filter-header">
                    <h4>Filter by Category</h4>
                    {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                        <button
                            className="clear-all-filters-btn"
                            onClick={clearCategoryFilters}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="category-filter-content">
                    {/* Main Categories */}
                    <div className="category-filter-section">
                        <h5>Main Categories</h5>
                        <div className="category-list">
                            {allCategories.map(category => (
                                <button
                                    key={category.id}
                                    className={`category-item-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setSelectedSubCategory(null);
                                        setSelectedSubSubCategory(null);
                                    }}
                                >
                                    <span>{category.name}</span>
                                    {selectedCategory === category.id && <FiCheck size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sub Categories (if main category selected) */}
                    {selectedCategory && subCategories.length > 0 && (
                        <div className="category-filter-section">
                            <h5>
                                {getCategoryNameById(selectedCategory)} - Sub Categories
                                <FiChevronRight size={14} />
                            </h5>
                            <div className="category-list">
                                {subCategories.map(subCategory => (
                                    <button
                                        key={subCategory.id}
                                        className={`category-item-btn ${selectedSubCategory === subCategory.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedSubCategory(subCategory.id);
                                            setSelectedSubSubCategory(null);
                                        }}
                                    >
                                        <span>{subCategory.name}</span>
                                        {selectedSubCategory === subCategory.id && <FiCheck size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sub-Sub Categories (if sub category selected) */}
                    {selectedSubCategory && subSubCategories.length > 0 && (
                        <div className="category-filter-section">
                            <h5>
                                {getSubCategoryNameById(selectedSubCategory)} - Sub-Sub Categories
                                <FiChevronRight size={14} />
                            </h5>
                            <div className="category-list">
                                {subSubCategories.map(subSubCategory => (
                                    <button
                                        key={subSubCategory.id}
                                        className={`category-item-btn ${selectedSubSubCategory === subSubCategory.id ? 'active' : ''}`}
                                        onClick={() => setSelectedSubSubCategory(subSubCategory.id)}
                                    >
                                        <span>{subSubCategory.name}</span>
                                        {selectedSubSubCategory === subSubCategory.id && <FiCheck size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Filters Display */}
                    {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                        <div className="selected-filters-section">
                            <h5>Selected Filters:</h5>
                            <div className="selected-filters-tags">
                                {selectedCategory && (
                                    <span className="selected-filter-tag">
                                        {getCategoryNameById(selectedCategory)}
                                        <button onClick={() => setSelectedCategory(null)}>×</button>
                                    </span>
                                )}
                                {selectedSubCategory && (
                                    <span className="selected-filter-tag">
                                        {getSubCategoryNameById(selectedSubCategory)}
                                        <button onClick={() => setSelectedSubCategory(null)}>×</button>
                                    </span>
                                )}
                                {selectedSubSubCategory && (
                                    <span className="selected-filter-tag">
                                        {getSubSubCategoryNameById(selectedSubSubCategory)}
                                        <button onClick={() => setSelectedSubSubCategory(null)}>×</button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Apply Button */}
                    <div className="category-filter-actions">
                        <button
                            className="apply-filters-btn"
                            onClick={() => handleCategorySearch(selectedCategory, selectedSubCategory, selectedSubSubCategory)}
                            disabled={!selectedCategory && !selectedSubCategory && !selectedSubSubCategory}
                        >
                            Search in Selected Category
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Desktop Search Suggestions
    const renderSearchSuggestions = () => {
        const hasSearchResults = Array.isArray(searchResults) && searchResults.length > 0;
        const hasTrendingProducts = Array.isArray(trendingProducts) && trendingProducts.length > 0;
        const hasRecentSearches = recentSearches.length > 0;

        if (!showSearchSuggestions) return null;

        return (
            <div
                className="search-suggestions-dropdown"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Active Filters Display */}
                {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                    <div className="active-filters-section">
                        <div className="active-filters-header">
                            <FiFilter size={14} />
                            <span>Active Filters:</span>
                        </div>
                        <div className="active-filters-tags">
                            {selectedCategory && (
                                <span className="active-filter-tag">
                                    {getCategoryNameById(selectedCategory)}
                                </span>
                            )}
                            {selectedSubCategory && (
                                <span className="active-filter-tag">
                                    {getSubCategoryNameById(selectedSubCategory)}
                                </span>
                            )}
                            {selectedSubSubCategory && (
                                <span className="active-filter-tag">
                                    {getSubSubCategoryNameById(selectedSubSubCategory)}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Searches */}
                {hasRecentSearches && !searchQuery && (
                    <div className="suggestions-section">
                        <div className="suggestions-header">
                            <span>Recent Searches</span>
                            <button
                                className="clear-recent-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearRecentSearches();
                                }}
                            >
                                Clear
                            </button>
                        </div>
                        {recentSearches.map((search, index) => (
                            <div
                                key={index}
                                className="search-suggestion-item recent-search"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickSearch(search);
                                }}
                            >
                                <FiClock size={16} />
                                <span>{search}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Popular Searches with Categories */}
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuickSearch(search.text);
                                    }}
                                    title={`Category: ${search.category}`}
                                >
                                    {search.text}
                                    <span className="tag-category">{search.category}</span>
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
                            const { originalPrice, discountPercentage, finalPrice } = calculateProductPrice(item);

                            return (
                                <div
                                    key={item.id}
                                    className="search-suggestion-item product-suggestion"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleProductClick(item.id);
                                    }}
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
                                        <p className="suggestion-category">
                                            {item.category} {item.sub_category ? `› ${item.sub_category}` : ''}
                                        </p>
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSearch();
                                }}
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate('/products');
                                }}
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    refreshTrendingProducts();
                                }}
                                title="Refresh trending products"
                                disabled={isRefreshingTrending}
                            >
                                <FiRefreshCw size={12} className={isRefreshingTrending ? 'spinning' : ''} />
                            </button>
                        </div>
                        {trendingProducts.map(item => {
                            const { originalPrice, discountPercentage, finalPrice } = calculateProductPrice(item);

                            return (
                                <div
                                    key={item.id}
                                    className="search-suggestion-item product-suggestion"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleProductClick(item.id);
                                    }}
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

    // Mobile Search Suggestions
    const renderMobileSearchSuggestions = () => {
        const hasSearchResults = Array.isArray(searchResults) && searchResults.length > 0;
        const hasTrendingProducts = Array.isArray(trendingProducts) && trendingProducts.length > 0;
        const hasRecentSearches = recentSearches.length > 0;

        if (!showSearchSuggestions) return null;

        return (
            <div
                className="mobile-search-suggestions-dropdown"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                {/* Active Filters in Mobile */}
                {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                    <div className="mobile-active-filters">
                        <div className="mobile-active-filters-header">
                            <FiFilter size={14} />
                            <span>Active Filters:</span>
                            <button
                                className="mobile-clear-filters-btn"
                                onClick={clearCategoryFilters}
                            >
                                Clear
                            </button>
                        </div>
                        <div className="mobile-active-filters-tags">
                            {selectedCategory && (
                                <span className="mobile-active-filter-tag">
                                    {getCategoryNameById(selectedCategory)}
                                </span>
                            )}
                            {selectedSubCategory && (
                                <span className="mobile-active-filter-tag">
                                    {getSubCategoryNameById(selectedSubCategory)}
                                </span>
                            )}
                            {selectedSubSubCategory && (
                                <span className="mobile-active-filter-tag">
                                    {getSubSubCategoryNameById(selectedSubSubCategory)}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Searches */}
                {hasRecentSearches && !searchQuery && (
                    <div className="mobile-suggestions-section">
                        <div className="mobile-suggestions-header">
                            <span>Recent Searches</span>
                            <button
                                className="mobile-clear-recent-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearRecentSearches();
                                }}
                            >
                                Clear
                            </button>
                        </div>
                        {recentSearches.map((search, index) => (
                            <div
                                key={index}
                                className="mobile-recent-search-item"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickSearch(search);
                                }}
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuickSearch(search.text);
                                    }}
                                >
                                    {search.text}
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
                            const { originalPrice, discountPercentage, finalPrice } = calculateProductPrice(item);

                            return (
                                <div
                                    key={item.id}
                                    className="mobile-search-suggestion-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleProductClick(item.id);
                                    }}
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
                                        <p className="mobile-suggestion-category">
                                            {item.category} {item.sub_category ? `› ${item.sub_category}` : ''}
                                        </p>
                                        <p className="mobile-suggestion-description">
                                            {item.description?.split("\n").slice(0, 2).join(" ").substring(0, 60)}...
                                        </p>
                                        <div className="mobile-suggestion-price">
                                            {discountPercentage > 0 ? (
                                                <>
                                                    <span className="mobile-discounted-price">₹{finalPrice.toFixed(2)}</span>
                                                    <span className="mobile-original-price">₹{originalPrice.toFixed(2)}</span>
                                                    <span className="mobile-discount-badge">
                                                        {discountPercentage}% OFF
                                                    </span>
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSearch();
                                }}
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMobileNavigation('/products');
                                }}
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    refreshTrendingProducts();
                                }}
                                title="Refresh trending products"
                                disabled={isRefreshingTrending}
                            >
                                <FiRefreshCw size={12} className={isRefreshingTrending ? 'spinning' : ''} />
                            </button>
                        </div>
                        {trendingProducts.map(item => {
                            const { originalPrice, discountPercentage, finalPrice } = calculateProductPrice(item);

                            return (
                                <div
                                    key={item.id}
                                    className="mobile-search-suggestion-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleProductClick(item.id);
                                    }}
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

                    {/* Enhanced Search Bar with Category Filter */}
                    <div
                        className={`desktop-search-container ${isSearchExpanded ? 'search-expanded' : ''}`}
                        ref={searchContainerRef}
                    >
                        <form onSubmit={handleSearch} className="desktop-search-form">
                            {/* Category Filter Toggle Button */}
                            <motion.button
                                type="button"
                                className={`category-filter-toggle-btn ${showCategoryFilter ? 'active' : ''}`}
                                onClick={toggleCategoryFilter}
                                aria-label="Filter by category"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiGrid size={16} />
                                {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                                    <span className="filter-indicator"></span>
                                )}
                            </motion.button>

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
                                    onChange={handleInputChange}
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

                            {/* Search Toggle Button */}
                            <motion.button
                                type="button"
                                className="desktop-search-toggle-btn"
                                aria-label={isSearchExpanded ? "Close search" : "Open search"}
                                onClick={toggleSearch}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isSearchExpanded ? <FiX size={18} /> : <FiSearch size={18} />}
                            </motion.button>
                        </form>

                        {/* Category Filter Dropdown */}
                        {renderCategoryFilter()}

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
                                    <h3 className="brand-name">Pankhudi</h3>
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

                            {/* Mobile Search with Category Filter */}
                            <div
                                className="mobile-search-wrapper"
                                ref={mobileSearchContainerRef}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                {/* Category Filter Button in Mobile */}
                                <div className="mobile-category-filter-section">
                                    <button
                                        className="mobile-category-filter-btn"
                                        onClick={() => {
                                            // Open category filter modal or page
                                            handleMobileNavigation('/categories');
                                        }}
                                    >
                                        <FiGrid size={16} />
                                        <span>Filter by Category</span>
                                    </button>

                                    {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                                        <div className="mobile-selected-categories">
                                            <span className="mobile-category-badge">
                                                {selectedCategory && getCategoryNameById(selectedCategory)}
                                                {selectedSubCategory && ` › ${getSubCategoryNameById(selectedSubCategory)}`}
                                                {selectedSubSubCategory && ` › ${getSubSubCategoryNameById(selectedSubSubCategory)}`}
                                            </span>
                                            <button
                                                className="mobile-clear-category-btn"
                                                onClick={clearCategoryFilters}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSearch} className="mobile-search-form-container">
                                    <div className="mobile-search-input-group">
                                        <input
                                            type="text"
                                            placeholder="Search for products..."
                                            value={searchQuery}
                                            onChange={handleInputChange}
                                            onFocus={() => setShowSearchSuggestions(true)}
                                            className="mobile-search-input-field"
                                            ref={searchInputRef}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        />
                                        {searchQuery && (
                                            <motion.button
                                                type="button"
                                                className="mobile-search-clear-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSearchQuery('');
                                                    setShowSearchSuggestions(false);
                                                    searchInputRef.current?.focus();
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FiX size={16} />
                                            </motion.button>
                                        )}
                                        <button
                                            type="submit"
                                            className="mobile-search-submit-btn"
                                            disabled={!searchQuery.trim()}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSearch(e);
                                            }}
                                        >
                                            <FiSearch size={18} />
                                        </button>
                                    </div>
                                    <div className="mobile-search-options-container">
                                        <motion.button
                                            type="button"
                                            className={`mobile-search-option-btn ${isListening ? 'voice-active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleVoiceSearch();
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiMic size={16} /> Voice
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            className="mobile-search-option-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleImageSearch();
                                            }}
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

                                    {/* Category Navigation in Mobile Menu */}
                                    <li className="mobile-nav-section-title">Browse Categories</li>
                                    {allCategories.slice(0, 5).map(category => (
                                        <motion.li
                                            key={category.id}
                                            className="mobile-nav-item"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <button
                                                className="mobile-nav-link-item"
                                                onClick={() => handleCategorySearch(category.id)}
                                            >
                                                <FiTag size={20} /> {category.name}
                                            </button>
                                        </motion.li>
                                    ))}
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <button
                                            className="mobile-nav-link-item"
                                            onClick={() => handleMobileNavigation('/categories')}
                                        >
                                            <FiLayers size={20} /> All Categories
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