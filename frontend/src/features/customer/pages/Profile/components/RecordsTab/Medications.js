import React from "react";

export default function Medications() {
    const meds = [
        { name: "Paracetamol", dosage: "500mg", frequency: "2 lần/ngày" },
        { name: "Aspirin", dosage: "100mg", frequency: "1 lần/ngày" },
    ];

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Thuốc đang dùng</h3>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Tên thuốc</th>
                        <th className="border p-2 text-left">Liều lượng</th>
                        <th className="border p-2 text-left">Tần suất</th>
                    </tr>
                </thead>
                <tbody>
                    {meds.map((m, i) => (
                        <tr key={i}>
                            <td className="border p-2">{m.name}</td>
                            <td className="border p-2">{m.dosage}</td>
                            <td className="border p-2">{m.frequency}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
