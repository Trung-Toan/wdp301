import React from "react";

export default function TestResults() {
    const tests = [
        { name: "Xét nghiệm máu", date: "10/09/2024", result: "Bình thường" },
        { name: "X-quang phổi", date: "01/07/2024", result: "Không phát hiện bất thường" },
    ];

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Kết quả xét nghiệm</h3>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Tên xét nghiệm</th>
                        <th className="border p-2 text-left">Ngày</th>
                        <th className="border p-2 text-left">Kết quả</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map((t, i) => (
                        <tr key={i}>
                            <td className="border p-2">{t.name}</td>
                            <td className="border p-2">{t.date}</td>
                            <td className="border p-2">{t.result}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
