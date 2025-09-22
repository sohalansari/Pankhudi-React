import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import './Forget.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);

    // Password validation rules
    const passwordRules = [
        { id: 1, text: 'At least 8 characters', validator: (pwd) => pwd.length >= 8 },
        { id: 2, text: 'Contains uppercase letter', validator: (pwd) => /[A-Z]/.test(pwd) },
        { id: 3, text: 'Contains lowercase letter', validator: (pwd) => /[a-z]/.test(pwd) },
        { id: 4, text: 'Contains number', validator: (pwd) => /[0-9]/.test(pwd) },
        { id: 5, text: 'Contains special character', validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
    ];

    const validatePassword = (password) => {
        return passwordRules.map(rule => ({
            ...rule,
            isValid: rule.validator(password)
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword') {
            const errors = validatePassword(value);
            setPasswordErrors(errors);
        }

        // Clear messages when user starts typing
        if (message.text) {
            setMessage({ text: '', type: '' });
        }
    };

    const validateForm = () => {
        if (step === 1) {
            if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                setMessage({ text: 'Please enter a valid email address', type: 'error' });
                return false;
            }
        } else if (step === 2) {
            if (!form.otp || form.otp.length !== 6) {
                setMessage({ text: 'Please enter a valid 6-digit OTP', type: 'error' });
                return false;
            }
        } else if (step === 3) {
            const allValid = passwordErrors.every(rule => rule.isValid);
            if (!allValid) {
                setMessage({ text: 'Please meet all password requirements', type: 'error' });
                return false;
            }
            if (form.newPassword !== form.confirmPassword) {
                setMessage({ text: 'Passwords do not match', type: 'error' });
                return false;
            }
        }
        return true;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await fetch('http://localhost:5000/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ text: 'OTP sent to your email!', type: 'success' });
                setStep(2);
            } else {
                setMessage({ text: data.message || 'Failed to send OTP', type: 'error' });
            }
        } catch (err) {
            console.error('Email submission error:', err);
            setMessage({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await fetch('http://localhost:5000/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    otp: form.otp
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ text: 'OTP verified successfully!', type: 'success' });
                setStep(3);
            } else {
                setMessage({ text: data.message || 'Invalid OTP', type: 'error' });
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            setMessage({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    newPassword: form.newPassword
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({
                    text: 'Password reset successfully! Redirecting to login...',
                    type: 'success'
                });
                setTimeout(() => window.location.href = '/login', 2000);
            } else {
                setMessage({ text: data.message || 'Password reset failed', type: 'error' });
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setMessage({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Enter Your Email';
            case 2: return 'Verify OTP';
            case 3: return 'Reset Password';
            default: return 'Forgot Password';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return 'Enter your email address to receive a verification code';
            case 2: return 'Enter the 6-digit code sent to your email';
            case 3: return 'Create a new strong password for your account';
            default: return '';
        }
    };

    const isSubmitDisabled = () => {
        if (loading) return true;

        switch (step) {
            case 1: return !form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
            case 2: return !form.otp || form.otp.length !== 6;
            case 3:
                const allValid = passwordErrors.every(rule => rule.isValid);
                return !allValid || form.newPassword !== form.confirmPassword;
            default: return true;
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                {/* Step Indicator */}
                <div className="step-indicator">
                    {[1, 2, 3].map((stepNumber) => (
                        <React.Fragment key={stepNumber}>
                            <div className={`step ${step === stepNumber ? 'active' : ''} ${step > stepNumber ? 'completed' : ''}`}>
                                {step > stepNumber ? <FaCheck /> : stepNumber}
                            </div>
                            {stepNumber < 3 && <div className={`step-connector ${step > stepNumber ? 'completed' : ''}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Header */}
                <div className="forgot-header">
                    <h1 className="brand-name">Pankhudi</h1>
                    <h2 className="step-title">{getStepTitle()}</h2>
                    <p className="step-description">{getStepDescription()}</p>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.type === 'success' ? '✓' : '⚠'} {message.text}
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <span>Processing your request...</span>
                    </div>
                )}

                <form onSubmit={
                    step === 1 ? handleEmailSubmit :
                        step === 2 ? handleOtpSubmit :
                            handleResetPassword
                } className="forgot-form">

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <div className="form-group">
                            <div className="input-container">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={form.email ? 'has-value' : ''}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: OTP Input */}
                    {step === 2 && (
                        <div className="form-group">
                            <div className="input-container">
                                <FaLock className="input-icon" />
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={form.otp}
                                    onChange={handleChange}
                                    maxLength="6"
                                    disabled={loading}
                                    className={form.otp ? 'has-value' : ''}
                                />
                            </div>
                            <div className="otp-hint">
                                <span>Didn't receive OTP? </span>
                                <button type="button" className="resend-btn" onClick={handleEmailSubmit}>
                                    Resend OTP
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Password Reset */}
                    {step === 3 && (
                        <div className="form-group">
                            <div className="input-container">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    placeholder="Create new password"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={form.newPassword ? 'has-value' : ''}
                                />
                                <span
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </span>
                            </div>

                            <div className="input-container">
                                <FaLock className="input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={form.confirmPassword ? 'has-value' : ''}
                                />
                                <span
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </span>
                            </div>

                            {/* Password Strength Indicator */}
                            <div className="password-strength">
                                <h4>Password Requirements:</h4>
                                <div className="password-rules">
                                    {passwordRules.map(rule => {
                                        const currentRule = passwordErrors.find(r => r.id === rule.id);
                                        const isValid = currentRule?.isValid || false;
                                        return (
                                            <div key={rule.id} className={`rule ${isValid ? 'valid' : 'invalid'}`}>
                                                {isValid ? <FaCheck /> : <FaTimes />}
                                                <span>{rule.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        {step > 1 && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setStep(step - 1)}
                                disabled={loading}
                            >
                                Back
                            </button>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitDisabled()}
                        >
                            {loading ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Processing...
                                </>
                            ) : (
                                step === 1 ? 'Send OTP' :
                                    step === 2 ? 'Verify OTP' :
                                        'Reset Password'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Links */}
                <div className="form-footer">
                    <a href="/login" className="back-link">
                        ← Back to Login
                    </a>
                    <div className="support-link">
                        Need help? <a href="/support">Contact Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;