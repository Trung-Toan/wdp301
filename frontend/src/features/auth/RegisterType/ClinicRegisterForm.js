import React, { useState } from "react";
import { Link } from "react-router-dom";

function ClinicRegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Đăng ký phòng khám");
        // Xử lý logic đăng ký tại đây
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <main className="bg-light py-5">
            <div className="container">
                <div className="mx-auto p-4 rounded shadow bg-white" style={{ maxWidth: "600px" }}>
                    <button onClick={handleGoBack} className="btn btn-link mb-3 text-decoration-none">
                        ← Quay lại chọn loại đăng ký
                    </button>

                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Đăng ký Phòng khám</h2>
                        <p className="text-muted">Điền đầy đủ thông tin để đăng ký tài khoản phòng khám</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="clinic-name" className="form-label">
                                Tên phòng khám *
                            </label>
                            <input
                                id="clinic-name"
                                type="text"
                                className="form-control"
                                placeholder="Ví dụ: Phòng khám Đa khoa ABC"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                placeholder="contact@clinic.com"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">
                                Số điện thoại *
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                className="form-control"
                                placeholder="0912345678"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="address" className="form-label">
                                Địa chỉ *
                            </label>
                            <input
                                id="address"
                                type="text"
                                className="form-control"
                                placeholder="Số nhà, đường, phường, quận"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                                Mô tả phòng khám
                            </label>
                            <textarea
                                id="description"
                                className="form-control"
                                rows="4"
                                placeholder="Giới thiệu về phòng khám của bạn"
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="license" className="form-label">
                                Số giấy phép hoạt động *
                            </label>
                            <input
                                id="license"
                                type="text"
                                className="form-control"
                                placeholder="Nhập số giấy phép"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="license-file" className="form-label">
                                Tải giấy phép hoạt động (PDF/Image) *
                            </label>
                            <input id="license-file" type="file" className="form-control" accept=".pdf,image/*" required />
                        </div>

                        <div className="mb-3 position-relative">
                            <label htmlFor="password" className="form-label">
                                Mật khẩu *
                            </label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Nhập mật khẩu"
                                required
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "38px",
                                    cursor: "pointer",
                                    color: "#888",
                                }}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </span>
                        </div>

                        <div className="mb-3 position-relative">
                            <label htmlFor="confirm-password" className="form-label">
                                Xác nhận mật khẩu *
                            </label>
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "38px",
                                    cursor: "pointer",
                                    color: "#888",
                                }}
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </span>
                        </div>

                        <div className="form-check mb-3">
                            <input type="checkbox" id="terms" className="form-check-input" required />
                            <label htmlFor="terms" className="form-check-label">
                                Tôi đồng ý với{" "}
                                <Link to="#" className="text-primary text-decoration-none">
                                    Điều khoản dịch vụ
                                </Link>{" "}
                                và{" "}
                                <Link to="#" className="text-primary text-decoration-none">
                                    Chính sách bảo mật
                                </Link>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Đăng ký
                        </button>
                    </form>

                    <div className="mt-3 text-center">
                        <span className="text-muted">Đã có tài khoản? </span>
                        <a href="/login" className="text-primary text-decoration-none">
                            Đăng nhập ngay
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ClinicRegisterForm;
