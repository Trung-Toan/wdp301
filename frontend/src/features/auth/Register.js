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
        mutationFn: ({ fullname, email, password }) => registerUser(fullname, email, password),
        onSuccess: (data) => {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Register successfully!",
                timer: 2000,
                showConfirmButton: false,
            });
            navigate("/login");
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Register failed!",
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
        },
    });

    return (
        <Container
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
        </Container>
    );
};

export default memo(Register);
