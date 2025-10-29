import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Phone, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { appointmentApi } from "../../../api/patients/appointmentApi";

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            const patientId = user?.patient?._id || user?._id;
            if (!patientId) {
                throw new Error("Không tìm thấy thông tin bệnh nhân");
            }

            const params = {
                page: 1,
                limit: 50,
            };

            // Map filter to backend status
            if (filter === "upcoming") {
                params.status = "SCHEDULED";
            } else if (filter === "completed") {
                params.status = "COMPLETED";
            } else if (filter === "cancelled") {
                params.status = "CANCELLED";
            }

            const response = await appointmentApi.getAllAppointmentOfPatient(patientId, params);
            setAppointments(response.data.data || []);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setError(err.message || "Không thể tải danh sách lịch hẹn");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            upcoming: { text: "Sắp tới", color: "bg-blue-100 text-blue-800" },
            completed: { text: "Đã hoàn thành", color: "bg-green-100 text-green-800" },
            cancelled: { text: "Đã hủy", color: "bg-red-100 text-red-800" },
            missed: { text: "Đã bỏ lỡ", color: "bg-gray-100 text-gray-800" },
        };

        return badges[status] || { text: status, color: "bg-gray-100 text-gray-800" };
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "upcoming":
                return <Calendar className="h-5 w-5 text-blue-600" />;
            case "completed":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "cancelled":
            case "missed":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Calendar className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-gray-50 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Lịch hẹn của tôi
                    </h1>
                    <p className="text-gray-600">
                        Quản lý và theo dõi các lịch hẹn khám bệnh của bạn
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { value: "all", label: "Tất cả" },
                        { value: "upcoming", label: "Sắp tới" },
                        { value: "completed", label: "Đã hoàn thành" },
                        { value: "cancelled", label: "Đã hủy" },
                    ].map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setFilter(item.value)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                filter === item.value
                                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-sky-300"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchAppointments}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Appointments List */}
                {!loading && !error && (
                    <>
                        {appointments.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Chưa có lịch hẹn nào
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {filter === "all"
                                        ? "Bạn chưa có lịch hẹn nào trong hệ thống"
                                        : `Không có lịch hẹn nào trong danh mục "${
                                              filter === "upcoming"
                                                  ? "Sắp tới"
                                                  : filter === "completed"
                                                  ? "Đã hoàn thành"
                                                  : "Đã hủy"
                                          }"`}
                                </p>
                                <a
                                    href="/home/facility"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all"
                                >
                                    Đặt lịch khám ngay
                                </a>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {appointments.map((appointment) => {
                                    const badge = getStatusBadge(appointment.status);
                                    return (
                                        <div
                                            key={appointment.id}
                                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(appointment.status)}
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-900">
                                                                {appointment.doctorName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {appointment.specialty}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                                                    >
                                                        {badge.text}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-2 text-gray-700">
                                                        <Calendar className="h-4 w-4 mt-1 flex-shrink-0 text-sky-600" />
                                                        <div className="text-sm">
                                                            <p className="font-medium">{appointment.date}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-gray-700">
                                                        <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-sky-600" />
                                                        <div className="text-sm">
                                                            <p className="font-medium">
                                                                {appointment.time}
                                                                {appointment.end_time && ` - ${appointment.end_time}`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-gray-700">
                                                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-sky-600" />
                                                        <div className="text-sm">
                                                            <p className="font-medium">{appointment.hospital}</p>
                                                            {appointment.location && (
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {appointment.location}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-gray-700">
                                                        <User className="h-4 w-4 mt-1 flex-shrink-0 text-sky-600" />
                                                        <div className="text-sm">
                                                            <p className="font-medium">{appointment.patientName}</p>
                                                            {appointment.phone && (
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {appointment.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {appointment.reason && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                        <div className="flex items-start gap-2 text-gray-700">
                                                            <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-sky-600" />
                                                            <div className="text-sm">
                                                                <p className="font-medium text-gray-900 mb-1">
                                                                    Lý do khám:
                                                                </p>
                                                                <p className="text-gray-600">{appointment.reason}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {appointment.price && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Phí khám:</span>
                                                        <span className="text-lg font-bold text-sky-600">
                                                            {appointment.price}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

