import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../components/authentication/Login";
import FindEmail from "../components/authentication/FindEmail";
import ForgetPassword from "../components/authentication/ForgetPassword";
import Home from "../components/home/Home";
import IndexUser from "../components/index/IndexUser";

const RouterUser = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route index element={<IndexUser />} />
        <Route path="login" element={<Login />} />
        <Route path="find_email" element={<FindEmail />} />
        <Route path="forgot_password" element={<ForgetPassword />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterUser);