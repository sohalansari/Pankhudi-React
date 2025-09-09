import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaPhone, FaGoogle } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';

const Login = () => {
    const [form, setForm] = useState({
        emailOrPhone: '',
        password: '',
        terms: false,
    });

    const [error, setError] = useState({});
    const [message, setMessage] = useState('');
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
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateForm = () => {
        const errs = {};

        if (loginMethod === 'email') {
            if (!form.emailOrPhone) {
                errs.emailOrPhone = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrPhone)) {
                errs.emailOrPhone = 'Invalid email address';
            }
        } else {
            if (!form.emailOrPhone) {
                errs.emailOrPhone = 'Phone number is required';
            } else if (!/^\d{10}$/.test(form.emailOrPhone)) {
                errs.emailOrPhone = 'Invalid phone number (10 digits required)';
            }
        }

        if (!form.password || form.password.length < 8) {
            errs.password = 'Password must be at least 8 characters';
        }
        if (!form.terms) {
            errs.terms = 'You must accept the terms & conditions';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        const errs = validateForm();
        setError(errs);

        if (Object.keys(errs).length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            // ✅ Corrected endpoint
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
                setMessage('✅ Login successful! Redirecting...');
                localStorage.setItem('token', data.token);

                // ✅ Store user from backend (not just local registeredUsers)
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
                setMessage(data.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage('⚠️ Server error. Please try again later.');
        }

        setIsLoading(false);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setMessage('Authenticating with Google...');

            const decoded = jwtDecode(credentialResponse.credential);

            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('✅ Google login successful! Redirecting...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('authMethod', 'google');

                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                setTimeout(() => {
                    window.location.href = data.user?.is_premium ? '/dashboard' : '/';
                }, 1500);
            } else {
                setMessage(data.message || 'Google login failed');
                googleLogout();
            }
        } catch (err) {
            console.error('Google login error:', err);
            setMessage('Failed to complete Google login. Please try again.');
            googleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginFailure = () => {
        setMessage('Google login failed. Please try again or use another method.');
    };

    const toggleLoginMethod = () => {
        setLoginMethod(prev => prev === 'email' ? 'phone' : 'email');
        setForm(prev => ({ ...prev, emailOrPhone: '' }));
        setError(prev => ({ ...prev, emailOrPhone: '' }));
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="brand-header">
                        <h1 className="brand-name">Pankhudi</h1>
                        <p className="brand-tagline">Connect with your community</p>
                    </div>

                    <h2>Welcome Back</h2>
                    <p className="login-subtitle">Please enter your details to login</p>

                    {message && (
                        <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="login-method-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
                            onClick={toggleLoginMethod}
                        >
                            <FaEnvelope /> Email
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                            onClick={toggleLoginMethod}
                        >
                            <FaPhone /> Phone
                        </button>
                    </div>

                    <div className="input-group">
                        {loginMethod === 'email' ? <FaEnvelope className="input-icon" /> : <FaPhone className="input-icon" />}
                        <input
                            type={loginMethod === 'email' ? 'email' : 'tel'}
                            name="emailOrPhone"
                            placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                            value={form.emailOrPhone}
                            onChange={handleChange}
                            className={error.emailOrPhone ? 'error-input' : ''}
                        />
                    </div>
                    {error.emailOrPhone && <p className="error-message">{error.emailOrPhone}</p>}

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            className={error.password ? 'error-input' : ''}
                        />
                        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>
                    </div>
                    {error.password && <p className="error-message">{error.password}</p>}

                    <div className="options-row">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                        <Link to="/forgot" className="forgot-password">Forgot Password?</Link>
                    </div>

                    <label className="terms">
                        <input
                            type="checkbox"
                            name="terms"
                            checked={form.terms}
                            onChange={handleChange}
                            className={error.terms ? 'error-checkbox' : ''}
                        />
                        I agree to the <Link to="/terms">Terms & Conditions</Link> and{' '}
                        <Link to="/privacy">Privacy Policy</Link>
                    </label>
                    {error.terms && <p className="error-message">{error.terms}</p>}

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <span className="spinner"></span> : 'Login'}
                    </button>

                    <div className="divider"><span>or continue with</span></div>

                    <div className="social-login-options">
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginFailure}
                                theme="filled_blue"
                                size="large"
                                shape="rectangular"
                                width="300"
                                text="continue_with"
                            />
                        </div>
                    </div>

                    <div className="signup-link">
                        Don't have an account? <Link to="/register"><strong>Sign up</strong></Link>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
