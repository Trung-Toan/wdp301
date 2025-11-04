// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


export default function ProtectedRoute({ element, roles = [] }) {
    const { user, loading } = useAuth();
    
    // Wait for auth state to be restored
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    
    // If no user after loading, redirect to login
    if (!user) return <Navigate to="/login" replace />;
    
    // Check role permissions
    if (roles.length && !roles.includes(user.role))
        return <Navigate to="/unauthorized" replace />;
    
    return element;
}
