// src/routes/modules/user.routes.jsx
import { Route } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import HomePage from "../../features/home/pages/HomePage";
import Register from "../../features/auth/RegisterForm";
import Login from "../../features/auth/Login";
import ForgotPassword from "../../features/auth/ForgotPassword";
import ResetPassword from "../../features/auth/ResetPassword";

export const userRoutes = (
    <Route path="/" element={<UserLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot_password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
    </Route>
);
