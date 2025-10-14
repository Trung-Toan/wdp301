import React from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, Stethoscope, Building2 } from "lucide-react";

export default function RegisterTypeSelection() {
    const navigate = useNavigate();

    const accountTypes = [
        {
            id: "patient",
            title: "Bệnh nhân",
            description: "Đăng ký tài khoản đặt lịch khám và quản lý sức khỏe",
            icon: UserCircle,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            features: ["Giấy phép hoạt động", "Thông tin cơ sở y tế", "Đội ngũ y bác sĩ"],
        },
        {
            id: "doctor",
            title: "Bác sĩ",
            description: "Đăng ký tài khoản bác sĩ để khám chữa bệnh",
            icon: Stethoscope,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            features: ["Bằng cấp chuyên môn", "Giấy phép hành nghề", "Xem kết quả khám"],
        },
        {
            id: "clinic",
            title: "Phòng khám",
            description: "Đăng ký phòng khám đặt lịch quản lý hoạt động y tế",
            icon: Building2,
            color: "text-teal-600",
            bgColor: "bg-teal-50",
            borderColor: "border-teal-200",
            features: ["Giấy phép hoạt động", "Thông tin cơ sở y tế", "Đội ngũ y bác sĩ"],
        },
    ];

    const handleSelectType = (type) => {
        navigate(`/register/${type}`);
    };

    return (
        <main className="flex-1 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h1>
                        <p className="mt-2 text-gray-500">Chọn loại tài khoản bạn muốn đăng ký</p>
                    </div>

                    {/* Account Type Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {accountTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <div
                                    key={type.id}
                                    onClick={() => handleSelectType(type.id)}
                                    className={`cursor-pointer border-2 rounded-2xl bg-white p-6 transition-all hover:shadow-lg ${type.borderColor}`}
                                >
                                    <div className="text-center">
                                        <div
                                            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${type.bgColor}`}
                                        >
                                            <Icon className={`h-10 w-10 ${type.color}`} />
                                        </div>
                                        <h2 className="text-xl font-semibold">{type.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectType(type.id);
                                            }}
                                            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                                        >
                                            Đăng ký ngay
                                        </button>

                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500">Yêu cầu:</p>
                                            <ul className="space-y-1 text-xs text-gray-500">
                                                {type.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Login Link */}
                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Đã có tài khoản?</span>{" "}
                        <a href="/login" className="font-medium text-blue-600 hover:underline">
                            Đăng nhập ngay
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
