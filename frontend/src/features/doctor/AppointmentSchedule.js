"use client";

import { memo, useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Person,
  Telephone,
  GeoAlt,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  ClockHistory,
  X,
  Activity,
} from "react-bootstrap-icons";
import {
  updateAppointmentStatus,
  getAppointments,
} from "../../services/doctorService";
import "../../styles/doctor/appointment-schedule.css";

const AppointmentSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await getAppointments("DOC001", { date: selectedDate });

        console.log("[v0] Appointments response:", res);

        if (res.success) {
          setAppointments(res.data || []);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: {
        label: "Đã lên lịch",
        class: "status-scheduled",
        icon: ClockHistory,
      },
      COMPLETED: {
        label: "Hoàn thành",
        class: "status-completed",
        icon: CheckCircle,
      },
      CANCELLED: { label: "Đã hủy", class: "status-cancelled", icon: XCircle },
      NO_SHOW: { label: "Không đến", class: "status-no-show", icon: XCircle },
    };
    return statusConfig[status] || statusConfig.SCHEDULED;
  };

  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((apt) => {
        if (filterStatus === "ALL") return true;
        return apt.status === filterStatus;
      })
    : [];

  const getPatientName = (appointment) => {
    return (
      appointment?.patient?.user?.full_name ||
      appointment?.patient?.full_name ||
      "Chưa có thông tin"
    );
  };

  console.log("Patient data:", appointments[0]?.patient);

  const getPatientPhone = (appointment) => {
    return (
      appointment?.patient?.user?.account_id?.phone_number ||
      "Chưa có thông tin"
    );
  };

  const getClinicName = (appointment) => {
    return appointment?.clinic?.name || "Chưa có thông tin";
  };

  const getSpecialtyName = (appointment) => {
    return appointment?.specialty?.name || "Chưa có thông tin";
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try {
      const birthDate = new Date(dob);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return "N/A";
    }
  };

  const getPatientDob = (appointment) => {
    return (
      appointment?.patient?.user?.dob ||
      appointment?.patient?.dob ||
      "Chưa có thông tin"
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      return new Date(timeString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await updateAppointmentStatus(appointmentId, newStatus);
      if (res.success) {
        const updatedRes = await getAppointments("DOC001", {
          date: selectedDate,
        });
        if (updatedRes.success) {
          setAppointments(updatedRes.data || []);
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Lịch khám bệnh
              </h1>
              <p className="text-gray-500 mt-1">
                Quản lý và theo dõi lịch hẹn của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SCHEDULED">Đã lên lịch</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="NO_SHOW">Không đến</option>
              </select>
            </div>

            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-semibold">
                Tổng số:{" "}
                <strong className="text-blue-900">
                  {filteredAppointments.length}
                </strong>{" "}
                lịch hẹn
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setFilterStatus("ALL");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              slot 1
            </button>
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setFilterStatus("ALL");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              slot 1
            </button>
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setFilterStatus("ALL");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              slot 1
            </button>
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setFilterStatus("ALL");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              slot 1
            </button>
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setFilterStatus("ALL");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              slot 1
            </button>
          </div>
        </div>

        

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải lịch hẹn...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="p-6 bg-gray-100 rounded-full mb-4">
              <Calendar className="text-gray-400" size={48} />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Không có lịch hẹn nào
            </p>
            <p className="text-gray-500">Chọn ngày khác để xem lịch hẹn</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment, index) => {
              const statusInfo = getStatusBadge(appointment.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={appointment._id || index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={18} />
                        <span className="font-semibold">
                          {formatTime(appointment.slot?.start_time)} -{" "}
                          {formatTime(appointment.slot?.end_time)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        appointment.status === "SCHEDULED"
                          ? "bg-blue-100 text-blue-700"
                          : appointment.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Patient Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <Person className="text-blue-600 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-lg">
                            {getPatientName(appointment)}
                          </p>
                          <p className="text-xs text-gray-500">Bệnh nhân</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Telephone className="text-green-600" size={20} />
                        <div className="flex-1">
                          <p className="text-gray-700">
                            {getPatientPhone(appointment)}
                          </p>
                          <p className="text-xs text-gray-500">Số điện thoại</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Date */}
                    {appointment.createdAt && (
                      <p className="text-xs text-gray-500">
                        Đặt lịch: {formatDate(appointment.createdAt)}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewDetails(appointment)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedAppointment && (
        <div className="appointment-modal-overlay">
          {/* Backdrop */}
          <div
            className="appointment-modal-backdrop"
            onClick={handleCloseModal}
          ></div>

          {/* Slide-in panel */}
          <div className="appointment-modal-panel">
            <div className="appointment-modal-header">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                Chi tiết lịch khám
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="appointment-modal-content">
              {/* Patient Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Person className="text-blue-600" size={20} /> Thông tin bệnh
                  nhân
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Mã BN: </span>
                    {getPatientName(selectedAppointment)}
                  </p>
                  <p>
                    <span className="font-medium">Tên: </span>
                    {getPatientName(selectedAppointment)}
                  </p>
                  <p>
                    <span className="font-medium">Tuổi: </span>
                    {calculateAge(getPatientDob(selectedAppointment))}
                  </p>
                  <p>
                    <span className="font-medium">Số điện thoại: </span>
                    {getPatientPhone(selectedAppointment)}
                  </p>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="text-blue-600" size={20} /> Thông tin lịch
                  khám
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Thời gian: </span>
                    {formatTime(selectedAppointment.slot?.start_time)} -{" "}
                    {formatTime(selectedAppointment.slot?.end_time)}
                  </p>
                  <p>
                    <span className="font-medium">Chuyên khoa: </span>
                    {getSpecialtyName(selectedAppointment) || "Chưa cập nhật"}
                  </p>
                  <p>
                    <span className="font-medium">Lý do khám: </span>
                    {selectedAppointment?.reason || "Không có ghi chú"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="text-blue-600" size={20} /> Trạng thái
                </h3>
                <span
                  className={`status-badge ${
                    selectedAppointment.status === "SCHEDULED"
                      ? "status-scheduled"
                      : selectedAppointment.status === "COMPLETED"
                      ? "status-completed"
                      : selectedAppointment.status === "CANCELLED"
                      ? "status-cancelled"
                      : "status-no-show"
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {selectedAppointment.status === "SCHEDULED" && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedAppointment._id, "COMPLETED")
                      }
                      className="btn-complete rounded-lg flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Hoàn thành
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedAppointment._id, "CANCELLED")
                      }
                      className="btn-cancel rounded-lg flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Hủy
                    </button>
                  </>
                )}
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(AppointmentSchedule);
