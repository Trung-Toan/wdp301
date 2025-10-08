import { memo, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
<<<<<<< HEAD
import {
    Button,
    Container,
    Form,
    InputGroup,
} from "react-bootstrap";
=======
import { Button, Container, Form, InputGroup } from "react-bootstrap";
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
import { Eye, EyeSlash } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
<<<<<<< HEAD
=======

>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
import { clearSessionStorage } from "../../hooks/useSessionStorage";
import GoogleLoginButton from "./GoogleLoginButton";
import { registerUser } from "../../api/LoginController";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
<<<<<<< HEAD
    const toggleRePasswordVisibility = () =>
        setShowRePassword(!showRePassword);
=======
    const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2

    useEffect(() => {
        clearSessionStorage();
    }, []);

    // Gọi API đăng ký
    const mutation = useMutation({
<<<<<<< HEAD
        mutationFn: ({ fullname, email, password }) =>
            registerUser(fullname, email, password),
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Đăng ký thành công!",
                text: "Bạn có thể đăng nhập ngay bây giờ.",
=======
        mutationFn: ({ fullname, email, password }) => registerUser(fullname, email, password),
        onSuccess: (data) => {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Register successfully!",
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
                timer: 2000,
                showConfirmButton: false,
            });
            navigate("/login");
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
<<<<<<< HEAD
                title: "Lỗi",
                text: error.message || "Đăng ký thất bại, vui lòng thử lại!",
=======
                title: "Error",
                text: error.message || "Register failed!",
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
                timer: 3000,
                showConfirmButton: true,
            });
        },
    });

    // Formik
    const formik = useFormik({
        initialValues: {
            fullname: "",
            email: "",
            password: "",
            repassword: "",
        },
        validationSchema: Yup.object({
            fullname: Yup.string()
<<<<<<< HEAD
                .required("Vui lòng nhập họ và tên")
                .min(3, "Họ tên tối thiểu 3 ký tự"),
            email: Yup.string()
                .required("Vui lòng nhập email")
                .email("Email không hợp lệ"),
            password: Yup.string()
                .required("Vui lòng nhập mật khẩu")
                .min(8, "Mật khẩu ít nhất 8 ký tự")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                    "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
                ),
            repassword: Yup.string()
                .oneOf([Yup.ref("password"), null], "Mật khẩu không trùng khớp")
                .required("Vui lòng xác nhận lại mật khẩu"),
        }),
        onSubmit: (values) => {
            mutation.mutate(values);
=======
                .required("Fullname cannot be blank")
                .min(3, "Fullname must be at least 3 characters")
                .max(100, "Fullname cannot exceed 100 characters"),
            email: Yup.string()
                .required("Email cannot be blank")
                .email("Invalid email format"),
            password: Yup.string()
                .required("Password is required")
                .min(8, "Password must be at least 8 characters long")
                .max(100, "Password cannot exceed 100 characters")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                    "Password must include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
                ),
            repassword: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("RePassword cannot be blank"),
        }),
        onSubmit: (values) => {
            mutation.mutate({
                fullname: values.fullname,
                email: values.email,
                password: values.password,
            });
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
        },
    });

    return (
        <Container
<<<<<<< HEAD
            fluid
            className="d-flex align-items-center justify-content-center bg-light"
            style={{ minHeight: "100vh" }}
        >
            <div
                className="bg-white p-5 rounded-4 shadow-sm w-100"
                style={{ maxWidth: "480px" }}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <img
                        src=""
                        alt="HealthyCare"
                        style={{ width: "100px", marginBottom: "10px" }}
                    />
                    <h3 className="fw-bold text-secondary">Đăng ký tài khoản</h3>
                    <p className="text-muted small">
                        Tạo tài khoản để đặt lịch khám dễ dàng hơn
                    </p>
                </div>

                {/* Form */}
                <Form onSubmit={formik.handleSubmit}>
                    {/* Fullname */}
                    <Form.Group className="mb-3" controlId="formFullname">
                        <Form.Label className="fw-semibold">Họ và tên</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullname"
                            placeholder="Nhập họ và tên"
                            value={formik.values.fullname}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={!!formik.errors.fullname && formik.touched.fullname}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.fullname}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Email */}
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label className="fw-semibold">Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Nhập email của bạn"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={!!formik.errors.email && formik.touched.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Password */}
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
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

                    {/* RePassword */}
                    <Form.Group className="mb-4" controlId="formRePassword">
                        <Form.Label className="fw-semibold">Nhập lại mật khẩu</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showRePassword ? "text" : "password"}
                                name="repassword"
                                placeholder="Xác nhận lại mật khẩu"
                                value={formik.values.repassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={
                                    !!formik.errors.repassword && formik.touched.repassword
                                }
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={toggleRePasswordVisibility}
                            >
                                {showRePassword ? <EyeSlash /> : <Eye />}
                            </Button>
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.repassword}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    {/* Nút đăng ký */}
                    <Button
                        type="submit"
                        className="w-100 fw-bold py-2"
                        style={{
                            backgroundColor: "#00bfa5",
                            border: "none",
                            fontSize: "16px",
                        }}
                        disabled={mutation.isLoading}
                    >
                        {mutation.isLoading ? "Đang đăng ký..." : "Đăng ký"}
                    </Button>
                </Form>

                {/* Đường kẻ hoặc */}
                <div className="d-flex align-items-center my-4">
                    <div className="flex-grow-1 border-bottom" />
                    <span className="mx-2 text-muted small">hoặc</span>
                    <div className="flex-grow-1 border-bottom" />
                </div>

                {/* Google login */}
                <GoogleLoginButton />

                {/* Chuyển sang login */}
                <div className="text-center mt-3">
                    <span className="text-muted">Đã có tài khoản? </span>
                    <Link to="/login" className="text-decoration-none" style={{ color: "#00bfa5" }}>
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
=======
            className="p-4 bg-white rounded shadow"
            style={{ maxWidth: "450px" }}
        >
            <h2 className="text-center mb-4">Register</h2>
            <Form className="mb-2" onSubmit={formik.handleSubmit}>
                {/* Fullname */}
                <Form.Group className="mb-3" controlId="formFullname">
                    <Form.Label className="fw-bold">Fullname</Form.Label>
                    <Form.Control
                        type="text"
                        name="fullname"
                        placeholder="Enter fullname"
                        value={formik.values.fullname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={!!formik.errors?.fullname && formik.touched?.fullname}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formik.errors.fullname}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={!!formik.errors.email && formik.touched.email}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formik.errors.email}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Password */}
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

                {/* RePassword */}
                <Form.Group className="mb-3" controlId="formRePassword">
                    <Form.Label className="fw-bold">RePassword</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={showRePassword ? "text" : "password"}
                            name="repassword"
                            placeholder="Confirm password"
                            value={formik.values.repassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={
                                !!formik.errors.repassword && formik.touched.repassword
                            }
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={toggleRePasswordVisibility}
                            className="border-left-0"
                        >
                            {showRePassword ? <EyeSlash /> : <Eye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.repassword}
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>

                {/* Nút đăng ký */}
                <Button
                    variant="warning"
                    type="submit"
                    className="w-100 fw-bold"
                    disabled={mutation.isLoading}
                >
                    {mutation.isLoading ? "Registering..." : "Register"}
                </Button>
            </Form>
            
            <div className="mb-3 text-center">
                Do you have account? <Link to={"/login"} className="text-warning">Login</Link>
            </div>

            <GoogleLoginButton />
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
        </Container>
    );
};

export default memo(Register);
