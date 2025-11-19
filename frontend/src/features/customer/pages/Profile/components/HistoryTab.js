import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
import { withMinLoadingTime } from "../../../../../utils/loadingUtils";
import {
    Clock,
    CalendarDays,
    Stethoscope,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Info,
    Loader2,
    FileText,
    MapPin,
    User,
    Building2,
    AlertCircle,
    X,
} from "lucide-react";

export default function HistoryTab() {
    const [appointments, setAppointments] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Modal
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            const patientData = JSON.parse(sessionStorage.getItem("patient"));
            const pid = patientData?._id;
            setPatientId(pid);

            if (!pid) {
                console.error("Không tìm thấy patientId từ dữ liệu đăng nhập");
                setLoading(false);
                return;
            }

            try {
                // Gọi API lấy lịch sử khám với minimum loading time
                const res = await withMinLoadingTime(
                    () => medicalRecordPatientApi.getListMedicalRecordsByPatientId(pid),
                    setLoading,
                    600 // Minimum 600ms loading time
                );
                const list = res.data?.data?.data || [];
                // Chỉ lấy những lịch sử khám đã completed
                const completedAppointments = list.filter(
                    (appointment) => appointment.status === "completed"
                );
                setAppointments(completedAppointments);
            } catch (err) {
                console.error("Lỗi tải lịch hẹn:", err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Xử lý phân trang
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Format ngày tháng đẹp hơn
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (e) {
            return dateString;
        }
    };

    // Format giờ từ date string
    const formatTime = (dateString) => {
        if (!dateString) return null;
        try {
            const d = new Date(dateString);
            return d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return null;
        }
    };

    // Format ngày ngắn gọn
    const formatDateShort = (dateString) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (e) {
            return dateString;
        }
    };

    // Hiển thị địa chỉ nếu là object
    const formatAddress = (address) => {
        if (!address) return "Không rõ";
        if (typeof address === "string") return address;

        const parts = [];
        if (address.houseNumber) parts.push(address.houseNumber);
        if (address.alley) parts.push(address.alley);
        if (address.street) parts.push(address.street);

        if (address.ward) {
            const wardName = typeof address.ward === 'object' ? address.ward.name : address.ward;
            if (wardName) parts.push(wardName);
        }

        if (address.district) {
            const districtName = typeof address.district === 'object' ? address.district.name : address.district;
            if (districtName) parts.push(districtName);
        }

        if (address.province) {
            const provinceName = typeof address.province === 'object' ? address.province.name : address.province;
            if (provinceName) parts.push(provinceName);
        }

        return parts.length > 0 ? parts.join(", ") : "Không rõ";
    };

    const handleShowDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-5 sm:p-6 border border-white/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Stethoscope className="h-5 w-5 text-sky-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Lịch sử khám bệnh</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-12 w-12 animate-spin text-sky-600 relative z-10" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium text-sm">Đang tải lịch sử khám...</p>
                </div>
            ) : !patientId ? (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-base">Không tìm thấy thông tin bệnh nhân</p>
                    <p className="text-red-600 text-xs mt-1.5">Vui lòng đăng nhập lại</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 text-base font-semibold mb-1.5">Chưa có lịch sử khám đã hoàn thành</p>
                    <p className="text-gray-500 text-xs">Chỉ các lịch khám đã hoàn thành sẽ hiển thị tại đây</p>
                </div>
            ) : (
                <>
                    {/* Appointments List */}
                    <div className="space-y-3">
                        {currentAppointments.map((a, index) => {
                            const displayTime = a.time || formatTime(a.scheduled_date);
                            const displayDate = a.date || formatDateShort(a.scheduled_date);

                            return (
                                <div
                                    key={a._id}
                                    className="group bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 hover:border-sky-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 min-h-[180px]"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-3 h-full">
                                        {/* Left: Info */}
                                        <div className="flex-1 flex flex-col justify-between space-y-3">
                                            {/* Main Info */}
                                            <div className="flex items-start gap-2.5">
                                                <div className="flex-shrink-0 p-2 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg group-hover:scale-105 transition-transform">
                                                    <CalendarDays className="h-4 w-4 text-sky-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 group-hover:text-sky-700 transition-colors line-clamp-2">
                                                        {a.specialty || a.specialty_name || "Không rõ chuyên khoa"}
                                                    </h3>

                                                    {/* Date & Time */}
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                                                        <div className="flex items-center gap-1 bg-white/60 px-2.5 py-1 rounded-md border border-gray-200">
                                                            <CalendarDays className="h-3 w-3 text-sky-500" />
                                                            <span className="font-semibold text-gray-700">{displayDate}</span>
                                                        </div>
                                                        {displayTime && (
                                                            <div className="flex items-center gap-1 bg-white/60 px-2.5 py-1 rounded-md border border-gray-200">
                                                                <Clock className="h-3 w-3 text-sky-500" />
                                                                <span className="font-medium">{displayTime}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Doctor & Hospital Info */}
                                                    {(a.doctorName || a.doctor_name || a.hospital || a.clinic_name) && (
                                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-2">
                                                            {a.doctorName || a.doctor_name ? (
                                                                <div className="flex items-center gap-1">
                                                                    <User className="h-3 w-3 text-gray-400" />
                                                                    <span className="font-medium line-clamp-1">{a.doctorName || a.doctor_name}</span>
                                                                </div>
                                                            ) : null}
                                                            {a.hospital || a.clinic_name ? (
                                                                <>
                                                                    <span className="text-gray-300">•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Building2 className="h-3 w-3 text-gray-400" />
                                                                        <span className="line-clamp-1">{a.hospital || a.clinic_name}</span>
                                                                    </div>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge - Always at bottom */}
                                            <div className="flex items-center gap-2 mt-auto">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold w-fit
                                                    ${a.status === "SCHEDULED"
                                                            ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200"
                                                            : a.status === "COMPLETED"
                                                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                                                                : a.status === "CANCELLED"
                                                                    ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
                                                                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200"
                                                        }`}
                                                >
                                                    {a.status === "COMPLETED" ? (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    ) : a.status === "CANCELLED" ? (
                                                        <XCircle className="w-3 h-3" />
                                                    ) : (
                                                        <Clock className="w-3 h-3" />
                                                    )}
                                                    {a.status === "SCHEDULED" ? "Đã đặt lịch" :
                                                        a.status === "COMPLETED" ? "Hoàn thành" :
                                                            a.status === "CANCELLED" ? "Đã hủy" :
                                                                a.status || "Không rõ"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: Action */}
                                        <div className="flex-shrink-0 flex items-start sm:items-center">
                                            <button
                                                onClick={() => handleShowDetails(a)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm w-full sm:w-auto justify-center"
                                            >
                                                <Info className="h-3.5 w-3.5" />
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-600 font-medium">
                                Trang <span className="font-bold text-sky-600">{currentPage}</span> / <span className="font-bold text-gray-700">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 text-sm ${currentPage === 1
                                        ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                                        : "bg-white text-sky-600 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm hover:shadow-md"
                                        }`}
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Trước
                                </button>

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 text-sm ${currentPage === totalPages
                                        ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                                        : "bg-white text-sky-600 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm hover:shadow-md"
                                        }`}
                                >
                                    Sau
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal xem chi tiết - Render ra ngoài bằng Portal */}
            {showModal && selectedAppointment && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn pointer-events-none overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                    style={{
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col border-2 border-gray-200 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 text-white p-4 sm:p-5 rounded-t-2xl relative overflow-hidden">
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                        <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold mb-0.5 drop-shadow-lg">Chi tiết lịch hẹn</h3>
                                        <p className="text-white/90 text-xs font-medium">Thông tin đầy đủ về cuộc hẹn</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div
                            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0"
                            style={{
                                scrollBehavior: 'smooth',
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#cbd5e1 #f1f5f9'
                            }}
                        >
                            {/* Status Badge */}
                            <div className="flex justify-center">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold
                                        ${selectedAppointment.status === "SCHEDULED"
                                            ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-2 border-blue-200"
                                            : selectedAppointment.status === "COMPLETED"
                                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200"
                                                : selectedAppointment.status === "CANCELLED"
                                                    ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-2 border-red-200"
                                                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-2 border-gray-200"
                                        }`}
                                >
                                    {selectedAppointment.status === "COMPLETED" ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : selectedAppointment.status === "CANCELLED" ? (
                                        <XCircle className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                    {selectedAppointment.status === "SCHEDULED" ? "Đã đặt lịch" :
                                        selectedAppointment.status === "COMPLETED" ? "Hoàn thành" :
                                            selectedAppointment.status === "CANCELLED" ? "Đã hủy" :
                                                selectedAppointment.status || "Không rõ"}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Bác sĩ */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg border border-sky-200">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <User className="h-3.5 w-3.5 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Bác sĩ</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{selectedAppointment.doctorName || selectedAppointment.doctor_name || "Không rõ"}</p>
                                </div>

                                {/* Chuyên khoa */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg border border-sky-200">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Chuyên khoa</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{selectedAppointment.specialty || selectedAppointment.specialty_name || "Không rõ"}</p>
                                </div>

                                {/* Bệnh viện */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg border border-sky-200">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Bệnh viện/Phòng khám</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{selectedAppointment.hospital || selectedAppointment.clinic_name || "Không rõ"}</p>
                                </div>

                                {/* Ngày khám */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg border border-sky-200">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Ngày khám</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{selectedAppointment.date || formatDate(selectedAppointment.scheduled_date)}</p>
                                </div>

                                {/* Giờ khám */}
                                {(selectedAppointment.time || formatTime(selectedAppointment.scheduled_date)) && (
                                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg border border-sky-200">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Clock className="h-3.5 w-3.5 text-sky-600" />
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Giờ khám</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{selectedAppointment.time || formatTime(selectedAppointment.scheduled_date)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Địa điểm */}
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg border border-sky-200">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-sky-600" />
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Địa điểm</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{formatAddress(selectedAppointment.location)}</p>
                            </div>

                            {/* Lý do khám */}
                            {selectedAppointment.reason && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <FileText className="h-3.5 w-3.5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Lý do khám</p>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed">{selectedAppointment.reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Custom scrollbar styles */}
            <style>{`
                div[class*="overflow-y-auto"]::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                div[class*="overflow-y-auto"]::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                div[class*="overflow-y-auto"]::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                div[class*="overflow-y-auto"]::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

        </div>
    );
}
