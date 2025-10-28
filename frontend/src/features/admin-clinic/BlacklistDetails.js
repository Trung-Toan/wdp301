"use client"

import { useState } from "react"
import { Ban, AlertCircle, Filter, Trash2, Eye, Edit2 } from "lucide-react"
import "../../styles/admin-clinic/blacklist.css"

const mockBlacklist = [
    {
        id: "1",
        name: "Dr. Hoàng Văn X",
        specialty: "Nội khoa",
        reason: "Vi phạm quy tắc ứng xử chuyên nghiệp",
        dateAdded: "2025-09-15",
        severity: "high",
        details: "Bác sĩ có hành vi không phù hợp với bệnh nhân, vi phạm tiêu chuẩn đạo đức y tế.",
    },
    {
        id: "2",
        name: "Dr. Tô Thị Y",
        specialty: "Ngoại khoa",
        reason: "Kết quả điều trị kém, khiếu nại từ bệnh nhân",
        dateAdded: "2025-08-22",
        severity: "high",
        details: "Nhiều khiếu nại từ bệnh nhân về kết quả điều trị không như mong đợi.",
    },
    {
        id: "3",
        name: "Dr. Ngô Văn Z",
        specialty: "Nhi khoa",
        reason: "Thiếu chứng chỉ hành nghề",
        dateAdded: "2025-07-10",
        severity: "high",
        details: "Bác sĩ không có chứng chỉ hành nghề hợp lệ cho chuyên khoa nhi khoa.",
    },
    {
        id: "4",
        name: "Dr. Dương Thị K",
        specialty: "Tim mạch",
        reason: "Lỗi y tế, gây hại cho bệnh nhân",
        dateAdded: "2025-06-05",
        severity: "high",
        details: "Lỗi y tế trong quá trình điều trị gây biến chứng cho bệnh nhân.",
    },
    {
        id: "5",
        name: "Dr. Võ Văn L",
        specialty: "Nội khoa",
        reason: "Hành vi không chuyên nghiệp",
        dateAdded: "2025-05-18",
        severity: "medium",
        details: "Bác sĩ có hành vi không chuyên nghiệp trong giao tiếp với bệnh nhân.",
    },
]

export default function BlacklistDetails() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSeverity, setSelectedSeverity] = useState("all")

    const filteredBlacklist = mockBlacklist.filter((doctor) => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.reason.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity = selectedSeverity === "all" || doctor.severity === selectedSeverity
        return matchesSearch && matchesSeverity
    })

    const getSeverityClass = (severity) => {
        switch (severity) {
            case "high":
                return "severity-high"
            case "medium":
                return "severity-medium"
            default:
                return "severity-low"
        }
    }

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case "high":
                return "Nghiêm trọng"
            case "medium":
                return "Trung bình"
            default:
                return "Thấp"
        }
    }

    return (
        <div className="blacklist-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Danh sách đen</h1>
                    <p>Quản lý danh sách bác sĩ bị cấm hoạt động tại phòng khám</p>
                </div>
                <div className="header-badge">
                    <Ban size={20} />
                    <span>{mockBlacklist.length} bác sĩ</span>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="warning-banner">
                <AlertCircle size={20} />
                <p>
                    <strong>Lưu ý:</strong> Các bác sĩ trong danh sách này bị cấm hoạt động tại phòng khám. Không được phép tuyển
                    dụng hoặc hợp tác với họ.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, chuyên khoa hoặc lý do..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${selectedSeverity === "all" ? "active" : ""}`}
                        onClick={() => setSelectedSeverity("all")}
                    >
                        <Filter size={16} />
                        Tất cả
                    </button>
                    <button
                        className={`filter-btn ${selectedSeverity === "high" ? "active" : ""}`}
                        onClick={() => setSelectedSeverity("high")}
                    >
                        Nghiêm trọng
                    </button>
                    <button
                        className={`filter-btn ${selectedSeverity === "medium" ? "active" : ""}`}
                        onClick={() => setSelectedSeverity("medium")}
                    >
                        Trung bình
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>TÊN BÁC SĨ</th>
                            <th>CHUYÊN KHOA</th>
                            <th>LÝ DO CẤM</th>
                            <th>NGÀY THÊM VÀO</th>
                            <th>MỨC ĐỘ</th>
                            <th>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBlacklist.map((doctor) => (
                            <tr key={doctor.id} className={`table-row ${getSeverityClass(doctor.severity)}`}>
                                <td className="cell-name">
                                    <div className="doctor-info">
                                        <Ban size={18} className="doctor-icon" />
                                        <p className="name">{doctor.name}</p>
                                    </div>
                                </td>
                                <td>{doctor.specialty}</td>
                                <td className="cell-reason">
                                    <p className="reason-text">{doctor.reason}</p>
                                </td>
                                <td>{doctor.dateAdded}</td>
                                <td>
                                    <span className={`severity-badge ${getSeverityClass(doctor.severity)}`}>
                                        {getSeverityLabel(doctor.severity)}
                                    </span>
                                </td>
                                <td className="cell-actions">
                                    <button className="action-btn view" title="Xem chi tiết">
                                        <Eye size={16} />
                                    </button>
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
