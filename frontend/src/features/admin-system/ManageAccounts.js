import React, { useState, useEffect } from "react";
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI";
import ConfirmModal from "./ConfirmModal";
import Toast from "../../components/ui/Toast";
import { Spinner } from "react-bootstrap";
import { formatDateShort as formatDate } from "../../utils/dateTimeUtils";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewModal, setViewModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch accounts từ API
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Nếu filter status = PENDING, dùng endpoint pending
      if (statusFilter === "PENDING") {
        const res = await adminSystemAPI.getPendingAdminClinicAccounts(params);
        if (res.data?.ok) {
          setAccounts(res.data.data.accounts || []);
          setPagination({
            ...pagination,
            total: res.data.data.pagination?.total || 0,
            totalPages: res.data.data.pagination?.totalPages || 0,
          });
        }
      } else {
        // Dùng endpoint chính với filter
        const res = await adminSystemAPI.getAdminClinicAccounts({
          ...params,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined,
        });
        if (res.data?.ok) {
          setAccounts(res.data.data.accounts || []);
          setPagination({
            ...pagination,
            total: res.data.data.pagination?.total || 0,
            totalPages: res.data.data.pagination?.totalPages || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Lỗi khi tải danh sách tài khoản",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [pagination.page, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchAccounts();
      } else {
        setPagination({ ...pagination, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleApprove = async (accountId) => {
    try {
      const res = await adminSystemAPI.approveAdminClinic(accountId);
      if (res.data?.ok) {
        setNotification({
          type: "success",
          message: "Phê duyệt tài khoản thành công",
        });
        fetchAccounts();
        setConfirmModal(null);
      }
    } catch (error) {
      console.error("Error approving account:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Lỗi khi phê duyệt tài khoản",
      });
    }
  };

  const handleReject = async (accountId) => {
    if (!rejectionReason.trim()) {
      setNotification({
        type: "error",
        message: "Vui lòng nhập lý do từ chối",
      });
      return;
    }

    try {
      const res = await adminSystemAPI.rejectAdminClinic(accountId, rejectionReason);
      if (res.data?.ok) {
        setNotification({
          type: "success",
          message: "Từ chối tài khoản thành công",
        });
        fetchAccounts();
        setConfirmModal(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Error rejecting account:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Lỗi khi từ chối tài khoản",
      });
    }
  };

  const handleBan = async (accountId) => {
    try {
      const res = await adminSystemAPI.banAdminClinic(accountId);
      if (res.data?.ok) {
        setNotification({
          type: "success",
          message: "Cấm tài khoản thành công",
        });
        fetchAccounts();
        setConfirmModal(null);
      }
    } catch (error) {
      console.error("Error banning account:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Lỗi khi cấm tài khoản",
      });
    }
  };

  const handleUnban = async (accountId) => {
    try {
      const res = await adminSystemAPI.unbanAdminClinic(accountId);
      if (res.data?.ok) {
        setNotification({
          type: "success",
          message: "Gỡ cấm tài khoản thành công",
        });
        fetchAccounts();
        setConfirmModal(null);
      }
    } catch (error) {
      console.error("Error unbanning account:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Lỗi khi gỡ cấm tài khoản",
      });
    }
  };

  const handleViewDetail = async (accountId) => {
    try {
      const res = await adminSystemAPI.getAdminClinicDetail(accountId);
      if (res.data?.ok) {
        const data = res.data.data;
        setViewModal({
          ...data.account,
          user: data.user,
          adminClinic: data.adminClinic,
        });
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Lỗi khi tải thông tin chi tiết",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      case "REJECTED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "PENDING":
        return "Chờ phê duyệt";
      case "SUSPENDED":
        return "Bị cấm";
      case "REJECTED":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản </h1>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo username hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ phê duyệt</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="SUSPENDED">Bị cấm</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Spinner animation="border" variant="primary" />
          <span className="ml-3">Đang tải...</span>
        </div>
      )}

      {/* Bảng tài khoản */}
      {!loading && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Tên</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày tham gia</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{acc.username}</td>
                  <td className="p-3 text-gray-600">{acc.email}</td>
                  <td className="p-3">{acc.role}</td>
                  <td className="p-3 text-gray-600">
                    {acc.user?.full_name || "N/A"}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(acc.status)}`}>
                      {getStatusText(acc.status)}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {formatDate(acc.joinDate || acc.createdAt)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewDetail(acc._id)}
                        className="px-3 py-1 text-blue-600 hover:underline"
                        disabled={loading}
                      >
                        Xem
                      </button>
                      {acc.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              setConfirmModal({ type: "approve", data: acc })
                            }
                            className="px-3 py-1 text-green-600 hover:underline"
                            disabled={loading}
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({ type: "reject", data: acc })
                            }
                            className="px-3 py-1 text-red-600 hover:underline"
                            disabled={loading}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {acc.status === "ACTIVE" && (
                        <button
                          onClick={() =>
                            setConfirmModal({ type: "ban", data: acc })
                          }
                          className="px-3 py-1 text-yellow-600 hover:underline"
                          disabled={loading}
                        >
                          Cấm
                        </button>
                      )}
                      {acc.status === "SUSPENDED" && (
                        <button
                          onClick={() =>
                            setConfirmModal({ type: "unban", data: acc })
                          }
                          className="px-3 py-1 text-green-600 hover:underline"
                          disabled={loading}
                        >
                          Gỡ cấm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    Không có tài khoản nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-3 py-1">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {viewModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">Chi tiết tài khoản ADMIN_CLINIC</h2>
              <button
                onClick={() => setViewModal(null)}
                aria-label="Đóng modal"
                className="text-white text-2xl leading-none hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">Thông tin tài khoản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-medium text-gray-800">{viewModal.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-700">{viewModal.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="text-gray-700">{viewModal.phone_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewModal.status)}`}>
                      {getStatusText(viewModal.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email đã xác minh:</span>
                    <span className="text-gray-700">
                      {viewModal.email_verified ? "✅ Đã xác minh" : "❌ Chưa xác minh"}
                    </span>
                  </div>
                </div>
              </div>

              {viewModal.user && (
                <div>
                  <h3 className="text-blue-600 font-semibold mb-3">Thông tin người dùng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Họ và tên:</span>
                      <span className="font-medium text-gray-800">{viewModal.user.full_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày sinh:</span>
                      <span className="text-gray-700">
                        {viewModal.user.dob ? formatDate(viewModal.user.dob) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Giới tính:</span>
                      <span className="text-gray-700">{viewModal.user.gender || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Địa chỉ:</span>
                      <span className="text-gray-700">{viewModal.user.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-blue-600 font-semibold mb-3">Thông tin đăng ký</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày tạo:</span>
                    <span className="text-gray-700">{formatDate(viewModal.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày cập nhật:</span>
                    <span className="text-gray-700">{formatDate(viewModal.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
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

      {/* Modal xác nhận */}
      {confirmModal && (
        <ConfirmModal
          title={
            confirmModal.type === "approve"
              ? "Phê duyệt tài khoản"
              : confirmModal.type === "reject"
                ? "Từ chối tài khoản"
                : confirmModal.type === "ban"
                  ? "Cấm tài khoản"
                  : "Gỡ cấm tài khoản"
          }
          message={
            confirmModal.type === "approve"
              ? `Bạn có chắc chắn muốn phê duyệt tài khoản "${confirmModal.data.username}"?`
              : confirmModal.type === "reject"
                ? `Bạn có chắc chắn muốn từ chối tài khoản "${confirmModal.data.username}"?`
                : confirmModal.type === "ban"
                  ? `Bạn có chắc chắn muốn cấm tài khoản "${confirmModal.data.username}"?`
                  : `Bạn có chắc chắn muốn gỡ cấm tài khoản "${confirmModal.data.username}"?`
          }
          onConfirm={() => {
            if (confirmModal.type === "approve") {
              handleApprove(confirmModal.data._id);
            } else if (confirmModal.type === "reject") {
              handleReject(confirmModal.data._id);
            } else if (confirmModal.type === "ban") {
              handleBan(confirmModal.data._id);
            } else if (confirmModal.type === "unban") {
              handleUnban(confirmModal.data._id);
            }
          }}
          onCancel={() => {
            setConfirmModal(null);
            setRejectionReason("");
          }}
        >
          {confirmModal.type === "reject" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                rows="3"
                placeholder="Nhập lý do từ chối..."
              />
            </div>
          )}
        </ConfirmModal>
      )}

      {/* Toast notification */}
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ type: "", message: "" })}
      />
    </div>
  );
}
