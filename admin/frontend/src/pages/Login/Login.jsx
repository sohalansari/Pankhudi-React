import React, { useState, useEffect } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTime, setLockTime] = useState(0);

    // Check if account is locked on component mount
    useEffect(() => {
        const lockUntil = localStorage.getItem("lockUntil");
        if (lockUntil && parseInt(lockUntil) > Date.now()) {
            setIsLocked(true);
            setLockTime(parseInt(lockUntil) - Date.now());
        }

        // Check for remember me
        const remembered = localStorage.getItem("rememberMe") === "true";
        if (remembered) {
            setRememberMe(true);
            const savedEmail = localStorage.getItem("rememberedEmail");
            if (savedEmail) setEmail(savedEmail);
        }
    }, []);

    // Countdown timer for lock
    useEffect(() => {
        let timer;
        if (isLocked && lockTime > 0) {
            timer = setInterval(() => {
                setLockTime(prev => {
                    if (prev <= 1000) {
                        setIsLocked(false);
                        localStorage.removeItem("lockUntil");
                        localStorage.removeItem("loginAttempts");
                        setAttempts(0);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isLocked, lockTime]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLocked) {
            setError(`Account temporarily locked. Please try again in ${Math.ceil(lockTime / 1000)} seconds.`);
            return;
        }

        setIsLoading(true);
        setError("");

        // Input validation
        if (!email || !password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        // Check for special characters in password
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password)) {
            setError("Password must contain at least one special character");
            setIsLoading(false);
            return;
        }

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Check credentials
            if (email === "admin@pankhudi.com" && password === "Pankhudi@123") {
                // Reset attempts on successful login
                localStorage.removeItem("loginAttempts");
                localStorage.removeItem("lockUntil");

                // Store auth token with expiration (1 hour)
                const loginTime = Date.now();
                const tokenExpiry = loginTime + 60 * 60 * 1000; // 1 hour

                localStorage.setItem("auth", "true");
                localStorage.setItem("loginTime", loginTime.toString());
                localStorage.setItem("tokenExpiry", tokenExpiry.toString());

                if (rememberMe) {
                    localStorage.setItem("rememberMe", "true");
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberMe");
                    localStorage.removeItem("rememberedEmail");
                }

                window.location.href = "/";
            } else {
                // Handle failed attempts
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);

                if (newAttempts >= 3) {
                    // Lock account for 5 minutes after 3 failed attempts
                    const lockUntil = Date.now() + 5 * 60 * 1000;
                    localStorage.setItem("lockUntil", lockUntil.toString());
                    localStorage.setItem("loginAttempts", newAttempts.toString());

                    setIsLocked(true);
                    setLockTime(5 * 60 * 1000);
                    setError("Too many failed attempts. Account locked for 5 minutes.");
                } else {
                    localStorage.setItem("loginAttempts", newAttempts.toString());
                    setError(`Invalid credentials. ${3 - newAttempts} attempts remaining.`);
                }
            }
        } catch (err) {
            setError("Login failed. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        alert("Please contact system administrator to reset your password.");
    };

    // Format time for display
    const formatTime = (ms) => {
        const seconds = Math.ceil(ms / 1000);
        return `${seconds} seconds`;
    };

    return (
        <div className="login-container">
            <div className="background-animation">
                <div className="floating-icon icon-1"><i className="fas fa-dove"></i></div>
                <div className="floating-icon icon-2"><i className="fas fa-heart"></i></div>
                <div className="floating-icon icon-3"><i className="fas fa-star"></i></div>
                <div className="floating-icon icon-4"><i className="fas fa-leaf"></i></div>
            </div>

            <div className="website-header">
                <div className="logo-container">
                    <i className="fas fa-dove logo-icon"></i>
                    <h1 className="website-name">Pankhudi</h1>
                </div>
                <p className="website-tagline">Empowering Dreams, Transforming Lives</p>
            </div>

            <div className="login-card">
                <div className="card-shine-effect"></div>

                <div className="login-header">
                    <div className="login-logo">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h2>Pankhudi Admin Portal</h2>
                    <p>Sign in to your administrator account</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    {error && (
                        <div className={`error-message ${isLocked ? 'locked' : ''}`}>
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                            {isLocked && <div className="countdown">Resets in: {formatTime(lockTime)}</div>}
                        </div>
                    )}

                    <div className="input-group">
                        <i className="fas fa-envelope input-i"></i>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || isLocked}
                            autoComplete="email"
                            className={email ? 'has-value' : ''}
                        />
                        <div className="input-underline"></div>
                    </div>

                    <div className="input-group">
                        <i className="fas fa-lock input-i"></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || isLocked}
                            autoComplete="current-password"
                            className={password ? 'has-value' : ''}
                        />
                        <div className="input-underline"></div>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading || isLocked}
                        >
                            <i
                                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                            ></i>
                        </button>
                    </div>

                    <div className="login-options">
                        <label className="remember-me">
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading || isLocked}
                                />
                                <span className="checkmark"></span>
                            </div>
                            <span>Remember me</span>
                        </label>

                        <button
                            type="button"
                            className="forgot-password"
                            onClick={handleForgotPassword}
                            disabled={isLoading || isLocked}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${isLoading ? 'loading' : ''} ${isLocked ? 'locked' : ''}`}
                        disabled={isLoading || isLocked}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Signing in...
                            </>
                        ) : isLocked ? (
                            <>
                                <i className="fas fa-lock"></i>
                                Account Locked
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p><i className="fas fa-shield-alt"></i> Secure access • Encrypted connection</p>
                    <div className="security-badge">
                        <i className="fas fa-lock"></i>
                        <span>SSL Secured</span>
                    </div>
                </div>
            </div>

            <div className="website-footer">
                <p>&copy; 2025 Pankhudi Foundation. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#privacy">Privacy Policy</a>
                    <span>•</span>
                    <a href="#terms">Terms of Service</a>
                </div>
            </div>
        </div>
    );
}

export default Login;