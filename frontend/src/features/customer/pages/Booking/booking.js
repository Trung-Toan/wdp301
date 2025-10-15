import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, User, FileText, ChevronLeft } from "lucide-react";
import BookingSuccess from "./bookingSuccess";

export function BookingContent() {
    // Lấy thông tin user từ sessionStorage nếu đã login
    const [storedUser] = useState(() => JSON.parse(sessionStorage.getItem("user") || "{}"));
    const location = useLocation();
    const { selectedDate, selectedSlot, doctorName, specialty, hospital, price } = location.state || {};

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "male",
        province: "",
        district: "",
        address: "",
        reason: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (storedUser) {
            setFormData((prev) => ({
                ...prev,
                fullName: storedUser.username || "",
                phone: storedUser.phone_number || "",
                email: storedUser.email || "",
                dateOfBirth: storedUser.dateOfBirth || "",
                gender: storedUser.gender || "male",
            }));
        }
    }, [storedUser]);

    if (!selectedSlot) return <p className="p-4">Vui lòng chọn lịch khám trước</p>;

    // Dữ liệu hiển thị sidebar booking
    const bookingInfo = {
        doctorName,
        specialty,
        hospital,
        location: hospital,
        date: selectedDate,
        time: selectedSlot.time,
        price: price || "Chưa có giá",
        image: "/doctor-portrait-male.jpg",
        doctorId: selectedSlot.doctorId || 1,
    };

    console.log(bookingInfo);


    // Danh sách tỉnh/thành và quận/huyện mẫu
    const provinces = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"];
    const districts = {
        "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Đống Đa", "Tây Hồ"],
        "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Thủ Đức", "Bình Thạnh"],
        "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"],
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: gửi formData lên server nếu cần
        setIsSubmitted(true);
    };

    if (isSubmitted) return <BookingSuccess bookingInfo={bookingInfo} />;

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <Link to={`/home/doctordetail/${storedUser._id}`}>
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

                                {/* Họ tên & SDT */}
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

                                {/* Email & Ngày sinh */}
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
                                            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
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

                                {/* Tỉnh/Thành & Quận/Huyện */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">
                                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={formData.province}
                                            onChange={(e) => {
                                                handleChange("province", e.target.value);
                                                handleChange("district", "");
                                            }}
                                            required
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinces.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">
                                            Quận/Huyện <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={formData.district}
                                            onChange={(e) => handleChange("district", e.target.value)}
                                            required
                                            disabled={!formData.province}
                                        >
                                            <option value="">-- Chọn Quận/Huyện --</option>
                                            {formData.province &&
                                                districts[formData.province].map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Địa chỉ cụ thể */}
                                <div>
                                    <label className="block mb-1 font-medium">Địa chỉ cụ thể</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Số nhà, đường, phường/xã..."
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
                                    src={bookingInfo?.image}
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
                                    <span className="text-2xl font-bold text-blue-600">{bookingInfo.price}</span>
                                </div>
                            </div>

                            {/* Lưu ý */}
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm leading-relaxed text-gray-700">
                                <p className="font-semibold text-yellow-800 mb-1">Lưu ý:</p>
                                <p>
                                    Thông tin anh/chị cung cấp sẽ được sử dụng làm hồ sơ khám bệnh.
                                    Khi điền thông tin, anh/chị vui lòng:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>
                                        Ghi rõ họ và tên, viết hoa những chữ cái đầu tiên, ví dụ: <strong>Trần Văn Phú</strong>.
                                    </li>
                                    <li>
                                        Điền đầy đủ, đúng và kiểm tra lại thông tin trước khi ấn <strong>“Xác nhận”</strong>.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
