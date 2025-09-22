import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaPhone, FaUser, FaCheck } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Link } from 'react-router-dom';

const Login = () => {
    const [form, setForm] = useState({
        emailOrPhone: '',
        password: '',
        terms: false, // Added terms field
    });

    const [error, setError] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setForm(prev => ({ ...prev, emailOrPhone: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear errors when user types
        if (error[name]) {
            setError(prev => ({ ...prev, [name]: '' }));
        }
        if (message.text) {
            setMessage({ text: '', type: '' });
        }
    };

    const validateForm = () => {
        const errs = {};

        if (loginMethod === 'email') {
            if (!form.emailOrPhone) {
                errs.emailOrPhone = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrPhone)) {
                errs.emailOrPhone = 'Please enter a valid email address';
            }
        } else {
            if (!form.emailOrPhone) {
                errs.emailOrPhone = 'Phone number is required';
            } else if (!/^\d{10}$/.test(form.emailOrPhone)) {
                errs.emailOrPhone = 'Please enter a valid 10-digit phone number';
            }
        }

        if (!form.password) {
            errs.password = 'Password is required';
        } else if (form.password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }

        // Terms validation
        if (!form.terms) {
            errs.terms = 'You must accept the Terms & Conditions and Privacy Policy';
        }

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        const errs = validateForm();
        setError(errs);

        if (Object.keys(errs).length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailOrPhone: form.emailOrPhone,
                    password: form.password,
                    loginMethod
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                localStorage.setItem('token', data.token);

                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', form.emailOrPhone);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setTimeout(() => {
                    window.location.href = data.user?.is_premium ? '/' : '/';
                }, 1500);
            } else {
                setMessage({ text: data.message || 'Invalid credentials. Please try again.', type: 'error' });
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage({ text: 'Server error. Please try again later.', type: 'error' });
        }

        setIsLoading(false);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setMessage({ text: 'Authenticating with Google...', type: 'info' });

            const decoded = jwtDecode(credentialResponse.credential);

            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: 'Google login successful! Redirecting...', type: 'success' });
                localStorage.setItem('token', data.token);
                localStorage.setItem('authMethod', 'google');

                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                setTimeout(() => {
                    window.location.href = data.user?.is_premium ? '/dashboard' : '/';
                }, 1500);
            } else {
                setMessage({ text: data.message || 'Google login failed', type: 'error' });
            }
        } catch (err) {
            console.error('Google login error:', err);
            setMessage({ text: 'Failed to complete Google login. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginFailure = () => {
        setMessage({ text: 'Google login failed. Please try again or use another method.', type: 'error' });
    };

    const toggleLoginMethod = () => {
        const newMethod = loginMethod === 'email' ? 'phone' : 'email';
        setLoginMethod(newMethod);
        setForm(prev => ({ ...prev, emailOrPhone: '' }));
        setError(prev => ({ ...prev, emailOrPhone: '' }));
        setMessage({ text: '', type: '' });
    };

    return (
        <div className="login-page-container">
            <div className="login-glass-card">
                {/* Brand Header */}
                <div className="brand-section">
                    <div className="brand-logo">
                        <FaUser className="logo-icon" />
                    </div>
                    <h1 className="brand-name">PANKHUDI</h1>
                    <p className="brand-tagline">Your Gateway to Community</p>
                </div>

                {/* Welcome Section */}
                <div className="welcome-section">
                    <h2 className="welcome-title">Welcome Back</h2>
                    <p className="welcome-subtitle">Sign in to continue your journey</p>
                </div>

                {/* Login Method Toggle */}
                <div className="method-toggle-section">
                    <div className="toggle-container">
                        <button
                            type="button"
                            className={`toggle-option ${loginMethod === 'email' ? 'active' : ''}`}
                            onClick={toggleLoginMethod}
                        >
                            <FaEnvelope className="option-icon" />
                            <span>Email Login</span>
                            {loginMethod === 'email' && <div className="active-indicator"></div>}
                        </button>

                        <button
                            type="button"
                            className={`toggle-option ${loginMethod === 'phone' ? 'active' : ''}`}
                            onClick={toggleLoginMethod}
                        >
                            <FaPhone className="option-icon" />
                            <span>Phone Login</span>
                            {loginMethod === 'phone' && <div className="active-indicator"></div>}
                        </button>
                    </div>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div className={`status-message ${message.type}`}>
                        <div className="message-icon">
                            {message.type === 'success' ? '✓' : message.type === 'error' ? '⚠' : 'ℹ'}
                        </div>
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Email/Phone Field */}
                    <div className="form-field">
                        <label className="field-label">
                            {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                        </label>
                        <div className="input-wrapper">
                            {loginMethod === 'email' ?
                                <FaEnvelope className="field-icon" /> :
                                <FaPhone className="field-icon" />
                            }
                            <input
                                type={loginMethod === 'email' ? 'email' : 'tel'}
                                name="emailOrPhone"
                                placeholder={loginMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                                value={form.emailOrPhone}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`form-input ${error.emailOrPhone ? 'error' : ''}`}
                            />
                        </div>
                        {error.emailOrPhone && <span className="field-error">{error.emailOrPhone}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="form-field">
                        <label className="field-label">Password</label>
                        <div className="input-wrapper">
                            <FaLock className="field-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`form-input ${error.password ? 'error' : ''}`}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </button>
                        </div>
                        {error.password && <span className="field-error">{error.password}</span>}
                    </div>

                    {/* Options Row */}
                    <div className="form-options">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className="checkmarks">
                                <FaCheck className="check-icon" />
                            </span>
                            <span className="checkbox-label">Remember me</span>
                        </label>

                        <Link to="/forgot" className="forgot-password-link">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Terms & Conditions Agreement */}
                    <div className="form-options terms-section">
                        <label className="checkbox-container terms-checkbox">
                            <input
                                type="checkbox"
                                name="terms"
                                checked={form.terms}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={error.terms ? 'error-checkbox' : ''}
                            />
                            <span className="checkmarks">
                                <FaCheck className="check-icon" />
                            </span>
                            <span className="checkbox-label">
                                I agree to the <Link to="/terms" className="terms-link">Terms & Conditions</Link> and{' '}
                                <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                            </span>
                        </label>
                        {error.terms && <span className="field-error terms-error">{error.terms}</span>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`submit-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="button-spinner"></div>
                                Signing In...
                            </>
                        ) : (
                            'Sign In to Your Account'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="section-divider">
                    <span className="divider-text">or continue with</span>
                </div>

                {/* Social Login */}
                <div className="social-login-section">
                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginFailure}
                        theme="filled_blue"
                        size="large"
                        shape="rectangular"
                        width="100%"
                        text="continue_with"
                    />
                </div>

                {/* Sign Up Link */}
                <div className="auth-redirect">
                    <p className="redirect-text">
                        Don't have an account?{' '}
                        <Link to="/register" className="redirect-link">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;