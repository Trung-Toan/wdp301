import React from "react";

export default function CurrentDiseases({ records }) {
    const diseases = records?.map(r => r.diagnosis).filter(Boolean);

    if (!diseases || diseases.length === 0) return <p>Không có bệnh hiện tại.</p>;

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Bệnh hiện tại</h3>
            <ul className="list-disc ml-6">
                {diseases.map((d, i) => (
                    <li key={i}>{d}</li>
                ))}
            </ul>
        </div>
    );
}
