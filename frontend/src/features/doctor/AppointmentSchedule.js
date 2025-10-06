import { memo, useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Person,
  Telephone,
  GeoAlt,
  FileText,
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

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // doctorId = "DOC001" test data
        const res = await getAppointments("DOC001", { date: selectedDate });

        if (res.success) {
          setAppointments(res.data);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: { label: "Đã lên lịch", class: "status-scheduled" },
      COMPLETED: { label: "Hoàn thành", class: "status-completed" },
      CANCELLED: { label: "Đã hủy", class: "status-cancelled" },
      NO_SHOW: { label: "Không đến", class: "status-no-show" },
    };
    return statusConfig[status] || statusConfig.SCHEDULED;
  };

  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((apt) => {
        if (filterStatus === "ALL") return true;
        return apt.status === filterStatus;
      })
    : [];

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, "SCHEDULED");
      // Refresh appointments
      const data = await getAppointments(selectedDate);
      setAppointments(data);
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
      try {
        await updateAppointmentStatus(appointmentId, "CANCELLED");
        // Refresh appointments
        const data = await getAppointments(selectedDate);
        setAppointments(data);
      } catch (error) {
        console.error("Error cancelling appointment:", error);
      }
    }
  };

  return (
    <div className="appointment-schedule-container">
      <div className="page-header">
        <h1 className="page-title">Lịch khám bệnh</h1>
        <p className="page-subtitle">Quản lý lịch hẹn của bạn</p>
      </div>

      <div className="schedule-controls">
        <div className="date-picker-wrapper">
          <Calendar className="calendar-icon" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>

        <div className="filter-wrapper">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đã lên lịch</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="NO_SHOW">Không đến</option>
          </select>
        </div>

        <div className="schedule-summary">
          <span className="summary-text">
            Tổng số lịch hẹn: <strong>{filteredAppointments.length}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải lịch hẹn...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <Calendar className="empty-icon" />
          <p className="empty-text">Không có lịch hẹn nào trong ngày này</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((appointment) => {
            const statusInfo = getStatusBadge(appointment.status);
            return (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-time">
                    <Clock className="time-icon" />
                    <span className="time-text">
                      {new Date(
                        appointment.slot?.start_time
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      -
                      {new Date(appointment.slot?.end_time).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="appointment-body">
                  <div className="appointment-info">
                    <Person className="info-icon" />
                    <span className="patient-name">
                      {appointment.patient?.user_id?.full_name || "N/A"}
                    </span>
                  </div>
                  <div className="appointment-info">
                    <Telephone className="info-icon" />
                    <span>{appointment.patient?.user_id?.phone || "N/A"}</span>
                  </div>

                  <div className="appointment-info">
                    <GeoAlt className="info-icon" />
                    <span className="text-sm">
                      {appointment.clinic?.name || "N/A"}
                    </span>
                  </div>

                  <div className="appointment-info">
                    <FileText className="info-icon" />
                    <span className="text-sm text-gray-600">
                      {appointment.specialty?.name || "N/A"}
                    </span>
                  </div>

                  {appointment.reason && (
                    <div className="appointment-reason">
                      <span className="reason-label">Lý do khám:</span>
                      <span className="reason-text">{appointment.reason}</span>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  <button className="btn-action btn-view">Xem chi tiết</button>
                  {appointment.status === "SCHEDULED" && (
                    <>
                      <button
                        className="btn-action btn-complete"
                        onClick={() =>
                          updateAppointmentStatus(appointment._id, "COMPLETED")
                        }
                      >
                        Hoàn thành
                      </button>
                      <button
                        className="btn-action btn-cancel"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default memo(AppointmentSchedule);
