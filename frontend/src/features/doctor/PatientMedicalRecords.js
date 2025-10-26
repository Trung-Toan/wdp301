import { memo, useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Capsule,
  Activity,
  Lock,
  Unlock,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
} from "react-bootstrap-icons";
import { useLocation } from "react-router-dom";
import "../../styles/doctor/patient-medical-records.css";
import { doctorApi } from "../../api/doctor/doctorApi";

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
      filtered = filtered.filter((record) =>
        record.patient_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRecords(filtered);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      PUBLIC: { text: "Công khai", class: "status-public" },
      PRIVATE: { text: "Riêng tư", class: "status-private" },
    };
    return badges[status] || badges.PRIVATE;
  };

  const getPrescriptionStatus = (status) => {
    switch (status) {
      case "VERIFIED":
        return {
          class: "prescription-verified",
          text: "Đã xác nhận",
          icon: <CheckCircle size={14} className="text-green-600" />,
        };
      case "PENDING":
        return {
          class: "prescription-pending",
          text: "Chờ xác nhận",
          icon: <Clock size={14} className="text-yellow-500" />,
        };
      case "REJECTED":
        return {
          class: "prescription-rejected",
          text: "Bị từ chối",
          icon: <XCircle size={14} className="text-red-500" />,
        };
      default:
        return null;
    }
  };

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
      }
    } catch (error) {
      console.error("Lỗi khi gọi API chi tiết hồ sơ:", error);
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleVerifyPrescription = async (recordId) => {
    if (!recordId) return;
    if (!window.confirm("Bạn có chắc muốn phê duyệt đơn thuốc này không?"))
      return;

    try {
      const res = await doctorApi.verifyMedicalRecord(recordId, "VERIFIED");

      if (res.data?.ok) {
        alert("Đơn thuốc đã được phê duyệt!");
        setSelectedRecord((prev) => ({
          ...prev,
          prescription: {
            ...prev.prescription,
            status: "VERIFIED",
            verified_at: new Date().toISOString(),
          },
        }));
      } else {
        alert(res.data?.message || "Phê duyệt thất bại");
      }
    } catch (error) {
      console.error("Lỗi phê duyệt:", error);
      alert("Phê duyệt thất bại, vui lòng thử lại sau!");
    }
  };

  if (loading) {
    return (
      <div className="medical-records-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-records-container">
      <div className="page-header">
        <h1 className="page-title">Hồ sơ bệnh án</h1>
        <p className="page-subtitle">
          Xem chi tiết hồ sơ bệnh án và lịch sử khám bệnh của bệnh nhân
        </p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, chẩn đoán, triệu chứng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <Filter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tất cả</option>
            <option value="PUBLIC">Công khai</option>
            <option value="PRIVATE">Riêng tư</option>
          </select>
        </div>
      </div>

      <div className="records-section">
        <div className="section-header-row">
          <h2 className="section-title">Danh sách hồ sơ bệnh án</h2>
          <span className="records-count">
            {filteredRecords.length} bản ghi
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>Không tìm thấy bản ghi nào</p>
          </div>
        ) : (
          <div className="records-table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Ngày khám</th>
                  <th>Bệnh nhân</th>
                  <th>Chẩn đoán</th>
                  <th>Trạng thái</th>
                  <th>Đơn thuốc</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const statusBadge = getStatusBadge(record.status);
                  const prescriptionStatus = getPrescriptionStatus(
                    record.prescription_status
                  );

                  return (
                    <tr key={record._id} className="record-row">
                      <td className="date-cell">
                        <Calendar className="date-icon" size={16} />
                        <span>{formatDate(record.createdAt)}</span>
                      </td>
                      <td className="patient-cell">
                        <div className="patient-info">
                          <div className="patient-name">
                            {record.patient_name || "N/A"}
                          </div>
                          <div className="patient-email">
                            {record.patient_code || ""}
                          </div>
                        </div>
                      </td>
                      <td className="diagnosis-cell">
                        <div className="diagnosis-text">{record.diagnosis}</div>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${statusBadge.class}`}>
                          {record.status === "PRIVATE" ? (
                            <Lock size={12} />
                          ) : (
                            <Unlock size={12} />
                          )}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="prescription-cell">
                        {prescriptionStatus ? (
                          <span
                            className={`prescription-status ${prescriptionStatus.class}`}
                          >
                            {prescriptionStatus.icon}
                            {prescriptionStatus.text}
                          </span>
                        ) : (
                          <span className="no-prescription">Không có</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-view"
                          onClick={() => handleViewRecord(record)}
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
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

      {showModal && selectedRecord && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FileText size={24} className="text-white" />
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
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                onClick={handleCloseModal}
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-8 bg-gray-50">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                  <div className="bg-blue-100 p-2.5 rounded-lg">
                    <Activity size={20} className="text-blue-600" />
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
                      {selectedRecord.patient?.user?.email}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Số điện thoại
                    </span>
                    <span className="text-base text-gray-700">
                      {selectedRecord.patient?.user?.phone}
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2.5 rounded-lg">
                    <Activity size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Chẩn đoán
                  </h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  {selectedRecord?.medical_record?.diagnosis}
                </p>
              </div>

              {selectedRecord?.medical_record?.symptoms?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-100 p-2.5 rounded-lg">
                      <FileText size={20} className="text-orange-600" />
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

              {selectedRecord?.medical_record?.prescription && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2.5 rounded-lg">
                        <Capsule size={20} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Đơn thuốc
                      </h3>
                    </div>
                    {getPrescriptionStatus(
                      selectedRecord?.medical_record?.prescription
                    ) && (
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                          selectedRecord?.medical_record?.prescription
                            .verified_at
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        }`}
                      >
                        {
                          getPrescriptionStatus(
                            selectedRecord?.medical_record?.prescription
                          ).icon
                        }
                        {
                          getPrescriptionStatus(
                            selectedRecord?.medical_record?.prescription
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
                        <CheckCircle size={16} />
                        Phê duyệt
                      </button>

                      <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                        <XCircle size={16} />
                        Yêu cầu làm lại
                      </button>
                    </div>
                  )}

                  {selectedRecord?.medical_record?.prescription.instruction && (
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

              {selectedRecord?.medical_record?.notes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gray-100 p-2.5 rounded-lg">
                      <FileText size={20} className="text-gray-600" />
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
        </div>
      )}
    </div>
  );
};

export default memo(PatientMedicalRecords);
