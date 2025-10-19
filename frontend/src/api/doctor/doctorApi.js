import { axiosInstance } from "../axiosInstance";

export const doctorApi = {
  // Lấy bác sĩ top (nếu không truyền limit -> lấy tất cả)
  getDoctorTop: (limit) =>
    axiosInstance.get("/doctor/top", { params: { limit } }),

    // Lấy bác sĩ theo chuyên khoa
    getBySpecialty: (specialtyId) =>
        axiosInstance.get("/doctor/by-specialty", { params: { specialtyId } }),

    // Lấy bác sĩ theo ID
    getById: (id) =>
        axiosInstance.get(`/doctor/${id}`),
};

