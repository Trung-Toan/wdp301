import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

// Tạo Auth Context
const AuthContext = createContext(null);

// Provider bao toàn app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, name, role, email, ... }
    const [token, setToken] = useState(localStorage.getItem("access_token") || null);

    const logout = useCallback(() => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    }, []);

    // Khi token thay đổi → decode user info
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role,
                });
            } catch (error) {
                console.error("❌ Invalid token:", error);
                logout(); // Gọi hàm logout đã khai báo ổn định nhờ useCallback
            }
        } else {
            setUser(null);
        }
    }, [token, logout]); // Thêm logout vào dependency array

    const login = useCallback((accessToken) => {
        localStorage.setItem("access_token", accessToken);
        setToken(accessToken);
    }, []);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook useAuth
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
