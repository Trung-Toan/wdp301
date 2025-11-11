import { memo, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  UserCheck,
  Clock,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { useDataByUrl } from "../../utility/data.utils";
import { doctorApi } from "../../api/doctor/doctorApi";

// =======================
// Presentational: StatCard
// =======================
const StatCard = ({ title, value, icon, color, link, change }) => {
  const bgColorClass = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    orange: "bg-yellow-500 hover:bg-yellow-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  }[color];

  const shadowColorClass = {
    blue: "shadow-blue-300/50",
    green: "shadow-green-300/50",
    orange: "shadow-yellow-300/50",
    purple: "shadow-purple-300/50",
  }[color];

  const changeTextClass =
    change === undefined ? "" : change >= 0 ? "text-green-400" : "text-red-400";

  const ChangeIcon =
    change !== undefined ? (change >= 0 ? TrendingUp : TrendingDown) : null;
  const changeValue = change !== undefined ? Math.abs(change) : null;

  return (
    <Link
      to={link}
      className={`relative p-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 ${bgColorClass} text-white ${shadowColorClass}`}
      style={{
        boxShadow: `0 10px 15px -3px ${
          shadowColorClass.split("/")[0].split("-")[1] === "blue"
            ? "rgba(59, 130, 246, 0.5)"
            : shadowColorClass.split("/")[0].split("-")[1] === "green"
            ? "rgba(34, 197, 94, 0.5)"
            : shadowColorClass.split("/")[0].split("-")[1] === "yellow"
            ? "rgba(245, 158, 11, 0.5)"
            : "rgba(168, 85, 247, 0.5)"
        }`,
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-lg font-medium opacity-80 mb-1">{title}</p>
          <h2 className="text-4xl font-extrabold">{value}</h2>
        </div>
        <div className="p-3 bg-white/20 rounded-full">{icon}</div>
      </div>

      {change !== undefined && (
        <div className="mt-4 pt-3 border-t border-white/30 flex items-center justify-between">
          <div className={`flex items-center text-sm font-semibold ${changeTextClass}`}>
            {ChangeIcon && <ChangeIcon size={16} className="mr-1" />}
            <span>{changeValue}% so với hôm qua</span>
          </div>
          <p className="text-sm opacity-80">Tổng lịch hẹn</p>
        </div>
      )}
    </Link>
  );
};

// ===========================
// Presentational: QuickAction
// ===========================
const QuickActionCard = ({ title, description, icon, link, color }) => {
  const iconColorClass = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-yellow-600 bg-yellow-100",
  }[color];

  return (
    <Link
      to={link}
      className="p-5 border border-gray-200 rounded-xl shadow-md bg-white transition duration-300 ease-in-out hover:shadow-lg hover:border-blue-400/50 flex flex-col items-start"
    >
      <div className={`p-3 rounded-full mb-3 ${iconColorClass}`}>{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
};

// =======================
// Container: Dashboard
// =======================
const DoctorDashboard = () => {
  // Lấy thông tin user từ sessionStorage (tuỳ app của bạn)
  const user =
    JSON.parse(sessionStorage.getItem("user")) || { username: "Bác sĩ" };

  // Gọi API một lần qua hook của bạn
  const { data, isLoading, error } = useDataByUrl({
    key: "dashboard",
    url: doctorApi.GET_DASHBOARD,
  });

  useEffect(() => {
    if (error) toast.error("Không thể tải dữ liệu bảng điều khiển.");
  }, [error]);

  // Chuẩn hoá dữ liệu nhận về: API trả { success, data }
  const stats = useMemo(
    () => ({
      todayPatients: data?.data?.todayPatients ?? 0,
      appointmentChange: data?.data?.appointmentChange ?? 0,
      pendingPrescriptions: data?.data?.pendingPrescriptions ?? 0,
      pendingRequests: data?.data?.pendingRequests ?? 0,
      totalPatients: data?.data?.totalPatients ?? 0,
      upcomingAppointments: data?.data?.upcomingAppointments ?? 0,
      todayAppointments: Array.isArray(data?.data?.todayAppointments)
        ? data.data.todayAppointments
        : [], // nếu backend có trả danh sách hôm nay
    }),
    [data]
  );

  const statCards = useMemo(
    () => [
      {
        title: "Bệnh nhân hôm nay",
        value: stats.todayPatients,
        icon: <UserCheck size={32} />,
        color: "blue",
        link: "/doctor/appointments?filter=today",
      },
      {
        title: "Lịch hẹn sắp tới",
        value: stats.upcomingAppointments,
        change: stats.appointmentChange,
        icon: <Calendar size={32} />,
        color: "green",
        link: "/doctor/appointments",
      },
      {
        title: "Đơn thuốc chờ duyệt",
        value: stats.pendingPrescriptions,
        icon: <Clock size={32} />,
        color: "orange",
        link: "/doctor/prescriptions?status=pending",
      },
      {
        title: "Yêu cầu bệnh án mới",
        value: stats.pendingRequests,
        icon: <FileText size={32} />,
        color: "purple",
        link: "/doctor/record-requests",
      },
    ],
    [stats]
  );

  // Helper format giờ (nếu backend có trả todayAppointments với thời điểm)
  const formatTime = (t) => {
    if (!t) return "--:--";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return String(t);
    return d.toLocaleTimeString("vi-VN", { 
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spinner animation="border" variant="primary" />
        <p className="ml-3 text-lg text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
              Chào mừng trở lại, BS. {user.username || "Tên Bác sĩ"} 👋
            </h1>
            <p className="text-lg text-gray-500">
              Tổng quan hoạt động vào{" "}
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="hidden sm:flex items-center text-blue-600 bg-blue-100 px-4 py-2 rounded-full font-semibold mt-4 sm:mt-0 shadow-inner">
            <Activity size={20} className="mr-2" />
            <span>Hoạt động</span>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Thống kê nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Quick Actions + Today Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActionCard
                title="Xem lịch khám"
                description="Quản lý lịch hẹn hôm nay & sắp tới"
                icon={<Calendar size={24} />}
                link="/doctor/appointments"
                color="blue"
              />
              <QuickActionCard
                title="Duyệt đơn thuốc"
                description="Kiểm tra và xác nhận đơn thuốc chờ"
                icon={<CheckCircle size={24} />}
                link="/doctor/prescriptions"
                color="green"
              />
              <QuickActionCard
                title="Quản lý bệnh nhân"
                description="Tìm kiếm và xem danh sách bệnh nhân"
                icon={<Users size={24} />}
                link="/doctor/patients"
                color="purple"
              />
              <QuickActionCard
                title="Hồ sơ y tế"
                description="Xem và cập nhật hồ sơ bệnh án"
                icon={<FileText size={24} />}
                link="/doctor/medical-records"
                color="orange"
              />
            </div>
          </div>

          {/* Today Appointments (nếu backend trả kèm danh sách) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Lịch hẹn hôm nay</h2>
              <Link
                to="/doctor/appointments"
                className="text-sm text-blue-600 font-medium hover:underline transition duration-150"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-4">
              {stats.todayAppointments?.length > 0 ? (
                stats.todayAppointments.map((appt, idx) => {
                  const name =
                    appt?.patient_name ||
                    appt?.full_name ||
                    appt?.patient?.full_name ||
                    `Bệnh nhân #${idx + 1}`;
                  const time =
                    appt?.time ||
                    appt?.start_time ||
                    appt?.slot_start_time ||
                    appt?.slot?.start_time;

                  return (
                    <div
                      key={appt?._id || idx}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <p className="font-semibold text-gray-800">{name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1" /> {formatTime(time)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500 italic">
                    Hôm nay không có lịch hẹn nào.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footnote tổng bệnh nhân */}
        <div className="mt-10 text-sm text-gray-500">
          Tổng số bệnh nhân đã thăm khám:{" "}
          <span className="font-semibold text-gray-700">{stats.totalPatients}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(DoctorDashboard);
