//------------Home.jsx ---------------

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

// Enhanced Women's Fashion Categories with better images
const getCategoryImage = (category) => {
    const images = {
        sarees: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=600&auto=format&fit=crop&q=80',
        dresses: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
        kurtas: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80',
        lehengas: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
        suits: 'https://images.unsplash.com/photo-1583496661160-fb5886a13c43?w=600&auto=format&fit=crop&q=80',
        ethnicwear: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&auto=format&fit=crop&q=80',
        westernwear: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
        winterwear: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80',
        accessories: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80',
        jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ad5e5?w=600&auto=format&fit=crop&q=80',
        handbags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
        footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        lingerie: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=600&auto=format&fit=crop&q=80',
        activewear: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&auto=format&fit=crop&q=80',
        maternity: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&auto=format&fit=crop&q=80',
        plussize: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80',
        general: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80'
    };
    return images[category?.toLowerCase()] || images.general;
};

// Category name to ID map
const getCategoryId = (category) => {
    const map = {
        sarees: 1,
        dresses: 2,
        kurtas: 3,
        lehengas: 4,
        suits: 5,
        ethnicwear: 6,
        westernwear: 7,
        winterwear: 8,
        accessories: 9,
        jewelry: 10,
        handbags: 11,
        footwear: 12,
        lingerie: 13,
        activewear: 14,
        maternity: 15,
        plussize: 16
    };
    return map[category?.toLowerCase()] || 0;
};

const getFallbackProductImage = getCategoryImage;

// Enhanced Slider Items with Category Integration
const sliderItems = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80',
        title: 'Summer Collection 2024',
        subtitle: 'Fresh styles for the modern woman',
        link: '/category/dresses',
        buttonText: 'Shop Now',
        theme: 'summer',
        discount: '40% OFF',
        category: 'dresses'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
        title: 'Ethnic Elegance',
        subtitle: 'Traditional wear for special occasions',
        link: '/category/ethnicwear',
        buttonText: 'Explore',
        theme: 'ethnic',
        discount: '35% OFF',
        category: 'ethnicwear'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&auto=format&fit=crop&q=80',
        title: 'Winter Fashion',
        subtitle: 'Stay warm and stylish',
        link: '/category/winterwear',
        buttonText: 'Discover',
        theme: 'winter',
        discount: '30% OFF',
        category: 'winterwear'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=1200&auto=format&fit=crop&q=80',
        title: 'Festive Special',
        subtitle: 'Sparkle this festive season',
        link: '/category/sarees',
        buttonText: 'View Collection',
        theme: 'festive',
        discount: '25% OFF',
        category: 'sarees'
    }
];

// Category-wise product sections
const featuredCategories = [
    {
        name: 'sarees',
        title: 'Traditional Sarees',
        description: 'Elegant sarees for every occasion',
        viewAllLink: '/category/sarees'
    },
    {
        name: 'dresses',
        title: 'Western Dresses',
        description: 'Trendy dresses for modern women',
        viewAllLink: '/category/dresses'
    },
    {
        name: 'kurtas',
        title: 'Designer Kurtas',
        description: 'Comfortable and stylish kurtas',
        viewAllLink: '/category/kurtas'
    },
    {
        name: 'lehengas',
        title: 'Bridal Lehengas',
        description: 'Stunning lehengas for special events',
        viewAllLink: '/category/lehengas'
    }
];

const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000-5000', label: '₹2000 - ₹5000' },
    { value: '5000+', label: 'Over ₹5000' }
];

const predefinedCategories = [
    'sarees', 'dresses', 'kurtas', 'lehengas', 'suits',
    'ethnicwear', 'westernwear', 'winterwear', 'accessories',
    'jewelry', 'handbags', 'footwear', 'lingerie', 'activewear',
    'maternity', 'plussize'
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [categories, setCategories] = useState(predefinedCategories);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [activePriceFilter, setActivePriceFilter] = useState("all");
    const [sortOption, setSortOption] = useState("featured");
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState(8);
    const [cart, setCart] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    // Scroll functionality states
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

    // Refs for scroll containers
    const categoriesScrollRef = useRef(null);
    const trendingScrollRef = useRef(null);
    const quickCategoriesScrollRef = useRef(null);

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const getProductImage = useCallback((product) => {
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || firstImage.imageUrl || '';
            if (imageUrl.startsWith("http")) return imageUrl;
            if (imageUrl.startsWith("/")) return `${API}${imageUrl}`;
        }
        if (product.image) {
            const imageUrl = typeof product.image === 'string' ? product.image : product.image.url || product.image.imageUrl || '';
            if (imageUrl.startsWith("http")) return imageUrl;
            if (imageUrl.startsWith("/")) return `${API}${imageUrl}`;
        }
        return getFallbackProductImage(product.category);
    }, [API]);

    // ✅ FIXED: Correct Discount Calculation with Decimal Support
    const calculateDiscountPercentage = useCallback((product) => {
        const originalPrice = Number(product.price) || 0;

        // ✅ CORRECT: Backend me 'discountPrice' field hai, 'discount_price' nahi
        const discountPrice = Number(product.discountPrice) || 0;

        console.log(`🔍 Discount Check - ${product.name}:`, {
            originalPrice,
            discountPrice,
            hasValidDiscount: discountPrice > 0 && discountPrice < originalPrice
        });

        // Only calculate discount if discountPrice is valid and less than original price
        if (discountPrice > 0 && discountPrice < originalPrice) {
            // ✅ FIXED: Use toFixed(1) for one decimal place instead of Math.round()
            const percentage = ((originalPrice - discountPrice) / originalPrice) * 100;
            const roundedPercentage = parseFloat(percentage.toFixed(1)); // 33.33% instead of 33%

            console.log(`✅ Valid discount: ${roundedPercentage}% for ${product.name}`);
            return roundedPercentage;
        }

        console.log(`❌ No valid discount for ${product.name}`);
        return 0;
    }, []);

    // ✅ FIXED: Get Display Price with Correct Backend Field Names
    const getDisplayPrice = useCallback((product) => {
        const originalPrice = Number(product.price) || 0;

        // ✅ CORRECT: Backend me 'discountPrice' field hai
        const discountPrice = Number(product.discountPrice) || 0;
        const discountPercentage = calculateDiscountPercentage(product);

        const hasValidDiscount = discountPercentage > 0;

        console.log(`💰 ${product.name}:`, {
            originalPrice,
            discountPrice,
            discountPercentage,
            hasValidDiscount,
            finalPrice: hasValidDiscount ? discountPrice : originalPrice
        });

        return {
            originalPrice,
            discountPrice: hasValidDiscount ? discountPrice : originalPrice,
            discountPercentage,
            hasDiscount: hasValidDiscount
        };
    }, [calculateDiscountPercentage]);

    // ✅ FIXED: Product Data Sanitization with Correct Backend Fields
    const sanitizeProductData = useCallback((products) => {
        return products.map((product, index) => {
            const originalPrice = Number(product.price) || 0;

            // ✅ CORRECT: Backend me 'discountPrice' field hai
            const discountPrice = Number(product.discountPrice) || 0;

            // Use only database discount, don't add automatic discounts
            const discountPercentage = calculateDiscountPercentage(product);

            console.log(`🔄 Sanitizing ${product.name}:`, {
                dbPrice: originalPrice,
                dbDiscountPrice: discountPrice,
                calculatedDiscount: discountPercentage
            });

            return {
                id: product.id || product._id || `api-${index}`,
                name: product.name || "No Name",
                stock: Number(product.stock) || 0,
                price: originalPrice,
                discountPrice: discountPrice, // ✅ Keep original discountPrice from database
                category: (product.category || "general").toLowerCase(),
                rating: product.rating || 0,
                discount: discountPercentage, // Only calculated percentage for display
                image: getProductImage(product),
                images: product.images || [],
                createdAt: product.created_at || product.createdAt || new Date().toISOString(),
                isNew: product.isNew || false,
                pattern: product.pattern || '',
                description: product.description || 'No description available',
                sizes: product.sizes || ['S', 'M', 'L', 'XL'],
                colors: product.colors || ['Black', 'White', 'Red', 'Blue'],
                hasDiscount: discountPercentage > 0 // Only true if valid discount from database
            };
        });
    }, [calculateDiscountPercentage, getProductImage]);

    // ✅ FIXED: Fetch Products with Proper Discount Handling
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                console.log('🔄 Fetching products from:', `${API}/api/products`);

                const response = await axios.get(`${API}/api/products`);
                console.log('📦 API Response received:', response.data);

                if (Array.isArray(response.data)) {
                    // Sanitize product data without adding automatic discounts
                    const sanitized = sanitizeProductData(response.data);

                    console.log('🎯 Final Products with Discounts:', sanitized.map(p => ({
                        name: p.name,
                        price: p.price,
                        discountPrice: p.discountPrice,
                        discount: p.discount,
                        hasDiscount: p.hasDiscount
                    })));

                    setProducts(sanitized);

                    const productCategories = [...new Set(sanitized.map(p => p.category))];
                    setCategories([...new Set([...predefinedCategories, ...productCategories])]);
                } else {
                    console.error('❌ API response is not an array:', response.data);
                    throw new Error('Invalid API response format');
                }
            } catch (err) {
                console.error('❌ Error fetching products:', err);

                // Fallback demo products with proper discount structure matching backend fields
                const demoProducts = [
                    {
                        id: 'demo-1',
                        name: 'Floral Print Maxi Dress',
                        stock: 10,
                        price: 1999,
                        discountPrice: 1499, // ✅ CORRECT: discountPrice field
                        category: 'dresses',
                        rating: 4.5,
                        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80',
                        isNew: true
                    },
                    {
                        id: 'demo-2',
                        name: 'Silk Banarasi Saree',
                        stock: 5,
                        price: 3500,
                        discountPrice: 3500, // No discount (same as price)
                        category: 'sarees',
                        rating: 4.8,
                        image: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-3',
                        name: 'Designer Anarkali Kurta',
                        stock: 15,
                        price: 1200,
                        discountPrice: 999, // ✅ Valid discount
                        category: 'kurtas',
                        rating: 4.2,
                        image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-4',
                        name: 'Bridal Lehenga Set',
                        stock: 3,
                        price: 8999,
                        discountPrice: 6999, // ✅ Valid discount
                        category: 'lehengas',
                        rating: 4.9,
                        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-5',
                        name: 'Designer Suit Set',
                        stock: 8,
                        price: 2500,
                        discountPrice: 2500, // No discount
                        category: 'suits',
                        rating: 4.3,
                        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13c43?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-6',
                        name: 'Winter Jacket',
                        stock: 12,
                        price: 3500,
                        discountPrice: 2999, // ✅ Valid discount
                        category: 'winterwear',
                        rating: 4.4,
                        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop&q=80'
                    }
                ];

                const sanitizedDemo = sanitizeProductData(demoProducts);
                console.log('🔄 Using demo products:', sanitizedDemo);

                setProducts(sanitizedDemo);
                setCategories(predefinedCategories);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [API, sanitizeProductData]);

    // Scroll Functions
    const scrollCategories = (direction) => {
        if (categoriesScrollRef.current) {
            const container = categoriesScrollRef.current;
            const scrollAmount = 400;

            if (direction === 'left') {
                container.scrollLeft -= scrollAmount;
            } else {
                container.scrollLeft += scrollAmount;
            }
        }
    };

    const scrollTrending = (direction) => {
        if (trendingScrollRef.current) {
            const container = trendingScrollRef.current;
            const scrollAmount = 400;

            if (direction === 'left') {
                container.scrollLeft -= scrollAmount;
            } else {
                container.scrollLeft += scrollAmount;
            }
        }
    };

    const scrollQuickCategories = (direction) => {
        if (quickCategoriesScrollRef.current) {
            const container = quickCategoriesScrollRef.current;
            const scrollAmount = 200;

            if (direction === 'left') {
                container.scrollLeft -= scrollAmount;
            } else {
                container.scrollLeft += scrollAmount;
            }
        }
    };

    // Check scroll position
    const checkScrollPosition = (containerRef, setLeftVisible, setRightVisible) => {
        if (containerRef.current) {
            const container = containerRef.current;
            setLeftVisible(container.scrollLeft > 0);
            setRightVisible(container.scrollLeft < (container.scrollWidth - container.clientWidth));
        }
    };

    // Add scroll event listeners
    useEffect(() => {
        const categoriesContainer = categoriesScrollRef.current;
        const trendingContainer = trendingScrollRef.current;
        const quickCategoriesContainer = quickCategoriesScrollRef.current;

        const handleCategoriesScroll = () => {
            checkScrollPosition(categoriesScrollRef, setShowLeftScroll, setShowRightScroll);
        };

        if (categoriesContainer) {
            categoriesContainer.addEventListener('scroll', handleCategoriesScroll);
        }

        return () => {
            if (categoriesContainer) {
                categoriesContainer.removeEventListener('scroll', handleCategoriesScroll);
            }
        };
    }, []);

    useEffect(() => {
        const totalImages = products.length + sliderItems.length + categories.length;
        if (!totalImages) return;
        let loaded = 0;
        const onLoad = () => {
            loaded++;
            setProgress(Math.round((loaded / totalImages) * 100));
            if (loaded >= totalImages) setImagesLoaded(true);
        };

        categories.forEach(cat => {
            const img = new Image();
            img.src = getCategoryImage(cat);
            img.onload = onLoad;
            img.onerror = onLoad;
        });

        products.forEach(prod => {
            const img = new Image();
            img.src = getProductImage(prod);
            img.onload = onLoad;
            img.onerror = () => {
                img.src = getFallbackProductImage(prod.category);
                onLoad();
            };
        });

        sliderItems.forEach(item => {
            const img = new Image();
            img.src = item.image;
            img.onload = onLoad;
            img.onerror = onLoad;
        });
    }, [products, categories, getProductImage]);

    useEffect(() => {
        if (!imagesLoaded) return;
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [imagesLoaded]);

    useEffect(() => {
        if (!autoPlay || isLoading) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, isLoading]);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % sliderItems.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length);
    const goToSlide = (index) => setCurrentSlide(index);
    const toggleAutoPlay = () => setAutoPlay(prev => !prev);
    const navigateTo = (path) => navigate(path);

    // ✅ FIXED: Handle Add to Cart with Proper Price Logic
    const handleAddToCart = async (product) => {
        if (product.stock <= 0) {
            alert("This product is out of stock!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login first");
                navigate('/login');
                return;
            }

            // Use the display price logic to get correct final price
            const priceInfo = getDisplayPrice(product);
            const finalPrice = priceInfo.hasDiscount ? priceInfo.discountPrice : priceInfo.originalPrice;

            console.log('🛒 Adding to cart:', {
                product: product.name,
                finalPrice,
                hasDiscount: priceInfo.hasDiscount
            });

            const payload = {
                product_id: product.id,
                quantity: 1,
                price: finalPrice
            };

            const response = await axios.post(`${API}/api/cart/add`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            alert('Product added to cart successfully!');
            setCart(prev => [...prev, product]);
        } catch (error) {
            console.error('❌ Cart error:', error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const openQuickView = (product) => {
        setQuickViewProduct(product);
        setShowQuickView(true);
    };

    const closeQuickView = () => {
        setShowQuickView(false);
        setQuickViewProduct(null);
    };

    const filterByPrice = (priceRange) => setActivePriceFilter(priceRange);
    const sortProducts = (option) => setSortOption(option);
    const filterByCategory = (category) => setActiveCategory(category);

    // ✅ FIXED: Filter Products with Proper Discount Sorting
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Category filter
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        // Pattern filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(p => p.pattern === activeFilter);
        }

        // Price filter
        if (activePriceFilter !== 'all') {
            if (activePriceFilter === '0-500') filtered = filtered.filter(p => p.price < 500);
            else if (activePriceFilter === '500-1000') filtered = filtered.filter(p => p.price >= 500 && p.price < 1000);
            else if (activePriceFilter === '1000-2000') filtered = filtered.filter(p => p.price >= 1000 && p.price < 2000);
            else if (activePriceFilter === '2000-5000') filtered = filtered.filter(p => p.price >= 2000 && p.price < 5000);
            else if (activePriceFilter === '5000+') filtered = filtered.filter(p => p.price >= 5000);
        }

        // Sorting
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
                filtered.sort((a, b) => {
                    const discountA = calculateDiscountPercentage(a);
                    const discountB = calculateDiscountPercentage(b);
                    return discountB - discountA;
                });
                break;
            default:
                break;
        }

        return filtered;
    };

    const getProductsByCategory = (category, limit = 4) => {
        return products
            .filter(product => product.category === category)
            .slice(0, limit);
    };

    const toggleFilters = () => setShowFilters(!showFilters);
    const showMoreCategories = () => setVisibleCategories(categories.length);

    if (isLoading) return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1 className="brand-name">Pankhudi</h1>
                <div className="loading-spinner"></div>
                <div className="loading-progress-bar">
                    <div className="loading-progress" style={{ width: `${progress}%` }} />
                </div>
                <p>Loading your fashion world... {progress}%</p>
                {progress < 100 && <p className="slow-internet-warning">Loading images... This may take longer on slow connections.</p>}
            </div>
        </div>
    );

    return (
        <>
            <Header cart={cart} />
            <main className="home-main">
                {/* Enhanced Hero Section */}
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
                                            <span className="slide-discount-badge">{item.discount}</span>
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

                {/* Scrollable Quick Categories */}
                <section className="quick-categories">
                    <button
                        className={`scroll-btn left ${!showLeftScroll ? 'hidden' : ''}`}
                        onClick={() => scrollQuickCategories('left')}
                        aria-label="Scroll left"
                    >
                        ‹
                    </button>

                    <div
                        className="quick-categories-container"
                        ref={quickCategoriesScrollRef}
                    >
                        {categories.slice(0, 8).map((category, index) => (
                            <div
                                key={index}
                                className="quick-category-item"
                                onClick={() => navigate(`/category/${getCategoryId(category)}`)}
                            >
                                <div className="quick-category-icon">
                                    <img src={getCategoryImage(category)} alt={category} />
                                </div>
                                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        className="scroll-btn right"
                        onClick={() => scrollQuickCategories('right')}
                        aria-label="Scroll right"
                    >
                        ›
                    </button>
                </section>

                {/* Scrollable Categories Section */}
                <section className="categories-section">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Discover our exclusive women's fashion collections</p>
                    </div>

                    <div className="categories-container">
                        <button
                            className={`scroll-btn left ${!showLeftScroll ? 'hidden' : ''}`}
                            onClick={() => scrollCategories('left')}
                            aria-label="Scroll categories left"
                        >
                            ‹
                        </button>

                        <div
                            className="categories-scroll-container"
                            ref={categoriesScrollRef}
                        >
                            <div className="categories-grid">
                                {categories.slice(0, visibleCategories).map((category, index) => (
                                    <div
                                        key={index}
                                        className="category-card"
                                        onClick={() => navigate(`/category/${getCategoryId(category)}`)}
                                    >
                                        <div className="category-image-container">
                                            <img
                                                src={getCategoryImage(category)}
                                                alt={category}
                                                loading="lazy"
                                                className="category-image"
                                                onError={(e) => {
                                                    e.target.src = getCategoryImage("general");
                                                }}
                                            />
                                            <div className="category-overlay">
                                                <span className="shop-now-text">Shop Now</span>
                                            </div>
                                        </div>
                                        <h3 className="category-title">
                                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="scroll-btn right"
                            onClick={() => scrollCategories('right')}
                            aria-label="Scroll categories right"
                        >
                            ›
                        </button>
                    </div>

                    {visibleCategories < categories.length && (
                        <div className="show-more-container">
                            <button className="show-more-btn" onClick={showMoreCategories}>
                                Show All Categories
                            </button>
                        </div>
                    )}
                </section>

                {/* Category-wise Product Sections */}
                {featuredCategories.map(featuredCategory => {
                    const categoryProducts = getProductsByCategory(featuredCategory.name, 4);
                    if (categoryProducts.length === 0) return null;

                    return (
                        <section key={featuredCategory.name} className="category-section">
                            <div className="section-header">
                                <div className="category-header-info">
                                    <h2>{featuredCategory.title}</h2>
                                    <p>{featuredCategory.description}</p>
                                </div>
                                <button
                                    className="view-all square-btn"
                                    onClick={() => navigateTo(featuredCategory.viewAllLink)}
                                >
                                    View All
                                </button>
                            </div>
                            <div className="category-products-grid">
                                {categoryProducts.map((product, index) => {
                                    const priceInfo = getDisplayPrice(product);
                                    const isOutOfStock = product.stock <= 0;

                                    return (
                                        <div
                                            key={`${product.id}-${index}`}
                                            className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                                        >
                                            {product.isNew && <span className="new-badge">NEW</span>}
                                            {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 && (
                                                <span className="discount-badge">-{priceInfo.discountPercentage}%</span>
                                            )}

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

                                                {isOutOfStock && (
                                                    <div className="out-of-stock-overlay">
                                                        <span>Out of Stock</span>
                                                    </div>
                                                )}

                                                <button
                                                    className="quick-view"
                                                    onClick={() => openQuickView(product)}
                                                >
                                                    Quick View
                                                </button>
                                            </div>

                                            <div className="product-info">
                                                <h3>{product.name}</h3>
                                                <div className="price-container">
                                                    {priceInfo.hasDiscount ? (
                                                        <>
                                                            <span className="original-price">₹{priceInfo.originalPrice}</span>
                                                            <span className="current-price">₹{priceInfo.discountPrice}</span>
                                                        </>
                                                    ) : (
                                                        <span className="current-price">₹{priceInfo.originalPrice}</span>
                                                    )}
                                                </div>
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
                                                <button
                                                    className={`add-to-cart square-btn ${isOutOfStock ? "disabled" : ""}`}
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={isOutOfStock}
                                                >
                                                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}

                {/* Scrollable Trending Products */}
                <section className="trending-section">
                    <div className="section-header">
                        <h2>Trending Now 🔥</h2>
                        <button
                            className="view-all square-btn"
                            onClick={() => navigateTo('/trending')}
                        >
                            View All
                        </button>
                    </div>

                    <div className="trending-container">
                        <button
                            className="scroll-btn left"
                            onClick={() => scrollTrending('left')}
                            aria-label="Scroll trending left"
                        >
                            ‹
                        </button>

                        <div
                            className="trending-scroll-container"
                            ref={trendingScrollRef}
                        >
                            <div className="trending-grid">
                                {products
                                    .filter(p => p.rating >= 4)
                                    .slice(0, 8)
                                    .map((product, index) => {
                                        const priceInfo = getDisplayPrice(product);
                                        return (
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
                                                    {product.isNew && <span className="new-badge">NEW</span>}
                                                    {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 && (
                                                        <span className="discount-badge">-{priceInfo.discountPercentage}%</span>
                                                    )}
                                                    {product.stock <= 0 && (
                                                        <div className="out-of-stock-overlay">
                                                            <span>Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="trending-info">
                                                    <h3>{product.name}</h3>
                                                    <div className="trending-price">
                                                        {priceInfo.hasDiscount ? (
                                                            <>
                                                                <span className="original-price">₹{priceInfo.originalPrice}</span>
                                                                <span className="current-price">₹{priceInfo.discountPrice}</span>
                                                                <span className="discount-percent">-{priceInfo.discountPercentage}%</span>
                                                            </>
                                                        ) : (
                                                            <span className="current-price">₹{priceInfo.originalPrice}</span>
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
                                                        <span>({product.rating})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        <button
                            className="scroll-btn right"
                            onClick={() => scrollTrending('right')}
                            aria-label="Scroll trending right"
                        >
                            ›
                        </button>
                    </div>
                </section>

                {/* Special Offer Banner */}
                <section className="offer-banner">
                    <div className="offer-content">
                        <div className="offer-badge">Limited Time Offer</div>
                        <h3>Festive Season Special</h3>
                        <h2>Get 30% Off On All Ethnic Wear</h2>
                        <p>Use code: <strong>PANKHUDI30</strong></p>
                        <button
                            className="offer-button square-btn"
                            onClick={() => navigateTo('/ethnic-wear')}
                        >
                            Shop Now
                        </button>
                    </div>
                </section>

                {/* All Products Section */}
                <section className="featured-section">
                    <div className="section-header">
                        <h2>All Products</h2>
                        <div className="results-info">
                            <span>Showing {getFilteredProducts().length} of {products.length} products</span>
                            <button className="view-all square-btn" onClick={() => navigateTo("/products")}>
                                View All
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Filters */}
                    <div className="product-filters-section">
                        <div className="filters-header">
                            <h3>Filter & Sort</h3>
                            <button className="toggle-filters square-btn" onClick={toggleFilters}>
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>

                        <div className={`filters-container ${showFilters ? 'show' : ''}`}>
                            <div className="filter-group">
                                <h4>Categories</h4>
                                <div className="category-filters">
                                    <button
                                        className={`category-filter ${activeCategory === 'all' ? 'active' : ''}`}
                                        onClick={() => filterByCategory('all')}
                                    >
                                        All Categories
                                    </button>
                                    {categories.slice(0, 8).map(category => (
                                        <button
                                            key={category}
                                            className={`category-filter ${activeCategory === category ? 'active' : ''}`}
                                            onClick={() => filterByCategory(category)}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
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
                                            className={`price-filter square-btn ${activePriceFilter === range.value ? 'active' : ''}`}
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
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="products-grid">
                        {getFilteredProducts().map((product, index) => {
                            const priceInfo = getDisplayPrice(product);
                            const isOutOfStock = product.stock <= 0;

                            return (
                                <div
                                    key={`${product.id}-${index}`}
                                    className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                                    onMouseEnter={() => setHoveredProduct(product.id)}
                                    onMouseLeave={() => setHoveredProduct(null)}
                                >
                                    {product.isNew && <span className="new-badge">NEW</span>}
                                    {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 && (
                                        <span className="discount-badge">-{priceInfo.discountPercentage}%</span>
                                    )}

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

                                        {isOutOfStock && (
                                            <div className="out-of-stock-overlay">
                                                <span>Out of Stock</span>
                                            </div>
                                        )}

                                        <button
                                            className={`quick-view ${hoveredProduct === product.id ? "visible" : ""}`}
                                            onClick={() => openQuickView(product)}
                                        >
                                            Quick View
                                        </button>
                                    </div>

                                    <div className="product-info">
                                        <h3>{product.name}</h3>

                                        <div className="price-container">
                                            {priceInfo.hasDiscount ? (
                                                <>
                                                    <span className="original-price">₹{priceInfo.originalPrice}</span>
                                                    <span className="current-price">₹{priceInfo.discountPrice}</span>
                                                    <span className="discount-percent">-{priceInfo.discountPercentage}% OFF</span>
                                                </>
                                            ) : (
                                                <span className="current-price">₹{priceInfo.originalPrice}</span>
                                            )}
                                        </div>

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

                                        <button
                                            className={`add-to-cart square-btn ${isOutOfStock ? "disabled" : ""}`}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isOutOfStock}
                                        >
                                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {getFilteredProducts().length === 0 && (
                        <div className="no-products">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to see more results</p>
                            <button
                                className="reset-filters square-btn"
                                onClick={() => {
                                    setActiveFilter('all');
                                    setActivePriceFilter('all');
                                    setActiveCategory('all');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </section>

                {/* Newsletter Section */}
                <section className="newsletter-section">
                    <div className="newsletter-container">
                        <div className="newsletter-text">
                            <h3>Join the Pankhudi Family</h3>
                            <p>Get exclusive offers, early access to new collections, and style tips</p>
                        </div>
                        <form
                            className="newsletter-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Thank you for subscribing to Pankhudi!');
                            }}
                        >
                            <input
                                type="email"
                                placeholder="Your email address"
                                required
                            />
                            <button type="submit" className="square-btn">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>

            {/* Quick View Modal */}
            {showQuickView && quickViewProduct && (
                <div className="quick-view-modal">
                    <div className="quick-view-content">
                        <button className="close-quick-view" onClick={closeQuickView}>×</button>
                        <div className="quick-view-product">
                            <div className="quick-view-image">
                                <img src={getProductImage(quickViewProduct)} alt={quickViewProduct.name} />
                            </div>
                            <div className="quick-view-details">
                                <h3>{quickViewProduct.name}</h3>
                                <div className="quick-view-price">
                                    {getDisplayPrice(quickViewProduct).hasDiscount ? (
                                        <>
                                            <span className="original">₹{getDisplayPrice(quickViewProduct).originalPrice}</span>
                                            <span className="current">₹{getDisplayPrice(quickViewProduct).discountPrice}</span>
                                            <span className="discount-percent">-{getDisplayPrice(quickViewProduct).discountPercentage}% OFF</span>
                                        </>
                                    ) : (
                                        <span className="current">₹{getDisplayPrice(quickViewProduct).originalPrice}</span>
                                    )}
                                </div>
                                <p className="quick-view-description">{quickViewProduct.description}</p>
                                <div className="quick-view-actions">
                                    <button
                                        className="add-to-cart-btn square-btn"
                                        onClick={() => {
                                            handleAddToCart(quickViewProduct);
                                            closeQuickView();
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className="view-details-btn square-btn"
                                        onClick={() => {
                                            navigate(`/ProductDetail/${quickViewProduct.id}`);
                                            closeQuickView();
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            <ChatBot isPremium={true} />
        </>
    );
};

export default Home;