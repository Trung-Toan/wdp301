import { memo, useState, useEffect } from "react";
import {
  UserPlus,
  Send,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FolderOpen,
} from "lucide-react";
import { doctorApi } from "../../api/doctor/doctorApi";

const MedicalRecordRequests = () => {
  const [patientCode, setPatientCode] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [message, setMessage] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await doctorApi.getMedicalRecordRequestHistory();
        if (res.data?.ok) {
          setAccessRequests(res.data.data.history_request || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử yêu cầu:", error);
      }
    };
    fetchHistory();
  }, []);

  const handleFindPatient = async (e) => {
    e.preventDefault();
    if (!patientCode.trim()) return;

    try {
      const res = await doctorApi.searchMedicalRecords(patientCode.trim());
      const records = res.data?.data || [];

      if (records.length === 0) {
        setFoundPatient(null);
        setPatientRecords([]);
        setMessage({
          type: "error",
          text: "Không tìm thấy hồ sơ bệnh án nào cho mã bệnh nhân này.",
        });
        return;
      }

      console.log("thông tin", records);

      const patientInfo = {
        _id: records[0].patient_id,
        name: records[0].patient_name,
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
    }
  };

  const handleSendRequest = async () => {
    if (!selectedRecord) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn hồ sơ cần gửi yêu cầu.",
      });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập lý do xem hồ sơ." });
      return;
    }

    try {
      const res = await doctorApi.requestMedicalRecordAccess(
        foundPatient._id,
        selectedRecord._id,
        reason
      );

      if (res.data?.ok) {
        setMessage({
          type: "success",
          text: "Đã gửi yêu cầu truy cập hồ sơ thành công.",
        });

        const historyRes = await doctorApi.getMedicalRecordRequestHistory();
        setAccessRequests(historyRes.data?.data?.history_request || []);
        setSelectedRecord(null);
        setReason("");
      } else {
        setMessage({
          type: "error",
          text: res.data?.message || "Gửi yêu cầu thất bại.",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Có lỗi xảy ra khi gửi yêu cầu." });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={14} /> Đã duyệt
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
            <Clock size={14} /> Chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
            <XCircle size={14} /> Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 min-h-screen">
      {/* Cột trái */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-700">
          <UserPlus size={22} /> Tìm bệnh nhân
        </h2>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleFindPatient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Mã bệnh nhân
            </label>
            <input
              type="text"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              placeholder="Nhập mã bệnh nhân..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            <FolderOpen size={18} /> Tìm bệnh án
          </button>
        </form>

        {foundPatient && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              Hồ sơ bệnh án ({patientRecords.length})
            </h3>

            {patientRecords.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Không có hồ sơ nào.
              </p>
            ) : (
              <ul className="space-y-2">
                {patientRecords.map((rec) => (
                  <li
                    key={rec._id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-2 rounded-lg border cursor-pointer transition ${
                      selectedRecord?._id === rec._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {rec.diagnosis || "Không có chẩn đoán"}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {selectedRecord && (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-gray-600">
                    Lý do muốn xem hồ sơ
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  />
                </div>

                <button
                  onClick={handleSendRequest}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 font-semibold transition-all"
                >
                  <Send size={18} /> Gửi yêu cầu truy cập hồ sơ
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cột phải */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-blue-700">
          <FileText size={22} /> Danh sách yêu cầu đã gửi
        </h2>

        {accessRequests.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            Chưa có yêu cầu nào được gửi.
          </p>
        ) : (
          <div className="space-y-3">
            {accessRequests.map((req, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-xl flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-blue-700">
                    Hồ sơ: {req?.medical_record?.diagnosis || "Không có chẩn đoán"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Mã bệnh nhân: {req?.patient?.patient_code || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> Ngày gửi:{" "}
                    {new Date(req.requested_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {getStatusBadge(req.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MedicalRecordRequests);
