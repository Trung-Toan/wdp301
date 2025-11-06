import { useState, useEffect, memo } from "react";
import { toast } from "react-toastify";
import {
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  User,
  Award,
  Calendar,
  Building2,
  AlertCircle,
  X,
  Send,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { formatDateShort, formatDateTime } from "../../utils/dateTimeUtils";

const FILE_SERVER_URL = "http://localhost:5000/uploads";

// Helper function để xử lý URL ảnh
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${FILE_SERVER_URL}/${url}`;
};

const ApproveDoctorLicenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal từ chối
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLicense, setDetailLicense] = useState(null);

  // Hàm tải danh sách
  const fetchPendingLicenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminclinicAPI.getPendingLicenses();
      if (res.data.ok) {
        setLicenses(res.data.data);
      } else {
        throw new Error(res.data.message || "Không thể tải danh sách");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi tải danh sách: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách khi component mount
  useEffect(() => {
    fetchPendingLicenses();
  }, []);

  // Hàm xử lý khi bấm "Duyệt"
  const handleApprove = async (licenseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt chứng chỉ này?")) {
      return;
    }

    try {
      const payload = { status: "APPROVED" };
      await adminclinicAPI.updateLicenseStatus(licenseId, payload);
      toast.success("Duyệt chứng chỉ thành công!");

      // Xóa chứng chỉ khỏi danh sách
      setLicenses((prev) => prev.filter((lic) => lic._id !== licenseId));
    } catch (err) {
      toast.error("Lỗi khi duyệt: " + err.message);
    }
  };

  // Mở modal khi bấm "Từ chối"
  const openRejectModal = (license) => {
    setSelectedLicenseId(license._id);
    setSelectedLicense(license);
    setShowRejectModal(true);
  };

  // Đóng modal
  const closeRejectModal = () => {
    setSelectedLicenseId(null);
    setSelectedLicense(null);
    setShowRejectModal(false);
    setRejectionReason("");
    setIsSubmitting(false);
  };

  // Mở modal xem chi tiết
  const openDetailModal = (license) => {
    setDetailLicense(license);
    setShowDetailModal(true);
  };

  // Đóng modal chi tiết
  const closeDetailModal = () => {
    setDetailLicense(null);
    setShowDetailModal(false);
  };

  // Hàm xử lý khi xác nhận "Từ chối"
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: "REJECTED",
        rejected_reason: rejectionReason,
      };
      await adminclinicAPI.updateLicenseStatus(selectedLicenseId, payload);
      toast.success("Đã từ chối chứng chỉ.");

      // Xóa chứng chỉ khỏi danh sách
      setLicenses((prev) =>
        prev.filter((lic) => lic._id !== selectedLicenseId)
      );
      closeRejectModal();
    } catch (err) {
      toast.error("Lỗi khi từ chối: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Đang tải danh sách chứng chỉ chờ duyệt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-1">Lỗi</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-12 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-700 mb-2">Tuyệt vời!</h3>
          <p className="text-gray-600 text-lg">Không có chứng chỉ nào đang chờ duyệt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Duyệt chứng chỉ hành nghề</h1>
                <p className="text-gray-600 mt-1">
                  Có {licenses.length} chứng chỉ đang chờ duyệt
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách chứng chỉ */}
        <div className="space-y-6">
          {licenses.map((lic) => {
            const doctor = lic.doctor_id;
            const user = doctor?.user_id;

            // Xử lý avatar URL
            const avatarUrl = user?.avatar_url
              ? getImageUrl(user.avatar_url)
              : defaultAvatar;

            // Xử lý file URL
            const fileUrl =
              lic.document_url && lic.document_url.length > 0
                ? getImageUrl(lic.document_url[0])
                : "#";

            return (
              <div
                key={lic._id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header Card với thông tin bác sĩ */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt={user?.full_name || "Avatar"}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1.5 border-2 border-white">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {user?.full_name ? `BS. ${user.full_name}` : "Bác sĩ (Không rõ tên)"}
                      </h3>
                      {doctor?.title && (
                        <p className="text-gray-600 mb-1">{doctor.title}</p>
                      )}
                      {doctor?.clinic_id?.name && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm">{doctor.clinic_id.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700">Chờ duyệt</span>
                    </div>
                  </div>
                </div>

                {/* Chi tiết chứng chỉ */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Số hiệu chứng chỉ</label>
                          <p className="text-gray-900 font-semibold">{lic.licenseNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Cơ quan cấp</label>
                          <p className="text-gray-900 font-medium">{lic.issued_by}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Ngày cấp</label>
                          <p className="text-gray-900 font-medium">
                            {formatDateShort(lic.issued_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Ngày hết hạn</label>
                          <p className="text-gray-900 font-medium">
                            {lic.expiry_date ? formatDateShort(lic.expiry_date) : "Không có"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File đính kèm và thông tin khác */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fileUrl !== "#" && (
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-lg p-2">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">Tệp đính kèm</label>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline font-medium"
                            >
                              <Download className="h-4 w-4" />
                              <span className="text-sm">{lic.document_url[0]}</span>
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-lg p-2">
                          <Clock className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Ngày gửi</label>
                          <p className="text-gray-900 font-medium">{formatDateTime(lic.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => openDetailModal(lic)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
                    >
                      <Eye className="h-5 w-5" />
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => openRejectModal(lic)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                    >
                      <XCircle className="h-5 w-5" />
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleApprove(lic._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Duyệt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal từ chối */}
      {showRejectModal && selectedLicense && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeRejectModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Từ chối chứng chỉ</h2>
              </div>
              <button
                onClick={closeRejectModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Bác sĩ:</p>
              <p className="font-semibold text-gray-900">
                {selectedLicense.doctor_id?.user_id?.full_name
                  ? `BS. ${selectedLicense.doctor_id.user_id.full_name}`
                  : "Không rõ"}
              </p>
              <p className="text-sm text-gray-600 mt-2">Số hiệu:</p>
              <p className="font-medium text-gray-900">{selectedLicense.licenseNumber}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối chứng chỉ này..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              />
              {!rejectionReason.trim() && isSubmitting && (
                <p className="text-sm text-red-600 mt-1">Vui lòng nhập lý do từ chối.</p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={submitRejection}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {showDetailModal && detailLicense && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết chứng chỉ</h2>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Thông tin bác sĩ */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin bác sĩ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                    <p className="text-gray-900 font-semibold">
                      {detailLicense.doctor_id?.user_id?.full_name
                        ? `BS. ${detailLicense.doctor_id.user_id.full_name}`
                        : "Không rõ"}
                    </p>
                  </div>
                  {detailLicense.doctor_id?.title && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Chức danh</label>
                      <p className="text-gray-900 font-medium">{detailLicense.doctor_id.title}</p>
                    </div>
                  )}
                  {detailLicense.doctor_id?.clinic_id?.name && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phòng khám</label>
                      <p className="text-gray-900 font-medium">{detailLicense.doctor_id.clinic_id.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin chứng chỉ */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Thông tin chứng chỉ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Số hiệu chứng chỉ</label>
                    <p className="text-gray-900 font-semibold">{detailLicense.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cơ quan cấp</label>
                    <p className="text-gray-900 font-medium">{detailLicense.issued_by}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ngày cấp</label>
                    <p className="text-gray-900 font-medium">{formatDateShort(detailLicense.issued_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ngày hết hạn</label>
                    <p className="text-gray-900 font-medium">
                      {detailLicense.expiry_date ? formatDateShort(detailLicense.expiry_date) : "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ngày gửi</label>
                    <p className="text-gray-900 font-medium">{formatDateTime(detailLicense.createdAt)}</p>
                  </div>
                  {detailLicense.document_url && detailLicense.document_url.length > 0 && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tệp đính kèm</label>
                      <a
                        href={getImageUrl(detailLicense.document_url[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">{detailLicense.document_url[0]}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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

export default memo(ApproveDoctorLicenses);
