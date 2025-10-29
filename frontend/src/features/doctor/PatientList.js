import { memo, useState } from "react";
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
} from "lucide-react";
import "../../styles/doctor/patient-list.css";
import { doctorApi } from "../../api/doctor/doctorApi";
import { useDataByUrl } from "../../utility/data.utils";
// Đảm bảo bạn đã import axiosInstance từ file cấu hình của mình
import { axiosInstance } from "../../api/axiosInstance";

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 1;

  // State quản lý chi tiết trong modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // --- Hook 1: Lấy danh sách bệnh nhân (cho bảng) ---
  const {
    data: patientListData,
    isLoading: isPatientListLoading,
    error: patientListError,
  } = useDataByUrl({
    url: doctorApi.GET_ALL_PATIENT,
    key: "patient-list",
    params: { page, limit, searchTerm },
  });

  if (patientListError) {
    console.error("Error fetching patients:", patientListError);
  }

  const pagination = patientListData?.pagination;
  const patients = patientListData?.data;
  const totalPages = pagination?.totalPages || 1;

  // --- Hàm 2: Lấy chi tiết bệnh nhân và bệnh án (cho modal) ---
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
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewDetails = (patient) => {
    fetchPatientDetails(patient?.appointment_id);
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

  // --- Các hàm tiện ích ---
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  /**
   * (MỚI) Chỉ hiển thị NGÀY
   * Dùng cho ngày sinh (dob).
   * Thêm `timeZone: "UTC"` để bỏ qua việc trình duyệt tự động +7.
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
   * (MỚI) Hiển thị NGÀY & GIỜ
   * Dùng cho các mốc thời gian (createdAt, updatedAt, v.v.)
   * *Không* dùng `timeZone: "UTC"`, để trình duyệt tự chuyển sang +7.
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

  // --- Hàm Render cho Modal ---

  /**
   * Render chi tiết của 1 bệnh án đã chọn (Đã cập nhật đầy đủ)
   */
  const renderRecordDetails = () => {
    const record = medicalRecords.find((r) => r._id === selectedRecordId);
    if (!record) return null;

    return (
      <div className="p-5 space-y-5">
        {/* Nút quay lại */}
        <button
          onClick={() => setSelectedRecordId(null)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
        >
          <ChevronLeft size={18} />
          Quay lại thông tin bệnh nhân
        </button>

        {/* Tiêu đề và Trạng thái */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">
            {record.diagnosis}
          </h3>
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
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
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            <div>
              <span className="font-medium">Ngày tạo:</span>{" "}
              {formatDateTime(record.createdAt)} {/* <-- Dùng hàm DateTime */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <div>
              <span className="font-medium">Cập nhật:</span>{" "}
              {formatDateTime(record.updatedAt)} {/* <-- Dùng hàm DateTime */}
            </div>
          </div>
        </div>

        {/* Triệu chứng */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Triệu chứng</h4>
          <ul className="list-disc list-inside bg-gray-50 p-3 rounded-lg text-sm">
            {record.symptoms.length > 0 ? (
              record.symptoms.map((symptom, i) => <li key={i}>{symptom}</li>)
            ) : (
              <li className="list-none">Không có thông tin</li>
            )}
          </ul>
        </div>

        {/* Ghi chú */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">
            Ghi chú của bác sĩ
          </h4>
          <p className="bg-gray-50 p-3 rounded-lg text-sm">
            {record.notes || "Không có ghi chú"}
          </p>
        </div>

        {/* Tệp đính kèm */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Tệp đính kèm</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
            {record.attachments.length > 0 ? (
              record.attachments.map((fileUrl, i) => (
                <a
                  key={i}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Paperclip size={16} />
                  Xem tệp {i + 1}
                </a>
              ))
            ) : (
              <p className="text-gray-500">Không có tệp đính kèm</p>
            )}
          </div>
        </div>

        {/* Đơn thuốc */}
        {record.prescription && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">Đơn thuốc</h4>
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  record.prescription.status === "VERIFIED"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <CheckCircle size={12} />
                {record.prescription.status}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg space-y-3">
              <ul className="space-y-2">
                {record.prescription.medicines.map((med, i) => (
                  <li key={i} className="border-b pb-2 last:border-b-0">
                    <strong className="text-sm">{med.name}</strong>
                    <p className="text-xs text-gray-600">
                      {med.dosage} - {med.frequency} (trong {med.duration})
                    </p>
                    {med.note && (
                      <p className="text-xs text-blue-600 mt-1">
                        Lưu ý: {med.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {record.prescription.instruction && (
                <p className="text-sm font-medium border-t pt-2">
                  <strong>Chỉ dẫn chung:</strong>{" "}
                  {record.prescription.instruction}
                </p>
              )}
              {record.prescription.verified_at && (
                <p className="text-xs text-gray-500 text-right border-t pt-2">
                  Xác thực lúc:{" "}
                  {formatDateTime(
                    record.prescription.verified_at
                  )}{" "}
                  {/* <-- Dùng hàm DateTime */}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render thông tin chung của bệnh nhân và danh sách tóm tắt các bệnh án
   */
  const renderPatientInfoAndRecordList = () => {
    return (
      <div className="p-5 space-y-5">
        {/* Avatar + tên */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold rounded-full">
            {selectedPatient?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedPatient.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              Mã BN: #{selectedPatient.patient_code}
            </p>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div>
          <h4 className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
            <Phone className="text-blue-500" size={18} />
            Thông tin liên hệ
          </h4>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {selectedPatient.email || "Chưa cập nhật"}
            </p>
            <p>
              <span className="font-medium">Số điện thoại:</span>{" "}
              {selectedPatient.phone_number || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div>
          <h4 className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
            <Calendar className="text-blue-500" size={18} />
            Thông tin cá nhân
          </h4>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
            <p>
              <span className="font-medium">Ngày sinh:</span>{" "}
              {formatDateOnly(selectedPatient.dob)}{" "}
              {/* <-- DÙNG HÀM MỚI (DATE ONLY) */}
            </p>
            <p>
              <span className="font-medium">Giới tính:</span>{" "}
              {selectedPatient.gender === "MALE"
                ? "Nam"
                : selectedPatient.gender === "FEMALE"
                  ? "Nữ"
                  : "Khác"}
            </p>
          </div>
        </div>

        {/* Lịch sử khám bệnh (Danh sách tóm tắt) */}
        <div>
          <h4 className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
            <Briefcase className="text-blue-500" size={18} />
            Lịch sử khám bệnh
          </h4>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
            {medicalRecords.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                Chưa có bệnh án nào.
              </p>
            ) : (
              medicalRecords.map((record) => (
                <button
                  key={record._id}
                  onClick={() => setSelectedRecordId(record._id)}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-lg hover:bg-blue-50 border transition-all text-left"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {record.diagnosis}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(record.createdAt)}{" "}
                      {/* <-- Dùng hàm DateTime */}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
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
    <div className="patient-list-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Danh sách bệnh nhân</h1>
        <p className="page-subtitle">Quản lý thông tin bệnh nhân</p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="patients-table-wrapper">
        <div className="overflow-x-auto">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Mã BN</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isPatientListLoading ? (
                <tr>
                  <td colSpan="7" className="loading-container">
                    <div className="loading-content">
                      <div className="spinner"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : patients?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-content">
                      <AlertCircle size={48} className="empty-icon" />
                      <p>Không tìm thấy bệnh nhân nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={patient?.patient_id || index}>
                    <td className="patient-id">#{patient.patient_code}</td>
                    <td>
                      <div className="patient-avatar-wrapper">
                        <div className="patient-avatar">
                          {patient?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="patient-name">
                          {patient?.full_name}
                        </span>
                      </div>
                    </td>
                    <td>{patient.email || "N/A"}</td>
                    <td>{patient?.phone || "N/A"}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleViewDetails(patient)}
                        className="action-btn action-btn-view"
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
          <div className="flex justify-center items-center gap-3 mt-1 mb-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Trang trước
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= totalPages) {
                    setPage(value);
                  }
                }}
                className="w-16 text-center border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span>/ {totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* Modal chi tiết bệnh nhân (ĐÃ CẬP NHẬT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>

          {/* Panel */}
          <div className="relative z-50 w-full sm:w-[600px] h-full bg-white shadow-2xl rounded-l-2xl transform transition-transform duration-300 translate-x-0 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-500" size={20} />
                {/* Tiêu đề động */}
                {selectedRecordId
                  ? "Chi tiết bệnh án"
                  : "Thông tin chi tiết bệnh nhân"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Nội dung Modal (có thể cuộn) */}
            <div className="flex-1 overflow-y-auto">
              {isModalLoading ? (
                <div className="flex-1 flex justify-center items-center h-full">
                  <div className="loading-content">
                    <div className="spinner"></div>
                    <span>Đang tải chi tiết...</span>
                  </div>
                </div>
              ) : selectedRecordId ? (
                // 1. Hiển thị chi tiết 1 bệnh án
                renderRecordDetails()
              ) : selectedPatient ? (
                // 2. Hiển thị thông tin BN + danh sách bệnh án
                renderPatientInfoAndRecordList()
              ) : (
                // 3. Trạng thái lỗi
                <div className="flex-1 flex flex-col justify-center items-center h-full gap-4 text-gray-500">
                  <AlertCircle size={48} className="text-red-400" />
                  <p>Không thể tải chi tiết bệnh nhân.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate(
                    `/doctor/record-requests?patient-code=${selectedPatient.patient_code}`
                  );
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                disabled={isModalLoading || !selectedPatient}
              >
                <FileText size={16} />
                Yêu cầu xem hồ sơ bệnh án
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(PatientList);