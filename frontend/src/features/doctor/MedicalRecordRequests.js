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
import {
  requestMedicalRecordAccess,
} from "../../services/doctorService.js";
import { mockMedicalRecords, mockPatients } from "../../data/mockData.js";

// Giả định bác sĩ hiện tại
const doctorId = "DOC001";

const MedicalRecordRequests = () => {
  const [patientCode, setPatientCode] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [message, setMessage] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Lấy danh sách yêu cầu mà bác sĩ đã gửi
  useEffect(() => {
    const doctorRequests = mockMedicalRecords
      .flatMap((record) =>
        record.access_requests.map((req) => ({
          ...req,
          medical_record_id: record._id,
          patient_id: record.patient_id,
          diagnosis: record.diagnosis,
        }))
      )
      .filter((req) => req.doctor_id === doctorId);
    setAccessRequests(doctorRequests);
  }, []);

  // Tìm bệnh nhân và bệnh án
  const handleFindPatient = (e) => {
    e.preventDefault();

    const patient = mockPatients.find((p) => p._id === patientCode.trim());
    if (!patient) {
      setFoundPatient(null);
      setPatientRecords([]);
      setMessage({ type: "error", text: "Không tìm thấy mã bệnh nhân này." });
      return;
    }

    const records = mockMedicalRecords.filter(
      (r) => r.patient_id === patient._id
    );

    setFoundPatient(patient);
    setPatientRecords(records);
    setMessage({
      type: "success",
      text: `Đã tìm thấy ${records.length} hồ sơ bệnh án của bệnh nhân ${patient._id}.`,
    });
  };

  // Gửi yêu cầu truy cập bệnh án
  const handleSendRequest = async () => {
    if (!selectedRecord) {
      setMessage({ type: "error", text: "Vui lòng chọn hồ sơ cần gửi yêu cầu." });
      return;
    }

    const res = await requestMedicalRecordAccess(
      doctorId,
      foundPatient._id,
      selectedRecord._id
    );

    if (res.success) {
      const newReq = {
        doctor_id: doctorId,
        status: "PENDING",
        requested_at: new Date(),
        approved_at: null,
        date_expired: null,
        patient_id: foundPatient._id,
        medical_record_id: selectedRecord._id,
        diagnosis: selectedRecord.diagnosis,
      };
      setAccessRequests((prev) => [newReq, ...prev]);
      setMessage({ type: "success", text: "Đã gửi yêu cầu xem hồ sơ thành công." });
      setSelectedRecord(null);
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
      {/* Cột trái - Tìm và gửi yêu cầu */}
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
              placeholder="Nhập mã bệnh nhân (VD: PAT001)"
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
            <h3 className="font-semibold text-gray-700 mb-2">Thông tin bệnh nhân</h3>
            <p className="text-sm">
              <span className="font-medium">Mã:</span> {foundPatient._id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Nhóm máu:</span>{" "}
              {foundPatient.blood_type}
            </p>
            <p className="text-sm">
              <span className="font-medium">Bệnh mãn tính:</span>{" "}
              {foundPatient.chronic_diseases.join(", ") || "Không có"}
            </p>

            {/* Danh sách hồ sơ */}
            <div className="mt-3 space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm">
                Hồ sơ bệnh án ({patientRecords.length})
              </h4>
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
                        {rec.diagnosis}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ngày tạo:{" "}
                        {new Date(rec.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedRecord && (
              <button
                onClick={handleSendRequest}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 font-semibold transition-all"
              >
                <Send size={18} /> Gửi yêu cầu truy cập hồ sơ
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cột phải - Danh sách yêu cầu đã gửi */}
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
                    {req.diagnosis}
                  </p>
                  <p className="text-sm text-gray-600">
                    Mã bệnh nhân: {req.patient_id}
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
