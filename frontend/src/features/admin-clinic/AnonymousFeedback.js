"use client"

import { useState, useEffect } from "react" // <-- Thêm useEffect
import {
    MessageSquare,
    Eye,
    EyeOff,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Edit2,
    Trash2,
    Info,
    Search,
    User, // <-- Thêm icon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Import dữ liệu mock để tra cứu thông tin
import {
    sampleDoctors,
    sampleUsers,
    sampleSpecialties,
} from "../../data/mockData"

// Dữ liệu thô (Raw) từ CSDL (sử dụng cấu trúc của bạn)
const rawFeedbacks = [
    {
        _id: { $oid: "68f845803016b5c486692193" },
        rating: { $numberInt: "4" },
        comment: "Khám kỹ, tư vấn rõ ràng nhưng hơi đông bệnh nhân.",
        is_annonymous: true,
        patient_id: { $oid: "68f83b523016b5c486692174" }, // Maps to sampleUsers[0]
        doctor_id: { $oid: "68ed2c7a3016b5c4866912de" }, // Maps to sampleDoctors[0]
        createdAt: "2025-10-27T10:30:00Z",
    },
    {
        _id: { $oid: "68f845803016b5c486692194" },
        rating: { $numberInt: "2" },
        comment: "Thời gian chờ quá lâu, bác sĩ vội vàng không nghe tôi nói hết.",
        is_annonymous: false,
        patient_id: { $oid: "68f83b523016b5c486692175" }, // Maps to sampleUsers[1]
        doctor_id: { $oid: "68ed2c7a3016b5c4866912df" }, // Maps to sampleDoctors[1]
        createdAt: "2025-10-26T14:15:00Z",
    },
    {
        _id: { $oid: "68f845803016b5c486692195" },
        rating: { $numberInt: "5" },
        comment: "Tuyệt vời, nhân viên lễ tân thân thiện, bác sĩ 5 sao.",
        is_annonymous: true,
        patient_id: { $oid: "68f83b523016b5c486692174" }, // Maps to sampleUsers[0]
        doctor_id: { $oid: "68ed2c7a3016b5c4866912e0" }, // Maps to sampleDoctors[2]
        createdAt: "2025-10-25T09:00:00Z",
    },
    {
        _id: { $oid: "68f845803016b5c486692196" },
        rating: { $numberInt: "3" },
        comment: "Bình thường, không có gì đặc biệt.",
        is_annonymous: false,
        patient_id: { $oid: "68f83b523016b5c486692176" }, // Maps to sampleUsers[2]
        doctor_id: { $oid: "68ed2c7a3016b5c4866912de" }, // Maps to sampleDoctors[0]
        createdAt: "2025-10-24T11:00:00Z",
    },
]

export default function AnonymousFeedback() {
    // State mới để giữ dữ liệu đã biến đổi
    const [feedbacks, setFeedbacks] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRating, setSelectedRating] = useState("all")
    // Mặc định là true để tôn trọng quyền ẩn danh
    const [showAnonymousInfo, setShowAnonymousInfo] = useState(true)

    // Hàm helper mới để xử lý rating (1-5)
    const getRatingInfo = (ratingNumber) => {
        const num = parseInt(ratingNumber, 10)
        if (num >= 4) {
            return {
                label: "Tích cực",
                badgeClass: "bg-green-100 text-green-700",
                icon: <ThumbsUp size={14} />,
                type: "positive",
            }
        }
        if (num === 3) {
            return {
                label: "Trung lập",
                badgeClass: "bg-gray-100 text-gray-700",
                icon: <MessageSquare size={14} />,
                type: "neutral",
            }
        }
        return {
            label: "Tiêu cực",
            badgeClass: "bg-red-100 text-red-700",
            icon: <ThumbsDown size={14} />,
            type: "negative",
        }
    }

    // Biến đổi dữ liệu thô sang dữ liệu "sạch" để render
    useEffect(() => {
        const transformed = rawFeedbacks.map((fb) => {
            const ratingNum = parseInt(fb.rating.$numberInt, 10)
            const ratingInfo = getRatingInfo(ratingNum)

            // Tra cứu thông tin bệnh nhân
            const patient = sampleUsers.find((u) => u._id === fb.patient_id.$oid)

            // Tra cứu thông tin bác sĩ
            const doctor = sampleDoctors.find((d) => d._id === fb.doctor_id.$oid)
            const doctorUser = sampleUsers.find((u) => u._id === doctor?.user_id)
            const specialties =
                doctor?.specialty_id
                    .map((id) => sampleSpecialties.find((s) => s._id === id)?.name)
                    .join(", ") || "N/A"

            return {
                id: fb._id.$oid,
                rating: ratingNum,
                ratingType: ratingInfo.type, // "positive", "negative", "neutral"
                ratingLabel: ratingInfo.label,
                ratingIcon: ratingInfo.icon,
                ratingBadgeClass: ratingInfo.badgeClass,
                comment: fb.comment,
                isAnnonymous: fb.is_annonymous,
                patientName: patient?.full_name || "Không rõ",
                doctorName: doctorUser?.full_name || "Không rõ",
                specialty: specialties,
                date: new Date(fb.createdAt).toLocaleDateString("vi-VN"),
            }
        })
        setFeedbacks(transformed)
    }, []) // Chạy 1 lần khi component mount

    // Lọc trên state `feedbacks` đã biến đổi
    const filteredFeedback = feedbacks.filter((fb) => {
        const matchesSearch =
            fb.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.specialty.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRating = selectedRating === "all" || fb.ratingType === selectedRating
        return matchesSearch && matchesRating
    })

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback bệnh nhân</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Xem feedback ẩn danh từ bệnh nhân về dịch vụ và bác sĩ
                    </p>
                </div>
                <button
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    onClick={() => setShowAnonymousInfo(!showAnonymousInfo)}
                >
                    {showAnonymousInfo ? <EyeOff size={18} /> : <Eye size={18} />}
                    {showAnonymousInfo ? "Ẩn danh" : "Hiển thị"}
                </button>
            </div>

            {/* Anonymous Info Banner: Thêm animation */}
            <AnimatePresence> {/* <-- 2. Bọc ngoài */}
                {showAnonymousInfo && (
                    <motion.div  // <-- 3. Đổi 'div' thành 'motion.div'
                        className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg overflow-hidden" // Thêm 'overflow-hidden'
                        initial={{ opacity: 0, height: 0, y: -20 }} // Trạng thái ban đầu (ẩn)
                        animate={{ opacity: 1, height: "auto", y: 0 }} // Trạng thái khi hiện
                        exit={{ opacity: 0, height: 0, y: -20 }} // Trạng thái khi ẩn
                        transition={{ duration: 0.3, ease: "easeInOut" }} // Tốc độ
                    >
                        <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-blue-700">
                                <strong className="font-semibold text-blue-900">
                                    Chế độ Ẩn danh đang BẬT:
                                </strong>{" "}
                                Tên của bệnh nhân chọn ẩn danh sẽ được che giấu.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Banner Thông tin Ẩn danh */}
            {showAnonymousInfo && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg">
                    <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-blue-700">
                            <strong className="font-semibold text-blue-900">
                                Chế độ Ẩn danh đang BẬT:
                            </strong>{" "}
                            Tên của bệnh nhân chọn ẩn danh sẽ được che giấu.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats (cập nhật để dùng state `feedbacks`) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card Tích cực (Đã thêm hover:-translate-y-1) */}
                <div
                    className={`flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedRating === "positive"
                        ? "border-green-400 ring-2 ring-green-100"
                        : "border-gray-200"
                        }`}
                    onClick={() => setSelectedRating("positive")}
                >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                        <ThumbsUp size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Feedback tích cực (4-5 ★)</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {feedbacks.filter((f) => f.ratingType === "positive").length}
                        </p>
                    </div>
                </div>

                {/* Card Tiêu cực (Đã thêm hover:-translate-y-1) */}
                <div
                    className={`flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedRating === "negative"
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-gray-200"
                        }`}
                    onClick={() => setSelectedRating("negative")}
                >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-600">
                        <ThumbsDown size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Feedback tiêu cực (1-2 ★)</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {feedbacks.filter((f) => f.ratingType === "negative").length}
                        </p>
                    </div>
                </div>

                {/* Card Trung lập (Đã thêm hover:-translate-y-1) */}
                <div
                    className={`flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedRating === "neutral"
                        ? "border-gray-400 ring-2 ring-gray-100"
                        : "border-gray-200"
                        }`}
                    onClick={() => setSelectedRating("neutral")}
                >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
                        <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Feedback trung lập (3 ★)</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {feedbacks.filter((f) => f.ratingType === "neutral").length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo nội dung, bệnh nhân, bác sĩ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
                    />
                </div>

                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedRating === "all"
                            ? "bg-blue-100 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedRating("all")}
                    >
                        <Filter size={16} />
                        Tất cả
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedRating === "positive"
                            ? "bg-green-100 text-green-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedRating("positive")}
                    >
                        Tích cực
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedRating === "negative"
                            ? "bg-red-100 text-red-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedRating("negative")}
                    >
                        Tiêu cực
                    </button>
                </div>
            </div>

            {/* Table (Cập nhật cột) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Đánh giá
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Bệnh nhân
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Nội dung
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Bác sĩ / Chuyên khoa
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Ngày
                            </th>
                            {/* <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Hành động
                            </th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeedback.map((feedback) => (
                            <tr
                                key={feedback.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                {/* ĐÁNH GIÁ */}
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${feedback.ratingBadgeClass}`}
                                    >
                                        {feedback.ratingIcon}
                                        {feedback.ratingLabel} ({feedback.rating}/5 ★)
                                    </span>
                                </td>

                                {/* BỆNH NHÂN (Cột mới với logic ẩn danh) */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {showAnonymousInfo && feedback.isAnnonymous ? (
                                            <span className="text-sm text-gray-500 italic">
                                                Bệnh nhân ẩn danh
                                            </span>
                                        ) : (
                                            <span className="text-sm font-semibold text-gray-900">
                                                {feedback.patientName}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* NỘI DUNG */}
                                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                                    <p className="text-gray-800">{feedback.comment}</p>
                                </td>

                                {/* BÁC SĨ / CHUYÊN KHOA (Cột đã sửa) */}
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {feedback.doctorName}
                                        </span>
                                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold w-fit">
                                            {feedback.specialty}
                                        </span>
                                    </div>
                                </td>

                                {/* NGÀY */}
                                <td className="px-4 py-3 text-sm text-gray-600">{feedback.date}</td>

                                {/* HÀNH ĐỘNG */}
                                {/* <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}