import { memo, useState } from "react";
import {
  Calendar,
  Clock,
  Person,
  CheckCircle,
  XCircle,
  ClockHistory,
  X,
} from "react-bootstrap-icons";
import "../../styles/doctor/appointment-schedule.css";
import { doctorApi } from "../../api/doctor/doctorApi";
import { useDataByUrl } from "../../utility/data.utils";

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
    console.error("Error fetching appointments:", error);
  }

  // Lấy dữ liệu từ hook
  const appointments = data?.data?.appointments || [];
  const slots = data?.data?.slot?.slot_list || [];
  const selectedSlotInfo = data?.data?.slot?.slot_select;

  // Lấy dữ liệu phân trang
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };
  const totalPages = pagination.totalPages;
  const totalItems = pagination.totalItems;

  // --- 2. Định nghĩa status ---
  const getStatusBadge = (status) => {
    const config = {
      SCHEDULED: { label: "Đã lên lịch", class: "status-scheduled", icon: ClockHistory },
      APPROVE: { label: "Chờ khám", class: "status-approve", icon: Person },
      COMPLETED: { label: "Hoàn thành", class: "status-completed", icon: CheckCircle },
      CANCELLED: { label: "Đã hủy", class: "status-cancelled", icon: XCircle },
      NO_SHOW: { label: "Không đến", class: "status-no-show", icon: XCircle },
    };
    return config[status] || config.SCHEDULED;
  };

  // --- 3. Các hàm định dạng (Đã sửa múi giờ) ---
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Lịch khám bệnh</h1>
              <p className="text-gray-500 mt-1">Quản lý và theo dõi lịch hẹn của bạn</p>
            </div>
          </div>
        </div>

        {/* Bộ lọc (Giữ nguyên) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Lọc trạng thái */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-semibold">
                Tổng số:{" "}
                <strong className="text-blue-900">{totalItems}</strong>{" "}
                lịch hẹn
              </span>
            </div>
          </div>

          {/* Lọc theo khung giờ (Slots) */}
          {slots.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} /> Lọc theo khung giờ:
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Nút "Tất cả" */}
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedSlot === null
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Tất cả
                </button>

                {/* Danh sách slots */}
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => {
                      setSelectedSlot(slot._id);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSlot === slot._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === DANH SÁCH LỊCH HẸN (GIAO DIỆN BẢNG MỚI) === */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-600">
            Đang tải dữ liệu...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            Không có lịch hẹn nào phù hợp.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    STT
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bệnh nhân
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số điện thoại
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Giờ khám
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((item, index) => {
                  const { appointment, patient } = item;
                  const statusInfo = getStatusBadge(appointment.status);
                  const StatusIcon = statusInfo.icon;
                  const itemNumber = (page - 1) * limit + index + 1;

                  return (
                    <tr key={appointment.appointment_id}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {patient.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {selectedSlotInfo
                          ? formatTime(selectedSlotInfo.start_time)
                          : formatDate(appointment.scheduled_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.class}`}
                        >
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* === KẾT THÚC BẢNG === */}

        {/* --- PHÂN TRANG --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Trang trước
            </button>
            <div className="flex items-center gap-2">
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
                className="w-16 text-center border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={loading}
              />
              <span className="text-gray-600">/ {totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* === MODAL CHI TIẾT (Giữ nguyên giao diện modal đẹp) === */}
      {showModal && selectedAppointment && (
        <div className="appointment-modal-overlay">
          <div className="appointment-modal-backdrop" onClick={handleCloseModal}></div>
          <div className="appointment-modal-panel">
            {/* Header */}
            <div className="appointment-modal-header">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} /> Chi tiết lịch khám
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="appointment-modal-content p-6 space-y-4">
              {/* Thông tin bệnh nhân */}
              <div>
                <h4 className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Person className="text-blue-500" size={18} />
                  Thông tin bệnh nhân
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-gray-600">Họ và tên:</span>{" "}
                    <span className="font-semibold text-gray-800">{selectedAppointment.patient?.patient_name}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Mã BN:</span>{" "}
                    {selectedAppointment.patient?.patient_code}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Số điện thoại:</span>{" "}
                    {selectedAppointment.patient?.phone_number}
                  </p>
                </div>
              </div>

              {/* Thông tin lịch hẹn */}
              <div>
                <h4 className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <ClockHistory className="text-blue-500" size={18} />
                  Thông tin lịch hẹn
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-gray-600">Ngày khám:</span>{" "}
                    {formatDate(selectedAppointment.appointment?.scheduled_date)}
                  </p>
                  
                  <p>
                    <span className="font-medium text-gray-600">Giờ khám:</span>{" "}
                    {selectedSlotInfo 
                      ? formatTime(selectedSlotInfo.start_time)
                      : <span className="text-gray-500 italic">Không rõ (xem cả ngày)</span>
                    }
                  </p>
                  
                  <p className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Trạng thái:</span>{" "}
                    {(() => {
                        const statusInfo = getStatusBadge(selectedAppointment.appointment?.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.class}`}
                          >
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        );
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="appointment-modal-footer p-4 bg-gray-50 border-t">
              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* === KẾT THÚC MODAL === */}
    </div>
  );
};

export default memo(AppointmentSchedule);