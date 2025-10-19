// src/api/patientsApi.js
import { axiosInstance } from "../axiosInstance";

export const patientsApi = {
  /**
   * Tạo lịch khám mới
   * @param {Object} data - dữ liệu đặt lịch
   * @returns Promise
   */
  createAppointment: (data) => {
    return axiosInstance.post("/appointments/", data);
  },

  /**
   * Lấy danh sách lịch khám của bệnh nhân
   * @param {string} patientId
   * @returns Promise
   */
  getAppointments: (patientId) => {
    return axiosInstance.get(`/appointments?patient_id=${patientId}`);
  },

  /**
   * Lấy chi tiết một lịch khám
   * @param {string} appointmentId
   * @returns Promise
   */
  getAppointmentDetail: (appointmentId) => {
    return axiosInstance.get(`/appointments/${appointmentId}`);
  },

  /**
   * Hủy lịch khám
   * @param {string} appointmentId
   * @returns Promise
   */
  cancelAppointment: (appointmentId) => {
    return axiosInstance.delete(`/appointments/${appointmentId}`);
  },
};
