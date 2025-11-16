// src/api/patients/relativesApi.js
import { axiosInstance } from "../axiosInstance";

export const relativesApi = {
  /**
   * Lấy danh sách người thân
   * @param {Object} params - { page, limit }
   * @returns Promise
   */
  getRelatives: (params = {}) => {
    const { page = 1, limit = 50 } = params;
    return axiosInstance.get("/patient/relatives", {
      params: { page, limit }
    });
  },

  /**
   * Lấy chi tiết một người thân
   * @param {string} relativeId
   * @returns Promise
   */
  getRelativeById: (relativeId) => {
    return axiosInstance.get(`/patient/relatives/${relativeId}`);
  },

  /**
   * Tạo người thân mới
   * @param {Object} data - Thông tin người thân
   * @returns Promise
   */
  createRelative: (data) => {
    return axiosInstance.post("/patient/relatives", data);
  },

  /**
   * Cập nhật thông tin người thân
   * @param {string} relativeId
   * @param {Object} data - Dữ liệu cập nhật
   * @returns Promise
   */
  updateRelative: (relativeId, data) => {
    return axiosInstance.put(`/patient/relatives/${relativeId}`, data);
  },

  /**
   * Xóa người thân
   * @param {string} relativeId
   * @returns Promise
   */
  deleteRelative: (relativeId) => {
    return axiosInstance.delete(`/patient/relatives/${relativeId}`);
  },

  /**
   * Khôi phục người thân đã bị xóa
   * @param {string} relativeId
   * @returns Promise
   */
  restoreRelative: (relativeId) => {
    return axiosInstance.post(`/patient/relatives/${relativeId}/restore`);
  },

  /**
   * Lấy danh sách người thân đã bị xóa
   * @param {Object} params - { page, limit }
   * @returns Promise
   */
  getDeletedRelatives: (params = {}) => {
    const { page = 1, limit = 50 } = params;
    return axiosInstance.get("/patient/relatives/deleted", {
      params: { page, limit }
    });
  },
};

