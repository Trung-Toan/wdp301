import React, { useState } from "react";
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
    MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data cho lịch hẹn
const mockAppointments = [
    {
        id: 1,
        status: "upcoming",
        doctorName: "BS. Nguyễn Văn An",
        specialty: "Tim mạch",
        hospital: "Bệnh viện Đa khoa Trung ương",
        location: "Hà Nội",
        date: "Thứ 2, 20/01/2025",
        time: "09:00",
        price: "500.000đ",
        image: "/doctor-portrait-male.jpg",
        patientName: "Nguyễn Văn A",
        phone: "0912345678",
        reason: "Khám định kỳ tim mạch",
    },
    {
        id: 2,
        status: "upcoming",
        doctorName: "BS. Trần Thị Bình",
        specialty: "Da liễu",
        hospital: "Phòng khám Đa khoa Medlatec",
        location: "Hà Nội",
        date: "Thứ 4, 22/01/2025",
        time: "14:30",
        price: "400.000đ",
        image: "/doctor-portrait-female.jpg",
        patientName: "Nguyễn Văn A",
        phone: "0912345678",
        reason: "Điều trị mụn và chăm sóc da",
    },
    {
        id: 3,
        status: "completed",
        doctorName: "BS. Lê Văn Cường",
        specialty: "Nội tổng quát",
        hospital: "Bệnh viện Bạch Mai",
        location: "Hà Nội",
        date: "Thứ 6, 10/01/2025",
        time: "10:00",
        price: "300.000đ",
        image: "/doctor-portrait-male-2.jpg",
        patientName: "Nguyễn Văn A",
        phone: "0912345678",
        reason: "Khám sức khỏe tổng quát",
    },
    {
        id: 4,
        status: "cancelled",
        doctorName: "BS. Phạm Thị Dung",
        specialty: "Sản phụ khoa",
        hospital: "Bệnh viện Phụ sản Hà Nội",
        location: "Hà Nội",
        date: "Thứ 3, 14/01/2025",
        time: "15:00",
        price: "450.000đ",
        image: "/doctor-portrait-female-2.jpg",
        patientName: "Nguyễn Văn A",
        phone: "0912345678",
        reason: "Khám thai định kỳ",
    },
];

export function AppointmentsContent() {
    const [selectedTab, setSelectedTab] = useState("upcoming");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    const getStatusBadge = (status) => {
        const base =
            "px-2 py-1 text-sm rounded-md flex items-center gap-1 font-medium w-fit";
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

    const filteredAppointments = mockAppointments.filter(
        (apt) => apt.status === selectedTab
    );

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Lịch hẹn của tôi</h1>
                <p className="text-gray-600 mb-8">
                    Quản lý và theo dõi các lịch khám của bạn
                </p>

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
                                            {appointment.hospital}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            {appointment.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            {appointment.time}
                                        </div>
                                        <div className="font-semibold text-blue-600">
                                            {appointment.price}
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

                {/* Modal chi tiết */}
                {selectedAppointment && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                            <h2 className="text-2xl font-bold mb-4">Chi tiết lịch hẹn</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <img
                                        src={selectedAppointment.image || "/placeholder.svg"}
                                        alt={selectedAppointment.doctorName}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {selectedAppointment.doctorName}
                                        </h3>
                                        <p className="text-gray-500">
                                            {selectedAppointment.specialty}
                                        </p>
                                        {getStatusBadge(selectedAppointment.status)}
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <h4 className="font-semibold mb-2">Thông tin lịch khám</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            {selectedAppointment.hospital}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            {selectedAppointment.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            {selectedAppointment.time}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <h4 className="font-semibold mb-2">Thông tin bệnh nhân</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-600" />
                                            {selectedAppointment.patientName}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-blue-600" />
                                            {selectedAppointment.phone}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            {selectedAppointment.reason}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="font-semibold">Tổng chi phí:</span>
                                    <span className="text-blue-600 font-bold text-xl">
                                        {selectedAppointment.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal xác nhận hủy */}
                {cancelDialogOpen && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
                            <h2 className="text-xl font-bold mb-4">Xác nhận hủy lịch hẹn</h2>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn hủy lịch hẹn với{" "}
                                <b>{appointmentToCancel?.doctorName}</b> vào{" "}
                                <b>{appointmentToCancel?.date}</b> lúc{" "}
                                <b>{appointmentToCancel?.time}</b>?
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setCancelDialogOpen(false)}
                                    className="px-5 py-2 rounded-lg border hover:bg-gray-100"
                                >
                                    Không
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                >
                                    Xác nhận hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
