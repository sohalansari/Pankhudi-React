// src/pages/Admin/Reviews.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import PageContainer from '../../components/PageContainer/PageContainer';
import Modal from '../../components/Modal/Modal';
import { useAuth } from '../../hooks/useAuth';
import './Reviews.css';

function Reviews() {
    // State Management
    const [reviewList, setReviewList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paginationData, setPaginationData] = useState({
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        totalPages: 0
    });
    const [filterOptions, setFilterOptions] = useState({
        status: '',
        minRating: '',
        maxRating: '',
        keyword: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [statistics, setStatistics] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [expandedReplies, setExpandedReplies] = useState({});

    // Modal states
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({
        rating: '',
        review: '',
        status: ''
    });

    const [userRepliesModalVisible, setUserRepliesModalVisible] = useState(false);
    const [currentReplies, setCurrentReplies] = useState([]);
    const [currentReviewForReplies, setCurrentReviewForReplies] = useState(null);

    // Separate state for search input to prevent re-renders
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Fetch reviews on filter or page change
    useEffect(() => {
        loadReviews();
    }, [filterOptions, paginationData.currentPage]);

    // Load statistics on mount
    useEffect(() => {
        loadStatistics();
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeout) clearTimeout(searchTimeout);

        const timeout = setTimeout(() => {
            if (searchKeyword !== filterOptions.keyword) {
                updateFilter('keyword', searchKeyword);
            }
        }, 500);

        setSearchTimeout(timeout);

        return () => clearTimeout(timeout);
    }, [searchKeyword]);

    // Load reviews from API - FIXED URL
    const loadReviews = async () => {
        setIsLoading(true);
        try {
            const requestParams = {
                approved: filterOptions.status,
                rating_min: filterOptions.minRating,
                rating_max: filterOptions.maxRating,
                search: filterOptions.keyword,
                sort_by: filterOptions.sortBy,
                sort_order: filterOptions.sortOrder,
                page: paginationData.currentPage,
                limit: paginationData.itemsPerPage,
                include_replies: true
            };

            // Fixed: Changed from /reviews/admin to /reviews/admin/all
            const response = await api.get('/reviews/admin/all', { params: requestParams });
            setReviewList(response.data.reviews || []);
            setPaginationData(prev => ({
                ...prev,
                totalItems: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.pages || 0
            }));
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load statistics - FIXED URL
    const loadStatistics = async () => {
        try {
            // Fixed: Changed from /reviews/admin/stats to /reviews/admin/stats
            const response = await api.get('/reviews/admin/stats');
            setStatistics(response.data);
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    };

    // Fetch user replies for a review - FIXED URL
    const fetchUserReplies = async (reviewId) => {
        try {
            // This is a public route, no admin prefix needed
            const response = await api.get(`/reviews/${reviewId}/replies`);
            setCurrentReplies(response.data || []);
        } catch (error) {
            console.error('Failed to fetch replies:', error);
            setCurrentReplies([]);
        }
    };

    // Moderate review (approve/reject) - FIXED URL
    const handleModerateReview = useCallback(async (reviewId, shouldApprove) => {
        try {
            await api.patch(`/reviews/admin/${reviewId}/moderate`, { approved: shouldApprove });
            await loadReviews();
            await loadStatistics();
        } catch (error) {
            console.error('Moderation failed:', error);
            alert('Failed to moderate review');
        }
    }, []);

    // Update review - FIXED URL
    const handleUpdateReview = useCallback(async (reviewId, updatedData) => {
        try {
            await api.patch(`/reviews/admin/${reviewId}`, updatedData);
            setEditModalVisible(false);
            setEditFormData({ rating: '', review: '', status: '' });
            setCurrentReview(null);
            await loadReviews();
            await loadStatistics();
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update review');
        }
    }, []);

    // Delete review - FIXED URL
    const handleDeleteReview = useCallback(async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review? This will also delete all replies and likes.')) {
            try {
                await api.delete(`/reviews/admin/${reviewId}`);
                await loadReviews();
                await loadStatistics();
                setSelectedItems(prev => prev.filter(id => id !== reviewId));
            } catch (error) {
                console.error('Deletion failed:', error);
                alert('Failed to delete review');
            }
        }
    }, []);

    // Delete user reply - FIXED URL
    const handleDeleteUserReply = useCallback(async (replyId) => {
        if (window.confirm('Are you sure you want to delete this user reply?')) {
            try {
                await api.delete(`/reviews/admin/replies/${replyId}`);
                // Refresh replies
                if (currentReviewForReplies) {
                    await fetchUserReplies(currentReviewForReplies.id);
                }
                await loadReviews();
            } catch (error) {
                console.error('Delete reply failed:', error);
                alert('Failed to delete reply');
            }
        }
    }, [currentReviewForReplies]);

    // Add admin reply - FIXED URL
    const handleAddReply = useCallback(async (reviewId, replyText) => {
        if (!replyText.trim()) {
            alert('Please enter a reply');
            return;
        }
        try {
            await api.post(`/reviews/admin/${reviewId}/reply`, { reply: replyText });
            setReplyModalVisible(false);
            setReplyContent('');
            setCurrentReview(null);
            await loadReviews();
        } catch (error) {
            console.error('Failed to add reply:', error);
            alert('Failed to add reply');
        }
    }, []);

    // Bulk actions - FIXED URL
    const handleBulkAction = useCallback(async (actionType) => {
        if (selectedItems.length === 0) {
            alert('Please select at least one review');
            return;
        }

        const confirmationMessage = actionType === 'delete'
            ? `Are you sure you want to delete ${selectedItems.length} review(s)? This will also delete all replies.`
            : `Are you sure you want to ${actionType} ${selectedItems.length} review(s)?`;

        if (window.confirm(confirmationMessage)) {
            try {
                await api.post('/reviews/admin/bulk', {
                    action: actionType,
                    review_ids: selectedItems
                });
                setSelectedItems([]);
                await loadReviews();
                await loadStatistics();
            } catch (error) {
                console.error('Bulk action failed:', error);
                alert('Failed to perform bulk action');
            }
        }
    }, [selectedItems]);

    // Selection handlers
    const handleSelectAll = useCallback((event) => {
        if (event.target.checked) {
            setSelectedItems(reviewList.map(review => review.id));
        } else {
            setSelectedItems([]);
        }
    }, [reviewList]);

    const handleSelectOne = useCallback((reviewId) => {
        setSelectedItems(prev =>
            prev.includes(reviewId)
                ? prev.filter(id => id !== reviewId)
                : [...prev, reviewId]
        );
    }, []);

    // Filter handlers
    const updateFilter = useCallback((filterName, filterValue) => {
        setFilterOptions(prev => ({ ...prev, [filterName]: filterValue }));
        setPaginationData(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    // Sort handler
    const handleSort = useCallback((fieldName) => {
        const newOrder = filterOptions.sortBy === fieldName && filterOptions.sortOrder === 'DESC' ? 'ASC' : 'DESC';
        setFilterOptions(prev => ({
            ...prev,
            sortBy: fieldName,
            sortOrder: newOrder
        }));
    }, [filterOptions.sortBy, filterOptions.sortOrder]);

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        setSearchKeyword(e.target.value);
    }, []);

    // Handle status filter change
    const handleStatusChange = useCallback((e) => {
        updateFilter('status', e.target.value);
    }, [updateFilter]);

    // Handle rating filter change
    const handleMinRatingChange = useCallback((e) => {
        updateFilter('minRating', e.target.value);
    }, [updateFilter]);

    const handleMaxRatingChange = useCallback((e) => {
        updateFilter('maxRating', e.target.value);
    }, [updateFilter]);

    // Handle edit form changes
    const handleEditRatingChange = useCallback((e) => {
        setEditFormData(prev => ({ ...prev, rating: e.target.value }));
    }, []);

    const handleEditReviewChange = useCallback((e) => {
        setEditFormData(prev => ({ ...prev, review: e.target.value }));
    }, []);

    const handleEditStatusChange = useCallback((e) => {
        setEditFormData(prev => ({ ...prev, status: e.target.value }));
    }, []);

    // Handle reply content change
    const handleReplyChange = useCallback((e) => {
        setReplyContent(e.target.value);
    }, []);

    // Open reply modal
    const openReplyModal = useCallback((review) => {
        setCurrentReview(review);
        setReplyContent(review.admin_reply || '');
        setReplyModalVisible(true);
    }, []);

    // Open user replies modal
    const openUserRepliesModal = useCallback(async (review) => {
        setCurrentReviewForReplies(review);
        await fetchUserReplies(review.id);
        setUserRepliesModalVisible(true);
    }, []);

    // Open edit modal
    const openEditModal = useCallback((review) => {
        setCurrentReview(review);
        setEditFormData({
            rating: review.rating,
            review: review.review,
            status: review.approved ? 'true' : 'false'
        });
        setEditModalVisible(true);
    }, []);

    // Close modals
    const closeReplyModal = useCallback(() => {
        setReplyModalVisible(false);
        setCurrentReview(null);
        setReplyContent('');
    }, []);

    const closeEditModal = useCallback(() => {
        setEditModalVisible(false);
        setCurrentReview(null);
        setEditFormData({ rating: '', review: '', status: '' });
    }, []);

    const closeUserRepliesModal = useCallback(() => {
        setUserRepliesModalVisible(false);
        setCurrentReplies([]);
        setCurrentReviewForReplies(null);
    }, []);

    // Render rating stars
    const renderRatingStars = useCallback((rating) => {
        return (
            <div className="rvw-star-rating">
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </div>
        );
    }, []);

    // Render status badge
    const renderStatusBadge = useCallback((isApproved) => {
        return isApproved
            ? <span className="rvw-badge rvw-badge-approved">Approved</span>
            : <span className="rvw-badge rvw-badge-pending">Pending</span>;
    }, []);

    // Format date
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    }, []);

    // Memoized statistics cards
    const statisticsCards = useMemo(() => {
        if (!statistics?.stats) return null;

        return (
            <div className="rvw-stats-grid">
                <div className="rvw-stat-card rvw-stat-total">
                    <div className="rvw-stat-icon">📊</div>
                    <div className="rvw-stat-info">
                        <h4>Total Reviews</h4>
                        <p className="rvw-stat-number">{statistics.stats.total_reviews || 0}</p>
                    </div>
                </div>
                <div className="rvw-stat-card rvw-stat-approved">
                    <div className="rvw-stat-icon">✓</div>
                    <div className="rvw-stat-info">
                        <h4>Approved</h4>
                        <p className="rvw-stat-number">{statistics.stats.approved_reviews || 0}</p>
                    </div>
                </div>
                <div className="rvw-stat-card rvw-stat-pending">
                    <div className="rvw-stat-icon">⏳</div>
                    <div className="rvw-stat-info">
                        <h4>Pending</h4>
                        <p className="rvw-stat-number">{statistics.stats.pending_reviews || 0}</p>
                    </div>
                </div>
                <div className="rvw-stat-card rvw-stat-rating">
                    <div className="rvw-stat-icon">⭐</div>
                    <div className="rvw-stat-info">
                        <h4>Average Rating</h4>
                        <p className="rvw-stat-number">
                            {statistics.stats.avg_rating ? parseFloat(statistics.stats.avg_rating).toFixed(1) : '0'}/5
                        </p>
                    </div>
                </div>
                <div className="rvw-stat-card rvw-stat-replies">
                    <div className="rvw-stat-icon">💬</div>
                    <div className="rvw-stat-info">
                        <h4>Total Replies</h4>
                        <p className="rvw-stat-number">{statistics.stats.total_replies || 0}</p>
                    </div>
                </div>
                <div className="rvw-stat-card rvw-stat-likes">
                    <div className="rvw-stat-icon">❤️</div>
                    <div className="rvw-stat-info">
                        <h4>Total Likes</h4>
                        <p className="rvw-stat-number">{statistics.stats.total_likes || 0}</p>
                    </div>
                </div>
            </div>
        );
    }, [statistics]);

    // Loading state
    if (isLoading && reviewList.length === 0) {
        return (
            <PageContainer title="Review Management">
                <div className="rvw-loading-container">
                    <div className="rvw-loading-spinner"></div>
                    <p>Loading reviews...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Review Management Dashboard">
            <div className="rvw-dashboard">

                {/* Statistics Cards */}
                {statisticsCards}

                {/* Filter Bar */}
                <div className="rvw-filter-bar">
                    <div className="rvw-filter-group">
                        <input
                            type="text"
                            placeholder="🔍 Search by product, user or review..."
                            value={searchKeyword}
                            onChange={handleSearchChange}
                            className="rvw-search-input"
                        />
                    </div>

                    <div className="rvw-filter-group">
                        <select
                            value={filterOptions.status}
                            onChange={handleStatusChange}
                            className="rvw-select"
                        >
                            <option value="">All Status</option>
                            <option value="true">Approved</option>
                            <option value="false">Pending</option>
                        </select>
                    </div>

                    <div className="rvw-filter-group rvw-rating-filter">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filterOptions.minRating}
                            onChange={handleMinRatingChange}
                            min="1"
                            max="5"
                            className="rvw-rating-input"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filterOptions.maxRating}
                            onChange={handleMaxRatingChange}
                            min="1"
                            max="5"
                            className="rvw-rating-input"
                        />
                    </div>

                    <button onClick={loadReviews} className="rvw-btn rvw-btn-refresh">
                        🔄 Refresh
                    </button>
                </div>

                {/* Bulk Actions Bar */}
                {selectedItems.length > 0 && (
                    <div className="rvw-bulk-bar">
                        <span className="rvw-bulk-info">
                            📌 {selectedItems.length} review(s) selected
                        </span>
                        <div className="rvw-bulk-actions">
                            <button onClick={() => handleBulkAction('approve')} className="rvw-bulk-btn rvw-bulk-approve">
                                ✓ Approve Selected
                            </button>
                            <button onClick={() => handleBulkAction('reject')} className="rvw-bulk-btn rvw-bulk-reject">
                                ✗ Reject Selected
                            </button>
                            <button onClick={() => handleBulkAction('delete')} className="rvw-bulk-btn rvw-bulk-delete">
                                🗑 Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Reviews Table */}
                <div className="rvw-table-wrapper">
                    <table className="rvw-table">
                        <thead>
                            <tr>
                                <th className="rvw-col-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === reviewList.length && reviewList.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th onClick={() => handleSort('product_name')} className="rvw-sortable">
                                    Product {filterOptions.sortBy === 'product_name' && (filterOptions.sortOrder === 'DESC' ? '↓' : '↑')}
                                </th>
                                <th onClick={() => handleSort('user_name')} className="rvw-sortable">
                                    Customer {filterOptions.sortBy === 'user_name' && (filterOptions.sortOrder === 'DESC' ? '↓' : '↑')}
                                </th>
                                <th onClick={() => handleSort('rating')} className="rvw-sortable">
                                    Rating {filterOptions.sortBy === 'rating' && (filterOptions.sortOrder === 'DESC' ? '↓' : '↑')}
                                </th>
                                <th>Review Content</th>
                                <th onClick={() => handleSort('created_at')} className="rvw-sortable">
                                    Date {filterOptions.sortBy === 'created_at' && (filterOptions.sortOrder === 'DESC' ? '↓' : '↑')}
                                </th>
                                <th>Status</th>
                                <th>Admin Response</th>
                                <th>User Replies</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewList.map((review) => (
                                <tr key={review.id} className={!review.approved ? 'rvw-row-pending' : ''}>
                                    <td className="rvw-col-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(review.id)}
                                            onChange={() => handleSelectOne(review.id)}
                                        />
                                    </td>
                                    <td className="rvw-product-cell">
                                        <span className="rvw-product-name">{review.product_name || 'N/A'}</span>
                                    </td>
                                    <td className="rvw-user-cell">
                                        <span className="rvw-user-name">{review.user_name || 'Anonymous'}</span>
                                        {review.user_email && (
                                            <span className="rvw-user-email">{review.user_email}</span>
                                        )}
                                    </td>
                                    <td className="rvw-rating-cell">
                                        {renderRatingStars(review.rating)}
                                        <span className="rvw-rating-number">({review.rating})</span>
                                    </td>
                                    <td className="rvw-review-cell">
                                        <div className="rvw-review-text">
                                            {review.review ? review.review.substring(0, 120) : 'No review content'}
                                            {review.review && review.review.length > 120 && (
                                                <span className="rvw-read-more" title={review.review}>... more</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="rvw-date-cell">
                                        {formatDate(review.created_at)}
                                    </td>
                                    <td className="rvw-status-cell">
                                        {renderStatusBadge(review.approved)}
                                    </td>
                                    <td className="rvw-reply-cell">
                                        {review.admin_reply ? (
                                            <div className="rvw-reply-preview">
                                                <p>{review.admin_reply.substring(0, 40)}...</p>
                                                <button
                                                    onClick={() => openReplyModal(review)}
                                                    className="rvw-action-link rvw-edit-reply"
                                                >
                                                    Edit Reply
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openReplyModal(review)}
                                                className="rvw-btn-reply"
                                            >
                                                💬 Add Reply
                                            </button>
                                        )}
                                    </td>
                                    <td className="rvw-replies-cell">
                                        {review.replies_count > 0 ? (
                                            <div className="rvw-replies-info">
                                                <span className="rvw-replies-count">{review.replies_count} reply(s)</span>
                                                <button
                                                    onClick={() => openUserRepliesModal(review)}
                                                    className="rvw-view-replies-btn"
                                                >
                                                    View Replies
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="rvw-no-replies">No replies</span>
                                        )}
                                    </td>
                                    <td className="rvw-actions-cell">
                                        <div className="rvw-action-buttons">
                                            {!review.approved && (
                                                <button
                                                    onClick={() => handleModerateReview(review.id, true)}
                                                    className="rvw-action-btn rvw-action-approve"
                                                    title="Approve Review"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            {review.approved && (
                                                <button
                                                    onClick={() => handleModerateReview(review.id, false)}
                                                    className="rvw-action-btn rvw-action-reject"
                                                    title="Reject Review"
                                                >
                                                    ✗
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditModal(review)}
                                                className="rvw-action-btn rvw-action-edit"
                                                title="Edit Review"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="rvw-action-btn rvw-action-delete"
                                                title="Delete Review"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {paginationData.totalPages > 1 && (
                    <div className="rvw-pagination">
                        <button
                            onClick={() => setPaginationData(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            disabled={paginationData.currentPage === 1}
                            className="rvw-page-btn"
                        >
                            ← Previous
                        </button>

                        <div className="rvw-page-numbers">
                            {[...Array(Math.min(5, paginationData.totalPages)).keys()].map(index => {
                                let pageNumber;
                                if (paginationData.totalPages <= 5) {
                                    pageNumber = index + 1;
                                } else if (paginationData.currentPage <= 3) {
                                    pageNumber = index + 1;
                                } else if (paginationData.currentPage >= paginationData.totalPages - 2) {
                                    pageNumber = paginationData.totalPages - 4 + index;
                                } else {
                                    pageNumber = paginationData.currentPage - 2 + index;
                                }

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setPaginationData(prev => ({ ...prev, currentPage: pageNumber }))}
                                        className={`rvw-page-btn ${paginationData.currentPage === pageNumber ? 'rvw-active-page' : ''}`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPaginationData(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={paginationData.currentPage === paginationData.totalPages}
                            className="rvw-page-btn"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Reply Modal */}
                <Modal
                    isOpen={replyModalVisible}
                    onClose={closeReplyModal}
                    title={currentReview?.admin_reply ? "Edit Admin Response" : "Add Admin Response"}
                >
                    <div className="rvw-modal-content">
                        <div className="rvw-review-info">
                            <div className="rvw-info-row">
                                <span className="rvw-info-label">Product:</span>
                                <span className="rvw-info-value">{currentReview?.product_name}</span>
                            </div>
                            <div className="rvw-info-row">
                                <span className="rvw-info-label">Customer:</span>
                                <span className="rvw-info-value">{currentReview?.user_name}</span>
                            </div>
                            <div className="rvw-info-row">
                                <span className="rvw-info-label">Rating:</span>
                                <span className="rvw-info-value">{renderRatingStars(currentReview?.rating)}</span>
                            </div>
                            <div className="rvw-info-row">
                                <span className="rvw-info-label">Review:</span>
                                <span className="rvw-info-value rvw-review-text-full">{currentReview?.review}</span>
                            </div>
                        </div>
                        <textarea
                            value={replyContent}
                            onChange={handleReplyChange}
                            placeholder="Write your response here..."
                            rows="6"
                            className="rvw-reply-textarea"
                        />
                        <div className="rvw-modal-actions">
                            <button onClick={() => handleAddReply(currentReview?.id, replyContent)} className="rvw-btn rvw-btn-submit">
                                Submit Response
                            </button>
                            <button onClick={closeReplyModal} className="rvw-btn rvw-btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* User Replies Modal */}
                <Modal
                    isOpen={userRepliesModalVisible}
                    onClose={closeUserRepliesModal}
                    title={`User Replies for Review by ${currentReviewForReplies?.user_name || 'User'}`}
                >
                    <div className="rvw-modal-content rvw-replies-modal">
                        <div className="rvw-review-info">
                            <div className="rvw-info-row">
                                <span className="rvw-info-label">Review:</span>
                                <span className="rvw-info-value">{currentReviewForReplies?.review}</span>
                            </div>
                        </div>

                        <div className="rvw-replies-list">
                            <h4>User Replies ({currentReplies.length})</h4>
                            {currentReplies.length === 0 ? (
                                <p className="rvw-no-data">No replies yet</p>
                            ) : (
                                currentReplies.map((reply) => (
                                    <div key={reply.id} className="rvw-reply-item">
                                        <div className="rvw-reply-header">
                                            <div className="rvw-reply-avatar">
                                                {reply.user_image ? (
                                                    <img src={reply.user_image} alt={reply.user_name} />
                                                ) : (
                                                    <div className="rvw-avatar-fallback">
                                                        {reply.user_name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="rvw-reply-info">
                                                <span className="rvw-reply-author">{reply.user_name || 'Anonymous'}</span>
                                                <span className="rvw-reply-date">{formatDate(reply.created_at)}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteUserReply(reply.id)}
                                                className="rvw-delete-reply-btn"
                                                title="Delete Reply"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                        <div className="rvw-reply-text">
                                            {reply.reply_text}
                                        </div>
                                        <div className="rvw-reply-stats">
                                            <span className="rvw-reply-likes">❤️ {reply.likes_count || 0} likes</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="rvw-modal-actions">
                            <button onClick={closeUserRepliesModal} className="rvw-btn rvw-btn-cancel">
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Edit Review Modal */}
                <Modal
                    isOpen={editModalVisible}
                    onClose={closeEditModal}
                    title="Edit Review"
                >
                    <div className="rvw-modal-content">
                        <div className="rvw-form-group">
                            <label className="rvw-form-label">Rating (1-5 stars)</label>
                            <input
                                type="number"
                                value={editFormData.rating}
                                onChange={handleEditRatingChange}
                                min="1"
                                max="5"
                                step="1"
                                className="rvw-form-input"
                            />
                        </div>
                        <div className="rvw-form-group">
                            <label className="rvw-form-label">Review Content</label>
                            <textarea
                                value={editFormData.review}
                                onChange={handleEditReviewChange}
                                rows="5"
                                className="rvw-form-textarea"
                            />
                        </div>
                        <div className="rvw-form-group">
                            <label className="rvw-form-label">Status</label>
                            <select
                                value={editFormData.status}
                                onChange={handleEditStatusChange}
                                className="rvw-form-select"
                            >
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>
                        <div className="rvw-modal-actions">
                            <button
                                onClick={() => handleUpdateReview(currentReview?.id, {
                                    rating: parseInt(editFormData.rating),
                                    review: editFormData.review,
                                    approved: editFormData.status === 'true'
                                })}
                                className="rvw-btn rvw-btn-submit"
                            >
                                Save Changes
                            </button>
                            <button onClick={closeEditModal} className="rvw-btn rvw-btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </PageContainer>
    );
}

export default Reviews;