import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

// Helper functions for images
const getCategoryImage = (category) => {
    const categoryImages = {
        dresses: 'https://img.kwcdn.com/product/enhanced_images/4bd92b3ed9fadfea0c9752692a9e19a1_enhanced.jpg?imageView2/2/w/800/q/70',
        tops: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop',
        skirts: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop',
        ethnicwear: 'https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS62_1_1200x.jpg?v=1740035852',
        winterwear: 'https://hulaglobal.com/wp-content/uploads/2024/11/Classic-wool-coat-683x1024.webp',
        accessories: 'https://miro.medium.com/v2/resize:fit:1200/1*w2ZtNewCRB7uakMLKuME6A.jpeg',
        lehengas: 'https://i.etsystatic.com/25647034/r/il/39b3f5/5232058934/il_1080xN.5232058934_29m2.jpg',
        suits: 'https://d17a17kld06uk8.cloudfront.net/products/N6MMXXW/CI8C43E7-original.jpg'
    };
    return categoryImages[category] || 'https://via.placeholder.com/300x200?text=Category+Image';
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
        suits: 'https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg'
    };
    return fallbackImages[category] || 'https://via.placeholder.com/300x200?text=Product+Image';
};

const convertToINR = (usdPrice) => {
    const conversionRate = 83.5;
    return Math.round(usdPrice * conversionRate);
};

const products = [
    { id: 1, name: 'Floral Summer Dress', price: convertToINR(14.99), image: 'https://assets.myntassets.com/dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2024/JULY/25/6fLiiEYH_6c261927f7fd4270a9060e769ebbab0b.jpg', rating: 4.5, discount: 20, category: 'dresses', pattern: 'floral' },
    { id: 2, name: 'Party Gown with Sequins', price: convertToINR(24.99), image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=500&auto=format&fit=crop', rating: 4.7, category: 'dresses', pattern: 'sequins' },
    { id: 3, name: 'Cotton Casual Dress', price: convertToINR(9.99), image: 'https://i5.walmartimages.com/asr/4d8598c6-2488-42b6-8f8f-dfbf9b6d2769.5c5d1aca409d9588f46e909c2e2c4bbe.jpeg', rating: 4.2, discount: 10, category: 'dresses', pattern: 'solid' },
    { id: 4, name: 'Striped Summer Dress', price: convertToINR(12.99), image: 'https://i.pinimg.com/originals/56/45/58/56455805102cb325429c575bf9c3d8fd.jpg', rating: 4.3, category: 'dresses', pattern: 'striped' },
    { id: 5, name: 'Denim Pinafore Dress', price: convertToINR(19.99), image: 'https://i.pinimg.com/originals/4f/1c/7e/4f1c7edd51fb92222f282d03f0871936.jpg', rating: 4.4, category: 'dresses', pattern: 'denim' },
    { id: 6, name: 'Printed Cotton T-Shirt', price: convertToINR(7.99), image: 'https://assets.myntassets.com/h_200,w_200,c_fill,g_auto/h_1440,q_100,w_1080/v1/assets/images/29490844/2024/5/11/55863cee-6c8c-4c6c-8e81-60c2f0d573c91715423030221MonteCarloPrintTop1.jpg', rating: 4.3, discount: 15, category: 'tops', pattern: 'printed' },
    { id: 7, name: 'Ruffled Blouse', price: convertToINR(12.99), image: 'https://cdnb.lystit.com/photos/2012/07/07/brooks-brothers-white-noniron-cotton-ruffle-blouse-with-xla-product-1-4115777-803265422.jpeg', rating: 4.5, category: 'tops', pattern: 'ruffled' },
    { id: 8, name: 'Sleeveless Crop Top', price: convertToINR(8.99), image: 'https://academy.scene7.com/is/image/academy/20891745?$pdp-gallery-ng$', rating: 4.1, discount: 10, category: 'tops', pattern: 'solid' },
    { id: 9, name: 'Striped Off-Shoulder Top', price: convertToINR(11.99), image: 'http://img.shein.com/images/shein.com/201609/43/14748542626230334483.jpg', rating: 4.4, category: 'tops', pattern: 'striped' },
    { id: 10, name: 'Plaid Button-Down Shirt', price: convertToINR(14.99), image: 'https://i.pinimg.com/originals/0f/be/1c/0fbe1ca641a8e65e647b84dbc0cb04e4.png', rating: 4.6, discount: 10, category: 'tops', pattern: 'plaid' },
    { id: 11, name: 'Geometric Pattern Blouse', price: convertToINR(16.99), image: 'https://m.media-amazon.com/images/I/61Jk8gZ+nIL._AC_UY1100_.jpg', rating: 4.3, category: 'tops', pattern: 'geometric' },
    { id: 12, name: 'Pleated School Skirt', price: convertToINR(14.99), image: 'https://m.media-amazon.com/images/I/61fSRtbAFNL._AC_UY1100_.jpg', rating: 4.6, category: 'skirts', pattern: 'pleated' },
    { id: 13, name: 'Denim Mini Skirt', price: convertToINR(11.99), image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop', rating: 4.2, discount: 12, category: 'skirts', pattern: 'denim' },
    { id: 14, name: 'Tiered Floral Skirt', price: convertToINR(17.99), image: 'https://m.media-amazon.com/images/I/71Hn7QOZfEL._AC_UY1100_.jpg', rating: 4.5, category: 'skirts', pattern: 'floral' },
    { id: 15, name: 'Tartan Pattern Skirt', price: convertToINR(15.99), image: 'https://m.media-amazon.com/images/I/71KjHf0YJKL._AC_UY1100_.jpg', rating: 4.3, discount: 5, category: 'skirts', pattern: 'tartan' },
    { id: 16, name: 'Anarkali Suit Set', price: convertToINR(29.99), image: 'https://images.unsplash.com/photo-1595341595379-cf0f2a7ab4a4?w=500&auto=format&fit=crop', rating: 4.8, category: 'ethnicwear', pattern: 'embroidered' },
    { id: 17, name: 'Lehenga Choli Set', price: convertToINR(49.99), image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop', rating: 4.9, discount: 15, category: 'lehengas', pattern: 'zari' },
    { id: 18, name: 'Kurta with Palazzo', price: convertToINR(19.99), image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=500&auto=format&fit=crop', rating: 4.5, category: 'suits', pattern: 'printed' },
    { id: 19, name: 'Banarasi Silk Saree', price: convertToINR(59.99), image: 'https://www.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/w/sw-l-10465-maroon-and-golden-embroidered-net-lehenga-choli.jpg', rating: 4.9, category: 'ethnicwear', pattern: 'banarasi' },
    { id: 20, name: 'Kalamkari Printed Suit', price: convertToINR(24.99), image: 'https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg', rating: 4.7, discount: 10, category: 'suits', pattern: 'kalamkari' },
    { id: 21, name: 'Bandhani Lehenga', price: convertToINR(39.99), image: 'https://www.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/w/sw-l-10465-maroon-and-golden-embroidered-net-lehenga-choli.jpg', rating: 4.8, category: 'lehengas', pattern: 'bandhani' },
    { id: 22, name: 'Phulkari Dupatta Set', price: convertToINR(17.99), image: 'https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg', rating: 4.6, category: 'ethnicwear', pattern: 'phulkari' },
    { id: 23, name: 'Woolen Sweater', price: convertToINR(22.99), image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4iZ7RHloK-eEUU-EVu1rd7KzNgTM_CStu88RMOuVRVvrz2sy_x5F3KkItuIr-SGZhq5I&usqp=CAU', rating: 4.3, discount: 10, category: 'winterwear', pattern: 'cable-knit' },
    { id: 24, name: 'Padded Jacket', price: convertToINR(34.99), image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop', rating: 4.6, category: 'winterwear', pattern: 'quilted' },
    { id: 25, name: 'Fair Isle Pattern Sweater', price: convertToINR(27.99), image: 'https://m.media-amazon.com/images/I/71KjHf0YJKL._AC_UY1100_.jpg', rating: 4.5, category: 'winterwear', pattern: 'fair-isle' },
    { id: 26, name: 'Houndstooth Coat', price: convertToINR(39.99), image: 'https://m.media-amazon.com/images/I/61vHX6TlTPL._AC_UY1100_.jpg', rating: 4.7, discount: 15, category: 'winterwear', pattern: 'houndstooth' },
    { id: 27, name: 'Hair Clips Set', price: convertToINR(4.99), image: 'https://images.unsplash.com/photo-1607602132700-0681204692c5?w=500&auto=format&fit=crop', rating: 4.2, category: 'accessories', pattern: 'floral' },
    { id: 28, name: 'Printed Scrunchies', price: convertToINR(3.99), image: 'https://images.unsplash.com/photo-1607602132863-4c6c92a1e20e?w=500&auto=format&fit=crop', rating: 4.0, discount: 5, category: 'accessories', pattern: 'printed' },
    { id: 29, name: 'Polka Dot Party Dress', price: convertToINR(22.99), image: 'https://m.media-amazon.com/images/I/61DvVQH5VCL._AC_UY1100_.jpg', rating: 4.6, discount: 15, category: 'dresses', pattern: 'polka-dot' },
    { id: 30, name: 'Tie-Dye Maxi Dress', price: convertToINR(18.99), image: 'https://m.media-amazon.com/images/I/71Hn7QOZfEL._AC_UY1100_.jpg', rating: 4.3, category: 'dresses', pattern: 'tie-dye' },
    { id: 31, name: 'Chevron Pattern Dress', price: convertToINR(16.99), image: 'https://m.media-amazon.com/images/I/61Jk8gZ+nIL._AC_UY1100_.jpg', rating: 4.5, discount: 10, category: 'dresses', pattern: 'chevron' },
    { id: 32, name: 'Animal Print Dress', price: convertToINR(21.99), image: 'https://m.media-amazon.com/images/I/61vHX6TlTPL._AC_UY1100_.jpg', rating: 4.4, category: 'dresses', pattern: 'animal-print' },
    { id: 33, name: 'Designer Handbag', price: convertToINR(39.99), image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop', rating: 4.4, category: 'accessories', pattern: 'embossed' },
    { id: 34, name: 'Paisley Print Scarf', price: convertToINR(8.99), image: 'https://m.media-amazon.com/images/I/61Jk8gZ+nIL._AC_UY1100_.jpg', rating: 4.3, category: 'accessories', pattern: 'paisley' },
    { id: 35, name: 'Zigzag Pattern Socks', price: convertToINR(5.99), image: 'https://m.media-amazon.com/images/I/61f+4SdZbIL._AC_UY1100_.jpg', rating: 4.1, discount: 10, category: 'accessories', pattern: 'zigzag' }
];

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
        image: 'https://www.andindia.com/on/demandware.static/-/Sites-AND-Library/default/dwf51e2df3/images/May%202025/PLP%20New%20Arrivals.jpg',
        title: 'New Arrivals',
        subtitle: 'Fresh styles for the season',
        link: '/new-arrivals',
        buttonText: 'Discover Now',
        theme: 'new'
    },
    {
        id: 5,
        image: 'https://cdn.shopify.com/s/files/1/0341/4805/7228/files/Bakra_Eid.jpg?v=1746708452',
        title: 'Festive Special',
        subtitle: 'Exclusive festive collection with 30% off',
        link: '/festive-collection',
        buttonText: 'Shop Festive',
        theme: 'festive'
    },
    {
        id: 6,
        image: 'https://www.fashiongonerogue.com/wp-content/uploads/2021/12/Mannequins-Womens-Clothing-Store-Red-Palette.jpg',
        title: 'Pattern Paradise',
        subtitle: 'Explore our vibrant patterned collection',
        link: '/patterned-collection',
        buttonText: 'Explore Patterns',
        theme: 'patterns'
    }
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const navigate = useNavigate();
    const testimonialsScrollRef = useRef(null);

    // Scroll functions - add these
    const scrollLeft = () => {
        if (testimonialsScrollRef.current) {
            testimonialsScrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (testimonialsScrollRef.current) {
            testimonialsScrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };
    useEffect(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        const totalImages = products.length + sliderItems.length + uniqueCategories.length;
        let loaded = 0;

        const onLoad = () => {
            loaded++;
            if (loaded >= totalImages) {
                setImagesLoaded(true);
            }
        };

        uniqueCategories.forEach(category => {
            const img = new Image();
            img.src = getCategoryImage(category);
            img.onload = onLoad;
            img.onerror = onLoad;
        });

        products.forEach(product => {
            const img = new Image();
            img.src = product.image;
            img.onload = onLoad;
            img.onerror = () => {
                img.src = getFallbackProductImage(product.category);
                onLoad();
            };
        });

        sliderItems.forEach(item => {
            const img = new Image();
            img.src = item.image;
            img.onload = onLoad;
            img.onerror = onLoad;
        });
    }, []);

    useEffect(() => {
        if (!imagesLoaded) return;

        const timer = setTimeout(() => setIsLoading(false), 2000);
        const progressTimer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressTimer);
                    return 100;
                }
                return prev + (imagesLoaded ? 20 : 5);
            });
        }, 200);

        return () => {
            clearTimeout(timer);
            clearInterval(progressTimer);
        };
    }, [imagesLoaded]);

    useEffect(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        setCategories(uniqueCategories);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        if (!autoPlay || isLoading) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoPlay, isLoading]);

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

    const handleAddToCart = (product) => {
        if (!isLoggedIn) {
            alert('Please login to add items to the cart.');
            navigate('/login');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.id === product.id);

        if (index !== -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    };

    const filterProducts = (pattern) => {
        setActiveFilter(pattern);
    };

    const getFilteredProducts = () => {
        if (activeFilter === 'all') return products;
        return products.filter(product => product.pattern === activeFilter);
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
                    <p>Loading your fashion world...</p>
                    {!imagesLoaded && progress < 100 && (
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
                            {categories.map((category, index) => (
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
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Category+Image';
                                            }}
                                        />
                                        <div className="category-overlay">
                                            <button className="shop-now-btn">
                                                Shop Now
                                                <span className="btn-arrow">→</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



                <section className="pattern-filter-section">
                    <h3>Shop by Pattern</h3>
                    <div className="pattern-filters">
                        <button
                            className={`pattern-filter ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => filterProducts('all')}
                        >
                            All
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'floral' ? 'active' : ''}`}
                            onClick={() => filterProducts('floral')}
                        >
                            Floral
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'striped' ? 'active' : ''}`}
                            onClick={() => filterProducts('striped')}
                        >
                            Striped
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'polka-dot' ? 'active' : ''}`}
                            onClick={() => filterProducts('polka-dot')}
                        >
                            Polka Dot
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'geometric' ? 'active' : ''}`}
                            onClick={() => filterProducts('geometric')}
                        >
                            Geometric
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'embroidered' ? 'active' : ''}`}
                            onClick={() => filterProducts('embroidered')}
                        >
                            Ethnic
                        </button>
                    </div>
                </section>

                <section className="featured-section">
                    <div className="section-header">
                        <h2>All Products</h2>
                        <button
                            className="view-all"
                            onClick={() => navigateTo('/products')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="products-grid">
                        {getFilteredProducts().map((product) => (
                            <div
                                key={product.id}
                                className="product-card"
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                {product.discount && (
                                    <span className="discount-badge">-{product.discount}%</span>
                                )}
                                <div className="product-image">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = getFallbackProductImage(product.category);
                                        }}
                                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                    />
                                    <button
                                        className={`quick-view ${hoveredProduct === product.id ? 'visible' : ''}`}
                                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                    >
                                        Quick View
                                    </button>
                                    <span className="product-pattern">{product.pattern}</span>
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <div className="price-container">
                                        {product.discount ? (
                                            <>
                                                <span className="original-price">₹{product.price}</span>
                                                <span className="discounted-price">
                                                    ₹{Math.round(product.price * (1 - product.discount / 100))}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="price">₹{product.price}</span>
                                        )}
                                    </div>
                                    <div className="product-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                                            >
                                                {i < Math.floor(product.rating) ? '★' : '☆'}
                                            </span>
                                        ))}
                                        <span>({product.rating.toFixed(1)})</span>
                                    </div>
                                    <button
                                        className="add-to-cart"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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
                            .filter(p => p.rating >= 4.5)
                            .slice(0, 4)
                            .map(product => (
                                <div key={product.id} className="trending-card">
                                    <div className="trending-image">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = getFallbackProductImage(product.category);
                                            }}
                                            onClick={() => navigateTo(`/product/${product.id}`)}
                                        />
                                        <span className="trending-pattern">{product.pattern}</span>
                                    </div>
                                    <div className="trending-info">
                                        <h3>{product.name}</h3>
                                        <div className="trending-price">
                                            {product.discount ? (
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

                <section className="pattern-showcase">
                    <div className="pattern-header">
                        <h2>Our Pattern Collection</h2>
                        <p>Discover beautiful Indian patterns</p>
                    </div>

                    <div className="pattern-slider">
                        <div className="pattern-slide" onClick={() => filterProducts('floral')}>
                            <div className="slide-content">
                                <h3>Floral</h3>
                                <p>Elegant flower designs</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('geometric')}>
                            <div className="slide-content">
                                <h3>Geometric</h3>
                                <p>Modern shapes & patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('ethnic')}>
                            <div className="slide-content">
                                <h3>Ethnic</h3>
                                <p>Traditional Indian motifs</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('striped')}>
                            <div className="slide-content">
                                <h3>Striped</h3>
                                <p>Classic stripe patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('polka-dot')}>
                            <div className="slide-content">
                                <h3>Polka Dot</h3>
                                <p>Playful dot patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('paisley')}>
                            <div className="slide-content">
                                <h3>Paisley</h3>
                                <p>Traditional teardrop motifs</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('ikat')}>
                            <div className="slide-content">
                                <h3>Ikat</h3>
                                <p>Resist dyeing technique</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('block-print')}>
                            <div className="slide-content">
                                <h3>Block Print</h3>
                                <p>Handcrafted printing art</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('embroidered')}>
                            <div className="slide-content">
                                <h3>Embroidered</h3>
                                <p>Intricate thread work</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('checkered')}>
                            <div className="slide-content">
                                <h3>Checkered</h3>
                                <p>Classic check patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('animal-print')}>
                            <div className="slide-content">
                                <h3>Animal Print</h3>
                                <p>Wild & exotic patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('tie-dye')}>
                            <div className="slide-content">
                                <h3>Tie Dye</h3>
                                <p>Colorful dye patterns</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="testimonials-section">
                    <div className="testimonials-header">
                        <h2>What Our Customers Say</h2>
                        <p>Hear from our satisfied customers across India</p>
                    </div>

                    <div className="testimonials-container">
                        {/* Left Scroll Button - Positioned at middle left */}
                        <button className="scroll-btn scroll-left" onClick={scrollLeft}>
                            ‹
                        </button>

                        {/* Testimonials Scroll Container */}
                        <div className="testimonials-scroll-container">
                            <div className="testimonials-scroll" ref={testimonialsScrollRef}>
                                {/* Testimonial 1 */}
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"The floral dress I bought is absolutely beautiful! The quality exceeded my expectations and the fit was perfect for Indian weddings."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW5kaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
                                            alt="Priya Sharma"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Priya Sharma</span>
                                            <span className="author-location">Mumbai, Maharashtra</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 2 */}
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Great collection of ethnic wear. The delivery was fast and the packaging was excellent. Perfect for festival season!"</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1516726817505-5ed934c485c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGluZGlhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Ananya Patel"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Ananya Patel</span>
                                            <span className="author-location">Ahmedabad, Gujarat</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 3 */}
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★☆
                                        <span className="rating-text">4.5</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Love the variety of patterns available. The customer service is top-notch! Will definitely shop again."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVyc29ufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Meera Gupta"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Meera Gupta</span>
                                            <span className="author-location">Delhi, NCR</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 4 */}
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"The silk sarees are absolutely authentic and the embroidery work is exquisite. Perfect for traditional occasions!"</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGluZGlhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Sneha Reddy"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Sneha Reddy</span>
                                            <span className="author-location">Hyderabad, Telangana</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 5 */}
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★☆
                                        <span className="rating-text">4.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Amazing quality and authentic Indian designs. The colors are vibrant and the fabric is comfortable."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aW5kaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
                                            alt="Divya Singh"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Divya Singh</span>
                                            <span className="author-location">Lucknow, Uttar Pradesh</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 6 */}
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Fast shipping and excellent customer support. The products are exactly as shown in the pictures."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGluZGlhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Riya Malhotra"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Riya Malhotra</span>
                                            <span className="author-location">Chandigarh, Punjab</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Scroll Button - Positioned at middle right */}
                        <button className="scroll-btn scroll-right" onClick={scrollRight}>
                            ›
                        </button>
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