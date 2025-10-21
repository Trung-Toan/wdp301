"use client"

import { useState } from "react"
import "../styles/ManageComplaints.css"
import ViewModal from "./ViewModal"
import ConfirmModal from "./ConfirmModal"

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: "Dịch vụ kém",
      complainant: "Nguyễn Văn A",
      clinic: "Phòng khám ABC",
      priority: "high",
      status: "open",
      date: "2024-10-15",
    },
    {
      id: 2,
      title: "Bác sĩ không chuyên nghiệp",
      complainant: "Trần Thị B",
      clinic: "Phòng khám XYZ",
      priority: "medium",
      status: "in_progress",
      date: "2024-10-14",
    },
    {
      id: 3,
      title: "Giá cả quá cao",
      complainant: "Lê Văn C",
      clinic: "Phòng khám 123",
      priority: "low",
      status: "resolved",
      date: "2024-10-10",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewModal, setViewModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (id, newStatus) => {
    setComplaints(complaints.map((comp) => (comp.id === id ? { ...comp, status: newStatus } : comp)))
    setConfirmModal(null)
  }

  return (
    <div className="manage-complaints-container">
      <div className="manage-header">
        <h1>Quản lý khiếu nại</h1>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm khiếu nại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="open">Mở</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã giải quyết</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Người khiếu nại</th>
              <th>Phòng khám</th>
              <th>Mức độ ưu tiên</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>{complaint.title}</td>
                <td>{complaint.complainant}</td>
                <td>{complaint.clinic}</td>
                <td>
                  <span className={`priority-badge priority-${complaint.priority}`}>
                    {complaint.priority === "high" ? "Cao" : complaint.priority === "medium" ? "Trung bình" : "Thấp"}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${complaint.status}`}>
                    {complaint.status === "open"
                      ? "Mở"
                      : complaint.status === "in_progress"
                        ? "Đang xử lý"
                        : "Đã giải quyết"}
                  </span>
                </td>
                <td>{complaint.date}</td>
                <td>
                  <button className="btn-action" onClick={() => setViewModal(complaint)}>
                    Xem
                  </button>
                  <button className="btn-action" onClick={() => setConfirmModal({ type: "status", data: complaint })}>
                    Cập nhật
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewModal && <ViewModal data={viewModal} onClose={() => setViewModal(null)} />}
      {confirmModal && (
        <ConfirmModal
          title="Cập nhật trạng thái"
          message={`Bạn có chắc chắn muốn cập nhật trạng thái khiếu nại này?`}
          onConfirm={() => handleStatusChange(confirmModal.data.id, "resolved")}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}

export default ManageComplaints
