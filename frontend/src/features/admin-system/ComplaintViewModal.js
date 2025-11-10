import { useState, useEffect } from "react"
import {
  User,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react"
import { formatDateTime } from "../../utils/dateTimeUtils"

const FILE_SERVER_URL = "http://localhost:5000/uploads"

const ComplaintViewModal = ({ complaint, onClose, onStatusUpdate }) => {
  const [imageErrors, setImageErrors] = useState({})

  // Reset image errors khi complaint thay đổi
  useEffect(() => {
    setImageErrors({})
  }, [complaint?._id])

  if (!complaint) return null

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const getImageUrl = (url) => {
    if (!url) return null
    // Nếu đã là full URL (http/https), trả về nguyên
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    // Nếu bắt đầu bằng /uploads, chỉ cần thêm domain
    if (url.startsWith("/uploads")) {
      return `http://localhost:5000${url}`
    }
    // Nếu là relative path, thêm FILE_SERVER_URL
    // Loại bỏ dấu / ở đầu nếu có
    const cleanPath = url.startsWith("/") ? url.substring(1) : url
    return `${FILE_SERVER_URL}/${cleanPath}`
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: "Chờ xử lý",
      IN_REVIEW: "Đang xem xét",
      RESOLVED: "Đã giải quyết",
      DISMISSED: "Đã từ chối",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_REVIEW: "bg-blue-100 text-blue-800",
      RESOLVED: "bg-green-100 text-green-800",
      DISMISSED: "bg-red-100 text-red-800",
    }
    return colorMap[status] || "bg-gray-100 text-gray-800"
  }

  const getComplaintTypeLabel = (type) => {
    return type === "DOCTOR" ? "Bác sĩ" : "Phòng khám"
  }

  const getComplaintTarget = () => {
    if (complaint.complaint_type === "DOCTOR" && complaint.doctor_id) {
      return {
        type: "Bác sĩ",
        name: complaint.doctor_id.user_id?.full_name || "N/A",
        title: complaint.doctor_id.title || "",
      }
    }
    if (complaint.complaint_type === "CLINIC" && complaint.clinic_id) {
      return {
        type: "Phòng khám",
        name: complaint.clinic_id.name || "N/A",
        address: complaint.clinic_id.address || "",
      }
    }
    return { type: "N/A", name: "N/A" }
  }

  const getComplainantInfo = () => {
    if (complaint.patient_id?.user_id) {
      return {
        name: complaint.patient_id.user_id.full_name || "N/A",
        email: complaint.patient_id.user_id.email || "N/A",
        phone: complaint.patient_id.user_id.phone_number || "N/A",
      }
    }
    return { name: "N/A", email: "N/A", phone: "N/A" }
  }

  const target = getComplaintTarget()
  const complainant = getComplainantInfo()

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <AlertCircle size={24} />
            <h2 className="text-lg font-semibold">Chi tiết khiếu nại</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng modal"
            className="text-white text-2xl leading-none hover:scale-110 transition-transform"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)}`}>
              {getStatusLabel(complaint.status)}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
              {getComplaintTypeLabel(complaint.complaint_type)}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{complaint.title}</h3>
            <p className="text-gray-600 text-sm">
              Ngày tạo: {formatDateTime(complaint.createdAt)}
            </p>
          </div>

          {/* Content */}
          <div>
            <h4 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
              <FileText size={18} /> Nội dung khiếu nại
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
              {complaint.content}
            </div>
          </div>

          {/* Evidence */}
          {complaint.evidence && complaint.evidence.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <ImageIcon size={18} /> Bằng chứng
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {complaint.evidence.map((evidence, index) => {
                  const imageUrl = getImageUrl(evidence)
                  if (!imageUrl) return null
                  
                  const hasError = imageErrors[index]
                  
                  return (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                        {!hasError ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={`Bằng chứng ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                              onClick={() => window.open(imageUrl, "_blank")}
                              onError={() => handleImageError(index)}
                            />
                            {/* Overlay khi hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                              <span className="text-white text-xs font-medium">Click để xem</span>
                            </div>
                          </>
                        ) : (
                          /* Placeholder khi ảnh không load được */
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                            <div className="text-center px-2">
                              <ImageIcon size={24} className="mx-auto mb-1 text-gray-400" />
                              <p className="text-xs font-medium">Không thể tải ảnh</p>
                              <p className="text-[10px] mt-1 break-all text-gray-500">{evidence}</p>
                              <button
                                onClick={() => window.open(imageUrl, "_blank")}
                                className="mt-2 text-[10px] text-blue-600 hover:underline"
                              >
                                Thử mở link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <p className="text-xs text-gray-500 mt-1 text-center truncate">
                        Bằng chứng {index + 1}
                      </p>
                    </div>
                  )
                })}
              </div>
              {/* Debug info (chỉ hiển thị trong development) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  <strong>Debug:</strong> Evidence array: {JSON.stringify(complaint.evidence)}
                </div>
              )}
            </div>
          )}

          {/* Complainant Info */}
          <div>
            <h4 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
              <User size={18} /> Thông tin người khiếu nại
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Họ tên</span>
                <span className="font-medium text-gray-800">{complainant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-700">{complainant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số điện thoại</span>
                <span className="text-gray-700">{complainant.phone}</span>
              </div>
            </div>
          </div>

          {/* Target Info */}
          <div>
            <h4 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
              {complaint.complaint_type === "DOCTOR" ? (
                <User size={18} />
              ) : (
                <Building2 size={18} />
              )}
              Đối tượng khiếu nại
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Loại</span>
                <span className="font-medium text-gray-800">{target.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tên</span>
                <span className="font-medium text-gray-800">{target.name}</span>
              </div>
              {target.title && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Chức danh</span>
                  <span className="text-gray-700">{target.title}</span>
                </div>
              )}
              {target.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ</span>
                  <span className="text-gray-700">{target.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Info */}
          {complaint.appointment_id && (
            <div>
              <h4 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <Calendar size={18} /> Thông tin lịch hẹn
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {complaint.appointment_id.scheduled_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày hẹn</span>
                    <span className="text-gray-700">
                      {new Date(complaint.appointment_id.scheduled_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {complaint.appointment_id.start_time && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giờ bắt đầu</span>
                    <span className="text-gray-700">{complaint.appointment_id.start_time}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution Info */}
          {complaint.status === "RESOLVED" && (
            <div>
              <h4 className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                <CheckCircle size={18} /> Thông tin giải quyết
              </h4>
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                {complaint.resolved_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày giải quyết</span>
                    <span className="text-gray-700">{formatDateTime(complaint.resolved_at)}</span>
                  </div>
                )}
                {complaint.resolved_by && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Người giải quyết</span>
                    <span className="text-gray-700">
                      {complaint.resolved_by.username || complaint.resolved_by.email || "N/A"}
                    </span>
                  </div>
                )}
                {complaint.resolution_note && (
                  <div className="pt-2 border-t">
                    <span className="block text-gray-500 mb-1">Ghi chú giải quyết</span>
                    <p className="text-gray-700 whitespace-pre-wrap">{complaint.resolution_note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dismissed Info */}
          {complaint.status === "DISMISSED" && complaint.dismissed_reason && (
            <div>
              <h4 className="flex items-center gap-2 text-red-600 font-semibold mb-3">
                <XCircle size={18} /> Lý do từ chối
              </h4>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.dismissed_reason}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {complaint.status !== "RESOLVED" && complaint.status !== "DISMISSED" && (
            <div className="flex gap-3 pt-4 border-t">
              {complaint.status === "PENDING" && (
                <button
                  onClick={() => {
                    onStatusUpdate("IN_REVIEW")
                    onClose()
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Chuyển sang xem xét
                </button>
              )}
              {complaint.status === "IN_REVIEW" && (
                <>
                  <button
                    onClick={() => {
                      onStatusUpdate("RESOLVED")
                      onClose()
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Giải quyết
                  </button>
                  <button
                    onClick={() => {
                      onStatusUpdate("DISMISSED")
                      onClose()
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Từ chối
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComplaintViewModal

