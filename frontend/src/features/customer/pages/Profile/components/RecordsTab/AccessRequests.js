import React, { useState } from "react";
import {
    Clock,
    CheckCircle,
    XCircle,
    Shield,
    Stethoscope,
    Building2,
    MapPin,
    CalendarDays,
} from "lucide-react";
import { toast } from "react-toastify";
import { medicalRecordPatientApi } from "../../../../../../api/patients/medicalRecordPatientApi";

export default function AccessRequests({ records }) {
    // Luôn khai báo hook ở đầu component
    const [requests, setRequests] = useState(() => {
        if (!records || records.length === 0) return [];
        // flatten tất cả access requests
        return records.flatMap((r, recordIndex) =>
            (r.access_requests || []).map((req, reqIndex) => {
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

                // Tạo unique identifier: 
                // - Nếu có _id từ DB (requests mới) -> dùng _id
                // - Nếu không có _id (requests cũ) -> dùng format "INDEX:reqIndex" để backend có thể parse
                let requestId;
                if (req._id) {
                    requestId = req._id.toString();
                } else if (req.id) {
                    requestId = req.id.toString();
                } else {
                    // Format: "INDEX:0", "INDEX:1" để backend biết đây là index
                    // Đây là fallback cho các access requests cũ không có _id trong DB
                    requestId = `INDEX:${reqIndex}`;
                }

                return {
                    ...req,
                    _id: requestId, // Đảm bảo luôn có _id
                    requestIndex: reqIndex, // Lưu index để dùng khi không có _id
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

    const handleAction = async (recordId, requestId, action) => {
        // Validation
        if (!recordId || !requestId) {
            console.error("Missing recordId or requestId:", { recordId, requestId });
            toast.error("Thông tin không hợp lệ. Vui lòng thử lại.");
            return;
        }

        if (!action || !["APPROVE", "REJECT"].includes(action)) {
            console.error("Invalid action:", action);
            toast.error("Hành động không hợp lệ.");
            return;
        }

        try {
            await medicalRecordPatientApi.updateAccessRequest(recordId, requestId, action);
            
            // Update UI
            setRequests(prev =>
                prev.map(r =>
                    r._id === requestId
                        ? { ...r, status: action === "APPROVE" ? "APPROVED" : "REJECTED" }
                        : r
                )
            );
            
            // Show success message
            if (action === "APPROVE") {
                toast.success("Đã phê duyệt yêu cầu truy cập hồ sơ bệnh án");
            } else {
                toast.success("Đã từ chối yêu cầu truy cập hồ sơ bệnh án");
            }
        } catch (err) {
            console.error("Error updating access request:", err);
            const errorMessage = err.response?.data?.error || err.message || "Không thể cập nhật yêu cầu. Vui lòng thử lại sau.";
            toast.error(errorMessage);
        }
    };

    // Format ngày tháng đẹp hơn
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (e) {
            return dateString;
        }
    };

    // Format giờ từ date string
    const formatTime = (dateString) => {
        if (!dateString) return null;
        try {
            const d = new Date(dateString);
            return d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return null;
        }
    };

    return (
        <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                    <Shield className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Yêu cầu truy cập hồ sơ bệnh án
                </h3>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {requests.map((req) => {
                    const displayDate = formatDate(req.requested_at);
                    const displayTime = formatTime(req.requested_at);

                    return (
                        <div
                            key={req._id}
                            className={`bg-white/60 border-2 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg ${
                                req.status === "PENDING"
                                    ? "border-yellow-300 bg-gradient-to-br from-yellow-50/60 to-amber-50/60"
                                    : req.status === "APPROVED"
                                        ? "border-green-300 bg-gradient-to-br from-green-50/60 to-emerald-50/60"
                                        : "border-red-300 bg-gradient-to-br from-red-50/60 to-rose-50/60"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <img
                                            src={req.avatar}
                                            alt={req.doctorName}
                                            className="h-20 w-20 rounded-2xl object-cover border-2 border-gray-200 shadow-md"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                                            {req.status === "PENDING" && (
                                                <Clock className="h-3.5 w-3.5 text-yellow-600" />
                                            )}
                                            {req.status === "APPROVED" && (
                                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                            )}
                                            {req.status === "REJECTED" && (
                                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4">
                                    {/* Header with Status */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">
                                                {req.doctorName}
                                            </h4>

                                            {/* Doctor Info Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Stethoscope className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
                                                    <span>{req.specialty}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Building2 className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
                                                    <span>{req.facility}</span>
                                                </div>
                                                {req.address && (
                                                    <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                                                        <MapPin className="h-3.5 w-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
                                                        <span>{req.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex-shrink-0">
                                            {req.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200 rounded-xl text-sm font-semibold shadow-sm">
                                                    <Clock className="h-4 w-4" />
                                                    Chờ phê duyệt
                                                </span>
                                            )}
                                            {req.status === "APPROVED" && (
                                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 rounded-xl text-sm font-semibold shadow-sm">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Đã phê duyệt
                                                </span>
                                            )}
                                            {req.status === "REJECTED" && (
                                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-200 rounded-xl text-sm font-semibold shadow-sm">
                                                    <XCircle className="h-4 w-4" />
                                                    Đã từ chối
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Request Date */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg border border-gray-200 w-fit">
                                        <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
                                        <span className="font-semibold text-gray-700">Ngày yêu cầu:</span>
                                        <span>{displayDate}</span>
                                        {displayTime && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span>{displayTime}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {req.status === "PENDING" && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button
                                                onClick={() => handleAction(req.recordId, req._id, "APPROVE")}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Phê duyệt
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.recordId, req._id, "REJECT")}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
