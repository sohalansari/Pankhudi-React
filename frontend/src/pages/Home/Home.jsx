import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

// Default banner items (will be overridden by API)
const defaultBannerItems = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80',
        title: 'Summer Collection 2024',
        subtitle: 'Fresh styles for the modern wardrobe',
        link: '/category/summer-collection',
        buttonText: 'Shop Now',
        theme: 'summer',
        discount: '40% OFF'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
        title: 'Festive Collection',
        subtitle: 'Traditional wear for special occasions',
        link: '/category/festive',
        buttonText: 'Explore',
        theme: 'ethnic',
        discount: '35% OFF'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13c43?w=1200&auto=format&fit=crop&q=80',
        title: 'Premium Collection',
        subtitle: 'Luxury fabrics & premium designs',
        link: '/category/premium',
        buttonText: 'Discover',
        theme: 'premium',
        discount: '30% OFF'
    }
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [midCurrentSlide, setMidCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [midAutoPlay, setMidAutoPlay] = useState(true);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState(8);
    const [cart, setCart] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [activeCategory, setActiveCategory] = useState({ type: 'all', id: null });
    const [displayLimit, setDisplayLimit] = useState(20);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [bannerItems, setBannerItems] = useState(defaultBannerItems);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [dailyDeals, setDailyDeals] = useState([]);
    const [bannerLoading, setBannerLoading] = useState(true);
    const [homeTopBanners, setHomeTopBanners] = useState([]);
    const [homeMiddleBanners, setHomeMiddleBanners] = useState(defaultBannerItems);
    const [categoryTopBanners, setCategoryTopBanners] = useState([]);
    const [sidebarBanners, setSidebarBanners] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [notification, setNotification] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
        hours: 24,
        minutes: 0,
        seconds: 0
    });
    const [quickSubCategories, setQuickSubCategories] = useState([]);
    const [isLoadingQuickCategories, setIsLoadingQuickCategories] = useState(true);

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const sliderIntervalRef = useRef(null);
    const midSliderIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // ✅ Enhanced Categories with clothing-specific images
    const getCategoryImage = (categoryName, categoryData) => {
        // Pehle category data se image check karo
        if (categoryData && categoryData.image) {
            const imageUrl = categoryData.image;
            if (imageUrl.startsWith("http")) return imageUrl;
            if (imageUrl.startsWith("/")) return `${API}${imageUrl}`;
            return `${API}/${imageUrl}`;
        }

        // Agar database mein image nahi hai, toh fallback images use karo
        const images = {
            // Women's Clothing
            sarees: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=600&auto=format&fit=crop&q=80',
            dresses: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
            kurtas: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80',
            lehengas: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
            suits: 'https://images.unsplash.com/photo-1583496661160-fb5886a13c43?w=600&auto=format&fit=crop&q=80',

            // Men's Clothing
            shirts: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
            tshirts: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
            jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80',
            ethnicwear: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
            formalwear: 'https://images.unsplash.com/photo-1594938374184-6c1d8a6a6c1a?w=600&auto=format&fit=crop&q=80',

            // Kids Clothing
            kidsdresses: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80',
            kidstshirts: 'https://images.unsplash.com/photo-1558769132-cb1c458e4222?w=600&auto=format&fit=crop&q=80',

            // Seasonal
            winterwear: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80',
            summerwear: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&auto=format&fit=crop&q=80',

            // Accessories
            accessories: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80',
            footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
            bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',

            general: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80'
        };

        const lowerCaseName = categoryName?.toLowerCase() || '';
        for (const [key, value] of Object.entries(images)) {
            if (lowerCaseName.includes(key) || key.includes(lowerCaseName)) {
                return value;
            }
        }
        return images.general;
    };

    const getFallbackProductImage = getCategoryImage;

    // ✅ Fetch Quick Sub Categories
    useEffect(() => {
        const fetchQuickSubCategories = async () => {
            try {
                setIsLoadingQuickCategories(true);
                const response = await axios.get(`${API}/api/subcategories`);

                if (response.data.success && Array.isArray(response.data.data)) {
                    // Filter active sub-categories and limit to 10 for quick view
                    const activeSubCategories = response.data.data
                        .filter(sub => sub.is_active === true || sub.is_active === undefined)
                        .slice(0, 10);

                    setQuickSubCategories(activeSubCategories);
                } else if (Array.isArray(response.data)) {
                    // Fallback if response structure is different
                    const activeSubCategories = response.data
                        .filter(sub => sub.is_active === true || sub.is_active === undefined)
                        .slice(0, 10);

                    setQuickSubCategories(activeSubCategories);
                } else {
                    // Fallback demo sub-categories
                    const demoQuickSubCategories = [
                        { id: 1, name: 'Sarees', category_id: 1, slug: 'sarees', image_url: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=600&auto=format&fit=crop&q=80' },
                        { id: 2, name: 'Kurtas', category_id: 1, slug: 'kurtas', image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80' },
                        { id: 3, name: 'Lehengas', category_id: 1, slug: 'lehengas', image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80' },
                        { id: 4, name: 'Dresses', category_id: 1, slug: 'dresses', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80' },
                        { id: 5, name: 'Shirts', category_id: 2, slug: 'shirts', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80' },
                        { id: 6, name: 'T-Shirts', category_id: 2, slug: 't-shirts', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80' },
                        { id: 7, name: 'Jeans', category_id: 2, slug: 'jeans', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80' },
                        { id: 8, name: 'Ethnic Wear', category_id: 4, slug: 'ethnic-wear', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80' },
                        { id: 9, name: 'Formal Wear', category_id: 2, slug: 'formal-wear', image_url: 'https://images.unsplash.com/photo-1594938374184-6c1d8a6a6c1a?w=600&auto=format&fit=crop&q=80' },
                        { id: 10, name: 'Winter Wear', category_id: 6, slug: 'winter-wear', image_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80' }
                    ];
                    setQuickSubCategories(demoQuickSubCategories);
                }
            } catch (error) {
                console.error('Error fetching quick sub-categories:', error);
                // Fallback demo sub-categories
                const demoQuickSubCategories = [
                    { id: 1, name: 'Sarees', category_id: 1, slug: 'sarees', image_url: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=600&auto=format&fit=crop&q=80' },
                    { id: 2, name: 'Kurtas', category_id: 1, slug: 'kurtas', image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80' },
                    { id: 3, name: 'Lehengas', category_id: 1, slug: 'lehengas', image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80' },
                    { id: 4, name: 'Dresses', category_id: 1, slug: 'dresses', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80' },
                    { id: 5, name: 'Shirts', category_id: 2, slug: 'shirts', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80' },
                    { id: 6, name: 'T-Shirts', category_id: 2, slug: 't-shirts', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80' },
                    { id: 7, name: 'Jeans', category_id: 2, slug: 'jeans', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80' },
                    { id: 8, name: 'Ethnic Wear', category_id: 4, slug: 'ethnic-wear', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80' },
                    { id: 9, name: 'Formal Wear', category_id: 2, slug: 'formal-wear', image_url: 'https://images.unsplash.com/photo-1594938374184-6c1d8a6a6c1a?w=600&auto=format&fit=crop&q=80' },
                    { id: 10, name: 'Winter Wear', category_id: 6, slug: 'winter-wear', image_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80' }
                ];
                setQuickSubCategories(demoQuickSubCategories);
            } finally {
                setIsLoadingQuickCategories(false);
            }
        };

        fetchQuickSubCategories();
    }, [API]);

    // ✅ Timer for Daily Deals
    useEffect(() => {
        // Start countdown timer
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 24); // 24 hours from now

        const updateTimer = () => {
            const now = new Date();
            const difference = endTime - now;

            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
                return;
            }

            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        updateTimer(); // Initial call
        timerIntervalRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // ✅ ENHANCED BANNER FETCHING
    useEffect(() => {
        const fetchBanners = async () => {
            setIsLoading(true);
            setBannerLoading(true);
            try {
                // Fetch home top banners
                try {
                    const response = await axios.get(`${API}/api/banners/position/home_top`, { timeout: 5000 });
                    if (response.data.success && Array.isArray(response.data.data)) {
                        const banners = response.data.data.map(banner => ({
                            ...banner,
                            image: banner.image_url || banner.image || getFallbackImage('home_top'),
                            is_active: true
                        }));
                        setHomeTopBanners(banners.length > 0 ? banners : defaultBannerItems);
                        setBannerItems(banners.length > 0 ? banners : defaultBannerItems);
                    }
                } catch (err) {
                    console.log('Home top banners error:', err.message);
                    setHomeTopBanners(defaultBannerItems);
                    setBannerItems(defaultBannerItems);
                }

                // Fetch home middle banners
                try {
                    const response = await axios.get(`${API}/api/banners/position/home_middle`, { timeout: 5000 });
                    if (response.data.success && Array.isArray(response.data.data)) {
                        const banners = response.data.data.map(banner => ({
                            ...banner,
                            image: banner.image_url || banner.image || getFallbackImage('home_middle'),
                            is_active: true
                        }));
                        setHomeMiddleBanners(banners.length > 0 ? banners : defaultBannerItems);
                    }
                } catch (err) {
                    console.log('Home middle banners error:', err.message);
                    setHomeMiddleBanners(defaultBannerItems);
                }

            } catch (error) {
                console.error('❌ Error fetching banners:', error.message);
                setHomeTopBanners(defaultBannerItems);
                setBannerItems(defaultBannerItems);
                setHomeMiddleBanners(defaultBannerItems);
            } finally {
                setIsLoading(false);
                setBannerLoading(false);
            }
        };

        fetchBanners();
        return () => {
            if (sliderIntervalRef.current) {
                clearInterval(sliderIntervalRef.current);
            }
            if (midSliderIntervalRef.current) {
                clearInterval(midSliderIntervalRef.current);
            }
        };
    }, [API]);

    // Helper function for fallback images
    const getFallbackImage = (position) => {
        const fallbackImages = {
            'home_top': 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80',
            'home_middle': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
            'category_top': 'https://images.unsplash.com/photo-1583496661160-fb5886a13c43?w=1200&auto=format&fit=crop&q=80',
            'product_page': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&auto=format&fit=crop&q=80',
            'sidebar': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
        };
        return fallbackImages[position] || fallbackImages['home_top'];
    };

    // ✅ Show Notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // ✅ Auto Slide for top banners
    useEffect(() => {
        if (!autoPlay || isLoading || homeTopBanners.length <= 1) return;

        sliderIntervalRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
        }, 5000);

        return () => {
            if (sliderIntervalRef.current) {
                clearInterval(sliderIntervalRef.current);
            }
        };
    }, [autoPlay, isLoading, homeTopBanners.length]);

    // ✅ Auto Slide for middle banners
    useEffect(() => {
        if (!midAutoPlay || isLoading || homeMiddleBanners.length <= 1) return;

        midSliderIntervalRef.current = setInterval(() => {
            setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
        }, 5000);

        return () => {
            if (midSliderIntervalRef.current) {
                clearInterval(midSliderIntervalRef.current);
            }
        };
    }, [midAutoPlay, isLoading, homeMiddleBanners.length]);

    // ✅ Navigation functions for top slider
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

    const toggleAutoPlay = () => {
        setAutoPlay(prev => !prev);
        if (autoPlay) {
            if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
        } else {
            sliderIntervalRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % homeTopBanners.length);
            }, 5000);
        }
    };

    // ✅ Navigation functions for middle slider
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

    const toggleMidAutoPlay = () => {
        setMidAutoPlay(prev => !prev);
        if (midAutoPlay) {
            if (midSliderIntervalRef.current) clearInterval(midSliderIntervalRef.current);
        } else {
            midSliderIntervalRef.current = setInterval(() => {
                setMidCurrentSlide(prev => (prev + 1) % homeMiddleBanners.length);
            }, 5000);
        }
    };

    // Fetch featured categories from API
    useEffect(() => {
        const fetchFeaturedCategories = async () => {
            try {
                const response = await axios.get(`${API}/api/categories/featured`);
                if (Array.isArray(response.data)) {
                    setFeaturedCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching featured categories:', error);
            }
        };
        fetchFeaturedCategories();
    }, [API]);


    // Show scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch categories and products
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);

                // Fetch main categories
                const mainCatResponse = await axios.get(`${API}/api/categories`);
                if (Array.isArray(mainCatResponse.data)) {
                    // Category data mein image hai, to getCategoryImage function use karega
                    setMainCategories(mainCatResponse.data);
                }

                // Fetch sub categories
                const subCatResponse = await axios.get(`${API}/api/subcategories`);
                if (Array.isArray(subCatResponse.data)) {
                    setSubCategories(subCatResponse.data);
                }

            } catch (err) {
                console.error('Error fetching categories:', err);

                // Fallback demo categories
                const demoMainCategories = [
                    { id: 1, name: 'Women\'s Fashion', slug: 'womens-fashion', image: getCategoryImage('dresses'), featured: true },
                    { id: 2, name: 'Men\'s Fashion', slug: 'mens-fashion', image: getCategoryImage('shirts'), featured: true },
                    { id: 3, name: 'Kids Fashion', slug: 'kids-fashion', image: getCategoryImage('kidsdresses'), featured: true },
                    { id: 4, name: 'Ethnic Wear', slug: 'ethnic-wear', image: getCategoryImage('ethnicwear'), featured: true },
                    { id: 5, name: 'Western Wear', slug: 'western-wear', image: getCategoryImage('tshirts') },
                    { id: 6, name: 'Winter Collection', slug: 'winter-collection', image: getCategoryImage('winterwear'), featured: true },
                    { id: 7, name: 'Summer Collection', slug: 'summer-collection', image: getCategoryImage('summerwear') },
                    { id: 8, name: 'Accessories', slug: 'accessories', image: getCategoryImage('accessories') },
                    { id: 9, name: 'Footwear', slug: 'footwear', image: getCategoryImage('footwear') },
                    { id: 10, name: 'Formal Wear', slug: 'formal-wear', image: getCategoryImage('formalwear') }
                ];

                const demoSubCategories = [
                    { id: 1, name: 'Sarees', category_id: 1, slug: 'sarees' },
                    { id: 2, name: 'Kurtas', category_id: 1, slug: 'kurtas' },
                    { id: 3, name: 'Lehengas', category_id: 1, slug: 'lehengas' },
                    { id: 4, name: 'Dresses', category_id: 1, slug: 'dresses' },
                    { id: 5, name: 'Shirts', category_id: 2, slug: 'shirts' },
                    { id: 6, name: 'T-Shirts', category_id: 2, slug: 't-shirts' },
                    { id: 7, name: 'Jeans', category_id: 2, slug: 'jeans' }
                ];

                setMainCategories(demoMainCategories);
                setSubCategories(demoSubCategories);
                setFeaturedCategories(demoMainCategories.filter(cat => cat.featured));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [API]);

    // ✅ Get Product Image
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

    // ✅ Discount Calculation
    const calculateDiscountPercentage = useCallback((product) => {
        const originalPrice = Number(product.price) || 0;
        const discountPrice = Number(product.discountPrice) || 0;

        if (discountPrice > 0 && discountPrice < originalPrice) {
            const percentage = ((originalPrice - discountPrice) / originalPrice) * 100;
            const roundedPercentage = parseFloat(percentage.toFixed(1));
            return roundedPercentage;
        }
        return 0;
    }, []);

    // ✅ Get Display Price
    const getDisplayPrice = useCallback((product) => {
        const originalPrice = Number(product.price) || 0;
        const discountPrice = Number(product.discountPrice) || 0;
        const discountPercentage = calculateDiscountPercentage(product);
        const hasValidDiscount = discountPercentage > 0;

        return {
            originalPrice,
            discountPrice: hasValidDiscount ? discountPrice : originalPrice,
            discountPercentage,
            hasDiscount: hasValidDiscount
        };
    }, [calculateDiscountPercentage]);

    // ✅ Product Data Sanitization
    const sanitizeProductData = useCallback((products) => {
        return products.map((product, index) => {
            const originalPrice = Number(product.price) || 0;
            const discountPrice = Number(product.discountPrice) || 0;
            const discountPercentage = calculateDiscountPercentage(product);

            return {
                id: product.id || product._id || `api-${index}`,
                name: product.name || "No Name",
                stock: Number(product.stock) || 0,
                price: originalPrice,
                discountPrice: discountPrice,
                category: (product.category || "general").toLowerCase(),
                sub_category: product.sub_category || '',
                category_id: product.category_id || null,
                sub_category_id: product.sub_category_id || null,
                rating: product.rating || 0,
                discount: discountPercentage,
                image: getProductImage(product),
                images: product.images || [],
                createdAt: product.created_at || product.createdAt || new Date().toISOString(),
                isNew: product.isNew || false,
                description: product.description || 'No description available',
                sizes: product.sizes || ['S', 'M', 'L', 'XL'],
                colors: product.colors || ['Black', 'White', 'Red', 'Blue'],
                hasDiscount: discountPercentage > 0,
                isTrending: product.isTrending || false,
                isDailyDeal: product.isDailyDeal || false
            };
        });
    }, [calculateDiscountPercentage, getProductImage]);

    // ✅ Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API}/api/products`);
                if (Array.isArray(response.data)) {
                    const sanitized = sanitizeProductData(response.data);
                    setProducts(sanitized);

                    // Filter trending products and daily deals
                    setTrendingProducts(sanitized.filter(p => p.isTrending || p.rating >= 4.5));
                    setDailyDeals(sanitized.filter(p => p.isDailyDeal || p.discount > 20));
                } else {
                    throw new Error('Invalid API response format');
                }
            } catch (err) {
                console.error('Error fetching products:', err);

                // Fallback demo products
                const demoProducts = [
                    {
                        id: 'demo-1',
                        name: 'Floral Print Maxi Dress',
                        stock: 10,
                        price: 1999,
                        discountPrice: 1499,
                        category: 'Women\'s Fashion',
                        sub_category: 'Dresses',
                        category_id: 1,
                        sub_category_id: 4,
                        rating: 4.5,
                        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80',
                        isNew: true,
                        isTrending: true
                    },
                    {
                        id: 'demo-2',
                        name: 'Designer Silk Saree',
                        stock: 5,
                        price: 3500,
                        discountPrice: 2800,
                        category: 'Women\'s Fashion',
                        sub_category: 'Sarees',
                        category_id: 1,
                        sub_category_id: 1,
                        rating: 4.8,
                        image: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=500&auto=format&fit=crop&q=80',
                        isDailyDeal: true
                    },
                    {
                        id: 'demo-3',
                        name: 'Premium Cotton T-Shirt',
                        stock: 20,
                        price: 899,
                        discountPrice: 699,
                        category: 'Men\'s Fashion',
                        sub_category: 'T-Shirts',
                        category_id: 2,
                        sub_category_id: 6,
                        rating: 4.3,
                        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80',
                        isTrending: true
                    },
                    {
                        id: 'demo-4',
                        name: 'Designer Jeans',
                        stock: 15,
                        price: 2499,
                        discountPrice: 1999,
                        category: 'Men\'s Fashion',
                        sub_category: 'Jeans',
                        category_id: 2,
                        sub_category_id: 7,
                        rating: 4.6,
                        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80',
                        isDailyDeal: true
                    }
                ];

                const sanitizedDemo = sanitizeProductData(demoProducts);
                setProducts(sanitizedDemo);
                setTrendingProducts(sanitizedDemo.filter(p => p.isTrending || p.rating >= 4.5));
                setDailyDeals(sanitizedDemo.filter(p => p.isDailyDeal || p.discount > 20));
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [API, sanitizeProductData]);

    // ✅ Get Products by Category
    const getProductsByCategory = (categoryType, categoryId, limit = 4) => {
        if (categoryType === 'main' && categoryId) {
            return products
                .filter(product => product.category_id === categoryId)
                .slice(0, limit);
        } else if (categoryType === 'sub' && categoryId) {
            return products
                .filter(product => product.sub_category_id === categoryId)
                .slice(0, limit);
        }
        return products.slice(0, limit);
    };

    // ✅ Handle Banner Click
    const handleBannerClick = async (banner) => {
        try {
            // Track click in backend
            if (banner.id && banner.id.toString().includes('banner-')) {
                // Demo banner, no tracking
            } else if (banner.id) {
                await axios.post(`${API}/api/banners/track-click`, {
                    bannerId: banner.id
                });
            }

            // Navigate
            if (banner.redirect_url) {
                navigate(banner.redirect_url);
            } else if (banner.link) {
                navigate(banner.link);
            } else {
                navigate('/shop');
            }
        } catch (error) {
            console.log('Banner click tracking error:', error);
            // Still navigate even if tracking fails
            navigate(banner.redirect_url || banner.link || '/shop');
        }
    };

    // ✅ Handle Add to Cart
    const handleAddToCart = async (product) => {
        if (product.stock <= 0) {
            showNotification("This product is out of stock!", "error");
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
            const finalPrice = priceInfo.hasDiscount ? priceInfo.discountPrice : priceInfo.originalPrice;

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

            showNotification('Product added to cart successfully!', 'success');
            setCart(prev => [...prev, product]);
        } catch (error) {
            console.error('Cart error:', error);
            showNotification(error.response?.data?.message || "Something went wrong", "error");
        }
    };

    // ✅ Handle Wishlist
    const handleWishlist = (product) => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        if (isInWishlist) {
            setWishlist(wishlist.filter(item => item.id !== product.id));
            showNotification('Removed from wishlist', 'success');
        } else {
            setWishlist([...wishlist, product]);
            showNotification('Added to wishlist', 'success');
        }
    };

    // ✅ Quick View Functions
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

    // ✅ Navigation functions
    const navigateTo = (path) => navigate(path);
    const toggleShowAllCategories = () => setShowAllCategories(!showAllCategories);



    // ✅ Handle Newsletter Subscription
    const handleNewsletterSubscribe = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (email) {
            try {
                await axios.post(`${API}/api/newsletter/subscribe`, { email });
                showNotification('Subscribed successfully!', 'success');
                e.target.reset();
            } catch (error) {
                showNotification('Subscription failed. Please try again.', 'error');
            }
        }
    };

    // ✅ Format time for display
    const formatTime = (time) => {
        return time.toString().padStart(2, '0');
    };

    if (isLoading) return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1 className="brand-name">Pankhudi</h1>
                <div className="loading-spinner"></div>
                <div className="loading-progress-bar">
                    <div className="loading-progress" style={{ width: `${progress}%` }} />
                </div>
                <p>Loading fashion collection... {progress}%</p>
            </div>
        </div>
    );

    return (
        <>
            <Header cart={cart} wishlist={wishlist} />
            <main className="home-main">
                {/* Notification */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {/* Top Hero Banner Section */}
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
                                style={{
                                    transform: `translateX(-${currentSlide * 100}%)`,
                                    transition: 'transform 0.5s ease-in-out'
                                }}
                            >
                                {homeTopBanners.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                                    >
                                        <div className="slide-image-container">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                onClick={() => handleBannerClick(item)}
                                                loading="lazy"
                                                className="slide-image"
                                                onError={(e) => {
                                                    e.target.src = getFallbackImage('home_top');
                                                }}
                                            />
                                        </div>
                                        <div className="slide-content">
                                            {item.discount_tag && (
                                                <div className="discount-container">
                                                    <span className="slide-discount-badge">{item.discount_tag}</span>
                                                </div>
                                            )}
                                            <h2 className="slide-title">{item.title}</h2>
                                            <p className="slide-subtitle">{item.description || item.subtitle || 'Discover amazing deals'}</p>
                                            <div className="slide-actions">
                                                <button
                                                    className="slide-button primary-btn"
                                                    onClick={() => handleBannerClick(item)}
                                                >
                                                    <span>{item.buttonText || 'Shop Now'}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                                    </svg>
                                                </button>
                                            </div>
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

                    {/* Bottom Controls */}
                    <div className="slider-controls">
                        {homeTopBanners.length > 1 && (
                            <>
                                <div className="slider-dots">
                                    {homeTopBanners.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                                            onClick={() => goToSlide(index)}
                                            aria-label={`Go to slide ${index + 1}`}
                                        >
                                            <div className="dot-inner"></div>
                                        </button>
                                    ))}
                                </div>

                                <div className="slider-info">
                                    <span className="slide-counter">
                                        {currentSlide + 1} / {homeTopBanners.length}
                                    </span>
                                    <button
                                        className="auto-play-toggle"
                                        onClick={toggleAutoPlay}
                                        title={autoPlay ? 'Pause slideshow' : 'Play slideshow'}
                                    >
                                        {autoPlay ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                </svg>
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                                Play
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* UPDATED: Quick Categories Bar with Sub-Categories */}
                <div className="quick-categories-container">
                    <div className="section-header">
                        <div className="header-title-section">
                            <h2>Quick Categories</h2>
                            <p>Browse by sub-categories for faster shopping</p>
                        </div>
                        <div className="hint">
                            <span><svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-label="Previous"
                            >
                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
                            </svg>
                            </span>
                            <span><svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-label="Next"
                            >
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                            </svg>
                            </span>
                        </div>
                    </div>

                    {isLoadingQuickCategories ? (
                        <div className="loading-quick-categories">
                            <div className="spinner"></div>
                            <p>Loading sub-categories...</p>
                        </div>
                    ) : (
                        <div className="quick-categories-bar">
                            <div className="quick-categories-scroll">
                                {quickSubCategories.map(subCategory => {
                                    // Find main category name for this sub-category
                                    const mainCategory = mainCategories.find(
                                        cat => cat.id === subCategory.category_id
                                    );
                                    const mainCategoryName = mainCategory ? mainCategory.name : 'Category';

                                    return (
                                        <div
                                            key={subCategory.id}
                                            className="quick-category"
                                            onClick={() => navigate(`/subcategory/${subCategory.slug || subCategory.id}`)}
                                        >
                                            <div className="quick-category-image">
                                                <img
                                                    src={subCategory.image_url || getCategoryImage(subCategory.name)}
                                                    alt={subCategory.name}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = getCategoryImage(subCategory.name);
                                                    }}
                                                />
                                                <div className="category-overlay-quick">
                                                    <span className="shop-now-text">Shop Now</span>
                                                </div>
                                            </div>
                                            <div className="quick-category-info">
                                                <span className="quick-category-name">{subCategory.name}</span>
                                                <span className="quick-category-parent">
                                                    {mainCategoryName}
                                                </span>
                                                <span className="quick-category-count">
                                                    {getProductsByCategory('sub', subCategory.id).length} products
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* View All Sub-Categories Card */}
                                <div
                                    className="quick-category view-all-card"
                                    onClick={() => navigate('/categories')}
                                >
                                    <div className="quick-category-image view-all-image">
                                        <div className="view-all-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="quick-category-info">
                                        <span className="quick-category-name">View All</span>
                                        <span className="quick-category-count">
                                            Explore all categories
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle Banner Section (Same as Top) */}
                {homeMiddleBanners.length > 0 && (
                    <section className="hero-section middle-banner">
                        <div className="section-header">
                            <h2>Special Offers</h2>
                            <p>Exclusive deals just for you</p>
                        </div>

                        <div className="slider-container">
                            <button className="slider-btn left" onClick={prevMidSlide} aria-label="Previous slide">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                                </svg>
                            </button>

                            <div className="slider-wrapper">
                                <div
                                    className="slider-track"
                                    style={{
                                        transform: `translateX(-${midCurrentSlide * 100}%)`,
                                        transition: 'transform 0.5s ease-in-out'
                                    }}
                                >
                                    {homeMiddleBanners.map((item, index) => (
                                        <div
                                            key={`mid-${item.id || index}`}
                                            className={`slide ${index === midCurrentSlide ? 'active' : ''}`}
                                        >
                                            <div className="slide-image-container">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    onClick={() => handleBannerClick(item)}
                                                    loading="lazy"
                                                    className="slide-image"
                                                    onError={(e) => {
                                                        e.target.src = getFallbackImage('home_middle');
                                                    }}
                                                />
                                            </div>
                                            <div className="slide-content">
                                                {item.discount_tag && (
                                                    <div className="discount-container">
                                                        <span className="slide-discount-badge">{item.discount_tag}</span>
                                                    </div>
                                                )}
                                                <h2 className="slide-title">{item.title}</h2>
                                                <p className="slide-subtitle">{item.description || item.subtitle || 'Special offer for you'}</p>
                                                <div className="slide-actions">
                                                    <button
                                                        className="slide-button primary-btn"
                                                        onClick={() => handleBannerClick(item)}
                                                    >
                                                        <span>Shop Now</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="slider-btn right" onClick={nextMidSlide} aria-label="Next slide">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                            </button>
                        </div>

                        {/* Bottom Controls */}
                        <div className="slider-controls">
                            {homeMiddleBanners.length > 1 && (
                                <>
                                    <div className="slider-dots">
                                        {homeMiddleBanners.map((_, index) => (
                                            <button
                                                key={`mid-dot-${index}`}
                                                className={`dot ${index === midCurrentSlide ? 'active' : ''}`}
                                                onClick={() => goToMidSlide(index)}
                                                aria-label={`Go to slide ${index + 1}`}
                                            >
                                                <div className="dot-inner"></div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="slider-info">
                                        <span className="slide-counter">
                                            {midCurrentSlide + 1} / {homeMiddleBanners.length}
                                        </span>
                                        <button
                                            className="auto-play-toggle"
                                            onClick={toggleMidAutoPlay}
                                            title={midAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
                                        >
                                            {midAutoPlay ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                    </svg>
                                                    Pause
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                    Play
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* Categories Section */}
                <section className="categories-section">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Browse our exclusive clothing collections</p>
                        <button
                            className="toggle-categories-btn"
                            onClick={toggleShowAllCategories}
                        >
                            {showAllCategories ? 'Show Less' : 'Show All'}
                        </button>
                    </div>
                    <div className="categories-grid">
                        {mainCategories.slice(0, showAllCategories ? mainCategories.length : visibleCategories).map((category) => (
                            <div
                                key={category.id}
                                className="category-card"
                                onClick={() => navigate(`/category/${category.slug || category.id}`)}
                            >
                                <div className="category-image-container">
                                    <img
                                        src={category.image || getCategoryImage(category.name, category)}
                                        alt={category.name}
                                        loading="lazy"
                                        className="category-image"
                                        onError={(e) => {
                                            e.target.src = getCategoryImage("general");
                                        }}
                                    />
                                    <div className="category-overlay">
                                        <span className="shop-now-text">Shop Now</span>
                                        <span className="product-count">
                                            {getProductsByCategory('main', category.id).length} products
                                        </span>
                                    </div>
                                </div>
                                <h3 className="category-title">{category.name}</h3>
                                <p className="category-count">
                                    {getProductsByCategory('main', category.id).length} items
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Daily Deals Section with Working Timer */}
                {dailyDeals.length > 0 && (
                    <section className="deals-section">
                        <div className="section-header">
                            <div className="header-left">
                                <h2>🔥 Daily Deals</h2>
                                <p>Limited time offers - Don't miss out!</p>
                            </div>
                            <div className="timer-container">
                                <span className="timer-label">Deal ends in:</span>
                                <div className="timer">
                                    <div className="time-unit">
                                        <span className="time-value">{formatTime(timeLeft.hours)}</span>
                                        <span className="time-label">HOURS</span>
                                    </div>
                                    <span className="time-separator">:</span>
                                    <div className="time-unit">
                                        <span className="time-value">{formatTime(timeLeft.minutes)}</span>
                                        <span className="time-label">MINS</span>
                                    </div>
                                    <span className="time-separator">:</span>
                                    <div className="time-unit">
                                        <span className="time-value">{formatTime(timeLeft.seconds)}</span>
                                        <span className="time-label">SECS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="deals-grid">
                            {dailyDeals.slice(0, 4).map((product) => {
                                const priceInfo = getDisplayPrice(product);
                                return (
                                    <div key={product.id} className="deal-card">
                                        <div className="deal-badge">Daily Deal</div>
                                        <div className="product-image">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                            />
                                            <div className="product-actions">
                                                <button
                                                    className="action-btn wishlist-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleWishlist(product);
                                                    }}
                                                >
                                                    {wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}
                                                </button>
                                                <button
                                                    className="action-btn quick-view-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openQuickView(product);
                                                    }}
                                                >
                                                    👁️
                                                </button>
                                            </div>
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <div className="price-container">
                                                <span className="original-price">₹{priceInfo.originalPrice}</span>
                                                <span className="current-price">₹{priceInfo.discountPrice}</span>
                                                <span className="discount-percent">-{priceInfo.discountPercentage}%</span>
                                            </div>
                                            <button
                                                className="add-to-cart square-btn"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Featured Categories */}
                {featuredCategories.length > 0 && (
                    <section className="featured-categories-section">
                        <div className="section-header">
                            <h2>Featured Collections</h2>
                            <p>Handpicked collections just for you</p>
                        </div>
                        <div className="featured-categories-grid">
                            {featuredCategories.slice(0, 3).map((category) => (
                                <div
                                    key={category.id}
                                    className="featured-category-card"
                                    onClick={() => navigate(`/category/${category.slug || category.id}`)}
                                >
                                    <img
                                        src={category.image || getCategoryImage(category.name, category)}
                                        alt={category.name}
                                        className="featured-category-image"
                                    />
                                    <div className="featured-category-content">
                                        <h3>{category.name}</h3>
                                        <p>Explore our exclusive {category.name.toLowerCase()} collection</p>
                                        <button className="explore-btn">Explore Collection</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Products - 2 products side by side on mobile */}
                {trendingProducts.length > 0 && (
                    <section className="trending-section">
                        <div className="section-header">
                            <h2>Trending Now 🔥</h2>
                            <button
                                className="view-all square-btn"
                                onClick={() => navigate('/trending')}
                            >
                                View All
                            </button>
                        </div>
                        <div className="trending-grid">
                            {trendingProducts.slice(0, 8).map((product) => {
                                const priceInfo = getDisplayPrice(product);
                                return (
                                    <div key={product.id} className="trending-card">
                                        <div className="trending-image">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                            />
                                            {product.isNew && <span className="new-badge">NEW</span>}
                                            {priceInfo.hasDiscount && (
                                                <span className="discount-badge">-{priceInfo.discountPercentage}%</span>
                                            )}
                                            <div className="product-hover-actions">
                                                <button
                                                    className="hover-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleWishlist(product);
                                                    }}
                                                >
                                                    {wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}
                                                </button>
                                                <button
                                                    className="hover-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openQuickView(product);
                                                    }}
                                                >
                                                    👁️ Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div className="trending-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <div className="trending-price">
                                                {priceInfo.hasDiscount ? (
                                                    <>
                                                        <span className="original-price">₹{priceInfo.originalPrice}</span>
                                                        <span className="current-price">₹{priceInfo.discountPrice}</span>
                                                    </>
                                                ) : (
                                                    <span className="current-price">₹{priceInfo.originalPrice}</span>
                                                )}
                                            </div>
                                            <div className="trending-rating">
                                                ★★★★★ <span>({product.rating})</span>
                                            </div>
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Category-wise Product Sections */}
                {mainCategories.slice(0, 3).map(mainCategory => {
                    const categoryProducts = getProductsByCategory('main', mainCategory.id, 4);
                    if (categoryProducts.length === 0) return null;

                    return (
                        <section key={mainCategory.id} className="category-section">
                            <div className="section-header">
                                <div className="category-header-info">
                                    <h2>{mainCategory.name}</h2>
                                    <p>Best of {mainCategory.name.toLowerCase()} collection</p>
                                </div>
                                <button
                                    className="view-all square-btn"
                                    onClick={() => navigate(`/category/${mainCategory.slug || mainCategory.id}`)}
                                >
                                    View All
                                </button>
                            </div>
                            <div className="category-products-grid">
                                {categoryProducts.map((product) => {
                                    const priceInfo = getDisplayPrice(product);
                                    const isOutOfStock = product.stock <= 0;

                                    return (
                                        <div
                                            key={product.id}
                                            className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                                        >
                                            {product.isNew && <span className="new-badge">NEW</span>}
                                            {priceInfo.hasDiscount && (
                                                <span className="discount-badge">-{priceInfo.discountPercentage}%</span>
                                            )}

                                            <div className="product-image">
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.name}
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
                                                <button
                                                    className="wishlist-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleWishlist(product);
                                                    }}
                                                >
                                                    {wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}
                                                </button>
                                            </div>

                                            <div className="product-info">
                                                <h3 className="product-name">{product.name}</h3>
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
                                                    ★★★★★ <span>({product.rating})</span>
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

                {/* Newsletter Section */}
                <section className="newsletter-section">
                    <div className="newsletter-container">
                        <div className="newsletter-text">
                            <h3>Stay Updated with Latest Fashion</h3>
                            <p>Subscribe to get exclusive offers and style tips</p>
                        </div>
                        <form className="newsletter-form" onSubmit={handleNewsletterSubscribe}>
                            <input
                                type="email"
                                name="email"
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
                                            navigate(`/product/${quickViewProduct.id}`);
                                            closeQuickView();
                                        }}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="wishlist-btn square-btn"
                                        onClick={() => {
                                            handleWishlist(quickViewProduct);
                                        }}
                                    >
                                        {wishlist.some(item => item.id === quickViewProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
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