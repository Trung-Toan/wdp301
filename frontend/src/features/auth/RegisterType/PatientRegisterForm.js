import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function PatientRegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Đăng ký bệnh nhân");
        // TODO: Thực hiện logic đăng ký tại đây (call API, validate, v.v.)
    };

    return (
        <main className="flex-1 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-md">
                    {/* Nút quay lại */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại chọn loại đăng ký
                    </button>

                    {/* Form */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        <div className="mb-6 text-center">
                            <h1 className="text-3xl font-bold text-gray-900">Đăng ký làm Bệnh nhân</h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Điền đầy đủ thông tin để đăng ký tài khoản bệnh nhân
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Họ và tên */}
                            <div className="space-y-2">
                                <label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                                    Họ và tên *
                                </label>
                                <input
                                    id="fullname"
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    required
                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    required
                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                    Số điện thoại *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="0912345678"
                                    required
                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Mật khẩu */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Mật khẩu *
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu"
                                        required
                                        className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Xác nhận mật khẩu */}
                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                                    Xác nhận mật khẩu *
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                        className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Điều khoản */}
                            <div className="flex items-start gap-2">
                                <input id="terms" type="checkbox" required className="mt-1" />
                                <label htmlFor="terms" className="text-sm leading-relaxed text-gray-700">
                                    Tôi đồng ý với{" "}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Điều khoản dịch vụ
                                    </a>{" "}
                                    và{" "}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Chính sách bảo mật
                                    </a>
                                </label>
                            </div>

                            {/* Nút đăng ký */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                            >
                                Đăng ký
                            </button>
                        </form>

                        {/* Link đăng nhập */}
                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-500">Đã có tài khoản?</span>{" "}
                            <a href="/login" className="font-medium text-blue-600 hover:underline">
                                Đăng nhập ngay
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
