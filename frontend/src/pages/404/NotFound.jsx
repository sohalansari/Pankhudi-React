import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="not-found-container">
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
                    <p className="error-description">The requested page doesn't exist or may have been moved. Let us guide you back to our beautiful collections.</p>

                    <div className="suggested-links">
                        <Link to="/products" className="suggested-link">
                            <span className="link-icon">👗</span> New Arrivals
                        </Link>
                        <Link to="/collections" className="suggested-link">
                            <span className="link-icon">👔</span> Men's Collection
                        </Link>
                        <Link to="/kids" className="suggested-link">
                            <span className="link-icon">👶</span> Kids Collection
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
                </div>

                <div className="search-help">
                    <p className="search-title">Can't find what you're looking for?</p>
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
            </div>
        </div>
    );
};

export default NotFound;