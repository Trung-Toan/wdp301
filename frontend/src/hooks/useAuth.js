import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("access_token") || null);
    const [user, setUser] = useState(null);

    const login = useCallback((accessToken) => {
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("token", accessToken); // Also set "token" key
        setToken(accessToken);
        // Trigger re-render of components using sessionStorage
        window.dispatchEvent(new Event("session-update"));
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("patient");
        sessionStorage.removeItem("account");
        setToken(null);
        setUser(null);
        // Trigger re-render of components using sessionStorage
        window.dispatchEvent(new Event("session-update"));
    }, []);

    useEffect(() => {
        // Get token from both possible locations
        const storedToken = sessionStorage.getItem("access_token") || sessionStorage.getItem("token");
        const currentToken = token || storedToken;

        if (!currentToken) {
            setUser(null);
            return;
        }
        try {
            // Get user info from sessionStorage (more complete data)
            const storedAccount = sessionStorage.getItem("account");
            const storedUser = sessionStorage.getItem("user");
            const storedPatient = sessionStorage.getItem("patient");

            if (storedAccount) {
                const account = JSON.parse(storedAccount);
                const user = storedUser ? JSON.parse(storedUser) : null;
                const patient = storedPatient ? JSON.parse(storedPatient) : null;
                const decoded = jwtDecode(currentToken);

                // Reconstruct complete user object
                setUser({
                    id: decoded.sub,
                    email: account.email || decoded.email,
                    role: decoded.role,
                    name: user?.full_name || account.email,
                    email_verified: decoded.email_verified,
                    phone_number: account.phone_number,
                    status: account.status,
                    _id: account._id,
                    ...(user && { ...user }),
                    ...(patient && { patient })
                });
            } else {
                // Fallback: decode from token only
                const decoded = jwtDecode(currentToken);
                setUser({
                    id: decoded.sub,
                    role: decoded.role,
                    email_verified: decoded.email_verified
                });
            }
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
