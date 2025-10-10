import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientRegisterForm() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const steps = [
        { number: 1, title: "Tài khoản" },
        { number: 2, title: "Cá nhân" },
        { number: 3, title: "Y Tế" },
    ];

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
        bloodType: "",
        allergy: "",
        chronicDisease: "",
        medication: "",
        surgeryHistory: "",
        emergencyName: "",
        emergencyPhone: "",
    });

    const handleNext = (e) => {
        e.preventDefault();
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = (e) => {
        e.preventDefault();
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate(-1);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu đăng ký:", formData);
        alert("Đăng ký thành công!");
        // TODO: Gọi API đăng ký tại đây
    };

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

                    {/* Form card */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Đăng ký tài khoản Bệnh nhân
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Điền đầy đủ thông tin để đăng ký tài khoản bệnh nhân
                            </p>
                        </div>

                        {/* Thanh bước */}
                        <div className="mb-8 flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex flex-1 items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 font-semibold ${currentStep === step.number
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : currentStep > step.number
                                                        ? "border-green-500 bg-green-500 text-white"
                                                        : "border-gray-300 bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {currentStep > step.number ? (
                                                <Check className="h-6 w-6" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>
                                        <span className="mt-2 text-xs font-medium">
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-2 h-0.5 flex-1 ${currentStep > step.number
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Nội dung form */}
                        <form
                            onSubmit={currentStep === 3 ? handleSubmit : handleNext}
                            className="space-y-4"
                        >
                            {/* BƯỚC 1 */}
                            {currentStep === 1 && (
                                <>
                                    <h5 className="text-blue-600 font-semibold mb-2">
                                        Thông tin tài khoản
                                    </h5>
                                    <hr className="mb-3" />

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
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
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
                                </>
                            )}

                            {/* BƯỚC 2 */}
                            {currentStep === 2 && (
                                <>
                                    <h5 className="text-blue-600 font-semibold mb-2">
                                        Thông tin cá nhân
                                    </h5>
                                    <hr className="mb-3" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Họ và tên"
                                        required
                                        className="w-full border rounded-md p-2"
                                    />
                                    <input
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded-md p-2"
                                    />
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
                                    <input
                                        id="address"
                                        type="text"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Địa chỉ của bạn"
                                        required
                                        className="w-full border rounded-md p-2"
                                    />
                                </>
                            )}

                            {/* BƯỚC 3 */}
                            {currentStep === 3 && (
                                <>
                                    <h5 className="text-blue-600 font-semibold mb-2">
                                        Thông tin y tế
                                    </h5>
                                    <hr className="mb-3" />
                                    <select
                                        id="bloodType"
                                        value={formData.bloodType}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    >
                                        <option value="">-- Nhóm máu --</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>

                                    <input
                                        id="allergy"
                                        type="text"
                                        placeholder="Dị ứng"
                                        value={formData.allergy}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    />
                                    <input
                                        id="chronicDisease"
                                        type="text"
                                        placeholder="Bệnh mãn tính"
                                        value={formData.chronicDisease}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    />
                                    <input
                                        id="medication"
                                        type="text"
                                        placeholder="Thuốc đang dùng"
                                        value={formData.medication}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    />
                                    <input
                                        id="surgeryHistory"
                                        type="text"
                                        placeholder="Lịch sử phẫu thuật"
                                        value={formData.surgeryHistory}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    />
                                    <input
                                        id="emergencyName"
                                        type="text"
                                        placeholder="Người liên hệ khẩn cấp"
                                        value={formData.emergencyName}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    />
                                    <input
                                        id="emergencyPhone"
                                        type="tel"
                                        placeholder="SĐT liên hệ khẩn cấp"
                                        value={formData.emergencyPhone}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2"
                                    />
                                </>
                            )}

                            {/* Nút điều hướng */}
                            <div className="flex gap-3 pt-4">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2 hover:bg-gray-100"
                                    >
                                        Quay lại
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                                >
                                    {currentStep === 3 ? "Đăng ký" : "Tiếp tục"}
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
