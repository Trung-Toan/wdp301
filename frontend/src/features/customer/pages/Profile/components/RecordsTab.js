import { useEffect, useState, useCallback } from "react";
import {
    FileText,
    CalendarDays,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Stethoscope,
    Info,
    FileSearch,
} from "lucide-react";
import { medicalRecordPatientApi } from "../../../../../api/patients/medicalRecordPatientApi";
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
        setError(null);
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

    if (selectedRecord) {
        return (
            <RecordDetail
                recordId={selectedRecord._id}
                onBack={() => setSelectedRecord(null)}
            />
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <FileText className="h-6 w-6 text-sky-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Danh sách hồ sơ bệnh án
                    </h2>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-16 w-16 animate-spin text-sky-600 relative z-10" />
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">
                        Đang tải hồ sơ bệnh án...
                    </p>
                </div>
            ) : error ? (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-lg">{error}</p>
                    <button
                        onClick={() => fetchRecords(page)}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                        Thử lại
                    </button>
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileSearch className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-700 text-lg font-semibold mb-2">
                        Chưa có hồ sơ bệnh án nào
                    </p>
                    <p className="text-gray-500 text-sm">
                        Hồ sơ bệnh án của bạn sẽ hiển thị tại đây
                    </p>
                </div>
            ) : (
                <>
                    {/* Records List */}
                    <div className="space-y-4">
                        {records.map((record, index) => {
                            const displayDate = formatDate(record.createdAt);
                            const displayTime = formatTime(record.createdAt);

                            return (
                                <div
                                    key={record._id}
                                    className="group bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 hover:border-sky-300 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fadeIn"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        {/* Left: Info */}
                                        <div className="flex-1 space-y-4">
                                            {/* Main Info */}
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                                                    <Stethoscope className="h-5 w-5 text-sky-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 group-hover:text-sky-700 transition-colors">
                                                        {record.diagnosis || "Chưa có chẩn đoán"}
                                                    </h3>

                                                    {/* Date & Time */}
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-gray-200">
                                                            <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
                                                            <span className="font-semibold text-gray-700">
                                                                {displayDate}
                                                            </span>
                                                        </div>
                                                        {displayTime && (
                                                            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-gray-200">
                                                                <Clock className="h-3.5 w-3.5 text-sky-500" />
                                                                <span className="font-medium">{displayTime}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Notes */}
                                                    {record.notes && (
                                                        <div className="bg-white/60 px-4 py-3 rounded-xl border border-gray-200">
                                                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                                                                <span className="font-semibold text-gray-600">Ghi chú: </span>
                                                                {record.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Action */}
                                        <div className="flex-shrink-0">
                                            <button
                                                onClick={() => setSelectedRecord(record)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                <Info className="h-4 w-4" />
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 font-medium">
                                Trang{" "}
                                <span className="font-bold text-sky-600">{page}</span> /{" "}
                                <span className="font-bold text-gray-700">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => prev - 1)}
                                    disabled={page === 1}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${page === 1
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-sky-600 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm hover:shadow-md"
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>

                                <button
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={page === totalPages}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${page === totalPages
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-sky-600 border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm hover:shadow-md"
                                        }`}
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
