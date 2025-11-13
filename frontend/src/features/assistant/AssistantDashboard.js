"use client";

import { memo } from "react";
import { Link } from "react-router-dom";
import {
  People,
  CalendarCheck,
  Clock,
  Activity,
  CalendarHeart,
} from "react-bootstrap-icons";
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
  };

  const statCards = [
    {
      title: "Bệnh nhân đã duyệt",
      value: stats.todayPatients, // COMPLETED hôm nay
      icon: <CalendarCheck size={32} />,
      color: "green",
      link: "/assistant/appointments?status=COMPLETED",
    },
    {
      title: "Lịch hẹn chờ duyệt",
      value: stats.pendingRequests, // SCHEDULED hôm nay
      icon: <Clock size={32} />,
      color: "orange",
      link: "/assistant/appointments?status=SCHEDULED",
    },
    {
      title: "Tổng lịch hẹn hôm nay",
      value: stats.upcomingAppointments, // Tổng lịch hôm nay
      icon: <People size={32} />,
      color: "blue",
      link: "/assistant/appointments",
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Chào mừng, Trợ lý!
            </h1>
            <p className="text-gray-500 mt-1">
              Hôm nay là{" "}
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Activity size={24} />
            <span className="font-medium">Hoạt động</span>
          </div>
        </div>

        {/* Error banner (nếu có) */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4">
            Không thể tải thống kê dashboard. Vui lòng thử lại sau.
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`bg-white rounded-lg shadow-sm p-5 transition-all hover:shadow-md border-l-4
                ${
                  card.color === "blue"
                    ? "border-blue-500"
                    : card.color === "green"
                    ? "border-green-500"
                    : "border-orange-500"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <p className="text-gray-500 font-medium">{card.title}</p>
                  <h2 className="text-4xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </h2>
                </div>
                <div
                  className={`p-3 rounded-lg
                    ${
                      card.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : card.color === "green"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }
                  `}
                >
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dashboard Content (2 cột) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột chính: Lịch hẹn */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Lịch hẹn hôm nay
                </h2>
                <Link
                  to="/assistant/approve-appointments"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              {/* AppointmentComponent đã dùng hook useDataByUrl nội bộ */}
              <AppointmentComponent />
            </div>
          </div>

          {/* Cột phụ: Thao tác nhanh */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    title: "Duyệt lịch hẹn",
                    description: "Duyệt hoặc hủy lịch hẹn",
                    icon: <CalendarCheck size={24} />,
                    link: "/assistant/approve-appointments",
                    color: "blue",
                  },
                  {
                    title: "Quản lý ca làm việc",
                    description: "Thêm, sửa, xóa ca làm việc",
                    icon: <CalendarHeart size={24} />,
                    link: "/assistant/shift-schedule",
                    color: "green",
                  },
                  {
                    title: "Xem bệnh nhân",
                    description: "Danh sách bệnh nhân",
                    icon: <People size={24} />,
                    link: "/doctor/patients",
                    color: "purple",
                  },
                ].map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`p-4 rounded-lg flex items-center gap-4 transition-all
                      ${
                        action.color === "blue"
                          ? "bg-blue-50 hover:bg-blue-100"
                          : action.color === "green"
                          ? "bg-green-50 hover:bg-green-100"
                          : "bg-purple-50 hover:bg-purple-100"
                      }
                    `}
                  >
                    <div
                      className={`p-2 rounded-lg
                        ${
                          action.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : action.color === "green"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                        }
                      `}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DoctorDashboard);
