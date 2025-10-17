import React, { useState } from "react";
import {
    CalendarDays,
    Clock,
    MapPin,
    CheckCircle,
    Building2,
    ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FacilityBooking() {
    const navigate = useNavigate(); // Dùng để quay lại
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
        service: "",
        doctor: "",
        reason: "",
        hasInsurance: false,
        insuranceNumber: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const bookingInfo = {
        facilityName: "Bệnh viện Đa khoa Trung ương",
        facilityType: "Bệnh viện công",
        location: "29 Nguyễn Bỉnh Khiêm, Hai Bà Trưng, Hà Nội",
        date: "Thứ 2, 20/01/2025",
        time: "09:00",
        price: "300.000đ",
        image: "/modern-hospital-exterior.png",
    };

    const availableServices = [
        "Khám bệnh tổng quát",
        "Khám chuyên khoa Tim mạch",
        "Khám chuyên khoa Nội khoa",
        "Khám chuyên khoa Ngoại khoa",
        "Khám chuyên khoa Sản phụ khoa",
        "Xét nghiệm",
        "Chẩn đoán hình ảnh",
        "Khám sức khỏe định kỳ",
    ];

    const availableDoctors = [
        { id: "1", name: "BS. Nguyễn Văn An - Tim mạch" },
        { id: "2", name: "BS. Trần Thị Bình - Nội khoa" },
        { id: "3", name: "BS. Lê Minh Cường - Ngoại khoa" },
        { id: "4", name: "BS. Phạm Thị Dung - Sản phụ khoa" },
        { id: "any", name: "Bất kỳ bác sĩ nào có lịch" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (isSubmitted) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Đặt lịch thành công!</h2>
                    <p className="text-gray-600 mb-8">
                        Cảm ơn bạn đã đặt lịch khám. Chúng tôi đã gửi thông tin xác nhận đến
                        email và số điện thoại của bạn.
                    </p>

                    <div className="text-left bg-gray-50 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4">Thông tin lịch khám</h3>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex gap-2 items-start">
                                <Building2 className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                    <p className="font-semibold">{bookingInfo.facilityName}</p>
                                    <p className="text-sm text-gray-500">
                                        {bookingInfo.facilityType}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-start">
                                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                <p>{bookingInfo.location}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <CalendarDays className="h-5 w-5 text-blue-600" />
                                <p>{bookingInfo.date}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <p>{bookingInfo.time}</p>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <span>Tổng chi phí:</span>
                                <span className="font-bold text-blue-600">
                                    {bookingInfo.price}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate("/appointments")}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        >
                            Xem lịch hẹn của tôi
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
                    {/* Nút quay lại */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>Quay lại</span>
                    </button>

                    <h2 className="text-2xl font-bold mb-6">Đặt lịch khám tại cơ sở y tế</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dịch vụ */}
                        <div>
                            <label className="block font-semibold mb-2">Dịch vụ khám *</label>
                            <select
                                value={formData.service}
                                onChange={(e) => handleChange("service", e.target.value)}
                                required
                                className="w-full border rounded-lg p-3"
                            >
                                <option value="">Chọn dịch vụ khám</option>
                                {availableServices.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bác sĩ */}
                        <div>
                            <label className="block font-semibold mb-2">
                                Bác sĩ (tùy chọn)
                            </label>
                            <select
                                value={formData.doctor}
                                onChange={(e) => handleChange("doctor", e.target.value)}
                                className="w-full border rounded-lg p-3"
                            >
                                <option value="">Chọn bác sĩ hoặc để trống</option>
                                {availableDoctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Họ tên & SĐT */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-2">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    required
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">
                                    Số điện thoại *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    required
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>
                        </div>

                        {/* Email & Ngày sinh */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Ngày sinh *</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                                    required
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>
                        </div>

                        {/* Giới tính */}
                        <div>
                            <label className="block font-semibold mb-2">Giới tính *</label>
                            <div className="flex gap-6">
                                {["male", "female", "other"].map((g) => (
                                    <label key={g} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={formData.gender === g}
                                            onChange={(e) => handleChange("gender", e.target.value)}
                                        />
                                        {g === "male"
                                            ? "Nam"
                                            : g === "female"
                                                ? "Nữ"
                                                : "Khác"}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label className="block font-semibold mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                className="w-full border rounded-lg p-3"
                            />
                        </div>

                        {/* Lý do khám */}
                        <div>
                            <label className="block font-semibold mb-2">Lý do khám</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => handleChange("reason", e.target.value)}
                                rows={4}
                                className="w-full border rounded-lg p-3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Xác nhận đặt lịch
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
                    <h3 className="text-lg font-semibold mb-4">Thông tin lịch khám</h3>
                    <img
                        src={bookingInfo.image}
                        alt="facility"
                        className="rounded-lg w-full h-40 object-cover mb-4"
                    />
                    <p className="font-semibold">{bookingInfo.facilityName}</p>
                    <p className="text-sm text-gray-500 mb-2">
                        {bookingInfo.facilityType}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-600" /> {bookingInfo.location}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4 text-blue-600" /> {bookingInfo.date}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" /> {bookingInfo.time}
                    </p>

                    <div className="mt-4 border-t pt-3 flex justify-between">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600 font-bold">{bookingInfo.price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
