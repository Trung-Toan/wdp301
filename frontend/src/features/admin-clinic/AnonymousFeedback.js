"use client";

import { useState, useMemo, useEffect } from "react";
import {
    MessageSquare,
    Eye,
    EyeOff,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Info,
    Search,
    User,
    Star,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataByUrl } from "../../utility/data.utils";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";

const ratingBuckets = [
    { key: "positive", label: "Tích cực (4–5★)", icon: <ThumbsUp size={16} /> },
    { key: "neutral", label: "Trung lập (3★)", icon: <MessageSquare size={16} /> },
    { key: "negative", label: "Tiêu cực (1–2★)", icon: <ThumbsDown size={16} /> },
];

const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "rating_desc", label: "Đánh giá ↓" },
    { value: "rating_asc", label: "Đánh giá ↑" },
];

function getRatingStyle(num) {
    if (num >= 4) return { badge: "bg-green-100 text-green-700", label: "Tích cực" };
    if (num === 3) return { badge: "bg-gray-100 text-gray-700", label: "Trung lập" };
    return { badge: "bg-red-100 text-red-700", label: "Tiêu cực" };
}

export default function FeedbackAdminClinic() {
    // ====== FILTER STATES ======
    const [q, setQ] = useState("");
    const [bucket, setBucket] = useState("all"); // "all" | "positive" | "neutral" | "negative"
    const [selectedRatings, setSelectedRatings] = useState([]); // [1..5]
    const [doctorId, setDoctorId] = useState("");
    const [clinicId, setClinicId] = useState("");
    const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
    const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
    const [sort, setSort] = useState("newest");
    const [limit, setLimit] = useState(15);
    const [page, setPage] = useState(1);

    // Reset page khi filter thay đổi (tránh rơi vào trang rỗng)
    useEffect(() => {
        setPage(1);
    }, [q, bucket, doctorId, clinicId, startDate, endDate, sort, limit, selectedRatings]);

    // rating param (comma) nếu có -> ưu tiên hơn bucket
    const ratingParam = useMemo(
        () => (selectedRatings.length ? selectedRatings.sort((a, b) => a - b).join(",") : undefined),
        [selectedRatings]
    );

    const params = useMemo(() => {
        const p = {
            page,
            limit,
            sort,
        };
        if (q.trim()) p.q = q.trim();
        if (!ratingParam && bucket !== "all") p.bucket = bucket;
        if (ratingParam) p.rating = ratingParam;
        if (doctorId.trim()) p.doctor_id = doctorId.trim();
        if (clinicId.trim()) p.clinic_id = clinicId.trim();
        if (startDate) p.start_date = startDate;
        if (endDate) p.end_date = endDate;
        return p;
    }, [q, bucket, ratingParam, doctorId, clinicId, startDate, endDate, page, limit, sort]);

    const { data, isLoading, error, refetch } = useDataByUrl({
        url: adminclinicAPI.GET_FEEDBACK,
        key: "get-feedback-adminclinic",
        params,
    });

    const payload = data?.data || {};
    const summary = payload.summary || { avgRating: 0, totalFeedbacks: 0 };
    const distribution = payload.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const recent = Array.isArray(payload.recent) ? payload.recent : [];
    const byDoctor = Array.isArray(payload.byDoctor) ? payload.byDoctor : [];
    const total = payload.total || 0;

    const totalPages = Math.max(1, Math.ceil(total / Number(limit || 1)));

    const positiveCount = (distribution["4"] || 0) + (distribution["5"] || 0);
    const neutralCount = distribution["3"] || 0;
    const negativeCount = (distribution["1"] || 0) + (distribution["2"] || 0);

    const [showAnonymousInfo, setShowAnonymousInfo] = useState(true);

    const toggleRating = (n) => {
        setSelectedRatings((prev) =>
            prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
        );
    };

    // ====== RENDER ======
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-20 rounded-lg bg-gray-100" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-28 rounded-lg bg-gray-100" />
                        <div className="h-28 rounded-lg bg-gray-100" />
                        <div className="h-28 rounded-lg bg-gray-100" />
                    </div>
                    <div className="h-12 rounded-lg bg-gray-100" />
                    <div className="h-64 rounded-lg bg-gray-100" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                    <AlertCircle size={20} />
                    <div>
                        <p className="m-0 font-semibold">Không tải được dữ liệu feedback</p>
                        <p className="m-0 text-sm">{error?.message || "Vui lòng thử lại sau."}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">{summary.avgRating?.toFixed?.(1) ?? "0.0"}</span>
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    className={i < Math.round(summary.avgRating || 0) ? "text-yellow-500" : "text-gray-300"}
                                    fill={i < Math.round(summary.avgRating || 0) ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        {summary.totalFeedbacks?.toLocaleString?.("vi-VN") || 0} đánh giá
                    </div>
                </div>

                <button
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    onClick={() => setShowAnonymousInfo((s) => !s)}
                >
                    {showAnonymousInfo ? <EyeOff size={18} /> : <Eye size={18} />}
                    {showAnonymousInfo ? "Ẩn danh" : "Hiển thị tên"}
                </button>
            </div>

            {/* Anonymous Info Banner */}
            <AnimatePresence>
                {showAnonymousInfo && (
                    <motion.div
                        className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg overflow-hidden"
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-blue-700">
                                <strong className="font-semibold text-blue-900">Chế độ Ẩn danh đang bật:</strong>{" "}
                                Tên bệnh nhân chọn ẩn danh sẽ được che giấu.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
                {/* Row 1: Search + Actions */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8">
                        <label htmlFor="f-search" className="block text-xs font-semibold text-gray-600 mb-1">
                            Tìm kiếm
                        </label>
                        <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                            <Search size={18} className="text-gray-400" />
                            <input
                                id="f-search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Nội dung, bác sĩ, bệnh nhân, cơ sở…"
                                className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Thao tác</label>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => refetch()}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                            >
                                Làm mới
                            </button>
                            <button
                                onClick={() => { setQ(""); setBucket("all"); setSelectedRatings([]); setDoctorId(""); setClinicId(""); setStartDate(""); setEndDate(""); setSort("newest"); setLimit(15); setPage(1); }}
                                className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200"
                            >
                                Xoá bộ lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Bucket + Ratings  |  Sort + Limit */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Bucket + Ratings */}
                    <div className="md:col-span-8 space-y-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Nhóm đánh giá</label>
                            <div className="flex items-center flex-wrap gap-2 bg-white border border-gray-300 rounded-lg p-1">
                                <button
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${bucket === "all" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    onClick={() => setBucket("all")}
                                >
                                    <Filter size={14} className="inline-block mr-1" />
                                    Tất cả
                                </button>
                                {ratingBuckets.map((b) => (
                                    <button
                                        key={b.key}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${bucket === b.key ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        onClick={() => setBucket(b.key)}
                                    >
                                        <span className="inline-flex items-center gap-1">{b.icon}{b.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Sao cụ thể</label>
                            <div className="flex items-center flex-wrap gap-2 bg-white border border-gray-300 rounded-lg p-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => toggleRating(n)}
                                        className={`px-2.5 py-1.5 rounded-md text-sm font-semibold ${selectedRatings.includes(n) ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        {n}★
                                    </button>
                                ))}
                                {selectedRatings.length > 0 && (
                                    <span className="text-xs text-gray-500 ml-1">
                                        (Ưu tiên lọc theo sao, thay cho nhóm)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sort + Limit */}
                    <div className="md:col-span-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="f-sort" className="block text-xs font-semibold text-gray-600 mb-1">Sắp xếp</label>
                                <select
                                    id="f-sort"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm w-full"
                                >
                                    {sortOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="f-limit" className="block text-xs font-semibold text-gray-600 mb-1">Số dòng/trang</label>
                                <select
                                    id="f-limit"
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm w-full"
                                >
                                    {[10, 15, 20, 30, 50, 100].map((n) => (
                                        <option key={n} value={n}>{n}/trang</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Doctor / Clinic / Date range */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                        <label htmlFor="f-doctor" className="block text-xs font-semibold text-gray-600 mb-1">Bác sĩ (doctor_id)</label>
                        <input
                            id="f-doctor"
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                            placeholder="Nhập doctor_id"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label htmlFor="f-clinic" className="block text-xs font-semibold text-gray-600 mb-1">Cơ sở (clinic_id)</label>
                        <input
                            id="f-clinic"
                            value={clinicId}
                            onChange={(e) => setClinicId(e.target.value)}
                            placeholder="Nhập clinic_id"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="f-start" className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày</label>
                                <input
                                    id="f-start"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="f-end" className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày</label>
                                <input
                                    id="f-end"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                        <ThumbsUp size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Tích cực (4–5★)</p>
                        <p className="text-2xl font-bold text-gray-900">{positiveCount.toLocaleString("vi-VN")}</p>
                    </div>
                </div>
                <div className="flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
                        <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Trung lập (3★)</p>
                        <p className="text-2xl font-bold text-gray-900">{neutralCount.toLocaleString("vi-VN")}</p>
                    </div>
                </div>
                <div className="flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-600">
                        <ThumbsDown size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Tiêu cực (1–2★)</p>
                        <p className="text-2xl font-bold text-gray-900">{negativeCount.toLocaleString("vi-VN")}</p>
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Phản hồi gần đây</h2>
                    <span className="text-sm text-gray-600">
                        Tổng {total.toLocaleString("vi-VN")} phản hồi
                    </span>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Đánh giá</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Bệnh nhân</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Nội dung</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Bác sĩ / Cơ sở</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Ngày</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recent.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                    Không có phản hồi phù hợp tiêu chí lọc.
                                </td>
                            </tr>
                        ) : (
                            recent.map((f, idx) => {
                                const style = getRatingStyle(Number(f.rating || 0));
                                return (
                                    <tr key={`${f.id || idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                                                {style.label} ({f.rating}/5 ★)
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                {showAnonymousInfo && f.is_annonymous ? (
                                                    <span className="text-sm text-gray-500 italic">Bệnh nhân ẩn danh</span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-900">{f.patient_name || "Bệnh nhân"}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                                            <p className="text-gray-800">{f.comment || ""}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-gray-900">{f.doctor_name || "Bác sĩ"}</span>
                                                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold w-fit">
                                                    {f.clinic_name || "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString("vi-VN") : ""}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-gray-600">
                        Trang {page} / {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 ${page <= 1 ? "text-gray-300 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <ChevronLeft size={16} /> Trước
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 ${page >= totalPages ? "text-gray-300 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            Sau <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* By Doctor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Top bác sĩ theo đánh giá</h2>
                    <span className="text-sm text-gray-600">Tối đa 20 bác sĩ</span>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Bác sĩ</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cơ sở</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Điểm TB</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Số đánh giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        {byDoctor.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                    Chưa có dữ liệu tổng hợp theo bác sĩ.
                                </td>
                            </tr>
                        ) : (
                            byDoctor.map((d, idx) => (
                                <tr key={`${d.doctor_id || idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{d.doctor_name || "Bác sĩ"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{d.clinic_name || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{(d.avgRating ?? 0).toFixed(1)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{(d.totalReviews ?? 0).toLocaleString("vi-VN")}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
