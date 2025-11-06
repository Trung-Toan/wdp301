import { memo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Container, Form, Spinner } from "react-bootstrap";
import { Eye, EyeSlash, Envelope, Lock, PersonCircle } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { setSessionStorage } from "../../hooks/useSessionStorage";
import GoogleLoginButton from "./GoogleLoginButton";

import "../../styles/Login.css";
import { loginUser } from "../../api/auth/login/LoginController";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/home";
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Gọi API đăng nhập
  const mutation = useMutation({
    mutationFn: ({ username, password }) => loginUser(username, password),
    onSuccess: (response) => {
      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Lỗi đăng nhập",
          text: response.message || "Tên đăng nhập hoặc mật khẩu không đúng!",
          timer: 3000,
          showConfirmButton: true,
        });
        return;
      }

      const token = response.tokens?.accessToken;
      const account = response.account;
      const patient = response.patient;
      const user = response.user;

      console.log("🔍 LOGIN RESPONSE:", {
        account,
        user,
        patient,
        "patient._id": patient?._id,
        "patient.id": patient?.id,
      });

      if (!token || !account) {
        Swal.fire({
          icon: "error",
          title: "Lỗi dữ liệu đăng nhập",
          text: "Token hoặc account không tồn tại.",
          timer: 3000,
          showConfirmButton: true,
        });
        return;
      }

      // Save all data to sessionStorage FIRST
      setSessionStorage("token", token);
      setSessionStorage("account", account);
      setSessionStorage("user", user);
      setSessionStorage("patient", patient);

      console.log("✅ Saved to sessionStorage:", {
        hasAccount: !!account,
        hasUser: !!user,
        hasPatient: !!patient,
        patientId: patient?._id || patient?.id,
      });

      // Then call login to update auth context
      login(token);

      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công!",
        timer: 1500,
        showConfirmButton: false,
      });

      if (account.role === "DOCTOR") {
        navigate("/doctor/dashboard");
      } else if (account.role === "ADMIN_CLINIC") {
        navigate("/admin-clinic/dashboard");
      } else if (account.role === "ASSISTANT") {
        navigate("/assistant/dashboard");
      } else if (account.role === "ADMIN_SYSTEM") {
        navigate("/admin/dashboard");
      }
      else {
        navigate(redirectTo, { replace: true });
      }
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi đăng nhập",
        text: error.message || "Tên đăng nhập hoặc mật khẩu không đúng!",
        timer: 3000,
        showConfirmButton: true,
      });
    },
  });

  // Formik
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Vui lòng nhập email hoặc tên đăng nhập")
        .min(3, "Tối thiểu 3 ký tự")
        .max(255, "Tối đa 255 ký tự"),
      password: Yup.string()
        .required("Vui lòng nhập mật khẩu")
        .min(6, "Tối thiểu 6 ký tự")
        .max(100, "Tối đa 100 ký tự"),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center" style={{ 
      position: "relative",
      minHeight: "600px",
      width: "100%"
    }}>
      {/* Loading Overlay */}
      {mutation.isLoading && (
        <div
          className="loading-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="loading-card" style={{
            padding: "2.5rem",
            borderRadius: "20px",
            backgroundColor: "white",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            minWidth: "280px",
          }}>
            <Spinner 
              animation="border" 
              variant="primary" 
              style={{ 
                width: "3.5rem", 
                height: "3.5rem", 
                borderWidth: "4px",
                color: "#667eea"
              }} 
            />
            <p className="mb-0 fw-semibold" style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "1.1rem",
              textAlign: "center"
            }}>
              Đang xử lý đăng nhập...
            </p>
          </div>
        </div>
      )}

      <Container
        className="login-card p-5"
        style={{ maxWidth: "480px", position: "relative", zIndex: 1, opacity: mutation.isLoading ? 0.6 : 1 }}
      >
        {/* Header with Icon */}
        <div className="login-header text-center">
          <div className="login-icon">
            <PersonCircle size={40} color="white" />
          </div>
          <h1 className="login-title">Chào mừng trở lại</h1>
          <p className="login-subtitle">Đăng nhập để tiếp tục sử dụng dịch vụ</p>
        </div>

        <Form onSubmit={formik.handleSubmit}>
          {/* Email / Username */}
          <div className="form-group-modern">
            <label className="form-label-modern">
              Email hoặc Tên đăng nhập
            </label>
            <div className="input-icon-wrapper">
              <Envelope className="input-icon" size={20} />
              <input
                type="text"
                name="username"
                className={`form-control-modern ${formik.errors.username && formik.touched.username ? 'is-invalid' : ''}`}
                placeholder="Nhập email hoặc username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={mutation.isLoading}
              />
            </div>
            {formik.errors.username && formik.touched.username && (
              <div className="invalid-feedback">{formik.errors.username}</div>
            )}
          </div>

          {/* Password */}
          <div className="form-group-modern">
            <label className="form-label-modern">
              Mật khẩu
            </label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control-modern ${formik.errors.password && formik.touched.password ? 'is-invalid' : ''}`}
                placeholder="Nhập mật khẩu"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={mutation.isLoading}
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                disabled={mutation.isLoading}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10
                }}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formik.errors.password && formik.touched.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          {/* Nút đăng nhập */}
          <div className="d-grid mt-4">
            <button
              type="submit"
              className="btn-login"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                    style={{ borderWidth: "2px" }}
                  />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>
        </Form>

        {/* Divider */}
        <div className="divider">hoặc</div>

        {/* Google login */}
        <div style={{ pointerEvents: mutation.isLoading ? "none" : "auto", opacity: mutation.isLoading ? 0.6 : 1 }}>
          <GoogleLoginButton />
        </div>

        {/* Links */}
        <div className="login-links" style={{ pointerEvents: mutation.isLoading ? "none" : "auto", opacity: mutation.isLoading ? 0.6 : 1 }}>
          <p className="mb-2">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="login-link">
              Đăng ký ngay
            </Link>
          </p>
          <p className="mb-0">
            <Link to="/forgot_password" className="login-link">
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default memo(Login);
