import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Swal from "sweetalert2"
import "../../styles/admin-system/ManageComplaints.css"
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI"
import ComplaintViewModal from "./ComplaintViewModal"
import ConfirmModal from "./ConfirmModal"

const ManageComplaints = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [complaintTypeFilter, setComplaintTypeFilter] = useState("all")
  const [viewModal, setViewModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch complaints
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-complaints", page, statusFilter, complaintTypeFilter, searchTerm],
    queryFn: async () => {
      const params = {
        page,
        limit: 10,
      }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (complaintTypeFilter !== "all") {
        params.complaint_type = complaintTypeFilter
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await adminSystemAPI.getAllComplaints(params)
      return response.data
    },
  })

  const triggerBlacklistFlow = async (complaint) => {
    if (!complaint) return
    const targetAccount = complaint.target_account
    if (!targetAccount?.id) {
      return
    }

    const targetLabel =
      targetAccount.username ||
      targetAccount.email ||
      targetAccount.phone_number ||
      `${targetAccount.role || "tài khoản"}`

    const { isConfirmed } = await Swal.fire({
      title: "Thêm vào danh sách đen?",
      text: `Bạn có muốn thêm "${targetLabel}" vào danh sách đen sau khi giải quyết khiếu nại này?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Thêm",
      cancelButtonText: "Bỏ qua",
    })

    if (!isConfirmed) return

    try {
      await adminSystemAPI.addToBlacklist({
        accountId: targetAccount.id,
        reason: `Giải quyết khiếu nại: ${complaint.title || "Không tiêu đề"}`,
        evidence: complaint._id,
      })

      Swal.fire({
        icon: "success",
        title: "Đã thêm vào danh sách đen",
        timer: 2000,
        showConfirmButton: false,
      })

      // Nếu có màn hình blacklist sử dụng react-query, có thể invalidate ở đây
      queryClient.invalidateQueries(["admin-blacklists"])
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Không thể thêm",
        text: err.response?.data?.message || "Thêm vào danh sách đen thất bại",
      })
    }
  }

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ complaintId, status, resolutionNote, dismissedReason }) => {
      return await adminSystemAPI.updateComplaintStatus(complaintId, {
        status,
        resolutionNote,
        dismissedReason,
      })
    },
    onSuccess: async (response, variables) => {
      queryClient.invalidateQueries(["admin-complaints"])
      const updatedComplaint = response?.data?.data

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật trạng thái thành công!",
        timer: 2000,
        showConfirmButton: false,
      })
      setConfirmModal(null)

      if (variables.status === "RESOLVED") {
        await triggerBlacklistFlow(updatedComplaint || confirmModal?.data)
      }
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.response?.data?.message || "Cập nhật trạng thái thất bại!",
        timer: 3000,
        showConfirmButton: true,
      })
    },
  })

  const handleStatusChange = (complaint, newStatus) => {
    setConfirmModal({
      type: "status",
      data: complaint,
      newStatus,
    })
  }

  const confirmStatusChange = () => {
    const { data: complaint, newStatus } = confirmModal
    updateStatusMutation.mutate({
      complaintId: complaint._id,
      status: newStatus,
    })
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

  const getComplaintTypeLabel = (type) => {
    return type === "DOCTOR" ? "Bác sĩ" : "Phòng khám"
  }

  const getComplaintTarget = (complaint) => {
    if (complaint.complaint_type === "DOCTOR" && complaint.doctor_id) {
      return complaint.doctor_id.user_id?.full_name || "Bác sĩ"
    }
    if (complaint.complaint_type === "CLINIC" && complaint.clinic_id) {
      return complaint.clinic_id.name || "Phòng khám"
    }
    return "N/A"
  }

  const getComplainantName = (complaint) => {
    if (complaint.patient_id?.user_id) {
      return complaint.patient_id.user_id.full_name || "N/A"
    }
    return "N/A"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Extract data from API response structure: { ok: true, data: { data: [...], meta: {...} } }
  const complaints = Array.isArray(data?.data?.data) ? data.data.data : []
  const meta = data?.data?.meta || {}

  return (
    <div className="manage-complaints-container">
      <div className="manage-header">
        <h1>Quản lý khiếu nại</h1>
        <p className="text-gray-600">Quản lý khiếu nại về bác sĩ và phòng khám</p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm khiếu nại..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setPage(1)
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="IN_REVIEW">Đang xem xét</option>
          <option value="RESOLVED">Đã giải quyết</option>
          <option value="DISMISSED">Đã từ chối</option>
        </select>
        <select
          value={complaintTypeFilter}
          onChange={(e) => {
            setComplaintTypeFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="all">Tất cả loại</option>
          <option value="DOCTOR">Về bác sĩ</option>
          <option value="CLINIC">Về phòng khám</option>
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600">
          <p>Lỗi khi tải dữ liệu: {error.message}</p>
          <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Người khiếu nại</th>
                  <th>Đối tượng</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      Không có khiếu nại nào
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>{complaint.title}</td>
                      <td>
                        <span className="badge badge-info">
                          {getComplaintTypeLabel(complaint.complaint_type)}
                        </span>
                      </td>
                      <td>{getComplainantName(complaint)}</td>
                      <td>{getComplaintTarget(complaint)}</td>
                      <td>
                        <span className={`status-badge status-${complaint.status.toLowerCase()}`}>
                          {getStatusLabel(complaint.status)}
                        </span>
                      </td>
                      <td>{formatDate(complaint.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => setViewModal(complaint)}
                          >
                            Xem
                          </button>
                          {complaint.status !== "RESOLVED" && complaint.status !== "DISMISSED" && (
                            <>
                              {complaint.status === "PENDING" && (
                                <button
                                  className="btn-action btn-update"
                                  onClick={() => handleStatusChange(complaint, "IN_REVIEW")}
                                >
                                  Xem xét
                                </button>
                              )}
                              {complaint.status === "IN_REVIEW" && (
                                <>
                                  <button
                                    className="btn-action btn-resolve"
                                    onClick={() => handleStatusChange(complaint, "RESOLVED")}
                                  >
                                    Giải quyết
                                  </button>
                                  <button
                                    className="btn-action btn-dismiss"
                                    onClick={() => handleStatusChange(complaint, "DISMISSED")}
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          {complaint.target_account?.id && (
                            <button
                              className="btn-action btn-danger"
                              onClick={() => triggerBlacklistFlow(complaint)}
                            >
                              Thêm blacklist
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                Trước
              </button>
              <span className="pagination-info">
                Trang {page} / {meta.totalPages} (Tổng: {meta.total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="pagination-btn"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {viewModal && (
        <ComplaintViewModal
          complaint={viewModal}
          onClose={() => setViewModal(null)}
          onStatusUpdate={(newStatus) => {
            handleStatusChange(viewModal, newStatus)
            setViewModal(null)
          }}
          onAddToBlacklist={() => triggerBlacklistFlow(viewModal)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title="Cập nhật trạng thái"
          message={`Bạn có chắc chắn muốn cập nhật trạng thái khiếu nại này thành "${getStatusLabel(confirmModal.newStatus)}"?`}
          onConfirm={confirmStatusChange}
          onCancel={() => setConfirmModal(null)}
          isLoading={updateStatusMutation.isLoading}
        />
      )}
    </div>
  )
}

export default ManageComplaints
