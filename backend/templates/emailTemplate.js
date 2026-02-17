const emailTemplate = (order, userName) => {
    const itemsList = order.items?.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${item.product_image || 'https://via.placeholder.com/50'}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${item.product_name}
                ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
                ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.total_price}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #f6f9fc;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }
                .header h1 {
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                .content {
                    padding: 30px;
                }
                .order-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .order-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .info-item {
                    margin-bottom: 10px;
                }
                .info-label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .info-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                }
                .total-amount {
                    font-size: 24px;
                    color: #FF6B6B;
                    font-weight: 700;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    background: #f8f9fa;
                    padding: 12px;
                    text-align: left;
                    font-size: 14px;
                    color: #666;
                }
                td {
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                }
                .address-section {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .address-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: #333;
                }
                .address-details {
                    color: #666;
                    line-height: 1.8;
                }
                .button {
                    display: inline-block;
                    background: #FF6B6B;
                    color: white;
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                    transition: background 0.3s;
                }
                .button:hover {
                    background: #ff5252;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #eee;
                }
                .social-links {
                    margin: 20px 0;
                }
                .social-links a {
                    color: #FF6B6B;
                    text-decoration: none;
                    margin: 0 10px;
                }
                @media only screen and (max-width: 600px) {
                    .container { margin: 10px; }
                    .header { padding: 30px 20px; }
                    .content { padding: 20px; }
                    .order-info-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="success-icon">✅</div>
                    <h1>Order Confirmed!</h1>
                    <p style="font-size: 18px; opacity: 0.9;">Thank you for your purchase, ${userName}!</p>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <!-- Order Status -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                        <h2 style="color: #4CAF50; margin-bottom: 10px;">Your order is confirmed</h2>
                        <p style="color: #666;">We've received your order and will process it soon.</p>
                    </div>
                    
                    <!-- Order Details Card -->
                    <div class="order-info">
                        <div class="order-info-grid">
                            <div>
                                <div class="info-item">
                                    <div class="info-label">Order Number</div>
                                    <div class="info-value" style="font-size: 20px;">#${order.order_number}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Order Date</div>
                                    <div class="info-value">${new Date(order.order_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</div>
                                </div>
                            </div>
                            <div>
                                <div class="info-item">
                                    <div class="info-label">Payment Method</div>
                                    <div class="info-value">
                                        ${order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                                    </div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Order Status</div>
                                    <div class="info-value" style="color: #4CAF50;">● CONFIRMED</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #ddd;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 16px; color: #666;">Total Amount</span>
                                <span class="total-amount">₹${order.total_amount}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Order Items -->
                    <h3 style="margin-bottom: 15px;">Order Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">Product</th>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>
                    
                    <!-- Price Breakdown -->
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-bottom: 15px;">Price Details</h4>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Subtotal</span>
                            <span>₹${order.subtotal}</span>
                        </div>
                        ${order.shipping_charge > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Shipping</span>
                            <span>₹${order.shipping_charge}</span>
                        </div>
                        ` : ''}
                        ${order.tax_amount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Tax</span>
                            <span>₹${order.tax_amount}</span>
                        </div>
                        ` : ''}
                        ${order.discount_amount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #4CAF50;">
                            <span>Discount</span>
                            <span>-₹${order.discount_amount}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee; font-weight: 700; font-size: 18px;">
                            <span>Total</span>
                            <span style="color: #FF6B6B;">₹${order.total_amount}</span>
                        </div>
                    </div>
                    
                    <!-- Shipping Address -->
                    <div class="address-section">
                        <div class="address-title">📦 Shipping Address</div>
                        <div class="address-details">
                            <strong>${order.shipping_full_name}</strong><br>
                            ${order.shipping_address}<br>
                            ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_postal_code}<br>
                            ${order.shipping_country}<br>
                            📞 ${order.shipping_phone}<br>
                            ✉️ ${order.shipping_email}
                        </div>
                    </div>
                    
                    <!-- What's Next -->
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #1976d2; margin-bottom: 15px;">🚚 What's Next?</h4>
                        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 150px;">
                                <div style="font-size: 24px; margin-bottom: 5px;">📦</div>
                                <strong>Order Processing</strong>
                                <p style="color: #666; font-size: 14px;">We're preparing your order</p>
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <div style="font-size: 24px; margin-bottom: 5px;">🚚</div>
                                <strong>Shipping</strong>
                                <p style="color: #666; font-size: 14px;">You'll get tracking details soon</p>
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <div style="font-size: 24px; margin-bottom: 5px;">✅</div>
                                <strong>Delivery</strong>
                                <p style="color: #666; font-size: 14px;">Estimated: 3-5 business days</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Track Order Button -->
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/order-confirmation/${order.id}" class="button">
                            📱 Track Your Order
                        </a>
                        <p style="margin-top: 10px; color: #666; font-size: 14px;">
                            You can also view your order details in 
                            <a href="${process.env.FRONTEND_URL}/orders" style="color: #FF6B6B;">My Orders</a>
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <div style="margin-bottom: 20px;">
                        <img src="https://via.placeholder.com/150x50/FF6B6B/white?text=PANKHUDI" 
                             alt="Pankhudi" style="max-width: 150px;">
                    </div>
                    
                    <div class="social-links">
                        <a href="#">Facebook</a> • 
                        <a href="#">Instagram</a> • 
                        <a href="#">Twitter</a>
                    </div>
                    
                    <p style="margin: 20px 0;">
                        Need help? Contact us:<br>
                        📞 +91 12345 67890 (10 AM - 7 PM)<br>
                        ✉️ support@pankhudi.com
                    </p>
                    
                    <p style="margin-top: 20px; color: #999; font-size: 12px;">
                        © ${new Date().getFullYear()} Pankhudi. All rights reserved.<br>
                        <a href="${process.env.FRONTEND_URL}/terms" style="color: #999;">Terms</a> • 
                        <a href="${process.env.FRONTEND_URL}/privacy" style="color: #999;">Privacy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = { emailTemplate };