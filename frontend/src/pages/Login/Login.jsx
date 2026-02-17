// import React, { useState, useEffect } from 'react';
// import './Login.css';
// import { FaEnvelope, FaLock, FaPhone, FaUser, FaCheck } from 'react-icons/fa';
// import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
// import { GoogleLogin } from '@react-oauth/google';
// import { jwtDecode } from "jwt-decode";
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const Login = () => {
//     const [form, setForm] = useState({
//         emailOrPhone: '',
//         password: '',
//         terms: false,
//     });

//     const [error, setError] = useState({});
//     const [message, setMessage] = useState({ text: '', type: '' });
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [loginMethod, setLoginMethod] = useState('email');
//     const [rememberMe, setRememberMe] = useState(false);

//     const { token } = useAuth();
//     const { login } = useAuth();
//     const navigate = useNavigate();
//     useEffect(() => {
//         if (token) navigate("/", { replace: true });
//     }, [token, navigate])

//     useEffect(() => {
//         window.scrollTo(0, 0);
//         const rememberedEmail = localStorage.getItem('rememberedEmail');
//         if (rememberedEmail) {
//             setForm(prev => ({ ...prev, emailOrPhone: rememberedEmail }));
//             setRememberMe(true);
//         }
//     }, []);

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));

//         if (error[name]) setError(prev => ({ ...prev, [name]: '' }));
//         if (message.text) setMessage({ text: '', type: '' });
//     };

//     const validateForm = () => {
//         const errs = {};
//         if (loginMethod === 'email') {
//             if (!form.emailOrPhone) {
//                 errs.emailOrPhone = 'Email is required';
//             } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrPhone)) {
//                 errs.emailOrPhone = 'Please enter a valid email address';
//             }
//         } else {
//             if (!form.emailOrPhone) {
//                 errs.emailOrPhone = 'Phone number is required';
//             } else if (!/^\d{10}$/.test(form.emailOrPhone)) {
//                 errs.emailOrPhone = 'Please enter a valid 10-digit phone number';
//             }
//         }
//         if (!form.password) {
//             errs.password = 'Password is required';
//         } else if (form.password.length < 6) {
//             errs.password = 'Password must be at least 6 characters';
//         }
//         if (!form.terms) {
//             errs.terms = 'You must accept the Terms & Conditions and Privacy Policy';
//         }
//         return errs;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setMessage({ text: '', type: '' });

//         const errs = validateForm();
//         setError(errs);
//         if (Object.keys(errs).length > 0) {
//             setIsLoading(false);
//             return;
//         }

//         try {
//             const res = await fetch('http://localhost:5000/api/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     emailOrPhone: form.emailOrPhone,
//                     password: form.password,
//                     loginMethod
//                 }),
//             });

//             const data = await res.json();

//             if (res.ok) {
//                 // ✅ update context + localStorage both
//                 login(data.token, data.user);

//                 if (rememberMe) {
//                     localStorage.setItem('rememberedEmail', form.emailOrPhone);
//                 } else {
//                     localStorage.removeItem('rememberedEmail');
//                 }

//                 setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
//                 setTimeout(() => {
//                     navigate('/'); // redirect anywhere
//                 }, 1500);
//             } else {
//                 setMessage({ text: data.message || 'Invalid credentials. Please try again.', type: 'error' });
//             }
//         } catch (err) {
//             console.error('Login error:', err);
//             setMessage({ text: 'Server error. Please try again later.', type: 'error' });
//         }

//         setIsLoading(false);
//     };

//     const handleGoogleLoginSuccess = async (credentialResponse) => {
//         try {
//             setIsLoading(true);
//             setMessage({ text: 'Authenticating with Google...', type: 'info' });

//             const decoded = jwtDecode(credentialResponse.credential);

//             const res = await fetch('http://localhost:5000/api/auth/google', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ token: credentialResponse.credential }),
//             });

//             const data = await res.json();

//             if (res.ok) {
//                 login(data.token, data.user);
//                 setMessage({ text: 'Google login successful! Redirecting...', type: 'success' });
//                 setTimeout(() => {
//                     navigate('/');
//                 }, 1500);
//             } else {
//                 setMessage({ text: data.message || 'Google login failed', type: 'error' });
//             }
//         } catch (err) {
//             console.error('Google login error:', err);
//             setMessage({ text: 'Failed to complete Google login. Please try again.', type: 'error' });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleGoogleLoginFailure = () => {
//         setMessage({ text: 'Google login failed. Please try again or use another method.', type: 'error' });
//     };

//     const toggleLoginMethod = () => {
//         const newMethod = loginMethod === 'email' ? 'phone' : 'email';
//         setLoginMethod(newMethod);
//         setForm(prev => ({ ...prev, emailOrPhone: '' }));
//         setError(prev => ({ ...prev, emailOrPhone: '' }));
//         setMessage({ text: '', type: '' });
//     };

//     return (
//         <div className="login-page-container">
//             <div className="login-glass-card">
//                 {/* Brand Header */}
//                 <div className="brand-section">
//                     <div className="brand-logo">
//                         <FaUser className="logo-icon" />
//                     </div>
//                     <h1 className="brand-name">PANKHUDI</h1>
//                     <p className="brand-tagline">Your Gateway to Community</p>
//                 </div>

//                 {/* Welcome Section */}
//                 <div className="welcome-section">
//                     <h2 className="welcome-title">Welcome Back</h2>
//                     <p className="welcome-subtitle">Sign in to continue your journey</p>
//                 </div>

//                 {/* Login Method Toggle */}
//                 <div className="method-toggle-section">
//                     <div className="toggle-container">
//                         <button
//                             type="button"
//                             className={`toggle-option ${loginMethod === 'email' ? 'active' : ''}`}
//                             onClick={toggleLoginMethod}
//                         >
//                             <FaEnvelope className="option-icon" />
//                             <span>Email Login</span>
//                             {loginMethod === 'email' && <div className="active-indicator"></div>}
//                         </button>

//                         <button
//                             type="button"
//                             className={`toggle-option ${loginMethod === 'phone' ? 'active' : ''}`}
//                             onClick={toggleLoginMethod}
//                         >
//                             <FaPhone className="option-icon" />
//                             <span>Phone Login</span>
//                             {loginMethod === 'phone' && <div className="active-indicator"></div>}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Message Display */}
//                 {message.text && (
//                     <div className={`status-message ${message.type}`}>
//                         <div className="message-icon">
//                             {message.type === 'success' ? '✓' : message.type === 'error' ? '⚠' : 'ℹ'}
//                         </div>
//                         <span>{message.text}</span>
//                     </div>
//                 )}

//                 {/* Login Form */}
//                 <form className="login-form" onSubmit={handleSubmit}>
//                     {/* Email/Phone Field */}
//                     <div className="form-field">
//                         <label className="field-label">
//                             {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
//                         </label>
//                         <div className="input-wrapper">
//                             {loginMethod === 'email' ?
//                                 <FaEnvelope className="field-icon" /> :
//                                 <FaPhone className="field-icon" />
//                             }
//                             <input
//                                 type={loginMethod === 'email' ? 'email' : 'tel'}
//                                 name="emailOrPhone"
//                                 placeholder={loginMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
//                                 value={form.emailOrPhone}
//                                 onChange={handleChange}
//                                 disabled={isLoading}
//                                 className={`form-input ${error.emailOrPhone ? 'error' : ''}`}
//                             />
//                         </div>
//                         {error.emailOrPhone && <span className="field-error">{error.emailOrPhone}</span>}
//                     </div>

//                     {/* Password Field */}
//                     <div className="form-field">
//                         <label className="field-label">Password</label>
//                         <div className="input-wrapper">
//                             <FaLock className="field-icon" />
//                             <input
//                                 type={showPassword ? 'text' : 'password'}
//                                 name="password"
//                                 placeholder="Enter your password"
//                                 value={form.password}
//                                 onChange={handleChange}
//                                 disabled={isLoading}
//                                 className={`form-input ${error.password ? 'error' : ''}`}
//                             />
//                             <button
//                                 type="button"
//                                 className="password-toggle"
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 disabled={isLoading}
//                             >
//                                 {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
//                             </button>
//                         </div>
//                         {error.password && <span className="field-error">{error.password}</span>}
//                     </div>

//                     {/* Options Row */}
//                     <div className="form-options">
//                         <label className="checkbox-container">
//                             <input
//                                 type="checkbox"
//                                 checked={rememberMe}
//                                 onChange={(e) => setRememberMe(e.target.checked)}
//                                 disabled={isLoading}
//                             />
//                             <span className="checkmarks">
//                                 <FaCheck className="check-icon" />
//                             </span>
//                             <span className="checkbox-label">Remember me</span>
//                         </label>

//                         <Link to="/forgot" className="forgot-password-link">
//                             Forgot Password?
//                         </Link>
//                     </div>

//                     {/* Terms & Conditions Agreement */}
//                     <div className="form-options terms-section">
//                         <label className="checkbox-container terms-checkbox">
//                             <input
//                                 type="checkbox"
//                                 name="terms"
//                                 checked={form.terms}
//                                 onChange={handleChange}
//                                 disabled={isLoading}
//                                 className={error.terms ? 'error-checkbox' : ''}
//                             />
//                             <span className="checkmarks">
//                                 <FaCheck className="check-icon" />
//                             </span>
//                             <span className="checkbox-label">
//                                 I agree to the <Link to="/terms" className="terms-link">Terms & Conditions</Link> and{' '}
//                                 <Link to="/privacy" className="terms-link">Privacy Policy</Link>
//                             </span>
//                         </label>
//                         {error.terms && <span className="field-error terms-error">{error.terms}</span>}
//                     </div>

//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         className={`submit-button ${isLoading ? 'loading' : ''}`}
//                         disabled={isLoading}
//                     >
//                         {isLoading ? (
//                             <>
//                                 <div className="button-spinner"></div>
//                                 Signing In...
//                             </>
//                         ) : (
//                             'Sign In to Your Account'
//                         )}
//                     </button>
//                 </form>

//                 {/* Divider */}
//                 <div className="section-divider">
//                     <span className="divider-text">or continue with</span>
//                 </div>

//                 {/* Social Login */}
//                 <div className="social-login-section">
//                     <GoogleLogin
//                         onSuccess={handleGoogleLoginSuccess}
//                         onError={handleGoogleLoginFailure}
//                         theme="filled_blue"
//                         size="large"
//                         shape="rectangular"
//                         width="100%"
//                         text="continue_with"
//                     />
//                 </div>

//                 {/* Sign Up Link */}
//                 <div className="auth-redirect">
//                     <p className="redirect-text">
//                         Don't have an account?{' '}
//                         <Link to="/register" className="redirect-link">
//                             Create an account
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;








import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaPhone, FaUser, FaCheck, FaShieldAlt, FaKey, FaArrowLeft } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// API Configuration
const API_CONFIG = {
    LOGIN: 'http://localhost:5000/api/login',
    VERIFY_2FA: 'http://localhost:5000/api/verify-2fa',
    VERIFY_BACKUP: 'http://localhost:5000/api/verify-backup-code',
    RESEND_2FA: 'http://localhost:5000/api/resend-2fa',
    GOOGLE_AUTH: 'http://localhost:5000/api/auth/google'
};

const Login = () => {
    // Step management: 'credentials' or '2fa'
    const [step, setStep] = useState('credentials');

    // Form state
    const [form, setForm] = useState({
        emailOrPhone: '',
        password: '',
        terms: false,
    });

    // 2FA state
    const [twoFACode, setTwoFACode] = useState(['', '', '', '', '', '']);
    const [tempToken, setTempToken] = useState(null);
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [twoFAError, setTwoFAError] = useState('');

    // UI state
    const [error, setError] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email');
    const [rememberMe, setRememberMe] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Check for remembered email on load
    useEffect(() => {
        window.scrollTo(0, 0);
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setForm(prev => ({ ...prev, emailOrPhone: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    // Countdown timer for 2FA resend
    useEffect(() => {
        let timer;
        if (resendDisabled && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setResendDisabled(false);
            setCountdown(30);
        }
        return () => clearTimeout(timer);
    }, [resendDisabled, countdown]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (error[name]) setError(prev => ({ ...prev, [name]: '' }));
        if (message.text) setMessage({ text: '', type: '' });
    };

    // Handle 2FA code input (for TOTP - numbers only)
    const handle2FACodeChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newCode = [...twoFACode];
        newCode[index] = value;
        setTwoFACode(newCode);
        setTwoFAError('');

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`2fa-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backup code input (alphanumeric)
    const handleBackupCodeChange = (e) => {
        // Only allow uppercase letters and numbers
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setBackupCode(value);
        setTwoFAError('');
    };

    // Handle 2FA code paste (for TOTP)
    const handle2FAPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedCode = pastedData.replace(/\D/g, '').slice(0, 6);

        if (pastedCode.length === 6) {
            const newCode = pastedCode.split('');
            setTwoFACode(newCode);
            document.getElementById('2fa-5')?.focus();
        }
    };

    // Handle backspace in 2FA inputs
    const handle2FAKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !twoFACode[index] && index > 0) {
            const prevInput = document.getElementById(`2fa-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Validate login form
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
        if (!form.terms) {
            errs.terms = 'You must accept the Terms & Conditions and Privacy Policy';
        }
        return errs;
    };

    // STEP 1: Handle initial login submission
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
            const response = await axios.post(API_CONFIG.LOGIN, {
                emailOrPhone: form.emailOrPhone,
                password: form.password,
                loginMethod
            });

            if (response.data.requiresTwoFA) {
                // User has 2FA enabled - show 2FA screen
                setTempToken(response.data.tempToken);
                setUserEmail(response.data.user.email);
                setStep('2fa');
                setMessage({
                    text: 'Please enter the 6-digit code from your authenticator app',
                    type: 'info'
                });
            } else {
                // No 2FA - login directly
                login(response.data.token, response.data.user);

                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', form.emailOrPhone);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 2: Verify 2FA code or Backup code
    const handle2FAVerification = async () => {
        let code;

        if (useBackupCode) {
            // Backup code case
            code = backupCode;
            if (!code || code.length < 6) {
                setTwoFAError('Please enter a valid backup code (minimum 6 characters)');
                return;
            }
        } else {
            // TOTP code case
            code = twoFACode.join('');
            if (code.length !== 6) {
                setTwoFAError('Please enter a valid 6-digit code');
                return;
            }
        }

        setIsLoading(true);
        setTwoFAError('');

        try {
            const endpoint = useBackupCode ? API_CONFIG.VERIFY_BACKUP : API_CONFIG.VERIFY_2FA;
            const payload = useBackupCode
                ? { tempToken, backupCode: code }
                : { tempToken, twoFACode: code };

            const response = await axios.post(endpoint, payload);

            if (response.data.success) {
                // Login successful
                login(response.data.token, response.data.user);

                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', form.emailOrPhone);
                }

                setMessage({
                    text: response.data.backupCodeUsed
                        ? 'Login successful! Please generate new backup codes.'
                        : 'Login successful! Redirecting...',
                    type: 'success'
                });

                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            setTwoFAError(err.response?.data?.message || 'Invalid verification code');

            if (useBackupCode) {
                setBackupCode('');
            } else {
                setTwoFACode(['', '', '', '', '', '']);
                document.getElementById('2fa-0')?.focus();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend 2FA code
    const handleResendCode = async () => {
        setResendDisabled(true);
        setMessage({ text: 'Refreshing verification session...', type: 'info' });

        try {
            await axios.post(API_CONFIG.RESEND_2FA, { tempToken });
            setMessage({
                text: 'Verification session extended',
                type: 'success'
            });
            setTwoFACode(['', '', '', '', '', '']);
            setBackupCode('');
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || 'Failed to refresh session',
                type: 'error'
            });
            setResendDisabled(false);
        }
    };

    // Toggle between authenticator and backup code
    const toggleBackupCode = () => {
        setUseBackupCode(!useBackupCode);
        setTwoFACode(['', '', '', '', '', '']);
        setBackupCode('');
        setTwoFAError('');
    };

    // Go back to login form
    const handleBackToLogin = () => {
        setStep('credentials');
        setTwoFACode(['', '', '', '', '', '']);
        setTempToken(null);
        setUseBackupCode(false);
        setBackupCode('');
        setTwoFAError('');
        setMessage({ text: '', type: '' });
    };

    // Handle Google login
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setMessage({ text: 'Authenticating with Google...', type: 'info' });

            const response = await axios.post(API_CONFIG.GOOGLE_AUTH, {
                token: credentialResponse.credential
            });

            if (response.data.requiresTwoFA) {
                setTempToken(response.data.tempToken);
                setUserEmail(response.data.user.email);
                setStep('2fa');
                setMessage({
                    text: 'Please enter the 6-digit code from your authenticator app',
                    type: 'info'
                });
            } else {
                login(response.data.token, response.data.user);
                setMessage({ text: 'Google login successful! Redirecting...', type: 'success' });
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || 'Google login failed',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginFailure = () => {
        setMessage({
            text: 'Google login failed. Please try again or use another method.',
            type: 'error'
        });
    };

    // Toggle login method (email/phone)
    const toggleLoginMethod = () => {
        const newMethod = loginMethod === 'email' ? 'phone' : 'email';
        setLoginMethod(newMethod);
        setForm(prev => ({ ...prev, emailOrPhone: '' }));
        setError(prev => ({ ...prev, emailOrPhone: '' }));
        setMessage({ text: '', type: '' });
    };

    // Render 2FA verification step
    const render2FAStep = () => (
        <>
            <div className="back-button" onClick={handleBackToLogin}>
                <FaArrowLeft /> Back to Login
            </div>

            <div className="twofa-header">
                <div className="twofa-icon">
                    <FaShieldAlt />
                </div>
                <h2 className="twofa-title">Two-Factor Authentication</h2>
                <p className="twofa-subtitle">
                    {useBackupCode ? (
                        'Enter your backup code to verify your identity'
                    ) : (
                        <>
                            Enter the 6-digit code from your authenticator app for{' '}
                            <span className="email-highlight">{userEmail}</span>
                        </>
                    )}
                </p>
            </div>

            {/* Main Input Area */}
            <div className="twofa-input-container">
                {useBackupCode ? (
                    // Backup Code Input (Alphanumeric)
                    <div className="backup-code-container">
                        <input
                            type="text"
                            className={`backup-code-input ${twoFAError ? 'error' : ''}`}
                            placeholder="e.g., HLOWKDVO"
                            value={backupCode}
                            onChange={handleBackupCodeChange}
                            maxLength={10}
                            disabled={isLoading}
                            autoFocus
                        />
                        <p className="backup-code-hint">
                            Enter one of your 8 backup codes (letters + numbers)
                        </p>
                    </div>
                ) : (
                    // TOTP 6-digit Input (Numbers only)
                    <>
                        <div className="twofa-code-inputs">
                            {twoFACode.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`2fa-${index}`}
                                    type="text"
                                    className={`twofa-digit-input ${twoFAError ? 'error' : ''}`}
                                    value={digit}
                                    onChange={(e) => handle2FACodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handle2FAKeyDown(index, e)}
                                    onPaste={index === 0 ? handle2FAPaste : undefined}
                                    maxLength={1}
                                    disabled={isLoading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                        <p className="twofa-hint">Code changes every 30 seconds</p>
                    </>
                )}
                {twoFAError && <span className="field-error">{twoFAError}</span>}
            </div>

            {/* 2FA Options */}
            <div className="twofa-options">
                <button
                    type="button"
                    className="twofa-toggle-btn"
                    onClick={toggleBackupCode}
                    disabled={isLoading}
                >
                    <FaKey /> {useBackupCode ? 'Use Authenticator App' : 'Use Backup Code'}
                </button>

                {!useBackupCode && (
                    <button
                        type="button"
                        className="twofa-resend-btn"
                        onClick={handleResendCode}
                        disabled={resendDisabled || isLoading}
                    >
                        {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                )}
            </div>

            {/* Action Buttons */}
            <div className="twofa-actions">
                <button
                    type="button"
                    className="twofa-verify-btn"
                    onClick={handle2FAVerification}
                    disabled={
                        isLoading ||
                        (useBackupCode ? backupCode.length < 6 : twoFACode.join('').length !== 6)
                    }
                >
                    {isLoading ? (
                        <>
                            <div className="button-spinner"></div>
                            Verifying...
                        </>
                    ) : (
                        'Verify & Sign In'
                    )}
                </button>
            </div>

            {/* Help Text */}
            <div className="twofa-help-text">
                <p>
                    <FaShieldAlt /> Having trouble? Contact support if you've lost access to your authenticator app.
                </p>
            </div>
        </>
    );

    // Render credentials login step
    const renderCredentialsStep = () => (
        <>
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
                        <span>Email</span>
                    </button>

                    <button
                        type="button"
                        className={`toggle-option ${loginMethod === 'phone' ? 'active' : ''}`}
                        onClick={toggleLoginMethod}
                    >
                        <FaPhone className="option-icon" />
                        <span>Phone</span>
                    </button>
                    <div className="active-indicator"></div>
                </div>
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`status-message ${message.type}`}>
                    <span className="message-icon">
                        {message.type === 'success' ? '✓' : message.type === 'error' ? '⚠' : 'ℹ'}
                    </span>
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
                            placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter 10-digit phone'}
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

                {/* Terms & Conditions */}
                <div className="form-options terms-section">
                    <label className="checkbox-container terms-checkbox">
                        <input
                            type="checkbox"
                            name="terms"
                            checked={form.terms}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <span className="checkmarks">
                            <FaCheck className="check-icon" />
                        </span>
                        <span className="checkbox-label">
                            I agree to the <Link to="/terms">Terms & Conditions</Link> and{' '}
                            <Link to="/privacy">Privacy Policy</Link>
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
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="section-divider">
                <span className="divider-text">or continue with</span>
            </div>

            {/* Google Login */}
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
        </>
    );

    return (
        <div className="login-page-container">
            <div className={`login-glass-card ${step === '2fa' ? 'compact' : ''}`}>
                {step === 'credentials' ? renderCredentialsStep() : render2FAStep()}
            </div>
        </div>
    );
};

export default Login;