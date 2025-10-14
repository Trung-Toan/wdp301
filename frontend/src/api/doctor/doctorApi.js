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
};
