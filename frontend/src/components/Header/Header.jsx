import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
    FiChevronUp
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { RiChatAiLine } from "react-icons/ri";
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [wishlistItemsCount, setWishlistItemsCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

const fetchUserData = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    try {
        const userFromStorage = localStorage.getItem('user'); // ✅ always read "user"
        if (userFromStorage) {
            setUserData(JSON.parse(userFromStorage));
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
};


    useEffect(() => {
        fetchUserData();
        
        // Set up listener for storage changes
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            closeMobileMenu();
            setIsSearchExpanded(false);
        }
    };

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
                searchInputRef.current.focus();
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

    const handleImageSearch = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                alert(`Image search for ${file.name} would be processed here`);
            }
        };
        input.click();
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserData(null);
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

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
        document.body.style.overflow = '';
    };

    const toggleSearch = () => {
        setIsSearchExpanded(!isSearchExpanded);
        if (!isSearchExpanded) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

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

                    {/* Search Bar - Collapsible on mobile */}
                    <div className={`desktop-search-container ${isSearchExpanded ? 'search-expanded' : ''}`}>
                        <form onSubmit={handleSearch} className="desktop-search-form">
                            <motion.div
                                className="desktop-search-input-group"
                                initial={false}
                                animate={{ width: isSearchExpanded ? '100%' : '0px' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Search for products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                to="/wishlist"
                                className="nav-icon-btn"
                                activeClassName="active-icon"
                            >
                                <FiHeart size={22} />
                                {wishlistItemsCount > 0 && (
                                    <motion.span
                                        className="nav-badge-circle"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                    >
                                        {wishlistItemsCount}
                                    </motion.span>
                                )}
                            </NavLink>
                        </motion.div>

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
                        >
                            <div className="mobile-menu-header-section">
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
                                            {userData?.phone && <p className="mobile-user-phone-text">{userData.phone}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mobile-auth-buttons-container">
                                        <motion.button
                                            className="mobile-login-btn-main"
                                            onClick={() => {
                                                navigate('/login');
                                                closeMobileMenu();
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Login
                                        </motion.button>
                                        <motion.button
                                            className="mobile-signup-btn-main"
                                            onClick={() => {
                                                navigate('/register');
                                                closeMobileMenu();
                                            }}
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
                                            <FiMic size={16} /> Voice Search
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            className="mobile-search-option-btn"
                                            onClick={handleImageSearch}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiImage size={16} /> Image Search
                                        </motion.button>
                                    </div>
                                </form>
                            </div>

                            <nav className="mobile-nav-section">
                                <ul className="mobile-nav-list-container">
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <NavLink
                                            to="/"
                                            exact
                                            className="mobile-nav-link-item"
                                            onClick={closeMobileMenu}
                                            activeClassName="mobile-active-link"
                                        >
                                            <FiHome size={20} /> Home
                                        </NavLink>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <NavLink
                                            to="ai-chat"
                                            exact
                                            className="mobile-nav-link-item"
                                            onClick={closeMobileMenu}
                                            activeClassName="mobile-active-link"
                                        >
                                            <RiChatAiLine size={20} /> AI Chat
                                        </NavLink>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <NavLink
                                            to="/products"
                                            className="mobile-nav-link-item"
                                            onClick={closeMobileMenu}
                                            activeClassName="mobile-active-link"
                                        >
                                            <FiShoppingBag size={20} /> Shop All
                                        </NavLink>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <NavLink
                                            to="/collections"
                                            className="mobile-nav-link-item"
                                            onClick={closeMobileMenu}
                                            activeClassName="mobile-active-link"
                                        >
                                            <FiImage size={20} /> Collections
                                        </NavLink>
                                    </motion.li>
                                    <motion.li
                                        className="mobile-nav-item"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <NavLink
                                            to="/about"
                                            className="mobile-nav-link-item"
                                            onClick={closeMobileMenu}
                                            activeClassName="mobile-active-link"
                                        >
                                            <FiHelpCircle size={20} /> About Us
                                        </NavLink>
                                    </motion.li>

                                    {isLoggedIn && (
                                        <>
                                            <li className="mobile-nav-section-title">My Account</li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <NavLink
                                                    to={`/profile/${userData?.id || 'user'}`}
                                                    className="mobile-nav-link-item"
                                                    onClick={closeMobileMenu}
                                                    activeClassName="mobile-active-link"
                                                >
                                                    <FiUser size={20} /> Profile
                                                </NavLink>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <NavLink
                                                    to="/orders"
                                                    className="mobile-nav-link-item"
                                                    onClick={closeMobileMenu}
                                                    activeClassName="mobile-active-link"
                                                >
                                                    <FiClock size={20} /> Orders
                                                </NavLink>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <NavLink
                                                    to="/wishlist"
                                                    className="mobile-nav-link-item"
                                                    onClick={closeMobileMenu}
                                                    activeClassName="mobile-active-link"
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
                                                </NavLink>
                                            </motion.li>
                                            <motion.li
                                                className="mobile-nav-item"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <NavLink
                                                    to="/settings"
                                                    className="mobile-nav-link-item"
                                                    onClick={closeMobileMenu}
                                                    activeClassName="mobile-active-link"
                                                >
                                                    <FiSettings size={20} /> Settings
                                                </NavLink>
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