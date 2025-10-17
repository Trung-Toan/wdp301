import React from "react";

export default function Allergies() {
    const allergies = ["Phấn hoa", "Tôm cua", "Thuốc Paracetamol"];
    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Dị ứng</h3>
            <ul className="list-disc ml-6">
                {allergies.map((a, i) => (
                    <li key={i}>{a}</li>
                ))}
            </ul>
        </div>
    );
}
