import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { memo, useState, useCallback } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import GoogleLoginButton from "./GoogleLoginButton";
import { forgotPassword } from "../../api/LoginController";

const PasswordInput = memo(
  ({ label, name, value, onChange, onBlur, isInvalid, show, toggleShow }) => (
    <Form.Group className="mb-4">
      <Form.Label className="fw-semibold text-secondary">{label}</Form.Label>
      <InputGroup>
        <Form.Control
          type={show ? "text" : "password"}
          placeholder={`Nhập ${label.toLowerCase()}`}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          isInvalid={!!isInvalid}
          className="py-2"
        />
        <Button
          variant="outline-secondary"
          onClick={toggleShow}
          type="button"
          className="border-start-0 bg-light"
        >
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
    mutationFn: ({ userId, password, rePassword }) =>
      forgotPassword(userId, password, rePassword),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Mật khẩu đã được thay đổi thành công!",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/login");
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể thay đổi mật khẩu. Vui lòng thử lại.",
        timer: 3000,
        showConfirmButton: false,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      userId: state?.user?.id,
      password: "",
      rePassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("Vui lòng nhập mật khẩu")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
          "Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt"
        ),
      rePassword: Yup.string()
        .required("Vui lòng xác nhận mật khẩu")
        .oneOf([Yup.ref("password")], "Mật khẩu không trùng khớp"),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const toggleShowPassword = useCallback(
    () => setShowPassword((prev) => !prev),
    []
  );
  const toggleShowRePassword = useCallback(
    () => setShowRePassword((prev) => !prev),
    []
  );

  return (
    <Container
      className="p-5 shadow rounded bg-white d-flex flex-column justify-content-center align-items-center"
      style={{
        maxWidth: "420px",
        marginTop: "60px",
        borderTop: "4px solid #0d6efd",
      }}
    >
      <h2 className="text-center fw-bold mb-3" style={{ color: "#0d6efd" }}>
        Đặt lại mật khẩu
      </h2>
      <p className="text-center text-muted mb-4" style={{ fontSize: "14px" }}>
        Nhập mật khẩu mới để hoàn tất quá trình khôi phục tài khoản của bạn.
      </p>

      <Form onSubmit={formik.handleSubmit} className="w-100">
        <PasswordInput
          label="Mật khẩu mới"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.password && formik.errors.password}
          show={showPassword}
          toggleShow={toggleShowPassword}
        />
        <PasswordInput
          label="Xác nhận mật khẩu"
          name="rePassword"
          value={formik.values.rePassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isInvalid={formik.touched.rePassword && formik.errors.rePassword}
          show={showRePassword}
          toggleShow={toggleShowRePassword}
        />
        <Button
          type="submit"
          className="w-100 mt-2 py-2 fw-semibold"
          style={{
            backgroundColor: "#0d6efd",
            border: "none",
            borderRadius: "30px",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0b5ed7")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#0d6efd")}
        >
          Đặt lại mật khẩu
        </Button>
      </Form>

      <div className="mt-4 w-100">
        <GoogleLoginButton />
      </div>

      <p className="text-center mt-3">
        <span className="text-muted">Quay lại </span>
        <Button
          variant="link"
          onClick={() => navigate("/login")}
          className="p-0 fw-semibold text-decoration-none"
          style={{ color: "#0d6efd" }}
        >
          Đăng nhập
        </Button>
      </p>
    </Container>
  );
};

export default memo(ForgetPassword);
