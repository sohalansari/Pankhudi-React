import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

const Home = () => {
    // State Management
    const [currentSlide, setCurrentSlide] = useState(0);
    const [midCurrentSlide, setMidCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [midAutoPlay, setMidAutoPlay] = useState(true);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [notification, setNotification] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [quickSubCategories, setQuickSubCategories] = useState([]);
    const [isLoadingQuickCategories, setIsLoadingQuickCategories] = useState(true);
    const [homeTopBanners, setHomeTopBanners] = useState([]);
    const [homeMiddleBanners, setHomeMiddleBanners] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [dailyDeals, setDailyDeals] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeHoverCard, setActiveHoverCard] = useState(null);
    const [visibleCategories, setVisibleCategories] = useState(8);
    const [displayLimit, setDisplayLimit] = useState(20);
    const [activeCategory, setActiveCategory] = useState({ type: 'all', id: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const sliderIntervalRef = useRef(null);
    const midSliderIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Helper Functions
    const getImageUrl = useCallback((imagePath) => {
        if (!imagePath) return null;
        const trimmedPath = imagePath.trim();
        if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
            return trimmedPath;
        }
        if (trimmedPath.startsWith('/')) {
            return `${API}${trimmedPath}`;
        }
        return `${API}/${trimmedPath}`;
    }, [API]);

    const getProductImage = useCallback((product) => {
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || firstImage.imageUrl || '';
            return getImageUrl(imageUrl);
        }
        if (product.image) {
            const imageUrl = typeof product.image === 'string' ? product.image : product.image.url || product.image.imageUrl || '';
            return getImageUrl(imageUrl);
        }
        return 'https://via.placeholder.com/500x600?text=No+Image';
    }, [getImageUrl]);

    const getDisplayPrice = useCallback((product) => {
        const originalPrice = parseFloat(product.price) || 0;
        const discountPercent = parseFloat(product.discount) || 0;
        const discountPrice = parseFloat(product.discountPrice) || 0;

        let finalDiscountPrice = originalPrice;
        let finalDiscountPercent = 0;
        let hasValidDiscount = false;

        if (discountPrice > 0 && discountPrice < originalPrice) {
            finalDiscountPrice = discountPrice;
            const calculatedPercent = ((originalPrice - discountPrice) / originalPrice) * 100;
            finalDiscountPercent = parseFloat(calculatedPercent.toFixed(2));
            hasValidDiscount = true;
        } else if (discountPercent > 0 && discountPercent <= 100 && originalPrice > 0) {
            const discountAmount = originalPrice * (discountPercent / 100);
            finalDiscountPrice = parseFloat((originalPrice - discountAmount).toFixed(2));
            finalDiscountPercent = discountPercent;
            hasValidDiscount = true;
        }

        const formatPrice = (price) => {
            const numPrice = parseFloat(price);
            if (isNaN(numPrice) || numPrice <= 0) return '₹0';
            const formatted = numPrice.toFixed(2);
            if (formatted.endsWith('.00')) return `₹${parseInt(numPrice)}`;
            const cleaned = formatted.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
            return `₹${cleaned}`;
        };

        return {
            originalPrice,
            discountPrice: finalDiscountPrice,
            discountPercentage: finalDiscountPercent,
            hasDiscount: hasValidDiscount,
            formattedOriginalPrice: formatPrice(originalPrice),
            formattedDiscountPrice: formatPrice(finalDiscountPrice)
        };
    }, []);

    // Get Products by Category
    const getProductsByCategory = useCallback((categoryType, categoryId, limit = 4) => {
        if (categoryType === 'main' && categoryId) {
            return products.filter(product => product.category_id === categoryId).slice(0, limit);
        } else if (categoryType === 'sub' && categoryId) {
            return products.filter(product => product.sub_category_id === categoryId).slice(0, limit);
        }
        return products.slice(0, limit);
    }, [products]);

    // Fetch Banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const [topRes, middleRes] = await Promise.all([
                    axios.get(`${API}/api/banners/position/home_top`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${API}/api/banners/position/home_middle`).catch(() => ({ data: { data: [] } }))
                ]);

                if (topRes.data.success && Array.isArray(topRes.data.data)) {
                    const processedTop = topRes.data.data.map(banner => ({
                        ...banner,
                        image: getImageUrl(banner.image_url || banner.image)
                    }));
                    setHomeTopBanners(processedTop);
                    setCurrentSlide(0);
                }

                if (middleRes.data.success && Array.isArray(middleRes.data.data)) {
                    const processedMiddle = middleRes.data.data.map(banner => ({
                        ...banner,
                        image: getImageUrl(banner.image_url || banner.image)
                    }));
                    setHomeMiddleBanners(processedMiddle);
                    setMidCurrentSlide(0);
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
            }
        };
        fetchBanners();
    }, [API, getImageUrl]);

    // Fetch Categories and Sub-Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [categoriesRes, subCategoriesRes] = await Promise.all([
                    axios.get(`${API}/api/categories`),
                    axios.get(`${API}/api/subcategories`)
                ]);

                if (Array.isArray(categoriesRes.data)) {
                    const processedCategories = categoriesRes.data.map(cat => ({
                        ...cat,
                        image: cat.image ? getImageUrl(cat.image) : null
                    }));
                    setMainCategories(processedCategories);

                    const featured = processedCategories.filter(cat => cat.status === 'active').slice(0, 6);
                    setFeaturedCategories(featured);
                }

                if (subCategoriesRes.data.success && Array.isArray(subCategoriesRes.data.data)) {
                    const processedSubs = subCategoriesRes.data.data
                        .filter(sub => sub.is_active !== false)
                        .slice(0, 12)
                        .map(sub => ({
                            ...sub,
                            image_url: sub.image_url ? getImageUrl(sub.image_url) : (sub.image ? getImageUrl(sub.image) : null)
                        }));
                    setQuickSubCategories(processedSubs);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, [API, getImageUrl]);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API}/api/products`);
                if (Array.isArray(response.data)) {
                    const processedProducts = response.data.map(product => ({
                        id: product.id || product._id,
                        name: product.name,
                        price: parseFloat(product.price) || 0,
                        discount: parseFloat(product.discount) || 0,
                        discountPrice: parseFloat(product.discountPrice) || 0,
                        stock: parseInt(product.stock) || 0,
                        category: product.category,
                        category_id: product.category_id,
                        sub_category_id: product.sub_category_id,
                        rating: parseFloat(product.rating) || 0,
                        image: getProductImage(product),
                        description: product.description,
                        isNew: product.isNew || false,
                        isTrending: product.isTrending || false,
                        isDailyDeal: product.isDailyDeal || false,
                        createdAt: product.created_at || product.createdAt
                    }));
                    setProducts(processedProducts);

                    const trending = processedProducts.filter(p => p.isTrending || p.rating >= 4.5).slice(0, 8);
                    const deals = processedProducts.filter(p => p.isDailyDeal || p.discount > 20).slice(0, 4);
                    setTrendingProducts(trending);
                    setDailyDeals(deals);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
                setIsLoadingQuickCategories(false);
            }
        };
        fetchProducts();
    }, [API, getProductImage]);

    // Timer for Daily Deals
    useEffect(() => {
        const fetchDealEndTime = async () => {
            try {
                const response = await axios.get(`${API}/api/deals/end-time`).catch(() => ({ data: null }));
                if (response.data && response.data.endTime) {
                    const endTime = new Date(response.data.endTime);
                    const updateTimer = () => {
                        const now = new Date();
                        const diff = endTime - now;
                        if (diff <= 0) {
                            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                            return;
                        }
                        setTimeLeft({
                            hours: Math.floor(diff / (1000 * 60 * 60)),
                            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                            seconds: Math.floor((diff % (1000 * 60)) / 1000)
                        });
                    };
                    updateTimer();
                    timerIntervalRef.current = setInterval(updateTimer, 1000);
                }
            } catch (error) {
                console.error('Error fetching deal end time:', error);
            }
        };
        fetchDealEndTime();
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [API]);

    // Auto Sliders
    useEffect(() => {
        if (!autoPlay || homeTopBanners.length <= 1) return;
        sliderIntervalRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
        }, 5000);
        return () => {
            if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
        };
    }, [autoPlay, homeTopBanners.length]);

    useEffect(() => {
        if (!midAutoPlay || homeMiddleBanners.length <= 1) return;
        midSliderIntervalRef.current = setInterval(() => {
            setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
        }, 5000);
        return () => {
            if (midSliderIntervalRef.current) clearInterval(midSliderIntervalRef.current);
        };
    }, [midAutoPlay, homeMiddleBanners.length]);

    // Scroll to top button
    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.pageYOffset > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Loading progress
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Slider Controls
    const nextSlide = () => {
        if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
        setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
        if (autoPlay) {
            sliderIntervalRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
            }, 5000);
        }
    };

    const prevSlide = () => {
        if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
        setCurrentSlide(prev => (prev - 1 + homeTopBanners.length) % homeTopBanners.length);
        if (autoPlay) {
            sliderIntervalRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
            }, 5000);
        }
    };

    const goToSlide = (index) => {
        if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
        setCurrentSlide(index);
        if (autoPlay) {
            sliderIntervalRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
            }, 5000);
        }
    };

    const nextMidSlide = () => {
        if (midSliderIntervalRef.current) clearInterval(midSliderIntervalRef.current);
        setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
        if (midAutoPlay) {
            midSliderIntervalRef.current = setInterval(() => {
                setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
            }, 5000);
        }
    };

    const prevMidSlide = () => {
        if (midSliderIntervalRef.current) clearInterval(midSliderIntervalRef.current);
        setMidCurrentSlide(prev => (prev - 1 + homeMiddleBanners.length) % homeMiddleBanners.length);
        if (midAutoPlay) {
            midSliderIntervalRef.current = setInterval(() => {
                setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
            }, 5000);
        }
    };

    const goToMidSlide = (index) => {
        if (midSliderIntervalRef.current) clearInterval(midSliderIntervalRef.current);
        setMidCurrentSlide(index);
        if (midAutoPlay) {
            midSliderIntervalRef.current = setInterval(() => {
                setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
            }, 5000);
        }
    };

    const toggleAutoPlay = () => {
        setAutoPlay(prev => !prev);
        if (autoPlay && sliderIntervalRef.current) {
            clearInterval(sliderIntervalRef.current);
        } else if (!autoPlay) {
            sliderIntervalRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
            }, 5000);
        }
    };

    const toggleMidAutoPlay = () => {
        setMidAutoPlay(prev => !prev);
        if (midAutoPlay && midSliderIntervalRef.current) {
            clearInterval(midSliderIntervalRef.current);
        } else if (!midAutoPlay) {
            midSliderIntervalRef.current = setInterval(() => {
                setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
            }, 5000);
        }
    };

    // Cart Functions
    const handleAddToCart = async (product) => {
        if (product.stock <= 0) {
            showNotification("Out of stock!", "error");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                showNotification("Please login first", "error");
                navigate('/login');
                return;
            }
            const priceInfo = getDisplayPrice(product);
            await axios.post(`${API}/api/cart/add`, {
                product_id: product.id,
                quantity: 1,
                price: priceInfo.hasDiscount ? priceInfo.discountPrice : priceInfo.originalPrice
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Added to cart!', 'success');
            setCart(prev => [...prev, product]);
        } catch (error) {
            showNotification(error.response?.data?.message || "Error adding to cart", "error");
        }
    };

    const handleWishlist = (product) => {
        const exists = wishlist.some(item => item.id === product.id);
        if (exists) {
            setWishlist(wishlist.filter(item => item.id !== product.id));
            showNotification('Removed from wishlist', 'info');
        } else {
            setWishlist([...wishlist, product]);
            showNotification('Added to wishlist', 'success');
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const openQuickView = (product) => {
        setQuickViewProduct(product);
        setShowQuickView(true);
        document.body.style.overflow = 'hidden';
    };

    const closeQuickView = () => {
        setShowQuickView(false);
        setQuickViewProduct(null);
        document.body.style.overflow = 'auto';
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatTime = (time) => String(time).padStart(2, '0');

    const toggleShowAllCategories = () => setShowAllCategories(!showAllCategories);

    const handleBannerClick = async (banner) => {
        try {
            if (banner.id && !banner.id.toString().includes('banner-')) {
                await axios.post(`${API}/api/banners/track-click`, { bannerId: banner.id });
            }
            navigate(banner.redirect_url || banner.link || '/shop');
        } catch (error) {
            console.log('Banner click tracking error:', error);
            navigate(banner.redirect_url || banner.link || '/shop');
        }
    };

    const handleNewsletterSubscribe = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (email) {
            try {
                await axios.post(`${API}/api/newsletter/subscribe`, { email });
                showNotification('Subscribed successfully!', 'success');
                e.target.reset();
            } catch (error) {
                showNotification('Subscription failed', 'error');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <div className="loading-progress-bar">
                    <div className="loading-progress" style={{ width: `${progress}%` }}></div>
                </div>
                <p>Loading fashion destination... {progress}%</p>
            </div>
        );
    }

    return (
        <>
            <Header cart={cart} wishlist={wishlist} />

            <main className="home-main">
                {/* Notification */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(null)}>×</button>
                    </div>
                )}

                {/* Hero Banner Section */}
                {homeTopBanners.length > 0 && (
                    <section className="hero-banner-section">
                        <div className="banner-slider">
                            <button className="slider-nav prev" onClick={prevSlide} aria-label="Previous slide">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                                </svg>
                            </button>

                            <div className="slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {homeTopBanners.map((banner, idx) => (
                                    <div key={banner.id || idx} className="banner-slide">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            onClick={() => handleBannerClick(banner)}
                                        />
                                        <div className="banner-content">
                                            {banner.discount_tag && (
                                                <span className="discount-badge">{banner.discount_tag}</span>
                                            )}
                                            <h1>{banner.title}</h1>
                                            <p>{banner.description || banner.subtitle || 'Discover amazing fashion deals'}</p>
                                            <button onClick={() => handleBannerClick(banner)}>
                                                {banner.buttonText || 'Shop Now'} →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="slider-nav next" onClick={nextSlide} aria-label="Next slide">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                            </button>

                            <div className="slider-controls">
                                <div className="slider-dots">
                                    {homeTopBanners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`dot ${idx === currentSlide ? 'active' : ''}`}
                                            onClick={() => goToSlide(idx)}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                                <div className="slider-info">
                                    <span className="slide-counter">{currentSlide + 1} / {homeTopBanners.length}</span>
                                    <button className="auto-play-toggle" onClick={toggleAutoPlay}>
                                        {autoPlay ? '⏸ Pause' : '▶ Play'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Quick Categories */}
                {quickSubCategories.length > 0 && (
                    <section className="quick-categories-section">
                        <div className="section-header">
                            <h2>Shop by Sub Category</h2>
                            <p>Discover your style</p>
                        </div>
                        <div className="categories-scroll">
                            {quickSubCategories.map((cat, idx) => (
                                <div
                                    key={cat.id}
                                    className="category-card"
                                    onClick={() => navigate(`/subcategory/${cat.slug || cat.id}`)}
                                    onMouseEnter={() => setActiveHoverCard(cat.id)}
                                    onMouseLeave={() => setActiveHoverCard(null)}
                                >
                                    <div className="category-image">
                                        <img src={cat.image_url} alt={cat.name} />
                                        {activeHoverCard === cat.id && <div className="category-overlay">Explore</div>}
                                    </div>
                                    <h3>{cat.name}</h3>
                                    <p className="category-count">{getProductsByCategory('sub', cat.id).length} products</p>
                                </div>
                            ))}
                            <div className="category-card view-all-card" onClick={() => navigate('/categories')}>
                                <div className="category-image view-all-image">
                                    <div className="view-all-icon">+</div>
                                </div>
                                <h3>View All</h3>
                                <p className="category-count">Explore all categories</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Daily Deals with Timer */}
                {dailyDeals.length > 0 && (
                    <section className="daily-deals-section">
                        <div className="section-header">
                            <div>
                                <h2>🔥 Daily Deals</h2>
                                <p>Limited time offers</p>
                            </div>
                            {timeLeft.hours > 0 && (
                                <div className="timer">
                                    <div className="time-unit">
                                        <span>{formatTime(timeLeft.hours)}</span>
                                        <small>HOURS</small>
                                    </div>
                                    <span>:</span>
                                    <div className="time-unit">
                                        <span>{formatTime(timeLeft.minutes)}</span>
                                        <small>MINS</small>
                                    </div>
                                    <span>:</span>
                                    <div className="time-unit">
                                        <span>{formatTime(timeLeft.seconds)}</span>
                                        <small>SECS</small>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="products-grid">
                            {dailyDeals.map(product => {
                                const priceInfo = getDisplayPrice(product);
                                return (
                                    <div key={product.id} className="product-card deal-card">
                                        <div className="product-badge">-{priceInfo.discountPercentage}% OFF</div>
                                        <div className="product-image">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                            />
                                            <div className="product-actions">
                                                <button onClick={() => handleWishlist(product)} className="wishlist-btn">
                                                    {wishlist.some(i => i.id === product.id) ? '❤️' : '🤍'}
                                                </button>
                                                <button onClick={() => openQuickView(product)} className="quickview-btn">
                                                    👁️
                                                </button>
                                            </div>
                                        </div>
                                        <div className="product-info">
                                            <h3>{product.name}</h3>
                                            <div className="price">
                                                <span className="current">{priceInfo.formattedDiscountPrice}</span>
                                                <span className="original">{priceInfo.formattedOriginalPrice}</span>
                                            </div>
                                            <div className="rating">★ {product.rating}</div>
                                            <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Middle Banner */}
                {homeMiddleBanners.length > 0 && (
                    <section className="mid-banner-section">
                        <div className="mid-banner-slider">
                            <button className="mid-nav prev" onClick={prevMidSlide} aria-label="Previous slide">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                                </svg>
                            </button>

                            <div className="mid-slider-track" style={{ transform: `translateX(-${midCurrentSlide * 100}%)` }}>
                                {homeMiddleBanners.map((banner, idx) => (
                                    <div key={banner.id || idx} className="mid-banner-slide">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            onClick={() => handleBannerClick(banner)}
                                        />
                                        <div className="mid-banner-content">
                                            {banner.discount_tag && <span className="discount-badge">{banner.discount_tag}</span>}
                                            <h2>{banner.title}</h2>
                                            <p>{banner.description || banner.subtitle}</p>
                                            <button onClick={() => handleBannerClick(banner)}>
                                                Shop Now →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="mid-nav next" onClick={nextMidSlide} aria-label="Next slide">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                            </button>

                            <div className="slider-controls">
                                <div className="slider-dots">
                                    {homeMiddleBanners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`dot ${idx === midCurrentSlide ? 'active' : ''}`}
                                            onClick={() => goToMidSlide(idx)}
                                        />
                                    ))}
                                </div>
                                <div className="slider-info">
                                    <span>{midCurrentSlide + 1} / {homeMiddleBanners.length}</span>
                                    <button onClick={toggleMidAutoPlay}>
                                        {midAutoPlay ? '⏸' : '▶'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Categories */}
                {featuredCategories.length > 0 && (
                    <section className="featured-section">
                        <div className="section-header">
                            <h2>Featured Collections</h2>
                            <p>Curated just for you</p>
                        </div>
                        <div className="featured-grid">
                            {featuredCategories.slice(0, 3).map(category => (
                                <div
                                    key={category.id}
                                    className="featured-card"
                                    onClick={() => navigate(`/category/${category.slug || category.id}`)}
                                >
                                    <img src={category.image} alt={category.name} />
                                    <div className="featured-content">
                                        <h3>{category.name}</h3>
                                        <p>{category.description || `Explore ${category.name} collection`}</p>
                                        <span>Discover →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Products */}
                {trendingProducts.length > 0 && (
                    <section className="trending-section">
                        <div className="section-header">
                            <h2>Trending Now 🔥</h2>
                            <p>Most popular this week</p>
                            <button className="view-all" onClick={() => navigate('/trending')}>View All →</button>
                        </div>
                        <div className="products-grid">
                            {trendingProducts.map(product => {
                                const priceInfo = getDisplayPrice(product);
                                return (
                                    <div key={product.id} className="product-card">
                                        <div className="product-image">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                            />
                                            {product.isNew && <span className="new-badge">New</span>}
                                            {priceInfo.hasDiscount && <span className="discount-badge">-{priceInfo.discountPercentage}%</span>}
                                            <div className="product-hover">
                                                <button onClick={() => openQuickView(product)}>Quick View</button>
                                                <button onClick={() => handleWishlist(product)}>
                                                    {wishlist.some(i => i.id === product.id) ? '❤️' : '🤍'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="product-info">
                                            <h3>{product.name}</h3>
                                            <div className="price">
                                                {priceInfo.hasDiscount ? (
                                                    <>
                                                        <span className="current">{priceInfo.formattedDiscountPrice}</span>
                                                        <span className="original">{priceInfo.formattedOriginalPrice}</span>
                                                    </>
                                                ) : (
                                                    <span className="current">{priceInfo.formattedOriginalPrice}</span>
                                                )}
                                            </div>
                                            <div className="rating">★ {product.rating}</div>
                                            <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Categories Section */}
                {mainCategories.length > 0 && (
                    <section className="categories-section">
                        <div className="section-header">
                            <h2>All Categories</h2>
                            <p>Browse our exclusive clothing collections</p>
                            <button className="toggle-categories-btn" onClick={toggleShowAllCategories}>
                                {showAllCategories ? 'Show Less' : 'Show All'}
                            </button>
                        </div>
                        <div className="categories-grid">
                            {mainCategories.slice(0, showAllCategories ? mainCategories.length : 8).map(category => (
                                <div
                                    key={category.id}
                                    className="category-card-large"
                                    onClick={() => navigate(`/category/${category.slug || category.id}`)}
                                >
                                    <div className="category-image-container">
                                        <img src={category.image} alt={category.name} />
                                        <div className="category-overlay-large">
                                            <span>Shop Now</span>
                                        </div>
                                    </div>
                                    <h3>{category.name}</h3>
                                    <p>{getProductsByCategory('main', category.id).length} products</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Category-wise Product Sections */}
                {mainCategories.slice(0, 4).map(category => {
                    const categoryProducts = getProductsByCategory('main', category.id, 4);
                    if (categoryProducts.length === 0) return null;

                    return (
                        <section key={category.id} className="category-products-section">
                            <div className="section-header">
                                <div>
                                    <h2>{category.name}</h2>
                                    <p>Best sellers in {category.name}</p>
                                </div>
                                <button className="view-all" onClick={() => navigate(`/category/${category.slug || category.id}`)}>
                                    View All →
                                </button>
                            </div>
                            <div className="products-grid">
                                {categoryProducts.map(product => {
                                    const priceInfo = getDisplayPrice(product);
                                    return (
                                        <div key={product.id} className="product-card">
                                            <div className="product-image">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                                />
                                                <div className="product-hover">
                                                    <button onClick={() => openQuickView(product)}>Quick View</button>
                                                    <button onClick={() => handleWishlist(product)}>
                                                        {wishlist.some(i => i.id === product.id) ? '❤️' : '🤍'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="product-info">
                                                <h3>{product.name}</h3>
                                                <div className="price">
                                                    {priceInfo.hasDiscount ? (
                                                        <>
                                                            <span className="current">{priceInfo.formattedDiscountPrice}</span>
                                                            <span className="original">{priceInfo.formattedOriginalPrice}</span>
                                                        </>
                                                    ) : (
                                                        <span className="current">{priceInfo.formattedOriginalPrice}</span>
                                                    )}
                                                </div>
                                                <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}

                {/* Newsletter Section */}
                <section className="newsletter-section">
                    <div className="newsletter-content">
                        <h2>Stay in Style</h2>
                        <p>Subscribe for exclusive offers and fashion inspiration</p>
                        <form onSubmit={handleNewsletterSubscribe}>
                            <input type="email" name="email" placeholder="Enter your email" required />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>

            {/* Quick View Modal */}
            {showQuickView && quickViewProduct && (
                <div className="quickview-modal" onClick={closeQuickView}>
                    <div className="quickview-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={closeQuickView}>×</button>
                        <div className="quickview-grid">
                            <div className="quickview-image">
                                <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                            </div>
                            <div className="quickview-details">
                                <h2>{quickViewProduct.name}</h2>
                                {(() => {
                                    const priceInfo = getDisplayPrice(quickViewProduct);
                                    return (
                                        <div className="quickview-price">
                                            {priceInfo.hasDiscount ? (
                                                <>
                                                    <span className="current">{priceInfo.formattedDiscountPrice}</span>
                                                    <span className="original">{priceInfo.formattedOriginalPrice}</span>
                                                    <span className="discount">-{priceInfo.discountPercentage}%</span>
                                                </>
                                            ) : (
                                                <span className="current">{priceInfo.formattedOriginalPrice}</span>
                                            )}
                                        </div>
                                    );
                                })()}
                                <p className="quickview-description">{quickViewProduct.description || 'No description available'}</p>
                                <div className="quickview-actions">
                                    <button className="add-to-cart-btn" onClick={() => {
                                        handleAddToCart(quickViewProduct);
                                        closeQuickView();
                                    }}>
                                        Add to Cart
                                    </button>
                                    <button className="view-details-btn" onClick={() => {
                                        navigate(`/product/${quickViewProduct.id}`);
                                        closeQuickView();
                                    }}>
                                        View Details
                                    </button>
                                    <button className="wishlist-btn" onClick={() => handleWishlist(quickViewProduct)}>
                                        {wishlist.some(i => i.id === quickViewProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scroll to Top */}
            {showScrollTop && (
                <button className="scroll-top" onClick={scrollToTop}>
                    ↑
                </button>
            )}

            <Footer />
            <ChatBot isPremium={true} />
        </>
    );
};

export default Home;