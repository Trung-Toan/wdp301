import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize token from sessionStorage
    const [token, setToken] = useState(() => {
        return sessionStorage.getItem("access_token") || 
               sessionStorage.getItem("token") || 
               null;
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    // Restore user from token and sessionStorage on mount
    useEffect(() => {
        // Get token from both possible locations
        const storedToken = sessionStorage.getItem("access_token") || 
                          sessionStorage.getItem("token");
        
        if (!storedToken) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        try {
            // Get user info from sessionStorage (more complete data)
            const storedAccount = sessionStorage.getItem("account");
            const storedUser = sessionStorage.getItem("user");
            const storedPatient = sessionStorage.getItem("patient");

            // Decode token to get basic info
            const decoded = jwtDecode(storedToken);

            // Check if token is expired
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                console.error("❌ Token expired");
                sessionStorage.clear();
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }

            if (storedAccount) {
                const account = JSON.parse(storedAccount);
                const userData = storedUser ? JSON.parse(storedUser) : null;
                const patient = storedPatient ? JSON.parse(storedPatient) : null;

                // Reconstruct complete user object
                setUser({
                    id: decoded.sub,
                    email: account.email || decoded.email,
                    role: decoded.role,
                    name: userData?.full_name || account.email,
                    email_verified: decoded.email_verified,
                    phone_number: account.phone_number,
                    status: account.status,
                    _id: account._id,
                    ...(userData && { ...userData }),
                    ...(patient && { patient })
                });
            } else {
                // Fallback: decode from token only
                setUser({
                    id: decoded.sub,
                    role: decoded.role,
                    email_verified: decoded.email_verified,
                    email: decoded.email
                });
            }

            // Update token state
            setToken(storedToken);
        } catch (err) {
            console.error("❌ Invalid token:", err);
            sessionStorage.clear();
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []); // Only run on mount

    // Update user when token changes (from login)
    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        // If token exists, restore user info
        try {
            const storedAccount = sessionStorage.getItem("account");
            const storedUser = sessionStorage.getItem("user");
            const storedPatient = sessionStorage.getItem("patient");
            const decoded = jwtDecode(token);

            if (storedAccount) {
                const account = JSON.parse(storedAccount);
                const userData = storedUser ? JSON.parse(storedUser) : null;
                const patient = storedPatient ? JSON.parse(storedPatient) : null;

                setUser({
                    id: decoded.sub,
                    email: account.email || decoded.email,
                    role: decoded.role,
                    name: userData?.full_name || account.email,
                    email_verified: decoded.email_verified,
                    phone_number: account.phone_number,
                    status: account.status,
                    _id: account._id,
                    ...(userData && { ...userData }),
                    ...(patient && { patient })
                });
            } else {
                setUser({
                    id: decoded.sub,
                    role: decoded.role,
                    email_verified: decoded.email_verified,
                    email: decoded.email
                });
            }
        } catch (err) {
            console.error("❌ Error updating user from token:", err);
        }
    }, [token]);

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
        sessionStorage.removeItem("refreshToken");
        setToken(null);
        setUser(null);
        setLoading(false);
        // Trigger re-render of components using sessionStorage
        window.dispatchEvent(new Event("session-update"));
    }, []);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
