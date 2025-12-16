import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

// Category ID mapping ke liye variable
let categoryIdMap = {
    'Women': null,
    'Men': null,
    'Kids': null,
    'Ethnic Wear': null,
    'Western Wear': null,
    'Accessories': null
};

// Enhanced Women's Fashion Categories with better images
const getCategoryImage = (categoryName) => {
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

    // Check if category name exists in images, otherwise use general
    const lowerCaseName = categoryName?.toLowerCase() || '';
    for (const [key, value] of Object.entries(images)) {
        if (lowerCaseName.includes(key) || key.includes(lowerCaseName)) {
            return value;
        }
    }
    return images.general;
};

const getFallbackProductImage = getCategoryImage;

// Enhanced Slider Items
const sliderItems = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80',
        title: 'Summer Collection 2024',
        subtitle: 'Fresh styles for the modern woman',
        link: '/category/all',
        buttonText: 'Shop Now',
        theme: 'summer',
        discount: '40% OFF'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
        title: 'Ethnic Elegance',
        subtitle: 'Traditional wear for special occasions',
        link: '/category/ethnic',
        buttonText: 'Explore',
        theme: 'ethnic',
        discount: '35% OFF'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&auto=format&fit=crop&q=80',
        title: 'Winter Fashion',
        subtitle: 'Stay warm and stylish',
        link: '/category/winter',
        buttonText: 'Discover',
        theme: 'winter',
        discount: '30% OFF'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=1200&auto=format&fit=crop&q=80',
        title: 'Festive Special',
        subtitle: 'Sparkle this festive season',
        link: '/category/festive',
        buttonText: 'View Collection',
        theme: 'festive',
        discount: '25% OFF'
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
    const [subSubCategories, setSubSubCategories] = useState([]);
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
    const [activeCategory, setActiveCategory] = useState({ type: 'all', id: null });
    const [displayLimit, setDisplayLimit] = useState(20);

    // Scroll functionality states
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

    // Refs for scroll containers
    const categoriesScrollRef = useRef(null);
    const trendingScrollRef = useRef(null);
    const quickCategoriesScrollRef = useRef(null);

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);

                // Fetch main categories
                const mainCatResponse = await axios.get(`${API}/api/categories`);
                if (Array.isArray(mainCatResponse.data)) {
                    // Database se aaye categories ko store karo
                    const categoriesFromDB = mainCatResponse.data;
                    setMainCategories(categoriesFromDB);

                    // Category ID map ko update karo
                    categoriesFromDB.forEach(cat => {
                        const categoryName = cat.name || '';
                        if (categoryName.toLowerCase().includes('women')) {
                            categoryIdMap['Women'] = cat.id;
                        } else if (categoryName.toLowerCase().includes('men')) {
                            categoryIdMap['Men'] = cat.id;
                        } else if (categoryName.toLowerCase().includes('kid')) {
                            categoryIdMap['Kids'] = cat.id;
                        } else if (categoryName.toLowerCase().includes('ethnic')) {
                            categoryIdMap['Ethnic Wear'] = cat.id;
                        } else if (categoryName.toLowerCase().includes('western')) {
                            categoryIdMap['Western Wear'] = cat.id;
                        } else if (categoryName.toLowerCase().includes('accessor')) {
                            categoryIdMap['Accessories'] = cat.id;
                        }
                    });

                    console.log('✅ Category ID Mapping:', categoryIdMap);
                }

                // Fetch sub categories
                const subCatResponse = await axios.get(`${API}/api/subcategories`);
                if (Array.isArray(subCatResponse.data)) {
                    setSubCategories(subCatResponse.data);
                }

                // Fetch sub-sub categories
                const subSubCatResponse = await axios.get(`${API}/api/subsubcategories`);
                if (Array.isArray(subSubCatResponse.data)) {
                    setSubSubCategories(subSubCatResponse.data);
                }

            } catch (err) {
                console.error('❌ Error fetching categories:', err);

                // Fallback demo categories - database style
                const demoMainCategories = [
                    { id: 1, name: 'Men', slug: 'men', image: getCategoryImage('men') },
                    { id: 2, name: 'Women', slug: 'women', image: getCategoryImage('women') },
                    { id: 3, name: 'Kids', slug: 'kids', image: getCategoryImage('kids') },
                    { id: 4, name: 'Ethnic Wear', slug: 'ethnic-wear', image: getCategoryImage('ethnicwear') },
                    { id: 5, name: 'Western Wear', slug: 'western-wear', image: getCategoryImage('westernwear') },
                    { id: 6, name: 'Accessories', slug: 'accessories', image: getCategoryImage('accessories') }
                ];

                const demoSubCategories = [
                    { id: 1, name: 'Sarees', category_id: 2, slug: 'sarees' }, // Women (ID:2)
                    { id: 2, name: 'Kurtas', category_id: 2, slug: 'kurtas' }, // Women (ID:2)
                    { id: 3, name: 'Lehengas', category_id: 2, slug: 'lehengas' }, // Women (ID:2)
                    { id: 4, name: 'Shirts', category_id: 1, slug: 'shirts' }, // Men (ID:1)
                    { id: 5, name: 'T-Shirts', category_id: 1, slug: 't-shirts' }, // Men (ID:1)
                    { id: 6, name: 'Jeans', category_id: 1, slug: 'jeans' } // Men (ID:1)
                ];

                // Demo data ke liye bhi mapping set karo
                demoMainCategories.forEach(cat => {
                    const categoryName = cat.name || '';
                    if (categoryName.toLowerCase().includes('women')) {
                        categoryIdMap['Women'] = cat.id;
                    } else if (categoryName.toLowerCase().includes('men')) {
                        categoryIdMap['Men'] = cat.id;
                    } else if (categoryName.toLowerCase().includes('kid')) {
                        categoryIdMap['Kids'] = cat.id;
                    } else if (categoryName.toLowerCase().includes('ethnic')) {
                        categoryIdMap['Ethnic Wear'] = cat.id;
                    } else if (categoryName.toLowerCase().includes('western')) {
                        categoryIdMap['Western Wear'] = cat.id;
                    } else if (categoryName.toLowerCase().includes('accessor')) {
                        categoryIdMap['Accessories'] = cat.id;
                    }
                });

                setMainCategories(demoMainCategories);
                setSubCategories(demoSubCategories);
            }
        };

        fetchCategories();
    }, [API]);

    // ✅ Fetch Products
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

    // ✅ Product Data Sanitization - DYNAMIC CATEGORY MAPPING
    const sanitizeProductData = useCallback((products) => {
        return products.map((product, index) => {
            const originalPrice = Number(product.price) || 0;
            const discountPrice = Number(product.discountPrice) || 0;
            const discountPercentage = calculateDiscountPercentage(product);

            // Extract category information
            let categoryId = product.category_id || product.categoryId;

            // Agar category_id nahi hai ya product category name se match karo
            if (!categoryId || isNaN(categoryId)) {
                const categoryName = (product.category || "").toLowerCase();

                // Category name se ID map karo
                if (categoryName.includes('women')) {
                    categoryId = categoryIdMap['Women'];
                } else if (categoryName.includes('men')) {
                    categoryId = categoryIdMap['Men'];
                } else if (categoryName.includes('kid')) {
                    categoryId = categoryIdMap['Kids'];
                } else if (categoryName.includes('ethnic')) {
                    categoryId = categoryIdMap['Ethnic Wear'];
                } else if (categoryName.includes('western')) {
                    categoryId = categoryIdMap['Western Wear'];
                } else if (categoryName.includes('accessor')) {
                    categoryId = categoryIdMap['Accessories'];
                } else {
                    categoryId = null;
                }
            }

            // Convert to number
            categoryId = Number(categoryId) || null;

            return {
                id: product.id || product._id || `api-${index}`,
                name: product.name || "No Name",
                stock: Number(product.stock) || 0,
                price: originalPrice,
                discountPrice: discountPrice,
                category: (product.category || "general").toLowerCase(),
                sub_category: product.sub_category || '',
                sub_sub_category: product.sub_sub_category || '',
                category_id: categoryId,
                sub_category_id: Number(product.sub_category_id) || null,
                sub_sub_category_id: Number(product.sub_sub_category_id) || null,
                rating: product.rating || 0,
                discount: discountPercentage,
                image: getProductImage(product),
                images: product.images || [],
                createdAt: product.created_at || product.createdAt || new Date().toISOString(),
                isNew: product.isNew || false,
                pattern: product.pattern || '',
                description: product.description || 'No description available',
                sizes: product.sizes || ['S', 'M', 'L', 'XL'],
                colors: product.colors || ['Black', 'White', 'Red', 'Blue'],
                hasDiscount: discountPercentage > 0
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
                    console.log('✅ Products loaded with category mapping:', sanitized.map(p => ({
                        name: p.name,
                        category: p.category,
                        category_id: p.category_id,
                        mapped_to: mainCategories.find(c => c.id === p.category_id)?.name || 'Unknown'
                    })));
                    setProducts(sanitized);
                } else {
                    console.error('❌ API response is not an array:', response.data);
                    throw new Error('Invalid API response format');
                }
            } catch (err) {
                console.error('❌ Error fetching products:', err);

                // Fallback demo products with dynamic category mapping
                const demoProducts = [
                    {
                        id: 'demo-1',
                        name: 'Floral Print Maxi Dress',
                        stock: 10,
                        price: 1999,
                        discountPrice: 1499,
                        category: 'Women',
                        sub_category: 'Dresses',
                        rating: 4.5,
                        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80',
                        isNew: true
                    },
                    {
                        id: 'demo-2',
                        name: 'Men\'s Casual T-Shirt',
                        stock: 15,
                        price: 999,
                        discountPrice: 799,
                        category: 'Men',
                        sub_category: 'Tops',
                        rating: 4.3,
                        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80',
                        isNew: false
                    },
                    {
                        id: 'demo-3',
                        name: 'Silk Banarasi Saree',
                        stock: 5,
                        price: 3500,
                        discountPrice: 3500,
                        category: 'Women',
                        sub_category: 'Sarees',
                        rating: 4.8,
                        image: 'https://images.unsplash.com/photo-1585487000127-1a3b9e13980c?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-4',
                        name: 'Designer Anarkali Kurta',
                        stock: 15,
                        price: 1200,
                        discountPrice: 999,
                        category: 'Women',
                        sub_category: 'Kurtas',
                        rating: 4.2,
                        image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-5',
                        name: 'Men\'s Formal Shirt',
                        stock: 20,
                        price: 1499,
                        discountPrice: 1299,
                        category: 'Men',
                        sub_category: 'Shirts',
                        rating: 4.4,
                        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80'
                    },
                    {
                        id: 'demo-6',
                        name: 'Bridal Lehenga Set',
                        stock: 3,
                        price: 8999,
                        discountPrice: 6999,
                        category: 'Women',
                        sub_category: 'Lehengas',
                        rating: 4.9,
                        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80'
                    }
                ];

                const sanitizedDemo = sanitizeProductData(demoProducts);
                setProducts(sanitizedDemo);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [API, sanitizeProductData, mainCategories]);

    // ✅ Get Products by Category - IMPROVED VERSION
    const getProductsByCategory = (categoryType, categoryId, limit = 4) => {
        if (!categoryId || categoryType === 'all') {
            return products.slice(0, limit);
        }

        // Convert categoryId to number for comparison
        const searchId = Number(categoryId);

        if (categoryType === 'main') {
            const filtered = products.filter(product => {
                // Convert product category_id to number for comparison
                const productCatId = Number(product.category_id);
                return productCatId === searchId;
            });

            console.log(`🛍️ Getting products for category:`, {
                categoryId: searchId,
                categoryName: mainCategories.find(c => c.id === searchId)?.name || 'Unknown',
                totalProducts: products.length,
                filteredCount: filtered.length,
                filteredProducts: filtered.map(p => p.name)
            });

            return filtered.slice(0, limit);

        } else if (categoryType === 'sub') {
            const filtered = products.filter(product => {
                const productSubCatId = Number(product.sub_category_id);
                return productSubCatId === searchId;
            });
            return filtered.slice(0, limit);

        } else if (categoryType === 'subsub') {
            const filtered = products.filter(product => {
                const productSubSubCatId = Number(product.sub_sub_category_id);
                return productSubSubCatId === searchId;
            });
            return filtered.slice(0, limit);
        }

        return products.slice(0, limit);
    };

    // ✅ Get Filtered Products
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Category filter
        if (activeCategory.type !== 'all' && activeCategory.id) {
            const searchId = Number(activeCategory.id);

            if (activeCategory.type === 'main') {
                filtered = filtered.filter(p => Number(p.category_id) === searchId);
            } else if (activeCategory.type === 'sub') {
                filtered = filtered.filter(p => Number(p.sub_category_id) === searchId);
            } else if (activeCategory.type === 'subsub') {
                filtered = filtered.filter(p => Number(p.sub_sub_category_id) === searchId);
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
        return subCategories.filter(sub => Number(sub.category_id) === Number(mainCategoryId));
    };

    // ✅ Scroll Functions
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

    // ✅ Navigation Functions
    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % sliderItems.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length);
    const goToSlide = (index) => setCurrentSlide(index);
    const toggleAutoPlay = () => setAutoPlay(prev => !prev);
    const navigateTo = (path) => navigate(path);

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
            console.error('❌ Cart error:', error);
            alert(error.response?.data?.message || "Something went wrong");
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
    const filterByCategory = (type, id = null) => {
        console.log(`🎯 Filtering by category:`, {
            type,
            id,
            categoryName: mainCategories.find(c => c.id === id)?.name || 'Unknown'
        });
        setActiveCategory({ type, id });
    };
    const toggleFilters = () => setShowFilters(!showFilters);
    const showMoreCategories = () => setVisibleCategories(mainCategories.length);
    const loadMoreProducts = () => setDisplayLimit(prev => prev + 20);

    // ✅ Image Loading
    useEffect(() => {
        const totalImages = products.length + sliderItems.length + mainCategories.length;
        if (!totalImages) return;
        let loaded = 0;
        const onLoad = () => {
            loaded++;
            setProgress(Math.round((loaded / totalImages) * 100));
            if (loaded >= totalImages) setImagesLoaded(true);
        };

        mainCategories.forEach(cat => {
            const img = new Image();
            img.src = cat.image || getCategoryImage(cat.name);
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
    }, [products, mainCategories, getProductImage]);

    // ✅ Auto Slide
    useEffect(() => {
        if (!autoPlay || isLoading) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, isLoading]);

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

    // Debug info for category mapping
    console.log('🔍 Current Category Mapping:', categoryIdMap);
    console.log('📊 Main Categories:', mainCategories.map(c => ({ id: c.id, name: c.name })));

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

                {/* Main Categories Section */}
                <section className="categories-section">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Discover our exclusive fashion collections</p>
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
                                {mainCategories.slice(0, visibleCategories).map((category) => (
                                    <div
                                        key={category.id}
                                        className="category-card"
                                        onClick={() => {
                                            filterByCategory('main', category.id);
                                            navigate(`/category/${category.slug || category.id}`);
                                        }}
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
                                        <h3 className="category-title">
                                            {category.name}
                                        </h3>
                                        <p className="category-count">
                                            {getProductsByCategory('main', category.id).length} products
                                        </p>
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

                    {visibleCategories < mainCategories.length && (
                        <div className="show-more-container">
                            <button className="show-more-btn" onClick={showMoreCategories}>
                                Show All Categories
                            </button>
                        </div>
                    )}
                </section>

                {/* Category-wise Product Sections */}
                {mainCategories.slice(0, 4).map(mainCategory => {
                    const categoryProducts = getProductsByCategory('main', mainCategory.id, 4);

                    // Debug log for each category
                    console.log(`📊 Category Section: ${mainCategory.name} (ID: ${mainCategory.id})`, {
                        productCount: categoryProducts.length,
                        products: categoryProducts.map(p => ({
                            name: p.name,
                            category_id: p.category_id,
                            category: p.category
                        }))
                    });

                    if (categoryProducts.length === 0) {
                        console.log(`⚠️ No products found for ${mainCategory.name} (ID: ${mainCategory.id})`);
                        return null;
                    }

                    const subCats = getSubCategoriesForMain(mainCategory.id);

                    return (
                        <section key={mainCategory.id} className="category-section">
                            <div className="section-header">
                                <div className="category-header-info">
                                    <h2>{mainCategory.name}</h2>
                                    <p>Explore our exclusive {mainCategory.name.toLowerCase()} collection</p>
                                    {subCats.length > 0 && (
                                        <div className="sub-categories">
                                            {subCats.slice(0, 5).map(subCat => (
                                                <button
                                                    key={subCat.id}
                                                    className="sub-category-btn"
                                                    onClick={() => {
                                                        filterByCategory('sub', subCat.id);
                                                        navigate(`/category/${mainCategory.slug}/${subCat.slug || subCat.id}`);
                                                    }}
                                                >
                                                    {subCat.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="view-all square-btn"
                                    onClick={() => {
                                        filterByCategory('main', mainCategory.id);
                                        navigate(`/category/${mainCategory.slug || mainCategory.id}`);
                                    }}
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

                {/* Trending Products */}
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
                                    .map((product) => {
                                        const priceInfo = getDisplayPrice(product);
                                        return (
                                            <div key={product.id} className="trending-card">
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
                                                    <h3 className="product-name">{product.name}</h3>
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
                            onClick={() => {
                                // Ethnic Wear ka ID dynamically find karo
                                const ethnicWearId = categoryIdMap['Ethnic Wear'] || 4;
                                filterByCategory('main', ethnicWearId);
                                navigateTo('/category/ethnic-wear');
                            }}
                        >
                            Shop Now
                        </button>
                    </div>
                </section>

                {/* All Products Section with Filters */}
                <section className="featured-section">
                    <div className="section-header">
                        <h2>All Products</h2>
                        <div className="results-info">
                            <span>Showing {Math.min(displayLimit, getFilteredProducts().length)} of {getFilteredProducts().length} products</span>
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
                                <h4>Main Categories</h4>
                                <div className="category-filters">
                                    <button
                                        className={`category-filter ${activeCategory.type === 'all' ? 'active' : ''}`}
                                        onClick={() => filterByCategory('all')}
                                    >
                                        All Categories
                                    </button>
                                    {mainCategories.slice(0, 6).map(category => (
                                        <button
                                            key={category.id}
                                            className={`category-filter ${activeCategory.type === 'main' && activeCategory.id === category.id ? 'active' : ''}`}
                                            onClick={() => filterByCategory('main', category.id)}
                                        >
                                            {category.name}
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
                        {getFilteredProducts().slice(0, displayLimit).map((product) => {
                            const priceInfo = getDisplayPrice(product);
                            const isOutOfStock = product.stock <= 0;

                            return (
                                <div
                                    key={product.id}
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
                                        <h3 className="product-name">{product.name}</h3>

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

                    {/* Load More Button */}
                    {getFilteredProducts().length > displayLimit && (
                        <div className="load-more-container">
                            <button className="load-more-btn square-btn" onClick={loadMoreProducts}>
                                Load More Products
                            </button>
                        </div>
                    )}

                    {getFilteredProducts().length === 0 && (
                        <div className="no-products">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to see more results</p>
                            <button
                                className="reset-filters square-btn"
                                onClick={() => {
                                    filterByCategory('all');
                                    setActivePriceFilter('all');
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