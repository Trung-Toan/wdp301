"use client";

import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Đã xóa "Eye" khỏi import
import { Search, FileText, PeopleFill } from "react-bootstrap-icons";
import { getPatients } from "../../services/assistantService";
import { useDataByUrl } from "../../utility/data.utils";
import { PATIENT_API } from "../../api/assistant/assistant.api";

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useDataByUrl({
    url: PATIENT_API.GET_LIST_PATIENT,
    key: "patients-list",
    params: { page: 1, limit: 10, search: searchTerm },
  });

  const patients = data?.data || [];
  const pagination = data?.pagination || [];

  const filteredPatients = patients?.filter(
    (patient) =>
      patient?.full_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      patient?.phone_number?.includes(searchTerm)
  );

  console.log(patients);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <PeopleFill className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Danh sách bệnh nhân
            </h1>
            <p className="text-gray-500 mt-1">
              Tra cứu và xem lịch sử khám của bệnh nhân
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Bảng dữ liệu */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold text-red-700 mb-2">Đã xảy ra lỗi</p>
            <p className="text-gray-500">
              {typeof error === "string"
                ? error
                : error?.message || "Có lỗi xảy ra khi tải dữ liệu."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Mã BN</th>
                    <th className="px-6 py-3 font-semibold">Họ và tên</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Số điện thoại</th>
                    <th className="px-6 py-3 font-semibold">Ngày sinh</th>
                    <th className="px-6 py-3 font-semibold">Giới tính</th>
                    <th className="px-6 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients?.length > 0 ? (
                    patients?.map((item) => {
                      // Nếu mỗi item là { patient: {...} }
                      const patient = item.patient || item;
                      return (
                        <tr key={patient?.id || patient?._id} className="bg-white hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {patient?.patient_code}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {patient?.full_name}
                          </td>
                          <td className="px-6 py-4">{patient?.email}</td>
                          <td className="px-6 py-4">{patient?.phone}</td>
                          <td className="px-6 py-4">{patient?.dob?.slice(0, 10)}</td>
                          <td className="px-6 py-4">{patient?.gender}</td>
                          <td className="px-6 py-4">
                            <button
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              onClick={() =>
                                navigate(`/doctor/medical-records/${patient?.id || patient?._id}`)
                              }
                              title="Xem bệnh án"
                            >
                              <FileText size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center px-6 py-10 text-gray-500">
                        {searchTerm
                          ? "Không tìm thấy bệnh nhân nào khớp với tìm kiếm."
                          : "Không có bệnh nhân nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PatientList);