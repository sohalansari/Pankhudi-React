// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For Gmail
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // For other SMTP servers
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send OTP Email
const sendOTPEmail = async (toEmail, otp, name = 'Admin') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Pankhudi Admin" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Password Reset OTP - Pankhudi Admin Panel',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset OTP</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 10px;
                        }
                        .email-content {
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 40px;
                            color: #667eea;
                            margin-bottom: 10px;
                        }
                        h2 {
                            color: #667eea;
                            margin: 0;
                        }
                        .otp-code {
                            text-align: center;
                            margin: 30px 0;
                            padding: 20px;
                            background: #f8f9fa;
                            border-radius: 10px;
                        }
                        .otp {
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 5px;
                            color: #764ba2;
                            font-family: monospace;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 10px 15px;
                            margin: 20px 0;
                            font-size: 14px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            font-size: 12px;
                            color: #666;
                        }
                        button {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 12px 30px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="email-content">
                            <div class="header">
                                <div class="logo">🕊️</div>
                                <h2>Pankhudi Admin Panel</h2>
                                <p style="color: #666;">Password Reset Request</p>
                            </div>
                            
                            <p>Dear <strong>${name}</strong>,</p>
                            
                            <p>We received a request to reset your password for your Pankhudi Admin account. Use the OTP below to complete the password reset process.</p>
                            
                            <div class="otp-code">
                                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Your OTP Code is:</div>
                                <div class="otp">${otp}</div>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong>
                                <ul style="margin: 5px 0 0 20px;">
                                    <li>This OTP is valid for only <strong>10 minutes</strong></li>
                                    <li>Never share this OTP with anyone</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <p style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Go to Login</a>
                            </p>
                            
                            <div class="footer">
                                <p>&copy; 2025 Pankhudi Foundation. All rights reserved.</p>
                                <p>This is an automated message, please do not reply to this email.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Send Password Reset Success Email
const sendPasswordResetSuccessEmail = async (toEmail, name = 'Admin') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Pankhudi Admin" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Password Changed Successfully - Pankhudi Admin Panel',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Password Changed Successfully</title>
                </head>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px;">
                            <div style="background: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #667eea;">Password Changed Successfully</h2>
                                <p>Dear <strong>${name}</strong>,</p>
                                <p>Your admin panel password has been successfully changed.</p>
                                <p>If you did not perform this action, please contact support immediately.</p>
                                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                                    <p style="margin: 0;">✅ Your account is secure</p>
                                </div>
                                <p>Best regards,<br>Pankhudi Team</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;

    } catch (error) {
        console.error('Success email error:', error);
        return false;
    }
};

module.exports = { sendOTPEmail, sendPasswordResetSuccessEmail };