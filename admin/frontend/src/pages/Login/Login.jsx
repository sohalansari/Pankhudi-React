// // // import React, { useState, useEffect } from "react";
// // // import "./Login.css";

// // // function Login() {
// // //     const [email, setEmail] = useState("");
// // //     const [password, setPassword] = useState("");
// // //     const [showPassword, setShowPassword] = useState(false);
// // //     const [rememberMe, setRememberMe] = useState(false);
// // //     const [isLoading, setIsLoading] = useState(false);
// // //     const [error, setError] = useState("");
// // //     const [attempts, setAttempts] = useState(0);
// // //     const [isLocked, setIsLocked] = useState(false);
// // //     const [lockTime, setLockTime] = useState(0);

// // //     // Check if account is locked on component mount
// // //     useEffect(() => {
// // //         const lockUntil = localStorage.getItem("lockUntil");
// // //         if (lockUntil && parseInt(lockUntil) > Date.now()) {
// // //             setIsLocked(true);
// // //             setLockTime(parseInt(lockUntil) - Date.now());
// // //         }

// // //         // Check for remember me
// // //         const remembered = localStorage.getItem("rememberMe") === "true";
// // //         if (remembered) {
// // //             setRememberMe(true);
// // //             const savedEmail = localStorage.getItem("rememberedEmail");
// // //             if (savedEmail) setEmail(savedEmail);
// // //         }
// // //     }, []);

// // //     // Countdown timer for lock
// // //     useEffect(() => {
// // //         let timer;
// // //         if (isLocked && lockTime > 0) {
// // //             timer = setInterval(() => {
// // //                 setLockTime(prev => {
// // //                     if (prev <= 1000) {
// // //                         setIsLocked(false);
// // //                         localStorage.removeItem("lockUntil");
// // //                         localStorage.removeItem("loginAttempts");
// // //                         setAttempts(0);
// // //                         return 0;
// // //                     }
// // //                     return prev - 1000;
// // //                 });
// // //             }, 1000);
// // //         }
// // //         return () => clearInterval(timer);
// // //     }, [isLocked, lockTime]);

// // //     const handleLogin = async (e) => {
// // //         e.preventDefault();

// // //         if (isLocked) {
// // //             setError(`Account temporarily locked. Please try again in ${Math.ceil(lockTime / 1000)} seconds.`);
// // //             return;
// // //         }

// // //         setIsLoading(true);
// // //         setError("");

// // //         // Input validation
// // //         if (!email || !password) {
// // //             setError("Please fill in all fields");
// // //             setIsLoading(false);
// // //             return;
// // //         }

// // //         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // //         if (!emailRegex.test(email)) {
// // //             setError("Please enter a valid email address");
// // //             setIsLoading(false);
// // //             return;
// // //         }

// // //         if (password.length < 8) {
// // //             setError("Password must be at least 8 characters long");
// // //             setIsLoading(false);
// // //             return;
// // //         }

// // //         // Check for special characters in password
// // //         const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
// // //         if (!specialCharRegex.test(password)) {
// // //             setError("Password must contain at least one special character");
// // //             setIsLoading(false);
// // //             return;
// // //         }

// // //         try {
// // //             // Simulate API call
// // //             await new Promise((resolve) => setTimeout(resolve, 1500));

// // //             // Check credentials
// // //             if (email === "admin@pankhudi.com" && password === "Pankhudi@123") {
// // //                 // Reset attempts on successful login
// // //                 localStorage.removeItem("loginAttempts");
// // //                 localStorage.removeItem("lockUntil");

// // //                 // Store auth token with expiration (1 hour)
// // //                 const loginTime = Date.now();
// // //                 const tokenExpiry = loginTime + 60 * 60 * 1000; // 1 hour

// // //                 localStorage.setItem("auth", "true");
// // //                 localStorage.setItem("loginTime", loginTime.toString());
// // //                 localStorage.setItem("tokenExpiry", tokenExpiry.toString());

// // //                 if (rememberMe) {
// // //                     localStorage.setItem("rememberMe", "true");
// // //                     localStorage.setItem("rememberedEmail", email);
// // //                 } else {
// // //                     localStorage.removeItem("rememberMe");
// // //                     localStorage.removeItem("rememberedEmail");
// // //                 }

// // //                 window.location.href = "/";
// // //             } else {
// // //                 // Handle failed attempts
// // //                 const newAttempts = attempts + 1;
// // //                 setAttempts(newAttempts);

// // //                 if (newAttempts >= 3) {
// // //                     // Lock account for 5 minutes after 3 failed attempts
// // //                     const lockUntil = Date.now() + 5 * 60 * 1000;
// // //                     localStorage.setItem("lockUntil", lockUntil.toString());
// // //                     localStorage.setItem("loginAttempts", newAttempts.toString());

// // //                     setIsLocked(true);
// // //                     setLockTime(5 * 60 * 1000);
// // //                     setError("Too many failed attempts. Account locked for 5 minutes.");
// // //                 } else {
// // //                     localStorage.setItem("loginAttempts", newAttempts.toString());
// // //                     setError(`Invalid credentials. ${3 - newAttempts} attempts remaining.`);
// // //                 }
// // //             }
// // //         } catch (err) {
// // //             setError("Login failed. Please try again later.");
// // //         } finally {
// // //             setIsLoading(false);
// // //         }
// // //     };

// // //     const handleForgotPassword = () => {
// // //         alert("Please contact system administrator to reset your password.");
// // //     };

// // //     // Format time for display
// // //     const formatTime = (ms) => {
// // //         const seconds = Math.ceil(ms / 1000);
// // //         return `${seconds} seconds`;
// // //     };

// // //     return (
// // //         <div className="login-container">
// // //             <div className="background-animation">
// // //                 <div className="floating-icon icon-1"><i className="fas fa-dove"></i></div>
// // //                 <div className="floating-icon icon-2"><i className="fas fa-heart"></i></div>
// // //                 <div className="floating-icon icon-3"><i className="fas fa-star"></i></div>
// // //                 <div className="floating-icon icon-4"><i className="fas fa-leaf"></i></div>
// // //             </div>

// // //             <div className="website-header">
// // //                 <div className="logo-container">
// // //                     <i className="fas fa-dove logo-icon"></i>
// // //                     <h1 className="website-name">Pankhudi</h1>
// // //                 </div>
// // //                 <p className="website-tagline">Empowering Dreams, Transforming Lives</p>
// // //             </div>

// // //             <div className="login-card">
// // //                 <div className="card-shine-effect"></div>

// // //                 <div className="login-header">
// // //                     <div className="login-logo">
// // //                         <i className="fas fa-shield-alt"></i>
// // //                     </div>
// // //                     <h2>Pankhudi Admin Portal</h2>
// // //                     <p>Sign in to your administrator account</p>
// // //                 </div>

// // //                 <form className="login-form" onSubmit={handleLogin}>
// // //                     {error && (
// // //                         <div className={`error-message ${isLocked ? 'locked' : ''}`}>
// // //                             <i className="fas fa-exclamation-circle"></i>
// // //                             {error}
// // //                             {isLocked && <div className="countdown">Resets in: <span>{formatTime(lockTime)}</span></div>}
// // //                         </div>
// // //                     )}

// // //                     <div className="input-group">
// // //                         <i className="fas fa-envelope input-i"></i>
// // //                         <input
// // //                             type="email"
// // //                             placeholder="Email address"
// // //                             value={email}
// // //                             onChange={(e) => setEmail(e.target.value)}
// // //                             required
// // //                             disabled={isLoading || isLocked}
// // //                             autoComplete="email"
// // //                             className={email ? 'has-value' : ''}
// // //                         />
// // //                         <div className="input-underline"></div>
// // //                     </div>

// // //                     <div className="input-group">
// // //                         <i className="fas fa-lock input-i"></i>
// // //                         <input
// // //                             type={showPassword ? "text" : "password"}
// // //                             placeholder="Password"
// // //                             value={password}
// // //                             onChange={(e) => setPassword(e.target.value)}
// // //                             required
// // //                             disabled={isLoading || isLocked}
// // //                             autoComplete="current-password"
// // //                             className={password ? 'has-value' : ''}
// // //                         />
// // //                         <div className="input-underline"></div>
// // //                         <button
// // //                             type="button"
// // //                             className="password-toggle"
// // //                             onClick={() => setShowPassword(!showPassword)}
// // //                             disabled={isLoading || isLocked}
// // //                         >
// // //                             <i
// // //                                 className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
// // //                             ></i>
// // //                         </button>
// // //                     </div>

// // //                     <div className="login-options">
// // //                         <label className="remember-me">
// // //                             <div className="checkbox-container">
// // //                                 <input
// // //                                     type="checkbox"
// // //                                     checked={rememberMe}
// // //                                     onChange={(e) => setRememberMe(e.target.checked)}
// // //                                     disabled={isLoading || isLocked}
// // //                                 />
// // //                                 <span className="checkmark"></span>
// // //                             </div>
// // //                             <span>Remember me</span>
// // //                         </label>

// // //                         <button
// // //                             type="button"
// // //                             className="forgot-password"
// // //                             onClick={handleForgotPassword}
// // //                             disabled={isLoading || isLocked}
// // //                         >
// // //                             Forgot password?
// // //                         </button>
// // //                     </div>

// // //                     <button
// // //                         type="submit"
// // //                         className={`login-button ${isLoading ? 'loading' : ''} ${isLocked ? 'locked' : ''}`}
// // //                         disabled={isLoading || isLocked}
// // //                     >
// // //                         {isLoading ? (
// // //                             <>
// // //                                 <i className="fas fa-spinner fa-spin"></i>
// // //                                 Signing in...
// // //                             </>
// // //                         ) : isLocked ? (
// // //                             <>
// // //                                 <i className="fas fa-lock"></i>
// // //                                 Account Locked
// // //                             </>
// // //                         ) : (
// // //                             <>
// // //                                 <i className="fas fa-sign-in-alt"></i>
// // //                                 Sign In
// // //                             </>
// // //                         )}
// // //                     </button>
// // //                 </form>

// // //                 <div className="login-footer">
// // //                     <p><i className="fas fa-shield-alt"></i> Secure access • Encrypted connection</p>
// // //                     <div className="security-badge">
// // //                         <i className="fas fa-lock"></i>
// // //                         <span>SSL Secured</span>
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             <div className="website-footer">
// // //                 <p>&copy; 2025 Pankhudi Foundation. All rights reserved.</p>
// // //                 <div className="footer-links">
// // //                     <a href="#privacy">Privacy Policy</a>
// // //                     <span>•</span>
// // //                     <a href="#terms">Terms of Service</a>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // export default Login;















// // // src/pages/Admin/Login.jsx
// // import React, { useState, useEffect } from "react";
// // import { useNavigate, Link } from "react-router-dom";
// // import api from "../../utils/api";
// // import "./Login.css";

// // function Login() {
// //     const navigate = useNavigate();
// //     const [email, setEmail] = useState("");
// //     const [password, setPassword] = useState("");
// //     const [showPassword, setShowPassword] = useState(false);
// //     const [rememberMe, setRememberMe] = useState(false);
// //     const [isLoading, setIsLoading] = useState(false);
// //     const [error, setError] = useState("");
// //     const [attempts, setAttempts] = useState(0);
// //     const [isLocked, setIsLocked] = useState(false);
// //     const [lockTime, setLockTime] = useState(0);
// //     const [show2FA, setShow2FA] = useState(false);
// //     const [twoFACode, setTwoFACode] = useState("");
// //     const [tempToken, setTempToken] = useState("");

// //     // Check if already logged in
// //     useEffect(() => {
// //         const checkAuth = async () => {
// //             const token = localStorage.getItem("adminToken");
// //             if (token) {
// //                 try {
// //                     const response = await api.get("/admin/verify");
// //                     if (response.data.valid) {
// //                         navigate("/admin/dashboard");
// //                     }
// //                 } catch (err) {
// //                     // Token invalid, clear storage
// //                     localStorage.removeItem("adminToken");
// //                     localStorage.removeItem("adminData");
// //                 }
// //             }
// //         };
// //         checkAuth();
// //     }, [navigate]);

// //     // Check if account is locked on component mount
// //     useEffect(() => {
// //         const lockUntil = localStorage.getItem("adminLockUntil");
// //         if (lockUntil && parseInt(lockUntil) > Date.now()) {
// //             setIsLocked(true);
// //             setLockTime(parseInt(lockUntil) - Date.now());
// //         }

// //         // Check for remember me
// //         const remembered = localStorage.getItem("adminRememberMe") === "true";
// //         if (remembered) {
// //             setRememberMe(true);
// //             const savedEmail = localStorage.getItem("adminRememberedEmail");
// //             if (savedEmail) setEmail(savedEmail);
// //         }
// //     }, []);

// //     // Countdown timer for lock
// //     useEffect(() => {
// //         let timer;
// //         if (isLocked && lockTime > 0) {
// //             timer = setInterval(() => {
// //                 setLockTime(prev => {
// //                     if (prev <= 1000) {
// //                         setIsLocked(false);
// //                         localStorage.removeItem("adminLockUntil");
// //                         localStorage.removeItem("adminLoginAttempts");
// //                         setAttempts(0);
// //                         return 0;
// //                     }
// //                     return prev - 1000;
// //                 });
// //             }, 1000);
// //         }
// //         return () => clearInterval(timer);
// //     }, [isLocked, lockTime]);

// //     const handleLogin = async (e) => {
// //         e.preventDefault();

// //         if (isLocked) {
// //             setError(`Account temporarily locked. Please try again in ${Math.ceil(lockTime / 1000)} seconds.`);
// //             return;
// //         }

// //         if (show2FA) {
// //             await handle2FAVerification();
// //             return;
// //         }

// //         setIsLoading(true);
// //         setError("");

// //         // Input validation
// //         if (!email || !password) {
// //             setError("Please fill in all fields");
// //             setIsLoading(false);
// //             return;
// //         }

// //         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //         if (!emailRegex.test(email)) {
// //             setError("Please enter a valid email address");
// //             setIsLoading(false);
// //             return;
// //         }

// //         try {
// //             // Call login API
// //             const response = await api.post("/admin/login", {
// //                 email,
// //                 password,
// //                 rememberMe
// //             });

// //             if (response.data.success) {
// //                 // Check if 2FA is required
// //                 if (response.data.requires2FA) {
// //                     setTempToken(response.data.tempToken);
// //                     setShow2FA(true);
// //                     setIsLoading(false);
// //                     return;
// //                 }

// //                 // Login successful
// //                 handleSuccessfulLogin(response.data);
// //             }
// //         } catch (err) {
// //             console.error("Login error:", err);

// //             // Handle failed attempts
// //             const newAttempts = attempts + 1;
// //             setAttempts(newAttempts);

// //             if (newAttempts >= 3) {
// //                 // Lock account for 5 minutes after 3 failed attempts
// //                 const lockUntil = Date.now() + 5 * 60 * 1000;
// //                 localStorage.setItem("adminLockUntil", lockUntil.toString());
// //                 localStorage.setItem("adminLoginAttempts", newAttempts.toString());

// //                 setIsLocked(true);
// //                 setLockTime(5 * 60 * 1000);
// //                 setError("Too many failed attempts. Account locked for 5 minutes.");
// //             } else {
// //                 localStorage.setItem("adminLoginAttempts", newAttempts.toString());

// //                 const errorMessage = err.response?.data?.message || "Invalid credentials";
// //                 setError(`${errorMessage}. ${3 - newAttempts} attempts remaining.`);
// //             }
// //         } finally {
// //             if (!show2FA) {
// //                 setIsLoading(false);
// //             }
// //         }
// //     };

// //     const handle2FAVerification = async () => {
// //         if (!twoFACode || twoFACode.length !== 6) {
// //             setError("Please enter a valid 6-digit code");
// //             return;
// //         }

// //         setIsLoading(true);
// //         setError("");

// //         try {
// //             const response = await api.post("/admin/verify-2fa", {
// //                 tempToken,
// //                 code: twoFACode
// //             });

// //             if (response.data.success) {
// //                 handleSuccessfulLogin(response.data);
// //             }
// //         } catch (err) {
// //             setError(err.response?.data?.message || "Invalid verification code");
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     const handleSuccessfulLogin = (data) => {
// //         // Store token and user data
// //         localStorage.setItem("adminToken", data.token);
// //         localStorage.setItem("adminData", JSON.stringify(data.user));

// //         // Set token expiry (1 hour)
// //         const tokenExpiry = Date.now() + 60 * 60 * 1000;
// //         localStorage.setItem("adminTokenExpiry", tokenExpiry.toString());

// //         if (rememberMe) {
// //             localStorage.setItem("adminRememberMe", "true");
// //             localStorage.setItem("adminRememberedEmail", email);
// //         } else {
// //             localStorage.removeItem("adminRememberMe");
// //             localStorage.removeItem("adminRememberedEmail");
// //         }

// //         // Reset attempts on successful login
// //         localStorage.removeItem("adminLoginAttempts");
// //         localStorage.removeItem("adminLockUntil");

// //         // Redirect to dashboard
// //         navigate("/admin/dashboard");
// //     };

// //     const handleForgotPassword = async () => {
// //         if (!email) {
// //             setError("Please enter your email address first");
// //             return;
// //         }

// //         setIsLoading(true);
// //         try {
// //             await api.post("/admin/forgot-password", { email });
// //             alert("Password reset instructions have been sent to your email.");
// //         } catch (err) {
// //             setError(err.response?.data?.message || "Failed to send reset instructions");
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     const formatTime = (ms) => {
// //         const seconds = Math.ceil(ms / 1000);
// //         const minutes = Math.floor(seconds / 60);
// //         const remainingSeconds = seconds % 60;

// //         if (minutes > 0) {
// //             return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
// //         }
// //         return `${seconds} second${seconds > 1 ? 's' : ''}`;
// //     };

// //     return (
// //         <div className="login-container">
// //             <div className="background-animation">
// //                 <div className="floating-icon icon-1"><i className="fas fa-dove"></i></div>
// //                 <div className="floating-icon icon-2"><i className="fas fa-heart"></i></div>
// //                 <div className="floating-icon icon-3"><i className="fas fa-star"></i></div>
// //                 <div className="floating-icon icon-4"><i className="fas fa-leaf"></i></div>
// //             </div>

// //             <div className="website-header">
// //                 <div className="logo-container">
// //                     <i className="fas fa-dove logo-icon"></i>
// //                     <h1 className="website-name">Pankhudi</h1>
// //                 </div>
// //                 <p className="website-tagline">Empowering Dreams, Transforming Lives</p>
// //             </div>

// //             <div className="login-card">
// //                 <div className="card-shine-effect"></div>

// //                 <div className="login-header">
// //                     <div className="login-logo">
// //                         <i className="fas fa-shield-alt"></i>
// //                     </div>
// //                     <h2>Pankhudi Admin Portal</h2>
// //                     <p>{show2FA ? "Enter 2FA Code" : "Sign in to your administrator account"}</p>
// //                 </div>

// //                 <form className="login-form" onSubmit={handleLogin}>
// //                     {error && (
// //                         <div className={`error-message ${isLocked ? 'locked' : ''}`}>
// //                             <i className="fas fa-exclamation-circle"></i>
// //                             {error}
// //                             {isLocked && <div className="countdown">Resets in: <span>{formatTime(lockTime)}</span></div>}
// //                         </div>
// //                     )}

// //                     {!show2FA ? (
// //                         <>
// //                             <div className="input-group">
// //                                 <i className="fas fa-envelope input-i"></i>
// //                                 <input
// //                                     type="email"
// //                                     placeholder="Email address"
// //                                     value={email}
// //                                     onChange={(e) => setEmail(e.target.value)}
// //                                     required
// //                                     disabled={isLoading || isLocked}
// //                                     autoComplete="email"
// //                                     className={email ? 'has-value' : ''}
// //                                 />
// //                                 <div className="input-underline"></div>
// //                             </div>

// //                             <div className="input-group">
// //                                 <i className="fas fa-lock input-i"></i>
// //                                 <input
// //                                     type={showPassword ? "text" : "password"}
// //                                     placeholder="Password"
// //                                     value={password}
// //                                     onChange={(e) => setPassword(e.target.value)}
// //                                     required
// //                                     disabled={isLoading || isLocked}
// //                                     autoComplete="current-password"
// //                                     className={password ? 'has-value' : ''}
// //                                 />
// //                                 <div className="input-underline"></div>
// //                                 <button
// //                                     type="button"
// //                                     className="password-toggle"
// //                                     onClick={() => setShowPassword(!showPassword)}
// //                                     disabled={isLoading || isLocked}
// //                                 >
// //                                     <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
// //                                 </button>
// //                             </div>

// //                             <div className="login-options">
// //                                 <label className="remember-me">
// //                                     <div className="checkbox-container">
// //                                         <input
// //                                             type="checkbox"
// //                                             checked={rememberMe}
// //                                             onChange={(e) => setRememberMe(e.target.checked)}
// //                                             disabled={isLoading || isLocked}
// //                                         />
// //                                         <span className="checkmark"></span>
// //                                     </div>
// //                                     <span>Remember me</span>
// //                                 </label>

// //                                 <button
// //                                     type="button"
// //                                     className="forgot-password"
// //                                     onClick={handleForgotPassword}
// //                                     disabled={isLoading || isLocked || !email}
// //                                 >
// //                                     Forgot password?
// //                                 </button>
// //                             </div>
// //                         </>
// //                     ) : (
// //                         <>
// //                             <div className="input-group">
// //                                 <i className="fas fa-mobile-alt input-i"></i>
// //                                 <input
// //                                     type="text"
// //                                     placeholder="Enter 6-digit verification code"
// //                                     value={twoFACode}
// //                                     onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
// //                                     required
// //                                     disabled={isLoading}
// //                                     maxLength="6"
// //                                     autoFocus
// //                                 />
// //                                 <div className="input-underline"></div>
// //                             </div>
// //                             <div className="twofa-info">
// //                                 <i className="fas fa-info-circle"></i>
// //                                 <span>Enter the verification code from your authenticator app</span>
// //                             </div>
// //                         </>
// //                     )}

// //                     <button
// //                         type="submit"
// //                         className={`login-button ${isLoading ? 'loading' : ''} ${isLocked ? 'locked' : ''}`}
// //                         disabled={isLoading || isLocked}
// //                     >
// //                         {isLoading ? (
// //                             <>
// //                                 <i className="fas fa-spinner fa-spin"></i>
// //                                 {show2FA ? "Verifying..." : "Signing in..."}
// //                             </>
// //                         ) : isLocked ? (
// //                             <>
// //                                 <i className="fas fa-lock"></i>
// //                                 Account Locked
// //                             </>
// //                         ) : show2FA ? (
// //                             <>
// //                                 <i className="fas fa-check-circle"></i>
// //                                 Verify & Login
// //                             </>
// //                         ) : (
// //                             <>
// //                                 <i className="fas fa-sign-in-alt"></i>
// //                                 Sign In
// //                             </>
// //                         )}
// //                     </button>

// //                     {show2FA && (
// //                         <button
// //                             type="button"
// //                             className="back-to-login"
// //                             onClick={() => {
// //                                 setShow2FA(false);
// //                                 setTwoFACode("");
// //                                 setTempToken("");
// //                                 setError("");
// //                             }}
// //                         >
// //                             <i className="fas fa-arrow-left"></i>
// //                             Back to login
// //                         </button>
// //                     )}
// //                 </form>

// //                 <div className="login-footer">
// //                     <p><i className="fas fa-shield-alt"></i> Secure access • Encrypted connection</p>
// //                     <div className="security-badge">
// //                         <i className="fas fa-lock"></i>
// //                         <span>SSL Secured</span>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="website-footer">
// //                 <p>&copy; 2025 Pankhudi Foundation. All rights reserved.</p>
// //                 <div className="footer-links">
// //                     <a href="/privacy">Privacy Policy</a>
// //                     <span>•</span>
// //                     <a href="/terms">Terms of Service</a>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }

// // export default Login;





























// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/api";
// import "./Login.css";

// function Login({ onLogin }) {
//     const navigate = useNavigate();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     // Check if already logged in
//     useEffect(() => {
//         const token = localStorage.getItem("adminToken") || localStorage.getItem("auth");
//         if (token) {
//             navigate("/dashboard");
//             if (onLogin) onLogin();
//         }
//     }, [navigate, onLogin]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");

//         // Validation
//         if (!email || !password) {
//             setError("Please fill in all fields");
//             setLoading(false);
//             return;
//         }

//         try {
//             // Try admin login first
//             const response = await api.post("/admin/login", { email, password });

//             if (response.data.success) {
//                 // Store admin token
//                 localStorage.setItem("adminToken", response.data.token);
//                 localStorage.setItem("adminData", JSON.stringify(response.data.user));
//                 localStorage.setItem("auth", "true");
//                 localStorage.setItem("loginTime", Date.now().toString());

//                 if (onLogin) onLogin();
//                 navigate("/dashboard");
//             }
//         } catch (err) {
//             console.error("Login error:", err);

//             // If admin login fails, try regular login (for backward compatibility)
//             if (email === "admin@pankhudi.com" && password === "Pankhudi@123") {
//                 // Demo admin login
//                 localStorage.setItem("adminToken", "demo-token");
//                 localStorage.setItem("adminData", JSON.stringify({ name: "Admin User", email: "admin@pankhudi.com", is_admin: 1 }));
//                 localStorage.setItem("auth", "true");
//                 if (onLogin) onLogin();
//                 navigate("/dashboard");
//             } else {
//                 setError(err.response?.data?.message || "Invalid email or password");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="login-container">
//             <div className="login-card">
//                 <div className="login-header">
//                     <h2>Admin Login</h2>
//                     <p>Welcome back! Please login to your account</p>
//                 </div>

//                 {error && <div className="error-message">{error}</div>}

//                 <form onSubmit={handleSubmit}>
//                     <div className="input-group">
//                         <label>Email Address</label>
//                         <input
//                             type="email"
//                             placeholder="admin@pankhudi.com"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="input-group">
//                         <label>Password</label>
//                         <input
//                             type="password"
//                             placeholder="Enter your password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <button type="submit" disabled={loading}>
//                         {loading ? "Logging in..." : "Login"}
//                     </button>
//                 </form>

//                 <div className="login-footer">
//                     <p>Demo Credentials:</p>
//                     <p>Email: admin@pankhudi.com</p>
//                     <p>Password: Pankhudi@123</p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Login;


























// src/pages/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./Login.css";

function Login({ onLogin }) {
    const navigate = useNavigate();

    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTime, setLockTime] = useState(0);

    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetToken, setResetToken] = useState("");

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            navigate("/dashboard");
            if (onLogin) onLogin();
        }
    }, [navigate, onLogin]);

    // Check if account is locked
    useEffect(() => {
        const lockUntil = localStorage.getItem("adminLockUntil");
        if (lockUntil && parseInt(lockUntil) > Date.now()) {
            setIsLocked(true);
            setLockTime(parseInt(lockUntil) - Date.now());
        }

        // Check for remember me
        const remembered = localStorage.getItem("adminRememberMe") === "true";
        if (remembered) {
            setRememberMe(true);
            const savedEmail = localStorage.getItem("adminRememberedEmail");
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
                        localStorage.removeItem("adminLockUntil");
                        localStorage.removeItem("adminLoginAttempts");
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
            setError(`Account locked. Try again in ${Math.ceil(lockTime / 1000)} seconds.`);
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

        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password)) {
            setError("Password must contain at least one special character");
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post("/admin/login", { email, password });

            if (response.data.success) {
                // Reset attempts on successful login
                localStorage.removeItem("adminLoginAttempts");
                localStorage.removeItem("adminLockUntil");

                // Store auth token
                const loginTime = Date.now();
                const tokenExpiry = rememberMe ? loginTime + 7 * 24 * 60 * 60 * 1000 : loginTime + 60 * 60 * 1000;

                localStorage.setItem("adminToken", response.data.token);
                localStorage.setItem("adminData", JSON.stringify(response.data.user));
                localStorage.setItem("auth", "true");
                localStorage.setItem("loginTime", loginTime.toString());
                localStorage.setItem("tokenExpiry", tokenExpiry.toString());

                if (rememberMe) {
                    localStorage.setItem("adminRememberMe", "true");
                    localStorage.setItem("adminRememberedEmail", email);
                } else {
                    localStorage.removeItem("adminRememberMe");
                    localStorage.removeItem("adminRememberedEmail");
                }

                if (onLogin) onLogin();
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);

            // Handle failed attempts
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 3) {
                const lockUntil = Date.now() + 5 * 60 * 1000;
                localStorage.setItem("adminLockUntil", lockUntil.toString());
                localStorage.setItem("adminLoginAttempts", newAttempts.toString());
                setIsLocked(true);
                setLockTime(5 * 60 * 1000);
                setError("Too many failed attempts. Account locked for 5 minutes.");
            } else {
                localStorage.setItem("adminLoginAttempts", newAttempts.toString());
                setError(`Invalid credentials. ${3 - newAttempts} attempts remaining.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Forgot Password Functions
    const handleSendOTP = async () => {
        if (!resetEmail) {
            setError("Please enter your email address");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/admin/forgot-password", { email: resetEmail });

            if (response.data.success) {
                setOtpSent(true);
                setError("");
                alert("OTP has been sent to your email address. Please check your inbox.");
            } else {
                setError(response.data.message || "Failed to send OTP");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/admin/verify-otp", {
                email: resetEmail,
                otp: otp
            });

            if (response.data.success) {
                setResetToken(response.data.resetToken);
                setShowResetPassword(true);
                setError("");
            } else {
                setError(response.data.message || "Invalid OTP");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(newPassword)) {
            setError("Password must contain at least one special character");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/admin/reset-password", {
                email: resetEmail,
                token: resetToken,
                newPassword: newPassword
            });

            if (response.data.success) {
                alert("Password reset successful! Please login with your new password.");
                setShowForgotPassword(false);
                setOtpSent(false);
                setShowResetPassword(false);
                setResetEmail("");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setResetToken("");
            } else {
                setError(response.data.message || "Failed to reset password");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setOtpSent(false);
        setShowResetPassword(false);
        setResetEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
    };

    const formatTime = (ms) => {
        const seconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
        }
        return `${seconds} second${seconds > 1 ? 's' : ''}`;
    };

    return (
        <>
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
                                {isLocked && <div className="countdown">Resets in: <span>{formatTime(lockTime)}</span></div>}
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
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
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
                                onClick={() => setShowForgotPassword(true)}
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

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal-overlay" onClick={closeForgotPassword}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button className="modal-close" onClick={closeForgotPassword}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {!otpSent ? (
                                <>
                                    <p>Enter your email address to receive a password reset OTP.</p>
                                    <div className="input-group">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {error && <div className="error-text">{error}</div>}
                                    <button
                                        className="send-otp-btn"
                                        onClick={handleSendOTP}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Sending..." : "Send OTP"}
                                    </button>
                                </>
                            ) : !showResetPassword ? (
                                <>
                                    <p>Enter the 6-digit OTP sent to your email.</p>
                                    <div className="input-group">
                                        <i className="fas fa-key"></i>
                                        <input
                                            type="text"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            maxLength="6"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {error && <div className="error-text">{error}</div>}
                                    <button
                                        className="verify-otp-btn"
                                        onClick={handleVerifyOTP}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Verifying..." : "Verify OTP"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>Enter your new password.</p>
                                    <div className="input-group">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            placeholder="New Password (min 8 chars with special char)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {error && <div className="error-text">{error}</div>}
                                    <button
                                        className="reset-password-btn"
                                        onClick={handleResetPassword}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Resetting..." : "Reset Password"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Login;