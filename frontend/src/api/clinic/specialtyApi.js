import { axiosInstance } from "../axiosInstance";

export const specialtyApi = {
  // Lấy danh sách chuyên khoa
  getAll: async () => {
    return axiosInstance.get("/clinic/specialties");
  },

};
