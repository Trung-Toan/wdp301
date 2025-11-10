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
  UserCheck, // Thay thế cho Users
} from "lucide-react";
// import "../../styles/doctor/patient-list.css"; // Đã loại bỏ CSS ngoài
import { doctorApi } from "../../api/doctor/doctorApi";
import { useDataByUrl } from "../../utility/data.utils";
import { axiosInstance } from "../../api/axiosInstance";
import { Spinner } from "react-bootstrap"; // Dùng Spinner từ React Bootstrap
import { toast } from "react-toastify"; // Dùng toast để thông báo lỗi

// Component Chip đã được sửa lại để sử dụng Tailwind CSS
const Chip = ({ children, tone = "gray", className = "" }) => {
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-red-100 text-red-700 border-red-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

// Component SkeletonRow đã được chuyển sang Tailwind CSS
const SkeletonRow = () => (
  <tr>
    <td colSpan="5" className="p-0">
      <div className="animate-pulse px-6 py-4 flex items-center gap-6">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="flex-1 h-4 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-200 rounded hidden sm:block" />
        <div className="h-4 w-32 bg-gray-200 rounded hidden md:block" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </td>
  </tr>
);

// Component EmptyState đã được chuyển sang Tailwind CSS
const EmptyState = ({ message = "Không tìm thấy bệnh nhân nào" }) => (
  <tr>
    <td colSpan="5" className="p-12 text-center bg-white">
      <div className="flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-gray-400 mb-3" />
        <p className="text-lg font-medium text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-1">
          Vui lòng thử lại với từ khóa tìm kiếm khác.
        </p>
      </div>
    </td>
  </tr>
);

const PatientList = () => {
  const navigate = useNavigate();

  // ---- Tìm kiếm & phân trang (debounce) ----
  const [rawSearch, setRawSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // debounce 300ms cho input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(rawSearch.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  // ---- Modal state ----
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // ---- Hook data: lấy danh sách bệnh nhân ----
  const {
    data: patientListData,
    isLoading: isPatientListLoading,
    error: patientListError,
  } = useDataByUrl({
    url: doctorApi.GET_ALL_PATIENT,
    key: "patient-list",
    params: { page, limit, searchTerm },
  });

  const pagination = patientListData?.pagination;
  const patients = patientListData?.data;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    if (patientListError) {
      toast.error("Lỗi khi tải danh sách bệnh nhân.");
    }
  }, [patientListError]);

  // ---- Utils format ngày/giờ ----
  const formatDateOnly = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

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

  // ---- Lấy chi tiết BN & bệnh án cho modal ----
  const fetchPatientDetails = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      setIsModalLoading(true);
      const url = doctorApi.GET_PATIENT_BY_ID(appointmentId);
      const res = await axiosInstance.get(url);
      const data = res.data;
      if (data.ok) {
        setSelectedPatient(data.data.patient);
        setMedicalRecords(data.data.medical_record || []);
        setShowModal(true);
      } else {
        toast.error("Không thể tải chi tiết bệnh nhân.");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Lỗi kết nối khi tải chi tiết bệnh nhân.");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewDetails = (patient) => {
    // Sử dụng appointment_id theo code gốc của bạn
    fetchPatientDetails(patient?.appointment_id); 
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSelectedPatient(null);
      setMedicalRecords([]);
      setSelectedRecordId(null);
    }, 250);
  };

  // ESC để đóng modal + khoá scroll khi mở
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && showModal && handleCloseModal();
    document.addEventListener("keydown", onKey);
    // Khóa scroll khi modal mở
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // ---- Render chi tiết bệnh án trong modal ----
  const renderRecordDetails = () => {
    const record = medicalRecords.find((r) => r._id === selectedRecordId);
    if (!record) return null;

    return (
      <div className="p-6 space-y-6">
        <button
          onClick={() => setSelectedRecordId(null)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-4 transition duration-150"
        >
          <ChevronLeft size={18} />
          Quay lại thông tin bệnh nhân
        </button>

        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-xl font-bold text-gray-900">
              {record.diagnosis}
            </h3>
            <Chip tone={record.status === "PRIVATE" ? "red" : "green"}>
              <Lock size={12} className="mr-1" />
              {record.status}
            </Chip>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Mã bệnh án: {record._id.slice(-8)}
          </p>
        </div>

        {/* Thời gian */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-blue-500" />
            <div>
              <span className="font-semibold block">Ngày tạo</span>
              {formatDateTime(record.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-500" />
            <div>
              <span className="font-semibold block">Cập nhật</span>
              {formatDateTime(record.updatedAt)}
            </div>
          </div>
        </div>

        {/* Triệu chứng & Ghi chú */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-700 mb-3 text-lg">Triệu chứng</h4>
            <ul className="list-disc list-inside bg-gray-100 p-4 rounded-xl text-sm space-y-1">
              {record.symptoms?.length > 0 ? (
                record.symptoms.map((symptom, i) => <li key={i}>{symptom}</li>)
              ) : (
                <li className="list-none text-gray-500">Không có thông tin</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-700 mb-3 text-lg">
              Ghi chú
            </h4>
            <p className="bg-gray-100 p-4 rounded-xl text-sm whitespace-pre-line min-h-[50px]">
              {record.notes || <span className="text-gray-500">Không có ghi chú</span>}
            </p>
          </div>
        </div>


        {/* Đơn thuốc */}
        {record.prescription && (
          <div className="bg-white rounded-xl shadow-md border border-green-200 p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h4 className="font-bold text-green-700 flex items-center gap-2">
                <FileText size={20} /> Đơn thuốc
              </h4>
              <Chip
                tone={
                  record.prescription.status === "VERIFIED"
                    ? "green"
                    : "yellow"
                }
              >
                <CheckCircle size={12} className="mr-1" />
                {record.prescription.status}
              </Chip>
            </div>

            <div className="bg-green-50 p-3 rounded-lg space-y-3">
              <ul className="space-y-2">
                {record.prescription.medicines?.map((med, i) => (
                  <li key={i} className="border-b border-green-200 pb-2 last:border-b-0">
                    <strong className="text-sm text-gray-800">{med.name}</strong>
                    <p className="text-xs text-gray-600">
                      Liều lượng: {med.dosage} | Tần suất: {med.frequency} (trong {med.duration})
                    </p>
                    {med.note && (
                      <p className="text-xs text-blue-600 mt-1 italic">
                        Lưu ý: {med.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tệp đính kèm */}
        <div>
          <h4 className="font-bold text-gray-700 mb-3 text-lg">Tệp đính kèm</h4>
          <div className="bg-gray-100 p-4 rounded-xl text-sm space-y-2 border border-gray-200">
            {record.attachments?.length > 0 ? (
              record.attachments.map((fileUrl, i) => (
                <a
                  key={i}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-gray-200 p-2 rounded-lg transition duration-150"
                >
                  <Paperclip size={16} />
                  <span className="truncate">Xem tệp {i + 1}</span>
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

  // ---- Render thông tin BN và danh sách bệnh án ----
  const renderPatientInfoAndRecordList = () => {
    if (!selectedPatient) return null;
    return (
      <div className="p-6 space-y-6">
        {/* Header BN */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white text-2xl font-bold rounded-full border-4 border-white shadow-md">
            {selectedPatient?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedPatient.full_name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600">
                Mã BN: <strong className="text-blue-600">#{selectedPatient.patient_code}</strong>
              </span>
              {selectedPatient.gender && (
                <Chip tone="blue">
                  {selectedPatient.gender === "MALE" ? "Nam" : "Nữ"}
                </Chip>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin cá nhân & liên hệ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBlock title="Liên hệ" icon={Phone}>
            <p>
              <span className="font-medium text-gray-700">Email:</span>{" "}
              {selectedPatient.email || "Chưa cập nhật"}
            </p>
            <p>
              <span className="font-medium text-gray-700">SĐT:</span>{" "}
              {selectedPatient.phone_number || "Chưa cập nhật"}
            </p>
          </InfoBlock>

          <InfoBlock title="Cá nhân" icon={Calendar}>
            <p>
              <span className="font-medium text-gray-700">Ngày sinh:</span>{" "}
              {formatDateOnly(selectedPatient.dob)}
            </p>
            <p>
              <span className="font-medium text-gray-700">Địa chỉ:</span>{" "}
              {selectedPatient.address || "Chưa cập nhật"}
            </p>
          </InfoBlock>
        </div>


        {/* Lịch sử khám */}
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-gray-800 truncate">
                      {record.diagnosis}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {formatDateTime(record.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Chip tone={record.status === "PRIVATE" ? "red" : "green"}>
                      {record.status}
                    </Chip>
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

  // ---- JSX ----
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header dính + ô tìm kiếm */}
        <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 pt-4 pb-4 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserCheck size={28} className="text-blue-600" /> Danh sách Bệnh nhân
            </h1>
            <p className="text-md text-gray-600 hidden sm:block">
              Quản lý thông tin và lịch sử khám bệnh.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Input tìm kiếm */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT hoặc mã bệnh nhân..."
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 shadow-sm"
                aria-label="Tìm kiếm bệnh nhân"
              />
            </div>

            {/* Bộ chọn page size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-gray-600 hidden md:inline">
                Hiển thị:
              </span>
              <select
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bảng */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã BN</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">SĐT</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isPatientListLoading ? (
                  Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
                ) : !patients || patients.length === 0 ? (
                  <EmptyState message={`Không tìm thấy bệnh nhân nào ${searchTerm ? `với từ khóa "${searchTerm}"` : ""}`} />
                ) : (
                  patients.map((patient, index) => (
                    <tr key={patient?.patient_id || index} className="hover:bg-blue-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{patient?.patient_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white text-sm font-semibold rounded-full mr-3 flex-shrink-0">
                            {patient?.full_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-gray-900 font-medium truncate max-w-[200px]">{patient?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{patient?.email || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{patient?.phone || patient?.phone_number || "N/A"}</td>
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

          {/* Phân trang */}
          {totalPages > 1 && !isPatientListLoading && (
            <div className="flex flex-wrap justify-between items-center px-6 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  <ChevronLeft size={16} />
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
                    className="w-16 text-center border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={handleCloseModal}
          />

          {/* Panel */}
          <div className="relative z-50 w-full sm:w-[640px] h-full bg-white shadow-2xl rounded-l-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
            {/* Header modal */}
            <div className="sticky top-0 z-10 flex justify-between items-center p-5 border-b bg-white shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="text-blue-500" size={24} />
                {selectedRecordId ? "Chi tiết bệnh án" : "Hồ sơ Bệnh nhân"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                aria-label="Đóng"
              >
                <X size={24} />
              </button>
            </div>

            {/* Nội dung */}
            <div className="flex-1 overflow-y-auto">
              {isModalLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <Spinner animation="border" variant="primary" />
                  <span className="mt-3 text-gray-600 font-medium">Đang tải chi tiết...</span>
                </div>
              ) : selectedRecordId ? (
                renderRecordDetails()
              ) : selectedPatient ? (
                renderPatientInfoAndRecordList()
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-500 p-8">
                  <AlertCircle size={48} className="text-red-400" />
                  <p>Không thể tải chi tiết bệnh nhân.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t p-4 bg-white shadow-top">
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate(
                    `/doctor/record-requests?patient-code=${selectedPatient?.patient_code || ""}`
                  );
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm shadow-md"
                disabled={isModalLoading || !selectedPatient}
              >
                <FileText size={16} />
                Yêu cầu xem hồ sơ bệnh án
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition font-medium text-sm"
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

// Helper Component for Info Blocks
const InfoBlock = ({ title, icon: Icon, children }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
    <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3 border-b pb-2">
      <Icon size={18} /> {title}
    </h4>
    <div className="space-y-2 text-sm text-gray-700">
      {children}
    </div>
  </div>
);

export default memo(PatientList);