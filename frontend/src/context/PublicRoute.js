import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PublicRoute = ({ children }) => {
    const { token } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (token || savedToken) {
            setHasToken(true);
        } else {
            setHasToken(false);
        }
        setIsChecking(false);
    }, [token]);
    if (isChecking) return null;
    if (hasToken) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default PublicRoute;
