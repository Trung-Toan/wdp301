"use client";

import { useState, useEffect } from "react";
import ViewModal from "./ViewModal";
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI";
import { toast } from "react-toastify";

const ApprovedClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    fetchApprovedClinics();
  }, []);

  const fetchApprovedClinics = async () => {
    try {
      setLoading(true);
      const res = await adminSystemAPI.getApprovedClinics();
      if (res.data.ok) {
        setClinics(res.data.data);
      } else {
        toast.error(res.data.message || "Không thể tải danh sách phòng khám");
      }
    } catch (error) {
      console.error("Error fetching approved clinics:", error);
      toast.error("Lỗi khi tải danh sách phòng khám đã duyệt");
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Phòng khám đã duyệt</h1>
        <p className="text-gray-600">
          Danh sách các phòng khám đã được phê duyệt và đang hoạt động
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
                Không có phòng khám nào đã được duyệt
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Tên phòng khám</th>
                      <th className="px-4 py-3 text-left font-medium">Địa chỉ</th>
                      <th className="px-4 py-3 text-left font-medium">Số đăng ký</th>
                      <th className="px-4 py-3 text-left font-medium">Ngày duyệt</th>
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
                          {clinic.address?.fullAddress || 
                           (clinic.address?.street && clinic.address?.province
                             ? `${clinic.address.street}, ${clinic.address.province.name}`
                             : "N/A")}
                        </td>
                        <td className="px-4 py-3">{clinic.registration_number}</td>
                        <td className="px-4 py-3">
                          {clinic.review_info?.reviewed_at
                            ? new Date(clinic.review_info.reviewed_at).toLocaleDateString("vi-VN")
                            : clinic.updatedAt
                            ? new Date(clinic.updatedAt).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setViewModal(clinic)}
                            className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          >
                            Xem chi tiết
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
    </div>
  );
};

export default ApprovedClinics;

