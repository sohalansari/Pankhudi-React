import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterest, FaYoutube, FaArrowUp } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    const [showScroll, setShowScroll] = useState(false);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [currentYear] = useState(new Date().getFullYear());

    // Check scroll position
    useEffect(() => {
        const checkScroll = () => {
            if (!showScroll && window.pageYOffset > 400) {
                setShowScroll(true);
            } else if (showScroll && window.pageYOffset <= 400) {
                setShowScroll(false);
            }
        };
        window.addEventListener('scroll', checkScroll);
        return () => window.removeEventListener('scroll', checkScroll);
    }, [showScroll]);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Handle newsletter subscription
    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            // Here you would typically send the email to your backend
            console.log('Subscribed with email:', email);
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 5000);
        }
    };

    // Payment method icons (could also be imported as actual images)
    const paymentMethods = [
        { name: 'Visa', icon: 'https://d28wu8o6itv89t.cloudfront.net/images/Visadebitcardpng-1599584312349.png' },
        { name: 'Mastercard', icon: 'https://pngimg.com/d/mastercard_PNG23.png' },
        { name: 'American Express', icon: 'https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iV54kR7KCWM4/v0/-1x-1.webp' },
        { name: 'PayPal', icon: 'https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_1280.png' },
        { name: 'UPI', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png' },
        { name: 'Cash on Delivery', icon: 'https://www.nextsmartship.com/wp-content/uploads/2024/11/what-is-cash-on-delivery-and-why-is-it-important-for-your-business.jpg' }
    ];

    return (
        <footer className="pankhudi-footer">
            {/* Back to top button */}
            {showScroll && (
                <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
                    <FaArrowUp />
                </button>
            )}

            {/* Footer Top Section */}
            <div className="footer-top">
                <div className="container">
                    <div className="footer-columns">
                        {/* About Column */}
                        <div className="footer-column">
                            <h3 className="footer-title">About Pankhudi</h3>
                            <p className="footer-about">
                                Pankhudi brings you handcrafted luxury that celebrates India's rich heritage.
                                We curate the finest traditional and contemporary designs for the modern connoisseur.
                            </p>
                            <div className="social-links">
                                <a href="https://facebook.com" aria-label="Facebook" className="social-icon">
                                    <FaFacebookF />
                                </a>
                                <a href="https://instagram.com" aria-label="Instagram" className="social-icon">
                                    <FaInstagram />
                                </a>
                                <a href="https://twitter.com" aria-label="Twitter" className="social-icon">
                                    <FaTwitter />
                                </a>
                                <a href="https://pinterest.com" aria-label="Pinterest" className="social-icon">
                                    <FaPinterest />
                                </a>
                                <a href="https://youtube.com" aria-label="YouTube" className="social-icon">
                                    <FaYoutube />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links Column */}
                        <div className="footer-column">
                            <h3 className="footer-title">Quick Links</h3>
                            <ul className="footer-links">
                                <li><Link to="/orders">Order History</Link></li>
                                <li><Link to="/ai-chat">Go to AI Chat</Link></li>
                                <li><Link to="/products">Shop</Link></li>
                                <li><Link to="/collections/new-arrivals">New Arrivals</Link></li>
                                <li><Link to="/collections/bestsellers">Bestsellers</Link></li>
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Customer Service Column */}
                        <div className="footer-column">
                            <h3 className="footer-title">Customer Service</h3>
                            <ul className="footer-links">
                                <li><Link to="/faq">FAQs</Link></li>
                                <li><Link to="/shipping">Shipping Policy</Link></li>
                                <li><Link to="/returns">Return Policy</Link></li>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/terms">Terms & Conditions</Link></li>
                                <li><Link to="/size-guide">Size Guide</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info Column */}
                        <div className="footer-column">
                            <h3 className="footer-title">Contact Us</h3>
                            <ul className="contact-info">
                                <li>
                                    <FiMapPin className="contact-icon" />
                                    <span>123 Heritage Lane, Kurla, Maharashtra 400072, India</span>
                                </li>
                                <li>
                                    <FiPhone className="contact-icon" />
                                    <span>+91 85748 14934</span>
                                </li>
                                <li>
                                    <FiMail className="contact-icon" />
                                    <span>hello@pankhudi.com</span>
                                </li>
                            </ul>

                            <div className="newsletter">
                                <h4>Subscribe to Our Newsletter</h4>
                                {subscribed ? (
                                    <div className="subscription-success">
                                        Thank you for subscribing!
                                    </div>
                                ) : (
                                    <form className="newsletter-form" onSubmit={handleSubscribe}>
                                        <input
                                            type="email"
                                            placeholder="Your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <button type="submit">Subscribe</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom Section */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="payment-methods">
                        {paymentMethods.map((method, index) => (
                            <img
                                key={index}
                                src={method.icon}
                                alt={method.name}
                                className="payment-icon"
                                loading="lazy"
                            />
                        ))}
                    </div>

                    <div className="copyright">
                        <p>&copy; {currentYear} Pankhudi. All Rights Reserved.</p>
                        <p>Made with <span className="heart">♥</span> in India</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;