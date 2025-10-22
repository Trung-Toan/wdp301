// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ element, roles = [] }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (roles.length && !roles.includes(user.role))
        return <Navigate to="/unauthorized" replace />;
    return element;
}
