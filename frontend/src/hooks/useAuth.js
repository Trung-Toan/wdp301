import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("access_token") || null);
    const [user, setUser] = useState(null);

    const login = useCallback((accessToken) => {
        sessionStorage.setItem("access_token", accessToken);
        setToken(accessToken);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setUser({
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role,
            });
        } catch (err) {
            console.error("❌ Invalid token:", err);
            logout();
        }
    }, [token, logout]);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
