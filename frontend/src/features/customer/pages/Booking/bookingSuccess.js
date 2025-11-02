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
        <div className="min-h-screen py-12 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg animate-pulse">
                                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2">Đặt lịch thành công!</h2>
                            <p className="text-green-100 text-lg">
                                Cảm ơn {successData.patientName} đã đặt lịch khám
                            </p>
                        </div>

                        {/* Booking Info */}
                        <div className="p-8 text-left space-y-6">
                            {/* Mã Booking */}
                            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-gray-900">Mã đặt lịch: <span className="text-blue-600">{successData.bookingCode}</span></div>
                                        {successData.reason && (
                                            <div className="text-sm text-gray-600 mt-1">Lý do khám: {successData.reason}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bác sĩ */}
                            <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                                <div className="flex items-start gap-3">
                                    <User className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-bold text-lg text-gray-900">{successData.doctorName}</div>
                                        <div className="text-sm text-gray-600">{successData.specialty}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bệnh viện */}
                            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-6 w-6 text-purple-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-bold text-lg text-gray-900">{successData.hospital}</div>
                                        <div className="text-sm text-gray-600">{successData.location}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Ngày giờ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-6 w-6 text-green-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-semibold">Ngày khám</div>
                                            <div className="font-bold text-gray-900">{successData.date}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-6 w-6 text-orange-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-semibold">Giờ khám</div>
                                            <div className="font-bold text-gray-900">{successData.time}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin liên hệ bệnh nhân */}
                            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">Số điện thoại:</span>
                                        <span>{successData.patientPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">Email:</span>
                                        <span>{successData.patientEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="p-8 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/patient/appointment" className="flex-1 sm:flex-none">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                                        Xem lịch hẹn của tôi
                                    </button>
                                </Link>
                                <Link to="/home" className="flex-1 sm:flex-none">
                                    <button className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-100 transition-all">
                                        Về trang chủ
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}