import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
} from "lucide-react";

const ClinicDashboard = () => {
  const [clinicData, setClinicData] = useState({
    clinicType: "MULTIPLE_DOCTORS",
    totalBookings: 245,
    bookingChange: 12,
    totalDoctors: 8,
    doctorChange: 0,
    topSpecialties: [
      { name: "Tim mạch", count: 45 },
      { name: "Nhi khoa", count: 38 },
      { name: "Ngoại khoa", count: 32 },
    ],
    overloadAlerts: [
      {
        id: 1,
        doctorName: "BS. Nguyễn Văn A",
        avgTimePerPatient: 12,
        status: "CRITICAL",
        appointmentCount: 18,
      },
      {
        id: 2,
        doctorName: "BS. Trần Thị B",
        avgTimePerPatient: 14,
        status: "WARNING",
        appointmentCount: 16,
      },
    ],
    doctorPerformance: [
      { name: "BS. Nguyễn Văn A", rating: 4.8, reviews: 156 },
      { name: "BS. Trần Thị B", rating: 4.6, reviews: 142 },
      { name: "BS. Lê Văn C", rating: 4.5, reviews: 128 },
    ],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const statCards = [
    {
      title: "Tổng lượt đặt lịch",
      value: clinicData.totalBookings,
      change: clinicData.bookingChange,
      icon: <BarChart3 size={32} />,
      color: "blue",
      link: "/clinic-admin/dashboard",
    },
    {
      title: "Bác sĩ",
      value: clinicData.totalDoctors,
      change: clinicData.doctorChange,
      icon: <Users size={32} />,
      color: "green",
      link: "/clinic-admin/doctors",
    },
    {
      title: "Cảnh báo quá tải",
      value: clinicData.overloadAlerts.length,
      icon: <AlertTriangle size={32} />,
      color: "orange",
      link: "#alerts",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bảng điều khiển phòng khám
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Quản lý và giám sát hoạt động của phòng khám
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg text-blue-600">
          <Activity size={24} />
          <span className="font-medium">Hoạt động</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`p-5 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all ${
              card.color === "blue"
                ? "border-l-blue-500"
                : card.color === "green"
                ? "border-l-green-500"
                : "border-l-orange-500"
            }`}
          >
            <div className="flex items-start gap-4 mb-3">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  card.color === "blue"
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
            {card.change !== undefined && card.change !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  card.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {card.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{Math.abs(card.change)}% so với tuần trước</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overload Alerts */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Cảnh báo quá tải
            </h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {clinicData.overloadAlerts.length}
            </span>
          </div>

          {clinicData.overloadAlerts.length === 0 ? (
            <div className="text-center py-10">
              <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-base font-semibold text-gray-900">
                Không có cảnh báo
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Tất cả bác sĩ đều có lịch khám hợp lý
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clinicData.overloadAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                    alert.status === "CRITICAL"
                      ? "bg-red-50 border-l-red-500"
                      : "bg-orange-50 border-l-orange-500"
                  }`}
                >
                  <AlertTriangle
                    size={24}
                    className={
                      alert.status === "CRITICAL"
                        ? "text-red-500"
                        : "text-orange-500"
                    }
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {alert.doctorName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Trung bình {alert.avgTimePerPatient} phút/bệnh nhân (
                      {alert.appointmentCount} lịch hôm nay)
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                      alert.status === "CRITICAL"
                        ? "bg-red-500 text-white"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {alert.status === "CRITICAL" ? "Nguy hiểm" : "Cảnh báo"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Specialties */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Chuyên khoa hàng đầu
          </h2>
          <div className="space-y-3">
            {clinicData.topSpecialties.map((specialty, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {specialty.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {specialty.count} lượt đặt
                  </p>
                </div>
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    style={{
                      width: `${
                        (specialty.count / clinicData.topSpecialties[0].count) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Hiệu suất bác sĩ
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Bác sĩ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Đánh giá
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Số đánh giá
                </th>
              </tr>
            </thead>
            <tbody>
              {clinicData.doctorPerformance.map((doctor, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {doctor.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {doctor.rating}
                      </span>
                      <span className="text-xs text-yellow-500">
                        {"★".repeat(Math.floor(doctor.rating))}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.reviews} đánh giá
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default memo(ClinicDashboard);
