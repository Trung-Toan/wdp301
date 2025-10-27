"use client";

import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
// --- THAY ĐỔI 1: Đổi thư viện icon ---
import {
  People,
  CalendarCheck,
  Clock,
  Activity,
  CalendarHeart,
  FileText,
} from "react-bootstrap-icons";
// --- THAY ĐỔI 2: Dùng assistantService ---
import {
  getDashboardStats,
  getAppointments, // Dùng getAppointments thay vì getTodayAppointmentsList
} from "../../services/assistantService";
// --- THAY ĐỔI 3: Bỏ file CSS cũ ---
// import "../../styles/doctor/DoctorDashboard.css";

// Helper lấy ngày Local (YYYY-MM-DD)
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  // NOTE: Dùng ngày này để khớp với mock data trong assistantService.js
  // Khi chạy thật, hãy xóa dòng này
  return "2025-10-27";

  // Dùng dòng này khi chạy thật
  // return `${year}-${month}-${day}`;
};

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
  const doctorId = "DOC001"; // Cấu hình ID bác sĩ

  // --- THAY ĐỔI 4: Cập nhật logic fetch data ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const today = getLocalDate(); // Lấy ngày hôm nay

      // Fetch dashboard stats (đã có trong assistantService)
      const statsResponse = await getDashboardStats(doctorId);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch today's appointments (dùng getAppointments)
      const appointmentsResponse = await getAppointments({
        doctorId: doctorId,
        date: today,
      });

      if (appointmentsResponse.success) {
        // Format appointments cho đúng cấu trúc data
        const formattedAppointments = appointmentsResponse.data.map((apt) => ({
          id: apt._id, // Sửa id -> _id
          patientName: apt.patient?.name || "Bệnh nhân ẩn", // Sửa đường dẫn
          start_time: apt.shift?.start_time || "N/A", // Sửa đường dẫn
          end_time: apt.shift?.end_time || "N/A", // Sửa đường dẫn
          type: apt.reason || "Khám bệnh",
          status: apt.status, // SCHEDULED, COMPLETED, CANCELLED
        }));

        // Sắp xếp lịch hẹn (Chờ duyệt lên đầu)
        const statusSortOrder = { SCHEDULED: 1, COMPLETED: 2, CANCELLED: 3 };
        formattedAppointments.sort((a, b) => {
          const orderA = statusSortOrder[a.status] || 99;
          const orderB = statusSortOrder[b.status] || 99;
          return orderA - orderB;
        });

        setRecentAppointments(formattedAppointments);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };
  // ===========================================

  // --- THAY ĐỔI 5: Cập nhật Stat Cards (theo data mới) ---
  const statCards = [
    {
      title: "Bệnh nhân đã duyệt",
      value: stats.todayPatients, // Số BN đã duyệt (COMPLETED)
      icon: <CalendarCheck size={32} />,
      color: "green",
      link: "/assistant/approve-appointments",
    },
    {
      title: "Lịch hẹn chờ duyệt",
      value: stats.pendingRequests, // Số BN chờ duyệt (SCHEDULED)
      icon: <Clock size={32} />,
      color: "orange",
      link: "/assistant/approve-appointments",
    },
    {
      title: "Tổng lịch hẹn hôm nay",
      value: stats.upcomingAppointments, // Tổng số
      icon: <People size={32} />,
      color: "blue",
      link: "/assistant/approve-appointments",
    },
  ];

  // --- THAY ĐỔI 6: Cập nhật Quick Actions (đổi icon, đổi link) ---
  const quickActions = [
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
      link: "/doctor/patients", // Giả sử link này
      color: "purple",
    },
  ];

  // Helper render trạng thái (giống màn hình Duyệt lịch)
  const getStatusBadge = (status) => {
    const config = {
      SCHEDULED: { label: "Chờ duyệt", color: "blue" },
      COMPLETED: { label: "Đã duyệt", color: "green" },
      CANCELLED: { label: "Đã hủy", color: "red" },
    };
    return config[status] || { label: status, color: "gray" };
  };

  // --- THAY ĐỔI 7: Giao diện Loading (dùng Tailwind) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // --- THAY ĐỔI 8: Toàn bộ JSX được thiết kế lại bằng Tailwind ---
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`bg-white rounded-lg shadow-sm p-5 transition-all hover:shadow-md border-l-4
                ${card.color === "blue"
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
                    ${card.color === "blue"
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

              {/* Danh sách lịch hẹn (thiết kế lại) */}
              {recentAppointments.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarHeart size={48} className="mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-700">
                    Không có lịch hẹn
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Bạn chưa có lịch hẹn nào trong hôm nay.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((apt) => {
                    const status = getStatusBadge(apt.status);
                    return (
                      <div
                        key={apt.id}
                        className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div className="flex-shrink-0">
                            <People className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {apt.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Lý do: {apt.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock size={16} />
                            {/* Hiển thị trực tiếp, bỏ formatTime */}
                            <span className="text-sm font-medium">
                              {apt.start_time} - {apt.end_time}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold
                              ${status.color === "blue"
                                ? "bg-blue-100 text-blue-700"
                                : status.color === "green"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cột phụ: Thao tác nhanh */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`p-4 rounded-lg flex items-center gap-4 transition-all
                      ${action.color === "blue"
                        ? "bg-blue-50 hover:bg-blue-100"
                        : action.color === "green"
                          ? "bg-green-50 hover:bg-green-100"
                          : "bg-purple-50 hover:bg-purple-100"
                      }
                    `}
                  >
                    <div
                      className={`p-2 rounded-lg
                        ${action.color === "blue"
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