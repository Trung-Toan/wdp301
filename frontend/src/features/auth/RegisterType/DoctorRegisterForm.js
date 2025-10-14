import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";

export default function DoctorRegisterForm() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const steps = [
        { number: 1, title: "Tài khoản" },
        { number: 2, title: "Cá nhân" },
        { number: 3, title: "Hành Nghề" },
        { number: 4, title: "Giấy Phép" },
    ];

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else navigate(-1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentStep < 4) handleNext();
        else {
            console.log("Đăng ký bác sĩ hoàn tất");
            // TODO: Gửi dữ liệu đăng ký bác sĩ ở đây
        }
    };

    return (
        <main className="flex-1 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-2xl">
                    {/* Nút quay lại */}
                    <button
                        onClick={handleBack}
                        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại {currentStep === 1 ? "chọn loại đăng ký" : ""}
                    </button>

                    {/* Thẻ form */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Đăng ký tài khoản Bác sĩ
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Điền đầy đủ thông tin để đăng ký tài khoản bác sĩ
                            </p>
                        </div>

                        {/* Thanh hiển thị bước */}
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
                                            {currentStep > step.number ? <Check className="h-6 w-6" /> : step.number}
                                        </div>
                                        <span className="mt-2 text-xs font-medium">{step.title}</span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-2 h-0.5 flex-1 ${currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Form nội dung từng bước */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Step 1: Tài khoản */}
                            {currentStep === 1 && (
                                <>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Email *</label>
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            placeholder="0912345678"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Mật khẩu *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Nhập mật khẩu"
                                                required
                                                className="w-full border rounded-md p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Xác nhận mật khẩu *</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Nhập lại mật khẩu"
                                                required
                                                className="w-full border rounded-md p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Cá nhân */}
                            {currentStep === 2 && (
                                <>
                                    <div className="rounded-lg bg-gray-100 p-4 mb-4">
                                        <h3 className="font-semibold text-gray-800">Thông tin cá nhân</h3>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Họ và tên *</label>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên của bạn"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Ngày sinh *</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Giới tính *</label>
                                        <select
                                            required
                                            className="w-full border rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="">-- Chọn giới tính --</option>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Ảnh đại diện</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full border rounded-md p-2 file:mr-3 file:py-1 file:px-3 file:border file:rounded-md file:bg-gray-100 file:text-gray-700"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Step 3: Hành nghề */}
                            {currentStep === 3 && (
                                <>
                                    <div className="rounded-lg bg-gray-100 p-4 mb-4">
                                        <h3 className="font-semibold text-gray-800">Thông tin hành nghề</h3>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Bằng cấp *</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Tiến sĩ y khoa"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Chuyên khoa *</label>
                                        <select
                                            required
                                            className="w-full border rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="">-- Chọn chuyên khoa --</option>
                                            <option value="cardiology">Tim mạch</option>
                                            <option value="pediatrics">Nhi khoa</option>
                                            <option value="dermatology">Da liễu</option>
                                            <option value="orthopedics">Chấn thương chỉnh hình</option>
                                            <option value="neurology">Thần kinh</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Nơi công tác *</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Bệnh viện Bạch Mai"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Phòng khám</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Bệnh viện XYZ"
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Step 4: Giấy phép */}
                            {currentStep === 4 && (
                                <>
                                    <div className="rounded-lg bg-gray-100 p-4 mb-4">
                                        <h3 className="font-semibold text-gray-800">Giấy phép hành nghề</h3>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Số giấy phép hành nghề *</label>
                                        <input
                                            type="text"
                                            placeholder="Nhập số giấy phép"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Đơn vị cấp *</label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Sở Y tế TP.HN"
                                            required
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block mb-1 font-medium text-sm">Ngày cấp *</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium text-sm">Ngày hết hạn *</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-sm">
                                            Tải hồ sơ giấy phép (PDF/Image) *
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            required
                                            className="w-full border rounded-md p-2 file:mr-3 file:py-1 file:px-3 file:border file:rounded-md file:bg-gray-100 file:text-gray-700"
                                        />
                                    </div>

                                    <div className="flex items-start gap-2 mt-4">
                                        <input type="checkbox" id="terms" required className="mt-1" />
                                        <label htmlFor="terms" className="text-sm leading-relaxed text-gray-700">
                                            Tôi đồng ý với{" "}
                                            <Link to="#" className="text-blue-600 hover:underline">
                                                Điều khoản dịch vụ
                                            </Link>{" "}
                                            và{" "}
                                            <Link to="#" className="text-blue-600 hover:underline">
                                                Chính sách bảo mật
                                            </Link>
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Nút điều hướng */}
                            <div className="flex gap-3 pt-4">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
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
                                    {currentStep === 4 ? "Đăng ký" : "Tiếp tục"}
                                </button>
                            </div>
                        </form>

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
