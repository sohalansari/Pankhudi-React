// // import React, { createContext, useContext, useState, useEffect } from 'react';


// // const AuthContext = createContext();

// // export function useAuth() {
// //     return useContext(AuthContext);
// // }

// // export function AuthProvider({ children }) {
// //     const [user, setUser] = useState(null);
// //     const [loading, setLoading] = useState(true);

// //     useEffect(() => {
// //         const token = localStorage.getItem('adminToken');
// //         if (token) {
// //             verifyToken(token);
// //         } else {
// //             setLoading(false);
// //         }
// //     }, []);

// //     const verifyToken = async (token) => {
// //         try {
// //             const response = await mockApi.verifyToken(token);
// //             if (response.success) {
// //                 setUser(response.user);
// //             } else {
// //                 localStorage.removeItem('adminToken');
// //             }
// //         } catch (error) {
// //             console.error('Token verification failed:', error);
// //             localStorage.removeItem('adminToken');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const login = async (email, password) => {
// //         try {
// //             const response = await mockApi.login(email, password);
// //             if (response.success) {
// //                 localStorage.setItem('adminToken', response.token);
// //                 setUser(response.user);
// //                 return { success: true };
// //             } else {
// //                 return { success: false, message: response.message };
// //             }
// //         } catch (error) {
// //             console.error('Login error:', error);
// //             return { success: false, message: 'Network error. Please try again.' };
// //         }
// //     };

// //     const logout = () => {
// //         localStorage.removeItem('adminToken');
// //         setUser(null);
// //     };

// //     const value = {
// //         user,
// //         login,
// //         logout,
// //         loading
// //     };

// //     return (
// //         <AuthContext.Provider value={value}>
// //             {!loading && children}
// //         </AuthContext.Provider>
// //     );
// // }

// // export default AuthContext;




// // src/hooks/useAuth.js
// import { useState, useEffect, useCallback } from 'react';
// import { getToken, clearTokens, getUserRole, isAuthenticated, isAdmin, login, logout } from '../utils/api';

// export const useAuth = () => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [isAdminUser, setIsAdminUser] = useState(false);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);

//     // Load user from token
//     const loadUser = useCallback(async () => {
//         const token = getToken();

//         if (!token) {
//             setUser(null);
//             setIsAdminUser(false);
//             setIsLoggedIn(false);
//             setLoading(false);
//             return;
//         }

//         try {
//             // Decode token to get user info
//             const base64Url = token.split('.')[1];
//             const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//             const decoded = JSON.parse(atob(base64));

//             const userData = {
//                 id: decoded.id || decoded.userId,
//                 name: decoded.name,
//                 email: decoded.email,
//                 role: decoded.role
//             };

//             setUser(userData);
//             setIsAdminUser(decoded.role === 'admin');
//             setIsLoggedIn(true);
//         } catch (error) {
//             console.error('Error loading user from token:', error);
//             clearTokens();
//             setUser(null);
//             setIsAdminUser(false);
//             setIsLoggedIn(false);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         loadUser();
//     }, [loadUser]);

//     // Listen for storage changes (when token changes in another tab)
//     useEffect(() => {
//         const handleStorageChange = (e) => {
//             if (e.key === 'token' || e.key === 'adminToken') {
//                 loadUser();
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);
//         return () => window.removeEventListener('storage', handleStorageChange);
//     }, [loadUser]);

//     const handleLogin = async (email, password) => {
//         const response = await login({ email, password });
//         await loadUser(); // Reload user after login
//         return response;
//     };

//     const handleLogout = async () => {
//         await logout();
//         await loadUser(); // Reload user after logout
//     };

//     return {
//         user,
//         loading,
//         isAdmin: isAdminUser,
//         isAuthenticated: isLoggedIn,
//         login: handleLogin,
//         logout: handleLogout,
//         refreshUser: loadUser
//     };
// };