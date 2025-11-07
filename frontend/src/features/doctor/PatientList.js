import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  FileText,
  X,
  Calendar,
  Phone,
  AlertCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle,
  Paperclip,
  Clock,
  UserCheck, // Thay thế cho Users (nếu có)
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import { doctorApi } from "../../api/doctor/doctorApi";
import { useDataByUrl } from "../../utility/data.utils";
import { axiosInstance } from "../../api/axiosInstance";
import { toast } from "react-toastify"; // Thêm toast để thông báo lỗi/thành công

// **********************************************
// --- HÀM HELPER ĐỊNH DẠNG THỜI GIAN ---
// **********************************************

/**
 * Chỉ hiển thị NGÀY
 * Dùng cho ngày sinh (dob).
 */
const formatDateOnly = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC", // <-- Đảm bảo đọc ngày theo UTC
  });
};

/**
 * Hiển thị NGÀY & GIỜ
 * Dùng cho các mốc thời gian (createdAt, updatedAt, v.v.)
 */
const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// **********************************************
// --- COMPONENT CHÍNH ---
// **********************************************

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10; // Tăng limit lên 10 để hiển thị hợp lý hơn

  // State quản lý chi tiết trong modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // --- Hook: Lấy danh sách bệnh nhân (cho bảng) ---
  const {
    data: patientListData,
    isLoading: isPatientListLoading,
    error: patientListError,
  } = useDataByUrl({
    url: doctorApi.GET_ALL_PATIENT,
    key: "patient-list",
    params: { page, limit, searchTerm },
  });

  useEffect(() => {
    if (patientListError) {
        // Sử dụng toast để hiển thị lỗi một cách đẹp
        toast.error("Lỗi khi tải danh sách bệnh nhân: " + (patientListError.message || ""));
    }
  }, [patientListError]);


  const pagination = patientListData?.pagination;
  const patients = patientListData?.data;
  const totalPages = pagination?.totalPages || 1;

  // --- Hàm: Lấy chi tiết bệnh nhân và bệnh án (cho modal) ---
  const fetchPatientDetails = async (patientId) => {
    if (!patientId) return;

    try {
      setIsModalLoading(true);
      const url = doctorApi.GET_PATIENT_BY_ID(patientId);
      const res = await axiosInstance.get(url);
      const data = res.data;

      if (data.ok) {
        setSelectedPatient(data.data.patient);
        setMedicalRecords(data.data.medical_record);
        setShowModal(true);
      } else {
         toast.error("Lỗi khi lấy chi tiết bệnh nhân.");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Không thể tải chi tiết bệnh nhân.");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewDetails = (patient) => {
    // API có vẻ đang dùng patient?.appointment_id để lấy chi tiết, giữ nguyên theo code gốc
    fetchPatientDetails(patient?.appointment_id); 
    // Nếu API có patient_id, nên dùng: fetchPatientDetails(patient?.patient_id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset tất cả state của modal sau khi đóng
    setTimeout(() => {
      setSelectedPatient(null);
      setMedicalRecords([]);
      setSelectedRecordId(null);
    }, 300);
  };

  // --- Hàm Render cho Modal ---

  /**
   * Render chi tiết của 1 bệnh án đã chọn
   */
  const renderRecordDetails = () => {
    const record = medicalRecords.find((r) => r._id === selectedRecordId);
    if (!record) return null;

    return (
      <div className="p-6 space-y-6">
        {/* Nút quay lại */}
        <button
          onClick={() => setSelectedRecordId(null)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition duration-150 mb-4"
        >
          <ChevronLeft size={18} />
          Quay lại danh sách bệnh án
        </button>

        {/* Tiêu đề và Trạng thái */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {record.diagnosis}
          </h3>
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase shadow-sm ${
              record.status === "PRIVATE"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <Lock size={12} />
            {record.status}
          </span>
        </div>

        {/* Thông tin thời gian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Calendar size={18} className="text-blue-500 flex-shrink-0" />
            <div>
              <span className="font-semibold block">Ngày tạo</span>
              {formatDateTime(record.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Clock size={18} className="text-blue-500 flex-shrink-0" />
            <div>
              <span className="font-semibold block">Cập nhật lần cuối</span>
              {formatDateTime(record.updatedAt)}
            </div>
          </div>
        </div>

        {/* Triệu chứng & Ghi chú */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-bold text-gray-700 mb-3 text-lg">Triệu chứng</h4>
                <ul className="list-disc list-inside bg-gray-100 p-4 rounded-xl text-sm space-y-1">
                    {record.symptoms.length > 0 ? (
                    record.symptoms.map((symptom, i) => <li key={i}>{symptom}</li>)
                    ) : (
                    <li className="list-none text-gray-500">Không có thông tin</li>
                    )}
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-gray-700 mb-3 text-lg">Ghi chú của bác sĩ</h4>
                <p className="bg-gray-100 p-4 rounded-xl text-sm whitespace-pre-line min-h-[50px]">
                    {record.notes || <span className="text-gray-500">Không có ghi chú</span>}
                </p>
            </div>
        </div>
        
        {/* Đơn thuốc */}
        {record.prescription && (
          <div className="border border-green-300 rounded-xl p-5 bg-green-50 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-green-700 text-xl flex items-center gap-2">
                <FileText size={20} /> Đơn thuốc
              </h4>
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                  record.prescription.status === "VERIFIED"
                    ? "bg-green-600 text-white"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <CheckCircle size={12} />
                {record.prescription.status}
              </span>
            </div>

            <ul className="space-y-3">
              {record.prescription.medicines.map((med, i) => (
                <li key={i} className="border-b border-green-200 pb-3 last:border-b-0">
                  <strong className="text-base text-gray-800">{med.name}</strong>
                  <p className="text-sm text-gray-600">
                    {med.dosage} - {med.frequency} (trong {med.duration})
                  </p>
                  {med.note && (
                    <p className="text-xs text-blue-700 mt-1 italic">
                      Lưu ý: {med.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {record.prescription.instruction && (
              <p className="text-sm font-medium border-t border-green-200 pt-3 mt-3">
                <strong>Chỉ dẫn chung:</strong>{" "}
                {record.prescription.instruction}
              </p>
            )}
            {record.prescription.verified_at && (
              <p className="text-xs text-gray-500 text-right mt-2">
                Xác thực lúc: {formatDateTime(record.prescription.verified_at)}
              </p>
            )}
          </div>
        )}
        
        {/* Tệp đính kèm */}
        <div>
          <h4 className="font-bold text-gray-700 mb-3 text-lg">Tệp đính kèm</h4>
          <div className="bg-gray-100 p-4 rounded-xl text-sm space-y-2 border border-gray-200">
            {record.attachments.length > 0 ? (
              record.attachments.map((fileUrl, i) => (
                <a
                  key={i}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-gray-200 p-2 rounded-lg transition duration-150"
                >
                  <Paperclip size={16} />
                  <span className="truncate">Tệp đính kèm {i + 1}</span>
                </a>
              ))
            ) : (
              <p className="text-gray-500">Không có tệp đính kèm</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render thông tin chung của bệnh nhân và danh sách tóm tắt các bệnh án
   */
  const renderPatientInfoAndRecordList = () => {
    return (
      <div className="p-6 space-y-6">
        {/* Avatar + tên */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white text-2xl font-bold rounded-full border-4 border-white shadow-md">
            {selectedPatient?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedPatient.full_name}
            </h3>
            <p className="text-sm text-gray-600">
              Mã BN: <strong className="text-blue-600">#{selectedPatient.patient_code}</strong>
            </p>
          </div>
        </div>

        {/* Thông tin liên hệ và cá nhân */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Thông tin liên hệ */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3 border-b pb-2">
                    <Phone size={18} /> Thông tin liên hệ
                </h4>
                <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-700">Email:</span> {selectedPatient.email || "Chưa cập nhật"}</p>
                    <p><span className="font-semibold text-gray-700">SĐT:</span> {selectedPatient.phone_number || "Chưa cập nhật"}</p>
                </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3 border-b pb-2">
                    <Calendar size={18} /> Thông tin cá nhân
                </h4>
                <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-700">Ngày sinh:</span> {formatDateOnly(selectedPatient.dob)}</p>
                    <p><span className="font-semibold text-gray-700">Giới tính:</span> 
                    {selectedPatient.gender === "MALE"
                        ? " Nam"
                        : selectedPatient.gender === "FEMALE"
                        ? " Nữ"
                        : " Khác"}
                    </p>
                </div>
            </div>
        </div>

        {/* Lịch sử khám bệnh (Danh sách tóm tắt) */}
        <div>
          <h4 className="flex items-center gap-2 text-gray-700 font-bold mb-3 text-xl border-b pb-2">
            <Briefcase className="text-blue-500" size={20} />
            Lịch sử khám bệnh ({medicalRecords.length})
          </h4>
          <div className="space-y-3">
            {medicalRecords.length === 0 ? (
              <div className="text-sm text-gray-500 text-center p-5 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText size={32} className="mx-auto mb-2" />
                <p>Chưa có bệnh án nào được ghi nhận.</p>
              </div>
            ) : (
              medicalRecords.map((record) => (
                <button
                  key={record._id}
                  onClick={() => setSelectedRecordId(record._id)}
                  className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-sm hover:bg-blue-50 border border-gray-200 hover:border-blue-400 transition duration-150 text-left"
                >
                  <div>
                    <p className="font-semibold text-base text-gray-800 truncate max-w-[300px]">
                      {record.diagnosis}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {formatDateTime(record.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium hidden sm:inline">Xem chi tiết</span>
                    <ChevronRight size={18} className="text-blue-500" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- JSX Trả về ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-gray-200 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <UserCheck size={28} className="text-blue-600" /> Danh sách Bệnh nhân
          </h1>
          <p className="text-md text-gray-500 mt-1">
            Quản lý thông tin và lịch sử khám bệnh của bệnh nhân.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT hoặc email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã BN</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">SĐT</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isPatientListLoading ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <span className="ml-3 text-gray-600 font-medium">Đang tải dữ liệu...</span>
                    </td>
                  </tr>
                ) : patients?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Không tìm thấy bệnh nhân nào.</p>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient, index) => (
                    <tr key={patient?.patient_id || index} className="hover:bg-blue-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{patient.patient_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white text-sm font-semibold rounded-full mr-3">
                            {patient?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900 font-medium truncate max-w-[200px]">{patient?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{patient.email || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{patient?.phone || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(patient)}
                          className="p-2 inline-flex items-center justify-center border border-blue-400 text-blue-600 rounded-full hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xem chi tiết"
                          disabled={isModalLoading}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && !isPatientListLoading && (
            <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết bệnh nhân (Slide-in Panel) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>

          {/* Panel */}
          <div 
            className={`relative z-50 w-full sm:w-[500px] lg:w-[600px] h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out translate-x-0 flex flex-col`}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="text-blue-500" size={24} />
                {selectedRecordId
                  ? "Chi tiết Bệnh án"
                  : "Hồ sơ Bệnh nhân"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Nội dung Modal (có thể cuộn) */}
            <div className="flex-1 overflow-y-auto">
              {isModalLoading ? (
                <div className="flex justify-center items-center h-full p-10">
                  <Spinner animation="border" variant="primary" />
                  <span className="ml-3 text-gray-600 font-medium">Đang tải chi tiết...</span>
                </div>
              ) : selectedRecordId ? (
                // 1. Hiển thị chi tiết 1 bệnh án
                renderRecordDetails()
              ) : selectedPatient ? (
                // 2. Hiển thị thông tin BN + danh sách bệnh án
                renderPatientInfoAndRecordList()
              ) : (
                // 3. Trạng thái lỗi
                <div className="flex flex-col justify-center items-center h-full gap-4 text-gray-500 p-10">
                  <AlertCircle size={48} className="text-red-500" />
                  <p className="text-center">Không thể tải chi tiết bệnh nhân. Vui lòng thử lại.</p>
                </div>
              )}
            </div>

            {/* Footer - Thao tác */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 p-4 bg-white">
              {selectedPatient && !selectedRecordId && (
                <button
                  onClick={() => {
                    handleCloseModal();
                    navigate(
                      `/doctor/record-requests?patient-code=${selectedPatient.patient_code}`
                    );
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm shadow-md"
                  disabled={isModalLoading}
                >
                  <FileText size={16} />
                  Yêu cầu xem hồ sơ
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition font-medium text-sm"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(PatientList);