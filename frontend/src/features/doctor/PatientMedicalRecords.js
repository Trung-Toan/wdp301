import { memo, useState, useEffect } from "react";
// Sửa lại import: Các icon này là của react-bootstrap-icons, không phải lucide
import {
  FileText,
  Calendar,
  Pill,
  Activity,
  Lock,
  Unlock,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { doctorApi } from "../../api/doctor/doctorApi";
import { toast } from "react-toastify";

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patient_code = params.get("patient-code");

    if (patient_code) {
      setSearchTerm(patient_code);
    }
    fetchData();
  }, [location.search]);

  useEffect(() => {
    filterRecords();
    // eslint-disable-next-line
  }, [records, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAllMedicalRecords();

      if (res.data?.ok && Array.isArray(res.data.data)) {
        setRecords(res.data.data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      // Cập nhật tìm kiếm để linh hoạt hơn
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.patient_code?.toLowerCase().includes(lowerSearch) ||
          record.patient_name?.toLowerCase().includes(lowerSearch) ||
          record.diagnosis?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRecords(filtered);
  };

  // Cập nhật: Thêm timeZone: "UTC" để hiển thị ngày đúng như database
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  // Cập nhật class CSS bằng Tailwind
  const getStatusBadge = (status) => {
    const badges = {
      PUBLIC: {
        text: "Công khai",
        class: "bg-green-100 text-green-800",
      },
      PRIVATE: {
        text: "Riêng tư",
        class: "bg-red-100 text-red-800",
      },
    };
    return badges[status] || badges.PRIVATE;
  };

  // Cập nhật class CSS bằng Tailwind
  const getPrescriptionStatus = (status) => {
    switch (status) {
      case "VERIFIED":
        return {
          class: "bg-green-100 text-green-800",
          text: "Đã xác nhận",
          icon: <CheckCircle size={14} className="text-green-600" />,
        };
      case "PENDING":
        return {
          class: "bg-yellow-100 text-yellow-800",
          text: "Chờ xác nhận",
          icon: <Clock size={14} className="text-yellow-500" />,
        };
      case "REJECTED":
        return {
          class: "bg-red-100 text-red-800",
          text: "Bị từ chối",
          icon: <XCircle size={14} className="text-red-500" />,
        };
      default:
        return null;
    }
  };

  // Giữ nguyên hàm xem chi tiết
  const handleViewRecord = async (record) => {
    try {
      setLoadingRecord(true);
      setShowModal(true);

      const res = await doctorApi.getMedicalRecordById(
        record.medical_record_id
      );

      if (res.data?.ok) {
        setSelectedRecord(res?.data?.data);
      } else {
        console.error("Không lấy được chi tiết hồ sơ:", res.data);
        toast.error("Không lấy được chi tiết hồ sơ bệnh án!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API chi tiết hồ sơ:", error);
      toast.error("Lỗi khi tải chi tiết hồ sơ bệnh án!");
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  // --- CẬP NHẬT: Dùng refetchList và đóng modal ---
  const handleVerifyPrescription = async (recordId) => {
    if (!recordId) return;

    try {
      const res = await doctorApi.verifyMedicalRecord(recordId, "VERIFIED");

      if (res.data?.ok) {
        toast.success("Phê duyệt đơn thuốc thành công!");
        setSelectedRecord((prev) => ({
          ...prev,
          prescription: {
            ...prev.prescription,
            status: "VERIFIED",
            verified_at: new Date().toISOString(),
          },
        }));

        fetchData();
      } else {
        toast.error("Phê duyệt đơn thuốc thất bại!");
      }
    } catch (error) {
      console.error("Lỗi phê duyệt:", error);
      toast.error("Lỗi phê duyệt đơn thuốc!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ bệnh án</h1>
        <p className="text-base text-gray-600 mt-1">
          Xem chi tiết hồ sơ bệnh án và lịch sử khám bệnh của bệnh nhân
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo bệnh nhân, mã, chẩn đoán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="PUBLIC">Công khai</option>
            <option value="PRIVATE">Riêng tư</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách hồ sơ bệnh án
          </h2>
          <span className="text-sm font-medium text-gray-500">
            {filteredRecords.length} bản ghi
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Không tìm thấy bản ghi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chẩn đoán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn thuốc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const statusBadge = getStatusBadge(record.status);
                  const prescriptionStatus = getPrescriptionStatus(
                    record.prescription_status
                  );

                  return (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{formatDate(record.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {record.patient_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.patient_code || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800 max-w-xs truncate">
                          {record.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.class}`}
                        >
                          {record.status === "PRIVATE" ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prescriptionStatus ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${prescriptionStatus.class}`}
                          >
                            {prescriptionStatus.icon}
                            {prescriptionStatus.text}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Không có
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => handleViewRecord(record)}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={handleCloseModal}
        >
          {/* Nội dung Modal */}
          {loadingRecord ? (
            // Trạng thái loading
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-lg text-white">Đang tải chi tiết...</p>
            </div>
          ) : selectedRecord ? (
            // Hiển thị chi tiết
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Chi tiết hồ sơ bệnh án
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Thông tin chi tiết và lịch sử điều trị
                    </p>
                  </div>
                </div>
                <button
                  className="text-white/80 hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Body Modal (Cuộn được) */}
              <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-gray-50">
                {/* Thẻ thông tin bệnh nhân */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                    <div className="bg-blue-100 p-2.5 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Thông tin bệnh nhân
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Họ và tên
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {selectedRecord?.patient?.full_name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Email
                      </span>
                      <span className="text-base text-gray-700">
                        {selectedRecord.patient?.user?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Số điện thoại
                      </span>
                      <span className="text-base text-gray-700">
                        {selectedRecord.patient?.user?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nhóm máu
                      </span>
                      <span className="text-base font-semibold text-red-600">
                        {selectedRecord.patient?.blood_type || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Dị ứng
                      </span>
                      <span className="text-base text-gray-700">
                        {selectedRecord.patient?.allergies?.length > 0
                          ? selectedRecord.patient.allergies.join(", ")
                          : "Không có"}
                      </span>
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Bệnh mãn tính
                      </span>
                      <span className="text-base text-gray-700">
                        {selectedRecord.patient?.chronic_diseases?.length > 0
                          ? selectedRecord.patient.chronic_diseases.join(", ")
                          : "Không có"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thẻ chẩn đoán */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-2.5 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Chẩn đoán
                    </h3>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    {selectedRecord?.medical_record?.diagnosis}
                  </p>
                </div>

                {/* Thẻ triệu chứng */}
                {selectedRecord?.medical_record?.symptoms?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-100 p-2.5 rounded-lg">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Triệu chứng
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord?.medical_record?.symptoms.map(
                        (symptom, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200"
                          >
                            {symptom}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Thẻ đơn thuốc */}
                {selectedRecord?.medical_record?.prescription && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2.5 rounded-lg">
                          <Pill className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Đơn thuốc
                        </h3>
                      </div>
                      {getPrescriptionStatus(
                        selectedRecord?.medical_record?.prescription.status
                      ) && (
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            getPrescriptionStatus(
                              selectedRecord?.medical_record?.prescription
                                .status
                            ).class
                          }`}
                        >
                          {
                            getPrescriptionStatus(
                              selectedRecord?.medical_record?.prescription
                                .status
                            ).icon
                          }
                          {
                            getPrescriptionStatus(
                              selectedRecord?.medical_record?.prescription
                                .status
                            ).text
                          }
                        </span>
                      )}
                    </div>

                    {selectedRecord?.medical_record?.prescription.medicines
                      ?.length > 0 && (
                      <div className="space-y-4">
                        {selectedRecord?.medical_record?.prescription.medicines.map(
                          (medicine, idx) => (
                            <div
                              key={idx}
                              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5 border border-purple-200"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    {medicine.name}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-purple-600 bg-white px-2 py-1 rounded">
                                        Liều lượng:
                                      </span>
                                      <span className="text-sm text-gray-700">
                                        {medicine.dosage}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-purple-600 bg-white px-2 py-1 rounded">
                                        Tần suất:
                                      </span>
                                      <span className="text-sm text-gray-700">
                                        {medicine.frequency}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-purple-600 bg-white px-2 py-1 rounded">
                                        Thời gian:
                                      </span>
                                      <span className="text-sm text-gray-700">
                                        {medicine.duration}
                                      </span>
                                    </div>
                                  </div>
                                  {medicine.note && (
                                    <div className="mt-3 bg-white/70 p-3 rounded border-l-4 border-purple-500">
                                      <p className="text-sm text-gray-700 italic">
                                        {medicine.note}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {selectedRecord?.medical_record?.prescription?.status !==
                      "VERIFIED" && (
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() =>
                            handleVerifyPrescription(
                              selectedRecord?.medical_record?._id
                            )
                          }
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Phê duyệt
                        </button>

                        <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Yêu cầu làm lại
                        </button>
                      </div>
                    )}

                    {selectedRecord?.medical_record?.prescription
                      .instruction && (
                      <div className="mt-5 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Hướng dẫn sử dụng:
                        </p>
                        <p className="text-sm text-blue-800">
                          {
                            selectedRecord?.medical_record?.prescription
                              .instruction
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Thẻ ghi chú */}
                {selectedRecord?.medical_record?.notes && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gray-100 p-2.5 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Ghi chú
                      </h3>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selectedRecord?.medical_record?.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Xử lý lỗi (nếu selectedRecord là null sau khi loading xong)
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Không thể tải hồ sơ
              </h2>
              <p className="text-gray-600 mb-6">
                Đã xảy ra lỗi khi tải chi tiết bệnh án. Rất có thể bạn không có
                quyền xem hồ sơ này.
              </p>
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(PatientMedicalRecords);