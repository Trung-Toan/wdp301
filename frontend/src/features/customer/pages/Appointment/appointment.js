import React, { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Stethoscope,
    Loader2,
    Info,
    Building2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { appointmentApi } from "../../../../api/patients/appointmentApi";

export default function AppointmentsContent() {
    const [selectedTab, setSelectedTab] = useState("upcoming");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Gọi API lấy danh sách lịch hẹn của bệnh nhân
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);

                const patientStr = sessionStorage.getItem("patient");
                if (!patientStr) {
                    setError("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.");
                    return;
                }

                const patient = JSON.parse(patientStr);
                console.log("Patient ID:", patient._id);

                const res = await appointmentApi.getAllAppointmentOfPatient(patient._id);
                console.log("API response:", res.data);

                // Lấy mảng thật và chuẩn hóa status
                const data =
                    Array.isArray(res.data?.data?.data)
                        ? res.data.data.data.map((apt) => ({
                            ...apt,
                            status: apt.status === "scheduled" ? "upcoming" : apt.status,
                        }))
                        : [];

                setAppointments(data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách lịch hẹn");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    // Badge trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case "upcoming":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 rounded-lg text-sm font-semibold">
                        <Clock className="h-3.5 w-3.5" /> Sắp tới
                    </span>
                );
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 rounded-lg text-sm font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Đã khám
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 rounded-lg text-sm font-semibold">
                        <XCircle className="h-3.5 w-3.5" /> Đã hủy
                    </span>
                );
            default:
                return null;
        }
    };

    const handleCancelAppointment = (appointment) => {
        setAppointmentToCancel(appointment);
        setCancelDialogOpen(true);
    };

    const confirmCancel = () => {
        console.log("Cancelling appointment:", appointmentToCancel?.id);
        setCancelDialogOpen(false);
        setAppointmentToCancel(null);
    };

    //  Lọc danh sách theo tab
    const filteredAppointments = appointments.filter(
        (apt) => apt.status === selectedTab
    );

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative z-10 mx-auto" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải lịch hẹn...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border-2 border-red-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                                <CalendarDays className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                    Lịch hẹn của tôi
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Quản lý và theo dõi các lịch khám của bạn
                                </p>
                            </div>
                        </div>
                <button
                    onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all font-medium shadow-sm hover:shadow-md"
                >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                </button>
                    </div>

                {/* Tabs */}
                    <div className="flex flex-wrap gap-3 mb-6">
                    {["upcoming", "completed", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                                    selectedTab === tab
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                }`}
                            >
                                {tab === "upcoming" && (
                                    <>
                                        <Clock className="h-4 w-4" />
                                        Sắp tới
                                    </>
                                )}
                                {tab === "completed" && (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Đã khám
                                    </>
                                )}
                                {tab === "cancelled" && (
                                    <>
                                        <XCircle className="h-4 w-4" />
                                        Đã hủy
                                    </>
                                )}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center border-2 border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarDays className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-700 text-lg font-semibold mb-2">
                            Không có lịch hẹn nào trong mục này
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            Lịch hẹn của bạn sẽ hiển thị tại đây
                        </p>
                        <Link to="/doctors">
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg hover:shadow-xl">
                                <CalendarDays className="h-4 w-4" />
                                Đặt lịch khám
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                    <div className="relative flex-shrink-0">
                                <img
                                    src={appointment.image || "/placeholder.svg"}
                                    alt={appointment.doctorName}
                                            className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                                />
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
                                            <Stethoscope className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                        <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {appointment.doctorName}
                                            </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Stethoscope className="h-4 w-4 text-blue-500" />
                                                    <p className="text-gray-600 text-sm">
                                                {appointment.specialty}
                                            </p>
                                                </div>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                            {appointment.hospital && (
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                    <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">{appointment.hospital}</span>
                                                </div>
                                            )}
                                            {appointment.date && (
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm font-semibold text-gray-700">{appointment.date}</span>
                                                </div>
                                            )}
                                            {(appointment.time || appointment.end_time) && (
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                    <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">
                                                        {appointment.time || "?"} - {appointment.end_time || "?"}
                                                    </span>
                                                </div>
                                            )}
                                            {appointment.location && [
                                                appointment.location?.alley,
                                                appointment.location?.houseNumber,
                                                appointment.location?.ward?.name,
                                                appointment.location?.province?.name
                                            ].filter(Boolean).length > 0 && (
                                                <div className="flex items-start gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 md:col-span-2">
                                                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-gray-700">
                                            {[
                                                appointment.location?.alley,
                                                appointment.location?.houseNumber,
                                                appointment.location?.ward?.name,
                                                appointment.location?.province?.name
                                            ]
                                                .filter(Boolean)
                                                .join(' - ')}
                                                    </span>
                                        </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setSelectedAppointment(appointment)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-md hover:shadow-lg"
                                        >
                                                <Info className="h-4 w-4" />
                                            Xem chi tiết
                                        </button>
                                        {appointment.status === "upcoming" && (
                                            <button
                                                onClick={() => handleCancelAppointment(appointment)}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
                                            >
                                                    <XCircle className="h-4 w-4" />
                                                Hủy lịch
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}

                {/* Modal chi tiết */}
                {selectedAppointment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 text-white p-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">Chi tiết lịch hẹn</h2>
                                            <p className="text-white/90 text-sm">Thông tin đầy đủ về cuộc hẹn</p>
                                        </div>
                                    </div>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all"
                            >
                                        <XCircle className="h-5 w-5" />
                            </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Doctor Info */}
                                <div className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                                    <img
                                        src={selectedAppointment.image || "/placeholder.svg"}
                                        alt={selectedAppointment.doctorName}
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {selectedAppointment.doctorName}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                            <Stethoscope className="h-4 w-4 text-blue-500" />
                                            {selectedAppointment.specialty}
                                        </p>
                                        {getStatusBadge(selectedAppointment.status)}
                                    </div>
                                </div>

                                {/* Appointment Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-blue-600" />
                                        Thông tin lịch khám
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedAppointment.hospital && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm text-gray-700">{selectedAppointment.hospital}</span>
                                        </div>
                                        )}
                                        {selectedAppointment.date && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-700">{selectedAppointment.date}</span>
                                        </div>
                                        )}
                                        {(selectedAppointment.time || selectedAppointment.end_time) && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg sm:col-span-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm text-gray-700">
                                            {selectedAppointment.time || "?"} - {selectedAppointment.end_time || "?"}
                                                </span>
                                        </div>
                                        )}
                                    </div>
                                </div>

                                {/* Patient Info */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        Thông tin bệnh nhân
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedAppointment.patientName && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">{selectedAppointment.patientName}</span>
                                            </div>
                                        )}
                                        {selectedAppointment.phone && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">{selectedAppointment.phone}</span>
                                        </div>
                                        )}
                                        {selectedAppointment.reason && (
                                            <div className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg">
                                                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-700">Lý do khám: </span>
                                                    <span className="text-sm text-gray-700">{selectedAppointment.reason}</span>
                                        </div>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 p-6 bg-gray-50">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setSelectedAppointment(null)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-md hover:shadow-lg"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal xác nhận hủy */}
                {cancelDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận hủy lịch hẹn</h2>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                Bạn có chắc chắn muốn hủy lịch hẹn với{" "}
                                        <span className="font-semibold text-gray-900">{appointmentToCancel?.doctorName}</span> vào{" "}
                                        <span className="font-semibold text-gray-900">{appointmentToCancel?.date}</span> lúc{" "}
                                        <span className="font-semibold text-gray-900">{appointmentToCancel?.time}</span>?
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setCancelDialogOpen(false)}
                                        className="flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                                >
                                    Không
                                </button>
                                <button
                                    onClick={confirmCancel}
                                        className="flex-1 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-semibold shadow-md hover:shadow-lg"
                                >
                                    Xác nhận hủy
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
