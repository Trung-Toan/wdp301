import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock4,
  CircleSlash,
  Star,
} from "lucide-react";
import { useDataByUrl } from "../../utility/data.utils";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";

const STATUS_LABELS = {
  SCHEDULED: { label: "Chờ duyệt", icon: Clock4, tone: "text-amber-600", pill: "bg-amber-100 text-amber-700" },
  APPROVE: { label: "Đã duyệt", icon: CheckCircle2, tone: "text-blue-600", pill: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Đã khám", icon: CheckCircle2, tone: "text-emerald-600", pill: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", icon: XCircle, tone: "text-rose-600", pill: "bg-rose-100 text-rose-700" },
  NO_SHOW: { label: "Vắng mặt", icon: CircleSlash, tone: "text-gray-600", pill: "bg-gray-100 text-gray-700" },
};

const numberFormat = (n) =>
  (typeof n === "number" ? n : 0).toLocaleString("vi-VN");

const percentFormat = (n) =>
  `${(typeof n === "number" && isFinite(n) ? Math.round(n) : 0)}%`;

const ClinicDashboard = () => {
  const { data, isLoading, error } = useDataByUrl({
    url: adminclinicAPI.GET_DASHBOARD,
    key: "dashboard-admin-clinic",
  });

  const dashboard = data?.data || {};

  // bookings7d: [{ date: "YYYY-MM-DD", total, completed }]
  const bookings7d = Array.isArray(dashboard.bookings7d) ? dashboard.bookings7d : [];

  // Tổng đặt lịch 7 ngày
  const totalBookings7d = useMemo(
    () => bookings7d.reduce((sum, d) => sum + (d?.total || 0), 0),
    [bookings7d]
  );

  // % thay đổi = (ngày gần nhất - ngày liền trước) / ngày liền trước * 100
  const bookingChange = useMemo(() => {
    if (bookings7d.length < 2) return 0;
    const last = bookings7d[bookings7d.length - 1]?.total || 0;
    const prev = bookings7d[bookings7d.length - 2]?.total || 0;
    if (prev === 0) return last > 0 ? 100 : 0;
    return ((last - prev) / prev) * 100;
  }, [bookings7d]);

  const totalDoctors = dashboard?.scope?.totalDoctors || 0;
  const upcomingAppointments = dashboard?.upcomingAppointments || 0;

  const todayStatus = dashboard?.today?.byStatus || {};
  const todayTotal = dashboard?.today?.total || 0;

  const avgRating = dashboard?.feedback?.avgRating || 0;
  const totalFeedbacks = dashboard?.feedback?.totalFeedbacks || 0;

  const statCards = [
    {
      title: "Tổng lượt đặt (7 ngày)",
      value: numberFormat(totalBookings7d),
      change: bookingChange,
      icon: <BarChart3 size={32} />,
      color: "blue",
      link: "/admin-clinic/dashboard",
    },
    {
      title: "Bác sĩ",
      value: numberFormat(totalDoctors),
      change: 0,
      icon: <Users size={32} />,
      color: "green",
      link: "/admin-clinic/manage-doctors",
    },
    {
      title: "Lịch sắp tới (7 ngày)",
      value: numberFormat(upcomingAppointments),
      icon: <CalendarClock size={32} />,
      color: "orange",
      link: "/admin-clinic/clinic/list",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-lg bg-gray-100" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 rounded-lg bg-gray-100" />
            <div className="h-32 rounded-lg bg-gray-100" />
            <div className="h-32 rounded-lg bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 rounded-lg bg-gray-100" />
            <div className="h-64 rounded-lg bg-gray-100" />
          </div>
          <div className="h-64 rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
          <AlertCircle size={20} />
          <div>
            <p className="m-0 font-semibold">Không tải được dữ liệu dashboard</p>
            <p className="m-0 text-sm">{error?.message || "Vui lòng thử lại sau."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bảng điều khiển phòng khám
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Quản lý và giám sát hoạt động tổng quan
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg text-blue-600">
          <Activity size={24} />
          <span className="font-medium">Hoạt động</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`p-5 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all ${card.color === "blue"
                ? "border-l-blue-500"
                : card.color === "green"
                  ? "border-l-green-500"
                  : "border-l-orange-500"
              }`}
          >
            <div className="flex items-start gap-4 mb-3">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color === "blue"
                    ? "bg-blue-100 text-blue-600"
                    : card.color === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
              >
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                  {card.title}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>
            {typeof card.change === "number" && card.change !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${card.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {card.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{percentFormat(Math.abs(card.change))} so với hôm qua</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hôm nay theo trạng thái */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Lịch hẹn hôm nay
            </h2>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
              {numberFormat(todayTotal)}
            </span>
          </div>

          {todayTotal === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-base font-semibold text-gray-900">
                Chưa có lịch hẹn
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Hệ thống sẽ cập nhật ngay khi có đặt lịch mới.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(todayStatus).map(([k, v]) => {
                const meta = STATUS_LABELS[k] || {
                  label: k,
                  icon: Activity,
                  tone: "text-gray-700",
                  pill: "bg-gray-100 text-gray-700",
                };
                const Icon = meta.icon;
                return (
                  <div
                    key={k}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={22} className={meta.tone} />
                      <span className={`text-xs font-bold px-2 py-1 rounded ${meta.pill}`}>
                        {meta.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {numberFormat(v)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phản hồi bệnh nhân */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Phản hồi bệnh nhân
          </h2>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </span>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"}
                    fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {numberFormat(totalFeedbacks)} đánh giá
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Điểm trung bình và tổng số đánh giá từ tất cả bác sĩ thuộc hệ thống phòng khám của bạn.
          </p>
        </div>
      </div>

      {/* Xu hướng 7 ngày */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Xu hướng 7 ngày</h2>
        {bookings7d.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-base font-semibold text-gray-900">Chưa có dữ liệu</h3>
            <p className="text-sm text-gray-500 mt-2">
              Khi có đặt lịch, biểu đồ xu hướng 7 ngày sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Ngày (UTC)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Tổng lịch
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Hoàn thành
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings7d.map((d) => (
                  <tr key={d.date} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{d.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{numberFormat(d.total || 0)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{numberFormat(d.completed || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ClinicDashboard);
