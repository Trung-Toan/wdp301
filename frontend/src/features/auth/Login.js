import { memo, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Container, Form, InputGroup, Spinner } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  setSessionStorage,
} from "../../hooks/useSessionStorage";
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
        "patient.id": patient?.id
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
        patientId: patient?._id || patient?.id
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
      }
      else if (account.role === "ADMIN_CLINIC") {
        navigate("/clinic-admin/dashboard");
      }
      else if (account.role === "ASSISTANT") {
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
    <div className="login-wrapper d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container
        className="p-4 bg-white rounded-4 shadow-lg"
        style={{ maxWidth: "420px" }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary" style={{ color: "#45c3d2" }}>
            Đăng nhập hệ thống
          </h3>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Đặt lịch khám nhanh chóng và thuận tiện
          </p>
        </div>

        <Form onSubmit={formik.handleSubmit}>
          {/* Email / Username */}
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label className="fw-semibold text-secondary">
              Email hoặc Tên đăng nhập
            </Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Nhập email hoặc username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={!!formik.errors.username && formik.touched.username}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="fw-semibold text-secondary">
              Mật khẩu
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={!!formik.errors.password && formik.touched.password}
              />
              <Button
                variant="outline-secondary"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </Button>
              <Form.Control.Feedback type="invalid">
                {formik.errors.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Nút đăng nhập */}
          <div className="d-grid mt-4">
            <Button
              type="submit"
              disabled={mutation.isLoading}
              style={{
                backgroundColor: "#45c3d2",
                border: "none",
                fontWeight: "bold",
              }}
              className="py-2"
            >
              {mutation.isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </div>
        </Form>

        {/* Google login */}
        <div className="mt-4">
          <GoogleLoginButton />
        </div>

        {/* Links */}
        <p
          className="text-center mt-4 mb-0 text-secondary"
          style={{ fontSize: "13px" }}
        >
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary fw-semibold">
            Đăng ký ngay
          </Link>
          <br />
          Quên mật khẩu?{" "}
          <Link to="/forgot_password" className="text-primary fw-semibold">
            Khôi phục tài khoản
          </Link>
        </p>
      </Container>
    </div>
  );
};

export default memo(Login);
