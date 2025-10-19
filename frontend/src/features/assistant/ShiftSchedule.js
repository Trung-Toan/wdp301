"use client";

import { useState, useEffect, Fragment } from "react";
import { Calendar, Plus, Pencil, Trash } from "react-bootstrap-icons";
import { Dialog, Transition } from "@headlessui/react";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../../services/assistantService";

const ShiftSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [maxPatients, setMaxPatients] = useState(1);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);

  // Fetch shifts
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await getShifts("DOC001", selectedDate);
      setShifts(res.data || []);
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

  // Open Add/Edit modal
  const openAddModal = () => {
    setEditingShift(null);
    setShiftStart("");
    setShiftEnd("");
    setMaxPatients(1);
    setModalOpen(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setShiftStart(shift.start_time);
    setShiftEnd(shift.end_time);
    setMaxPatients(shift.maxPatients || 1);
    setModalOpen(true);
  };

  const handleSaveShift = async () => {
    if (!shiftStart || !shiftEnd) return;
    try {
      const payload = {
        start_time: shiftStart,
        end_time: shiftEnd,
        maxPatients,
      };
      if (editingShift) {
        await updateShift(editingShift._id, payload);
      } else {
        await createShift("DOC001", {
          date: selectedDate,
          ...payload,
        });
      }
      await fetchShifts();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDeleteShift = (shift) => {
    setShiftToDelete(shift);
    setDeleteModalOpen(true);
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      await deleteShift(shiftToDelete._id);
      setShifts(shifts.filter((s) => s._id !== shiftToDelete._id));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center justify-between">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm ca
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p>Đang tải...</p>
        ) : shifts.length === 0 ? (
          <p>Chưa có ca nào trong ngày này</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {shifts.map((shift, index) => (
              <div
                key={shift._id}
                className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">Ca #{index + 1}</p>
                  <p className="text-gray-600">
                    {shift.start_time} - {shift.end_time}
                  </p>
                  <p className="text-sm text-gray-500">
                    {shift.patientsCount}/{shift.maxPatients} bệnh nhân đã đăng
                    ký
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái: {shift.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(shift)}
                    className="px-3 py-1 bg-yellow-400 text-white rounded-lg flex items-center gap-1"
                  >
                    <Pencil size={14} /> Sửa
                  </button>
                  <button
                    onClick={() => confirmDeleteShift(shift)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg flex items-center gap-1"
                  >
                    <Trash size={14} /> Xóa
                  </button>
                </div>
              </div>
            ))}
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
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                      {editingShift ? "Sửa ca" : "Thêm ca"}
                    </Dialog.Title>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Giờ bắt đầu
                        </label>
                        <input
                          type="time"
                          value={shiftStart}
                          onChange={(e) => setShiftStart(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Giờ kết thúc
                        </label>
                        <input
                          type="time"
                          value={shiftEnd}
                          onChange={(e) => setShiftEnd(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Số bệnh nhân tối đa
                        </label>
                        <input
                          type="number"
                          value={maxPatients}
                          min={1}
                          onChange={(e) =>
                            setMaxPatients(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                          onClick={() => setModalOpen(false)}
                        >
                          Hủy
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          onClick={handleSaveShift}
                        >
                          Lưu
                        </button>
                      </div>
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
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                      Xóa ca làm việc
                    </Dialog.Title>
                    <p className="text-gray-700 mb-4">
                      Bạn có chắc muốn xóa ca{" "}
                      {shiftToDelete ? `#${shiftToDelete._id}` : ""}?
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalOpen(false)}
                      >
                        Hủy
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
