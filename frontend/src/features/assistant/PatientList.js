"use client";

import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  PeopleFill,
  X,
  Paperclip,
} from "react-bootstrap-icons";
import { getPatients } from "../../services/assistantService";
import { useDataByUrl } from "../../utility/data.utils";
import { PATIENT_API } from "../../api/assistant/assistant.api";

// ================================================
// === BẮT ĐẦU: COMPONENT MEDICAL RECORD (POP-UP) ===
// ================================================

// Hàm helper để định dạng ngày tháng
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

const MedicalRecord = ({ record, onClose }) => {
  if (!record) {
    return null;
  }

  const { diagnosis, symptoms, notes, attachments, prescription, createdAt } =
    record;

  return (
    // Lớp nền mờ (Backdrop)
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-start p-4 md:p-10 overflow-y-auto backdrop-blur-sm" // backdrop-blur-sm để làm mờ nền
      onClick={onClose}
    >
      {/* Nội dung Modal */}
      <div
        className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-full overflow-hidden flex flex-col my-auto transform transition-all duration-300 scale-100 ease-out" // Bo tròn góc và đổ bóng mạnh hơn
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-blue-50">
          <h2 className="text-2xl font-extrabold text-blue-800">
            Chi tiết Bệnh án
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
            title="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        {/* Body Modal (có thể cuộn) */}
        <div className="p-7 space-y-7 overflow-y-auto text-gray-800">
          {/* Chẩn đoán & Ngày khám */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Chẩn đoán
              </h3>
              <p className="text-xl font-bold text-blue-700 leading-snug">
                {diagnosis || "Chưa có"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Ngày khám
              </h3>
              <p className="text-lg font-medium text-gray-700">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>

          {/* Triệu chứng */}
          {symptoms && symptoms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Triệu chứng
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ghi chú của Bác sĩ */}
          {notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Ghi chú
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                {notes}
              </p>
            </div>
          )}

          {/* Đơn thuốc */}
          {prescription && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 p-4 border-b border-gray-100 bg-gray-50">
                Đơn thuốc
              </h3>

              {/* Bảng thuốc */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Tên thuốc</th>
                      <th className="px-5 py-3 font-semibold">Liều lượng</th>
                      <th className="px-5 py-3 font-semibold">Tần suất</th>
                      <th className="px-5 py-3 font-semibold">Thời gian</th>
                      <th className="px-5 py-3 font-semibold">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {prescription.medicines?.map((med, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {med.name}
                        </td>
                        <td className="px-5 py-3">{med.dosage}</td>
                        <td className="px-5 py-3">{med.frequency}</td>
                        <td className="px-5 py-3">{med.duration}</td>
                        <td className="px-5 py-3 text-gray-600">{med.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hướng dẫn chung */}
              {prescription.instruction && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Hướng dẫn chung:
                  </h4>
                  <p className="text-gray-600 leading-normal">
                    {prescription.instruction}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tệp đính kèm */}
          {attachments && attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tệp đính kèm
              </h3>
              <ul className="space-y-2">
                {attachments.map((fileUrl, index) => (
                  <li key={index} className="flex items-center">
                    <Paperclip className="text-blue-500 mr-2" size={18} />
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200 text-base"
                    >
                      Xem tệp đính kèm {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================================
// === KẾT THÚC: COMPONENT MEDICAL RECORD (POP-UP) ===
// ================================================

// ================================================
// ===      COMPONENT CHÍNH: PATIENT LIST       ===
// ================================================

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data, isLoading, error } = useDataByUrl({
    url: PATIENT_API.GET_LIST_PATIENT,
    key: "patients-list",
    params: { page: 1, limit: 10, search: searchTerm },
  });

  const patients = data?.data || [];
  const pagination = data?.pagination || [];

  const filteredPatients = patients?.filter(
    (patient) =>
      patient?.full_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      patient?.phone_number?.includes(searchTerm)
  );

  console.log(patients);

  const handleShowMedicalRecord = async (appointmentId) => {
    if (!appointmentId) {
      alert("Không tìm thấy ID cuộc hẹn!");
      return;
    }
    try {
      const response = await PATIENT_API.getAppointmentByPatientId(
        appointmentId
      );
      const patientDetail = response.data?.data;

      if (
        patientDetail?.medical_record &&
        patientDetail.medical_record.length > 0
      ) {
        const sortedRecords = [...patientDetail.medical_record].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSelectedRecord(sortedRecords[0]);
      } else {
        alert("Không có hồ sơ bệnh án!");
      }
    } catch (err) {
      alert("Lỗi khi lấy hồ sơ bệnh án!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <PeopleFill className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Danh sách bệnh nhân
            </h1>
            <p className="text-gray-500 mt-1">
              Tra cứu và xem lịch sử khám của bệnh nhân
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Bảng dữ liệu */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold text-red-700 mb-2">
              Đã xảy ra lỗi
            </p>
            <p className="text-gray-500">
              {typeof error === "string"
                ? error
                : error?.message || "Có lỗi xảy ra khi tải dữ liệu."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Mã BN</th>
                    <th className="px-6 py-3 font-semibold">Họ và tên</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Số điện thoại</th>
                    <th className="px-6 py-3 font-semibold">Ngày sinh</th>
                    <th className="px-6 py-3 font-semibold">Giới tính</th>
                    <th className="px-6 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients?.length > 0 ? (
                    patients?.map((item) => {
                      const patient = item.patient || item;
                      const patientId = patient?.id || patient?._id; // Đảm bảo đúng id

                      return (
                        <tr
                          key={patientId}
                          className="bg-white hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {patient?.patient_code}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {patient?.full_name}
                          </td>
                          <td className="px-6 py-4">{patient?.email}</td>
                          <td className="px-6 py-4">{patient?.phone}</td>
                          <td className="px-6 py-4">
                            {patient?.dob?.slice(0, 10)}
                          </td>
                          <td className="px-6 py-4">{patient?.gender}</td>
                          <td className="px-6 py-4">
                            <button
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              onClick={() =>
                                handleShowMedicalRecord(patient?.appointment_id)
                              }
                              title="Xem bệnh án"
                            >
                              <FileText size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center px-6 py-10 text-gray-500"
                      >
                        {searchTerm
                          ? "Không tìm thấy bệnh nhân nào khớp với tìm kiếm."
                          : "Không có bệnh nhân nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gọi component MedicalRecord (pop-up) */}
        {selectedRecord && (
          <MedicalRecord
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PatientList);

// "use client";

// import { memo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   FileText,
//   PeopleFill,
//   X,
//   Paperclip,
// } from "react-bootstrap-icons";
// import { getPatients } from "../../services/assistantService";
// import { useDataByUrl } from "../../utility/data.utils";
// import { PATIENT_API } from "../../api/assistant/assistant.api";

// // ================================================
// // ===        BẮT ĐẦU: CÁC HÀM HELPERS         ===
// // ================================================

// // Hàm helper để định dạng ngày tháng
// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   return new Date(dateString).toLocaleDateString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// // === HÀM MỚI: TÍNH TUỔI ===
// const calculateAge = (dobString) => {
//   if (!dobString) return "N/A";

//   try {
//     const birthDate = new Date(dobString);
//     const today = new Date();

//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();

//     // Nếu tháng hiện tại nhỏ hơn tháng sinh,
//     // hoặc cùng tháng nhưng ngày hiện tại nhỏ hơn ngày sinh
//     // -> thì chưa tới sinh nhật năm nay
//     if (
//       monthDiff < 0 ||
//       (monthDiff === 0 && today.getDate() < birthDate.getDate())
//     ) {
//       age--;
//     }

//     // Xử lý trường hợp ngày sinh không hợp lệ
//     if (isNaN(age)) return "N/A";

//     return age;
//   } catch (error) {
//     return "N/A"; // Trả về N/A nếu ngày sinh không hợp lệ
//   }
// };
// // === KẾT THÚC HÀM MỚI ===

// // ================================================
// // === BẮT ĐẦU: COMPONENT MEDICAL RECORD (POP-UP) ===
// // ================================================

// const MedicalRecord = ({ record, onClose }) => {
//   // (Giữ nguyên component MedicalRecord... không thay đổi gì ở đây)
//   if (!record) {
//     return null;
//   }

//   const { diagnosis, symptoms, notes, attachments, prescription, createdAt } =
//     record;

//   return (
//     <div
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-start p-4 md:p-10 overflow-y-auto backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-full overflow-hidden flex flex-col my-auto transform transition-all duration-300 scale-100 ease-out"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header Modal */}
//         <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-blue-50">
//           <h2 className="text-2xl font-extrabold text-blue-800">
//             Chi tiết Bệnh án
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
//             title="Đóng"
//           >
//             <X size={26} />
//           </button>
//         </div>

//         {/* Body Modal (có thể cuộn) */}
//         <div className="p-7 space-y-7 overflow-y-auto text-gray-800">
//           {/* Chẩn đoán & Ngày khám */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//             <div>
//               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
//                 Chẩn đoán
//               </h3>
//               <p className="text-xl font-bold text-blue-700 leading-snug">
//                 {diagnosis || "Chưa có"}
//               </p>
//             </div>
//             <div>
//               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
//                 Ngày khám
//               </h3>
//               <p className="text-lg font-medium text-gray-700">
//                 {formatDate(createdAt)}
//               </p>
//             </div>
//           </div>

//           {/* Triệu chứng */}
//           {symptoms && symptoms.length > 0 && (
//             <div>
//               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Triệu chứng
//               </h3>
//               <div className="flex flex-wrap gap-2.5">
//                 {symptoms.map((symptom, index) => (
//                   <span
//                     key={index}
//                     className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200"
//                   >
//                     {symptom}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Ghi chú của Bác sĩ */}
//           {notes && (
//             <div>
//               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Ghi chú
//               </h3>
//               <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
//                 {notes}
//               </p>
//             </div>
//           )}

//           {/* Đơn thuốc */}
//           {prescription && (
//             <div className="border border-gray-200 rounded-lg overflow-hidden">
//               <h3 className="text-xl font-bold text-gray-800 p-4 border-b border-gray-100 bg-gray-50">
//                 Đơn thuốc
//               </h3>

//               {/* Bảng thuốc */}
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm">
//                   <thead className="text-xs text-gray-600 uppercase bg-gray-100">
//                     <tr>
//                       <th className="px-5 py-3 font-semibold">Tên thuốc</th>
//                       <th className="px-5 py-3 font-semibold">Liều lượng</th>
//                       <th className="px-5 py-3 font-semibold">Tần suất</th>
//                       <th className="px-5 py-3 font-semibold">Thời gian</th>
//                       <th className="px-5 py-3 font-semibold">Ghi chú</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {prescription.medicines?.map((med, index) => (
//                       <tr key={index} className="bg-white hover:bg-gray-50">
//                         <td className="px-5 py-3 font-medium text-gray-900">
//                           {med.name}
//                         </td>
//                         <td className="px-5 py-3">{med.dosage}</td>
//                         <td className="px-5 py-3">{med.frequency}</td>
//                         <td className="px-5 py-3">{med.duration}</td>
//                         <td className="px-5 py-3 text-gray-600">{med.note}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Hướng dẫn chung */}
//               {prescription.instruction && (
//                 <div className="p-4 border-t border-gray-100 bg-gray-50">
//                   <h4 className="font-semibold text-gray-700 mb-1">
//                     Hướng dẫn chung:
//                   </h4>
//                   <p className="text-gray-600 leading-normal">
//                     {prescription.instruction}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Tệp đính kèm */}
//           {attachments && attachments.length > 0 && (
//             <div>
//               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Tệp đính kèm
//               </h3>
//               <ul className="space-y-2">
//                 {attachments.map((fileUrl, index) => (
//                   <li key={index} className="flex items-center">
//                     <Paperclip className="text-blue-500 mr-2" size={18} />
//                     <a
//                       href={fileUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200 text-base"
//                     >
//                       Xem tệp đính kèm {index + 1}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Footer Modal */}
//         <div className="p-5 bg-gray-50 border-t border-gray-100 text-right">
//           <button
//             onClick={onClose}
//             className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
//           >
//             Đóng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// // ================================================
// // === KẾT THÚC: COMPONENT MEDICAL RECORD (POP-UP) ===
// // ================================================

// // ================================================
// // ===      COMPONENT CHÍNH: PATIENT LIST       ===
// // ================================================

// const PatientList = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedRecord, setSelectedRecord] = useState(null);

//   const { data, isLoading, error } = useDataByUrl({
//     url: PATIENT_API.GET_LIST_PATIENT,
//     key: "patients-list",
//     params: { page: 1, limit: 10, search: searchTerm },
//   });

//   const patients = data?.data || [];
//   const pagination = data?.pagination || [];

//   // ... (giữ nguyên logic filter và các state khác) ...
//   const filteredPatients = patients?.filter(
//     (patient) =>
//       patient?.full_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
//       patient?.phone_number?.includes(searchTerm)
//   );

//   console.log(patients);

//   const handleShowMedicalRecord = async (appointmentId) => {
//     // ... (giữ nguyên logic hàm này) ...
//     if (!appointmentId) {
//       alert("Không tìm thấy ID cuộc hẹn!");
//       return;
//     }
//     try {
//       const response = await PATIENT_API.getAppointmentByPatientId(
//         appointmentId
//       );
//       const patientDetail = response.data?.data;

//       if (
//         patientDetail?.medical_record &&
//         patientDetail.medical_record.length > 0
//       ) {
//         const sortedRecords = [...patientDetail.medical_record].sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//         );

//         setSelectedRecord(sortedRecords[0]);
//       } else {
//         alert("Không có hồ sơ bệnh án!");
//       }
//     } catch (err) {
//       alert("Lỗi khi lấy hồ sơ bệnh án!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header, Search Section... (giữ nguyên) */}
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
//           <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
//             <PeopleFill className="text-white" size={32} />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">
//               Danh sách bệnh nhân
//             </h1>
//             <p className="text-gray-500 mt-1">
//               Tra cứu và xem lịch sử khám của bệnh nhân
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//           <div className="relative max-w-md">
//             <input
//               type="text"
//               placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//             />
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               size={18}
//             />
//           </div>
//         </div>

//         {/* Bảng dữ liệu (Đã cập nhật) */}
//         {isLoading ? (
//           // ... (giữ nguyên loading state) ...
//           <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
//             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//             <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
//           </div>
//         ) : error ? (
//           // ... (giữ nguyên error state) ...
//           <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center">
//             <p className="text-xl font-semibold text-red-700 mb-2">
//               Đã xảy ra lỗi
//             </p>
//             <p className="text-gray-500">
//               {typeof error === "string"
//                 ? error
//                 : error?.message || "Có lỗi xảy ra khi tải dữ liệu."}
//             </p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left text-gray-500">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 font-semibold">Mã BN</th>
//                     <th className="px-6 py-3 font-semibold">Họ và tên</th>
//                     <th className="px-6 py-3 font-semibold">Email</th>
//                     <th className="px-6 py-3 font-semibold">Số điện thoại</th>
                    
//                     {/* === THAY ĐỔI TẠI ĐÂY === */}
//                     <th className="px-6 py-3 font-semibold">Tuổi</th>
                    
//                     <th className="px-6 py-3 font-semibold">Giới tính</th>
//                     <th className="px-6 py-3 font-semibold">Thao tác</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {patients?.length > 0 ? (
//                     patients?.map((item) => {
//                       const patient = item.patient || item;
//                       const patientId = patient?.id || patient?._id;

//                       return (
//                         <tr
//                           key={patientId}
//                           className="bg-white hover:bg-gray-50"
//                         >
//                           <td className="px-6 py-4 font-medium text-gray-900">
//                             {patient?.patient_code}
//                           </td>
//                           <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
//                             {patient?.full_name}
//                           </td>
//                           <td className="px-6 py-4">{patient?.email}</td>
//                           <td className="px-6 py-4">{patient?.phone}</td>
                          
//                           {/* === THAY ĐỔI TẠI ĐÂY === */}
//                           <td className="px-6 py-4">
//                             {calculateAge(patient?.dob)}
//                           </td>
                          
//                           <td className="px-6 py-4">{patient?.gender}</td>
//                           <td className="px-6 py-4">
//                             <button
//                               className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
//                               onClick={() =>
//                                 handleShowMedicalRecord(patient?.appointment_id)
//                               }
//                               title="Xem bệnh án"
//                             >
//                               <FileText size={16} />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     // ... (giữ nguyên "no results" row) ...
//                     <tr>
//                       <td
//                         colSpan="7"
//                         className="text-center px-6 py-10 text-gray-500"
//                       >
//                         {searchTerm
//                           ? "Không tìm thấy bệnh nhân nào khớp với tìm kiếm."
//                           : "Không có bệnh nhân nào."}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Gọi component MedicalRecord (pop-up) */}
//         {selectedRecord && (
//           <MedicalRecord
//             record={selectedRecord}
//             onClose={() => setSelectedRecord(null)}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default memo(PatientList);