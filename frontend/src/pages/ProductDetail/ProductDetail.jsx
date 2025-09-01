import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('description');
    const [imageLoading, setImageLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Format price in Indian Rupees
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Sample product data with Indian prices
    const products = [
        {
            id: 1,
            name: "Premium Wireless Headphones",
            price: 14999,
            discount: 15,
            rating: 4.5,
            reviews: 128,
            pattern: "Wireless",
            category: "electronics",
            images: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhlYWRwaG9uZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
            ],
            description: "Experience premium sound quality with our wireless headphones. Featuring noise cancellation, 30-hour battery life, and comfortable over-ear design.",
            features: [
                "Active Noise Cancellation",
                "30-hour battery life",
                "Bluetooth 5.0",
                "Built-in microphone",
                "Foldable design"
            ],
            specifications: {
                "Weight": "250g",
                "Battery Life": "30 hours",
                "Charging Time": "2 hours",
                "Connectivity": "Bluetooth 5.0",
                "Frequency Response": "20Hz - 20kHz"
            },
            options: {
                color: ["Black", "White", "Blue", "Red"],
                warranty: ["1 Year", "2 Years", "3 Years"]
            },
            inStock: true,
            stockCount: 15
        },
        {
            id: 2,
            name: "Smart Fitness Watch",
            price: 11999,
            discount: 10,
            rating: 4.3,
            reviews: 96,
            pattern: "Smart",
            category: "electronics",
            images: [
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0Y2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGNofGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdhdGNofGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1585123334904-845d60e97b29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHdhdGNofGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
            ],
            description: "Track your fitness goals with our advanced smartwatch. Monitor heart rate, sleep patterns, and receive smartphone notifications directly on your wrist.",
            features: [
                "Heart rate monitor",
                "Sleep tracking",
                "Water resistant",
                "7-day battery life",
                "Smart notifications"
            ],
            specifications: {
                "Display": "1.3\" AMOLED",
                "Battery Life": "7 days",
                "Water Resistance": "5 ATM",
                "Compatibility": "iOS & Android",
                "Sensors": "Heart rate, GPS, Accelerometer"
            },
            options: {
                color: ["Black", "Silver", "Rose Gold"],
                size: ["Small", "Medium", "Large"],
                warranty: ["1 Year", "2 Years"]
            },
            inStock: true,
            stockCount: 8
        },
        {
            id: 3,
            name: "Ergonomic Office Chair",
            price: 22499,
            discount: 20,
            rating: 4.7,
            reviews: 204,
            pattern: "Modern",
            category: "furniture",
            images: [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1519947486511-46149fa0a254?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
                "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNoYWlyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
            ],
            description: "Work in comfort with our ergonomic office chair. Designed for long hours of sitting with lumbar support, adjustable height, and breathable mesh material.",
            features: [
                "Lumbar support",
                "Adjustable height",
                "Breathable mesh",
                "360-degree rotation",
                "Ergonomic design"
            ],
            specifications: {
                "Material": "Mesh & Aluminum",
                "Max Weight Capacity": "300 lbs",
                "Adjustments": "Height, Armrests, Lumbar",
                "Dimensions": "26\" x 27\" x 45\"",
                "Warranty": "5 years"
            },
            options: {
                color: ["Black", "Gray", "Blue"],
                material: ["Mesh", "Leather", "Fabric"]
            },
            inStock: true,
            stockCount: 12
        }
    ];

    useEffect(() => {
        // Simulate API loading delay
        const timer = setTimeout(() => {
            const foundProduct = products.find(p => p.id === parseInt(id));
            setProduct(foundProduct);

            if (foundProduct && foundProduct.options) {
                const defaultOptions = {};
                Object.keys(foundProduct.options).forEach(key => {
                    defaultOptions[key] = foundProduct.options[key][0];
                });
                setSelectedOptions(defaultOptions);
            }

            if (foundProduct) {
                const related = products.filter(
                    p => p.category === foundProduct.category && p.id !== foundProduct.id
                );
                setRelatedProducts(related);
            }

            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [id]);

    const nextImage = () => {
        if (product) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
            );
            setImageLoading(true);
        }
    };

    const prevImage = () => {
        if (product) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
            );
            setImageLoading(true);
        }
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
        setImageLoading(true);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleOptionChange = (optionType, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionType]: value
        }));
    };

    const handleAddToCart = () => {
        const button = document.querySelector('.add-to-cart-btn');
        button.classList.add('adding');
        setTimeout(() => {
            button.classList.remove('adding');
            alert(`Added to cart: ${product.name} (Quantity: ${quantity})`);
        }, 600);
    };

    const handleBuyNow = () => {
        const button = document.querySelector('.buy-now-btn');
        button.classList.add('buying');
        setTimeout(() => {
            button.classList.remove('buying');
            alert(`Buying now: ${product.name} (Quantity: ${quantity})`);
        }, 600);
    };

    if (isLoading) {
        return (
            <div className="product-detail-container">
                <div className="product-detail">
                    <div className="product-detail-content">
                        {/* Loading skeleton for images */}
                        <div className="product-images">
                            <div className="main-image">
                                <div className="image-loader"></div>
                            </div>
                            <div className="image-thumbnails">
                                {[1, 2, 3, 4].map((index) => (
                                    <div key={index} className="loading-thumbnail"></div>
                                ))}
                            </div>
                        </div>

                        {/* Loading skeleton for product info */}
                        <div className="product-info loading">
                            <div className="product-title-loader"></div>
                            <div className="price-loader"></div>
                            <div className="description-loader"></div>
                            <div className="description-loader"></div>
                            <div className="description-loader"></div>
                            <div className="description-loader"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <div className="loading-spinner"></div>
                <p>Product not found</p>
            </div>
        );
    }

    const discountedPrice = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    return (
        <div className="product-detail-container">
            <div className="product-detail">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span> /
                    <span onClick={() => navigate('/products')}> Products</span> /
                    <span> {product.name}</span>
                </div>

                <div className="product-detail-content">
                    {/* Product Images with Slider */}
                    <div className="product-images">
                        <div className="main-image">
                            {imageLoading && <div className="image-loader"></div>}
                            <img
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                onLoad={handleImageLoad}
                                className={imageLoading ? 'loading' : 'loaded'}
                                style={{ opacity: imageLoading ? 0 : 1 }}
                            />
                            <button className="nav-button prev" onClick={prevImage}>
                                &#8249;
                            </button>
                            <button className="nav-button next" onClick={nextImage}>
                                &#8250;
                            </button>
                            {product.discount && (
                                <div className="discount-badge">-{product.discount}%</div>
                            )}
                        </div>
                        <div className="image-thumbnails">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail-container ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => goToImage(index)}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} view ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <h1>{product.name}</h1>
                        <div className="product-meta">
                            <div className="product-rating">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="rating-value">{product.rating.toFixed(1)}</span>
                                <span className="reviews-count">({product.reviews} reviews)</span>
                            </div>
                            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                {product.inStock ? `In stock (${product.stockCount})` : 'Out of stock'}
                            </div>
                        </div>

                        <div className="price-container">
                            {product.discount ? (
                                <>
                                    <span className="original-price">{formatPrice(product.price)}</span>
                                    <span className="discounted-price">{formatPrice(discountedPrice)}</span>
                                </>
                            ) : (
                                <span className="price">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Product Options */}
                        {product.options && Object.entries(product.options).map(([optionType, values]) => (
                            <div key={optionType} className="product-option">
                                <h3>{optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</h3>
                                <div className="option-values">
                                    {values.map(value => (
                                        <button
                                            key={value}
                                            className={`option-value ${selectedOptions[optionType] === value ? 'selected' : ''}`}
                                            onClick={() => handleOptionChange(optionType, value)}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                            <h3>Quantity:</h3>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    disabled={quantity >= product.stockCount}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart and Buy Now Buttons */}
                        <div className="action-buttons">
                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                            >
                                <span className="btn-text">Add to Cart</span>
                                <span className="btn-icon">+</span>
                            </button>
                            <button
                                className="buy-now-btn"
                                onClick={handleBuyNow}
                                disabled={!product.inStock}
                            >
                                <span className="btn-text">Buy Now</span>
                                <span className="btn-icon">→</span>
                            </button>
                        </div>

                        {/* Product Features */}
                        <div className="product-features">
                            <h3>Key Features:</h3>
                            <ul>
                                {product.features.map((feature, index) => (
                                    <li key={index}>
                                        <span className="feature-icon">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        <button
                            className={activeTab === 'description' ? 'active' : ''}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={activeTab === 'specifications' ? 'active' : ''}
                            onClick={() => setActiveTab('specifications')}
                        >
                            Specifications
                        </button>
                        <button
                            className={activeTab === 'reviews' ? 'active' : ''}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({product.reviews})
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-content description">
                                <p>{product.description}</p>
                                <p>Designed with precision and crafted with attention to detail, this product represents the perfect combination of form and function. Whether you're using it for work or leisure, it delivers exceptional performance and reliability.</p>
                                <p>The premium materials ensure durability while the elegant design complements any environment. Experience the difference that quality makes with this exceptional product.</p>
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="tab-content specifications">
                                <div className="specs-grid">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="spec-item">
                                            <span className="spec-name">{key}</span>
                                            <span className="spec-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="tab-content reviews">
                                <div className="review">
                                    <div className="review-header">
                                        <h4>Excellent product!</h4>
                                        <div className="review-rating">★★★★★</div>
                                    </div>
                                    <p>"This is one of the best products I've ever purchased. The quality is exceptional and it has exceeded all my expectations. Highly recommend!"</p>
                                    <span className="review-author">- John Doe</span>
                                </div>
                                <div className="review">
                                    <div className="review-header">
                                        <h4>Good value for money</h4>
                                        <div className="review-rating">★★★★☆</div>
                                    </div>
                                    <p>"Good quality product at a reasonable price. It does everything it promises and the design is sleek and modern. Would buy again."</p>
                                    <span className="review-author">- Jane Smith</span>
                                </div>
                                <button className="view-all-reviews">View All Reviews</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <div className="related-products">
                    <h2>You May Also Like</h2>
                    <div className="products-grid">
                        {relatedProducts.map(relatedProduct => {
                            const relatedDiscountedPrice = relatedProduct.discount
                                ? Math.round(relatedProduct.price * (1 - relatedProduct.discount / 100))
                                : relatedProduct.price;

                            return (
                                <div key={relatedProduct.id} className="product-card">
                                    <div className="card-image">
                                        {relatedProduct.discount && (
                                            <span className="discount-badge">-{relatedProduct.discount}%</span>
                                        )}
                                        <img
                                            src={relatedProduct.images[0]}
                                            alt={relatedProduct.name}
                                            onClick={() => navigate(`/product/${relatedProduct.id}`)}
                                        />
                                        <button
                                            className="quick-view"
                                            onClick={() => navigate(`/product/${relatedProduct.id}`)}
                                        >
                                            Quick View
                                        </button>
                                    </div>
                                    <div className="card-content">
                                        <h3>{relatedProduct.name}</h3>
                                        <div className="card-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={i < Math.floor(relatedProduct.rating) ? 'star filled' : 'star'}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                            <span>({relatedProduct.rating})</span>
                                        </div>
                                        <div className="card-price">
                                            {relatedProduct.discount ? (
                                                <>
                                                    <span className="original">{formatPrice(relatedProduct.price)}</span>
                                                    <span className="discounted">{formatPrice(relatedDiscountedPrice)}</span>
                                                </>
                                            ) : (
                                                <span>{formatPrice(relatedProduct.price)}</span>
                                            )}
                                        </div>
                                        <button
                                            className="add-to-cart"
                                            onClick={() => alert(`Added ${relatedProduct.name} to cart`)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;