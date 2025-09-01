import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import './Forget.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Password validation when in step 3
        if (name === 'newPassword') {
            if (value.length > 0 && value.length < 8) {
                setPasswordError('Password must be at least 8 characters');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('http://localhost:5000/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email })
            });
            const data = await res.json();
            setMessage(data.message);
            if (data.success) setStep(2);
        } catch (err) {
            setMessage('Server error.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('http://localhost:5000/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp: form.otp })
            });
            const data = await res.json();
            setMessage(data.message);
            if (data.success) setStep(3);
        } catch (err) {
            setMessage('Server error.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Validate password before submitting
        if (form.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('http://localhost:5000/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, newPassword: form.newPassword })
            });
            const data = await res.json();
            setMessage(data.message);
            if (data.success) {
                setTimeout(() => window.location.href = '/login', 2000);
            }
        } catch (err) {
            setMessage('Server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={step === 1 ? handleEmailSubmit : step === 2 ? handleOtpSubmit : handleResetPassword}>
                <h1 className="brand-name">Pankhudi</h1>
                <h2>Forgot Password</h2>

                {message && <p className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
                {loading && <div className="loading-spinners">⏳ Please wait...</div>}

                {step === 1 && (
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={form.otp}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                )}

                {step === 3 && (
                    <>
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                placeholder="New Password (min 8 characters)"
                                value={form.newPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className={passwordError ? 'error-input' : ''}
                            />
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </span>
                        </div>
                        {passwordError && <p className="error-message">{passwordError}</p>}
                        <div className="password-strength">
                            <span className={form.newPassword.length >= 8 ? 'valid' : 'invalid'}>
                                ✓ At least 8 characters
                            </span>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    className="btn"
                    disabled={loading || (step === 3 && (passwordError || form.newPassword.length === 0))}
                >
                    {loading ? 'Processing...' : step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                </button>

                <div className="links">
                    <a href="/login">Back to Login</a>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;