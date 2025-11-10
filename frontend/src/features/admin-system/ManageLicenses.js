"use client"

import { useState, useEffect } from "react"
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI"
import ViewModal from "./ViewModal"
import ConfirmModal from "./ConfirmModal"
import { formatDateTime } from "../../utils/dateTimeUtils"

const FILE_SERVER_URL = "http://localhost:5000/uploads"

const ManageLicenses = () => {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewModal, setViewModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchLicenses()
  }, [statusFilter, pagination.page])

  const fetchLicenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        ...(searchTerm && { search: searchTerm })
      }

      const res = await adminSystemAPI.getAllLicenses(params)
      
      if (res.data?.ok && res.data?.data) {
        setLicenses(res.data.data.licenses || [])
        setPagination(prev => ({
          ...prev,
          total: res.data.data.pagination?.total || 0,
          totalPages: res.data.data.pagination?.totalPages || 0
        }))
      } else {
        setError("Không thể tải danh sách chứng chỉ")
      }
    } catch (err) {
      console.error("Error fetching licenses:", err)
      if (err.code === "ERR_NETWORK") {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra backend.")
      } else {
        setError(err.response?.data?.message || "Lỗi khi tải danh sách chứng chỉ")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLicenses()
  }

  const handleViewDetail = async (licenseId) => {
    try {
      const res = await adminSystemAPI.getLicenseById(licenseId)
      if (res.data?.ok && res.data?.data) {
        setViewModal(res.data.data)
      }
    } catch (err) {
      console.error("Error fetching license detail:", err)
      alert(err.response?.data?.message || "Không thể tải chi tiết chứng chỉ")
    }
  }

  const handleApprove = async (licenseId) => {
    try {
      setActionLoading(true)
      const res = await adminSystemAPI.updateLicenseStatus(licenseId, { status: "APPROVED" })
      if (res.data?.ok) {
        alert("Phê duyệt chứng chỉ thành công!")
        fetchLicenses()
        setConfirmModal(null)
      } else {
        alert(res.data?.message || "Phê duyệt thất bại")
      }
    } catch (err) {
      console.error("Error approving license:", err)
      alert(err.response?.data?.message || "Không thể phê duyệt chứng chỉ")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (licenseId, rejectionReason) => {
    try {
      setActionLoading(true)
      const res = await adminSystemAPI.updateLicenseStatus(licenseId, { 
        status: "REJECTED",
        rejectionReason: rejectionReason || "Không đáp ứng yêu cầu"
      })
      if (res.data?.ok) {
        alert("Từ chối chứng chỉ thành công!")
        fetchLicenses()
        setConfirmModal(null)
      } else {
        alert(res.data?.message || "Từ chối thất bại")
      }
    } catch (err) {
      console.error("Error rejecting license:", err)
      alert(err.response?.data?.message || "Không thể từ chối chứng chỉ")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      valid: "Hợp lệ",
      expiring: "Sắp hết hạn",
      expired: "Hết hạn",
      pending: "Chờ duyệt",
      rejected: "Đã từ chối"
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      valid: "bg-green-100 text-green-800",
      expiring: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
      pending: "bg-blue-100 text-blue-800",
      rejected: "bg-gray-100 text-gray-800"
    }
    return classMap[status] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  if (loading && licenses.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error && licenses.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLicenses}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý chứng chỉ hành nghề</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm bác sĩ hoặc số chứng chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tìm kiếm
        </button>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="valid">Hợp lệ</option>
          <option value="expiring">Sắp hết hạn</option>
          <option value="expired">Hết hạn</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số chứng chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cơ quan cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày hết hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                licenses.map((license) => (
                  <tr key={license.id || license._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {license.doctorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {license.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {license.issued_by || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(license.issued_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(license.expiry_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(license.status)}`}>
                        {getStatusLabel(license.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(license.id || license._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Xem
                        </button>
                        {license.originalStatus === "PENDING" && (
                          <>
                            <button
                              onClick={() => setConfirmModal({ 
                                type: "approve", 
                                licenseId: license.id || license._id,
                                doctorName: license.doctorName
                              })}
                              className="text-green-600 hover:text-green-900"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Nhập lý do từ chối:")
                                if (reason) {
                                  handleReject(license.id || license._id, reason)
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} kết quả
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-gray-700">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* View Modal - License Detail */}
      {viewModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">Chi tiết chứng chỉ hành nghề</h2>
              <button
                onClick={() => setViewModal(null)}
                className="text-white text-2xl leading-none hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin bác sĩ */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">Thông tin bác sĩ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tên bác sĩ</span>
                    <span className="font-medium text-gray-800">
                      {viewModal.doctor_id?.user_id?.full_name || "N/A"}
                    </span>
                  </div>
                  {viewModal.doctor_id?.title && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chức danh</span>
                      <span className="text-gray-700">{viewModal.doctor_id.title}</span>
                    </div>
                  )}
                  {viewModal.doctor_id?.clinic_id?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phòng khám</span>
                      <span className="text-gray-700">{viewModal.doctor_id.clinic_id.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin chứng chỉ */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">Thông tin chứng chỉ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số chứng chỉ</span>
                    <span className="font-medium text-gray-800">{viewModal.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cơ quan cấp</span>
                    <span className="text-gray-700">{viewModal.issued_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày cấp</span>
                    <span className="text-gray-700">{formatDate(viewModal.issued_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày hết hạn</span>
                    <span className="text-gray-700">{formatDate(viewModal.expiry_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(viewModal.status?.toLowerCase())}`}>
                      {getStatusLabel(viewModal.status?.toLowerCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tài liệu đính kèm */}
              {viewModal.document_url && viewModal.document_url.length > 0 && (
                <div>
                  <h3 className="text-blue-600 font-semibold mb-3">Tài liệu đính kèm</h3>
                  <div className="space-y-2">
                    {viewModal.document_url.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <a
                          href={url.startsWith("http") ? url : `${FILE_SERVER_URL}/${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Xem tài liệu {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lý do từ chối */}
              {viewModal.rejected_reason && (
                <div>
                  <h3 className="text-red-600 font-semibold mb-3">Lý do từ chối</h3>
                  <p className="text-gray-700">{viewModal.rejected_reason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t p-4">
              <button
                onClick={() => setViewModal(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.type === "approve" ? "Phê duyệt chứng chỉ" : "Xác nhận"}
          message={
            confirmModal.type === "approve"
              ? `Bạn có chắc chắn muốn phê duyệt chứng chỉ cho bác sĩ "${confirmModal.doctorName}"?`
              : confirmModal.message
          }
          onConfirm={() => {
            if (confirmModal.type === "approve") {
              handleApprove(confirmModal.licenseId)
            }
          }}
          onCancel={() => setConfirmModal(null)}
          isLoading={actionLoading}
        />
      )}
    </div>
  )
}

export default ManageLicenses
