"use client";

import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  People,
  CalendarCheck,
  Clock,
  Activity,
  CalendarHeart,
} from "react-bootstrap-icons";
import {
  getDashboardStats,
  getAppointments, 
} from "../../services/assistantService";
import AppointmentComponent from "./appointment.component";
const getLocalDate = () => {
  return "2025-10-27";
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
      link: "/assistant/appointments",
    },
    {
      title: "Lịch hẹn chờ duyệt",
      value: stats.pendingRequests, // Số BN chờ duyệt (SCHEDULED)
      icon: <Clock size={32} />,
      color: "orange",
      link: "/assistant/appointments",
    },
    {
      title: "Tổng lịch hẹn hôm nay",
      value: stats.upcomingAppointments, // Tổng số
      icon: <People size={32} />,
      color: "blue",
      link: "/assistant/appointments",
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

              <AppointmentComponent/>
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