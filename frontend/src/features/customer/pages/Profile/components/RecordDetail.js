import { useEffect, useState } from "react";
import {
    ChevronLeft,
    FileText,
    CalendarDays,
    Clock,
    Stethoscope,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
import AccessRequests from "./RecordsTab/AccessRequests";
import Notes from "./RecordsTab/Notes";
import Prescriptions from "./RecordsTab/Prescriptions";

export default function RecordDetail({ recordId, onBack }) {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        medicalRecordPatientApi
            .getMedicalRecordsById(recordId)
            .then((res) => {
                if (res.data?.data) setRecord(res.data.data);
                else setError("Không tìm thấy hồ sơ");
            })
            .catch((err) => setError(err.message || "Lỗi khi tải dữ liệu"))
            .finally(() => setLoading(false));
    }, [recordId]);

    // Format ngày tháng đẹp hơn
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString("vi-VN", {
                weekday: "long",
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

    if (loading) {
        return (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-16 w-16 animate-spin text-sky-600 relative z-10" />
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">
                        Đang tải chi tiết hồ sơ bệnh án...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-lg mb-4">{error}</p>
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!record) return null;

    const displayDate = formatDate(record.createdAt);
    const displayTime = formatTime(record.createdAt);

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <FileText className="h-6 w-6 text-sky-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Chi tiết hồ sơ bệnh án
                    </h2>
                </div>
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sky-600 border-2 border-sky-200 rounded-xl hover:bg-sky-50 hover:border-sky-300 transition-all font-semibold shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại
                </button>
            </div>

            {/* Main Info Card */}
            <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Stethoscope className="h-6 w-6 text-sky-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-500 uppercase mb-2">
                            Chẩn đoán
                        </h3>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {record.diagnosis || "Chưa có chẩn đoán"}
                        </p>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 px-4 py-3 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarDays className="h-4 w-4 text-sky-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                Ngày tạo
                            </p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{displayDate}</p>
                    </div>
                    {displayTime && (
                        <div className="bg-white/60 px-4 py-3 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-sky-500" />
                                <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Giờ tạo
                                </p>
                            </div>
                            <p className="text-base font-bold text-gray-900">{displayTime}</p>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {record.notes && (
                    <div className="bg-white/60 px-4 py-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-sky-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                Ghi chú
                            </p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {record.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* Sub Components */}
            <div className="space-y-6">
                <Notes records={[record]} />
                <Prescriptions records={[record]} />
                <AccessRequests records={[record]} />
            </div>
        </div>
    );
}
