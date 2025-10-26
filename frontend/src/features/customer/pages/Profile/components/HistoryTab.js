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
} from "lucide-react";

export default function HistoryTab() {
    const [appointments, setAppointments] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // 👈 số bản ghi mỗi trang

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
                                    <th className="border p-3 text-left">Ngày và giờ khám</th>
                                    <th className="border p-3 text-left">Chuyên khoa</th>
                                    <th className="border p-3 text-left">Trạng thái</th>
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
                                            {a.date}
                                        </td>
                                        <td className="border p-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {a.time} - {a.end_time}
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
        </div>
    );
}
