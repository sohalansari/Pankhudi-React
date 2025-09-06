import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import './Collections.css';

const Collections = () => {
    const navigate = useNavigate();
    const { category } = useParams();

    // Sample collection data with Pankhudi branding
    const [collections, setCollections] = useState([
        {
            id: 1,
            title: 'Summer Collection',
            items: 24,
            image: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Summer',
            category: 'clothing',
            featured: true,
            description: 'Bright and colorful summer outfits perfect for sunny days',
            priceRange: '₹1,999 - ₹6,499',
            rating: 4.5,
            reviews: 128,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Red', 'Blue', 'Yellow', 'Green'],
            details: 'Lightweight, breathable fabric perfect for summer. Made from 100% organic cotton.'
        },
        {
            id: 2,
            title: 'Winter Essentials',
            items: 18,
            image: 'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Winter',
            category: 'clothing',
            featured: true,
            description: 'Stay warm and stylish with our winter collection',
            priceRange: '₹3,299 - ₹9,999',
            rating: 4.7,
            reviews: 95,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Black', 'Gray', 'Navy', 'Maroon'],
            details: 'Warm and cozy winter wear with premium insulation. Water-resistant outer layer.'
        },
        {
            id: 3,
            title: 'Accessories',
            items: 32,
            image: 'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Accessories',
            category: 'accessories',
            description: 'Complete your look with our stylish accessories',
            priceRange: '₹799 - ₹3,999',
            rating: 4.3,
            reviews: 76,
            sizes: ['One Size'],
            colors: ['Gold', 'Silver', 'Black', 'Brown'],
            details: 'Handcrafted accessories with attention to detail. Premium materials used.'
        },
        {
            id: 4,
            title: 'Footwear',
            items: 15,
            image: 'https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=Footwear',
            category: 'shoes',
            description: 'Comfortable and trendy footwear for every occasion',
            priceRange: '₹2,799 - ₹11,999',
            rating: 4.6,
            reviews: 112,
            sizes: ['6', '7', '8', '9', '10'],
            colors: ['White', 'Black', 'Brown', 'Blue'],
            details: 'Comfortable footwear with cushioned insoles. Durable soles for long-lasting wear.'
        },
        {
            id: 5,
            title: 'Formal Wear',
            items: 12,
            image: 'https://via.placeholder.com/300x400/FECA57/FFFFFF?text=Formal',
            category: 'clothing',
            description: 'Elegant formal wear for professional settings',
            priceRange: '₹3,999 - ₹14,999',
            rating: 4.4,
            reviews: 64,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'Navy', 'Gray', 'Charcoal'],
            details: 'Premium formal wear with perfect fit. Wrinkle-resistant fabric for all-day freshness.'
        },
        {
            id: 6,
            title: 'Sports Collection',
            items: 20,
            image: 'https://via.placeholder.com/300x400/FF9FF3/FFFFFF?text=Sports',
            category: 'sports',
            description: 'Performance gear for your active lifestyle',
            priceRange: '₹2,499 - ₹7,499',
            rating: 4.8,
            reviews: 87,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Red', 'Blue', 'Black', 'Green'],
            details: 'Moisture-wicking fabric keeps you dry. Flexible material for unrestricted movement.'
        },
        {
            id: 7,
            title: 'Ethnic Wear',
            items: 28,
            image: 'https://via.placeholder.com/300x400/F368E0/FFFFFF?text=Ethnic',
            category: 'clothing',
            featured: true,
            description: 'Traditional outfits for special occasions',
            priceRange: '₹3,599 - ₹13,999',
            rating: 4.9,
            reviews: 143,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Red', 'Blue', 'Green', 'Pink', 'Purple'],
            details: 'Authentic traditional designs with modern comfort. Intricate embroidery and detailing.'
        },
        {
            id: 8,
            title: 'Casual Collection',
            items: 22,
            image: 'https://via.placeholder.com/300x400/FF9F43/FFFFFF?text=Casual',
            category: 'clothing',
            description: 'Everyday casual wear for comfort and style',
            priceRange: '₹1,599 - ₹5,999',
            rating: 4.2,
            reviews: 91,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Black', 'Gray', 'Navy'],
            details: 'Comfortable everyday wear with soft fabric. Easy care and machine washable.'
        }
    ]);

    const [filter, setFilter] = useState(category || 'all');
    const [sortBy, setSortBy] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 15000]);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Set initial filter based on URL parameter
    useEffect(() => {
        if (category) {
            setFilter(category);
        }
    }, [category]);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Filter and sort collections
    const filteredCollections = collections.filter(item => {
        const matchesCategory = filter === 'all' || item.category === filter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Extract price range values (remove ₹ and commas)
        const priceMin = parseInt(item.priceRange.split(' - ')[0].replace('₹', '').replace(/,/g, ''));
        const priceMax = parseInt(item.priceRange.split(' - ')[1].replace('₹', '').replace(/,/g, ''));

        const matchesPrice = priceMin >= priceRange[0] && priceMax <= priceRange[1];
        return matchesCategory && matchesSearch && matchesPrice;
    });

    const sortedCollections = [...filteredCollections].sort((a, b) => {
        if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'items') {
            return b.items - a.items;
        } else if (sortBy === 'featured') {
            return (b.featured || false) - (a.featured || false);
        } else if (sortBy === 'price-high') {
            const priceB = parseInt(b.priceRange.split(' - ')[1].replace('₹', '').replace(/,/g, ''));
            const priceA = parseInt(a.priceRange.split(' - ')[1].replace('₹', '').replace(/,/g, ''));
            return priceB - priceA;
        } else if (sortBy === 'price-low') {
            const priceA = parseInt(a.priceRange.split(' - ')[0].replace('₹', '').replace(/,/g, ''));
            const priceB = parseInt(b.priceRange.split(' - ')[0].replace('₹', '').replace(/,/g, ''));
            return priceA - priceB;
        } else if (sortBy === 'rating') {
            return b.rating - a.rating;
        }
        return 0;
    });

    // Featured collections
    const featuredCollections = collections.filter(item => item.featured);

    // Handle collection click
    const handleCollectionClick = (collection) => {
        setSelectedCollection(collection);
        // Reset selection options when viewing a new product
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
    };

    // Handle back to collections
    const handleBackToCollections = () => {
        setSelectedCollection(null);
    };

    // Handle navigate back
    const handleNavigateBack = () => {
        navigate(-1);
    };

    // Handle buy now
    const handleBuyNow = () => {
        if (!selectedSize || !selectedColor) {
            alert('Please select size and color before purchasing');
            return;
        }
        alert(`Order placed for ${quantity} ${selectedCollection.title} (${selectedSize}, ${selectedColor})`);
        // Here you would typically navigate to a checkout page
    };

    // Render star ratings
    const renderRating = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<span key={i} className="star full">★</span>);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<span key={i} className="star half">★</span>);
            } else {
                stars.push(<span key={i} className="star">★</span>);
            }
        }

        return stars;
    };

    // Collection Detail View
    if (selectedCollection) {
        return (
            <div className="collection-detail-page">
                <button className="back-buttons" onClick={handleBackToCollections}>
                    &larr; Back to Collections
                </button>

                <div className="collection-detail">
                    <div className="detail-image">
                        <img src={selectedCollection.image} alt={selectedCollection.title} />
                    </div>
                    <div className="detail-info">
                        <h1>{selectedCollection.title}</h1>
                        <div className="detail-meta">
                            <span className="items-count">{selectedCollection.items} items</span>
                            <span className="category-badge">{selectedCollection.category}</span>
                            {selectedCollection.featured && <span className="featured-badge">Featured</span>}
                        </div>
                        <div className="rating">
                            {renderRating(selectedCollection.rating)}
                            <span className="rating-value">({selectedCollection.rating})</span>
                            <span className="reviews">{selectedCollection.reviews} reviews</span>
                        </div>
                        <p className="description">{selectedCollection.description}</p>
                        <div className="price-range">
                            <span className="label">Price Range:</span>
                            <span className="value">{selectedCollection.priceRange}</span>
                        </div>

                        {/* Product Options */}
                        <div className="product-options">
                            <div className="option-group">
                                <label htmlFor="size-select">Size:</label>
                                <select
                                    id="size-select"
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    required
                                >
                                    <option value="">Select Size</option>
                                    {selectedCollection.sizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="color-select">Color:</label>
                                <select
                                    id="color-select"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    required
                                >
                                    <option value="">Select Color</option>
                                    {selectedCollection.colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="quantity">Quantity:</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    max="10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="product-details">
                            <h3>Product Details</h3>
                            <p>{selectedCollection.details}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className="buy-now-btn" onClick={handleBuyNow}>Buy Now</button>
                            <button className="add-to-cart-btn">Add to Cart</button>
                        </div>

                        <div className="detail-actions">
                            <button className="action-btn wishlist">❤️ Add to Wishlist</button>
                            <button className="action-btn share">📤 Share Collection</button>
                        </div>
                    </div>
                </div>

                <div className="related-collections">
                    <h2>You Might Also Like</h2>
                    <div className="related-grid">
                        {collections.filter(c => c.id !== selectedCollection.id && c.category === selectedCollection.category)
                            .slice(0, 3)
                            .map(collection => (
                                <div key={collection.id} className="related-card" onClick={() => handleCollectionClick(collection)}>
                                    <img src={collection.image} alt={collection.title} />
                                    <h4>{collection.title}</h4>
                                    <p>{collection.priceRange}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="collections-page">
            {/* Header with Pankhudi branding */}
            <header className="collections-header">
                <button className="navigate-back-btn" onClick={handleNavigateBack}>
                    &larr; Back
                </button>
                <div className="brand-container">
                    <h1 className="brand-name">Pankhudi</h1>
                    <p className="brand-tagline">Where Style Takes Flight</p>
                </div>
                <h2 className="page-title">Our Collections</h2>
                <p className="page-subtitle">Discover our curated selection of premium products</p>
            </header>

            {/* Featured Collections Carousel */}
            {featuredCollections.length > 0 && (
                <section className="featured-collections">
                    <h3 className="section-title">Featured Collections</h3>
                    <div className="featured-carousel">
                        {featuredCollections.map(collection => (
                            <div key={`featured-${collection.id}`} className="featured-card" onClick={() => handleCollectionClick(collection)}>
                                <div className="featured-image">
                                    <img src={collection.image} alt={collection.title} />
                                    <div className="featured-overlay">
                                        <button className="featured-button">Explore Now</button>
                                    </div>
                                </div>
                                <div className="featured-info">
                                    <h4>{collection.title}</h4>
                                    <p>{collection.items} items</p>
                                    <p className="price">{collection.priceRange}</p>
                                    <div className="featured-rating">
                                        {renderRating(collection.rating)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Controls Section */}
            <div className="collections-controls">
                <div className="controls-left">
                    <div className="search-boxs">
                        <input
                            type="text"
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'view-btn active' : 'view-btn'}
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                        >
                            ▣
                        </button>
                        <button
                            className={viewMode === 'list' ? 'view-btn active' : 'view-btn'}
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                        >
                            ≡
                        </button>
                    </div>

                    <button
                        className="filter-toggle"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div className="sort-options">
                    <label htmlFor="sort">Sort by:</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="title">Title</option>
                        <option value="items">Number of Items</option>
                        <option value="featured">Featured First</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="rating">Rating</option>
                    </select>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="advanced-filters">
                    <h4>Price Range: ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}</h4>
                    <input
                        type="range"
                        min="0"
                        max="15000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="price-slider"
                    />
                    <div className="filter-buttons">
                        <button onClick={() => setPriceRange([0, 5000])}>Under ₹5,000</button>
                        <button onClick={() => setPriceRange([5000, 10000])}>₹5,000 - ₹10,000</button>
                        <button onClick={() => setPriceRange([10000, 15000])}>₹10,000 - ₹15,000</button>
                        <button onClick={() => setPriceRange([0, 15000])}>Reset</button>
                    </div>
                </div>
            )}

            {/* Collections Grid */}
            {isLoading ? (
                <div className="loading-spin">
                    <div className="spin"></div>
                    <p>Loading collections...</p>
                </div>
            ) : (
                <>
                    <div className={`collections-container ${viewMode}`}>
                        {sortedCollections.map(collection => (
                            <div
                                key={collection.id}
                                className={`collection-card ${viewMode}`}
                                onClick={() => handleCollectionClick(collection)}
                            >
                                <div className="collection-image">
                                    <img src={collection.image} alt={collection.title} />
                                    <div className="collection-overlay">
                                        <button className="view-button">View Collection</button>
                                    </div>
                                    {collection.featured && <div className="featured-badge">Featured</div>}
                                </div>
                                <div className="collection-info">
                                    <h3>{collection.title}</h3>
                                    <p>{collection.items} items</p>
                                    <span className="collection-category">{collection.category}</span>
                                    <div className="collection-price">{collection.priceRange}</div>
                                    <div className="collection-rating">
                                        {renderRating(collection.rating)}
                                        <span>({collection.reviews})</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sortedCollections.length === 0 && (
                        <div className="no-results">
                            <h3>No collections found</h3>
                            <p>Try selecting a different category or search term</p>
                        </div>
                    )}

                    {/* Pagination (placeholder) */}
                    {sortedCollections.length > 0 && (
                        <div className="pagination">
                            <button className="page-btn">Previous</button>
                            <span className="page-info">Page 1 of 2</span>
                            <button className="page-btn">Next</button>
                        </div>
                    )}
                </>
            )}
            <div className="footer">
                <Footer />
            </div>
        </div>
    );
};

export default Collections;