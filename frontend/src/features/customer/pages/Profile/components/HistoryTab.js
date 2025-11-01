import React, { useEffect, useState } from "react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
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
        const patientData = JSON.parse(sessionStorage.getItem("patient"));
        const pid = patientData?._id;
        setPatientId(pid);

        if (!pid) {
            console.error("Không tìm thấy patientId từ dữ liệu đăng nhập");
            setLoading(false);
            return;
        }

        // Gọi API lấy lịch sử khám
        medicalRecordPatientApi
            .getListMedicalRecordsByPatientId(pid)
            .then((res) => {
                const list = res.data?.data?.data || [];
                setAppointments(list);
            })
            .catch((err) => console.error("Lỗi tải lịch hẹn:", err))
            .finally(() => setLoading(false));
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

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Hiển thị địa chỉ nếu là object
    const formatAddress = (address) => {
        console.log("Address information: ", address);
        if (!address) return "Không rõ";
        if (typeof address === "string") return address;
        return `${address.houseNumber || ""} ${address.street || ""} ${address.alley || ""}, ${address.ward.name || ""}, ${address.province.name || ""}`;
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
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Stethoscope className="h-6 w-6 text-sky-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Lịch sử khám bệnh</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-16 w-16 animate-spin text-sky-600 relative z-10" />
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Đang tải lịch sử khám...</p>
                </div>
            ) : !patientId ? (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-lg">Không tìm thấy thông tin bệnh nhân</p>
                    <p className="text-red-600 text-sm mt-2">Vui lòng đăng nhập lại</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-700 text-lg font-semibold mb-2">Chưa có lịch sử khám nào</p>
                    <p className="text-gray-500 text-sm">Lịch sử khám bệnh của bạn sẽ hiển thị tại đây</p>
                </div>
            ) : (
                <>
                    {/* Appointments List */}
                    <div className="space-y-4">
                        {currentAppointments.map((a) => (
                            <div
                                key={a._id}
                                className="group bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 hover:border-sky-300 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                                                <CalendarDays className="h-5 w-5 text-sky-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-sky-700 transition-colors">
                                                    {a.specialty || "Không rõ chuyên khoa"}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{a.date || formatDate(a.scheduled_date)}</span>
                                                    </div>
                                                    {a.time && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <span>{a.time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold w-fit
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
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : a.status === "CANCELLED" ? (
                                                    <XCircle className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                                {a.status === "SCHEDULED" ? "Đã đặt lịch" : 
                                                 a.status === "COMPLETED" ? "Hoàn thành" : 
                                                 a.status === "CANCELLED" ? "Đã hủy" : 
                                                 a.status || "Không rõ"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Action */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => handleShowDetails(a)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                        >
                                            <Info className="h-4 w-4" />
                                            Chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 font-medium">
                                Trang <span className="font-bold text-sky-600">{currentPage}</span> / <span className="font-bold text-gray-700">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                                        currentPage === 1
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-sky-600 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm hover:shadow-md"
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                                        currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-sky-600 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm hover:shadow-md"
                                    }`}
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal xem chi tiết */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/50">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-purple-400/20"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Info className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-bold mb-1 drop-shadow-lg">Chi tiết lịch hẹn</h3>
                                        <p className="text-white/90 text-sm font-medium">Thông tin đầy đủ về cuộc hẹn</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                            {/* Status Badge */}
                            <div className="flex justify-center">
                                <span
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
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
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : selectedAppointment.status === "CANCELLED" ? (
                                        <XCircle className="w-5 h-5" />
                                    ) : (
                                        <Clock className="w-5 h-5" />
                                    )}
                                    {selectedAppointment.status === "SCHEDULED" ? "Đã đặt lịch" : 
                                     selectedAppointment.status === "COMPLETED" ? "Hoàn thành" : 
                                     selectedAppointment.status === "CANCELLED" ? "Đã hủy" : 
                                     selectedAppointment.status || "Không rõ"}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Bác sĩ */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Bác sĩ</p>
                                    </div>
                                    <p className="text-base font-bold text-gray-900">{selectedAppointment.doctorName || "Không rõ"}</p>
                                </div>

                                {/* Chuyên khoa */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Stethoscope className="h-4 w-4 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Chuyên khoa</p>
                                    </div>
                                    <p className="text-base font-bold text-gray-900">{selectedAppointment.specialty || "Không rõ"}</p>
                                </div>

                                {/* Bệnh viện */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-4 w-4 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Bệnh viện</p>
                                    </div>
                                    <p className="text-base font-bold text-gray-900">{selectedAppointment.hospital || "Không rõ"}</p>
                                </div>

                                {/* Ngày khám */}
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CalendarDays className="h-4 w-4 text-sky-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Ngày khám</p>
                                    </div>
                                    <p className="text-base font-bold text-gray-900">{selectedAppointment.date || formatDate(selectedAppointment.scheduled_date)}</p>
                                </div>

                                {/* Giờ khám */}
                                {selectedAppointment.time && (
                                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-sky-600" />
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Giờ khám</p>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{selectedAppointment.time}</p>
                                    </div>
                                )}
                            </div>

                            {/* Địa điểm */}
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-4 w-4 text-sky-600" />
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Địa điểm</p>
                                </div>
                                <p className="text-base font-bold text-gray-900">{formatAddress(selectedAppointment.location)}</p>
                            </div>

                            {/* Lý do khám */}
                            {selectedAppointment.reason && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Lý do khám</p>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{selectedAppointment.reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 border-t border-gray-200 bg-white/90 backdrop-blur-sm p-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
