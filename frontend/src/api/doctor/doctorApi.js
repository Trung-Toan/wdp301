import { axiosInstance } from "../axiosInstance";

export const doctorApi = {
  // Lấy bác sĩ top (nếu không truyền limit -> lấy tất cả)
  getDoctorTop: (limit) =>
    axiosInstance.get("/doctor/top", { params: { limit } }),

  // Lấy bác sĩ theo chuyên khoa
  getBySpecialty: (specialtyId) =>
    axiosInstance.get("/doctor/by-specialty", { params: { specialtyId } }),

  //lay danh sach benh nhan
  getAllPatient: (page, limit, search) => {
    const params = new URLSearchParams({ page, limit });
    if (search?.trim()) params.append("search", search.trim());
    return axiosInstance.get(`/doctor/patients?${params.toString()}`);
  },

  //lay chi tiet benh nhan
  getPatientById: (patientId) =>
    axiosInstance.get(`/doctor/patients/${patientId}`),

  //Lấy danh sách lịch hẹn
  getAppointments: (page, limit, date, status) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (date) params.append("date", date);
    if (status && status !== "ALL") params.append("status", status);

    return axiosInstance.get(`/doctor/appointments?${params.toString()}`);
  },

  //Lấy chi tiết lịch hẹn
  getAppointmentById: (appointmentId) =>
    axiosInstance.get(`/doctor/appointments/${appointmentId}`),

  //lấy danh sách hồ sơ bệnh án
  getAllMedicalRecords: () => axiosInstance.get("/doctor/patients/medical-records"),
};
