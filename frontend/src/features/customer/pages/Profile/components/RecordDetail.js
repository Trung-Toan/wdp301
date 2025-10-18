import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
import AccessRequests from "./RecordsTab/AccessRequests";
import Notes from "./RecordsTab/Notes";
import Prescriptions from "./RecordsTab/Prescriptions";

export default function RecordDetail() {
    const { recordId } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        medicalRecordPatientApi.getMedicalRecordsById(recordId)
            .then(res => {
                if (res.data?.data) setRecord(res.data.data);
                else setError("Không tìm thấy hồ sơ");
            })
            .catch(err => setError(err.message || "Lỗi khi tải dữ liệu"))
            .finally(() => setLoading(false));
    }, [recordId]);

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!record) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Chi tiết hồ sơ bệnh án</h2>

            <div className="bg-gray-100 p-4 rounded-lg shadow">
                <p><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
                <p><strong>Ghi chú:</strong> {record.notes}</p>
                <p><strong>Ngày tạo:</strong> {new Date(record.createdAt).toLocaleString()}</p>
            </div>

            {/* Các tab con tái sử dụng */}
            <AccessRequests records={[record]} />
            <Notes records={[record]} />
            <Prescriptions records={[record]} />
        </div>
    );
}
