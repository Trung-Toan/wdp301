import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, HeartPulse, User, Mail, Phone, Lock, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { registerPatientsApi } from "../../api/auth/register/registerPatientsApi";
import Toast from "../../components/ui/Toast";
import { provinceApi, wardApi } from "../../api";
import { Spinner } from "react-bootstrap";
import "../../styles/Register.css";

export default function RegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // --- Thêm state cho province & ward ---
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);

    const [formData, setFormData] = useState({
        accountType: "PATIENT",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        dob: "",
        gender: "",
        province: "",
        ward: "",
        addressDetail: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });

    // --- Gọi API lấy danh sách tỉnh khi mở trang ---
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await provinceApi.getProvinces();
                console.log("Provinces API:", res.data);
                setProvinces(res.data.options || []); // đúng cấu trúc
            } catch (err) {
                console.error("Lỗi lấy danh sách tỉnh:", err);
                setProvinces([]);
            }
        };
        fetchProvinces();
    }, []);


    // --- Khi chọn tỉnh, tự động gọi API lấy danh sách phường ---
    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        setFormData({ ...formData, province: provinceCode, ward: "" }); // reset ward khi đổi tỉnh

        if (!provinceCode) {
            setWards([]);
            return;
        }

        try {
            const res = await wardApi.getWardsByProvince(provinceCode);
            console.log("Wards API:", res.data); // xem cấu trúc thật
            setWards(res.data.options || []); // đúng cấu trúc
        } catch (err) {
            console.error("Lỗi lấy danh sách phường:", err);
            setWards([]);
        }
    };


    const validateForm = (data) => {
        const newErrors = {};
        if (!data.username.trim()) newErrors.username = "Tên đăng nhập không được để trống";
        else if (data.username.length < 4) newErrors.username = "Phải có ít nhất 4 ký tự";
        if (!data.email.trim()) newErrors.email = "Email không được để trống";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
            newErrors.email = "Email không hợp lệ";
        if (!data.phone.trim()) newErrors.phone = "Số điện thoại không được để trống";
        else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(data.phone))
            newErrors.phone = "Số điện thoại không hợp lệ";
        if (!data.password.trim()) newErrors.password = "Mật khẩu không được để trống";
        else if (data.password.length < 6)
            newErrors.password = "Phải có ít nhất 6 ký tự";
        else if (!/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password))
            newErrors.password = "Phải chứa ít nhất 1 chữ hoa và 1 số";
        if (data.confirmPassword !== data.password)
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        if (!data.fullName.trim()) newErrors.fullName = "Họ tên không được để trống";
        if (!data.dob.trim()) newErrors.dob = "Ngày sinh không được để trống";
        if (!data.gender.trim()) newErrors.gender = "Chọn giới tính";
        if (!data.province.trim()) newErrors.province = "Chọn tỉnh/thành phố";
        if (!data.ward.trim()) newErrors.ward = "Chọn phường/xã";
        if (!data.addressDetail.trim())
            newErrors.addressDetail = "Vui lòng nhập địa chỉ chi tiết";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setNotification({ type: "error", message: "Vui lòng kiểm tra lại thông tin." });
            return;
        }
        setIsLoading(true);
        try {
            // Gộp địa chỉ hoàn chỉnh
            const fullAddress = `${formData.addressDetail}, ${wards.find(w => w.code === formData.ward)?.name || ""}, ${provinces.find(p => p.code === formData.province)?.name || ""}`;

            // Map form data to backend expected format
            const role = formData.accountType === "patient" ? "PATIENT" : "ADMIN_CLINIC";

            await registerPatientsApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone_number: formData.phone,
                role: role,
                fullName: formData.fullName,
                dob: formData.dob,
                gender: formData.gender,
                address: fullAddress,
                province_code: formData.province,
                ward_code: formData.ward,
            });

            setNotification({
                type: "success",
                message: "Đăng ký thành công! Chuyển đến đăng nhập...",
            });
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setNotification({
                type: "error",
                message: err.response?.data?.message || "Đăng ký thất bại",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-wrapper d-flex align-items-center justify-content-center" style={{ 
            position: "relative",
            minHeight: "600px",
            width: "100%"
        }}>
            {/* Loading Overlay */}
            {isLoading && (
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
                            Đang xử lý đăng ký...
                        </p>
                    </div>
                </div>
            )}

            <div className="register-card p-5" style={{ 
                maxWidth: "900px", 
                width: "100%",
                position: "relative", 
                zIndex: 1, 
                opacity: isLoading ? 0.6 : 1 
            }}>
                {/* Header */}
                <div className="register-header text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="back-button"
                    >
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>

                    <div className="register-icon">
                        <HeartPulse size={40} color="white" />
                    </div>
                    <h1 className="register-title">Tạo tài khoản mới</h1>
                    <p className="register-subtitle">Điền thông tin để bắt đầu sử dụng dịch vụ</p>
                    </div>

                    {/* Loại tài khoản */}
                <div className="form-group-modern">
                    <label className="form-label-modern">
                            Loại tài khoản *
                        </label>
                    <div className="radio-group">
                        <label className="radio-option">
                                <input
                                    type="radio"
                                    name="accountType"
                                    value="PATIENT"
                                    checked={formData.accountType === "PATIENT"}
                                    onChange={handleChange}
                                disabled={isLoading}
                                />
                                <span>Bệnh nhân</span>
                            </label>
                        <label className="radio-option">
                                <input
                                    type="radio"
                                    name="accountType"
                                    value="ADMIN_CLINIC"
                                    checked={formData.accountType === "ADMIN_CLINIC"}
                                    onChange={handleChange}
                                disabled={isLoading}
                                />
                                <span>Chủ phòng khám</span>
                            </label>
                        </div>
                    </div>

                <form onSubmit={handleSubmit}>
                        {/* Các input cơ bản */}
                        {[
                        { id: "username", label: "Tên đăng nhập", type: "text", placeholder: "Nhập tên đăng nhập", icon: User },
                        { id: "email", label: "Email", type: "email", placeholder: "example@gmail.com", icon: Mail },
                        { id: "phone", label: "Số điện thoại", type: "text", placeholder: "0912345678", icon: Phone },
                        { id: "fullName", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", icon: User },
                    ].map((input) => {
                        const IconComponent = input.icon;
                        return (
                            <div key={input.id} className="form-group-modern">
                                <label className="form-label-modern">
                                    {input.label} *
                                </label>
                                <div className="input-icon-wrapper">
                                    <IconComponent className="input-icon" size={20} />
                                <input
                                    id={input.id}
                                    type={input.type}
                                    value={formData[input.id]}
                                    onChange={handleChange}
                                    placeholder={input.placeholder}
                                        className={`form-control-modern ${errors[input.id] ? 'is-invalid' : ''}`}
                                        disabled={isLoading}
                                />
                                </div>
                                {errors[input.id] && (
                                    <div className="invalid-feedback">{errors[input.id]}</div>
                                )}
                            </div>
                        );
                    })}

                        {/* Mật khẩu */}
                    <div className="form-group-modern">
                        <label className="form-label-modern">Mật khẩu *</label>
                        <div className="input-icon-wrapper">
                            <Lock className="input-icon" size={20} />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                className={`form-control-modern ${errors.password ? 'is-invalid' : ''}`}
                                style={{ paddingRight: "3rem" }}
                                disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-btn"
                                disabled={isLoading}
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
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        {/* Xác nhận mật khẩu */}
                    <div className="form-group-modern">
                        <label className="form-label-modern">Xác nhận mật khẩu *</label>
                        <div className="input-icon-wrapper">
                            <Lock className="input-icon" size={20} />
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                className={`form-control-modern ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                style={{ paddingRight: "3rem" }}
                                disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle-btn"
                                disabled={isLoading}
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
                            {errors.confirmPassword && (
                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                            )}
                        </div>

                        {/* Ngày sinh + Giới tính */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Ngày sinh *</label>
                            <div className="input-icon-wrapper">
                                <Calendar className="input-icon" size={20} />
                                <input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={`form-control-modern ${errors.dob ? 'is-invalid' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Giới tính *</label>
                            <div className="input-icon-wrapper">
                                <Users className="input-icon" size={20} />
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`select-modern ${errors.gender ? 'is-invalid' : ''}`}
                                    style={{ paddingLeft: "3rem" }}
                                    disabled={isLoading}
                                >
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                            </div>
                        </div>

                        {/* Địa chỉ */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Tỉnh / Thành phố *</label>
                            <div className="input-icon-wrapper">
                                <MapPin className="input-icon" size={20} />
                                <select
                                    id="province"
                                    value={formData.province}
                                    onChange={handleProvinceChange}
                                    className={`select-modern ${errors.province ? 'is-invalid' : ''}`}
                                    style={{ paddingLeft: "3rem" }}
                                    disabled={isLoading}
                                >
                                    <option value="">-- Chọn tỉnh/thành phố --</option>
                                    {provinces.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.province && (
                                <div className="invalid-feedback">{errors.province}</div>
                            )}
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Phường / Xã *</label>
                            <div className="input-icon-wrapper">
                                <MapPin className="input-icon" size={20} />
                                <select
                                    id="ward"
                                    value={formData.ward}
                                    onChange={handleChange}
                                    className={`select-modern ${errors.ward ? 'is-invalid' : ''}`}
                                    style={{ paddingLeft: "3rem" }}
                                    disabled={isLoading || !formData.province}
                                >
                                    <option value="">-- Chọn phường/xã --</option>
                                    {Array.isArray(wards) &&
                                        wards.map((w) => (
                                            <option key={w.value} value={w.value}>
                                                {w.label}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            {errors.ward && (
                                <div className="invalid-feedback">{errors.ward}</div>
                            )}
                            </div>
                        </div>

                    <div className="form-group-modern">
                        <label className="form-label-modern">
                                Địa chỉ chi tiết *
                            </label>
                        <div className="input-icon-wrapper">
                            <MapPin className="input-icon" size={20} />
                            <input
                                id="addressDetail"
                                type="text"
                                value={formData.addressDetail}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, khu phố..."
                                className={`form-control-modern ${errors.addressDetail ? 'is-invalid' : ''}`}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.addressDetail && (
                            <div className="invalid-feedback">{errors.addressDetail}</div>
                        )}
                        </div>

                        <button
                            type="submit"
                        className="btn-register"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                    style={{ borderWidth: "2px" }}
                                />
                                Đang xử lý...
                            </>
                        ) : (
                            "Đăng ký ngay"
                        )}
                        </button>

                    <div className="text-center mt-4" style={{ pointerEvents: isLoading ? "none" : "auto", opacity: isLoading ? 0.6 : 1 }}>
                        <p className="mb-0" style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="register-link">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ type: "", message: "" })}
            />
        </div>
    );
}
