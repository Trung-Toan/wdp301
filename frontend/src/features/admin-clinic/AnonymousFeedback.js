"use client"

import { useState } from "react"
import { MessageSquare, Eye, EyeOff, ThumbsUp, ThumbsDown, Filter, Edit2, Trash2 } from "lucide-react"
import "../../../styles/admin-clinic/feedback.css"

const mockFeedback = [
    {
        id: "1",
        rating: "positive",
        content: "Bác sĩ rất tận tâm, giải thích rõ ràng về tình trạng bệnh của tôi.",
        category: "Dịch vụ",
        date: "2025-10-27",
        doctorSpecialty: "Nội khoa",
    },
    {
        id: "2",
        rating: "negative",
        content: "Thời gian chờ quá lâu, bác sĩ vội vàng không nghe tôi nói hết.",
        category: "Thái độ",
        date: "2025-10-26",
        doctorSpecialty: "Ngoại khoa",
    },
    {
        id: "3",
        rating: "positive",
        content: "Tư vấn chi tiết, bác sĩ rất kiên nhẫn trả lời các câu hỏi của tôi.",
        category: "Dịch vụ",
        date: "2025-10-25",
        doctorSpecialty: "Nhi khoa",
    },
    {
        id: "4",
        rating: "neutral",
        content: "Bình thường, không có gì đặc biệt. Kết quả khám như mong đợi.",
        category: "Chất lượng",
        date: "2025-10-24",
        doctorSpecialty: "Tim mạch",
    },
    {
        id: "5",
        rating: "positive",
        content: "Nhân viên lễ tân thân thiện, quy trình khám nhanh chóng.",
        category: "Dịch vụ",
        date: "2025-10-23",
        doctorSpecialty: "Nội khoa",
    },
]

export default function AnonymousFeedback() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRating, setSelectedRating] = useState("all")
    const [showAnonymousInfo, setShowAnonymousInfo] = useState(false)

    const filteredFeedback = mockFeedback.filter((fb) => {
        const matchesSearch =
            fb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRating = selectedRating === "all" || fb.rating === selectedRating
        return matchesSearch && matchesRating
    })

    const getRatingClass = (rating) => {
        switch (rating) {
            case "positive":
                return "rating-positive"
            case "negative":
                return "rating-negative"
            default:
                return "rating-neutral"
        }
    }

    const getRatingLabel = (rating) => {
        switch (rating) {
            case "positive":
                return "Tích cực"
            case "negative":
                return "Tiêu cực"
            default:
                return "Trung lập"
        }
    }

    const getRatingIcon = (rating) => {
        switch (rating) {
            case "positive":
                return <ThumbsUp size={16} />
            case "negative":
                return <ThumbsDown size={16} />
            default:
                return <MessageSquare size={16} />
        }
    }

    return (
        <div className="feedback-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Feedback bệnh nhân</h1>
                    <p>Xem feedback ẩn danh từ bệnh nhân về dịch vụ và bác sĩ</p>
                </div>
                <button className="btn-secondary" onClick={() => setShowAnonymousInfo(!showAnonymousInfo)}>
                    {showAnonymousInfo ? <EyeOff size={18} /> : <Eye size={18} />}
                    {showAnonymousInfo ? "Ẩn" : "Hiện"} thông tin
                </button>
            </div>

            {/* Anonymous Info Banner */}
            {showAnonymousInfo && (
                <div className="info-banner">
                    <p>
                        <strong>Chế độ ẩn danh:</strong> Tất cả feedback được bảo vệ bởi chế độ ẩn danh. Danh tính bệnh nhân không
                        được tiết lộ.
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card positive">
                    <div className="stat-icon">
                        <ThumbsUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Feedback tích cực</p>
                        <p className="stat-value">{mockFeedback.filter((f) => f.rating === "positive").length}</p>
                    </div>
                </div>

                <div className="stat-card negative">
                    <div className="stat-icon">
                        <ThumbsDown size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Feedback tiêu cực</p>
                        <p className="stat-value">{mockFeedback.filter((f) => f.rating === "negative").length}</p>
                    </div>
                </div>

                <div className="stat-card neutral">
                    <div className="stat-icon">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Feedback trung lập</p>
                        <p className="stat-value">{mockFeedback.filter((f) => f.rating === "neutral").length}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${selectedRating === "all" ? "active" : ""}`}
                        onClick={() => setSelectedRating("all")}
                    >
                        <Filter size={16} />
                        Tất cả
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === "positive" ? "active" : ""}`}
                        onClick={() => setSelectedRating("positive")}
                    >
                        Tích cực
                    </button>
                    <button
                        className={`filter-btn ${selectedRating === "negative" ? "active" : ""}`}
                        onClick={() => setSelectedRating("negative")}
                    >
                        Tiêu cực
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ĐÁNH GIÁ</th>
                            <th>NỘI DUNG</th>
                            <th>DANH MỤC</th>
                            <th>CHUYÊN KHOA</th>
                            <th>NGÀY</th>
                            <th>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeedback.map((feedback) => (
                            <tr key={feedback.id} className={`table-row ${getRatingClass(feedback.rating)}`}>
                                <td className="cell-rating">
                                    <span className={`rating-badge ${getRatingClass(feedback.rating)}`}>
                                        {getRatingIcon(feedback.rating)}
                                        {getRatingLabel(feedback.rating)}
                                    </span>
                                </td>
                                <td className="cell-content">
                                    <p className="feedback-text">{feedback.content}</p>
                                </td>
                                <td>
                                    <span className="category-badge">{feedback.category}</span>
                                </td>
                                <td>
                                    <span className="specialty-badge">{feedback.doctorSpecialty}</span>
                                </td>
                                <td>{feedback.date}</td>
                                <td className="cell-actions">
                                    <button className="action-btn edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="action-btn delete">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
