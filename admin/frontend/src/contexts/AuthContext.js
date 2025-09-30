import React, { createContext, useContext, useState, useEffect } from 'react';


const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            verifyToken(token);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await mockApi.verifyToken(token);
            if (response.success) {
                setUser(response.user);
            } else {
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('adminToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await mockApi.login(email, password);
            if (response.success) {
                localStorage.setItem('adminToken', response.token);
                setUser(response.user);
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContext;