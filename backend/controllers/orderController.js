const { sendOrderConfirmationEmail } = require('../services/emailService');

// Order confirmation endpoint
const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Update order status
        const [updated] = await db.query(
            'UPDATE orders SET order_status = ? WHERE id = ?',
            ['confirmed', orderId]
        );

        // Get order details with items
        const [orderDetails] = await db.query(`
            SELECT o.*, u.email, u.name,
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'product_name', oi.product_name,
                           'quantity', oi.quantity,
                           'price', oi.price
                       )
                   ) as items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id
        `, [orderId]);

        if (orderDetails.length > 0) {
            const order = orderDetails[0];
            order.items = JSON.parse(order.items);

            // Send email - Async, don't await to not block response
            sendOrderConfirmationEmail(order, {
                email: order.email,
                name: order.name
            }).catch(err => console.error('Background email error:', err));
        }

        res.json({
            success: true,
            message: 'Order confirmed successfully'
        });

    } catch (error) {
        console.error('Order confirmation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm order'
        });
    }
};