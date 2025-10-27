"use client";

import { memo, useEffect, useState } from "react";
import {
  Calendar,
  Person,
  Telephone,
  CheckCircle, // Nút Duyệt
  XCircle, // Nút Hủy
  CheckCircleFill, // Nút Hoàn thành (MỚI)
  CalendarX, // Nút Vắng mặt (MỚI)
} from "react-bootstrap-icons";
import "../../styles/assistant/appointment-schedule.css";

import {
  getShifts,
  getAppointments,
  updateAppointmentStatus,
} from "../../services/assistantService";

// Helper lấy ngày Local (YYYY-MM-DD)
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  // NOTE: Dùng ngày này để khớp với mock data trong assistantService.js
  // Bỏ dòng này khi chạy thật
  return "2025-10-27";

  // Dùng dòng này khi chạy thật
  // return `${year}-${month}-${day}`;
};

const ApproveAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [shifts, setShifts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const doctorId = "DOC001";

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
        setShifts([]);
        setAppointments([]);
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
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    }
  };

  // Cập nhật Status Badges
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

  // Cập nhật thứ tự Sắp xếp
  const getShiftAppointments = (shiftId) => {
    const statusSortOrder = {
      SCHEDULED: 1, // Chờ duyệt
      APPROVE: 2, // Đã duyệt (Chờ khám)
      COMPLETED: 3, // Đã khám xong
      NO_SHOW: 4, // Vắng mặt
      CANCELLED: 5, // Đã hủy
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
                        badgeColor = "bg-blue-100 text-blue-700"; // Chờ
                      } else if (statusInfo.className === "status-approved") {
                        badgeColor = "bg-green-100 text-green-700"; // Duyệt
                      } else if (statusInfo.className === "status-completed") {
                        badgeColor = "bg-indigo-100 text-indigo-700"; // Khám xong
                      } else if (statusInfo.className === "status-cancelled" || statusInfo.className === "status-no-show") {
                        badgeColor = "bg-red-100 text-red-700"; // Hủy/Vắng
                      }

                      return (
                        <div
                          key={apt._id}
                          className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-4 mb-2 sm:mb-0">
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
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
                            >
                              {statusInfo.label}
                            </span>

                            {/* === THAY ĐỔI 3: Cập nhật logic nút === */}

                            {/* 1. Nếu CHỜ DUYỆT (SCHEDULED) */}
                            {apt.status === "SCHEDULED" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(apt._id, "APPROVE")
                                  }
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Duyệt"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(apt._id, "CANCELLED")
                                  }
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
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(apt._id, "COMPLETED")
                                  }
                                  className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                                  title="Đã khám xong"
                                >
                                  <CheckCircleFill size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(apt._id, "NO_SHOW")
                                  }
                                  className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                                  title="Vắng mặt"
                                >
                                  <CalendarX size={16} />
                                </button>
                              </>
                            )}

                            {/* (Các trạng thái COMPLETED, CANCELLED, NO_SHOW sẽ không có nút) */}
                            {/* =================================== */}

                          </div>
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
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Không có ca khám nào
            </p>
            <p className="text-gray-500">
              Hãy thử chọn ngày khác hoặc tạo ca mới
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ApproveAppointment);