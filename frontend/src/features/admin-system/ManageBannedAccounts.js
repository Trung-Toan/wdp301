"use client";

import { useState } from "react";
import "../../styles/admin-system/ManageBannedAccounts.css";
import ViewModal from "./ViewModal";
import ConfirmModal from "./ConfirmModal";

const ManageBannedAccounts = () => {
  const [bannedAccounts, setBannedAccounts] = useState([
    {
      id: 1,
      name: "Nguyễn Văn X",
      email: "nguyenvanx@email.com",
      reason: "Vi phạm điều khoản dịch vụ",
      bannedDate: "2024-09-15",
      appealStatus: "pending",
    },
    {
      id: 2,
      name: "Trần Thị Y",
      email: "tranthiy@email.com",
      reason: "Hành vi không phù hợp",
      bannedDate: "2024-08-20",
      appealStatus: "rejected",
    },
    {
      id: 3,
      name: "Lê Văn Z",
      email: "levanz@email.com",
      reason: "Gian lận",
      bannedDate: "2024-07-10",
      appealStatus: "approved",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [appealFilter, setAppealFilter] = useState("all");
  const [viewModal, setViewModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const filteredAccounts = bannedAccounts.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAppeal =
      appealFilter === "all" || account.appealStatus === appealFilter;
    return matchesSearch && matchesAppeal;
  });

  const handleUnban = (id) => {
    setBannedAccounts(bannedAccounts.filter((acc) => acc.id !== id));
    setConfirmModal(null);
  };

  const handleApproveAppeal = (id) => {
    setBannedAccounts(
      bannedAccounts.map((acc) =>
        acc.id === id ? { ...acc, appealStatus: "approved" } : acc
      )
    );
    setConfirmModal(null);
  };

  return (
    <div className="manage-banned-accounts-container">
      <div className="manage-header">
        <h1>Quản lý tài khoản bị cấm</h1>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={appealFilter}
          onChange={(e) => setAppealFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái khiếu nại</option>
          <option value="pending">Đang chờ</option>
          <option value="approved">Được phê duyệt</option>
          <option value="rejected">Bị từ chối</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Lý do cấm</th>
              <th>Ngày cấm</th>
              <th>Trạng thái khiếu nại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.email}</td>
                <td>{account.reason}</td>
                <td>{account.bannedDate}</td>
                <td>
                  <span
                    className={`appeal-badge appeal-${account.appealStatus}`}
                  >
                    {account.appealStatus === "pending"
                      ? "Đang chờ"
                      : account.appealStatus === "approved"
                      ? "Được phê duyệt"
                      : "Bị từ chối"}
                  </span>
                </td>
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
                      setConfirmModal({ type: "unban", data: account })
                    }
                  >
                    Gỡ cấm
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
          title="Gỡ cấm tài khoản"
          message={`Bạn có chắc chắn muốn gỡ cấm tài khoản "${confirmModal.data.name}"?`}
          onConfirm={() => handleUnban(confirmModal.data.id)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default ManageBannedAccounts;
