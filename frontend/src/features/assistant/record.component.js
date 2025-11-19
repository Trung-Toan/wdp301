// src/components/appointment/RecordComponent.js
import { memo, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  Telephone,
  PlusCircle,
  XCircleFill,
} from "react-bootstrap-icons";
import { MEDICAL_RECORD_API } from "../../api/assistant/assistant.api";
import { useDataByUrl } from "../../utility/data.utils";

const initialRecordFormData = {
  diagnosis: "",
  symptoms: "",
  notes: "",
  attachments: "",
  prescription: { instruction: "", medicines: [] },
  status: "PRIVATE",
};

const RecordComponent = ({
  isOpen,
  onClose,
  selectedAptForRecord,
  modalMode,
  app_id_get_data,
  refetchAppointments,
}) => {
  const [recordFormData, setRecordFormData] = useState(initialRecordFormData);
  const [recordModalError, setRecordModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordUrl = app_id_get_data
    ? MEDICAL_RECORD_API.GET_MEDICAL_RECORD_BY_APPOINTMENT_ID(app_id_get_data)
    : null;

  const { data: mrc, isLoading: isMrcLoading, error: mrcError } = useDataByUrl({
    url: recordUrl,
    key: "get-medical-record-by-appointment-id",
  });

  useEffect(() => {
    if (!["VIEW", "EDIT"].includes(modalMode) || !mrc || isMrcLoading || mrcError) return;
    const apiRecord = Array.isArray(mrc.data) ? mrc.data[0] : null;
    if (!apiRecord) return;

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
  }, [modalMode, mrc, isMrcLoading, mrcError]);

  const currentPresStatus = Array.isArray(mrc?.data)
    ? mrc.data[0]?.prescription?.status
    : selectedAptForRecord?.appointment?.medical_record?.prescription?.status;

  const isEditLocked = modalMode === "EDIT" && currentPresStatus === "VERIFIED";

  const handleChange = (e) => {
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
      const newMeds = [...(prev.prescription.medicines || [])];
      newMeds[index] = { ...newMeds[index], [field]: value };
      return {
        ...prev,
        prescription: { ...prev.prescription, medicines: newMeds },
      };
    });
  };

  const addMedicine = () => {
    setRecordFormData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medicines: [
          ...prev.prescription.medicines,
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

  const prepareBody = () => {
    const symptoms = (recordFormData.symptoms || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const attachments = (recordFormData.attachments || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const patient_id = selectedAptForRecord.patient.patient_id;
    const doctor_id = selectedAptForRecord.appointment.doctor_id;

    return {
      diagnosis: recordFormData.diagnosis,
      symptoms,
      notes: recordFormData.notes,
      attachments,
      prescription: {
        instruction: recordFormData.prescription.instruction || "",
        medicines: recordFormData.prescription.medicines
          .filter((m) => m.name?.trim())
          .map((m) => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            note: m.note || "",
          })),
      },
      status: recordFormData.status,
      patient_id,
      doctor_id,
    };
  };

  const handleCreate = async () => {
    if (!recordFormData.diagnosis) return setRecordModalError("Vui lòng nhập chẩn đoán.");
    setIsSubmitting(true);
    try {
      const body = prepareBody();
      const res = await MEDICAL_RECORD_API.createMedicalRecord(
        selectedAptForRecord.appointment.appointment_id,
        body
      );
      if (res?.data?.ok) {
        alert("Tạo hồ sơ bệnh án thành công!");
        onClose();
        refetchAppointments();
      } else throw new Error(res?.data?.message);
    } catch (err) {
      setRecordModalError(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!recordFormData.diagnosis) return setRecordModalError("Vui lòng nhập chẩn đoán.");
    const recordId = Array.isArray(mrc?.data) ? mrc.data[0]?._id : null;
    if (!recordId) return setRecordModalError("Không tìm thấy ID hồ sơ.");

    setIsSubmitting(true);
    try {
      const body = prepareBody();
      const res = await MEDICAL_RECORD_API.updateMedicalRecord(recordId, body);
      if (res?.data?.ok) {
        alert("Cập nhật hồ sơ bệnh án thành công!");
        onClose();
        refetchAppointments();
      } else throw new Error(res?.data?.message);
    } catch (err) {
      setRecordModalError(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    modalMode === "CREATE" ? handleCreate() : handleEdit();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-4">
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
                      {selectedAptForRecord.patient?.phone_number || "Không rõ"}
                    </p>
                  </div>
                )}

                {["VIEW", "EDIT"].includes(modalMode) && isMrcLoading && (
                  <div className="rounded-md bg-indigo-50 p-3 mb-3 text-sm text-indigo-700">
                    Đang tải hồ sơ bệnh án...
                  </div>
                )}
                {["VIEW", "EDIT"].includes(modalMode) && mrcError && (
                  <div className="rounded-md bg-red-50 p-3 mb-3 text-sm text-red-700">
                    Không thể tải hồ sơ: {mrcError?.message || "Lỗi không xác định"}
                  </div>
                )}

                {!isMrcLoading && !mrcError && currentPresStatus && (
                  <div className="mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {currentPresStatus === "PENDING" && "Đơn thuốc chờ duyệt"}
                      {currentPresStatus === "VERIFIED" && "Đơn thuốc đã duyệt"}
                      {currentPresStatus === "REJECTED" && "Đơn thuốc bị từ chối"}
                    </span>
                    {isEditLocked && (
                      <span className="ml-2 text-xs font-medium text-red-600">
                        (Đã duyệt — không thể chỉnh sửa)
                      </span>
                    )}
                  </div>
                )}

                <fieldset disabled={modalMode === "VIEW" || isEditLocked}>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chẩn đoán <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="diagnosis"
                          value={recordFormData.diagnosis}
                          onChange={handleChange}
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
                          onChange={handleChange}
                          placeholder="Vd: Ho, Sốt, Khó thở"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                          name="notes"
                          rows={4}
                          value={recordFormData.notes}
                          onChange={handleChange}
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
                          onChange={handleChange}
                          placeholder="Vd: https://example.com/xray.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Đơn thuốc</h4>
                      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                        {(recordFormData.prescription?.medicines || []).map((med, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-gray-50 relative">
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

                {recordModalError && (
                  <div className="rounded-md bg-red-50 p-3 mt-4">
                    <p className="text-sm font-medium text-red-800">{recordModalError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    {modalMode === "VIEW" ? "Đóng" : "Hủy"}
                  </button>

                  {!(modalMode === "VIEW" || isEditLocked) && (
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400"
                      onClick={handleSave}
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
  );
};

export default memo(RecordComponent);