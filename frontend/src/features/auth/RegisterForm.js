import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerPatientsApi } from "../../api/auth/register/registerPatientsApi";
import Toast from "../../components/ui/Toast";
import { provinceApi, wardApi } from "../../api";

export default function RegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [errors, setErrors] = useState({});

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
        }
    };

    return (
        <main className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl bg-white">
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
                        <h1 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h1>
                    </div>

                    {/* Loại tài khoản */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại tài khoản *
                        </label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="accountType"
                                    value="PATIENT"
                                    checked={formData.accountType === "PATIENT"}
                                    onChange={handleChange}
                                />
                                <span>Bệnh nhân</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="accountType"
                                    value="ADMIN_CLINIC"
                                    checked={formData.accountType === "ADMIN_CLINIC"}
                                    onChange={handleChange}
                                />
                                <span>Chủ phòng khám</span>
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Các input cơ bản */}
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
                                    className={`w-full rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 ${errors[input.id] ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors[input.id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[input.id]}</p>
                                )}
                            </div>
                        ))}

                        {/* Mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    className={`w-full rounded-lg border p-2.5 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"}`}
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

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    className={`w-full rounded-lg border p-2.5 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
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

                        {/* Ngày sinh + Giới tính */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
                                <input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border p-2.5 ${errors.dob ? "border-red-500" : "border-gray-300"}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border p-2.5 bg-white ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                                >
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố *</label>
                                <select
                                    id="province"
                                    value={formData.province}
                                    onChange={handleProvinceChange}
                                    className="w-full rounded-lg border p-2.5 bg-white focus:ring-2 focus:ring-blue-500 border-gray-300"
                                >
                                    <option value="">-- Chọn tỉnh/thành phố --</option>
                                    {provinces.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>

                                {errors.province && (
                                    <p className="text-red-500 text-xs mt-1">{errors.province}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã *</label>
                                <select
                                    id="ward"
                                    value={formData.ward}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border p-2.5 bg-white focus:ring-2 focus:ring-blue-500 border-gray-300"
                                >
                                    <option value="">-- Chọn phường/xã --</option>
                                    {Array.isArray(wards) &&
                                        wards.map((w) => (
                                            <option key={w.value} value={w.value}>
                                                {w.label}
                                            </option>
                                        ))}
                                </select>

                                {errors.ward && (
                                    <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ chi tiết *
                            </label>
                            <input
                                id="addressDetail"
                                type="text"
                                value={formData.addressDetail}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, khu phố..."
                                className={`w-full rounded-lg border p-2.5 ${errors.addressDetail ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.addressDetail && (
                                <p className="text-red-500 text-xs mt-1">{errors.addressDetail}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg py-2.5 mt-4 hover:opacity-90 transition"
                        >
                            Đăng ký ngay
                        </button>
                    </form>
                </div>

                {/* IMAGE */}
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
