"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  // Trash, // <-- ĐÃ XÓA
  Clock,
  People,
} from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import { SLOT_API } from "../../api/assistant/assistant.api";
import toast, { Toaster } from "react-hot-toast";

// --- Helpers cho Modal ---
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);
// -----------------------------

const inputRingClasses =
  "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";
const inputDisabledClasses = "disabled:bg-gray-100 disabled:cursor-not-allowed";

const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatISOTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const SlotSchedule = () => {
  const assistantInfo = JSON.parse(
    sessionStorage.getItem("assistantInfo") || "{}"
  );
  const [feeAmount, setFeeAmount] = useState(500000);
  const [note, setNote] = useState("");

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [todayString] = useState(getLocalDate());

  const [Slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
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

      // === 1. LOG DỮ LIỆU THÔ KHI FETCH ===
      console.log("--- fetchSlots: Dữ liệu thô nhận về ---", res.data?.data);
      // ===================================

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

  // === (Validation useEffect giữ nguyên) ===
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
    const otherSlots = Slots.filter(
      (Slot) => Slot._id !== editingSlot?._id
    );
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
      const SlotIndex = Slots.findIndex(
        (s) => s._id === overlappingSlot._id
      );
      setModalError(
        `Khung giờ này bị trùng với Ca #${SlotIndex + 1} (${formatISOTime(
          overlappingSlot.start_time
        )} - ${formatISOTime(overlappingSlot.end_time)}).`
      );
      return;
    }
    const startDateTimeISO = new Date(
      `${selectedDate}T${startHour}:${startMinute}:00`
    ).toISOString();
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
    const [sHour, sMin] = formatISOTime(Slot.start_time).split(":");
    const [eHour, eMin] = formatISOTime(Slot.end_time).split(":");
    setStartHour(sHour || "08");
    setStartMinute(sMin || "00");
    setEndHour(eHour || "09");
    setEndMinute(eMin || "00");
    setMaxPatients(Slot.max_patients || 1);
    setModalError("");
    setModalOpen(true);
  };
  // =======================================

  // === CẬP NHẬT: Logic lưu slot (Đã thêm Log) ===
  const handleSaveSlot = async () => {
    if (modalError) {
      toast.error("Vui lòng sửa lỗi trước khi lưu.");
      return;
    }

    // Xây dựng payload trước
    const startDateTime =
      isTimeLocked && editingSlot
        ? editingSlot.start_time
        : new Date(
          `${selectedDate}T${startHour}:${startMinute}:00`
        ).toISOString();

    const endDateTime =
      isTimeLocked && editingSlot
        ? editingSlot.end_time
        : new Date(
          `${selectedDate}T${endHour}:${endMinute}:00`
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

    // === 2. LOG PAYLOAD GỬI ĐI ===
    console.log("--- handleSaveSlot: Dữ liệu gửi đi (Payload) ---");
    console.log(JSON.stringify(payload, null, 2)); // Dùng JSON.stringify để xem rõ
    // ============================

    try {
      if (editingSlot) {
        // --- SỬA ---
        console.log(`Đang gửi UPDATE cho ID: ${editingSlot._id}`);
        await SLOT_API.updateSlotById(editingSlot._id, payload);
        toast.success("Cập nhật ca thành công!");
      } else {
        // --- THÊM MỚI ---
        console.log("Đang gửi CREATE...");
        await SLOT_API.createSlotByDoctor(payload);
        toast.success("Thêm ca mới thành công!");
      }

      // 2. Đóng modal
      setModalOpen(false);

      // === 3. LOG TRẠNG THÁI ===
      console.log("--- handleSaveSlot: Gửi lệnh thành công. Đang fetch lại... ---");
      // =========================

      // 3. Tải lại toàn bộ danh sách từ server (Đây là nguồn chân lý)
      await fetchSlots();

    } catch (error) {
      console.error("--- LỖI KHI LƯU ---", error);
      toast.error("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");

      console.log("--- handleSaveSlot: Gửi lệnh thất bại. Đang fetch lại... ---");
      await fetchSlots();
    }
  };
  // =================================================

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

  // === (Phần JSX return giữ nguyên) ===
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

            {/* Add Button */}
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
                  {/* Hàng 1: Tên ca & Trạng thái */}
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xl font-bold text-gray-800">
                      Ca #{index + 1}
                    </p>
                    {statusComponent}
                  </div>

                  {/* Hàng 2: Giờ */}
                  <div className="flex items-center gap-2.5 text-gray-700 mb-4">
                    <Clock size={20} className="text-blue-600" />
                    <span className="font-semibold text-2xl text-gray-900 tracking-tight">
                      {formatISOTime(Slot.start_time)} -{" "}
                      {formatISOTime(Slot.end_time)}
                    </span>
                  </div>

                  {/* Hàng 3: Số lượng & Nút Sửa */}
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

        {/* Modal Add/Edit */}
        <Transition appear show={modalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setModalOpen(false)}
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
                          Ca này đã bắt đầu. Bạn không thể sửa đổi thời gian,
                          nhưng có thể cập nhật Trạng thái và Số lượng bệnh
                          nhân.
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
      </div>
    </div>
  );
};

export default SlotSchedule;