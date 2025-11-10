import { memo, useState, useEffect, Fragment } from "react";
import {
  Calendar,
  Person,
  Telephone,
  CheckCircle,
  XCircle,
  FileEarmarkPlus,
  PersonBadge,
  Clipboard2Pulse,
  PlusCircle,
  XCircleFill,
  EyeFill,
  PencilFill,
} from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import "../../styles/assistant/appointment-schedule.css";
// Giả định các API này đã được import chính xác
import { APPOINTMENT_API } from "../../api/assistant/assistant.api";
import { useDataByUrl } from "../../utility/data.utils";
// Giả định MEDICAL_RECORD_API được export từ file này
import { MEDICAL_RECORD_API } from "./../../api/assistant/assistant.api";

// *** THAY ĐỔI 1: Import useMutation và useQueryClient ***
// (Giả định bạn dùng @tanstack/react-query)
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Helper lấy ngày hiện tại
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Cấu trúc form bệnh án ban đầu
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

// Helper định dạng thời gian
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

// Badge trạng thái lịch hẹn
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

const AppointmentComponent = () => {
  // *** THAY ĐỔI 2: Khởi tạo queryClient ***
  const queryClient = useQueryClient();

  // Bộ lọc
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Hồ sơ
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAptForRecord, setSelectedAptForRecord] = useState(null);
  const [recordFormData, setRecordFormData] = useState(initialRecordFormData);
  const [recordModalError, setRecordModalError] = useState("");
  const [modalMode, setModalMode] = useState("CREATE"); // "CREATE", "VIEW", "EDIT"
  // *** THAY ĐỔI 3: Xóa state isSubmitting ***
  // const [isSubmitting, setIsSubmitting] = useState(false); // Sẽ được thay bằng mutation.isPending

  // id appointment để fetch hồ sơ khi VIEW/EDIT
  const [app_id_get_data, setApp_id_get_data] = useState(null);

  const params = {
    page: page,
    limit: limit,
    date: selectedDate,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(selectedSlot ? { slot: selectedSlot } : {}),
    ...(searchTerm ? { search: searchTerm } : {}),
  };

  const { data: getProfile } = useDataByUrl({
    url: "/assistant/profile",
    key: "assistantProfile",
  });

  const typeAss = getProfile?.data?.assistant?.type || [];

  // Key query "appointments-list" sẽ được dùng để invalidate
  const { data, isLoading, error, refetch } = useDataByUrl({
    url: APPOINTMENT_API.GET_LIST_APPOINTMENTS,
    key: ["appointments-list", ...Object.values(params)],
    params: params,
  });

  if (error) console.log("Error fetching appointments:", error);

  // Dữ liệu danh sách
  const appointments = data?.data?.appointments || [];
  const slots = data?.data?.slot?.slot_list || [];
  const selectedSlotInfo = data?.data?.slot?.slot_select || null;
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };
  const totalPages = pagination.totalPages;

  // Đổi trạng thái lịch hẹn
  const handleVerifyStatus = async (appointmentId, newStatus) => {
    try {
      await APPOINTMENT_API.verifyAppointment(appointmentId, newStatus);
      refetch(); // Hoặc dùng queryClient.invalidateQueries({ queryKey: ["appointments-list"] });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xác minh lịch hẹn.";
      alert(errorMessage);
    }
  };

  // Mở/đóng modal hồ sơ
  const openRecordModal = (item, mode = "CREATE") => {
    setSelectedAptForRecord(item);
    setModalMode(mode);
    setRecordModalError("");

    const existingRecord = item.appointment.medical_record;
    if ((mode === "EDIT" || mode === "VIEW") && existingRecord) {
      // Prefill tạm từ snapshot; sẽ bị overwrite khi mrc về
      setRecordFormData({
        diagnosis: existingRecord.diagnosis || "",
        symptoms: (existingRecord.symptoms || []).join(", "),
        notes: existingRecord.notes || "",
        attachments: (existingRecord.attachments || []).join(", "),
        prescription:
          existingRecord.prescription || initialRecordFormData.prescription,
        status: existingRecord.status || "PRIVATE",
      });
    } else {
      setRecordFormData(initialRecordFormData);
    }

    // Với VIEW/EDIT: set id để hook gọi DB lấy mới nhất
    if (mode === "VIEW" || mode === "EDIT") {
      const appointmentId = item?.appointment?.appointment_id;
      if (appointmentId) setApp_id_get_data(appointmentId);
    } else {
      setApp_id_get_data(null); // Đảm bảo reset khi CREATE
    }

    setIsRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedAptForRecord(null);
    setApp_id_get_data(null); // reset id để ngừng fetch
    setRecordFormData(initialRecordFormData);
    setRecordModalError("");
  };

  // Form handlers (không đổi)
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
      const newMedicines = (prev.prescription?.medicines || []).filter(
        (_, i) => i !== index
      );
      return {
        ...prev,
        prescription: { ...(prev.prescription || {}), medicines: newMedicines },
      };
    });
  };

  // Helper chuẩn bị body request (dùng cho TẠO MỚI)
  const prepareRequestBody = () => {
    const safeSymptoms = (recordFormData.symptoms || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const safeAttachments = (recordFormData.attachments || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    const patient_id = selectedAptForRecord.patient.patient_id;
    const doctor_id = selectedAptForRecord.appointment.doctor_id;

    return {
      diagnosis: recordFormData.diagnosis,
      symptoms: safeSymptoms,
      notes: recordFormData.notes,
      attachments: safeAttachments,
      prescription: {
        instruction: recordFormData.prescription?.instruction || "",
        medicines: (recordFormData.prescription?.medicines || [])
          .filter((m) => m.name && m.name.trim() !== "")
          .map((med) => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            note: med.note || "",
          })),
      },
      status: recordFormData.status || "PRIVATE",
      patient_id,
      doctor_id,
    };
  };

  // *** THAY ĐỔI 4: Định nghĩa `useMutation` cho TẠO MỚI HỒ SƠ ***
  const createRecordMutation = useMutation({
    mutationFn: ({ appointment_id, requestBody }) =>
      MEDICAL_RECORD_API.createMedicalRecord(appointment_id, requestBody),
    onSuccess: (response) => {
      if (response?.data?.ok) {
        alert("Tạo hồ sơ bệnh án thành công!");
        closeRecordModal();
        // Tự động fetch lại danh sách appointments
        queryClient.invalidateQueries({ queryKey: ["appointments-list"] });
      } else {
        setRecordModalError(
          response?.data?.message || response?.message || "Tạo hồ sơ thất bại."
        );
      }
    },
    onError: (error) => {
      console.error("❌ Lỗi tạo hồ sơ:", error);
      setRecordModalError(
        error.response?.data?.message || error.message || "Lỗi hệ thống"
      );
    },
  });

  // *** THAY ĐỔI 5: Định nghĩa `useMutation` cho SỬA HỒ SƠ ***
  const editRecordMutation = useMutation({
    mutationFn: ({ recordId, requestBody }) =>
      MEDICAL_RECORD_API.updateMedicalRecord(recordId, requestBody),
    onSuccess: (response) => {
      if (response?.data?.ok) {
        alert("Cập nhật hồ sơ bệnh án thành công!");
        closeRecordModal();
        // Tự động fetch lại danh sách appointments
        queryClient.invalidateQueries({ queryKey: ["appointments-list"] });
        // Đồng thời invalidate query chi tiết (nếu người dùng xem lại)
        queryClient.invalidateQueries({
          queryKey: ["get-medical-record-by-appointment-id"],
        });
      } else {
        setRecordModalError(
          response?.data?.message || response?.message || "Cập nhật hồ sơ thất bại."
        );
      }
    },
    onError: (error) => {
      console.error("❌ Lỗi cập nhật hồ sơ:", error);
      setRecordModalError(
        error.response?.data?.message || error.message || "Lỗi hệ thống"
      );
    },
  });

  // ==============
  // TẠO HỒ SƠ MỚI
  // ==============
  // *** THAY ĐỔI 6: Viết lại hàm `handleCreateRecord` ***
  const handleCreateRecord = async () => {
    if (!recordFormData.diagnosis) {
      setRecordModalError("Vui lòng nhập chẩn đoán.");
      return;
    }

    setRecordModalError(""); // Xóa lỗi cũ trước khi gọi

    try {
      const requestBody = prepareRequestBody(); // Dùng helper cũ
      const appointment_id = selectedAptForRecord.appointment.appointment_id;

      // Kích hoạt mutation
      createRecordMutation.mutate({ appointment_id, requestBody });
    } catch (error) {
      // Lỗi này chủ yếu là lỗi logic/client-side (vd: selectedAptForRecord null)
      console.error("❌ Lỗi chuẩn bị tạo hồ sơ:", error);
      setRecordModalError("Lỗi chuẩn bị dữ liệu. Không thể gửi.");
    }
  };

  // ==============
  // SỬA HỒ SƠ ĐÃ CÓ
  // ==============
  // *** THAY ĐỔI 7: Viết lại hàm `handleEditRecord` ***
  const handleEditRecord = async () => {
    // 1. Validation cơ bản
    if (!recordFormData.diagnosis) {
      setRecordModalError("Vui lòng nhập chẩn đoán.");
      return;
    }
    if (modalMode !== "EDIT") {
      console.warn("handleEditRecord được gọi khi không ở mode 'EDIT'");
      return;
    }

    // 2. Lấy recordId
    const apiRecord = Array.isArray(mrc?.data) ? mrc.data[0] : null;
    const recordId = apiRecord?._id;

    if (!recordId) {
      setRecordModalError(
        "Không tìm thấy ID hồ sơ bệnh án. Vui lòng thử tải lại."
      );
      return;
    }

    setRecordModalError(""); // Xóa lỗi cũ

    try {
      // 3. Chuẩn bị requestBody (Giữ nguyên logic inline của bạn)
      const safeSymptoms = (recordFormData.symptoms || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const safeAttachments = (recordFormData.attachments || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Body này không chứa patient_id/doctor_id, đúng cho việc update
      const requestBody = {
        diagnosis: recordFormData.diagnosis,
        symptoms: safeSymptoms,
        notes: recordFormData.notes,
        attachments: safeAttachments,
        prescription: {
          instruction: recordFormData.prescription?.instruction || "",
          medicines: (recordFormData.prescription?.medicines || [])
            .filter((m) => m.name && m.name.trim() !== "")
            .map((m) => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              duration: m.duration,
              note: m.note || "",
            })),
        },
        status: recordFormData.status || "PRIVATE",
      };

      // 4. Kích hoạt mutation
      editRecordMutation.mutate({ recordId, requestBody });
    } catch (error) {
      // Lỗi này chủ yếu là lỗi logic/client-side
      console.error("❌ Lỗi chuẩn bị sửa hồ sơ:", error);
      setRecordModalError("Lỗi chuẩn bị dữ liệu. Không thể gửi.");
    }
  };

  // Handler chung cho nút "Lưu" (Không đổi)
  const handleSaveOrEdit = () => {
    if (modalMode === "CREATE") {
      handleCreateRecord();
    } else if (modalMode === "EDIT") {
      handleEditRecord();
    }
  };

  // ======================
  // Fetch hồ sơ theo app_id_get_data (VIEW/EDIT)
  // ======================
  const recordUrl = app_id_get_data
    ? MEDICAL_RECORD_API.GET_MEDICAL_RECORD_BY_APPOINTMENT_ID(app_id_get_data)
    : null;

  const {
    data: mrc,
    isLoading: isMrcLoading,
    error: mrcError,
  } = useDataByUrl({
    url: recordUrl, // hook enabled: !!url
    key: "get-medical-record-by-appointment-id", // key này dùng để invalidate
  });

  // Khi dữ liệu mrc về ở chế độ VIEW/EDIT, đổ vào form (Không đổi)
  useEffect(() => {
    if (!["VIEW", "EDIT"].includes(modalMode)) return;
    if (!mrc || isMrcLoading || mrcError) return;

    const apiRecord = Array.isArray(mrc?.data) ? mrc.data[0] : undefined;
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

  // Trạng thái đơn thuốc hiện tại (dùng cho bật/tắt edit) (Không đổi)
  const presStatusFromApi = Array.isArray(mrc?.data)
    ? mrc?.data?.[0]?.prescription?.status
    : undefined;
  const currentPresStatus =
    presStatusFromApi ||
    recordFormData?.prescription?.status ||
    selectedAptForRecord?.appointment?.medical_record?.prescription?.status ||
    undefined;

  const isEditLocked =
    modalMode === "EDIT" && currentPresStatus === "VERIFIED";

  // ======================
  //  Actions theo vai trò & trạng thái (Không đổi)
  // ======================
  const renderAppointmentActions = (item, statusInfo, badgeColor) => {
    const appointment = item.appointment;
    const appointmentId = appointment.appointment_id;
    const status = appointment.status;

    const record = appointment.medical_record || null;
    const recordPrescriptionStatus = record?.prescription?.status;
    const hasRecord = !!record;

    const roles = Array.isArray(typeAss) ? typeAss : [];
    const isNurseOnly = roles.length === 1 && roles[0] === "NURSE";
    const isReceptionistOnly = roles.length === 1 && roles[0] !== "NURSE";
    const hasBothRoles = roles.length >= 2;

    // Buttons Components (Không đổi)
    const ApproveBtn = () => (
      <button
        onClick={() => handleVerifyStatus(appointmentId, "APPROVE")}
        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
        title="Duyệt"
      >
        <CheckCircle size={16} />
      </button>
    );

    const CancelBtn = () => (
      <button
        onClick={() => handleVerifyStatus(appointmentId, "CANCELLED")}
        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        title="Từ chối"
      >
        <XCircle size={16} />
      </button>
    );

    const NoShowBtn = () => (
      <button
        onClick={() => handleVerifyStatus(appointmentId, "NO_SHOW")}
        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        title="Đánh dấu vắng mặt"
      >
        <XCircle size={16} />
      </button>
    );

    const CreateRecordBtn = () => (
      <button
        onClick={() => openRecordModal(item, "CREATE")}
        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
        title="Tạo bệnh án"
      >
        <FileEarmarkPlus size={16} />
      </button>
    );

    const ViewRecordBtn = () => (
      <button
        onClick={() => {
          setApp_id_get_data(appointmentId);
          openRecordModal(item, "VIEW");
        }}
        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
        title="Xem bệnh án"
      >
        <EyeFill size={16} />
      </button>
    );

    const EditRecordBtn = () => (
      <button
        onClick={() => {
          setApp_id_get_data(appointmentId);
          openRecordModal(item, "EDIT");
        }}
        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
        title="Sửa bệnh án"
        disabled={recordPrescriptionStatus === "VERIFIED"}
      >
        <PencilFill size={16} />
      </button>
    );

    const StatusBadge = () => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
      >
        {statusInfo?.label || "Trạng thái"}
      </span>
    );

    // Logic render (Không đổi)
    if (isNurseOnly) {
      if (status === "SCHEDULED") {
        return (
          <>
            <StatusBadge />
          </>
        );
      }
      if (status === "APPROVE") {
        return (
          <>
            <StatusBadge />
            {!hasRecord && <CreateRecordBtn />}
          </>
        );
      }
      if (status === "COMPLETED") {
        return (
          <>
            <StatusBadge />
            {recordPrescriptionStatus === "PENDING" && (
              <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                Đơn thuốc chờ duyệt
              </span>
            )}
            <ViewRecordBtn />
            <EditRecordBtn />
          </>
        );
      }
      if (status === "CANCELLED" || status === "NO_SHOW") {
        return (
          <>
            <StatusBadge />
          </>
        );
      }
    }

    if (isReceptionistOnly) {
      if (status === "SCHEDULED") {
        return (
          <>
            <StatusBadge />
            <ApproveBtn />
            <CancelBtn />
          </>
        );
      }
      if (status === "APPROVE") {
        return (
          <>
            <StatusBadge />
            <NoShowBtn />
          </>
        );
      }
      if (status === "COMPLETED") {
        return (
          <>
            <StatusBadge />
            {recordPrescriptionStatus === "PENDING" && (
              <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                Đơn thuốc chờ duyệt
              </span>
            )}
            <ViewRecordBtn />
          </>
        );
      }
      if (status === "CANCELLED" || status === "NO_SHOW") {
        return (
          <>
            <StatusBadge />
          </>
        );
      }
    }

    if (hasBothRoles) {
      if (status === "SCHEDULED") {
        return (
          <>
            <StatusBadge />
            <ApproveBtn />
            <CancelBtn />
          </>
        );
      }
      if (status === "APPROVE") {
        return (
          <>
            <StatusBadge />
            <NoShowBtn />
            {!hasRecord && <CreateRecordBtn />}
          </>
        );
      }
      if (status === "COMPLETED") {
        return (
          <>
            <StatusBadge />
            {recordPrescriptionStatus === "PENDING" && (
              <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                Đơn thuốc chờ duyệt
              </span>
            )}
            <ViewRecordBtn />
            <EditRecordBtn />
          </>
        );
      }
      if (status === "CANCELLED" || status === "NO_SHOW") {
        return (
          <>
            <StatusBadge />
          </>
        );
      }
    }

    return (
      <>
        <StatusBadge />
      </>
    );
  };

  // ======================
  // RETURN JSX (Không đổi phần lớn, chỉ đổi nút trong Modal)
  // ======================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="d-flex mb-3 justify-content-between flex-wrap items-center gap-4">
            {/* Date */}
            <div className="gap-2 pr-4">
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

            {/* Status filter */}
            <div className="gap-2 pr-4 flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Trạng thái:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="pl-2 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

          <div className="flex-1 flex flex-wrap items-center gap-2">
            {isLoading ? (
              <span className="text-gray-500 text-sm">Đang tải ca...</span>
            ) : slots.length > 0 ? (
              <>
                {slots.map((slot) => (
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
                    Ca: {formatTime(slot.start_time)} -{" "}
                    {formatTime(slot.end_time)}
                  </button>
                ))}
              </>
            ) : (
              <span className="text-gray-500 text-sm">
                Không có ca nào trong ngày này.
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Shift Header */}
            {selectedSlotInfo && (
              <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-700">
                    Ca: {formatTime(selectedSlotInfo.start_time)} -{" "}
                    {formatTime(selectedSlotInfo.end_time)}
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

                  // Màu badge
                  let badgeColor = "bg-gray-100 text-gray-700";
                  if (statusInfo.className === "status-scheduled")
                    badgeColor = "bg-blue-100 text-blue-700";
                  else if (statusInfo.className === "status-approved")
                    badgeColor = "bg-green-100 text-green-700";
                  else if (statusInfo.className === "status-completed")
                    badgeColor = "bg-indigo-100 text-indigo-700";
                  else if (
                    statusInfo.className === "status-cancelled" ||
                    statusInfo.className === "status-no-show"
                  )
                    badgeColor = "bg-red-100 text-red-700";

                  return (
                    <div
                      key={appointment.appointment_id}
                      className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm"
                    >
                      {/* Thông tin bệnh nhân */}
                      <div className="flex items-center gap-4 mb-2 sm:mb-0">
                        <Person className="text-blue-600" size={20} />
                        <div>
                          <p className="font-semibold">
                            {patient.patient_name || "Bệnh nhân ẩn"}
                          </p>
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

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {renderAppointmentActions(item, statusInfo, badgeColor)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Phân trang */}
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
                  {["VIEW", "EDIT"].includes(modalMode) && isMrcLoading && (
                    <div className="rounded-md bg-indigo-50 p-3 mb-3 text-sm text-indigo-700">
                      Đang tải hồ sơ bệnh án...
                    </div>
                  )}
                  {["VIEW", "EDIT"].includes(modalMode) && mrcError && (
                    <div className="rounded-md bg-red-50 p-3 mb-3 text-sm text-red-700">
                      Không thể tải hồ sơ bệnh án:{" "}
                      {mrcError?.message || "Lỗi không xác định"}
                    </div>
                  )}

                  {/* Chip trạng thái đơn thuốc nếu có */}
                  {!isMrcLoading &&
                    !mrcError &&
                    (() => {
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
                    {/* *** THAY ĐỔI 8: Cập nhật `disabled` cho nút Hủy *** */}
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                      onClick={closeRecordModal}
                      disabled={
                        createRecordMutation.isPending ||
                        editRecordMutation.isPending
                      }
                    >
                      {modalMode === "VIEW" ? "Đóng" : "Hủy"}
                    </button>

                    {/* Ẩn nút Lưu khi VIEW hoặc EDIT nhưng VERIFIED */}
                    {!(modalMode === "VIEW" || isEditLocked) && (
                      // *** THAY ĐỔI 9: Cập nhật `disabled` và text cho nút Lưu ***
                      <button
                        type="button"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400"
                        onClick={handleSaveOrEdit}
                        disabled={
                          createRecordMutation.isPending ||
                          editRecordMutation.isPending
                        }
                      >
                        {createRecordMutation.isPending ||
                        editRecordMutation.isPending
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