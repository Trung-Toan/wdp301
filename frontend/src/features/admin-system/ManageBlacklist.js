"use client"

import { useEffect, useState } from "react"
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI"
import ConfirmModal from "./ConfirmModal"
import { formatDateTime } from "../../utils/dateTimeUtils"

const ROLE_OPTIONS = [
  { value: "all", label: "Tất cả vai trò" },
  { value: "ADMIN_SYSTEM", label: "Admin hệ thống" },
  { value: "ADMIN_CLINIC", label: "Admin phòng khám" },
  { value: "DOCTOR", label: "Bác sĩ" },
  { value: "ASSISTANT", label: "Trợ lý" },
  { value: "PATIENT", label: "Bệnh nhân" },
]

const ManageBlacklist = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const [viewModal, setViewModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    fetchBlacklists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, appliedSearch, pagination.page])

  const fetchBlacklists = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      }

      if (roleFilter && roleFilter !== "all") {
        params.role = roleFilter
      }
      if (appliedSearch) {
        params.search = appliedSearch
      }

      const res = await adminSystemAPI.getBlacklists(params)

      if (res.data?.ok && res.data?.data) {
        setItems(res.data.data.items || [])
        setPagination((prev) => ({
          ...prev,
          total: res.data.data.pagination?.total || 0,
          totalPages: res.data.data.pagination?.totalPages || 0,
        }))
      } else {
        setError("Không thể tải danh sách đen")
      }
    } catch (err) {
      console.error("Error fetching blacklists:", err)
      if (err.code === "ERR_NETWORK") {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra backend.")
      } else {
        setError(err.response?.data?.message || "Lỗi khi tải danh sách đen")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    setAppliedSearch(searchTerm.trim())
  }

  const handleDelete = async (blacklistId) => {
    try {
      setConfirmLoading(true)
      const res = await adminSystemAPI.removeFromBlacklist(blacklistId)
      if (res.data?.ok) {
        alert("Đã xóa khỏi danh sách đen")
        setConfirmModal(null)
        fetchBlacklists()
      } else {
        alert(res.data?.message || "Xóa không thành công")
      }
    } catch (err) {
      console.error("Error removing blacklist:", err)
      alert(err.response?.data?.message || "Không thể xóa khỏi danh sách đen")
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleAdd = async ({ accountIdentifier, reason, evidence }) => {
    try {
      setAddLoading(true)
      const res = await adminSystemAPI.addToBlacklist({ accountIdentifier, reason, evidence })
      if (res.data?.ok) {
        alert("Thêm vào danh sách đen thành công")
        setAddModalOpen(false)
        setSearchTerm("")
        setAppliedSearch("")
        setPagination((prev) => ({ ...prev, page: 1 }))
        fetchBlacklists()
      } else {
        alert(res.data?.message || "Thêm không thành công")
      }
    } catch (err) {
      console.error("Error adding blacklist:", err)
      alert(err.response?.data?.message || "Không thể thêm vào danh sách đen")
    } finally {
      setAddLoading(false)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBlacklists}
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý danh sách đen</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý các tài khoản bị cấm</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + Thêm vào danh sách đen
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm username / email / số điện thoại"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-60"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Tài khoản</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Số điện thoại</th>
                <th className="px-6 py-3">Vai trò</th>
                <th className="px-6 py-3">Lý do</th>
                <th className="px-6 py-3">Ngày thêm</th>
                <th className="px-6 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Không có tài khoản trong danh sách đen
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {item.account?.username || "--"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {item.account?.full_name || "Không rõ họ tên"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.account?.email || "--"}
                    </td>
                    <td className="px-6 py-4">
                      {item.account?.phone_number || "--"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {item.account?.role || "--"}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="line-clamp-2 text-gray-700">{item.reason || "Không có"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViewModal(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              id: item.id,
                              value: item.account?.username || item.account?.email || item.account?.phone_number,
                            })
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 text-sm text-gray-700">
          <div>
            Hiển thị
            {" "}
            {items.length === 0
              ? 0
              : `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}`}
            {" "}
            trong tổng số {pagination.total} kết quả
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span>
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* View detail modal */}
      {viewModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">Chi tiết tài khoản bị blacklist</h2>
              <button
                onClick={() => setViewModal(null)}
                className="text-white text-2xl leading-none hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm">
              <section>
                <h3 className="text-blue-600 font-semibold mb-3">Thông tin tài khoản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username</span>
                    <span className="text-gray-800 font-medium">{viewModal.account?.username || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Họ tên</span>
                    <span className="text-gray-800">{viewModal.account?.full_name || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-800">{viewModal.account?.email || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại</span>
                    <span className="text-gray-800">{viewModal.account?.phone_number || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vai trò</span>
                    <span className="text-gray-800">{viewModal.account?.role || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái tài khoản</span>
                    <span className="text-gray-800">{viewModal.account?.status || "--"}</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-blue-600 font-semibold mb-3">Thông tin blacklist</h3>
                <div className="space-y-2">
                  <div>
                    <span className="block text-gray-500 mb-1">Lý do</span>
                    <p className="text-gray-800 whitespace-pre-line">{viewModal.reason || "--"}</p>
                  </div>
                  {viewModal.evidence && (
                    <div>
                      <span className="block text-gray-500 mb-1">Bằng chứng</span>
                      {viewModal.evidence.startsWith("http") ? (
                        <a
                          href={viewModal.evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Xem bằng chứng
                        </a>
                      ) : (
                        <p className="text-gray-800">{viewModal.evidence}</p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày thêm</span>
                    <span className="text-gray-800">{formatDateTime(viewModal.createdAt)}</span>
                  </div>
                </div>
              </section>
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

      {/* Confirm delete modal */}
      {confirmModal && (
        <ConfirmModal
          title="Xóa khỏi danh sách đen"
          message={`Bạn có chắc chắn muốn xóa "${confirmModal.value}" khỏi danh sách đen?`}
          onConfirm={() => handleDelete(confirmModal.id)}
          onCancel={() => setConfirmModal(null)}
          isLoading={confirmLoading}
        />
      )}

      {/* Add modal */}
      {addModalOpen && (
        <AddBlacklistModal
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAdd}
          isLoading={addLoading}
        />
      )}
    </div>
  )
}

const AddBlacklistModal = ({ onClose, onSubmit, isLoading }) => {
  const [accountIdentifier, setAccountIdentifier] = useState("")
  const [reason, setReason] = useState("")
  const [evidence, setEvidence] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!accountIdentifier.trim()) {
      alert("Vui lòng nhập username / email / số điện thoại")
      return
    }
    onSubmit({ accountIdentifier: accountIdentifier.trim(), reason, evidence })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4 bg-blue-600 text-white">
          <h2 className="text-lg font-semibold">Thêm tài khoản vào danh sách đen</h2>
          <button onClick={onClose} className="text-white text-2xl leading-none hover:scale-110 transition-transform">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">Username / Email / Số điện thoại *</label>
            <input
              type="text"
              value={accountIdentifier}
              onChange={(e) => setAccountIdentifier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập thông tin tài khoản"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Lý do</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi rõ lý do thêm vào danh sách đen"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Bằng chứng (URL hoặc mô tả)</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: đường link hình ảnh, mô tả chi tiết"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManageBlacklist
