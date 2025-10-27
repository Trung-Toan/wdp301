"use client";

import { memo, useEffect, useState, Fragment } from "react";
import {
  Calendar,
  Person,
  Telephone,
  CheckCircle,
  XCircle,
  CheckCircleFill,
  CalendarX,
  FileEarmarkPlus, // Icon mới: Tạo bệnh án
} from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react"; // Thêm
import "../../styles/assistant/appointment-schedule.css";

import {
  getShifts,
  getAppointments,
  updateAppointmentStatus,
  createMedicalRecord, // API mới
} from "../../services/assistantService";

// Helper lấy ngày Local (YYYY-MM-DD)
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return "2025-10-27"; // Hardcode cho mock data
};

// Cấu trúc form bệnh án (dựa trên schema)
const initialRecordFormData = {
  diagnosis: "",
  symptoms: "", // Dùng string, sẽ split thành array khi lưu
  notes: "",
  status: "PRIVATE",
};

const ApproveAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [shifts, setShifts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const doctorId = "DOC001";

  // --- State cho Modal Bệnh Án ---
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  // Lưu lịch hẹn đang được chọn để tạo bệnh án
  const [selectedAptForRecord, setSelectedAptForRecord] = useState(null);
  const [recordFormData, setRecordFormData] = useState(initialRecordFormData);
  const [recordModalError, setRecordModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ---------------------------------

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSelectedShiftId(null);
      try {
        const [shiftsRes, apptsRes] = await Promise.all([
          getShifts(doctorId, selectedDate),
          getAppointments({ doctorId: doctorId, date: selectedDate }),
        ]);
        const fetchedShifts = shiftsRes.data || [];
        const fetchedAppts = apptsRes.data || [];
        const sortedShifts = fetchedShifts.sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );
        setShifts(sortedShifts);
        setAppointments(fetchedAppts);
        if (sortedShifts.length > 0) {
          setSelectedShiftId(sortedShifts[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate, doctorId]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const originalAppointments = [...appointments];
    setAppointments((prev) =>
      prev.map((apt) =>
        apt._id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    );
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      setAppointments(originalAppointments);
      alert("Cập nhật trạng thái thất bại.");
    }
  };

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

  const getShiftAppointments = (shiftId) => {
    const statusSortOrder = {
      SCHEDULED: 1, APPROVE: 2, COMPLETED: 3, NO_SHOW: 4, CANCELLED: 5,
    };
    return appointments
      .filter((apt) => apt.shift?._id === shiftId)
      .sort((a, b) => {
        const orderA = statusSortOrder[a.status] || 99;
        const orderB = statusSortOrder[b.status] || 99;
        return orderA - orderB;
      });
  };

  const getSelectedShift = () => {
    if (!selectedShiftId) return null;
    return shifts.find((s) => s._id === selectedShiftId);
  };

  // --- Hàm cho Modal Bệnh Án ---
  const openCreateRecordModal = (appointment) => {
    setSelectedAptForRecord(appointment);
    setRecordFormData(initialRecordFormData); // Reset form
    setRecordModalError("");
    setIsRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedAptForRecord(null);
  };

  const handleRecordFormChange = (e) => {
    const { name, value } = e.target;
    setRecordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRecord = async () => {
    if (!recordFormData.diagnosis) {
      setRecordModalError("Vui lòng nhập chẩn đoán.");
      return;
    }

    setIsSubmitting(true);
    setRecordModalError("");

    try {
      const payload = {
        ...recordFormData,
        // Chuyển string triệu chứng thành array
        symptoms: recordFormData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        // Thêm các ID cần thiết từ schema
        doctor_id: doctorId,
        patient_id: selectedAptForRecord.patient._id,
        appointment_id: selectedAptForRecord._id,
      };

      const res = await createMedicalRecord(payload);

      if (res.success) {
        alert("Tạo bệnh án thành công!");
        closeRecordModal();
      } else {
        setRecordModalError(res.error || "Tạo bệnh án thất bại.");
      }
    } catch (error) {
      setRecordModalError("Lỗi hệ thống: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Calendar className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Duyệt lịch khám bệnh
            </h1>
            <p className="text-gray-500 mt-1">
              Xem và quản lý các ca khám và bệnh nhân
            </p>
          </div>
        </div>

        {/* Khu vực điều khiển (Date Picker và Shift Tabs) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* ... (Giữ nguyên code Date Picker và Shift Tabs) ... */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <Calendar className="text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-2 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {loading ? (
                <span className="text-gray-500 text-sm">Đang tải ca...</span>
              ) : shifts.length > 0 ? (
                shifts.map((shift) => (
                  <button
                    key={shift._id}
                    onClick={() => setSelectedShiftId(shift._id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
                       ${selectedShiftId === shift._id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                     `}
                  >
                    Ca: {shift.start_time} - {shift.end_time}
                  </button>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  Không có ca nào trong ngày này.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Khu vực nội dung (Danh sách bệnh nhân) */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : getSelectedShift() ? (
          (() => {
            const shift = getSelectedShift();
            const shiftAppointments = getShiftAppointments(shift._id);
            const actualPatientsCount = shiftAppointments.length;

            return (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Shift Header */}
                <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                  {/* ... (Giữ nguyên code Shift Header) ... */}
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-blue-700">
                      Ca: {shift.start_time} - {shift.end_time}
                    </span>
                    <span className="text-gray-600">
                      Số bệnh nhân: {actualPatientsCount}/{shift.maxPatients}
                    </span>
                  </div>
                </div>

                {/* Appointments List */}
                <div className="p-6 space-y-4">
                  {shiftAppointments.length === 0 ? (
                    <p className="text-gray-500">Chưa có bệnh nhân</p>
                  ) : (
                    shiftAppointments.map((apt) => {
                      const statusInfo = getStatusBadge(apt.status);

                      let badgeColor = "bg-gray-100 text-gray-700";
                      if (statusInfo.className === "status-scheduled") {
                        badgeColor = "bg-blue-100 text-blue-700";
                      } else if (statusInfo.className === "status-approved") {
                        badgeColor = "bg-green-100 text-green-700";
                      } else if (statusInfo.className === "status-completed") {
                        badgeColor = "bg-indigo-100 text-indigo-700";
                      } else if (statusInfo.className === "status-cancelled" || statusInfo.className === "status-no-show") {
                        badgeColor = "bg-red-100 text-red-700";
                      }

                      return (
                        <div
                          key={apt._id}
                          className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-4 mb-2 sm:mb-0">
                            {/* ... (Giữ nguyên code thông tin Patient) ... */}
                            <Person className="text-blue-600" size={20} />
                            <div>
                              <p className="font-semibold">
                                {apt.patient?.name || "Bệnh nhân ẩn"}
                              </p>
                              <p className="text-gray-500 text-sm">
                                <Telephone className="inline mr-1" />
                                {apt.patient?.phone || "Không rõ"}
                              </p>
                            </div>
                          </div>

                          {/* === THÊM NÚT "TẠO BỆNH ÁN" === */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
                            >
                              {statusInfo.label}
                            </span>

                            {/* 1. Nếu CHỜ DUYỆT (SCHEDULED) */}
                            {apt.status === "SCHEDULED" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, "APPROVE")}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Duyệt"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, "CANCELLED")}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  title="Hủy"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}

                            {/* 2. Nếu ĐÃ DUYỆT (APPROVE) */}
                            {apt.status === "APPROVE" && (
                              <>
                                {/* NÚT MỚI: TẠO BỆNH ÁN */}
                                <button
                                  onClick={() => openCreateRecordModal(apt)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                  title="Tạo bệnh án"
                                >
                                  <FileEarmarkPlus size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, "COMPLETED")}
                                  className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                                  title="Đã khám xong"
                                >
                                  <CheckCircleFill size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, "NO_SHOW")}
                                  className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                                  title="Vắng mặt"
                                >
                                  <CalendarX size={16} />
                                </button>
                              </>
                            )}
                            {/* (Các trạng thái khác không có nút) */}
                          </div>
                          {/* =============================== */}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            {/* ... (Giữ nguyên code "Không có ca khám") ... */}
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Không có ca khám nào
            </p>
            <p className="text-gray-500">
              Hãy thử chọn ngày khác hoặc tạo ca mới
            </p>
          </div>
        )}
      </div>

      {/* === MODAL TẠO BỆNH ÁN MỚI === */}
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-gray-900 mb-4"
                  >
                    Tạo hồ sơ bệnh án
                  </Dialog.Title>

                  {selectedAptForRecord && (
                    <p className="text-gray-600 mb-4">
                      Bệnh nhân:{" "}
                      <span className="font-semibold">{selectedAptForRecord.patient?.name}</span>
                    </p>
                  )}

                  <div className="flex flex-col gap-4">
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
                      <textarea
                        name="symptoms"
                        rows={3}
                        value={recordFormData.symptoms}
                        onChange={handleRecordFormChange}
                        placeholder="Vd: Ho, Sốt, Khó thở"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
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
                        Quyền riêng tư
                      </label>
                      <select
                        name="status"
                        value={recordFormData.status}
                        onChange={handleRecordFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="PRIVATE">Riêng tư (Mặc định)</option>
                        <option value="PUBLIC">Công khai</option>
                      </select>
                    </div>
                  </div>

                  {recordModalError && (
                    <div className="rounded-md bg-red-50 p-3 mt-4">
                      <p className="text-sm font-medium text-red-800">
                        {recordModalError}
                      </p>
                    </div>
                  )}

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
      {/* =========================== */}
    </div>
  );
};

export default memo(ApproveAppointment);