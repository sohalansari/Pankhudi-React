import React, { useState, useEffect } from 'react';
import './Register.css';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaAddressCard } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const RegisterNew = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [form, setForm] = useState({
        fullName: '', email: '', phoneNumber: '', password: '', fullAddress: '', agreeTerms: false
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateForm = () => {
        const errs = {};
        if (!form.fullName || form.fullName.length < 3) errs.fullName = 'Name must be at least 3 characters';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
        if (!form.phoneNumber || !/^\d{10}$/.test(form.phoneNumber)) errs.phoneNumber = 'Phone must be 10 digits';
        if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
        if (!form.fullAddress || form.fullAddress.length < 10) errs.fullAddress = 'Address must be at least 10 characters';
        if (!form.agreeTerms) errs.agreeTerms = 'You must accept the terms & conditions';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const errs = validateForm();
        setErrors(errs);

        if (Object.keys(errs).length > 0 || !emailVerified) {
            setMessage(!emailVerified ? 'Please verify your email first' : '');
            setIsLoading(false);
            return;
        }

        const payload = {
            name: form.fullName,
            email: form.email,
            phone: form.phoneNumber,
            password: form.password,
            address: form.fullAddress
        };

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!data.success) {
                setMessage(data.message || 'Registration failed');
                if (data.fields) {
                    const newErrs = {};
                    data.fields.forEach(f => { newErrs[f.field] = f.error; });
                    setErrors(newErrs);
                }
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                setMessage('✅ Registered Successfully! Redirecting...');
                setTimeout(() => { window.location.href = '/'; }, 2000);
            }
        } catch {
            setMessage('⚠️ Server error. Please try again later.');
        }
        setIsLoading(false);
    };


    const handleSendOtp = async () => {
        if (!form.email) return setMessage('Enter email first');
        setSendingOtp(true);
        try {
            const res = await fetch('http://localhost:5000/api/send-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            if (data.success) {
                setShowOtpModal(true);
                setMessage('OTP sent to your email');
            } else setMessage(data.message);
        } catch {
            setMessage('Error sending OTP');
        }
        setSendingOtp(false);
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/verify-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp }),
            });
            const data = await res.json();
            if (data.success) {
                setEmailVerified(true);
                setShowOtpModal(false);
                setMessage('Email verified ✅');
            } else setMessage(data.message);
        } catch {
            setMessage('OTP verification error');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                setMessage('✅ Registration successful with Google! Redirecting...');
                setTimeout(() => { window.location.href = '/'; }, 2000);
            } else setMessage(data.message || 'Google registration failed');
        } catch {
            setMessage('Failed to register with Google');
        }
    };

    return (
        <div className="regnew-container">
            <div className="regnew-card">
                <form className="regnew-form" onSubmit={handleSubmit}>
                    <h1 className="brand-name">Pankhudi</h1>
                    <h2 className="regnew-title">Create Account</h2>
                    <p className="regnew-subtitle">Join our community today</p>

                    {message && <div className={`regnew-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

                    <div className="regnew-group">
                        <FaUser className="regnew-icon" />
                        <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className={errors.fullName ? 'regnew-error-input' : ''} />
                    </div>
                    {errors.fullName && <p className="regnew-error">{errors.fullName}</p>}

                    <div className="regnew-group">
                        <FaEnvelope className="regnew-icon" />
                        <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className={errors.email ? 'regnew-error-input' : ''} disabled={emailVerified} />
                    </div>
                    {errors.email && <p className="regnew-error">{errors.email}</p>}

                    <button type="button"
                        onClick={handleSendOtp}
                        className={`regnew-verify ${emailVerified ? 'verified' : ''}`}
                        disabled={sendingOtp || !form.email || emailVerified}>
                        {emailVerified ? '✅ Email Verified' : (sendingOtp ? 'Sending OTP...' : 'Verify Email')}
                    </button>

                    <div className="regnew-group">
                        <FaPhone className="regnew-icon" />
                        <input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className={errors.phoneNumber ? 'regnew-error-input' : ''} />
                    </div>
                    {errors.phoneNumber && <p className="regnew-error">{errors.phoneNumber}</p>}

                    <div className="regnew-group">
                        <FaAddressCard className="regnew-icon" />
                        <textarea name="fullAddress" placeholder="Full Address" value={form.fullAddress} onChange={handleChange} className={errors.fullAddress ? 'regnew-error-input' : ''}></textarea>
                    </div>
                    {errors.fullAddress && <p className="regnew-error">{errors.fullAddress}</p>}

                    <div className="regnew-group">
                        <FaLock className="regnew-icon" />
                        <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} className={errors.password ? 'regnew-error-input' : ''} />
                        <span className="regnew-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>
                    </div>
                    {errors.password && <p className="regnew-error">{errors.password}</p>}

                    <label className="regnew-terms">
                        <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange} className={errors.agreeTerms ? 'regnew-error-checkbox' : ''} />
                        I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                    </label>
                    {errors.agreeTerms && <p className="regnew-error">{errors.agreeTerms}</p>}

                    <button type="submit" className="regnew-btn" disabled={isLoading || !emailVerified}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>

                    <div className="regnew-divider"><span>or</span></div>

                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={() => setMessage('Google registration failed.')}
                        text="signup_with"
                        theme="filled_blue"
                        shape="rectangular"
                        size="large"
                    />

                    <div className="regnew-links">
                        <Link to="/login">Already have an account? Login</Link>
                        <Link to="/forgot">Forgot Password?</Link>
                    </div>
                </form>

                {showOtpModal && (
                    <div className="regnew-otp-modal">
                        <h3>Enter OTP</h3>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
                        <div className="regnew-otp-buttons">
                            <button onClick={handleVerifyOtp}>Verify OTP</button>
                            <button onClick={() => setShowOtpModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterNew;
