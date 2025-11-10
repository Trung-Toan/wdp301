"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  AlertCircle,
  Filter,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Globe2,
  Building2,
} from "lucide-react";
import { useDataByUrl } from "../../utility/data.utils";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";

export default function BlacklistDetails() {
  // ===== Filters / Paging =====
  const [q, setQ] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [scope, setScope] = useState("mine"); // "mine" (mặc định) | "all"
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Reset page khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [q, clinicId, scope, limit]);

  const params = useMemo(() => {
    const p = { page, limit, scope };
    if (q.trim()) p.q = q.trim();
    if (clinicId.trim()) p.clinic_id = clinicId.trim();
    return p;
  }, [q, clinicId, scope, page, limit]);

  const { data, isLoading, error, refetch } = useDataByUrl({
    url: adminclinicAPI.GET_BLACKLIST, // "/admin_clinic/blacklist"
    key: "admin_clinic_blacklist",
    params,
  });

  const payload = data?.data || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const total = payload.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Number(limit || 1)));

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openView = (row) => {
    setSelectedItem(row);
    setShowViewModal(true);
  };
  const closeView = () => {
    setSelectedItem(null);
    setShowViewModal(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách đen</h1>
          <p className="text-sm text-gray-600 mt-1">
            {scope === "mine"
              ? "Phạm vi: các phòng khám do bạn quản lý"
              : "Phạm vi: toàn bộ hệ thống"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
          <Ban size={18} />
          <span>{total.toLocaleString("vi-VN")} tài khoản</span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-l-red-500 rounded-lg">
        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">
          <strong className="text-red-900">Lưu ý:</strong>{" "}
          {scope === "mine"
            ? "Các tài khoản bị cấm tại những cơ sở bạn quản lý."
            : "Danh sách tất cả tài khoản bị cấm trong hệ thống."}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Row 1: Search | Actions */}
          <div className="md:col-span-8 order-1">
            <label
              htmlFor="f-search"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Tìm kiếm
            </label>
            <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg">
              <Search size={18} className="text-gray-400" />
              <input
                id="f-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tên, email, số điện thoại, lý do…"
                className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-4 order-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Thao tác
            </label>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 w-full justify-center"
              >
                <RefreshCw size={16} />
                Tải
              </button>
            </div>
          </div>

          {/* Row 2: Scope | Clinic | Limit */}
          <div className="md:col-span-6 order-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Phạm vi dữ liệu
            </label>
            <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
              <button
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  scope === "mine"
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setScope("mine")}
              >
                <Building2 size={16} />
                Cơ sở của tôi
              </button>
              <button
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  scope === "all"
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setScope("all")}
              >
                <Globe2 size={16} />
                Toàn hệ thống
              </button>
            </div>
          </div>

          <div className="md:col-span-4 order-4">
            <label
              htmlFor="f-clinic"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Cơ sở (clinic_id)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="f-clinic"
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                placeholder={
                  scope === "all"
                    ? "lọc theo toàn hệ thống"
                    : "thuộc cơ sở của bạn"
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              {clinicId && (
                <button
                  onClick={() => setClinicId("")}
                  className="px-2 py-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-2 order-5">
            <label
              htmlFor="f-limit"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Dòng/trang
            </label>
            <select
              id="f-limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
            >
              {[10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter size={14} />
          <span>
            {scope === "all"
              ? "Chế độ 'Toàn hệ thống': nếu nhập clinic_id, chỉ hiển thị tài khoản từng có lịch tại cơ sở đó."
              : "Chế độ 'Cơ sở của tôi': hiển thị tài khoản thuộc phạm vi cơ sở bạn quản lý (có thể chưa từng có lịch)."}
          </span>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-gray-100 rounded" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        </div>
      )}
      {error && (
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
            <AlertCircle size={20} />
            <div>
              <p className="m-0 font-semibold">Không tải được danh sách đen</p>
              <p className="m-0 text-sm">
                {error?.message || "Vui lòng thử lại sau."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">
              Danh sách tài khoản bị cấm
            </h2>
            <span className="text-sm text-gray-600">
              Tổng {total.toLocaleString("vi-VN")} mục
            </span>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Người dùng
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Liên hệ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Lý do
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Lịch sử (theo phạm vi)
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Ngày thêm
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Không có mục nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const fullName = row?.user?.full_name || "—";
                  const email = row?.account?.email || "—";
                  const phone = row?.account?.phone_number || "—";
                  const reason = row?.reason || "—";
                  const createdAt = row?.createdAt
                    ? new Date(row.createdAt).toLocaleDateString("vi-VN")
                    : "—";
                  const totalApt = row?.totalAppointmentsAtMyClinics ?? 0;
                  const lastApt = row?.lastAppointmentAt
                    ? new Date(row.lastAppointmentAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "—";

                  return (
                    <tr
                      key={row.id || idx}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Ban
                            size={16}
                            className="text-red-500 flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {fullName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {row?.patient_id
                                ? `Patient #${row.patient_id}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>{email}</span>
                          <span className="text-gray-500">{phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-sm">
                        <p className="text-gray-800">{reason}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>
                            Tổng lịch: <strong>{totalApt}</strong>
                          </span>
                          <span className="text-gray-500">
                            Gần nhất: {lastApt}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {createdAt}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openView(row)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 ${
                  page <= 1
                    ? "text-gray-300 border-gray-200"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 ${
                  page >= totalPages
                    ? "text-gray-300 border-gray-200"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {showViewModal && selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeView}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-11/12 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết</h2>
              <button
                onClick={closeView}
                className="p-1.5 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Người dùng
                </div>
                <div className="text-gray-900">
                  {selectedItem?.user?.full_name || "—"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Email
                  </div>
                  <div className="text-gray-900">
                    {selectedItem?.account?.email || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    SĐT
                  </div>
                  <div className="text-gray-900">
                    {selectedItem?.account?.phone_number || "—"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Lý do
                </div>
                <div className="text-gray-900">
                  {selectedItem?.reason || "—"}
                </div>
              </div>
              {selectedItem?.evidence && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Bằng chứng
                  </div>
                  <div className="text-gray-900 break-words">
                    {selectedItem.evidence}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Tổng lịch (phạm vi)
                  </div>
                  <div className="text-gray-900">
                    {selectedItem?.totalAppointmentsAtMyClinics ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Lần gần nhất
                  </div>
                  <div className="text-gray-900">
                    {selectedItem?.lastAppointmentAt
                      ? new Date(
                          selectedItem.lastAppointmentAt
                        ).toLocaleDateString("vi-VN")
                      : "—"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Ngày thêm
                </div>
                <div className="text-gray-900">
                  {selectedItem?.createdAt
                    ? new Date(selectedItem.createdAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "—"}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-5">
              <button
                type="button"
                onClick={closeView}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
