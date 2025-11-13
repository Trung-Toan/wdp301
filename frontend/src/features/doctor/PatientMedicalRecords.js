import { memo, useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Send,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FolderOpen,
  Search,
} from "lucide-react";
import { doctorApi } from "../../api/doctor/doctorApi";
import { useDataByUrl } from "../../utility/data.utils";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

// Helper: lấy ID hồ sơ an toàn từ nhiều kiểu dữ liệu
const getRecordId = (rec) => rec?._id ?? rec?.id ?? rec?.record_id ?? null;

const MedicalRecordRequests = () => {
  const [patientCode, setPatientCode] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [message, setMessage] = useState(null);

  // Multi-select state
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);

  const [reason, setReason] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phân trang lịch sử
  const [page, setPage] = useState(1);
  const limit = 10;

  // --- Lấy lịch sử yêu cầu ---
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useDataByUrl({
    url: doctorApi.VIEW_LIST_HISTORY_REQUEST_VIEW_MEDICAL_RECORD,
    key: ["medical-record-request-history", page],
    params: { page, limit },
  });

  const accessRequests = historyData?.data?.history_request || [];
  const pagination = historyData?.pagination || {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };
  const totalPages = pagination.totalPages;

  useEffect(() => {
    if (historyError) {
      toast.error("Lỗi khi tải lịch sử yêu cầu truy cập.");
    }
  }, [historyError]);

  // Định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Tìm bệnh nhân ---
  const handleFindPatient = async (e) => {
    e.preventDefault();

    if (!patientCode.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập mã bệnh nhân." });
      return;
    }

    setIsSearching(true);
    setFoundPatient(null);
    setPatientRecords([]);
    setMessage(null);
    setSelectedRecordIds([]); // reset lựa chọn

    try {
      const res = await doctorApi.searchMedicalRecords(patientCode.trim());
      const records = res.data?.data || [];

      if (records.length === 0) {
        setMessage({
          type: "error",
          text: `Không tìm thấy hồ sơ bệnh án nào cho mã BN: ${patientCode}.`,
        });
        return;
      }

      const patientInfo = {
        _id: records[0].patient_id,
        name: records[0].patient_name,
        code: records[0].patient_code,
      };

      setFoundPatient(patientInfo);
      setPatientRecords(records);
      setMessage({
        type: "success",
        text: `Đã tìm thấy ${records.length} hồ sơ bệnh án của bệnh nhân ${patientInfo.name}.`,
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Lỗi khi tìm hồ sơ bệnh án." });
    } finally {
      setIsSearching(false);
    }
  };

  // Tự động loại bỏ ID không còn tồn tại khi danh sách thay đổi
  useEffect(() => {
    const validIds = new Set(patientRecords.map(getRecordId).filter(Boolean));
    setSelectedRecordIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [patientRecords]);

  // --- Multi-select logic ---
  const toggleRecord = (recordId) => {
    if (!recordId) return;
    setSelectedRecordIds((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  };

  const visibleRecordIds = useMemo(
    () => patientRecords.map(getRecordId).filter(Boolean),
    [patientRecords]
  );

  const isAllSelected =
    visibleRecordIds.length > 0 &&
    visibleRecordIds.every((id) => selectedRecordIds.includes(id));

  const toggleSelectAll = () => {
    if (visibleRecordIds.length === 0) return;
    setSelectedRecordIds((prev) => {
      const allCurrentlySelected = visibleRecordIds.every((id) =>
        prev.includes(id)
      );
      if (allCurrentlySelected) {
        return prev.filter((id) => !visibleRecordIds.includes(id));
      } else {
        return Array.from(new Set([...prev, ...visibleRecordIds]));
      }
    });
  };

  const clearSelection = () => setSelectedRecordIds([]);

  // --- Gửi yêu cầu ---
  const handleSendRequest = async () => {
    if (!foundPatient || selectedRecordIds.length === 0 || !reason.trim()) {
      toast.error("Vui lòng chọn hồ sơ và nhập lý do.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tasks = selectedRecordIds.map((recordId) =>
        doctorApi.requestMedicalRecordAccess(foundPatient._id, recordId, reason)
      );

      const results = await Promise.allSettled(tasks);
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Gửi thành công ${successCount} yêu cầu truy cập.`);
      }
      if (failCount > 0) {
        toast.error(`Có ${failCount} yêu cầu gửi thất bại.`);
      }

      await refetchHistory();
      if (page !== 1) setPage(1);

      if (failCount === 0) {
        clearSelection();
        setReason("");
        setPatientRecords([]);
        setFoundPatient(null);
        setPatientCode("");
        setMessage({ type: "success", text: "Gửi yêu cầu thành công!" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
            <CheckCircle size={14} /> Đã duyệt
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
            <Clock size={14} /> Chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
            <XCircle size={14} /> Từ chối
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
            <Clock size={14} /> Khác
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 lg:p-10 bg-gray-50 min-h-screen">
      {/* Cột trái: Tìm kiếm & Gửi yêu cầu */}
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-100 flex-shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-700 border-b pb-3">
          <UserPlus size={24} /> Yêu cầu Truy cập Hồ sơ
        </h2>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form tìm kiếm */}
        <form onSubmit={handleFindPatient} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Mã bệnh nhân
            </label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                placeholder="Nhập mã bệnh nhân..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                disabled={isSearching || isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-400"
          >
            {isSearching ? <Spinner animation="border" size="sm" /> : <FolderOpen size={18} />}
            {isSearching ? "Đang tìm..." : "Tìm hồ sơ"}
          </button>
        </form>

        {/* Kết quả tìm kiếm + multi-select */}
        {foundPatient && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-gray-800 text-lg">
                <span className="text-blue-600">{foundPatient.name}</span> ({foundPatient.code})
              </h3>
              {selectedRecordIds.length > 0 && (
                <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                  Đã chọn {selectedRecordIds.length}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-700 text-base">
                Chọn hồ sơ cần yêu cầu ({patientRecords.length})
              </h4>
              {patientRecords.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                  {selectedRecordIds.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Xóa lựa chọn
                    </button>
                  )}
                </div>
              )}
            </div>

            {patientRecords.length === 0 ? (
              <p className="text-gray-500 text-sm italic p-3 bg-gray-50 rounded-lg">
                Không có hồ sơ nào.
              </p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {patientRecords.map((rec, idx) => {
                  const id = getRecordId(rec);
                  const isSelected = !!id && selectedRecordIds.includes(id);
                  const displayDate = formatDate(rec.createdAt).split(",")[0];

                  return (
                    <div
                      key={id || idx}
                      onClick={() => id && toggleRecord(id)}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 shadow-sm select-none ${
                        isSelected
                          ? "border-green-500 bg-green-50 ring-2 ring-green-300"
                          : "border-gray-200 hover:bg-gray-50"
                      } ${!id ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex flex-col flex-grow truncate">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {rec.diagnosis || "Chưa có chẩn đoán"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> Ngày khám: {displayDate}
                        </p>
                      </div>

                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md border-2 transition-colors ${
                          isSelected
                            ? "border-green-600 bg-green-600"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {isSelected && <span className="w-2.5 h-2.5 bg-white rounded-sm"></span>}
                      </span>
                    </div>
                  );
                })}
              </ul>
            )}

            {/* Lý do + Gửi */}
            {selectedRecordIds.length > 0 && (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Lý do xem hồ sơ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  onClick={handleSendRequest}
                  disabled={isSubmitting || !reason.trim()}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md disabled:bg-gray-400"
                >
                  {isSubmitting ? <Spinner animation="border" size="sm" /> : <Send size={18} />}
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu truy cập"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cột phải: Lịch sử yêu cầu */}
      <div className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 flex flex-col border border-gray-100">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-blue-700 border-b pb-3">
          <FileText size={24} /> Lịch sử Yêu cầu Truy cập
        </h2>

        {isHistoryLoading ? (
          <div className="flex flex-col items-center justify-center p-10 flex-grow">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-gray-600">Đang tải lịch sử...</p>
          </div>
        ) : accessRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 flex-grow text-gray-500">
            <FileText size={48} className="mb-3 text-gray-400" />
            <p className="font-medium text-lg">Chưa có yêu cầu nào được gửi.</p>
            <p className="text-sm">Hãy tìm kiếm bệnh nhân và gửi yêu cầu xem hồ sơ.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-grow justify-between">
            <div className="space-y-4">
              {accessRequests.map((req, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-xl flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">
                      Hồ sơ:{" "}
                      <span className="text-blue-700">
                        {req?.medical_record?.diagnosis || "Không có chẩn đoán"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Bệnh nhân:{" "}
                      <strong>
                        {req?.patient?.patient_name || req?.patient?.patient_code || "N/A"}
                      </strong>
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={14} /> Ngày gửi: {formatDate(req.requested_at)}
                    </p>
                    {req.status === "APPROVED" && (
                      <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Được duyệt lúc: {formatDate(req.approved_at)}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Tổng số {pagination.totalItems} yêu cầu
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isHistoryLoading}
                    className="p-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isHistoryLoading}
                    className="p-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MedicalRecordRequests);