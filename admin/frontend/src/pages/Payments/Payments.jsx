import React, { useEffect, useState } from 'react';
import api, { getPayments } from '../../utils/api';
import PageContainer from '../../components/PageContainer/PageContainer';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, []);

    const fetchPayments = () => {
        getPayments()
            .then(res => {
                setPayments(res.data.payments || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching payments:', err);
                setLoading(false);
            });
    };

    const fetchStats = () => {
        api.get('/payments/stats')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setStats(res.data);
                } else {
                    setStats([]);
                }
            })
            .catch(err => {
                console.error('Error fetching stats:', err);
                setStats([]);
            });
    };

    if (loading) return <PageContainer title="Payments"><div>Loading...</div></PageContainer>;

    return (
        <PageContainer title="Payments">
            <div className="stats-summary">
                {Array.isArray(stats) && stats.map(stat => (
                    <div key={stat.status}>
                        {stat.status}: {stat.count} (₹{stat.total_amount || 0})
                    </div>
                ))}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id}>
                            <td>{payment.order_number || 'N/A'}</td>
                            <td>{payment.user_name || 'N/A'}</td>
                            <td>₹{payment.amount || 0}</td>
                            <td>{payment.status}</td>
                            <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PageContainer>
    );
}

export default Payments;

