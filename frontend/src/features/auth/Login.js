import { memo, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { clearSessionStorage, setSessionStorage } from "../../hooks/useSessionStorage";
import GoogleLoginButton from "./GoogleLoginButton";
import { loginUser } from "../../api/LoginController";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    clearSessionStorage();
  }, [])

  // Sử dụng useMutation để gọi loginUser
  const mutation = useMutation({
    mutationFn: ({ username, password }) => loginUser(username, password),
    onSuccess: (data) => {
      const token = data.token;
      setSessionStorage("token", token);

      const user = data.user;
      setSessionStorage("user", user);
      navigate("/");
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Login failed!",
        timer: 3000,
        showConfirmButton: true,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Username or email cannot be blank")
        .min(3, "Username or email must be between 3 and 255 characters")
        .max(255, "Username or email must be between 3 and 255 characters"),
      password: Yup.string()
        .required("Password cannot be blank")
        .min(6, "Password must be between 6 and 100 characters")
        .max(100, "Password must be between 6 and 100 characters"),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <Container
      className="p-4 bg-white rounded shadow"
      style={{ maxWidth: "400px" }}
    >
      <h2 className="text-center mb-4">Login</h2>
      <Form onSubmit={formik.handleSubmit}>
        {/* Tên đăng nhập */}
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label className="fw-bold">Email</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter email"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={!!formik.errors.username && formik.touched.username}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.username}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Mật khẩu */}
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label className="fw-bold">Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={!!formik.errors.password && formik.touched.password}
            />
            <Button
              variant="outline-secondary"
              onClick={togglePasswordVisibility}
              className="border-left-0"
            >
              {showPassword ? <EyeSlash /> : <Eye />}
            </Button>
            <Form.Control.Feedback type="invalid">
              {formik.errors.password}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        {/* Nút đăng nhập */}
        <Button variant="warning" type="submit" className="w-100">
          Submit
        </Button>
      </Form>

      <p className="text-center mt-3" style={{ fontSize: "12px" }}>
        Do you have account?{" "}
        <Link to="/register" className="text-warning">
          Register account
        </Link>
        <br />
        Forget password ?{" "}
        <Link to="/find_email" className="text-warning">
          Find account
        </Link>
      </p>

      <GoogleLoginButton />
    </Container>
  );
};

export default memo(Login);