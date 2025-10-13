import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  FileText,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Activity,
  AlertCircle,
} from "lucide-react";
import { getPatients } from "../../services/doctorService";
import "../../styles/doctor/patient-list.css";

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const doctorId = "DOC001"; // Replace with actual logged-in doctor ID
      const response = await getPatients(doctorId);
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = patient?.full_name || patient?.user?.full_name || "";
    const phone = patient?.account_id?.phone_number || "";
    const email = patient?.account_id?.email || "";
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedPatient(null), 300); // Delay to allow animation
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <th>Tuổi</th>
                <th>Giới tính</th>
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
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-content">
                      <AlertCircle size={48} className="empty-icon" />
                      <p>Không tìm thấy bệnh nhân nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => {
                  const fullName =
                    patient?.full_name || patient?.user?.full_name || "N/A";
                  const dob = patient?.dob || patient?.user?.dob;
                  const gender =
                    patient?.gender || patient?.user?.gender || "N/A";
                  const patientId = patient?._id || patient?.user?._id;

                  return (
                    <tr key={patientId || index}>
                      <td className="patient-id">
                        #{(index + 1).toString().padStart(4, "0")}
                      </td>
                      <td>
                        <div className="patient-avatar-wrapper">
                          <div className="patient-avatar">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="patient-name">{fullName}</span>
                        </div>
                      </td>
                      <td>{calculateAge(dob)}</td>
                      <td>{gender}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewDetails(patient)}
                            className="action-btn action-btn-view"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Nền mờ */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>

          {/* Panel trượt bên phải */}
          <div className="relative z-50 w-full sm:w-[600px] h-full bg-white shadow-2xl rounded-l-2xl transform transition-transform duration-300 translate-x-0 flex flex-col">
            {/* Header */}
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

            {/* Nội dung */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Avatar + tên */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold rounded-full">
                  {(
                    selectedPatient?.full_name ||
                    selectedPatient?.user?.full_name ||
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedPatient?.full_name ||
                      selectedPatient?.user?.full_name ||
                      "N/A"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Mã BN: #
                    {selectedPatient?._id ||
                      selectedPatient?.user?._id ||
                      "N/A"}
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
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="font-medium">Số điện thoại:</span>
                    <span>
                      {selectedPatient?.user?.account_id?.phone_number ||
                        "Chưa cập nhật"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 break-words">
                    <Mail size={16} className="text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>
                      {selectedPatient?.user?.account_id?.email ||
                        "Chưa cập nhật"}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-500 mt-1" />
                    <span className="font-medium">Địa chỉ:</span>
                    <span>
                      {selectedPatient?.address ||
                        selectedPatient?.user?.address ||
                        "Chưa cập nhật"}
                    </span>
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
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="font-medium">Ngày sinh:</span>
                    <span>
                      {formatDate(
                        selectedPatient?.dob || selectedPatient?.user?.dob
                      )}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Activity size={16} className="text-gray-500" />
                    <span className="font-medium">Giới tính:</span>
                    <span>
                      {selectedPatient?.gender ||
                        selectedPatient?.user?.gender ||
                        "Chưa cập nhật"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Droplet size={16} className="text-gray-500" />
                    <span className="font-medium">Nhóm máu:</span>
                    <span>
                      {selectedPatient?.blood_type || "Chưa cập nhật"}
                    </span>
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
                  <p className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-gray-500 mt-1" />
                    <span className="font-medium">Dị ứng:</span>
                    <span>
                      {selectedPatient?.allergies?.length > 0 ? selectedPatient?.allergies : "Không có thông tin"}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Activity
                      size={16}
                      className="text-gray-500 mt-1 shrink-0"
                    />
                    <span className="font-medium">Bệnh mãn tính:</span>
                    <span className="text-gray-700">
                      {selectedPatient?.chronic_diseases?.length > 0
                        ? selectedPatient.chronic_diseases.map((disease, i) => (
                            <span key={i} className="block">
                              • {disease}
                            </span>
                          ))
                        : "Không có thông tin"}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <FileText
                      size={16}
                      className="text-gray-500 mt-1 shrink-0"
                    />
                    <span className="font-medium">Lịch sử phẫu thuật:</span>
                    <span className="text-gray-700">
                      {selectedPatient?.surgery_history?.length > 0
                        ? selectedPatient.surgery_history.map((surgery, i) => (
                            <span key={i} className="block">
                              • {surgery}
                            </span>
                          ))
                        : "Không có thông tin"}
                    </span>
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
                    `/doctor/medical-records/?patientId=${
                      selectedPatient?._id || selectedPatient?.user?._id
                    }`
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
