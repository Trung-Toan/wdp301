import React, { useEffect, useState } from "react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";

export default function HistoryTab() {
    const [appointments, setAppointments] = useState([]);
    const [patientId, setPatientId] = useState(null);

    useEffect(() => {
        const patientData = JSON.parse(sessionStorage.getItem("patient"));
        const pid = patientData?._id;
        setPatientId(pid);

        if (!pid) {
            console.error("Không tìm thấy patientId từ dữ liệu đăng nhập");
            return;
        }

        // 🔹 Gọi API lấy lịch hẹn
        medicalRecordPatientApi
            .getListMedicalRecordsByPatientId(pid)
            .then((res) => {
                const list = res.data?.data?.data || [];
                setAppointments(list);
            })
            .catch((err) => console.error("Lỗi tải lịch hẹn:", err));
    }, []);

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const formatTime = (timeString) => {
        const d = new Date(timeString);
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Lịch sử khám</h2>

            {!patientId ? (
                <p>Không tìm thấy thông tin bệnh nhân.</p>
            ) : appointments.length === 0 ? (
                <p>Không có lịch hẹn nào.</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-3 text-left">Ngày khám</th>
                            <th className="border p-3 text-left">Giờ khám</th>
                            <th className="border p-3 text-left">Mã đặt lịch</th>
                            <th className="border p-3 text-left">Trạng thái</th>
                            <th className="border p-3 text-left">Phí</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((a) => (
                            <tr key={a._id}>
                                <td className="border p-3">{formatDate(a.scheduled_date)}</td>
                                <td className="border p-3">
                                    {formatTime(a.slot_id.start_time)} - {formatTime(a.slot_id.end_time)}
                                </td>
                                <td className="border p-3 font-medium">{a.booking_code}</td>
                                <td className="border p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-sm font-semibold ${a.status === "SCHEDULED"
                                            ? "bg-blue-100 text-blue-600"
                                            : a.status === "COMPLETED"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {a.status}
                                    </span>
                                </td>
                                <td className="border p-3">{a.fee_amount.toLocaleString("vi-VN")} ₫</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
