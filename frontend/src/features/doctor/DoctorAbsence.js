import { memo, useState, useEffect } from "react";
import {
  CalendarOff,
  Clock,
  AlertTriangle,
  History,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { doctorApi } from "../../api/doctor/doctorApi";

const DoctorAbsence = () => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    reason: "",
  });

  // Modal confirm state
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getMyAbsences();
      if (res.data?.ok) {
        setAbsences(res.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử nghỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.startTime || !formData.endTime || !formData.reason) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const now = new Date();

    if (start < now) {
      toast.error("Thời gian bắt đầu không được ở trong quá khứ!");
      return false;
    }

    if (end <= start) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return false;
    }

    return true;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await doctorApi.registerAbsence({
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        reason: formData.reason,
      });

      if (res.data?.ok) {
        toast.success(
          `Đăng ký nghỉ thành công. ${
            res.data.message || "Các lịch hẹn trùng đã được xử lý."
          }`
        );
        setFormData({ startTime: "", endTime: "", reason: "" });
        setShowConfirm(false);
        fetchAbsences(); // Refresh list
      } else {
        toast.error(res.data?.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      console.error("Lỗi đăng ký nghỉ:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <CalendarOff className="w-8 h-8 text-red-500" />
          Thông báo nghỉ đột xuất
        </h1>
        <p className="text-gray-600 mt-2 max-w-3xl">
          Đăng ký thời gian nghỉ của bạn. Hệ thống sẽ{" "}
          <span className="font-bold text-red-600">TỰ ĐỘNG HỦY</span> các lịch
          khám đã đặt trong khoảng thời gian này và gửi thông báo cho bệnh nhân.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section (Left) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-white p-6 border-b border-red-100">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Tạo yêu cầu nghỉ mới
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handlePreSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do nghỉ
                  </label>
                  <textarea
                    rows={3}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="VD: Việc gia đình, Sức khỏe..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                    required
                  />
                </div>

                {/* Cảnh báo */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-800">
                        Lưu ý quan trọng
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Khi xác nhận, tất cả các lịch hẹn trùng sẽ bị hủy ngay lập tức.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Gửi yêu cầu nghỉ"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* History Section (Right) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Lịch sử nghỉ phép
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {absences.length} bản ghi
              </span>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : absences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <History className="w-12 h-12 mb-3 opacity-50" />
                  <p>Chưa có lịch sử nghỉ phép nào.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian bắt đầu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian kết thúc
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lý do
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {absences.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              {formatDate(item.startTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              {formatDate(item.endTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs truncate">
                              {item.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đã duyệt
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirm (Custom Tailwind Modal) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Xác nhận nghỉ
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4 text-center">
                Bạn có chắc chắn muốn đăng ký nghỉ trong khoảng thời gian:
              </p>
              <div className="bg-gray-100 rounded-lg p-4 text-center mb-6 border border-gray-200">
                <p className="font-bold text-gray-800 text-lg">
                  {formData.startTime && formatDate(formData.startTime)}
                </p>
                <p className="text-gray-500 text-sm my-1">đến</p>
                <p className="font-bold text-gray-800 text-lg">
                  {formData.endTime && formatDate(formData.endTime)}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Cảnh báo tác động:
                </h4>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Hệ thống sẽ <span className="font-bold">HỦY</span> tất cả lịch khám đã đặt.</li>
                  <li>Thông báo hủy sẽ được gửi đến bệnh nhân.</li>
                  <li>Bạn không thể nhận lịch mới trong thời gian này.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận hủy lịch & Nghỉ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DoctorAbsence);