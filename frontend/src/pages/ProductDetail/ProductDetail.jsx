import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./ProductDetail.css";

marked.setOptions({
    breaks: true,
    gfm: true
});

// Enhanced ReviewItem component
const ReviewItem = ({ review, currentUser, onDeleteReview, isReviewAuthor }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getUserInitial = (userName) => {
        if (!userName) return 'U';
        return userName.charAt(0).toUpperCase();
    };

    const getAvatarColor = (userName) => {
        if (!userName) return '#007bff';
        const colors = [
            '#007bff', '#28a745', '#dc3545', '#ffc107',
            '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
        ];
        const index = userName.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        setIsDeleting(true);
        try {
            await onDeleteReview(review.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const userInitial = getUserInitial(review.user_name);
    const avatarColor = getAvatarColor(review.user_name);
    const needsReadMore = review.review && review.review.length > 200;

    return (
        <div className={`pankhudi-review-item ${isDeleting ? 'deleting' : ''}`}>
            <div className="pankhudi-review-header">
                <div className="pankhudi-reviewer-info">
                    <div className="pankhudi-avatar-container">
                        {review.user_image ? (
                            <img
                                src={review.user_image}
                                alt={review.user_name}
                                className="pankhudi-reviewer-avatar"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="pankhudi-avatar-fallback"
                            style={{
                                backgroundColor: avatarColor,
                                display: review.user_image ? 'none' : 'flex'
                            }}
                        >
                            {userInitial}
                        </div>
                    </div>
                    <div className="pankhudi-reviewer-details">
                        <h5 className="pankhudi-reviewer-name">{review.user_name || 'Anonymous User'}</h5>
                        <div className="pankhudi-review-rating">
                            {'⭐'.repeat(review.rating)}
                            <span className="pankhudi-rating-text">({review.rating}/5)</span>
                        </div>
                    </div>
                </div>
                <div className="pankhudi-review-meta">
                    <span className="pankhudi-review-date">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                    {isReviewAuthor(review) && (
                        <button
                            className="pankhudi-delete-review-btn"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title="Delete this review"
                        >
                            {isDeleting ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                    )}
                </div>
            </div>
            <div className="pankhudi-review-content-wrapper">
                <p className={`pankhudi-review-content ${isExpanded ? 'expanded' : ''}`}>
                    {review.review}
                </p>
                {needsReadMore && (
                    <button
                        className="pankhudi-read-more-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                )}
            </div>
        </div>
    );
};

// Enhanced ProductDescription Component
const ProductDescription = ({ description, showFullDescription, setShowFullDescription }) => {
    const [needsReadMore, setNeedsReadMore] = useState(false);
    const [parsedDescription, setParsedDescription] = useState('');

    useEffect(() => {
        if (!description) {
            setNeedsReadMore(false);
            setParsedDescription('');
            return;
        }

        // Parse markdown and sanitize
        try {
            const parsed = DOMPurify.sanitize(marked.parse(description));
            setParsedDescription(parsed);

            // Calculate plain text length without HTML tags
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = parsed;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';

            // Check if we need read more (200 characters threshold)
            setNeedsReadMore(plainText.length > 200);
        } catch (error) {
            console.error('Error parsing description:', error);
            setParsedDescription(description);
            setNeedsReadMore(description.length > 200);
        }
    }, [description]);

    const handleToggle = () => {
        setShowFullDescription(!showFullDescription);
    };

    if (!description) {
        return <p className="pankhudi-no-description">No description available.</p>;
    }

    return (
        <div className="pankhudi-description">
            <div
                className={`pankhudi-description-content ${showFullDescription ? 'expanded' : 'collapsed'}`}
                dangerouslySetInnerHTML={{ __html: parsedDescription }}
            />
            {needsReadMore && (
                <button
                    className="pankhudi-read-more-btn"
                    onClick={handleToggle}
                >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

// Enhanced Product Gallery Component with Video as last item
const ProductGallery = ({ images, productName, mainImage, setMainImage, imageLoading, setImageLoading, videoUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showThumbnailScroll, setShowThumbnailScroll] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [showVideo, setShowVideo] = useState(false);
    const thumbnailContainerRef = useRef(null);

    // Combine images and video for navigation
    const allMediaItems = videoUrl ? [...images, 'VIDEO'] : [...images];

    // Update current index when main image changes
    useEffect(() => {
        if (mainImage === 'VIDEO') {
            setCurrentIndex(allMediaItems.length - 1);
        } else if (images && mainImage) {
            const index = images.findIndex(img => img === mainImage);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
    }, [mainImage, images, allMediaItems]);

    // Navigation functions
    const nextImage = () => {
        if (allMediaItems.length > 0) {
            const nextIndex = (currentIndex + 1) % allMediaItems.length;
            handleMediaChange(nextIndex);
        }
    };

    const prevImage = () => {
        if (allMediaItems.length > 0) {
            const prevIndex = (currentIndex - 1 + allMediaItems.length) % allMediaItems.length;
            handleMediaChange(prevIndex);
        }
    };

    const handleMediaChange = (index) => {
        setCurrentIndex(index);
        if (allMediaItems[index] === 'VIDEO') {
            setShowVideo(true);
            setMainImage('VIDEO');
        } else {
            setShowVideo(false);
            setMainImage(allMediaItems[index]);
            setImageLoading(true);
        }
        scrollThumbnailIntoView(index);
    };

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
        setTouchStart(null);
    };

    // Scroll thumbnail into view when selected
    const scrollThumbnailIntoView = (index) => {
        if (thumbnailContainerRef.current) {
            const thumbnails = thumbnailContainerRef.current.children;
            if (thumbnails[index]) {
                thumbnails[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    };

    const handleThumbnailClick = (item, index) => {
        handleMediaChange(index);
    };

    const handleVideoClick = () => {
        const videoIndex = allMediaItems.length - 1;
        handleMediaChange(videoIndex);
    };

    const handleCloseVideo = () => {
        setShowVideo(false);
        if (images && images.length > 0) {
            setMainImage(images[0]);
            setCurrentIndex(0);
        }
    };

    // Check if thumbnails need scrolling
    useEffect(() => {
        const checkThumbnailScroll = () => {
            if (thumbnailContainerRef.current) {
                const container = thumbnailContainerRef.current;
                setShowThumbnailScroll(container.scrollWidth > container.clientWidth);
            }
        };

        checkThumbnailScroll();
        window.addEventListener('resize', checkThumbnailScroll);
        return () => window.removeEventListener('resize', checkThumbnailScroll);
    }, [images, videoUrl]);

    if (!images || images.length === 0) {
        return (
            <div className="pankhudi-product-gallery">
                <div className="pankhudi-main-image">
                    <div className="pankhudi-no-image">
                        <div className="pankhudi-no-image-icon">📷</div>
                        <p>No Image Available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pankhudi-product-gallery">
            <div className="pankhudi-main-image-container">
                <div
                    className="pankhudi-main-image"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {imageLoading && !showVideo && (
                        <div className="pankhudi-image-loader">
                            <div className="pankhudi-loader-spinner"></div>
                        </div>
                    )}

                    {showVideo && videoUrl ? (
                        <div className="pankhudi-video-container">
                            <video
                                controls
                                autoPlay
                                className="pankhudi-product-video"
                                poster={images[0]}
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <button
                                className="pankhudi-close-video"
                                onClick={handleCloseVideo}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <img
                            src={mainImage}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                            style={{ display: imageLoading ? 'none' : 'block' }}
                        />
                    )}

                    {/* Media Counter */}
                    <div className="pankhudi-image-counter">
                        {currentIndex + 1} / {allMediaItems.length}
                        {allMediaItems[currentIndex] === 'VIDEO' && ' (Video)'}
                    </div>

                    {/* Navigation Arrows */}
                    {allMediaItems.length > 1 && (
                        <>
                            <button
                                className="pankhudi-nav-btn pankhudi-prev-btn"
                                onClick={prevImage}
                                aria-label="Previous media"
                            >
                                ‹
                            </button>
                            <button
                                className="pankhudi-nav-btn pankhudi-next-btn"
                                onClick={nextImage}
                                aria-label="Next media"
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>

                {/* Media Navigation Dots */}
                {allMediaItems.length > 1 && (
                    <div className="pankhudi-image-dots">
                        {allMediaItems.map((_, index) => (
                            <button
                                key={index}
                                className={`pankhudi-dot ${index === currentIndex ? 'active' : ''} ${allMediaItems[index] === 'VIDEO' ? 'video-dot' : ''}`}
                                onClick={() => handleMediaChange(index)}
                                aria-label={`Go to ${allMediaItems[index] === 'VIDEO' ? 'video' : `image ${index + 1}`}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails with Enhanced Features */}
            <div className="pankhudi-thumbnails-section">
                <div className="pankhudi-thumbnails-header">
                    <span className="pankhudi-thumbnails-title">
                        Product Media ({images.length}
                        {videoUrl && ` + 1 Video`})
                    </span>
                    {showThumbnailScroll && (
                        <span className="pankhudi-scroll-hint">
                            ← Scroll to view all media →
                        </span>
                    )}
                </div>

                <div
                    className="pankhudi-thumbnails"
                    ref={thumbnailContainerRef}
                >
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`pankhudi-thumbnail-container ${mainImage === img ? "active" : ""}`}
                        >
                            <img
                                src={img}
                                alt={`${productName} ${index + 1}`}
                                onClick={() => handleThumbnailClick(img, index)}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="pankhudi-thumbnail-fallback">
                                {index + 1}
                            </div>
                            <div className="pankhudi-thumbnail-overlay">
                                <span className="pankhudi-thumbnail-number">{index + 1}</span>
                            </div>
                        </div>
                    ))}

                    {/* Video Thumbnail - Always at the end */}
                    {videoUrl && (
                        <div
                            className={`pankhudi-thumbnail-container video-thumbnail ${showVideo ? "active" : ""}`}
                            onClick={handleVideoClick}
                        >
                            <div className="pankhudi-video-thumbnail">
                                <span className="pankhudi-play-icon">▶</span>
                                <span>Video</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced Product Specifications Component
const ProductSpecifications = ({ product }) => {
    const [expanded, setExpanded] = useState(false);

    const specifications = [
        { label: "SKU", value: product.sku },
        { label: "Brand", value: product.brand },
        { label: "Category", value: product.category },
        { label: "Material", value: product.material },
        { label: "Color", value: product.color },
        { label: "Size", value: product.size },
        { label: "Weight", value: product.weight ? `${product.weight} kg` : null },
        { label: "Dimensions", value: product.dimensions },
        { label: "Warranty Period", value: product.warranty_period },
        { label: "Return Policy", value: product.return_policy },
        { label: "Shipping", value: product.free_shipping ? "Free Shipping" : product.shipping_cost ? `₹${product.shipping_cost}` : "Standard Shipping" },
        { label: "Shipping Class", value: product.shipping_class },
        { label: "Tax Class", value: product.tax_class },
        { label: "Min Order Quantity", value: product.min_order_quantity > 1 ? product.min_order_quantity : null },
        { label: "Max Order Quantity", value: product.max_order_quantity },
        { label: "Low Stock Alert", value: product.low_stock_threshold },
        { label: "Product Type", value: product.is_virtual ? "Virtual Product" : product.is_downloadable ? "Downloadable" : "Physical Product" },
        { label: "Download Link", value: product.is_downloadable && product.download_link ? "Available" : null },
        { label: "Status", value: product.status },
        { label: "Trending", value: product.is_trending ? "Yes" : "No" },
        { label: "Featured", value: product.is_featured ? "Yes" : "No" },
        { label: "Bestseller", value: product.is_bestseller ? "Yes" : "No" },
        { label: "On Sale", value: product.is_on_sale ? "Yes" : "No" },
        { label: "Model Number", value: product.model_number },
        { label: "UPC", value: product.upc },
        { label: "Manufacturer", value: product.manufacturer },
        { label: "Country of Origin", value: product.country_of_origin },
        { label: "Power Requirements", value: product.power_requirements },
        { label: "Compatibility", value: product.compatibility },
        { label: "File Size", value: product.file_size },
        { label: "File Format", value: product.file_format },
        { label: "Download Limit", value: product.download_limit },
        { label: "Download Expiry", value: product.download_expiry },
        { label: "Estimated Delivery", value: product.estimated_delivery }
    ].filter(spec => spec.value && spec.value !== "" && spec.value !== null && spec.value !== undefined);

    if (specifications.length === 0) {
        return (
            <div className="pankhudi-specifications">
                <h4>Specifications</h4>
                <p className="pankhudi-no-specs">No specifications available.</p>
            </div>
        );
    }

    const visibleSpecs = expanded ? specifications : specifications.slice(0, 8);

    return (
        <div className="pankhudi-specifications">
            <div className="pankhudi-specs-header">
                <h4>Product Specifications</h4>
                {specifications.length > 8 && (
                    <button
                        className="pankhudi-expand-specs-btn"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Show Less' : `Show All (${specifications.length})`}
                    </button>
                )}
            </div>
            <div className="pankhudi-spec-grid">
                {visibleSpecs.map((spec, index) => (
                    <div key={index} className="pankhudi-spec-item">
                        <span className="pankhudi-spec-label">{spec.label}</span>
                        <span className="pankhudi-spec-value">{spec.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Product Features Component
const ProductFeatures = ({ features }) => {
    if (!features || features.length === 0) return null;

    return (
        <div className="pankhudi-features-section">
            <h4>Product Features</h4>
            <div className="pankhudi-features-list">
                {features.map((feature, index) => (
                    <div key={index} className="pankhudi-feature-item">
                        <span className="pankhudi-feature-icon">✓</span>
                        <span className="pankhudi-feature-text">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Variants Component for Multiple Options
const ProductVariants = ({
    sizes,
    colors,
    materials,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    selectedMaterial,
    setSelectedMaterial
}) => {
    if ((!sizes || sizes.length === 0) && (!colors || colors.length === 0) && (!materials || materials.length === 0)) {
        return null;
    }

    return (
        <div className="pankhudi-variants">
            {/* Sizes */}
            {sizes && sizes.length > 0 && (
                <div className="pankhudi-variant-group">
                    <label>Size:</label>
                    <div className="pankhudi-variant-options">
                        {sizes.map((size, index) => (
                            <button
                                key={index}
                                className={`pankhudi-variant-btn ${selectedSize === size ? 'active' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Colors */}
            {colors && colors.length > 0 && (
                <div className="pankhudi-variant-group">
                    <label>Color:</label>
                    <div className="pankhudi-variant-options">
                        {colors.map((color, index) => (
                            <button
                                key={index}
                                className={`pankhudi-variant-btn color ${selectedColor === color ? 'active' : ''}`}
                                onClick={() => setSelectedColor(color)}
                                style={{
                                    backgroundColor: color.toLowerCase(),
                                    border: color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none'
                                }}
                                aria-label={color}
                            >
                                {selectedColor === color && '✓'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Materials */}
            {materials && materials.length > 0 && (
                <div className="pankhudi-variant-group">
                    <label>Material:</label>
                    <div className="pankhudi-variant-options">
                        {materials.map((material, index) => (
                            <button
                                key={index}
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
    );
};

// Enhanced ReviewForm Component
const ReviewForm = ({
    onSubmit,
    reviewText,
    setReviewText,
    selectedRating,
    setSelectedRating,
    loading,
    error,
    currentUser
}) => {
    if (!currentUser) {
        return (
            <div className="pankhudi-review-login-prompt">
                <p>Please <Link to="/login">login</Link> to write a review.</p>
            </div>
        );
    }

    return (
        <form className="pankhudi-review-form" onSubmit={onSubmit}>
            <h4>Write a Review</h4>

            <div className="pankhudi-rating-input">
                <label>Your Rating:</label>
                <div className="pankhudi-star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`pankhudi-star-btn ${selectedRating >= star ? 'active' : ''}`}
                            onClick={() => setSelectedRating(star)}
                            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                        >
                            ⭐
                        </button>
                    ))}
                    <span className="pankhudi-rating-text">({selectedRating}/5)</span>
                </div>
            </div>

            <div className="pankhudi-review-textarea">
                <label htmlFor="review-text">Your Review:</label>
                <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows="4"
                    maxLength="1000"
                />
                <div className="pankhudi-char-count">
                    {reviewText.length}/1000 characters
                </div>
            </div>

            {error && <div className="pankhudi-review-error">{error}</div>}

            <button
                type="submit"
                className="pankhudi-submit-review-btn"
                disabled={loading || !reviewText.trim()}
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

// Enhanced RelatedProducts Component
const RelatedProducts = ({ products, loading, navigate }) => {
    if (loading) {
        return (
            <div className="pankhudi-related-products">
                <h3>Related Products</h3>
                <div className="pankhudi-related-loading">
                    <div className="pankhudi-loading-spinner"></div>
                    <p>Loading related products...</p>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="pankhudi-related-products">
            <h3>You May Also Like</h3>
            <div className="pankhudi-related-grid">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="pankhudi-related-card"
                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                    >
                        <div className="pankhudi-related-image">
                            <img
                                src={product.images?.[0] || '/placeholder-image.jpg'}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                }}
                            />
                            {product.discount > 0 && (
                                <span className="pankhudi-related-discount">
                                    {product.discount}% OFF
                                </span>
                            )}
                            {product.isNew && (
                                <span className="pankhudi-new-badge">NEW</span>
                            )}
                        </div>
                        <div className="pankhudi-related-info">
                            <h5 className="pankhudi-related-title">{product.name}</h5>
                            <div className="pankhudi-related-price">
                                {product.discount > 0 ? (
                                    <>
                                        <span className="pankhudi-related-current">
                                            {formatPrice(product.discountPrice || product.price)}
                                        </span>
                                        <span className="pankhudi-related-original">
                                            {formatPrice(product.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="pankhudi-related-current">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>
                            <div className="pankhudi-related-rating">
                                ⭐ {product.rating || 'New'}
                            </div>
                            {product.stock === 0 && (
                                <div className="pankhudi-related-out-of-stock">Out of Stock</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ProductTags Component
const ProductTags = ({ tags }) => {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="pankhudi-tags-section">
            <h4>Product Tags</h4>
            <div className="pankhudi-tags-container">
                {tags.map((tag, index) => (
                    <span key={index} className="pankhudi-tag">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

// Product Badges Component
const ProductBadges = ({ product }) => {
    const badges = [];

    if (product.isNew) {
        badges.push({ type: 'new', text: 'NEW', color: '#51cf66' });
    }
    if (product.discount > 0) {
        badges.push({ type: 'discount', text: `${product.discount}% OFF`, color: '#ff6b6b' });
    }
    if (product.is_trending) {
        badges.push({ type: 'trending', text: 'TRENDING', color: '#ffd43b' });
    }
    if (product.is_featured) {
        badges.push({ type: 'featured', text: 'FEATURED', color: '#4c44d4' });
    }
    if (product.is_bestseller) {
        badges.push({ type: 'bestseller', text: 'BESTSELLER', color: '#e83e8c' });
    }
    if (product.stock === 0) {
        badges.push({ type: 'out-of-stock', text: 'OUT OF STOCK', color: '#868e96' });
    } else if (product.stock <= product.low_stock_threshold) {
        badges.push({ type: 'low-stock', text: 'LOW STOCK', color: '#f59f00' });
    }

    if (badges.length === 0) return null;

    return (
        <div className="pankhudi-product-badges">
            {badges.map((badge, index) => (
                <span
                    key={index}
                    className={`pankhudi-badge pankhudi-badge-${badge.type}`}
                    style={{ backgroundColor: badge.color }}
                >
                    {badge.text}
                </span>
            ))}
        </div>
    );
};

// Enhanced Product Policies Component
const ProductPolicies = ({ product }) => {
    const policies = [];

    // Return Policy
    if (product.return_policy) {
        policies.push({
            icon: '↩️',
            title: 'Return Policy',
            description: product.return_policy
        });
    } else {
        policies.push({
            icon: '↩️',
            title: 'Return Policy',
            description: '7 Days Return Policy'
        });
    }

    // Shipping/Delivery Fee
    if (product.free_shipping) {
        policies.push({
            icon: '🚚',
            title: 'Delivery',
            description: 'Free Shipping'
        });
    } else if (product.shipping_cost) {
        policies.push({
            icon: '🚚',
            title: 'Delivery Fee',
            description: `₹${product.shipping_cost}`
        });
    } else {
        policies.push({
            icon: '🚚',
            title: 'Delivery',
            description: 'Standard Shipping'
        });
    }

    // Warranty
    if (product.warranty_period) {
        policies.push({
            icon: '🛡️',
            title: 'Warranty',
            description: product.warranty_period
        });
    }

    // Estimated Delivery
    if (product.estimated_delivery) {
        policies.push({
            icon: '📅',
            title: 'Estimated Delivery',
            description: product.estimated_delivery
        });
    }

    // Secure Payment
    policies.push({
        icon: '🔒',
        title: 'Payment',
        description: 'Secure Payment'
    });

    if (policies.length === 0) return null;

    return (
        <div className="pankhudi-policies-section">
            <h4>Product Policies & Services</h4>
            <div className="pankhudi-policies-grid">
                {policies.map((policy, index) => (
                    <div key={index} className="pankhudi-policy-item">
                        <div className="pankhudi-policy-icon">{policy.icon}</div>
                        <div className="pankhudi-policy-content">
                            <h5 className="pankhudi-policy-title">{policy.title}</h5>
                            <p className="pankhudi-policy-description">{policy.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main ProductDetailsEnhanced Component
const ProductDetailsEnhanced = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [mainImage, setMainImage] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Multiple variants state
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
    const [cartMessageType, setCartMessageType] = useState("");

    // Get current user from token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({
                    id: tokenData.userId || tokenData.id,
                    name: tokenData.name || tokenData.username,
                    email: tokenData.email
                });
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
            setReviews(data || []);
            setLastUpdated(new Date());
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
        pollingIntervalRef.current = setInterval(() => {
            fetchReviews(product.id, false);
        }, 30000);
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
    const fetchRelatedProducts = async (categoryId, currentProductId) => {
        try {
            setRelatedLoading(true);
            const { data } = await axios.get(
                `http://localhost:5000/api/products/related/${categoryId}?limit=4&exclude=${currentProductId}`
            );
            setRelatedProducts(data || []);
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

            if (!data) {
                throw new Error("Product not found");
            }

            console.log("Product data received:", data); // Debug log

            setProduct(data);
            setMainImage(data.images?.[0] || "");

            // Set default variants from backend fields
            if (data.sizes && data.sizes.length > 0) {
                setSelectedSize(data.sizes[0]);
            } else if (data.size) {
                setSelectedSize(data.size);
            }

            if (data.colors && data.colors.length > 0) {
                setSelectedColor(data.colors[0]);
            } else if (data.color) {
                setSelectedColor(data.color);
            }

            if (data.materials && data.materials.length > 0) {
                setSelectedMaterial(data.materials[0]);
            } else if (data.material) {
                setSelectedMaterial(data.material);
            }

            // Check if product is in wishlist
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const wishlistResponse = await axios.get(
                        `http://localhost:5000/api/wishlist/check/${data.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    setIsWishlisted(wishlistResponse.data.isWishlisted);
                } catch (wishlistErr) {
                    console.error("Error checking wishlist:", wishlistErr);
                }
            }

            // Fetch reviews and related products
            await Promise.all([
                fetchReviews(data.id),
                fetchRelatedProducts(data.category_id, data.id)
            ]);

            startLiveFetching();
        } catch (err) {
            console.error("Error fetching product data:", err);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();

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
        const maxQty = product.max_order_quantity || product.stock || 0;
        const minQty = product.min_order_quantity || 1;

        if (value >= minQty && value <= maxQty) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        const maxQty = product.max_order_quantity || product.stock || 0;
        if (quantity < maxQty) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        const minQty = product.min_order_quantity || 1;
        if (quantity > minQty) {
            setQuantity(quantity - 1);
        }
    };

    const calculateDiscountedPrice = () => {
        if (!product) return 0;
        return product.discountPrice || (product.discount > 0 ?
            product.price - (product.price * product.discount / 100) :
            product.price);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0
        }).format(price);
    };

    // Add to Cart Function with all backend fields
    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to add items to cart");
            navigate('/login');
            return;
        }

        if (!product || product.stock === 0) {
            setCartMessage("Product is out of stock");
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        // Check quantity constraints
        const minQuantity = product.min_order_quantity || 1;
        const maxQuantity = Math.min(product.stock, product.max_order_quantity || Infinity);

        if (quantity < minQuantity) {
            setCartMessage(`Minimum order quantity is ${minQuantity}`);
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        if (quantity > maxQuantity) {
            setCartMessage(`Maximum order quantity is ${maxQuantity}`);
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        try {
            setAddingToCart(true);
            setCartMessage("");

            const cartData = {
                product_id: product.id,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
                material: selectedMaterial,
                price: calculateDiscountedPrice(),
                original_price: product.price,
                discount: product.discount,
                // Include additional product info for cart display
                product_name: product.name,
                product_image: product.images?.[0],
                product_sku: product.sku,
                product_brand: product.brand,
                weight: product.weight,
                shipping_cost: product.shipping_cost,
                free_shipping: product.free_shipping
            };

            const response = await axios.post(
                "http://localhost:5000/api/cart/add",
                cartData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setCartMessage(response.data.message || "Product added to cart successfully!");
            setCartMessageType("success");

            setTimeout(() => setCartMessage(""), 3000);
        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message || "Failed to add product to cart";
            setCartMessage(errorMessage);
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    // Buy Now Function
    const handleBuyNow = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to proceed with purchase");
            navigate('/login');
            return;
        }

        if (!product || product.stock === 0) {
            setCartMessage("Product is out of stock");
            setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        try {
            setAddingToCart(true);

            const cartData = {
                product_id: product.id,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
                material: selectedMaterial,
                price: calculateDiscountedPrice(),
                original_price: product.price,
                discount: product.discount,
                product_name: product.name,
                product_image: product.images?.[0],
                product_sku: product.sku,
                product_brand: product.brand
            };

            await axios.post(
                "http://localhost:5000/api/cart/add",
                cartData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            navigate('/cart');
        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message || "Failed to add product to cart";
            setCartMessage(errorMessage);
            setCartMessageType("error");
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
            console.error("Wishlist error:", err);
            alert(err.response?.data?.message || "Wishlist operation failed");
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

            setReviewText("");
            setSelectedRating(5);
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
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login to delete review");
                return;
            }

            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReviews(prev => prev.filter(review => review.id !== reviewId));
        } catch (err) {
            console.error("Error deleting review:", err);
            alert("Failed to delete review");
        }
    };

    // Check if current user is the author of the review
    const isReviewAuthor = (review) => {
        if (!currentUser || !review) return false;
        return review.user_id === currentUser.id;
    };

    const getAverageRating = () => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            if (review.rating && distribution.hasOwnProperty(review.rating)) {
                distribution[review.rating]++;
            }
        });
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
    const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 10);
    const totalReviews = reviews.length;

    return (
        <div className="pankhudi-product-details">
            <header className="pankhudi-product-header">
                <Link to="/" className="brand-name">Pankhudi</Link>
                <nav className="pankhudi-breadcrumb">
                    <Link to="/">Home</Link> &gt;
                    <Link to={`/category/${product.category_id}`}>
                        {product.category || 'Category'}
                    </Link> &gt;
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
                {/* Enhanced Product Gallery with Video Support */}
                <ProductGallery
                    images={product.images}
                    productName={product.name}
                    mainImage={mainImage}
                    setMainImage={setMainImage}
                    imageLoading={imageLoading}
                    setImageLoading={setImageLoading}
                    videoUrl={product.video_url}
                />

                <div className="pankhudi-product-info">
                    {/* Product Badges */}
                    <ProductBadges product={product} />

                    <div className="pankhudi-product-header-info">
                        <h1 className="pankhudi-product-title">{product.name}</h1>
                        {product.sku && (
                            <div className="pankhudi-product-sku">
                                SKU: {product.sku}
                            </div>
                        )}
                        <button
                            className={`pankhudi-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={handleWishlistToggle}
                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            {isWishlisted ? '❤️' : '🤍'}
                        </button>
                    </div>

                    {/* Short Description */}
                    {product.short_description && (
                        <div className="pankhudi-short-description">
                            <p>{product.short_description}</p>
                        </div>
                    )}

                    <div className="pankhudi-rating-section">
                        <div className="pankhudi-rating-main">
                            <span className="pankhudi-rating">⭐ {averageRating}</span>
                            <span className="pankhudi-review-count">({totalReviews} reviews)</span>
                            {product.isNew && <span className="pankhudi-new-badge">NEW</span>}
                            {product.is_trending && <span className="pankhudi-trending-badge">TRENDING</span>}
                            {product.is_featured && <span className="pankhudi-featured-badge">FEATURED</span>}
                            {product.is_bestseller && <span className="pankhudi-bestseller-badge">BESTSELLER</span>}
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
                        {product.tax_class && (
                            <span className="pankhudi-tax-info">+ {product.tax_class} tax applicable</span>
                        )}
                    </div>

                    {/* Product Basic Info */}
                    <div className="pankhudi-basic-info">
                        {product.brand && (
                            <div className="pankhudi-info-item">
                                <strong>Brand:</strong> {product.brand}
                            </div>
                        )}
                        {product.material && (
                            <div className="pankhudi-info-item">
                                <strong>Material:</strong> {product.material}
                            </div>
                        )}
                        {product.color && (
                            <div className="pankhudi-info-item">
                                <strong>Color:</strong> {product.color}
                            </div>
                        )}
                        {product.size && (
                            <div className="pankhudi-info-item">
                                <strong>Size:</strong> {product.size}
                            </div>
                        )}
                        {product.weight && (
                            <div className="pankhudi-info-item">
                                <strong>Weight:</strong> {product.weight} kg
                            </div>
                        )}
                        {product.dimensions && (
                            <div className="pankhudi-info-item">
                                <strong>Dimensions:</strong> {product.dimensions}
                            </div>
                        )}
                        {product.model_number && (
                            <div className="pankhudi-info-item">
                                <strong>Model Number:</strong> {product.model_number}
                            </div>
                        )}
                        {product.manufacturer && (
                            <div className="pankhudi-info-item">
                                <strong>Manufacturer:</strong> {product.manufacturer}
                            </div>
                        )}
                        {product.country_of_origin && (
                            <div className="pankhudi-info-item">
                                <strong>Country of Origin:</strong> {product.country_of_origin}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Product Variants with Multiple Options */}
                    <ProductVariants
                        sizes={product.sizes}
                        colors={product.colors}
                        materials={product.materials}
                        selectedSize={selectedSize}
                        setSelectedSize={setSelectedSize}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        selectedMaterial={selectedMaterial}
                        setSelectedMaterial={setSelectedMaterial}
                    />

                    {/* Quantity Selector */}
                    <div className="pankhudi-quantity-selector">
                        <label>Quantity:</label>
                        <div className="pankhudi-quantity-controls">
                            <button
                                type="button"
                                onClick={decrementQuantity}
                                disabled={quantity <= (product.min_order_quantity || 1)}
                                aria-label="Decrease quantity"
                            >−</button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min={product.min_order_quantity || 1}
                                max={product.max_order_quantity || product.stock}
                                aria-label="Product quantity"
                            />
                            <button
                                type="button"
                                onClick={incrementQuantity}
                                disabled={quantity >= (product.max_order_quantity || product.stock || 0)}
                                aria-label="Increase quantity"
                            >+</button>
                        </div>
                        <div className="pankhudi-stock-info">
                            <span className={`pankhudi-stock ${isLowStock ? 'low-stock' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                                {product.stock > 10 ? 'In Stock' :
                                    product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                            </span>
                            {product.low_stock_threshold && product.stock <= product.low_stock_threshold && (
                                <span className="pankhudi-low-stock-warning">Low Stock Alert!</span>
                            )}
                        </div>
                        {(product.min_order_quantity > 1 || product.max_order_quantity) && (
                            <div className="pankhudi-quantity-constraints">
                                {product.min_order_quantity > 1 && <span>Min: {product.min_order_quantity}</span>}
                                {product.max_order_quantity && <span>Max: {product.max_order_quantity}</span>}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pankhudi-action-buttons">
                        <button
                            className="pankhudi-add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={addingToCart || product.stock === 0}
                        >
                            {addingToCart ? 'Adding...' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
                        </button>
                        <button
                            className="pankhudi-buy-now-btn"
                            onClick={handleBuyNow}
                            disabled={addingToCart || product.stock === 0}
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Enhanced Product Policies Section */}
                    <ProductPolicies product={product} />

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="pankhudi-tags">
                            <strong>Tags: </strong>
                            {product.tags.map((tag, index) => (
                                <span key={index} className="pankhudi-tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Tabs */}
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
                        className={`pankhudi-tab-header ${activeTab === 'features' ? 'active' : ''}`}
                        onClick={() => setActiveTab('features')}
                    >
                        Features
                    </button>
                    <button
                        className={`pankhudi-tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                        id="reviews-section"
                    >
                        Reviews ({totalReviews})
                    </button>
                </div>

                <div className="pankhudi-tab-content">
                    {activeTab === 'description' && (
                        <div className="pankhudi-tab-panel">
                            <ProductDescription
                                description={product.description}
                                showFullDescription={showFullDescription}
                                setShowFullDescription={setShowFullDescription}
                            />
                            <ProductTags tags={product.tags} />
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="pankhudi-tab-panel">
                            <ProductSpecifications product={product} />
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="pankhudi-tab-panel">
                            <ProductFeatures features={product.features} />
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="pankhudi-tab-panel">
                            <div className="pankhudi-reviews-header">
                                <div className="pankhudi-reviews-summary">
                                    <div className="pankhudi-average-rating">
                                        <span className="pankhudi-rating-big">{averageRating}</span>
                                        <div className="pankhudi-rating-stars">
                                            {'⭐'.repeat(5)}
                                        </div>
                                        <span className="pankhudi-rating-count">{totalReviews} reviews</span>
                                    </div>
                                    <div className="pankhudi-rating-breakdown">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <div key={rating} className="pankhudi-rating-bar">
                                                <span>{rating} ⭐</span>
                                                <div className="pankhudi-bar-container">
                                                    <div
                                                        className="pankhudi-bar-fill"
                                                        style={{
                                                            width: `${totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span>({ratingDistribution[rating]})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pankhudi-reviews-controls">
                                    <button
                                        className="pankhudi-refresh-reviews"
                                        onClick={manuallyRefreshReviews}
                                        disabled={reviewsLoading}
                                    >
                                        {reviewsLoading ? 'Refreshing...' : '🔄 Refresh'}
                                    </button>
                                    {isLiveFetching && (
                                        <span className="pankhudi-live-indicator">
                                            ● Live Updates
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Review Form */}
                            <ReviewForm
                                onSubmit={handleReviewSubmit}
                                reviewText={reviewText}
                                setReviewText={setReviewText}
                                selectedRating={selectedRating}
                                setSelectedRating={setSelectedRating}
                                loading={reviewLoading}
                                error={reviewError}
                                currentUser={currentUser}
                            />

                            {/* Reviews List */}
                            <div className="pankhudi-reviews-list">
                                {reviewsLoading ? (
                                    <div className="pankhudi-reviews-loading">
                                        <div className="pankhudi-loading-spinner"></div>
                                        <p>Loading reviews...</p>
                                    </div>
                                ) : totalReviews > 0 ? (
                                    reviews.map((review) => (
                                        <ReviewItem
                                            key={review.id}
                                            review={review}
                                            currentUser={currentUser}
                                            onDeleteReview={handleDeleteReview}
                                            isReviewAuthor={isReviewAuthor}
                                        />
                                    ))
                                ) : (
                                    <div className="pankhudi-no-reviews">
                                        <p>No reviews yet. Be the first to review this product!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            <RelatedProducts
                products={relatedProducts}
                loading={relatedLoading}
                navigate={navigate}
            />
        </div>
    );
};

export default ProductDetailsEnhanced;