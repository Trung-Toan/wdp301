"use client"
import "../../styles/admin-system/ViewModal.css"

const ViewModal = ({ data, onClose }) => {
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const formatFieldValue = (value) => {
    if (typeof value === "boolean") return value ? "Có" : "Không"
    if (typeof value === "number") return value.toLocaleString("vi-VN")
    return String(value)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết thông tin</h2>
          <button className="modal-close" onClick={onClose} aria-label="Đóng modal">
            ×
          </button>
        </div>
        <div className="modal-body">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="info-row">
              <label>{formatFieldName(key)}:</label>
              <span>{formatFieldValue(value)}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewModal
