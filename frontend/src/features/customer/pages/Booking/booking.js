import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    FileText,
    ChevronLeft,
} from "lucide-react";
import BookingSuccess from "./bookingSuccess";

// Nếu chưa có Button, Card... bạn có thể tạo sẵn component tái sử dụng
// Ở đây mình viết trực tiếp bằng Tailwind để dùng ngay

export function BookingContent() {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
        reason: "",
        hasInsurance: false,
        insuranceNumber: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    // Mock data
    const bookingInfo = {
        doctorId: 1,
        doctorName: "BS. Nguyễn Văn An",
        specialty: "Tim mạch",
        hospital: "Bệnh viện Đa khoa Trung ương",
        location: "Hà Nội",
        date: "Thứ 2, 20/01/2025",
        time: "09:00",
        price: "500.000đ",
        image: "/doctor-portrait-male.jpg",
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (isSubmitted) {
        return <BookingSuccess bookingInfo={bookingInfo} />;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <Link to={`/home/doctordetail/${bookingInfo.doctorId}`}>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
                        <ChevronLeft className="h-4 w-4" /> Quay lại
                    </button>
                </Link>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-2">Thông tin đặt lịch khám</h2>
                        <p className="text-gray-500 mb-6">
                            Vui lòng điền đầy đủ thông tin để hoàn tất đặt lịch
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Thông tin cá nhân */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" /> Thông tin bệnh nhân
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2"
                                            placeholder="Nguyễn Văn A"
                                            value={formData.fullName}
                                            onChange={(e) => handleChange("fullName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full border rounded-lg p-2"
                                            placeholder="0912345678"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">Email</label>
                                        <input
                                            type="email"
                                            className="w-full border rounded-lg p-2"
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">
                                            Ngày sinh <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.dateOfBirth}
                                            onChange={(e) =>
                                                handleChange("dateOfBirth", e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Giới tính */}
                                <div>
                                    <label className="block mb-2 font-medium">
                                        Giới tính <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-6">
                                        {["male", "female", "other"].map((g) => (
                                            <label key={g} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    value={g}
                                                    checked={formData.gender === g}
                                                    onChange={(e) => handleChange("gender", e.target.value)}
                                                />
                                                {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Địa chỉ</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Số nhà, đường, quận/huyện..."
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Lý do khám */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> Thông tin khám bệnh
                                </h3>
                                <div>
                                    <label className="block mb-1 font-medium">Lý do khám</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Mô tả triệu chứng..."
                                        value={formData.reason}
                                        onChange={(e) => handleChange("reason", e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasInsurance}
                                        onChange={(e) =>
                                            handleChange("hasInsurance", e.target.checked)
                                        }
                                    />
                                    <span>Tôi có bảo hiểm y tế</span>
                                </div>

                                {formData.hasInsurance && (
                                    <div className="ml-6">
                                        <label className="block mb-1 font-medium">
                                            Số thẻ bảo hiểm y tế
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.insuranceNumber}
                                            onChange={(e) =>
                                                handleChange("insuranceNumber", e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Điều khoản */}
                            <div className="flex items-start gap-2">
                                <input type="checkbox" required />
                                <p className="text-sm">
                                    Tôi đồng ý với{" "}
                                    <Link to="/terms" className="text-blue-600 underline">
                                        điều khoản sử dụng
                                    </Link>{" "}
                                    và{" "}
                                    <Link to="/privacy" className="text-blue-600 underline">
                                        chính sách bảo mật
                                    </Link>
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Xác nhận đặt lịch
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow p-6 sticky top-24">
                            <h3 className="font-semibold mb-4">Thông tin lịch khám</h3>
                            <div className="flex gap-4">
                                <img
                                    src={bookingInfo.image}
                                    alt={bookingInfo.doctorName}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold">{bookingInfo.doctorName}</h4>
                                    <p className="text-sm text-gray-500">{bookingInfo.specialty}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex gap-3 text-sm">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div>{bookingInfo.hospital}</div>
                                        <div className="text-gray-500">{bookingInfo.location}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    {bookingInfo.date}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    {bookingInfo.time}
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Phí khám:</span>
                                    <span className="font-semibold">{bookingInfo.price}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-500">Phí dịch vụ:</span>
                                    <span className="font-semibold">Miễn phí</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t">
                                    <span className="font-semibold">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {bookingInfo.price}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 pt-4 border-t">
                                Bạn có thể thanh toán trực tiếp hoặc chuyển khoản trước khi đến
                                khám.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
