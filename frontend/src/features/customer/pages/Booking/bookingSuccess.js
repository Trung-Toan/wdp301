// src/components/BookingSuccess.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, User, MapPin, Calendar, Clock, FileText } from "lucide-react";

// Helper format date/time
const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
});

const formatTime = (isoDate) => new Date(isoDate).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
});

export default function BookingSuccess({ bookingInfo }) {
    if (!bookingInfo) return null;

    // Gán dữ liệu gọn gàng từ object bookingInfo.data
    const data = bookingInfo.data;

    // CẬP NHẬT Ở ĐÂY 👇
    const doctorTitle = data.doctor_id?.title;
    const doctorFullName = data.doctor_id?.user_id?.full_name;
    const formattedDoctorName = [doctorTitle, doctorFullName].filter(Boolean).join(" ");

    const successData = {
        // CẬP NHẬT doctorName
        doctorName: formattedDoctorName || "Không xác định",
        // LƯU Ý: Nếu muốn hiển thị bằng cấp (degree) riêng, bạn có thể lấy: 
        // degree: data.doctor_id?.degree || "Không xác định", 

        specialty: data.specialty_id?.name || "Không xác định",
        hospital: data.clinic_id?.name || "Không xác định",
        location: [
            data.clinic_id?.address?.houseNumber,
            data.clinic_id?.address?.street,
            data.clinic_id?.address?.ward?.name,
            data.clinic_id?.address?.province?.name
        ].filter(Boolean).join(", "),
        date: formatDate(data.scheduled_date),
        time: formatTime(data.booked_at),
        price: data.fee_amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
        bookingCode: data.booking_code,
        reason: data.reason,
        patientName: data.full_name,
        patientPhone: data.phone,
        patientEmail: data.email
    };
    // ... phần còn lại của component không đổi

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-2">Đặt lịch thành công!</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            Cảm ơn {successData.patientName} đã đặt lịch khám. Thông tin xác nhận đã được gửi đến email: {successData.patientEmail}.
                        </p>

                        {/* Booking Info */}
                        <div className="bg-gray-50 rounded-lg border p-6 mb-8 text-left space-y-4">

                            {/* Mã Booking */}
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                    <div className="font-semibold">Mã đặt lịch: {successData.bookingCode}</div>
                                    <div className="text-sm text-gray-500">Lý do khám: {successData.reason}</div>
                                </div>
                            </div>

                            {/* Bác sĩ */}
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                    <div className="font-semibold">{successData.doctorName}</div>
                                    <div className="text-sm text-gray-500">{successData.specialty}</div>
                                </div>
                            </div>

                            {/* Bệnh viện */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                    <div className="font-semibold">{successData.hospital}</div>
                                    <div className="text-sm text-gray-500">{successData.location}</div>
                                </div>
                            </div>

                            {/* Ngày giờ */}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span>{successData.date}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span>{successData.time}</span>
                            </div>

                            {/* Tổng chi phí */}
                            <div className="pt-4 border-t flex justify-between">
                                <span className="text-gray-500 font-semibold">Tổng chi phí:</span>
                                <span className="text-2xl font-bold text-blue-600">{successData.price}</span>
                            </div>

                            {/* Thông tin liên hệ bệnh nhân */}
                            <div className="pt-4 border-t text-sm text-gray-600 space-y-1">
                                <div>Số điện thoại: {successData.patientPhone}</div>
                                <div>Email: {successData.patientEmail}</div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/home/appointment">
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Xem lịch hẹn của tôi
                                </button>
                            </Link>
                            <Link to="/home">
                                <button className="px-6 py-3 border rounded-lg hover:bg-gray-100">
                                    Về trang chủ
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}