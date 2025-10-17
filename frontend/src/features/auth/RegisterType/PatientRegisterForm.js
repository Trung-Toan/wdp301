import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerPatientsApi } from "../../../api/auth/register/registerPatientsApi";
import Toast from "../../../components/ui/Toast";

export default function PatientRegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        dob: "",
        gender: "",
        address: "",
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

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
        if (!data.address.trim()) newErrors.address = "Địa chỉ không được để trống";
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
        try {
            await registerPatientsApi.register(formData);
            setNotification({ type: "success", message: "Đăng ký thành công! Chuyển đến đăng nhập..." });
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setNotification({
                type: "error",
                message: err.response?.data?.message || "Đăng ký thất bại",
            });
        }
    };

    return (
        <main className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl bg-white">
                {/* LEFT - FORM */}
                <div className="w-full md:w-1/2 p-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-blue-600 transition"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </button>

                    <div className="flex items-center gap-2 mt-6 mb-8">
                        <HeartPulse className="text-blue-600 h-6 w-6" />
                        <h1 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản bệnh nhân</h1>
                    </div>

                    <p className="text-gray-500 mb-6 text-sm">
                        Hãy tạo tài khoản để đặt lịch khám, lưu hồ sơ và theo dõi sức khỏe của bạn.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { id: "username", label: "Tên đăng nhập", type: "text", placeholder: "Nhập tên đăng nhập" },
                            { id: "email", label: "Email", type: "email", placeholder: "example@gmail.com" },
                            { id: "phone", label: "Số điện thoại", type: "text", placeholder: "0912345678" },
                            { id: "fullName", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A" },
                        ].map((input) => (
                            <div key={input.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {input.label} *
                                </label>
                                <input
                                    id={input.id}
                                    type={input.type}
                                    value={formData[input.id]}
                                    onChange={handleChange}
                                    placeholder={input.placeholder}
                                    className={`w-full rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors[input.id] ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                {errors[input.id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[input.id]}</p>
                                )}
                            </div>
                        ))}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    className={`w-full rounded-lg border p-2.5 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Xác nhận mật khẩu *
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    className={`w-full rounded-lg border p-2.5 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* DOB & Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
                                <input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 ${errors.dob ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border p-2.5 bg-white focus:ring-2 focus:ring-blue-500 ${errors.gender ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                            <input
                                id="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, phường, quận..."
                                className={`w-full rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg py-2.5 mt-4 hover:opacity-90 transition"
                        >
                            Đăng ký ngay
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-5">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Đăng nhập
                        </a>
                    </p>
                </div>

                {/* RIGHT - IMAGE */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-400 items-center justify-center p-10 text-white">
                    <div className="text-center space-y-4">
                        <img
                            src="/images/doctor_illustration.svg"
                            alt="Doctor illustration"
                            className="w-80 mx-auto drop-shadow-lg"
                        />
                        <h2 className="text-2xl font-semibold">Đặt lịch khám nhanh chóng</h2>
                        <p className="text-blue-50 text-sm">
                            Chăm sóc sức khỏe dễ dàng hơn với hệ thống đặt lịch trực tuyến thông minh
                        </p>
                    </div>
                </div>
            </div>

            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ type: "", message: "" })}
            />
        </main>
    );
}
