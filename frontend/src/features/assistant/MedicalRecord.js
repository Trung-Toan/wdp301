import React from "react";

const MedicalRecord = ({ record, onClose }) => {
    if (!record) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Chi tiết hồ sơ bệnh án</h2>
                <div className="mb-2">
                    <strong>Chẩn đoán:</strong> {record.diagnosis}
                </div>
                <div className="mb-2">
                    <strong>Triệu chứng:</strong> {record.symptoms?.join(", ")}
                </div>
                <div className="mb-2">
                    <strong>Ghi chú:</strong> {record.notes}
                </div>
                <div className="mb-2">
                    <strong>Đính kèm:</strong>{" "}
                    {record.attachments?.length > 0
                        ? record.attachments.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mr-2">
                                Tệp {idx + 1}
                            </a>
                        ))
                        : "Không có"}
                </div>
                <div className="mb-2">
                    <strong>Đơn thuốc:</strong>
                    <ul className="list-disc ml-6">
                        {record.prescription?.medicines?.map((med, idx) => (
                            <li key={idx}>
                                <span className="font-semibold">{med.name}</span>: {med.dosage}, {med.frequency}, {med.duration}. <i>{med.note}</i>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-2">
                        <strong>Hướng dẫn:</strong> {record.prescription?.instruction}
                    </div>
                </div>
                <div className="mb-2">
                    <strong>Trạng thái:</strong> {record.status}
                </div>
            </div>
        </div>
    );
};

export default MedicalRecord;