import React, { useState, useEffect } from 'react';
import './Register.css';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaAddressCard } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


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
                setMessage('✅ Registered Successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (err) {
            setMessage('Server error, try again later.');
        }

        setIsLoading(false);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);

            // Pre-fill form with Google data (optional)
            setForm(prev => ({
                ...prev,
                name: decoded.name || '',
                email: decoded.email || '',
                // Google doesn't provide phone or address
            }));

            // Alternatively, automatically register the user
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: credentialResponse.credential
                }),
            });

            const data = await res.json();

            if (res.ok) {
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
            <form className="register-form" onSubmit={handleSubmit}>
                <h1 className="brand-name">Pankhudi</h1>
                <h2>Create Account</h2>
                {message && <p className="form-message">{message}</p>}

                <div className="input-group">
                    <FaUser className="input-icon" />
                    <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
                </div>
                {errors.name && <p className="error">{errors.name}</p>}

                <div className="input-group">
                    <FaEnvelope className="input-icon" />
                    <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
                </div>
                {errors.email && <p className="error">{errors.email}</p>}

                <div className="input-group">
                    <FaPhone className="input-icon" />
                    <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
                </div>
                {errors.phone && <p className="error">{errors.phone}</p>}

                <div className="input-group textarea-group">
                    <FaAddressCard className="input-icon" />
                    <textarea
                        name="address"
                        placeholder="Full Address"
                        value={form.address}
                        onChange={handleChange}
                    ></textarea>
                </div>
                {errors.address && <p className="error">{errors.address}</p>}

                <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </span>
                </div>
                {errors.password && <p className="error">{errors.password}</p>}

                <label className="terms">
                    <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
                    I agree to the <a href="/terms">Terms & Conditions</a>
                </label>
                {errors.terms && <p className="error">{errors.terms}</p>}

                <button type="submit" className="btn" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>

                {/* Divider */}
                <div className="divider">
                    <span>or</span>
                </div>

                {/* Google Login Button */}
                <div className="google-login">
                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginFailure}
                        text="signup_with"
                    />
                </div>

                <div className="links">
                    <a href="/login">Already have an account? Login</a>
                    <a href="/forgot">Forgot Password?</a>
                </div>
            </form>
        </div>
    );
};

export default Register;