import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);

        // Add event listener for theme toggle
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', toggleTheme);
        }

        return () => {
            if (toggle) {
                toggle.removeEventListener('click', toggleTheme);
            }
        };
    }, []);

    const toggleTheme = () => {
        document.body.classList.toggle('dark-theme');
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            if (document.body.classList.contains('dark-theme')) {
                toggle.innerHTML = '☀️';
            } else {
                toggle.innerHTML = '🌙';
            }
        }
    };

    return (
        <div className={`not-found-container ${isVisible ? 'visible' : ''}`}>
            <button id="theme-toggle" className="theme-toggle">🌙</button>

            <div className="not-found-content">
                <div className="pankhudi-brand">
                    <Link to="/" className="logo-link">
                        <h1>Pankhudi</h1>
                        <span className="tagline">Elegance Redefined</span>
                    </Link>
                </div>

                <div className="error-section">
                    <div className="error-graphic">
                        <div className="error-circle">4</div>
                        <div className="error-circle">0</div>
                        <div className="error-circle">4</div>
                    </div>
                    <h2>Page Not Found</h2>
                    <p className="error-description">The page you're looking for seems to have taken a graceful exit from our collection. But don't worry - every end is a new beginning in fashion.</p>

                    <div className="inspirational-quote">
                        <p>"Elegance is the only beauty that never fades." - Audrey Hepburn</p>
                    </div>

                    <div className="suggested-links">
                        <Link to="/products" className="suggested-link">
                            <span className="link-icon">👗</span>
                            <div className="link-content">
                                <span className="link-title">New Arrivals</span>
                                <span className="link-desc">Discover our latest collection</span>
                            </div>
                        </Link>
                        <Link to="/collections" className="suggested-link">
                            <span className="link-icon">👔</span>
                            <div className="link-content">
                                <span className="link-title">Men's Collection</span>
                                <span className="link-desc">Sophisticated styles for men</span>
                            </div>
                        </Link>
                        <Link to="/kids" className="suggested-link">
                            <span className="link-icon">👶</span>
                            <div className="link-content">
                                <span className="link-title">Kids Collection</span>
                                <span className="link-desc">Adorable fashion for little ones</span>
                            </div>
                        </Link>
                        <Link to="/accessories" className="suggested-link">
                            <span className="link-icon">💎</span>
                            <div className="link-content">
                                <span className="link-title">Accessories</span>
                                <span className="link-desc">Complete your look</span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="not-found-actions">
                    <Link to="/" className="home-button">
                        <span className="button-icon">🏠</span> Return to Homepage
                    </Link>
                    <button onClick={() => window.history.back()} className="back-button">
                        <span className="button-icon">↩️</span> Go Back
                    </button>
                    <Link to="/contact" className="contact-button">
                        <span className="button-icon">📞</span> Contact Support
                    </Link>
                </div>

                <div className="customer-testimonial">
                    <div className="testimonial-content">
                        <p>"Pankhudi has transformed my wardrobe with their exquisite collections. Even their 404 page is more beautiful than most websites!"</p>
                        <div className="testimonial-author">
                            <img src="https://i.pravatar.cc/40?img=5" alt="Customer" className="author-avatar" />
                            <div className="author-details">
                                <span className="author-name">Priya Sharma</span>
                                <span className="author-title">Loyal Customer</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="search-help">
                    <p className="search-title">Can't find what you're looking for?</p>
                    <p className="search-subtitle">Our personal stylists are here to help you discover pieces that reflect your unique style.</p>
                    <form className="search-form" action="/search" method="get">
                        <input
                            type="text"
                            name="query"
                            placeholder="Search Pankhudi collections..."
                            aria-label="Search products"
                            className="search-input"
                        />
                        <button type="submit" className="search-submit">
                            <span className="search-icon">🔍</span> Search
                        </button>
                    </form>
                </div>

                <div className="newsletter-signup">
                    <h3>Stay Updated with Pankhudi</h3>
                    <p>Subscribe to our newsletter for exclusive offers, styling tips, and early access to new collections.</p>
                    <form className="newsletter-form">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="newsletter-input"
                        />
                        <button type="submit" className="newsletter-submit">Subscribe</button>
                    </form>
                </div>

                <div className="social-connect">
                    <h3>Connect With Us</h3>
                    <div className="social-links">
                        <a href="#" className="social-link">Instagram</a>
                        <a href="#" className="social-link">Facebook</a>
                        <a href="#" className="social-link">Pinterest</a>
                        <a href="#" className="social-link">Twitter</a>
                    </div>
                </div>
            </div>

            <div className="floating-elements">
                <div className="floating-element element-1">👗</div>
                <div className="floating-element element-2">👔</div>
                <div className="floating-element element-3">👑</div>
                <div className="floating-element element-4">💎</div>
            </div>
        </div>
    );
};

export default NotFound;