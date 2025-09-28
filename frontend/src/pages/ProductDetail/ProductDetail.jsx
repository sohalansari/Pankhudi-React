import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductDetail.css";

const ProductDetailsEnhanced = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [mainImage, setMainImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("description");

    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [selectedRating, setSelectedRating] = useState(5);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Live fetching states
    const [isLiveFetching, setIsLiveFetching] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const pollingIntervalRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Cart states
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartMessageType, setCartMessageType] = useState(""); // "success" or "error"

    // Get current user from token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Decode token to get user info
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({
                    id: tokenData.userId || tokenData.id,
                    name: tokenData.name || tokenData.username,
                    email: tokenData.email
                });
                console.log("Current user:", tokenData);
            } catch (err) {
                console.error("Error decoding token:", err);
            }
        }
    }, []);

    // Separate function to fetch reviews
    const fetchReviews = async (productId, showLoading = true) => {
        try {
            if (showLoading) setReviewsLoading(true);
            const { data } = await axios.get(`http://localhost:5000/api/reviews/${productId}?t=${Date.now()}`);
            setReviews(data);
            setLastUpdated(new Date());
            console.log("Fetched reviews:", data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setReviews([]);
        } finally {
            if (showLoading) setReviewsLoading(false);
        }
    };

    // Start live fetching
    const startLiveFetching = () => {
        if (!product || pollingIntervalRef.current) return;

        setIsLiveFetching(true);

        // Fetch every 30 seconds
        pollingIntervalRef.current = setInterval(() => {
            fetchReviews(product.id, false);
        }, 30000); // 30 seconds
    };

    // Stop live fetching
    const stopLiveFetching = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            setIsLiveFetching(false);
        }
    };

    // Separate function to fetch related products
    const fetchRelatedProducts = async (category, currentProductId) => {
        try {
            setRelatedLoading(true);
            const { data } = await axios.get(`http://localhost:5000/api/products/related/${category}?limit=4&exclude=${currentProductId}`);
            setRelatedProducts(data);
        } catch (err) {
            console.error("Error fetching related products:", err);
            setRelatedProducts([]);
        } finally {
            setRelatedLoading(false);
        }
    };

    // Separate function to fetch product data
    const fetchProductData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
            setProduct(data);
            setMainImage(data.images?.[0] || "");
            if (data.sizes?.length) setSelectedSize(data.sizes[0]);
            if (data.colors?.length) setSelectedColor(data.colors[0]);
            if (data.materials?.length) setSelectedMaterial(data.materials[0]);

            // Check if product is in wishlist
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/check/${data.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsWishlisted(wishlistResponse.data.isWishlisted);
                } catch (wishlistErr) {
                    console.error("Error checking wishlist:", wishlistErr);
                }
            }

            // Fetch reviews and related products in parallel
            await Promise.all([
                fetchReviews(data.id),
                fetchRelatedProducts(data.category, data.id)
            ]);

            // Auto-start live fetching after initial load
            startLiveFetching();
        } catch (err) {
            console.error("Error fetching product data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();

        // Cleanup on component unmount
        return () => {
            stopLiveFetching();
        };
    }, [id]);

    // Auto-refresh when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && product) {
                fetchReviews(product.id, false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [product]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= product.stock) setQuantity(value);
    };

    const incrementQuantity = () => quantity < product.stock && setQuantity(quantity + 1);
    const decrementQuantity = () => quantity > 1 && setQuantity(quantity - 1);

    const calculateDiscountedPrice = () => product.discount > 0 ? product.price - (product.price * product.discount / 100) : product.price;
    const formatPrice = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(price);

    // Add to Cart Function
    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to add items to cart");
            navigate('/login');
            return;
        }

        if (product.stock === 0) {
            setCartMessage("Product is out of stock");
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        try {
            setAddingToCart(true);
            setCartMessage("");

            const response = await axios.post(
                "http://localhost:5000/api/cart/add",
                {
                    product_id: product.id,
                    quantity: quantity
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setCartMessage(response.data.message || "Product added to cart successfully!");
            setCartMessageType("success");

            // Reset message after 3 seconds
            setTimeout(() => setCartMessage(""), 3000);

        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message || "Failed to add product to cart";
            setCartMessage(errorMessage);
            setCartMessageType("error");

            // Reset message after 3 seconds
            setTimeout(() => setCartMessage(""), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    // Buy Now Function (Add to cart and navigate to cart page)
    const handleBuyNow = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to proceed with purchase");
            navigate('/login');
            return;
        }

        if (product.stock === 0) {
            setCartMessage("Product is out of stock");
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        try {
            setAddingToCart(true);

            await axios.post(
                "http://localhost:5000/api/cart/add",
                {
                    product_id: product.id,
                    quantity: quantity
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            // Navigate to cart page after successful addition
            navigate('/cart');

        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message || "Failed to add product to cart";
            setCartMessage(errorMessage);
            setCartMessageType("error");

            // Reset message after 3 seconds
            setTimeout(() => setCartMessage(""), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleWishlistToggle = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login to manage wishlist");
                navigate('/login');
                return;
            }

            if (isWishlisted) {
                await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(
                    "http://localhost:5000/api/wishlist",
                    { product_id: product.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setIsWishlisted(!isWishlisted);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            setReviewError("Please login to submit a review");
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (!reviewText.trim()) {
            setReviewError("Write a review first.");
            return;
        }

        try {
            setReviewLoading(true);
            setReviewError("");

            await axios.post(
                "http://localhost:5000/api/reviews",
                {
                    product_id: product.id,
                    rating: selectedRating,
                    review: reviewText
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Reset form
            setReviewText("");
            setSelectedRating(5);

            // Immediately refresh reviews after submission
            await fetchReviews(product.id, false);

        } catch (err) {
            console.error("Error submitting review:", err);
            setReviewError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setReviewLoading(false);
        }
    };

    // Delete review function
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login to delete review");
                return;
            }

            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove review from local state immediately
            setReviews(prev => prev.filter(review => review.id !== reviewId));

            console.log("Review deleted successfully!");
        } catch (err) {
            console.error("Error deleting review:", err);
            alert("Failed to delete review");
        }
    };

    // Check if current user is the author of the review - UPDATED
    const isReviewAuthor = (review) => {
        if (!currentUser) {
            console.log("No current user");
            return false;
        }

        console.log("Checking review ownership:", {
            currentUserId: currentUser.id,
            reviewUserId: review.user_id,
            currentUser,
            review
        });

        // Primary check - match user_id from review with current user id
        const isAuthor = review.user_id === currentUser.id;

        console.log("Is author:", isAuthor);
        return isAuthor;
    };

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => distribution[review.rating]++);
        return distribution;
    };

    // Scroll to reviews section function
    const scrollToReviews = () => {
        setActiveTab('reviews');
        setTimeout(() => {
            const reviewsSection = document.getElementById('reviews-section');
            if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    // Manual refresh function
    const manuallyRefreshReviews = () => {
        if (product) {
            fetchReviews(product.id, true);
        }
    };

    // Format time for last updated
    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Never';
        return lastUpdated.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) return (
        <div className="pankhudi-loading">
            <div className="pankhudi-loading-spinner"></div>
            <p>Loading product details...</p>
        </div>
    );

    if (!product) return (
        <div className="pankhudi-error">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <Link to="/" className="pankhudi-back-home">Back to Home</Link>
        </div>
    );

    const discountedPrice = calculateDiscountedPrice();
    const hasDiscount = product.discount > 0;
    const ratingDistribution = getRatingDistribution();
    const averageRating = getAverageRating();

    return (
        <div className="pankhudi-product-details">
            <header className="pankhudi-product-header">
                <Link to="/" className="brand-name">Pankhudi</Link>
                <nav className="pankhudi-breadcrumb">
                    <Link to="/">Home</Link> &gt;
                    <Link to={`/category/${product.category}`}>{product.category}</Link> &gt;
                    <span>{product.name}</span>
                </nav>
            </header>

            {/* Cart Message */}
            {cartMessage && (
                <div className={`pankhudi-cart-message ${cartMessageType}`}>
                    {cartMessage}
                </div>
            )}

            <div className="pankhudi-product-main">
                <div className="pankhudi-product-gallery">
                    <div className="pankhudi-main-image">
                        {imageLoading && <div className="pankhudi-image-loader"></div>}
                        <img
                            src={mainImage}
                            alt={product.name}
                            onLoad={() => setImageLoading(false)}
                            style={{ display: imageLoading ? 'none' : 'block' }}
                        />
                        {hasDiscount && (
                            <span className="pankhudi-image-badge">{product.discount}% OFF</span>
                        )}
                    </div>
                    <div className="pankhudi-thumbnails">
                        {product.images?.map((img, i) => (
                            <div key={i} className="pankhudi-thumbnail-container">
                                <img
                                    src={img}
                                    alt={`${product.name} ${i + 1}`}
                                    className={mainImage === img ? "active" : ""}
                                    onClick={() => {
                                        setMainImage(img);
                                        setImageLoading(true);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pankhudi-product-info">
                    <div className="pankhudi-product-header-info">
                        <h1 className="pankhudi-product-title">{product.name}</h1>
                        <button
                            className={`pankhudi-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={handleWishlistToggle}
                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            ♥
                        </button>
                    </div>

                    <div className="pankhudi-rating-section">
                        <div className="pankhudi-rating-main">
                            <span className="pankhudi-rating">⭐ {averageRating}</span>
                            <span className="pankhudi-review-count">({reviews.length} reviews)</span>
                            {isLiveFetching && <span className="pankhudi-live-badge">LIVE</span>}
                        </div>
                        <button
                            className="pankhudi-view-all-reviews"
                            onClick={scrollToReviews}
                        >
                            View all reviews
                        </button>
                    </div>

                    <div className="pankhudi-price-section">
                        {hasDiscount ? (
                            <>
                                <span className="pankhudi-discounted-price">{formatPrice(discountedPrice)}</span>
                                <span className="pankhudi-original-price">{formatPrice(product.price)}</span>
                                <span className="pankhudi-discount-badge">{product.discount}% OFF</span>
                            </>
                        ) : (
                            <span className="pankhudi-price">{formatPrice(product.price)}</span>
                        )}
                        <span className="pankhudi-tax">+ Tax</span>
                    </div>

                    {/* Product Variants */}
                    {(product.sizes?.length > 0 || product.colors?.length > 0 || product.materials?.length > 0) && (
                        <div className="pankhudi-variants">
                            {product.sizes?.length > 0 && (
                                <div className="pankhudi-variant-group">
                                    <label>Size:</label>
                                    <div className="pankhudi-variant-options">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                className={`pankhudi-variant-btn ${selectedSize === size ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.colors?.length > 0 && (
                                <div className="pankhudi-variant-group">
                                    <label>Color:</label>
                                    <div className="pankhudi-variant-options">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                className={`pankhudi-variant-btn color ${selectedColor === color ? 'active' : ''}`}
                                                onClick={() => setSelectedColor(color)}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                aria-label={color}
                                            >
                                                {selectedColor === color && '✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.materials?.length > 0 && (
                                <div className="pankhudi-variant-group">
                                    <label>Material:</label>
                                    <div className="pankhudi-variant-options">
                                        {product.materials.map(material => (
                                            <button
                                                key={material}
                                                className={`pankhudi-variant-btn ${selectedMaterial === material ? 'active' : ''}`}
                                                onClick={() => setSelectedMaterial(material)}
                                            >
                                                {material}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="pankhudi-quantity-selector">
                        <label>Quantity:</label>
                        <div className="pankhudi-quantity-controls">
                            <button onClick={decrementQuantity} disabled={quantity <= 1}>−</button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                                max={product.stock}
                            />
                            <button onClick={incrementQuantity} disabled={quantity >= product.stock}>+</button>
                        </div>
                        <span className="pankhudi-stock">
                            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pankhudi-action-buttons">
                        <button
                            className="pankhudi-add-to-cart"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || addingToCart}
                        >
                            {addingToCart ? "Adding..." : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
                        </button>
                        <button
                            className="pankhudi-buy-now"
                            onClick={handleBuyNow}
                            disabled={product.stock === 0 || addingToCart}
                        >
                            {addingToCart ? "Adding..." : 'Buy Now'}
                        </button>
                    </div>

                    {/* Product Features */}
                    <div className="pankhudi-features">
                        <div className="pankhudi-feature">
                            <span className="pankhudi-feature-icon">🚚</span>
                            <span>Free shipping on orders above ₹999</span>
                        </div>
                        <div className="pankhudi-feature">
                            <span className="pankhudi-feature-icon">↩️</span>
                            <span>Easy 30-day returns</span>
                        </div>
                        <div className="pankhudi-feature">
                            <span className="pankhudi-feature-icon">🔒</span>
                            <span>Secure payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Tabs */}
            <div className="pankhudi-product-tabs">
                <div className="pankhudi-tab-headers">
                    <button
                        className={`pankhudi-tab-header ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`pankhudi-tab-header ${activeTab === 'specifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('specifications')}
                    >
                        Specifications
                    </button>
                    <button
                        className={`pankhudi-tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({reviews.length}) {isLiveFetching && '🟢'}
                    </button>
                </div>

                <div className="pankhudi-tab-content">
                    {activeTab === 'description' && (
                        <div className="pankhudi-description">
                            <p className={showFullDescription ? 'expanded' : ''}>
                                {product.description}
                            </p>
                            {product.description && product.description.length > 200 && (
                                <button
                                    className="pankhudi-read-more"
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                >
                                    {showFullDescription ? 'Read Less' : 'Read More'}
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="pankhudi-specifications">
                            <div className="pankhudi-spec-grid">
                                {product.brand && (
                                    <div className="pankhudi-spec-item">
                                        <span className="pankhudi-spec-label">Brand</span>
                                        <span className="pankhudi-spec-value">{product.brand}</span>
                                    </div>
                                )}
                                {product.category && (
                                    <div className="pankhudi-spec-item">
                                        <span className="pankhudi-spec-label">Category</span>
                                        <span className="pankhudi-spec-value">{product.category}</span>
                                    </div>
                                )}
                                {product.material && (
                                    <div className="pankhudi-spec-item">
                                        <span className="pankhudi-spec-label">Material</span>
                                        <span className="pankhudi-spec-value">{product.material}</span>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div className="pankhudi-spec-item">
                                        <span className="pankhudi-spec-label">Dimensions</span>
                                        <span className="pankhudi-spec-value">{product.dimensions}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="pankhudi-review-section" id="reviews-section">
                            {/* Review Summary with live indicator */}
                            <div className="pankhudi-review-summary">
                                <div className="pankhudi-overall-rating">
                                    <h3>{averageRating}</h3>
                                    <div className="pankhudi-rating-stars">
                                        {'⭐'.repeat(5)}
                                    </div>
                                    <p>{reviews.length} reviews</p>
                                    {isLiveFetching && (
                                        <div className="pankhudi-live-status-mini">
                                            <span className="pankhudi-live-dot active"></span>
                                            Auto-updating every 30s
                                        </div>
                                    )}
                                </div>
                                <div className="pankhudi-rating-breakdown">
                                    {[5, 4, 3, 2, 1].map(rating => (
                                        <div key={rating} className="pankhudi-rating-bar">
                                            <span>{rating} star</span>
                                            <div className="pankhudi-bar-container">
                                                <div
                                                    className="pankhudi-bar"
                                                    style={{
                                                        width: `${(ratingDistribution[rating] / reviews.length) * 100 || 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span>({ratingDistribution[rating]})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Review Form */}
                            <div className="pankhudi-review-form">
                                <h4>Write a Review</h4>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="pankhudi-rating-selector">
                                        <label>Rating:</label>
                                        <div className="pankhudi-star-rating">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`pankhudi-star ${selectedRating >= star ? 'active' : ''}`}
                                                    onClick={() => setSelectedRating(star)}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pankhudi-review-textarea">
                                        <textarea
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                            placeholder="Share your experience with this product..."
                                            rows="4"
                                        />
                                    </div>

                                    {reviewError && (
                                        <div className="pankhudi-review-error">{reviewError}</div>
                                    )}

                                    <button
                                        type="submit"
                                        className="pankhudi-submit-review"
                                        disabled={reviewLoading}
                                    >
                                        {reviewLoading ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>

                            {/* Reviews List - Scrollable */}
                            <div className="pankhudi-reviews-list-container">
                                <div className="pankhudi-reviews-header">
                                    <h4>Customer Reviews ({reviews.length})</h4>
                                    <div className="pankhudi-reviews-controls">
                                        <button
                                            className="pankhudi-refresh-btn-small"
                                            onClick={manuallyRefreshReviews}
                                            disabled={reviewsLoading}
                                        >
                                            {reviewsLoading ? '🔄' : '🔁'} Refresh
                                        </button>
                                    </div>
                                </div>

                                {reviewsLoading ? (
                                    <div className="pankhudi-reviews-loading">
                                        <div className="pankhudi-loading-spinner"></div>
                                        <p>Loading reviews...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <p className="pankhudi-no-reviews">No reviews yet. Be the first to review!</p>
                                ) : (
                                    <div className="pankhudi-reviews-scrollable">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="pankhudi-review-item">
                                                <div className="pankhudi-review-header">
                                                    <div className="pankhudi-reviewer-info">
                                                        {review.user_image && (
                                                            <img
                                                                src={review.user_image}
                                                                alt={review.user_name}
                                                                className="pankhudi-reviewer-avatar"
                                                            />
                                                        )}
                                                        <div>
                                                            <h5>{review.user_name}</h5>
                                                            <div className="pankhudi-review-rating">
                                                                {'⭐'.repeat(review.rating)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pankhudi-review-meta">
                                                        <span className="pankhudi-review-date">
                                                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        {isReviewAuthor(review) && (
                                                            <button
                                                                className="pankhudi-delete-review-btn"
                                                                onClick={() => handleDeleteReview(review.id)}
                                                                title="Delete this review"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="pankhudi-review-content">{review.review}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            <section className="pankhudi-related-products">
                <h2>You May Also Like</h2>
                <div className="pankhudi-related-grid">
                    {relatedLoading ? (
                        <div className="pankhudi-related-loading">Loading related products...</div>
                    ) : relatedProducts.length === 0 ? (
                        <p className="pankhudi-no-related">No related products found</p>
                    ) : (
                        relatedProducts.map(product => (
                            <div key={product.id} className="pankhudi-related-item">
                                <Link to={`/product/${product.id}`}>
                                    <div className="pankhudi-related-image">
                                        <img src={product.images?.[0]} alt={product.name} />
                                        {product.discount > 0 && (
                                            <span className="pankhudi-related-badge">{product.discount}% OFF</span>
                                        )}
                                    </div>
                                    <div className="pankhudi-related-info">
                                        <h4>{product.name}</h4>
                                        <div className="pankhudi-related-price">
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className="pankhudi-related-discounted">
                                                        {formatPrice(product.price - (product.price * product.discount / 100))}
                                                    </span>
                                                    <span className="pankhudi-related-original">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>{formatPrice(product.price)}</span>
                                            )}
                                        </div>
                                        <div className="pankhudi-related-rating">
                                            ⭐ {product.rating || 'New'}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProductDetailsEnhanced;