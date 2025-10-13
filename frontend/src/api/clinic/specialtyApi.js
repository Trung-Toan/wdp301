import axios from "axios";

// Tạo instance axios chung cho module Clinic
const api = axios.create({
  baseURL: "http://localhost:5000/api/clinic",
});

export const specialtyApi = {
  // Lấy danh sách chuyên khoa
  getAll: async () => {
    return api.get("/specialties");
  },

  // getById: (id) => api.get(`/specialties/${id}`),
  // create: (data) => api.post("/specialties", data),
  // update: (id, data) => api.put(`/specialties/${id}`, data),
  // delete: (id) => api.delete(`/specialties/${id}`)
};
