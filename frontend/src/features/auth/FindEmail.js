import { useFormik } from "formik";
import { memo, useEffect, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";
import { sendEmail } from "../../utility/send.mail";
import GoogleLoginButton from "./GoogleLoginButton";
import { findEmail } from "../../api/LoginController";

const FindEmail = () => {
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const timeReset = 5 * 60;
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const savedOtp = localStorage.getItem("otp");
    const savedExpiry = localStorage.getItem("otpExpiry");
    const currentTime = Math.floor(Date.now() / 1000);

    if (savedOtp && savedExpiry) {
      const remainingTime = parseInt(savedExpiry) - currentTime;
      if (remainingTime > 0) {
        setOtp(savedOtp);
        setTimer(remainingTime);
      } else {
        resetOtpState();
      }
    }
  }, []);

  const resetOtpState = () => {
    setOtp("");
    setTimer(0);
    setUser(null);
    localStorage.removeItem("otp");
    localStorage.removeItem("otpExpiry");
  };

  const generateNewOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = Math.floor(Date.now() / 1000) + timeReset;
    setOtp(newOtp);
    setTimer(timeReset);
    localStorage.setItem("otp", newOtp);
    localStorage.setItem("otpExpiry", expiryTime.toString());
    return newOtp;
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev - 1;
          if (newTimer <= 0) resetOtpState();
          return newTimer;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formik = useFormik({
    initialValues: {
      email: "",
      otp: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("Email không được để trống")
        .email("Định dạng email không hợp lệ"),
      otp: Yup.string()
        .required("Vui lòng nhập mã OTP")
        .matches(/^\d{6}$/, "Mã OTP gồm 6 chữ số"),
    }),
    onSubmit: (values) => {
      if (values.otp === otp && timer > 0) {
        navigate("/forgot_password", { state: { user } });
      } else {
        formik.setFieldError("otp", "OTP không chính xác hoặc đã hết hạn");
      }
    },
  });

  const mutation = useMutation({
    mutationFn: ({ email }) => findEmail(email),
    onSuccess: async (data) => {
      const userFind = data?.user;
      setUser(userFind);
      const newOtp = generateNewOtp();
      setIsLoading(true);
      try {
        await sendEmail(userFind?.email, "OTP xác thực tài khoản", newOtp);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Mã OTP đã được gửi tới email của bạn.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Lỗi hệ thống!",
          text: "Vui lòng thử lại sau.",
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Không tìm thấy email!",
        text: error?.message || "Email này chưa được đăng ký.",
        timer: 3000,
        showConfirmButton: true,
      });
    },
  });

  const SendOtp = async (email) => {
    formik.setFieldTouched("email", true);
    const validationErrors = await formik.validateForm();
    if (validationErrors.email) return;
    mutation.mutate({ email });
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="bg-white p-5 rounded-4 shadow-sm w-100"
        style={{ maxWidth: "460px" }}
      >
        {/* Logo + Title */}
        <div className="text-center mb-4">
          {/* <img
            src="https://bookingcare.vn/assets/icon/bookingcare-2020.svg"
            alt="BookingCare Logo"
            style={{ width: "100px", marginBottom: "10px" }}
          /> */}
          <h3 className="fw-bold text-secondary">  Xác minh email để tiếp tục</h3>
          <p className="text-muted small">
            Chúng tôi sẽ gửi mã xác minh OTP đến email bạn đã đăng ký
          </p>
        </div>

        {/* Form */}
        <Form onSubmit={formik.handleSubmit}>
          {/* Email */}
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                name="email"
                placeholder="Nhập địa chỉ email của bạn"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={!!formik.errors.email && formik.touched.email}
                className="py-2"
              />
              <Button
                onClick={() => SendOtp(formik.values.email)}
                disabled={timer > 0 || isLoading}
                style={{
                  backgroundColor: "#00bfa5",
                  border: "none",
                  color: "white",
                  fontWeight: 500,
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Gửi...
                  </>
                ) : timer > 0 ? (
                  `${timer}s`
                ) : (
                  "Gửi OTP"
                )}
              </Button>
              <Form.Control.Feedback type="invalid">
                {formik.errors.email}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* OTP */}
          <Form.Group className="mb-4" controlId="otp">
            <Form.Label className="fw-semibold">Mã OTP</Form.Label>
            <Form.Control
              type="text"
              name="otp"
              placeholder="Nhập mã OTP 6 chữ số"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={!!formik.errors.otp && formik.touched.otp}
              className="py-2"
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.otp}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Submit */}
          <Button
            type="submit"
            className="w-100 fw-bold py-2"
            style={{
              backgroundColor: "#00bfa5",
              border: "none",
              fontSize: "16px",
            }}
          >
            Tìm tài khoản
          </Button>
        </Form>

        {/* Separator */}
        <div className="d-flex align-items-center my-4">
          <div className="flex-grow-1 border-bottom" />
          <span className="mx-2 text-muted small">hoặc</span>
          <div className="flex-grow-1 border-bottom" />
        </div>

        {/* Google Login */}
        <GoogleLoginButton />

        {/* Footer */}
        <p className="text-center mt-3">
          <span className="text-muted">Đăng nhập bằng mật khẩu?</span>
          <Link
            to="/login"
            className="text-decoration-none ms-2"
            style={{ color: "#00bfa5" }}
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </Container>
  );
};

export default memo(FindEmail);
