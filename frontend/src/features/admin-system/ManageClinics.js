"use client";

import { useState } from "react";
import "../styles/ManageClinics.css";
import ViewModal from "./ViewModal";
import ConfirmModal from "./ConfirmModal";
import EditClinicModal from "./EditClinicModal";

const ManageClinics = () => {
  const [clinics, setClinics] = useState([
    {
      id: 1,
      name: "Phòng khám ABC",
      address: "123 Đường A, TP.HCM",
      status: "active",
      rating: 4.5,
      doctors: 12,
    },
    {
      id: 2,
      name: "Phòng khám XYZ",
      address: "456 Đường B, Hà Nội",
      status: "active",
      rating: 4.2,
      doctors: 8,
    },
    {
      id: 3,
      name: "Phòng khám 123",
      address: "789 Đường C, Đà Nẵng",
      status: "inactive",
      rating: 3.8,
      doctors: 5,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setClinics(clinics.filter((clinic) => clinic.id !== id));
    setConfirmModal(null);
  };

  const handleEdit = (updatedClinic) => {
    setClinics(
      clinics.map((clinic) =>
        clinic.id === updatedClinic.id ? updatedClinic : clinic
      )
    );
    setEditModal(null);
  };

  return (
    <div className="manage-clinics-container">
      <div className="manage-header">
        <h1>Quản lý phòng khám</h1>
        <button className="btn-primary">+ Thêm phòng khám</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm phòng khám..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên phòng khám</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
              <th>Bác sĩ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredClinics.map((clinic) => (
              <tr key={clinic.id}>
                <td>{clinic.name}</td>
                <td>{clinic.address}</td>
                <td>
                  <span className={`status-badge status-${clinic.status}`}>
                    {clinic.status === "active"
                      ? "Hoạt động"
                      : "Không hoạt động"}
                  </span>
                </td>
                <td>⭐ {clinic.rating}</td>
                <td>{clinic.doctors}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => setViewModal(clinic)}
                  >
                    Xem
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => setEditModal(clinic)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn-action btn-danger"
                    onClick={() => setConfirmModal(clinic)}
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
          title="Xóa phòng khám"
          message={`Bạn có chắc chắn muốn xóa phòng khám "${confirmModal.name}"?`}
          onConfirm={() => handleDelete(confirmModal.id)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
      {editModal && (
        <EditClinicModal
          clinic={editModal}
          onSave={handleEdit}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
};

export default ManageClinics;
