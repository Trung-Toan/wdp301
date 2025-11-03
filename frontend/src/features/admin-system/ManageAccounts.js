import React, { useState } from "react";
import ViewModal from "./ViewModal";
import ConfirmModal from "./ConfirmModal";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      role: "doctor",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      role: "clinic_owner",
      status: "active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      role: "patient",
      status: "inactive",
      joinDate: "2024-03-10",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewModal, setViewModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleBan = (id) => {
    setAccounts(
      accounts.map((acc) => (acc.id === id ? { ...acc, status: "banned" } : acc))
    );
    setConfirmModal(null);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
    setConfirmModal(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          + Thêm tài khoản
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="doctor">Bác sĩ</option>
          <option value="clinic_owner">Chủ phòng khám</option>
          <option value="patient">Bệnh nhân</option>
        </select>
      </div>

      {/* Bảng tài khoản */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
              <th className="p-3">Tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày tham gia</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr
                key={acc.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-800">{acc.name}</td>
                <td className="p-3 text-gray-600">{acc.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${acc.role === "doctor"
                        ? "bg-green-100 text-green-700"
                        : acc.role === "clinic_owner"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {acc.role === "doctor"
                      ? "Bác sĩ"
                      : acc.role === "clinic_owner"
                        ? "Chủ phòng khám"
                        : "Bệnh nhân"}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${acc.status === "active"
                        ? "bg-green-100 text-green-700"
                        : acc.status === "inactive"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {acc.status === "active"
                      ? "Hoạt động"
                      : acc.status === "inactive"
                        ? "Không hoạt động"
                        : "Bị cấm"}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{acc.joinDate}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setViewModal(acc)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() =>
                      setConfirmModal({ type: "ban", data: acc })
                    }
                    className="px-3 py-1 text-yellow-600 hover:underline"
                  >
                    Cấm
                  </button>
                  <button
                    onClick={() =>
                      setConfirmModal({ type: "delete", data: acc })
                    }
                    className="px-3 py-1 text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Không có tài khoản nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết */}
      {viewModal && (
        <ViewModal data={viewModal} onClose={() => setViewModal(null)} />
      )}

      {/* Modal xác nhận */}
      {confirmModal && (
        <ConfirmModal
          title={
            confirmModal.type === "ban" ? "Cấm tài khoản" : "Xóa tài khoản"
          }
          message={
            confirmModal.type === "ban"
              ? `Bạn có chắc chắn muốn cấm tài khoản "${confirmModal.data.name}"?`
              : `Bạn có chắc chắn muốn xóa tài khoản "${confirmModal.data.name}"?`
          }
          onConfirm={() =>
            confirmModal.type === "ban"
              ? handleBan(confirmModal.data.id)
              : handleDelete(confirmModal.data.id)
          }
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
