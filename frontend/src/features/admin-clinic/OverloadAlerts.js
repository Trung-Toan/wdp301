"use client"

import { useState } from "react"
import { AlertTriangle, Clock, Users, Download, Filter, Edit2, Trash2 } from "lucide-react"
import "../../../styles/admin-clinic/overload-alerts.css"

const mockAlerts = [
    {
        id: "1",
        name: "Dr. Nguyễn Văn A",
        specialty: "Nội khoa",
        avgTimePerPatient: 8,
        patientsPerDay: 45,
        severity: "critical",
        schedule: "Thứ 2 - Thứ 6: 8:00 - 17:00",
    },
    {
        id: "2",
        name: "Dr. Trần Thị B",
        specialty: "Ngoại khoa",
        avgTimePerPatient: 12,
        patientsPerDay: 38,
        severity: "warning",
        schedule: "Thứ 2 - Thứ 5: 8:00 - 16:00",
    },
    {
        id: "3",
        name: "Dr. Lê Văn C",
        specialty: "Nhi khoa",
        avgTimePerPatient: 18,
        patientsPerDay: 22,
        severity: "normal",
        schedule: "Thứ 2 - Thứ 6: 9:00 - 17:00",
    },
    {
        id: "4",
        name: "Dr. Phạm Thị D",
        specialty: "Tim mạch",
        avgTimePerPatient: 10,
        patientsPerDay: 42,
        severity: "critical",
        schedule: "Thứ 2 - Thứ 6: 8:00 - 17:00",
    },
]

export default function OverloadAlerts() {
    const [selectedSeverity, setSelectedSeverity] = useState("all")

    const filteredAlerts =
        selectedSeverity === "all" ? mockAlerts : mockAlerts.filter((alert) => alert.severity === selectedSeverity)

    const getSeverityClass = (severity) => {
        switch (severity) {
            case "critical":
                return "severity-critical"
            case "warning":
                return "severity-warning"
            default:
                return "severity-normal"
        }
    }

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case "critical":
                return "Nghiêm trọng"
            case "warning":
                return "Cần chú ý"
            default:
                return "Bình thường"
        }
    }

    return (
        <div className="overload-alerts-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Cảnh báo quá tải</h1>
                    <p>Theo dõi lịch làm việc của bác sĩ và cảnh báo khi quá tải</p>
                </div>
                <button className="btn-primary">
                    <Download size={18} />
                    Xuất báo cáo
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card critical">
                    <div className="stat-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Cảnh báo nghiêm trọng</p>
                        <p className="stat-value">{mockAlerts.filter((a) => a.severity === "critical").length}</p>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Cảnh báo cần chú ý</p>
                        <p className="stat-value">{mockAlerts.filter((a) => a.severity === "warning").length}</p>
                    </div>
                </div>

                <div className="stat-card normal">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Bác sĩ bình thường</p>
                        <p className="stat-value">{mockAlerts.filter((a) => a.severity === "normal").length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <button
                    className={`filter-btn ${selectedSeverity === "all" ? "active" : ""}`}
                    onClick={() => setSelectedSeverity("all")}
                >
                    <Filter size={16} />
                    Tất cả
                </button>
                <button
                    className={`filter-btn ${selectedSeverity === "critical" ? "active" : ""}`}
                    onClick={() => setSelectedSeverity("critical")}
                >
                    Nghiêm trọng
                </button>
                <button
                    className={`filter-btn ${selectedSeverity === "warning" ? "active" : ""}`}
                    onClick={() => setSelectedSeverity("warning")}
                >
                    Cần chú ý
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>TÊN BÁC SĨ</th>
                            <th>CHUYÊN KHOA</th>
                            <th>THỜI GIAN/BN</th>
                            <th>BN/NGÀY</th>
                            <th>LỊCH LÀM VIỆC</th>
                            <th>MỨC ĐỘ</th>
                            <th>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlerts.map((alert) => (
                            <tr key={alert.id} className={`table-row ${getSeverityClass(alert.severity)}`}>
                                <td className="cell-name">
                                    <div>
                                        <p className="name">{alert.name}</p>
                                    </div>
                                </td>
                                <td>{alert.specialty}</td>
                                <td>
                                    <span className="badge">{alert.avgTimePerPatient} phút</span>
                                </td>
                                <td>{alert.patientsPerDay}</td>
                                <td className="cell-schedule">{alert.schedule}</td>
                                <td>
                                    <span className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                                        {getSeverityLabel(alert.severity)}
                                    </span>
                                </td>
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
