import { useEffect, useState, useCallback } from "react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
import Button from "../../../../../components/ui/Button";
import RecordDetail from "./RecordDetail";

export default function RecordsTab() {
    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    // ✅ Ghi nhớ hàm fetchRecords để không bị re-create mỗi render
    const fetchRecords = useCallback(async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await medicalRecordPatientApi.getListMedicalRecords({
                page: pageNumber,
                limit,
            });
            const data = res.data?.data;
            if (data?.items) {
                setRecords(data.items);
                setTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            setError(err.message || "Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [limit]);

    // ✅ Gọi API khi page thay đổi
    useEffect(() => {
        fetchRecords(page);
    }, [fetchRecords, page]);

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (selectedRecord) {
        return (
            <RecordDetail
                recordId={selectedRecord._id}
                onBack={() => setSelectedRecord(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Danh sách hồ sơ bệnh án</h2>

            {records.length === 0 && <p>Không có hồ sơ nào.</p>}

            {records.map((record) => (
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((prev) => prev - 1)}
                    >
                        ← Trước
                    </Button>

                    <span className="text-sm text-gray-700">
                        Trang {page} / {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                    >
                        Sau →
                    </Button>
                </div>
            )}
        </div>
    );
}
