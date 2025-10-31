"use client";

import { memo, useState, Fragment } from "react"; // Bỏ useEffect
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
} from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import "../../styles/assistant/appointment-schedule.css";

import {
  // getShifts, // <-- Không cần nữa
  // getAppointments, // <-- Không cần nữa
  updateAppointmentStatus,
  createMedicalRecord,
} from "../../services/assistantService";

// === 1. DI CHUYỂN IMPORT RA NGOÀI ===
import { useDataByUrl } from "../../utility/data.utils";
import { APPOINTMENT_API } from "../../api/assistant/assistant.api";

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

// === HÀM HELPER MỚI: Định dạng thời gian (Sửa lỗi múi giờ) ===
const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC", // <-- Hiển thị giờ gốc
    });
  } catch {
    return "N/A";
  }
};

const ApproveAppointment = () => {
  // State cho bộ lọc
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(""); // Lưu _id của slot
  const [searchTerm, setSearchTerm] = useState("");

  // === 2. XÓA STATE CŨ ===
  // const [shifts, setShifts] = useState([]); // <-- Đã xóa
  // const [appointments, setAppointments] = useState([]); // <-- Đã xóa
  // const [loading, setLoading] = useState(true); // <-- Đã xóa
  // const [selectedShiftId, setSelectedShiftId] = useState(null); // <-- Đã xóa

  // State cho Modal Bệnh Án (Giữ nguyên)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAptForRecord, setSelectedAptForRecord] = useState(null);
  const [recordFormData, setRecordFormData] = useState(initialRecordFormData);
  const [recordModalError, setRecordModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === 3. XÓA useEffect fetchData CŨ ===
  // useEffect(() => { ... fetchData ... }, [selectedDate]); // <-- Đã xóa

  // === 4. SỬA LẠI PARAMS CHO useDataByUrl ===
  const params = {
    page: page,
    limit: limit,
    date: selectedDate,
    ...(filterStatus && { status: filterStatus }),
    ...(selectedSlot && { slot: selectedSlot }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data, isLoading, error, refetch } = useDataByUrl({
    url: APPOINTMENT_API.GET_LIST_APPOINTMENTS,
    key: ["appointments-list", ...Object.values(params)], // Key động
    params: params,
  });

  if (error) console.log("Error fetching appointments:", error);

  // === 5. ĐỌC DỮ LIỆU TỪ HOOK (THEO RESPONSE MỚI) ===
  const appointments = data?.data?.appointments || [];
  const slots = data?.data?.slot?.slot_list || [];
  const selectedSlotInfo = data?.data?.slot?.slot_select || null;
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };
  const totalPages = pagination.totalPages;

  // === 6. SỬA LẠI handleUpdateStatus (DÙNG refetch) ===
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    // Không cần optimistic update nữa
    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      if (!response.success) {
        alert(response.error || "Cập nhật trạng thái thất bại.");
      } else {
        // Nếu thành công, chỉ cần tải lại dữ liệu
        refetch();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Đã xảy ra lỗi hệ thống khi cập nhật trạng thái.");
    }
  };

  // Hàm này giữ nguyên
  const getStatusBadge = (status) => {
    const config = {
      SCHEDULED: { label: "Chờ duyệt", className: "status-scheduled" },
      APPROVE: { label: "Đã duyệt", className: "status-approved" },
      COMPLETED: { label: "Đã khám xong", className: "status-completed" },
      CANCELLED: { label: "Đã hủy", className: "status-cancelled" },
      NO_SHOW: { label: "Vắng mặt", className: "status-no-show" },
    };
    return config[status] || config.SCHEDULED;
  };

  // === 7. XÓA CÁC HÀM HELPER CŨ ===
  // const getShiftAppointments = (shiftId) => { ... }; // <-- Đã xóa (API tự lọc)
  // const getSelectedShift = () => { ... }; // <-- Đã xóa (API tự trả về)

  // --- Hàm cho Modal Bệnh Án (Giữ nguyên) ---
  const openCreateRecordModal = (appointment) => {
    setSelectedAptForRecord(appointment);
    setRecordFormData(initialRecordFormData);
    setRecordModalError("");
    setIsRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedAptForRecord(null);
  };

  // (Các hàm form, thuốc, ... giữ nguyên)
  const handleRecordFormChange = (e) => { /* ... */ };
  const handlePrescriptionInstructionChange = (e) => { /* ... */ };
  const handleMedicineChange = (index, field, value) => { /* ... */ };
  const addMedicine = () => { /* ... */ };
  const removeMedicine = (index) => { /* ... */ };

  // === 8. SỬA LẠI handleCreateRecord (DÙNG refetch) ===
  const handleCreateRecord = async () => {
    if (!recordFormData.diagnosis) {
      setRecordModalError("Vui lòng nhập chẩn đoán.");
      return;
    }
    setIsSubmitting(true);
    setRecordModalError("");
    try {
      // Logic payload (giữ nguyên)
      const payload = {
        diagnosis: recordFormData.diagnosis,
        symptoms: recordFormData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        notes: recordFormData.notes,
        attachments: recordFormData.attachments.split(',').map(s => s.trim()).filter(s => s),
        prescription: {
          instruction: recordFormData.prescription?.instruction || "",
          medicines: (recordFormData.prescription?.medicines || []).filter(m => m.name && m.name.trim() !== ""),
        },
        status: recordFormData.status,
        patient_id: selectedAptForRecord.patient.patient_id, // Lấy ID từ cấu trúc mới
        appointment_id: selectedAptForRecord.appointment.appointment_id, // Lấy ID từ cấu trúc mới
        // created_by: "ID_ASSISTANT_DA_DANG_NHAP" // (Vẫn cần xử lý)
      };

      const res = await createMedicalRecord(payload);
      if (res.success) {
        alert("Tạo bệnh án thành công!");
        closeRecordModal();
        refetch(); // Tải lại danh sách sau khi tạo
      } else {
        setRecordModalError(res.error || "Tạo bệnh án thất bại.");
      }
    } catch (error) {
      setRecordModalError("Lỗi hệ thống: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === 9. CẬP NHẬT JSX ===
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

        {/* Khu vực điều khiển (Cập nhật logic state) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <Calendar className="text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1); // Reset trang
                }}
                className="pl-2 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Cập nhật: Hiển thị slots từ hook */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {isLoading ? (
                <span className="text-gray-500 text-sm">Đang tải ca...</span>
              ) : slots.length > 0 ? (
                // Sử dụng Fragment (<>) để bọc nhiều phần tử
                <>
                  {/* Nút "Tất cả" */}
                  <button
                    onClick={() => {
                      setSelectedSlot(""); // Set về rỗng (hook sẽ gửi " ")
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${!selectedSlot // Điều kiện kiểm tra `selectedSlot` rỗng
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Tất cả ca
                  </button>

                  {/* Map qua `slots` (Đã di chuyển vào đây) */}
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
                      {/* Dùng formatTime (đã sửa múi giờ) */}
                      Ca: {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </button>
                  ))}
                </>
              ) : (
                // Vế "else" (khi slots.length === 0)
                <span className="text-gray-500 text-sm">Không có ca nào trong ngày này.</span>
              )}
            </div>
          </div>
        </div>

        {/* Khu vực nội dung (Cập nhật logic hiển thị) */}
        {isLoading ? ( // Dùng isLoading từ hook
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Shift Header - Hiển thị tên ca (nếu đang lọc) */}
            {selectedSlotInfo && (
              <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-700">
                    Ca: {formatTime(selectedSlotInfo.start_time)} - {formatTime(selectedSlotInfo.end_time)}
                  </span>
                  {/* (API response không có maxPatients/booked_count trong `slot_select`) */}
                </div>
              </div>
            )}

            {/* Appointments List - Map qua `appointments` từ hook */}
            <div className="p-6 space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500">Không có bệnh nhân nào.</p>
              ) : (
                appointments.map((item) => { // `item` là { appointment, patient }
                  const { appointment, patient } = item;
                  const statusInfo = getStatusBadge(appointment.status);
                  let badgeColor = "bg-gray-100 text-gray-700";
                  if (statusInfo.className === "status-scheduled") badgeColor = "bg-blue-100 text-blue-700";
                  else if (statusInfo.className === "status-approved") badgeColor = "bg-green-100 text-green-700";
                  else if (statusInfo.className === "status-completed") badgeColor = "bg-indigo-100 text-indigo-700";
                  else if (statusInfo.className === "status-cancelled" || statusInfo.className === "status-no-show") badgeColor = "bg-red-100 text-red-700";

                  return (
                    <div key={appointment.appointment_id} className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm">
                      <div className="flex items-center gap-4 mb-2 sm:mb-0">
                        <Person className="text-blue-600" size={20} />
                        <div>
                          {/* Đọc từ `patient.patient_name` */}
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
                            Lý do: {appointment.reason || "Không rõ"} {/* (Lý do nằm trong appointment) */}
                          </p>
                        </div>
                      </div>

                      {/* Nút hành động (Cập nhật logic) */}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>{statusInfo.label}</span>
                        {appointment.status === "SCHEDULED" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appointment.appointment_id, "APPROVE")}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Duyệt"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment.appointment_id, "CANCELLED")}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Hủy"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {appointment.status === "APPROVE" && (
                          <>
                            <button
                              onClick={() => openCreateRecordModal(item)} // Gửi cả item
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="Tạo bệnh án"
                            >
                              <FileEarmarkPlus size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment.appointment_id, "COMPLETED")}
                              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                              title="Đã khám xong"
                            >
                              <CheckCircleFill size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment.appointment_id, "NO_SHOW")}
                              className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                              title="Vắng mặt"
                            >
                              <CalendarX size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Phân trang (Đọc từ `totalPages` của hook) */}
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

      {/* Modal Tạo Bệnh Án (Cập nhật logic `handleCreateRecord`) */}
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
                    Tạo hồ sơ bệnh án
                  </Dialog.Title>

                  {selectedAptForRecord && (
                    <p className="text-gray-600 mb-4">
                      Bệnh nhân:{" "}
                      {/* Đọc từ cấu trúc mới */}
                      <span className="font-semibold">{selectedAptForRecord.patient?.patient_name}</span>
                    </p>
                  )}

                  {/* Form (Giữ nguyên) */}
                  <div className="flex flex-col gap-4">
                    {/* Hàng 1: Chẩn đoán và Triệu chứng */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Hàng 2: Ghi chú và Đính kèm */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                            <button
                              type="button"
                              onClick={() => removeMedicine(index)}
                              className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                              title="Xóa thuốc"
                            >
                              <XCircleFill size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Tên thuốc"
                                value={med.name}
                                onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                                className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Liều lượng (vd: 500mg)"
                                value={med.dosage}
                                onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                                className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Tần suất (vd: 2 lần/ngày)"
                                value={med.frequency}
                                onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                                className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Thời hạn (vd: 5 ngày)"
                                value={med.duration}
                                onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <textarea
                              placeholder="Ghi chú cho thuốc..."
                              rows={2}
                              value={med.note}
                              onChange={(e) => handleMedicineChange(index, "note", e.target.value)}
                              className="w-full text-sm mt-3 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Nút thêm thuốc */}
                      <button
                        type="button"
                        onClick={addMedicine}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <PlusCircle size={16} />
                        Thêm thuốc
                      </button>

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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông báo lỗi */}
                  {recordModalError && (
                    <div className="rounded-md bg-red-50 p-3 mt-4">
                      <p className="text-sm font-medium text-red-800">
                        {recordModalError}
                      </p>
                    </div>
                  )}

                  {/* Nút điều khiển Modal */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                      onClick={closeRecordModal}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400"
                      onClick={handleCreateRecord}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang lưu..." : "Lưu bệnh án"}
                    </button>
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