import React, { useState, useEffect } from 'react';
import './Register.css';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaAddressCard } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import BackButton from '../../components/Backbutton';

const Register = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        terms: false,
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateForm = () => {
        const errs = {};
        if (!form.name || form.name.length < 3) errs.name = 'Name must be at least 3 characters';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
        if (!form.phone || !/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
        if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
        if (!form.address || form.address.length < 10) errs.address = 'Address must be at least 10 characters';
        if (!form.terms) errs.terms = 'You must accept the terms & conditions';
        return errs;
    };

    const saveToLocalStorage = (userData) => {
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        existingUsers.push(userData);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        // ✅ Always save current user as "user"
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const errs = validateForm();
        setErrors(errs);

        if (Object.keys(errs).length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!data.success) {
                setMessage(data.message);
                if (data.errors) setErrors(data.errors);
            } else {
                saveToLocalStorage(form);
                setMessage('✅ Registered Successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (err) {
            saveToLocalStorage(form);
            setMessage('⚠️ Saved locally (server unavailable). You can login offline.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }

        setIsLoading(false);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            setForm(prev => ({
                ...prev,
                name: decoded.name || '',
                email: decoded.email || '',
            }));

            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();

            if (res.ok) {
                const userData = {
                    name: decoded.name || '',
                    email: decoded.email || '',
                    phone: '',
                    address: '',
                    password: ''
                };
                saveToLocalStorage(userData);

                setMessage('✅ Registration successful with Google! Redirecting...');
                localStorage.setItem('token', data.token);
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setMessage(data.message || 'Google registration failed');
            }
        } catch (err) {
            console.error('Google login error:', err);
            setMessage('Failed to register with Google');
        }
    };

    const handleGoogleLoginFailure = () => {
        setMessage('Google registration failed. Please try again.');
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <form className="register-form" onSubmit={handleSubmit}>
                    <h1 className="brand-name">Pankhudi</h1>
                    <h2>Create Account</h2>
                    <p className="subtitle">Join our community today</p>

                    {message && <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className={errors.name ? 'error-input' : ''} />
                    </div>
                    {errors.name && <p className="error">{errors.name}</p>}

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className={errors.email ? 'error-input' : ''} />
                    </div>
                    {errors.email && <p className="error">{errors.email}</p>}

                    <div className="input-group">
                        <FaPhone className="input-icon" />
                        <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={errors.phone ? 'error-input' : ''} />
                    </div>
                    {errors.phone && <p className="error">{errors.phone}</p>}

                    <div className="input-group">
                        <FaAddressCard className="input-icon" />
                        <textarea name="address" placeholder="Full Address" value={form.address} onChange={handleChange} className={errors.address ? 'error-input' : ''}></textarea>
                    </div>
                    {errors.address && <p className="error">{errors.address}</p>}

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} className={errors.password ? 'error-input' : ''} />
                        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>
                    </div>
                    {errors.password && <p className="error">{errors.password}</p>}

                    <div className="terms-group">
                        <label className="terms">
                            <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} className={errors.terms ? 'error-checkbox' : ''} />
                            <span>I agree to the <a href="/terms">Terms & Conditions</a></span>
                        </label>
                    </div>
                    {errors.terms && <p className="error">{errors.terms}</p>}

                    <button type="submit" className="btn-register" disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>

                    <div className="divider"><span>or</span></div>

                    <div className="google-login">
                        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} text="signup_with" theme="filled_blue" shape="rectangular" size="large" width="100%" />
                    </div>

                    <div className="links">
                        <a href="/login">Already have an account? Login</a>
                        <a href="/forgot">Forgot Password?</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
