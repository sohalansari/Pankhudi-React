import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import PageContainer from '../../components/PageContainer/PageContainer';

function PromoCodes() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = () => {
        api.get('/promocodes')
            .then(res => {
                setPromos(res.data.promos || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching promo codes:', err);
                setLoading(false);
            });
    };

    const toggleActive = (id) => {
        api.patch(`/promocodes/${id}/toggle`)
            .then(() => fetchPromos())
            .catch(err => console.error('Error toggling promo:', err));
    };

    if (loading) return <PageContainer title="Promo Codes"><div>Loading...</div></PageContainer>;

    return (
        <PageContainer title="Promo Codes">
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Min Amount</th>
                        <th>Usage</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {promos.map(promo => (
                        <tr key={promo.id}>
                            <td>{promo.code}</td>
                            <td>{promo.discount_type}</td>
                            <td>{promo.discount_value}%</td>
                            <td>₹{promo.min_order_amount}</td>
                            <td>{promo.usage_count}/{promo.usage_limit || 'Unlimited'}</td>
                            <td>{promo.is_active ? 'Yes' : 'No'}</td>
                            <td>
                                <button onClick={() => toggleActive(promo.id)}>
                                    {promo.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PageContainer>
    );
}

export default PromoCodes;

