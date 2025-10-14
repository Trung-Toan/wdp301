import { memo, useState, useEffect } from "react";
import {
  UserPlus,
  Send,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  requestMedicalRecordAccess
} from "../../services/doctorService.js";
import { mockMedicalRecords } from "../../data/mockData.js";

const doctorId = "DOC001"; // Giả định bác sĩ hiện tại

const AccessRequestPage = () => {
  const [patientCode, setPatientCode] = useState("");
  const [accessRequests, setAccessRequests] = useState([]);
  const [message, setMessage] = useState(null);

  // Lấy danh sách yêu cầu bác sĩ đã gửi (mock)
  useEffect(() => {
    const doctorRequests = mockMedicalRecords
      .flatMap((record) =>
        record.access_requests.map((req) => ({
          ...req,
          medical_record_id: record._id,
          patient_id: record.patient_id,
        }))
      )
      .filter((req) => req.doctor_id === doctorId);
    setAccessRequests(doctorRequests);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientCode.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập mã bệnh nhân." });
      return;
    }

    // Giả lập tìm bệnh án có patientId tương ứng
    const foundRecord = mockMedicalRecords.find(
      (r) => r.patient_id === patientCode
    );

    if (!foundRecord) {
      setMessage({ type: "error", text: "Không tìm thấy bệnh nhân này." });
      return;
    }

    const res = await requestMedicalRecordAccess(
      doctorId,
      patientCode,
      foundRecord._id
    );

    if (res.success) {
      const newReq = {
        doctor_id: doctorId,
        status: "PENDING",
        requested_at: new Date(),
        approved_at: null,
        date_expired: null,
        patient_id: patientCode,
        medical_record_id: foundRecord._id,
      };
      setAccessRequests((prev) => [newReq, ...prev]);
      setMessage({ type: "success", text: res.message });
      setPatientCode("");
    } else {
      setMessage({ type: "error", text: "Gửi yêu cầu thất bại." });
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
      {/* Cột trái - Gửi yêu cầu */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-700">
          <UserPlus size={22} /> Gửi yêu cầu xem hồ sơ
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Mã bệnh nhân
            </label>
            <input
              type="text"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              placeholder="Nhập mã bệnh nhân (VD: PAT001)"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            <Send size={18} /> Gửi yêu cầu
          </button>
        </form>
      </div>

      {/* Cột phải - Danh sách yêu cầu */}
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
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">
                    Mã bệnh nhân:{" "}
                    <span className="font-semibold text-blue-700">
                      {req.patient_id}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
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

export default memo(AccessRequestPage);