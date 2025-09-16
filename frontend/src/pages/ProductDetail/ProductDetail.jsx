import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './ProductDetail.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                console.log("Fetching product with ID:", id);

                const response = await axios.get(`${API}/api/products/${id}`);
                console.log("Product details response:", response.data);

                if (response.data && response.data.product) {
                    setProduct(response.data.product);

                    // Set default selected options if available
                    if (response.data.product.sizes && response.data.product.sizes.length > 0) {
                        setSelectedSize(response.data.product.sizes[0]);
                    }
                    if (response.data.product.colors && response.data.product.colors.length > 0) {
                        setSelectedColor(response.data.product.colors[0]);
                    }
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                if (err.response && err.response.status === 404) {
                    setError("Product not found");
                } else {
                    setError("Failed to load product details. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        } else {
            setError("Invalid product ID");
            setLoading(false);
        }
    }, [id, API]);

    // Get product image URL
    const getProductImage = (image, index) => {
        if (!image) return getFallbackProductImage(product?.category);

        const imageUrl = typeof image === 'string' ? image : (image.url || image.imageUrl || '');

        if (imageUrl.startsWith("http")) {
            return imageUrl;
        } else if (imageUrl.startsWith("/")) {
            return `${API}${imageUrl}`;
        }

        return getFallbackProductImage(product?.category);
    };

    // Fallback product image
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
            general: 'https://via.placeholder.com/500x600?text=Product+Image'
        };
        return fallbackImages[category?.toLowerCase()] || fallbackImages.general;
    };

    // Add to cart functionality
    const handleAddToCart = () => {
        if (!product) return;

        const isLoggedIn = !!localStorage.getItem('token');
        if (!isLoggedIn) {
            alert('Please login to add items to the cart.');
            navigate('/login');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(
            item => item.id === product._id && item.size === selectedSize && item.color === selectedColor
        );

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: product._id,
                name: product.name,
                price: product.price,
                image: getProductImage(product.images ? product.images[0] : product.image),
                size: selectedSize,
                color: selectedColor,
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    };

    // Buy now functionality
    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="error-container">
                <h2>Product Not Found</h2>
                <p>{error || "The product you're looking for doesn't exist."}</p>
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    // Get all product images
    const productImages = product.images && product.images.length > 0
        ? product.images
        : product.image
            ? [product.image]
            : [getFallbackProductImage(product.category)];

    // Ensure we have at least 4 images (duplicate if necessary)
    const displayImages = [];
    for (let i = 0; i < 4; i++) {
        displayImages.push(productImages[i % productImages.length]);
    }

    return (
        <>
            <Header />
            <div className="product-details-container">
                <nav className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/products">Products</Link>
                    <span>/</span>
                    <span className="current">{product.name}</span>
                </nav>

                <div className="product-details-content">
                    {/* Product Images Gallery */}
                    <div className="product-gallery">
                        <div className="main-image-container">
                            <img
                                src={getProductImage(displayImages[selectedImage])}
                                alt={product.name}
                                className="main-image"
                            />
                        </div>

                        <div className="thumbnail-container">
                            {displayImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img
                                        src={getProductImage(image)}
                                        alt={`${product.name} view ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="product-info">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-meta">
                            <div className="rating">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={i < Math.floor(product.rating || 0) ? 'star filled' : 'star'}
                                    >
                                        {i < Math.floor(product.rating || 0) ? '★' : '☆'}
                                    </span>
                                ))}
                                <span className="rating-count">({product.rating || 0})</span>
                            </div>

                            <span className="sku">SKU: {product._id || 'N/A'}</span>
                            <span className="product-id">Product ID: {id}</span>
                        </div>

                        <div className="price-container">
                            {product.discount > 0 ? (
                                <>
                                    <span className="original-price">₹{product.price}</span>
                                    <span className="discounted-price">
                                        ₹{Math.round(product.price * (1 - product.discount / 100))}
                                    </span>
                                    <span className="discount-badge">-{product.discount}% OFF</span>
                                </>
                            ) : (
                                <span className="price">₹{product.price}</span>
                            )}
                        </div>

                        <p className="product-description">
                            {product.description || "No description available for this product."}
                        </p>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="option-section">
                                <h3>Size: <span className="selected-option">{selectedSize}</span></h3>
                                <div className="option-buttons">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="option-section">
                                <h3>Color: <span className="selected-option">{selectedColor}</span></h3>
                                <div className="color-options">
                                    {product.colors.map(color => (
                                        <div
                                            key={color}
                                            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            onClick={() => setSelectedColor(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div className="quantity-section">
                            <h3>Quantity</h3>
                            <div className="quantity-selector">
                                <button
                                    className="quantity-btn"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                >-</button>
                                <span className="quantity-value">{quantity}</span>
                                <button
                                    className="quantity-btn"
                                    onClick={() => setQuantity(q => q + 1)}
                                >+</button>
                            </div>
                            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.stock > 0
                                    ? `${product.stock} available in stock`
                                    : 'Out of stock'}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="btn-add-to-cart"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                Add to Cart
                            </button>
                            <button
                                className="btn-buy-now"
                                onClick={handleBuyNow}
                                disabled={product.stock <= 0}
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Additional Information */}
                        <div className="additional-info">
                            <div className="info-item">
                                <span className="icon">🚚</span>
                                <div>
                                    <h4>Free Shipping</h4>
                                    <p>Free standard shipping on orders over ₹999</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="icon">↩️</span>
                                <div>
                                    <h4>Easy Returns</h4>
                                    <p>30-day hassle-free returns policy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        <button className="tab-btn active">Description</button>
                        <button className="tab-btn">Additional Information</button>
                    </div>
                    <div className="tab-content">
                        <h3>Product Description</h3>
                        <p>{product.description || "No detailed description available for this product."}</p>

                        <h4>Features</h4>
                        <ul>
                            <li>Premium quality fabric for comfort and durability</li>
                            <li>Designed for perfect fit and style</li>
                            <li>Easy to care for and maintain</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductDetails;