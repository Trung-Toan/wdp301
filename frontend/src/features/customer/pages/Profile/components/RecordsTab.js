import { useEffect, useState } from "react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
import Button from "../../../../../components/ui/Button";
import RecordDetail from "./RecordDetail"; // ✅ Import

export default function RecordsTab() {
    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        medicalRecordPatientApi.getListMedicalRecords()
            .then(res => {
                if (res.data?.data?.items) setRecords(res.data.data.items);
            })
            .catch(err => setError(err.message || "Lỗi khi tải dữ liệu"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    // ✅ Nếu chọn 1 hồ sơ, hiển thị trang chi tiết luôn trong tab
    if (selectedRecord) {
        return (
            <RecordDetail recordId={selectedRecord._id} onBack={() => setSelectedRecord(null)} />
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Danh sách hồ sơ bệnh án</h2>

            {records.map(record => (
                <div
                    key={record._id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                >
                    <p className="font-semibold text-lg">{record.diagnosis}</p>
                    <p className="text-sm text-gray-600 mb-2">
                        Ngày tạo: {new Date(record.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                        Ghi chú: {record.notes}
                    </p>

                    <Button onClick={() => setSelectedRecord(record)}>
                        Xem chi tiết
                    </Button>
                </div>
            ))}
        </div>
    );
}
