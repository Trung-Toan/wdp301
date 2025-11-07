import { memo, useState } from "react";
import {
  Calendar,
  Clock,
  User, // Thay thế Person
  CheckCircle,
  XCircle,
  History, // Thay thế ClockHistory
  X,
  Hourglass, // Icon bổ sung cho trạng thái
  Search, // Icon bổ sung cho nút chi tiết
} from "lucide-react"; // Sử dụng Lucide React cho giao diện hiện đại
import { Spinner } from "react-bootstrap";
// import "../../styles/doctor/appointment-schedule.css"; // Đã bỏ CSS ngoài
import { doctorApi } from "../../api/doctor/doctorApi";
import { useDataByUrl } from "../../utility/data.utils";
import { toast } from "react-toastify"; // Thêm toast để thông báo lỗi

const AppointmentSchedule = () => {
  // State cho bộ lọc
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // State cho Phân trang
  const [page, setPage] = useState(1);
  const limit = 10;

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // --- 1. Lấy dữ liệu bằng useDataByUrl ---
  const params = {
    page: page,
    limit: limit,
    status: filterStatus === "ALL" ? "" : filterStatus,
    date: selectedDate,
    slot: selectedSlot,
  };

  const { data, isLoading: loading, error } = useDataByUrl({
    url: doctorApi.GET_LIST_APPOINTMENT,
    key: ["doctor-appointments", ...Object.values(params)],
    params: params,
  });

  if (error) {
    toast.error("Lỗi khi tải dữ liệu lịch hẹn.");
  }

  // Lấy dữ liệu từ hook
  const appointments = data?.data?.appointments || [];
  const slots = data?.data?.slot?.slot_list || [];
  const selectedSlotInfo = data?.data?.slot?.slot_select;

  // Lấy dữ liệu phân trang
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };
  const totalPages = pagination.totalPages;
  const totalItems = pagination.totalItems;

  // --- 2. Định nghĩa status (dùng Tailwind) ---
  const getStatusBadge = (status) => {
    const config = {
      SCHEDULED: {
        label: "Đã lên lịch",
        class: "bg-blue-100 text-blue-700 border-blue-200",
        icon: History,
      },
      APPROVE: {
        label: "Chờ khám",
        class: "bg-green-100 text-green-700 border-green-200",
        icon: User,
      },
      COMPLETED: {
        label: "Hoàn thành",
        class: "bg-gray-200 text-gray-700 border-gray-300",
        icon: CheckCircle,
      },
      CANCELLED: {
        label: "Đã hủy",
        class: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      },
      NO_SHOW: {
        label: "Không đến",
        class: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Hourglass,
      },
    };
    return config[status] || { label: status, class: "bg-gray-100 text-gray-600 border-gray-300", icon: Clock };
  };

  // --- 3. Các hàm định dạng (Giữ nguyên) ---
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      return new Date(timeString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return "N/A";
    }
  };

  // --- 4. Xử lý Modal ---
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/50">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Lịch khám bệnh
              </h1>
              <p className="text-gray-500 mt-1">
                Quản lý và theo dõi lịch hẹn của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Lọc ngày */}
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                />
              </div>

              {/* Lọc trạng thái */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 appearance-none bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SCHEDULED">Đã lên lịch</option>
                <option value="APPROVE">Chờ khám</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="NO_SHOW">Không đến</option>
              </select>
            </div>

            {/* Tổng số */}
            <div className="px-4 py-2 bg-blue-100 rounded-lg border border-blue-200">
              <span className="text-blue-700 font-semibold text-sm">
                Tổng số:{" "}
                <strong className="text-blue-900 text-lg">
                  {totalItems}
                </strong>{" "}
                lịch hẹn
              </span>
            </div>
          </div>

          {/* Lọc theo khung giờ (Slots) */}
          {slots.length > 0 && (
            <div className="mt-5 pt-3 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Chọn khung giờ khám:
              </h3>
              <div className="flex flex-wrap gap-3">
                {/* Nút "Tất cả" */}
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                    selectedSlot === null
                      ? "bg-blue-600 text-white shadow-blue-300/50"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
                  }`}
                >
                  Tất cả khung giờ
                </button>

                {/* Danh sách slots */}
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => {
                      setSelectedSlot(slot._id);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                      selectedSlot === slot._id
                        ? "bg-blue-600 text-white shadow-blue-300/50"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
                    }`}
                  >
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === DANH SÁCH LỊCH HẸN (BẢNG) === */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-600 flex justify-center items-center">
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ml-3">Đang tải dữ liệu...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-lg font-medium">Không có lịch hẹn nào phù hợp.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      STT
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Bệnh nhân
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Số điện thoại
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Giờ khám
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {appointments.map((item, index) => {
                    const { appointment, patient } = item;
                    const statusInfo = getStatusBadge(appointment.status);
                    const StatusIcon = statusInfo.icon;
                    const itemNumber = (page - 1) * limit + index + 1;

                    return (
                      <tr
                        key={appointment.appointment_id}
                        className="hover:bg-gray-50 transition duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {itemNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {patient.patient_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mã BN: {patient.patient_code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">
                          {patient.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {selectedSlotInfo
                            ? formatTime(selectedSlotInfo.start_time)
                            : formatDate(appointment.scheduled_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border ${statusInfo.class}`}
                          >
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="text-blue-600 p-2 rounded-full hover:bg-blue-100 transition"
                            title="Xem chi tiết"
                          >
                            <Search size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PHÂN TRANG --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8 p-3 bg-white rounded-xl shadow-md border border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
            >
              Trang trước
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Trang</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= totalPages) setPage(value);
                  else if (value > totalPages) setPage(totalPages);
                  else if (value < 1) setPage(1);
                }}
                className="w-16 text-center border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                disabled={loading}
              />
              <span className="text-gray-600">/ {totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* === MODAL CHI TIẾT (Slide-in Panel) === */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>
          
          {/* Panel */}
          <div className="relative z-50 w-full sm:w-[450px] h-full bg-white shadow-2xl rounded-l-xl transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-blue-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar className="text-blue-600" size={24} /> Chi tiết lịch khám
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Thông tin bệnh nhân */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3 border-b pb-2">
                  <User size={18} /> Thông tin bệnh nhân
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">Họ và tên:</span>{" "}
                    {selectedAppointment.patient?.patient_name}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Mã BN:</span>{" "}
                    {selectedAppointment.patient?.patient_code}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">SĐT:</span>{" "}
                    {selectedAppointment.patient?.phone_number}
                  </p>
                </div>
              </div>

              {/* Thông tin lịch hẹn */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3 border-b pb-2">
                  <History size={18} /> Thông tin lịch hẹn
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">Ngày khám:</span>{" "}
                    {formatDate(selectedAppointment.appointment?.scheduled_date)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Giờ khám:</span>{" "}
                    {selectedSlotInfo 
                      ? formatTime(selectedSlotInfo.start_time)
                      : <span className="text-gray-500 italic">Xem cả ngày</span>
                    }
                  </p>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 mr-2">Trạng thái:</span>{" "}
                    {(() => {
                        const statusInfo = getStatusBadge(selectedAppointment.appointment?.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border ${statusInfo.class}`}
                          >
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl px-5 py-2 font-semibold transition"
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