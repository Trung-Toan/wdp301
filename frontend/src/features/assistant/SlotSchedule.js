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
import toast, { Toaster } from "react-hot-toast";

import { SLOT_API } from "../../api/assistant/assistant.api";
import { formatISOTime } from "../../utils/dateTimeUtils";

// --- Helpers chung ---
const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

const inputRingClasses =
  "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";
const inputDisabledClasses = "disabled:bg-gray-100 disabled:cursor-not-allowed";

const getNextWeekDate = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 6);
  return date.toISOString().split("T")[0];
};

const weekdays = [
  { id: 1, label: "T2" },
  { id: 2, label: "T3" },
  { id: 3, label: "T4" },
  { id: 4, label: "T5" },
  { id: 5, label: "T6" },
  { id: 6, label: "T7" },
  { id: 0, label: "CN" },
];

const getLocalDate = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = (today.getMonth() + 1).toString().padStart(2, "0");
  const d = today.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
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

  // Modal đơn lẻ
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [maxPatients, setMaxPatients] = useState(1);
  const [slotStatus, setSlotStatus] = useState("AVAILABLE");
  const [isTimeLocked, setIsTimeLocked] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal hàng loạt
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchSlots, setBatchSlots] = useState([]);
  const [batchWeekdays, setBatchWeekdays] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: false,
    0: false,
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

  // Ngày quá khứ?
  const isPastDate = useMemo(() => {
    const sel = new Date(selectedDate);
    const tod = new Date(todayString);
    sel.setHours(0, 0, 0, 0);
    tod.setHours(0, 0, 0, 0);
    return sel < tod;
  }, [selectedDate, todayString]);

  // Fetch Slots
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await SLOT_API.getSlotsByDoctor(selectedDate);
      const sorted = (res.data?.data || []).sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
      setSlots(sorted);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Validation modal ĐƠN LẺ
  useEffect(() => {
    if (!modalOpen) {
      setModalError("");
      return;
    }
    if (isTimeLocked) {
      setModalError("");
      return;
    }

    const finalStart = `${startHour}:${startMinute}`;
    const finalEnd = `${endHour}:${endMinute}`;

    if (finalStart >= finalEnd) {
      setModalError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    const now = new Date();
    const currentToday = getLocalDate();
    if (selectedDate === currentToday) {
      const selectedStart = new Date(`${selectedDate}T${finalStart}:00`);
      if (selectedStart < now) {
        setModalError("Không thể tạo ca vào thời điểm đã qua trong ngày.");
        return;
      }
    }

    const others = Slots.filter((s) => s._id !== editingSlot?._id);
    let overlapped = null;
    for (const ex of others) {
      const exStart = formatISOTime(ex.start_time);
      const exEnd = formatISOTime(ex.end_time);
      if (finalStart < exEnd && finalEnd > exStart) {
        overlapped = ex;
        break;
      }
    }
    if (overlapped) {
      const idx = Slots.findIndex((s) => s._id === overlapped._id);
      setModalError(
        `Khung giờ này bị trùng với Ca #${idx + 1} (${formatISOTime(
          overlapped.start_time
        )} - ${formatISOTime(overlapped.end_time)}).`
      );
      return;
    }

    const [y, m, d] = selectedDate.split("-").map(Number);
    const startDateTime = new Date(Date.UTC(y, m - 1, d, +startHour, +startMinute, 0));
    const startISO = startDateTime.toISOString();
    const isDup = others.some((s) => s.start_time === startISO);
    if (isDup) {
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

  // Validation template (giờ) cho modal HÀNG LOẠT
  useEffect(() => {
    if (!isBatchModalOpen) {
      setTemplateError("");
      return;
    }

    const finalTempStart = `${tempStartHour}:${tempStartMinute}`;
    const finalTempEnd = `${tempEndHour}:${tempEndMinute}`;

    if (finalTempStart >= finalTempEnd) {
      setTemplateError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    // Trùng trong DS mẫu
    const overlapTemplate = batchSlots.some(
      (s) => finalTempStart < s.endTime && finalTempEnd > s.startTime
    );
    if (overlapTemplate) {
      setTemplateError("Khung giờ mẫu bị trùng lặp với danh sách.");
      return;
    }

    // Quá khứ của hôm nay
    const isStartToday = batchStartDate === todayString;
    if (isStartToday) {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      if (finalTempStart < currentTime) {
        setTemplateError("Không thể thêm ca trong quá khứ của ngày hôm nay.");
        return;
      }
    }

    // Trùng với slot đã tồn tại (nếu áp dụng ngay chính ngày đang xem)
    const isStartSelected = batchStartDate === selectedDate;
    if (isStartSelected) {
      const overlapExisting = Slots.some((ex) => {
        const exStart = formatISOTime(ex.start_time);
        const exEnd = formatISOTime(ex.end_time);
        return finalTempStart < exEnd && finalTempEnd > exStart;
      });
      if (overlapExisting) {
        setTemplateError("Trùng với ca đã có trong ngày đang xem.");
        return;
      }
    }

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
    selectedDate,
    Slots,
  ]);

  // Validation ngày cho modal HÀNG LOẠT
  useEffect(() => {
    if (!isBatchModalOpen) {
      setBatchError("");
      return;
    }

    const start = new Date(batchStartDate + "T00:00:00");
    const end = new Date(batchEndDate + "T00:00:00");
    const today = new Date(todayString + "T00:00:00");

    if (start < today) {
      setBatchError("Ngày bắt đầu không thể là một ngày trong quá khứ.");
      return;
    }
    if (end < start) {
      setBatchError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
      return;
    }
    setBatchError("");
  }, [batchStartDate, batchEndDate, isBatchModalOpen, todayString]);

  // Open modal đơn lẻ (thêm)
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

  // Open modal đơn lẻ (sửa)
  const openEditModal = (Slot) => {
    setEditingSlot(Slot);
    const now = new Date();
    const slotStart = new Date(Slot.start_time);
    const locked = slotStart < now;

    setIsTimeLocked(locked);
    setSlotStatus(Slot.status || "AVAILABLE");

    const ds = new Date(Slot.start_time);
    const de = new Date(Slot.end_time);

    setStartHour(ds.getUTCHours().toString().padStart(2, "0"));
    setStartMinute(ds.getUTCMinutes().toString().padStart(2, "0"));
    setEndHour(de.getUTCHours().toString().padStart(2, "0"));
    setEndMinute(de.getUTCMinutes().toString().padStart(2, "0"));

    setMaxPatients(Slot.max_patients || 1);
    setModalError("");
    setModalOpen(true);
  };

  // Save modal đơn lẻ
  const handleSaveSlot = async () => {
    if (modalError) {
      toast.error("Vui lòng sửa lỗi trước khi lưu.");
      return;
    }

    const dateObj = new Date(selectedDate);
    const startISO =
      isTimeLocked && editingSlot
        ? editingSlot.start_time
        : new Date(
            Date.UTC(
              dateObj.getFullYear(),
              dateObj.getMonth(),
              dateObj.getDate(),
              +startHour,
              +startMinute,
              0
            )
          ).toISOString();

    const endISO =
      isTimeLocked && editingSlot
        ? editingSlot.end_time
        : new Date(
            Date.UTC(
              dateObj.getFullYear(),
              dateObj.getMonth(),
              dateObj.getDate(),
              +endHour,
              +endMinute,
              0
            )
          ).toISOString();

    const payload = {
      clinic_id: assistantInfo.clinic_id,
      start_time: startISO,
      end_time: endISO,
      status: slotStatus,
      fee_amount: feeAmount,
      max_patients: maxPatients,
      booked_count: editingSlot ? editingSlot.booked_count : 0,
      note: note,
      created_by: assistantInfo.id,
    };

    try {
      if (editingSlot) {
        await SLOT_API.updateSlotById(editingSlot._id, payload);
        toast.success("Cập nhật ca thành công!");
      } else {
        await SLOT_API.createSlotByDoctor(payload);
        toast.success("Thêm ca mới thành công!");
      }
      setModalOpen(false);
      await fetchSlots();
    } catch (error) {
      console.error("--- LỖI KHI LƯU ---", error);
      toast.error("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");
      await fetchSlots();
    }
  };

  // Template list (thêm 1 khung giờ mẫu)
  const handleAddTemplateSlot = () => {
    if (templateError) return;

    const s = `${tempStartHour}:${tempStartMinute}`;
    const e = `${tempEndHour}:${tempEndMinute}`;

    setBatchSlots((prev) => [
      ...prev,
      {
        id: Date.now(),
        startTime: s,
        endTime: e,
        maxPatients: tempMax,
      },
    ]);

    // Gợi ý giờ kế tiếp
    setTempStartHour(tempEndHour);
    setTempStartMinute(tempEndMinute);
    const nextHour = (parseInt(tempEndHour, 10) + 1).toString().padStart(2, "0");
    setTempEndHour(nextHour === "24" ? "00" : nextHour);
    setTempEndMinute(tempEndMinute);
  };

  const handleRemoveTemplateSlot = (id) => {
    setBatchSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleWeekday = (dayId) => {
    setBatchWeekdays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // Tạo lịch hàng loạt
  const handleBatchCreate = async () => {
    setBatchError("");
    setTemplateError("");
    setBatchLoading(true);

    const payloads = [];
    const { clinic_id, id: created_by } = assistantInfo;
    const now = new Date();

    if (batchSlots.length === 0) {
      setBatchError("Bạn phải thêm ít nhất 1 khung giờ mẫu.");
      setBatchLoading(false);
      return;
    }

    let current = new Date(batchStartDate + "T00:00:00");
    const final = new Date(batchEndDate + "T00:00:00");

    let skippedConflictCount = 0;

    while (current <= final) {
      const day = current.getDay();
      let existingSlotsForDay = [];

      if (batchWeekdays[day]) {
        const isSameSelected = current.toISOString().split("T")[0] === selectedDate;
        existingSlotsForDay = isSameSelected ? Slots : [];

        for (const tpl of batchSlots) {
          const [sh, sm] = tpl.startTime.split(":");
          const [eh, em] = tpl.endTime.split(":");

          const startUTC = new Date(
            Date.UTC(
              current.getFullYear(),
              current.getMonth(),
              current.getDate(),
              parseInt(sh, 10),
              parseInt(sm, 10),
              0
            )
          );

          if (startUTC < now) {
            // Bỏ qua ca trong quá khứ
            continue;
          }

          // Check trùng lặp với ngày đang xem
          const sStr = `${sh}:${sm}`;
          const eStr = `${eh}:${em}`;
          let conflict = false;
          if (isSameSelected) {
            conflict = existingSlotsForDay.some((ex) => {
              const exStart = formatISOTime(ex.start_time);
              const exEnd = formatISOTime(ex.end_time);
              return sStr < exEnd && eStr > exStart;
            });
          }
          if (conflict) {
            skippedConflictCount++;
            continue;
          }

          const endUTC = new Date(
            Date.UTC(
              current.getFullYear(),
              current.getMonth(),
              current.getDate(),
              parseInt(eh, 10),
              parseInt(em, 10),
              0
            )
          );

          payloads.push({
            clinic_id,
            start_time: startUTC.toISOString(),
            end_time: endUTC.toISOString(),
            status: "AVAILABLE",
            fee_amount: feeAmount,
            max_patients: tpl.maxPatients,
            booked_count: 0,
            note: note,
            created_by,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    if (payloads.length === 0) {
      setBatchError(
        "Không có ca hợp lệ nào được tạo (có thể do quá khứ hoặc trùng lặp)."
      );
      setBatchLoading(false);
      return;
    }

    toast.loading("Đang tạo lịch hàng loạt, vui lòng chờ...");

    try {
      const promises = payloads.map((p) => SLOT_API.createSlotByDoctor(p));
      const results = await Promise.allSettled(promises);
      toast.dismiss();

      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.filter((r) => r.status === "rejected").length;

      let okMsg = ok > 0 ? `Tạo thành công ${ok} ca.` : "";
      let errMsg = fail > 0 ? `Tạo thất bại ${fail} ca (trùng/lỗi API).` : "";
      if (skippedConflictCount > 0) {
        errMsg += ` Bỏ qua ${skippedConflictCount} ca (trùng với ngày đang xem).`;
      }

      if (okMsg) toast.success(okMsg);
      if (errMsg) toast.error(errMsg, { duration: 5000 });

      setBatchLoading(false);
      setIsBatchModalOpen(false);
      setBatchSlots([]);
      fetchSlots();
    } catch (e) {
      toast.dismiss();
      console.error("Lỗi khi tạo lịch hàng loạt:", e);
      toast.error("Đã xảy ra lỗi chung. Vui lòng thử lại.");
      setBatchLoading(false);
    }
  };

  const getSlotAvailability = (Slot) => {
    const isAvailable = Slot.status === "AVAILABLE";
    const hasSpace = (Slot.booked_count || 0) < Slot.max_patients;
    return isAvailable && hasSpace;
  };

  const filteredSlots = useMemo(() => {
    if (statusFilter === "all") return Slots;
    const wantAvailable = statusFilter === "available";
    return Slots.filter((s) => getSlotAvailability(s) === wantAvailable);
  }, [Slots, statusFilter]);

  // =============== RENDER ===============
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-5 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow">
            <Calendar className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý ca làm việc
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Thêm, sửa, xóa ca làm việc của bác sĩ
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
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
                  className={`${inputRingClasses} py-1.5`}
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
                  className={`${inputRingClasses} py-1.5 pl-3 pr-8`}
                >
                  <option value="all">Tất cả</option>
                  <option value="available">Available (Còn chỗ)</option>
                  <option value="unavailable">Unavailable (Hết chỗ/Ngưng)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-white rounded-md transition-colors shadow-sm font-medium bg-green-600 hover:bg-green-700"
              >
                <Calendar size={18} /> Tạo lịch hàng loạt
              </button>

              <button
                onClick={openAddModal}
                disabled={isPastDate}
                className={`flex items-center gap-1.5 px-3 py-2 text-white rounded-md transition-colors shadow-sm font-medium
                ${
                  isPastDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Plus size={18} /> Thêm ca
              </button>
            </div>
          </div>

          {isPastDate && (
            <p className="text-xs text-amber-700 font-medium mt-3 pt-3 border-t border-gray-200">
              Bạn đang xem một ngày trong quá khứ. Không thể thêm hoặc sửa ca.
            </p>
          )}
        </div>

        {/* Content / Danh sách ca */}
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
          // 👉 Lưới gọn + hiển thị nhiều slot
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
            {filteredSlots.map((Slot, index) => {
              const isFullyBooked =
                (Slot.booked_count || 0) >= Slot.max_patients;
              const isServiceAvailable = Slot.status === "AVAILABLE";

              // Badge trạng thái nhỏ gọn
              let statusComponent;
              if (!isServiceAvailable) {
                statusComponent = (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-200 text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                    Unavailable
                  </span>
                );
              } else if (isFullyBooked) {
                statusComponent = (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-red-100 text-red-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Full
                  </span>
                );
              } else {
                statusComponent = (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-green-100 text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Available
                  </span>
                );
              }

              const statusBorderColor = !isServiceAvailable
                ? "border-l-gray-400"
                : isFullyBooked
                ? "border-l-red-400"
                : "border-l-green-500";

              const startTime = `${new Date(Slot.start_time)
                .getUTCHours()
                .toString()
                .padStart(2, "0")}:${new Date(Slot.start_time)
                .getUTCMinutes()
                .toString()
                .padStart(2, "0")}`;
              const endTime = `${new Date(Slot.end_time)
                .getUTCHours()
                .toString()
                .padStart(2, "0")}:${new Date(Slot.end_time)
                .getUTCMinutes()
                .toString()
                .padStart(2, "0")}`;

              return (
                <div
                  key={Slot._id}
                  className={`bg-white rounded-md shadow-sm p-3 border border-gray-200 border-l-4 ${statusBorderColor} transition-all hover:shadow-md flex flex-col text-sm`}
                >
                  {/* Header: Ca + badge */}
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        Ca #{index + 1}
                      </p>
                      <div className="flex items-center gap-1.5 text-gray-600 mt-0.5">
                        <Clock size={14} className="text-blue-600" />
                        <span className="font-semibold text-[15px] text-gray-900">
                          {startTime} - {endTime}
                        </span>
                      </div>
                    </div>
                    {statusComponent}
                  </div>

                  {/* Đã đăng ký + Sửa */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <People size={14} className="text-blue-600" />
                      <span>
                        {Slot.booked_count || 0}/{Slot.max_patients} BN
                      </span>
                    </div>

                    <button
                      onClick={() => openEditModal(Slot)}
                      disabled={isPastDate}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md font-semibold shadow-sm ${
                        isPastDate
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                      }`}
                    >
                      <Pencil size={12} /> Sửa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Add/Edit ĐƠN LẺ */}
        <Transition appear show={modalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setModalOpen(false)}>
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
                      <div className="rounded-md bg-amber-50 p-3 mb-5">
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
                          <option value="UNAVAILABLE">Unavailable (Ngưng)</option>
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
                      <div className="rounded-md bg-red-50 p-3 mt-5">
                        <p className="text-sm font-medium text-red-800">
                          {modalError}
                        </p>
                      </div>
                    )}

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

        {/* Modal HÀNG LOẠT */}
        <Transition appear show={isBatchModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsBatchModalOpen(false)}>
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
                  <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                      <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow">
                        <Calendar className="text-white" size={22} />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                          Tạo lịch làm việc hàng loạt
                        </Dialog.Title>
                        <p className="text-gray-500 text-sm mt-0.5">
                          Thiết lập nhanh các ca làm việc cho nhiều ngày trong tuần
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Cột trái: Khung giờ mẫu */}
                      <div className="p-5 bg-gray-50 rounded-2xl ring-1 ring-gray-200 flex flex-col">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">
                          1️⃣ Tạo khung giờ mẫu
                        </h3>

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
                                  onChange={(e) => setTempStartHour(e.target.value)}
                                  className={inputRingClasses}
                                >
                                  {hours.map((h) => (
                                    <option key={`start-h-${h}`} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                <span className="font-semibold text-gray-500">:</span>
                                <select
                                  value={tempStartMinute}
                                  onChange={(e) => setTempStartMinute(e.target.value)}
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
                                  onChange={(e) => setTempEndHour(e.target.value)}
                                  className={inputRingClasses}
                                >
                                  {hours.map((h) => (
                                    <option key={`end-h-${h}`} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                <span className="font-semibold text-gray-500">:</span>
                                <select
                                  value={tempEndMinute}
                                  onChange={(e) => setTempEndMinute(e.target.value)}
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
                              onChange={(e) => setTempMax(Math.max(1, Number(e.target.value)))}
                              className={inputRingClasses}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddTemplateSlot}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={!!templateError}
                          >
                            + Thêm khung giờ
                          </button>

                          {templateError && (
                            <p className="text-sm text-red-600 font-medium text-center -mt-1">
                              {templateError}
                            </p>
                          )}
                        </div>

                        {/* Danh sách khung giờ */}
                        <div className="mt-4 space-y-2 overflow-y-auto max-h-48 pr-2">
                          {batchSlots.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center">
                              Chưa có khung giờ nào
                            </p>
                          ) : (
                            batchSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex justify-between items-center bg-white rounded-md shadow-sm p-3 ring-1 ring-gray-200 hover:shadow transition"
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
                                  onClick={() => handleRemoveTemplateSlot(slot.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Cột phải: Áp dụng */}
                      <div className="p-5 bg-gray-50 rounded-2xl ring-1 ring-gray-200 flex flex-col justify-between">
                        <div className="space-y-5">
                          <h3 className="text-base font-semibold text-gray-800">
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
                                  className={`px-3 py-1.5 text-sm rounded-md border font-medium transition-all ${
                                    batchWeekdays[day.id]
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
                                onChange={(e) => setBatchStartDate(e.target.value)}
                                className={inputRingClasses}
                              />
                              <span className="text-gray-500 font-semibold">→</span>
                              <input
                                type="date"
                                value={batchEndDate}
                                onChange={(e) => setBatchEndDate(e.target.value)}
                                className={inputRingClasses}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Lỗi ngày */}
                        {batchError && (
                          <div className="mt-5 rounded-md bg-red-50 p-3">
                            <p className="text-sm text-red-800">{batchError}</p>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6 border-t pt-5">
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
                            disabled={batchLoading || !!batchError}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {batchLoading ? "Đang xử lý..." : "Tạo lịch hàng loạt"}
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
      </div>
    </div>
  );
};

export default SlotSchedule;
