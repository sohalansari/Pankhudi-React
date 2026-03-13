import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import PageContainer from '../../components/PageContainer/PageContainer';

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ approved: '', rating_min: '', product_id: '' });

    useEffect(() => {
        fetchReviews();
    }, [filters]);

    const fetchReviews = () => {
        setLoading(true);
        api.get('/reviews', { params: filters })
            .then(res => {
                setReviews(res.data.reviews || []);
                setPagination(res.data.pagination || {});
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching reviews:', err);
                setLoading(false);
            });
    };

    const moderateReview = (id, approved) => {
        api.patch(`/reviews/${id}/moderate`, { approved })
            .then(() => fetchReviews())
            .catch(err => console.error('Error moderating review:', err));
    };

    const deleteReview = (id) => {
        if (window.confirm('Delete this review?')) {
            api.delete(`/reviews/${id}`)
                .then(() => fetchReviews())
                .catch(err => console.error('Error deleting review:', err));
        }
    };

    if (loading) return <PageContainer title="Reviews"><div>Loading...</div></PageContainer>;

    return (
        <PageContainer title="Manage Reviews">
            <div className="reviews-page">
                <div className="filters-section">
                    <select onChange={(e) => setFilters({ ...filters, approved: e.target.value })}>
                        <option value="">All</option>
                        <option value="true">Approved</option>
                        <option value="false">Pending</option>
                    </select>
                    <button onClick={fetchReviews}>Refresh</button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>User</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => (
                            <tr key={review.id}>
                                <td>{review.product_name}</td>
                                <td>{review.user_name}</td>
                                <td>{review.rating}/5</td>
                                <td>{review.review.substring(0, 50)}...</td>
                                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                                <td>{review.approved ? 'Approved' : 'Pending'}</td>
                                <td>
                                    <button onClick={() => moderateReview(review.id, true)}>Approve</button>
                                    <button onClick={() => moderateReview(review.id, false)}>Reject</button>
                                    <button onClick={() => deleteReview(review.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageContainer>
    );
}

export default Reviews;

