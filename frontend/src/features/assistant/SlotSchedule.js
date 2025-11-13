import { useState, useEffect, Fragment, useMemo } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Clock,
  People,
  Trash,
} from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import { SLOT_API } from "../../api/assistant/assistant.api";
import toast, { Toaster } from "react-hot-toast";
import { formatISOTime } from "../../utils/dateTimeUtils";

// --- Helpers cho Modal ---
const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);
// -----------------------------

const inputRingClasses =
  "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";
const inputDisabledClasses = "disabled:bg-gray-100 disabled:cursor-not-allowed";

// === Helper cho Modal Hàng Loạt ===
const getNextWeekDate = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 6);
  return date.toISOString().split("T")[0];
};

// === Sắp xếp lại thứ tự ngày theo yêu cầu (T2 -> CN) ===
const weekdays = [
  { id: 1, label: "T2" },
  { id: 2, label: "T3" },
  { id: 3, label: "T4" },
  { id: 4, label: "T5" },
  { id: 5, label: "T6" },
  { id: 6, label: "T7" },
  { id: 0, label: "CN" },
];
// ===========================================

const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SlotSchedule = () => {
  const assistantInfo = JSON.parse(
    sessionStorage.getItem("assistantInfo") || "{}"
  );
  const feeAmount = 500000;
  const note = "";

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [todayString] = useState(getLocalDate());

  const [Slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state (cho Add/Edit đơn lẻ)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [maxPatients, setMaxPatients] = useState(1);
  const [modalError, setModalError] = useState("");

  const [slotStatus, setSlotStatus] = useState("AVAILABLE");
  const [isTimeLocked, setIsTimeLocked] = useState(false);

  // === State cho Modal Hàng Loạt ===
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchSlots, setBatchSlots] = useState([]);
  const [batchWeekdays, setBatchWeekdays] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false,
  });
  const [batchStartDate, setBatchStartDate] = useState(getLocalDate());
  const [batchEndDate, setBatchEndDate] = useState(
    getNextWeekDate(getLocalDate())
  );
  const [batchLoading, setBatchLoading] = useState(false);

  const [batchError, setBatchError] = useState("");
  const [templateError, setTemplateError] = useState("");

  const [tempStartHour, setTempStartHour] = useState("08");
  const [tempStartMinute, setTempStartMinute] = useState("00");
  const [tempEndHour, setTempEndHour] = useState("09");
  const [tempEndMinute, setTempEndMinute] = useState("00");
  const [tempMax, setTempMax] = useState(1);

  const isPastDate = useMemo(() => {
    const selDate = new Date(selectedDate);
    const todDate = new Date(todayString);
    selDate.setHours(0, 0, 0, 0);
    todDate.setHours(0, 0, 0, 0);
    return selDate < todDate;
  }, [selectedDate, todayString]);

  // Lấy danh sách slot
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await SLOT_API.getSlotsByDoctor(selectedDate);
      const sortedSlots = (res.data?.data || []).sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
      setSlots(sortedSlots);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách ca làm việc.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line
  }, [selectedDate]);

  // === (Validation useEffect cho modal ĐƠN LẺ - giữ nguyên) ===
  useEffect(() => {
    if (!modalOpen) {
      setModalError("");
      return;
    }
    if (isTimeLocked) {
      setModalError("");
      return;
    }
    const finalSlotStart = `${startHour}:${startMinute}`;
    const finalSlotEnd = `${endHour}:${endMinute}`;
    if (finalSlotStart >= finalSlotEnd) {
      setModalError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }
    const now = new Date();
    const currentTodayString = getLocalDate();
    if (selectedDate === currentTodayString) {
      const selectedStartTime = new Date(
        `${selectedDate}T${startHour}:${startMinute}:00`
      );
      if (selectedStartTime < now) {
        setModalError("Không thể tạo ca vào thời điểm đã qua trong ngày.");
        return;
      }
    }
    const otherSlots = Slots.filter((Slot) => Slot._id !== editingSlot?._id);
    let overlappingSlot = null;
    for (const existingSlot of otherSlots) {
      const existingStart = formatISOTime(existingSlot.start_time);
      const existingEnd = formatISOTime(existingSlot.end_time);
      if (finalSlotStart < existingEnd && finalSlotEnd > existingStart) {
        overlappingSlot = existingSlot;
        break;
      }
    }
    if (overlappingSlot) {
      const SlotIndex = Slots.findIndex((s) => s._id === overlappingSlot._id);
      setModalError(
        `Khung giờ này bị trùng với Ca #${SlotIndex + 1} (${formatISOTime(
          overlappingSlot.start_time
        )} - ${formatISOTime(overlappingSlot.end_time)}).`
      );
      return;
    }
    const [year, month, day] = selectedDate.split("-").map(Number);
    const startDateTime = new Date(
      Date.UTC(year, month - 1, day, startHour, startMinute, 0)
    );
    const startDateTimeISO = startDateTime.toISOString();
    const isDuplicate = otherSlots.some(
      (slot) => slot.start_time === startDateTimeISO
    );
    if (isDuplicate) {
      setModalError("Đã có ca làm việc trùng giờ bắt đầu này!");
      return;
    }
    setModalError("");
  }, [
    startHour,
    startMinute,
    endHour,
    endMinute,
    editingSlot,
    Slots,
    modalOpen,
    selectedDate,
    isTimeLocked,
  ]);
  // ===================================

  // === ⭐️ CẬP NHẬT: Validation real-time cho form MẪU (Verify Giờ) ===
  useEffect(() => {
    if (!isBatchModalOpen) {
      setTemplateError(""); // Reset lỗi khi đóng modal
      return;
    }

    const finalTempStart = `${tempStartHour}:${tempStartMinute}`;
    const finalTempEnd = `${tempEndHour}:${tempEndMinute}`;

    // 1. Check giờ kết thúc vs bắt đầu
    if (finalTempStart >= finalTempEnd) {
      setTemplateError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    // 2. Check trùng lặp với các ca đã thêm (trong list mẫu)
    const isOverlappingTemplate = batchSlots.some(
      (slot) => finalTempStart < slot.endTime && finalTempEnd > slot.startTime
    );
    if (isOverlappingTemplate) {
      setTemplateError("Khung giờ mẫu bị trùng lặp với danh sách.");
      return;
    }

    // 3. Check quá khứ của HÔM NAY
    const isStartDateToday = batchStartDate === todayString;
    if (isStartDateToday) {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;

      if (finalTempStart < currentTime) {
        setTemplateError("Không thể thêm ca trong quá khứ của ngày hôm nay.");
        return;
      }
    }

    // 4. ⭐️ SỬA LỖI "MÙ": Check trùng lặp với các slot ĐÃ TỒN TẠI
    // (Chỉ check nếu ngày bắt đầu = ngày đang xem)
    const isStartDateSelectedDate = batchStartDate === selectedDate;
    if (isStartDateSelectedDate) {
      const isOverlappingExisting = Slots.some(existing => {
        const existingStart = formatISOTime(existing.start_time);
        const existingEnd = formatISOTime(existing.end_time);
        // Check overlap
        return finalTempStart < existingEnd && finalTempEnd > existingStart;
      });

      if (isOverlappingExisting) {
        setTemplateError("Trùng với ca đã có trong ngày đang xem.");
        return;
      }
    }

    // Nếu không có lỗi
    setTemplateError("");
  }, [
    tempStartHour,
    tempStartMinute,
    tempEndHour,
    tempEndMinute,
    batchSlots,
    isBatchModalOpen,
    batchStartDate,
    todayString,
    selectedDate, // <-- Thêm vào dependency
    Slots,        // <-- Thêm vào dependency
  ]);
  // ==========================================================

  // === Validation real-time cho form CHÍNH (Verify Ngày) ===
  useEffect(() => {
    if (!isBatchModalOpen) {
      setBatchError("");
      return;
    }

    const startDate = new Date(batchStartDate + 'T00:00:00');
    const endDate = new Date(batchEndDate + 'T00:00:00');
    const todayDate = new Date(todayString + 'T00:00:00'); // Dùng todayString

    // Rule 1: Ngày bắt đầu không thể trong quá khứ
    if (startDate < todayDate) {
      setBatchError("Ngày bắt đầu không thể là một ngày trong quá khứ.");
      return;
    }

    // Rule 2: Ngày kết thúc phải >= ngày bắt đầu
    if (endDate < startDate) {
      setBatchError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
      return;
    }

    // All good
    setBatchError("");
  }, [batchStartDate, batchEndDate, isBatchModalOpen, todayString]); // Thêm todayString
  // =================================================================

  // === (Hàm openAddModal và openEditModal giữ nguyên) ===
  const openAddModal = () => {
    setEditingSlot(null);
    setStartHour("08");
    setStartMinute("00");
    setEndHour("09");
    setEndMinute("00");
    setMaxPatients(1);
    setSlotStatus("AVAILABLE");
    setIsTimeLocked(false);
    setModalError("");
    setModalOpen(true);
  };
  const openEditModal = (Slot) => {
    setEditingSlot(Slot);
    const now = new Date();
    const slotStartTime = new Date(Slot.start_time);
    const isLocked = slotStartTime < now;
    setIsTimeLocked(isLocked);
    setSlotStatus(Slot.status || "AVAILABLE");
    const dateStart = new Date(Slot.start_time);
    const dateEnd = new Date(Slot.end_time);

    setStartHour(dateStart.getUTCHours().toString().padStart(2, "0"));
    setStartMinute(dateStart.getUTCMinutes().toString().padStart(2, "0"));
    setEndHour(dateEnd.getUTCHours().toString().padStart(2, "0"));
    setEndMinute(dateEnd.getUTCMinutes().toString().padStart(2, "0"));

    setMaxPatients(Slot.max_patients || 1);
    setModalError("");
    setModalOpen(true);
  };
  // =======================================

  // === (Logic lưu slot ĐƠN LẺ giữ nguyên) ===
  const handleSaveSlot = async () => {
    if (modalError) {
      toast.error("Vui lòng sửa lỗi trước khi lưu.");
      return;
    }

    const dateObj = new Date(selectedDate);

    const startDateTime =
      isTimeLocked && editingSlot
        ? editingSlot.start_time
        : new Date(
          Date.UTC(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            startHour,
            startMinute,
            0
          )
        ).toISOString();

    const endDateTime =
      isTimeLocked && editingSlot
        ? editingSlot.end_time
        : new Date(
          Date.UTC(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            endHour,
            endMinute,
            0
          )
        ).toISOString();

    const payload = {
      clinic_id: assistantInfo.clinic_id,
      start_time: startDateTime,
      end_time: endDateTime,
      status: slotStatus,
      fee_amount: feeAmount,
      max_patients: maxPatients,
      booked_count: editingSlot ? editingSlot.booked_count : 0,
      note: note,
      created_by: assistantInfo.id,
    };

    try {
      if (editingSlot) {
        const response = await SLOT_API.updateSlotById(
          editingSlot._id,
          payload
        );
        toast.success("Cập nhật ca thành công!", response?.data);
      } else {
        const response = await SLOT_API.createSlotByDoctor(payload);
        toast.success("Thêm ca mới thành công! ", response?.data);
      }
      setModalOpen(false);
      await fetchSlots();
    } catch (error) {
      console.error("--- LỖI KHI LƯU ---", error);
      toast.error("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");
      await fetchSlots();
    }
  };
  // =================================================

  // === Cập nhật hàm logic cho modal hàng loạt ===
  const handleAddTemplateSlot = () => {
    if (templateError) {
      // Lỗi đã được set bởi useEffect
      return;
    }

    const finalTempStart = `${tempStartHour}:${tempStartMinute}`;
    const finalTempEnd = `${tempEndHour}:${tempEndMinute}`;

    setBatchSlots([
      ...batchSlots,
      {
        id: Date.now(),
        startTime: finalTempStart,
        endTime: finalTempEnd,
        maxPatients: tempMax,
      },
    ]);

    // Tự động gợi ý ca tiếp theo
    setTempStartHour(tempEndHour);
    setTempStartMinute(tempEndMinute);
    const nextHour = (parseInt(tempEndHour, 10) + 1).toString().padStart(2, "0");
    setTempEndHour(nextHour === "24" ? "00" : nextHour);
    setTempEndMinute(tempEndMinute);
  };

  const handleRemoveTemplateSlot = (id) => {
    setBatchSlots(batchSlots.filter((slot) => slot.id !== id));
  };

  const handleToggleWeekday = (dayId) => {
    setBatchWeekdays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // === CẬP NHẬT: handleBatchCreate (Thêm kiểm tra "quá khứ") ===
  const handleBatchCreate = async () => {
    // Lỗi ngày (batchError) đã được useEffect xử lý và vô hiệu hóa nút
    setBatchError(""); // Xóa lỗi cũ (nếu có)
    setTemplateError("");
    setBatchLoading(true);

    const payloads = [];
    const { clinic_id, id: created_by } = assistantInfo;
    const now = new Date(); // Lấy thời gian HIỆN TẠI

    // 1. Validation (chỉ cần check list mẫu)
    if (batchSlots.length === 0) {
      setBatchError("Bạn phải thêm ít nhất 1 khung giờ mẫu.");
      setBatchLoading(false);
      return;
    }

    // 2. Lặp qua các ngày
    let currentDate = new Date(batchStartDate + "T00:00:00");
    const finalDate = new Date(batchEndDate + "T00:00:00");

    let skippedConflictCount = 0; // Đếm số ca bị trùng

    while (currentDate <= finalDate) {
      const dayOfWeek = currentDate.getDay();

      // ⭐️ KIỂM TRA MỚI: Chỉ check API nếu ngày này được chọn
      let existingSlotsForDay = [];
      if (batchWeekdays[dayOfWeek]) {
        // Tải các slot đã có của ngày này để kiểm tra
        // (Đây là giải pháp tối ưu, nhưng nếu API ko hỗ trợ,
        // chúng ta đành chịu lỗi "failed" từ API)

        // GIẢ ĐỊNH: Chúng ta chỉ có thể check với `Slots` (ngày đang xem)
        const isCurrentDaySelected = currentDate.toISOString().split("T")[0] === selectedDate;
        existingSlotsForDay = isCurrentDaySelected ? Slots : [];

        for (const slot of batchSlots) {
          const [startH, startM] = slot.startTime.split(":");
          const [endH, endM] = slot.endTime.split(":");

          const startDateTime = new Date(
            Date.UTC(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              parseInt(startH),
              parseInt(startM),
              0
            )
          );

          // CHECK QUÁ KHỨ: Nếu giờ bắt đầu < thời gian hiện tại -> BỎ QUA
          if (startDateTime < now) {
            continue;
          }

          // ⭐️ CHECK TRÙNG LẶP (cho ngày đang xem)
          const finalTempStart = `${startH}:${startM}`;
          const finalTempEnd = `${endH}:${endM}`;
          let conflict = false;
          if (isCurrentDaySelected) {
            conflict = existingSlotsForDay.some(existing => {
              const existingStart = formatISOTime(existing.start_time);
              const existingEnd = formatISOTime(existing.end_time);
              return finalTempStart < existingEnd && finalTempEnd > existingStart;
            });
          }

          if (conflict) {
            skippedConflictCount++;
            continue; // Bỏ qua ca này
          }
          // ⭐️ HẾT CHECK TRÙNG LẶP

          const endDateTime = new Date(
            Date.UTC(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              parseInt(endH),
              parseInt(endM),
              0
            )
          );

          payloads.push({
            clinic_id,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            status: "AVAILABLE",
            fee_amount: feeAmount,
            max_patients: slot.maxPatients,
            booked_count: 0,
            note: note,
            created_by: created_by,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (payloads.length === 0) {
      setBatchError(
        "Không có ca hợp lệ nào được tạo (kiểm tra lại ngày hoặc các ca đã chọn có thể đã ở trong quá khứ/bị trùng)."
      );
      setBatchLoading(false);
      return;
    }

    toast.loading("Đang tạo lịch hàng loạt, vui lòng chờ...");

    try {
      const promises = payloads.map((payload) =>
        SLOT_API.createSlotByDoctor(payload)
      );
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      // Lỗi từ API (ví dụ: trùng lặp ở ngày *không* được chọn xem)
      const failedCount = results.filter(
        (r) => r.status === "rejected"
      ).length;

      toast.dismiss();

      let successMsg = "";
      if (successCount > 0) {
        successMsg = `Tạo thành công ${successCount} ca.`;
      }

      let errorMsg = "";
      if (failedCount > 0) {
        errorMsg = `Tạo thất bại ${failedCount} ca (lỗi API/trùng lặp).`;
      }
      // Thêm thông báo về các ca bị bỏ qua (do logic mới)
      if (skippedConflictCount > 0) {
        errorMsg += ` Đã bỏ qua ${skippedConflictCount} ca (do trùng với lịch ngày đang xem).`
      }

      if (successMsg) toast.success(successMsg);
      if (errorMsg) toast.error(errorMsg, { duration: 5000 }); // Cho toast lỗi hiển thị lâu hơn

      setBatchLoading(false);
      setIsBatchModalOpen(false);
      setBatchSlots([]);
      fetchSlots(); // Tải lại ngày hiện tại
    } catch (error) {
      toast.dismiss();
      console.error("Lỗi khi tạo lịch hàng loạt:", error);
      toast.error("Đã xảy ra lỗi chung. Vui lòng thử lại.");
      setBatchLoading(false);
    }
  };

  // ===========================================

  // === (Phần còn lại của logic giữ nguyên) ===
  const getSlotAvailability = (Slot) => {
    const isAvailable = Slot.status === "AVAILABLE";
    const hasSpace = (Slot.booked_count || 0) < Slot.max_patients;
    return isAvailable && hasSpace;
  };

  const filteredSlots = useMemo(() => {
    if (statusFilter === "all") return Slots;
    const isFilteringForAvailable = statusFilter === "available";
    return Slots.filter((Slot) => {
      const isAvailable = getSlotAvailability(Slot);
      return isAvailable === isFilteringForAvailable;
    });
  }, [Slots, statusFilter]);

  // === (Phần JSX return đã được CẬP NHẬT) ===
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <Calendar className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý ca làm việc
            </h1>
            <p className="text-gray-500 mt-1">
              Thêm, sửa, xóa ca làm việc của bác sĩ
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Date Picker */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="date-picker"
                  className="text-sm font-medium text-gray-700"
                >
                  Ngày:
                </label>
                <input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`${inputRingClasses} py-2`}
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="status-filter"
                  className="text-sm font-medium text-gray-700"
                >
                  Trạng thái:
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${inputRingClasses} py-2 pl-3 pr-8`}
                >
                  <option value="all">Tất cả</option>
                  <option value="available">Available (Còn chỗ)</option>
                  <option value="unavailable">
                    Unavailable (Hết chỗ/Ngưng)
                  </option>
                </select>
              </div>
            </div>

            {/* === CẬP NHẬT: Nhóm Button === */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm font-medium
                  bg-green-600 hover:bg-green-700`}
              >
                <Calendar size={20} /> Tạo lịch hàng loạt
              </button>

              <button
                onClick={openAddModal}
                disabled={isPastDate}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm font-medium
                ${isPastDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                <Plus size={20} /> Thêm ca
              </button>
            </div>
          </div>
          {/* ============================== */}

          {isPastDate && (
            <p className="text-sm text-amber-700 font-medium mt-4 pt-4 border-t border-gray-200">
              Bạn đang xem một ngày trong quá khứ. Không thể thêm hoặc sửa ca.
            </p>
          )}
        </div>

        {/* Content / Danh sách ca (Slot) */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-sm p-10">
            <p className="text-gray-600 font-medium">
              {Slots.length === 0
                ? "Chưa có ca nào trong ngày này"
                : "Không tìm thấy ca nào phù hợp với bộ lọc"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSlots.map((Slot, index) => {
              let statusComponent;
              const isFullyBooked =
                (Slot.booked_count || 0) >= Slot.max_patients;
              const isServiceAvailable = Slot.status === "AVAILABLE";

              if (!isServiceAvailable) {
                statusComponent = (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-700">
                    <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                    Unavailable
                  </span>
                );
              } else if (isFullyBooked) {
                statusComponent = (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    Full
                  </span>
                );
              } else {
                statusComponent = (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Available
                  </span>
                );
              }

              const statusBorderColor = !isServiceAvailable
                ? "border-l-gray-400"
                : isFullyBooked
                  ? "border-l-red-400"
                  : "border-l-green-500";

              return (
                <div
                  key={Slot._id}
                  className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${statusBorderColor} transition-all hover:shadow-md flex flex-col`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xl font-bold text-gray-800">
                      Ca #{index + 1}
                    </p>
                    {statusComponent}
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-700 mb-4">
                    <Clock size={20} className="text-blue-600" />
                    <span className="font-semibold text-2xl text-gray-900 tracking-tight">
                      {`${new Date(Slot.start_time)
                        .getUTCHours()
                        .toString()
                        .padStart(2, "0")}:${new Date(Slot.start_time)
                          .getUTCMinutes()
                          .toString()
                          .padStart(2, "0")}`}{" "}
                      -{" "}
                      {`${new Date(Slot.end_time)
                        .getUTCHours()
                        .toString()
                        .padStart(2, "0")}:${new Date(Slot.end_time)
                          .getUTCMinutes()
                          .toString()
                          .padStart(2, "0")}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <People size={20} className="text-blue-600" />
                      <span className="text-base font-medium">
                        Đã đăng ký:{" "}
                        <span className="font-bold text-gray-900">
                          {Slot.booked_count || 0}/{Slot.max_patients}
                        </span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(Slot)}
                        disabled={isPastDate}
                        className={`flex items-center gap-1.5 px-4 py-2 text-white rounded-lg transition-colors text-sm font-semibold shadow
                          ${isPastDate
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600"
                          }`}
                      >
                        <Pencil size={16} /> Sửa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Add/Edit ĐƠN LẺ */}
        <Transition appear show={modalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setModalOpen(false)}
          >
            {/* ... (Code modal đơn lẻ giữ nguyên, không thay đổi) ... */}
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-5">
                      {editingSlot ? "Sửa ca làm việc" : "Thêm ca làm việc"}
                    </Dialog.Title>

                    {isTimeLocked && (
                      <div className="rounded-md bg-amber-50 p-4 mb-5">
                        <p className="text-sm font-medium text-amber-800">
                          Ca này đã bắt đầu. Bạn không thể sửa đổi thời gian.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">
                          Giờ bắt đầu
                        </label>
                        <div className="flex items-center gap-3">
                          <select
                            value={startHour}
                            onChange={(e) => setStartHour(e.target.value)}
                            className={`${inputRingClasses} ${inputDisabledClasses}`}
                            disabled={isTimeLocked}
                          >
                            {hours.map((h) => (
                              <option key={`start-h-${h}`} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="font-semibold text-gray-500">:</span>
                          <select
                            value={startMinute}
                            onChange={(e) => setStartMinute(e.target.value)}
                            className={`${inputRingClasses} ${inputDisabledClasses}`}
                            disabled={isTimeLocked}
                          >
                            {minutes.map((m) => (
                              <option key={`start-m-${m}`} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">
                          Giờ kết thúc
                        </label>
                        <div className="flex items-center gap-3">
                          <select
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
                            className={`${inputRingClasses} ${inputDisabledClasses}`}
                            disabled={isTimeLocked}
                          >
                            {hours.map((h) => (
                              <option key={`end-h-${h}`} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="font-semibold text-gray-500">:</span>
                          <select
                            value={endMinute}
                            onChange={(e) => setEndMinute(e.target.value)}
                            className={`${inputRingClasses} ${inputDisabledClasses}`}
                            disabled={isTimeLocked}
                          >
                            {minutes.map((m) => (
                              <option key={`end-m-${m}`} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Trạng thái */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">
                          Trạng thái
                        </label>
                        <select
                          value={slotStatus}
                          onChange={(e) => setSlotStatus(e.target.value)}
                          className={`${inputRingClasses} ${inputDisabledClasses}`}
                        >
                          <option value="AVAILABLE">Available (Cho đặt)</option>
                          <option value="UNAVAILABLE">
                            Unavailable (Ngưng)
                          </option>
                        </select>
                      </div>

                      {/* Max Patients */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">
                          Số bệnh nhân tối đa
                        </label>
                        <input
                          type="number"
                          value={maxPatients}
                          min={1}
                          onChange={(e) =>
                            setMaxPatients(
                              Number(e.target.value) > 0
                                ? Number(e.target.value)
                                : 1
                            )
                          }
                          className={inputRingClasses}
                        />
                      </div>
                    </div>

                    {modalError && (
                      <div className="rounded-md bg-red-50 p-4 mt-5">
                        <p className="text-sm font-medium text-red-800">
                          {modalError}
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                        onClick={() => setModalOpen(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400"
                        onClick={handleSaveSlot}
                        disabled={!!modalError}
                      >
                        {editingSlot ? "Lưu thay đổi" : "Thêm ca"}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* === ⭐️ MODAL HÀNG LOẠT (Đã cập nhật Verify Giờ + Ngày + Trùng lặp) === */}
        <Transition appear show={isBatchModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsBatchModalOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-6 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-10 text-left align-middle shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8 border-b pb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow">
                        <Calendar className="text-white" size={28} />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold text-gray-900">
                          Tạo lịch làm việc hàng loạt
                        </Dialog.Title>
                        <p className="text-gray-500 text-sm mt-1">
                          Thiết lập nhanh các ca làm việc cho nhiều ngày trong
                          tuần
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* --- Cột trái: Khung giờ mẫu --- */}
                      <div className="p-6 bg-gray-50 rounded-2xl ring-1 ring-gray-200 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          1️⃣ Tạo khung giờ mẫu
                        </h3>

                        {/* Form thêm mẫu */}
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Bắt đầu */}
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Bắt đầu
                              </label>
                              <div className="flex items-center gap-2 mt-1">
                                <select
                                  value={tempStartHour}
                                  onChange={(e) =>
                                    setTempStartHour(e.target.value)
                                  }
                                  className={inputRingClasses}
                                >
                                  {hours.map((h) => (
                                    <option key={`start-h-${h}`} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                <span className="font-semibold text-gray-500">
                                  :
                                </span>
                                <select
                                  value={tempStartMinute}
                                  onChange={(e) =>
                                    setTempStartMinute(e.target.value)
                                  }
                                  className={inputRingClasses}
                                >
                                  {minutes.map((m) => (
                                    <option key={`start-m-${m}`} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {/* Kết thúc */}
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Kết thúc
                              </label>
                              <div className="flex items-center gap-2 mt-1">
                                <select
                                  value={tempEndHour}
                                  onChange={(e) =>
                                    setTempEndHour(e.target.value)
                                  }
                                  className={inputRingClasses}
                                >
                                  {hours.map((h) => (
                                    <option key={`end-h-${h}`} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                <span className="font-semibold text-gray-500">
                                  :
                                </span>
                                <select
                                  value={tempEndMinute}
                                  onChange={(e) =>
                                    setTempEndMinute(e.target.value)
                                  }
                                  className={inputRingClasses}
                                >
                                  {minutes.map((m) => (
                                    <option key={`end-m-${m}`} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Bệnh nhân tối đa
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={tempMax}
                              onChange={(e) =>
                                setTempMax(Math.max(1, Number(e.target.value)))
                              }
                              className={inputRingClasses}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddTemplateSlot}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={!!templateError} // Vô hiệu hóa nếu có lỗi giờ
                          >
                            + Thêm khung giờ
                          </button>

                          {templateError && (
                            <p className="text-sm text-red-600 font-medium text-center -mt-2">
                              {templateError}
                            </p>
                          )}
                        </div>

                        {/* Danh sách khung giờ */}
                        <div className="mt-5 space-y-2 overflow-y-auto max-h-48 pr-2">
                          {batchSlots.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center">
                              Chưa có khung giờ nào
                            </p>
                          ) : (
                            batchSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex justify-between items-center bg-white rounded-md shadow-sm p-3 ring-1 ring-gray-200 hover:shadow-md transition"
                              >
                                <div>
                                  <span className="font-semibold text-gray-800">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span className="text-gray-500 text-sm ml-2">
                                    ({slot.maxPatients} BN)
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveTemplateSlot(slot.id)
                                  }
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* --- Cột phải: Áp dụng --- */}
                      <div className="p-6 bg-gray-50 rounded-2xl ring-1 ring-gray-200 flex flex-col justify-between">
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-800">
                            2️⃣ Áp dụng khung giờ
                          </h3>

                          {/* Ngày trong tuần */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chọn các ngày trong tuần
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {weekdays.map((day) => (
                                <button
                                  key={day.id}
                                  onClick={() => handleToggleWeekday(day.id)}
                                  className={`px-4 py-2 text-sm rounded-md border font-medium transition-all ${batchWeekdays[day.id]
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Khoảng ngày */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Khoảng thời gian áp dụng
                            </label>
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                              <input
                                type="date"
                                value={batchStartDate}
                                onChange={(e) =>
                                  setBatchStartDate(e.target.value)
                                }
                                className={inputRingClasses}
                              />
                              <span className="text-gray-500 font-semibold">
                                →
                              </span>
                              <input
                                type="date"
                                value={batchEndDate}
                                onChange={(e) =>
                                  setBatchEndDate(e.target.value)
                                }
                                className={inputRingClasses}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ⭐️ HIỂN THỊ LỖI NGÀY (NẾU CÓ) */}
                        {batchError && (
                          <div className="mt-6 rounded-md bg-red-50 p-3">
                            <p className="text-sm text-red-800">{batchError}</p>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                          <button
                            type="button"
                            className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-gray-300 shadow-sm"
                            onClick={() => setIsBatchModalOpen(false)}
                            disabled={batchLoading}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleBatchCreate}
                            // ⭐️ VÔ HIỆU HÓA NÚT NẾU CÓ LỖI NGÀY
                            disabled={batchLoading || !!batchError}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {batchLoading
                              ? "Đang xử lý..."
                              : "Tạo lịch hàng loạt"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
        {/* =========================================== */}
      </div>
    </div>
  );
};

export default SlotSchedule;