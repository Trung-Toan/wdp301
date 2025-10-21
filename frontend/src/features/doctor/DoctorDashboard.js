import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
} from "lucide-react";
import {
  getDashboardStats,
  getTodayAppointmentsList,
} from "../../services/doctorService";
import "../../styles/doctor/DoctorDashboard.css";

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayPatients: 0,
    appointmentChange: 0,
    pendingPrescriptions: 0,
    pendingRequests: 0,
    totalPatients: 0,
    upcomingAppointments: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await getDashboardStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch today's appointments
      const appointmentsResponse = await getTodayAppointmentsList("DOC001");
      if (appointmentsResponse.success) {
        // Format appointments for display
        const formattedAppointments = appointmentsResponse.data.map((apt) => ({
          id: apt.id,
          patientName: apt?.patient?.user?.full_name,
          start_time: apt?.slot?.start_time,
          end_time: apt?.slot?.end_time,
          type: apt.reason,
          status: apt.status,
        }));
        setRecentAppointments(formattedAppointments);
      }

      console.log("appointmentsResponse", appointmentsResponse);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Bệnh nhân hôm nay",
      value: stats.todayPatients,
      icon: <Users size={32} />,
      color: "blue",
      link: "/doctor/appointments",
    },
    {
      title: "Lịch hẹn",
      value: stats.upcomingAppointments,
      change: stats.appointmentChange,
      icon: <Calendar size={32} />,
      color: "green",
      link: "/doctor/appointments",
    },
    {
      title: "Đơn thuốc chờ duyệt",
      value: stats.pendingPrescriptions,
      icon: <CheckCircle size={32} />,
      color: "orange",
      link: "/doctor/prescriptions",
    },
    {
      title: "Yêu cầu bệnh án",
      value: stats.pendingRequests,
      icon: <FileText size={32} />,
      color: "purple",
      link: "/doctor/record-requests",
    },
  ];

  const quickActions = [
    {
      title: "Xem lịch khám",
      description: "Quản lý lịch hẹn hôm nay",
      icon: <Calendar size={24} />,
      link: "/doctor/appointments",
      color: "blue",
    },
    {
      title: "Duyệt đơn thuốc",
      description: "Xác nhận đơn thuốc chờ",
      icon: <CheckCircle size={24} />,
      link: "/doctor/prescriptions",
      color: "green",
    },
    {
      title: "Xem bệnh nhân",
      description: "Danh sách bệnh nhân",
      icon: <Users size={24} />,
      link: "/doctor/patients",
      color: "purple",
    },
    {
      title: "Hồ sơ bệnh án",
      description: "Quản lý hồ sơ y tế",
      icon: <FileText size={24} />,
      link: "/doctor/medical-records",
      color: "orange",
    },
  ];

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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard-new">
      <div className="dashboard-welcome">
        <div>
          <h1 className="welcome-title">
            Chào mừng trở lại, BS. {user.username}
          </h1>
          <p className="welcome-subtitle">
            Hôm nay là{" "}
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="activity-indicator">
          <Activity size={24} />
          <span>Hoạt động</span>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`stat-card stat-card-${card.color}`}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">{card.icon}</div>
              <div className="stat-info">
                <p className="stat-title">{card.title}</p>
                <h2 className="stat-value">{card.value}</h2>
              </div>
            </div>
            {card.change !== undefined && (
              <div
                className={`stat-change ${
                  card.change >= 0
                    ? "stat-change-positive"
                    : "stat-change-negative"
                }`}
              >
                {card.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{Math.abs(card.change)}% so với hôm qua</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Appointments */}
        <div className="appointments-section">
          <div className="section-header">
            <h2 className="section-title">Lịch hẹn hôm nay</h2>
            <Link to="/doctor/appointments" className="view-all-link">
              Xem tất cả
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="appointments-empty">
              <Calendar size={48} className="empty-icon" />
              <h3 className="empty-title">Không có lịch hẹn</h3>
              <p className="empty-description">
                Bạn chưa có lịch hẹn nào trong hôm nay
              </p>
            </div>
          ) : (
            <div className="appointments-table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th className="table-header">STT</th>
                    <th className="table-header">Thời gian</th>
                    <th className="table-header">Bệnh nhân</th>
                    <th className="table-header">Lý do khám</th>
                    <th className="table-header">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment, index) => (
                    <tr key={appointment.id} className="table-row">
                      <td className="table-cell">
                        <div className="appointment-number-badge">
                          #{index + 1}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="time-cell">
                          <Clock size={16} className="time-icon-inline" />
                          <span className="time-text">
                            {formatTime(appointment.start_time)} -{" "}
                            {formatTime(appointment.end_time)}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="patient-cell">
                          <div className="patient-avatar-small">
                            <Users size={16} />
                          </div>
                          <span className="patient-name-text">
                            {appointment.patientName}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="reason-text">{appointment.type}</span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`status-badge badge-${appointment.status}`}
                        >
                          {appointment.status === "confirmed"
                            ? "Đã xác nhận"
                            : "Chờ xác nhận"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <h2 className="section-title">Thao tác nhanh</h2>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`quick-action-card quick-action-${action.color}`}
              >
                <div className="quick-action-icon">{action.icon}</div>
                <h3 className="quick-action-title">{action.title}</h3>
                <p className="quick-action-description">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DoctorDashboard);
