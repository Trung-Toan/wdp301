import { memo, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { clearSessionStorage } from "../../hooks/useSessionStorage";
import GoogleLoginButton from "./GoogleLoginButton";
import { registerUser } from "../../api/LoginController";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);

    useEffect(() => {
        clearSessionStorage();
    }, []);

    // Gọi API đăng ký
    const mutation = useMutation({
        mutationFn: ({ fullname, email, password }) =>
            registerUser(fullname, email, password),
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Đăng ký thành công!",
                text: "Bạn có thể đăng nhập ngay bây giờ.",
                timer: 2000,
                showConfirmButton: false,
            });
            navigate("/login");
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: error.message || "Đăng ký thất bại, vui lòng thử lại!",
                timer: 3000,
                showConfirmButton: true,
            });
        },
    });

    // Formik validation
    const formik = useFormik({
        initialValues: {
            fullname: "",
            email: "",
            password: "",
            repassword: "",
        },
        validationSchema: Yup.object({
            fullname: Yup.string()
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
        },
    });

    return (
        <Container
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
                    <div className="mb-3">
                        <div className="d-inline-flex align-items-center gap-2">
                            <div
                                className="d-flex justify-content-center align-items-center rounded-3"
                                style={{
                                    backgroundColor: "#00bfa5",
                                    width: "48px",
                                    height: "48px",
                                }}
                            >
                                <span className="text-white fw-bold fs-4">M+</span>
                            </div>
                            <h4 className="fw-bold mb-0 text-secondary">MediSched</h4>
                        </div>
                    </div>
                    <h5 className="fw-bold text-secondary">Đăng ký tài khoản</h5>
                    <p className="text-muted small">
                        Tạo tài khoản để đặt lịch khám dễ dàng hơn
                    </p>
                </div>

                {/* Form */}
                <Form onSubmit={formik.handleSubmit}>
                    {/* Họ và tên */}
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

                    {/* Mật khẩu */}
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

                    {/* Nhập lại mật khẩu */}
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

                {/* Hoặc */}
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
                    <Link
                        to="/login"
                        className="text-decoration-none"
                        style={{ color: "#00bfa5" }}
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        </Container>
    );
};

export default memo(Register);
