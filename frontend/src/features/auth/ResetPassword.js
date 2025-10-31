import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from "lucide-react";
import { Spinner } from "react-bootstrap";
import { AUTHEN_API } from "../../api/api";
import "../../styles/ResetPassword.css";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const accountId = searchParams.get("accountId");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password || !confirm) {
            return setError("Vui lòng nhập đầy đủ thông tin");
        }
        if (password.length < 6) {
            return setError("Mật khẩu phải có ít nhất 6 ký tự");
        }
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return setError("Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số");
        }
        if (password !== confirm) {
            return setError("Mật khẩu không khớp");
        }

        setLoading(true);
        try {
            await axios.post(AUTHEN_API.FORGOTPASSWORD, {
                token,
                newPassword: password,
                accountId,
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    if (success)
        return (
            <div className="reset-password-wrapper d-flex align-items-center justify-content-center" style={{ 
                position: "relative",
                minHeight: "600px",
                width: "100%"
            }}>
                <div className="reset-password-card p-5 text-center" style={{ 
                    maxWidth: "480px", 
                    width: "100%",
                    position: "relative", 
                    zIndex: 1
                }}>
                    <div className="success-icon-wrapper">
                        <CheckCircle size={80} color="#10b981" />
                    </div>
                    <h1 className="success-title">Thành công!</h1>
                    <p className="success-message-text">
                        Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
                    </p>
                    <Link to="/login" className="btn-go-to-login">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );

    return (
        <div className="reset-password-wrapper d-flex align-items-center justify-content-center" style={{ 
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
                            Đang cập nhật mật khẩu...
                        </p>
                    </div>
                </div>
            )}

            <div className="reset-password-card p-5" style={{ 
                maxWidth: "480px", 
                width: "100%",
                position: "relative", 
                zIndex: 1, 
                opacity: loading ? 0.6 : 1 
            }}>
                {/* Header */}
                <div className="reset-password-header text-center">
                    <div className="reset-password-icon">
                        <KeyRound size={40} color="white" />
                    </div>
                    <h1 className="reset-password-title">Đặt lại mật khẩu</h1>
                    <p className="reset-password-subtitle">
                        Nhập mật khẩu mới của bạn. Đảm bảo mật khẩu mạnh và an toàn.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Password Input */}
                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            Mật khẩu mới *
                        </label>
                        <div className="input-icon-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`form-control-modern ${error && !confirm ? 'is-invalid' : ''}`}
                                style={{ paddingRight: "3rem" }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-btn"
                                disabled={loading}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 10
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="form-group-modern">
                        <label className="form-label-modern">
                            Xác nhận mật khẩu *
                        </label>
                        <div className="input-icon-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={`form-control-modern ${error ? 'is-invalid' : ''}`}
                                style={{ paddingRight: "3rem" }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle-btn"
                                disabled={loading}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 10
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {error && (
                            <div className="invalid-feedback d-flex align-items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="password-requirements">
                        <p className="requirements-title">Mật khẩu phải có:</p>
                        <ul className="requirements-list">
                            <li className={password.length >= 6 ? "valid" : ""}>
                                Ít nhất 6 ký tự
                            </li>
                            <li className={/[A-Z]/.test(password) ? "valid" : ""}>
                                Ít nhất 1 chữ hoa
                            </li>
                            <li className={/[0-9]/.test(password) ? "valid" : ""}>
                                Ít nhất 1 số
                            </li>
                            <li className={password === confirm && password.length > 0 ? "valid" : ""}>
                                Mật khẩu khớp nhau
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid mt-4">
                        <button
                            type="submit"
                            className="btn-reset-password"
                            disabled={loading || !password || !confirm}
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
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <KeyRound size={18} className="me-2" />
                                    Cập nhật mật khẩu
                                </>
                            )}
                        </button>
                    </div>

                    {/* Links */}
                    <div className="reset-password-links text-center mt-4" style={{ 
                        pointerEvents: loading ? "none" : "auto", 
                        opacity: loading ? 0.6 : 1 
                    }}>
                        <p className="mb-0" style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Nhớ mật khẩu?{" "}
                            <Link to="/login" className="reset-password-link">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
