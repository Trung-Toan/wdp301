import React, { useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { medicalRecordPatientApi } from "../../../../../../api/patients/medicalRecordPatientApi";
import Button from "../../../../../../components/ui/Button";

export default function AccessRequests({ records }) {
    // Luôn khai báo hook ở đầu component
    const [requests, setRequests] = useState(() => {
        if (!records || records.length === 0) return [];
        // flatten tất cả access requests
        return records.flatMap(r =>
            (r.access_requests || []).map(req => {
                const doctor = r.doctor_id || {};
                const user = doctor.user_id || {};
                const specialty = doctor.specialty_id?.[0];
                const clinic = doctor.clinic_id;

                // Ghép địa chỉ hiển thị đẹp
                const addressParts = [
                    clinic?.address?.houseNumber,
                    clinic?.address?.ward?.name,
                    clinic?.address?.province?.name
                ].filter(Boolean);
                const address = addressParts.join(", ");

                return {
                    ...req,
                    recordId: r._id,
                    doctorName: user.full_name || "Chưa rõ bác sĩ",
                    avatar: user.avatar_url || `https://i.pravatar.cc/150?u=${user._id}`,
                    specialty: specialty?.name || "Chưa rõ chuyên khoa",
                    facility: clinic?.name || "Chưa rõ cơ sở",
                    address: address || "Chưa có địa chỉ",
                };
            })
        );
    });

    // Nếu không có dữ liệu, không render gì cả
    if (!requests || requests.length === 0) return null;

    const handleAction = (recordId, requestId, action) => {
        medicalRecordPatientApi
            .updateAccessRequest(recordId, requestId, action)
            .then(() => {
                setRequests(prev =>
                    prev.map(r =>
                        r._id === requestId
                            ? { ...r, status: action === "APPROVE" ? "APPROVED" : "REJECTED" }
                            : r
                    )
                );
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Yêu cầu truy cập hồ sơ bệnh án</h3>

            <div className="space-y-4">
                {requests.map((req) => (
                    <div
                        key={req._id}
                        className={`border rounded-lg p-4 transition-colors ${req.status === "PENDING"
                                ? "bg-yellow-50 border-yellow-200"
                                : req.status === "APPROVED"
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                            }`}
                    >
                        <div className="flex gap-4">
                            <img
                                src={req.avatar}
                                alt={req.doctorName}
                                className="h-16 w-16 rounded-full object-cover"
                            />

                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-lg">{req.doctorName}</p>
                                        <p className="text-sm text-muted-foreground">{req.specialty}</p>
                                        <p className="text-sm text-muted-foreground">{req.facility}</p>
                                        <p className="text-xs text-gray-500">{req.address}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {req.status === "PENDING" && (
                                            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Chờ phê duyệt
                                            </span>
                                        )}
                                        {req.status === "APPROVED" && (
                                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Đã phê duyệt
                                            </span>
                                        )}
                                        {req.status === "REJECTED" && (
                                            <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                <XCircle className="h-3 w-3" />
                                                Đã từ chối
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm mb-3">
                                    <span className="text-muted-foreground">Ngày yêu cầu:</span>{" "}
                                    {new Date(req.requested_at).toLocaleString()}
                                </p>

                                {req.status === "PENDING" && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => handleAction(req.recordId, req._id, "APPROVE")}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Phê duyệt
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => handleAction(req.recordId, req._id, "REJECT")}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Từ chối
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
