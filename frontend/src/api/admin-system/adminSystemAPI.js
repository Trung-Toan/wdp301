import { axiosInstance } from "../axiosInstance";

export const adminSystemAPI = {
  // Lấy danh sách phòng khám chờ duyệt
  getPendingClinics: () => {
    return axiosInstance.get("/clinic-registration/pending");
  },

  // Duyệt phòng khám
  approveClinic: (clinicId, data = {}) => {
    return axiosInstance.put(`/clinic-registration/approve/${clinicId}`, data);
  },

  // Từ chối phòng khám
  rejectClinic: (clinicId, data = {}) => {
    return axiosInstance.put(`/clinic-registration/reject/${clinicId}`, data);
  },
};

