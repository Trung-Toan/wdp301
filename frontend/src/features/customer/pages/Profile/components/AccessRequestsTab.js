import React, { useEffect, useState, useCallback } from "react";
import {
    Clock,
    CheckCircle,
    XCircle,
    Shield,
    Stethoscope,
    Building2,
    MapPin,
    CalendarDays,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";

export default function AccessRequestsTab() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAccessRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Lấy tất cả medical records
            const res = await medicalRecordPatientApi.getListMedicalRecords({
                page: 1,
                limit: 100, // Lấy nhiều records để có đủ access requests
            });
            const records = res.data?.data?.items || [];

            // Flatten tất cả access requests từ tất cả records
            const allRequests = records.flatMap((r) => {
                if (!r.access_requests || r.access_requests.length === 0) return [];
                
                return r.access_requests.map((req, reqIndex) => {
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

                    // Tạo unique identifier
                    let requestId;
                    if (req._id) {
                        requestId = req._id.toString();
                    } else if (req.id) {
                        requestId = req.id.toString();
                    } else {
                        requestId = `INDEX:${reqIndex}`;
                    }

                    return {
                        ...req,
                        _id: requestId,
                        requestIndex: reqIndex,
                        recordId: r._id,
                        doctorName: user.full_name || "Chưa rõ bác sĩ",
                        avatar: user.avatar_url || `https://i.pravatar.cc/150?u=${user._id}`,
                        specialty: specialty?.name || "Chưa rõ chuyên khoa",
                        facility: clinic?.name || "Chưa rõ cơ sở",
                        address: address || "Chưa có địa chỉ",
                        recordDiagnosis: r.diagnosis || "Chưa có chẩn đoán",
                    };
                });
            });

            // Sắp xếp theo thời gian yêu cầu (mới nhất trước)
            allRequests.sort((a, b) => {
                const dateA = new Date(a.requested_at || 0);
                const dateB = new Date(b.requested_at || 0);
                return dateB - dateA;
            });

            setRequests(allRequests);
        } catch (err) {
            setError(err.message || "Lỗi khi tải dữ liệu");
            console.error("Error fetching access requests:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccessRequests();
    }, [fetchAccessRequests]);

    const handleAction = async (recordId, requestId, action) => {
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
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-5 sm:p-6 border border-white/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Shield className="h-5 w-5 text-sky-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Yêu cầu truy cập hồ sơ bệnh án
                    </h2>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-12 w-12 animate-spin text-sky-600 relative z-10" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium text-sm">
                        Đang tải yêu cầu truy cập...
                    </p>
                </div>
            ) : error ? (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-base">{error}</p>
                    <button
                        onClick={fetchAccessRequests}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
                    >
                        Thử lại
                    </button>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 text-base font-semibold mb-1.5">
                        Chưa có yêu cầu truy cập nào
                    </p>
                    <p className="text-gray-500 text-xs">
                        Các yêu cầu truy cập hồ sơ bệnh án sẽ hiển thị tại đây
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => {
                        const displayDate = formatDate(req.requested_at);
                        const displayTime = formatTime(req.requested_at);

                        return (
                            <div
                                key={req._id}
                                className={`bg-white/60 border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                                    req.status === "PENDING"
                                        ? "border-yellow-300 bg-gradient-to-br from-yellow-50/60 to-amber-50/60"
                                        : req.status === "APPROVED"
                                            ? "border-green-300 bg-gradient-to-br from-green-50/60 to-emerald-50/60"
                                            : "border-red-300 bg-gradient-to-br from-red-50/60 to-rose-50/60"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <img
                                                src={req.avatar}
                                                alt={req.doctorName}
                                                className="h-16 w-16 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                                                {req.status === "PENDING" && (
                                                    <Clock className="h-3 w-3 text-yellow-600" />
                                                )}
                                                {req.status === "APPROVED" && (
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                )}
                                                {req.status === "REJECTED" && (
                                                    <XCircle className="h-3 w-3 text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        {/* Header with Status */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5">
                                                    {req.doctorName}
                                                </h4>

                                                {/* Record Diagnosis */}
                                                <div className="mb-2">
                                                    <p className="text-xs text-gray-500 mb-0.5">Hồ sơ bệnh án:</p>
                                                    <p className="text-sm font-semibold text-gray-700">{req.recordDiagnosis}</p>
                                                </div>

                                                {/* Doctor Info Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Stethoscope className="h-3 w-3 text-sky-500 flex-shrink-0" />
                                                        <span className="line-clamp-1">{req.specialty}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Building2 className="h-3 w-3 text-sky-500 flex-shrink-0" />
                                                        <span className="line-clamp-1">{req.facility}</span>
                                                    </div>
                                                    {req.address && (
                                                        <div className="flex items-start gap-1.5 text-gray-600 sm:col-span-2">
                                                            <MapPin className="h-3 w-3 text-sky-500 flex-shrink-0 mt-0.5" />
                                                            <span className="line-clamp-1">{req.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex-shrink-0">
                                                {req.status === "PENDING" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200 rounded-lg text-xs font-semibold">
                                                        <Clock className="h-3 w-3" />
                                                        Chờ phê duyệt
                                                    </span>
                                                )}
                                                {req.status === "APPROVED" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 rounded-lg text-xs font-semibold">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Đã phê duyệt
                                                    </span>
                                                )}
                                                {req.status === "REJECTED" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-200 rounded-lg text-xs font-semibold">
                                                        <XCircle className="h-3 w-3" />
                                                        Đã từ chối
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Request Date */}
                                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/60 px-2.5 py-1.5 rounded-lg border border-gray-200 w-fit">
                                            <CalendarDays className="h-3 w-3 text-sky-500" />
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
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <button
                                                    onClick={() => handleAction(req.recordId, req._id, "APPROVE")}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Phê duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.recordId, req._id, "REJECT")}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-semibold shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 text-sm"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
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
            )}
        </div>
    );
}

