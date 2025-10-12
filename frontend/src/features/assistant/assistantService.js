import api from '../../api/api';

const base = '/assistant';

export default {
  getAppointments: (params) => api.get(`${base}/appointments`, { params }),
  getAppointment: (id) => api.get(`${base}/appointments/${id}`),
  confirmAppointment: (id, body = {}) => api.post(`${base}/appointments/${id}/confirm`, body),
  rejectAppointment: (id, body = {}) => api.post(`${base}/appointments/${id}/reject`, body),
  updateSlot: (slotId, body) => api.put(`${base}/slots/${slotId}`, body),
  uploadPrescription: (body) => api.post(`${base}/prescriptions`, body),
  getNotifications: () => api.get(`${base}/notifications`)
};