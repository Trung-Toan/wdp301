import React, { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreVertical,
    Hospital,
    ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { appointmentApi } from "../../../../api/patients/appointmentApi";

export default function AppointmentsContent() {
    const navigate = useNavigate(); // 👉 Dùng để quay lại

    const [selectedTab, setSelectedTab] = useState("upcoming");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

                const data =
                    Array.isArray(res.data?.data?.data)
                        ? res.data.data.data.map((apt) => ({
                            ...apt,
                            status:
                                apt.status === "scheduled" ? "upcoming" : apt.status,
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

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        const base = "px-2 py-1 text-sm rounded-md flex items-center gap-1 font-medium w-fit";
        switch (status) {
            case "upcoming":
                return (
                    <span className={`${base} bg-blue-100 text-blue-700`}>
                        <Clock className="h-4 w-4" /> Sắp tới
                    </span>
                );
            case "completed":
                return (
                    <span className={`${base} bg-green-100 text-green-700`}>
                        <CheckCircle2 className="h-4 w-4" /> Đã khám
                    </span>
                );
            case "cancelled":
                return (
                    <span className={`${base} bg-red-100 text-red-700`}>
                        <XCircle className="h-4 w-4" /> Đã hủy
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

    const filteredAppointments = appointments.filter(
        (apt) => apt.status === selectedTab
    );

    if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                {/* 🔙 Nút quay lại */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Quay lại
                </button>

                <h1 className="text-3xl font-bold mb-2">Lịch hẹn của tôi</h1>
                <p className="text-gray-600 mb-8">Quản lý và theo dõi các lịch khám của bạn</p>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    {["upcoming", "completed", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium ${selectedTab === tab
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {tab === "upcoming" && "Sắp tới"}
                            {tab === "completed" && "Đã khám"}
                            {tab === "cancelled" && "Đã hủy"}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center">
                        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            Không có lịch hẹn nào trong mục này
                        </p>
                        <Link to="/doctors">
                            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                                Đặt lịch khám
                            </button>
                        </Link>
                    </div>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="bg-white p-6 rounded-xl shadow mb-4 hover:shadow-md transition"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                <img
                                    src={appointment.image || "/placeholder.svg"}
                                    alt={appointment.doctorName}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-1">
                                                {appointment.doctorName}
                                            </h3>
                                            <p className="text-gray-500 mb-2">
                                                {appointment.specialty}
                                            </p>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                        <MoreVertical className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            {[
                                                appointment.location?.alley,
                                                appointment.location?.houseNumber,
                                                appointment.location?.ward?.name,
                                                appointment.location?.province?.name,
                                            ]
                                                .filter(Boolean)
                                                .join(" - ")}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Hospital className="h-4 w-4 text-blue-600" />
                                            {appointment.hospital}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            {appointment.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            {appointment.time || "?"} -{" "}
                                            {appointment.end_time || "?"}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => setSelectedAppointment(appointment)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Xem chi tiết
                                        </button>
                                        {appointment.status === "upcoming" && (
                                            <button
                                                onClick={() => handleCancelAppointment(appointment)}
                                                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
                                            >
                                                Hủy lịch
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
