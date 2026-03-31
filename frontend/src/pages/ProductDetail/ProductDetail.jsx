import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Footer from "../../components/Footer";
import "./ProductDetail.css";

marked.setOptions({
    breaks: true,
    gfm: true,
});

// Helper function for date formatting
const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return "Invalid Date";
    }
};

// ============================================
// PRODUCT GALLERY COMPONENT
// ============================================
const ProductGallery = ({ images, productName, mainImage, setMainImage, imageLoading, setImageLoading, videoUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showThumbnailScroll, setShowThumbnailScroll] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [showVideo, setShowVideo] = useState(false);
    const [videoRef, setVideoRef] = useState(null);
    const thumbnailContainerRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const animationFrameRef = useRef(null);

    const allMediaItems = videoUrl ? [...images, 'VIDEO'] : [...images];

    useEffect(() => {
        if (mainImage === 'VIDEO') {
            setCurrentIndex(allMediaItems.length - 1);
            setShowVideo(true);
        } else if (images && mainImage) {
            const index = images.findIndex(img => img === mainImage);
            if (index !== -1) setCurrentIndex(index);
            setShowVideo(false);
        }
    }, [mainImage, images, allMediaItems]);

    const handleVideoEnd = () => {
        if (videoRef) {
            videoRef.currentTime = 0;
            videoRef.play();
        }
    };

    const checkThumbnailScroll = useCallback(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(() => {
            if (thumbnailContainerRef.current) {
                const container = thumbnailContainerRef.current;
                const hasScroll = container.scrollWidth > container.clientWidth;
                setShowThumbnailScroll(prev => prev !== hasScroll ? hasScroll : prev);
            }
        });
    }, []);

    useEffect(() => {
        checkThumbnailScroll();
        try {
            resizeObserverRef.current = new ResizeObserver(checkThumbnailScroll);
            if (thumbnailContainerRef.current) resizeObserverRef.current.observe(thumbnailContainerRef.current);
        } catch (error) {
            window.addEventListener('resize', checkThumbnailScroll);
            return () => window.removeEventListener('resize', checkThumbnailScroll);
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
        };
    }, [checkThumbnailScroll]);

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

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
        setTouchStart(null);
    };

    const scrollThumbnailIntoView = (index) => {
        if (thumbnailContainerRef.current && thumbnailContainerRef.current.children[index]) {
            requestAnimationFrame(() => {
                thumbnailContainerRef.current.children[index].scrollIntoView({
                    behavior: 'smooth', block: 'nearest', inline: 'center'
                });
            });
        }
    };

    const handleVideoClick = () => handleMediaChange(allMediaItems.length - 1);
    const handleCloseVideo = () => {
        setShowVideo(false);
        if (images && images.length > 0) {
            setMainImage(images[0]);
            setCurrentIndex(0);
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="product-gallery">
                <div className="main-image-container">
                    <div className="main-image">
                        <div className="no-image">
                            <div className="no-image-icon">📷</div>
                            <p>No Image Available</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-gallery">
            <div className="main-image-container">
                <div className="main-image" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    {imageLoading && !showVideo && (
                        <div className="image-loader">
                            <div className="loader-spinner"></div>
                        </div>
                    )}

                    {showVideo && videoUrl ? (
                        <div className="video-container">
                            <video
                                ref={ref => setVideoRef(ref)}
                                controls
                                autoPlay
                                loop={false}
                                onEnded={handleVideoEnd}
                                className="product-video"
                                poster={images[0]}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <button className="close-video" onClick={handleCloseVideo}>
                                ✕
                            </button>
                        </div>
                    ) : (
                        <img
                            src={mainImage}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                            style={{ display: imageLoading ? 'none' : 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    )}

                    <div className="image-counter">
                        {currentIndex + 1} / {allMediaItems.length}
                        {allMediaItems[currentIndex] === 'VIDEO' && ' (Video)'}
                    </div>

                    {allMediaItems.length > 1 && (
                        <>
                            <button className="nav-btn prev-btn" onClick={prevImage}>‹</button>
                            <button className="nav-btn next-btn" onClick={nextImage}>›</button>
                        </>
                    )}
                </div>

                {allMediaItems.length > 1 && (
                    <div className="image-dots">
                        {allMediaItems.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentIndex ? 'active' : ''} ${allMediaItems[index] === 'VIDEO' ? 'video-dot' : ''}`}
                                onClick={() => handleMediaChange(index)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="thumbnails-section">
                <div className="thumbnails-header">
                    <span className="thumbnails-title">
                        Product Media ({images.length}{videoUrl && ` + 1 Video`})
                    </span>
                    {showThumbnailScroll && (
                        <span className="scroll-hint">← Scroll to view all media →</span>
                    )}
                </div>

                <div className="thumbnails" ref={thumbnailContainerRef}>
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`thumbnail-container ${mainImage === img ? "active" : ""}`}
                            onClick={() => handleMediaChange(index)}
                        >
                            <img
                                src={img}
                                alt={`${productName} ${index + 1}`}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="thumbnail-fallback">{index + 1}</div>
                            <div className="thumbnail-overlay">
                                <span className="thumbnail-number">{index + 1}</span>
                            </div>
                        </div>
                    ))}

                    {videoUrl && (
                        <div
                            className={`thumbnail-container video-thumbnail ${showVideo ? "active" : ""}`}
                            onClick={handleVideoClick}
                        >
                            <div className="video-thumbnail-content">
                                <span className="play-icon">▶</span>
                                <span>Video</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================
// PRODUCT BADGES COMPONENT
// ============================================
const ProductBadges = ({ product }) => {
    const badges = [];
    if (product.discount > 0) badges.push({ type: 'discount', text: `${product.discount}% OFF`, color: '#ff6b6b' });
    if (product.is_trending) badges.push({ type: 'trending', text: 'TRENDING', color: '#ffd43b' });
    if (product.is_featured) badges.push({ type: 'featured', text: 'FEATURED', color: '#4c44d4' });
    if (product.is_bestseller) badges.push({ type: 'bestseller', text: 'BESTSELLER', color: '#e83e8c' });
    if (product.stock === 0) badges.push({ type: 'out-of-stock', text: 'OUT OF STOCK', color: '#868e96' });
    else if (product.stock <= (product.low_stock_threshold || 10)) badges.push({ type: 'low-stock', text: 'LOW STOCK', color: '#f59f00' });
    if (badges.length === 0) return null;
    return (
        <div className="product-badges">
            {badges.map((badge, index) => (<span key={index} className={`badge badge-${badge.type}`} style={{ backgroundColor: badge.color }}>{badge.text}</span>))}
        </div>
    );
};

// ============================================
// PRODUCT VARIANTS COMPONENT
// ============================================
const ProductVariants = ({ sizes, colors, materials, selectedSize, setSelectedSize, selectedColor, setSelectedColor, selectedMaterial, setSelectedMaterial }) => {
    if ((!sizes || sizes.length === 0) && (!colors || colors.length === 0) && (!materials || materials.length === 0)) return null;

    const getColorName = (color) => {
        const colorMap = { 'red': 'Red', 'blue': 'Blue', 'green': 'Green', 'black': 'Black', 'white': 'White', 'yellow': 'Yellow', 'pink': 'Pink', 'purple': 'Purple', 'orange': 'Orange', 'brown': 'Brown', 'gray': 'Gray', 'navy': 'Navy Blue', 'maroon': 'Maroon', 'teal': 'Teal', 'cyan': 'Cyan' };
        return colorMap[color.toLowerCase().trim()] || color;
    };

    const isValidColor = (color) => {
        const validColors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'navy', 'maroon', 'teal', 'cyan'];
        return validColors.includes(color.toLowerCase().trim());
    };

    return (
        <div className="variants-section">
            <h4>Available Options</h4>
            <div className="variants-grid">
                {sizes && sizes.length > 0 && (
                    <div className="variant-group">
                        <label className="variant-label">Size:</label>
                        <div className="variant-options">
                            {sizes.map((size, index) => (
                                <button key={index} className={`variant-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>{size}</button>
                            ))}
                        </div>
                    </div>
                )}
                {colors && colors.length > 0 && (
                    <div className="variant-group">
                        <label className="variant-label">Color:</label>
                        <div className="variant-options color-options">
                            {colors.map((color, index) => {
                                const colorName = getColorName(color);
                                const isValidBgColor = isValidColor(color);
                                return (
                                    <div key={index} className="color-option">
                                        <button className={`color-btn ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)} style={{ backgroundColor: isValidBgColor ? color.toLowerCase() : 'transparent', border: isValidBgColor ? (color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none') : '1px solid #ddd' }}>
                                            {selectedColor === color && <span className="color-checkmark">✓</span>}
                                            {!isValidBgColor && <span className="color-pattern">{color.charAt(0)}</span>}
                                        </button>
                                        <span className="color-name">{colorName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {materials && materials.length > 0 && (
                    <div className="variant-group">
                        <label className="variant-label">Material:</label>
                        <div className="variant-options">
                            {materials.map((material, index) => (
                                <button key={index} className={`variant-btn ${selectedMaterial === material ? 'active' : ''}`} onClick={() => setSelectedMaterial(material)}>{material}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// PRODUCT POLICIES COMPONENT
// ============================================
const ProductPolicies = ({ product }) => {
    const policies = [
        { icon: '↩️', title: 'Return Policy', description: product.return_policy || '7 Days Return Policy' },
        { icon: '🚚', title: 'Delivery', description: product.free_shipping ? 'Free Shipping' : (product.shipping_cost ? `₹${product.shipping_cost}` : 'Standard Shipping') },
        { icon: '🛡️', title: 'Warranty', description: product.warranty || 'Manufacturer Warranty' },
        { icon: '🔒', title: 'Payment', description: 'Secure Payment' }
    ];
    return (
        <div className="policies-section">
            <h4>Product Policies & Services</h4>
            <div className="policies-grid">
                {policies.map((policy, index) => (
                    <div key={index} className="policy-item">
                        <div className="policy-icon">{policy.icon}</div>
                        <div className="policy-content"><h5 className="policy-title">{policy.title}</h5><p className="policy-description">{policy.description}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// PRODUCT DESCRIPTION COMPONENT
// ============================================
const ProductDescription = ({ description, showFullDescription, setShowFullDescription }) => {
    const [needsReadMore, setNeedsReadMore] = useState(false);
    const [parsedDescription, setParsedDescription] = useState('');

    useEffect(() => {
        if (!description) {
            setNeedsReadMore(false);
            setParsedDescription('');
            return;
        }

        try {
            const parsed = DOMPurify.sanitize(marked.parse(description));
            setParsedDescription(parsed);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = parsed;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            setNeedsReadMore(plainText.length > 300);
        } catch (error) {
            console.error('Error parsing description:', error);
            setParsedDescription(description);
            setNeedsReadMore(description.length > 300);
        }
    }, [description]);

    if (!description) {
        return <p className="no-description">No description available.</p>;
    }

    return (
        <div className="description-section">
            <div className="section-header">
                <h3>Product Description</h3>
            </div>
            <div className="description-content">
                <div
                    className={`description-text ${showFullDescription ? 'expanded' : 'collapsed'}`}
                    dangerouslySetInnerHTML={{ __html: parsedDescription }}
                />
                {needsReadMore && (
                    <button className="read-more-btn" onClick={() => setShowFullDescription(!showFullDescription)}>
                        {showFullDescription ? 'Read Less' : 'Read More'}
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================
// PRODUCT SPECIFICATIONS COMPONENT
// ============================================
const ProductSpecifications = ({ product }) => {
    const [expanded, setExpanded] = useState(false);
    const specifications = [
        { label: "SKU", value: product.sku },
        { label: "Brand", value: product.brand },
        { label: "Short Description", value: product.short_description },
        { label: "Price", value: product.price ? `₹${product.price}` : null },
        { label: "Discount", value: product.discount > 0 ? `${product.discount}% OFF` : null },
        { label: "Stock", value: product.stock },
        { label: "Rating", value: product.rating },
        { label: "Category", value: product.category_name },
        { label: "Sub Category", value: product.sub_category_name },
        { label: "Sub Sub Category", value: product.sub_sub_category_name },
        { label: "Status", value: product.status },
        { label: "Material", value: product.material },
        { label: "Weight", value: product.weight ? `${product.weight} kg` : null },
        { label: "Dimensions", value: product.dimensions },
        { label: "Warranty", value: product.warranty },
        { label: "Return Policy", value: product.return_policy },
        { label: "Shipping Class", value: product.shipping_class },
        { label: "Free Shipping", value: product.free_shipping ? "Yes" : "No" }
    ].filter(spec => spec.value !== null && spec.value !== undefined && spec.value !== "");

    if (specifications.length === 0) return null;

    const visibleSpecs = expanded ? specifications : specifications.slice(0, 10);

    return (
        <div className="specifications-section">
            <div className="section-header">
                <h3>Product Specifications</h3>
                {specifications.length > 10 && (
                    <button className="expand-specs-btn" onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Show Less' : `Show All (${specifications.length})`}
                    </button>
                )}
            </div>
            <div className="spec-grid">
                {visibleSpecs.map((spec, index) => (
                    <div key={index} className="spec-item">
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value">{spec.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// PRODUCT FEATURES COMPONENT
// ============================================
const ProductFeatures = ({ features }) => {
    if (!features || features.length === 0) return null;
    return (
        <div className="features-section">
            <div className="section-header"><h3>Product Features</h3></div>
            <div className="features-list">
                {features.map((feature, index) => (
                    <div key={index} className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span className="feature-text">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// REVIEW REPLY COMPONENT
// ============================================
const ReviewReply = ({ reply, currentUser, onDeleteReply, onLikeReply }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reply.likes_count || 0);

    const getUserInitial = (userName) => {
        if (!userName || userName === 'Anonymous User') return "U";
        return userName.charAt(0).toUpperCase();
    };

    const getAvatarColor = (userName) => {
        if (!userName || userName === 'Anonymous User') return "#007bff";
        const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#6f42c1", "#fd7e14", "#20c997", "#e83e8c"];
        const index = userName.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;
        setIsDeleting(true);
        try {
            await onDeleteReply(reply.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            alert("Please login to like replies");
            return;
        }
        try {
            const result = await onLikeReply(reply.id, !isLiked);
            setIsLiked(!isLiked);
            setLikesCount(result.likes_count);
        } catch (err) {
            console.error("Error liking reply:", err);
        }
    };

    const userInitial = getUserInitial(reply.user_name);
    const avatarColor = getAvatarColor(reply.user_name);
    const isAuthor = currentUser && reply.user_id === currentUser.id;

    return (
        <div className={`review-reply ${isDeleting ? 'deleting' : ''}`}>
            <div className="reply-header">
                <div className="reply-avatar">
                    {reply.user_image ? (
                        <img
                            src={reply.user_image}
                            alt={reply.user_name}
                            className="reply-avatar-img"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="avatar-fallback small"
                        style={{
                            backgroundColor: avatarColor,
                            display: reply.user_image ? 'none' : 'flex'
                        }}
                    >
                        {userInitial}
                    </div>
                </div>
                <div className="reply-content">
                    <div className="reply-author-info">
                        <span className="reply-author-name">{reply.user_name || 'Anonymous User'}</span>
                        <span className="reply-date">
                            {formatDate(reply.created_at)}
                        </span>
                    </div>
                    <p className="reply-text">{reply.reply_text}</p>
                    <div className="reply-actions">
                        <button className={`reply-like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                            ❤️ {likesCount > 0 && likesCount}
                        </button>
                        {isAuthor && (
                            <button className="reply-delete-btn" onClick={handleDelete} disabled={isDeleting}>
                                🗑️ Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// REVIEW REPLY FORM COMPONENT
// ============================================
const ReviewReplyForm = ({ reviewId, onReplySubmit, currentUser, onCancel }) => {
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Please login to reply");
            return;
        }
        if (!replyText.trim()) {
            setError("Please enter a reply");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onReplySubmit(reviewId, replyText);
            setReplyText("");
            onCancel();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit reply");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="reply-form" onSubmit={handleSubmit}>
            <div className="reply-input-container">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows="2"
                    maxLength="500"
                />
                <div className="reply-form-actions">
                    <button type="button" className="cancel-reply-btn" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="submit-reply-btn" disabled={loading || !replyText.trim()}>
                        {loading ? 'Posting...' : 'Post Reply'}
                    </button>
                </div>
                {error && <div className="reply-error">{error}</div>}
            </div>
        </form>
    );
};

// ============================================
// REVIEW ITEM COMPONENT
// ============================================
const ReviewItem = ({ review, currentUser, onDeleteReview, isReviewAuthor, onAddReply, onDeleteReply, onLikeReply, replies = [] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [needsReadMore, setNeedsReadMore] = useState(false);
    const [showAdminReply, setShowAdminReply] = useState(false);
    const [adminReplyNeedsReadMore, setAdminReplyNeedsReadMore] = useState(false);

    useEffect(() => {
        if (review.review && review.review.length > 200) {
            setNeedsReadMore(true);
        } else {
            setNeedsReadMore(false);
        }

        if (review.admin_reply && review.admin_reply.length > 150) {
            setAdminReplyNeedsReadMore(true);
        } else {
            setAdminReplyNeedsReadMore(false);
        }
    }, [review.review, review.admin_reply]);

    const getUserInitial = (userName) => {
        if (!userName) return "U";
        return userName.charAt(0).toUpperCase();
    };

    const getAvatarColor = (userName) => {
        if (!userName) return "#007bff";
        const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#6f42c1", "#fd7e14", "#20c997", "#e83e8c"];
        const index = userName.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your review? This will also delete all replies.")) return;
        setIsDeleting(true);
        try {
            await onDeleteReview(review.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const userInitial = getUserInitial(review.user_name);
    const avatarColor = getAvatarColor(review.user_name);
    const hasAdminReply = review.admin_reply && review.admin_reply.trim() !== '';

    return (
        <div className={`review-item ${isDeleting ? 'deleting' : ''}`}>
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="avatar-container">
                        {review.user_image ? (
                            <img
                                src={review.user_image}
                                alt={review.user_name}
                                className="reviewer-avatar"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="avatar-fallback"
                            style={{
                                backgroundColor: avatarColor,
                                display: review.user_image ? 'none' : 'flex'
                            }}
                        >
                            {userInitial}
                        </div>
                    </div>
                    <div className="reviewer-details">
                        <h5 className="reviewer-name">{review.user_name || 'Anonymous User'}</h5>
                        <div className="review-rating">
                            {'⭐'.repeat(review.rating)}
                            <span className="rating-text">({review.rating}/5)</span>
                        </div>
                    </div>
                </div>
                <div className="review-meta">
                    <span className="review-date">
                        {formatDate(review.created_at)}
                    </span>
                    {isReviewAuthor(review) && (
                        <button className="delete-review-btn" onClick={handleDelete} disabled={isDeleting} title="Delete your review">
                            {isDeleting ? 'Deleting...' : '🗑️'}
                        </button>
                    )}
                </div>
            </div>

            <div className="review-content-wrapper">
                <div className={`review-content-text ${!isExpanded && needsReadMore ? 'collapsed' : ''}`}>
                    <p>{review.review}</p>
                </div>
                {needsReadMore && (
                    <button className="read-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                )}
            </div>

            {hasAdminReply && (
                <div className="admin-reply-section">
                    <div className="admin-reply-header">
                        <div className="admin-reply-icon">
                            <span>🛡️</span>
                            <span className="admin-reply-label">Admin Response</span>
                        </div>
                        {review.admin_reply_date && (
                            <span className="admin-reply-date">
                                {formatDate(review.admin_reply_date)}
                            </span>
                        )}
                    </div>
                    <div className="admin-reply-content">
                        <div className={`admin-reply-text ${!showAdminReply && adminReplyNeedsReadMore ? 'collapsed' : ''}`}>
                            <p>{review.admin_reply}</p>
                        </div>
                        {adminReplyNeedsReadMore && (
                            <button
                                className="read-more-btn admin-read-more"
                                onClick={() => setShowAdminReply(!showAdminReply)}
                            >
                                {showAdminReply ? 'Read Less' : 'Read More'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="review-actions">
                <button className="reply-to-review-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
                    💬 Reply {replies.length > 0 && `(${replies.length})`}
                </button>
            </div>

            {showReplyForm && (
                <ReviewReplyForm
                    reviewId={review.id}
                    onReplySubmit={onAddReply}
                    currentUser={currentUser}
                    onCancel={() => setShowReplyForm(false)}
                />
            )}

            {replies.length > 0 && (
                <div className="review-replies-section">
                    <button className="toggle-replies-btn" onClick={() => setShowReplies(!showReplies)}>
                        {showReplies ? '▼ Hide replies' : `▶ View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                    </button>
                    {showReplies && (
                        <div className="replies-list">
                            {replies.map((reply) => (
                                <ReviewReply
                                    key={reply.id}
                                    reply={reply}
                                    currentUser={currentUser}
                                    onDeleteReply={onDeleteReply}
                                    onLikeReply={onLikeReply}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================
// REVIEW FORM COMPONENT
// ============================================
const ReviewForm = ({ onSubmit, reviewText, setReviewText, selectedRating, setSelectedRating, loading, error, currentUser }) => {
    if (!currentUser) {
        return (
            <div className="review-login-prompt">
                <p>Please <Link to="/login">login</Link> to write a review.</p>
            </div>
        );
    }

    return (
        <form className="review-form" onSubmit={onSubmit}>
            <h4>Write a Review</h4>
            <div className="rating-input">
                <label>Your Rating:</label>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" className={`star-btn ${selectedRating >= star ? 'active' : ''}`} onClick={() => setSelectedRating(star)}>
                            ⭐
                        </button>
                    ))}
                    <span className="rating-text">({selectedRating}/5)</span>
                </div>
            </div>
            <div className="review-textarea">
                <label htmlFor="review-text">Your Review:</label>
                <textarea id="review-text" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience with this product..." rows="4" maxLength="1000" />
                <div className="char-count">{reviewText.length}/1000 characters</div>
            </div>
            {error && <div className="review-error">{error}</div>}
            <button type="submit" className="submit-review-btn" disabled={loading || !reviewText.trim()}>
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

// ============================================
// RELATED PRODUCTS COMPONENT
// ============================================
const RelatedProducts = ({ products, loading, navigate }) => {
    if (loading) return (
        <div className="related-products">
            <div className="section-header"><h3>You May Also Like</h3></div>
            <div className="related-loading"><div className="loading-spinner"></div><p>Loading related products...</p></div>
        </div>
    );
    if (!products || products.length === 0) return null;

    const formatPrice = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);

    const calculateDiscountedPrice = (product) => {
        if (product.discount && product.discount > 0) {
            return product.price - (product.price * product.discount / 100);
        }
        return product.price;
    };

    return (
        <div className="related-products">
            <div className="section-header"><h3>You May Also Like</h3></div>
            <div className="related-grid">
                {products.map((product) => {
                    const discountedPrice = calculateDiscountedPrice(product);
                    const hasDiscount = product.discount > 0;

                    return (
                        <div key={product.id} className="related-card" onClick={() => navigate(`/ProductDetail/${product.id}`)}>
                            <div className="related-image">
                                <img src={product.images?.[0] || '/placeholder-image.jpg'} alt={product.name} onError={(e) => e.target.src = '/placeholder-image.jpg'} />
                                {hasDiscount && <span className="related-discount-badge">{product.discount}% OFF</span>}
                            </div>
                            <div className="related-info">
                                <h5 className="related-title">{product.name}</h5>
                                <div className="related-price-container">
                                    {hasDiscount ? (
                                        <>
                                            <span className="related-current-price">{formatPrice(discountedPrice)}</span>
                                            <span className="related-original-price">{formatPrice(product.price)}</span>
                                            <span className="related-save-price">Save ₹{(product.price - discountedPrice).toFixed(0)}</span>
                                        </>
                                    ) : (
                                        <span className="related-current-price">{formatPrice(product.price)}</span>
                                    )}
                                </div>
                                <div className="related-rating">
                                    <span className="stars">⭐</span>
                                    <span>{product.rating || '4.5'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================
// NOTIFICATION TOAST COMPONENT
// ============================================
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification-toast ${type}`}>
            <div className="notification-content">
                <span className="notification-icon">{type === 'reply' ? '💬' : '🔔'}</span>
                <span className="notification-message">{message}</span>
            </div>
            <button className="notification-close" onClick={onClose}>×</button>
        </div>
    );
};

// ============================================
// MAIN PRODUCT DETAILS COMPONENT
// ============================================
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
    const [isLiveFetching, setIsLiveFetching] = useState(true);
    const pollingIntervalRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartMessageType, setCartMessageType] = useState("");
    const [notifications, setNotifications] = useState([]);

    // Get current user from token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({ id: tokenData.userId || tokenData.id, name: tokenData.name || tokenData.username, email: tokenData.email });
            } catch (err) { console.error("Error decoding token:", err); }
        }
    }, []);

    // Fetch reviews with replies
    const fetchReviews = async (productId, showLoading = true) => {
        try {
            if (showLoading) setReviewsLoading(true);
            const { data } = await axios.get(`http://localhost:5000/api/reviews/${productId}?t=${Date.now()}`);

            const reviewsWithReplies = await Promise.all(
                (data || []).map(async (review) => {
                    try {
                        const repliesResponse = await axios.get(`http://localhost:5000/api/reviews/${review.id}/replies`);
                        return { ...review, replies: repliesResponse.data || [] };
                    } catch (err) {
                        console.error(`Error fetching replies for review ${review.id}:`, err);
                        return { ...review, replies: [] };
                    }
                })
            );

            setReviews(reviewsWithReplies || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setReviews([]);
        } finally {
            if (showLoading) setReviewsLoading(false);
        }
    };

    // Add notification
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    // Remove notification
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Add reply to review
    const handleAddReply = async (reviewId, replyText) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to reply");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/reviews/${reviewId}/replies`, {
                reply_text: replyText
            }, { headers: { Authorization: `Bearer ${token}` } });

            const newReply = response.data.reply;

            setReviews(prevReviews =>
                prevReviews.map(review => {
                    if (review.id === reviewId) {
                        return {
                            ...review,
                            replies: [...(review.replies || []), newReply]
                        };
                    }
                    return review;
                })
            );

            addNotification("Reply posted successfully!", "success");
        } catch (err) {
            console.error("Error adding reply:", err);
            addNotification(err.response?.data?.message || "Failed to post reply", "error");
            throw err;
        }
    };

    // Delete reply
    const handleDeleteReply = async (replyId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to delete reply");
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/reviews/replies/${replyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReviews(prevReviews =>
                prevReviews.map(review => ({
                    ...review,
                    replies: (review.replies || []).filter(reply => reply.id !== replyId)
                }))
            );

            addNotification("Reply deleted successfully!", "success");
        } catch (err) {
            console.error("Error deleting reply:", err);
            addNotification(err.response?.data?.message || "Failed to delete reply", "error");
        }
    };

    // Like reply
    const handleLikeReply = async (replyId, isLiked) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to like replies");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/reviews/replies/${replyId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (err) {
            console.error("Error liking reply:", err);
            addNotification("Failed to like reply", "error");
            throw err;
        }
    };

    // Start live fetching
    const startLiveFetching = () => {
        if (!product || pollingIntervalRef.current) return;
        setIsLiveFetching(true);
        pollingIntervalRef.current = setInterval(() => fetchReviews(product.id, false), 30000);
    };

    const stopLiveFetching = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            setIsLiveFetching(false);
        }
    };

    // Fetch related products
    const fetchRelatedProducts = async (categoryId, currentProductId) => {
        try {
            setRelatedLoading(true);
            const { data } = await axios.get(`http://localhost:5001/api/products?category_id=${categoryId}&exclude=${currentProductId}&limit=4`);
            setRelatedProducts(data || []);
        } catch (err) {
            console.error("Error fetching related products:", err);
            setRelatedProducts([]);
        } finally {
            setRelatedLoading(false);
        }
    };

    // Fetch product data
    const fetchProductData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5001/api/products/${id}`);
            const data = response.data.product || response.data;
            if (!data) throw new Error("Product not found");
            setProduct(data);
            setMainImage(data.images?.[0] || "");
            if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
            if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
            if (data.materials && data.materials.length > 0) setSelectedMaterial(data.materials[0]);

            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/check/${data.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    setIsWishlisted(wishlistResponse.data.isWishlisted);
                } catch (wishlistErr) { console.error("Error checking wishlist:", wishlistErr); }
            }

            await Promise.all([fetchReviews(data.id), fetchRelatedProducts(data.category_id, data.id)]);
            startLiveFetching();
        } catch (err) {
            console.error("Error fetching product data:", err);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProductData(); return () => stopLiveFetching(); }, [id]);

    // Quantity handlers
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        const maxQty = product.max_order_quantity || product.stock || 0;
        const minQty = product.min_order_quantity || 1;
        if (value >= minQty && value <= maxQty) setQuantity(value);
    };

    const incrementQuantity = () => {
        const maxQty = product.max_order_quantity || product.stock || 0;
        if (quantity < maxQty) setQuantity(quantity + 1);
    };

    const decrementQuantity = () => {
        const minQty = product.min_order_quantity || 1;
        if (quantity > minQty) setQuantity(quantity - 1);
    };

    const calculateDiscountedPrice = () => product ? (product.discountPrice || (product.discount > 0 ? product.price - (product.price * product.discount / 100) : product.price)) : 0;
    const formatPrice = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);

    // Cart handlers
    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) { alert("Please login to add items to cart"); navigate('/login'); return; }
        if (!product || product.stock === 0) { setCartMessage("Product is out of stock"); setCartMessageType("error"); setTimeout(() => setCartMessage(""), 3000); return; }
        try {
            setAddingToCart(true);
            setCartMessage("");
            const cartData = { product_id: product.id, quantity, size: selectedSize, color: selectedColor, material: selectedMaterial, price: calculateDiscountedPrice(), original_price: product.price, discount: product.discount, product_name: product.name, product_image: product.images?.[0], product_sku: product.sku, product_brand: product.brand, product_category: product.category_name, product_sub_category: product.sub_category_name, product_sub_sub_category: product.sub_sub_category_name, weight: product.weight, shipping_cost: product.shipping_cost, free_shipping: product.free_shipping };
            await axios.post("http://localhost:5000/api/cart/add", cartData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setCartMessage("Product added to cart successfully!"); setCartMessageType("success");
            setTimeout(() => setCartMessage(""), 3000);
        } catch (err) {
            console.error("Error adding to cart:", err);
            setCartMessage(err.response?.data?.message || "Failed to add product to cart"); setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
        } finally { setAddingToCart(false); }
    };

    const handleBuyNow = async () => {
        const token = localStorage.getItem("token");
        if (!token) { alert("Please login to proceed with purchase"); navigate('/login'); return; }
        try {
            setAddingToCart(true);
            const cartData = { product_id: product.id, quantity, size: selectedSize, color: selectedColor, material: selectedMaterial, price: calculateDiscountedPrice(), original_price: product.price, discount: product.discount, product_name: product.name, product_image: product.images?.[0], product_sku: product.sku, product_brand: product.brand, product_category: product.category_name, product_sub_category: product.sub_category_name, product_sub_sub_category: product.sub_sub_category_name };
            await axios.post("http://localhost:5000/api/cart/add", cartData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            navigate('/cart');
        } catch (err) {
            console.error("Error adding to cart:", err);
            setCartMessage(err.response?.data?.message || "Failed to add product to cart"); setCartMessageType("error");
            setTimeout(() => setCartMessage(""), 3000);
        } finally { setAddingToCart(false); }
    };

    // Wishlist handler
    const handleWishlistToggle = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login to manage wishlist"); navigate('/login'); return; }
            if (isWishlisted) await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
            else await axios.post("http://localhost:5000/api/wishlist", { product_id: product.id }, { headers: { Authorization: `Bearer ${token}` } });
            setIsWishlisted(!isWishlisted);
        } catch (err) { console.error("Wishlist error:", err); alert(err.response?.data?.message || "Wishlist operation failed"); }
    };

    // Review handler
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) { setReviewError("Please login to submit a review"); setTimeout(() => navigate('/login'), 2000); return; }
        if (!reviewText.trim()) { setReviewError("Write a review first."); return; }
        try {
            setReviewLoading(true);
            setReviewError("");
            await axios.post("http://localhost:5000/api/reviews", {
                product_id: product.id,
                rating: selectedRating,
                review: reviewText,
                approved: true
            }, { headers: { Authorization: `Bearer ${token}` } });
            setReviewText("");
            setSelectedRating(5);
            await fetchReviews(product.id, false);
            addNotification("Review submitted successfully!", "success");
        } catch (err) {
            console.error("Error submitting review:", err);
            setReviewError(err.response?.data?.message || "Failed to submit review.");
        } finally { setReviewLoading(false); }
    };

    // Delete review handler
    const handleDeleteReview = async (reviewId) => {
        const token = localStorage.getItem("token");
        if (!token) { alert("Please login to delete review"); return; }
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
            setReviews(prev => prev.filter(review => review.id !== reviewId));
            addNotification("Review deleted successfully!", "success");
        } catch (err) { console.error("Error deleting review:", err); alert("Failed to delete review"); }
    };

    const isReviewAuthor = (review) => currentUser && review && review.user_id === currentUser.id;

    const getAverageRating = () => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => { if (review.rating && distribution.hasOwnProperty(review.rating)) distribution[review.rating]++; });
        return distribution;
    };

    const scrollToReviews = () => { setActiveTab('reviews'); setTimeout(() => { const reviewsSection = document.getElementById('reviews-section'); if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth' }); }, 100); };
    const manuallyRefreshReviews = () => { if (product) fetchReviews(product.id, true); };

    if (loading) return <div className="loading"><div className="loading-spinner"></div><p>Loading product details...</p></div>;
    if (!product) return <div className="error"><h2>Product Not Found</h2><p>The product you're looking for doesn't exist.</p><Link to="/" className="back-home">Back to Home</Link></div>;

    const discountedPrice = calculateDiscountedPrice();
    const hasDiscount = product.discount > 0;
    const ratingDistribution = getRatingDistribution();
    const averageRating = getAverageRating();
    const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 10);
    const totalReviews = reviews.length;

    return (
        <div className="product-details-container">
            <div className="notifications-container">
                {notifications.map(notif => (
                    <NotificationToast
                        key={notif.id}
                        message={notif.message}
                        type={notif.type}
                        onClose={() => removeNotification(notif.id)}
                    />
                ))}
            </div>

            <header className="product-header">
                <div className="header-content">
                    <Link to="/" className="brand-name">Pankhudi</Link>
                    <nav className="breadcrumb">
                        <Link to="/">Home</Link> &gt;
                        <Link to={`/category/${product.category_id}`}>{product.category_name || 'Category'}</Link> &gt;
                        {product.sub_category_name && <><Link to={`/category/${product.category_id}?sub_category=${product.sub_category_id}`}>{product.sub_category_name}</Link> &gt;</>}
                        {product.sub_sub_category_name && <><Link to={`/category/${product.category_id}?sub_category=${product.sub_category_id}&sub_sub_category=${product.sub_sub_category_id}`}>{product.sub_sub_category_name}</Link> &gt;</>}
                        <span className="product-name-breadcrumb">{product.name}</span>
                    </nav>
                </div>
            </header>

            {cartMessage && <div className={`cart-message ${cartMessageType}`}>{cartMessage}</div>}

            <main className="product-main">
                <div className="desktop-view">
                    <div className="product-container-desktop">
                        <div className="gallery-column">
                            <ProductGallery images={product.images} productName={product.name} mainImage={mainImage} setMainImage={setMainImage} imageLoading={imageLoading} setImageLoading={setImageLoading} videoUrl={product.video} />
                        </div>
                        <div className="info-column">
                            <ProductBadges product={product} />
                            <div className="product-header-info-desktop">
                                <div className="category-path-desktop">
                                    <Link to={`/category/${product.category_id}`} className="category-link">{product.category_name}</Link>
                                    {product.sub_category_name && <><span className="separator">›</span><Link to={`/category/${product.category_id}?sub_category=${product.sub_category_id}`} className="sub-category-link">{product.sub_category_name}</Link></>}
                                    {product.sub_sub_category_name && <><span className="separator">›</span><Link to={`/category/${product.category_id}?sub_category=${product.sub_category_id}&sub_sub_category=${product.sub_sub_category_id}`} className="sub-sub-category-link">{product.sub_sub_category_name}</Link></>}
                                </div>
                                <h1 className="product-title-desktop">{product.name}</h1>
                                <div className="rating-section-desktop">
                                    <div className="rating-main-desktop">
                                        <span className="rating-desktop">⭐ {averageRating}</span>
                                        <span className="review-count-desktop">({totalReviews} reviews)</span>
                                        {product.is_trending && <span className="trending-badge-desktop">TRENDING</span>}
                                        {product.is_featured && <span className="featured-badge-desktop">FEATURED</span>}
                                        {product.is_bestseller && <span className="bestseller-badge-desktop">BESTSELLER</span>}
                                    </div>
                                    <button className="view-reviews-btn-desktop" onClick={scrollToReviews}>View all reviews</button>
                                </div>
                                {product.sku && <div className="product-sku-desktop"><strong>SKU:</strong> {product.sku}</div>}
                                {product.brand && <div className="product-brand-desktop"><strong>Brand:</strong> {product.brand}</div>}
                                <div className="price-section-desktop">
                                    {hasDiscount ? (
                                        <>
                                            <div className="price-row"><span className="discounted-price-desktop">{formatPrice(discountedPrice)}</span><span className="discount-badge-desktop">{product.discount}% OFF</span></div>
                                            <div className="original-price-row"><span className="original-price-desktop">M.R.P.: {formatPrice(product.price)}</span></div>
                                        </>
                                    ) : (<div className="price-row"><span className="price-desktop">{formatPrice(product.price)}</span></div>)}
                                    {product.tax_class && <div className="tax-info-desktop">Inclusive of all taxes</div>}
                                </div>
                                {product.short_description && (<div className="short-description-desktop"><h4>About this item</h4><p>{product.short_description}</p></div>)}
                                <div className="variants-section-desktop">
                                    <ProductVariants sizes={product.sizes} colors={product.colors} materials={product.materials} selectedSize={selectedSize} setSelectedSize={setSelectedSize} selectedColor={selectedColor} setSelectedColor={setSelectedColor} selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial} />
                                </div>
                            </div>
                        </div>
                        <div className="buy-box-column">
                            <div className="buy-box">
                                <div className="buy-box-header"><span className="buy-box-price">{formatPrice(discountedPrice)}</span>{hasDiscount && <span className="buy-box-discount">Save ₹{(product.price - discountedPrice).toFixed(2)} ({product.discount}%)</span>}</div>
                                <div className="buy-box-content">
                                    <div className="stock-info-desktop"><span className={`stock-desktop ${isLowStock ? 'low-stock' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}`}>{product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}</span>{isLowStock && <span className="low-stock-warning-desktop">Order soon.</span>}</div>
                                    <div className="quantity-section-desktop"><label className="quantity-label">Quantity:</label><div className="quantity-controls-desktop"><button onClick={decrementQuantity} disabled={quantity <= (product.min_order_quantity || 1)}>−</button><input type="number" value={quantity} onChange={handleQuantityChange} min={product.min_order_quantity || 1} max={product.max_order_quantity || product.stock} /><button onClick={incrementQuantity} disabled={quantity >= (product.max_order_quantity || product.stock || 0)}>+</button></div></div>
                                    <div className="buy-box-buttons">
                                        <button className="add-to-cart-btn-desktop" onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}>{addingToCart ? 'Adding...' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}</button>
                                        <button className="buy-now-btn-desktop" onClick={handleBuyNow} disabled={addingToCart || product.stock === 0}>Buy Now</button>
                                        <button className="wishlist-btn-desktop" onClick={handleWishlistToggle}>{isWishlisted ? '❤️' : '🤍'} Add to Wishlist</button>
                                    </div>
                                    <div className="delivery-info"><div className="delivery-option"><span className="delivery-icon">🚚</span><div className="delivery-details"><span className="delivery-title">Delivery</span><span className="delivery-location">Select your location</span></div></div></div>
                                    <div className="return-info"><span className="return-icon">↩️</span><span className="return-text">Return Policy: {product.return_policy || '7 days return policy'}</span></div>
                                    <div className="secure-payment"><span className="secure-icon">🔒</span><span className="secure-text">Secure transaction</span></div>
                                </div>
                            </div>
                            <div className="seller-info"><h4>Sold by</h4><div className="seller-details"><span className="seller-name">Pankhudi Store</span><span className="seller-rating">⭐ 4.5/5</span></div><div className="seller-policies"><span className="policy-item">✓ Fulfilled by Pankhudi</span><span className="policy-item">✓ 7-day Returns</span><span className="policy-item">✓ GST invoice available</span></div></div>
                        </div>
                    </div>
                </div>

                <div className="mobile-view">
                    <ProductBadges product={product} />
                    <div className="product-title-mobile"><h1>{product.name}</h1>{product.sku && <div className="product-sku-mobile">SKU: {product.sku}</div>}</div>
                    <div className="category-info-mobile"><div className="category-path-mobile"><span className="category-badge">{product.category_name}</span>{product.sub_category_name && <><span className="separator">›</span><span className="sub-category-badge">{product.sub_category_name}</span></>}{product.sub_sub_category_name && <><span className="separator">›</span><span className="sub-sub-category-badge">{product.sub_sub_category_name}</span></>}</div></div>
                    <div className="gallery-section-mobile"><ProductGallery images={product.images} productName={product.name} mainImage={mainImage} setMainImage={setMainImage} imageLoading={imageLoading} setImageLoading={setImageLoading} videoUrl={product.video} /></div>
                    <div className="rating-section-mobile"><div className="rating-main-mobile"><span className="rating">⭐ {averageRating}</span><span className="review-count">({totalReviews} reviews)</span><button className="view-reviews-btn" onClick={scrollToReviews}>View all reviews</button></div></div>
                    <div className="price-section-mobile"><div className="price-content-mobile">{hasDiscount ? (<><span className="discounted-price">{formatPrice(discountedPrice)}</span><div className="original-price-wrapper"><span className="original-price">{formatPrice(product.price)}</span><span className="discount-badge">{product.discount}% OFF</span></div></>) : (<span className="price">{formatPrice(product.price)}</span>)}{product.tax_class && <span className="tax-info">+ {product.tax_class} tax applicable</span>}</div></div>
                    {product.short_description && (<div className="short-description-mobile"><h4>About this item</h4><p>{product.short_description}</p></div>)}
                    <div className="variants-section-mobile"><ProductVariants sizes={product.sizes} colors={product.colors} materials={product.materials} selectedSize={selectedSize} setSelectedSize={setSelectedSize} selectedColor={selectedColor} setSelectedColor={setSelectedColor} selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial} /></div>
                    <div className="quantity-section-mobile"><div className="quantity-selector-mobile"><label>Quantity:</label><div className="quantity-controls-mobile"><button onClick={decrementQuantity} disabled={quantity <= (product.min_order_quantity || 1)}>−</button><input type="number" value={quantity} onChange={handleQuantityChange} min={product.min_order_quantity || 1} max={product.max_order_quantity || product.stock} /><button onClick={incrementQuantity} disabled={quantity >= (product.max_order_quantity || product.stock || 0)}>+</button></div></div><div className="stock-info-mobile"><span className={`stock ${isLowStock ? 'low-stock' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}`}>{product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}</span></div></div>
                    <div className="action-buttons-mobile"><button className="wishlist-btn-mobile" onClick={handleWishlistToggle}>{isWishlisted ? '❤️' : '🤍'} Wishlist</button><button className="add-to-cart-btn-mobile" onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}>{addingToCart ? 'Adding...' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}</button><button className="buy-now-btn-mobile" onClick={handleBuyNow} disabled={addingToCart || product.stock === 0}>Buy Now</button></div>
                    <div className="policies-section-mobile"><ProductPolicies product={product} /></div>
                </div>

                <section className="product-tabs-section">
                    <div className="tabs-container">
                        <div className="tab-headers">
                            <button className={`tab-header ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
                            <button className={`tab-header ${activeTab === 'specifications' ? 'active' : ''}`} onClick={() => setActiveTab('specifications')}>Specifications</button>
                            <button className={`tab-header ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>Features</button>
                            <button className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')} id="reviews-section">Reviews ({totalReviews})</button>
                        </div>
                        <div className="tab-content">
                            {activeTab === 'description' && (<div className="tab-panel"><ProductDescription description={product.description} showFullDescription={showFullDescription} setShowFullDescription={setShowFullDescription} /></div>)}
                            {activeTab === 'specifications' && (<div className="tab-panel"><ProductSpecifications product={product} /></div>)}
                            {activeTab === 'features' && (<div className="tab-panel"><ProductFeatures features={product.features} /></div>)}
                            {activeTab === 'reviews' && (
                                <div className="tab-panel">
                                    <div className="reviews-header">
                                        <div className="reviews-summary">
                                            <div className="average-rating"><span className="rating-big">{averageRating}</span><div className="rating-stars">{'⭐'.repeat(5)}</div><span className="rating-count">{totalReviews} reviews</span></div>
                                            <div className="rating-breakdown">
                                                {[5, 4, 3, 2, 1].map((rating) => (<div key={rating} className="rating-bar"><span>{rating} ⭐</span><div className="bar-container"><div className="bar-fill" style={{ width: `${totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0}%` }}></div></div><span>({ratingDistribution[rating]})</span></div>))}
                                            </div>
                                        </div>
                                        <div className="reviews-controls"><button className="refresh-reviews" onClick={manuallyRefreshReviews} disabled={reviewsLoading}>{reviewsLoading ? 'Refreshing...' : '🔄 Refresh'}</button>{isLiveFetching && <span className="live-indicator">● Live Updates</span>}</div>
                                    </div>
                                    <ReviewForm onSubmit={handleReviewSubmit} reviewText={reviewText} setReviewText={setReviewText} selectedRating={selectedRating} setSelectedRating={setSelectedRating} loading={reviewLoading} error={reviewError} currentUser={currentUser} />
                                    <div className="reviews-list">
                                        {reviewsLoading ? (<div className="reviews-loading"><div className="loading-spinner"></div><p>Loading reviews...</p></div>) : totalReviews > 0 ? (reviews.map((review) => (
                                            <ReviewItem
                                                key={review.id}
                                                review={review}
                                                currentUser={currentUser}
                                                onDeleteReview={handleDeleteReview}
                                                isReviewAuthor={isReviewAuthor}
                                                onAddReply={handleAddReply}
                                                onDeleteReply={handleDeleteReply}
                                                onLikeReply={handleLikeReply}
                                                replies={review.replies || []}
                                            />
                                        ))) : (<div className="no-reviews"><p>No reviews yet. Be the first to review this product!</p></div>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <RelatedProducts products={relatedProducts} loading={relatedLoading} navigate={navigate} />
            </main>

            <div className="footer-container"><Footer /></div>
        </div>
    );
};

export default ProductDetailsEnhanced;