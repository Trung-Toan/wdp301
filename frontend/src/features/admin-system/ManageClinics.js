"use client";

import { useState, useEffect } from "react";
import "../../styles/admin-system/ManageClinics.css";
import ViewModal from "./ViewModal";
import ConfirmModal from "./ConfirmModal";
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI";
import { toast } from "react-toastify";

const ManageClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);

  useEffect(() => {
    fetchPendingClinics();
  }, []);

  const fetchPendingClinics = async () => {
    try {
      setLoading(true);
      const res = await adminSystemAPI.getPendingClinics();
      if (res.data.ok) {
        setClinics(res.data.data);
      } else {
        toast.error(res.data.message || "Không thể tải danh sách phòng khám");
      }
    } catch (error) {
      console.error("Error fetching pending clinics:", error);
      toast.error("Lỗi khi tải danh sách phòng khám chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (clinic) => {
    try {
      const res = await adminSystemAPI.approveClinic(clinic._id, {
        review_notes: clinic.review_notes || "",
      });
      if (res.data.ok) {
        toast.success("Duyệt phòng khám thành công!");
        setApproveModal(null);
        fetchPendingClinics(); // Refresh danh sách
      } else {
        toast.error(res.data.message || "Không thể duyệt phòng khám");
      }
    } catch (error) {
      console.error("Error approving clinic:", error);
      toast.error("Lỗi khi duyệt phòng khám");
    }
  };

  const handleReject = async (clinic) => {
    try {
      const res = await adminSystemAPI.rejectClinic(clinic._id, {
        rejection_reason: clinic.rejection_reason || "",
      });
      if (res.data.ok) {
        toast.success("Từ chối phòng khám thành công!");
        setRejectModal(null);
        fetchPendingClinics(); // Refresh danh sách
      } else {
        toast.error(res.data.message || "Không thể từ chối phòng khám");
      }
    } catch (error) {
      console.error("Error rejecting clinic:", error);
      toast.error("Lỗi khi từ chối phòng khám");
    }
  };

  return (
    <div className="manage-clinics-container">
      <div className="manage-header">
        <h1>Duyệt phòng khám</h1>
        <p>Các yêu cầu đăng ký phòng khám đang chờ phê duyệt</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Đang tải danh sách phòng khám...</p>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm phòng khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-container">
            {filteredClinics.length === 0 ? (
              <div className="empty-state">
                <p>Không có phòng khám nào đang chờ duyệt</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên phòng khám</th>
                    <th>Địa chỉ</th>
                    <th>Số đăng ký</th>
                    <th>Ngày gửi</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClinics.map((clinic) => (
                    <tr key={clinic._id}>
                      <td>{clinic.name}</td>
                      <td>{clinic.address?.fullAddress || "N/A"}</td>
                      <td>{clinic.registration_number}</td>
                      <td>
                        {new Date(clinic.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <button
                          className="btn-action"
                          onClick={() => setViewModal(clinic)}
                        >
                          Xem
                        </button>
                        <button
                          className="btn-action btn-success"
                          onClick={() => setApproveModal(clinic)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn-action btn-danger"
                          onClick={() => setRejectModal(clinic)}
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {viewModal && (
        <ViewModal data={viewModal} onClose={() => setViewModal(null)} />
      )}
      {approveModal && (
        <ConfirmModal
          title="Duyệt phòng khám"
          message={`Bạn có chắc chắn muốn duyệt phòng khám "${approveModal.name}"?`}
          onConfirm={() => handleApprove(approveModal)}
          onCancel={() => setApproveModal(null)}
        />
      )}
      {rejectModal && (
        <ConfirmModal
          title="Từ chối phòng khám"
          message={`Bạn có chắc chắn muốn từ chối phòng khám "${rejectModal.name}"?`}
          onConfirm={() => handleReject(rejectModal)}
          onCancel={() => setRejectModal(null)}
        />
      )}
    </div>
  );
};

export default ManageClinics;
