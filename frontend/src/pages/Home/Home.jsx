import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import { addToCart } from "../../utils/api";

import './Home.css';

// Enhanced category images with more options
const getCategoryImage = (category) => {
    const categoryImages = {
        dresses: 'https://img.kwcdn.com/product/enhanced_images/4bd92b3ed9fadfea0c9752692a9e19a1_enhanced.jpg?imageView2/2/w/800/q/70',
        tops: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop',
        skirts: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop',
        ethnicwear: 'https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS62_1_1200x.jpg?v=1740035852',
        winterwear: 'https://hulaglobal.com/wp-content/uploads/2024/11/Classic-wool-coat-683x1024.webp',
        accessories: 'https://miro.medium.com/v2/resize:fit:1200/1*w2ZtNewCRB7uakMLKuME6A.jpeg',
        lehengas: 'https://i.etsystatic.com/25647034/r/il/39b3f5/5232058934/il_1080xN.5232058934_29m2.jpg',
        suits: 'https://d17a17kld06uk8.cloudfront.net/products/N6MMXXW/CI8C43E7-original.jpg',
        jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop',
        footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop',
        bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop',
        jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ad5e5?w=500&auto=format&fit=crop',
        lingerie: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=500&auto=format&fit=crop',
        activewear: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500&auto=format&fit=crop',
        swimwear: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop',
        maternity: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&auto=format&fit=crop',
        plus_size: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop',
        general: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop'
    };
    return categoryImages[category?.toLowerCase()] || categoryImages.general;
};

const getFallbackProductImage = (category) => {
    const fallbackImages = {
        dresses: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb595d?w=500&auto=format&fit=crop',
        tops: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop',
        skirts: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop',
        ethnicwear: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop',
        winterwear: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop',
        accessories: 'https://images.unsplash.com/photo-1607602132863-4c6c92a1e20e?w=500&auto=format&fit=crop',
        lehengas: 'https://www.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/w/sw-l-10465-maroon-and-golden-embroidered-net-lehenga-choli.jpg',
        suits: 'https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg',
        jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop',
        footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop',
        bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop',
        jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ad5e5?w=500&auto=format&fit=crop',
        lingerie: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=500&auto=format&fit=crop',
        activewear: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500&auto=format&fit=crop',
        swimwear: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop',
        maternity: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&auto=format&fit=crop',
        plus_size: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop',
        general: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop'
    };
    return fallbackImages[category?.toLowerCase()] || fallbackImages.general;
};

// Enhanced slider items with more options
const sliderItems = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop',
        title: 'Summer Collection',
        subtitle: 'Up to 50% off on dresses & tops',
        link: '/summer-sale',
        buttonText: 'Shop Now',
        theme: 'summer'
    },
    {
        id: 2,
        image: 'https://i.pinimg.com/736x/d0/78/70/d078705c172a131d88c67bd19986172d.jpg',
        title: 'Ethnic Wear',
        subtitle: 'New traditional designs for festive season',
        link: '/ethnic-wear',
        buttonText: 'Explore',
        theme: 'ethnic'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&auto=format&fit=crop',
        title: 'Winter Special',
        subtitle: 'Cozy winter outfits to keep you warm',
        link: '/winter-collection',
        buttonText: 'View Collection',
        theme: 'winter'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=1200&auto=format&fit=crop',
        title: 'New Arrivals',
        subtitle: 'Discover the latest fashion trends',
        link: '/new-arrivals',
        buttonText: 'Discover',
        theme: 'new'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&auto=format&fit=crop',
        title: 'Maternity Collection',
        subtitle: 'Comfortable and stylish outfits for expecting mothers',
        link: '/maternity',
        buttonText: 'Explore',
        theme: 'maternity'
    }
];

// New filter options
const patternOptions = [
    { value: 'all', label: 'All' },
    { value: 'floral', label: 'Floral' },
    { value: 'striped', label: 'Striped' },
    { value: 'polka-dot', label: 'Polka Dot' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'embroidered', label: 'Ethnic' },
    { value: 'printed', label: 'Printed' },
    { value: 'plain', label: 'Plain' },
    { value: 'checkered', label: 'Checkered' },
    { value: 'animal-print', label: 'Animal Print' }
];

const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000-5000', label: '₹2000 - ₹5000' },
    { value: '5000+', label: 'Over ₹5000' }
];

// Predefined categories to ensure they're always visible
const predefinedCategories = [
    'dresses', 'tops', 'skirts', 'ethnicwear', 'winterwear',
    'accessories', 'lehengas', 'suits', 'jeans', 'footwear',
    'bags', 'jewelry', 'lingerie', 'activewear', 'swimwear',
    'maternity', 'plus_size'
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [categories, setCategories] = useState(predefinedCategories);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [activePriceFilter, setActivePriceFilter] = useState("all");
    const [sortOption, setSortOption] = useState("featured");
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState(8); // Show 8 categories initially
    const navigate = useNavigate();
    const testimonialsScrollRef = useRef(null);
    const [cart, setCart] = useState([]);

    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // ✅ Improved Product image formatter
    const getProductImage = useCallback((product) => {
        // Check if product has images array with content
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images[0];
            // Handle both string paths and object with url property
            const imageUrl = typeof firstImage === 'string'
                ? firstImage
                : (firstImage.url || firstImage.imageUrl || '');

            if (imageUrl.startsWith("http")) {
                return imageUrl;
            } else if (imageUrl.startsWith("/")) {
                return `${API}${imageUrl}`;
            }
        }

        // Check if product has image property directly
        if (product.image) {
            const imageUrl = typeof product.image === 'string'
                ? product.image
                : (product.image.url || product.image.imageUrl || '');

            if (imageUrl.startsWith("http")) {
                return imageUrl;
            } else if (imageUrl.startsWith("/")) {
                return `${API}${imageUrl}`;
            }
        }

        // Fallback to category-based image
        return getFallbackProductImage(product.category);
    }, [API]);

    // Fetch API products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log("Fetching products from:", `${API}/api/products`);
                const response = await axios.get(`${API}/api/products`);
                console.log("API Response:", response.data);

                if (Array.isArray(response.data)) {
                    const sanitized = response.data.map((p, index) => {
                        const productImage = getProductImage(p);

                        // ✅ check if product is within 7 days
                        const createdDate = new Date(p.createdAt || new Date());
                        const now = new Date();
                        const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
                        const isNew = diffInDays <= 7;

                        return {
                            id: p._id || p.id || `api-${index}`,
                            name: p.name || "No Name",
                            description: p.description || "",
                            price: Number(p.price) || 0,
                            category: (p.category || "general").toLowerCase(),
                            pattern: (p.pattern || "n/a").toLowerCase(),
                            rating: p.rating || 0,
                            discount: p.discount || 0,
                            stock: p.stock || 0,
                            brand: p.brand || "Unknown",
                            status: p.status || "active",
                            image: productImage,
                            images: p.images || [],
                            isApiProduct: true,
                            createdAt: p.createdAt || new Date().toISOString(),
                            tags: p.tags || [],
                            isNew: p.isNew || false,
                        };
                    });

                    setProducts(sanitized);

                    // Extract unique categories from products and combine with predefined
                    const productCategories = [...new Set(sanitized.map((p) => p.category))];
                    const allCategories = [...new Set([...predefinedCategories, ...productCategories])];
                    setCategories(allCategories);
                }
            } catch (err) {
                console.error("❌ Fetch error:", err);
                setProducts([]);
                // Use predefined categories even if API fails
                setCategories(predefinedCategories);
            }
        };

        fetchProducts();
    }, [API, getProductImage]);

    // Check login status
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    // Image loading and progress
    useEffect(() => {
        const totalImages = products.length + sliderItems.length + categories.length;
        if (totalImages === 0) return;

        let loaded = 0;

        const onLoad = () => {
            loaded++;
            setProgress(Math.round((loaded / totalImages) * 100));
            if (loaded >= totalImages) {
                setImagesLoaded(true);
            }
        };

        // Load category images
        categories.forEach(category => {
            const img = new Image();
            img.src = getCategoryImage(category);
            img.onload = onLoad;
            img.onerror = onLoad;
        });

        // Load product images
        products.forEach(product => {
            const img = new Image();
            img.src = product.image;
            img.onload = onLoad;
            img.onerror = () => {
                img.src = getFallbackProductImage(product.category);
                onLoad();
            };
        });

        // Load slider images
        sliderItems.forEach(item => {
            const img = new Image();
            img.src = item.image;
            img.onload = onLoad;
            img.onerror = onLoad;
        });
    }, [products, categories]);

    // Handle loading completion
    useEffect(() => {
        if (!imagesLoaded) return;

        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [imagesLoaded]);

    // Auto slide functionality
    useEffect(() => {
        if (!autoPlay || isLoading) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoPlay, isLoading]);

    // Slider navigation functions
    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % sliderItems.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length);
    }, []);

    const goToSlide = useCallback(index => {
        setCurrentSlide(index);
    }, []);

    const toggleAutoPlay = useCallback(() => {
        setAutoPlay(prev => !prev);
    }, []);

    const navigateTo = useCallback(path => {
        navigate(path);
    }, [navigate]);

    const handleAddToCart = async (product) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login first");
                return;
            }

            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                alert("User info not found, please login again");
                return;
            }
            const user = JSON.parse(storedUser);

            // ✅ Calculate discounted price before sending
            const finalPrice = product.discount > 0
                ? Math.round(product.price * (1 - product.discount / 100))
                : product.price;

            const payload = {
                product_id: product.id,
                quantity: 1,
                user_id: user.id,
                price: finalPrice   // ✅ Always send discounted price to backend
            };

            const response = await axios.post(
                "http://localhost:5000/api/cart/add",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            alert(response.data.message);

        } catch (error) {
            console.error("Add to cart error:", error);
            if (error.response) {
                alert(error.response.data.message || "Something went wrong");
            } else {
                alert("Network or server error");
            }
        }
    };

    // Filter products by pattern
    const filterProducts = (pattern) => {
        setActiveFilter(pattern);
    };

    // Filter products by price range
    const filterByPrice = (priceRange) => {
        setActivePriceFilter(priceRange);
    };

    // Sort products
    const sortProducts = (option) => {
        setSortOption(option);
    };

    // Get filtered and sorted products
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Apply pattern filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(product => product.pattern === activeFilter);
        }

        // Apply price filter
        if (activePriceFilter !== 'all') {
            if (activePriceFilter === '0-500') {
                filtered = filtered.filter(product => product.price < 500);
            } else if (activePriceFilter === '500-1000') {
                filtered = filtered.filter(product => product.price >= 500 && product.price < 1000);
            } else if (activePriceFilter === '1000-2000') {
                filtered = filtered.filter(product => product.price >= 1000 && product.price < 2000);
            } else if (activePriceFilter === '2000-5000') {
                filtered = filtered.filter(product => product.price >= 2000 && product.price < 5000);
            } else if (activePriceFilter === '5000+') {
                filtered = filtered.filter(product => product.price >= 5000);
            }
        }

        // Apply sorting
        switch (sortOption) {
            case 'price-low-high':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-low':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'discount':
                filtered.sort((a, b) => b.discount - a.discount);
                break;
            default:
                // Featured (default) - no sorting
                break;
        }

        return filtered;
    };

    // Toggle filters visibility on mobile
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Show more categories
    const showMoreCategories = () => {
        setVisibleCategories(categories.length);
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <h1 className="brand-name">Pankhudi</h1>
                    <div className="loading-spinner"></div>
                    <div className="loading-progress-bar">
                        <div className="loading-progress" style={{ width: `${progress}%` }} />
                    </div>
                    <p>Loading your fashion world... {progress}%</p>
                    {progress < 100 && (
                        <p className="slow-internet-warning">Loading images... This may take longer on slow connections.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="home-main">
                <section className="hero-section">
                    <div className="slider-container">
                        <button className="slider-btn left" onClick={prevSlide} aria-label="Previous slide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                            </svg>
                        </button>

                        <div className="slider-wrapper">
                            <div
                                className="slider-track"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {sliderItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`slide ${index === currentSlide ? 'active' : ''} ${item.theme}`}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            onClick={() => navigateTo(item.link)}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/1200x500?text=Pankhudi+Banner';
                                            }}
                                        />
                                        <div className="slide-content">
                                            <h2>{item.title}</h2>
                                            <p>{item.subtitle}</p>
                                            <button
                                                className="slide-button"
                                                onClick={() => navigateTo(item.link)}
                                            >
                                                {item.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="slider-btn right" onClick={nextSlide} aria-label="Next slide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                        </button>
                    </div>

                    <div className="slider-dots">
                        {sliderItems.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button className="auto-play-toggle" onClick={toggleAutoPlay}>
                        {autoPlay ? '❚❚' : '▶'}
                    </button>
                </section>

                <section id="categories-section" className="categories-section">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <button
                            className="view-all-btn"
                            onClick={() => navigateTo('/categories')}
                        >
                            View All
                            <span className="arrow-icon">→</span>
                        </button>
                    </div>
                    <div className="categories-container">
                        <div className="categories-grid">
                            {categories.slice(0, visibleCategories).map((category, index) => (
                                <div
                                    key={index}
                                    className="category-card"
                                    onClick={() => navigateTo(`/category/${category}`)}
                                >
                                    <div className="category-image-container">
                                        <img
                                            src={getCategoryImage(category)}
                                            alt={category}
                                            loading="lazy"
                                            className="category-image"
                                            onError={(e) => {
                                                e.target.src = getFallbackProductImage(category);
                                            }}
                                        />
                                        <div className="category-overlay">
                                            <button className="shop-now-btn">
                                                Shop Now
                                                <span className="btn-arrow">→</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}</h3>
                                </div>
                            ))}
                        </div>
                        {visibleCategories < categories.length && (
                            <div className="show-more-container">
                                <button className="show-more-btn" onClick={showMoreCategories}>
                                    Show All Categories
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <section className="product-filters-section">
                    <div className="filters-header">
                        <h3>Filter Products</h3>
                        <button className="toggle-filters" onClick={toggleFilters}>
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    <div className={`filters-container ${showFilters ? 'show' : ''}`}>
                        <div className="filter-group">
                            <h4>Pattern</h4>
                            <div className="pattern-filters">
                                {patternOptions.map(pattern => (
                                    <button
                                        key={pattern.value}
                                        className={`pattern-filter ${activeFilter === pattern.value ? 'active' : ''}`}
                                        onClick={() => filterProducts(pattern.value)}
                                    >
                                        {pattern.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>Price Range</h4>
                            <div className="price-filters">
                                {priceRanges.map(range => (
                                    <button
                                        key={range.value}
                                        className={`price-filter ${activePriceFilter === range.value ? 'active' : ''}`}
                                        onClick={() => filterByPrice(range.value)}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>Sort By</h4>
                            <select
                                className="sort-select"
                                value={sortOption}
                                onChange={(e) => sortProducts(e.target.value)}
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low-high">Price: Low to High</option>
                                <option value="price-high-low">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                                <option value="discount">Best Discount</option>
                            </select>
                        </div>

                        <div className="filter-actions">
                            <button
                                className="clear-filters"
                                onClick={() => {
                                    setActiveFilter('all');
                                    setActivePriceFilter('all');
                                    setSortOption('featured');
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </section>

                <section className="featured-section">
                    <div className="section-header">
                        <h2>All Products</h2>
                        <div className="results-info">
                            <span>Showing {getFilteredProducts().length} of {products.length} products</span>
                            <button className="view-all" onClick={() => navigateTo("/products")}>
                                View All
                                <span className="arrow-icon">→</span>
                            </button>
                        </div>
                    </div>

                    {/* …inside your <section className="featured-section"> */}

                    <div className="products-grid">
                        {getFilteredProducts().map((product, index) => (
                            <div
                                key={`${product.id}-${index}`}
                                className={`product-card ${product.isApiProduct ? "api-product" : ""}`}
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                {/* 🔥 Badges */}
                                {product.isNew && <span className="api-badge">NEW</span>}

                                {product.discount > 0 && (
                                    <span className="discount-badge">-{product.discount}%</span>
                                )}


                                {/* 🔥 Product Image */}
                                <div className="product-image">
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = getFallbackProductImage(product.category);
                                        }}
                                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                    />

                                    <button
                                        className={`quick-view ${hoveredProduct === product.id ? "visible" : ""}`}
                                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                    >
                                        Quick View
                                    </button>
                                    {product.pattern && product.pattern !== 'n/a' && (
                                        <span className="product-pattern">{product.pattern}</span>
                                    )}
                                </div>

                                {/* 🔥 Product Info */}
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="description">
                                        {product.description.split("\n").slice(0, 3).join("\n")}
                                    </p>

                                    <p className="brand">Brand: {product.brand || "N/A"}</p>

                                    {/* Price Section */}
                                    <div className="price-container">
                                        {product.discount > 0 ? (
                                            <>
                                                <span className="original-price">₹{product.price}</span>
                                                <span className="discounted-prices">
                                                    ₹
                                                    {Math.round(
                                                        product.price * (1 - product.discount / 100)
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="prices">₹{product.price}</span>
                                        )}
                                    </div>

                                    {/* Ratings */}
                                    <div className="product-rating">
                                        {[...Array(5)].map((_, i) => {
                                            const rating = Number(product.rating) || 0;
                                            return (
                                                <span
                                                    key={i}
                                                    className={i < Math.floor(rating) ? "star filled" : "star"}
                                                >
                                                    {i < Math.floor(rating) ? "★" : "☆"}
                                                </span>
                                            );
                                        })}
                                        <span>({(Number(product.rating) || 0).toFixed(1)})</span>
                                    </div>

                                    {/* Stock and Status */}
                                    <div className="product-meta">
                                        <p className="stock">
                                            <span className="meta-label">Stock:</span>
                                            <span
                                                className={`stock-value ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}
                                            >
                                                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                                            </span>
                                        </p>
                                        <p className="status">
                                            <span className="meta-label">Status:</span>
                                            <span className={`status-value ${product.status === "Active" ? "active" : "inactive"}`}>
                                                {product.status || "Active"}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        className={`add-to-cart ${product.stock <= 0 ? "disabled" : ""}`}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock <= 0}
                                    >
                                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                    </button>


                                </div>
                            </div>
                        ))}
                    </div>

                    {getFilteredProducts().length === 0 && (
                        <div className="no-products">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to see more results</p>
                            <button
                                className="reset-filters"
                                onClick={() => {
                                    setActiveFilter('all');
                                    setActivePriceFilter('all');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

                </section>

                <section className="offer-banner">
                    <div className="offer-content">
                        <h3>Limited Time Offer</h3>
                        <h2>Get 30% Off On All Ethnic Wear</h2>
                        <p>Use code: PANKHUDI30</p>
                        <button
                            className="offer-button"
                            onClick={() => navigateTo('/special-offer')}
                        >
                            Shop Now
                        </button>
                    </div>
                </section>

                <section className="trending-section">
                    <div className="section-header">
                        <h2>Trending Now</h2>
                        <button
                            className="view-all"
                            onClick={() => navigateTo('/trending')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="trending-grid">
                        {products
                            .filter(p => p.rating >= 3.5)
                            .slice(0, 5)
                            .map((product, index) => (
                                <div key={index} className="trending-card">
                                    <div className="trending-image">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = getFallbackProductImage(product.category);
                                            }}
                                            onClick={() => navigateTo(`/ProductDetail/${product.id}`)}
                                        />
                                        {product.isNew && <span className="api-badge">NEW</span>}
                                        {product.pattern && product.pattern !== 'n/a' && (
                                            <span className="trending-pattern">{product.pattern}</span>
                                        )}
                                    </div>
                                    <div className="trending-info">
                                        <h3>{product.name}</h3>
                                        <div className="trending-price">
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className="original">₹{product.price}</span>
                                                    <span>₹{Math.round(product.price * (1 - product.discount / 100))}</span>
                                                </>
                                            ) : (
                                                <span>₹{product.price}</span>
                                            )}
                                        </div>
                                        <div className="trending-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                                                >
                                                    {i < Math.floor(product.rating) ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>

                <section className="newsletter-section">
                    <div className="newsletter-container">
                        <div className="newsletter-text">
                            <h3>Subscribe to Our Newsletter</h3>
                            <p>Get updates on special offers and new collections</p>
                            <div className="newsletter-benefits">
                                <span>✔ Exclusive discounts</span>
                                <span>✔ Early access to sales</span>
                                <span>✔ Style tips & trends</span>
                            </div>
                        </div>
                        <form
                            className="newsletter-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Thank you for subscribing!');
                            }}
                        >
                            <input
                                type="email"
                                placeholder="Your email address"
                                required
                            />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
            <ChatBot isPremium={true} />
        </>
    );
};

export default Home;