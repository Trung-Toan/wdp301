"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash,
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
  const [todayString] = useState(getLocalDate()); // todayString này chỉ lấy 1 lần khi load

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [SlotToDelete, setSlotToDelete] = useState(null);

  const isPastDate = useMemo(() => {
    const selDate = new Date(selectedDate);
    const todDate = new Date(todayString); // Dùng todayString từ state
    selDate.setHours(0, 0, 0, 0);
    todDate.setHours(0, 0, 0, 0);
    return selDate < todDate;
  }, [selectedDate, todayString]);

  // Lấy danh sách slot theo bác sĩ và ngày
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

  // === VALIDATION THỜI GIAN THỰC ===
  useEffect(() => {
    if (!modalOpen) {
      setModalError("");
      return;
    }

    const finalSlotStart = `${startHour}:${startMinute}`;
    const finalSlotEnd = `${endHour}:${endMinute}`;

    // 1. Validate giờ kết thúc > giờ bắt đầu
    if (finalSlotStart >= finalSlotEnd) {
      setModalError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    // === THÊM MỚI: Kiểm tra thời gian trong quá khứ (cho ngày hôm nay) ===
    const now = new Date();
    const currentTodayString = getLocalDate(); // Lấy ngày 'hôm nay' MỚI NHẤT

    // Chỉ kiểm tra nếu ngày đang chọn LÀ ngày hôm nay
    if (selectedDate === currentTodayString) {
      // Tạo đối tượng Date cho thời gian đã chọn (theo giờ địa phương)
      const selectedStartTime = new Date(
        `${selectedDate}T${startHour}:${startMinute}:00`
      );

      // So sánh thời gian đã chọn với thời gian hiện tại
      if (selectedStartTime < now) {
        setModalError("Không thể tạo ca vào thời điểm đã qua trong ngày.");
        return;
      }
    }
    // ===================================================================

    // 3. Validate trùng lặp (overlap)
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

    // 4. Validate trùng giờ BẮT ĐẦU (chuyển sang ISO để so sánh)
    // Phải dùng new Date(...).toISOString() để xử lý đúng múi giờ
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

    // Nếu không có lỗi
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
  ]);
  // ===================================

  const openAddModal = () => {
    setEditingSlot(null);
    setStartHour("08");
    setStartMinute("00");
    setEndHour("09");
    setEndMinute("00");
    setMaxPatients(1);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (Slot) => {
    setEditingSlot(Slot);

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

  const handleSaveSlot = async () => {
    if (modalError) {
      toast.error("Vui lòng sửa lỗi trước khi lưu.");
      return;
    }

    try {
      // Chuyển giờ địa phương (vd: 15:00 GMT+7) sang ISO (vd: 08:00Z)
      const startDateTime = new Date(
        `${selectedDate}T${startHour}:${startMinute}:00`
      ).toISOString();
      const endDateTime = new Date(
        `${selectedDate}T${endHour}:${endMinute}:00`
      ).toISOString();

      const payload = {
        clinic_id: assistantInfo.clinic_id,
        start_time: startDateTime,
        end_time: endDateTime,
        status: "AVAILABLE",
        fee_amount: feeAmount,
        max_patients: maxPatients,
        booked_count: editingSlot ? editingSlot.booked_count : 0,
        note: note,
        created_by: assistantInfo.id,
      };

      if (editingSlot) {
        await SLOT_API.updateSlotById(editingSlot._id, payload);
        toast.success("Cập nhật ca thành công!");
      } else {
        await SLOT_API.createSlotByDoctor(payload);
        toast.success("Thêm ca mới thành công!");
      }
      await fetchSlots();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");
    }
  };

  const confirmDeleteSlot = (Slot) => {
    setSlotToDelete(Slot);
    setDeleteModalOpen(true);
  };

  const handleDeleteSlot = async () => {
    if (!SlotToDelete?._id) return;
    try {
      await SLOT_API.deleteSlotById(SlotToDelete._id);
      toast.success("Xóa ca thành công!");
      await fetchSlots();
      setDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa ca. Vui lòng thử lại.");
    }
  };

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
              {/* Date Picker (Vẫn cho phép chọn ngày quá khứ) */}
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
              disabled={isPastDate} // Vẫn dùng isPastDate để vô hiệu hóa nút
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm font-medium
                ${isPastDate
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              <Plus size={20} /> Thêm ca
            </button>
          </div>

          {/* Thông báo khi xem ngày quá khứ */}
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
              const isAvailable = getSlotAvailability(Slot);
              const statusText = isAvailable ? "Available" : "Unavailable";
              const statusBadgeColor = isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-700";
              const statusBorderColor = isAvailable
                ? "border-l-green-500"
                : "border-l-gray-400";

              return (
                <div
                  key={Slot._id}
                  className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${statusBorderColor} transition-all hover:shadow-md`}
                >
                  <div className="flex justify-between items-start">
                    {/* Thông tin ca */}
                    <div>
                      <p className="text-lg font-bold text-gray-800 mb-2">
                        Ca #{index + 1}
                      </p>
                      <div className="flex items-center gap-2 text-gray-700 mb-1">
                        <Clock size={16} />
                        <span className="font-medium text-lg">
                          {formatISOTime(Slot.start_time)} -{" "}
                          {formatISOTime(Slot.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <People size={16} />
                        <span className="text-sm">
                          Đã đăng ký:{" "}
                          <span className="font-medium">
                            {Slot.booked_count || 0}/{Slot.max_patients}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Trạng thái & Hành động */}
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadgeColor}`}
                      >
                        {statusText}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(Slot)}
                          disabled={isPastDate}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md transition-colors text-sm font-medium shadow-sm
                            ${isPastDate
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600"
                            }`}
                        >
                          <Pencil size={14} /> Sửa
                        </button>
                        <button
                          onClick={() => confirmDeleteSlot(Slot)}
                          disabled={isPastDate}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors text-sm font-medium shadow-sm disabled:bg-gray-400"
                        >
                          <Trash size={14} /> Xóa
                        </button>
                      </div>
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
                            value={startMinute}
                            onChange={(e) => setStartMinute(e.target.value)}
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

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-1.5">
                          Giờ kết thúc
                        </label>
                        <div className="flex items-center gap-3">
                          <select
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
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
                            value={endMinute}
                            onChange={(e) => setEndMinute(e.target.value)}
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

                    {/* Hiển thị lỗi validation (real-time) */}
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

        {/* Modal Delete */}
        <Transition appear show={deleteModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setDeleteModalOpen(false)}
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
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                      Xóa ca làm việc
                    </Dialog.Title>
                    <p className="text-gray-700 mb-4">
                      Bạn có chắc muốn xóa ca làm việc
                      {SlotToDelete ? (
                        <span className="font-bold">
                          {" "}
                          {formatISOTime(SlotToDelete.start_time)} -{" "}
                          {formatISOTime(SlotToDelete.end_time)}
                        </span>
                      ) : (
                        ""
                      )}
                      ?
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                        onClick={() => setDeleteModalOpen(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
                        onClick={handleDeleteSlot}
                      >
                        Xóa
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