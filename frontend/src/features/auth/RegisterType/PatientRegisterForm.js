import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientRegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        console.log("Dữ liệu đăng ký:", formData);
        alert("Đăng ký thành công!");
        // TODO: Gọi API đăng ký tại đây
    };

    const handleBack = () => navigate(-1);

    return (
        <main className="flex-1 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-xl">
                    {/* Nút quay lại */}
                    <button
                        onClick={handleBack}
                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại chọn loại đăng ký
                    </button>

                    {/* Thẻ form */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Đăng ký tài khoản Bệnh nhân
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Điền đầy đủ thông tin để tạo tài khoản bệnh nhân
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h5 className="text-blue-600 font-semibold mb-2">
                                Thông tin tài khoản & cá nhân
                            </h5>
                            <hr className="mb-3" />

                            {/* Tài khoản */}
                            <label className="block font-medium text-sm">
                                Tài khoản đăng nhập *
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                                className="w-full border rounded-md p-2"
                            />

                            <label className="block font-medium text-sm mt-3">
                                Email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                required
                                className="w-full border rounded-md p-2"
                            />

                            <label className="block font-medium text-sm mt-3">
                                Số điện thoại *
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0912345678"
                                required
                                className="w-full border rounded-md p-2"
                            />

                            {/* Mật khẩu */}
                            <label className="block font-medium text-sm mt-3">
                                Mật khẩu *
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    required
                                    className="w-full border rounded-md p-2 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <label className="block font-medium text-sm mt-3">
                                Xác nhận mật khẩu *
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                    className="w-full border rounded-md p-2 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {/* Thông tin cá nhân */}
                            <label className="block font-medium text-sm mt-3">
                                Họ và tên *
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                required
                                className="w-full border rounded-md p-2"
                            />

                            <label className="block font-medium text-sm mt-3">
                                Ngày sinh *
                            </label>
                            <input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-md p-2"
                            />

                            <label className="block font-medium text-sm mt-3">
                                Giới tính *
                            </label>
                            <select
                                id="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-md p-2 bg-white"
                            >
                                <option value="">-- Chọn giới tính --</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>

                            <label className="block font-medium text-sm mt-3">
                                Địa chỉ *
                            </label>
                            <input
                                id="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, phường, quận..."
                                required
                                className="w-full border rounded-md p-2"
                            />

                            {/* Nút submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-500">Đã có tài khoản?</span>{" "}
                            <a
                                href="/login"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Đăng nhập ngay
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
