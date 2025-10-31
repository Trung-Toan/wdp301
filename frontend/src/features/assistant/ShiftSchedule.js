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
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../../services/assistantService";

// --- Helpers cho Modal ---
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);
// -----------------------------

// --- Helper class cho Form Inputs ---
const inputRingClasses =
  "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";
// --------------------------------------------------

const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ShiftSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [todayString] = useState(getLocalDate());

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [maxPatients, setMaxPatients] = useState(1);

  // === THAY ĐỔI 1: State cho lỗi validation ===
  const [modalError, setModalError] = useState("");
  // ============================================

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);

  const isPastDate = useMemo(() => {
    return selectedDate < todayString;
  }, [selectedDate, todayString]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await getShifts("DOC001", selectedDate);
      const fetchedShifts = res.data || [];
      const sortedShifts = fetchedShifts.sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });
      setShifts(sortedShifts);
    } catch (error) {
      console.error(error);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [selectedDate]);

  // === THAY ĐỔI 2: Reset lỗi khi mở modal ===
  const openAddModal = () => {
    setEditingShift(null);
    setStartHour("08");
    setStartMinute("00");
    setEndHour("09");
    setEndMinute("00");
    setMaxPatients(1);
    setModalError(""); // Reset lỗi
    setModalOpen(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    const [sHour, sMin] = shift.start_time.split(":");
    const [eHour, eMin] = shift.end_time.split(":");

    const snapTo5 = (min) => {
      if (!min) return "00";
      if (minutes.includes(min)) return min;
      const rounded = Math.round(Number(min) / 5) * 5;
      return rounded.toString().padStart(2, "0");
    };

    setStartHour(sHour || "08");
    setStartMinute(snapTo5(sMin));
    setEndHour(eHour || "09");
    setEndMinute(snapTo5(eMin));
    setMaxPatients(shift.maxPatients || 1);
    setModalError(""); // Reset lỗi
    setModalOpen(true);
  };
  // ==========================================

  // === THAY ĐỔI 3: Thêm logic Validation ===
  const handleSaveShift = async () => {
    setModalError(""); // Xóa lỗi cũ
    const finalShiftStart = `${startHour}:${startMinute}`;
    const finalShiftEnd = `${endHour}:${endMinute}`;

    // 1. Validate giờ kết thúc > giờ bắt đầu
    if (finalShiftStart >= finalShiftEnd) {
      setModalError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    // 2. Validate trùng lặp (overlap)
    // Lấy tất cả các ca khác, *trừ* ca đang sửa (nếu có)
    const otherShifts = shifts.filter(
      (shift) => shift._id !== editingShift?._id
    );

    let overlappingShift = null;
    for (const existingShift of otherShifts) {
      const existingStart = existingShift.start_time;
      const existingEnd = existingShift.end_time;

      // Điều kiện check overlap:
      // (Bắt đầu mới < Kết thúc cũ) VÀ (Kết thúc mới > Bắt đầu cũ)
      if (finalShiftStart < existingEnd && finalShiftEnd > existingStart) {
        overlappingShift = existingShift;
        break;
      }
    }

    if (overlappingShift) {
      // Tìm index của ca bị trùng để hiển thị (ví dụ: "trùng với Ca #1")
      const shiftIndex = shifts.findIndex(
        (s) => s._id === overlappingShift._id
      );
      setModalError(
        `Khung giờ này bị trùng với Ca #${shiftIndex + 1} (${overlappingShift.start_time
        } - ${overlappingShift.end_time}).`
      );
      return;
    }

    // 3. Nếu không có lỗi, tiến hành lưu
    try {
      const payload = {
        start_time: finalShiftStart,
        end_time: finalShiftEnd,
        maxPatients,
      };

      if (editingShift) {
        await updateShift(editingShift._id, payload);
      } else {
        await createShift("DOC001", { date: selectedDate, ...payload });
      }
      await fetchShifts();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      setModalError("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");
    }
  };
  // ==========================================

  const confirmDeleteShift = (shift) => {
    setShiftToDelete(shift);
    setDeleteModalOpen(true);
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      await deleteShift(shiftToDelete._id);
      await fetchShifts();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getShiftAvailability = (shift) => {
    const isBookable = shift.status === "active";
    const hasSpace = shift.patientsCount < shift.maxPatients;
    return isBookable && hasSpace;
  };

  const filteredShifts = useMemo(() => {
    if (statusFilter === "all") return shifts;
    const isFilteringForAvailable = statusFilter === "available";
    return shifts.filter((shift) => {
      const isAvailable = getShiftAvailability(shift);
      return isAvailable === isFilteringForAvailable;
    });
  }, [shifts, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
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
        ) : filteredShifts.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-sm p-10">
            <p className="text-gray-600 font-medium">
              {shifts.length === 0
                ? "Chưa có ca nào trong ngày này"
                : "Không tìm thấy ca nào phù hợp với bộ lọc"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredShifts.map((shift, index) => {
              const isAvailable = getShiftAvailability(shift);
              const statusText = isAvailable ? "Available" : "Unavailable";
              const statusBadgeColor = isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-700";
              const statusBorderColor = isAvailable
                ? "border-l-green-500"
                : "border-l-gray-400";

              return (
                <div
                  key={shift._id}
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
                        <span className="font-medium">
                          {shift.start_time} - {shift.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <People size={16} />
                        <span className="text-sm">
                          Đã đăng ký:{" "}
                          <span className="font-medium">
                            {shift.patientsCount}/{shift.maxPatients}
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
                          onClick={() => openEditModal(shift)}
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
                          onClick={() => confirmDeleteShift(shift)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors text-sm font-medium shadow-sm"
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
                      {editingShift ? "Sửa ca làm việc" : "Thêm ca làm việc"}
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
                          <span className="font-semibold text-gray-500">
                            :
                          </span>
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
                          <span className="font-semibold text-gray-500">
                            :
                          </span>
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

                    {/* === THAY ĐỔI 4: Hiển thị lỗi validation === */}
                    {modalError && (
                      <div className="rounded-md bg-red-50 p-4 mt-5">
                        <p className="text-sm font-medium text-red-800">
                          {modalError}
                        </p>
                      </div>
                    )}
                    {/* ========================================= */}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        className="px-5 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                        onClick={() => setModalOpen(false)}
                      >
                        Hủy
                      </button>
                      <button
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        onClick={handleSaveShift}
                      >
                        {editingShift ? "Lưu thay đổi" : "Thêm ca"}
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
                      {shiftToDelete ? (
                        <span className="font-bold">
                          {" "}
                          {shiftToDelete.start_time} - {shiftToDelete.end_time}
                        </span>
                      ) : (
                        ""
                      )}
                      ?
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium ring-1 ring-inset ring-gray-300 shadow-sm"
                        onClick={() => setDeleteModalOpen(false)}
                      >
                        Hủy
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
                        onClick={handleDeleteShift}
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

export default ShiftSchedule;