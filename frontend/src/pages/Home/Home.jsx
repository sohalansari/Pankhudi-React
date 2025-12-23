import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

// Enhanced Categories with clothing-specific images
const getCategoryImage = (categoryName) => {
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

const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000-5000', label: '₹2000 - ₹5000' },
    { value: '5000+', label: 'Over ₹5000' }
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [activePriceFilter, setActivePriceFilter] = useState("all");
    const [sortOption, setSortOption] = useState("featured");
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
    const [bannerStats, setBannerStats] = useState({
        total_clicks: 0,
        total_impressions: 0,
        active_banners: 0
    });
    const [activeBanners, setActiveBanners] = useState([]);
    const [homeTopBanners, setHomeTopBanners] = useState([]);
    const [homeMiddleBanners, setHomeMiddleBanners] = useState([]);
    const [categoryTopBanners, setCategoryTopBanners] = useState([]);
    const [sidebarBanners, setSidebarBanners] = useState([]);

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // ✅ ENHANCED BANNER FETCHING WITH ALL SQL COLUMNS
    useEffect(() => {
        const fetchBanners = async () => {
            setIsLoading(true);
            setBannerLoading(true);
            console.log('🔍 Fetching banners with all details...');

            try {
                // Try multiple endpoints
                let bannersData = [];
                let endpointUsed = '';

                // Try /api/banners/active first (recommended)
                try {
                    const response = await axios.get(`${API}/api/banners/active`, { timeout: 5000 });
                    endpointUsed = '/api/banners/active';

                    if (response.data.success && Array.isArray(response.data.data)) {
                        bannersData = response.data.data;
                        console.log(`✅ Got ${bannersData.length} banners from ${endpointUsed}`);
                    }
                } catch (err) {
                    console.log(`❌ ${endpointUsed} failed:`, err.message);
                }

                // If no data, try direct endpoint
                if (bannersData.length === 0) {
                    try {
                        const response = await axios.get(`${API}/api/banners`, { timeout: 5000 });
                        endpointUsed = '/api/banners';

                        if (Array.isArray(response.data)) {
                            bannersData = response.data;
                            console.log(`✅ Got ${bannersData.length} banners from ${endpointUsed}`);
                        }
                    } catch (err) {
                        console.log(`❌ ${endpointUsed} failed:`, err.message);
                    }
                }

                console.log('Raw banners data:', bannersData);

                if (bannersData.length > 0) {
                    // Process banners with ALL SQL COLUMNS
                    const processedBanners = bannersData.map(banner => {
                        // Complete banner object with all SQL columns
                        const fullBanner = {
                            // Basic Info
                            id: banner.id || `banner-${Date.now()}`,
                            title: banner.title || 'Special Offer',
                            description: banner.description || banner.subtitle || 'Discover amazing deals',

                            // Image Info
                            image: banner.image || banner.image_url ||
                                (banner.image_path ? `${API}/uploads/banners/${banner.image_path}` :
                                    getFallbackImage(banner.position)),
                            image_path: banner.image_path,
                            image_url: banner.image_url,

                            // Positioning
                            position: banner.position || 'home_top',
                            display_order: banner.display_order || 0,

                            // Status & Dates
                            status: banner.status || 'active',
                            start_date: banner.start_date,
                            end_date: banner.end_date,
                            created_at: banner.created_at,
                            updated_at: banner.updated_at,

                            // Links & Tags
                            redirect_url: banner.redirect_url || banner.link || '/shop',
                            discount_tag: banner.discount_tag || banner.discount || '',

                            // Analytics
                            clicks: banner.clicks || 0,
                            impressions: banner.impressions || 0,

                            // Calculated Fields
                            is_active: (banner.status === 'active') &&
                                (!banner.start_date || new Date(banner.start_date) <= new Date()) &&
                                (!banner.end_date || new Date(banner.end_date) >= new Date()),
                            days_remaining: banner.end_date ?
                                Math.ceil((new Date(banner.end_date) - new Date()) / (1000 * 60 * 60 * 24)) :
                                null,
                            is_new: banner.created_at ?
                                (new Date() - new Date(banner.created_at)) < (7 * 24 * 60 * 60 * 1000) :
                                false,

                            // Frontend display
                            buttonText: 'Shop Now',
                            theme: banner.theme || banner.position || 'home_top'
                        };

                        return fullBanner;
                    });

                    console.log('Processed banners with all columns:', processedBanners);

                    // Set main banner items for carousel
                    setBannerItems(processedBanners);

                    // Set all active banners
                    setActiveBanners(processedBanners.filter(b => b.is_active));

                    // Categorize banners by position
                    const categorizedBanners = {
                        home_top: [],
                        home_middle: [],
                        category_top: [],
                        sidebar: []
                    };

                    processedBanners.forEach(banner => {
                        if (categorizedBanners[banner.position]) {
                            categorizedBanners[banner.position].push(banner);
                        }
                    });

                    // Sort each category by display_order
                    Object.keys(categorizedBanners).forEach(pos => {
                        categorizedBanners[pos].sort((a, b) => a.display_order - b.display_order);
                    });

                    setHomeTopBanners(categorizedBanners.home_top);
                    setHomeMiddleBanners(categorizedBanners.home_middle);
                    setCategoryTopBanners(categorizedBanners.category_top);
                    setSidebarBanners(categorizedBanners.sidebar);

                    // Calculate statistics
                    const stats = {
                        total_clicks: processedBanners.reduce((sum, b) => sum + (b.clicks || 0), 0),
                        total_impressions: processedBanners.reduce((sum, b) => sum + (b.impressions || 0), 0),
                        active_banners: processedBanners.filter(b => b.is_active).length,
                        total_banners: processedBanners.length,
                        by_position: Object.keys(categorizedBanners).reduce((acc, pos) => {
                            acc[pos] = categorizedBanners[pos].length;
                            return acc;
                        }, {})
                    };

                    setBannerStats(stats);

                    console.log('Banner statistics:', stats);

                } else {
                    console.log('No banners found, using defaults');
                    setBannerItems(defaultBannerItems);
                    setActiveBanners(defaultBannerItems);
                }

            } catch (error) {
                console.error('❌ Error fetching banners:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });

                console.log('Using default banners');
                setBannerItems(defaultBannerItems);
                setActiveBanners(defaultBannerItems);
            } finally {
                setIsLoading(false);
                setBannerLoading(false);
            }
        };

        fetchBanners();

        // Auto-refresh banners every 5 minutes
        const interval = setInterval(fetchBanners, 5 * 60 * 1000);

        return () => clearInterval(interval);
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

    // ✅ FETCH ADDITIONAL BANNER DATA BY POSITION
    useEffect(() => {
        const fetchBannersByPosition = async () => {
            const positions = ['home_middle', 'category_top', 'sidebar'];

            positions.forEach(async (position) => {
                try {
                    const response = await axios.get(`${API}/api/banners/position/${position}`);

                    if (response.data.success && Array.isArray(response.data.data)) {
                        const banners = response.data.data.map(banner => ({
                            ...banner,
                            image: banner.image_url ||
                                (banner.image_path ? `${API}/uploads/banners/${banner.image_path}` :
                                    getFallbackImage(position)),
                            is_active: true
                        }));

                        // Update respective state
                        switch (position) {
                            case 'home_middle':
                                setHomeMiddleBanners(prev => [...prev, ...banners]);
                                break;
                            case 'category_top':
                                setCategoryTopBanners(prev => [...prev, ...banners]);
                                break;
                            case 'sidebar':
                                setSidebarBanners(prev => [...prev, ...banners]);
                                break;
                        }
                    }
                } catch (error) {
                    console.log(`No ${position} banners or API error:`, error.message);
                }
            });
        };

        // Only fetch if we need more banners
        if (activeBanners.length < 3) {
            fetchBannersByPosition();
        }
    }, [API, activeBanners.length]);

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

    // Scroll to top handler
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);

                // Fetch main categories
                const mainCatResponse = await axios.get(`${API}/api/categories`);
                if (Array.isArray(mainCatResponse.data)) {
                    setMainCategories(mainCatResponse.data);
                }

                // Fetch sub categories
                const subCatResponse = await axios.get(`${API}/api/subcategories`);
                if (Array.isArray(subCatResponse.data)) {
                    setSubCategories(subCatResponse.data);
                }

            } catch (err) {
                console.error('Error fetching categories:', err);

                // Fallback demo categories for clothing store
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

                // Fallback demo products for clothing store
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

    // ✅ Get Filtered Products
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Category filter
        if (activeCategory.type !== 'all' && activeCategory.id) {
            if (activeCategory.type === 'main') {
                filtered = filtered.filter(p => p.category_id === activeCategory.id);
            } else if (activeCategory.type === 'sub') {
                filtered = filtered.filter(p => p.sub_category_id === activeCategory.id);
            }
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

    // ✅ Get Sub Categories for Main Category
    const getSubCategoriesForMain = (mainCategoryId) => {
        return subCategories.filter(sub => sub.category_id === mainCategoryId);
    };

    // ✅ Navigation Functions
    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % bannerItems.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + bannerItems.length) % bannerItems.length);
    const goToSlide = (index) => setCurrentSlide(index);
    const toggleAutoPlay = () => setAutoPlay(prev => !prev);
    const navigateTo = (path) => navigate(path);

    // ✅ Handle Banner Click with Tracking
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

            alert('Product added to cart successfully!');
            setCart(prev => [...prev, product]);
        } catch (error) {
            console.error('Cart error:', error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    // ✅ Handle Wishlist
    const handleWishlist = (product) => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        if (isInWishlist) {
            setWishlist(wishlist.filter(item => item.id !== product.id));
            alert('Removed from wishlist');
        } else {
            setWishlist([...wishlist, product]);
            alert('Added to wishlist');
        }
    };

    // ✅ Quick View Functions
    const openQuickView = (product) => {
        setQuickViewProduct(product);
        setShowQuickView(true);
    };

    const closeQuickView = () => {
        setShowQuickView(false);
        setQuickViewProduct(null);
    };

    // ✅ Filter Functions
    const filterByPrice = (priceRange) => setActivePriceFilter(priceRange);
    const sortProducts = (option) => setSortOption(option);
    const filterByCategory = (type, id = null) => setActiveCategory({ type, id });
    const toggleFilters = () => setShowFilters(!showFilters);
    const showMoreCategories = () => setVisibleCategories(mainCategories.length);
    const loadMoreProducts = () => setDisplayLimit(prev => prev + 20);

    // ✅ Auto Slide for banners
    useEffect(() => {
        if (!autoPlay || isLoading || bannerItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % bannerItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, isLoading, bannerItems.length]);

    // ✅ Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No date set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // ✅ Check if banner is active based on dates
    const isBannerCurrentlyActive = (banner) => {
        if (banner.status !== 'active') return false;

        const now = new Date();
        const startDate = banner.start_date ? new Date(banner.start_date) : null;
        const endDate = banner.end_date ? new Date(banner.end_date) : null;

        if (startDate && now < startDate) return false;
        if (endDate && now > endDate) return false;

        return true;
    };

    if (isLoading) return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1 className="brand-name">Fashion Store</h1>
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
                {/* Hero Banner Section (Admin Controlled) */}
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
                                {bannerItems.length > 0 ? (
                                    bannerItems.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className={`slide ${index === currentSlide ? 'active' : ''} ${item.theme || ''}`}
                                        >
                                            <div className="slide-image-container">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    onClick={() => handleBannerClick(item)}
                                                    loading="lazy"
                                                    className="slide-image"
                                                    onError={(e) => {
                                                        console.log('Banner image error, using fallback:', item.image);
                                                        const fallbacks = [
                                                            'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80',
                                                            'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
                                                            'https://images.unsplash.com/photo-1583496661160-fb5886a13c43?w=1200&auto=format&fit=crop&q=80'
                                                        ];
                                                        const fallbackIndex = index % fallbacks.length;
                                                        e.target.src = fallbacks[fallbackIndex];
                                                    }}
                                                />
                                                {/* Banner Info Overlay */}
                                                <div className="banner-info-overlay">
                                                    <div className="banner-meta-info">
                                                        <span className="banner-position-badge">{item.position}</span>
                                                        {item.display_order > 0 && (
                                                            <span className="banner-order-badge">Order: {item.display_order}</span>
                                                        )}
                                                        {item.is_active && (
                                                            <span className="banner-active-badge">ACTIVE</span>
                                                        )}
                                                    </div>
                                                    {(item.start_date || item.end_date) && (
                                                        <div className="banner-dates">
                                                            <small>
                                                                {item.start_date ? formatDate(item.start_date) : 'Immediate'} -
                                                                {item.end_date ? formatDate(item.end_date) : 'No end date'}
                                                            </small>
                                                        </div>
                                                    )}
                                                    {item.clicks > 0 && (
                                                        <div className="banner-stats">
                                                            <small>👁️ {item.impressions || 0} | 👆 {item.clicks || 0}</small>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Loading skeleton */}
                                                <div className="image-loading-skeleton"></div>
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
                                                    {item.redirect_url && (
                                                        <button
                                                            className="slide-button secondary-btn"
                                                            onClick={() => handleBannerClick(item)}
                                                        >
                                                            View Details
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Show default banners if no banners from API
                                    defaultBannerItems.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className={`slide ${index === currentSlide ? 'active' : ''} ${item.theme || ''}`}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                onClick={() => navigateTo(item.link || '/')}
                                                loading="lazy"
                                                className="slide-image"
                                            />
                                            <div className="slide-content">
                                                {item.discount && <span className="slide-discount-badge">{item.discount}</span>}
                                                <h2 className="slide-title">{item.title}</h2>
                                                <p className="slide-subtitle">{item.subtitle}</p>
                                                <button
                                                    className="slide-button"
                                                    onClick={() => navigateTo(item.link || '/')}
                                                >
                                                    {item.buttonText || 'Shop Now'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                        {bannerItems.length > 1 && (
                            <>
                                <div className="slider-dots">
                                    {bannerItems.map((_, index) => (
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
                                        {currentSlide + 1} / {bannerItems.length}
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

                    {/* Banner Load Status */}
                    {bannerLoading && (
                        <div className="banner-loading">
                            <div className="loading-spinner small"></div>
                            <span>Loading banners...</span>
                        </div>
                    )}

                    {/* Banner Statistics Summary */}
                    {!bannerLoading && activeBanners.length > 0 && (
                        <div className="banner-stats-summary">
                            <div className="stats-item">
                                <span className="stats-label">Active Banners:</span>
                                <span className="stats-value">{activeBanners.length}</span>
                            </div>
                            <div className="stats-item">
                                <span className="stats-label">Total Clicks:</span>
                                <span className="stats-value">{bannerStats.total_clicks}</span>
                            </div>
                            <div className="stats-item">
                                <span className="stats-label">Total Views:</span>
                                <span className="stats-value">{bannerStats.total_impressions}</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* ✅ Home Middle Banners Section */}
                {homeMiddleBanners.length > 0 && (
                    <section className="home-middle-banners-section">
                        <div className="section-header">
                            <h2>Featured Offers</h2>
                            <p>Special promotions and deals</p>
                        </div>
                        <div className="home-middle-banners-grid">
                            {homeMiddleBanners.slice(0, 3).map((banner) => (
                                <div
                                    key={banner.id}
                                    className="home-middle-banner-card"
                                    onClick={() => handleBannerClick(banner)}
                                >
                                    <div className="banner-image-container">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="banner-image"
                                        />
                                        {banner.discount_tag && (
                                            <div className="banner-discount-tag">
                                                {banner.discount_tag}
                                            </div>
                                        )}
                                    </div>
                                    <div className="banner-content">
                                        <h3>{banner.title}</h3>
                                        <p>{banner.description}</p>
                                        <div className="banner-meta">
                                            <span className="meta-item">
                                                <small>Position: {banner.position}</small>
                                            </span>
                                            <span className="meta-item">
                                                <small>Order: {banner.display_order}</small>
                                            </span>
                                        </div>
                                        <button className="banner-action-btn">
                                            {banner.buttonText || 'View Offer'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ✅ Category Top Banners Section */}
                {categoryTopBanners.length > 0 && (
                    <section className="category-top-banners-section">
                        <div className="section-header">
                            <h2>Category Specials</h2>
                            <p>Exclusive offers for specific categories</p>
                        </div>
                        <div className="category-top-banners-container">
                            {categoryTopBanners.slice(0, 2).map((banner) => (
                                <div
                                    key={banner.id}
                                    className="category-top-banner"
                                    onClick={() => handleBannerClick(banner)}
                                >
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="category-banner-image"
                                    />
                                    <div className="category-banner-content">
                                        <h3>{banner.title}</h3>
                                        <p>{banner.description}</p>
                                        {banner.discount_tag && (
                                            <span className="category-discount">{banner.discount_tag}</span>
                                        )}
                                        <div className="banner-dates-small">
                                            {banner.start_date && (
                                                <small>Starts: {formatDate(banner.start_date)}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Section */}
                <section className="categories-section">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Browse our exclusive clothing collections</p>
                    </div>
                    <div className="categories-grid">
                        {mainCategories.slice(0, visibleCategories).map((category) => (
                            <div
                                key={category.id}
                                className="category-card"
                                onClick={() => navigate(`/category/${category.slug || category.id}`)}
                            >
                                <div className="category-image-container">
                                    <img
                                        src={category.image || getCategoryImage(category.name)}
                                        alt={category.name}
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
                                <h3 className="category-title">{category.name}</h3>
                                <p className="category-count">
                                    {getProductsByCategory('main', category.id).length} items
                                </p>
                            </div>
                        ))}
                    </div>
                    {visibleCategories < mainCategories.length && (
                        <div className="show-more-container">
                            <button className="show-more-btn" onClick={showMoreCategories}>
                                Show All Categories
                            </button>
                        </div>
                    )}
                </section>

                {/* Daily Deals Section */}
                {dailyDeals.length > 0 && (
                    <section className="deals-section">
                        <div className="section-header">
                            <div className="header-left">
                                <h2>🔥 Daily Deals</h2>
                                <p>Limited time offers - Don't miss out!</p>
                            </div>
                            <div className="timer">
                                <span className="timer-label">Deal ends in:</span>
                                <span className="timer-value">24:59:59</span>
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

                {/* ✅ Sidebar Banners Section */}
                {sidebarBanners.length > 0 && (
                    <section className="sidebar-banners-section">
                        <div className="section-header">
                            <h2>Quick Links</h2>
                            <p>Useful links and promotions</p>
                        </div>
                        <div className="sidebar-banners-grid">
                            {sidebarBanners.slice(0, 4).map((banner) => (
                                <div
                                    key={banner.id}
                                    className="sidebar-banner-card"
                                    onClick={() => handleBannerClick(banner)}
                                >
                                    <div className="sidebar-banner-content">
                                        <h4>{banner.title}</h4>
                                        <p>{banner.description}</p>
                                        <div className="sidebar-banner-meta">
                                            <small>Position: {banner.position}</small>
                                            {banner.clicks > 0 && (
                                                <small>👆 {banner.clicks} clicks</small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                        src={category.image || getCategoryImage(category.name)}
                                        alt={category.name}
                                        className="featured-category-image"
                                    />
                                    <div className="featured-category-content">
                                        <h3>{category.name}</h3>
                                        <button className="explore-btn">Explore Collection</button>
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
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ✅ Banner Statistics Dashboard */}
                {activeBanners.length > 0 && (
                    <section className="banner-stats-dashboard">
                        <div className="section-header">
                            <h2>Promotion Statistics</h2>
                            <p>Overview of active campaigns</p>
                        </div>
                        <div className="stats-dashboard-grid">
                            <div className="stats-card">
                                <div className="stats-icon">📊</div>
                                <div className="stats-content">
                                    <h3>Active Campaigns</h3>
                                    <p>{activeBanners.length} running promotions</p>
                                    <div className="stats-breakdown">
                                        <small>Home Top: {homeTopBanners.length}</small>
                                        <small>Home Middle: {homeMiddleBanners.length}</small>
                                        <small>Category: {categoryTopBanners.length}</small>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-card">
                                <div className="stats-icon">👁️</div>
                                <div className="stats-content">
                                    <h3>Total Views</h3>
                                    <p>{bannerStats.total_impressions.toLocaleString()} impressions</p>
                                    <div className="stats-breakdown">
                                        <small>Across all banners</small>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-card">
                                <div className="stats-icon">👆</div>
                                <div className="stats-content">
                                    <h3>Total Clicks</h3>
                                    <p>{bannerStats.total_clicks.toLocaleString()} clicks</p>
                                    <div className="stats-breakdown">
                                        <small>Engagement rate: {
                                            bannerStats.total_impressions > 0 ?
                                                ((bannerStats.total_clicks / bannerStats.total_impressions) * 100).toFixed(2) :
                                                0
                                        }%</small>
                                    </div>
                                </div>
                            </div>
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
                        <form className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Your email address"
                                required
                            />
                            <button type="submit" className="square-btn">Subscribe</button>
                        </form>
                    </div>
                </section>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button className="scroll-to-top" onClick={scrollToTop}>
                        ↑
                    </button>
                )}
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