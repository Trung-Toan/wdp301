"use client";

import { memo } from "react";
import { Link } from "react-router-dom";
import {
  People,
  CalendarCheck,
  Clock,
  Activity,
  CalendarHeart,
  PersonBadge,
  Briefcase,
  Building,
} from "react-bootstrap-icons";
import { getAvatarUrl } from "../../utils/imageUtils";
import AppointmentComponent from "./appointment.component";
import { useDataByUrl } from "../../utility/data.utils";
import { ASSISTANT_API } from "../../api/assistant/assistant.api";

const DoctorDashboard = () => {
  // Lấy dashboard stats qua hook
  const { data, isLoading, error } = useDataByUrl({
    url: ASSISTANT_API.GET_DASHBOARD,
    key: "dashboard-assistant",
  });

  // Map dữ liệu an toàn cho UI
  const stats = {
    todayPatients: data?.data?.todayPatients ?? 0,
    appointmentChange: data?.data?.appointmentChange ?? 0,
    pendingPrescriptions: data?.data?.pendingPrescriptions ?? 0,
    pendingRequests: data?.data?.pendingRequests ?? 0,
    totalPatients: data?.data?.totalPatients ?? 0,
    upcomingAppointments: data?.data?.upcomingAppointments ?? 0,
    doctor: data?.data?.doctor || null,
  };

  // Sắp xếp stat cards theo mức độ ưu tiên
  const statCards = [
    {
      title: "Lịch hẹn chờ duyệt",
      value: stats.pendingRequests,
      icon: <Clock size={28} />,
      color: "orange",
      link: "/assistant/appointments?status=SCHEDULED",
      priority: "high", // Ưu tiên cao nhất
      description: "Cần xử lý ngay",
    },
    {
      title: "Tổng lịch hẹn hôm nay",
      value: stats.upcomingAppointments,
      icon: <People size={28} />,
      color: "blue",
      link: "/assistant/appointments",
      priority: "medium",
      description: "Tất cả lịch hẹn",
    },
    {
      title: "Bệnh nhân đã duyệt",
      value: stats.todayPatients,
      icon: <CalendarCheck size={28} />,
      color: "green",
      link: "/assistant/appointments?status=COMPLETED",
      priority: "low",
      description: "Đã hoàn thành",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header với thông tin bác sĩ */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Welcome & Date */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                Chào mừng, Trợ lý!
              </h1>
              <p className="text-sm md:text-base text-gray-500">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <Activity size={20} />
              <span className="font-medium text-sm">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md p-4 mb-6">
            <p className="font-medium">Không thể tải thống kê dashboard. Vui lòng thử lại sau.</p>
          </div>
        )}

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`bg-white rounded-xl shadow-sm p-4 transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${card.color === "blue"
                ? "border-blue-500 hover:border-blue-600"
                : card.color === "green"
                  ? "border-green-500 hover:border-green-600"
                  : "border-orange-500 hover:border-orange-600"
                } ${card.priority === "high" ? "ring-2 ring-orange-200" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">{card.title}</p>
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">{card.value}</h2>
                  {card.description && (
                    <p className="text-xs text-gray-400">{card.description}</p>
                  )}
                </div>
                <div
                  className={`p-2.5 rounded-lg flex-shrink-0 ${card.color === "blue"
                    ? "bg-blue-100 text-blue-600"
                    : card.color === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                    }`}
                >
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột chính: Lịch hẹn hôm nay */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-5 md:p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Lịch hẹn hôm nay</h2>
                  <p className="text-sm text-gray-500 mt-1">Tổng cộng: {stats.upcomingAppointments} lịch hẹn</p>
                </div>
                <Link
                  to="/assistant/approve-appointments"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  Xem tất cả
                  <span>→</span>
                </Link>
              </div>
              <AppointmentComponent />
            </div>
          </div>

          {/* Cột phụ: Thao tác nhanh & Thông tin bác sĩ */}
          <div className="lg:col-span-1 space-y-6">
            {/* Thao tác nhanh */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-600" />
                Thao tác nhanh
              </h2>
              <div className="space-y-3">
                {[
                  {
                    title: "Duyệt lịch hẹn",
                    description: "Xử lý yêu cầu",
                    icon: <CalendarCheck size={20} />,
                    link: "/assistant/approve-appointments",
                    color: "blue",
                    badge: stats.pendingRequests > 0 ? stats.pendingRequests : null,
                  },
                  {
                    title: "Quản lý ca làm việc",
                    description: "Ca khám",
                    icon: <CalendarHeart size={20} />,
                    link: "/assistant/shift-schedule",
                    color: "green",
                  },
                  {
                    title: "Xem bệnh nhân",
                    description: "Danh sách",
                    icon: <People size={20} />,
                    link: "/doctor/patients",
                    color: "purple",
                  },
                ].map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`group relative p-3 rounded-lg flex items-center gap-3 transition-all hover:shadow-md ${action.color === "blue"
                      ? "bg-blue-50 hover:bg-blue-100"
                      : action.color === "green"
                        ? "bg-green-50 hover:bg-green-100"
                        : "bg-purple-50 hover:bg-purple-100"
                      }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${action.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : action.color === "green"
                          ? "bg-green-100 text-green-600"
                          : "bg-purple-100 text-purple-600"
                        }`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                    {action.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Thông tin bác sĩ chi tiết (nếu có) */}
            {stats.doctor && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-md p-5 border border-blue-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <PersonBadge className="text-blue-600" size={20} />
                  Bác sĩ được phân công
                </h2>
                <div className="space-y-3">
                  {/* Avatar và thông tin cơ bản */}
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getAvatarUrl(stats.doctor.avatar_url, stats.doctor._id, stats.doctor.name)}
                        alt={stats.doctor.name}
                        className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover"
                        onError={(e) => {
                          e.target.src = getAvatarUrl(null, null, stats.doctor.name);
                        }}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <PersonBadge className="text-white" size={10} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900">
                        {stats.doctor.title} {stats.doctor.name}
                      </p>
                      {stats.doctor.degree && (
                        <p className="text-xs text-gray-600 mt-0.5">{stats.doctor.degree}</p>
                      )}
                    </div>
                  </div>

                  {stats.doctor.specialties && stats.doctor.specialties.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">Chuyên khoa:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {stats.doctor.specialties.slice(0, 2).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white/80 rounded-md text-xs font-medium text-blue-700 border border-blue-200"
                          >
                            <Briefcase size={10} />
                            {specialty}
                          </span>
                        ))}
                        {stats.doctor.specialties.length > 2 && (
                          <span className="text-xs text-gray-500 self-center">
                            +{stats.doctor.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {stats.doctor.clinic && (
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex items-start gap-2">
                        <Building className="text-blue-600 mt-0.5 flex-shrink-0" size={14} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {stats.doctor.clinic.name}
                          </p>
                          {stats.doctor.clinic.address && (
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                              {typeof stats.doctor.clinic.address === 'string'
                                ? stats.doctor.clinic.address
                                : (stats.doctor.clinic.address.fullAddress ||
                                  [
                                    stats.doctor.clinic.address.houseNumber,
                                    stats.doctor.clinic.address.street,
                                    stats.doctor.clinic.address.alley,
                                    stats.doctor.clinic.address?.ward?.name,
                                    stats.doctor.clinic.address?.province?.name,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "Chưa có địa chỉ")
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DoctorDashboard);
