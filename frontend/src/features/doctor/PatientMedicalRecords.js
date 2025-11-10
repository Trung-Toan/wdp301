import { memo, useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Pill, // Đã được import từ lucide-react, phù hợp
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
  AlertCircle,
  User, // Icon cho trạng thái lỗi
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { doctorApi } from "../../api/doctor/doctorApi";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap"; // Dùng spinner từ React Bootstrap

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
        toast.error("Không thể tải danh sách hồ sơ.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Lỗi kết nối khi tải hồ sơ.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
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

    // Sắp xếp ngược theo thời gian tạo (mới nhất lên đầu)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRecords(filtered);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      PUBLIC: {
        text: "Công khai",
        class: "bg-green-100 text-green-800 border-green-300",
        icon: Unlock,
      },
      PRIVATE: {
        text: "Riêng tư",
        class: "bg-red-100 text-red-800 border-red-300",
        icon: Lock,
      },
    };
    return (
      badges[status] || {
        text: "N/A",
        class: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Lock,
      }
    );
  };

  const getPrescriptionStatus = (status) => {
    switch (status) {
      case "VERIFIED":
        return {
          class: "bg-green-100 text-green-700 border-green-300",
          text: "Đã xác nhận",
          icon: <CheckCircle size={14} />,
        };
      case "PENDING":
        return {
          class: "bg-yellow-100 text-yellow-700 border-yellow-300",
          text: "Chờ xác nhận",
          icon: <Clock size={14} />,
        };
      case "REJECTED":
        return {
          class: "bg-red-100 text-red-700 border-red-300",
          text: "Bị từ chối",
          icon: <XCircle size={14} />,
        };
      default:
        return null;
    }
  };

  const handleViewRecord = async (record) => {
    try {
      setLoadingRecord(true);
      setSelectedRecord(null); // Reset trước khi mở modal
      setShowModal(true);

      const res = await doctorApi.getMedicalRecordById(
        record.medical_record_id
      );

      if (res.data?.ok) {
        setSelectedRecord(res?.data?.data);
      } else {
        toast.error(
          res.data?.error || "Không lấy được chi tiết hồ sơ bệnh án!"
        );
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

  // Cập nhật: Dùng refetchList và đóng modal
  const handleVerifyPrescription = async (recordId) => {
    if (!recordId) return;

    try {
      const res = await doctorApi.verifyMedicalRecord(recordId, "VERIFIED");

      if (res.data?.ok) {
        toast.success("Phê duyệt đơn thuốc thành công!");
        // Cập nhật trạng thái ngay lập tức trong Modal
        setSelectedRecord((prev) => ({
          ...prev,
          medical_record: {
            ...prev.medical_record,
            prescription: {
              ...prev.medical_record.prescription,
              status: "VERIFIED",
              verified_at: new Date().toISOString(),
            },
          },
        }));

        fetchData(); // Fetch lại danh sách để cập nhật bảng
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Spinner animation="border" variant="primary" />
        <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" /> Hồ sơ bệnh án
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Xem chi tiết hồ sơ bệnh án và lịch sử khám bệnh của bệnh nhân.
          </p>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã bệnh nhân, tên, chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition duration-150"
            >
              <option value="ALL">Tất cả</option>
              <option value="PUBLIC">Công khai</option>
              <option value="PRIVATE">Riêng tư</option>
            </select>
          </div>
        </div>

        {/* Bảng hồ sơ */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách ({filteredRecords.length})
            </h2>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-medium">Không tìm thấy bản ghi nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ngày khám
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Bệnh nhân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Chẩn đoán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Đơn thuốc
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record) => {
                    const statusBadge = getStatusBadge(record.status);
                    const prescriptionStatus = getPrescriptionStatus(
                      record.prescription_status
                    );
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr
                        key={record._id}
                        className="hover:bg-blue-50 transition-colors"
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
                              #{record.patient_code || ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800 max-w-xs truncate font-medium">
                            {record.diagnosis}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${statusBadge.class}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prescriptionStatus ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${prescriptionStatus.class}`}
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
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-150 shadow-md shadow-blue-500/30"
                            onClick={() => handleViewRecord(record)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                            Chi tiết
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
      </div>

      {/* Modal chi tiết */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={handleCloseModal}
        >
          {/* Nội dung Modal */}
          {loadingRecord ? (
            // Trạng thái loading
            <div className="flex flex-col items-center justify-center h-64 bg-gray-900/90 p-8 rounded-xl shadow-2xl">
              <Spinner animation="border" variant="white" />
              <p className="mt-4 text-lg text-white font-medium">
                Đang tải chi tiết hồ sơ...
              </p>
            </div>
          ) : selectedRecord ? (
            // Hiển thị chi tiết
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300 transform scale-100"
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
                      Hồ sơ bệnh án
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedRecord?.medical_record?.diagnosis}
                    </p>
                  </div>
                </div>
                <button
                  className="text-white/80 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Body Modal (Cuộn được) */}
              <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cột chính (2/3): Chẩn đoán, Triệu chứng, Đơn thuốc */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Thẻ chẩn đoán */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-2.5 rounded-lg">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Chẩn đoán & Ghi chú
                        </h3>
                      </div>
                      <p className="text-base text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-4 font-semibold">
                        {selectedRecord?.medical_record?.diagnosis}
                      </p>
                      {selectedRecord?.medical_record?.notes && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Ghi chú của bác sĩ:
                          </p>
                          <p className="text-base text-gray-700 leading-relaxed bg-gray-100 p-4 rounded-lg">
                            {selectedRecord?.medical_record?.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Thẻ triệu chứng */}
                    {selectedRecord?.medical_record?.symptoms?.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-orange-100 p-2.5 rounded-lg">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Triệu chứng
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord?.medical_record?.symptoms.map(
                            (symptom, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200 shadow-sm"
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
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2.5 rounded-lg">
                              <Pill className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">
                              Đơn thuốc
                            </h3>
                          </div>
                          {getPrescriptionStatus(
                            selectedRecord?.medical_record?.prescription.status
                          ) && (
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${
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
                          ?.length > 0 ? (
                          <div className="space-y-4">
                            {selectedRecord?.medical_record?.prescription.medicines.map(
                              (medicine, idx) => (
                                <div
                                  key={idx}
                                  className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="text-purple-600 font-bold text-lg flex-shrink-0">
                                      {idx + 1}.
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-base font-bold text-gray-900 mb-2">
                                        {medicine.name}
                                      </h4>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                                        <p>
                                          <span className="font-semibold text-purple-700">
                                            Liều:
                                          </span>{" "}
                                          {medicine.dosage}
                                        </p>
                                        <p>
                                          <span className="font-semibold text-purple-700">
                                            Tần suất:
                                          </span>{" "}
                                          {medicine.frequency}
                                        </p>
                                        <p>
                                          <span className="font-semibold text-purple-700">
                                            TG:
                                          </span>{" "}
                                          {medicine.duration}
                                        </p>
                                      </div>
                                      {medicine.note && (
                                        <div className="mt-2 text-xs text-blue-700 italic border-t border-purple-200 pt-2">
                                          Lưu ý: {medicine.note}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">
                            Không có thuốc trong đơn.
                          </p>
                        )}

                        {selectedRecord?.medical_record?.prescription
                          .instruction && (
                          <div className="mt-5 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm font-bold text-blue-900 mb-1">
                              Hướng dẫn sử dụng chung:
                            </p>
                            <p className="text-sm text-blue-800">
                              {
                                selectedRecord?.medical_record?.prescription
                                  .instruction
                              }
                            </p>
                          </div>
                        )}

                        {selectedRecord?.medical_record?.prescription.status ===
                          "PENDING" && (
                          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                            <button
                              onClick={() =>
                                handleVerifyPrescription(
                                  selectedRecord?.medical_record?._id
                                )
                              }
                              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-md shadow-green-500/30"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Phê duyệt đơn thuốc
                            </button>

                            {/* Nút Yêu cầu làm lại (chưa có logic API) */}
                            <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-md shadow-red-500/30">
                              <XCircle className="w-4 h-4" />
                              Yêu cầu làm lại
                            </button>
                          </div>
                        )}
                        
                        {selectedRecord?.medical_record?.prescription.status ===
                          "VERIFIED" && selectedRecord?.medical_record?.prescription.verified_at && (
                            <p className="mt-4 text-xs text-gray-500 text-right italic">
                                Đã phê duyệt lúc: {new Date(selectedRecord.medical_record.prescription.verified_at).toLocaleString('vi-VN')}
                            </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cột phụ (1/3): Thông tin bệnh nhân */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-0">
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                        <div className="bg-blue-100 p-2.5 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Thông tin cá nhân
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <InfoRow
                          label="Họ và tên"
                          value={selectedRecord?.patient?.full_name}
                        />
                        <InfoRow
                          label="Mã BN"
                          value={selectedRecord?.patient?.patient_code}
                          color="text-blue-600"
                        />
                        <InfoRow
                          label="Email"
                          value={selectedRecord.patient?.user?.email}
                        />
                        <InfoRow
                          label="SĐT"
                          value={selectedRecord.patient?.user?.phone}
                        />
                        <InfoRow
                          label="Nhóm máu"
                          value={selectedRecord.patient?.blood_type}
                          color="text-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Xử lý lỗi (nếu selectedRecord là null sau khi loading xong)
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Không thể tải hồ sơ
              </h2>
              <p className="text-gray-600 mb-6">
                Đã xảy ra lỗi khi tải chi tiết bệnh án. Vui lòng kiểm tra lại
                quyền truy cập hoặc kết nối mạng.
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

// Helper component cho modal
const InfoRow = ({ label, value, color = "text-gray-900" }) => (
  <div className="flex flex-col border-b border-gray-100 pb-2">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <span className={`text-base font-semibold ${color}`}>
      {value || "N/A"}
    </span>
  </div>
);

export default memo(PatientMedicalRecords);