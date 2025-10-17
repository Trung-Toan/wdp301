import React from "react";

export default function HistoryTab() {
    const visits = [
        { date: "15/10/2024", doctor: "BS. Trần Minh", reason: "Khám tổng quát" },
        { date: "01/08/2024", doctor: "BS. Nguyễn Hạnh", reason: "Cảm cúm" },
        { date: "25/06/2024", doctor: "BS. Lê Nam", reason: "Đau đầu" },
    ];

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Lịch sử khám</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-3 text-left">Ngày</th>
                        <th className="border p-3 text-left">Bác sĩ</th>
                        <th className="border p-3 text-left">Lý do</th>
                    </tr>
                </thead>
                <tbody>
                    {visits.map((v, i) => (
                        <tr key={i}>
                            <td className="border p-3">{v.date}</td>
                            <td className="border p-3">{v.doctor}</td>
                            <td className="border p-3">{v.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
