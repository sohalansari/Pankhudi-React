const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    // Initialize email transporter
    initializeTransporter() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️ Email credentials not configured. Email service will log emails but not send.');
            this.transporter = null;
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: { rejectUnauthorized: false }
        });

        this.verifyConnection();
    }

    // Verify email connection
    async verifyConnection() {
        if (!this.transporter) return;
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready');
        } catch (error) {
            console.error('❌ Email service verification failed:', error.message);
        }
    }

    // Test email configuration
    async testEmailConfig() {
        try {
            if (!this.transporter) {
                return {
                    success: false,
                    message: 'Email credentials missing in .env'
                };
            }
            await this.transporter.verify();
            return { success: true, message: 'Email service is ready' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Load email template
    async loadTemplate(templateName, replacements) {
        try {
            // ✅ FIXED: Correct template path
            const templatePath = path.join(__dirname, '../templates/email', templateName);
            let template = await fs.readFile(templatePath, 'utf-8');

            // Replace all placeholders
            for (const [key, value] of Object.entries(replacements)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                template = template.replace(regex, value || '');
            }
            return template;
        } catch (error) {
            console.log('Template not found, using inline template');
            return null;
        }
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    }

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Get estimated delivery date
    getEstimatedDeliveryDate() {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Send order confirmation email
    async sendOrderConfirmation(orderData, userEmail, userName) {
        console.log(`📧 Sending order confirmation to ${userEmail}`);

        try {
            if (!this.transporter) {
                await this.logEmail(orderData.orderId, userEmail, 'order_confirmation', null, 'failed', 'Email service not configured');
                return { success: false, error: 'Email service not configured' };
            }

            // Format order items
            const itemsList = orderData.items.map(item => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                const imageUrl = item.image || 'https://via.placeholder.com/50';

                return `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
                            <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
                            <strong>${item.product_name}</strong>
                            ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
                            ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${this.formatCurrency(item.price)}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${this.formatCurrency(itemTotal)}</td>
                    </tr>
                `;
            }).join('');

            // Format shipping address
            const shippingAddress = `
                <strong>${orderData.shippingAddress.fullName}</strong><br>
                ${orderData.shippingAddress.address}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}<br>
                📞 ${orderData.shippingAddress.phone}<br>
                ✉️ ${orderData.shippingAddress.email || userEmail}
            `;

            // Get HTML template
            const htmlContent = await this.getOrderConfirmationHTML({
                userName,
                orderNumber: orderData.orderNumber,
                orderDate: this.formatDate(orderData.created_at || new Date()),
                paymentMethod: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
                shippingAddress,
                itemsList,
                subtotal: this.formatCurrency(orderData.subtotal),
                shipping: this.formatCurrency(orderData.shippingCharge || 0),
                tax: this.formatCurrency(orderData.taxAmount || 0),
                total: this.formatCurrency(orderData.totalAmount),
                estimatedDelivery: this.getEstimatedDeliveryDate(),
                trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-confirmation/${orderData.orderId}`,
                supportEmail: process.env.SUPPORT_EMAIL || 'support@pankhudi.com',
                supportPhone: process.env.SUPPORT_PHONE || '+91 12345 67890'
            });

            const mailOptions = {
                from: `"Pankhudi" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: `✅ Order Confirmed! #${orderData.orderNumber}`,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${userEmail}`);

            await this.logEmail(orderData.orderId, userEmail, 'order_confirmation', info.messageId);

            return { success: true, messageId: info.messageId };

        } catch (error) {
            console.error('❌ Email error:', error.message);
            await this.logEmail(orderData.orderId, userEmail, 'order_confirmation', null, 'failed', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get HTML template for order confirmation - BLUE THEME
    async getOrderConfirmationHTML(data) {
        try {
            const template = await this.loadTemplate('orderConfirmation.html', data);
            if (template) return template;
        } catch (error) {
            // Use inline template
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        background-color: #f0f5ff;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0, 100, 255, 0.15);
                    }
                    /* 🔵 Blue Header */
                    .header {
                        background: linear-gradient(135deg, #0066FF, #3399FF);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 { font-size: 32px; margin-bottom: 10px; }
                    .header p { font-size: 18px; opacity: 0.95; }
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 20px; margin-bottom: 20px; }
                    .greeting strong { color: #0066FF; }
                    
                    /* Order Card */
                    .order-card {
                        background: #f8fbff;
                        border-radius: 12px;
                        padding: 25px;
                        margin: 25px 0;
                        border: 1px solid #cce4ff;
                    }
                    .order-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .info-box {
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #cce4ff;
                    }
                    .info-label {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    .info-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: #0066FF;
                    }
                    
                    /* Status Badge */
                    .status-badge {
                        display: inline-block;
                        padding: 8px 16px;
                        background: #e6f2ff;
                        color: #0066FF;
                        border-radius: 30px;
                        font-size: 14px;
                        font-weight: 600;
                        margin-right: 10px;
                    }
                    
                    /* Table */
                    .products-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 25px 0;
                    }
                    .products-table th {
                        background: #0066FF;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                    }
                    .products-table td {
                        padding: 12px;
                        border-bottom: 1px solid #cce4ff;
                    }
                    
                    /* Totals */
                    .totals {
                        background: #f8fbff;
                        padding: 25px;
                        border-radius: 12px;
                        margin: 25px 0;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                    }
                    .grand-total {
                        font-size: 20px;
                        font-weight: 700;
                        color: #0066FF;
                        border-top: 2px solid #cce4ff;
                        margin-top: 10px;
                        padding-top: 15px;
                    }
                    
                    /* Address */
                    .address-box {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #0066FF;
                        margin: 20px 0;
                    }
                    
                    /* Button */
                    .track-btn {
                        display: inline-block;
                        padding: 15px 40px;
                        background: #0066FF;
                        color: white;
                        text-decoration: none;
                        border-radius: 50px;
                        font-weight: 600;
                        margin: 20px 0;
                        box-shadow: 0 4px 10px rgba(0, 102, 255, 0.3);
                    }
                    .track-btn:hover { background: #0052cc; }
                    
                    /* Footer */
                    .footer {
                        background: #f8fbff;
                        padding: 30px;
                        text-align: center;
                        color: #666;
                        border-top: 1px solid #cce4ff;
                    }
                    
                    @media (max-width: 600px) {
                        .order-info { grid-template-columns: 1fr; }
                        .content { padding: 25px 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>✅ Order Confirmed!</h1>
                        <p>Thank you for shopping with Pankhudi</p>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <div class="greeting">
                            Hello <strong>${data.userName}</strong>,
                        </div>
                        
                        <p>Your order has been successfully placed and is being processed.</p>

                        <!-- Order Card -->
                        <div class="order-card">
                            <div class="order-info">
                                <div class="info-box">
                                    <div class="info-label">Order Number</div>
                                    <div class="info-value">#${data.orderNumber}</div>
                                </div>
                                <div class="info-box">
                                    <div class="info-label">Order Date</div>
                                    <div class="info-value">${data.orderDate}</div>
                                </div>
                            </div>
                            <div>
                                <span class="status-badge">💳 ${data.paymentMethod}</span>
                                <span class="status-badge">📦 Confirmed</span>
                            </div>
                        </div>

                        <!-- Products Table -->
                        <h3 style="margin: 30px 0 15px; color: #0066FF;">📋 Order Summary</h3>
                        <table class="products-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.itemsList}
                            </tbody>
                        </table>

                        <!-- Totals -->
                        <div class="totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>${data.subtotal}</span>
                            </div>
                            <div class="total-row">
                                <span>Shipping:</span>
                                <span>${data.shipping}</span>
                            </div>
                            <div class="total-row">
                                <span>Tax (GST):</span>
                                <span>${data.tax}</span>
                            </div>
                            <div class="grand-total total-row">
                                <span>Total:</span>
                                <span>${data.total}</span>
                            </div>
                        </div>

                        <!-- Shipping Address -->
                        <h3 style="color: #0066FF; margin: 30px 0 15px;">🚚 Shipping Address</h3>
                        <div class="address-box">
                            ${data.shippingAddress}
                        </div>

                        <!-- Delivery Estimate -->
                        <div style="background: #e6f2ff; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                            <strong style="color: #0066FF;">📅 Estimated Delivery: ${data.estimatedDelivery}</strong>
                        </div>

                        <!-- Track Order Button -->
                        <div style="text-align: center;">
                            <a href="${data.trackingUrl}" class="track-btn">
                                Track Your Order
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <div style="margin-bottom: 20px;">
                            <h2 style="color: #0066FF;">PANKHUDI</h2>
                        </div>
                        <p>Need help? Contact us at ${data.supportEmail} or ${data.supportPhone}</p>
                        <p style="font-size: 12px; margin-top: 20px;">
                            © ${new Date().getFullYear()} Pankhudi. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Log email in database
    async logEmail(orderId, recipient, type, messageId, status = 'sent', error = null) {
        try {
            const db = require('../server').db;
            if (!db) return;

            const subject = type === 'order_confirmation' ? 'Order Confirmation' : 'Order Status Update';
            const sql = `INSERT INTO email_logs (order_id, recipient, subject, message_id, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`;

            db.query(sql, [orderId, recipient, subject, messageId, status, error], (err) => {
                if (err) console.error('Error logging email:', err);
            });
        } catch (error) {
            console.error('Error in email logging:', error);
        }
    }
}

module.exports = new EmailService();