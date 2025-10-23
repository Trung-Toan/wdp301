import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem("access_token") || null);

    const logout = useCallback(() => {
        sessionStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        console.log("token in authprovider:", token);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("decoded user:", decoded);
                setUser({
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role,
                });
            } catch (error) {
                console.error("❌ Invalid token:", error);
                logout();
            }
        } else {
            setUser(null);
        }
    }, [token, logout]);

    const login = useCallback((accessToken) => {
        sessionStorage.setItem("access_token", accessToken);
        setToken(accessToken);
    }, []);

    const isAuthenticated = !!user;

    useEffect(() => {
        console.log("user in authprovider:", user);
    }, [user]);

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
