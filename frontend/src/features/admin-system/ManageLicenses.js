"use client"

import { useState } from "react"
import "../../styles/admin-system/ManageLicenses.css"
import ViewModal from "./ViewModal"
import ConfirmModal from "./ConfirmModal"

const ManageLicenses = () => {
  const [licenses, setLicenses] = useState([
    {
      id: 1,
      doctorName: "Nguyễn Văn A",
      licenseNumber: "LIC001",
      type: "General",
      expiryDate: "2025-12-31",
      status: "valid",
    },
    {
      id: 2,
      doctorName: "Trần Thị B",
      licenseNumber: "LIC002",
      type: "Specialist",
      expiryDate: "2024-06-30",
      status: "expiring",
    },
    {
      id: 3,
      doctorName: "Lê Văn C",
      licenseNumber: "LIC003",
      type: "General",
      expiryDate: "2023-12-31",
      status: "expired",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewModal, setViewModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch = license.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || license.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRenew = (id) => {
    setLicenses(licenses.map((lic) => (lic.id === id ? { ...lic, status: "valid", expiryDate: "2026-12-31" } : lic)))
    setConfirmModal(null)
  }

  return (
    <div className="manage-licenses-container">
      <div className="manage-header">
        <h1>Quản lý giấy phép</h1>
        <button className="btn-primary">+ Thêm giấy phép</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm bác sĩ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="valid">Hợp lệ</option>
          <option value="expiring">Sắp hết hạn</option>
          <option value="expired">Hết hạn</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên bác sĩ</th>
              <th>Số giấy phép</th>
              <th>Loại</th>
              <th>Ngày hết hạn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredLicenses.map((license) => (
              <tr key={license.id}>
                <td>{license.doctorName}</td>
                <td>{license.licenseNumber}</td>
                <td>{license.type}</td>
                <td>{license.expiryDate}</td>
                <td>
                  <span className={`status-badge status-${license.status}`}>
                    {license.status === "valid" ? "Hợp lệ" : license.status === "expiring" ? "Sắp hết hạn" : "Hết hạn"}
                  </span>
                </td>
                <td>
                  <button className="btn-action" onClick={() => setViewModal(license)}>
                    Xem
                  </button>
                  <button className="btn-action" onClick={() => setConfirmModal(license)}>
                    Gia hạn
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
          title="Gia hạn giấy phép"
          message={`Bạn có chắc chắn muốn gia hạn giấy phép cho bác sĩ "${confirmModal.doctorName}"?`}
          onConfirm={() => handleRenew(confirmModal.id)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}

export default ManageLicenses
