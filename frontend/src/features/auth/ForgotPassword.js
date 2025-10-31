import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { Spinner } from "react-bootstrap";
import { findEmailAndResetPassword } from "../../api/auth/ForgotPassword/forgorPasswordApi";
import "../../styles/ForgotPassword.css";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            return setError("Vui lòng nhập email");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError("Email không hợp lệ");
        }

        setLoading(true);
        try {
            await findEmailAndResetPassword(email);
            setMessage("Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu cho bạn. Vui lòng kiểm tra hộp thư.");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-wrapper d-flex align-items-center justify-content-center" style={{ 
            position: "relative",
            minHeight: "600px",
            width: "100%"
        }}>
            {/* Loading Overlay */}
            {loading && (
                <div
                    className="loading-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                >
                    <div className="loading-card" style={{
                        padding: "2.5rem",
                        borderRadius: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1.5rem",
                    }}>
                        <Spinner animation="border" variant="primary" style={{ width: "3.5rem", height: "3.5rem", borderWidth: "4px" }} />
                        <p className="mb-0 fw-semibold" style={{ 
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontSize: "1.1rem"
                        }}>
                            Đang gửi email...
                        </p>
                    </div>
                </div>
            )}

            <div className="forgot-password-card p-5" style={{ 
                maxWidth: "480px", 
                width: "100%",
                position: "relative", 
                zIndex: 1, 
                opacity: loading ? 0.6 : 1 
            }}>
                {/* Header */}
                <div className="forgot-password-header text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="back-button"
                    >
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>

                    <div className="forgot-password-icon">
                        <KeyRound size={40} color="white" />
                    </div>
                    <h1 className="forgot-password-title">Quên mật khẩu?</h1>
                    <p className="forgot-password-subtitle">
                        Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            Email của bạn *
                        </label>
                        <div className="input-icon-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`form-control-modern ${error ? 'is-invalid' : ''}`}
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <div className="invalid-feedback d-flex align-items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="success-message d-flex align-items-center gap-2">
                                <CheckCircle size={16} />
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid mt-4">
                        <button
                            type="submit"
                            className="btn-forgot-password"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                        style={{ borderWidth: "2px" }}
                                    />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Mail size={18} className="me-2" />
                                    Gửi link đặt lại mật khẩu
                                </>
                            )}
                        </button>
                    </div>

                    {/* Links */}
                    <div className="forgot-password-links text-center mt-4" style={{ 
                        pointerEvents: loading ? "none" : "auto", 
                        opacity: loading ? 0.6 : 1 
                    }}>
                        <p className="mb-2" style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Nhớ mật khẩu?{" "}
                            <Link to="/login" className="forgot-password-link">
                                Đăng nhập ngay
                            </Link>
                        </p>
                        <p className="mb-0" style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="forgot-password-link">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
