"use client";

import { memo, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Person,
  Telephone,
  CheckCircle,
  XCircle,
} from "react-bootstrap-icons";
import {
  getShifts,
  getAppointments,
  updateAppointmentStatus,
} from "../../services/assistantService";
import "../../styles/assistant/appointment-schedule.css";

const ApproveAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shifts, setShifts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const doctorId = "DOC001"; // giả sử là bác sĩ 001

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const shiftRes = await getShifts(doctorId, selectedDate);
        setShifts(shiftRes.success ? shiftRes.data : []);

        const aptRes = await getAppointments({ doctorId, date: selectedDate });
        setAppointments(aptRes.success ? aptRes.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await updateAppointmentStatus(appointmentId, newStatus);
      if (res.success) {
        const aptRes = await getAppointments({ doctorId, date: selectedDate });
        setAppointments(aptRes.success ? aptRes.data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      SCHEDULED: { label: "Đã lên lịch", className: "status-scheduled" },
      COMPLETED: { label: "Hoàn thành", className: "status-completed" },
      CANCELLED: { label: "Đã hủy", className: "status-cancelled" },
    };
    return config[status] || config.SCHEDULED;
  };

  const getShiftAppointments = (shiftId) =>
    appointments.filter((apt) => apt.shift._id === shiftId);

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

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <Calendar className="text-gray-400" size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-2 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Không có ca khám nào
            </p>
            <p className="text-gray-500">Chọn ngày khác để xem</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift._id}
              className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden"
            >
              {/* Shift Header */}
              <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-700">
                    Ca: {shift.start_time} - {shift.end_time}
                  </span>
                  <span className="text-gray-600">
                    Số bệnh nhân: {shift.patientsCount}/{shift.maxPatients}
                  </span>
                </div>
              </div>

              {/* Appointments */}
              <div className="p-6 space-y-4">
                {getShiftAppointments(shift._id).length === 0 ? (
                  <p className="text-gray-500">Chưa có bệnh nhân</p>
                ) : (
                  getShiftAppointments(shift._id).map((apt) => {
                    const statusInfo = getStatusBadge(apt.status);
                    return (
                      <div
                        key={apt._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Person className="text-blue-600" size={20} />
                          <div>
                            <p className="font-semibold">{apt.patient.name}</p>
                            <p className="text-gray-500 text-sm">
                              <Telephone className="inline mr-1" />
                              {apt.patient.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusInfo.className === "status-scheduled"
                                ? "bg-blue-100 text-blue-700"
                                : statusInfo.className === "status-completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {statusInfo.label}
                          </span>
                          {apt.status === "SCHEDULED" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(apt._id, "COMPLETED")
                                }
                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(apt._id, "CANCELLED")
                                }
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default memo(ApproveAppointment);
