import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import {
    FiShoppingCart,
    FiHeart,
    FiEye,
    FiStar,
    FiFilter,
    FiX,
    FiUser,
    FiCreditCard,
    FiSearch,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import './Products.css';

const PankhudiProducts = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Sample product data with more details
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Silk Embroidered Saree',
            price: 2499,
            originalPrice: 3499,
            image: 'https://www.brithika.co.in/wp-content/uploads/2018/07/620-110.jpg',
            images: [
                'https://www.brithika.co.in/wp-content/uploads/2018/07/620-110.jpg',
                'https://medias.utsavfashion.com/media/catalog/product/cache/1/image/1000x/040ec09b1e35df139433887a97daa66f/s/e/sequinned-georgette-saree-in-navy-blue-v1-spf1818_3.jpg',
                'https://assets.panashindia.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/3/0/3045sr08-5168.jpg'
            ],
            rating: 4.5,
            reviews: 128,
            isNew: true,
            discount: 30,
            liked: false,
            inCart: false,
            category: 'saree',
            colors: ['red', 'blue', 'green'],
            sizes: ['S', 'M', 'L'],
            description: 'Handwoven silk saree with intricate zari embroidery, perfect for weddings and special occasions.',
            fabric: 'Pure Silk',
            occasion: 'Wedding, Festive',
            deliveryTime: '3-5 business days',
            returnPolicy: '10 days return policy'
        },
        {
            id: 2,
            name: 'Cotton Kurta Set',
            price: 1799,
            originalPrice: 2299,
            image: 'https://www.taneira.com/dw/image/v2/BKMH_PRD/on/demandware.static/-/Sites-Taneira-product-catalog/default/dw17d049ec/images/Taneira/Catalog/KSAL88XB_2.jpg?sw=1000&sh=1500',
            images: [
                'https://www.taneira.com/dw/image/v2/BKMH_PRD/on/demandware.static/-/Sites-Taneira-product-catalog/default/dw17d049ec/images/Taneira/Catalog/KSAL88XB_2.jpg?sw=1000&sh=1500',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_RiV_0KTuPh4K0lAV0Fi43KxAChTT21_J2w&s',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeVW442sPIH8OqKOj8uZI88y89NCb_SiYTgg&s'
            ],
            rating: 4.2,
            reviews: 86,
            isNew: false,
            discount: 22,
            liked: false,
            inCart: false,
            category: 'kurta',
            colors: ['white', 'beige'],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Comfortable cotton kurta set with hand block prints, ideal for daily wear and casual occasions.',
            fabric: 'Pure Cotton',
            occasion: 'Casual, Daily Wear',
            deliveryTime: '2-4 business days',
            returnPolicy: '7 days return policy'
        },
        {
            id: 3,
            name: 'Designer Lehenga',
            price: 5999,
            originalPrice: 7999,
            image: 'https://www.studio149fashion.com/cdn/shop/files/Untitled-design-10_7430e076-3881-43ea-87ea-d70ca33fd15e.jpg?v=1714904860',
            images: [
                'https://www.studio149fashion.com/cdn/shop/files/Untitled-design-10_7430e076-3881-43ea-87ea-d70ca33fd15e.jpg?v=1714904860',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE_qsSSkBMeIHkkenKT7jIz9vdDf8Wrga6Sg&s',
                'https://www.studio149fashion.com/cdn/shop/files/9210.jpg?v=1714752177'
            ],
            rating: 4.8,
            reviews: 215,
            isNew: true,
            discount: 25,
            liked: false,
            inCart: false,
            category: 'lehenga',
            colors: ['red', 'pink', 'gold'],
            sizes: ['S', 'M', 'L'],
            description: 'Exclusive designer lehenga with intricate embroidery and stone work, perfect for bridal wear.',
            fabric: 'Silk with Zari Work',
            occasion: 'Bridal, Festive',
            deliveryTime: '5-7 business days',
            returnPolicy: 'Custom orders cannot be returned'
        },
        {
            id: 4,
            name: 'Men\'s Silk Sherwani',
            price: 4599,
            originalPrice: 5999,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNcJDv0x5nZwX8MeqaxQtgorjv067Gwj6pgA&s',
            images: [
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNcJDv0x5nZwX8MeqaxQtgorjv067Gwj6pgA&s',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlxTnOnP_40RalLDZKGNKPFM5GSp4eYG-aeA&s',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsR2t7OpIptSYI1pcjnA34U10BettQ4NMV9Q&s'
            ],
            rating: 4.6,
            reviews: 175,
            isNew: false,
            discount: 23,
            liked: false,
            inCart: false,
            category: 'sherwani',
            colors: ['black', 'navy', 'maroon'],
            sizes: ['M', 'L', 'XL', 'XXL'],
            description: 'Regal silk sherwani with intricate embroidery, perfect for grooms and wedding guests.',
            fabric: 'Pure Silk with Embroidery',
            occasion: 'Wedding, Formal',
            deliveryTime: '4-6 business days',
            returnPolicy: '10 days return policy'
        },
        {
            id: 5,
            name: 'Kids Ethnic Set',
            price: 1299,
            originalPrice: 1699,
            image: 'https://www.jiomart.com/images/product/500x630/rvkefa2eq1/ahhaaaa-kids-ethnic-silk-blend-traditional-wear-sequin-print-indo-western-sherwani-set-for-boys-product-images-rvkefa2eq1-0-202306101213.jpg',
            images: [
                'https://www.jiomart.com/images/product/500x630/rvkefa2eq1/ahhaaaa-kids-ethnic-silk-blend-traditional-wear-sequin-print-indo-western-sherwani-set-for-boys-product-images-rvkefa2eq1-0-202306101213.jpg',
                'https://m.media-amazon.com/images/I/81FdkMRl6HL._AC_UY1100_.jpg',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuoQYuR5bbfvu3MIIjOWSmpT4T3gu_zDqNKA&s'
            ],
            rating: 4.3,
            reviews: 64,
            isNew: true,
            discount: 24,
            liked: false,
            inCart: false,
            category: 'kids',
            colors: ['blue', 'red'],
            sizes: ['2-3 yrs', '4-5 yrs', '6-7 yrs'],
            description: 'Adorable ethnic set for kids with comfortable fabric and traditional designs.',
            fabric: 'Silk Blend',
            occasion: 'Festive, Family Functions',
            deliveryTime: '2-4 business days',
            returnPolicy: '7 days return policy'
        },
        {
            id: 6,
            name: 'Banarasi Silk Saree',
            price: 3299,
            originalPrice: 4599,
            image: 'https://indiansilkhouseagencies.com/cdn/shop/files/BV-186228-1.jpg?v=1749286610',
            images: [
                'https://indiansilkhouseagencies.com/cdn/shop/files/BV-186228-1.jpg?v=1749286610',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb9duUZCCykjRstTKVykaRqPfNgBOecKDbCg&s',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWG6IWshJi3TevAp-pERQv2fHQfit-Q9WW6g&sg'
            ],
            rating: 4.7,
            reviews: 192,
            isNew: false,
            discount: 28,
            liked: false,
            inCart: false,
            category: 'saree',
            colors: ['purple', 'green', 'gold'],
            sizes: ['One Size'],
            description: 'Authentic Banarasi silk saree with gold zari work, a timeless addition to your wardrobe.',
            fabric: 'Banarasi Silk',
            occasion: 'Wedding, Festive, Formal',
            deliveryTime: '3-5 business days',
            returnPolicy: '10 days return policy'
        },
        {
            id: 7,
            name: 'Printed Palazzo Set',
            price: 1999,
            originalPrice: 2599,
            image: 'https://pratapsons.com/cdn/shop/files/RG7-11072.jpg?v=1738434901',
            images: [
                'https://pratapsons.com/cdn/shop/files/RG7-11072.jpg?v=1738434901',
                'https://www.rangriti.com/dw/image/v2/BKQK_PRD/on/demandware.static/-/Sites-rangriti-product-catalog/default/dw2f5bc96c/images/ss24/rskindigo18016ss24indblu_1.jpg?sw=502&sh=753',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4vuOnpBr6lztvyC7lIPnTME5QzlrcMCTiyw&s'
            ],
            rating: 4.1,
            reviews: 72,
            isNew: true,
            discount: 23,
            liked: false,
            inCart: false,
            category: 'kurta',
            colors: ['yellow', 'blue', 'pink'],
            sizes: ['S', 'M', 'L'],
            description: 'Trendy printed palazzo set with comfortable fabric and contemporary designs.',
            fabric: 'Cotton Blend',
            occasion: 'Casual, Daily Wear',
            deliveryTime: '2-4 business days',
            returnPolicy: '7 days return policy'
        },
        {
            id: 8,
            name: 'Bridal Lehenga Set',
            price: 8999,
            originalPrice: 12999,
            image: 'https://img.perniaspopupshop.com/catalog/product/n/k/NKGC102213_1.jpg?impolicy=detailimageprod',
            images: [
                'https://img.perniaspopupshop.com/catalog/product/n/k/NKGC102213_1.jpg?impolicy=detailimageprod',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6IiXtXWn_z_Yp7PI-hRPlYaH6RAhEIomQ_A&s',
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyrAicida_s1G5BpJcMHBS4vVuFog-Hhpy_w&s'
            ],
            rating: 4.9,
            reviews: 298,
            isNew: false,
            discount: 31,
            liked: false,
            inCart: false,
            category: 'lehenga',
            colors: ['red', 'pink'],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Luxurious bridal lehenga with heavy embroidery and stone work for the perfect wedding look.',
            fabric: 'Silk with Heavy Embroidery',
            occasion: 'Bridal, Wedding',
            deliveryTime: '7-10 business days',
            returnPolicy: 'Custom orders cannot be returned'
        }
    ]);

    const [cartItems, setCartItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('featured');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({
        color: null,
        size: null
    });
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [expandedDetails, setExpandedDetails] = useState(false);
    const [filteredCount, setFilteredCount] = useState(products.length);

    const categories = [...new Set(products.map(product => product.category))];

    // Check screen size on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('pankhudiCart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
            setProducts(prevProducts =>
                prevProducts.map(product => ({
                    ...product,
                    inCart: JSON.parse(savedCart).some(item => item.id === product.id)
                }))
            );
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('pankhudiCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Update filtered count when filters change
    useEffect(() => {
        setFilteredCount(getFilteredProducts().length);
    }, [selectedCategories, priceRange, searchQuery, sortBy]);

    // Toggle like status
    const toggleLike = (productId) => {
        setProducts(products.map(product =>
            product.id === productId ? { ...product, liked: !product.liked } : product
        ));

        // Show like notification
        const product = products.find(p => p.id === productId);
        if (product) {
            showNotification(`${product.name} ${!product.liked ? 'added to' : 'removed from'} wishlist`);
        }
    };

    // Show notification
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'pankhudi-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('pankhudi-notification-show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('pankhudi-notification-show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    // Add to cart function
    const addToCart = (product) => {
        const productWithOptions = {
            ...product,
            selectedColor: selectedOptions.color,
            selectedSize: selectedOptions.size
        };

        const updatedCart = [...cartItems, productWithOptions];
        setCartItems(updatedCart);

        setProducts(products.map(p =>
            p.id === product.id ? { ...p, inCart: true } : p
        ));

        showNotification(`${product.name} added to cart!`);
    };

    // Remove from cart
    const removeFromCart = (productId) => {
        const updatedCart = cartItems.filter(item => item.id !== productId);
        setCartItems(updatedCart);
        setProducts(products.map(p =>
            p.id === productId ? { ...p, inCart: false } : p
        ));

        showNotification('Item removed from cart');
    };

    // Buy Now function
    const buyNow = (product) => {
        const orderData = {
            product: {
                ...product,
                selectedColor: selectedOptions.color,
                selectedSize: selectedOptions.size
            },
            date: new Date().toISOString(),
            status: 'pending'
        };

        localStorage.setItem('currentOrder', JSON.stringify(orderData));
        navigate('/checkout');
    };

    // Handle option selection
    const handleOptionSelect = (type, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [type]: value
        }));
    };

    // Quick view functions
    const openQuickView = (product) => {
        setQuickViewProduct(product);
        setSelectedOptions({
            color: product.colors?.[0] || null,
            size: product.sizes?.[0] || null
        });
        setActiveImageIndex(0);
        setExpandedDetails(false);
        document.body.style.overflow = 'hidden';
    };

    const closeQuickView = (e) => {
        if (e) e.stopPropagation();
        setQuickViewProduct(null);
        document.body.style.overflow = 'auto';
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            closeQuickView();
        }
    };

    const changeImage = (index) => {
        setActiveImageIndex(index);
    };

    const toggleDetails = () => {
        setExpandedDetails(!expandedDetails);
    };

    // Toggle profile dropdown
    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    // Filter and sort products
    const getFilteredProducts = () => {
        let filtered = [...products];

        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product =>
                selectedCategories.includes(product.category)
            );
        }

        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        switch (sortBy) {
            case 'price-low': return filtered.sort((a, b) => a.price - b.price);
            case 'price-high': return filtered.sort((a, b) => b.price - a.price);
            case 'rating': return filtered.sort((a, b) => b.rating - a.rating);
            case 'newest': return filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            case 'discount': return filtered.sort((a, b) =>
                ((b.originalPrice - b.price) / b.originalPrice * 100) -
                ((a.originalPrice - a.price) / a.originalPrice * 100)
            );
            default: return filtered;
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 10000]);
        setSearchQuery('');
        setSortBy('featured');
    };

    return (
        <div className="pankhudi-products-container">
            {/* Header Section */}
            <header className="pankhudi-products-header">
                <div className="pankhudi-products-brand-section">
                    <Link to="/" className="pankhudi-products-brand-link">
                        <h1 className="pankhudi-products-main-title">Pankhudi</h1>
                        <p className="pankhudi-products-tagline">Elegance Redefined</p>
                    </Link>
                </div>

                <div className="pankhudi-products-search-cart">
                    <div className="pankhudi-products-search-bar">
                        <FiSearch className="pankhudi-search-icon" />
                        <input
                            type="text"
                            placeholder="Search for traditional wear..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="pankhudi-header-icons">
                        <div className="pankhudi-profile-icon" onClick={toggleProfileDropdown}>
                            <FiUser />
                            {showProfileDropdown && (
                                <div className="pankhudi-profile-dropdown">
                                    <Link to="/account">My Account</Link>
                                    <Link to="/orders">My Orders</Link>
                                    <Link to="/wishlist">Wishlist</Link>
                                </div>
                            )}
                        </div>
                        <Link to="/cart" className="pankhudi-products-cart-link">
                            <FiShoppingCart />
                            <span className="pankhudi-cart-count">{cartItems.length}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Collection Header */}
            <div className="pankhudi-collection-header">
                <h2 className="pankhudi-collection-title">Our Featured Collections</h2>
                <p className="pankhudi-collection-description">
                    Discover handcrafted traditional wear that blends heritage with contemporary style
                </p>
                <div className="pankhudi-filter-status">
                    {filteredCount} {filteredCount === 1 ? 'item' : 'items'} found
                    {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000 || searchQuery) && (
                        <button className="pankhudi-clear-filters-btn" onClick={clearAllFilters}>
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Section */}
            <div className="pankhudi-controls">
                <button
                    className="pankhudi-filter-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FiFilter /> {isMobile ? '' : 'Filters'}
                    {selectedCategories.length > 0 && (
                        <span className="pankhudi-filter-badge">{selectedCategories.length}</span>
                    )}
                </button>

                <div className="pankhudi-sort">
                    <label>Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Customer Rating</option>
                        <option value="newest">New Arrivals</option>
                        <option value="discount">Best Discount</option>
                    </select>
                </div>
            </div>

            {/* Filter Sidebar */}
            {showFilters && (
                <div className={`pankhudi-filter-sidebar ${showFilters ? 'show' : ''}`}>
                    <div className="pankhudi-filter-header">
                        <h3>Filters</h3>
                        <button onClick={() => setShowFilters(false)}>
                            <FiX />
                        </button>
                    </div>

                    <div className="pankhudi-filter-section">
                        <h4>Categories</h4>
                        <div className="pankhudi-category-options">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`pankhudi-category-option ${selectedCategories.includes(category) ? 'selected' : ''}`}
                                    onClick={() => toggleCategory(category)}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pankhudi-filter-section">
                        <h4>Price Range</h4>
                        <div className="pankhudi-price-range-values">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                        <div className="pankhudi-price-range-sliders">
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="500"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                style={{
                                    background: `linear-gradient(to right, #ddd 0%, #ddd ${(priceRange[0] / 10000) * 100}%, #5a4bda ${(priceRange[0] / 10000) * 100}%, #5a4bda ${(priceRange[1] / 10000) * 100}%, #ddd ${(priceRange[1] / 10000) * 100}%, #ddd 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="500"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                style={{
                                    background: `linear-gradient(to right, #ddd 0%, #ddd ${(priceRange[0] / 10000) * 100}%, #5a4bda ${(priceRange[0] / 10000) * 100}%, #5a4bda ${(priceRange[1] / 10000) * 100}%, #ddd ${(priceRange[1] / 10000) * 100}%, #ddd 100%)`
                                }}
                            />
                        </div>
                    </div>

                    <button
                        className="pankhudi-apply-filters"
                        onClick={() => setShowFilters(false)}
                    >
                        Apply Filters
                    </button>
                </div>
            )}

            {/* Products Grid */}
            <div className="pankhudi-products-grid">
                {getFilteredProducts().length > 0 ? (
                    getFilteredProducts().map(product => (
                        <div className="pankhudi-product-card" key={product.id}>
                            <div className="pankhudi-product-badges">
                                {product.isNew && (
                                    <span className="pankhudi-new-badge">New Arrival</span>
                                )}
                                {product.discount > 0 && (
                                    <span className="pankhudi-discount-badge">
                                        Save {product.discount}%
                                    </span>
                                )}
                            </div>

                            <div className="pankhudi-product-image-wrapper">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="pankhudi-product-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x400?text=Pankhudi';
                                    }}
                                />
                                <button
                                    className="pankhudi-quick-view-btn"
                                    onClick={() => openQuickView(product)}
                                >
                                    <FiEye className="pankhudi-quick-view-icon" />
                                    Quick View
                                </button>
                            </div>

                            <div className="pankhudi-product-info">
                                <h3 className="pankhudi-product-name">{product.name}</h3>

                                <div className="pankhudi-price-section">
                                    <span className="pankhudi-current-price">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {product.originalPrice > product.price && (
                                        <span className="pankhudi-original-price">
                                            ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div className="pankhudi-rating-section">
                                    <div className="pankhudi-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`pankhudi-star ${i < Math.floor(product.rating) ? 'pankhudi-star-filled' : ''
                                                    } ${i === Math.floor(product.rating) && product.rating % 1 >= 0.5 ?
                                                        'pankhudi-star-half-filled' : ''
                                                    }`}
                                            >
                                                <FiStar />
                                            </span>
                                        ))}
                                    </div>
                                    <span className="pankhudi-review-count">
                                        ({product.reviews})
                                    </span>
                                </div>

                                <div className="pankhudi-action-buttons">
                                    {product.inCart ? (
                                        <button
                                            className="pankhudi-remove-btn"
                                            onClick={() => removeFromCart(product.id)}
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            className="pankhudi-cart-btn"
                                            onClick={() => addToCart(product)}
                                        >
                                            <FiShoppingCart className="pankhudi-cart-icon" />
                                            Add to Cart
                                        </button>
                                    )}
                                    <button
                                        className="pankhudi-buy-now-btn"
                                        onClick={() => {
                                            if (product.colors?.length > 0 || product.sizes?.length > 0) {
                                                openQuickView(product);
                                            } else {
                                                buyNow(product);
                                            }
                                        }}
                                    >
                                        <FiCreditCard className="pankhudi-buy-now-icon" />
                                        Buy Now
                                    </button>
                                    <button
                                        className={`pankhudi-wishlist-btn ${product.liked ? 'pankhudi-liked' : ''}`}
                                        onClick={() => toggleLike(product.id)}
                                    >
                                        <FiHeart className="pankhudi-heart-icon" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="pankhudi-no-products">
                        <h3>No products found matching your criteria</h3>
                        <button
                            className="pankhudi-clear-filters"
                            onClick={clearAllFilters}
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Quick View Modal */}
            {quickViewProduct && (
                <div
                    className={`pankhudi-quick-view-modal ${quickViewProduct ? 'active' : ''}`}
                    onClick={handleModalClick}
                >
                    <div className="pankhudi-quick-view-content">
                        <button
                            className="pankhudi-close-quick-view"
                            onClick={closeQuickView}
                        >
                            <FiX />
                        </button>

                        <div className="pankhudi-quick-view-images">
                            <div className="pankhudi-main-image">
                                <img
                                    src={quickViewProduct.images?.[activeImageIndex] || quickViewProduct.image}
                                    alt={quickViewProduct.name}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/500x600?text=Pankhudi';
                                    }}
                                />
                            </div>
                            <div className="pankhudi-thumbnails">
                                {quickViewProduct.images?.slice(0, 4).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${quickViewProduct.name} ${index + 1}`}
                                        className={index === activeImageIndex ? 'active' : ''}
                                        onClick={() => changeImage(index)}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/100x100?text=Pankhudi';
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pankhudi-quick-view-details">
                            <h3>{quickViewProduct.name}</h3>

                            <div className="pankhudi-price-section">
                                <span className="pankhudi-current-price">
                                    ₹{quickViewProduct.price.toLocaleString()}
                                </span>
                                {quickViewProduct.originalPrice > quickViewProduct.price && (
                                    <span className="pankhudi-original-price">
                                        ₹{quickViewProduct.originalPrice.toLocaleString()}
                                    </span>
                                )}
                                {quickViewProduct.discount > 0 && (
                                    <span className="pankhudi-discount-badge">
                                        {quickViewProduct.discount}% OFF
                                    </span>
                                )}
                            </div>

                            <div className="pankhudi-rating-section">
                                <div className="pankhudi-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`pankhudi-star ${i < Math.floor(quickViewProduct.rating) ? 'pankhudi-star-filled' : ''
                                                } ${i === Math.floor(quickViewProduct.rating) && quickViewProduct.rating % 1 >= 0.5 ?
                                                    'pankhudi-star-half-filled' : ''
                                                }`}
                                        >
                                            <FiStar />
                                        </span>
                                    ))}
                                </div>
                                <span className="pankhudi-review-count">
                                    {quickViewProduct.reviews} reviews
                                </span>
                            </div>

                            <div className="pankhudi-product-details-toggle" onClick={toggleDetails}>
                                <h4>Product Details</h4>
                                {expandedDetails ? <FiChevronUp /> : <FiChevronDown />}
                            </div>

                            {expandedDetails && (
                                <div className="pankhudi-expanded-details">
                                    <p>{quickViewProduct.description}</p>
                                    <div className="pankhudi-detail-row">
                                        <span>Fabric:</span>
                                        <span>{quickViewProduct.fabric}</span>
                                    </div>
                                    <div className="pankhudi-detail-row">
                                        <span>Occasion:</span>
                                        <span>{quickViewProduct.occasion}</span>
                                    </div>
                                    <div className="pankhudi-detail-row">
                                        <span>Delivery:</span>
                                        <span>{quickViewProduct.deliveryTime}</span>
                                    </div>
                                    <div className="pankhudi-detail-row">
                                        <span>Returns:</span>
                                        <span>{quickViewProduct.returnPolicy}</span>
                                    </div>
                                </div>
                            )}

                            <div className="pankhudi-product-options">
                                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                                    <div className="pankhudi-option">
                                        <h4>Colors:</h4>
                                        <div className="pankhudi-color-options">
                                            {quickViewProduct.colors.map(color => (
                                                <span
                                                    key={color}
                                                    className={`pankhudi-color-option ${selectedOptions.color === color ? 'selected' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                    onClick={() => handleOptionSelect('color', color)}
                                                />
                                            ))}
                                        </div>
                                        {selectedOptions.color && (
                                            <p className="pankhudi-selected-option">Selected: {selectedOptions.color}</p>
                                        )}
                                    </div>
                                )}

                                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                                    <div className="pankhudi-option">
                                        <h4>Sizes:</h4>
                                        <div className="pankhudi-size-options">
                                            {quickViewProduct.sizes.map(size => (
                                                <span
                                                    key={size}
                                                    className={`pankhudi-size-option ${selectedOptions.size === size ? 'selected' : ''}`}
                                                    onClick={() => handleOptionSelect('size', size)}
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                        {selectedOptions.size && (
                                            <p className="pankhudi-selected-option">Selected: {selectedOptions.size}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pankhudi-quick-view-actions">
                                {quickViewProduct.inCart ? (
                                    <button
                                        className="pankhudi-remove-btn"
                                        onClick={() => {
                                            removeFromCart(quickViewProduct.id);
                                            closeQuickView();
                                        }}
                                    >
                                        Remove from Cart
                                    </button>
                                ) : (
                                    <button
                                        className="pankhudi-cart-btn"
                                        onClick={() => {
                                            addToCart(quickViewProduct);
                                            closeQuickView();
                                        }}
                                    >
                                        <FiShoppingCart className="pankhudi-cart-icon" />
                                        Add to Cart
                                    </button>
                                )}

                                <button
                                    className="pankhudi-buy-now-btn"
                                    onClick={() => {
                                        if (!selectedOptions.color && quickViewProduct.colors?.length > 0) {
                                            showNotification('Please select a color');
                                            return;
                                        }
                                        if (!selectedOptions.size && quickViewProduct.sizes?.length > 0) {
                                            showNotification('Please select a size');
                                            return;
                                        }
                                        buyNow(quickViewProduct);
                                    }}
                                >
                                    <FiCreditCard className="pankhudi-buy-now-icon" />
                                    Buy Now
                                </button>

                                <button
                                    className={`pankhudi-wishlist-btn ${quickViewProduct.liked ? 'pankhudi-liked' : ''}`}
                                    onClick={() => {
                                        toggleLike(quickViewProduct.id);
                                    }}
                                >
                                    <FiHeart className="pankhudi-heart-icon" />
                                    {quickViewProduct.liked ? 'Saved' : 'Save to Wishlist'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Section */}
            <div className="pankhudi-view-all-section">
                <Link to="/collections" className="pankhudi-view-all-link">
                    Explore All Pankhudi Collections →
                </Link>
            </div>
            <div className="log">
                <Footer />
            </div>
        </div>
    );
};

export default PankhudiProducts;