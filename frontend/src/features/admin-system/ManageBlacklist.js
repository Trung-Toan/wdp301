"use client";

import { useState } from "react";
import "../../styles/admin-system/ManageBlacklist.css";
import ViewModal from "./ViewModal";
import ConfirmModal from "./ConfirmModal";

const ManageBlacklist = () => {
  const [blacklistItems, setBlacklistItems] = useState([
    {
      id: 1,
      type: "email",
      value: "spam@email.com",
      reason: "Spam",
      severity: "high",
      addedDate: "2024-09-15",
    },
    {
      id: 2,
      type: "phone",
      value: "0123456789",
      reason: "Qu騷rau",
      severity: "medium",
      addedDate: "2024-08-20",
    },
    {
      id: 3,
      type: "clinic",
      value: "Phòng khám giả mạo",
      reason: "Giả mạo",
      severity: "high",
      addedDate: "2024-07-10",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewModal, setViewModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const filteredItems = blacklistItems.filter((item) => {
    const matchesSearch = item.value
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRemove = (id) => {
    setBlacklistItems(blacklistItems.filter((item) => item.id !== id));
    setConfirmModal(null);
  };

  return (
    <div className="manage-blacklist-container">
      <div className="manage-header">
        <h1>Quản lý danh sách đen</h1>
        <button className="btn-primary">+ Thêm vào danh sách đen</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tất cả loại</option>
          <option value="email">Email</option>
          <option value="phone">Số điện thoại</option>
          <option value="clinic">Phòng khám</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Lý do</th>
              <th>Mức độ</th>
              <th>Ngày thêm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="type-badge">
                    {item.type === "email"
                      ? "Email"
                      : item.type === "phone"
                      ? "Số điện thoại"
                      : "Phòng khám"}
                  </span>
                </td>
                <td>{item.value}</td>
                <td>{item.reason}</td>
                <td>
                  <span className={`severity-badge severity-${item.severity}`}>
                    {item.severity === "high" ? "Cao" : "Trung bình"}
                  </span>
                </td>
                <td>{item.addedDate}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => setViewModal(item)}
                  >
                    Xem
                  </button>
                  <button
                    className="btn-action btn-danger"
                    onClick={() => setConfirmModal(item)}
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
          title="Xóa khỏi danh sách đen"
          message={`Bạn có chắc chắn muốn xóa "${confirmModal.value}" khỏi danh sách đen?`}
          onConfirm={() => handleRemove(confirmModal.id)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default ManageBlacklist;
