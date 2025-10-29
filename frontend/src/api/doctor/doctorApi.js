import { axiosInstance } from "../axiosInstance";

export const doctorApi = {
  // Lấy bác sĩ top (nếu không truyền limit -> lấy tất cả)
  getDoctorTop: (limit) =>
    axiosInstance.get("/doctor/top", { params: { limit } }),

  // Lấy bác sĩ top gần đây (nếu không truyền limit -> lấy tất cả)
  getDoctorTopNearMe: (limit) =>
    axiosInstance.get("/doctor/top/near-me", { params: { limit } }),

  // Lấy bác sĩ theo chuyên khoa
  getDoctorBySpecialty: (specialtyId, params = {}) =>
    axiosInstance.get("/doctor/by-specialty", { params: { specialtyId, ...params } }),

  //lay danh sach benh nhan
  GET_ALL_PATIENT: "/doctor/patients",
  GET_PATIENT_BY_ID: (id) => `/doctor/patients/${id}`,
  GET_LIST_APPOINTMENT: "/doctor/appointments",
  GET_APPOINTMENT_BY_ID: (id) => `/doctor/appointments/${id}`,
  

  getAllPatient: (page = 1, limit = 10, search = "") =>
    axiosInstance.get(doctorApi.GET_ALL_PATIENT, {
      params: {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
      }
    }),


  //lay chi tiet benh nhan
  getPatientById: (patientId) =>
    axiosInstance.get(doctorApi.GET_PATIENT_BY_ID(patientId)),

  //Lấy danh sách lịch hẹn
  getAppointments: (params) =>
    axiosInstance.get(doctorApi.GET_LIST_APPOINTMENT, { params }),

  //Lấy chi tiết lịch hẹn
  getAppointmentById: (appointmentId) =>
    axiosInstance.get(doctorApi.GET_APPOINTMENT_BY_ID(appointmentId)),

  //lấy danh sách hồ sơ bệnh án
  getAllMedicalRecords: () => axiosInstance.get("/doctor/medical-records"),

  //lấy chi tiết hồ sơ bệnh án
  getMedicalRecordById: (recordId) =>
    axiosInstance.get(`/doctor/medical-records/${recordId}`),

  //duyệt đơn thuốc
  verifyMedicalRecord: (id, status, data = {}) =>
    axiosInstance.put(
      `/doctor/verify/medical-records/${id}?status=${status}`,
      data
    ),

  //tìm hồ sơ bệnh án theo mã bệnh nhân
  searchMedicalRecords: (search) =>
    axiosInstance.get(`/doctor/medical-records?search=${search}`),

  //lịch sử yêu cầu truy cập hồ sơ
  getMedicalRecordRequestHistory: () =>
    axiosInstance.get("/doctor/medical-records/requests/history"),

  //gửi yêu cầu truy cập hồ sơ
  requestMedicalRecordAccess: (patientId, medicalRecordId, reason) =>
    axiosInstance.post(
      `/doctor/patients/${patientId}/medical-records/${medicalRecordId}/request`,
      { reason }
    ),

  //lấy danh sách trợ lý
  getAssistants: (params) => axiosInstance.get("/doctor/assistants", { params }),

  //thêm trợ lý
  addAssistant: (data) => axiosInstance.post("/doctor/assistants", data),

  //xóa trợ lý
  deleteAssistant: (assistantId) =>
    axiosInstance.delete(`/doctor/assistants/${assistantId}`),

  // Lấy bác sĩ theo ID
  getDoctorById: (id) =>
    axiosInstance.get(`/doctor/${id}`),
};

