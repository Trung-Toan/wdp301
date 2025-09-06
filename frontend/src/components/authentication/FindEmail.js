import { useFormik } from "formik";
import React, { memo, useEffect, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { findEmail } from "../../controller/LoginController";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";
import { sendEmail } from "../../utility/send.mail";

const FindEmail = () => {
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const timeReset = 10;
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

    return newOtp; // Trả về OTP
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev - 1;
          if (newTimer <= 0) {
            resetOtpState();
          }
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
        .required("Email is not blank")
        .email("Email must be valid format"),
      otp: Yup.string()
        .required("OTP is not null")
        .matches(/^\d{6}$/, "OTP code must consist of 6 digits"),
    }),
    onSubmit: (values) => {
      if (values.otp === otp && timer > 0) {
        navigate("/forgot_password", {state: {user}});
      } else {
        formik.setFieldError("otp", "OTP is incorrect or expired");
      }
    },
  });

  const mutation = useMutation({
    mutationFn: ({ email }) => {
      return findEmail(email);
    },
    onSuccess: async (data) => {
      setUser(data?.result);
      const newOtp = generateNewOtp();
      setIsLoading(true);
      try {
        await sendEmail(data?.result?.email, "OTP verification code", newOtp);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Send otp successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "System error! Please try again.",
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
        title: "Error",
        text: error?.message || "Find email failed!",
        timer: 3000,
        showConfirmButton: true,
      });
    },
  });

  const SendOtp = async (email) => {
    formik.setFieldTouched("email", true);
    const validationErrors = await formik.validateForm();
    if (validationErrors.email) {
      return;
    }
    mutation.mutate({ email });
  };
  return (
    <Container
      className="p-4 bg-white rounded shadow"
      style={{ maxWidth: "400px" }}
    >
      <h2 className="text-center">Find Account</h2>

      <Form onSubmit={formik.handleSubmit}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Enter Email</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={!!formik.errors.email && formik.touched.email}
            />
            <Button
              variant="warning"
              className="border-left-0"
              onClick={() => SendOtp(formik.values.email)}
              disabled={timer > 0 || isLoading} // Vô hiệu hóa khi timer hoặc loading
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Sending...
                </>
              ) : timer > 0 ? (
                `${timer}s`
              ) : (
                "Send"
              )}
            </Button>
            <Form.Control.Feedback type="invalid">
              {formik.errors.email}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3" controlId="otp">
          <Form.Label>Enter OTP</Form.Label>
          <Form.Control
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={formik.values.otp}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={!!formik.errors.otp && formik.touched.otp}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.otp}
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="warning" type="submit" className="w-100">
          Find account
        </Button>
      </Form>
      <p className="text-center mt-3">
        Login with password
        <Link to="/login" className="text-warning ms-2">
          Login
        </Link>
      </p>
    </Container>
  );
};

export default memo(FindEmail);