import { memo, useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Person,
  Telephone,
  CheckCircle,
  XCircle,
  Eye,
  ClockHistory,
  X,
} from "react-bootstrap-icons";
import "../../styles/doctor/appointment-schedule.css";
import { doctorApi } from "../../api/doctor/doctorApi";

const AppointmentSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await doctorApi.getAppointments({
          page: 1,
          limit: 10,
          status: filterStatus === "ALL" ? "" : filterStatus,
          date: selectedDate,
          slot: selectedSlot,
        });

        if (res.data.ok) {
          const { appointments, slot } = res.data.data || {};
          setAppointments(appointments || []);
          setSlots(slot?.slot_list || []);
        } else {
          setAppointments([]);
          setSlots([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate, filterStatus, selectedSlot]);

  // 🔹 Định nghĩa status hiển thị
  const getStatusBadge = (status) => {
    const config = {
      SCHEDULED: { label: "Đã lên lịch", class: "status-scheduled", icon: ClockHistory },
      COMPLETED: { label: "Hoàn thành", class: "status-completed", icon: CheckCircle },
      CANCELLED: { label: "Đã hủy", class: "status-cancelled", icon: XCircle },
      NO_SHOW: { label: "Không đến", class: "status-no-show", icon: XCircle },
    };
    return config[status] || config.SCHEDULED;
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
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
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
              <h1 className="text-3xl font-bold text-gray-800">Lịch khám bệnh</h1>
              <p className="text-gray-500 mt-1">Quản lý và theo dõi lịch hẹn của bạn</p>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <strong className="text-blue-900">{appointments.length}</strong>{" "}
                lịch hẹn
              </span>
            </div>
          </div>

          {/* Slots */}
          {slots.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} /> Lọc theo khung giờ:
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedSlot === null
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Tất cả
                </button>

                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot._id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSlot === slot._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Danh sách lịch hẹn */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-600">
            Đang tải dữ liệu...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            Không có lịch hẹn nào trong ngày này.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appointments.map((item, index) => {
              const { appointment, patient } = item;
              const statusInfo = getStatusBadge(appointment.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={appointment.appointment_id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="text-gray-700">
                        <Clock size={18} />{" "}
                        {formatDate(appointment.scheduled_date)}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.class}`}
                    >
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <Person className="text-blue-600 mt-1" size={20} />
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {patient.patient_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mã BN: {patient.patient_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Telephone className="text-green-600" size={20} />
                        <span>{patient.phone_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Eye size={16} /> Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Chi tiết */}
      {showModal && selectedAppointment && (
        <div className="appointment-modal-overlay">
          <div className="appointment-modal-backdrop" onClick={handleCloseModal}></div>
          <div className="appointment-modal-panel">
            <div className="appointment-modal-header">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} /> Chi tiết lịch khám
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="appointment-modal-content">
              <h3 className="text-lg font-semibold mb-2">Bệnh nhân</h3>
              <p><b>Tên:</b> {selectedAppointment.patient?.patient_name}</p>
              <p><b>Mã BN:</b> {selectedAppointment.patient?.patient_code}</p>
              <p><b>SĐT:</b> {selectedAppointment.patient?.phone_number}</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Thông tin lịch hẹn</h3>
              <p><b>Ngày:</b> {formatDate(selectedAppointment.appointment?.scheduled_date)}</p>
              <p><b>Trạng thái:</b> {selectedAppointment.appointment?.status}</p>

              <button
                onClick={handleCloseModal}
                className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(AppointmentSchedule);
