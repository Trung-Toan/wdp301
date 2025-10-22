"use client";

import { useState } from "react";
import "../../styles/admin-system/ManageAccounts.css";
import ViewModal from "./ViewModal";
import ConfirmModal from "./ConfirmModal";

const ManageAccounts = () => {
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

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || account.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleBan = (id) => {
    setAccounts(
      accounts.map((acc) =>
        acc.id === id ? { ...acc, status: "banned" } : acc
      )
    );
    setConfirmModal(null);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
    setConfirmModal(null);
  };

  return (
    <div className="manage-accounts-container">
      <div className="manage-header">
        <h1>Quản lý tài khoản</h1>
        <button className="btn-primary">+ Thêm tài khoản</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="doctor">Bác sĩ</option>
          <option value="clinic_owner">Chủ phòng khám</option>
          <option value="patient">Bệnh nhân</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.email}</td>
                <td>
                  <span className="role-badge">
                    {account.role === "doctor"
                      ? "Bác sĩ"
                      : account.role === "clinic_owner"
                      ? "Chủ phòng khám"
                      : "Bệnh nhân"}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${account.status}`}>
                    {account.status === "active"
                      ? "Hoạt động"
                      : account.status === "inactive"
                      ? "Không hoạt động"
                      : "Bị cấm"}
                  </span>
                </td>
                <td>{account.joinDate}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => setViewModal(account)}
                  >
                    Xem
                  </button>
                  <button
                    className="btn-action"
                    onClick={() =>
                      setConfirmModal({ type: "ban", data: account })
                    }
                  >
                    Cấm
                  </button>
                  <button
                    className="btn-action btn-danger"
                    onClick={() =>
                      setConfirmModal({ type: "delete", data: account })
                    }
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewModal && (
        <ViewModal data={viewModal} onClose={() => setViewModal(null)} />
      )}
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
};

export default ManageAccounts;
