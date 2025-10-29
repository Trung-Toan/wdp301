import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  FileText,
  X,
  Calendar,
  Phone,
  AlertCircle,
} from "lucide-react";
import "../../styles/doctor/patient-list.css";
import { doctorApi } from "../../api/doctor/doctorApi";

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 1;

  console.log("patients: ", patients);
  

  // Gọi danh sách bệnh nhân
  useEffect(() => {
    fetchPatients();
  }, [page, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAllPatient(page, limit, searchTerm);
      const data = await res.data;
      if (data.ok) {
        setPatients(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi chi tiết bệnh nhân
  const fetchPatientDetails = async (patientId) => {
    try {
      setLoading(true);
      const res = await doctorApi.getPatientById(patientId);
      const data = await res.data; 
      
      if (data.ok) {
        setSelectedPatient(data.data.patient);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (patient) => {
    fetchPatientDetails(patient?.appointment_id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedPatient(null), 300);
  };

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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

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
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-container">
                    <div className="loading-content">
                      <div className="spinner"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
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
                if (value >= 1 && value <= totalPages) setPage(value);
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
      </div>

      {/* Modal chi tiết bệnh nhân */}
      {showModal && selectedPatient && (
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
                Thông tin chi tiết bệnh nhân
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
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
                    {formatDate(selectedPatient.dob)}
                  </p>
                  <p>
                    <span className="font-medium">Giới tính:</span>{" "}
                    {selectedPatient.gender === "MALE"
                      ? "Nam"
                      : selectedPatient.gender === "FEMALE"
                      ? "Nữ"
                      : "Khác"}
                  </p>
                  <p>
                    <span className="font-medium">Nhóm máu:</span>{" "}
                    {selectedPatient.blood_type || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {/* Thông tin y tế */}
              <div>
                <h4 className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <AlertCircle className="text-blue-500" size={18} />
                  Thông tin y tế
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                  <p>
                    <span className="font-medium">Dị ứng:</span>{" "}
                    {selectedPatient.allergies?.length
                      ? selectedPatient.allergies.join(", ")
                      : "Không có thông tin"}
                  </p>
                  <p>
                    <span className="font-medium">Bệnh mãn tính:</span>{" "}
                    {selectedPatient.chronic_diseases?.length
                      ? selectedPatient.chronic_diseases.join(", ")
                      : "Không có thông tin"}
                  </p>
                  <p>
                    <span className="font-medium">Lịch sử phẫu thuật:</span>{" "}
                    {selectedPatient.surgery_history?.length
                      ? selectedPatient.surgery_history.join(", ")
                      : "Không có thông tin"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate(
                    `/doctor/medical-records/?patient-code=${selectedPatient.patient_code}`
                  );
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FileText size={16} />
                Xem bệnh án
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
