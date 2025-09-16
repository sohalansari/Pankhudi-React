import React, { useState } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

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

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (email === "admin@pankhudi.com" && password === "Pankhudi@123") {
                localStorage.setItem("auth", "true");
                localStorage.setItem("loginTime", Date.now().toString());

                if (rememberMe) {
                    localStorage.setItem("rememberMe", "true");
                }

                window.location.href = "/"; // login ke baad home ya dashboard
            } else {
                setError("Invalid credentials. Please try again.");
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

    return (
        <div className="login-container">
            <div className="website-header">
                <div className="logo-container">
                    <i className="fas fa-dove logo-icon"></i>
                    <h1 className="website-name">Pankhudi</h1>
                </div>
                <p className="website-tagline">Empowering Dreams, Transforming Lives</p>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h2>Pankhudi Admin Portal</h2>
                    <p>Sign in to your administrator account</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="input-group">
                        <i className="fas fa-envelope"></i>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <i className="fas fa-lock"></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i
                                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                            ></i>
                        </button>
                    </div>

                    <div className="login-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span>Remember me</span>
                        </label>

                        <button
                            type="button"
                            className="forgot-password"
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Signing in...
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
                    <p>Secure access • Encrypted connection</p>
                    <div className="security-badge">
                        <i className="fas fa-lock"></i>
                        <span>SSL Secured</span>
                    </div>
                </div>
            </div>

            <div className="website-footer">
                <p>&copy; 2024 Pankhudi Foundation. All rights reserved.</p>
            </div>
        </div>
    );
}

export default Login;
