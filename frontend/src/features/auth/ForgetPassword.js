import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { memo, useState, useCallback } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import GoogleLoginButton from "./GoogleLoginButton";
import { forgotPassword } from "../../api/auth/LoginController";


// Separate PasswordInput to prevent unnecessary re-renders
const PasswordInput = memo(
  ({ label, name, value, onChange, onBlur, isInvalid, show, toggleShow }) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <InputGroup>
        <Form.Control
          type={show ? "text" : "password"}
          placeholder={`Enter ${label.toLowerCase()}`}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          isInvalid={!!isInvalid}
        />
        <Button variant="outline-secondary" onClick={toggleShow} type="button">
          {show ? <EyeSlash /> : <Eye />}
        </Button>
        <Form.Control.Feedback type="invalid">
          {isInvalid}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  )
);

const ForgetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const navigate = useNavigate();

  const { state } = useLocation();
  const mutation = useMutation({
    mutationFn: ({ userId, password, rePassword }) => {
      return forgotPassword(userId, password, rePassword);
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Change password successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Change password failed!",
        timer: 3000,
        showConfirmButton: false,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      userId: state.user?.id,
      password: "",
      rePassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
          "Password must include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
        ),
      rePassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowRePassword = useCallback(() => {
    setShowRePassword((prev) => !prev);
  }, []);

  return (
    <Container
      className="shadow p-4 rounded bg-white"
      style={{ maxWidth: "400px" }}
    >
      <h2 className="text-center">Reset Password</h2>
      <Form onSubmit={formik.handleSubmit}>
        <PasswordInput
          label="Password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.password && formik.errors.password}
          show={showPassword}
          toggleShow={toggleShowPassword}
        />
        <PasswordInput
          label="Confirm Password"
          name="rePassword"
          value={formik.values.rePassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.rePassword && formik.errors.rePassword}
          show={showRePassword}
          toggleShow={toggleShowRePassword}
        />
        <Button type="submit" variant="warning" className="w-100">
          Reset Password
        </Button>
      </Form>
      <GoogleLoginButton />
    </Container>
  );
};

export default memo(ForgetPassword);