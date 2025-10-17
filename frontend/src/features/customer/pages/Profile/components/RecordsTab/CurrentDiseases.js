import React from "react";

export default function CurrentDiseases() {
    const diseases = ["Tăng huyết áp", "Đái tháo đường", "Viêm xoang mạn tính"];
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
