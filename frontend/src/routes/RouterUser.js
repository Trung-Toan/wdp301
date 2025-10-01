import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../features/auth/Login";
import FindEmail from "../features/auth/FindEmail";
import ForgetPassword from "../features/auth/ForgetPassword";

// import IndexUser from "../components/Page/IndexUser";
import Register from "../features/auth/Register";
import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home";


const RouterUser = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="find_email" element={<FindEmail />} />
        <Route path="forgot_password" element={<ForgetPassword />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterUser);