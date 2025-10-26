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
        <div className="p-6 border rounded-2xl bg-white shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                <Stethoscope className="w-6 h-6" />
                Lịch sử khám bệnh
            </h2>

            {loading ? (
                <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
            ) : !patientId ? (
                <p className="text-red-500 font-medium">Không tìm thấy thông tin bệnh nhân.</p>
            ) : appointments.length === 0 ? (
                <div className="text-center py-6 text-gray-500 italic border rounded-lg bg-gray-50">
                    Chưa có lịch sử khám nào.
                </div>
            ) : (
                <>
                    {/* Bảng dữ liệu */}
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-100 text-blue-900">
                                    <th className="border p-3 text-left">Ngày & giờ khám</th>
                                    <th className="border p-3 text-left">Chuyên khoa</th>
                                    <th className="border p-3 text-left">Trạng thái</th>
                                    <th className="border p-3 text-left">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAppointments.map((a) => (
                                    <tr
                                        key={a._id}
                                        className="hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <td className="border p-3 flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-gray-500" />
                                            {a.date || formatDate(a.scheduled_date)}
                                        </td>
                                        <td className="border p-3 font-medium text-gray-700">
                                            {a.specialty || "Không rõ"}
                                        </td>
                                        <td className="border p-3">
                                            <span
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold w-fit
                                                    ${a.status === "SCHEDULED"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : a.status === "COMPLETED"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {a.status === "COMPLETED" ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : a.status === "CANCELLED" ? (
                                                    <XCircle className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                                {a.status || "Không rõ"}
                                            </span>
                                        </td>
                                        <td className="border p-3">
                                            <button
                                                onClick={() => handleShowDetails(a)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <Info className="w-4 h-4" />
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    <div className="flex justify-between items-center mt-5">
                        <p className="text-sm text-gray-600">
                            Trang {currentPage}/{totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-3 py-1 border rounded-lg transition ${currentPage === 1
                                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Trước
                            </button>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-1 px-3 py-1 border rounded-lg transition ${currentPage === totalPages
                                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                    }`}
                            >
                                Sau <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Modal xem chi tiết */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 bg-gray-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-lg p-6 relative transition-all duration-300">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✖
                        </button>

                        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Chi tiết lịch hẹn
                        </h3>

                        <div className="space-y-3 text-gray-700">
                            <p><strong>Bác sĩ:</strong> {selectedAppointment.doctorName || "Không rõ"}</p>
                            <p><strong>Chuyên khoa:</strong> {selectedAppointment.specialty || "Không rõ"}</p>
                            <p><strong>Bệnh viện:</strong> {selectedAppointment.hospital || "Không rõ"}</p>
                            <p><strong>Địa điểm:</strong> {formatAddress(selectedAppointment.location)}</p>
                            <p><strong>Ngày khám:</strong> {selectedAppointment.date || formatDate(selectedAppointment.scheduled_date)}</p>
                            <p><strong>Giờ khám:</strong> {selectedAppointment.time || "-"}</p>
                            <p><strong>Lý do khám:</strong> {selectedAppointment.reason || "Không có"}</p>
                            <p><strong>Trạng thái:</strong> {selectedAppointment.status}</p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
