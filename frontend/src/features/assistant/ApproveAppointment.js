"use client";

import { memo, useState, Fragment } from "react";
import {
  Calendar,
  Person,
  Telephone,
  CheckCircle,
  XCircle,
  CheckCircleFill,
  CalendarX,
  FileEarmarkPlus,
  PersonBadge,
  Clipboard2Pulse,
  PlusCircle,
  XCircleFill,
  // === THÊM ICON MỚI CHO WORKFLOW ===
  EyeFill,      // Icon cho View
  PencilFill,   // Icon cho Edit
} from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import "../../styles/assistant/appointment-schedule.css";

// === 1. CHỈ IMPORT API CẦN THIẾT ===
import { APPOINTMENT_API } from "../../api/assistant/assistant.api";
import { MEDICAL_RECORD_API } from "../../api/assistant/assistant.api";
// Giả sử createMedicalRecord vẫn nằm trong service (bạn chưa cung cấp API)
// Nếu bạn có API, hãy import nó và thay thế ở hàm "handleSaveRecord"
import { createMedicalRecord } from "../../services/assistantService";
import { useDataByUrl } from "../../utility/data.utils";

// Helper lấy ngày Local (YYYY-MM-DD)
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Cấu trúc form bệnh án (Giữ nguyên)
const initialRecordFormData = {
  diagnosis: "",
  symptoms: "",
  notes: "",
  attachments: "",
  prescription: {
    instruction: "",
    medicines: [],
  },
  status: "PRIVATE",
};

// Helper định dạng thời gian (Giữ nguyên)
const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  } catch {
    return "N/A";
  }
};

// === 2. CẬP NHẬT TRẠNG THÁI BADGE ===
const getStatusBadge = (status) => {
  const config = {
    SCHEDULED: { label: "Chờ duyệt", className: "status-scheduled" },
    APPROVE: { label: "Đã duyệt", className: "status-approved" },
    COMPLETED: { label: "Đã khám xong", className: "status-completed" },
    CANCELLED: { label: "Đã hủy", className: "status-cancelled" },
    NO_SHOW: { label: "Vắng mặt", className: "status-no-show" },
    REJECTED: { label: "Đã từ chối", className: "status-rejected" }, // <-- THÊM MỚI
  };
  return config[status] || config.SCHEDULED;
};

const ApproveAppointment = () => {
  // State cho bộ lọc (Giữ nguyên)
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { MEDICAL_RECORD_API } = require("./../../api/assistant/assistant.api");

  // State cho Modal Bệnh Án (Cập nhật)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAptForRecord, setSelectedAptForRecord] = useState(null);
  const [recordFormData, setRecordFormData] = useState(initialRecordFormData);
  const [recordModalError, setRecordModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Thêm state để biết modal đang ở chế độ VIEW, EDIT hay CREATE
  const [modalMode, setModalMode] = useState("CREATE"); // "CREATE", "VIEW", "EDIT"

  const params = {
    page: page,
    limit: limit,
    date: selectedDate,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(selectedSlot ? { slot: selectedSlot } : {}),
    ...(searchTerm ? { search: searchTerm } : {}),
  };

  const { data, isLoading, error, refetch } = useDataByUrl({
    url: APPOINTMENT_API.GET_LIST_APPOINTMENTS,
    key: ["appointments-list", ...Object.values(params)],
    params: params, // Gửi params đã được làm sạch
  });

  if (error) console.log("Error fetching appointments:", error);

  // Đọc dữ liệu từ hook (Giữ nguyên)
  const appointments = data?.data?.appointments || [];
  const slots = data?.data?.slot?.slot_list || [];
  const selectedSlotInfo = data?.data?.slot?.slot_select || null;
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };
  const totalPages = pagination.totalPages;

  const handleVerifyStatus = async (appointmentId, newStatus) => {
    console.log(`Đang GỬI XÁC MINH (Verify) cho ID: ${appointmentId} | Trạng thái mới: ${newStatus}`);
    try {
      await APPOINTMENT_API.verifyAppointment(appointmentId, newStatus);
      console.log('Xác minh thành công, đang tải lại dữ liệu...');
      refetch();

    } catch (error) {
      console.error('API Gặp LỖI khi xác minh (verify) status:', error);
      if (error.response) {
        console.error('Nội dung lỗi từ Server:', error.response.data);
      }
      const errorMessage = error.response?.data?.message || "Lỗi khi xác minh lịch hẹn.";
      alert(errorMessage);
    }
  };


  const handleUpdateStatus = async (appointmentId, newStatus) => {
    console.log(`Đang GỬI CẬP NHẬT (Update) cho ID: ${appointmentId} | Trạng thái mới: ${newStatus}`);
    const payload = { data: { status: newStatus } };
    try {
      await APPOINTMENT_API.updateAppointment(appointmentId, payload);
      console.log('Cập nhật thành công, đang tải lại dữ liệu...');
      refetch();
    } catch (error) {
      console.error('API Gặp LỖI khi cập nhật (update) status:', error);
      if (error.response) {
        console.error('Nội dung lỗi từ Server:', error.response.data);
      }
      const errorMessage = error.response?.data?.message || "Lỗi khi cập nhật trạng thái.";
      alert(errorMessage);
    }
  };

  // Mở modal với 3 chế độ: CREATE (mới), EDIT (sửa), VIEW (xem)
  const openRecordModal = (item, mode = "CREATE") => {
    setSelectedAptForRecord(item);
    setModalMode(mode); // Đặt chế độ
    setRecordModalError("");

    // Giả sử `item.appointment.medical_record` là dữ liệu bệnh án nếu có
    const existingRecord = item.appointment.medical_record;

    if ((mode === "EDIT" || mode === "VIEW") && existingRecord) {
      // Nếu là "EDIT" hoặc "VIEW", tải dữ liệu cũ vào form
      setRecordFormData({
        diagnosis: existingRecord.diagnosis || "",
        symptoms: (existingRecord.symptoms || []).join(', '), // Chuyển mảng thành chuỗi
        notes: existingRecord.notes || "",
        attachments: (existingRecord.attachments || []).join(', '), // Chuyển mảng thành chuỗi
        prescription: existingRecord.prescription || initialRecordFormData.prescription,
        status: existingRecord.status || "PRIVATE",
      });
    } else {
      // Nếu là "CREATE", dùng form rỗng
      setRecordFormData(initialRecordFormData);
    }

    setIsRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedAptForRecord(null);
  };

  // (Các hàm form, thuốc, ... giữ nguyên)
  const handleRecordFormChange = (e) => {
    const { name, value } = e.target;
    setRecordFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handlePrescriptionInstructionChange = (e) => {
    const { value } = e.target;
    setRecordFormData((prev) => ({
      ...prev,
      prescription: { ...(prev.prescription || {}), instruction: value },
    }));
  };
  const handleMedicineChange = (index, field, value) => {
    setRecordFormData((prev) => {
      const newMedicines = [...(prev.prescription?.medicines || [])];
      newMedicines[index] = { ...newMedicines[index], [field]: value };
      return {
        ...prev,
        prescription: { ...(prev.prescription || {}), medicines: newMedicines },
      };
    });
  };
  const addMedicine = () => {
    setRecordFormData((prev) => ({
      ...prev,
      prescription: {
        ...(prev.prescription || {}),
        medicines: [
          ...(prev.prescription?.medicines || []),
          { name: "", dosage: "", frequency: "", duration: "", note: "" },
        ],
      },
    }));
  };
  const removeMedicine = (index) => {
    setRecordFormData((prev) => {
      const newMedicines = (prev.prescription?.medicines || []).filter((_, i) => i !== index);
      return {
        ...prev,
        prescription: { ...(prev.prescription || {}), medicines: newMedicines },
      };
    });
  };

  // Hàm tạo/sửa bệnh án (Cập nhật)
  const handleSaveRecord = async () => {
    if (!recordFormData.diagnosis) {
      setRecordModalError("Vui lòng nhập chẩn đoán.");
      return;
    }
    // Nếu là mode VIEW, không làm gì cả
    if (modalMode === 'VIEW') {
      closeRecordModal();
      return;
    }

    setIsSubmitting(true);
    setRecordModalError("");

    try {
      // Xử lý payload (an toàn)
      const safeSymptoms = (recordFormData.symptoms || '').split(',').map(s => s.trim()).filter(s => s);
      const safeAttachments = (recordFormData.attachments || '').split(',').map(s => s.trim()).filter(s => s);

      const payload = {
        diagnosis: recordFormData.diagnosis,
        symptoms: safeSymptoms,
        notes: recordFormData.notes,
        attachments: safeAttachments,
        prescription: {
          instruction: recordFormData.prescription?.instruction || "",
          medicines: (recordFormData.prescription?.medicines || []).filter(m => m.name && m.name.trim() !== ""),
        },
        status: recordFormData.status,
        patient_id: selectedAptForRecord.patient.patient_id,
        appointment_id: selectedAptForRecord.appointment.appointment_id,
      };

      let response;
      if (modalMode === "EDIT") {
        console.log("Đang gọi API sửa bệnh án (chưa code)...", payload);
        response = await createMedicalRecord(payload);
      } else {
        const { appointment_id, ...rest } = payload;
        response = await MEDICAL_RECORD_API.createMedicalRecord(appointment_id, rest);
      }

      if (response.data && response.data.success) {
        alert(modalMode === "EDIT" ? "Sửa bệnh án thành công!" : "Tạo bệnh án thành công!");
        closeRecordModal();
        refetch();
      } else {
        setRecordModalError(response.data.error || response.error || "Lưu bệnh án thất bại.");
      }
    } catch (error) {
      setRecordModalError("Lỗi hệ thống: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === 5. HÀM RENDER NÚT HÀNH ĐỘNG MỚI ===
  // Đây là hàm triển khai toàn bộ workflow mới của bạn
  // === 3. CẬP NHẬT HÀM RENDER ACTIONS ===
  const renderAppointmentActions = (item) => {
    const appointment = item.appointment;
    const appointmentId = appointment.appointment_id;
    const status = appointment.status;
    const recordStatus = appointment.medical_record?.status;

    switch (status) {
      // 1. Chờ duyệt
      case "SCHEDULED":
        return (
          <>
            <button
              onClick={() => handleVerifyStatus(appointmentId, "APPROVE")} // <-- Dùng hàm Verify
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              title="Duyệt"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={() => handleVerifyStatus(appointmentId, "CANCELLED")} // <-- Dùng hàm Verify
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              title="Từ chối"
            >
              <XCircle size={16} />
            </button>
          </>
        );

      // 2. Đã duyệt (Chờ khám)
      case "APPROVE":
        return (
          <>
            <button
              onClick={() => openRecordModal(item, "CREATE")}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              title="Tạo bệnh án"
            >
              <FileEarmarkPlus size={16} />
            </button>

            {/* NÚT COMPLETED: Dùng hàm Update */}
            <button
              onClick={() => handleUpdateStatus(appointmentId, "COMPLETED")} // <-- Dùng hàm Update
              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
              title="Đã khám xong"
            >
              <CheckCircleFill size={16} />
            </button>

            {/* NÚT NO_SHOW: Dùng hàm Update */}
            <button
              onClick={() => handleUpdateStatus(appointmentId, "NO_SHOW")} // <-- Dùng hàm Update
              className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
              title="Vắng mặt"
            >
              <CalendarX size={16} />
            </button>
          </>
        );

      // 3. Đã khám xong (Đã có bệnh án)
      case "COMPLETED":
        if (recordStatus === "PENDING") {
          return (
            <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
              Chờ BS duyệt
            </span>
          );
        }
        if (recordStatus === "VERIFIED") {
          return (
            <button
              onClick={() => openRecordModal(item, "VIEW")}
              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
              title="Xem bệnh án (Đã duyệt)"
            >
              <EyeFill size={16} />
            </button>
          );
        }
        if (recordStatus === "CANCELLED") {
          return (
            <button
              onClick={() => openRecordModal(item, "EDIT")}
              className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
              title="Sửa bệnh án (Bị từ chối)"
            >
              <PencilFill size={16} />
            </button>
          );
        }
        return (
          <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
            Đã hoàn tất
          </span>
        );

      // 4. Các trạng thái cuối (Không có action)
      case "REJECTED":
      case "CANCELLED":
      case "NO_SHOW":
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header (Giữ nguyên) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Calendar className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Duyệt lịch khám bệnh</h1>
            <p className="text-gray-500 mt-1">Xem và quản lý các ca khám và bệnh nhân</p>
          </div>
        </div>

        {/* Khu vực điều khiển (Giữ nguyên) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <Calendar className="text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="pl-2 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Hiển thị slots từ hook (Giữ nguyên) */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {isLoading ? (
                <span className="text-gray-500 text-sm">Đang tải ca...</span>
              ) : slots.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedSlot("");
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${!selectedSlot
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Tất cả ca
                  </button>

                  {slots.map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => {
                        setSelectedSlot(slot._id);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedSlot === slot._id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      Ca: {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </button>
                  ))}
                </>
              ) : (
                <span className="text-gray-500 text-sm">Không có ca nào trong ngày này.</span>
              )}
            </div>
          </div>
        </div>

        {/* Khu vực nội dung */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Shift Header (Giữ nguyên) */}
            {selectedSlotInfo && (
              <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-700">
                    Ca: {formatTime(selectedSlotInfo.start_time)} - {formatTime(selectedSlotInfo.end_time)}
                  </span>
                </div>
              </div>
            )}

            {/* Appointments List */}
            <div className="p-6 space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500">Không có bệnh nhân nào.</p>
              ) : (
                appointments.map((item) => {
                  const { appointment, patient } = item;
                  const statusInfo = getStatusBadge(appointment.status);

                  // === 6. CẬP NHẬT MÀU BADGE ===
                  let badgeColor = "bg-gray-100 text-gray-700";
                  if (statusInfo.className === "status-scheduled") badgeColor = "bg-blue-100 text-blue-700";
                  else if (statusInfo.className === "status-approved") badgeColor = "bg-green-100 text-green-700";
                  else if (statusInfo.className === "status-completed") badgeColor = "bg-indigo-100 text-indigo-700";
                  else if (statusInfo.className === "status-cancelled" || statusInfo.className === "status-no-show" || statusInfo.className === "status-rejected") badgeColor = "bg-red-100 text-red-700";

                  return (
                    <div key={appointment.appointment_id} className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm">
                      {/* Thông tin bệnh nhân (Giữ nguyên) */}
                      <div className="flex items-center gap-4 mb-2 sm:mb-0">
                        <Person className="text-blue-600" size={20} />
                        <div>
                          <p className="font-semibold">{patient.patient_name || "Bệnh nhân ẩn"}</p>
                          <p className="text-gray-500 text-sm">
                            <Telephone className="inline mr-1" />
                            {patient.phone_number || "Không rõ"}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            <PersonBadge className="inline mr-1" />
                            Mã BN: {patient.patient_code || "N/A"}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            <Clipboard2Pulse className="inline mr-1" />
                            Lý do: {appointment.reason || "Không rõ"}
                          </p>
                        </div>
                      </div>

                      {/* === 7. SỬ DỤNG HÀM RENDER MỚI === */}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>{statusInfo.label}</span>
                        {/* Gọi hàm render */}
                        {renderAppointmentActions(item)}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Phân trang (Giữ nguyên) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 p-4 border-t">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Trang trước
                </button>
                <span className="text-sm">Trang {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                  className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Tạo/Sửa/Xem Bệnh Án */}
      <Transition appear show={isRecordModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeRecordModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/25 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-gray-900 mb-4"
                  >
                    {/* === 8. CẬP NHẬT TIÊU ĐỀ MODAL === */}
                    {modalMode === 'CREATE' && 'Tạo hồ sơ bệnh án'}
                    {modalMode === 'EDIT' && 'Sửa hồ sơ bệnh án'}
                    {modalMode === 'VIEW' && 'Xem hồ sơ bệnh án'}
                  </Dialog.Title>

                  {selectedAptForRecord && (
                    <p className="text-gray-600 mb-4">
                      Bệnh nhân:{" "}
                      <span className="font-semibold">{selectedAptForRecord.patient?.patient_name}</span>
                    </p>
                  )}

                  {/* === 9. VÔ HIỆU HÓA FORM KHI 'VIEW' === */}
                  <fieldset disabled={modalMode === 'VIEW'}>
                    <div className="flex flex-col gap-4">
                      {/* Form (giữ nguyên) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chẩn đoán <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="diagnosis"
                            value={recordFormData.diagnosis}
                            onChange={handleRecordFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Triệu chứng (cách nhau bởi dấu phẩy)
                          </label>
                          <input
                            type="text"
                            name="symptoms"
                            value={recordFormData.symptoms}
                            onChange={handleRecordFormChange}
                            placeholder="Vd: Ho, Sốt, Khó thở"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                          </label>
                          <textarea
                            name="notes"
                            rows={4}
                            value={recordFormData.notes}
                            onChange={handleRecordFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đính kèm (Links, cách nhau bởi dấu phẩy)
                          </label>
                          <textarea
                            name="attachments"
                            rows={4}
                            value={recordFormData.attachments}
                            onChange={handleRecordFormChange}
                            placeholder="Vd: https://example.com/xray.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>

                      {/* Khu vực Đơn thuốc (Prescription) */}
                      <div className="border-t border-gray-200 pt-4 mt-2">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          Đơn thuốc
                        </h4>
                        {/* Danh sách thuốc */}
                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                          {(recordFormData.prescription?.medicines || []).map((med, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-gray-50 relative">
                              {/* Ẩn nút xóa khi VIEW */}
                              {modalMode !== 'VIEW' && (
                                <button
                                  type="button"
                                  onClick={() => removeMedicine(index)}
                                  className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  title="Xóa thuốc"
                                >
                                  <XCircleFill size={16} />
                                </button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="Tên thuốc"
                                  value={med.name}
                                  onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                                  className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                                <input
                                  type="text"
                                  placeholder="Liều lượng (vd: 500mg)"
                                  value={med.dosage}
                                  onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                                  className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                                <input
                                  type="text"
                                  placeholder="Tần suất (vd: 2 lần/ngày)"
                                  value={med.frequency}
                                  onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                                  className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                                <input
                                  type="text"
                                  placeholder="Thời hạn (vd: 5 ngày)"
                                  value={med.duration}
                                  onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                  className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <textarea
                                placeholder="Ghi chú cho thuốc..."
                                rows={2}
                                value={med.note}
                                onChange={(e) => handleMedicineChange(index, "note", e.target.value)}
                                className="w-full text-sm mt-3 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Ẩn nút thêm thuốc khi VIEW */}
                        {modalMode !== 'VIEW' && (
                          <button
                            type="button"
                            onClick={addMedicine}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            <PlusCircle size={16} />
                            Thêm thuốc
                          </button>
                        )}

                        {/* Hướng dẫn chung */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hướng dẫn chung cho đơn thuốc
                          </label>
                          <textarea
                            name="instruction"
                            rows={3}
                            value={recordFormData.prescription?.instruction || ""}
                            onChange={handlePrescriptionInstructionChange}
                            placeholder="Vd: Uống sau khi ăn, kiêng đồ cay nóng..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Thông báo lỗi (Giữ nguyên) */}
                  {recordModalError && (
                    <div className="rounded-md bg-red-50 p-3 mt-4">
                      <p className="text-sm font-medium text-red-800">
                        {recordModalError}
                      </p>
                    </div>
                  )}

                  {/* === 10. CẬP NHẬT NÚT MODAL === */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                      onClick={closeRecordModal}
                      disabled={isSubmitting}
                    >
                      {/* Nếu là VIEW thì là "Đóng", còn lại là "Hủy" */}
                      {modalMode === 'VIEW' ? 'Đóng' : 'Hủy'}
                    </button>

                    {/* Ẩn nút "Lưu" khi ở chế độ VIEW */}
                    {modalMode !== 'VIEW' && (
                      <button
                        type="button"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400"
                        onClick={handleSaveRecord} // <-- Đổi tên hàm
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Đang lưu..." : (modalMode === 'EDIT' ? "Lưu thay đổi" : "Lưu bệnh án")}
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default memo(ApproveAppointment);