import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaPhone, FaGoogle, FaUser } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import BackButton from '../../components/Backbutton';

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
        
        // Check if user is already logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            // Redirect to home if already logged in
            window.location.href = '/';
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
        const errs = validateForm();
        setError(errs);

        if (Object.keys(errs).length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/login', {
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
                
                // // Store user data in localStorage
                // if (data.user) {
                //     localStorage.setItem('user', JSON.stringify({
                //         name: data.user.name,
                //         email: data.user.email,
                //         id: data.user.id,
                //         is_premium: data.user.is_premium || false
                //     }));
                // }

                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', form.emailOrPhone);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setTimeout(() => {
                    window.location.href = data.user?.is_premium ? '/dashboard' : '/';
                }, 2000);
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (err) {
            setMessage('Server error. Please try again.');
        }

        setIsLoading(false);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setMessage('Authenticating with Google...');

            // Decode the JWT token to get user info
            const decoded = jwtDecode(credentialResponse.credential);
            console.log('Google user info:', decoded);

            // Send the credential to your backend
            const res = await fetch('http://localhost:5000/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: credentialResponse.credential,
                    clientId: credentialResponse.clientId  // Optional: send clientId for verification
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('✅ Google login successful! Redirecting...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('authMethod', 'google'); // Store auth method

                // // Store user data in localStorage
                // if (data.user) {
                //     localStorage.setItem('user', JSON.stringify({
                //         name: data.user.name,
                //         email: data.user.email,
                //         id: data.user.id,
                //         is_premium: data.user.is_premium || false
                //     }));
                // }

                // Redirect to dashboard or home page
                setTimeout(() => {
                    window.location.href = data.user?.is_premium ? '/dashboard' : '/';
                }, 1500);
            } else {
                setMessage(data.message || 'Google login failed');
                // Logout from Google if backend authentication failed
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
        console.error('Google login failed');
    };

    const toggleLoginMethod = () => {
        setLoginMethod(prev => prev === 'email' ? 'phone' : 'email');
        setForm(prev => ({ ...prev, emailOrPhone: '' }));
        setError(prev => ({ ...prev, emailOrPhone: '' }));
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* <BackButton variant="text" position="absolute" align="left" top /> */}
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
                        {loginMethod === 'email' ? (
                            <FaEnvelope className="input-icon" />
                        ) : (
                            <FaPhone className="input-icon" />
                        )}
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
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
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
                        <Link to="/forgot" className="forgot-password">
                            Forgot Password?
                        </Link>
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

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            'Login'
                        )}
                    </button>

                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-login-options">
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginFailure}
                                useOneTap
                                auto_select
                                theme="filled_blue"
                                size="large"
                                shape="rectangular"
                                width="300"
                                text="continue_with"
                                logo_alignment="left"
                                ux_mode="popup"
                                context="use"
                            />
                        </div>

                        {/* Fallback button if Google button doesn't load */}
                        {!window.google && (
                            <button
                                className="google-login-fallback"
                                onClick={() => setMessage('Please enable Google services to login')}
                            >
                                <FaGoogle /> Continue with Google
                            </button>
                        )}
                    </div>

                    <div className="signup-link">
                        Don't have an account?{' '}
                        <Link to="/register">
                            <strong>Sign up</strong>
                        </Link>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default Login;