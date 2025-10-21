export default function RecordInfo({ records }) {
    if (records.length === 0) return null;

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Thông tin chi tiết</h3>
            <ul className="list-disc ml-6">
                {records.map((r) => (
                    <li key={r._id}>
                        Trạng thái: {r.status}, Bác sĩ ID: {r.doctor_id}, Ngày tạo:{" "}
                        {new Date(r.createdAt).toLocaleString()}, Cập nhật:{" "}
                        {new Date(r.updatedAt).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}