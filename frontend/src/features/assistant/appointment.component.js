import { memo, useState, Fragment } from "react";
import { Calendar, Telephone, XCircleFill, PlusCircle } from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import "../../styles/assistant/appointment-schedule.css";
import { APPOINTMENT_API, MEDICAL_RECORD_API } from "../../api/assistant/assistant.api";
import { useDataByUrl } from "../../utility/data.utils";
import AppListComponent from "./app.component";

const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialRecordFormData = {
  diagnosis: "",
  symptoms: "",
  notes: "",
  attachments: "",
  prescription: { instruction: "", medicines: [] },
  status: "PRIVATE",
};

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

const AppointmentComponent = () => {
  // === Bộ lọc ===
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [searchTerm] = useState("");

  // === Modal Hồ sơ ===
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAptForRecord, setSelectedAptForRecord] = useState(null);
  const [recordFormData, setRecordFormData] = useState(initialRecordFormData);
  const [recordModalError, setRecordModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState("CREATE");

  // trạng thái tải/ lỗi hồ sơ (nhận từ AppComponent)
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState(null);
  const [currentPresStatus, setCurrentPresStatus] = useState(undefined);

  const params = {
    page,
    limit,
    date: selectedDate,
    ...(filterStatus && { status: filterStatus }),
    ...(selectedSlot && { slot: selectedSlot }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: getProfile } = useDataByUrl({
    url: "/assistant/profile",
    key: "assistantProfile",
  });

  const typeAss = getProfile?.data?.assistant?.type || [];

  const { data, isLoading, error, refetch } = useDataByUrl({
    url: APPOINTMENT_API.GET_LIST_APPOINTMENTS,
    key: ["appointments-list", ...Object.values(params)],
    params,
  });

  if (error) console.log("Error fetching appointments:", error);

  const appointments = data?.data?.appointments || [];
  const slots = data?.data?.slot?.slot_list || [];
  const selectedSlotInfo = data?.data?.slot?.slot_select || null;
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };
  const totalPages = pagination.totalPages;

  // === Xác minh trạng thái ===
  const handleVerifyStatus = async (appointmentId, newStatus) => {
    try {
      await APPOINTMENT_API.verifyAppointment(appointmentId, newStatus);
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi xác minh lịch hẹn.");
    }
  };

  // === Mở/đóng modal ===
  const openRecordModal = (item, mode = "CREATE") => {
    setSelectedAptForRecord(item);
    setModalMode(mode);
    setRecordModalError("");

    const existingRecord = item.appointment.medical_record;

    if ((mode === "EDIT" || mode === "VIEW") && existingRecord) {
      setRecordFormData({
        diagnosis: existingRecord.diagnosis || "",
        symptoms: (existingRecord.symptoms || []).join(", "),
        notes: existingRecord.notes || "",
        attachments: (existingRecord.attachments || []).join(", "),
        prescription:
          existingRecord.prescription || initialRecordFormData.prescription,
        status: existingRecord.status || "PRIVATE",
      });
      setCurrentPresStatus(existingRecord?.prescription?.status);
    } else {
      setRecordFormData(initialRecordFormData);
      setCurrentPresStatus(undefined);
    }

    setRecordLoading(false);
    setRecordError(null);
    setIsRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedAptForRecord(null);
    setRecordFormData(initialRecordFormData);
    setRecordModalError("");
    setCurrentPresStatus(undefined);
    setRecordLoading(false);
    setRecordError(null);
  };

  // === Form handlers ===
  const handleRecordFormChange = (e) => {
    const { name, value } = e.target;
    setRecordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrescriptionInstructionChange = (e) => {
    const { value } = e.target;
    setRecordFormData((prev) => ({
      ...prev,
      prescription: { ...prev.prescription, instruction: value },
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setRecordFormData((prev) => {
      const newMedicines = [...(prev.prescription.medicines || [])];
      newMedicines[index] = { ...newMedicines[index], [field]: value };
      return {
        ...prev,
        prescription: { ...prev.prescription, medicines: newMedicines },
      };
    });
  };

  const addMedicine = () => {
    setRecordFormData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medicines: [
          ...(prev.prescription.medicines || []),
          { name: "", dosage: "", frequency: "", duration: "", note: "" },
        ],
      },
    }));
  };

  const removeMedicine = (index) => {
    setRecordFormData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medicines: prev.prescription.medicines.filter((_, i) => i !== index),
      },
    }));
  };

  // === Chuẩn bị body ===
  const prepareRequestBody = () => {
    const safeSymptoms = (recordFormData.symptoms || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const safeAttachments = (recordFormData.attachments || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      diagnosis: recordFormData.diagnosis,
      symptoms: safeSymptoms,
      notes: recordFormData.notes,
      attachments: safeAttachments,
      prescription: {
        instruction: recordFormData.prescription?.instruction || "",
        medicines: (recordFormData.prescription?.medicines || [])
          .filter((m) => m.name?.trim())
          .map((m) => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            note: m.note || "",
          })),
      },
      status: recordFormData.status || "PRIVATE",
      patient_id: selectedAptForRecord.patient.patient_id,
      doctor_id: selectedAptForRecord.appointment.doctor_id,
    };
  };

  // === Tạo / Sửa hồ sơ ===
  const handleCreateRecord = async () => {
    if (!recordFormData.diagnosis) {
      return setRecordModalError("Vui lòng nhập chẩn đoán.");
    }
    setIsSubmitting(true);
    try {
      const body = prepareRequestBody();
      const res = await MEDICAL_RECORD_API.createMedicalRecord(
        selectedAptForRecord.appointment.appointment_id,
        body
      );
      if (res?.data?.ok) {
        alert("Tạo hồ sơ thành công!");
        closeRecordModal();
        refetch();
      } else {
        throw new Error(res?.data?.message);
      }
    } catch (err) {
      setRecordModalError(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = async () => {
    if (!recordFormData.diagnosis) {
      return setRecordModalError("Vui lòng nhập chẩn đoán.");
    }

    const recordId = selectedAptForRecord?.appointment?.medical_record?._id;
    if (!recordId) {
      return setRecordModalError("Không tìm thấy hồ sơ.");
    }

    setIsSubmitting(true);
    try {
      const body = prepareRequestBody();
      const res = await MEDICAL_RECORD_API.updateMedicalRecord(recordId, body);
      if (res?.data?.ok) {
        alert("Cập nhật thành công!");
        closeRecordModal();
        refetch();
      } else {
        throw new Error(res?.data?.message);
      }
    } catch (err) {
      setRecordModalError(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveOrEdit = () => {
    modalMode === "CREATE" ? handleCreateRecord() : handleEditRecord();
  };

  // callback: AppComponent fetch được record → đẩy lên để fill form & status
  const handleRecordLoaded = (appointmentId, apiRecord) => {
    if (
      !selectedAptForRecord ||
      selectedAptForRecord.appointment.appointment_id !== appointmentId
    ) {
      return;
    }

    setRecordFormData({
      diagnosis: apiRecord.diagnosis || "",
      symptoms: Array.isArray(apiRecord.symptoms)
        ? apiRecord.symptoms.join(", ")
        : apiRecord.symptoms || "",
      notes: apiRecord.notes || "",
      attachments: Array.isArray(apiRecord.attachments)
        ? apiRecord.attachments.join(", ")
        : apiRecord.attachments || "",
      prescription: apiRecord.prescription || { instruction: "", medicines: [] },
      status: apiRecord.status || "PRIVATE",
    });

    setCurrentPresStatus(apiRecord.prescription?.status);
    setRecordLoading(false);
    setRecordError(null);
  };

  const handleRecordLoadingChange = (appointmentId, isLoading) => {
    if (
      !selectedAptForRecord ||
      selectedAptForRecord.appointment.appointment_id !== appointmentId
    ) {
      return;
    }
    setRecordLoading(isLoading);
  };

  const handleRecordError = (appointmentId, errorMessage) => {
    if (
      !selectedAptForRecord ||
      selectedAptForRecord.appointment.appointment_id !== appointmentId
    ) {
      return;
    }
    setRecordError(errorMessage);
    setRecordLoading(false);
  };

  const isEditLocked =
    modalMode === "EDIT" && currentPresStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Trạng thái:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="SCHEDULED">Chờ duyệt</option>
                <option value="APPROVE">Đã duyệt</option>
                <option value="COMPLETED">Đã khám xong</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="NO_SHOW">Vắng mặt</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isLoading ? (
              <span className="text-gray-500 text-sm">Đang tải ca...</span>
            ) : slots.length > 0 ? (
              slots.map((slot) => (
                <button
                  key={slot._id}
                  onClick={() => {
                    setSelectedSlot(slot._id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedSlot === slot._id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Ca: {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </button>
              ))
            ) : (
              <span className="text-gray-500 text-sm">
                Không có ca nào trong ngày này.
              </span>
            )}
          </div>
        </div>

        {/* Danh sách */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {selectedSlotInfo && (
              <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <span className="font-bold text-blue-700">
                  Ca: {formatTime(selectedSlotInfo.start_time)} -{" "}
                  {formatTime(selectedSlotInfo.end_time)}
                </span>
              </div>
            )}

            <AppListComponent
              appointments={appointments}
              typeAss={typeAss}
              handleVerifyStatus={handleVerifyStatus}
              openRecordModal={openRecordModal}
              onRecordLoaded={handleRecordLoaded}
              onRecordLoadingChange={handleRecordLoadingChange}
              onRecordError={handleRecordError}
            />

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 p-4 border-t">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Trang trước
                </button>
                <span className="text-sm">
                  Trang {page} / {totalPages}
                </span>
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
                    {modalMode === "CREATE" && "Tạo hồ sơ bệnh án"}
                    {modalMode === "EDIT" && "Sửa hồ sơ bệnh án"}
                    {modalMode === "VIEW" && "Xem hồ sơ bệnh án"}
                  </Dialog.Title>

                  {selectedAptForRecord && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Bệnh nhân:</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedAptForRecord.patient?.patient_name}
                      </p>
                      <p className="text-gray-700 text-sm mt-1">
                        <Telephone className="inline mr-2" size={14} />
                        {selectedAptForRecord.patient?.phone_number ||
                          "Không rõ"}
                      </p>
                    </div>
                  )}

                  {/* Loading/Error khi VIEW/EDIT */}
                  {["VIEW", "EDIT"].includes(modalMode) && recordLoading && (
                    <div className="rounded-md bg-indigo-50 p-3 mb-3 text-sm text-indigo-700">
                      Đang tải hồ sơ bệnh án...
                    </div>
                  )}
                  {["VIEW", "EDIT"].includes(modalMode) && recordError && (
                    <div className="rounded-md bg-red-50 p-3 mb-3 text-sm text-red-700">
                      Không thể tải hồ sơ bệnh án: {recordError}
                    </div>
                  )}

                  {/* Chip trạng thái đơn thuốc nếu có */}
                  {!recordLoading && !recordError && (() => {
                    const mapLabel = {
                      PENDING: "Đơn thuốc chờ duyệt",
                      VERIFIED: "Đơn thuốc đã duyệt",
                      REJECTED: "Đơn thuốc bị từ chối",
                    };
                    return currentPresStatus ? (
                      <div className="mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {mapLabel[currentPresStatus] ||
                            `Trạng thái: ${currentPresStatus}`}
                        </span>
                        {isEditLocked && (
                          <span className="ml-2 text-xs font-medium text-red-600">
                            (Đã duyệt — không thể chỉnh sửa)
                          </span>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* Vô hiệu hóa form khi VIEW hoặc EDIT nhưng VERIFIED */}
                  <fieldset disabled={modalMode === "VIEW" || isEditLocked}>
                    <div className="flex flex-col gap-4">
                      {/* Form */}
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

                      {/* Đơn thuốc */}
                      <div className="border-t border-gray-200 pt-4 mt-2">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          Đơn thuốc
                        </h4>
                        {/* Danh sách thuốc */}
                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                          {(recordFormData.prescription?.medicines || []).map(
                            (med, index) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg bg-gray-50 relative"
                              >
                                {/* Ẩn nút xóa khi VIEW hoặc EDIT locked */}
                                {!(modalMode === "VIEW" || isEditLocked) && (
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
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Liều lượng (vd: 500mg)"
                                    value={med.dosage}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "dosage",
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Tần suất (vd: 2 lần/ngày)"
                                    value={med.frequency}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "frequency",
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Thời hạn (vd: 5 ngày)"
                                    value={med.duration}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                  />
                                </div>
                                <textarea
                                  placeholder="Ghi chú cho thuốc..."
                                  rows={2}
                                  value={med.note}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "note",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-sm mt-3 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                            )
                          )}
                        </div>

                        {/* Ẩn nút thêm thuốc khi VIEW hoặc EDIT locked */}
                        {!(modalMode === "VIEW" || isEditLocked) && (
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
                            value={
                              recordFormData.prescription?.instruction || ""
                            }
                            onChange={handlePrescriptionInstructionChange}
                            placeholder="Vd: Uống sau khi ăn, kiêng đồ cay nóng..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Thông báo lỗi */}
                  {recordModalError && (
                    <div className="rounded-md bg-red-50 p-3 mt-4">
                      <p className="text-sm font-medium text-red-800">
                        {recordModalError}
                      </p>
                    </div>
                  )}

                  {/* Nút Modal */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                      onClick={closeRecordModal}
                      disabled={isSubmitting}
                    >
                      {modalMode === "VIEW" ? "Đóng" : "Hủy"}
                    </button>

                    {/* Ẩn nút Lưu khi VIEW hoặc EDIT nhưng VERIFIED */}
                    {!(modalMode === "VIEW" || isEditLocked) && (
                      <button
                        type="button"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400"
                        onClick={handleSaveOrEdit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Đang lưu..."
                          : modalMode === "EDIT"
                          ? "Lưu thay đổi"
                          : "Lưu bệnh án"}
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

export default memo(AppointmentComponent);
