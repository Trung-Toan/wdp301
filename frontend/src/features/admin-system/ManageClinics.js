"use client";

import { useState, useEffect } from "react";
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
        fetchPendingClinics();
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
        fetchPendingClinics();
      } else {
        toast.error(res.data.message || "Không thể từ chối phòng khám");
      }
    } catch (error) {
      console.error("Error rejecting clinic:", error);
      toast.error("Lỗi khi từ chối phòng khám");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Duyệt phòng khám</h1>
        <p className="text-gray-600">
          Các yêu cầu đăng ký phòng khám đang chờ phê duyệt
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-500 text-lg">Đang tải danh sách phòng khám...</p>
        </div>
      ) : (
        <>
          {/* Thanh tìm kiếm */}
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              placeholder="Tìm kiếm phòng khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bảng danh sách */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredClinics.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Không có phòng khám nào đang chờ duyệt
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Tên phòng khám</th>
                      <th className="px-4 py-3 text-left font-medium">Địa chỉ</th>
                      <th className="px-4 py-3 text-left font-medium">Số đăng ký</th>
                      <th className="px-4 py-3 text-left font-medium">Ngày gửi</th>
                      <th className="px-4 py-3 text-center font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClinics.map((clinic) => (
                      <tr
                        key={clinic._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">{clinic.name}</td>
                        <td className="px-4 py-3">
                          {clinic.address?.fullAddress || "N/A"}
                        </td>
                        <td className="px-4 py-3">{clinic.registration_number}</td>
                        <td className="px-4 py-3">
                          {new Date(clinic.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                          <button
                            onClick={() => setViewModal(clinic)}
                            className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => setApproveModal(clinic)}
                            className="px-3 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => setRejectModal(clinic)}
                            className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
                            Từ chối
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal chi tiết */}
      {viewModal && (
        <ViewModal data={viewModal} onClose={() => setViewModal(null)} />
      )}

      {/* Modal duyệt */}
      {approveModal && (
        <ConfirmModal
          title="Duyệt phòng khám"
          message={`Bạn có chắc chắn muốn duyệt phòng khám "${approveModal.name}"?`}
          onConfirm={() => handleApprove(approveModal)}
          onCancel={() => setApproveModal(null)}
        />
      )}

      {/* Modal từ chối */}
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
